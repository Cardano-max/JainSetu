import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_JOBS } from '@/lib/demoData/jobs';

type Tab = 'description' | 'requirements' | 'benefits' | 'company';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const job = DEMO_JOBS.find((j) => j.id === id) || DEMO_JOBS[0];
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (job.contactEmail) {
      Linking.openURL(`mailto:${job.contactEmail}?subject=Application for ${job.title}`);
    } else if (job.contactPhone) {
      Linking.openURL(`tel:${job.contactPhone}`);
    }
    setApplied(true);
    Alert.alert('Applied!', 'Your application has been sent.');
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'benefits', label: 'Benefits' },
    { id: 'company', label: 'Company' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: job.title }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyIcon}><Ionicons name="briefcase" size={32} color={colors.saffron[600]} /></View>
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}><Ionicons name="location" size={14} color={colors.gray[500]} /><Text style={styles.metaText}>{job.location}</Text></View>
            <View style={styles.metaItem}><Ionicons name="time" size={14} color={colors.gray[500]} /><Text style={styles.metaText}>{job.type.replace('-', ' ')}</Text></View>
          </View>
          {job.salary && (
            <View style={styles.salaryCard}>
              <Ionicons name="cash" size={20} color={colors.saffron[600]} />
              <Text style={styles.salaryText}>{job.salary}</Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'description' && (
            <>
              <Text style={styles.bodyText}>{job.description}</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Experience</Text><Text style={styles.infoValue}>{job.experience}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Education</Text><Text style={styles.infoValue}>{job.education || 'Any'}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Work Mode</Text><Text style={styles.infoValue}>{job.workMode || 'Onsite'}</Text></View>
                <View style={styles.infoItem}><Text style={styles.infoLabel}>Openings</Text><Text style={styles.infoValue}>{job.openings || 1}</Text></View>
                {job.deadline && <View style={styles.infoItem}><Text style={styles.infoLabel}>Deadline</Text><Text style={styles.infoValue}>{job.deadline}</Text></View>}
              </View>
            </>
          )}
          {activeTab === 'requirements' && (
            <>
              {job.requirements?.map((r, i) => (
                <View key={i} style={styles.reqRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.saffron[600]} />
                  <Text style={styles.reqText}>{r}</Text>
                </View>
              ))}
              {job.skills && job.skills.length > 0 && (
                <>
                  <Text style={styles.subTitle}>Skills Required</Text>
                  <View style={styles.tagsRow}>
                    {job.skills.map((s, i) => (
                      <View key={i} style={styles.skillTag}><Text style={styles.skillText}>{s}</Text></View>
                    ))}
                  </View>
                </>
              )}
            </>
          )}
          {activeTab === 'benefits' && (
            <>
              {job.benefits && job.benefits.length > 0 ? job.benefits.map((b, i) => (
                <View key={i} style={styles.reqRow}>
                  <Ionicons name="gift" size={16} color={colors.green[500]} />
                  <Text style={styles.reqText}>{b}</Text>
                </View>
              )) : (
                <Text style={styles.emptyText}>No specific benefits listed</Text>
              )}
            </>
          )}
          {activeTab === 'company' && (
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{job.company}</Text>
              {job.industry && <View style={styles.compRow}><Text style={styles.compLabel}>Industry</Text><Text style={styles.compValue}>{job.industry}</Text></View>}
              {job.companySize && <View style={styles.compRow}><Text style={styles.compLabel}>Size</Text><Text style={styles.compValue}>{job.companySize} employees</Text></View>}
              <View style={styles.compRow}><Text style={styles.compLabel}>Location</Text><Text style={styles.compValue}>{job.location}</Text></View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply Bar */}
      <View style={styles.applyBar}>
        <TouchableOpacity style={styles.saveBtn}><Ionicons name="bookmark-outline" size={22} color={colors.saffron[600]} /></TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyBtn, applied && styles.appliedBtn]}
          onPress={applied ? undefined : handleApply}
        >
          <Ionicons name={applied ? 'checkmark' : 'send'} size={20} color={colors.white} />
          <Text style={styles.applyBtnText}>{applied ? 'Applied' : 'Apply Now'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareJobBtn} onPress={() => Share.share({ message: `Check out this job: ${job.title} at ${job.company}` })}>
          <Ionicons name="share-social" size={22} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  header: { backgroundColor: colors.white, alignItems: 'center', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  companyIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.saffron[50], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.gray[900], textAlign: 'center' },
  company: { fontSize: 16, color: colors.gray[600], marginTop: 4 },
  metaRow: { flexDirection: 'row', marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  metaText: { fontSize: 13, color: colors.gray[600], marginLeft: 4, textTransform: 'capitalize' },
  salaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron[50], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginTop: 12 },
  salaryText: { fontSize: 16, fontWeight: '700', color: colors.saffron[600], marginLeft: 8 },
  tabRow: { flexDirection: 'row', marginTop: 16, paddingHorizontal: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginHorizontal: 2, backgroundColor: colors.white },
  tabActive: { backgroundColor: colors.saffron[600] },
  tabText: { fontSize: 12, color: colors.gray[600] },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  content: { backgroundColor: colors.white, margin: 16, borderRadius: 12, padding: 16 },
  bodyText: { fontSize: 14, color: colors.gray[700], lineHeight: 22 },
  infoGrid: { marginTop: 16 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  infoLabel: { fontSize: 13, color: colors.gray[500] },
  infoValue: { fontSize: 14, fontWeight: '500', color: colors.gray[900], textTransform: 'capitalize' },
  subTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[800], marginTop: 16, marginBottom: 8 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reqText: { fontSize: 14, color: colors.gray[700], marginLeft: 10, flex: 1 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  skillTag: { backgroundColor: colors.gray[100], paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  skillText: { fontSize: 13, color: colors.gray[700] },
  emptyText: { fontSize: 14, color: colors.gray[500] },
  companyInfo: { padding: 8 },
  companyName: { fontSize: 18, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  compRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  compLabel: { fontSize: 13, color: colors.gray[500] },
  compValue: { fontSize: 14, fontWeight: '500', color: colors.gray[900] },
  applyBar: { flexDirection: 'row', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  saveBtn: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  applyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, borderRadius: 10, marginRight: 8 },
  appliedBtn: { backgroundColor: colors.green[500] },
  applyBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
  shareJobBtn: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], justifyContent: 'center', alignItems: 'center' },
});
