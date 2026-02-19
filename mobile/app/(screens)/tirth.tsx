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
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { DEMO_TIRTH_LISTINGS } from '@/lib/demoData/tirth';
import type { TirthListing, TirthCategory } from '@/lib/types/tirth';

const CATEGORIES: { id: TirthCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'tirth', label: 'Tirth', icon: 'flag' },
  { id: 'dharamshala', label: 'Dharamshala', icon: 'bed' },
  { id: 'temple', label: 'Derasar', icon: 'business' },
  { id: 'bhojanshala', label: 'Bhojanshala', icon: 'restaurant' },
  { id: 'upashray', label: 'Upashray', icon: 'home' },
  { id: 'ayambil', label: 'Ayambil', icon: 'leaf' },
  { id: 'gharDerasar', label: 'Ghar Derasar', icon: 'heart' },
  { id: 'viharDham', label: 'Vihar Dham', icon: 'walk' },
];

export default function TirthScreen() {
  const [places, setPlaces] = useState<TirthListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TirthCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await api.get('/tirth');
      const apiPlaces = response?.places || response?.tirths || [];
      setPlaces(apiPlaces.length > 0 ? apiPlaces : DEMO_TIRTH_LISTINGS);
    } catch {
      setPlaces(DEMO_TIRTH_LISTINGS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  const filtered = places.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const getTypeColor = (cat: string) => {
    const map: Record<string, string> = {
      tirth: colors.saffron[500], dharamshala: colors.green[500], temple: colors.purple[500],
      bhojanshala: colors.blue[500], upashray: colors.teal[500], ayambil: colors.yellow[600],
      gharDerasar: colors.pink[500], viharDham: colors.saffron[700],
    };
    return map[cat] || colors.gray[500];
  };

  const getAvailabilityColor = (status?: string) => {
    if (status === 'available') return colors.green[500];
    if (status === 'limited') return colors.yellow[600];
    if (status === 'full') return colors.red[500];
    return colors.gray[400];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Tirth & Dharamshala' }} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.saffron[600]} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Tirth & Dharamshala' }} />

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tirth, city..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      {/* Category Scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Ionicons name={cat.icon as any} size={14} color={selectedCategory === cat.id ? colors.white : colors.gray[600]} />
            <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/(screens)/tirth-detail', params: { id: item.id } })}
          >
            <View style={styles.cardImage}>
              <Ionicons name="location" size={40} color={getTypeColor(item.category)} />
              {item.isVerified && (
                <View style={styles.verifiedTag}>
                  <Ionicons name="checkmark-circle" size={12} color={colors.white} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              {item.roomAvailability && (
                <View style={[styles.availTag, { backgroundColor: getAvailabilityColor(item.roomAvailability) }]}>
                  <Text style={styles.availText}>{item.roomAvailability}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <View style={[styles.catBadge, { backgroundColor: getTypeColor(item.category) + '20' }]}>
                  <Text style={[styles.catBadgeText, { color: getTypeColor(item.category) }]}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.locRow}>
                <Ionicons name="location" size={13} color={colors.gray[400]} />
                <Text style={styles.locText}>{item.city}, {item.state}</Text>
              </View>
              {item.description && <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>}
              <View style={styles.facRow}>
                {item.facilities.slice(0, 3).map((f, i) => (
                  <View key={i} style={styles.facTag}><Text style={styles.facText}>{f}</Text></View>
                ))}
                {item.facilities.length > 3 && <Text style={styles.facMore}>+{item.facilities.length - 3}</Text>}
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.yellow[500]} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                </View>
                <View style={styles.cardActions}>
                  {item.hasMenu && (
                    <View style={styles.menuIndicator}>
                      <Ionicons name="restaurant" size={12} color={colors.green[600]} />
                      <Text style={styles.menuText}>Menu</Text>
                    </View>
                  )}
                  {item.contacts[0]?.phone1 && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${item.contacts[0].phone1}`)}>
                      <Ionicons name="call" size={16} color={colors.saffron[600]} />
                    </TouchableOpacity>
                  )}
                  {item.lat && item.lng && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.navBtn]}
                      onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`)}
                    >
                      <Ionicons name="navigate" size={16} color={colors.white} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPlaces(); }} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="location-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No places found</Text>
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
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.gray[900] },
  catScroll: { marginTop: 12, maxHeight: 46 },
  catContent: { paddingHorizontal: 12 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, marginHorizontal: 4 },
  catChipActive: { backgroundColor: colors.saffron[600] },
  catText: { fontSize: 12, color: colors.gray[600], marginLeft: 4 },
  catTextActive: { color: colors.white, fontWeight: '600' },
  list: { padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
  cardImage: { height: 110, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center', position: 'relative' },
  verifiedTag: { position: 'absolute', top: 8, left: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  verifiedText: { color: colors.white, fontSize: 10, fontWeight: '600', marginLeft: 3 },
  availTag: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  availText: { color: colors.white, fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { padding: 14 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.gray[900], flex: 1, marginRight: 8 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  catBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locText: { fontSize: 12, color: colors.gray[600], marginLeft: 3 },
  desc: { fontSize: 13, color: colors.gray[600], marginTop: 6, lineHeight: 18 },
  facRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  facTag: { backgroundColor: colors.gray[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 4, marginBottom: 4 },
  facText: { fontSize: 10, color: colors.gray[700] },
  facMore: { fontSize: 10, color: colors.gray[500], alignSelf: 'center', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '600', color: colors.gray[900], marginLeft: 4 },
  reviewCount: { fontSize: 12, color: colors.gray[500], marginLeft: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  menuIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500] + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6 },
  menuText: { fontSize: 10, color: colors.green[600], fontWeight: '600', marginLeft: 3 },
  actionBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.saffron[50], justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  navBtn: { backgroundColor: colors.saffron[600] },
});
