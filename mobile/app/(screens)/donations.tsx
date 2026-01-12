import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '@/lib/api';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

interface DonationCause {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  imageUrl?: string;
  isActive: boolean;
  endDate?: string;
}

export default function DonationsScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donateModal, setDonateModal] = useState(false);
  const [selectedCause, setSelectedCause] = useState<DonationCause | null>(null);
  const [amount, setAmount] = useState('');
  const [donating, setDonating] = useState(false);

  const fetchCauses = useCallback(async () => {
    try {
      const response = await api.get('/donations/causes');
      setCauses(response.data.causes || []);
    } catch (error) {
      console.error('Failed to fetch causes:', error);
      // Demo data
      setCauses([
        {
          id: '1',
          title: 'Temple Renovation Fund',
          description: 'Help us renovate the ancient Jain temple in our community. Your contribution will help preserve our heritage.',
          targetAmount: 500000,
          raisedAmount: 325000,
          isActive: true,
        },
        {
          id: '2',
          title: 'Education Scholarship',
          description: 'Support education for underprivileged Jain students. Every donation helps a child pursue their dreams.',
          targetAmount: 200000,
          raisedAmount: 145000,
          isActive: true,
        },
        {
          id: '3',
          title: 'Panjrapole Support',
          description: 'Help feed and care for rescued animals at our Panjrapole. Your kindness gives them a second chance.',
          targetAmount: 100000,
          raisedAmount: 78000,
          isActive: true,
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCauses();
  }, [fetchCauses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCauses();
  };

  const handleDonate = (cause: DonationCause) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to make a donation');
      return;
    }
    setSelectedCause(cause);
    setAmount('');
    setDonateModal(true);
  };

  const submitDonation = async () => {
    if (!amount || parseInt(amount) < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount');
      return;
    }

    setDonating(true);
    try {
      await api.post('/donations', {
        causeId: selectedCause?.id,
        amount: parseInt(amount),
      });
      Alert.alert(
        'Thank You!',
        'Your donation has been received. May your generosity bring blessings.',
        [{ text: 'OK', onPress: () => setDonateModal(false) }]
      );
      fetchCauses();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to process donation');
    } finally {
      setDonating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Donations' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Donations' }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Support Our Causes</Text>
          <Text style={styles.headerSubtitle}>
            Your donations help strengthen our community
          </Text>
        </View>

        {/* Causes List */}
        {causes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color={colors.gray[300]} />
            <Text style={styles.emptyText}>No active causes at the moment</Text>
          </View>
        ) : (
          <View style={styles.causesList}>
            {causes.map((cause) => (
              <View key={cause.id} style={styles.causeCard}>
                <View style={styles.causeImagePlaceholder}>
                  <Ionicons name="heart" size={40} color={colors.saffron[400]} />
                </View>
                <View style={styles.causeContent}>
                  <Text style={styles.causeTitle}>{cause.title}</Text>
                  <Text style={styles.causeDescription} numberOfLines={2}>
                    {cause.description}
                  </Text>

                  {/* Progress Bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${getProgress(cause.raisedAmount, cause.targetAmount)}%` },
                        ]}
                      />
                    </View>
                    <View style={styles.progressLabels}>
                      <Text style={styles.raisedAmount}>
                        {formatCurrency(cause.raisedAmount)} raised
                      </Text>
                      <Text style={styles.targetAmount}>
                        of {formatCurrency(cause.targetAmount)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.donateButton}
                    onPress={() => handleDonate(cause)}
                  >
                    <Ionicons name="heart" size={18} color={colors.white} />
                    <Text style={styles.donateButtonText}>Donate Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* My Donations Link */}
        {isAuthenticated && (
          <TouchableOpacity style={styles.myDonationsButton}>
            <Ionicons name="receipt-outline" size={20} color={colors.saffron[600]} />
            <Text style={styles.myDonationsText}>View My Donations</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Donate Modal */}
      <Modal
        visible={donateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDonateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make a Donation</Text>
              <TouchableOpacity onPress={() => setDonateModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCauseTitle}>{selectedCause?.title}</Text>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {[100, 500, 1000, 5000].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickAmountBtn,
                    amount === amt.toString() && styles.quickAmountBtnActive,
                  ]}
                  onPress={() => setAmount(amt.toString())}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === amt.toString() && styles.quickAmountTextActive,
                    ]}
                  >
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Or enter custom amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount"
                value={amount}
                onChangeText={(text) => setAmount(text.replace(/\D/g, ''))}
                keyboardType="numeric"
                placeholderTextColor={colors.gray[400]}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, donating && styles.submitButtonDisabled]}
              onPress={submitDonation}
              disabled={donating}
            >
              {donating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  Donate {amount ? `₹${amount}` : ''}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.secureText}>
              <Ionicons name="lock-closed" size={12} color={colors.gray[400]} />
              {' '}Secure payment powered by Razorpay
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.saffron[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 16,
  },
  causesList: {
    paddingHorizontal: 20,
  },
  causeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  causeImagePlaceholder: {
    height: 150,
    backgroundColor: colors.saffron[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  causeContent: {
    padding: 16,
  },
  causeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  causeDescription: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 8,
    lineHeight: 20,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.saffron[500],
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  raisedAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.saffron[600],
  },
  targetAmount: {
    fontSize: 14,
    color: colors.gray[500],
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  donateButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  myDonationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
  },
  myDonationsText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[700],
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalCauseTitle: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 20,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  quickAmountTextActive: {
    color: colors.white,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 14,
    color: colors.gray[900],
  },
  submitButton: {
    backgroundColor: colors.saffron[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secureText: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: 16,
  },
});
