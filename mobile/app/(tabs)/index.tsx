import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import colors from '@/lib/colors';

const { width } = Dimensions.get('window');

interface PanchangData {
  tithi: string;
  paksha: string;
  maah: string;
  sunrise: string;
  sunset: string;
  navkarshi: string;
}

const menuItems = [
  { id: 'panchang', title: 'Panchang', icon: 'calendar', color: '#f59e0b' },
  { id: 'events', title: 'Events', icon: 'star', color: '#3b82f6' },
  { id: 'directory', title: 'Directory', icon: 'id-card', color: '#10b981' },
  { id: 'donations', title: 'Donations', icon: 'heart', color: '#ec4899' },
  { id: 'businesses', title: 'Businesses', icon: 'storefront', color: '#8b5cf6' },
  { id: 'matrimony', title: 'Matrimony', icon: 'heart-circle', color: '#f43f5e' },
  { id: 'tirth', title: 'Tirth & Dharamshala', icon: 'location', color: '#14b8a6' },
  { id: 'jobs', title: 'Jobs', icon: 'briefcase', color: '#6366f1' },
  { id: 'posts', title: 'Posts & Blog', icon: 'newspaper', color: '#f97316' },
  { id: 'store', title: 'Store', icon: 'cart', color: '#22c55e' },
  { id: 'travel', title: 'Travel & Recharge', icon: 'airplane', color: '#0ea5e9' },
  { id: 'insurance', title: 'Insurance & Finance', icon: 'shield-checkmark', color: '#dc2626' },
  { id: 'property', title: 'Property & Brokers', icon: 'home', color: '#7c3aed' },
  { id: 'education', title: 'Education', icon: 'school', color: '#0891b2' },
  { id: 'healthcare', title: 'Healthcare', icon: 'medkit', color: '#e11d48' },
  { id: 'profile', title: 'My Profile', icon: 'person', color: '#64748b' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [panchang, setPanchang] = useState<PanchangData | null>(null);

  useEffect(() => {
    fetchPanchang();
  }, []);

  const fetchPanchang = async () => {
    try {
      const response = await api.get('/panchang/today');
      setPanchang(response.data.panchang);
    } catch (error) {
      console.error('Failed to fetch panchang');
    }
  };

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'events':
        router.push('/(tabs)/events');
        break;
      case 'directory':
        router.push('/(tabs)/directory');
        break;
      case 'panchang':
        router.push('/panchang');
        break;
      case 'donations':
        router.push('/donations');
        break;
      case 'businesses':
        router.push('/businesses');
        break;
      case 'matrimony':
        router.push('/matrimony');
        break;
      case 'tirth':
        router.push('/tirth');
        break;
      case 'store':
        router.push('/store');
        break;
      case 'jobs':
        router.push('/jobs');
        break;
      case 'profile':
        router.push('/profile');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Jai Jinendra, {user?.firstName || 'Guest'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.saffron[600]} />
              <Text style={styles.location}>{user?.city?.name || 'Select City'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color={colors.gray[700]} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.gray[400]}
          />
        </View>

        {/* Panchang Widget */}
        {panchang && (
          <TouchableOpacity
            style={styles.panchangCard}
            onPress={() => router.push('/panchang')}
          >
            <View style={styles.panchangHeader}>
              <View>
                <View style={styles.panchangLocation}>
                  <Ionicons name="location" size={14} color={colors.saffron[600]} />
                  <Text style={styles.panchangCity}>{user?.city?.name || 'Surat'}</Text>
                </View>
                <Text style={styles.panchangDate}>
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
            </View>
            <Text style={styles.panchangTithi}>{panchang.tithi}</Text>
            <View style={styles.panchangTimes}>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>🌅</Text>
                <Text style={styles.timeValue}>{panchang.sunrise}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>🌇</Text>
                <Text style={styles.timeValue}>{panchang.sunset}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={[styles.timeValue, { color: colors.saffron[600] }]}>
                  Navkarshi: {panchang.navkarshi}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={styles.menuTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.saffron[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 16,
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
  panchangCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  panchangHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  panchangLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panchangCity: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  panchangDate: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  panchangTithi: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  panchangTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  timeValue: {
    fontSize: 14,
    color: colors.gray[700],
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  menuItem: {
    width: (width - 48) / 4,
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 12,
    color: colors.gray[700],
    textAlign: 'center',
  },
});
