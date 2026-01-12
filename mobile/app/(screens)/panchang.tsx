import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';

interface PanchangData {
  tithi: string;
  paksha: string;
  maah: string;
  samvat: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  navkarshi: string;
  porsi: string;
  saadh_porsi: string;
  nakshatra: string;
  yoga: string;
  karan: string;
  rahuKaal: string;
  gulikaKaal: string;
  yamgand: string;
}

export default function PanchangScreen() {
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPanchang();
  }, []);

  const fetchPanchang = async () => {
    try {
      const response = await api.get('/panchang/today');
      setPanchang(response.data.panchang);
    } catch (error) {
      console.error('Failed to fetch panchang:', error);
      // Set default panchang data for demo
      setPanchang({
        tithi: 'Shukla Panchami',
        paksha: 'Shukla Paksha',
        maah: 'Magh',
        samvat: 'Vikram Samvat 2082',
        sunrise: '07:12 AM',
        sunset: '06:18 PM',
        moonrise: '10:45 AM',
        moonset: '11:30 PM',
        navkarshi: '07:48 AM',
        porsi: '09:00 AM',
        saadh_porsi: '10:12 AM',
        nakshatra: 'Ashwini',
        yoga: 'Siddha',
        karan: 'Bava',
        rahuKaal: '10:30 AM - 12:00 PM',
        gulikaKaal: '07:30 AM - 09:00 AM',
        yamgand: '01:30 PM - 03:00 PM',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPanchang();
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Panchang' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Panchang' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.samvatText}>{panchang?.samvat}</Text>
        </View>

        {/* Tithi Card */}
        <View style={styles.tithiCard}>
          <Text style={styles.tithiLabel}>Today's Tithi</Text>
          <Text style={styles.tithiValue}>{panchang?.tithi}</Text>
          <View style={styles.tithiMeta}>
            <Text style={styles.tithiMetaText}>{panchang?.paksha}</Text>
            <Text style={styles.tithiMetaDot}>•</Text>
            <Text style={styles.tithiMetaText}>{panchang?.maah} Maah</Text>
          </View>
        </View>

        {/* Sun & Moon Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sun & Moon</Text>
          <View style={styles.timesGrid}>
            <View style={styles.timeCard}>
              <Text style={styles.timeEmoji}>🌅</Text>
              <Text style={styles.timeLabel}>Sunrise</Text>
              <Text style={styles.timeValue}>{panchang?.sunrise}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeEmoji}>🌇</Text>
              <Text style={styles.timeLabel}>Sunset</Text>
              <Text style={styles.timeValue}>{panchang?.sunset}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeEmoji}>🌙</Text>
              <Text style={styles.timeLabel}>Moonrise</Text>
              <Text style={styles.timeValue}>{panchang?.moonrise}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeEmoji}>🌑</Text>
              <Text style={styles.timeLabel}>Moonset</Text>
              <Text style={styles.timeValue}>{panchang?.moonset}</Text>
            </View>
          </View>
        </View>

        {/* Jain Timings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jain Timings</Text>
          <View style={styles.jainTimings}>
            <View style={styles.jainTimeRow}>
              <View style={styles.jainTimeIcon}>
                <Ionicons name="sunny" size={20} color={colors.saffron[600]} />
              </View>
              <View style={styles.jainTimeContent}>
                <Text style={styles.jainTimeLabel}>Navkarshi</Text>
                <Text style={styles.jainTimeDesc}>48 mins after sunrise</Text>
              </View>
              <Text style={styles.jainTimeValue}>{panchang?.navkarshi}</Text>
            </View>
            <View style={styles.jainTimeRow}>
              <View style={styles.jainTimeIcon}>
                <Ionicons name="time" size={20} color={colors.saffron[600]} />
              </View>
              <View style={styles.jainTimeContent}>
                <Text style={styles.jainTimeLabel}>Porsi</Text>
                <Text style={styles.jainTimeDesc}>1st Porsi end time</Text>
              </View>
              <Text style={styles.jainTimeValue}>{panchang?.porsi}</Text>
            </View>
            <View style={styles.jainTimeRow}>
              <View style={styles.jainTimeIcon}>
                <Ionicons name="timer" size={20} color={colors.saffron[600]} />
              </View>
              <View style={styles.jainTimeContent}>
                <Text style={styles.jainTimeLabel}>Saadh Porsi</Text>
                <Text style={styles.jainTimeDesc}>1.5 Porsi end time</Text>
              </View>
              <Text style={styles.jainTimeValue}>{panchang?.saadh_porsi}</Text>
            </View>
          </View>
        </View>

        {/* Astrological Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astrological Details</Text>
          <View style={styles.astroGrid}>
            <View style={styles.astroItem}>
              <Text style={styles.astroLabel}>Nakshatra</Text>
              <Text style={styles.astroValue}>{panchang?.nakshatra}</Text>
            </View>
            <View style={styles.astroItem}>
              <Text style={styles.astroLabel}>Yoga</Text>
              <Text style={styles.astroValue}>{panchang?.yoga}</Text>
            </View>
            <View style={styles.astroItem}>
              <Text style={styles.astroLabel}>Karan</Text>
              <Text style={styles.astroValue}>{panchang?.karan}</Text>
            </View>
          </View>
        </View>

        {/* Inauspicious Times */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Inauspicious Times</Text>
          <View style={styles.inauspiciousList}>
            <View style={styles.inauspiciousRow}>
              <Text style={styles.inauspiciousLabel}>Rahu Kaal</Text>
              <Text style={styles.inauspiciousValue}>{panchang?.rahuKaal}</Text>
            </View>
            <View style={styles.inauspiciousRow}>
              <Text style={styles.inauspiciousLabel}>Gulika Kaal</Text>
              <Text style={styles.inauspiciousValue}>{panchang?.gulikaKaal}</Text>
            </View>
            <View style={styles.inauspiciousRow}>
              <Text style={styles.inauspiciousLabel}>Yamgand</Text>
              <Text style={styles.inauspiciousValue}>{panchang?.yamgand}</Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateHeader: {
    padding: 20,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  samvatText: {
    fontSize: 14,
    color: colors.saffron[600],
    marginTop: 4,
  },
  tithiCard: {
    backgroundColor: colors.saffron[500],
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  tithiLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.8,
  },
  tithiValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    marginTop: 8,
  },
  tithiMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tithiMetaText: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  tithiMetaDot: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.5,
    marginHorizontal: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  timeCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  timeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 2,
  },
  jainTimings: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  jainTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  jainTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  jainTimeContent: {
    flex: 1,
    marginLeft: 12,
  },
  jainTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  jainTimeDesc: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  jainTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  astroGrid: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
  },
  astroItem: {
    flex: 1,
    alignItems: 'center',
  },
  astroLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  astroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 4,
  },
  inauspiciousList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inauspiciousRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  inauspiciousLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  inauspiciousValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.red[600],
  },
});
