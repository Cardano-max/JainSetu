import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { format } from 'date-fns';
import api from '@/lib/api';
import colors from '@/lib/colors';

interface Event {
  id: string;
  title: string;
  shortDescription: string;
  venue: string;
  startDate: string;
  endDate: string;
  startTime: string;
  bannerImage: string;
  city: { name: string };
  _count: { registrations: number };
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/upcoming?limit=20');
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => router.push(`/event/${item.id}`)}
    >
      <View style={styles.eventImage}>
        {item.bannerImage ? (
          <Image source={{ uri: item.bannerImage }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="calendar" size={32} color={colors.saffron[300]} />
          </View>
        )}
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="calendar-outline" size={14} color={colors.gray[500]} />
          <Text style={styles.eventMetaText}>
            {format(new Date(item.startDate), 'MMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.eventMeta}>
          <Ionicons name="location-outline" size={14} color={colors.gray[500]} />
          <Text style={styles.eventMetaText}>{item.venue}</Text>
        </View>
        <View style={styles.eventFooter}>
          <Text style={styles.registrations}>
            {item._count.registrations} registered
          </Text>
          <TouchableOpacity style={styles.registerBtn}>
            <Text style={styles.registerBtnText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={64} color={colors.gray[300]} />
          <Text style={styles.emptyText}>No upcoming events</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  list: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  eventImage: {
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventMetaText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 6,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  registrations: {
    fontSize: 14,
    color: colors.gray[500],
  },
  registerBtn: {
    backgroundColor: colors.saffron[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[500],
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
  },
});
