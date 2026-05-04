import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Dil verileri
const languages = [
  { id: 'tr', name: 'Türkçe', native: 'Türkçe', flag: '🇹🇷' },
  { id: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { id: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { id: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { id: 'it', name: 'Italian', native: 'İtaliano', flag: '🇮🇹' },
  { id: 'ru', name: 'Russian', native: 'Pусский', flag: '🇷🇺' },
  { id: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { id: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
];

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState('tr');

  const handleLanguageSelect = (id: string) => {
    setSelectedLanguage(id);
    // Burada uygulama dilini değiştirecek logic (i18n vb.) çalıştırılabilir.
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dil Seçeneği</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.topInfo}>
          <Text style={styles.infoTitle}>Uygulama Dilini Seçin</Text>
          <Text style={styles.infoSubtitle}>
            Uygulamayı hangi dilde kullanmak istediğinizi belirleyin.
          </Text>
        </View>

        <View style={styles.listCard}>
          {languages.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[
                styles.langRow, 
                index === languages.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={() => handleLanguageSelect(item.id)}
              activeOpacity={0.6}
            >
              <View style={styles.langLeft}>
                <Text style={styles.flagText}>{item.flag}</Text>
                <View style={styles.textContainer}>
                  <Text style={styles.langName}>{item.native}</Text>
                  <Text style={styles.langNative}>{item.name}</Text>
                </View>
              </View>
              
              {selectedLanguage === item.id ? (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                </View>
              ) : (
                <View style={styles.uncheckCircle} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={() => router.back()}
        >
          <Text style={styles.saveBtnText}>Kaydet ve Devam Et</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  
  scrollContent: { padding: 20 },
  
  topInfo: { marginBottom: 25, marginLeft: 5 },
  infoTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  infoSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 8, lineHeight: 20 },

  listCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  langRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 18, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F9FAFB' 
  },
  langLeft: { flexDirection: 'row', alignItems: 'center' },
  flagText: { fontSize: 26 },
  textContainer: { marginLeft: 15 },
  langName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  langNative: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  checkCircle: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    backgroundColor: '#0A4D44', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  uncheckCircle: { 
    width: 26, 
    height: 26, 
    borderRadius: 13, 
    borderWidth: 2, 
    borderColor: '#E5E7EB' 
  },

  saveBtn: { 
    backgroundColor: '#0A4D44', 
    padding: 18, 
    borderRadius: 18, 
    alignItems: 'center', 
    marginTop: 30,
    marginBottom: 20,
    elevation: 4
  },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});