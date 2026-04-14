import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TIMES = [
  "Sabah erken (06:00 - 09:00)",
  "Sabah (09:00 - 12:00)",
  "Öğle (12:00 - 15:00)",
  "Öğleden sonra (15:00 - 18:00)",
  "Akşam (18:00 - 21:00)",
  "Gece (21:00 - 00:00)"
];

export default function OnboardingTimeScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelection = (time: string) => {
    if (selected.includes(time)) {
      setSelected(selected.filter((item) => item !== time));
    } else {
      setSelected([...selected, time]);
    }
  };

  const isFinishDisabled = selected.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>PAKETİNİ NE ZAMAN TESLİM ALMAK İSTERSİN?</Text>
        <Text style={styles.description}>
          Bize tercih ettiğin teslimat aralığını söyle, rutinine en uygun Sürpriz Paketleri önerelim.
        </Text>
        <Text style={styles.subtitle}>Sana uygun olanların tümünü seç</Text>

        <View style={styles.listContainer}>
          {TIMES.map((time, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.optionRow}
              onPress={() => toggleSelection(time)}
            >
              <Text style={styles.optionText}>{time}</Text>
              <MaterialCommunityIcons 
                name={selected.includes(time) ? "check-circle" : "checkbox-blank-circle-outline"} 
                size={28} 
                color="#0A4D44" 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.nextButton, isFinishDisabled && styles.buttonDisabled]}
            // İŞTE BURASI DEĞİŞTİ: Artık direkt ana ekrana (home) yönlendiriyor!
            onPress={() => router.replace('/(tabs)')}
            disabled={isFinishDisabled}
          >
            <Text style={[styles.nextButtonText, isFinishDisabled && styles.textDisabled]}>Bitir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0A4D44', textAlign: 'center', marginBottom: 15, paddingHorizontal: 10 },
  description: { fontSize: 16, color: '#374151', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 30 },
  listContainer: { marginTop: 10 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  optionText: { flex: 1, fontSize: 16, color: '#1f2937' },
  footer: { paddingHorizontal: 20, paddingBottom: 30 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  activeDot: { backgroundColor: '#0A4D44', width: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  backButton: { flex: 1, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#0A4D44', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { color: '#0A4D44', fontSize: 16, fontWeight: '700' },
  nextButton: { flex: 1, height: 56, borderRadius: 28, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  textDisabled: { color: '#9CA3AF' }
});