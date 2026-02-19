import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_TIRTH_LISTINGS, DEMO_ROOM_TYPES } from '@/lib/demoData/tirth';

export default function TirthBookingScreen() {
  const { listingId, roomTypeId } = useLocalSearchParams<{ listingId: string; roomTypeId: string }>();
  const listing = DEMO_TIRTH_LISTINGS.find((l) => l.id === listingId) || DEMO_TIRTH_LISTINGS[0];
  const roomType = DEMO_ROOM_TYPES.find((r) => r.id === roomTypeId) || DEMO_ROOM_TYPES[0];

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState('1');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdType, setGuestIdType] = useState('Aadhaar');
  const [guestSampraday, setGuestSampraday] = useState('');

  const totalAmount = parseInt(rooms || '1') * roomType.basePrice;

  const handleSubmit = () => {
    Alert.alert(
      'Booking Request Sent!',
      `Your booking for ${listing.name} has been submitted. You will receive a confirmation shortly.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, keyboardType?: any) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor={colors.gray[400]}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Book Room' }} />

      {/* Progress */}
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{listing.name}</Text>
          <Text style={styles.summaryRoom}>{roomType.typeName} - Rs. {roomType.basePrice}/night</Text>
        </View>

        {step === 1 && (
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>Select Dates</Text>
            {renderField('Check-in Date', checkIn, setCheckIn, 'YYYY-MM-DD')}
            {renderField('Check-out Date', checkOut, setCheckOut, 'YYYY-MM-DD')}
            {renderField('Number of Rooms', rooms, setRooms, '1', 'numeric')}
          </View>
        )}

        {step === 2 && (
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>Guest Details</Text>
            {renderField('Full Name', guestName, setGuestName)}
            {renderField('Phone Number', guestPhone, setGuestPhone, '+91...', 'phone-pad')}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>ID Type</Text>
              <View style={styles.idRow}>
                {['Aadhaar', 'PAN', 'Passport'].map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.idBtn, guestIdType === id && styles.idBtnActive]}
                    onPress={() => setGuestIdType(id)}
                  >
                    <Text style={[styles.idBtnText, guestIdType === id && styles.idBtnTextActive]}>{id}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {renderField('Sampraday (Optional)', guestSampraday, setGuestSampraday)}
          </View>
        )}

        {step === 3 && (
          <View style={styles.formCard}>
            <Text style={styles.stepTitle}>Review & Confirm</Text>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Location</Text><Text style={styles.reviewValue}>{listing.name}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Room</Text><Text style={styles.reviewValue}>{roomType.typeName}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Check-in</Text><Text style={styles.reviewValue}>{checkIn || 'Not set'}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Check-out</Text><Text style={styles.reviewValue}>{checkOut || 'Not set'}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Rooms</Text><Text style={styles.reviewValue}>{rooms}</Text></View>
            <View style={styles.reviewRow}><Text style={styles.reviewLabel}>Guest</Text><Text style={styles.reviewValue}>{guestName || 'Not set'}</Text></View>
            <View style={[styles.reviewRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Rs. {totalAmount}</Text>
            </View>
            <Text style={styles.payNote}>Payment at property. Booking confirmation via WhatsApp/SMS.</Text>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color={colors.gray[700]} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : <View />}
        {step < 3 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.confirmBtnText}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  progress: { height: 4, backgroundColor: colors.gray[200] },
  progressFill: { height: '100%', backgroundColor: colors.saffron[600] },
  content: { flex: 1, padding: 16 },
  summaryCard: { backgroundColor: colors.saffron[600], borderRadius: 12, padding: 16, marginBottom: 16 },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: colors.white },
  summaryRoom: { fontSize: 14, color: colors.saffron[100], marginTop: 4 },
  formCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16 },
  stepTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900], marginBottom: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginBottom: 6 },
  fieldInput: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
  idRow: { flexDirection: 'row', marginTop: 6 },
  idBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray[100], marginRight: 8 },
  idBtnActive: { backgroundColor: colors.saffron[600] },
  idBtnText: { fontSize: 13, color: colors.gray[700] },
  idBtnTextActive: { color: colors.white, fontWeight: '600' },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  reviewLabel: { fontSize: 14, color: colors.gray[600] },
  reviewValue: { fontSize: 14, fontWeight: '500', color: colors.gray[900] },
  totalRow: { borderBottomWidth: 0, marginTop: 8, paddingTop: 12, borderTopWidth: 2, borderTopColor: colors.saffron[600] },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.gray[900] },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.saffron[600] },
  payNote: { fontSize: 12, color: colors.gray[500], marginTop: 12, textAlign: 'center' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  backBtnText: { fontSize: 14, color: colors.gray[700], marginLeft: 6 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  nextBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginRight: 6 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  confirmBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
});
