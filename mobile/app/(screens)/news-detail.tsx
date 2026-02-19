import { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert, Share,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_NEWS, DEMO_NEWS_COMMENTS } from '@/lib/demoData/news';
import type { ReactionCode, NewsReaction, NewsComment } from '@/lib/types/news';

const REACTIONS: { code: ReactionCode; emoji: string; label: string }[] = [
  { code: 'LIKE', emoji: '\uD83D\uDC4D', label: 'Like' },
  { code: 'NAMASTE', emoji: '\uD83D\uDE4F', label: 'Namaste' },
  { code: 'THANKYOU', emoji: '\uD83D\uDC90', label: 'Thank You' },
  { code: 'CRYING', emoji: '\uD83D\uDE22', label: 'Crying' },
  { code: 'HAPPY', emoji: '\uD83D\uDE00', label: 'Happy' },
];

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return dateStr;
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'spiritual': return colors.purple[500];
    case 'community': return colors.blue[500];
    case 'events': return colors.saffron[600];
    case 'education': return colors.green[500];
    case 'national': return colors.red[500];
    case 'breaking': return colors.red[600];
    default: return colors.gray[500];
  }
}

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const article = DEMO_NEWS.find((a) => a.id === id) || DEMO_NEWS[0];

  const [selectedReaction, setSelectedReaction] = useState<ReactionCode | null>(null);
  const [reactions, setReactions] = useState<NewsReaction[]>(article.reactions);
  const [isLiked, setIsLiked] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<NewsComment[]>(DEMO_NEWS_COMMENTS);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const scrollRef = useRef<ScrollView>(null);
  const commentsYRef = useRef(0);

  const handleReaction = (code: ReactionCode) => {
    setReactions((prev) =>
      prev.map((r) => {
        if (r.code === code) {
          if (selectedReaction === code) {
            return { ...r, count: r.count - 1 };
          }
          return { ...r, count: r.count + 1 };
        }
        if (r.code === selectedReaction) {
          return { ...r, count: r.count - 1 };
        }
        return r;
      })
    );
    setSelectedReaction(selectedReaction === code ? null : code);
  };

  const handleShareWhatsAppStatus = () => {
    setShareModalVisible(false);
    const url = `whatsapp://send?text=${encodeURIComponent(`${article.title}\n\nRead more on JainSetu App`)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp is not installed'));
  };

  const handleShareWhatsAppChat = () => {
    setShareModalVisible(false);
    const url = `whatsapp://send?text=${encodeURIComponent(`${article.title}\n\n${article.summary}\n\nRead more on JainSetu App`)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp is not installed'));
  };

  const handleCopyLink = () => {
    setShareModalVisible(false);
    Alert.alert('Copied!', 'Link copied to clipboard');
  };

  const handleShareMore = async () => {
    setShareModalVisible(false);
    try {
      await Share.share({
        message: `${article.title}\n\n${article.summary}\n\nRead more on JainSetu App`,
      });
    } catch (_) {
      // user cancelled
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: NewsComment = {
      id: `new-${Date.now()}`,
      userId: 'me',
      userName: 'You',
      text: commentText.trim(),
      likesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const liked = likedComments.has(commentId);
          return { ...c, likesCount: liked ? c.likesCount - 1 : c.likesCount + 1 };
        }
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === commentId) {
                const liked = likedComments.has(commentId);
                return { ...r, likesCount: liked ? r.likesCount - 1 : r.likesCount + 1 };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
  };

  const scrollToComments = () => {
    scrollRef.current?.scrollTo({ y: commentsYRef.current, animated: true });
  };

  const renderComment = (comment: NewsComment, isReply = false) => (
    <View key={comment.id} style={[styles.commentItem, isReply && styles.commentReply]}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>
          {comment.userName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{comment.userName}</Text>
          <Text style={styles.commentTime}>{getTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <TouchableOpacity
          style={styles.commentLikeBtn}
          onPress={() => handleLikeComment(comment.id)}
        >
          <Ionicons
            name={likedComments.has(comment.id) ? 'heart' : 'heart-outline'}
            size={14}
            color={likedComments.has(comment.id) ? colors.red[500] : colors.gray[400]}
          />
          <Text style={[
            styles.commentLikeCount,
            likedComments.has(comment.id) && { color: colors.red[500] },
          ]}>
            {comment.likesCount + (likedComments.has(comment.id) ? 1 : 0)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'News' }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
          {/* Image Placeholder */}
          <View style={styles.imagePlaceholder}>
            <Ionicons name="newspaper" size={56} color={colors.gray[400]} />
            <Text style={styles.imagePlaceholderText}>News Image</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            {article.isBreaking && (
              <View style={[styles.badge, { backgroundColor: colors.red[500] }]}>
                <Ionicons name="flash" size={12} color={colors.white} />
                <Text style={styles.badgeText}>BREAKING</Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: getCategoryColor(article.category) }]}>
              <Text style={styles.badgeText}>{article.category.toUpperCase()}</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.articleHeader}>
            <Text style={styles.title}>{article.title}</Text>
            {article.titleGu && (
              <Text style={styles.titleGu}>{article.titleGu}</Text>
            )}
          </View>

          {/* Author + Date Row */}
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Ionicons name="person" size={14} color={colors.saffron[600]} />
              </View>
              <Text style={styles.authorName}>{article.author}</Text>
              {article.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={styles.dateText}>{getTimeAgo(article.publishedAt)}</Text>
          </View>

          {/* Content */}
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{article.content}</Text>
          </View>

          {/* Reaction Bar */}
          <View style={styles.reactionBar}>
            {reactions.map((reaction) => (
              <TouchableOpacity
                key={reaction.code}
                style={[
                  styles.reactionItem,
                  selectedReaction === reaction.code && styles.reactionItemActive,
                ]}
                onPress={() => handleReaction(reaction.code)}
              >
                <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                <Text style={[
                  styles.reactionCount,
                  selectedReaction === reaction.code && styles.reactionCountActive,
                ]}>
                  {formatCount(reaction.count)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              {formatCount(reactions.reduce((sum, r) => sum + r.count, 0))} reactions
            </Text>
            <Text style={styles.statsDot}> </Text>
            <Text style={styles.statsText}>{comments.length} comments</Text>
            <Text style={styles.statsDot}> </Text>
            <Text style={styles.statsText}>{formatCount(article.sharesCount)} shares</Text>
          </View>

          {/* Comments Section */}
          <View
            style={styles.commentsSection}
            onLayout={(e) => { commentsYRef.current = e.nativeEvent.layout.y; }}
          >
            <Text style={styles.commentsSectionTitle}>
              Comments ({comments.length})
            </Text>

            {/* Add Comment */}
            <View style={styles.addCommentRow}>
              <View style={styles.addCommentAvatar}>
                <Ionicons name="person" size={16} color={colors.saffron[600]} />
              </View>
              <TextInput
                style={styles.addCommentInput}
                placeholder="Write a comment..."
                placeholderTextColor={colors.gray[400]}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={commentText.trim() ? colors.saffron[600] : colors.gray[300]}
                />
              </TouchableOpacity>
            </View>

            {/* Comment List */}
            {comments.map((comment) => (
              <View key={comment.id}>
                {renderComment(comment)}
                {comment.replies && comment.replies.map((reply) => renderComment(reply, true))}
              </View>
            ))}
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomAction}
          onPress={() => setIsLiked(!isLiked)}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? colors.red[500] : colors.gray[600]}
          />
          <Text style={[styles.bottomActionText, isLiked && { color: colors.red[500] }]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomAction} onPress={scrollToComments}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.gray[600]} />
          <Text style={styles.bottomActionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomAction} onPress={() => setShareModalVisible(true)}>
          <Ionicons name="share-social-outline" size={22} color={colors.gray[600]} />
          <Text style={styles.bottomActionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShareModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Share Article</Text>

            <TouchableOpacity style={styles.shareOption} onPress={handleShareWhatsAppStatus}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#25D366' }]}>
                <Ionicons name="logo-whatsapp" size={22} color={colors.white} />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Share to WhatsApp Status</Text>
                <Text style={styles.shareOptionSub}>Post to your WhatsApp status</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleShareWhatsAppChat}>
              <View style={[styles.shareOptionIcon, { backgroundColor: '#25D366' }]}>
                <Ionicons name="chatbubble" size={20} color={colors.white} />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Share to WhatsApp Chat</Text>
                <Text style={styles.shareOptionSub}>Send to a person or group</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleCopyLink}>
              <View style={[styles.shareOptionIcon, { backgroundColor: colors.gray[500] }]}>
                <Ionicons name="copy" size={20} color={colors.white} />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Copy Link</Text>
                <Text style={styles.shareOptionSub}>Copy article link to clipboard</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={handleShareMore}>
              <View style={[styles.shareOptionIcon, { backgroundColor: colors.blue[500] }]}>
                <Ionicons name="share-social" size={20} color={colors.white} />
              </View>
              <View style={styles.shareOptionInfo}>
                <Text style={styles.shareOptionTitle}>Share More...</Text>
                <Text style={styles.shareOptionSub}>Share via other apps</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.gray[400]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },

  // Image Placeholder
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: { fontSize: 14, color: colors.gray[400], marginTop: 8 },

  // Badges
  badgeRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700', marginLeft: 2 },

  // Article Header
  articleHeader: { paddingHorizontal: 16, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: colors.gray[900], lineHeight: 30 },
  titleGu: { fontSize: 16, color: colors.gray[600], marginTop: 6, lineHeight: 24 },

  // Author Row
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorName: { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  dateText: { fontSize: 12, color: colors.gray[500] },

  // Content Card
  contentCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  contentText: { fontSize: 15, color: colors.gray[700], lineHeight: 24 },

  // Reaction Bar
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
  },
  reactionItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray[200],
    minWidth: 60,
  },
  reactionItemActive: {
    borderColor: colors.saffron[500],
    backgroundColor: colors.saffron[50],
  },
  reactionEmoji: { fontSize: 20 },
  reactionCount: { fontSize: 11, color: colors.gray[500], marginTop: 2, fontWeight: '500' },
  reactionCountActive: { color: colors.saffron[700], fontWeight: '700' },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statsText: { fontSize: 12, color: colors.gray[500] },
  statsDot: { fontSize: 12, color: colors.gray[300], marginHorizontal: 6 },

  // Comments Section
  commentsSection: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  commentsSectionTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },

  // Add Comment
  addCommentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  addCommentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addCommentInput: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[800],
    maxHeight: 80,
    paddingVertical: 4,
  },
  sendBtn: { padding: 6 },
  sendBtnDisabled: { opacity: 0.5 },

  // Comment Item
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentReply: {
    marginLeft: 42,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: { fontSize: 14, fontWeight: '700', color: colors.saffron[700] },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentName: { fontSize: 13, fontWeight: '600', color: colors.gray[800] },
  commentTime: { fontSize: 11, color: colors.gray[400] },
  commentText: { fontSize: 14, color: colors.gray[700], marginTop: 4, lineHeight: 20 },
  commentLikeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  commentLikeCount: { fontSize: 12, color: colors.gray[400], marginLeft: 4 },

  // Bottom Action Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingVertical: 8,
  },
  bottomAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  bottomActionText: { fontSize: 11, color: colors.gray[600], marginTop: 2 },

  // Share Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900], marginBottom: 16 },

  // Share Options
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  shareOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  shareOptionInfo: { flex: 1 },
  shareOptionTitle: { fontSize: 15, fontWeight: '600', color: colors.gray[800] },
  shareOptionSub: { fontSize: 12, color: colors.gray[500], marginTop: 2 },

  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: colors.gray[600] },
});
