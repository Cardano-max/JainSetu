import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_MATRIMONY_PROFILES } from '@/lib/demoData/matrimony';
import type { BiodataSection } from '@/lib/types/matrimony';

const TABS: { id: BiodataSection; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile', icon: 'person' },
  { id: 'education', label: 'Education', icon: 'school' },
  { id: 'family', label: 'Family', icon: 'people' },
  { id: 'mamaji-buva', label: 'Mamaji/Buva', icon: 'heart' },
  { id: 'dharmik', label: 'Dharmik', icon: 'sunny' },
  { id: 'tap', label: 'Tap', icon: 'flame' },
  { id: 'partner', label: 'Partner Pref', icon: 'search' },
];

export default function MatrimonyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profile = DEMO_MATRIMONY_PROFILES.find((p) => p.id === id) || DEMO_MATRIMONY_PROFILES[0];
  const [activeTab, setActiveTab] = useState<BiodataSection>('profile');
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);

  const handleUnlockContact = () => {
    Alert.alert(
      'Unlock Contact',
      'Pay Rs. 100 to unlock contact details?\n\nOr get Premium membership for unlimited unlocks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Rs. 100', onPress: () => setIsContactUnlocked(true) },
        { text: 'View Plans', onPress: () => Alert.alert('Plans', 'Premium: Rs. 5000 / 3 months') },
      ]
    );
  };

  const DetailRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <>
            <DetailRow label="Name" value={profile.name} />
            <DetailRow label="Age" value={`${profile.age} years`} />
            <DetailRow label="Height" value={profile.height} />
            <DetailRow label="Weight" value={profile.weight} />
            <DetailRow label="Complexion" value={profile.complexion} />
            <DetailRow label="Blood Group" value={profile.bloodGroup} />
            <DetailRow label="Marital Status" value={profile.maritalStatus} />
            <DetailRow label="Diet" value={profile.diet} />
            <DetailRow label="Language" value={profile.language} />
            <DetailRow label="Sect" value={profile.sect} />
            <DetailRow label="Caste" value={profile.caste} />
            <DetailRow label="Gotra" value={profile.gotra} />
            <DetailRow label="City" value={profile.city} />
            <DetailRow label="Native (Paternal)" value={profile.nativePlace?.paternal ? `${profile.nativePlace.paternal.city}, ${profile.nativePlace.paternal.state}` : undefined} />
            <DetailRow label="Native (Maternal)" value={profile.nativePlace?.maternal ? `${profile.nativePlace.maternal.city}, ${profile.nativePlace.maternal.state}` : undefined} />
            {profile.about && (
              <View style={styles.aboutBox}>
                <Text style={styles.aboutText}>{profile.about}</Text>
              </View>
            )}
          </>
        );
      case 'education':
        return (
          <>
            <DetailRow label="Highest Education" value={profile.education.highest} />
            <DetailRow label="Degree" value={profile.education.degree} />
            <DetailRow label="College" value={profile.education.college} />
            <DetailRow label="Occupation" value={profile.work?.occupation} />
            <DetailRow label="Company" value={profile.work?.company} />
            <DetailRow label="Work Location" value={profile.work?.location} />
            <DetailRow label="Income Range" value={profile.work?.incomeRange} />
          </>
        );
      case 'family':
        return (
          <>
            <DetailRow label="Father" value={profile.family.fatherName} />
            <DetailRow label="Father's Occupation" value={profile.family.fatherOccupation} />
            <DetailRow label="Mother" value={profile.family.motherName} />
            <DetailRow label="Mother's Occupation" value={profile.family.motherOccupation} />
            <DetailRow label="Family Type" value={profile.family.familyType} />
            {profile.family.siblings?.map((s, i) => (
              <DetailRow key={i} label={s.relation} value={`${s.maritalStatus}${s.details ? ` - ${s.details}` : ''}`} />
            ))}
            {profile.family.about && (
              <View style={styles.aboutBox}>
                <Text style={styles.aboutText}>{profile.family.about}</Text>
              </View>
            )}
          </>
        );
      case 'mamaji-buva':
        return (
          <>
            <Text style={styles.sectionHead}>Mamaji Details</Text>
            {profile.mamaji && profile.mamaji.length > 0 ? (
              profile.mamaji.map((m, i) => (
                <View key={i} style={styles.relativeCard}>
                  <DetailRow label="Name" value={m.name} />
                  <DetailRow label="City" value={m.currentCity} />
                  <DetailRow label="Native" value={m.nativePlace ? `${m.nativePlace.city}, ${m.nativePlace.state}` : undefined} />
                  <DetailRow label="Occupation" value={m.occupation} />
                </View>
              ))
            ) : (
              <Text style={styles.noData}>Not mentioned</Text>
            )}
            <Text style={styles.sectionHead}>Buva Details</Text>
            {profile.buva && profile.buva.length > 0 ? (
              profile.buva.map((b, i) => (
                <View key={i} style={styles.relativeCard}>
                  <DetailRow label="Name" value={b.name} />
                  <DetailRow label="City" value={b.currentCity} />
                  <DetailRow label="Native" value={b.nativePlace ? `${b.nativePlace.city}, ${b.nativePlace.state}` : undefined} />
                  <DetailRow label="Occupation" value={b.occupation} />
                </View>
              ))
            ) : (
              <Text style={styles.noData}>Not mentioned</Text>
            )}
          </>
        );
      case 'dharmik':
        return (
          <>
            <DetailRow label="Sect" value={profile.sect} />
            {profile.dharmik?.routine && profile.dharmik.routine.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={styles.detailLabel}>Daily Routine</Text>
                <View style={styles.tags}>
                  {profile.dharmik.routine.map((r) => (
                    <View key={r} style={styles.tag}>
                      <Text style={styles.tagText}>{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            <DetailRow label="Knowledge Level" value={profile.dharmik?.knowledgeLevel} />
            <DetailRow label="Pathshala" value={profile.dharmik?.pathshala?.attended ? `Yes (${profile.dharmik.pathshala.years} years)` : 'No'} />
            {profile.dharmik?.seva && profile.dharmik.seva.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={styles.detailLabel}>Seva Activities</Text>
                <View style={styles.tags}>
                  {profile.dharmik.seva.map((s) => (
                    <View key={s} style={styles.tag}>
                      <Text style={styles.tagText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        );
      case 'tap':
        return (
          <>
            {profile.tap?.types && profile.tap.types.length > 0 && (
              <View style={styles.tagsRow}>
                <Text style={styles.detailLabel}>Tap Types</Text>
                <View style={styles.tags}>
                  {profile.tap.types.map((t) => (
                    <View key={t} style={[styles.tag, { backgroundColor: colors.saffron[100] }]}>
                      <Text style={[styles.tagText, { color: colors.saffron[700] }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {profile.tap?.lifetimeCounts && (
              <View style={styles.tapGrid}>
                <View style={styles.tapGridItem}>
                  <Text style={styles.tapGridValue}>{profile.tap.lifetimeCounts.upvas}</Text>
                  <Text style={styles.tapGridLabel}>Upvas</Text>
                </View>
                <View style={styles.tapGridItem}>
                  <Text style={styles.tapGridValue}>{profile.tap.lifetimeCounts.ayambil}</Text>
                  <Text style={styles.tapGridLabel}>Ayambil</Text>
                </View>
                <View style={styles.tapGridItem}>
                  <Text style={styles.tapGridValue}>{profile.tap.lifetimeCounts.ekasana}</Text>
                  <Text style={styles.tapGridLabel}>Ekasana</Text>
                </View>
              </View>
            )}
            <DetailRow label="Recent 12 Months (Upvas)" value={profile.tap?.recent12Months?.upvas?.toString()} />
            <DetailRow label="Recent 12 Months (Ayambil)" value={profile.tap?.recent12Months?.ayambil?.toString()} />
            <DetailRow label="Biggest Tap" value={profile.tap?.biggestTap} />
          </>
        );
      case 'partner':
        return (
          <>
            <DetailRow label="Age Range" value={profile.partnerPrefs?.ageRange ? `${profile.partnerPrefs.ageRange.min} - ${profile.partnerPrefs.ageRange.max} years` : undefined} />
            <DetailRow label="Height Range" value={profile.partnerPrefs?.heightRange ? `${profile.partnerPrefs.heightRange.min} - ${profile.partnerPrefs.heightRange.max}` : undefined} />
            <DetailRow label="Sect Preference" value={profile.partnerPrefs?.sectPreference} />
            <DetailRow label="Education" value={profile.partnerPrefs?.educationPreference} />
            <DetailRow label="Dharmik" value={profile.partnerPrefs?.dharmikPreference} />
            {profile.partnerPrefs?.cityPreference && (
              <View style={styles.tagsRow}>
                <Text style={styles.detailLabel}>City Preference</Text>
                <View style={styles.tags}>
                  {profile.partnerPrefs.cityPreference.map((c) => (
                    <View key={c} style={styles.tag}>
                      <Text style={styles.tagText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: profile.name }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerImage}>
            <Ionicons
              name={profile.gender === 'female' ? 'woman' : 'man'}
              size={64}
              color={colors.saffron[400]}
            />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              {profile.isVerified && (
                <Ionicons name="checkmark-circle" size={20} color={colors.green[500]} style={{ marginLeft: 6 }} />
              )}
              {profile.isPremium && (
                <Ionicons name="diamond" size={16} color={colors.saffron[500]} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.subInfo}>
              {profile.age} yrs • {profile.height} • {profile.city}
            </Text>
            <Text style={styles.profession}>
              {profile.work?.occupation || profile.education.degree}
            </Text>
          </View>
        </View>

        {/* Section Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabItem, activeTab === tab.id && styles.tabItemActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.id ? colors.white : colors.gray[600]}
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={styles.content}>{renderContent()}</View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.interestBtn}>
          <Ionicons name="heart" size={20} color={colors.white} />
          <Text style={styles.interestBtnText}>Express Interest</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.contactBtn, isContactUnlocked && styles.contactBtnUnlocked]}
          onPress={isContactUnlocked ? undefined : handleUnlockContact}
        >
          <Ionicons
            name={isContactUnlocked ? 'call' : 'lock-closed'}
            size={20}
            color={isContactUnlocked ? colors.white : colors.saffron[600]}
          />
          <Text style={[styles.contactBtnText, isContactUnlocked && styles.contactBtnTextUnlocked]}>
            {isContactUnlocked ? 'Call Now' : 'Unlock (Rs.100)'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-social" size={22} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  // Header
  header: { flexDirection: 'row', backgroundColor: colors.white, padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerImage: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: colors.gray[900] },
  subInfo: { fontSize: 14, color: colors.gray[600], marginTop: 4 },
  profession: { fontSize: 14, color: colors.saffron[600], marginTop: 4, fontWeight: '500' },
  // Tabs
  tabBar: { marginTop: 16 },
  tabBarContent: { paddingHorizontal: 12 },
  tabItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginHorizontal: 4, backgroundColor: colors.white },
  tabItemActive: { backgroundColor: colors.saffron[600] },
  tabText: { fontSize: 12, color: colors.gray[600], marginLeft: 4 },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  // Content
  content: { backgroundColor: colors.white, margin: 16, borderRadius: 12, padding: 16 },
  detailRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  detailLabel: { width: 130, fontSize: 13, color: colors.gray[500] },
  detailValue: { flex: 1, fontSize: 14, color: colors.gray[900], fontWeight: '500' },
  aboutBox: { backgroundColor: colors.saffron[50], borderRadius: 10, padding: 12, marginTop: 12 },
  aboutText: { fontSize: 14, color: colors.gray[700], lineHeight: 20 },
  sectionHead: { fontSize: 16, fontWeight: '700', color: colors.gray[800], marginTop: 12, marginBottom: 8 },
  noData: { fontSize: 13, color: colors.gray[400], fontStyle: 'italic', marginBottom: 12 },
  relativeCard: { backgroundColor: colors.gray[50], borderRadius: 10, padding: 12, marginBottom: 8 },
  tagsRow: { marginTop: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  tag: { backgroundColor: colors.gray[100], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  tagText: { fontSize: 12, color: colors.gray[700] },
  tapGrid: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12, backgroundColor: colors.saffron[50], borderRadius: 12, padding: 16 },
  tapGridItem: { alignItems: 'center' },
  tapGridValue: { fontSize: 24, fontWeight: '700', color: colors.saffron[700] },
  tapGridLabel: { fontSize: 11, color: colors.gray[600], marginTop: 4 },
  // Action Bar
  actionBar: { flexDirection: 'row', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  interestBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, borderRadius: 10, marginRight: 8 },
  interestBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.saffron[600], marginRight: 8 },
  contactBtnUnlocked: { backgroundColor: colors.green[500], borderColor: colors.green[500] },
  contactBtnText: { color: colors.saffron[600], fontSize: 13, fontWeight: '600', marginLeft: 6 },
  contactBtnTextUnlocked: { color: colors.white },
  shareBtn: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], justifyContent: 'center', alignItems: 'center' },
});
