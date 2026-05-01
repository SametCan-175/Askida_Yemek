import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  TextInput 
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const REASONS = [
  "Mutfak alışverişime ek yapmak",
  "Yemek masraflarından tasarruf etmek",
  "Kendime veya başkalarına güzel bir sürpriz yapmak",
  "Öğünlerimi tamamlayacak pratik seçenekler bulmak",
  "Hemen yiyebileceğim bir öğün bulmak",
  "Yeni işletmeler ve lezzetler keşfetmek",
  "Diğer"
];

export default function OnboardingReasonScreen() {
  // TypeScript kızmasın diye bunların birer "yazı" (string) olduğunu belirttik
  const [selected, setSelected] = useState<string[]>([]);
  const [otherText, setOtherText] = useState<string>('');

  const toggleSelection = (reason: string) => {
    if (selected.includes(reason)) {
      setSelected(selected.filter(item => item !== reason));
      if (reason === "Diğer") {
        setOtherText('');
      }
    } else {
      setSelected([...selected, reason]);
    }
  };

  // EKLENEN KISIM: Buton kilidi mantığı
  // Hiçbir şey seçilmediyse VEYA sadece "Diğer" seçilip içi boş bırakıldıysa buton kilitlenir
  const isNextDisabled = selected.length === 0 || (selected.includes("Diğer") && selected.length === 1 && otherText.trim() === "");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>BURADA OLMA AMACIN NEDİR?</Text>
        
        <Text style={styles.description}>
          Senin için en önemli olanı bilmek, önerilerimizi kişiselleştirmemize ve deneyimini geliştirmemize yardımcı olur.
        </Text>
        
        <Text style={styles.subtitle}>Sana uygun olanların tümünü seç</Text>

        <View style={styles.listContainer}>
          {REASONS.map((reason, index) => (
            <View key={index}>
              <TouchableOpacity 
                style={styles.optionRow}
                activeOpacity={0.7}
                onPress={() => toggleSelection(reason)}
              >
                <Text style={styles.optionText}>{reason}</Text>
                <MaterialCommunityIcons 
                  name={selected.includes(reason) ? "check-circle" : "checkbox-blank-circle-outline"} 
                  size={28} 
                  color="#0A4D44" 
                />
              </TouchableOpacity>

              {/* Diğer seçilince açılan metin kutusu */}
              {reason === "Diğer" && selected.includes("Diğer") && (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Lütfen nedeninizi kısaca yazın..."
                    placeholderTextColor="#9CA3AF"
                    value={otherText}
                    onChangeText={setOtherText}
                    multiline={true}
                  />
                </View>
              )}
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
          
          {/* EKLENEN KISIM: Butona disabled ve yeni stiller eklendi */}
          <TouchableOpacity 
            style={[styles.nextButton, isNextDisabled && styles.buttonDisabled]}
            onPress={() => router.push('/onboarding-time')}
            disabled={isNextDisabled}
          >
            <Text style={[styles.nextButtonText, isNextDisabled && styles.textDisabled]}>Sonraki</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F2' },
  content: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0A4D44', textAlign: 'center', marginBottom: 15 },
  description: { fontSize: 16, color: '#374151', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 30 },
  listContainer: { marginTop: 10 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  optionText: { flex: 1, fontSize: 16, color: '#1f2937', paddingRight: 10 },
  
  inputContainer: {
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0A4D44',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#1f2937',
    minHeight: 40,
    textAlignVertical: 'top',
  },

  footer: { paddingHorizontal: 20, paddingBottom: 30 },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  activeDot: { backgroundColor: '#0A4D44', width: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  backButton: { flex: 1, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#0A4D44', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { color: '#0A4D44', fontSize: 16, fontWeight: '700' },
  nextButton: { flex: 1, height: 56, borderRadius: 28, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center' },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  // EKLENEN KISIM: Kilitli butonun gri görünmesi için stiller
  buttonDisabled: { backgroundColor: '#D1D5DB' },
  textDisabled: { color: '#9CA3AF' }
});