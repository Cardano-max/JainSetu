import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

type BizStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

interface AdminBusiness {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  city: string;
  phone: string;
  status: BizStatus;
  submittedAt: string;
  products: number;
  description: string;
}

const INITIAL_BIZ: AdminBusiness[] = [
  { id: '1', businessName: 'Jain Sweets & Namkeen', ownerName: 'Kantilal Shah', category: 'Food & Restaurant', city: 'Surat', phone: '9876543210', status: 'pending', submittedAt: '2026-02-19', products: 3, description: 'Pure Jain sweets and namkeen, no onion/garlic' },
  { id: '2', businessName: 'Navkar Pharmacy', ownerName: 'Dr. Amit Jain', category: 'Healthcare', city: 'Ahmedabad', phone: '9876543211', status: 'pending', submittedAt: '2026-02-19', products: 0, description: '24/7 pharmacy with all medicines' },
  { id: '3', businessName: 'Shri Parshwanath Textiles', ownerName: 'Sureshbhai Mehta', category: 'Retail', city: 'Surat', phone: '9876543212', status: 'pending', submittedAt: '2026-02-18', products: 5, description: 'Premium quality fabrics for all occasions' },
  { id: '4', businessName: 'Mahavir Jewellers', ownerName: 'Rajeshbhai Sanghvi', category: 'Retail', city: 'Mumbai', phone: '9876543213', status: 'pending', submittedAt: '2026-02-18', products: 4, description: 'Gold and diamond jewellery with hallmark' },
  { id: '5', businessName: 'Tirthankar IT Solutions', ownerName: 'Vikram Doshi', category: 'Technology', city: 'Pune', phone: '9876543214', status: 'pending', submittedAt: '2026-02-17', products: 0, description: 'Web and mobile app development services' },
  { id: '6', businessName: 'Shree Jain Textiles', ownerName: 'Prabhulal Jain', category: 'Retail', city: 'Surat', phone: '9876543215', status: 'verified', submittedAt: '2026-02-15', products: 5, description: 'Traditional Jain clothing and fabrics' },
  { id: '7', businessName: 'Navkar IT Solutions', ownerName: 'Nilesh Shah', category: 'Technology', city: 'Surat', phone: '9876543216', status: 'verified', submittedAt: '2026-02-14', products: 2, description: 'IT consulting and development' },
  { id: '8', businessName: 'Spam Business XYZ', ownerName: 'Unknown', category: 'Other', city: 'N/A', phone: '0000000000', status: 'rejected', submittedAt: '2026-02-16', products: 0, description: 'Invalid/spam listing' },
];

export default function AdminBusinessScreen() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>(INITIAL_BIZ);
  const [activeFilter, setActiveFilter] = useState<BizStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = businesses.filter((b) => {
    const matchesFilter = activeFilter === 'all' || b.status === activeFilter;
    const matchesSearch = !searchQuery || b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || b.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVerify = (id: string) => {
    Alert.alert('Verify Business', 'Verify this business listing? It will appear publicly.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Verify',
        onPress: () => {
          setBusinesses(businesses.map((b) => b.id === id ? { ...b, status: 'verified' as BizStatus } : b));
          Alert.alert('Verified', 'Business listing is now live.');
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Listing', 'Reject this business listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setBusinesses(businesses.map((b) => b.id === id ? { ...b, status: 'rejected' as BizStatus } : b));
        },
      },
    ]);
  };

  const handleSuspend = (id: string) => {
    Alert.alert('Suspend Listing', 'Suspend this verified listing? It will be hidden from public.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Suspend',
        style: 'destructive',
        onPress: () => {
          setBusinesses(businesses.map((b) => b.id === id ? { ...b, status: 'suspended' as BizStatus } : b));
        },
      },
    ]);
  };

  const getStatusBadge = (status: BizStatus) => {
    const map = {
      pending: { color: colors.yellow[500], bg: colors.yellow[100], label: 'PENDING' },
      verified: { color: colors.green[600], bg: colors.green[50], label: 'VERIFIED' },
      rejected: { color: colors.red[500], bg: colors.red[50], label: 'REJECTED' },
      suspended: { color: colors.gray[600], bg: colors.gray[100], label: 'SUSPENDED' },
    };
    return map[status];
  };

  const counts = {
    pending: businesses.filter((b) => b.status === 'pending').length,
    verified: businesses.filter((b) => b.status === 'verified').length,
    rejected: businesses.filter((b) => b.status === 'rejected').length,
    all: businesses.length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Business Management' }} />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder="Search business or owner..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray[400]} />
      </View>

      <View style={styles.filterRow}>
        {(['pending', 'verified', 'rejected', 'all'] as (BizStatus | 'all')[]).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]} onPress={() => setActiveFilter(tab)}>
            <Text style={[styles.filterText, activeFilter === tab && styles.filterTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab as keyof typeof counts] || 0})</Text>
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
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.bizIcon}>
                  <Ionicons name="storefront" size={22} color={colors.saffron[600]} />
                </View>
                <View style={styles.bizInfo}>
                  <Text style={styles.bizName}>{item.businessName}</Text>
                  <Text style={styles.bizOwner}>by {item.ownerName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              <Text style={styles.bizDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="location" size={13} color={colors.gray[400]} />
                  <Text style={styles.detailText}>{item.city}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag" size={13} color={colors.gray[400]} />
                  <Text style={styles.detailText}>{item.category}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cube" size={13} color={colors.gray[400]} />
                  <Text style={styles.detailText}>{item.products} products</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  <Ionicons name="call" size={11} color={colors.gray[400]} /> {item.phone}
                </Text>
                <Text style={styles.metaText}>Submitted: {item.submittedAt}</Text>
              </View>

              {item.status === 'pending' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.verifyBtn} onPress={() => handleVerify(item.id)}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.white} />
                    <Text style={styles.verifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtnAction} onPress={() => handleReject(item.id)}>
                    <Ionicons name="close-circle" size={16} color={colors.red[500]} />
                    <Text style={[styles.actionBtnText, { color: colors.red[500] }]}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.callBtn}>
                    <Ionicons name="call" size={16} color={colors.blue[500]} />
                    <Text style={[styles.actionBtnText, { color: colors.blue[500] }]}>Call Owner</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === 'verified' && (
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.suspendBtn} onPress={() => handleSuspend(item.id)}>
                    <Ionicons name="pause-circle" size={16} color={colors.gray[600]} />
                    <Text style={[styles.actionBtnText, { color: colors.gray[600] }]}>Suspend</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="storefront-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No listings found</Text>
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
  filterTab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: colors.white, marginRight: 6, marginBottom: 4, borderWidth: 1, borderColor: colors.gray[200] },
  filterTabActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.gray[600] },
  filterTextActive: { color: colors.white },
  listContent: { padding: 16, paddingTop: 8 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bizIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.saffron[50], justifyContent: 'center', alignItems: 'center' },
  bizInfo: { flex: 1, marginLeft: 12 },
  bizName: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  bizOwner: { fontSize: 12, color: colors.gray[500], marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
  bizDesc: { fontSize: 13, color: colors.gray[600], lineHeight: 19, marginBottom: 10 },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 4 },
  detailText: { fontSize: 12, color: colors.gray[500], marginLeft: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  metaText: { fontSize: 11, color: colors.gray[400] },
  actions: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  verifyBtnText: { fontSize: 13, fontWeight: '600', color: colors.white, marginLeft: 4 },
  rejectBtnAction: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.red[500], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8 },
  callBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.blue[500], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  suspendBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.gray[400], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[400], marginTop: 12 },
});
