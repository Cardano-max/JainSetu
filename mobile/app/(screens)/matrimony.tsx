import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

interface MatrimonyProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  height: string;
  education: string;
  occupation: string;
  city: string;
  gotra: string;
  maritalStatus: string;
  about?: string;
  imageUrl?: string;
  isVerified: boolean;
}

const FILTERS = ['All', 'Male', 'Female'];

export default function MatrimonyScreen() {
  const { isAuthenticated } = useAuthStore();
  const [profiles, setProfiles] = useState<MatrimonyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedProfile, setSelectedProfile] = useState<MatrimonyProfile | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await api.get('/matrimony/profiles');
      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      // Demo data
      setProfiles([
        {
          id: '1',
          name: 'Priya Shah',
          age: 26,
          gender: 'female',
          height: "5'4\"",
          education: 'MBA - Finance',
          occupation: 'Bank Manager',
          city: 'Surat',
          gotra: 'Oswal',
          maritalStatus: 'Never Married',
          about: 'Simple, family-oriented girl looking for a compatible life partner.',
          isVerified: true,
        },
        {
          id: '2',
          name: 'Rahul Jain',
          age: 28,
          gender: 'male',
          height: "5'10\"",
          education: 'B.Tech - Computer Science',
          occupation: 'Software Engineer',
          city: 'Ahmedabad',
          gotra: 'Porwal',
          maritalStatus: 'Never Married',
          about: 'Working in a reputed IT company, looking for an educated life partner.',
          isVerified: true,
        },
        {
          id: '3',
          name: 'Anita Mehta',
          age: 24,
          gender: 'female',
          height: "5'3\"",
          education: 'CA',
          occupation: 'Chartered Accountant',
          city: 'Mumbai',
          gotra: 'Agarwal',
          maritalStatus: 'Never Married',
          about: 'Professionally qualified, looking for someone with similar values.',
          isVerified: false,
        },
        {
          id: '4',
          name: 'Vikram Shah',
          age: 30,
          gender: 'male',
          height: "5'8\"",
          education: 'MD - Medicine',
          occupation: 'Doctor',
          city: 'Rajkot',
          gotra: 'Oswal',
          maritalStatus: 'Never Married',
          about: 'Doctor by profession, looking for an understanding life partner.',
          isVerified: true,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfiles();
  };

  const filteredProfiles = profiles.filter((p) => {
    if (selectedFilter === 'All') return true;
    return p.gender === selectedFilter.toLowerCase();
  });

  const viewProfile = (profile: MatrimonyProfile) => {
    setSelectedProfile(profile);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Matrimony' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Matrimony' }} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter && styles.filterTabTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Profile List */}
      <FlatList
        data={filteredProfiles}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.profileCard}
            onPress={() => viewProfile(item)}
          >
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImagePlaceholder}>
                <Ionicons
                  name={item.gender === 'female' ? 'woman' : 'man'}
                  size={40}
                  color={colors.saffron[400]}
                />
              </View>
              {item.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.green[500]} />
                </View>
              )}
            </View>
            <Text style={styles.profileName}>{item.name}</Text>
            <Text style={styles.profileDetails}>
              {item.age} yrs • {item.height}
            </Text>
            <Text style={styles.profileCity}>{item.city}</Text>
            <Text style={styles.profileOccupation} numberOfLines={1}>
              {item.occupation}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No profiles found</Text>
          </View>
        }
      />

      {/* Profile Detail Modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Ionicons name="close" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Profile Details</Text>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={24} color={colors.saffron[600]} />
            </TouchableOpacity>
          </View>

          {selectedProfile && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalProfileImage}>
                <Ionicons
                  name={selectedProfile.gender === 'female' ? 'woman' : 'man'}
                  size={80}
                  color={colors.saffron[400]}
                />
              </View>

              <View style={styles.modalProfileHeader}>
                <Text style={styles.modalProfileName}>{selectedProfile.name}</Text>
                {selectedProfile.isVerified && (
                  <View style={styles.verifiedTag}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.green[500]} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Age</Text>
                  <Text style={styles.detailValue}>{selectedProfile.age} years</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Height</Text>
                  <Text style={styles.detailValue}>{selectedProfile.height}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>City</Text>
                  <Text style={styles.detailValue}>{selectedProfile.city}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Gotra</Text>
                  <Text style={styles.detailValue}>{selectedProfile.gotra}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Education</Text>
                  <Text style={styles.detailValue}>{selectedProfile.education}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Occupation</Text>
                  <Text style={styles.detailValue}>{selectedProfile.occupation}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Marital Status</Text>
                  <Text style={styles.detailValue}>{selectedProfile.maritalStatus}</Text>
                </View>
              </View>

              {selectedProfile.about && (
                <View style={styles.aboutSection}>
                  <Text style={styles.aboutLabel}>About</Text>
                  <Text style={styles.aboutText}>{selectedProfile.about}</Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.interestButton}>
                  <Ionicons name="heart" size={20} color={colors.white} />
                  <Text style={styles.interestButtonText}>Express Interest</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Ionicons name="chatbubble" size={20} color={colors.saffron[600]} />
                  <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Register Profile FAB */}
      <TouchableOpacity style={styles.fab}>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: colors.gray[100],
  },
  filterTabActive: {
    backgroundColor: colors.saffron[600],
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  filterTabTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  profileCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  profileDetails: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 2,
  },
  profileCity: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  profileOccupation: {
    fontSize: 12,
    color: colors.saffron[600],
    marginTop: 4,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalContent: {
    flex: 1,
  },
  modalProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 24,
  },
  modalProfileHeader: {
    alignItems: 'center',
    marginTop: 16,
  },
  modalProfileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.green[600],
    marginLeft: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
    marginTop: 2,
  },
  aboutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  interestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
  },
  interestButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[50],
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  contactButtonText: {
    color: colors.saffron[600],
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
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
