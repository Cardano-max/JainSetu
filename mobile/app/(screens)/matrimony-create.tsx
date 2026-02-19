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

const STEPS = [
  { id: 1, title: 'Profile', icon: 'person' },
  { id: 2, title: 'Education', icon: 'school' },
  { id: 3, title: 'Family', icon: 'people' },
  { id: 4, title: 'Mamaji/Buva', icon: 'heart' },
  { id: 5, title: 'Dharmik', icon: 'sunny' },
  { id: 6, title: 'Tap', icon: 'flame' },
  { id: 7, title: 'Partner', icon: 'search' },
  { id: 8, title: 'Contact', icon: 'call' },
];

const DHARMIK_PRACTICES = ['samayik', 'pratikraman', 'swadhyay', 'dev-darshan'];
const TAP_TYPES = ['upvas', 'ekasana', 'beasana', 'ayambil', 'oli', 'varshitap'];

export default function MatrimonyCreateScreen() {
  const [step, setStep] = useState(1);

  // Step 1: Profile
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [complexion, setComplexion] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Never Married');
  const [diet, setDiet] = useState('Jain');
  const [sect, setSect] = useState('');
  const [caste, setCaste] = useState('');
  const [gotra, setGotra] = useState('');
  const [city, setCity] = useState('');
  const [nativePaternal, setNativePaternal] = useState('');
  const [nativeMaternal, setNativeMaternal] = useState('');

  // Step 2: Education
  const [degree, setDegree] = useState('');
  const [college, setCollege] = useState('');
  const [occupation, setOccupation] = useState('');
  const [company, setCompany] = useState('');
  const [income, setIncome] = useState('');

  // Step 3: Family
  const [fatherName, setFatherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [familyType, setFamilyType] = useState('Nuclear');
  const [familyAbout, setFamilyAbout] = useState('');

  // Step 4: Mamaji/Buva
  const [mamajiName, setMamajiName] = useState('');
  const [mamajiCity, setMamajiCity] = useState('');
  const [mamajiOccupation, setMamajiOccupation] = useState('');
  const [buvaName, setBuvaName] = useState('');
  const [buvaCity, setBuvaCity] = useState('');

  // Step 5: Dharmik
  const [practices, setPractices] = useState<string[]>([]);
  const [knowledgeLevel, setKnowledgeLevel] = useState('basic');
  const [pathshalaYears, setPathshalaYears] = useState('');

  // Step 6: Tap
  const [tapTypes, setTapTypes] = useState<string[]>([]);
  const [totalUpvas, setTotalUpvas] = useState('');
  const [totalAyambil, setTotalAyambil] = useState('');
  const [biggestTap, setBiggestTap] = useState('');

  // Step 7: Partner Prefs
  const [prefAgeMin, setPrefAgeMin] = useState('');
  const [prefAgeMax, setPrefAgeMax] = useState('');
  const [prefSect, setPrefSect] = useState('');
  const [prefEducation, setPrefEducation] = useState('');

  // Step 8: Contact
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPhone, setShowPhone] = useState(false);
  const [about, setAbout] = useState('');

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder || label}
        placeholderTextColor={colors.gray[400]}
        multiline={multiline}
      />
    </View>
  );

  const renderChips = (options: string[], selected: string[], onToggle: (v: string) => void) => (
    <View style={styles.chipsRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.chip, selected.includes(opt) && styles.chipActive]}
          onPress={() => onToggle(opt)}
        >
          <Text style={[styles.chipText, selected.includes(opt) && styles.chipTextActive]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            {renderField('Full Name', name, setName)}
            <View style={styles.genderRow}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                {(['male', 'female'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                    onPress={() => setGender(g)}
                  >
                    <Ionicons name={g === 'male' ? 'man' : 'woman'} size={20} color={gender === g ? colors.white : colors.gray[600]} />
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g === 'male' ? 'Male' : 'Female'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {renderField('Date of Birth', dob, setDob, 'YYYY-MM-DD')}
            {renderField('Height', height, setHeight, "e.g. 5'8\"")}
            {renderField('Weight', weight, setWeight, 'e.g. 65 kg')}
            {renderField('Complexion', complexion, setComplexion)}
            {renderField('Blood Group', bloodGroup, setBloodGroup)}
            {renderField('Sect / Sampraday', sect, setSect, 'e.g. Shwetambar')}
            {renderField('Caste', caste, setCaste)}
            {renderField('Gotra', gotra, setGotra)}
            {renderField('Current City', city, setCity)}
            {renderField('Native Place (Paternal)', nativePaternal, setNativePaternal)}
            {renderField('Native Place (Maternal)', nativeMaternal, setNativeMaternal)}
          </>
        );
      case 2:
        return (
          <>
            {renderField('Degree / Qualification', degree, setDegree)}
            {renderField('College / University', college, setCollege)}
            {renderField('Occupation', occupation, setOccupation)}
            {renderField('Company / Business Name', company, setCompany)}
            {renderField('Annual Income Range', income, setIncome, 'e.g. 10-15 LPA')}
          </>
        );
      case 3:
        return (
          <>
            {renderField('Father Name', fatherName, setFatherName)}
            {renderField("Father's Occupation", fatherOccupation, setFatherOccupation)}
            {renderField('Mother Name', motherName, setMotherName)}
            {renderField("Mother's Occupation", motherOccupation, setMotherOccupation)}
            <View style={styles.genderRow}>
              <Text style={styles.fieldLabel}>Family Type</Text>
              <View style={styles.genderOptions}>
                {['Nuclear', 'Joint'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.genderBtn, familyType === t && styles.genderBtnActive]}
                    onPress={() => setFamilyType(t)}
                  >
                    <Text style={[styles.genderText, familyType === t && styles.genderTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {renderField('About Family', familyAbout, setFamilyAbout, 'Brief description...', true)}
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.stepDesc}>Add your Mamaji (mother's brother) and Buva (father's sister) details.</Text>
            <Text style={styles.subTitle}>Mamaji</Text>
            {renderField('Name', mamajiName, setMamajiName)}
            {renderField('City', mamajiCity, setMamajiCity)}
            {renderField('Occupation', mamajiOccupation, setMamajiOccupation)}
            <Text style={styles.subTitle}>Buva</Text>
            {renderField('Name', buvaName, setBuvaName)}
            {renderField('City', buvaCity, setBuvaCity)}
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.fieldLabel}>Daily Dharmik Routine</Text>
            {renderChips(DHARMIK_PRACTICES, practices, (p) => toggleItem(practices, setPractices, p))}
            <View style={styles.genderRow}>
              <Text style={styles.fieldLabel}>Knowledge Level</Text>
              <View style={styles.genderOptions}>
                {['basic', 'intermediate', 'advanced'].map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.genderBtn, knowledgeLevel === l && styles.genderBtnActive]}
                    onPress={() => setKnowledgeLevel(l)}
                  >
                    <Text style={[styles.genderText, knowledgeLevel === l && styles.genderTextActive]}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {renderField('Pathshala Years', pathshalaYears, setPathshalaYears, 'e.g. 8')}
          </>
        );
      case 6:
        return (
          <>
            <Text style={styles.fieldLabel}>Tap Types</Text>
            {renderChips(TAP_TYPES, tapTypes, (t) => toggleItem(tapTypes, setTapTypes, t))}
            {renderField('Total Upvas (lifetime)', totalUpvas, setTotalUpvas)}
            {renderField('Total Ayambil (lifetime)', totalAyambil, setTotalAyambil)}
            {renderField('Biggest Tap', biggestTap, setBiggestTap, 'e.g. Varshitap')}
          </>
        );
      case 7:
        return (
          <>
            <Text style={styles.stepDesc}>What are you looking for in a partner?</Text>
            {renderField('Age Min', prefAgeMin, setPrefAgeMin)}
            {renderField('Age Max', prefAgeMax, setPrefAgeMax)}
            {renderField('Sect Preference', prefSect, setPrefSect)}
            {renderField('Education Preference', prefEducation, setPrefEducation)}
          </>
        );
      case 8:
        return (
          <>
            {renderField('Phone Number', phone, setPhone, '+91...')}
            {renderField('Email', email, setEmail)}
            {renderField('WhatsApp', whatsapp, setWhatsapp)}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Show phone publicly</Text>
              <Switch
                value={showPhone}
                onValueChange={setShowPhone}
                trackColor={{ false: colors.gray[300], true: colors.saffron[300] }}
                thumbColor={showPhone ? colors.saffron[600] : colors.gray[400]}
              />
            </View>
            {renderField('About Me', about, setAbout, 'Brief introduction...', true)}
          </>
        );
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    Alert.alert('Biodata Created!', 'Your matrimony biodata has been created successfully. It will be visible to other users after verification.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Create Biodata' }} />

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 8) * 100}%` }]} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>Step {step} of 8</Text>
        <Text style={styles.stepTitle}>{STEPS[step - 1].title}</Text>
      </View>

      <ScrollView style={styles.formContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>{renderStep()}</View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navBar}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color={colors.gray[700]} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        {step < 8 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
            <Text style={styles.nextBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.submitBtnText}>Submit Biodata</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  progressBar: { height: 4, backgroundColor: colors.gray[200] },
  progressFill: { height: '100%', backgroundColor: colors.saffron[600], borderRadius: 2 },
  stepHeader: { padding: 16, backgroundColor: colors.white },
  stepNumber: { fontSize: 12, color: colors.gray[500] },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.gray[900], marginTop: 2 },
  stepDesc: { fontSize: 13, color: colors.gray[600], marginBottom: 16 },
  subTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[800], marginTop: 16, marginBottom: 8 },
  formContent: { flex: 1, padding: 16 },
  formCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginBottom: 6 },
  fieldInput: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  genderRow: { marginBottom: 16 },
  genderOptions: { flexDirection: 'row', marginTop: 6 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: colors.gray[100], marginRight: 8 },
  genderBtnActive: { backgroundColor: colors.saffron[600] },
  genderText: { fontSize: 14, color: colors.gray[600], marginLeft: 6 },
  genderTextActive: { color: colors.white, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray[100], marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: colors.saffron[600] },
  chipText: { fontSize: 13, color: colors.gray[700] },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleLabel: { fontSize: 15, color: colors.gray[800] },
  // Navigation
  navBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  backBtnText: { fontSize: 14, color: colors.gray[700], marginLeft: 6 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  nextBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginRight: 6 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  submitBtnText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
});
