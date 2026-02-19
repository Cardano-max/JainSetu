import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useLocationWeather } from '@/lib/useLocationWeather';
import { weatherService } from '@/lib/weather';
import Stories from '@/components/Stories';
import HomeSlider from '@/components/HomeSlider';
import { DEMO_NEWS } from '@/lib/demoData/news';

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
  { id: 'maharaj', title: 'Maharaj Saheb', icon: 'person-circle', color: '#f59e0b' },
  { id: 'jain-news', title: 'Jain News', icon: 'newspaper', color: '#dc2626' },
  { id: 'panchang', title: 'Panchang', icon: 'calendar', color: '#f59e0b' },
  { id: 'events', title: 'Events', icon: 'star', color: '#3b82f6' },
  { id: 'directory', title: 'Directory', icon: 'id-card', color: '#10b981' },
  { id: 'donations', title: 'Donations', icon: 'heart', color: '#ec4899' },
  { id: 'businesses', title: 'Businesses', icon: 'storefront', color: '#8b5cf6' },
  { id: 'matrimony', title: 'Matrimony', icon: 'heart-circle', color: '#f43f5e' },
  { id: 'tirth', title: 'Tirth & Dharamshala', icon: 'location', color: '#14b8a6' },
  { id: 'jobs', title: 'Jobs', icon: 'briefcase', color: '#6366f1' },
  { id: 'pachchkan', title: 'Pachchkan', icon: 'musical-notes', color: '#f59e0b' },
  { id: 'festival-post', title: 'Festival Post', icon: 'sparkles', color: '#f97316' },
  { id: 'posts', title: 'Posts & Blog', icon: 'create', color: '#ea580c' },
  { id: 'store', title: 'Store', icon: 'cart', color: '#22c55e' },
  { id: 'messenger', title: 'Messages', icon: 'chatbubbles', color: '#0ea5e9' },
  { id: 'wallet', title: 'Wallet', icon: 'wallet', color: '#f97316' },
  { id: 'travel', title: 'Travel & Recharge', icon: 'airplane', color: '#06b6d4' },
  { id: 'insurance', title: 'Insurance', icon: 'shield-checkmark', color: '#dc2626' },
  { id: 'property', title: 'Property', icon: 'home', color: '#7c3aed' },
  { id: 'profile', title: 'My Profile', icon: 'person', color: '#64748b' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [panchang, setPanchang] = useState<PanchangData | null>(null);

  // Location & Weather Hook
  const {
    location,
    locationLoading,
    localTime,
    weather,
    weatherLoading,
    forecast,
    refresh,
  } = useLocationWeather();

  useEffect(() => {
    fetchPanchang();
  }, []);

  const fetchPanchang = async () => {
    try {
      const response = await api.get('/panchang/today');
      setPanchang(response?.panchang);
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
        router.push('/(screens)/panchang');
        break;
      case 'donations':
        router.push('/(screens)/donations');
        break;
      case 'businesses':
        router.push('/(screens)/businesses');
        break;
      case 'matrimony':
        router.push('/(screens)/matrimony');
        break;
      case 'tirth':
        router.push('/(screens)/tirth');
        break;
      case 'store':
        router.push('/(screens)/store');
        break;
      case 'jobs':
        router.push('/(screens)/jobs');
        break;
      case 'profile':
        router.push('/(screens)/profile');
        break;
      case 'festival-post':
        router.push('/(screens)/festival-post');
        break;
      case 'messenger':
        router.push('/(screens)/messenger');
        break;
      case 'posts':
        router.push('/(screens)/posts');
        break;
      case 'pachchkan':
        router.push('/(screens)/pachchkan');
        break;
      case 'wallet':
        router.push('/(screens)/wallet');
        break;
      case 'maharaj':
        router.push('/(screens)/maharaj');
        break;
      case 'jain-news':
        router.push('/(screens)/jain-news');
        break;
      default:
        break;
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return 'partly-sunny';
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    return weatherService.getWeatherIcon(weather.condition, isDay);
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
              <Text style={styles.location}>
                {locationLoading ? 'Detecting...' : (location?.city || user?.city?.name || 'Select City')}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {/* Add Content Button */}
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/(screens)/add-content')}
            >
              <Ionicons name="add-circle-outline" size={26} color={colors.gray[700]} />
            </TouchableOpacity>
            {/* Messenger Button */}
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/(screens)/messenger')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.gray[700]} />
              {/* Unread badge - demo */}
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            {/* Notifications */}
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/(screens)/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>
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

        {/* Stories */}
        <Stories
          onAddStory={() => router.push('/(screens)/add-content?type=story')}
        />

        {/* Home Slider - Recent modules, Ads, Posts */}
        <HomeSlider />

        {/* Jain News Slider */}
        <View style={styles.newsSection}>
          <View style={styles.newsSectionHeader}>
            <Text style={styles.newsSectionTitle}>Jain News</Text>
            <TouchableOpacity onPress={() => router.push('/(screens)/jain-news')}>
              <Text style={styles.newsSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}>
            {DEMO_NEWS.slice(0, 5).map((news) => (
              <TouchableOpacity
                key={news.id}
                style={styles.newsCard}
                onPress={() => router.push({ pathname: '/(screens)/news-detail', params: { id: news.id } })}
              >
                <View style={styles.newsImagePlaceholder}>
                  <Ionicons name="newspaper" size={28} color={colors.gray[300]} />
                  {news.isBreaking && (
                    <View style={styles.newsBreakingBadge}>
                      <Text style={styles.newsBreakingText}>BREAKING</Text>
                    </View>
                  )}
                </View>
                <View style={styles.newsCardContent}>
                  <Text style={styles.newsCardTitle} numberOfLines={2}>{news.title}</Text>
                  <Text style={styles.newsCardMeta}>{news.author} · {news.publishedAt}</Text>
                  <View style={styles.newsCardReactions}>
                    <Text style={styles.newsCardReactionText}>
                      {news.reactions.slice(0, 3).map((r) => r.emoji).join(' ')} {news.reactions.reduce((s, r) => s + r.count, 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Weather & Time Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherMain}>
            <View style={styles.weatherLeft}>
              {weatherLoading ? (
                <ActivityIndicator size="small" color={colors.saffron[600]} />
              ) : (
                <>
                  <Ionicons
                    name={getWeatherIcon() as any}
                    size={48}
                    color={colors.saffron[500]}
                  />
                  <View style={styles.tempContainer}>
                    <Text style={styles.temperature}>
                      {weather?.temperature || '--'}°C
                    </Text>
                    <Text style={styles.weatherDesc}>
                      {weather?.description || 'Loading...'}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View style={styles.weatherRight}>
              <Text style={styles.timeText}>{localTime?.time || '--:--'}</Text>
              <Text style={styles.dateText}>{localTime?.day || ''}</Text>
              <Text style={styles.dateText}>{localTime?.date || ''}</Text>
            </View>
          </View>

          {/* Weather Details Row */}
          {weather && (
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="water-outline" size={16} color={colors.saffron[600]} />
                <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="speedometer-outline" size={16} color={colors.saffron[600]} />
                <Text style={styles.weatherDetailText}>{Number(weather.windSpeed).toFixed(1)} km/h</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="eye-outline" size={16} color={colors.saffron[600]} />
                <Text style={styles.weatherDetailText}>{Number(weather.visibility).toFixed(1)} km</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="thermometer-outline" size={16} color={colors.saffron[600]} />
                <Text style={styles.weatherDetailText}>Feels {weather.feelsLike}°</Text>
              </View>
            </View>
          )}

          {/* 5-Day Forecast Mini */}
          {forecast && forecast.items.length > 0 && (
            <View style={styles.forecastRow}>
              {forecast.items.slice(0, 5).map((item, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>
                    {index === 0 ? 'Today' : new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </Text>
                  <Ionicons
                    name={weatherService.getWeatherIcon(item.condition, true) as any}
                    size={20}
                    color={colors.saffron[500]}
                  />
                  <Text style={styles.forecastTemp}>{item.temperature}°</Text>
                </View>
              ))}
            </View>
          )}

          {/* Location Info */}
          <View style={styles.locationInfo}>
            <Ionicons name="navigate" size={12} color={colors.gray[400]} />
            <Text style={styles.locationText}>
              {location ? `${location.city}, ${location.state}` : 'Detecting location...'}
            </Text>
            <TouchableOpacity onPress={refresh} style={styles.refreshBtn}>
              <Ionicons name="refresh" size={14} color={colors.saffron[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Panchang Widget */}
        {panchang && (
          <TouchableOpacity
            style={styles.panchangCard}
            onPress={() => router.push('/(screens)/panchang')}
          >
            <View style={styles.panchangHeader}>
              <View>
                <View style={styles.panchangLocation}>
                  <Ionicons name="calendar" size={14} color={colors.saffron[600]} />
                  <Text style={styles.panchangCity}>Jain Panchang</Text>
                </View>
                <Text style={styles.panchangDate}>
                  {panchang.maah} | {panchang.paksha}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
            </View>
            <Text style={styles.panchangTithi}>{panchang.tithi}</Text>
            <View style={styles.panchangTimes}>
              <View style={styles.timeItem}>
                <Ionicons name="sunny-outline" size={16} color={colors.yellow[600]} />
                <Text style={styles.timeValue}> {panchang.sunrise}</Text>
              </View>
              <View style={styles.timeItem}>
                <Ionicons name="moon-outline" size={16} color={colors.saffron[600]} />
                <Text style={styles.timeValue}> {panchang.sunset}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={[styles.timeValue, { color: colors.saffron[600], fontWeight: '600' }]}>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.red[500],
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
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
  // Weather Card Styles
  weatherCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  weatherMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempContainer: {
    marginLeft: 12,
  },
  temperature: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.gray[900],
  },
  weatherDesc: {
    fontSize: 14,
    color: colors.gray[600],
    textTransform: 'capitalize',
  },
  weatherRight: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.saffron[600],
  },
  dateText: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    marginBottom: 8,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 12,
    color: colors.gray[600],
    marginLeft: 4,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  forecastItem: {
    alignItems: 'center',
    flex: 1,
  },
  forecastDay: {
    fontSize: 10,
    color: colors.gray[500],
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  locationText: {
    fontSize: 11,
    color: colors.gray[400],
    marginLeft: 4,
  },
  refreshBtn: {
    marginLeft: 8,
    padding: 4,
  },
  // Panchang Card Styles
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
    alignItems: 'center',
    marginBottom: 8,
  },
  panchangLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panchangCity: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
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
  // News Slider
  newsSection: { marginBottom: 16 },
  newsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  newsSectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  newsSeeAll: { fontSize: 14, fontWeight: '600', color: colors.saffron[600] },
  newsCard: { width: 260, backgroundColor: colors.white, borderRadius: 12, marginRight: 12, overflow: 'hidden' },
  newsImagePlaceholder: { height: 120, backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center', position: 'relative' },
  newsBreakingBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.red[500], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  newsBreakingText: { fontSize: 9, fontWeight: '800', color: colors.white },
  newsCardContent: { padding: 12 },
  newsCardTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[900], lineHeight: 20 },
  newsCardMeta: { fontSize: 11, color: colors.gray[500], marginTop: 6 },
  newsCardReactions: { marginTop: 6 },
  newsCardReactionText: { fontSize: 12, color: colors.gray[600] },
});
