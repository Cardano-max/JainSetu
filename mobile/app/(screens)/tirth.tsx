import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';

interface Tirth {
  id: string;
  name: string;
  type: 'tirth' | 'dharamshala' | 'temple';
  location: string;
  city: string;
  state: string;
  description?: string;
  facilities: string[];
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
}

const TYPES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'tirth', label: 'Tirth', icon: 'flag' },
  { id: 'dharamshala', label: 'Dharamshala', icon: 'bed' },
  { id: 'temple', label: 'Temples', icon: 'business' },
];

// Demo tirth locations with real coordinates
const DEMO_PLACES: Tirth[] = [
  {
    id: '1',
    name: 'Palitana Shatrunjaya',
    type: 'tirth',
    location: 'Palitana',
    city: 'Bhavnagar',
    state: 'Gujarat',
    description: 'The holiest pilgrimage place for Jains with 863 temples on Shatrunjaya Hill.',
    facilities: ['Dharamshala', 'Bhojanshala', 'Medical', 'Parking'],
    contactPhone: '02848-252252',
    rating: 4.9,
    reviewCount: 2500,
    latitude: 21.5229,
    longitude: 71.8217,
  },
  {
    id: '2',
    name: 'Shri Mahavirji Temple',
    type: 'temple',
    location: 'Chandangaon',
    city: 'Karauli',
    state: 'Rajasthan',
    description: 'Ancient Digambar Jain temple dedicated to Lord Mahavir.',
    facilities: ['Dharamshala', 'Bhojanshala', 'Parking'],
    rating: 4.7,
    reviewCount: 1200,
    latitude: 26.7318,
    longitude: 76.9158,
  },
  {
    id: '3',
    name: 'Jain Dharamshala Surat',
    type: 'dharamshala',
    location: 'Ring Road',
    city: 'Surat',
    state: 'Gujarat',
    description: 'Well-maintained dharamshala with AC and non-AC rooms. Perfect for pilgrims.',
    facilities: ['AC Rooms', 'Non-AC Rooms', 'Bhojanshala', 'Parking', 'WiFi'],
    contactPhone: '0261-2435000',
    rating: 4.5,
    reviewCount: 350,
    latitude: 21.1702,
    longitude: 72.8311,
  },
  {
    id: '4',
    name: 'Ranakpur Jain Temple',
    type: 'tirth',
    location: 'Ranakpur',
    city: 'Pali',
    state: 'Rajasthan',
    description: 'Famous for its marble architecture with 1444 uniquely carved pillars.',
    facilities: ['Dharamshala', 'Bhojanshala', 'Guide Service', 'Parking'],
    rating: 4.8,
    reviewCount: 1800,
    latitude: 25.1156,
    longitude: 73.4700,
  },
  {
    id: '5',
    name: 'Dilwara Temples',
    type: 'temple',
    location: 'Mount Abu',
    city: 'Sirohi',
    state: 'Rajasthan',
    description: 'Renowned for extraordinary architecture and intricate marble carvings.',
    facilities: ['Guide Service', 'Parking', 'Shoe Storage'],
    rating: 4.9,
    reviewCount: 2100,
    latitude: 24.6017,
    longitude: 72.7067,
  },
  {
    id: '6',
    name: 'Shikharji',
    type: 'tirth',
    location: 'Parasnath Hills',
    city: 'Giridih',
    state: 'Jharkhand',
    description: 'Supreme pilgrimage for Jains, where 20 Tirthankaras attained Nirvana.',
    facilities: ['Dharamshala', 'Bhojanshala', 'Doli Service', 'Medical'],
    rating: 4.9,
    reviewCount: 3200,
    latitude: 23.9629,
    longitude: 86.1361,
  },
  {
    id: '7',
    name: 'Girnar Temple',
    type: 'tirth',
    location: 'Girnar',
    city: 'Junagadh',
    state: 'Gujarat',
    description: 'One of the major Jain pilgrimage sites with ancient temples atop Girnar Hill.',
    facilities: ['Dharamshala', 'Bhojanshala', 'Doli Service'],
    rating: 4.8,
    reviewCount: 1950,
    latitude: 21.4939,
    longitude: 70.5056,
  },
  {
    id: '8',
    name: 'Sonagiri Temple',
    type: 'temple',
    location: 'Sonagiri',
    city: 'Datia',
    state: 'Madhya Pradesh',
    description: 'Historic Digambar Jain pilgrimage with 77 temples on hillocks.',
    facilities: ['Dharamshala', 'Bhojanshala', 'Parking'],
    rating: 4.6,
    reviewCount: 890,
    latitude: 25.6869,
    longitude: 78.6408,
  },
];

