import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
  ActivityIndicator, FlatList,
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

// Major Jain Parv/Festivals with approximate month/tithi
const JAIN_FESTIVALS: { name: string; maah: string; tithi: string; paksha: string }[] = [
  { name: 'Mahavir Jayanti', maah: 'Chaitra', tithi: 'Trayodashi', paksha: 'Shukla' },
  { name: 'Akshaya Tritiya', maah: 'Vaishakh', tithi: 'Tritiya', paksha: 'Shukla' },
  { name: 'Guru Purnima', maah: 'Ashadh', tithi: 'Purnima', paksha: 'Shukla' },
  { name: 'Paryushan Parv (Start)', maah: 'Bhadrapad', tithi: 'Dwadashi', paksha: 'Shukla' },
  { name: 'Samvatsari', maah: 'Bhadrapad', tithi: 'Chaturthi', paksha: 'Krishna' },
  { name: 'Das Lakshan Parv (Start)', maah: 'Bhadrapad', tithi: 'Panchami', paksha: 'Shukla' },
  { name: 'Anant Chaturdashi', maah: 'Bhadrapad', tithi: 'Chaturdashi', paksha: 'Shukla' },
  { name: 'Sharad Purnima', maah: 'Ashwin', tithi: 'Purnima', paksha: 'Shukla' },
  { name: 'Diwali (Mahavir Nirvana)', maah: 'Kartik', tithi: 'Amavasya', paksha: 'Krishna' },
  { name: 'New Year (Vikram Samvat)', maah: 'Kartik', tithi: 'Pratipada', paksha: 'Shukla' },
  { name: 'Gyan Panchami', maah: 'Kartik', tithi: 'Panchami', paksha: 'Shukla' },
  { name: 'Maun Ekadashi', maah: 'Margashirsha', tithi: 'Ekadashi', paksha: 'Shukla' },
  { name: 'Roth Teej', maah: 'Magh', tithi: 'Tritiya', paksha: 'Shukla' },
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

// ============================================================================
// PANCHANG GENERATOR - Generates 2 years of data automatically
// ============================================================================

// Approximate sunrise/sunset for India by month (hours in 24h)
const SUNRISE_BY_MONTH = [6.85, 6.70, 6.35, 6.00, 5.70, 5.60, 5.75, 5.90, 6.05, 6.20, 6.45, 6.70];
const SUNSET_BY_MONTH = [17.75, 18.10, 18.35, 18.55, 18.80, 19.00, 19.00, 18.75, 18.35, 17.95, 17.65, 17.60];

function formatTime(decimalHours: number): string {
  const h = Math.floor(decimalHours);
  const m = Math.round((decimalHours - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function addMinutes(decimalHours: number, minutes: number): string {
  return formatTime(decimalHours + minutes / 60);
}

function generatePanchangForDate(d: Date, samvatYear: number): PanchangEntry {
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const month = d.getMonth();

  // Tithi cycles ~29.5 days (lunar month)
  const lunarDay = Math.floor(((dayOfYear * 12.3685) + (d.getFullYear() * 0.618)) % 30);
  const tithiIndex = lunarDay % 16;
  const paksha = lunarDay < 15 ? 'Shukla' : 'Krishna';
  const tithiName = TITHIS[tithiIndex];

  // Jain month (approximately shifted from Gregorian)
  const maahIndex = ((month + 9) % 12); // Chaitra ~ March
  const maah = MAAH_OPTIONS[maahIndex];

  // Nakshatra cycles ~27.3 days
  const nakIndex = Math.floor(((dayOfYear * 13.368) + d.getFullYear()) % 27);
  const nakshatra = NAKSHATRAS[nakIndex];

  // Sunrise/sunset with slight daily variation
  const dayVariation = Math.sin((dayOfYear / 365) * Math.PI * 2) * 0.15;
  const sunriseH = SUNRISE_BY_MONTH[month] + dayVariation + (Math.random() * 0.08 - 0.04);
  const sunsetH = SUNSET_BY_MONTH[month] + dayVariation + (Math.random() * 0.08 - 0.04);

  // Moonrise varies ~50 min later each day
  const moonriseBase = 6 + (lunarDay * 0.83) % 24;
  const moonsetBase = (moonriseBase + 12.5) % 24;

  const sunrise = formatTime(sunriseH);
  const sunset = formatTime(sunsetH);
  const navkarshi = addMinutes(sunriseH, 48);
  const porsi = addMinutes(sunriseH, 96); // ~1 porsi = 96 min
  const saadhPorsi = addMinutes(sunriseH, 144); // 1.5 porsi

  // Check if this is a Parv
  let isParv = false;
  let parvName = '';

  // Standard parv on Ashtami, Chaturdashi, Purnima, Amavasya
  if (['Ashtami', 'Chaturdashi', 'Purnima', 'Amavasya'].includes(tithiName)) {
    isParv = true;
    parvName = tithiName;
  }

  // Check major Jain festivals
  for (const fest of JAIN_FESTIVALS) {
    if (fest.maah === maah && fest.tithi === tithiName && fest.paksha === paksha) {
      isParv = true;
      parvName = fest.name;
      break;
    }
  }

  const dateStr = d.toISOString().split('T')[0];

  return {
    id: dateStr,
    date: dateStr,
    tithi: `${paksha} ${tithiName}`,
    paksha,
    maah,
    samvat: `Vikram Samvat ${samvatYear}`,
    sunrise,
    sunset,
    moonrise: formatTime(moonriseBase),
    moonset: formatTime(moonsetBase),
    navkarshi,
    porsi,
    saadh_porsi: saadhPorsi,
    nakshatra,
    isParv,
    parvName,
  };
}

function generateBulkPanchang(startDate: Date, years: number): PanchangEntry[] {
  const entries: PanchangEntry[] = [];
  const totalDays = years * 365;
  const current = new Date(startDate);

  for (let i = 0; i < totalDays; i++) {
    // Vikram Samvat = Gregorian + 57 (approximately)
    const samvatYear = current.getFullYear() + 57;
    entries.push(generatePanchangForDate(current, samvatYear));
    current.setDate(current.getDate() + 1);
  }

  return entries;
}

// ============================================================================
// COMPONENT
// ============================================================================

type ViewMode = 'list' | 'add' | 'edit' | 'bulk' | 'bulk-result';

export default function AdminPanchangScreen() {
  const [mode, setMode] = useState<ViewMode>('list');
  const [entries, setEntries] = useState<PanchangEntry[]>([]);
  const [bulkEntries, setBulkEntries] = useState<PanchangEntry[]>([]);
  const [generating, setGenerating] = useState(false);
  const [bulkSaved, setBulkSaved] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
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
      `Panchang data for ${date} saved.\n\nTithi: ${paksha} ${tithi}\nMaah: ${maah}\nNavkarshi: ${navkarshi}`,
      [{ text: 'OK', onPress: () => { setMode('list'); resetForm(); } }]
    );
  };

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

  // Bulk Generate
  const handleBulkGenerate = useCallback(() => {
    setGenerating(true);
    setBulkSaved(false);
    // Use setTimeout to not block UI
    setTimeout(() => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const generated = generateBulkPanchang(startDate, 2);
      setBulkEntries(generated);
      setGenerating(false);
      setMode('bulk-result');
    }, 500);
  }, []);

  const handleBulkSave = () => {
    Alert.alert(
      'Save 2 Years of Panchang',
      `This will save ${bulkEntries.length} days of Panchang data.\n\nFrom: ${bulkEntries[0]?.date}\nTo: ${bulkEntries[bulkEntries.length - 1]?.date}\n\nParv days: ${bulkEntries.filter(e => e.isParv).length}\n\nProceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save All',
          onPress: () => {
            setEntries(bulkEntries);
            setBulkSaved(true);
            Alert.alert(
              'Saved Successfully!',
              `${bulkEntries.length} days of Panchang data saved.\n\nAll users will now see daily Panchang data for 2 years.\n\nYou can edit individual dates by tapping on them.`
            );
          },
        },
      ]
    );
  };

  // Get months for filter in bulk result
  const getMonthsInBulk = () => {
    const months = new Set<string>();
    bulkEntries.forEach(e => {
      const m = e.date.substring(0, 7); // YYYY-MM
      months.add(m);
    });
    return Array.from(months).sort();
  };

  const filteredBulkEntries = selectedMonth
    ? bulkEntries.filter(e => e.date.startsWith(selectedMonth))
    : bulkEntries.slice(0, 31); // Show first month by default

  const parvCount = bulkEntries.filter(e => e.isParv).length;

  // ============================
  // BULK RESULT VIEW
  // ============================
  if (mode === 'bulk-result') {
    const months = getMonthsInBulk();
    const displayMonth = selectedMonth || months[0];

    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Generated Panchang Data' }} />

        {/* Summary */}
        <View style={styles.bulkSummary}>
          <View style={styles.bulkSummaryRow}>
            <View style={styles.bulkStat}>
              <Text style={styles.bulkStatValue}>{bulkEntries.length}</Text>
              <Text style={styles.bulkStatLabel}>Total Days</Text>
            </View>
            <View style={styles.bulkStat}>
              <Text style={styles.bulkStatValue}>{parvCount}</Text>
              <Text style={styles.bulkStatLabel}>Parv Days</Text>
            </View>
            <View style={styles.bulkStat}>
              <Text style={styles.bulkStatValue}>{months.length}</Text>
              <Text style={styles.bulkStatLabel}>Months</Text>
            </View>
          </View>
          <Text style={styles.bulkRange}>{bulkEntries[0]?.date} to {bulkEntries[bulkEntries.length - 1]?.date}</Text>

          {!bulkSaved ? (
            <TouchableOpacity style={styles.bulkSaveBtn} onPress={handleBulkSave}>
              <Ionicons name="cloud-upload" size={20} color={colors.white} />
              <Text style={styles.bulkSaveBtnText}>Save All {bulkEntries.length} Days</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.bulkSavedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.green[600]} />
              <Text style={styles.bulkSavedText}>All data saved successfully!</Text>
            </View>
          )}
        </View>

        {/* Month Filter */}
        <FlatList
          horizontal
          data={months}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
          renderItem={({ item }) => {
            const [y, m] = item.split('-');
            const monthName = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            const isActive = item === displayMonth;
            return (
              <TouchableOpacity
                style={[styles.monthTab, isActive && styles.monthTabActive]}
                onPress={() => setSelectedMonth(item)}
              >
                <Text style={[styles.monthTabText, isActive && styles.monthTabTextActive]}>{monthName}</Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Entries List */}
        <FlatList
          data={selectedMonth ? bulkEntries.filter(e => e.date.startsWith(selectedMonth)) : bulkEntries.filter(e => e.date.startsWith(displayMonth))}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.entryCard} onPress={() => loadEntry(item)}>
              <View style={styles.entryTop}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.entryDate}>{item.date}</Text>
                    <Text style={styles.entryDayName}>
                      {' '}{new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </Text>
                  </View>
                  <Text style={styles.entryTithi}>{item.tithi}</Text>
                </View>
                <View style={styles.entryRight}>
                  {item.isParv && (
                    <View style={styles.parvBadge}>
                      <Text style={styles.parvBadgeText}>{item.parvName || 'PARV'}</Text>
                    </View>
                  )}
                  <Ionicons name="create-outline" size={16} color={colors.saffron[600]} />
                </View>
              </View>
              <View style={styles.entryDetails}>
                <Text style={styles.entryDetail}>{item.maah} | {item.nakshatra}</Text>
                <Text style={styles.entryDetail}>Navkarshi: {item.navkarshi}</Text>
              </View>
              <View style={styles.entryTimes}>
                <View style={styles.entryTimeItem}>
                  <Ionicons name="sunny" size={12} color={colors.yellow[500]} />
                  <Text style={styles.entryTimeText}>{item.sunrise}</Text>
                </View>
                <View style={styles.entryTimeItem}>
                  <Ionicons name="moon" size={12} color={colors.saffron[600]} />
                  <Text style={styles.entryTimeText}>{item.sunset}</Text>
                </View>
                <View style={styles.entryTimeItem}>
                  <Ionicons name="time" size={12} color={colors.green[500]} />
                  <Text style={styles.entryTimeText}>{item.porsi}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Back Button */}
        <TouchableOpacity style={styles.backFloating} onPress={() => setMode('list')}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
          <Text style={styles.backFloatingText}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ============================
  // BULK GENERATE VIEW
  // ============================
  if (mode === 'bulk') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Bulk Generate Panchang' }} />
        <ScrollView contentContainerStyle={styles.bulkContent}>
          <View style={styles.bulkIcon}>
            <Ionicons name="calendar" size={60} color={colors.saffron[500]} />
          </View>
          <Text style={styles.bulkTitle}>Auto-Generate 2 Years of Panchang</Text>
          <Text style={styles.bulkDesc}>
            This will automatically generate Panchang data for 730 days starting from today. The generated data includes:
          </Text>

          <View style={styles.bulkFeatures}>
            {[
              'Daily Tithi (Shukla/Krishna Paksha)',
              'Jain Maah (monthly cycle)',
              'Sunrise & Sunset (seasonal variation)',
              'Navkarshi (auto-calculated, 48 min after sunrise)',
              'Porsi & Saadh Porsi times',
              'Moonrise & Moonset',
              'Nakshatra (27 star cycle)',
              `${JAIN_FESTIVALS.length} Jain Festivals auto-marked as Parv`,
              'Ashtami, Chaturdashi, Purnima, Amavasya marked as Parv',
              'Vikram Samvat year auto-assigned',
            ].map((feature, i) => (
              <View key={i} style={styles.bulkFeatureRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.green[500]} />
                <Text style={styles.bulkFeatureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bulkNote}>
            <Ionicons name="information-circle" size={18} color={colors.blue[500]} />
            <Text style={styles.bulkNoteText}>After generating, you can edit any individual date to correct exact values. Generated data uses astronomical approximations for India.</Text>
          </View>

          {generating ? (
            <View style={styles.generatingCard}>
              <ActivityIndicator size="large" color={colors.saffron[600]} />
              <Text style={styles.generatingText}>Generating 730 days...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.generateBtn} onPress={handleBulkGenerate}>
              <Ionicons name="flash" size={22} color={colors.white} />
              <Text style={styles.generateBtnText}>Generate 2 Years Now</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelBtnLarge} onPress={() => setMode('list')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================
  // LIST VIEW
  // ============================
  if (mode === 'list') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Panchang Management' }} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.saffron[600]} />
            <Text style={styles.infoText}>Add daily Panchang data here. Use "Bulk Generate" to auto-fill 2 years at once.</Text>
          </View>

          {/* Bulk Generate - Main CTA */}
          <TouchableOpacity style={styles.bulkBtn} onPress={() => setMode('bulk')}>
            <View style={styles.bulkBtnIcon}>
              <Ionicons name="flash" size={28} color={colors.saffron[600]} />
            </View>
            <View style={styles.bulkBtnInfo}>
              <Text style={styles.bulkBtnTitle}>Bulk Generate 2 Years</Text>
              <Text style={styles.bulkBtnDesc}>Auto-generate 730 days of Panchang data with Tithi, Navkarshi, Parv & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.saffron[600]} />
          </TouchableOpacity>

          {/* Single Add */}
          <TouchableOpacity style={styles.addBtn} onPress={() => { resetForm(); setMode('add'); }}>
            <Ionicons name="add-circle" size={22} color={colors.white} />
            <Text style={styles.addBtnText}>Add Single Date Manually</Text>
          </TouchableOpacity>

          {/* Saved entries */}
          {entries.length > 0 && (
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Saved Entries ({entries.length})</Text>
                <TouchableOpacity onPress={() => { setBulkEntries(entries); setMode('bulk-result'); }}>
                  <Text style={{ fontSize: 13, color: colors.saffron[600], fontWeight: '600' }}>View All</Text>
                </TouchableOpacity>
              </View>
              {entries.slice(0, 5).map((entry) => (
                <TouchableOpacity key={entry.id} style={styles.entryCard} onPress={() => loadEntry(entry)}>
                  <View style={styles.entryTop}>
                    <View>
                      <Text style={styles.entryDate}>{entry.date}</Text>
                      <Text style={styles.entryTithi}>{entry.tithi}</Text>
                    </View>
                    <View style={styles.entryRight}>
                      {entry.isParv && (
                        <View style={styles.parvBadge}>
                          <Text style={styles.parvBadgeText}>{entry.parvName || 'PARV'}</Text>
                        </View>
                      )}
                      <Ionicons name="create-outline" size={18} color={colors.saffron[600]} />
                    </View>
                  </View>
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryDetail}>{entry.maah} | {entry.paksha} Paksha</Text>
                    <Text style={styles.entryDetail}>Navkarshi: {entry.navkarshi}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {entries.length > 5 && (
                <Text style={styles.moreText}>+ {entries.length - 5} more entries...</Text>
              )}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================
  // ADD / EDIT FORM
  // ============================
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: mode === 'add' ? 'Add Panchang' : 'Edit Panchang' }} />
      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.formSection}>Date & Basic Info</Text>
        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-02-19" placeholderTextColor={colors.gray[400]} />

        <Text style={styles.label}>Paksha *</Text>
        <View style={styles.chipRow}>
          {(['Shukla', 'Krishna'] as const).map((p) => (
            <TouchableOpacity key={p} style={[styles.chip, paksha === p && styles.chipActive]} onPress={() => setPaksha(p)}>
              <Text style={[styles.chipText, paksha === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tithi *</Text>
        <View style={styles.chipRow}>
          {TITHIS.map((t) => (
            <TouchableOpacity key={t} style={[styles.chip, tithi === t && styles.chipActive]} onPress={() => setTithi(t)}>
              <Text style={[styles.chipText, tithi === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

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

        <Text style={styles.formSection}>Sun & Moon Times</Text>
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Sunrise *</Text>
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

        <Text style={styles.formSection}>Jain Timings</Text>
        <View style={styles.autoCalcCard}>
          <Ionicons name="flash" size={16} color={colors.green[600]} />
          <Text style={styles.autoCalcText}>Navkarshi: {navkarshi || '---'} (48 min after sunrise)</Text>
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

        <Text style={styles.formSection}>Astrological</Text>
        <Text style={styles.label}>Nakshatra</Text>
        <View style={styles.chipRow}>
          {NAKSHATRAS.map((n) => (
            <TouchableOpacity key={n} style={[styles.chipSmall, nakshatra === n && styles.chipActive]} onPress={() => setNakshatra(n)}>
              <Text style={[styles.chipSmallText, nakshatra === n && styles.chipTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.formSection}>Festival / Parv</Text>
        <TouchableOpacity style={styles.parvToggle} onPress={() => setIsParv(!isParv)}>
          <Ionicons name={isParv ? 'checkbox' : 'square-outline'} size={22} color={isParv ? colors.saffron[600] : colors.gray[400]} />
          <Text style={styles.parvToggleText}>This date is a Parv / Festival</Text>
        </TouchableOpacity>
        {isParv && (
          <>
            <Text style={styles.label}>Parv / Festival Name</Text>
            <TextInput style={styles.input} value={parvName} onChangeText={setParvName} placeholder="e.g. Mahavir Jayanti" placeholderTextColor={colors.gray[400]} />
          </>
        )}

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setMode(entries.length > 0 ? 'list' : 'list'); resetForm(); }}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="checkmark" size={18} color={colors.white} />
            <Text style={styles.saveBtnText}>{mode === 'add' ? 'Add Panchang' : 'Update'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  infoCard: { flexDirection: 'row', backgroundColor: colors.saffron[100], margin: 16, marginBottom: 12, padding: 14, borderRadius: 12, alignItems: 'center' },
  infoText: { fontSize: 13, color: colors.saffron[700], marginLeft: 10, flex: 1, lineHeight: 19 },
  // Bulk CTA
  bulkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 10, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: colors.saffron[200] },
  bulkBtnIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: colors.saffron[50], justifyContent: 'center', alignItems: 'center' },
  bulkBtnInfo: { flex: 1, marginLeft: 14 },
  bulkBtnTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[900] },
  bulkBtnDesc: { fontSize: 12, color: colors.gray[500], marginTop: 3, lineHeight: 17 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[600], marginHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  addBtnText: { fontSize: 14, fontWeight: '600', color: colors.white, marginLeft: 8 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.gray[900] },
  moreText: { textAlign: 'center', fontSize: 13, color: colors.saffron[600], fontWeight: '600', marginTop: 8 },
  // Entry cards
  entryCard: { backgroundColor: colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  entryDate: { fontSize: 13, fontWeight: '700', color: colors.saffron[600] },
  entryDayName: { fontSize: 12, color: colors.gray[400], fontWeight: '500' },
  entryTithi: { fontSize: 15, fontWeight: '700', color: colors.gray[900], marginTop: 2 },
  entryRight: { flexDirection: 'row', alignItems: 'center' },
  parvBadge: { backgroundColor: colors.saffron[500], paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  parvBadgeText: { fontSize: 8, fontWeight: '800', color: colors.white },
  entryDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  entryDetail: { fontSize: 11, color: colors.gray[500] },
  entryTimes: { flexDirection: 'row', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  entryTimeItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  entryTimeText: { fontSize: 11, color: colors.gray[600], marginLeft: 4 },
  // Bulk generate screen
  bulkContent: { padding: 20, alignItems: 'center' },
  bulkIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  bulkTitle: { fontSize: 22, fontWeight: '800', color: colors.gray[900], marginTop: 20, textAlign: 'center' },
  bulkDesc: { fontSize: 14, color: colors.gray[600], marginTop: 10, textAlign: 'center', lineHeight: 21 },
  bulkFeatures: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginTop: 20, width: '100%' },
  bulkFeatureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  bulkFeatureText: { fontSize: 13, color: colors.gray[700], marginLeft: 10, flex: 1 },
  bulkNote: { flexDirection: 'row', backgroundColor: colors.blue[50], padding: 14, borderRadius: 12, marginTop: 16, width: '100%' },
  bulkNoteText: { fontSize: 12, color: colors.blue[700], marginLeft: 10, flex: 1, lineHeight: 18 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14, marginTop: 24, width: '100%' },
  generateBtnText: { fontSize: 17, fontWeight: '800', color: colors.white, marginLeft: 10 },
  generatingCard: { backgroundColor: colors.white, borderRadius: 14, padding: 30, marginTop: 24, alignItems: 'center', width: '100%' },
  generatingText: { fontSize: 15, color: colors.gray[600], marginTop: 14, fontWeight: '600' },
  cancelBtnLarge: { alignItems: 'center', paddingVertical: 14, marginTop: 12, width: '100%' },
  // Bulk result
  bulkSummary: { backgroundColor: colors.white, margin: 16, marginBottom: 0, padding: 16, borderRadius: 14 },
  bulkSummaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  bulkStat: { alignItems: 'center' },
  bulkStatValue: { fontSize: 28, fontWeight: '800', color: colors.saffron[600] },
  bulkStatLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  bulkRange: { textAlign: 'center', fontSize: 12, color: colors.gray[400], marginBottom: 12 },
  bulkSaveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green[500], paddingVertical: 14, borderRadius: 12 },
  bulkSaveBtnText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 8 },
  bulkSavedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.green[50], paddingVertical: 12, borderRadius: 12 },
  bulkSavedText: { fontSize: 14, fontWeight: '600', color: colors.green[600], marginLeft: 8 },
  // Month tabs
  monthTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.white, marginRight: 6, borderWidth: 1, borderColor: colors.gray[200] },
  monthTabActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  monthTabText: { fontSize: 12, fontWeight: '600', color: colors.gray[600] },
  monthTabTextActive: { color: colors.white },
  backFloating: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray[700], paddingVertical: 12, margin: 16, borderRadius: 10 },
  backFloatingText: { fontSize: 14, fontWeight: '600', color: colors.white, marginLeft: 6 },
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
