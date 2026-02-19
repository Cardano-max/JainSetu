import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/lib/colors';
import { DEMO_PACHCHKAN_TRACKS, PachchkanTrack } from '@/lib/demoData/pachchkan';

export default function PachchkanScreen() {
  const [currentTrack, setCurrentTrack] = useState<PachchkanTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (track: PachchkanTrack) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Pachchkan' }} />

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="musical-notes" size={32} color={colors.saffron[600]} />
        <Text style={styles.headerTitle}>Pachchkan</Text>
        <Text style={styles.headerSub}>24 sacred Jain prayers and sutras</Text>
      </View>

      {/* Track List */}
      <FlatList
        data={DEMO_PACHCHKAN_TRACKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isActive = currentTrack?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.trackItem, isActive && styles.trackItemActive]}
              onPress={() => handlePlay(item)}
            >
              <View style={[styles.trackNum, isActive && styles.trackNumActive]}>
                {isActive && isPlaying ? (
                  <Ionicons name="pause" size={16} color={colors.white} />
                ) : (
                  <Text style={[styles.trackNumText, isActive && styles.trackNumTextActive]}>
                    {item.number}
                  </Text>
                )}
              </View>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, isActive && styles.trackTitleActive]}>
                  {item.title}
                </Text>
                {item.titleGuj && (
                  <Text style={styles.trackTitleGuj}>{item.titleGuj}</Text>
                )}
                {item.description && (
                  <Text style={styles.trackDesc} numberOfLines={1}>{item.description}</Text>
                )}
              </View>
              <Text style={styles.trackDuration}>{item.duration}</Text>
              <TouchableOpacity style={styles.trackPlayBtn} onPress={() => handlePlay(item)}>
                <Ionicons
                  name={isActive && isPlaying ? 'pause-circle' : 'play-circle'}
                  size={36}
                  color={isActive ? colors.saffron[600] : colors.gray[400]}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      {/* Mini Player */}
      {currentTrack && (
        <View style={styles.miniPlayer}>
          <View style={styles.miniProgress}>
            <View style={[styles.miniProgressFill, { width: '35%' }]} />
          </View>
          <View style={styles.miniContent}>
            <View style={styles.miniInfo}>
              <Text style={styles.miniTitle} numberOfLines={1}>{currentTrack.title}</Text>
              <Text style={styles.miniSub}>{currentTrack.titleGuj}</Text>
            </View>
            <View style={styles.miniControls}>
              <TouchableOpacity onPress={() => {
                const idx = DEMO_PACHCHKAN_TRACKS.findIndex((t) => t.id === currentTrack.id);
                if (idx > 0) { setCurrentTrack(DEMO_PACHCHKAN_TRACKS[idx - 1]); setIsPlaying(true); }
              }}>
                <Ionicons name="play-skip-back" size={24} color={colors.gray[700]} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.miniPlayBtn} onPress={() => setIsPlaying(!isPlaying)}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                const idx = DEMO_PACHCHKAN_TRACKS.findIndex((t) => t.id === currentTrack.id);
                if (idx < DEMO_PACHCHKAN_TRACKS.length - 1) { setCurrentTrack(DEMO_PACHCHKAN_TRACKS[idx + 1]); setIsPlaying(true); }
              }}>
                <Ionicons name="play-skip-forward" size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.saffron[50] },
  header: { alignItems: 'center', padding: 20, backgroundColor: colors.white, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.gray[900], marginTop: 8 },
  headerSub: { fontSize: 14, color: colors.gray[600], marginTop: 4 },
  listContent: { padding: 16, paddingBottom: 100 },
  trackItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  trackItemActive: { backgroundColor: colors.saffron[50], borderWidth: 1, borderColor: colors.saffron[600] },
  trackNum: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.gray[100], justifyContent: 'center', alignItems: 'center' },
  trackNumActive: { backgroundColor: colors.saffron[600] },
  trackNumText: { fontSize: 14, fontWeight: '600', color: colors.gray[600] },
  trackNumTextActive: { color: colors.white },
  trackInfo: { flex: 1, marginLeft: 12 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: colors.gray[900] },
  trackTitleActive: { color: colors.saffron[700] },
  trackTitleGuj: { fontSize: 12, color: colors.gray[500], marginTop: 1 },
  trackDesc: { fontSize: 11, color: colors.gray[400], marginTop: 2 },
  trackDuration: { fontSize: 12, color: colors.gray[500], marginRight: 8 },
  trackPlayBtn: { padding: 4 },
  // Mini Player
  miniPlayer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  miniProgress: { height: 3, backgroundColor: colors.gray[200] },
  miniProgressFill: { height: '100%', backgroundColor: colors.saffron[600] },
  miniContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  miniInfo: { flex: 1 },
  miniTitle: { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  miniSub: { fontSize: 12, color: colors.gray[500] },
  miniControls: { flexDirection: 'row', alignItems: 'center' },
  miniPlayBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.saffron[600], justifyContent: 'center', alignItems: 'center', marginHorizontal: 12 },
});
