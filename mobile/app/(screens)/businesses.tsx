import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';

interface Business {
  id: string;
  businessName: string;
  category: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: { name: string };
  owner?: { firstName: string; lastName: string };
  isVerified: boolean;
}

const CATEGORIES = [
  'All',
  'Retail',
  'Food & Restaurant',
  'Healthcare',
  'Education',
  'Professional Services',
  'Real Estate',
  'Manufacturing',
  'Technology',
  'Other',
];

export default function BusinessesScreen() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchBusinesses = useCallback(async () => {
    try {
      const response = await api.get('/businesses');
      const data = response?.businesses || [];
      setBusinesses(data);
      setFilteredBusinesses(data);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
      // Demo data
      const demoData: Business[] = [
        {
          id: '1',
          businessName: 'Shree Jain Textiles',
          category: 'Retail',
          description: 'Premium quality fabrics and traditional Jain clothing.',
          address: 'Ring Road, Surat',
          phone: '9876543210',
          isVerified: true,
        },
        {
          id: '2',
          businessName: 'Mahavir Medical Store',
          category: 'Healthcare',
          description: '24/7 pharmacy with all medicines available.',
          address: 'Adajan, Surat',
          phone: '9876543211',
          isVerified: true,
        },
        {
          id: '3',
          businessName: 'Parshwanath Jewellers',
          category: 'Retail',
          description: 'Gold, diamond and silver jewellery with hallmark guarantee.',
          address: 'Chauta Bazaar, Surat',
          phone: '9876543212',
          isVerified: false,
        },
        {
          id: '4',
          businessName: 'Navkar IT Solutions',
          category: 'Technology',
          description: 'Web development, mobile apps, and IT consulting services.',
          address: 'Vesu, Surat',
          phone: '9876543213',
          website: 'https://navkarit.com',
          isVerified: true,
        },
      ];
      setBusinesses(demoData);
      setFilteredBusinesses(demoData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  useEffect(() => {
    filterBusinesses();
  }, [searchQuery, selectedCategory, businesses]);

  const filterBusinesses = () => {
    let filtered = businesses;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.businessName.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
      );
    }

    setFilteredBusinesses(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBusinesses();
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWebsite = (website: string) => {
    Linking.openURL(website);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Business Directory' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Business Directory' }} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search businesses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === category && styles.categoryChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Business List */}
      <FlatList
        data={filteredBusinesses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.businessCard}>
            <View style={styles.businessHeader}>
              <View style={styles.businessIconContainer}>
                <Ionicons name="storefront" size={24} color={colors.saffron[600]} />
              </View>
              <View style={styles.businessInfo}>
                <View style={styles.businessNameRow}>
                  <Text style={styles.businessName}>{item.businessName}</Text>
                  {item.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.green[500]}
                    />
                  )}
                </View>
                <Text style={styles.businessCategory}>{item.category}</Text>
              </View>
            </View>

            {item.description && (
              <Text style={styles.businessDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}

            {item.address && (
              <View style={styles.businessDetail}>
                <Ionicons name="location" size={14} color={colors.gray[400]} />
                <Text style={styles.businessDetailText}>{item.address}</Text>
              </View>
            )}

            <View style={styles.businessActions}>
              {item.phone && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleCall(item.phone!)}
                >
                  <Ionicons name="call" size={18} color={colors.saffron[600]} />
                  <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>
              )}
              {item.website && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleWebsite(item.website!)}
                >
                  <Ionicons name="globe" size={18} color={colors.saffron[600]} />
                  <Text style={styles.actionButtonText}>Website</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="navigate" size={18} color={colors.saffron[600]} />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="storefront-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No businesses found</Text>
          </View>
        }
      />

      {/* Add Business FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(screens)/add-business')}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: colors.gray[900],
  },
  categoriesContainer: {
    maxHeight: 50,
    marginTop: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  categoryChipActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
  },
  businessCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessInfo: {
    flex: 1,
    marginLeft: 12,
  },
  businessNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginRight: 6,
  },
  businessCategory: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  businessDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 12,
    lineHeight: 20,
  },
  businessDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  businessDetailText: {
    fontSize: 13,
    color: colors.gray[600],
    marginLeft: 6,
  },
  businessActions: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.saffron[600],
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.saffron[600],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
