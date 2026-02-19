import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import colors from '@/lib/colors';

const menuSections = [
  {
    title: 'Services',
    items: [
      { id: 'maharaj', title: 'Maharaj Saheb', icon: 'person-circle', color: '#f59e0b' },
      { id: 'jain-news', title: 'Jain News', icon: 'newspaper', color: '#dc2626' },
      { id: 'matrimony', title: 'Matrimony', icon: 'heart-circle', color: '#f43f5e' },
      { id: 'tirth', title: 'Tirth & Dharamshala', icon: 'location', color: '#14b8a6' },
      { id: 'store', title: 'Jain Store', icon: 'cart', color: '#22c55e' },
      { id: 'jobs', title: 'Jobs', icon: 'briefcase', color: '#6366f1' },
      { id: 'pachchkan', title: 'Pachchkan', icon: 'musical-notes', color: '#f59e0b' },
      { id: 'property', title: 'Property', icon: 'home', color: '#7c3aed' },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'posts', title: 'Posts & Blog', icon: 'newspaper', color: '#f97316' },
      { id: 'donations', title: 'Donations', icon: 'heart', color: '#ec4899' },
      { id: 'panchang', title: 'Panchang', icon: 'calendar', color: '#f59e0b' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'profile', title: 'My Profile', icon: 'person', color: '#64748b' },
      { id: 'wallet', title: 'Wallet & Points', icon: 'wallet', color: '#f97316' },
      { id: 'subscription', title: 'Premium Plans', icon: 'diamond', color: '#8b5cf6' },
      { id: 'admin', title: 'Admin Panel', icon: 'shield-checkmark', color: '#dc2626' },
      { id: 'settings', title: 'Settings', icon: 'settings', color: '#6b7280' },
      { id: 'help', title: 'Help & Support', icon: 'help-circle', color: '#3b82f6' },
    ],
  },
];

export default function MoreScreen() {
  const { user, logout } = useAuthStore();

  const handlePress = (id: string) => {
    switch (id) {
      case 'profile':
        router.push('/profile');
        break;
      case 'panchang':
        router.push('/panchang');
        break;
      case 'donations':
        router.push('/donations');
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
      case 'pachchkan':
        router.push('/pachchkan');
        break;
      case 'wallet':
        router.push('/wallet');
        break;
      case 'subscription':
        router.push('/subscription');
        break;
      case 'posts':
        router.push('/posts');
        break;
      case 'maharaj':
        router.push('/maharaj');
        break;
      case 'jain-news':
        router.push('/jain-news');
        break;
      case 'admin':
        router.push('/(screens)/admin-dashboard' as any);
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userPhone}>{user?.phone}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        {/* Menu Sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => handlePress(item.id)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.red[600]} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  userPhone: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[500],
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
    marginLeft: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red[50],
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red[600],
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray[400],
    marginVertical: 24,
  },
});
