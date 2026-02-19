import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';

const CATEGORIES = [
  'Retail', 'Food & Restaurant', 'Healthcare', 'Education',
  'Professional Services', 'Real Estate', 'Manufacturing', 'Technology', 'Other',
];

interface ProductItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

export default function AddBusinessScreen() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [products, setProducts] = useState<ProductItem[]>([]);

  const addProduct = () => {
    if (products.length >= 5) {
      Alert.alert('Limit Reached', 'You can add up to 5 products.');
      return;
    }
    setProducts([...products, { id: Date.now().toString(), name: '', price: '', description: '' }]);
  };

  const updateProduct = (id: string, field: keyof ProductItem, value: string) => {
    setProducts(products.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSubmit = () => {
    if (!businessName.trim() || !category || !phone.trim()) {
      Alert.alert('Required Fields', 'Please fill in business name, category, and phone number.');
      return;
    }
    Alert.alert(
      'Submitted for Review',
      'Your business listing has been submitted. It will appear after admin verification.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Business Details</Text>
      <Text style={styles.label}>Business Name *</Text>
      <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} placeholder="Enter business name" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>Owner Name</Text>
      <TextInput style={styles.input} value={ownerName} onChangeText={setOwnerName} placeholder="Enter owner name" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.chipGrid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} placeholder="Describe your business..." placeholderTextColor={colors.gray[400]} multiline numberOfLines={3} textAlignVertical="top" />
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Contact & Location</Text>
      <Text style={styles.label}>Phone Number *</Text>
      <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>WhatsApp Number</Text>
      <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} placeholder="Enter WhatsApp number" keyboardType="phone-pad" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="business@email.com" keyboardType="email-address" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>Website</Text>
      <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://www.example.com" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>Address</Text>
      <TextInput style={[styles.input, styles.textArea]} value={address} onChangeText={setAddress} placeholder="Full business address" placeholderTextColor={colors.gray[400]} multiline numberOfLines={2} textAlignVertical="top" />

      <Text style={styles.label}>City</Text>
      <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter city" placeholderTextColor={colors.gray[400]} />

      <Text style={styles.label}>GST Number (Optional)</Text>
      <TextInput style={styles.input} value={gstNumber} onChangeText={setGstNumber} placeholder="Enter GST number" placeholderTextColor={colors.gray[400]} />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Products (Up to 5)</Text>
      <Text style={styles.stepSubtitle}>Add your top products or services to showcase</Text>

      {products.map((product, index) => (
        <View key={product.id} style={styles.productCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productNum}>Product {index + 1}</Text>
            <TouchableOpacity onPress={() => removeProduct(product.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={product.name}
            onChangeText={(v) => updateProduct(product.id, 'name', v)}
            placeholder="Product name"
            placeholderTextColor={colors.gray[400]}
          />
          <TextInput
            style={styles.input}
            value={product.price}
            onChangeText={(v) => updateProduct(product.id, 'price', v)}
            placeholder="Price (e.g. Rs. 500)"
            placeholderTextColor={colors.gray[400]}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={product.description}
            onChangeText={(v) => updateProduct(product.id, 'description', v)}
            placeholder="Brief description"
            placeholderTextColor={colors.gray[400]}
          />
          <TouchableOpacity style={styles.photoBtn}>
            <Ionicons name="camera-outline" size={20} color={colors.saffron[600]} />
            <Text style={styles.photoBtnText}>Add Product Photo</Text>
          </TouchableOpacity>
        </View>
      ))}

      {products.length < 5 && (
        <TouchableOpacity style={styles.addProductBtn} onPress={addProduct}>
          <Ionicons name="add-circle-outline" size={22} color={colors.saffron[600]} />
          <Text style={styles.addProductText}>Add Product ({products.length}/5)</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.businessPhotoBtn}>
        <Ionicons name="image-outline" size={24} color={colors.saffron[600]} />
        <Text style={styles.businessPhotoText}>Add Business Cover Photo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Add Business' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        <View style={styles.progressBar}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.progressStep}>
              <View style={[styles.progressDot, step >= s && styles.progressDotActive]}>
                {step > s ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : (
                  <Text style={[styles.progressDotText, step >= s && styles.progressDotTextActive]}>{s}</Text>
                )}
              </View>
              <Text style={[styles.progressLabel, step >= s && styles.progressLabelActive]}>
                {s === 1 ? 'Details' : s === 2 ? 'Contact' : 'Products'}
              </Text>
            </View>
          ))}
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Info Note */}
        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={18} color={colors.blue[500]} />
          <Text style={styles.noteText}>
            Your listing will be reviewed by admin before it appears publicly. This usually takes 24-48 hours.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
            <Ionicons name="arrow-back" size={20} color={colors.gray[700]} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, step === 1 && { flex: 1 }]}
          onPress={() => {
            if (step < 3) setStep(step + 1);
            else handleSubmit();
          }}
        >
          <Text style={styles.nextBtnText}>{step === 3 ? 'Submit for Review' : 'Next'}</Text>
          {step < 3 && <Ionicons name="arrow-forward" size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  scrollContent: { padding: 16, paddingBottom: 100 },
  // Progress
  progressBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, backgroundColor: colors.white, padding: 16, borderRadius: 12 },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.gray[200], justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  progressDotActive: { backgroundColor: colors.saffron[600] },
  progressDotText: { fontSize: 14, fontWeight: '600', color: colors.gray[500] },
  progressDotTextActive: { color: colors.white },
  progressLabel: { fontSize: 11, color: colors.gray[400] },
  progressLabelActive: { color: colors.saffron[600], fontWeight: '600' },
  // Form
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.gray[900], marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: colors.gray[500], marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.gray[700], marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: colors.white, borderRadius: 10, padding: 14, fontSize: 15, color: colors.gray[900], borderWidth: 1, borderColor: colors.gray[200] },
  textArea: { minHeight: 80 },
  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  chipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  chipText: { fontSize: 13, color: colors.gray[700] },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  // Products
  productCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.gray[200] },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productNum: { fontSize: 14, fontWeight: '600', color: colors.saffron[600] },
  photoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: colors.saffron[200], borderRadius: 8, borderStyle: 'dashed', marginTop: 8 },
  photoBtnText: { fontSize: 13, color: colors.saffron[600], marginLeft: 6 },
  addProductBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.saffron[200], borderStyle: 'dashed', marginBottom: 12 },
  addProductText: { fontSize: 14, fontWeight: '600', color: colors.saffron[600], marginLeft: 8 },
  businessPhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], borderStyle: 'dashed' },
  businessPhotoText: { fontSize: 14, color: colors.saffron[600], marginLeft: 8 },
  // Note
  noteCard: { flexDirection: 'row', backgroundColor: colors.blue[50], padding: 12, borderRadius: 10, marginTop: 20, alignItems: 'flex-start' },
  noteText: { fontSize: 12, color: colors.gray[600], marginLeft: 8, flex: 1, lineHeight: 18 },
  // Bottom
  bottomBar: { flexDirection: 'row', padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], marginRight: 12 },
  backBtnText: { fontSize: 14, color: colors.gray[700], marginLeft: 4 },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.saffron[600], paddingVertical: 14, borderRadius: 10 },
  nextBtnText: { color: colors.white, fontSize: 15, fontWeight: '700', marginRight: 4 },
});
