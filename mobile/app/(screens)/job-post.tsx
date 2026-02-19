import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

const STEPS = ['Company', 'Job Details', 'Salary', 'Requirements', 'Settings'];

export default function JobPostScreen() {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('full-time');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState('onsite');
  const [description, setDescription] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [benefits, setBenefits] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [openings, setOpenings] = useState('1');
  const [deadline, setDeadline] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const renderField = (label: string, value: string, onChange: (v: string) => void, placeholder?: string, multiline?: boolean, keyboardType?: any) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput style={[styles.fieldInput, multiline && styles.textArea]} value={value} onChangeText={onChange} placeholder={placeholder || label} placeholderTextColor={colors.gray[400]} multiline={multiline} keyboardType={keyboardType} />
    </View>
  );

  const renderChips = (options: string[], selected: string, onSelect: (v: string) => void) => (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <TouchableOpacity key={o} style={[styles.chip, selected === o && styles.chipActive]} onPress={() => onSelect(o)}>
          <Text style={[styles.chipText, selected === o && styles.chipTextActive]}>{o}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return (<>{renderField('Company Name', companyName, setCompanyName)}{renderField('Industry', industry, setIndustry, 'e.g. IT, Finance, Event')}{renderField('Company Size', companySize, setCompanySize, 'e.g. 10-50')}{renderField('Website', website, setWebsite, 'https://')}</>);
      case 1: return (<>{renderField('Job Title', title, setTitle)}<Text style={styles.fieldLabel}>Job Type</Text>{renderChips(['full-time', 'part-time', 'contract', 'internship'], jobType, setJobType)}{renderField('Location', location, setLocation)}<Text style={styles.fieldLabel}>Work Mode</Text>{renderChips(['onsite', 'remote', 'hybrid'], workMode, setWorkMode)}{renderField('Description', description, setDescription, 'Job description...', true)}</>);
      case 2: return (<>{renderField('Salary Min (Annual)', salaryMin, setSalaryMin, 'e.g. 500000', false, 'numeric')}{renderField('Salary Max (Annual)', salaryMax, setSalaryMax, 'e.g. 1000000', false, 'numeric')}{renderField('Benefits (comma separated)', benefits, setBenefits, 'PF, Insurance, Bonus...')}</>);
      case 3: return (<>{renderField('Skills Required (comma separated)', skills, setSkills, 'React, Node.js, Python...')}{renderField('Experience Required', experience, setExperience, 'e.g. 2-4 years')}{renderField('Education Required', education, setEducation, 'e.g. B.Tech / MBA')}</>);
      case 4: return (<>{renderField('Number of Openings', openings, setOpenings, '1', false, 'numeric')}{renderField('Application Deadline', deadline, setDeadline, 'YYYY-MM-DD')}{renderField('Contact Email', contactEmail, setContactEmail)}</>);
      default: return null;
    }
  };

  const handleSubmit = () => {
    Alert.alert('Job Posted!', 'Your job posting has been submitted and will be live after review.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Post a Job' }} />
      <View style={styles.progress}><View style={[styles.progressFill, { width: `${((step + 1) / 5) * 100}%` }]} /></View>
      <View style={styles.stepHeader}><Text style={styles.stepNum}>Step {step + 1} of 5</Text><Text style={styles.stepTitle}>{STEPS[step]}</Text></View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}><View style={styles.formCard}>{renderStep()}</View></ScrollView>
      <View style={styles.navBar}>
        {step > 0 ? <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}><Ionicons name="arrow-back" size={20} color={colors.gray[700]} /><Text style={styles.backText}>Back</Text></TouchableOpacity> : <View />}
        {step < 4 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}><Text style={styles.nextText}>Next</Text><Ionicons name="arrow-forward" size={20} color={colors.white} /></TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}><Ionicons name="checkmark" size={20} color={colors.white} /><Text style={styles.submitText}>Post Job</Text></TouchableOpacity>
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
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, marginTop: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.gray[100], marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: colors.saffron[600] },
  chipText: { fontSize: 13, color: colors.gray[700], textTransform: 'capitalize' },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  backText: { fontSize: 14, color: colors.gray[700], marginLeft: 6 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.saffron[600], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  nextText: { color: colors.white, fontSize: 14, fontWeight: '600', marginRight: 6 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.green[500], paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10 },
  submitText: { color: colors.white, fontSize: 14, fontWeight: '600', marginLeft: 6 },
});
