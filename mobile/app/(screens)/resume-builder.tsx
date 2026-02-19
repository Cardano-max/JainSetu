import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

const STEPS = ['Career Profile', 'Education', 'Experience', 'Skills', 'Preferences'];

export default function ResumeBuilderScreen() {
  const [step, setStep] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('working');
  const [objective, setObjective] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [qualification, setQualification] = useState('');
  const [course, setCourse] = useState('');
  const [college, setCollege] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [expCompany, setExpCompany] = useState('');
  const [expRole, setExpRole] = useState('');
  const [expDuration, setExpDuration] = useState('');
  const [expResp, setExpResp] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [expectedSalary, setExpectedSalary] = useState('');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [immediateJoiner, setImmediateJoiner] = useState(false);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={[styles.fieldInput, multiline && styles.textArea]} value={value} onChangeText={onChange} placeholder={placeholder || label} placeholderTextColor={colors.gray[400]} multiline={multiline} />
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.fieldLabel}>Current Status</Text>
            <View style={styles.chipRow}>
              {['working', 'fresher', 'student', 'business'].map((s) => (
                <TouchableOpacity key={s} style={[styles.chip, currentStatus === s && styles.chipActive]} onPress={() => setCurrentStatus(s)}>
                  <Text style={[styles.chipText, currentStatus === s && styles.chipTextActive]}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {renderField('Career Objective', objective, setObjective, 'Brief career summary...', true)}
            {currentStatus === 'working' && renderField('Current Company', currentCompany, setCurrentCompany)}
            {currentStatus === 'working' && renderField('Current Salary', currentSalary, setCurrentSalary, 'e.g. 5 LPA')}
          </>
        );
      case 1:
        return (
          <>
            {renderField('Qualification', qualification, setQualification, 'e.g. B.Tech')}
            {renderField('Course/Stream', course, setCourse, 'e.g. Computer Science')}
            {renderField('College/University', college, setCollege)}
            {renderField('Passing Year', passingYear, setPassingYear, 'e.g. 2021')}
          </>
        );
      case 2:
        return (
          <>
            {renderField('Company Name', expCompany, setExpCompany)}
            {renderField('Role/Designation', expRole, setExpRole)}
            {renderField('Duration', expDuration, setExpDuration, 'e.g. 2021 - Present')}
            {renderField('Key Responsibilities', expResp, setExpResp, 'Describe your work...', true)}
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.skillInputRow}>
              <TextInput style={styles.skillInputField} value={skillInput} onChangeText={setSkillInput} placeholder="Add a skill..." placeholderTextColor={colors.gray[400]} onSubmitEditing={addSkill} />
              <TouchableOpacity style={styles.addSkillBtn} onPress={addSkill}>
                <Ionicons name="add" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.skillsList}>
              {skills.map((s, i) => (
                <View key={i} style={styles.skillItem}>
                  <Text style={styles.skillItemText}>{s}</Text>
                  <TouchableOpacity onPress={() => setSkills(skills.filter((_, idx) => idx !== i))}>
                    <Ionicons name="close-circle" size={18} color={colors.gray[400]} />
                  </TouchableOpacity>
                </View>
              ))}
              {skills.length === 0 && <Text style={styles.emptyText}>No skills added yet</Text>}
            </View>
          </>
        );
      case 4:
        return (
          <>
            {renderField('Expected Salary', expectedSalary, setExpectedSalary, 'e.g. 8 LPA')}
            {renderField('Preferred Locations', preferredLocations, setPreferredLocations, 'Surat, Ahmedabad, Mumbai')}
            {renderField('Notice Period', noticePeriod, setNoticePeriod, 'e.g. 30 days')}
            <TouchableOpacity style={styles.toggleRow} onPress={() => setImmediateJoiner(!immediateJoiner)}>
              <Text style={styles.toggleLabel}>Immediate Joiner</Text>
              <Ionicons name={immediateJoiner ? 'checkbox' : 'square-outline'} size={24} color={immediateJoiner ? colors.saffron[600] : colors.gray[400]} />
            </TouchableOpacity>
          </>
        );
      default: return null;
    }
  };

  const handleSubmit = () => {
    Alert.alert('Resume Created!', 'Your professional resume has been saved. Employers can now find you.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Build Resume' }} />
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${((step + 1) / 5) * 100}%` }]} /></View>
      <View style={styles.stepHeader}><Text style={styles.stepNum}>Step {step + 1} of 5</Text><Text style={styles.stepTitle}>{STEPS[step]}</Text></View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}><View style={styles.formCard}>{renderStep()}</View></ScrollView>
      <View style={styles.navBar}>
        {step > 0 ? <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}><Ionicons name="arrow-back" size={20} color={colors.gray[700]} /><Text style={styles.backText}>Back</Text></TouchableOpacity> : <View />}
        {step < 4 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}><Text style={styles.nextText}>Next</Text><Ionicons name="arrow-forward" size={20} color={colors.white} /></TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}><Ionicons name="checkmark" size={20} color={colors.white} /><Text style={styles.submitText}>Save Resume</Text></TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  progress: { height: 4, backgroundColor: colors.gray[200] },
  progressFill: { height: '100%', backgroundColor: colors.saffron[600] },
  stepHeader: { padding: 16, backgroundColor: colors.white },
  stepNum: { fontSize: 12, color: colors.gray[500] },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.gray[900], marginTop: 2 },
  content: { flex: 1, padding: 16 },
  formCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.gray[600], marginBottom: 6 },
  fieldInput: { backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray[100], marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: colors.saffron[600] },
  chipText: { fontSize: 13, color: colors.gray[700] },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  skillInputRow: { flexDirection: 'row', marginBottom: 16 },
  skillInputField: { flex: 1, backgroundColor: colors.gray[50], borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.gray[900] },
  addSkillBtn: { width: 48, height: 48, borderRadius: 10, backgroundColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  skillsList: { minHeight: 60 },
  skillItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.gray[50], paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 8 },
  skillItemText: { fontSize: 14, color: colors.gray[800] },
  emptyText: { fontSize: 14, color: colors.gray[400], textAlign: 'center', marginTop: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  toggleLabel: { fontSize: 15, color: colors.gray[800] },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  backText: { fontSize: 14, color: colors.gray[700], marginLeft: 6 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  nextText: { color: colors.white, fontSize: 14, fontWeight: '600', marginRight: 6 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
});
