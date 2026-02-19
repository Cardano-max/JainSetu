import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_PROFILE } from '@/lib/demoData/profile';

type TabType = 'all' | 'earned' | 'spent';

const EARN_OPTIONS = [
  { id: '1', title: 'Daily Login', desc: 'Open app daily', points: 10, icon: 'log-in', color: colors.saffron[500] },
  { id: '2', title: 'Complete Samayik', desc: 'Log your daily samayik', points: 50, icon: 'sunny', color: colors.yellow[500] },
  { id: '3', title: 'Invite Friends', desc: 'Share JainSetu with friends', points: 100, icon: 'people', color: colors.blue[500] },
  { id: '4', title: 'Add Tap Entry', desc: 'Log your fasting activity', points: 25, icon: 'flame', color: colors.red[500] },
  { id: '5', title: 'Write a Review', desc: 'Review a Tirth or Dharamshala', points: 30, icon: 'star', color: colors.green[500] },
  { id: '6', title: 'Create Post', desc: 'Share with the community', points: 15, icon: 'create', color: colors.purple[500] },
  { id: '7', title: 'Refer Business', desc: 'Add a Jain business listing', points: 75, icon: 'storefront', color: colors.teal[500] },
  { id: '8', title: 'Festival Quiz', desc: 'Participate in special quizzes', points: 200, icon: 'trophy', color: colors.pink[500] },
];

