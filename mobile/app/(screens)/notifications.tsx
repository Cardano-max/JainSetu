import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

interface Notification {
  id: string;
  type: 'message' | 'event' | 'matrimony' | 'job' | 'donation' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'Rajesh Jain sent you a message',
    time: '2 min ago',
    read: false,
    link: 'messenger',
  },
  {
    id: '2',
    type: 'event',
    title: 'Upcoming Event',
    message: 'Paryushan Mahaparv starts in 3 days',
    time: '1 hour ago',
    read: false,
    link: 'events',
  },
  {
    id: '3',
    type: 'matrimony',
    title: 'Profile Match',
    message: 'You have 2 new profile matches',
    time: '3 hours ago',
    read: false,
    link: 'matrimony',
  },
  {
    id: '4',
    type: 'job',
    title: 'Job Application',
    message: 'Your application for Accountant position was viewed',
    time: 'Yesterday',
    read: true,
    link: 'jobs',
  },
  {
    id: '5',
    type: 'donation',
    title: 'Donation Campaign',
    message: 'Temple renovation fund reached 50% goal',
    time: '2 days ago',
    read: true,
    link: 'donations',
  },
  {
    id: '6',
    type: 'general',
    title: 'Welcome to JainSetu!',
    message: 'Complete your profile to get personalized recommendations',
    time: '1 week ago',
    read: true,
    link: 'profile',
  },
];

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  message: { icon: 'chatbubble', color: colors.blue[500] },
  event: { icon: 'calendar', color: colors.purple[500] },
  matrimony: { icon: 'heart-circle', color: colors.pink[500] },
  job: { icon: 'briefcase', color: colors.green[500] },
  donation: { icon: 'heart', color: colors.red[500] },
  general: { icon: 'information-circle', color: colors.saffron[500] },
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // In production, fetch from API
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(DEMO_NOTIFICATIONS);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    // Navigate based on type
    if (notification.link) {
      switch (notification.link) {
        case 'messenger':
          router.push('/(screens)/messenger');
          break;
        case 'events':
          router.push('/(tabs)/events');
          break;
        case 'matrimony':
          router.push('/(screens)/matrimony');
          break;
        case 'jobs':
          router.push('/(screens)/jobs');
          break;
        case 'donations':
          router.push('/(screens)/donations');
          break;
        case 'profile':
          router.push('/(screens)/profile');
          break;
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const typeConfig = TYPE_ICONS[item.type];

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${typeConfig.color}15` }]}>
          <Ionicons name={typeConfig.icon as any} size={24} color={typeConfig.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Notifications' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerRight: () =>
            unreadCount > 0 ? (
              <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyText}>
              You're all caught up! Check back later.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 13,
    color: colors.saffron[600],
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  unreadItem: {
    backgroundColor: colors.saffron[50],
    borderLeftWidth: 3,
    borderLeftColor: colors.saffron[500],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  unreadTitle: {
    fontWeight: '600',
    color: colors.gray[900],
  },
  time: {
    fontSize: 11,
    color: colors.gray[400],
  },
  message: {
    fontSize: 13,
    color: colors.gray[600],
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.saffron[500],
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
