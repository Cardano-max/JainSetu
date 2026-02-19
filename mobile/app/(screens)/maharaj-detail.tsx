import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import {
  DEMO_MAHARAJ_PROFILES,
  DEMO_MAHARAJ_PLANNERS,
  DEMO_MAHARAJ_EVENTS,
  DEMO_MAHARAJ_CONTACTS,
} from '@/lib/demoData/maharaj';
import type { MaharajProfile, MaharajPlanEntry } from '@/lib/types/maharaj';

type Tab = 'overview' | 'location' | 'planner' | 'events' | 'contact';
type PlannerView = 'tomorrow' | 'week' | 'month';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'information-circle' },
  { id: 'location', label: 'Location', icon: 'location' },
  { id: 'planner', label: 'Planner', icon: 'calendar' },
  { id: 'events', label: 'Events', icon: 'megaphone' },
  { id: 'contact', label: 'Contact', icon: 'call' },
];

const EVENT_TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  pravachan: { color: colors.saffron[700], bg: colors.saffron[100], icon: 'mic' },
  mahotsav: { color: '#7c3aed', bg: '#f3e8ff', icon: 'sparkles' },
  tap: { color: colors.red[600], bg: colors.red[50], icon: 'flame' },
  seva: { color: colors.green[700], bg: colors.green[50], icon: 'heart' },
  other: { color: colors.gray[600], bg: colors.gray[100], icon: 'ellipse' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  updated_today: { color: colors.green[700], bg: colors.green[50], label: 'Updated Today' },
  updated_this_week: { color: colors.yellow[600], bg: colors.yellow[100], label: 'Updated This Week' },
  outdated: { color: colors.red[600], bg: colors.red[50], label: 'Outdated' },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function MaharajDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const maharaj = DEMO_MAHARAJ_PROFILES.find((m) => m.id === id) || DEMO_MAHARAJ_PROFILES[0];
  const planner = DEMO_MAHARAJ_PLANNERS[maharaj.id];
  const events = DEMO_MAHARAJ_EVENTS[maharaj.id] || [];
  const contacts = DEMO_MAHARAJ_CONTACTS[maharaj.id] || [];

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [plannerView, setPlannerView] = useState<PlannerView>('tomorrow');
  const [isFollowing, setIsFollowing] = useState(maharaj.isFollowing ?? false);
  const [alertEnabled, setAlertEnabled] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = () => {
    Alert.alert('Share', `Share ${maharaj.nameEn}'s profile with your community.`);
  };

  const handleSetAlert = () => {
    setAlertEnabled(!alertEnabled);
    Alert.alert(
      alertEnabled ? 'Alert Disabled' : 'Alert Enabled',
      alertEnabled
        ? 'You will no longer receive location update alerts.'
        : 'You will be notified when location or schedule is updated.',
    );
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone.replace('+', '')}`);
  };

  // =================== OVERVIEW TAB ===================
  const renderOverview = () => (
    <>
      {/* Diksha Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="star" size={18} color={colors.saffron[600]} />
          <Text style={styles.cardTitle}>Diksha Information</Text>
        </View>
        {maharaj.dikshaName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Diksha Name</Text>
            <Text style={styles.infoValue}>{maharaj.dikshaName}</Text>
          </View>
        )}
        {maharaj.dikshaDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Diksha Date</Text>
            <Text style={styles.infoValue}>{formatDate(maharaj.dikshaDate)}</Text>
          </View>
        )}
        {maharaj.dikshaPlace && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Diksha Place</Text>
            <Text style={styles.infoValue}>{maharaj.dikshaPlace}</Text>
          </View>
        )}
      </View>

      {/* Sangh Details */}
      {maharaj.sanghName && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={18} color={colors.saffron[600]} />
            <Text style={styles.cardTitle}>Sangh Details</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sangh Name</Text>
            <View style={styles.infoValueRow}>
              <Text style={styles.infoValue}>{maharaj.sanghName}</Text>
              {maharaj.isLeader && (
                <View style={styles.leaderBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.saffron[700]} />
                  <Text style={styles.leaderBadgeText}>Leader</Text>
                </View>
              )}
            </View>
          </View>
          {maharaj.sanghMemberCount && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Members</Text>
              <Text style={styles.infoValue}>{maharaj.sanghMemberCount} members</Text>
            </View>
          )}
        </View>
      )}

      {/* Daily Schedule */}
      {maharaj.schedule && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={18} color={colors.saffron[600]} />
            <Text style={styles.cardTitle}>Daily Schedule</Text>
          </View>
          {maharaj.schedule.pravachanTime && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIcon}>
                <Ionicons name="mic" size={16} color={colors.saffron[600]} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Pravachan</Text>
                <Text style={styles.scheduleTime}>{maharaj.schedule.pravachanTime}</Text>
              </View>
            </View>
          )}
          {maharaj.schedule.samayikTime && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIcon}>
                <Ionicons name="time-outline" size={16} color={colors.saffron[600]} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Samayik</Text>
                <Text style={styles.scheduleTime}>{maharaj.schedule.samayikTime}</Text>
              </View>
            </View>
          )}
          {maharaj.schedule.pratikramanTime && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIcon}>
                <Ionicons name="moon" size={16} color={colors.saffron[600]} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Pratikraman</Text>
                <Text style={styles.scheduleTime}>{maharaj.schedule.pratikramanTime}</Text>
              </View>
            </View>
          )}
          {maharaj.schedule.swadhyayTime && (
            <View style={styles.scheduleRow}>
              <View style={styles.scheduleIcon}>
                <Ionicons name="book" size={16} color={colors.saffron[600]} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Swadhyay</Text>
                <Text style={styles.scheduleTime}>{maharaj.schedule.swadhyayTime}</Text>
              </View>
            </View>
          )}
          {maharaj.schedule.notes && (
            <View style={styles.notesBox}>
              <Ionicons name="information-circle" size={14} color={colors.saffron[600]} />
              <Text style={styles.notesText}>{maharaj.schedule.notes}</Text>
            </View>
          )}
        </View>
      )}
    </>
  );

  // =================== LOCATION TAB ===================
  const renderLocation = () => {
    const loc = maharaj.currentLocation;
    const statusConf = STATUS_CONFIG[loc.status];

    return (
      <>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={18} color={colors.saffron[600]} />
            <Text style={styles.cardTitle}>Current Location</Text>
          </View>

          <View style={styles.locationMain}>
            <Text style={styles.locationCity}>{loc.city}</Text>
            {loc.area && <Text style={styles.locationArea}>{loc.area}</Text>}
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Upashray</Text>
            <Text style={styles.infoValue}>{loc.upashrayName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From</Text>
            <Text style={styles.infoValue}>{formatDate(loc.fromDate)}</Text>
          </View>

          {loc.toDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>To</Text>
              <Text style={styles.infoValue}>{formatDate(loc.toDate)}</Text>
            </View>
          )}

          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusConf.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusConf.color }]} />
              <Text style={[styles.statusBadgeText, { color: statusConf.color }]}>
                {statusConf.label}
              </Text>
            </View>
          </View>

          <Text style={styles.lastUpdated}>
            Last updated: {formatDate(loc.lastUpdatedAt)}
          </Text>
        </View>

        <TouchableOpacity style={styles.mapButton}>
          <Ionicons name="map" size={20} color={colors.white} />
          <Text style={styles.mapButtonText}>View on Map</Text>
        </TouchableOpacity>
      </>
    );
  };

  // =================== PLANNER TAB ===================
  const renderPlannerToggle = () => (
    <View style={styles.toggleRow}>
      {(['tomorrow', 'week', 'month'] as PlannerView[]).map((v) => (
        <TouchableOpacity
          key={v}
          style={[styles.toggleBtn, plannerView === v && styles.toggleBtnActive]}
          onPress={() => setPlannerView(v)}
        >
          <Text style={[styles.toggleBtnText, plannerView === v && styles.toggleBtnTextActive]}>
            {v === 'tomorrow' ? 'Tomorrow' : v === 'week' ? 'This Week' : 'This Month'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPlannerTomorrow = (entry: MaharajPlanEntry) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name="sunny" size={18} color={colors.saffron[600]} />
        <Text style={styles.cardTitle}>Tomorrow - {formatDate(entry.date)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>City</Text>
        <Text style={styles.infoValue}>{entry.city}</Text>
      </View>
      {entry.area && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Area</Text>
          <Text style={styles.infoValue}>{entry.area}</Text>
        </View>
      )}
      {entry.upashray && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Upashray</Text>
          <Text style={styles.infoValue}>{entry.upashray}</Text>
        </View>
      )}
      {entry.arrivalTime && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{entry.arrivalTime}</Text>
        </View>
      )}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.planStatusBadge,
            {
              backgroundColor:
                entry.status === 'confirmed' ? colors.green[50] : colors.yellow[100],
            },
          ]}
        >
          <Ionicons
            name={entry.status === 'confirmed' ? 'checkmark-circle' : 'help-circle'}
            size={14}
            color={entry.status === 'confirmed' ? colors.green[600] : colors.yellow[600]}
          />
          <Text
            style={[
              styles.planStatusText,
              {
                color:
                  entry.status === 'confirmed' ? colors.green[700] : colors.yellow[600],
              },
            ]}
          >
            {entry.status === 'confirmed' ? 'Confirmed' : 'Tentative'}
          </Text>
        </View>
      </View>
      {entry.notes && (
        <View style={styles.notesBox}>
          <Ionicons name="information-circle" size={14} color={colors.saffron[600]} />
          <Text style={styles.notesText}>{entry.notes}</Text>
        </View>
      )}
    </View>
  );

  const renderPlannerWeekly = (entries: MaharajPlanEntry[]) => (
    <>
      {entries.map((entry, idx) => (
        <View key={idx} style={styles.weekEntry}>
          <View style={styles.weekDateCol}>
            <Text style={styles.weekDate}>{formatDayLabel(entry.date)}</Text>
          </View>
          <View style={styles.weekInfoCol}>
            <Text style={styles.weekCity}>
              {entry.city}{entry.area ? `, ${entry.area}` : ''}
            </Text>
            {entry.upashray && (
              <Text style={styles.weekUpashray}>{entry.upashray}</Text>
            )}
          </View>
          <View
            style={[
              styles.weekStatusBadge,
              {
                backgroundColor:
                  entry.status === 'confirmed' ? colors.green[50] : colors.yellow[100],
              },
            ]}
          >
            <Text
              style={[
                styles.weekStatusText,
                {
                  color:
                    entry.status === 'confirmed' ? colors.green[700] : colors.yellow[600],
                },
              ]}
            >
              {entry.status === 'confirmed' ? 'Confirmed' : 'Tentative'}
            </Text>
          </View>
        </View>
      ))}
    </>
  );

  const renderPlannerMonthly = (
    entries: { city: string; fromDate: string; toDate: string; event?: string }[],
  ) => (
    <>
      {entries.map((entry, idx) => (
        <View key={idx} style={styles.monthEntry}>
          <View style={styles.monthIconCol}>
            <Ionicons name="location" size={20} color={colors.saffron[500]} />
          </View>
          <View style={styles.monthInfoCol}>
            <Text style={styles.monthCity}>{entry.city}</Text>
            <Text style={styles.monthDates}>
              {formatDate(entry.fromDate)} - {formatDate(entry.toDate)}
            </Text>
            {entry.event && (
              <View style={styles.monthEventTag}>
                <Ionicons name="pricetag" size={12} color={colors.saffron[600]} />
                <Text style={styles.monthEventText}>{entry.event}</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </>
  );

  const renderPlanner = () => (
    <>
      {renderPlannerToggle()}
      {!planner ? (
        <View style={styles.emptySection}>
          <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No planner data available</Text>
        </View>
      ) : (
        <>
          {plannerView === 'tomorrow' && planner.tomorrow && renderPlannerTomorrow(planner.tomorrow)}
          {plannerView === 'tomorrow' && !planner.tomorrow && (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No schedule for tomorrow</Text>
            </View>
          )}
          {plannerView === 'week' && planner.weekly.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar" size={18} color={colors.saffron[600]} />
                <Text style={styles.cardTitle}>This Week</Text>
              </View>
              {renderPlannerWeekly(planner.weekly)}
            </View>
          )}
          {plannerView === 'week' && planner.weekly.length === 0 && (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No weekly plan available</Text>
            </View>
          )}
          {plannerView === 'month' && planner.monthly.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar" size={18} color={colors.saffron[600]} />
                <Text style={styles.cardTitle}>This Month</Text>
              </View>
              {renderPlannerMonthly(planner.monthly)}
            </View>
          )}
          {plannerView === 'month' && planner.monthly.length === 0 && (
            <View style={styles.emptySection}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray[300]} />
              <Text style={styles.emptyText}>No monthly plan available</Text>
            </View>
          )}
        </>
      )}
    </>
  );

  // =================== EVENTS TAB ===================
  const renderEvents = () =>
    events.length > 0 ? (
      <>
        {events.map((event) => {
          const typeConf = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.other;
          return (
            <View key={event.id} style={styles.card}>
              <View style={styles.eventHeader}>
                <View style={[styles.eventTypeIcon, { backgroundColor: typeConf.bg }]}>
                  <Ionicons name={typeConf.icon as any} size={18} color={typeConf.color} />
                </View>
                <View style={styles.eventHeaderInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={[styles.eventTypeBadge, { backgroundColor: typeConf.bg }]}>
                    <Text style={[styles.eventTypeText, { color: typeConf.color }]}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
              {event.description && (
                <Text style={styles.eventDesc}>{event.description}</Text>
              )}
              <View style={styles.eventMeta}>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.gray[500]} />
                  <Text style={styles.eventMetaText}>{formatDate(event.eventDate)}</Text>
                </View>
                <View style={styles.eventMetaItem}>
                  <Ionicons name="location-outline" size={14} color={colors.gray[500]} />
                  <Text style={styles.eventMetaText}>{event.location}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </>
    ) : (
      <View style={styles.emptySection}>
        <Ionicons name="megaphone-outline" size={48} color={colors.gray[300]} />
        <Text style={styles.emptyText}>No upcoming events</Text>
      </View>
    );

  // =================== CONTACT TAB ===================
  const renderContact = () => (
    <>
      <View style={styles.contactNotice}>
        <Ionicons name="alert-circle" size={16} color={colors.saffron[600]} />
        <Text style={styles.contactNoticeText}>
          Contact seva person only, not Maharaj Saheb directly
        </Text>
      </View>
      {contacts.length > 0 ? (
        contacts.map((contact) => (
          <View key={contact.id} style={styles.card}>
            <View style={styles.contactHeader}>
              <View style={styles.contactNameRow}>
                <Text style={styles.contactName}>{contact.personName}</Text>
                {contact.isVerified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.green[500]}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{contact.role}</Text>
              </View>
            </View>

            {contact.callingHours && (
              <View style={styles.callingHoursRow}>
                <Ionicons name="time-outline" size={14} color={colors.gray[500]} />
                <Text style={styles.callingHoursText}>
                  Calling hours: {contact.callingHours}
                </Text>
              </View>
            )}

            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(contact.phone)}
              >
                <Ionicons name="call" size={18} color={colors.white} />
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>

              {contact.whatsapp && (
                <TouchableOpacity
                  style={styles.whatsappBtn}
                  onPress={() => handleWhatsApp(contact.whatsapp!)}
                >
                  <Ionicons name="logo-whatsapp" size={18} color={colors.white} />
                  <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptySection}>
          <Ionicons name="call-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No contact information available</Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: maharaj.nameEn }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.saffron[400]} />
          </View>
          <Text style={styles.headerName}>{maharaj.nameEn}</Text>
          <Text style={styles.headerNameGu}>{maharaj.nameGu}</Text>
          <View style={styles.headerBadges}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{maharaj.sampraday}</Text>
            </View>
            {maharaj.gachchh && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{maharaj.gachchh}</Text>
              </View>
            )}
          </View>
          {maharaj.guruName && (
            <View style={styles.guruRow}>
              <Ionicons name="ribbon" size={14} color={colors.gray[500]} />
              <Text style={styles.guruText}>Guru: {maharaj.guruName}</Text>
            </View>
          )}
          <View style={styles.followRow}>
            <Text style={styles.followersCount}>
              {maharaj.followersCount.toLocaleString('en-IN')} followers
            </Text>
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={handleFollow}
            >
              <Ionicons
                name={isFollowing ? 'checkmark' : 'add'}
                size={16}
                color={isFollowing ? colors.saffron[600] : colors.white}
              />
              <Text
                style={[
                  styles.followBtnText,
                  isFollowing && styles.followBtnTextActive,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.id ? colors.white : colors.gray[600]}
              />
              <Text
                style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'location' && renderLocation()}
          {activeTab === 'planner' && renderPlanner()}
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'contact' && renderContact()}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomFollowBtn, isFollowing && styles.bottomFollowBtnActive]}
          onPress={handleFollow}
        >
          <Ionicons
            name={isFollowing ? 'heart' : 'heart-outline'}
            size={20}
            color={isFollowing ? colors.saffron[600] : colors.white}
          />
          <Text
            style={[
              styles.bottomFollowBtnText,
              isFollowing && styles.bottomFollowBtnTextActive,
            ]}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomShareBtn} onPress={handleShare}>
          <Ionicons name="share-social" size={22} color={colors.gray[700]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomAlertBtn, alertEnabled && styles.bottomAlertBtnActive]}
          onPress={handleSetAlert}
        >
          <Ionicons
            name={alertEnabled ? 'notifications' : 'notifications-outline'}
            size={22}
            color={alertEnabled ? colors.saffron[600] : colors.gray[700]}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },

  // =================== HEADER ===================
  header: {
    backgroundColor: colors.white,
    alignItems: 'center',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  headerNameGu: {
    fontSize: 15,
    color: colors.gray[600],
    marginTop: 4,
    textAlign: 'center',
  },
  headerBadges: {
    flexDirection: 'row',
    marginTop: 10,
  },
  headerBadge: {
    backgroundColor: colors.saffron[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  headerBadgeText: {
    fontSize: 12,
    color: colors.saffron[700],
    fontWeight: '600',
  },
  guruRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  guruText: {
    fontSize: 13,
    color: colors.gray[600],
    marginLeft: 6,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  followersCount: {
    fontSize: 13,
    color: colors.gray[500],
    marginRight: 12,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.saffron[600],
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followBtnActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  followBtnText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  followBtnTextActive: {
    color: colors.saffron[600],
  },

  // =================== TABS ===================
  tabBar: { marginTop: 16 },
  tabBarContent: { paddingHorizontal: 12 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginHorizontal: 4,
  },
  tabActive: { backgroundColor: colors.saffron[600] },
  tabText: { fontSize: 12, color: colors.gray[600], marginLeft: 4 },
  tabTextActive: { color: colors.white, fontWeight: '600' },

  // =================== CONTENT ===================
  content: { padding: 16 },

  // =================== SHARED CARD ===================
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  infoLabel: {
    width: 110,
    fontSize: 13,
    color: colors.gray[500],
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '500',
  },
  infoValueRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.saffron[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  leaderBadgeText: {
    fontSize: 11,
    color: colors.saffron[700],
    fontWeight: '600',
    marginLeft: 4,
  },

  // =================== SCHEDULE ===================
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  scheduleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduleInfo: { flex: 1 },
  scheduleLabel: {
    fontSize: 13,
    color: colors.gray[600],
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 2,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.saffron[50],
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 13,
    color: colors.saffron[700],
    marginLeft: 8,
    lineHeight: 18,
  },

  // =================== LOCATION ===================
  locationMain: {
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  locationCity: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
  },
  locationArea: {
    fontSize: 15,
    color: colors.gray[600],
    marginTop: 2,
  },
  statusRow: {
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 14,
    borderRadius: 12,
  },
  mapButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  // =================== PLANNER ===================
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: colors.saffron[600],
  },
  toggleBtnText: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
  toggleBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  planStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planStatusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Weekly
  weekEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  weekDateCol: {
    width: 90,
  },
  weekDate: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
  },
  weekInfoCol: {
    flex: 1,
    marginHorizontal: 8,
  },
  weekCity: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  weekUpashray: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  weekStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  weekStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Monthly
  monthEntry: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  monthIconCol: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },
  monthInfoCol: {
    flex: 1,
  },
  monthCity: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  monthDates: {
    fontSize: 13,
    color: colors.gray[500],
    marginTop: 2,
  },
  monthEventTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.saffron[50],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  monthEventText: {
    fontSize: 12,
    color: colors.saffron[600],
    fontWeight: '500',
    marginLeft: 4,
  },

  // =================== EVENTS ===================
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventHeaderInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventTypeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventDesc: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 10,
  },
  eventMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  eventMetaText: {
    fontSize: 13,
    color: colors.gray[500],
    marginLeft: 4,
  },

  // =================== CONTACT ===================
  contactNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.saffron[100],
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  contactNoticeText: {
    flex: 1,
    fontSize: 13,
    color: colors.saffron[700],
    fontWeight: '500',
    marginLeft: 8,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
  },
  roleBadge: {
    backgroundColor: colors.saffron[100],
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 11,
    color: colors.saffron[700],
    fontWeight: '600',
  },
  callingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  callingHoursText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 6,
  },
  contactActions: {
    flexDirection: 'row',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  callBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  whatsappBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green[600],
    paddingVertical: 10,
    borderRadius: 10,
  },
  whatsappBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },

  // =================== EMPTY ===================
  emptySection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 12,
  },

  // =================== BOTTOM BAR ===================
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  bottomFollowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  bottomFollowBtnActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  bottomFollowBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomFollowBtnTextActive: {
    color: colors.saffron[600],
  },
  bottomShareBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bottomAlertBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomAlertBtnActive: {
    borderColor: colors.saffron[600],
    backgroundColor: colors.saffron[50],
  },
});
