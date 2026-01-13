import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import colors from '@/lib/colors';

export default function RegisterScreen() {
  const { phone, registrationToken } = useLocalSearchParams<{
    phone: string;
    registrationToken: string;
  }>();

  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<Array<{ id: string; name: string; state: string }>>([]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    cityId: '',
    sect: '',
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get('/locations/cities');
      setCities(response.cities || []);
    } catch (error) {
      console.error('Failed to fetch cities');
    }
  };

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await register({
        phone,
        registrationToken,
        ...form,
        cityId: form.cityId || null,
        sect: form.sect || null,
      });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Profile</Text>
          <Text style={styles.subtitle}>Tell us about yourself</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={form.firstName}
                onChangeText={(text) => setForm({ ...form, firstName: text })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={form.lastName}
                onChangeText={(text) => setForm({ ...form, lastName: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(value) => setForm({ ...form, gender: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select gender" value="" />
                <Picker.Item label="Male" value="MALE" />
                <Picker.Item label="Female" value="FEMALE" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.cityId}
                onValueChange={(value) => setForm({ ...form, cityId: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select city" value="" />
                {cities.map((city) => (
                  <Picker.Item
                    key={city.id}
                    label={`${city.name}, ${city.state}`}
                    value={city.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sect</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.sect}
                onValueChange={(value) => setForm({ ...form, sect: value })}
                style={styles.picker}
              >
                <Picker.Item label="Select sect" value="" />
                <Picker.Item label="Digambar" value="DIGAMBAR" />
                <Picker.Item label="Shwetambar" value="SHWETAMBAR" />
                <Picker.Item label="Sthanakvasi" value="STHANAKVASI" />
                <Picker.Item label="Terapanthi" value="TERAPANTHI" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating account...' : 'Complete Registration'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: colors.saffron[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
