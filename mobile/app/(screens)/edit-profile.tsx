import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

type Section = 'basic' | 'family' | 'dharmik' | 'tap' | 'lifestyle' | 'social';

const SECTIONS: { id: Section; title: string; icon: string }[] = [
  { id: 'basic', title: 'Basic', icon: 'person' },
  { id: 'family', title: 'Family', icon: 'people' },
  { id: 'dharmik', title: 'Dharmik', icon: 'sunny' },
  { id: 'tap', title: 'Tap', icon: 'flame' },
  { id: 'lifestyle', title: 'Lifestyle', icon: 'leaf' },
  { id: 'social', title: 'Social', icon: 'globe' },
];

export default function EditProfileScreen() {
  const [activeSection, setActiveSection] = useState<Section>('basic');

  // Basic
  const [firstName, setFirstName] = useState('Rajesh');
  const [lastName, setLastName] = useState('Shah');
  const [firstNameGuj, setFirstNameGuj] = useState('રાજેશ');
  const [gender, setGender] = useState('male');
  const [dob, setDob] = useState('1990-05-15');
  const [city, setCity] = useState('Surat');
  const [nativePlace, setNativePlace] = useState('Palanpur');
  const [bloodGroup, setBloodGroup] = useState('B+');

  // Family
  const [fatherName, setFatherName] = useState('Kantilal Shah');
  const [motherName, setMotherName] = useState('Pushpaben Shah');
  const [spouseName, setSpouseName] = useState('Nidhi Shah');
  const [mamajiName, setMamajiName] = useState('Sureshbhai Mehta');
  const [mamajiCity, setMamajiCity] = useState('Ahmedabad');
  const [buvaName, setBuvaName] = useState('Prabhaben Jain');
  const [buvaCity, setBuvaCity] = useState('Mumbai');
  const [sanghName, setSanghName] = useState('Shri Surat Jain Shwetambar Sangh');

  // Dharmik
  const [sampraday, setSampraday] = useState('Shwetambar');
  const [guruName, setGuruName] = useState('Acharya Shri Ratnakarji Maharaj');
  const [darshanDaily, setDarshanDaily] = useState(true);
  const [samayikDaily, setSamayikDaily] = useState(true);
  const [pratikramanDaily, setPratikramanDaily] = useState(false);

  // Lifestyle
  const [diet, setDiet] = useState('Jain');
  const [wakeUpTime, setWakeUpTime] = useState('5:30 AM');
  const [sleepTime, setSleepTime] = useState('10:00 PM');
  const [yoga, setYoga] = useState(true);
  const [meditation, setMeditation] = useState(true);

  // Social
  const [bio, setBio] = useState('Jai Jinendra! Devoted Jain | Software Professional');
  const [privacy, setPrivacy] = useState('public');

  const handleSave = () => {
    Alert.alert('Profile Updated', 'Your profile has been saved successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor={colors.gray[400]}
      />
    </View>
  );

  const renderToggle = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.gray[300], true: colors.saffron[300] }}
        thumbColor={value ? colors.saffron[600] : colors.gray[400]}
      />
    </View>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <>
            {renderField('First Name', firstName, setFirstName)}
            {renderField('Last Name', lastName, setLastName)}
            {renderField('First Name (Gujarati)', firstNameGuj, setFirstNameGuj)}
            {renderField('Date of Birth', dob, setDob, 'YYYY-MM-DD')}
            {renderField('City', city, setCity)}
            {renderField('Native Place', nativePlace, setNativePlace)}
            {renderField('Blood Group', bloodGroup, setBloodGroup)}
          </>
        );
      case 'family':
        return (
          <>
            {renderField('Father Name', fatherName, setFatherName)}
            {renderField('Mother Name', motherName, setMotherName)}
            {renderField('Spouse Name', spouseName, setSpouseName)}
            <Text style={styles.subHeader}>Mamaji Details</Text>
            {renderField('Mamaji Name', mamajiName, setMamajiName)}
            {renderField('Mamaji City', mamajiCity, setMamajiCity)}
            <Text style={styles.subHeader}>Buva Details</Text>
            {renderField('Buva Name', buvaName, setBuvaName)}
            {renderField('Buva City', buvaCity, setBuvaCity)}
            {renderField('Sangh Name', sanghName, setSanghName)}
          </>
        );
      case 'dharmik':
        return (
          <>
            {renderField('Sampraday', sampraday, setSampraday)}
            {renderField('Guru Name', guruName, setGuruName)}
            {renderToggle('Daily Darshan', darshanDaily, setDarshanDaily)}
            {renderToggle('Daily Samayik', samayikDaily, setSamayikDaily)}
            {renderToggle('Daily Pratikraman', pratikramanDaily, setPratikramanDaily)}
          </>
        );
      case 'tap':
        return (
          <View style={styles.tapInfo}>
            <View style={styles.tapCard}>
              <Ionicons name="flame" size={32} color={colors.saffron[500]} />
              <Text style={styles.tapValue}>156</Text>
              <Text style={styles.tapLabel}>Total Fasts</Text>
            </View>
            <View style={styles.tapCard}>
              <Ionicons name="trending-up" size={32} color={colors.green[500]} />
              <Text style={styles.tapValue}>3</Text>
              <Text style={styles.tapLabel}>Current Streak</Text>
            </View>
            <Text style={styles.tapNote}>Tap entries are tracked automatically from your daily log.</Text>
            <TouchableOpacity style={styles.tapLogBtn}>
              <Text style={styles.tapLogBtnText}>Log New Tap</Text>
            </TouchableOpacity>
          </View>
        );
      case 'lifestyle':
        return (
          <>
            {renderField('Diet', diet, setDiet)}
            {renderField('Wake Up Time', wakeUpTime, setWakeUpTime)}
            {renderField('Sleep Time', sleepTime, setSleepTime)}
            {renderToggle('Yoga / Pranayam', yoga, setYoga)}
            {renderToggle('Meditation', meditation, setMeditation)}
          </>
        );
      case 'social':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bio (150 chars)</Text>
              <TextInput
                style={[styles.fieldInput, styles.textArea]}
                value={bio}
                onChangeText={(t) => setBio(t.slice(0, 150))}
                multiline
                numberOfLines={3}
              />
              <Text style={styles.charCount}>{bio.length}/150</Text>
            </View>
            <Text style={styles.subHeader}>Privacy</Text>
            {['public', 'contacts', 'private'].map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.privacyOption, privacy === p && styles.privacyOptionActive]}
                onPress={() => setPrivacy(p)}
              >
                <Ionicons
                  name={p === 'public' ? 'globe' : p === 'contacts' ? 'people' : 'lock-closed'}
                  size={20}
                  color={privacy === p ? colors.saffron[600] : colors.gray[500]}
                />
                <Text style={[styles.privacyText, privacy === p && styles.privacyTextActive]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
                {privacy === p && <Ionicons name="checkmark" size={20} color={colors.saffron[600]} />}
              </TouchableOpacity>
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Edit Profile' }} />

      {/* Section Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.tab, activeSection === s.id && styles.tabActive]}
            onPress={() => setActiveSection(s.id)}
          >
            <Ionicons
              name={s.icon as any}
              size={16}
              color={activeSection === s.id ? colors.white : colors.gray[600]}
            />
            <Text style={[styles.tabText, activeSection === s.id && styles.tabTextActive]}>
              {s.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>{renderContent()}</View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveBar}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  tabContainer: { maxHeight: 52, backgroundColor: colors.white },
  tabContent: { paddingHorizontal: 12, alignItems: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginHorizontal: 4, backgroundColor: colors.gray[100] },
  tabActive: { backgroundColor: colors.saffron[600] },
  tabText: { fontSize: 13, color: colors.gray[600], marginLeft: 6 },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  formCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginBottom: 6 },
  fieldInput: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: colors.gray[400], textAlign: 'right', marginTop: 4 },
  subHeader: { fontSize: 14, fontWeight: '700', color: colors.gray[800], marginTop: 8, marginBottom: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  toggleLabel: { fontSize: 15, color: colors.gray[800] },
  // Tap section
  tapInfo: { alignItems: 'center', padding: 16 },
  tapCard: { alignItems: 'center', marginBottom: 20, backgroundColor: colors.saffron[50], borderRadius: 16, padding: 20, width: '100%' },
  tapValue: { fontSize: 32, fontWeight: '700', color: colors.gray[900], marginTop: 8 },
  tapLabel: { fontSize: 14, color: colors.gray[600], marginTop: 4 },
  tapNote: { fontSize: 13, color: colors.gray[500], textAlign: 'center', marginBottom: 16 },
  tapLogBtn: { backgroundColor: colors.saffron[600], paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  tapLogBtnText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  // Privacy
  privacyOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 8, backgroundColor: colors.gray[50] },
  privacyOptionActive: { backgroundColor: colors.saffron[50], borderWidth: 1, borderColor: colors.saffron[600] },
  privacyText: { flex: 1, fontSize: 15, color: colors.gray[700], marginLeft: 12 },
  privacyTextActive: { color: colors.saffron[700], fontWeight: '600' },
  // Save
  saveBar: { padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  saveBtn: { backgroundColor: colors.saffron[600], paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
