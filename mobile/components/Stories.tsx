import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

const { width, height } = Dimensions.get('window');

interface Story {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  viewed: boolean;
}

interface StoryUser {
  id: string;
  name: string;
  photo?: string;
  hasUnviewedStory: boolean;
  stories: Story[];
}

// Demo stories data
const DEMO_STORIES: StoryUser[] = [
  {
    id: '1',
    name: 'Mahavir Ji',
    hasUnviewedStory: true,
    stories: [
      {
        id: 's1',
        userId: '1',
        userName: 'Mahavir Ji',
        imageUrl: 'https://picsum.photos/400/700?random=1',
        caption: 'Jai Jinendra 🙏',
        createdAt: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
  {
    id: '2',
    name: 'Palitana',
    hasUnviewedStory: true,
    stories: [
      {
        id: 's2',
        userId: '2',
        userName: 'Palitana',
        imageUrl: 'https://picsum.photos/400/700?random=2',
        caption: 'Shatrunjay Darshan',
        createdAt: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
  {
    id: '3',
    name: 'Samvatsari',
    hasUnviewedStory: false,
    stories: [
      {
        id: 's3',
        userId: '3',
        userName: 'Samvatsari',
        imageUrl: 'https://picsum.photos/400/700?random=3',
        caption: 'Michhami Dukkadam',
        createdAt: new Date().toISOString(),
        viewed: true,
      },
    ],
  },
  {
    id: '4',
    name: 'Ranakpur',
    hasUnviewedStory: true,
    stories: [
      {
        id: 's4',
        userId: '4',
        userName: 'Ranakpur',
        imageUrl: 'https://picsum.photos/400/700?random=4',
        caption: 'Temple Architecture',
        createdAt: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
  {
    id: '5',
    name: 'Dilwara',
    hasUnviewedStory: true,
    stories: [
      {
        id: 's5',
        userId: '5',
        userName: 'Dilwara',
        imageUrl: 'https://picsum.photos/400/700?random=5',
        caption: 'Mount Abu',
        createdAt: new Date().toISOString(),
        viewed: false,
      },
    ],
  },
];

interface StoriesProps {
  onAddStory?: () => void;
}

export default function Stories({ onAddStory }: StoriesProps) {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<StoryUser[]>(DEMO_STORIES);
  const [selectedStory, setSelectedStory] = useState<StoryUser | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleStoryPress = (storyUser: StoryUser) => {
    setSelectedStory(storyUser);
    setCurrentStoryIndex(0);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (selectedStory && currentStoryIndex < selectedStory.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      // Move to next user's story
      const currentUserIndex = stories.findIndex((s) => s.id === selectedStory?.id);
      if (currentUserIndex < stories.length - 1) {
        setSelectedStory(stories[currentUserIndex + 1]);
        setCurrentStoryIndex(0);
      } else {
        handleCloseStory();
      }
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    } else {
      // Move to previous user's story
      const currentUserIndex = stories.findIndex((s) => s.id === selectedStory?.id);
      if (currentUserIndex > 0) {
        const prevUser = stories[currentUserIndex - 1];
        setSelectedStory(prevUser);
        setCurrentStoryIndex(prevUser.stories.length - 1);
      }
    }
  };

  const handleAddStory = () => {
    if (onAddStory) {
      onAddStory();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Story Button */}
        <TouchableOpacity style={styles.storyItem} onPress={handleAddStory}>
          <View style={styles.addStoryCircle}>
            <View style={styles.addStoryInner}>
              {user?.profilePhoto ? (
                <Image source={{ uri: user.profilePhoto }} style={styles.storyImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.firstName?.charAt(0) || 'Y'}
                  </Text>
                </View>
              )}
              <View style={styles.addIconContainer}>
                <Ionicons name="add" size={14} color={colors.white} />
              </View>
            </View>
          </View>
          <Text style={styles.storyName} numberOfLines={1}>
            Your Story
          </Text>
        </TouchableOpacity>

        {/* Story Items */}
        {stories.map((storyUser) => (
          <TouchableOpacity
            key={storyUser.id}
            style={styles.storyItem}
            onPress={() => handleStoryPress(storyUser)}
          >
            <LinearGradient
              colors={
                storyUser.hasUnviewedStory
                  ? [colors.saffron[500], colors.saffron[600], colors.primary[500]]
                  : [colors.gray[300], colors.gray[400]]
              }
              style={styles.storyRing}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.storyImageContainer}>
                {storyUser.photo ? (
                  <Image source={{ uri: storyUser.photo }} style={styles.storyImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {storyUser.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
            <Text style={styles.storyName} numberOfLines={1}>
              {storyUser.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Story Viewer Modal */}
      <Modal
        visible={!!selectedStory}
        transparent
        animationType="fade"
        onRequestClose={handleCloseStory}
      >
        <View style={styles.storyModal}>
          {selectedStory && selectedStory.stories[currentStoryIndex] && (
            <>
              {/* Progress Bars */}
              <View style={styles.progressContainer}>
                {selectedStory.stories.map((_, index) => (
                  <View key={index} style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width:
                            index < currentStoryIndex
                              ? '100%'
                              : index === currentStoryIndex
                              ? '100%'
                              : '0%',
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>

              {/* Header */}
              <View style={styles.storyHeader}>
                <View style={styles.storyUserInfo}>
                  <View style={styles.storyUserPhoto}>
                    {selectedStory.photo ? (
                      <Image
                        source={{ uri: selectedStory.photo }}
                        style={styles.storyHeaderImage}
                      />
                    ) : (
                      <View style={styles.storyHeaderAvatar}>
                        <Text style={styles.storyHeaderAvatarText}>
                          {selectedStory.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.storyUserName}>{selectedStory.name}</Text>
                </View>
                <TouchableOpacity onPress={handleCloseStory}>
                  <Ionicons name="close" size={28} color={colors.white} />
                </TouchableOpacity>
              </View>

              {/* Story Content */}
              <View style={styles.storyContent}>
                {loading ? (
                  <ActivityIndicator size="large" color={colors.white} />
                ) : (
                  <Image
                    source={{ uri: selectedStory.stories[currentStoryIndex].imageUrl }}
                    style={styles.storyFullImage}
                    resizeMode="cover"
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                  />
                )}
              </View>

              {/* Caption */}
              {selectedStory.stories[currentStoryIndex].caption && (
                <View style={styles.captionContainer}>
                  <Text style={styles.captionText}>
                    {selectedStory.stories[currentStoryIndex].caption}
                  </Text>
                </View>
              )}

              {/* Touch Areas */}
              <TouchableOpacity
                style={styles.leftTouchArea}
                onPress={handlePrevStory}
              />
              <TouchableOpacity
                style={styles.rightTouchArea}
                onPress={handleNextStory}
              />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 72,
  },
  addStoryCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderStyle: 'dashed',
  },
  addStoryInner: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.saffron[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
  },
  storyImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.white,
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.saffron[600],
  },
  storyName: {
    fontSize: 11,
    color: colors.gray[700],
    marginTop: 6,
    textAlign: 'center',
    width: 68,
  },
  // Modal Styles
  storyModal: {
    flex: 1,
    backgroundColor: colors.black,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 50,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storyUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyUserPhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    overflow: 'hidden',
  },
  storyHeaderImage: {
    width: '100%',
    height: '100%',
  },
  storyHeaderAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.saffron[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyHeaderAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  storyUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyFullImage: {
    width: width,
    height: height - 200,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  captionText: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  leftTouchArea: {
    position: 'absolute',
    top: 100,
    left: 0,
    width: width * 0.3,
    height: height - 200,
  },
  rightTouchArea: {
    position: 'absolute',
    top: 100,
    right: 0,
    width: width * 0.7,
    height: height - 200,
  },
});
