import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
  RefreshControl, TextInput, FlatList, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { DEMO_JOBS } from '@/lib/demoData/jobs';
import type { Job, JobMode } from '@/lib/types/jobs';

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [mode, setMode] = useState<JobMode>('looking');

  const fetchJobs = useCallback(async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response?.jobs || []);
    } catch {
      setJobs(DEMO_JOBS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const filtered = jobs.filter((job) => {
    const matchType = selectedType === 'All' ||
      (selectedType === 'Remote' ? job.workMode === 'remote' : job.type === selectedType.toLowerCase().replace('-', ''));
    const matchSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      'full-time': colors.green[500], 'part-time': colors.blue[500],
      contract: colors.purple[500], internship: colors.saffron[500], freelance: colors.teal[500],
    };
    return map[type] || colors.gray[500];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Jobs' }} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.saffron[600]} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Jobs' }} />

      {/* Mode Toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'looking' && styles.modeBtnActive]}
          onPress={() => setMode('looking')}
        >
          <Ionicons name="search" size={16} color={mode === 'looking' ? colors.white : colors.gray[600]} />
          <Text style={[styles.modeText, mode === 'looking' && styles.modeTextActive]}>I'm Looking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'hiring' && styles.modeBtnActive]}
          onPress={() => setMode('hiring')}
        >
          <Ionicons name="briefcase" size={16} color={mode === 'hiring' ? colors.white : colors.gray[600]} />
          <Text style={[styles.modeText, mode === 'hiring' && styles.modeTextActive]}>I'm Hiring</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs or companies..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      {/* Type Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {JOB_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.filterText, selectedType === type && styles.filterTextActive]}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(screens)/job-detail', params: { id: item.id } })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.companyIcon}>
                <Ionicons name="briefcase" size={24} color={colors.saffron[600]} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardCompany}>{item.company}</Text>
              </View>
              <View style={styles.cardBadges}>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
                  <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>{item.type.replace('-', ' ')}</Text>
                </View>
                {item.isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} style={{ marginTop: 4 }} />
                )}
              </View>
            </View>
            <View style={styles.cardDetails}>
              <View style={styles.detailItem}><Ionicons name="location" size={14} color={colors.gray[400]} /><Text style={styles.detailText}>{item.location}</Text></View>
              <View style={styles.detailItem}><Ionicons name="time" size={14} color={colors.gray[400]} /><Text style={styles.detailText}>{item.experience}</Text></View>
              {item.salary && <View style={styles.detailItem}><Ionicons name="cash" size={14} color={colors.gray[400]} /><Text style={styles.detailText}>{item.salary}</Text></View>}
              {item.workMode && <View style={styles.detailItem}><Ionicons name={item.workMode === 'remote' ? 'globe' : 'business'} size={14} color={colors.gray[400]} /><Text style={styles.detailText}>{item.workMode}</Text></View>}
            </View>
            {item.skills && (
              <View style={styles.skillsRow}>
                {item.skills.slice(0, 3).map((s, i) => (
                  <View key={i} style={styles.skillTag}><Text style={styles.skillText}>{s}</Text></View>
                ))}
                {item.skills.length > 3 && <Text style={styles.skillMore}>+{item.skills.length - 3}</Text>}
              </View>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.postedAt}>{item.postedAt}</Text>
              {item.openings && <Text style={styles.openings}>{item.openings} openings</Text>}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchJobs(); }} />}
        ListEmptyComponent={
          <View style={styles.center}><Ionicons name="briefcase-outline" size={64} color={colors.gray[300]} /><Text style={styles.emptyText}>No jobs found</Text></View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(mode === 'hiring' ? '/(screens)/job-post' : '/(screens)/resume-builder')}
      >
        <Ionicons name={mode === 'hiring' ? 'add' : 'document-text'} size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: colors.gray[500], marginTop: 16 },
  modeRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 12, backgroundColor: colors.white, borderRadius: 12, padding: 4 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  modeBtnActive: { backgroundColor: colors.saffron[600] },
  modeText: { fontSize: 14, color: colors.gray[600], marginLeft: 6 },
  modeTextActive: { color: colors.white, fontWeight: '600' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.gray[900] },
  filterScroll: { marginTop: 12, maxHeight: 46 },
  filterContent: { paddingHorizontal: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginHorizontal: 4, borderWidth: 1, borderColor: colors.gray[200] },
  filterChipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  filterText: { fontSize: 13, color: colors.gray[700] },
  filterTextActive: { color: colors.white },
  list: { padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  companyIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.saffron[50], justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.gray[900] },
  cardCompany: { fontSize: 14, color: colors.gray[600], marginTop: 2 },
  cardBadges: { alignItems: 'flex-end' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  cardDetails: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14, marginBottom: 4 },
  detailText: { fontSize: 13, color: colors.gray[600], marginLeft: 4, textTransform: 'capitalize' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  skillTag: { backgroundColor: colors.gray[100], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
  skillText: { fontSize: 12, color: colors.gray[700] },
  skillMore: { fontSize: 12, color: colors.gray[500], alignSelf: 'center' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  postedAt: { fontSize: 12, color: colors.gray[500] },
  openings: { fontSize: 12, color: colors.saffron[600], fontWeight: '600' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
