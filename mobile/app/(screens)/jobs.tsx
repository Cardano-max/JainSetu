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
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: string;
  experience: string;
  description: string;
  requirements?: string[];
  postedAt: string;
  isActive: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];

export default function JobsScreen() {
  const { isAuthenticated } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const fetchJobs = useCallback(async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response?.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      // Demo data
      setJobs([
        {
          id: '1',
          title: 'Software Developer',
          company: 'Navkar Technologies',
          location: 'Surat, Gujarat',
          type: 'full-time',
          salary: '6-10 LPA',
          experience: '2-4 years',
          description: 'Looking for skilled software developers with expertise in React and Node.js.',
          requirements: ['React.js', 'Node.js', 'MongoDB', 'TypeScript'],
          postedAt: '2 days ago',
          isActive: true,
          contactEmail: 'hr@navkartech.com',
        },
        {
          id: '2',
          title: 'Chartered Accountant',
          company: 'Jain & Associates',
          location: 'Ahmedabad, Gujarat',
          type: 'full-time',
          salary: '8-12 LPA',
          experience: '3-5 years',
          description: 'Seeking a qualified CA for our growing practice. GST and Income Tax expertise required.',
          requirements: ['CA Qualified', 'GST', 'Income Tax', 'Audit'],
          postedAt: '5 days ago',
          isActive: true,
          contactPhone: '9876543210',
        },
        {
          id: '3',
          title: 'Marketing Intern',
          company: 'Mahavir Industries',
          location: 'Mumbai, Maharashtra',
          type: 'internship',
          salary: '15K/month',
          experience: 'Fresher',
          description: 'Great opportunity for marketing enthusiasts to learn and grow.',
          requirements: ['MBA Marketing (pursuing)', 'Social Media', 'Content Writing'],
          postedAt: '1 week ago',
          isActive: true,
          contactEmail: 'careers@mahavir.com',
        },
        {
          id: '4',
          title: 'Diamond Assorter',
          company: 'Parshwa Gems',
          location: 'Surat, Gujarat',
          type: 'full-time',
          salary: '4-6 LPA',
          experience: '1-3 years',
          description: 'Experienced diamond assorter needed for our export unit.',
          requirements: ['Diamond Sorting', 'Quality Check', 'Export Documentation'],
          postedAt: '3 days ago',
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesType =
      selectedType === 'All' || job.type === selectedType.toLowerCase().replace('-', '');
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const applyForJob = (job: Job) => {
    if (job.contactEmail) {
      Linking.openURL(`mailto:${job.contactEmail}?subject=Application for ${job.title}`);
    } else if (job.contactPhone) {
      Linking.openURL(`tel:${job.contactPhone}`);
    } else {
      Alert.alert('Contact', 'Please contact the company directly for this position.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return colors.green[500];
      case 'part-time':
        return colors.blue[500];
      case 'contract':
        return colors.purple[500];
      case 'internship':
        return colors.saffron[500];
      default:
        return colors.gray[500];
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Jobs' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Jobs' }} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {JOB_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterChip,
              selectedType === type && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedType === type && styles.filterChipTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <View style={styles.companyIcon}>
                <Ionicons name="briefcase" size={24} color={colors.saffron[600]} />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{item.title}</Text>
                <Text style={styles.companyName}>{item.company}</Text>
              </View>
              <View style={[styles.typeBadge, { backgroundColor: `${getTypeColor(item.type)}15` }]}>
                <Text style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
                  {item.type.replace('-', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.jobDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={14} color={colors.gray[400]} />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={14} color={colors.gray[400]} />
                <Text style={styles.detailText}>{item.experience}</Text>
              </View>
              {item.salary && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash" size={14} color={colors.gray[400]} />
                  <Text style={styles.detailText}>{item.salary}</Text>
                </View>
              )}
            </View>

            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description}
            </Text>

            {item.requirements && (
              <View style={styles.requirements}>
                {item.requirements.slice(0, 3).map((req, index) => (
                  <View key={index} style={styles.requirementTag}>
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
                {item.requirements.length > 3 && (
                  <View style={styles.requirementTag}>
                    <Text style={styles.requirementText}>+{item.requirements.length - 3}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.jobFooter}>
              <Text style={styles.postedAt}>{item.postedAt}</Text>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => applyForJob(item)}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
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
            <Ionicons name="briefcase-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        }
      />

      {/* Post Job FAB */}
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
  filterContainer: {
    maxHeight: 50,
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterChipActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  filterChipText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  filterChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
  },
  jobCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    flex: 1,
    marginLeft: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  companyName: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
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
  jobDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: colors.gray[600],
    marginLeft: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 12,
    lineHeight: 20,
  },
  requirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  requirementTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: colors.gray[700],
  },
  jobFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  postedAt: {
    fontSize: 12,
    color: colors.gray[500],
  },
  applyButton: {
    backgroundColor: colors.saffron[600],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
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
