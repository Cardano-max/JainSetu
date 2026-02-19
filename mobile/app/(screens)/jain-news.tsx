import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { DEMO_NEWS } from '@/lib/demoData/news';
import type { NewsArticle, ReactionCode } from '@/lib/types/news';

const CATEGORIES = ['All', 'Breaking', 'Spiritual', 'Community', 'Events', 'Education', 'National'];

const CATEGORY_COLORS: Record<string, string> = {
  breaking: colors.red[500],
  spiritual: colors.saffron[600],
  community: colors.green[500],
  events: colors.blue[500],
  education: colors.purple[500],
  national: colors.teal[500],
};

function formatCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return count.toString();
}

function getRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function JainNewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchNews = useCallback(async () => {
    try {
      const response = await api.get('/news');
      setArticles(response?.articles || []);
    } catch {
      setArticles(DEMO_NEWS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filtered = articles.filter((article) => {
    const matchCategory =
      selectedCategory === 'All' ||
      article.category === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Breaking' && article.isBreaking);
    const matchSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleShare = async (article: NewsArticle) => {
    try {
      await Share.share({
        message: `${article.title}\n\n${article.summary}\n\nRead more on JainSetu`,
      });
    } catch {
      // User cancelled or error
    }
  };

  const getTopReactions = (article: NewsArticle) => {
    return [...article.reactions]
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  const getTotalReactions = (article: NewsArticle) => {
    return article.reactions.reduce((sum, r) => sum + r.count, 0);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Jain News' }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Jain News' }} />

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.gray[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search news, topics, authors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray[400]}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category && styles.filterTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const topReactions = getTopReactions(item);
          const totalReactions = getTotalReactions(item);
          const categoryColor = CATEGORY_COLORS[item.category] || colors.gray[500];

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(screens)/news-detail',
                  params: { id: item.id },
                })
              }
            >
              {/* Image Placeholder */}
              <View style={styles.imagePlaceholder}>
                <Ionicons name="newspaper-outline" size={40} color={colors.gray[400]} />

                {/* Breaking Badge */}
                {item.isBreaking && (
                  <View style={styles.breakingBadge}>
                    <Ionicons name="flash" size={10} color={colors.white} />
                    <Text style={styles.breakingText}>BREAKING</Text>
                  </View>
                )}

                {/* Category Badge */}
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: categoryColor + '20' },
                  ]}
                >
                  <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardSummary} numberOfLines={2}>
                  {item.summary}
                </Text>

                {/* Author + Date Row */}
                <View style={styles.authorRow}>
                  <View style={styles.authorInfo}>
                    <Ionicons name="person-circle-outline" size={16} color={colors.gray[400]} />
                    <Text style={styles.authorName}>{item.author}</Text>
                  </View>
                  <Text style={styles.dateText}>{getRelativeDate(item.publishedAt)}</Text>
                  {item.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color={colors.green[500]}
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>

                {/* Reaction Bar */}
                {topReactions.length > 0 && (
                  <View style={styles.reactionBar}>
                    <View style={styles.reactionEmojis}>
                      {topReactions.map((reaction, index) => (
                        <Text key={reaction.code} style={styles.reactionItem}>
                          {reaction.emoji} {formatCount(reaction.count)}
                          {index < topReactions.length - 1 ? '  |  ' : ''}
                        </Text>
                      ))}
                    </View>
                    <Text style={styles.totalReactions}>
                      {formatCount(totalReactions)} reactions
                    </Text>
                  </View>
                )}

                {/* Action Row */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="heart-outline" size={18} color={colors.gray[500]} />
                    <Text style={styles.actionText}>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={18} color={colors.gray[500]} />
                    <Text style={styles.actionText}>{item.commentsCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleShare(item)}
                  >
                    <Ionicons name="share-social-outline" size={18} color={colors.gray[500]} />
                    <Text style={styles.actionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Ionicons name="bookmark-outline" size={18} color={colors.gray[500]} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNews();
            }}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="newspaper-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No news articles found</Text>
          </View>
        }
      />

      {/* FAB - Submit News */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          Alert.alert(
            'Submit News',
            'Your news article will be submitted for admin review before publishing.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Submit',
                onPress: () =>
                  Alert.alert('Coming Soon', 'News submission will be available in the next update.'),
              },
            ],
          )
        }
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: colors.gray[500], marginTop: 16 },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: colors.gray[900] },

  // Category Filters
  filterScroll: { marginTop: 12, maxHeight: 46 },
  filterContent: { paddingHorizontal: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterChipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  filterText: { fontSize: 13, color: colors.gray[700] },
  filterTextActive: { color: colors.white, fontWeight: '600' },

  // News List
  list: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },

  // Image Placeholder
  imagePlaceholder: {
    height: 180,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  breakingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  breakingText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
    marginLeft: 3,
    letterSpacing: 0.5,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: '600' },

  // Card Content
  cardContent: { padding: 14 },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 6,
    lineHeight: 22,
  },
  cardSummary: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
    marginBottom: 10,
  },

  // Author + Date
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorName: { fontSize: 12, color: colors.gray[500], marginLeft: 4 },
  dateText: { fontSize: 12, color: colors.gray[400] },
  verifiedIcon: { marginLeft: 4 },

  // Reaction Bar
  reactionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  reactionEmojis: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  reactionItem: { fontSize: 12, color: colors.gray[600] },
  totalReactions: { fontSize: 11, color: colors.gray[400] },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: { fontSize: 13, color: colors.gray[500], marginLeft: 4 },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.saffron[600],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
