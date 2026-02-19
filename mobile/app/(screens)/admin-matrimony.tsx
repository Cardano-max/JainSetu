import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

type ProfileStatus = 'pending' | 'approved' | 'rejected' | 'flagged';
type FilterTab = 'pending' | 'approved' | 'rejected' | 'flagged' | 'all';

interface AdminMatrimonyProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  city: string;
  education: string;
  occupation: string;
  income: string;
  sect: string;
  height: string;
  status: ProfileStatus;
  submittedAt: string;
  photosCount: number;
  verificationLevel: 'none' | 'phone' | 'id' | 'community';
  reportCount: number;
  completeness: number;
}

const INITIAL_PROFILES: AdminMatrimonyProfile[] = [
  { id: '1', name: 'Priya Shah', age: 26, gender: 'female', city: 'Ahmedabad', education: 'MBA', occupation: 'Marketing Manager', income: '8-10 LPA', sect: 'Shwetambar', height: '5\'4"', status: 'pending', submittedAt: '2026-02-19', photosCount: 4, verificationLevel: 'phone', reportCount: 0, completeness: 92 },
  { id: '2', name: 'Rahul Jain', age: 29, gender: 'male', city: 'Mumbai', education: 'B.Tech + MBA', occupation: 'Software Engineer', income: '15-20 LPA', sect: 'Digambar', height: '5\'10"', status: 'pending', submittedAt: '2026-02-19', photosCount: 3, verificationLevel: 'id', reportCount: 0, completeness: 95 },
  { id: '3', name: 'Nidhi Mehta', age: 24, gender: 'female', city: 'Surat', education: 'CA', occupation: 'Chartered Accountant', income: '6-8 LPA', sect: 'Shwetambar', height: '5\'3"', status: 'pending', submittedAt: '2026-02-18', photosCount: 5, verificationLevel: 'community', reportCount: 0, completeness: 98 },
  { id: '4', name: 'Kunal Doshi', age: 31, gender: 'male', city: 'Pune', education: 'MBBS', occupation: 'Doctor', income: '20+ LPA', sect: 'Sthanakvasi', height: '5\'9"', status: 'pending', submittedAt: '2026-02-18', photosCount: 2, verificationLevel: 'none', reportCount: 0, completeness: 78 },
  { id: '5', name: 'Meena Sanghvi', age: 27, gender: 'female', city: 'Rajkot', education: 'M.Sc', occupation: 'Teacher', income: '3-5 LPA', sect: 'Terapanthi', height: '5\'2"', status: 'approved', submittedAt: '2026-02-15', photosCount: 4, verificationLevel: 'id', reportCount: 0, completeness: 90 },
  { id: '6', name: 'Arjun Shah', age: 30, gender: 'male', city: 'Baroda', education: 'B.Com', occupation: 'Business Owner', income: '12-15 LPA', sect: 'Shwetambar', height: '5\'11"', status: 'approved', submittedAt: '2026-02-14', photosCount: 3, verificationLevel: 'community', reportCount: 0, completeness: 88 },
  { id: '7', name: 'Fake Profile', age: 22, gender: 'female', city: 'Unknown', education: 'N/A', occupation: 'N/A', income: 'N/A', sect: 'Unknown', height: 'N/A', status: 'rejected', submittedAt: '2026-02-17', photosCount: 0, verificationLevel: 'none', reportCount: 3, completeness: 15 },
  { id: '8', name: 'Suspicious User', age: 28, gender: 'male', city: 'Delhi', education: 'B.A', occupation: 'Student', income: 'N/A', sect: 'Digambar', height: '5\'8"', status: 'flagged', submittedAt: '2026-02-16', photosCount: 1, verificationLevel: 'phone', reportCount: 5, completeness: 45 },
];

