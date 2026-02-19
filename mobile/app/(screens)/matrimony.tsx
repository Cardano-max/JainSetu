import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { DEMO_MATRIMONY_PROFILES } from '@/lib/demoData/matrimony';
import type { MatrimonyProfile } from '@/lib/types/matrimony';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'verified', label: 'Verified' },
  { id: 'premium', label: 'Premium' },
];

export default function MatrimonyScreen() {
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await api.get('/matrimony/profiles');
      setProfiles(response?.profiles || []);
    } catch {
      setProfiles(DEMO_MATRIMONY_PROFILES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const filteredProfiles = profiles.filter((p) => {
    if (selectedFilter === 'male') return p.gender === 'male';
    if (selectedFilter === 'female') return p.gender === 'female';
    if (selectedFilter === 'verified') return p.isVerified;
    if (selectedFilter === 'premium') return p.isPremium;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.work?.occupation || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Matrimony' }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Matrimony' }} />

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, city, profession..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, selectedFilter === f.id && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f.id)}
          >
            <Text style={[styles.filterText, selectedFilter === f.id && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Profile Grid */}
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(screens)/matrimony-detail', params: { id: item.id } })}
          >
            <View style={styles.cardImage}>
              <Ionicons
                name={item.gender === 'female' ? 'woman' : 'man'}
                size={40}
                color={colors.saffron[400]}
              />
              {item.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={10} color={colors.white} />
                </View>
              )}
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.green[500]} />
                </View>
              )}
            </View>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardDetails}>{item.age} yrs • {item.height}</Text>
            <Text style={styles.cardCity}>
              <Ionicons name="location" size={10} color={colors.gray[400]} /> {item.city}
            </Text>
            <Text style={styles.cardProfession} numberOfLines={1}>
              {item.work?.occupation || item.education.degree}
            </Text>
            {item.sect && (
              <View style={styles.cardSect}>
                <Text style={styles.cardSectText}>{item.sect}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchProfiles(); }}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="heart-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No profiles found</Text>
          </View>
        }
      />

      {/* Create Biodata FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(screens)/matrimony-create')}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: colors.gray[500], marginTop: 16 },
  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.gray[900] },
  // Filters
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginHorizontal: 4, borderWidth: 1, borderColor: colors.gray[200] },
  filterChipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  filterText: { fontSize: 13, color: colors.gray[700] },
  filterTextActive: { color: colors.white, fontWeight: '600' },
  // Grid
  listContent: { padding: 8 },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  cardImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center', position: 'relative', marginBottom: 10 },
  premiumBadge: { position: 'absolute', top: 0, left: 0, backgroundColor: colors.saffron[500], borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.white, borderRadius: 10 },
  cardName: { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  cardDetails: { fontSize: 12, color: colors.gray[600], marginTop: 2 },
  cardCity: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  cardProfession: { fontSize: 12, color: colors.saffron[600], marginTop: 4 },
  cardSect: { marginTop: 6, backgroundColor: colors.saffron[50], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  cardSectText: { fontSize: 10, color: colors.saffron[700] },
  // FAB
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
});
