import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_MAHARAJ_PROFILES } from '@/lib/demoData/maharaj';
import type { MaharajProfile } from '@/lib/types/maharaj';

type FilterId = 'all' | 'Shwetambar' | 'Digambar' | 'Sthanakvasi' | 'Terapanthi';

const SAMPRADAY_FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Shwetambar', label: 'Shwetambar' },
  { id: 'Digambar', label: 'Digambar' },
  { id: 'Sthanakvasi', label: 'Sthanakvasi' },
  { id: 'Terapanthi', label: 'Terapanthi' },
];

function getUniqueCities(profiles: MaharajProfile[]): string[] {
  const cities = new Set(profiles.map((p) => p.currentLocation.city));
  return Array.from(cities).sort();
}

function getStatusIndicator(status: string): { color: string; label: string } {
  switch (status) {
    case 'updated_today':
      return { color: colors.green[500], label: 'Updated today' };
    case 'updated_this_week':
      return { color: colors.yellow[500], label: 'Updated this week' };
    case 'outdated':
      return { color: colors.red[500], label: 'Outdated' };
    default:
      return { color: colors.gray[400], label: 'Unknown' };
  }
}

function formatFollowers(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(count % 1000 === 0 ? 0 : 1) + 'K';
  }
  return count.toString();
}

export default function MaharajScreen() {
  const [profiles] = useState<MaharajProfile[]>(DEMO_MAHARAJ_PROFILES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSampraday, setSelectedSampraday] = useState<FilterId>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    DEMO_MAHARAJ_PROFILES.forEach((p) => {
      if (p.isFollowing) map[p.id] = true;
    });
    return map;
  });

  const cities = getUniqueCities(profiles);

  const toggleFollow = useCallback((id: string) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const filtered = profiles.filter((p) => {
    const matchSampraday = selectedSampraday === 'all' || p.sampraday === selectedSampraday;
    const matchCity = selectedCity === 'all' || p.currentLocation.city === selectedCity;
    const matchSearch =
      !searchQuery ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameGu.includes(searchQuery);
    return matchSampraday && matchCity && matchSearch;
  });

  const renderCard = useCallback(
    ({ item }: { item: MaharajProfile }) => {
      const firstLetter = item.nameEn.charAt(0).toUpperCase();
      const status = getStatusIndicator(item.currentLocation.status);
      const isFollowing = !!followingMap[item.id];

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() =>
            router.push({ pathname: '/(screens)/maharaj-detail', params: { id: item.id } })
          }
        >
          <View style={styles.cardRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>

            {/* Info */}
            <View style={styles.cardInfo}>
              <Text style={styles.nameEn} numberOfLines={1}>
                {item.nameEn}
              </Text>
              <Text style={styles.nameGu} numberOfLines={1}>
                {item.nameGu}
              </Text>

              {/* Sampraday / Gachchh badge */}
              <View style={styles.badgeRow}>
                <View style={styles.sampradayBadge}>
                  <Text style={styles.sampradayText}>{item.sampraday}</Text>
                </View>
                {item.gachchh && (
                  <View style={styles.gachchhBadge}>
                    <Text style={styles.gachchhText}>{item.gachchh}</Text>
                  </View>
                )}
              </View>

              {/* Current location */}
              <View style={styles.locationRow}>
                <Ionicons name="location" size={13} color={colors.gray[400]} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.currentLocation.city}
                  {item.currentLocation.area ? `, ${item.currentLocation.area}` : ''}
                </Text>
              </View>
              <Text style={styles.upashrayText} numberOfLines={1}>
                {item.currentLocation.upashrayName}
              </Text>

              {/* Status indicator */}
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={styles.statusText}>{status.label}</Text>
              </View>

              {/* Sangh info */}
              {item.sanghName && (
                <View style={styles.sanghRow}>
                  <Ionicons name="people" size={12} color={colors.gray[500]} />
                  <Text style={styles.sanghText} numberOfLines={1}>
                    {item.sanghName}
                    {item.sanghMemberCount ? ` (${item.sanghMemberCount} members)` : ''}
                  </Text>
                </View>
              )}

              {/* Footer row: followers + follow button */}
              <View style={styles.cardFooter}>
                <View style={styles.followersRow}>
                  <Ionicons name="heart" size={13} color={colors.saffron[500]} />
                  <Text style={styles.followersText}>
                    {formatFollowers(item.followersCount)} followers
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    toggleFollow(item.id);
                  }}
                >
                  <Ionicons
                    name={isFollowing ? 'checkmark' : 'add'}
                    size={14}
                    color={isFollowing ? colors.white : colors.saffron[600]}
                  />
                  <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [followingMap, toggleFollow],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Maharaj Saheb' }} />

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
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

      {/* Sampraday filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipContent}
      >
        {SAMPRADAY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.chip, selectedSampraday === f.id && styles.chipActive]}
            onPress={() => setSelectedSampraday(f.id)}
          >
            <Text style={[styles.chipText, selectedSampraday === f.id && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Separator */}
        <View style={styles.chipSeparator} />

        {/* City filters */}
        <TouchableOpacity
          style={[styles.chip, selectedCity === 'all' && styles.chipActive]}
          onPress={() => setSelectedCity('all')}
        >
          <Ionicons
            name="location"
            size={12}
            color={selectedCity === 'all' ? colors.white : colors.gray[600]}
          />
          <Text style={[styles.chipText, selectedCity === 'all' && styles.chipTextActive]}>
            {' '}All Cities
          </Text>
        </TouchableOpacity>
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[styles.chip, selectedCity === city && styles.chipActive]}
            onPress={() => setSelectedCity(city)}
          >
            <Text style={[styles.chipText, selectedCity === city && styles.chipTextActive]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listing */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="person-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No Maharaj Saheb found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: colors.gray[500], marginTop: 16 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.gray[900] },

  // Filter chips
  chipScroll: { marginTop: 12, maxHeight: 46 },
  chipContent: { paddingHorizontal: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  chipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  chipText: { fontSize: 12, color: colors.gray[600] },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  chipSeparator: {
    width: 1,
    height: 24,
    backgroundColor: colors.gray[200],
    marginHorizontal: 8,
    alignSelf: 'center',
  },

  // List
  list: { padding: 16 },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row' },

  // Avatar
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.saffron[600] },

  // Card info
  cardInfo: { flex: 1 },
  nameEn: { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  nameGu: { fontSize: 12, color: colors.gray[500], marginTop: 1 },

  // Badges
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  sampradayBadge: {
    backgroundColor: colors.saffron[600] + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  sampradayText: { fontSize: 10, fontWeight: '600', color: colors.saffron[700] },
  gachchhBadge: {
    backgroundColor: colors.blue[500] + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  gachchhText: { fontSize: 10, fontWeight: '600', color: colors.blue[700] },

  // Location
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { fontSize: 12, color: colors.gray[600], marginLeft: 3, flex: 1 },
  upashrayText: { fontSize: 11, color: colors.gray[500], marginLeft: 16, marginTop: 1 },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 11, color: colors.gray[500] },

  // Sangh
  sanghRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  sanghText: { fontSize: 11, color: colors.gray[600], marginLeft: 4, flex: 1 },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  followersRow: { flexDirection: 'row', alignItems: 'center' },
  followersText: { fontSize: 12, color: colors.gray[600], marginLeft: 4 },

  // Follow button
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  followBtnActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  followBtnText: { fontSize: 12, color: colors.saffron[600], marginLeft: 3, fontWeight: '600' },
  followBtnTextActive: { color: colors.white },
});
