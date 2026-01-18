import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/lib/colors';
import { useAuthStore } from '@/lib/store';

const { width } = Dimensions.get('window');

interface Festival {
  id: string;
  name: string;
  date: string;
  icon: string;
  colors: string[];
}

interface Template {
  id: string;
  name: string;
  previewUrl: string;
  category: string;
}

// Available festivals
const FESTIVALS: Festival[] = [
  { id: '1', name: 'Mahavir Jayanti', date: 'April 2025', icon: '🙏', colors: [colors.saffron[400], colors.saffron[600]] },
  { id: '2', name: 'Paryushan', date: 'Aug-Sep 2025', icon: '📿', colors: [colors.purple[400], colors.purple[600]] },
  { id: '3', name: 'Das Lakshana', date: 'Aug-Sep 2025', icon: '🕉️', colors: [colors.blue[400], colors.blue[600]] },
  { id: '4', name: 'Diwali', date: 'Oct-Nov 2025', icon: '🪔', colors: [colors.yellow[400], colors.saffron[500]] },
  { id: '5', name: 'New Year', date: 'Nov 2025', icon: '✨', colors: [colors.green[400], colors.green[600]] },
  { id: '6', name: 'Akshaya Tritiya', date: 'May 2025', icon: '🌟', colors: [colors.yellow[400], colors.yellow[600]] },
];

// Template categories
const TEMPLATE_CATEGORIES = ['All', 'Minimalist', 'Traditional', 'Modern', 'Elegant'];

// Demo templates
const TEMPLATES: Template[] = [
  { id: 't1', name: 'Classic Saffron', previewUrl: 'https://picsum.photos/200/300?random=20', category: 'Traditional' },
  { id: 't2', name: 'Modern Minimal', previewUrl: 'https://picsum.photos/200/300?random=21', category: 'Minimalist' },
  { id: 't3', name: 'Elegant Gold', previewUrl: 'https://picsum.photos/200/300?random=22', category: 'Elegant' },
  { id: 't4', name: 'Contemporary', previewUrl: 'https://picsum.photos/200/300?random=23', category: 'Modern' },
  { id: 't5', name: 'Traditional Art', previewUrl: 'https://picsum.photos/200/300?random=24', category: 'Traditional' },
  { id: 't6', name: 'Simple White', previewUrl: 'https://picsum.photos/200/300?random=25', category: 'Minimalist' },
];

