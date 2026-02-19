import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/store';
import colors from '@/lib/colors';
import { DEMO_PROFILE, DEMO_POSTS, DEMO_HIGHLIGHTS } from '@/lib/demoData/profile';

const { width } = Dimensions.get('window');
const POST_SIZE = (width - 4) / 3;

const MENU_ITEMS = [
  {
    section: 'Account',
    items: [
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
      { id: 'wallet', title: 'Wallet & Points', icon: 'wallet-outline' },
      { id: 'subscription', title: 'Subscription Plans', icon: 'diamond-outline' },
    ],
  },
  {
    section: 'Support',
    items: [
      { id: 'help', title: 'Help & FAQ', icon: 'help-circle-outline' },
      { id: 'feedback', title: 'Send Feedback', icon: 'chatbubble-outline' },
      { id: 'about', title: 'About JainSetu', icon: 'information-circle-outline' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'menu'>('posts');
  const profile = DEMO_PROFILE;

  const handleMenuPress = (id: string) => {
    switch (id) {
      case 'edit-profile':
        router.push('/(screens)/edit-profile');
        break;
      case 'wallet':
        router.push('/(screens)/wallet');
        break;
      case 'subscription':
        router.push('/(screens)/subscription');
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
        {/* Cover Photo */}
        <View style={styles.coverPhoto}>
          <View style={styles.coverGradient} />
          <TouchableOpacity style={styles.coverCameraBtn}>
            <Ionicons name="camera" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Profile Header - Overlapping Cover */}
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || profile.firstName[0]}
                {user?.lastName?.[0] || profile.lastName[0]}
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarCameraBtn}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </TouchableOpacity>
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={22} color={colors.blue[500]} />
              </View>
            )}
          </View>

          {/* Name & Bio */}
          <Text style={styles.userName}>
            {user?.firstName || profile.firstName} {user?.lastName || profile.lastName}
          </Text>
          <Text style={styles.userBio}>{profile.bio}</Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.saffron[600]} />
            <Text style={styles.locationText}>
              {user?.city?.name || profile.city} {profile.nativePlace ? `• From ${profile.nativePlace}` : ''}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{profile.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{profile.followersCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem}>
              <Text style={styles.statValue}>{profile.followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push('/(screens)/edit-profile')}
            >
              <Ionicons name="pencil" size={16} color={colors.saffron[600]} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareProfileBtn}>
              <Ionicons name="share-social" size={18} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Story Highlights */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.highlightsContainer}
          contentContainerStyle={styles.highlightsContent}
        >
          {DEMO_HIGHLIGHTS.map((highlight) => (
            <TouchableOpacity key={highlight.id} style={styles.highlightItem}>
              <View style={[styles.highlightCircle, { borderColor: highlight.color }]}>
                <Ionicons name={highlight.icon as any} size={24} color={highlight.color} />
              </View>
              <Text style={styles.highlightTitle}>{highlight.title}</Text>
              <Text style={styles.highlightCount}>{highlight.count}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsLeft}>
            <Ionicons name="diamond" size={24} color={colors.saffron[500]} />
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsBalance}>{profile.points.balance} pts</Text>
              <Text style={styles.pointsValue}>= Rs. {(profile.points.balance / 10).toFixed(0)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.pointsBtn}
            onPress={() => router.push('/(screens)/wallet')}
          >
            <Text style={styles.pointsBtnText}>View Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Dharmik Quick Stats */}
        <View style={styles.dharmikCard}>
          <Text style={styles.sectionTitle}>Dharmik Profile</Text>
          <View style={styles.dharmikRow}>
            <View style={styles.dharmikItem}>
              <Ionicons name="flame" size={20} color={colors.saffron[500]} />
              <Text style={styles.dharmikValue}>{profile.tap.totalFasts}</Text>
              <Text style={styles.dharmikLabel}>Total Tap</Text>
            </View>
            <View style={styles.dharmikItem}>
              <Ionicons name="sunny" size={20} color={colors.yellow[500]} />
              <Text style={styles.dharmikValue}>{profile.tap.currentStreak}</Text>
              <Text style={styles.dharmikLabel}>Day Streak</Text>
            </View>
            <View style={styles.dharmikItem}>
              <Ionicons name="checkmark-done" size={20} color={colors.green[500]} />
              <Text style={styles.dharmikValue}>{profile.dharmik.samayikDaily ? 'Yes' : 'No'}</Text>
              <Text style={styles.dharmikLabel}>Samayik</Text>
            </View>
            <View style={styles.dharmikItem}>
              <Ionicons name="moon" size={20} color={colors.purple[500]} />
              <Text style={styles.dharmikValue}>{profile.dharmik.pratikramanDaily ? 'Yes' : 'No'}</Text>
              <Text style={styles.dharmikLabel}>Pratikraman</Text>
            </View>
          </View>
          <Text style={styles.dharmikSampraday}>
            {profile.dharmik.sampraday} • Guru: {profile.dharmik.guruName}
          </Text>
        </View>

        {/* Tab Switch: Posts / Menu */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Ionicons
              name="grid"
              size={22}
              color={activeTab === 'posts' ? colors.saffron[600] : colors.gray[400]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'menu' && styles.tabItemActive]}
            onPress={() => setActiveTab('menu')}
          >
            <Ionicons
              name="menu"
              size={22}
              color={activeTab === 'menu' ? colors.saffron[600] : colors.gray[400]}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'posts' ? (
          <View style={styles.postsGrid}>
            {DEMO_POSTS.map((post) => (
              <TouchableOpacity key={post.id} style={styles.postItem}>
                <View style={styles.postPlaceholder}>
                  <Ionicons name="image" size={24} color={colors.gray[300]} />
                </View>
                <View style={styles.postOverlay}>
                  <View style={styles.postStat}>
                    <Ionicons name="heart" size={12} color={colors.white} />
                    <Text style={styles.postStatText}>{post.likesCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Menu Sections */
          <View>
            {MENU_ITEMS.map((section) => (
              <View key={section.section} style={styles.menuSection}>
                <Text style={styles.menuSectionTitle}>{section.section}</Text>
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
                      ) : (item as any).value ? (
                        <Text style={styles.menuItemValue}>{(item as any).value}</Text>
                      ) : (
                        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.red[600]} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            <Text style={styles.appVersion}>JainSetu v1.0.0</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  // Not logged in
  notLoggedIn: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  notLoggedInIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.gray[200], justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  notLoggedInTitle: { fontSize: 22, fontWeight: '700', color: colors.gray[900], marginBottom: 8 },
  notLoggedInSubtitle: { fontSize: 14, color: colors.gray[600], textAlign: 'center', marginBottom: 24 },
  loginButton: { backgroundColor: colors.saffron[600], paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  loginButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  // Cover Photo
  coverPhoto: { height: 160, backgroundColor: colors.saffron[400], position: 'relative' },
  coverGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' },
  coverCameraBtn: { position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  // Profile Header
  profileHeader: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginTop: -40 },
  avatarWrapper: { position: 'relative', marginTop: -30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.saffron[500], justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: colors.white },
  avatarText: { fontSize: 36, fontWeight: '700', color: colors.white },
  avatarCameraBtn: { position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.white },
  verifiedBadge: { position: 'absolute', top: 2, right: -4, backgroundColor: colors.white, borderRadius: 12, padding: 1 },
  userName: { fontSize: 24, fontWeight: '700', color: colors.gray[900], marginTop: 12 },
  userBio: { fontSize: 14, color: colors.gray[600], textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  locationText: { fontSize: 13, color: colors.saffron[600], marginLeft: 4 },
  // Stats
  statsRow: { flexDirection: 'row', marginTop: 16, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gray[100], width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.gray[900] },
  statLabel: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.gray[200] },
  // Actions
  actionRow: { flexDirection: 'row', marginTop: 16, width: '100%' },
  editProfileBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.saffron[600], marginRight: 8 },
  editProfileText: { fontSize: 14, fontWeight: '600', color: colors.saffron[600], marginLeft: 6 },
  shareProfileBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], justifyContent: 'center', alignItems: 'center' },
  // Highlights
  highlightsContainer: { marginTop: 16 },
  highlightsContent: { paddingHorizontal: 16 },
  highlightItem: { alignItems: 'center', marginRight: 16, width: 72 },
  highlightCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, marginBottom: 6 },
  highlightTitle: { fontSize: 11, fontWeight: '600', color: colors.gray[700] },
  highlightCount: { fontSize: 10, color: colors.gray[500] },
  // Points Card
  pointsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 12 },
  pointsLeft: { flexDirection: 'row', alignItems: 'center' },
  pointsInfo: { marginLeft: 12 },
  pointsBalance: { fontSize: 18, fontWeight: '700', color: colors.gray[900] },
  pointsValue: { fontSize: 12, color: colors.gray[500] },
  pointsBtn: { backgroundColor: colors.saffron[600], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  pointsBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  // Dharmik Card
  dharmikCard: { backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  dharmikRow: { flexDirection: 'row', justifyContent: 'space-around' },
  dharmikItem: { alignItems: 'center' },
  dharmikValue: { fontSize: 18, fontWeight: '700', color: colors.gray[900], marginTop: 4 },
  dharmikLabel: { fontSize: 10, color: colors.gray[500], marginTop: 2 },
  dharmikSampraday: { fontSize: 12, color: colors.gray[600], textAlign: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  // Tabs
  tabRow: { flexDirection: 'row', marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.gray[200], backgroundColor: colors.white },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: colors.saffron[600] },
  // Posts Grid
  postsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  postItem: { width: POST_SIZE, height: POST_SIZE, position: 'relative' },
  postPlaceholder: { flex: 1, backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center', margin: 1 },
  postOverlay: { position: 'absolute', bottom: 4, left: 4, flexDirection: 'row' },
  postStat: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  postStatText: { color: colors.white, fontSize: 10, marginLeft: 3 },
  // Menu sections
  menuSection: { marginTop: 20, paddingHorizontal: 16 },
  menuSectionTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[500], marginBottom: 8, marginLeft: 4 },
  menuList: { backgroundColor: colors.white, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  menuItemLast: { borderBottomWidth: 0 },
  menuItemIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center' },
  menuItemTitle: { flex: 1, fontSize: 15, color: colors.gray[900], marginLeft: 12 },
  menuItemValue: { fontSize: 14, color: colors.gray[500] },
  // Logout
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.red[500] + '30' },
  logoutButtonText: { fontSize: 16, fontWeight: '600', color: colors.red[600], marginLeft: 8 },
  appVersion: { fontSize: 12, color: colors.gray[400], textAlign: 'center', marginVertical: 24 },
});
