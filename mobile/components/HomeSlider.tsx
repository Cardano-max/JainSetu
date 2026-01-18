import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import colors from '@/lib/colors';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 40;
const ITEM_WIDTH = SLIDER_WIDTH;

interface SliderItem {
  id: string;
  type: 'recent_module' | 'ad' | 'post' | 'festival';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  icon?: string;
  iconColor?: string;
  link?: string;
  linkType?: string;
}

// Demo slider items - in production, fetch from API based on user activity
const DEMO_SLIDER_ITEMS: SliderItem[] = [
  {
    id: '1',
    type: 'recent_module',
    title: 'Continue with Matrimony',
    subtitle: 'You visited 3 profiles yesterday',
    icon: 'heart-circle',
    iconColor: colors.pink[500],
    linkType: 'matrimony',
  },
  {
    id: '2',
    type: 'ad',
    title: 'Palitana Yatra Package',
    subtitle: 'Book your pilgrimage now! Starting ₹4,999',
    imageUrl: 'https://picsum.photos/400/200?random=10',
    link: 'https://example.com',
  },
  {
    id: '3',
    type: 'post',
    title: 'Paryushan Mahaparv',
    subtitle: 'Join the 8-day celebration of soul purification',
    imageUrl: 'https://picsum.photos/400/200?random=11',
    linkType: 'events',
  },
  {
    id: '4',
    type: 'recent_module',
    title: 'Job Applications',
    subtitle: 'You have 2 new responses',
    icon: 'briefcase',
    iconColor: colors.blue[500],
    linkType: 'jobs',
  },
  {
    id: '5',
    type: 'festival',
    title: 'Mahavir Jayanti Coming Soon!',
    subtitle: 'Create & share festival posts with your business',
    icon: 'sparkles',
    iconColor: colors.saffron[500],
    linkType: 'festival-post',
  },
];

interface HomeSliderProps {
  items?: SliderItem[];
}

export default function HomeSlider({ items = DEMO_SLIDER_ITEMS }: HomeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, items.length]);

  const handleItemPress = (item: SliderItem) => {
    if (item.link) {
      // External link
      // Linking.openURL(item.link);
    } else if (item.linkType) {
      switch (item.linkType) {
        case 'matrimony':
          router.push('/(screens)/matrimony');
          break;
        case 'jobs':
          router.push('/(screens)/jobs');
          break;
        case 'events':
          router.push('/(tabs)/events');
          break;
        case 'festival-post':
          router.push('/(screens)/festival-post');
          break;
        default:
          break;
      }
    }
  };

  const renderItem = ({ item }: { item: SliderItem }) => (
    <TouchableOpacity
      style={styles.sliderItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.9}
    >
      {item.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.imageSubtitle}>{item.subtitle}</Text>
            )}
            {item.type === 'ad' && (
              <View style={styles.adBadge}>
                <Text style={styles.adBadgeText}>AD</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: `${item.iconColor}15` }]}>
            <Ionicons
              name={item.icon as any}
              size={32}
              color={item.iconColor || colors.saffron[500]}
            />
          </View>
          <View style={styles.iconContent}>
            <Text style={styles.iconTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.iconSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </View>
      )}
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + 12,
          offset: (ITEM_WIDTH + 12) * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  sliderItem: {
    width: ITEM_WIDTH,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  imageSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  adBadge: {
    position: 'absolute',
    top: -126,
    right: 0,
    backgroundColor: colors.yellow[500],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray[900],
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: 90,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContent: {
    flex: 1,
  },
  iconTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 2,
  },
  iconSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[300],
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.saffron[500],
    width: 18,
  },
});
