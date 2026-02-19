import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

const TITHIS = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima', 'Amavasya',
];

const MAAH_OPTIONS = [
  'Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh', 'Shravan',
  'Bhadrapad', 'Ashwin', 'Kartik', 'Margashirsha', 'Paush', 'Magh', 'Phalgun',
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

interface PanchangEntry {
  id: string;
  date: string;
  tithi: string;
  paksha: string;
  maah: string;
  samvat: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  navkarshi: string;
  porsi: string;
  saadh_porsi: string;
  nakshatra: string;
  isParv: boolean;
  parvName: string;
}

const EXISTING_ENTRIES: PanchangEntry[] = [
  { id: '1', date: '2026-02-19', tithi: 'Shukla Panchami', paksha: 'Shukla', maah: 'Magh', samvat: 'Vikram Samvat 2082', sunrise: '07:12 AM', sunset: '06:18 PM', moonrise: '10:45 AM', moonset: '11:30 PM', navkarshi: '07:48 AM', porsi: '09:00 AM', saadh_porsi: '10:12 AM', nakshatra: 'Ashwini', isParv: false, parvName: '' },
  { id: '2', date: '2026-02-20', tithi: 'Shukla Shashthi', paksha: 'Shukla', maah: 'Magh', samvat: 'Vikram Samvat 2082', sunrise: '07:11 AM', sunset: '06:19 PM', moonrise: '11:30 AM', moonset: '12:15 AM', navkarshi: '07:47 AM', porsi: '08:59 AM', saadh_porsi: '10:11 AM', nakshatra: 'Bharani', isParv: false, parvName: '' },
  { id: '3', date: '2026-02-23', tithi: 'Shukla Navami', paksha: 'Shukla', maah: 'Magh', samvat: 'Vikram Samvat 2082', sunrise: '07:09 AM', sunset: '06:21 PM', moonrise: '01:30 PM', moonset: '02:45 AM', navkarshi: '07:45 AM', porsi: '08:57 AM', saadh_porsi: '10:09 AM', nakshatra: 'Rohini', isParv: false, parvName: '' },
];

type ViewMode = 'list' | 'add' | 'edit';

export default function AdminPanchangScreen() {
  const [mode, setMode] = useState<ViewMode>('list');
  const [entries] = useState<PanchangEntry[]>(EXISTING_ENTRIES);
  const [editId, setEditId] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState('');
  const [tithi, setTithi] = useState('');
  const [paksha, setPaksha] = useState<'Shukla' | 'Krishna'>('Shukla');
  const [maah, setMaah] = useState('Magh');
  const [samvat, setSamvat] = useState('Vikram Samvat 2082');
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [moonrise, setMoonrise] = useState('');
  const [moonset, setMoonset] = useState('');
  const [navkarshi, setNavkarshi] = useState('');
  const [porsi, setPorsi] = useState('');
  const [saadhPorsi, setSaadhPorsi] = useState('');
  const [nakshatra, setNakshatra] = useState('');
  const [isParv, setIsParv] = useState(false);
  const [parvName, setParvName] = useState('');

  const resetForm = () => {
    setDate(''); setTithi(''); setPaksha('Shukla'); setMaah('Magh');
    setSunrise(''); setSunset(''); setMoonrise(''); setMoonset('');
    setNavkarshi(''); setPorsi(''); setSaadhPorsi(''); setNakshatra('');
    setIsParv(false); setParvName('');
  };

  const loadEntry = (entry: PanchangEntry) => {
    setDate(entry.date); setTithi(entry.tithi); setPaksha(entry.paksha as any);
    setMaah(entry.maah); setSamvat(entry.samvat);
    setSunrise(entry.sunrise); setSunset(entry.sunset);
    setMoonrise(entry.moonrise); setMoonset(entry.moonset);
    setNavkarshi(entry.navkarshi); setPorsi(entry.porsi);
    setSaadhPorsi(entry.saadh_porsi); setNakshatra(entry.nakshatra);
    setIsParv(entry.isParv); setParvName(entry.parvName);
    setEditId(entry.id);
    setMode('edit');
  };

  const handleSave = () => {
    if (!date || !tithi || !sunrise || !sunset || !navkarshi) {
      Alert.alert('Required Fields', 'Please fill Date, Tithi, Sunrise, Sunset, and Navkarshi.');
      return;
    }
    Alert.alert(
      mode === 'add' ? 'Panchang Added' : 'Panchang Updated',
      `Panchang data for ${date} has been ${mode === 'add' ? 'added' : 'updated'} successfully.\n\nTithi: ${paksha} ${tithi}\nMaah: ${maah}\nNavkarshi: ${navkarshi}`,
      [{ text: 'OK', onPress: () => { setMode('list'); resetForm(); } }]
    );
  };

  // Auto-calculate Navkarshi (48 mins after sunrise)
  const calcNavkarshi = (sunriseTime: string) => {
    setSunrise(sunriseTime);
    const match = sunriseTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1]);
      let mins = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      mins += 48;
      if (mins >= 60) { hours += 1; mins -= 60; }
      const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const p = hours >= 12 ? 'PM' : 'AM';
      setNavkarshi(`${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${p}`);
    }
  };

  if (mode === 'list') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Panchang Management' }} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.saffron[600]} />
            <Text style={styles.infoText}>Add daily Panchang data here. Data will be visible to all users on the Panchang screen.</Text>
          </View>

          {/* Quick Add */}
          <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setMode('add'); }}>
            <Ionicons name="add-circle" size={22} color={colors.white} />
            <Text style={styles.addBtnText}>Add Panchang for New Date</Text>
          </TouchableOpacity>

          {/* Existing Entries */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Entries ({entries.length})</Text>
            {entries.map((entry) => (
              <TouchableOpacity key={entry.id} style={styles.entryCard} onPress={() => loadEntry(entry)}>
                <View style={styles.entryTop}>
                  <View>
                    <Text style={styles.entryDate}>{entry.date}</Text>
                    <Text style={styles.entryTithi}>{entry.tithi}</Text>
                  </View>
                  <View style={styles.entryRight}>
                    {entry.isParv && (
                      <View style={styles.parvBadge}>
                        <Text style={styles.parvBadgeText}>PARV</Text>
                      </View>
                    )}
                    <Ionicons name="create-outline" size={18} color={colors.saffron[600]} />
                  </View>
                </View>
                <View style={styles.entryDetails}>
                  <Text style={styles.entryDetail}>{entry.maah} | {entry.paksha} Paksha</Text>
                  <Text style={styles.entryDetail}>Navkarshi: {entry.navkarshi}</Text>
                </View>
                <View style={styles.entryTimes}>
                  <View style={styles.entryTimeItem}>
                    <Ionicons name="sunny" size={12} color={colors.yellow[500]} />
                    <Text style={styles.entryTimeText}>{entry.sunrise}</Text>
                  </View>
                  <View style={styles.entryTimeItem}>
                    <Ionicons name="moon" size={12} color={colors.saffron[600]} />
                    <Text style={styles.entryTimeText}>{entry.sunset}</Text>
                  </View>
                  <View style={styles.entryTimeItem}>
                    <Ionicons name="star" size={12} color={colors.gray[400]} />
                    <Text style={styles.entryTimeText}>{entry.nakshatra}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Add / Edit form
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: mode === 'add' ? 'Add Panchang' : 'Edit Panchang' }} />
      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <Text style={styles.formSection}>Date & Basic Info</Text>
        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-02-19" placeholderTextColor={colors.gray[400]} />

        {/* Paksha */}
        <Text style={styles.label}>Paksha *</Text>
        <View style={styles.chipRow}>
          {(['Shukla', 'Krishna'] as const).map((p) => (
            <TouchableOpacity key={p} style={[styles.chip, paksha === p && styles.chipActive]} onPress={() => setPaksha(p)}>
              <Text style={[styles.chipText, paksha === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tithi */}
        <Text style={styles.label}>Tithi *</Text>
        <View style={styles.chipRow}>
          {TITHIS.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, tithi === t && styles.chipActive]} onPress={() => setTithi(t)}>
              <Text style={[styles.chipText, tithi === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Maah */}
        <Text style={styles.label}>Maah (Month)</Text>
        <View style={styles.chipRow}>
          {MAAH_OPTIONS.map((m) => (
            <TouchableOpacity key={m} style={[styles.chip, maah === m && styles.chipActive]} onPress={() => setMaah(m)}>
              <Text style={[styles.chipText, maah === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Samvat</Text>
        <TextInput style={styles.input} value={samvat} onChangeText={setSamvat} placeholder="Vikram Samvat 2082" placeholderTextColor={colors.gray[400]} />

        {/* Sun Times */}
        <Text style={styles.formSection}>Sun & Moon Times</Text>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Sunrise * (auto-calculates Navkarshi)</Text>
            <TextInput style={styles.input} value={sunrise} onChangeText={calcNavkarshi} placeholder="07:12 AM" placeholderTextColor={colors.gray[400]} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Sunset *</Text>
            <TextInput style={styles.input} value={sunset} onChangeText={setSunset} placeholder="06:18 PM" placeholderTextColor={colors.gray[400]} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Moonrise</Text>
            <TextInput style={styles.input} value={moonrise} onChangeText={setMoonrise} placeholder="10:45 AM" placeholderTextColor={colors.gray[400]} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Moonset</Text>
            <TextInput style={styles.input} value={moonset} onChangeText={setMoonset} placeholder="11:30 PM" placeholderTextColor={colors.gray[400]} />
          </View>
        </View>

        {/* Jain Timings */}
        <Text style={styles.formSection}>Jain Timings</Text>

        <View style={styles.autoCalcCard}>
          <Ionicons name="flash" size={16} color={colors.green[600]} />
          <Text style={styles.autoCalcText}>Navkarshi auto-calculated: {navkarshi || '---'} (48 min after sunrise)</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Navkarshi</Text>
            <TextInput style={styles.input} value={navkarshi} onChangeText={setNavkarshi} placeholder="Auto" placeholderTextColor={colors.gray[400]} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Porsi</Text>
            <TextInput style={styles.input} value={porsi} onChangeText={setPorsi} placeholder="09:00 AM" placeholderTextColor={colors.gray[400]} />
          </View>
        </View>

        <Text style={styles.label}>Saadh Porsi</Text>
        <TextInput style={styles.input} value={saadhPorsi} onChangeText={setSaadhPorsi} placeholder="10:12 AM" placeholderTextColor={colors.gray[400]} />

        {/* Nakshatra */}
        <Text style={styles.formSection}>Astrological</Text>
        <Text style={styles.label}>Nakshatra</Text>
        <View style={styles.chipRow}>
          {NAKSHATRAS.map((n) => (
            <TouchableOpacity key={n} style={[styles.chipSmall, nakshatra === n && styles.chipActive]} onPress={() => setNakshatra(n)}>
              <Text style={[styles.chipSmallText, nakshatra === n && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Parv */}
        <Text style={styles.formSection}>Festival / Parv</Text>
        <TouchableOpacity style={styles.parvToggle} onPress={() => setIsParv(!isParv)}>
          <Ionicons name={isParv ? 'checkbox' : 'square-outline'} size={22} color={isParv ? colors.saffron[600] : colors.gray[400]} />
          <Text style={styles.parvToggleText}>This date is a Parv / Festival</Text>
        </TouchableOpacity>

        {isParv && (
          <>
            <Text style={styles.label}>Parv / Festival Name</Text>
            <TextInput style={styles.input} value={parvName} onChangeText={setParvName} placeholder="e.g. Mahavir Jayanti, Paryushan" placeholderTextColor={colors.gray[400]} />
          </>
        )}

        {/* Actions */}
        <View style={styles.formActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setMode('list'); resetForm(); }}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark" size={18} color={colors.white} />
            <Text style={styles.saveBtnText}>{mode === 'add' ? 'Add Panchang' : 'Update Panchang'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  infoCard: { flexDirection: 'row', backgroundColor: colors.saffron[100], margin: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
  infoText: { fontSize: 13, color: colors.saffron[700], marginLeft: 10, flex: 1, lineHeight: 19 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], marginHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 8 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray[900], marginBottom: 12 },
  // Entry cards
  entryCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryDate: { fontSize: 14, fontWeight: '700', color: colors.saffron[600] },
  entryTithi: { fontSize: 17, fontWeight: '700', color: colors.gray[900], marginTop: 2 },
  entryRight: { flexDirection: 'row', alignItems: 'center' },
  parvBadge: { backgroundColor: colors.saffron[500], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  parvBadgeText: { fontSize: 9, fontWeight: '800', color: colors.white },
  entryDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  entryDetail: { fontSize: 12, color: colors.gray[500] },
  entryTimes: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  entryTimeItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  entryTimeText: { fontSize: 12, color: colors.gray[600], marginLeft: 4 },
  // Form
  formContent: { padding: 16 },
  formSection: { fontSize: 16, fontWeight: '700', color: colors.saffron[600], marginTop: 20, marginBottom: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray[700], marginTop: 10, marginBottom: 6 },
  input: { backgroundColor: colors.white, borderRadius: 10, padding: 14, fontSize: 14, color: colors.gray[900], borderWidth: 1, borderColor: colors.gray[200] },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  chipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  chipText: { fontSize: 13, color: colors.gray[600] },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  chipSmallText: { fontSize: 11, color: colors.gray[600] },
  autoCalcCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[50], padding: 10, borderRadius: 10, marginBottom: 4 },
  autoCalcText: { fontSize: 12, color: colors.green[700], marginLeft: 8, fontWeight: '500' },
  parvToggle: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  parvToggleText: { fontSize: 14, color: colors.gray[700], marginLeft: 10, fontWeight: '500' },
  formActions: { flexDirection: 'row', marginTop: 24 },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], marginRight: 10 },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.gray[600] },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, backgroundColor: colors.saffron[600] },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 6 },
});
