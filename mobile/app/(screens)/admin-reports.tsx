import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

const { width } = Dimensions.get('window');

type TimePeriod = 'today' | 'week' | 'month' | 'all';

interface ModuleStat {
  id: string;
  name: string;
  icon: string;
  color: string;
  users: number;
  growth: number;
  totalItems: number;
}

const MODULE_STATS: ModuleStat[] = [
  { id: 'news', name: 'Jain News', icon: 'newspaper', color: colors.red[500], users: 4320, growth: 12, totalItems: 156 },
  { id: 'matrimony', name: 'Matrimony', icon: 'heart-circle', color: colors.pink[500], users: 2890, growth: 8, totalItems: 342 },
  { id: 'tirth', name: 'Tirth & Dharamshala', icon: 'location', color: colors.teal[500], users: 3100, growth: 15, totalItems: 89 },
  { id: 'jobs', name: 'Jobs', icon: 'briefcase', color: colors.blue[500], users: 1560, growth: 22, totalItems: 67 },
  { id: 'business', name: 'Business Directory', icon: 'storefront', color: colors.purple[500], users: 2340, growth: 6, totalItems: 234 },
  { id: 'maharaj', name: 'Maharaj Saheb', icon: 'person-circle', color: colors.saffron[500], users: 5670, growth: 18, totalItems: 45 },
  { id: 'pachchkan', name: 'Pachchkan', icon: 'musical-notes', color: colors.yellow[500], users: 1890, growth: 5, totalItems: 24 },
  { id: 'posts', name: 'Posts & Blog', icon: 'create', color: colors.green[500], users: 3450, growth: 10, totalItems: 567 },
];

const OVERVIEW_STATS = {
  today: { totalUsers: 12450, activeUsers: 1823, newUsers: 45, sessions: 4567, avgTime: '8.5 min', revenue: 12500 },
  week: { totalUsers: 12450, activeUsers: 5432, newUsers: 312, sessions: 28900, avgTime: '7.2 min', revenue: 87500 },
  month: { totalUsers: 12450, activeUsers: 9876, newUsers: 1456, sessions: 134000, avgTime: '6.8 min', revenue: 375000 },
  all: { totalUsers: 12450, activeUsers: 11200, newUsers: 12450, sessions: 890000, avgTime: '7.1 min', revenue: 2150000 },
};

const ENGAGEMENT_DATA = [
  { hour: '6AM', value: 120 },
  { hour: '8AM', value: 340 },
  { hour: '10AM', value: 560 },
  { hour: '12PM', value: 780 },
  { hour: '2PM', value: 650 },
  { hour: '4PM', value: 430 },
  { hour: '6PM', value: 890 },
  { hour: '8PM', value: 1200 },
  { hour: '10PM', value: 670 },
];

const TOP_CITIES = [
  { city: 'Ahmedabad', users: 2340, pct: 18.8 },
  { city: 'Mumbai', users: 1890, pct: 15.2 },
  { city: 'Surat', users: 1567, pct: 12.6 },
  { city: 'Pune', users: 1234, pct: 9.9 },
  { city: 'Rajkot', users: 980, pct: 7.9 },
  { city: 'Baroda', users: 876, pct: 7.0 },
  { city: 'Jaipur', users: 654, pct: 5.3 },
  { city: 'Delhi', users: 543, pct: 4.4 },
];

