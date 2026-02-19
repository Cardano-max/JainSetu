import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_TIRTH_LISTINGS, DEMO_DAILY_MENUS, DEMO_ROOM_TYPES } from '@/lib/demoData/tirth';

type Tab = 'overview' | 'rooms' | 'menu' | 'timings' | 'reviews';

export default function TirthDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listing = DEMO_TIRTH_LISTINGS.find((l) => l.id === id) || DEMO_TIRTH_LISTINGS[0];
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const menus = DEMO_DAILY_MENUS.filter((m) => m.listingId === listing.id);
  const rooms = DEMO_ROOM_TYPES.filter((r) => r.listingId === listing.id);

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'information-circle' },
    { id: 'rooms', label: 'Rooms', icon: 'bed' },
    { id: 'menu', label: 'Menu', icon: 'restaurant' },
    { id: 'timings', label: 'Timings', icon: 'time' },
    { id: 'reviews', label: 'Reviews', icon: 'star' },
  ];

  const renderOverview = () => (
    <>
      {listing.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descText}>{listing.description}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Facilities</Text>
        <View style={styles.facGrid}>
          {listing.facilities.map((f, i) => (
            <View key={i} style={styles.facItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} />
              <Text style={styles.facItemText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
      {listing.rules && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          <Text style={styles.descText}>{listing.rules}</Text>
        </View>
      )}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        {listing.contacts.map((c, i) => (
          <View key={i} style={styles.contactCard}>
            <Text style={styles.contactName}>{c.personName}</Text>
            {c.phone1 && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${c.phone1}`)}>
                <Ionicons name="call" size={16} color={colors.saffron[600]} />
                <Text style={styles.contactText}>{c.phone1}</Text>
              </TouchableOpacity>
            )}
            {c.whatsapp && (
              <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`https://wa.me/${c.whatsapp}`)}>
                <Ionicons name="logo-whatsapp" size={16} color={colors.green[500]} />
                <Text style={styles.contactText}>{c.whatsapp}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
      {(listing.nearestRailway || listing.nearestAirport) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Reach</Text>
          {listing.nearestRailway && (
            <View style={styles.reachRow}>
              <Ionicons name="train" size={18} color={colors.gray[600]} />
              <Text style={styles.reachText}>{listing.nearestRailway}</Text>
            </View>
          )}
          {listing.nearestAirport && (
            <View style={styles.reachRow}>
              <Ionicons name="airplane" size={18} color={colors.gray[600]} />
              <Text style={styles.reachText}>{listing.nearestAirport}</Text>
            </View>
          )}
        </View>
      )}
    </>
  );

  const renderRooms = () => (
    rooms.length > 0 ? (
      rooms.map((room) => (
        <View key={room.id} style={styles.roomCard}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName}>{room.typeName}</Text>
            <View style={[styles.availBadge, { backgroundColor: room.availableRooms > 5 ? colors.green[500] : room.availableRooms > 0 ? colors.yellow[500] : colors.red[500] }]}>
              <Text style={styles.availBadgeText}>{room.availableRooms} available</Text>
            </View>
          </View>
          <View style={styles.roomDetails}>
            <View style={styles.roomDetail}><Ionicons name="bed" size={14} color={colors.gray[500]} /><Text style={styles.roomDetailText}>{room.beds} beds</Text></View>
            <View style={styles.roomDetail}><Ionicons name="cash" size={14} color={colors.gray[500]} /><Text style={styles.roomDetailText}>Rs. {room.basePrice}/night</Text></View>
            <View style={styles.roomDetail}><Ionicons name="home" size={14} color={colors.gray[500]} /><Text style={styles.roomDetailText}>{room.totalRooms} total</Text></View>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, room.availableRooms === 0 && styles.bookBtnDisabled]}
            disabled={room.availableRooms === 0}
            onPress={() => router.push({ pathname: '/(screens)/tirth-booking', params: { listingId: listing.id, roomTypeId: room.id } })}
          >
            <Text style={styles.bookBtnText}>{room.availableRooms > 0 ? 'Book Now' : 'Full'}</Text>
          </TouchableOpacity>
        </View>
      ))
    ) : (
      <View style={styles.emptySection}>
        <Ionicons name="bed-outline" size={48} color={colors.gray[300]} />
        <Text style={styles.emptyText}>No room info available</Text>
      </View>
    )
  );

  const renderMenu = () => (
    menus.length > 0 ? (
      menus.map((menu) => (
        <View key={menu.id} style={styles.menuCard}>
          <Text style={styles.menuDate}>{menu.date}</Text>
          {menu.breakfast && <View style={styles.mealRow}><Text style={styles.mealType}>Breakfast</Text><Text style={styles.mealItems}>{menu.breakfast}</Text><Text style={styles.mealTime}>{menu.timings?.breakfast}</Text></View>}
          {menu.lunch && <View style={styles.mealRow}><Text style={styles.mealType}>Lunch</Text><Text style={styles.mealItems}>{menu.lunch}</Text><Text style={styles.mealTime}>{menu.timings?.lunch}</Text></View>}
          {menu.dinner && <View style={styles.mealRow}><Text style={styles.mealType}>Dinner</Text><Text style={styles.mealItems}>{menu.dinner}</Text><Text style={styles.mealTime}>{menu.timings?.dinner}</Text></View>}
          {menu.ayambil && <View style={styles.mealRow}><Text style={[styles.mealType, { color: colors.saffron[600] }]}>Ayambil</Text><Text style={styles.mealItems}>{menu.ayambil}</Text></View>}
          {menu.price && <Text style={styles.menuPrice}>{menu.price}</Text>}
        </View>
      ))
    ) : (
      <View style={styles.emptySection}>
        <Ionicons name="restaurant-outline" size={48} color={colors.gray[300]} />
        <Text style={styles.emptyText}>Menu not updated today</Text>
      </View>
    )
  );

  const renderTimings = () => (
    <View style={styles.section}>
      {listing.timings && Object.entries(listing.timings).map(([key, val]) => (
        <View key={key} style={styles.timingRow}>
          <Text style={styles.timingLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          <Text style={styles.timingValue}>{val}</Text>
        </View>
      ))}
      {(!listing.timings || Object.keys(listing.timings).length === 0) && (
        <View style={styles.emptySection}>
          <Ionicons name="time-outline" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No timing info</Text>
        </View>
      )}
    </View>
  );

  const renderReviews = () => (
    <View style={styles.emptySection}>
      <View style={styles.ratingBig}>
        <Ionicons name="star" size={32} color={colors.yellow[500]} />
        <Text style={styles.ratingBigText}>{listing.rating}</Text>
        <Text style={styles.ratingBigSub}>{listing.reviewCount} reviews</Text>
      </View>
      <TouchableOpacity style={styles.addReviewBtn}>
        <Ionicons name="create" size={18} color={colors.saffron[600]} />
        <Text style={styles.addReviewText}>Write a Review</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: listing.name }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}><Ionicons name="location" size={48} color={colors.saffron[500]} /></View>
          <Text style={styles.headerName}>{listing.name}</Text>
          {listing.nameGuj && <Text style={styles.headerNameGuj}>{listing.nameGuj}</Text>}
          <View style={styles.headerLoc}>
            <Ionicons name="location" size={14} color={colors.gray[500]} />
            <Text style={styles.headerLocText}>{listing.city}, {listing.state}</Text>
          </View>
          <View style={styles.headerBadges}>
            {listing.isVerified && <View style={styles.badge}><Ionicons name="checkmark-circle" size={14} color={colors.green[500]} /><Text style={styles.badgeText}>Verified</Text></View>}
            <View style={styles.badge}><Ionicons name="star" size={14} color={colors.yellow[500]} /><Text style={styles.badgeText}>{listing.rating} ({listing.reviewCount})</Text></View>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)}>
              <Ionicons name={tab.icon as any} size={14} color={activeTab === tab.id ? colors.white : colors.gray[600]} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'rooms' && renderRooms()}
          {activeTab === 'menu' && renderMenu()}
          {activeTab === 'timings' && renderTimings()}
          {activeTab === 'reviews' && renderReviews()}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        {listing.lat && listing.lng && (
          <TouchableOpacity style={styles.dirBtn} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`)}>
            <Ionicons name="navigate" size={20} color={colors.white} />
            <Text style={styles.dirBtnText}>Directions</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social" size={22} color={colors.gray[700]} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favBtn}>
          <Ionicons name="bookmark-outline" size={22} color={colors.saffron[600]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  header: { backgroundColor: colors.white, alignItems: 'center', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerName: { fontSize: 22, fontWeight: '700', color: colors.gray[900], textAlign: 'center' },
  headerNameGuj: { fontSize: 16, color: colors.gray[600], marginTop: 4 },
  headerLoc: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  headerLocText: { fontSize: 14, color: colors.gray[600], marginLeft: 4 },
  headerBadges: { flexDirection: 'row', marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray[100], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginHorizontal: 4 },
  badgeText: { fontSize: 12, color: colors.gray[700], marginLeft: 4 },
  tabBar: { marginTop: 16 },
  tabBarContent: { paddingHorizontal: 12 },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginHorizontal: 4 },
  tabActive: { backgroundColor: colors.saffron[600] },
  tabText: { fontSize: 12, color: colors.gray[600], marginLeft: 4 },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  content: { margin: 16 },
  section: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 10 },
  descText: { fontSize: 14, color: colors.gray[600], lineHeight: 20 },
  facGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  facItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 8 },
  facItemText: { fontSize: 13, color: colors.gray[700], marginLeft: 6 },
  contactCard: { backgroundColor: colors.gray[50], borderRadius: 10, padding: 12, marginBottom: 8 },
  contactName: { fontSize: 14, fontWeight: '600', color: colors.gray[800], marginBottom: 6 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  contactText: { fontSize: 13, color: colors.gray[700], marginLeft: 8 },
  reachRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reachText: { fontSize: 13, color: colors.gray[700], marginLeft: 10 },
  roomCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontSize: 16, fontWeight: '600', color: colors.gray[900] },
  availBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  availBadgeText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  roomDetails: { flexDirection: 'row', marginTop: 10 },
  roomDetail: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  roomDetailText: { fontSize: 13, color: colors.gray[600], marginLeft: 4 },
  bookBtn: { backgroundColor: colors.saffron[600], paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  bookBtnDisabled: { backgroundColor: colors.gray[300] },
  bookBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  menuCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  menuDate: { fontSize: 14, fontWeight: '700', color: colors.gray[900], marginBottom: 10 },
  mealRow: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  mealType: { fontSize: 13, fontWeight: '600', color: colors.gray[800] },
  mealItems: { fontSize: 14, color: colors.gray[600], marginTop: 2 },
  mealTime: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  menuPrice: { fontSize: 13, fontWeight: '600', color: colors.saffron[600], marginTop: 4 },
  timingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  timingLabel: { fontSize: 14, color: colors.gray[600] },
  timingValue: { fontSize: 14, fontWeight: '500', color: colors.gray[900] },
  emptySection: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: colors.gray[500], marginTop: 12 },
  ratingBig: { alignItems: 'center', marginBottom: 20 },
  ratingBigText: { fontSize: 36, fontWeight: '700', color: colors.gray[900], marginTop: 8 },
  ratingBigSub: { fontSize: 14, color: colors.gray[500] },
  addReviewBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.saffron[600] },
  addReviewText: { fontSize: 14, color: colors.saffron[600], fontWeight: '600', marginLeft: 6 },
  bottomBar: { flexDirection: 'row', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  dirBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, borderRadius: 10, marginRight: 8 },
  dirBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
  shareBtn: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  favBtn: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center' },
});
