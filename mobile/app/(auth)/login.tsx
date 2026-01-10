import { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '@/lib/store';
import api from '@/lib/api';
import colors from '@/lib/colors';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone, purpose: 'login' });
      if (response.data.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent successfully');
        // Show OTP in dev mode
        if (response.data.otp) {
          Alert.alert('Dev Mode', `OTP: ${response.data.otp}`);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await login(phone, otp);

      if (result.isNewUser) {
        router.replace({
          pathname: '/(auth)/register',
          params: { phone, registrationToken: result.registrationToken },
        });
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.saffron[50], colors.primary[100]]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>J</Text>
            </View>
            <Text style={styles.title}>JainSetu</Text>
            <Text style={styles.subtitle}>Connecting Jain Community</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign In</Text>
              <Text style={styles.cardSubtitle}>Enter your phone number to continue</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInput}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={phone}
                    onChangeText={(text) => setPhone(text.replace(/\D/g, ''))}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!otpSent}
                  />
                </View>
              </View>

              {!otpSent ? (
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSendOtp}
                  disabled={loading || phone.length < 10}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>OTP</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChangeText={(text) => setOtp(text.replace(/\D/g, ''))}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setOtpSent(false);
                      setOtp('');
                    }}
                  >
                    <Text style={styles.changePhone}>Change phone number</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading || otp.length !== 6}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.saffron[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.gray[100],
    fontSize: 16,
    color: colors.gray[700],
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.gray[900],
  },
  button: {
    backgroundColor: colors.saffron[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  changePhone: {
    color: colors.saffron[600],
    fontSize: 14,
    marginBottom: 16,
  },
});