export default function AdminReportsScreen() {
  const [period, setPeriod] = useState<TimePeriod>('today');
  const stats = OVERVIEW_STATS[period];
  const maxEngagement = Math.max(...ENGAGEMENT_DATA.map((d) => d.value));

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Reports & Analytics' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {(['today', 'week', 'month', 'all'] as TimePeriod[]).map((p) => (
            <TouchableOpacity key={p} style={[styles.periodTab, period === p && styles.periodTabActive]} onPress={() => setPeriod(p)}>
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Cards */}
        <View style={styles.overviewGrid}>
          <View style={[styles.overviewCard, { borderLeftColor: colors.blue[500] }]}>
            <Ionicons name="people" size={20} color={colors.blue[500]} />
            <Text style={styles.overviewValue}>{stats.totalUsers.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>Total Users</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: colors.green[500] }]}>
            <Ionicons name="pulse" size={20} color={colors.green[500]} />
            <Text style={styles.overviewValue}>{stats.activeUsers.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>Active Users</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: colors.saffron[500] }]}>
            <Ionicons name="person-add" size={20} color={colors.saffron[500]} />
            <Text style={styles.overviewValue}>{stats.newUsers.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>New Users</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: colors.purple[500] }]}>
            <Ionicons name="analytics" size={20} color={colors.purple[500]} />
            <Text style={styles.overviewValue}>{stats.sessions.toLocaleString()}</Text>
            <Text style={styles.overviewLabel}>Sessions</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: colors.teal[500] }]}>
            <Ionicons name="time" size={20} color={colors.teal[500]} />
            <Text style={styles.overviewValue}>{stats.avgTime}</Text>
            <Text style={styles.overviewLabel}>Avg. Session</Text>
          </View>
          <View style={[styles.overviewCard, { borderLeftColor: colors.yellow[500] }]}>
            <Ionicons name="diamond" size={20} color={colors.yellow[500]} />
            <Text style={styles.overviewValue}>{'\u20B9'}{(stats.revenue / 1000).toFixed(0)}K</Text>
            <Text style={styles.overviewLabel}>Revenue</Text>
          </View>
        </View>

        {/* Engagement Chart (simplified bar chart) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Activity (Today)</Text>
          <View style={styles.chartContainer}>
            {ENGAGEMENT_DATA.map((d, i) => (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, { height: (d.value / maxEngagement) * 120, backgroundColor: d.value === maxEngagement ? colors.saffron[500] : colors.saffron[300] }]} />
                </View>
                <Text style={styles.barLabel}>{d.hour}</Text>
                <Text style={styles.barValue}>{d.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Module Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Module Performance</Text>
          {MODULE_STATS.map((mod) => (
            <View key={mod.id} style={styles.moduleRow}>
              <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
                <Ionicons name={mod.icon as any} size={18} color={mod.color} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleName}>{mod.name}</Text>
                <View style={styles.moduleBar}>
                  <View style={[styles.moduleBarFill, { width: `${(mod.users / 6000) * 100}%`, backgroundColor: mod.color }]} />
                </View>
              </View>
              <View style={styles.moduleStats}>
                <Text style={styles.moduleUsers}>{mod.users.toLocaleString()}</Text>
                <View style={styles.growthBadge}>
                  <Ionicons name="trending-up" size={10} color={colors.green[600]} />
                  <Text style={styles.growthText}>{mod.growth}%</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Top Cities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Cities</Text>
          <View style={styles.citiesCard}>
            {TOP_CITIES.map((city, index) => (
              <View key={city.city} style={[styles.cityRow, index === TOP_CITIES.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.cityRank}>#{index + 1}</Text>
                <Text style={styles.cityName}>{city.city}</Text>
                <View style={styles.cityBarWrapper}>
                  <View style={[styles.cityBar, { width: `${(city.pct / 20) * 100}%` }]} />
                </View>
                <Text style={styles.cityUsers}>{city.users.toLocaleString()}</Text>
                <Text style={styles.cityPct}>{city.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export & Actions</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="download" size={18} color={colors.saffron[600]} />
              <Text style={styles.exportBtnText}>Export CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="share" size={18} color={colors.saffron[600]} />
              <Text style={styles.exportBtnText}>Share Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Ionicons name="print" size={18} color={colors.saffron[600]} />
              <Text style={styles.exportBtnText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  periodRow: { flexDirection: 'row', padding: 16, paddingBottom: 8 },
  periodTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: colors.white, marginHorizontal: 3 },
  periodTabActive: { backgroundColor: colors.saffron[600] },
  periodText: { fontSize: 13, fontWeight: '600', color: colors.gray[600] },
  periodTextActive: { color: colors.white },
  // Overview
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  overviewCard: { width: '47%', backgroundColor: colors.white, borderRadius: 12, padding: 14, margin: '1.5%', borderLeftWidth: 3 },
  overviewValue: { fontSize: 22, fontWeight: '800', color: colors.gray[900], marginTop: 8 },
  overviewLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  // Sections
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  // Chart
  chartContainer: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: 12, padding: 16, alignItems: 'flex-end', justifyContent: 'space-between' },
  barColumn: { alignItems: 'center', flex: 1 },
  barWrapper: { height: 120, justifyContent: 'flex-end' },
  bar: { width: 18, borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 8, color: colors.gray[400], marginTop: 6 },
  barValue: { fontSize: 8, color: colors.gray[500], fontWeight: '600' },
  // Modules
  moduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 12, marginBottom: 6 },
  moduleIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  moduleInfo: { flex: 1, marginLeft: 10 },
  moduleName: { fontSize: 13, fontWeight: '600', color: colors.gray[800], marginBottom: 6 },
  moduleBar: { height: 6, backgroundColor: colors.gray[100], borderRadius: 3, overflow: 'hidden' },
  moduleBarFill: { height: '100%', borderRadius: 3 },
  moduleStats: { alignItems: 'flex-end', marginLeft: 10 },
  moduleUsers: { fontSize: 14, fontWeight: '700', color: colors.gray[900] },
  growthBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  growthText: { fontSize: 10, color: colors.green[600], fontWeight: '600', marginLeft: 2 },
  // Cities
  citiesCard: { backgroundColor: colors.white, borderRadius: 12, padding: 12 },
  cityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  cityRank: { fontSize: 12, fontWeight: '700', color: colors.gray[400], width: 28 },
  cityName: { fontSize: 13, fontWeight: '600', color: colors.gray[800], width: 80 },
  cityBarWrapper: { flex: 1, height: 8, backgroundColor: colors.gray[100], borderRadius: 4, marginHorizontal: 8, overflow: 'hidden' },
  cityBar: { height: '100%', backgroundColor: colors.saffron[400], borderRadius: 4 },
  cityUsers: { fontSize: 12, fontWeight: '600', color: colors.gray[700], width: 45, textAlign: 'right' },
  cityPct: { fontSize: 11, color: colors.gray[400], width: 36, textAlign: 'right' },
  // Export
  exportRow: { flexDirection: 'row', justifyContent: 'space-between' },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, paddingVertical: 14, borderRadius: 10, marginHorizontal: 4 },
  exportBtnText: { fontSize: 12, fontWeight: '600', color: colors.saffron[600], marginLeft: 6 },
});
