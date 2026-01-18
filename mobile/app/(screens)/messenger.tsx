import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantPhoto?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  source: 'directory' | 'matrimony' | 'jobs' | 'business' | 'general';
  isOnline?: boolean;
}

// Demo conversations
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participantId: 'user1',
    participantName: 'Rajesh Jain',
    lastMessage: 'Jai Jinendra! I am interested in the business proposal.',
    lastMessageTime: '10:30 AM',
    unreadCount: 2,
    source: 'business',
    isOnline: true,
  },
  {
    id: '2',
    participantId: 'user2',
    participantName: 'Priya Shah',
    lastMessage: 'Thank you for connecting on matrimony.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    source: 'matrimony',
    isOnline: false,
  },
  {
    id: '3',
    participantId: 'user3',
    participantName: 'Amit Mehta',
    lastMessage: 'Is the job position still open?',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
    source: 'jobs',
    isOnline: true,
  },
  {
    id: '4',
    participantId: 'user4',
    participantName: 'Sangh Committee',
    lastMessage: 'Next meeting is scheduled for Sunday.',
    lastMessageTime: 'Mon',
    unreadCount: 0,
    source: 'general',
    isOnline: false,
  },
  {
    id: '5',
    participantId: 'user5',
    participantName: 'Neha Kothari',
    lastMessage: 'Can we discuss the donation campaign?',
    lastMessageTime: 'Sun',
    unreadCount: 3,
    source: 'directory',
    isOnline: true,
  },
];

const SOURCE_COLORS: Record<string, string> = {
  directory: colors.green[500],
  matrimony: colors.pink[500],
  jobs: colors.blue[500],
  business: colors.purple[500],
  general: colors.gray[500],
};

const SOURCE_LABELS: Record<string, string> = {
  directory: 'Directory',
  matrimony: 'Matrimony',
  jobs: 'Jobs',
  business: 'Business',
  general: 'General',
};

export default function MessengerScreen() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fetchConversations = useCallback(async () => {
    try {
      // In production, fetch from API
      // const response = await api.get('/messages/conversations');
      // setConversations(response.conversations);

      // Demo data
      await new Promise(resolve => setTimeout(resolve, 500));
      setConversations(DEMO_CONVERSATIONS);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.participantName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || conv.source === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const handleConversationPress = (conversation: Conversation) => {
    router.push({
      pathname: '/(screens)/chat',
      params: {
        conversationId: conversation.id,
        participantId: conversation.participantId,
        participantName: conversation.participantName,
        participantPhoto: conversation.participantPhoto || '',
      },
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
        {item.participantPhoto ? (
          <Image source={{ uri: item.participantPhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.participantName.charAt(0)}
            </Text>
          </View>
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.participantName} numberOfLines={1}>
            {item.participantName}
          </Text>
          <Text style={styles.timeText}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={[styles.sourceBadge, { backgroundColor: `${SOURCE_COLORS[item.source]}15` }]}>
          <View style={[styles.sourceDot, { backgroundColor: SOURCE_COLORS[item.source] }]} />
          <Text style={[styles.sourceText, { color: SOURCE_COLORS[item.source] }]}>
            {SOURCE_LABELS[item.source]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Messages' }} />
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
          title: 'Messages',
          headerRight: () => (
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color={colors.saffron[600]} />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollableFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          totalUnread={totalUnread}
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Conversations</Text>
            <Text style={styles.emptyText}>
              Start chatting with people from Directory, Matrimony, or Jobs
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function ScrollableFilters({
  selectedFilter,
  onFilterChange,
  totalUnread,
}: {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  totalUnread: number;
}) {
  const filters = [
    { id: 'all', label: 'All', count: totalUnread },
    { id: 'directory', label: 'Directory' },
    { id: 'matrimony', label: 'Matrimony' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'business', label: 'Business' },
  ];

  return (
    <FlatList
      horizontal
      showsHorizontalScrollIndicator={false}
      data={filters}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.filterScroll}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === item.id && styles.filterButtonActive,
          ]}
          onPress={() => onFilterChange(item.id)}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === item.id && styles.filterTextActive,
            ]}
          >
            {item.label}
          </Text>
          {item.count && item.count > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{item.count}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
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
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.gray[900],
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[600],
  },
  filterTextActive: {
    color: colors.white,
  },
  filterBadge: {
    backgroundColor: colors.saffron[500],
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.green[500],
    borderWidth: 2,
    borderColor: colors.white,
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.gray[500],
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[500],
    marginRight: 8,
  },
  unreadMessage: {
    color: colors.gray[700],
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.saffron[600],
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600',
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