export default function WalletScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { points } = DEMO_PROFILE;

  const filteredTx = points.transactions.filter((t) => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Wallet & Points' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceTop}>
            <View style={styles.diamondCircle}>
              <Ionicons name="diamond" size={32} color={colors.saffron[500]} />
            </View>
            <Text style={styles.balanceLabel}>Available Points</Text>
            <Text style={styles.balanceValue}>{points.balance.toLocaleString()}</Text>
            <Text style={styles.balanceRupee}>= Rs. {(points.balance / 10).toFixed(0)}</Text>
          </View>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Ionicons name="arrow-up-circle" size={20} color={colors.green[500]} />
              <Text style={styles.balanceStatValue}>{points.lifetimeEarned.toLocaleString()}</Text>
              <Text style={styles.balanceStatLabel}>Lifetime Earned</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Ionicons name="arrow-down-circle" size={20} color={colors.red[500]} />
              <Text style={styles.balanceStatValue}>{(points.lifetimeEarned - points.balance).toLocaleString()}</Text>
              <Text style={styles.balanceStatLabel}>Total Spent</Text>
            </View>
          </View>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceActionBtn}>
              <Ionicons name="gift" size={18} color={colors.white} />
              <Text style={styles.balanceActionText}>Redeem</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.balanceActionBtn, { backgroundColor: colors.purple[500] }]}
              onPress={() => router.push('/(screens)/subscription')}
            >
              <Ionicons name="diamond" size={18} color={colors.white} />
              <Text style={styles.balanceActionText}>Go Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How to Use Points */}
        <View style={styles.useCard}>
          <Text style={styles.sectionTitle}>How to Use Points</Text>
          <View style={styles.useGrid}>
            <View style={styles.useItem}>
              <Ionicons name="heart-circle" size={24} color={colors.pink[500]} />
              <Text style={styles.useText}>Unlock Matrimony{'\n'}Contacts</Text>
              <Text style={styles.usePoints}>100 pts</Text>
            </View>
            <View style={styles.useItem}>
              <Ionicons name="diamond" size={24} color={colors.purple[500]} />
              <Text style={styles.useText}>Premium{'\n'}Subscription</Text>
              <Text style={styles.usePoints}>500 pts</Text>
            </View>
            <View style={styles.useItem}>
              <Ionicons name="megaphone" size={24} color={colors.blue[500]} />
              <Text style={styles.useText}>Boost{'\n'}Listings</Text>
              <Text style={styles.usePoints}>200 pts</Text>
            </View>
            <View style={styles.useItem}>
              <Ionicons name="storefront" size={24} color={colors.green[500]} />
              <Text style={styles.useText}>Store{'\n'}Discount</Text>
              <Text style={styles.usePoints}>50 pts</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.txSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <View style={styles.txTabs}>
            {(['all', 'earned', 'spent'] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.txTab, activeTab === tab && styles.txTabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.txTabText, activeTab === tab && styles.txTabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {filteredTx.length > 0 ? filteredTx.map((tx) => (
            <View key={tx.id} style={styles.txItem}>
              <View style={[styles.txIcon, { backgroundColor: tx.type === 'earned' ? colors.green[500] + '20' : colors.red[500] + '20' }]}>
                <Ionicons
                  name={tx.type === 'earned' ? 'arrow-up' : 'arrow-down'}
                  size={18}
                  color={tx.type === 'earned' ? colors.green[500] : colors.red[500]}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'earned' ? colors.green[500] : colors.red[500] }]}>
                {tx.type === 'earned' ? '+' : '-'}{tx.amount} pts
              </Text>
            </View>
          )) : (
            <Text style={styles.emptyText}>No transactions found</Text>
          )}
        </View>

        {/* Earn More Points */}
        <View style={styles.earnSection}>
          <Text style={styles.sectionTitle}>Earn More Points</Text>
          <Text style={styles.earnSub}>Complete activities to earn points</Text>
          {EARN_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.id} style={styles.earnItem}>
              <View style={[styles.earnIcon, { backgroundColor: opt.color + '20' }]}>
                <Ionicons name={opt.icon as any} size={22} color={opt.color} />
              </View>
              <View style={styles.earnInfo}>
                <Text style={styles.earnTitle}>{opt.title}</Text>
                <Text style={styles.earnDesc}>{opt.desc}</Text>
              </View>
              <View style={styles.earnBadge}>
                <Text style={styles.earnBadgeText}>+{opt.points}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  // Balance Card
  balanceCard: { backgroundColor: colors.white, margin: 16, borderRadius: 16, overflow: 'hidden' },
  balanceTop: { alignItems: 'center', paddingVertical: 24, backgroundColor: colors.saffron[50] },
  diamondCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  balanceLabel: { fontSize: 14, color: colors.gray[600] },
  balanceValue: { fontSize: 42, fontWeight: '800', color: colors.gray[900], marginTop: 4 },
  balanceRupee: { fontSize: 16, color: colors.saffron[600], fontWeight: '600', marginTop: 2 },
  balanceStats: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 24 },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatValue: { fontSize: 18, fontWeight: '700', color: colors.gray[900], marginTop: 4 },
  balanceStatLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  balanceStatDivider: { width: 1, backgroundColor: colors.gray[200] },
  balanceActions: { flexDirection: 'row', padding: 16, paddingTop: 0 },
  balanceActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, borderRadius: 10, marginHorizontal: 4 },
  balanceActionText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
  // Use Points
  useCard: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  useGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  useItem: { alignItems: 'center', width: '23%' },
  useText: { fontSize: 11, color: colors.gray[600], textAlign: 'center', marginTop: 6, lineHeight: 14 },
  usePoints: { fontSize: 11, fontWeight: '700', color: colors.saffron[600], marginTop: 4 },
  // Transactions
  txSection: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 16, borderRadius: 12, padding: 16 },
  txTabs: { flexDirection: 'row', backgroundColor: colors.gray[100], borderRadius: 8, padding: 3, marginBottom: 16 },
  txTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  txTabActive: { backgroundColor: colors.white },
  txTabText: { fontSize: 13, color: colors.gray[500] },
  txTabTextActive: { color: colors.gray[900], fontWeight: '600' },
  txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txInfo: { flex: 1, marginLeft: 12 },
  txDesc: { fontSize: 14, color: colors.gray[800] },
  txDate: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  txAmount: { fontSize: 15, fontWeight: '700' },
  emptyText: { fontSize: 14, color: colors.gray[400], textAlign: 'center', paddingVertical: 24 },
  // Earn Points
  earnSection: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 24, borderRadius: 12, padding: 16 },
  earnSub: { fontSize: 13, color: colors.gray[500], marginTop: -8, marginBottom: 16 },
  earnItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  earnIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  earnInfo: { flex: 1, marginLeft: 12 },
  earnTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[800] },
  earnDesc: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  earnBadge: { backgroundColor: colors.saffron[50], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  earnBadgeText: { fontSize: 13, fontWeight: '700', color: colors.saffron[600] },
});