export default function TirthScreen() {
  const [places, setPlaces] = useState<Tirth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await api.get('/tirth');
      const apiPlaces = response?.places || response?.tirths || [];
      setPlaces(apiPlaces.length > 0 ? apiPlaces : DEMO_PLACES);
    } catch (error) {
      console.error('Failed to fetch tirth places:', error);
      setPlaces(DEMO_PLACES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaces();
  };

  const filteredPlaces = places.filter(
    (p) => selectedType === 'all' || p.type === selectedType
  );

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleNavigate = (place: Tirth) => {
    if (place.latitude && place.longitude) {
      // Open in Google Maps
      const url = Platform.select({
        ios: `maps:?daddr=${place.latitude},${place.longitude}&q=${encodeURIComponent(place.name)}`,
        android: `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${encodeURIComponent(place.name)})`,
      });
      Linking.openURL(url!);
    } else {
      // Search by name if no coordinates
      const query = encodeURIComponent(`${place.name}, ${place.city}, ${place.state}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const handleViewOnMap = (place: Tirth) => {
    // Open Google Maps in browser/app
    if (place.latitude && place.longitude) {
      const url = `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
      Linking.openURL(url);
    } else {
      const query = encodeURIComponent(`${place.name}, ${place.city}, ${place.state}`);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tirth':
        return 'flag';
      case 'dharamshala':
        return 'bed';
      case 'temple':
        return 'business';
      default:
        return 'location';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tirth':
        return colors.saffron[500];
      case 'dharamshala':
        return colors.green[500];
      case 'temple':
        return colors.purple[500];
      default:
        return colors.gray[500];
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Tirth & Dharamshala' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Tirth & Dharamshala' }} />

      {/* View All on Map Button */}
      <TouchableOpacity
        style={styles.viewAllMapButton}
        onPress={() => Linking.openURL('https://www.google.com/maps/search/jain+temples+india')}
      >
        <Ionicons name="map" size={20} color={colors.white} />
        <Text style={styles.viewAllMapText}>View All on Google Maps</Text>
      </TouchableOpacity>

      {/* Type Filter */}
      <View style={styles.typeFilter}>
        {TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Ionicons
              name={type.icon as any}
              size={18}
              color={selectedType === type.id ? colors.white : colors.gray[600]}
            />
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type.id && styles.typeButtonTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Places List */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.placeCard}
            onPress={() => handleViewOnMap(item)}
          >
            <View style={styles.placeImagePlaceholder}>
              <Ionicons name={getTypeIcon(item.type) as any} size={40} color={getTypeColor(item.type)} />
              {item.latitude && item.longitude && (
                <View style={styles.mapBadge}>
                  <Ionicons name="location" size={12} color={colors.white} />
                  <Text style={styles.mapBadgeText}>Map</Text>
                </View>
              )}
            </View>
            <View style={styles.placeContent}>
              <View style={styles.placeHeader}>
                <Text style={styles.placeName}>{item.name}</Text>
                <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
                  <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
                    {item.type}
                  </Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location" size={14} color={colors.gray[400]} />
                <Text style={styles.locationText}>
                  {item.city}, {item.state}
                </Text>
              </View>

              {item.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              {/* Facilities */}
              <View style={styles.facilitiesRow}>
                {item.facilities.slice(0, 3).map((facility, index) => (
                  <View key={index} style={styles.facilityTag}>
                    <Text style={styles.facilityText}>{facility}</Text>
                  </View>
                ))}
                {item.facilities.length > 3 && (
                  <Text style={styles.moreFacilities}>+{item.facilities.length - 3}</Text>
                )}
              </View>

              {/* Rating & Actions */}
              <View style={styles.placeFooter}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={colors.yellow[500]} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>({item.reviewCount})</Text>
                </View>
                <View style={styles.actions}>
                  {item.contactPhone && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleCall(item.contactPhone!)}
                    >
                      <Ionicons name="call" size={18} color={colors.saffron[600]} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.navigateButton]}
                    onPress={() => handleNavigate(item)}
                  >
                    <Ionicons name="navigate" size={18} color={colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bookmark-outline" size={18} color={colors.saffron[600]} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No places found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.saffron[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  viewAllMapText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  typeFilter: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  typeButtonActive: {
    backgroundColor: colors.saffron[600],
  },
  typeButtonText: {
    fontSize: 11,
    color: colors.gray[600],
    marginLeft: 4,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
  },
  placeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  placeImagePlaceholder: {
    height: 120,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.saffron[600],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  mapBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  placeContent: {
    padding: 16,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: colors.gray[600],
    marginLeft: 4,
  },
  description: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 8,
    lineHeight: 18,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
  },
  facilityTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    marginBottom: 5,
  },
  facilityText: {
    fontSize: 10,
    color: colors.gray[700],
  },
  moreFacilities: {
    fontSize: 10,
    color: colors.gray[500],
    marginLeft: 4,
  },
  placeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  navigateButton: {
    backgroundColor: colors.saffron[600],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
  },
});
