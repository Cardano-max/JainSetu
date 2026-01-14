import { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useLocationWeather } from '@/lib/useLocationWeather';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.35;

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
  const mapRef = useRef<MapView>(null);
  const { location: userLocation } = useLocationWeather();

  const [places, setPlaces] = useState<Tirth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [showMap, setShowMap] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<Tirth | null>(null);

  // Initial map region (centered on India)
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 23.0,
    longitude: 77.0,
    latitudeDelta: 12,
    longitudeDelta: 12,
  });

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await api.get('/tirth');
      const apiPlaces = response?.places || response?.tirths || [];
      // Merge API data with demo data for coordinates
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

  // Update map region when user location changes
  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Optional: Center on user location
      // mapRef.current.animateToRegion({
      //   latitude: userLocation.latitude,
      //   longitude: userLocation.longitude,
      //   latitudeDelta: 5,
      //   longitudeDelta: 5,
      // });
    }
  }, [userLocation]);

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
      // Open in Google Maps or Apple Maps
      const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
      const url = Platform.select({
        ios: `maps:?daddr=${place.latitude},${place.longitude}&q=${encodeURIComponent(place.name)}`,
        android: `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${encodeURIComponent(place.name)})`,
      });
      Linking.openURL(url!);
    }
  };

  const handleMarkerPress = (place: Tirth) => {
    setSelectedPlace(place);
    if (place.latitude && place.longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 1,
        longitudeDelta: 1,
      }, 500);
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

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'tirth':
        return '#f97316'; // saffron
      case 'dharamshala':
        return '#22c55e'; // green
      case 'temple':
        return '#8b5cf6'; // purple
      default:
        return '#6b7280';
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
      <Stack.Screen
        options={{
          title: 'Tirth & Dharamshala',
          headerRight: () => (
            <TouchableOpacity
              style={styles.mapToggle}
              onPress={() => setShowMap(!showMap)}
            >
              <Ionicons
                name={showMap ? 'list' : 'map'}
                size={24}
                color={colors.saffron[600]}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            {filteredPlaces.map((place) =>
              place.latitude && place.longitude ? (
                <Marker
                  key={place.id}
                  coordinate={{
                    latitude: place.latitude,
                    longitude: place.longitude,
                  }}
                  title={place.name}
                  description={`${place.city}, ${place.state}`}
                  pinColor={getMarkerColor(place.type)}
                  onPress={() => handleMarkerPress(place)}
                />
              ) : null
            )}
          </MapView>

          {/* Map Legend */}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#f97316' }]} />
              <Text style={styles.legendText}>Tirth</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
              <Text style={styles.legendText}>Temple</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.legendText}>Dharamshala</Text>
            </View>
          </View>
        </View>
      )}

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
            style={[
              styles.placeCard,
              selectedPlace?.id === item.id && styles.placeCardSelected,
            ]}
            onPress={() => handleMarkerPress(item)}
          >
            <View style={styles.placeImagePlaceholder}>
              <Ionicons name={getTypeIcon(item.type) as any} size={40} color={getTypeColor(item.type)} />
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
                    style={styles.actionButton}
                    onPress={() => handleNavigate(item)}
                  >
                    <Ionicons name="navigate" size={18} color={colors.saffron[600]} />
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
  mapToggle: {
    padding: 8,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: colors.gray[700],
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
  placeCardSelected: {
    borderWidth: 2,
    borderColor: colors.saffron[500],
  },
  placeImagePlaceholder: {
    height: 120,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
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
