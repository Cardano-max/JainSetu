import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

interface Plan {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  period: string;
  icon: string;
  color: string;
  popular?: boolean;
  features: string[];
  limits: string[];
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Rs. 0',
    priceNum: 0,
    period: 'forever',
    icon: 'person',
    color: colors.gray[500],
    features: [
      'Browse Directory & Events',
      'View 5 Matrimony profiles/day',
      'Search Jobs & Businesses',
      'Basic Panchang & Tirth info',
      'Earn & spend points',
    ],
    limits: [
      'Cannot unlock matrimony contacts',
      'No premium badges',
      'Ads shown',
      'Limited Pachchkan access',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    price: 'Rs. 199',
    priceNum: 199,
    period: '/month',
    icon: 'shield',
    color: colors.blue[500],
    features: [
      'Everything in Free',
      'View 20 Matrimony profiles/day',
      '3 Contact unlocks/month',
      'Priority in Job listings',
      'Ad-free experience',
      'Full Pachchkan library',
    ],
    limits: [
      'Limited contact unlocks',
      'No featured badge',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: 'Rs. 499',
    priceNum: 499,
    period: '/month',
    icon: 'diamond',
    color: colors.saffron[500],
    popular: true,
    features: [
      'Everything in Silver',
      'Unlimited Matrimony views',
      '10 Contact unlocks/month',
      'Featured badge on profile',
      'Priority customer support',
      'Boost listings (2x visibility)',
      'Advanced search filters',
      'Download Pachchkan offline',
    ],
    limits: [
      'Monthly contact unlock limit',
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 'Rs. 999',
    priceNum: 999,
    period: '/year',
    icon: 'star',
    color: colors.purple[500],
    features: [
      'Everything in Gold',
      'Unlimited contact unlocks',
      'VIP badge on profile',
      'Featured in Matrimony search',
      'Dedicated relationship manager',
      'Early access to new features',
      'Family plan (up to 3 members)',
      'Exclusive community events',
      'Priority Tirth booking',
    ],
    limits: [],
  },
];

const COMPARISON = [
  { feature: 'Matrimony Views/Day', free: '5', silver: '20', gold: 'Unlimited', platinum: 'Unlimited' },
  { feature: 'Contact Unlocks/Mo', free: '0', silver: '3', gold: '10', platinum: 'Unlimited' },
  { feature: 'Job Listing Priority', free: 'No', silver: 'Yes', gold: 'Yes', platinum: 'Yes' },
  { feature: 'Profile Badge', free: 'No', silver: 'No', gold: 'Gold', platinum: 'VIP' },
  { feature: 'Ad-Free', free: 'No', silver: 'Yes', gold: 'Yes', platinum: 'Yes' },
  { feature: 'Pachchkan Access', free: '5 tracks', silver: 'Full', gold: 'Full + Offline', platinum: 'Full + Offline' },
  { feature: 'Listing Boost', free: 'No', silver: 'No', gold: '2x', platinum: '5x' },
  { feature: 'Support', free: 'Email', silver: 'Email', gold: 'Priority', platinum: 'Dedicated' },
];

export default function SubscriptionScreen() {
  const [selectedPlan, setSelectedPlan] = useState<string>('gold');
  const [showComparison, setShowComparison] = useState(false);

  const handleSubscribe = () => {
    const plan = PLANS.find((p) => p.id === selectedPlan);
    if (!plan || plan.id === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan.');
      return;
    }
    Alert.alert(
      'Subscribe',
      `Subscribe to ${plan.name} plan for ${plan.price}${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert('Success!', `You are now a ${plan.name} member! Enjoy premium features.`, [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Premium Plans' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="diamond" size={36} color={colors.saffron[500]} />
          </View>
          <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          <Text style={styles.headerSub}>Unlock the full JainSetu experience</Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[styles.planCard, isSelected && styles.planCardSelected, isSelected && { borderColor: plan.color }]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
                    <Ionicons name={plan.icon as any} size={24} color={plan.color} />
                  </View>
                  <View style={styles.planNameCol}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.planPriceRow}>
                      <Text style={[styles.planPrice, { color: plan.color }]}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>{plan.period}</Text>
                    </View>
                  </View>
                  <View style={[styles.radioOuter, isSelected && { borderColor: plan.color }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: plan.color }]} />}
                  </View>
                </View>
                {isSelected && (
                  <View style={styles.planDetails}>
                    {plan.features.map((f, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} />
                        <Text style={styles.featureText}>{f}</Text>
                      </View>
                    ))}
                    {plan.limits.map((l, i) => (
                      <View key={i} style={styles.featureRow}>
                        <Ionicons name="close-circle" size={16} color={colors.gray[400]} />
                        <Text style={[styles.featureText, { color: colors.gray[500] }]}>{l}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Compare Plans */}
        <TouchableOpacity
          style={styles.compareToggle}
          onPress={() => setShowComparison(!showComparison)}
        >
          <Ionicons name="git-compare" size={18} color={colors.saffron[600]} />
          <Text style={styles.compareToggleText}>
            {showComparison ? 'Hide' : 'Show'} Plan Comparison
          </Text>
          <Ionicons name={showComparison ? 'chevron-up' : 'chevron-down'} size={18} color={colors.saffron[600]} />
        </TouchableOpacity>

        {showComparison && (
          <View style={styles.comparisonTable}>
            {/* Table Header */}
            <View style={styles.compRow}>
              <Text style={[styles.compCell, styles.compFeatureCell, styles.compHeaderText]}>Feature</Text>
              <Text style={[styles.compCell, styles.compHeaderText]}>Free</Text>
              <Text style={[styles.compCell, styles.compHeaderText]}>Silver</Text>
              <Text style={[styles.compCell, styles.compHeaderText, { color: colors.saffron[600] }]}>Gold</Text>
              <Text style={[styles.compCell, styles.compHeaderText]}>Plat.</Text>
            </View>
            {COMPARISON.map((row, i) => (
              <View key={i} style={[styles.compRow, i % 2 === 0 && styles.compRowAlt]}>
                <Text style={[styles.compCell, styles.compFeatureCell]} numberOfLines={2}>{row.feature}</Text>
                <Text style={styles.compCell}>{row.free}</Text>
                <Text style={styles.compCell}>{row.silver}</Text>
                <Text style={[styles.compCell, { fontWeight: '600', color: colors.saffron[700] }]}>{row.gold}</Text>
                <Text style={styles.compCell}>{row.platinum}</Text>
              </View>
            ))}
          </View>
        )}

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Can I cancel anytime?</Text>
            <Text style={styles.faqA}>Yes, you can cancel or downgrade your subscription at any time. Your premium features will remain active until the end of the billing period.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>What payment methods are accepted?</Text>
            <Text style={styles.faqA}>We accept UPI, Debit/Credit Cards, Net Banking, and JainSetu Points. You can also use a combination of points and payment.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Is the Platinum plan really yearly?</Text>
            <Text style={styles.faqA}>Yes! The Platinum plan is billed annually at Rs. 999/year, which is a huge saving compared to monthly plans. It includes the most premium features.</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Subscribe Bar */}
      <View style={styles.subscribeBar}>
        <View style={styles.subscribeInfo}>
          <Text style={styles.subscribePlan}>
            {PLANS.find((p) => p.id === selectedPlan)?.name} Plan
          </Text>
          <Text style={styles.subscribePrice}>
            {PLANS.find((p) => p.id === selectedPlan)?.price}
            {PLANS.find((p) => p.id === selectedPlan)?.period}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.subscribeBtn, { backgroundColor: PLANS.find((p) => p.id === selectedPlan)?.color || colors.saffron[600] }]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeBtnText}>
            {selectedPlan === 'free' ? 'Current Plan' : 'Subscribe Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  // Header
  header: { alignItems: 'center', paddingVertical: 24, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.saffron[50], justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.gray[900] },
  headerSub: { fontSize: 14, color: colors.gray[600], marginTop: 4 },
  // Plans
  plansContainer: { padding: 16 },
  planCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', position: 'relative', overflow: 'hidden' },
  planCardSelected: { borderWidth: 2 },
  popularBadge: { position: 'absolute', top: 0, right: 0, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 10 },
  popularText: { fontSize: 10, fontWeight: '700', color: colors.white },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  planIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  planNameCol: { flex: 1, marginLeft: 12 },
  planName: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  planPriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  planPrice: { fontSize: 20, fontWeight: '800' },
  planPeriod: { fontSize: 13, color: colors.gray[500], marginLeft: 2 },
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.gray[300], justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 14, height: 14, borderRadius: 7 },
  planDetails: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureText: { fontSize: 13, color: colors.gray[700], marginLeft: 8, flex: 1 },
  // Compare
  compareToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  compareToggleText: { fontSize: 14, fontWeight: '600', color: colors.saffron[600], marginHorizontal: 6 },
  comparisonTable: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: 12, padding: 12, marginBottom: 16, overflow: 'hidden' },
  compRow: { flexDirection: 'row', paddingVertical: 8 },
  compRowAlt: { backgroundColor: colors.gray[50] },
  compCell: { flex: 1, fontSize: 10, color: colors.gray[700], textAlign: 'center', paddingHorizontal: 2 },
  compFeatureCell: { flex: 1.5, textAlign: 'left', fontWeight: '500' },
  compHeaderText: { fontWeight: '700', fontSize: 11, color: colors.gray[900] },
  // FAQ
  faqSection: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  faqItem: { backgroundColor: colors.white, borderRadius: 10, padding: 14, marginBottom: 8 },
  faqQ: { fontSize: 14, fontWeight: '600', color: colors.gray[800], marginBottom: 6 },
  faqA: { fontSize: 13, color: colors.gray[600], lineHeight: 20 },
  // Subscribe Bar
  subscribeBar: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  subscribeInfo: { flex: 1 },
  subscribePlan: { fontSize: 16, fontWeight: '700', color: colors.gray[900] },
  subscribePrice: { fontSize: 13, color: colors.gray[600], marginTop: 2 },
  subscribeBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10 },
  subscribeBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
