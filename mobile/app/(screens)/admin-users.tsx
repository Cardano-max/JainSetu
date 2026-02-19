import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

type UserStatus = 'active' | 'suspended' | 'banned' | 'new';
type FilterTab = 'all' | 'active' | 'new' | 'suspended' | 'banned';

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  city: string;
  joinedAt: string;
  status: UserStatus;
  loginCount: number;
  postsCount: number;
  lastActive: string;
  profileComplete: number;
  isVerified: boolean;
}

const INITIAL_USERS: AdminUser[] = [
  { id: '1', name: 'Rajesh Shah', phone: '9876543210', city: 'Ahmedabad', joinedAt: '2026-01-15', status: 'active', loginCount: 87, postsCount: 12, lastActive: '2 min ago', profileComplete: 95, isVerified: true },
  { id: '2', name: 'Priya Jain', phone: '9876543211', city: 'Mumbai', joinedAt: '2026-01-20', status: 'active', loginCount: 64, postsCount: 8, lastActive: '15 min ago', profileComplete: 88, isVerified: true },
  { id: '3', name: 'Amit Doshi', phone: '9876543212', city: 'Surat', joinedAt: '2026-02-01', status: 'active', loginCount: 45, postsCount: 5, lastActive: '1 hour ago', profileComplete: 72, isVerified: false },
  { id: '4', name: 'Nisha Mehta', phone: '9876543213', city: 'Vadodara', joinedAt: '2026-02-10', status: 'new', loginCount: 3, postsCount: 0, lastActive: '3 hours ago', profileComplete: 35, isVerified: false },
  { id: '5', name: 'Vikram Sanghvi', phone: '9876543214', city: 'Rajkot', joinedAt: '2026-02-15', status: 'new', loginCount: 1, postsCount: 0, lastActive: 'Today', profileComplete: 20, isVerified: false },
  { id: '6', name: 'Deepak Shah', phone: '9876543215', city: 'Pune', joinedAt: '2026-01-05', status: 'active', loginCount: 120, postsCount: 28, lastActive: '30 min ago', profileComplete: 100, isVerified: true },
  { id: '7', name: 'Spam Account', phone: '0000000000', city: 'N/A', joinedAt: '2026-02-18', status: 'banned', loginCount: 2, postsCount: 0, lastActive: 'Feb 18', profileComplete: 5, isVerified: false },
  { id: '8', name: 'Reported User', phone: '9876543216', city: 'Jaipur', joinedAt: '2026-01-25', status: 'suspended', loginCount: 34, postsCount: 3, lastActive: 'Feb 16', profileComplete: 60, isVerified: false },
  { id: '9', name: 'Meena Kothari', phone: '9876543217', city: 'Indore', joinedAt: '2026-02-12', status: 'active', loginCount: 22, postsCount: 4, lastActive: '45 min ago', profileComplete: 80, isVerified: true },
  { id: '10', name: 'Suresh Jain', phone: '9876543218', city: 'Baroda', joinedAt: '2026-02-19', status: 'new', loginCount: 1, postsCount: 0, lastActive: 'Just now', profileComplete: 15, isVerified: false },
];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const filtered = users.filter((u) => {
    const matchesFilter = activeFilter === 'all' || u.status === activeFilter;
    const matchesSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery) || u.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSuspend = (id: string) => {
    Alert.alert('Suspend User', 'Suspend this user? They will not be able to post or interact.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: () => {
          setUsers(users.map((u) => u.id === id ? { ...u, status: 'suspended' as UserStatus } : u));
          setSelectedUser(null);
          Alert.alert('Suspended', 'User has been suspended.');
        },
      },
    ]);
  };

  const handleBan = (id: string) => {
    Alert.alert('Ban User', 'Permanently ban this user? This action cannot be easily undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: () => {
          setUsers(users.map((u) => u.id === id ? { ...u, status: 'banned' as UserStatus } : u));
          setSelectedUser(null);
          Alert.alert('Banned', 'User has been permanently banned.');
        },
      },
    ]);
  };

  const handleReactivate = (id: string) => {
    setUsers(users.map((u) => u.id === id ? { ...u, status: 'active' as UserStatus } : u));
    setSelectedUser(null);
    Alert.alert('Reactivated', 'User account has been reactivated.');
  };

  const getStatusBadge = (status: UserStatus) => {
    const map = {
      active: { color: colors.green[600], bg: colors.green[50], label: 'ACTIVE' },
      new: { color: colors.blue[500], bg: colors.blue[50], label: 'NEW' },
      suspended: { color: colors.yellow[500], bg: colors.yellow[100], label: 'SUSPENDED' },
      banned: { color: colors.red[500], bg: colors.red[50], label: 'BANNED' },
    };
    return map[status];
  };

  const counts = {
    all: users.length,
    active: users.filter((u) => u.status === 'active').length,
    new: users.filter((u) => u.status === 'new').length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    banned: users.filter((u) => u.status === 'banned').length,
  };

  // User detail modal
  if (selectedUser) {
    const badge = getStatusBadge(selectedUser.status);
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'User Details' }} />
        <View style={styles.detailContent}>
          <View style={styles.detailHeader}>
            <View style={styles.detailAvatar}>
              <Text style={styles.detailAvatarText}>{selectedUser.name[0]}</Text>
            </View>
            <View style={styles.detailInfo}>
              <View style={styles.detailNameRow}>
                <Text style={styles.detailName}>{selectedUser.name}</Text>
                {selectedUser.isVerified && <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} style={{ marginLeft: 6 }} />}
              </View>
              <Text style={styles.detailPhone}>{selectedUser.phone}</Text>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedUser.loginCount}</Text>
              <Text style={styles.statLabel}>Logins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedUser.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{selectedUser.profileComplete}%</Text>
              <Text style={styles.statLabel}>Profile</Text>
            </View>
          </View>

          <View style={styles.detailRows}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>City</Text><Text style={styles.detailValue}>{selectedUser.city}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Joined</Text><Text style={styles.detailValue}>{selectedUser.joinedAt}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Last Active</Text><Text style={styles.detailValue}>{selectedUser.lastActive}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Verified</Text><Text style={styles.detailValue}>{selectedUser.isVerified ? 'Yes' : 'No'}</Text></View>
          </View>

          <View style={styles.detailActions}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedUser(null)}>
              <Ionicons name="arrow-back" size={16} color={colors.gray[600]} />
              <Text style={styles.backBtnText}>Back to List</Text>
            </TouchableOpacity>

            {selectedUser.status === 'active' || selectedUser.status === 'new' ? (
              <View style={styles.actionBtns}>
                <TouchableOpacity style={styles.suspendBtnAction} onPress={() => handleSuspend(selectedUser.id)}>
                  <Ionicons name="pause-circle" size={16} color={colors.yellow[500]} />
                  <Text style={[styles.actionBtnText, { color: colors.yellow[600] }]}>Suspend</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.banBtn} onPress={() => handleBan(selectedUser.id)}>
                  <Ionicons name="ban" size={16} color={colors.red[500]} />
                  <Text style={[styles.actionBtnText, { color: colors.red[500] }]}>Ban</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.reactivateBtn} onPress={() => handleReactivate(selectedUser.id)}>
                <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} />
                <Text style={[styles.actionBtnText, { color: colors.green[600] }]}>Reactivate</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'User Management' }} />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.blue[500] }]}>
          <Text style={styles.summaryValue}>{users.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.green[500] }]}>
          <Text style={styles.summaryValue}>{counts.active}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.yellow[500] }]}>
          <Text style={styles.summaryValue}>{counts.new}</Text>
          <Text style={styles.summaryLabel}>New</Text>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder="Search name, phone, or city..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray[400]} />
      </View>

      <View style={styles.filterRow}>
        {(['all', 'active', 'new', 'suspended', 'banned'] as FilterTab[]).map((tab) => (
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
          const badge = getStatusBadge(item.status);
          return (
            <TouchableOpacity style={styles.card} onPress={() => setSelectedUser(item)}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name[0]}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {item.isVerified && <Ionicons name="checkmark-circle" size={14} color={colors.green[500]} style={{ marginLeft: 4 }} />}
                  </View>
                  <Text style={styles.userPhone}>{item.phone}</Text>
                  <View style={styles.cityRow}>
                    <Ionicons name="location" size={11} color={colors.gray[400]} />
                    <Text style={styles.cityText}>{item.city}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  <Text style={styles.lastActiveText}>{item.lastActive}</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <Text style={styles.cardStatText}>{item.loginCount} logins</Text>
                <Text style={styles.cardStatDot}>·</Text>
                <Text style={styles.cardStatText}>{item.postsCount} posts</Text>
                <Text style={styles.cardStatDot}>·</Text>
                <Text style={styles.cardStatText}>Profile {item.profileComplete}%</Text>
                <Text style={styles.cardStatDot}>·</Text>
                <Text style={styles.cardStatText}>Joined {item.joinedAt}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: 10, padding: 12, marginHorizontal: 4, borderLeftWidth: 3, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '800', color: colors.gray[900] },
  summaryLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
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
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.saffron[600] },
  cardInfo: { flex: 1, marginLeft: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  userPhone: { fontSize: 12, color: colors.gray[500], marginTop: 1 },
  cityRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cityText: { fontSize: 11, color: colors.gray[400], marginLeft: 3 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },
  lastActiveText: { fontSize: 10, color: colors.gray[400], marginTop: 4 },
  cardStats: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100], flexWrap: 'wrap' },
  cardStatText: { fontSize: 11, color: colors.gray[500] },
  cardStatDot: { marginHorizontal: 6, color: colors.gray[300] },
  // Detail view
  detailContent: { flex: 1, padding: 16 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 20, borderRadius: 14 },
  detailAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center' },
  detailAvatarText: { fontSize: 24, fontWeight: '700', color: colors.saffron[600] },
  detailInfo: { flex: 1, marginLeft: 16 },
  detailNameRow: { flexDirection: 'row', alignItems: 'center' },
  detailName: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  detailPhone: { fontSize: 14, color: colors.gray[500], marginTop: 2 },
  statsGrid: { flexDirection: 'row', marginTop: 16, backgroundColor: colors.white, borderRadius: 14, padding: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.gray[900] },
  statLabel: { fontSize: 11, color: colors.gray[500], marginTop: 4 },
  detailRows: { backgroundColor: colors.white, borderRadius: 14, marginTop: 16, padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  detailLabel: { fontSize: 13, color: colors.gray[500] },
  detailValue: { fontSize: 13, fontWeight: '600', color: colors.gray[800] },
  detailActions: { marginTop: 20 },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], marginBottom: 12 },
  backBtnText: { fontSize: 14, fontWeight: '600', color: colors.gray[600], marginLeft: 6 },
  actionBtns: { flexDirection: 'row' },
  suspendBtnAction: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.yellow[500], marginRight: 8 },
  banBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.red[500] },
  reactivateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: colors.green[50], borderWidth: 1, borderColor: colors.green[500] },
  actionBtnText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[400], marginTop: 12 },
});