export default function AdminMatrimonyScreen() {
  const [profiles, setProfiles] = useState<AdminMatrimonyProfile[]>(INITIAL_PROFILES);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<AdminMatrimonyProfile | null>(null);

  const filtered = profiles.filter((p) => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id: string) => {
    Alert.alert('Approve Profile', 'Approve this matrimony profile? It will be visible to all users.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          setProfiles(profiles.map((p) => p.id === id ? { ...p, status: 'approved' as ProfileStatus } : p));
          setSelectedProfile(null);
          Alert.alert('Approved', 'Profile is now live on the platform.');
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Profile', 'Reject this profile? The user will be notified to update their information.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setProfiles(profiles.map((p) => p.id === id ? { ...p, status: 'rejected' as ProfileStatus } : p));
          setSelectedProfile(null);
          Alert.alert('Rejected', 'User has been notified to update their profile.');
        },
      },
    ]);
  };

  const handleFlag = (id: string) => {
    Alert.alert('Flag Profile', 'Flag this profile for further review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Flag',
        onPress: () => {
          setProfiles(profiles.map((p) => p.id === id ? { ...p, status: 'flagged' as ProfileStatus } : p));
          setSelectedProfile(null);
        },
      },
    ]);
  };

  const getStatusConfig = (status: ProfileStatus) => {
    const map = {
      pending: { color: colors.yellow[500], bg: colors.yellow[100], label: 'PENDING', icon: 'time' },
      approved: { color: colors.green[600], bg: colors.green[50], label: 'APPROVED', icon: 'checkmark-circle' },
      rejected: { color: colors.red[500], bg: colors.red[50], label: 'REJECTED', icon: 'close-circle' },
      flagged: { color: colors.red[600], bg: colors.red[50], label: 'FLAGGED', icon: 'flag' },
    };
    return map[status];
  };

  const getVerificationBadge = (level: string) => {
    const map: Record<string, { color: string; label: string; icon: string }> = {
      none: { color: colors.gray[400], label: 'Not Verified', icon: 'shield-outline' },
      phone: { color: colors.blue[500], label: 'Phone Verified', icon: 'call' },
      id: { color: colors.green[500], label: 'ID Verified', icon: 'card' },
      community: { color: colors.saffron[600], label: 'Community Verified', icon: 'shield-checkmark' },
    };
    return map[level] || map.none;
  };

  const counts = {
    pending: profiles.filter((p) => p.status === 'pending').length,
    approved: profiles.filter((p) => p.status === 'approved').length,
    rejected: profiles.filter((p) => p.status === 'rejected').length,
    flagged: profiles.filter((p) => p.status === 'flagged').length,
    all: profiles.length,
  };

  // Detail view
  if (selectedProfile) {
    const config = getStatusConfig(selectedProfile.status);
    const verification = getVerificationBadge(selectedProfile.verificationLevel);
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Profile Review' }} />
        <ScrollView contentContainerStyle={styles.detailContent}>
          <View style={styles.detailCard}>
            <View style={styles.detailTop}>
              <View style={styles.detailAvatar}>
                <Text style={styles.detailAvatarText}>{selectedProfile.name[0]}</Text>
              </View>
              <View style={styles.detailHeaderInfo}>
                <Text style={styles.detailName}>{selectedProfile.name}</Text>
                <Text style={styles.detailSubtext}>{selectedProfile.age} yrs · {selectedProfile.gender === 'male' ? 'Male' : 'Female'} · {selectedProfile.height}</Text>
                <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon as any} size={12} color={config.color} />
                  <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
                </View>
              </View>
            </View>

            <View style={styles.verificationRow}>
              <Ionicons name={verification.icon as any} size={16} color={verification.color} />
              <Text style={[styles.verificationText, { color: verification.color }]}>{verification.label}</Text>
              {selectedProfile.reportCount > 0 && (
                <View style={styles.reportBadge}>
                  <Ionicons name="warning" size={12} color={colors.red[500]} />
                  <Text style={styles.reportText}>{selectedProfile.reportCount} reports</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.biodataCard}>
            <Text style={styles.biodataTitle}>Biodata Details</Text>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>City</Text><Text style={styles.biodataValue}>{selectedProfile.city}</Text></View>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>Education</Text><Text style={styles.biodataValue}>{selectedProfile.education}</Text></View>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>Occupation</Text><Text style={styles.biodataValue}>{selectedProfile.occupation}</Text></View>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>Income</Text><Text style={styles.biodataValue}>{selectedProfile.income}</Text></View>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>Sect</Text><Text style={styles.biodataValue}>{selectedProfile.sect}</Text></View>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>Photos</Text><Text style={styles.biodataValue}>{selectedProfile.photosCount} uploaded</Text></View>
            <View style={styles.biodataRow}><Text style={styles.biodataLabel}>Completeness</Text><Text style={styles.biodataValue}>{selectedProfile.completeness}%</Text></View>
            <View style={[styles.biodataRow, { borderBottomWidth: 0 }]}><Text style={styles.biodataLabel}>Submitted</Text><Text style={styles.biodataValue}>{selectedProfile.submittedAt}</Text></View>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedProfile(null)}>
              <Text style={styles.backBtnText}>Back to List</Text>
            </TouchableOpacity>
            {selectedProfile.status === 'pending' || selectedProfile.status === 'flagged' ? (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(selectedProfile.id)}>
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(selectedProfile.id)}>
                  <Ionicons name="close" size={18} color={colors.red[500]} />
                  <Text style={[styles.rejectBtnText]}>Reject</Text>
                </TouchableOpacity>
                {selectedProfile.status !== 'flagged' && (
                  <TouchableOpacity style={styles.flagBtn} onPress={() => handleFlag(selectedProfile.id)}>
                    <Ionicons name="flag" size={16} color={colors.red[600]} />
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Matrimony Profiles' }} />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder="Search name or city..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray[400]} />
      </View>

      <View style={styles.filterRow}>
        {(['pending', 'approved', 'rejected', 'flagged', 'all'] as FilterTab[]).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]} onPress={() => setActiveFilter(tab)}>
            <Text style={[styles.filterText, activeFilter === tab && styles.filterTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const config = getStatusConfig(item.status);
          const verification = getVerificationBadge(item.verificationLevel);
          return (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedProfile(item)}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: item.gender === 'female' ? colors.pink[400] + '20' : colors.blue[400] + '20' }]}>
                  <Ionicons name={item.gender === 'female' ? 'woman' : 'man'} size={20} color={item.gender === 'female' ? colors.pink[500] : colors.blue[500]} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.profileName}>{item.name}, {item.age}</Text>
                  <Text style={styles.profileSub}>{item.education} · {item.occupation}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={11} color={colors.gray[400]} />
                    <Text style={styles.locationText}>{item.city} · {item.sect}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
                  </View>
                  <View style={styles.miniVerification}>
                    <Ionicons name={verification.icon as any} size={12} color={verification.color} />
                  </View>
                </View>
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.cardMeta}>{item.photosCount} photos · {item.completeness}% complete · {item.income}</Text>
                {item.reportCount > 0 && (
                  <View style={styles.reportBadgeSmall}>
                    <Ionicons name="warning" size={10} color={colors.red[500]} />
                    <Text style={styles.reportTextSmall}>{item.reportCount}</Text>
                  </View>
                )}
              </View>

              {item.status === 'pending' && (
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickApprove} onPress={() => handleApprove(item.id)}>
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                    <Text style={styles.quickApproveText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickReject} onPress={() => handleReject(item.id)}>
                    <Ionicons name="close" size={14} color={colors.red[500]} />
                    <Text style={styles.quickRejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickView} onPress={() => setSelectedProfile(item)}>
                    <Ionicons name="eye" size={14} color={colors.blue[500]} />
                    <Text style={styles.quickViewText}>View</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-circle-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No profiles found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, marginBottom: 0, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.gray[900] },
  filterRow: { flexDirection: 'row', padding: 16, paddingBottom: 8, flexWrap: 'wrap' },
  filterTab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: colors.white, marginRight: 6, marginBottom: 4, borderWidth: 1, borderColor: colors.gray[200] },
  filterTabActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  filterText: { fontSize: 11, fontWeight: '600', color: colors.gray[600] },
  filterTextActive: { color: colors.white },
  listContent: { padding: 16, paddingTop: 4 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 10 },
  profileName: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  profileSub: { fontSize: 12, color: colors.gray[600], marginTop: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  locationText: { fontSize: 11, color: colors.gray[400], marginLeft: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '700', marginLeft: 4 },
  miniVerification: { marginTop: 6 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  cardMeta: { fontSize: 11, color: colors.gray[500] },
  reportBadgeSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.red[50], paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  reportTextSmall: { fontSize: 10, color: colors.red[500], fontWeight: '600', marginLeft: 3 },
  quickActions: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  quickApprove: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, marginRight: 8 },
  quickApproveText: { fontSize: 12, fontWeight: '600', color: colors.white, marginLeft: 4 },
  quickReject: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.red[500], paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, marginRight: 8 },
  quickRejectText: { fontSize: 12, fontWeight: '600', color: colors.red[500], marginLeft: 4 },
  quickView: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.blue[500], paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  quickViewText: { fontSize: 12, fontWeight: '600', color: colors.blue[500], marginLeft: 4 },
  // Detail
  detailContent: { padding: 16 },
  detailCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16 },
  detailTop: { flexDirection: 'row', alignItems: 'center' },
  detailAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center' },
  detailAvatarText: { fontSize: 22, fontWeight: '700', color: colors.saffron[600] },
  detailHeaderInfo: { flex: 1, marginLeft: 14 },
  detailName: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  detailSubtext: { fontSize: 13, color: colors.gray[500], marginTop: 2 },
  verificationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  verificationText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
  reportBadge: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', backgroundColor: colors.red[50], paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  reportText: { fontSize: 11, color: colors.red[500], fontWeight: '600', marginLeft: 4 },
  biodataCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginTop: 12 },
  biodataTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  biodataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  biodataLabel: { fontSize: 13, color: colors.gray[500] },
  biodataValue: { fontSize: 13, fontWeight: '600', color: colors.gray[800] },
  actionSection: { marginTop: 16 },
  backBtn: { alignItems: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], marginBottom: 12 },
  backBtnText: { fontSize: 14, fontWeight: '600', color: colors.gray[600] },
  actionRow: { flexDirection: 'row' },
  approveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green[500], paddingVertical: 12, borderRadius: 10, marginRight: 8 },
  approveBtnText: { fontSize: 14, fontWeight: '700', color: colors.white, marginLeft: 6 },
  rejectBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.red[500], paddingVertical: 12, borderRadius: 10, marginRight: 8 },
  rejectBtnText: { fontSize: 14, fontWeight: '600', color: colors.red[500], marginLeft: 6 },
  flagBtn: { width: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.red[600], borderRadius: 10 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[400], marginTop: 12 },
});
