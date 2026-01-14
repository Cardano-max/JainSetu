import { useEffect, useState, useCallback } from 'react';
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
}

const TYPES = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'tirth', label: 'Tirth', icon: 'flag' },
  { id: 'dharamshala', label: 'Dharamshala', icon: 'bed' },
  { id: 'temple', label: 'Temples', icon: 'business' },
];

export default function TirthScreen() {
  const [places, setPlaces] = useState<Tirth[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await api.get('/tirth');
      setPlaces(response?.places || response?.tirths || []);
    } catch (error) {
      console.error('Failed to fetch tirth places:', error);
      // Demo data
      setPlaces([
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
        },
      ]);
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
              size={20}
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
          <TouchableOpacity style={styles.placeCard}>
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
                  <TouchableOpacity style={styles.actionButton}>
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
  typeFilter: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  typeButtonActive: {
    backgroundColor: colors.saffron[600],
  },
  typeButtonText: {
    fontSize: 12,
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
    height: 150,
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
    fontSize: 18,
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
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 10,
    lineHeight: 20,
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 12,
  },
  facilityTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  facilityText: {
    fontSize: 11,
    color: colors.gray[700],
  },
  moreFacilities: {
    fontSize: 11,
    color: colors.gray[500],
    marginLeft: 4,
  },
  placeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
