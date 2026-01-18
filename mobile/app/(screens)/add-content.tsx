import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

type ContentType = 'post' | 'story' | 'matrimony' | 'job' | 'business' | 'donation' | 'tirth';

interface ContentOption {
  id: ContentType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const CONTENT_OPTIONS: ContentOption[] = [
  {
    id: 'post',
    title: 'Create Post',
    description: 'Share updates, thoughts, or images',
    icon: 'newspaper',
    color: colors.saffron[500],
  },
  {
    id: 'story',
    title: 'Add Story',
    description: 'Share moments that disappear in 24h',
    icon: 'add-circle',
    color: colors.purple[500],
  },
  {
    id: 'matrimony',
    title: 'Matrimony Profile',
    description: 'Create a matrimony listing',
    icon: 'heart-circle',
    color: colors.pink[500],
  },
  {
    id: 'job',
    title: 'Post Job',
    description: 'Hire or find job opportunities',
    icon: 'briefcase',
    color: colors.blue[500],
  },
  {
    id: 'business',
    title: 'List Business',
    description: 'Add your business to directory',
    icon: 'storefront',
    color: colors.green[500],
  },
  {
    id: 'donation',
    title: 'Create Donation',
    description: 'Start a donation campaign',
    icon: 'heart',
    color: colors.red[500],
  },
  {
    id: 'tirth',
    title: 'Add Tirth/Dharamshala',
    description: 'Add a new pilgrimage place',
    icon: 'location',
    color: colors.teal[500],
  },
];

export default function AddContentScreen() {
  const { type } = useLocalSearchParams<{ type?: ContentType }>();
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<ContentType | null>(type || null);
  const [loading, setLoading] = useState(false);

  // Form states for different content types
  const [postForm, setPostForm] = useState({ title: '', content: '', category: '' });
  const [matrimonyForm, setMatrimonyForm] = useState({
    fullName: '',
    age: '',
    height: '',
    education: '',
    occupation: '',
    income: '',
    sect: '',
    gotra: '',
    city: '',
    about: '',
    lookingFor: '',
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    requirements: '',
    contactEmail: '',
    contactPhone: '',
  });
  const [businessForm, setBusinessForm] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    gstNumber: '',
  });
  const [donationForm, setDonationForm] = useState({
    title: '',
    organization: '',
    targetAmount: '',
    description: '',
    purpose: '',
    bankDetails: '',
    contactPerson: '',
    contactPhone: '',
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'Submitted Successfully!',
        'Your submission has been sent for admin approval. You will be notified once it is approved.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContentTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>What would you like to create?</Text>
      <View style={styles.optionsGrid}>
        {CONTENT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedType === option.id && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType(option.id)}
          >
            <View style={[styles.optionIcon, { backgroundColor: `${option.color}15` }]}>
              <Ionicons name={option.icon as any} size={28} color={option.color} />
            </View>
            <Text style={styles.optionTitle}>{option.title}</Text>
            <Text style={styles.optionDescription}>{option.description}</Text>
            {selectedType === option.id && (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={colors.saffron[600]} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPostForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create a Post</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Post title"
          value={postForm.title}
          onChangeText={(text) => setPostForm({ ...postForm, title: text })}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Content</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What's on your mind?"
          value={postForm.content}
          onChangeText={(text) => setPostForm({ ...postForm, content: text })}
          multiline
          numberOfLines={5}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={postForm.category}
            onValueChange={(value) => setPostForm({ ...postForm, category: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select category" value="" />
            <Picker.Item label="General" value="general" />
            <Picker.Item label="Spiritual" value="spiritual" />
            <Picker.Item label="Community" value="community" />
            <Picker.Item label="Events" value="events" />
          </Picker>
        </View>
      </View>
      <TouchableOpacity style={styles.addPhotoButton}>
        <Ionicons name="camera" size={24} color={colors.saffron[600]} />
        <Text style={styles.addPhotoText}>Add Photo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMatrimonyForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Matrimony Profile</Text>
      <Text style={styles.formSubtitle}>Your profile will be reviewed by admin before publishing</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={matrimonyForm.fullName}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, fullName: text })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Age *</Text>
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={matrimonyForm.age}
            onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, age: text })}
            keyboardType="number-pad"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Height</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 5'6\""
            value={matrimonyForm.height}
            onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, height: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Education *</Text>
        <TextInput
          style={styles.input}
          placeholder="Highest education"
          value={matrimonyForm.education}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, education: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Occupation *</Text>
        <TextInput
          style={styles.input}
          placeholder="Current occupation"
          value={matrimonyForm.occupation}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, occupation: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Annual Income</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 5-10 LPA"
          value={matrimonyForm.income}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, income: text })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Sect</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={matrimonyForm.sect}
              onValueChange={(value) => setMatrimonyForm({ ...matrimonyForm, sect: value })}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Digambar" value="DIGAMBAR" />
              <Picker.Item label="Shwetambar" value="SHWETAMBAR" />
              <Picker.Item label="Sthanakvasi" value="STHANAKVASI" />
              <Picker.Item label="Terapanthi" value="TERAPANTHI" />
            </Picker>
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Gotra</Text>
          <TextInput
            style={styles.input}
            placeholder="Gotra"
            value={matrimonyForm.gotra}
            onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, gotra: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          placeholder="Current city"
          value={matrimonyForm.city}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, city: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>About Yourself</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write something about yourself..."
          value={matrimonyForm.about}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, about: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Partner Preferences</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What are you looking for in a partner?"
          value={matrimonyForm.lookingFor}
          onChangeText={(text) => setMatrimonyForm({ ...matrimonyForm, lookingFor: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.addPhotoButton}>
        <Ionicons name="camera" size={24} color={colors.saffron[600]} />
        <Text style={styles.addPhotoText}>Add Photos (Max 5)</Text>
      </TouchableOpacity>
    </View>
  );

  const renderJobForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Post a Job</Text>
      <Text style={styles.formSubtitle}>Find the right candidate for your company</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Accountant, Manager"
          value={jobForm.title}
          onChangeText={(text) => setJobForm({ ...jobForm, title: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Company Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your company name"
          value={jobForm.company}
          onChangeText={(text) => setJobForm({ ...jobForm, company: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Job location"
          value={jobForm.location}
          onChangeText={(text) => setJobForm({ ...jobForm, location: text })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Job Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={jobForm.type}
              onValueChange={(value) => setJobForm({ ...jobForm, type: value })}
              style={styles.picker}
            >
              <Picker.Item label="Full Time" value="full-time" />
              <Picker.Item label="Part Time" value="part-time" />
              <Picker.Item label="Contract" value="contract" />
              <Picker.Item label="Internship" value="internship" />
            </Picker>
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Salary</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3-5 LPA"
            value={jobForm.salary}
            onChangeText={(text) => setJobForm({ ...jobForm, salary: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Job Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the job role and responsibilities..."
          value={jobForm.description}
          onChangeText={(text) => setJobForm({ ...jobForm, description: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Requirements</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Required skills, qualifications..."
          value={jobForm.requirements}
          onChangeText={(text) => setJobForm({ ...jobForm, requirements: text })}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Contact Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={jobForm.contactEmail}
            onChangeText={(text) => setJobForm({ ...jobForm, contactEmail: text })}
            keyboardType="email-address"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={jobForm.contactPhone}
            onChangeText={(text) => setJobForm({ ...jobForm, contactPhone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderBusinessForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>List Your Business</Text>
      <Text style={styles.formSubtitle}>Get discovered by the Jain community</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Your business name"
          value={businessForm.name}
          onChangeText={(text) => setBusinessForm({ ...businessForm, name: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={businessForm.category}
            onValueChange={(value) => setBusinessForm({ ...businessForm, category: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select category" value="" />
            <Picker.Item label="Retail / Shop" value="retail" />
            <Picker.Item label="Restaurant / Food" value="food" />
            <Picker.Item label="Services" value="services" />
            <Picker.Item label="Manufacturing" value="manufacturing" />
            <Picker.Item label="IT / Software" value="it" />
            <Picker.Item label="Healthcare" value="healthcare" />
            <Picker.Item label="Education" value="education" />
            <Picker.Item label="Real Estate" value="realestate" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your business..."
          value={businessForm.description}
          onChangeText={(text) => setBusinessForm({ ...businessForm, description: text })}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Full address"
          value={businessForm.address}
          onChangeText={(text) => setBusinessForm({ ...businessForm, address: text })}
          multiline
          numberOfLines={2}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City *</Text>
        <TextInput
          style={styles.input}
          placeholder="City"
          value={businessForm.city}
          onChangeText={(text) => setBusinessForm({ ...businessForm, city: text })}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={businessForm.phone}
            onChangeText={(text) => setBusinessForm({ ...businessForm, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={businessForm.email}
            onChangeText={(text) => setBusinessForm({ ...businessForm, email: text })}
            keyboardType="email-address"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Website</Text>
        <TextInput
          style={styles.input}
          placeholder="https://..."
          value={businessForm.website}
          onChangeText={(text) => setBusinessForm({ ...businessForm, website: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GST Number</Text>
        <TextInput
          style={styles.input}
          placeholder="GST number (optional)"
          value={businessForm.gstNumber}
          onChangeText={(text) => setBusinessForm({ ...businessForm, gstNumber: text })}
        />
      </View>

      <TouchableOpacity style={styles.addPhotoButton}>
        <Ionicons name="camera" size={24} color={colors.saffron[600]} />
        <Text style={styles.addPhotoText}>Add Business Logo / Photos</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDonationForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create Donation Campaign</Text>
      <Text style={styles.formSubtitle}>Raise funds for a noble cause</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Campaign Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Temple Renovation Fund"
          value={donationForm.title}
          onChangeText={(text) => setDonationForm({ ...donationForm, title: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Organization / Trust Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Organization name"
          value={donationForm.organization}
          onChangeText={(text) => setDonationForm({ ...donationForm, organization: text })}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Target Amount (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 100000"
          value={donationForm.targetAmount}
          onChangeText={(text) => setDonationForm({ ...donationForm, targetAmount: text })}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Purpose *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={donationForm.purpose}
            onValueChange={(value) => setDonationForm({ ...donationForm, purpose: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select purpose" value="" />
            <Picker.Item label="Temple Construction" value="temple" />
            <Picker.Item label="Education Support" value="education" />
            <Picker.Item label="Medical Aid" value="medical" />
            <Picker.Item label="Food Distribution" value="food" />
            <Picker.Item label="Community Event" value="event" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe the cause and how funds will be used..."
          value={donationForm.description}
          onChangeText={(text) => setDonationForm({ ...donationForm, description: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Details / UPI</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Bank account or UPI details for donations"
          value={donationForm.bankDetails}
          onChangeText={(text) => setDonationForm({ ...donationForm, bankDetails: text })}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Contact Person</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={donationForm.contactPerson}
            onChangeText={(text) => setDonationForm({ ...donationForm, contactPerson: text })}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            value={donationForm.contactPhone}
            onChangeText={(text) => setDonationForm({ ...donationForm, contactPhone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    </View>
  );

  const renderForm = () => {
    switch (selectedType) {
      case 'post':
        return renderPostForm();
      case 'matrimony':
        return renderMatrimonyForm();
      case 'job':
        return renderJobForm();
      case 'business':
        return renderBusinessForm();
      case 'donation':
        return renderDonationForm();
      case 'story':
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add Story</Text>
            <Text style={styles.comingSoon}>
              Story upload feature coming soon! You will be able to share photos and videos.
            </Text>
          </View>
        );
      case 'tirth':
        return (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add Tirth / Dharamshala</Text>
            <Text style={styles.comingSoon}>
              This feature is coming soon! Admin can add new pilgrimage places.
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: selectedType ? 'Create Content' : 'Add New',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (selectedType) {
                  setSelectedType(null);
                } else {
                  router.back();
                }
              }}
            >
              <Ionicons
                name={selectedType ? 'arrow-back' : 'close'}
                size={24}
                color={colors.gray[700]}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {!selectedType ? renderContentTypeSelector() : renderForm()}
        </ScrollView>

        {selectedType && selectedType !== 'story' && selectedType !== 'tirth' && (
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.submitButtonText}>Submit for Review</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.submitNote}>
              Your submission will be reviewed by admin before publishing
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  selectorContainer: {
    flex: 1,
  },
  selectorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionCard: {
    width: '50%',
    padding: 6,
  },
  optionCardSelected: {},
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 11,
    color: colors.gray[500],
  },
  selectedBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.saffron[200],
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    marginTop: 8,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.saffron[600],
    marginLeft: 8,
  },
  comingSoon: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 20,
    paddingVertical: 40,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  submitNote: {
    fontSize: 11,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
  },
});
