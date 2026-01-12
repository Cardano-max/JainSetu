import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

interface Event {
  id: string;
  title: string;
  shortDescription: string;
  description?: string;
  venue: string;
  address?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime?: string;
  bannerImage?: string;
  city?: { name: string };
  organizer?: string;
  contactPhone?: string;
  contactEmail?: string;
  maxParticipants?: number;
  registrationFee?: number;
  _count?: { registrations: number };
}

export default function EventsScreen() {
  const { isAuthenticated, user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/events/upcoming?limit=20');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Demo data
      setEvents([
        {
          id: '1',
          title: 'Grand Mahavir Jayanti Procession',
          shortDescription: 'Annual celebration of Lord Mahavir\'s birth anniversary.',
          description: 'Join us for the grand celebration of Mahavir Jayanti. The procession will start from Jain Temple and cover the main city areas. Prasad distribution will be held at multiple points.',
          venue: 'Jain Temple',
          address: 'Ring Road, Surat',
          startDate: '2026-02-10',
          endDate: '2026-02-10',
          startTime: '08:00 AM',
          endTime: '02:00 PM',
          organizer: 'Jain Sangh Surat',
          contactPhone: '9876543210',
          maxParticipants: 500,
          _count: { registrations: 156 },
        },
        {
          id: '2',
          title: '3-Day Meditation Shibir',
          shortDescription: 'Experience peace with guided Preksha Meditation.',
          description: 'A 3-day residential meditation camp focused on Preksha Meditation. Includes morning yoga, meditation sessions, spiritual discourses, and satvik food.',
          venue: 'Jain Dharamshala',
          address: 'Adajan, Surat',
          startDate: '2026-02-17',
          endDate: '2026-02-19',
          startTime: '06:00 AM',
          endTime: '09:00 PM',
          organizer: 'Jain Yuva Sangh',
          contactPhone: '9876543211',
          registrationFee: 500,
          maxParticipants: 100,
          _count: { registrations: 45 },
        },
        {
          id: '3',
          title: 'Youth Leadership Summit',
          shortDescription: 'Empowering young Jains to become community leaders.',
          description: 'A one-day summit featuring talks from successful Jain entrepreneurs, community leaders, and spiritual guides. Network with like-minded individuals.',
          venue: 'Convention Center',
          address: 'VIP Road, Surat',
          startDate: '2026-02-25',
          endDate: '2026-02-25',
          startTime: '09:00 AM',
          endTime: '06:00 PM',
          organizer: 'Jain Youth Forum',
          maxParticipants: 200,
          _count: { registrations: 89 },
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleRegister = async (event: Event) => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to register for this event.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => {} },
        ]
      );
      return;
    }

    if (registeredEvents.includes(event.id)) {
      Alert.alert('Already Registered', 'You have already registered for this event.');
      return;
    }

    Alert.alert(
      'Confirm Registration',
      `Do you want to register for "${event.title}"?${
        event.registrationFee ? `\n\nRegistration Fee: ₹${event.registrationFee}` : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            setRegistering(true);
            try {
              await api.post(`/events/${event.id}/register`);
              setRegisteredEvents([...registeredEvents, event.id]);
              Alert.alert(
                'Registration Successful!',
                'You have been registered for this event. Check your profile for details.',
                [{ text: 'OK', onPress: () => setShowDetail(false) }]
              );
              fetchEvents();
            } catch (error: any) {
              Alert.alert(
                'Registration Failed',
                error.response?.data?.error || 'Failed to register. Please try again.'
              );
            } finally {
              setRegistering(false);
            }
          },
        },
      ]
    );
  };

  const viewEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setShowDetail(true);
  };

  const isRegistered = (eventId: string) => registeredEvents.includes(eventId);

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => viewEventDetail(item)}
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
            {item._count?.registrations || 0} registered
          </Text>
          <TouchableOpacity
            style={[
              styles.registerBtn,
              isRegistered(item.id) && styles.registeredBtn,
            ]}
            onPress={() => handleRegister(item)}
          >
            <Text
              style={[
                styles.registerBtnText,
                isRegistered(item.id) && styles.registeredBtnText,
              ]}
            >
              {isRegistered(item.id) ? 'Registered' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color={colors.gray[700]} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Event Detail Modal */}
      <Modal
        visible={showDetail}
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <Ionicons name="close" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Event Details</Text>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>

          {selectedEvent && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalImagePlaceholder}>
                <Ionicons name="calendar" size={60} color={colors.saffron[400]} />
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>

                {/* Date & Time */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="calendar" size={20} color={colors.saffron[600]} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy')}
                    </Text>
                    <Text style={styles.detailSubValue}>
                      {selectedEvent.startTime}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}
                    </Text>
                  </View>
                </View>

                {/* Venue */}
                <View style={styles.detailRow}>
                  <View style={styles.detailIcon}>
                    <Ionicons name="location" size={20} color={colors.saffron[600]} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Venue</Text>
                    <Text style={styles.detailValue}>{selectedEvent.venue}</Text>
                    {selectedEvent.address && (
                      <Text style={styles.detailSubValue}>{selectedEvent.address}</Text>
                    )}
                  </View>
                </View>

                {/* Organizer */}
                {selectedEvent.organizer && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="people" size={20} color={colors.saffron[600]} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Organized By</Text>
                      <Text style={styles.detailValue}>{selectedEvent.organizer}</Text>
                    </View>
                  </View>
                )}

                {/* Description */}
                {selectedEvent.description && (
                  <View style={styles.descriptionSection}>
                    <Text style={styles.descriptionLabel}>About This Event</Text>
                    <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                  </View>
                )}

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{selectedEvent._count?.registrations || 0}</Text>
                    <Text style={styles.statLabel}>Registered</Text>
                  </View>
                  {selectedEvent.maxParticipants && (
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{selectedEvent.maxParticipants}</Text>
                      <Text style={styles.statLabel}>Max Capacity</Text>
                    </View>
                  )}
                  {selectedEvent.registrationFee ? (
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>₹{selectedEvent.registrationFee}</Text>
                      <Text style={styles.statLabel}>Fee</Text>
                    </View>
                  ) : (
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>Free</Text>
                      <Text style={styles.statLabel}>Entry</Text>
                    </View>
                  )}
                </View>

                {/* Contact */}
                {selectedEvent.contactPhone && (
                  <TouchableOpacity style={styles.contactButton}>
                    <Ionicons name="call" size={18} color={colors.saffron[600]} />
                    <Text style={styles.contactButtonText}>Contact Organizer</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}

          {/* Register Button */}
          {selectedEvent && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.registerFullButton,
                  (registering || isRegistered(selectedEvent.id)) && styles.registerFullButtonDisabled,
                ]}
                onPress={() => handleRegister(selectedEvent)}
                disabled={registering || isRegistered(selectedEvent.id)}
              >
                {registering ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name={isRegistered(selectedEvent.id) ? 'checkmark-circle' : 'ticket'}
                      size={20}
                      color={colors.white}
                    />
                    <Text style={styles.registerFullButtonText}>
                      {isRegistered(selectedEvent.id) ? 'Already Registered' : 'Register for Event'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  registeredBtn: {
    backgroundColor: colors.green[100],
  },
  registerBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  registeredBtnText: {
    color: colors.green[700],
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalContent: {
    flex: 1,
  },
  modalImagePlaceholder: {
    height: 200,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalEventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.saffron[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
    marginTop: 2,
  },
  detailSubValue: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  descriptionSection: {
    marginTop: 8,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.gray[600],
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.saffron[600],
  },
  contactButtonText: {
    color: colors.saffron[600],
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  registerFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 16,
    borderRadius: 12,
  },
  registerFullButtonDisabled: {
    backgroundColor: colors.green[500],
  },
  registerFullButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