export default function FestivalPostScreen() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'select' | 'customize' | 'preview'>('select');
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  // Business details form
  const [businessDetails, setBusinessDetails] = useState({
    name: '',
    tagline: '',
    phone: '',
    website: '',
    address: '',
    logoUrl: '',
  });

  const filteredTemplates = TEMPLATES.filter(
    (t) => selectedCategory === 'All' || t.category === selectedCategory
  );

  const handleFestivalSelect = (festival: Festival) => {
    setSelectedFestival(festival);
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setStep('customize');
  };

  const handlePreview = () => {
    if (!businessDetails.name) {
      Alert.alert('Required', 'Please enter your business/company name');
      return;
    }
    setStep('preview');
  };

  const handleShare = async () => {
    setLoading(true);
    try {
      // In production, generate the image on server and get URL
      await new Promise(resolve => setTimeout(resolve, 1000));

      await Share.share({
        message: `${selectedFestival?.name} wishes from ${businessDetails.name}!\n\n${businessDetails.tagline}\n\nContact: ${businessDetails.phone}\n${businessDetails.website}\n\nCreated with JainSetu App`,
        title: `${selectedFestival?.name} Greetings`,
      });
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      // In production, generate and save image
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Downloaded!', 'Festival post saved to your gallery');
    } catch (error) {
      Alert.alert('Error', 'Failed to download. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFestivalSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Festival</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.festivalsRow}>
          {FESTIVALS.map((festival) => (
            <TouchableOpacity
              key={festival.id}
              style={[
                styles.festivalCard,
                selectedFestival?.id === festival.id && styles.festivalCardSelected,
              ]}
              onPress={() => handleFestivalSelect(festival)}
            >
              <LinearGradient
                colors={festival.colors}
                style={styles.festivalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.festivalIcon}>{festival.icon}</Text>
              </LinearGradient>
              <Text style={styles.festivalName}>{festival.name}</Text>
              <Text style={styles.festivalDate}>{festival.date}</Text>
              {selectedFestival?.id === festival.id && (
                <View style={styles.selectedCheck}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.saffron[600]} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderTemplateSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Template</Text>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {TEMPLATE_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Templates Grid */}
      <View style={styles.templatesGrid}>
        {filteredTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={[
              styles.templateCard,
              selectedTemplate?.id === template.id && styles.templateCardSelected,
            ]}
            onPress={() => handleTemplateSelect(template)}
          >
            <Image source={{ uri: template.previewUrl }} style={styles.templateImage} />
            <Text style={styles.templateName}>{template.name}</Text>
            {selectedTemplate?.id === template.id && (
              <View style={styles.templateSelectedBadge}>
                <Ionicons name="checkmark" size={16} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCustomizeForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add Your Business Details</Text>
      <Text style={styles.sectionSubtitle}>
        This information will appear on your festival post
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business/Company Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your business name"
            value={businessDetails.name}
            onChangeText={(text) => setBusinessDetails({ ...businessDetails, name: text })}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tagline / Slogan</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Quality products since 1990"
            value={businessDetails.tagline}
            onChangeText={(text) => setBusinessDetails({ ...businessDetails, tagline: text })}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              value={businessDetails.phone}
              onChangeText={(text) => setBusinessDetails({ ...businessDetails, phone: text })}
              keyboardType="phone-pad"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              placeholder="www.example.com"
              value={businessDetails.website}
              onChangeText={(text) => setBusinessDetails({ ...businessDetails, website: text })}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Business address"
            value={businessDetails.address}
            onChangeText={(text) => setBusinessDetails({ ...businessDetails, address: text })}
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity style={styles.addLogoButton}>
          <Ionicons name="image" size={24} color={colors.saffron[600]} />
          <Text style={styles.addLogoText}>
            {businessDetails.logoUrl ? 'Change Logo' : 'Add Your Logo'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.previewSection}>
      <Text style={styles.sectionTitle}>Preview Your Post</Text>

      {/* Preview Card */}
      <View style={styles.previewCard}>
        <LinearGradient
          colors={selectedFestival?.colors || [colors.saffron[400], colors.saffron[600]]}
          style={styles.previewGradient}
        >
          <Text style={styles.previewFestivalIcon}>{selectedFestival?.icon}</Text>
          <Text style={styles.previewFestivalName}>{selectedFestival?.name}</Text>
          <Text style={styles.previewWishes}>Best Wishes!</Text>

          <View style={styles.previewBusinessSection}>
            <View style={styles.previewLogoPlaceholder}>
              <Ionicons name="business" size={32} color={colors.gray[400]} />
            </View>
            <Text style={styles.previewBusinessName}>{businessDetails.name}</Text>
            {businessDetails.tagline && (
              <Text style={styles.previewTagline}>{businessDetails.tagline}</Text>
            )}
            <View style={styles.previewContactRow}>
              {businessDetails.phone && (
                <Text style={styles.previewContact}>📞 {businessDetails.phone}</Text>
              )}
              {businessDetails.website && (
                <Text style={styles.previewContact}>🌐 {businessDetails.website}</Text>
              )}
            </View>
            {businessDetails.address && (
              <Text style={styles.previewAddress}>📍 {businessDetails.address}</Text>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.saffron[600]} />
          ) : (
            <>
              <Ionicons name="download" size={22} color={colors.saffron[600]} />
              <Text style={styles.downloadButtonText}>Download</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="share-social" size={22} color={colors.white} />
              <Text style={styles.shareButtonText}>Share</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Festival Post',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (step === 'preview') setStep('customize');
                else if (step === 'customize') setStep('select');
                else router.back();
              }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'select' && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 'customize' && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 'preview' && styles.stepDotActive]} />
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step === 'select' && styles.stepLabelActive]}>Select</Text>
          <Text style={[styles.stepLabel, step === 'customize' && styles.stepLabelActive]}>Customize</Text>
          <Text style={[styles.stepLabel, step === 'preview' && styles.stepLabelActive]}>Share</Text>
        </View>

        {step === 'select' && (
          <>
            {renderFestivalSelector()}
            {selectedFestival && renderTemplateSelector()}
          </>
        )}

        {step === 'customize' && renderCustomizeForm()}

        {step === 'preview' && renderPreview()}
      </ScrollView>

      {/* Bottom Button */}
      {step === 'select' && selectedFestival && selectedTemplate && (
        <View style={styles.bottomButton}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => setStep('customize')}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {step === 'customize' && (
        <View style={styles.bottomButton}>
          <TouchableOpacity style={styles.continueButton} onPress={handlePreview}>
            <Text style={styles.continueButtonText}>Preview Post</Text>
            <Ionicons name="eye" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 100,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gray[300],
  },
  stepDotActive: {
    backgroundColor: colors.saffron[600],
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.gray[300],
    marginHorizontal: 8,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.gray[400],
  },
  stepLabelActive: {
    color: colors.saffron[600],
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: 16,
  },
  festivalsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  festivalCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    position: 'relative',
  },
  festivalCardSelected: {
    borderWidth: 2,
    borderColor: colors.saffron[500],
  },
  festivalGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  festivalIcon: {
    fontSize: 28,
  },
  festivalName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[900],
    textAlign: 'center',
  },
  festivalDate: {
    fontSize: 10,
    color: colors.gray[500],
    marginTop: 2,
  },
  selectedCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  categoryButtonActive: {
    backgroundColor: colors.saffron[600],
    borderColor: colors.saffron[600],
  },
  categoryText: {
    fontSize: 13,
    color: colors.gray[600],
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  templateCard: {
    width: (width - 44) / 3,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    position: 'relative',
  },
  templateCardSelected: {
    borderWidth: 2,
    borderColor: colors.saffron[500],
  },
  templateImage: {
    width: '100%',
    height: 140,
  },
  templateName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray[700],
    padding: 8,
    textAlign: 'center',
  },
  templateSelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.saffron[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
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
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.saffron[200],
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
  },
  addLogoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.saffron[600],
    marginLeft: 8,
  },
  previewSection: {
    alignItems: 'center',
  },
  previewCard: {
    width: width - 64,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  previewGradient: {
    padding: 24,
    alignItems: 'center',
  },
  previewFestivalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewFestivalName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  previewWishes: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  previewBusinessSection: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  previewLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewBusinessName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 4,
    textAlign: 'center',
  },
  previewTagline: {
    fontSize: 13,
    color: colors.gray[600],
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  previewContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
  },
  previewContact: {
    fontSize: 12,
    color: colors.gray[700],
    marginHorizontal: 8,
    marginVertical: 2,
  },
  previewAddress: {
    fontSize: 11,
    color: colors.gray[500],
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 24,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  downloadButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.saffron[600],
  },
  downloadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.saffron[600],
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: colors.saffron[600],
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron[600],
    paddingVertical: 14,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginRight: 8,
  },
});
