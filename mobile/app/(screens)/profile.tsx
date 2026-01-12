import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/store';
import colors from '@/lib/colors';

const MENU_ITEMS = [
  {
    section: 'Account',
    items: [
      { id: 'edit-profile', title: 'Edit Profile', icon: 'person-outline' },
      { id: 'my-family', title: 'My Family Members', icon: 'people-outline' },
      { id: 'change-phone', title: 'Change Phone Number', icon: 'call-outline' },
      { id: 'verify-email', title: 'Verify Email', icon: 'mail-outline' },
    ],
  },
  {
    section: 'My Activity',
    items: [
      { id: 'my-events', title: 'My Event Registrations', icon: 'calendar-outline' },
      { id: 'my-donations', title: 'My Donations', icon: 'heart-outline' },
      { id: 'my-orders', title: 'My Orders', icon: 'bag-outline' },
      { id: 'my-bookmarks', title: 'Saved Items', icon: 'bookmark-outline' },
    ],
  },
  {
    section: 'My Listings',
    items: [
      { id: 'my-business', title: 'My Business Listing', icon: 'storefront-outline' },
      { id: 'my-matrimony', title: 'My Matrimony Profile', icon: 'heart-circle-outline' },
      { id: 'my-jobs', title: 'My Job Posts', icon: 'briefcase-outline' },
    ],
  },
  {
    section: 'Settings',
    items: [
      { id: 'notifications', title: 'Notification Settings', icon: 'notifications-outline' },
      { id: 'privacy', title: 'Privacy Settings', icon: 'shield-outline' },
      { id: 'language', title: 'Language', icon: 'language-outline', value: 'English' },
    ],
  },
  {
    section: 'Support',
    items: [
      { id: 'help', title: 'Help & FAQ', icon: 'help-circle-outline' },
      { id: 'feedback', title: 'Send Feedback', icon: 'chatbubble-outline' },
      { id: 'about', title: 'About JainSetu', icon: 'information-circle-outline' },
      { id: 'terms', title: 'Terms & Conditions', icon: 'document-text-outline' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'edit-profile':
        router.push('/(screens)/edit-profile');
        break;
      case 'notifications':
        // Toggle notifications
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is under development.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Profile' }} />
        <View style={styles.notLoggedIn}>
          <View style={styles.notLoggedInIcon}>
            <Ionicons name="person" size={48} color={colors.gray[400]} />
          </View>
          <Text style={styles.notLoggedInTitle}>Welcome to JainSetu</Text>
          <Text style={styles.notLoggedInSubtitle}>
            Login to access your profile and personalized features
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginButtonText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Profile' }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || 'J'}
                {user?.lastName?.[0] || 'S'}
              </Text>
            </View>
            {user?.isProfileVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.green[500]} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userPhone}>+91 {user?.phone}</Text>
          {user?.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.saffron[600]} />
              <Text style={styles.locationText}>{user.city.name}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={16} color={colors.saffron[600]} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {MENU_ITEMS.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuList}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => handleMenuPress(item.id)}
                >
                  <View style={styles.menuItemIcon}>
                    <Ionicons name={item.icon as any} size={20} color={colors.gray[600]} />
                  </View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  {item.id === 'notifications' ? (
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: colors.gray[300], true: colors.saffron[300] }}
                      thumbColor={notificationsEnabled ? colors.saffron[600] : colors.gray[400]}
                    />
                  ) : item.value ? (
                    <Text style={styles.menuItemValue}>{item.value}</Text>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.red[600]} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.appVersion}>JainSetu v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.saffron[50],
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notLoggedInIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notLoggedInTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: colors.saffron[600],
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.saffron[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
    marginTop: 16,
  },
  userPhone: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.saffron[600],
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  editButtonText: {
    fontSize: 14,
    color: colors.saffron[600],
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[200],
  },
  menuSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[500],
    marginBottom: 8,
    marginLeft: 4,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 15,
    color: colors.gray[900],
    marginLeft: 12,
  },
  menuItemValue: {
    fontSize: 14,
    color: colors.gray[500],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red[600],
    marginLeft: 8,
  },
  appVersion: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginVertical: 24,
  },
});
