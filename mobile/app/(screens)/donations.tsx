import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api, { classifyError } from '@/lib/api';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';
import { usePayment } from '@/lib/usePayment';
import { useDebouncedPress } from '@/lib/useDebouncedPress';
import axios from 'axios';

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
  const { isProcessing, processDonation, error: paymentError, clearError } = usePayment();

  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [donateModal, setDonateModal] = useState(false);
  const [selectedCause, setSelectedCause] = useState<DonationCause | null>(null);

  // Form state
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPAN, setDonorPAN] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setDonorName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      setDonorPhone(user.phone || '');
      setDonorEmail(user.email || '');
    }
  }, [user]);

  const fetchCauses = useCallback(async () => {
    try {
      const response = await api.get<{ success: boolean; causes: DonationCause[] }>('/donations/causes');
      setCauses(response.causes || []);
    } catch (error) {
      console.error('Failed to fetch causes:', error);
      if (axios.isAxiosError(error)) {
        const apiError = classifyError(error);
        if (apiError.code !== 'NETWORK_ERROR') {
          Alert.alert('Error', apiError.userMessage);
        }
      }
      // Fallback demo data for offline/error scenarios
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
    clearError();
    setDonateModal(true);
  };

  const validateForm = (): boolean => {
    const amountNum = parseInt(amount);

    if (!amount || isNaN(amountNum) || amountNum < 1) {
      Alert.alert('Invalid Amount', 'Please enter a valid donation amount (minimum ₹1)');
      return false;
    }

    if (amountNum > 1000000) {
      Alert.alert('Amount Too Large', 'Maximum donation amount is ₹10,00,000. Please contact us for larger donations.');
      return false;
    }

    if (!donorName.trim()) {
      Alert.alert('Name Required', 'Please enter your name');
      return false;
    }

    if (!donorPhone.trim() || !/^[6-9]\d{9}$/.test(donorPhone.trim())) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Indian phone number');
      return false;
    }

    if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (donorPAN && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(donorPAN.toUpperCase())) {
      Alert.alert('Invalid PAN', 'Please enter a valid PAN number (e.g., ABCDE1234F)');
      return false;
    }

    return true;
  };

  const submitDonation = useDebouncedPress(async () => {
    if (!validateForm() || !selectedCause) return;

    try {
      const result = await processDonation(
        selectedCause.id,
        parseInt(amount),
        {
          name: donorName.trim(),
          phone: donorPhone.trim(),
          email: donorEmail.trim() || undefined,
          pan: donorPAN.trim().toUpperCase() || undefined,
          isAnonymous,
        }
      );

      if (result.success) {
        Alert.alert(
          'Thank You!',
          'Your donation has been received. May your generosity bring blessings.',
          [{ text: 'OK', onPress: () => setDonateModal(false) }]
        );
        fetchCauses(); // Refresh to show updated amounts
      }
    } catch (error: any) {
      Alert.alert('Donation Failed', error.message || 'Failed to process donation. Please try again.');
    }
  }, 1000);

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
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make a Donation</Text>
              <TouchableOpacity onPress={() => setDonateModal(false)}>
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                  maxLength={7}
                />
              </View>

              {/* Donor Information */}
              <Text style={styles.sectionTitle}>Donor Information</Text>

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your name"
                value={donorName}
                onChangeText={setDonorName}
                placeholderTextColor={colors.gray[400]}
              />

              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10-digit phone number"
                value={donorPhone}
                onChangeText={setDonorPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.gray[400]}
                maxLength={10}
              />

              <Text style={styles.inputLabel}>Email (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="your@email.com"
                value={donorEmail}
                onChangeText={setDonorEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.gray[400]}
              />

              <Text style={styles.inputLabel}>PAN Number (For 80G receipt)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ABCDE1234F"
                value={donorPAN}
                onChangeText={(text) => setDonorPAN(text.toUpperCase())}
                autoCapitalize="characters"
                placeholderTextColor={colors.gray[400]}
                maxLength={10}
              />

              {/* Anonymous checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                  {isAnonymous && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Make my donation anonymous</Text>
              </TouchableOpacity>

              {paymentError && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color={colors.red[500]} />
                  <Text style={styles.errorText}>{paymentError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitButton, isProcessing && styles.submitButtonDisabled]}
                onPress={submitDonation}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Donate {amount ? `₹${parseInt(amount).toLocaleString('en-IN')}` : ''}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={styles.securePayment}>
                <Ionicons name="lock-closed" size={14} color={colors.gray[400]} />
                <Text style={styles.secureText}>Secure payment powered by Razorpay</Text>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    maxHeight: '90%',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginTop: 16,
    marginBottom: 12,
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
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray[900],
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.red[50],
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.red[600],
    marginLeft: 8,
    flex: 1,
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
  securePayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  secureText: {
    fontSize: 12,
    color: colors.gray[400],
    marginLeft: 6,
  },
});
