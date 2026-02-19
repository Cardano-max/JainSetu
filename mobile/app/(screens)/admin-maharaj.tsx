import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_MAHARAJ_PROFILES } from '@/lib/demoData/maharaj';

type EditMode = 'list' | 'location' | 'planner' | 'event' | 'contact';

export default function AdminMaharajScreen() {
  const [profiles] = useState(DEMO_MAHARAJ_PROFILES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Location update form
  const [locCity, setLocCity] = useState('');
  const [locArea, setLocArea] = useState('');
  const [locUpashray, setLocUpashray] = useState('');
  const [locFromDate, setLocFromDate] = useState('');
  const [locToDate, setLocToDate] = useState('');

  // Event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('pravachan');

  const filtered = profiles.filter((p) =>
    !searchQuery || p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || p.currentLocation.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProfile = profiles.find((p) => p.id === selectedId);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'updated_today': return { color: colors.green[500], label: 'Updated Today', icon: 'ellipse' };
      case 'updated_this_week': return { color: colors.yellow[500], label: 'This Week', icon: 'ellipse' };
      default: return { color: colors.red[500], label: 'Outdated', icon: 'ellipse' };
    }
  };

  const handleUpdateLocation = () => {
    if (!locCity.trim() || !locUpashray.trim()) {
      Alert.alert('Required', 'City and Upashray name are required.');
      return;
    }
    Alert.alert('Location Updated', `${selectedProfile?.nameEn}'s location updated to ${locCity}, ${locArea}.\n\nFollowers will be notified.`, [
      { text: 'OK', onPress: () => { setEditMode('list'); setSelectedId(null); } },
    ]);
  };

  const handleAddEvent = () => {
    if (!eventTitle.trim() || !eventDate.trim()) {
      Alert.alert('Required', 'Event title and date are required.');
      return;
    }
    Alert.alert('Event Added', `"${eventTitle}" added for ${selectedProfile?.nameEn}.\n\nFollowers will be notified.`, [
      { text: 'OK', onPress: () => { setEditMode('list'); setSelectedId(null); setEventTitle(''); setEventDesc(''); setEventDate(''); setEventLocation(''); } },
    ]);
  };

  if (editMode === 'location' && selectedProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Update Location' }} />
        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarSmall}><Text style={styles.avatarText}>{selectedProfile.nameEn[0]}</Text></View>
            <View>
              <Text style={styles.formProfileName}>{selectedProfile.nameEn}</Text>
              <Text style={styles.formProfileSub}>Current: {selectedProfile.currentLocation.city}, {selectedProfile.currentLocation.area}</Text>
            </View>
          </View>

          <Text style={styles.formSectionTitle}>New Location Details</Text>

          <Text style={styles.label}>City *</Text>
          <TextInput style={styles.input} value={locCity} onChangeText={setLocCity} placeholder="e.g. Ahmedabad" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>Area / Locality</Text>
          <TextInput style={styles.input} value={locArea} onChangeText={setLocArea} placeholder="e.g. Paldi" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>Upashray / Sangh Name *</Text>
          <TextInput style={styles.input} value={locUpashray} onChangeText={setLocUpashray} placeholder="e.g. Shri Jain Shwetambar Sangh" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>From Date</Text>
          <TextInput style={styles.input} value={locFromDate} onChangeText={setLocFromDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>To Date (Optional)</Text>
          <TextInput style={styles.input} value={locToDate} onChangeText={setLocToDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.gray[400]} />

          <View style={styles.notifyCard}>
            <Ionicons name="notifications" size={18} color={colors.saffron[600]} />
            <Text style={styles.notifyText}>{selectedProfile.followersCount.toLocaleString()} followers will be notified of this location change</Text>
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditMode('list'); setSelectedId(null); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateLocation}>
              <Ionicons name="checkmark" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>Update Location</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (editMode === 'event' && selectedProfile) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ title: 'Add Event' }} />
        <ScrollView contentContainerStyle={styles.formContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarSmall}><Text style={styles.avatarText}>{selectedProfile.nameEn[0]}</Text></View>
            <Text style={styles.formProfileName}>{selectedProfile.nameEn}</Text>
          </View>

          <Text style={styles.formSectionTitle}>Event Details</Text>

          <Text style={styles.label}>Event Title *</Text>
          <TextInput style={styles.input} value={eventTitle} onChangeText={setEventTitle} placeholder="e.g. Special Pravachan on Ahimsa" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { minHeight: 80 }]} value={eventDesc} onChangeText={setEventDesc} placeholder="Event description..." placeholderTextColor={colors.gray[400]} multiline textAlignVertical="top" />

          <Text style={styles.label}>Event Date *</Text>
          <TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={eventLocation} onChangeText={setEventLocation} placeholder="e.g. Paldi Sangh, Ahmedabad" placeholderTextColor={colors.gray[400]} />

          <Text style={styles.label}>Event Type</Text>
          <View style={styles.typeChips}>
            {['pravachan', 'mahotsav', 'tap', 'seva', 'other'].map((t) => (
              <TouchableOpacity key={t} style={[styles.typeChip, eventType === t && styles.typeChipActive]} onPress={() => setEventType(t)}>
                <Text style={[styles.typeChipText, eventType === t && styles.typeChipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditMode('list'); setSelectedId(null); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddEvent}>
              <Ionicons name="add" size={18} color={colors.white} />
              <Text style={styles.saveBtnText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main list view
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Maharaj Management' }} />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.gray[400]} />
        <TextInput style={styles.searchInput} placeholder="Search by name or city..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.gray[400]} />
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: colors.green[500] }]} />
          <Text style={styles.summaryText}>Updated: {profiles.filter((p) => p.currentLocation.status === 'updated_today').length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: colors.yellow[500] }]} />
          <Text style={styles.summaryText}>This week: {profiles.filter((p) => p.currentLocation.status === 'updated_this_week').length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryDot, { backgroundColor: colors.red[500] }]} />
          <Text style={styles.summaryText}>Outdated: {profiles.filter((p) => p.currentLocation.status === 'outdated').length}</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const statusInfo = getStatusInfo(item.currentLocation.status);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.avatar}><Text style={styles.avatarTextLarge}>{item.nameEn[0]}</Text></View>
                <View style={styles.cardInfo}>
                  <Text style={styles.maharajName}>{item.nameEn}</Text>
                  <Text style={styles.maharajNameGu}>{item.nameGu}</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color={colors.gray[400]} />
                    <Text style={styles.locationText}>{item.currentLocation.city}, {item.currentLocation.area}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Ionicons name={statusInfo.icon as any} size={8} color={statusInfo.color} />
                    <Text style={[styles.statusLabel, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                  <Text style={styles.followersText}>{item.followersCount.toLocaleString()} followers</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Upashray:</Text>
                <Text style={styles.infoValue}>{item.currentLocation.upashrayName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated:</Text>
                <Text style={styles.infoValue}>{item.currentLocation.lastUpdatedAt}</Text>
              </View>

              <View style={styles.adminActions}>
                <TouchableOpacity style={styles.adminBtn} onPress={() => { setSelectedId(item.id); setEditMode('location'); setLocCity(item.currentLocation.city); setLocArea(item.currentLocation.area || ''); setLocUpashray(item.currentLocation.upashrayName); }}>
                  <Ionicons name="location" size={15} color={colors.saffron[600]} />
                  <Text style={styles.adminBtnText}>Update Location</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminBtn} onPress={() => { setSelectedId(item.id); setEditMode('event'); }}>
                  <Ionicons name="calendar" size={15} color={colors.blue[500]} />
                  <Text style={[styles.adminBtnText, { color: colors.blue[500] }]}>Add Event</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.adminBtn} onPress={() => Alert.alert('Update Planner', 'Planner update form coming soon.')}>
                  <Ionicons name="map" size={15} color={colors.green[600]} />
                  <Text style={[styles.adminBtnText, { color: colors.green[600] }]}>Planner</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, margin: 16, marginBottom: 0, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.gray[900] },
  summaryBar: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.white, marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10 },
  summaryItem: { flexDirection: 'row', alignItems: 'center' },
  summaryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  summaryText: { fontSize: 12, color: colors.gray[600], fontWeight: '600' },
  listContent: { padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center' },
  avatarTextLarge: { fontSize: 20, fontWeight: '700', color: colors.saffron[600] },
  cardInfo: { flex: 1, marginLeft: 12 },
  maharajName: { fontSize: 15, fontWeight: '700', color: colors.gray[900] },
  maharajNameGu: { fontSize: 12, color: colors.gray[500], marginTop: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 12, color: colors.gray[500], marginLeft: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusLabel: { fontSize: 10, fontWeight: '600', marginLeft: 4 },
  followersText: { fontSize: 10, color: colors.gray[400], marginTop: 4 },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { fontSize: 12, color: colors.gray[500], width: 100 },
  infoValue: { fontSize: 12, color: colors.gray[800], flex: 1, fontWeight: '500' },
  adminActions: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  adminBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: colors.gray[200], marginRight: 8 },
  adminBtnText: { fontSize: 12, fontWeight: '600', color: colors.saffron[600], marginLeft: 4 },
  // Forms
  formContent: { padding: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 14, borderRadius: 12, marginBottom: 20 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.saffron[100], justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700', color: colors.saffron[600] },
  formProfileName: { fontSize: 16, fontWeight: '700', color: colors.gray[900] },
  formProfileSub: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  formSectionTitle: { fontSize: 18, fontWeight: '700', color: colors.gray[900], marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray[700], marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: colors.white, borderRadius: 10, padding: 14, fontSize: 14, color: colors.gray[900], borderWidth: 1, borderColor: colors.gray[200] },
  notifyCard: { flexDirection: 'row', backgroundColor: colors.saffron[50], padding: 12, borderRadius: 10, marginTop: 16, alignItems: 'center' },
  notifyText: { fontSize: 12, color: colors.saffron[700], marginLeft: 8, flex: 1 },
  typeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200] },
  typeChipActive: { backgroundColor: colors.saffron[600], borderColor: colors.saffron[600] },
  typeChipText: { fontSize: 13, color: colors.gray[600] },
  typeChipTextActive: { color: colors.white, fontWeight: '600' },
  formActions: { flexDirection: 'row', marginTop: 24 },
  cancelBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[300], marginRight: 10 },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.gray[600] },
  saveBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 10, backgroundColor: colors.saffron[600] },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: colors.white, marginLeft: 6 },
});
