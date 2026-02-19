import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

const DEMO_POSTS = [
  { id: '1', author: 'Rajesh Shah', title: 'Beautiful Darshan at Palitana', excerpt: 'Had an amazing experience visiting Palitana during Paryushan. The 863 temples...', likes: 142, comments: 18, time: '2h ago', category: 'Spiritual' },
  { id: '2', author: 'Nidhi Jain', title: 'Importance of Samayik in Daily Life', excerpt: 'Samayik is one of the most powerful practices in Jain Dharma. Here is why...', likes: 256, comments: 32, time: '5h ago', category: 'Spiritual' },
  { id: '3', author: 'Amit Mehta', title: 'Community Seva Day - Surat Chapter', excerpt: 'Our Surat Jain Sangh organized a massive seva drive. Over 200 volunteers...', likes: 198, comments: 28, time: '1d ago', category: 'Community' },
  { id: '4', author: 'Priya Shah', title: 'Jain Food Festival Highlights', excerpt: 'The annual Jain food festival showcased amazing dishes without onion and garlic...', likes: 312, comments: 45, time: '2d ago', category: 'Events' },
  { id: '5', author: 'Vikram Jain', title: 'My Girnar Yatra Experience', excerpt: 'Climbing the 10,000 steps of Girnar was a life-changing spiritual journey...', likes: 445, comments: 56, time: '3d ago', category: 'Spiritual' },
  { id: '6', author: 'Sangh Committee', title: 'Upcoming Paryushan 2025 Schedule', excerpt: 'The detailed schedule for Paryushan Mahaparva has been announced. Mark your...', likes: 523, comments: 67, time: '4d ago', category: 'Events' },
];

export default function PostsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Posts & Blog' }} />
      <FlatList
        data={DEMO_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>{item.author[0]}</Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{item.author}</Text>
                <Text style={styles.postTime}>{item.time}</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: item.category === 'Spiritual' ? colors.saffron[50] : item.category === 'Events' ? colors.blue[50] : colors.green[400] + '20' }]}>
                <Text style={[styles.categoryText, { color: item.category === 'Spiritual' ? colors.saffron[600] : item.category === 'Events' ? colors.blue[600] : colors.green[600] }]}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postExcerpt} numberOfLines={2}>{item.excerpt}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="heart-outline" size={18} color={colors.gray[500]} />
                <Text style={styles.actionText}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={18} color={colors.gray[500]} />
                <Text style={styles.actionText}>{item.comments}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-social-outline" size={18} color={colors.gray[500]} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="bookmark-outline" size={18} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  listContent: { padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center' },
  authorInitial: { fontSize: 16, fontWeight: '700', color: colors.saffron[600] },
  authorInfo: { flex: 1, marginLeft: 10 },
  authorName: { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  postTime: { fontSize: 12, color: colors.gray[500], marginTop: 1 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 11, fontWeight: '600' },
  postTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900], marginBottom: 6 },
  postExcerpt: { fontSize: 14, color: colors.gray[600], lineHeight: 20, marginBottom: 12 },
  postActions: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  actionText: { fontSize: 13, color: colors.gray[500], marginLeft: 4 },
});
