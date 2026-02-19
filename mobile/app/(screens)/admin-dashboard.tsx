import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

interface StatCard {
  id: string;
  title: string;
  value: number;
  icon: string;
  color: string;
  route?: string;
  urgent?: number;
}

const STATS: StatCard[] = [
  { id: 'pending-news', title: 'Pending News', value: 8, icon: 'newspaper', color: colors.red[500], route: '/(screens)/admin-news', urgent: 3 },
  { id: 'pending-business', title: 'Pending Businesses', value: 5, icon: 'storefront', color: colors.purple[500], route: '/(screens)/admin-business', urgent: 2 },
  { id: 'maharaj-updates', title: 'Maharaj Outdated', value: 3, icon: 'person-circle', color: colors.saffron[500], route: '/(screens)/admin-maharaj' },
  { id: 'total-users', title: 'Total Users', value: 12450, icon: 'people', color: colors.blue[500] },
  { id: 'active-today', title: 'Active Today', value: 1823, icon: 'pulse', color: colors.green[500] },
  { id: 'total-news', title: 'Published News', value: 156, icon: 'document-text', color: colors.teal[500] },
];

const RECENT_ACTIVITY = [
  { id: '1', action: 'New business listing submitted', user: 'Rajesh Shah', time: '5 min ago', icon: 'storefront', color: colors.purple[500] },
  { id: '2', action: 'News article pending review', user: 'Nidhi Jain', time: '12 min ago', icon: 'newspaper', color: colors.red[500] },
  { id: '3', action: 'Maharaj location updated', user: 'Seva Admin', time: '1 hour ago', icon: 'location', color: colors.saffron[500] },
  { id: '4', action: 'New user registered', user: 'Amit Mehta', time: '2 hours ago', icon: 'person-add', color: colors.blue[500] },
  { id: '5', action: 'Business listing approved', user: 'Admin', time: '3 hours ago', icon: 'checkmark-circle', color: colors.green[500] },
  { id: '6', action: 'News article rejected', user: 'Admin', time: '4 hours ago', icon: 'close-circle', color: colors.red[500] },
  { id: '7', action: 'Matrimony profile reported', user: 'Anonymous', time: '5 hours ago', icon: 'flag', color: colors.yellow[500] },
];

const ADMIN_MODULES = [
  { id: 'news', title: 'News Management', desc: 'Review, approve, reject articles', icon: 'newspaper', color: colors.red[500], route: '/(screens)/admin-news', badge: 8 },
  { id: 'business', title: 'Business Listings', desc: 'Verify and manage business listings', icon: 'storefront', color: colors.purple[500], route: '/(screens)/admin-business', badge: 5 },
  { id: 'maharaj', title: 'Maharaj Saheb', desc: 'Update locations, planner, events', icon: 'person-circle', color: colors.saffron[500], route: '/(screens)/admin-maharaj', badge: 3 },
  { id: 'users', title: 'User Management', desc: 'View and manage user accounts', icon: 'people', color: colors.blue[500], route: '/(screens)/admin-users' },
  { id: 'matrimony', title: 'Matrimony Profiles', desc: 'Verify and moderate profiles', icon: 'heart-circle', color: colors.pink[500], route: '/(screens)/admin-matrimony' },
  { id: 'panchang', title: 'Panchang Data', desc: 'Add and update daily panchang', icon: 'calendar', color: colors.yellow[500], route: '/(screens)/admin-panchang' },
  { id: 'reports', title: 'Reports & Analytics', desc: 'View app usage and analytics', icon: 'bar-chart', color: colors.green[500], route: '/(screens)/admin-reports' },
];

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Admin Panel' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={28} color={colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSub}>Manage JainSetu App</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <TouchableOpacity
              key={stat.id}
              style={styles.statCard}
              onPress={() => stat.route ? router.push(stat.route as any) : Alert.alert('Coming Soon', 'This section is under development.')}
            >
              <View style={styles.statTop}>
                <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                </View>
                {stat.urgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>{stat.urgent} new</Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Modules</Text>
          {ADMIN_MODULES.map((mod) => (
            <TouchableOpacity
              key={mod.id}
              style={styles.moduleCard}
              onPress={() => mod.route ? router.push(mod.route as any) : Alert.alert('Coming Soon', 'This module is under development.')}
            >
              <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
                <Ionicons name={mod.icon as any} size={24} color={mod.color} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleDesc}>{mod.desc}</Text>
              </View>
              {mod.badge ? (
                <View style={[styles.moduleBadge, { backgroundColor: mod.color }]}>
                  <Text style={styles.moduleBadgeText}>{mod.badge}</Text>
                </View>
              ) : (
                <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {RECENT_ACTIVITY.map((item, index) => (
              <View key={item.id} style={[styles.activityItem, index === RECENT_ACTIVITY.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.activityIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityAction}>{item.action}</Text>
                  <Text style={styles.activityMeta}>{item.user} · {item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats Bar */}
        <View style={styles.quickBar}>
          <TouchableOpacity style={styles.quickBarItem}>
            <Ionicons name="today" size={20} color={colors.saffron[600]} />
            <Text style={styles.quickBarText}>Today's Report</Text>
          </TouchableOpacity>
          <View style={styles.quickBarDivider} />
          <TouchableOpacity style={styles.quickBarItem}>
            <Ionicons name="download" size={20} color={colors.saffron[600]} />
            <Text style={styles.quickBarText}>Export Data</Text>
          </TouchableOpacity>
          <View style={styles.quickBarDivider} />
          <TouchableOpacity style={styles.quickBarItem}>
            <Ionicons name="settings" size={20} color={colors.saffron[600]} />
            <Text style={styles.quickBarText}>Settings</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: colors.saffron[600], borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, paddingTop: 16 },
  statCard: { width: '47%', backgroundColor: colors.white, borderRadius: 12, padding: 14, margin: '1.5%' },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  urgentBadge: { backgroundColor: colors.red[500], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  urgentText: { fontSize: 10, fontWeight: '700', color: colors.white },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.gray[900] },
  statTitle: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  // Sections
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  // Modules
  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  moduleIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  moduleInfo: { flex: 1, marginLeft: 12 },
  moduleTitle: { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  moduleDesc: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  moduleBadge: { minWidth: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  moduleBadgeText: { fontSize: 12, fontWeight: '700', color: colors.white },
  // Activity
  activityList: { backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden' },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  activityIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1, marginLeft: 10 },
  activityAction: { fontSize: 13, color: colors.gray[800] },
  activityMeta: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  // Quick Bar
  quickBar: { flexDirection: 'row', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 4 },
  quickBarItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  quickBarText: { fontSize: 12, fontWeight: '600', color: colors.saffron[600], marginLeft: 6 },
  quickBarDivider: { width: 1, backgroundColor: colors.gray[200], marginVertical: 8 },
});
