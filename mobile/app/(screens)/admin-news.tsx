import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

type NewsStatus = 'pending' | 'approved' | 'rejected';
type FilterTab = 'pending' | 'approved' | 'rejected' | 'all';

interface AdminNewsItem {
  id: string;
  title: string;
  author: string;
  submittedAt: string;
  category: string;
  status: NewsStatus;
  content: string;
  hasImage: boolean;
  pointsAwarded?: number;
}

const INITIAL_NEWS: AdminNewsItem[] = [
  { id: '1', title: 'Community Seva Drive in Rajkot', author: 'Vikram Jain', submittedAt: '2026-02-19 10:30 AM', category: 'Community', status: 'pending', content: 'A massive community seva drive was organized by the Rajkot Jain Sangh...', hasImage: true },
  { id: '2', title: 'New Pathshala Opens in Vadodara', author: 'Meena Shah', submittedAt: '2026-02-19 09:15 AM', category: 'Education', status: 'pending', content: 'Shri Jain Pathshala has opened its new campus in Vadodara with modern facilities...', hasImage: true },
  { id: '3', title: 'Jain Youth Leadership Summit 2026', author: 'Amit Doshi', submittedAt: '2026-02-18 06:45 PM', category: 'Events', status: 'pending', content: 'The annual Jain Youth Leadership Summit will be held in Mumbai this March...', hasImage: false },
  { id: '4', title: 'Rare Agam Manuscript Discovered', author: 'Dr. Rekha Jain', submittedAt: '2026-02-18 03:20 PM', category: 'Spiritual', status: 'pending', content: 'A rare 500-year-old Agam manuscript has been discovered in a library in Jaisalmer...', hasImage: true },
  { id: '5', title: 'Mahavir Jayanti Preparations Begin', author: 'Sangh Committee', submittedAt: '2026-02-18 11:00 AM', category: 'Events', status: 'approved', content: 'Preparations for Mahavir Jayanti celebrations have begun across the country...', hasImage: true, pointsAwarded: 50 },
  { id: '6', title: 'Jain Doctors Free Camp', author: 'Rajesh Mehta', submittedAt: '2026-02-17 02:30 PM', category: 'Community', status: 'approved', content: 'Free medical camp organized by Jain Doctors Association in rural Gujarat...', hasImage: true, pointsAwarded: 50 },
  { id: '7', title: 'Misleading Temple Information', author: 'Anonymous', submittedAt: '2026-02-17 09:00 AM', category: 'Spiritual', status: 'rejected', content: 'Contains unverified and potentially misleading information about temple timings...', hasImage: false },
  { id: '8', title: 'Duplicate News Submission', author: 'User123', submittedAt: '2026-02-16 04:15 PM', category: 'National', status: 'rejected', content: 'This is a duplicate of an already published article...', hasImage: false },
];

export default function AdminNewsScreen() {
  const [news, setNews] = useState<AdminNewsItem[]>(INITIAL_NEWS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = news.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleApprove = (id: string) => {
    Alert.alert('Approve Article', 'Approve this article and award 50 points to author?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          setNews(news.map((n) => n.id === id ? { ...n, status: 'approved' as NewsStatus, pointsAwarded: 50 } : n));
          Alert.alert('Approved', 'Article published. 50 points awarded to author.');
        },
      },
    ]);
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Article', 'Reject this article? The author will be notified.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setNews(news.map((n) => n.id === id ? { ...n, status: 'rejected' as NewsStatus } : n));
          Alert.alert('Rejected', 'Article rejected. Author has been notified.');
        },
      },
    ]);
  };

  const getStatusColor = (status: NewsStatus) => {
    switch (status) {
      case 'pending': return colors.yellow[500];
      case 'approved': return colors.green[500];
      case 'rejected': return colors.red[500];
    }
  };

  const counts = {
    pending: news.filter((n) => n.status === 'pending').length,
    approved: news.filter((n) => n.status === 'approved').length,
    rejected: news.filter((n) => n.status === 'rejected').length,
    all: news.length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'News Management' }} />

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles or authors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['pending', 'approved', 'rejected', 'all'] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, activeFilter === tab && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text style={[styles.filterTabText, activeFilter === tab && styles.filterTabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            <View style={[styles.filterBadge, activeFilter === tab && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, activeFilter === tab && styles.filterBadgeTextActive]}>{counts[tab]}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* News List */}
      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                {item.hasImage && (
                  <View style={styles.imageIndicator}>
                    <Ionicons name="image" size={14} color={colors.blue[500]} />
                  </View>
                )}
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent} numberOfLines={2}>{item.content}</Text>

            <View style={styles.cardMeta}>
              <View style={styles.authorRow}>
                <Ionicons name="person" size={12} color={colors.gray[400]} />
                <Text style={styles.metaText}>{item.author}</Text>
              </View>
              <View style={styles.authorRow}>
                <Ionicons name="time" size={12} color={colors.gray[400]} />
                <Text style={styles.metaText}>{item.submittedAt}</Text>
              </View>
            </View>

            {item.pointsAwarded && (
              <View style={styles.pointsRow}>
                <Ionicons name="diamond" size={14} color={colors.saffron[500]} />
                <Text style={styles.pointsText}>{item.pointsAwarded} points awarded to author</Text>
              </View>
            )}

            {item.status === 'pending' && (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.previewBtn}>
                  <Ionicons name="eye" size={16} color={colors.blue[500]} />
                  <Text style={[styles.actionText, { color: colors.blue[500] }]}>Preview</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                  <Ionicons name="close" size={16} color={colors.red[500]} />
                  <Text style={[styles.actionText, { color: colors.red[500] }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="newspaper-outline" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No articles found</Text>
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
  filterRow: { flexDirection: 'row', padding: 16, paddingBottom: 8 },
  filterTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginRight: 8, borderWidth: 1, borderColor: colors.gray[200] },
  filterTabActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  filterTabText: { fontSize: 12, fontWeight: '600', color: colors.gray[600] },
  filterTabTextActive: { color: colors.white },
  filterBadge: { marginLeft: 6, backgroundColor: colors.gray[200], borderRadius: 8, minWidth: 20, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: colors.gray[600] },
  filterBadgeTextActive: { color: colors.white },
  listContent: { padding: 16, paddingTop: 8 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  imageIndicator: { marginRight: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  categoryBadgeText: { fontSize: 11, fontWeight: '600', color: colors.gray[500], backgroundColor: colors.gray[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 6 },
  cardContent: { fontSize: 13, color: colors.gray[600], lineHeight: 19, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 11, color: colors.gray[500], marginLeft: 4 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron[50], padding: 8, borderRadius: 8, marginTop: 8 },
  pointsText: { fontSize: 12, color: colors.saffron[600], fontWeight: '600', marginLeft: 6 },
  actionRow: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100], justifyContent: 'space-between' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.blue[500] },
  approveBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.green[500] },
  approveBtnText: { fontSize: 13, fontWeight: '600', color: colors.white, marginLeft: 4 },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.red[500] },
  actionText: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 14, color: colors.gray[400], marginTop: 12 },
});
