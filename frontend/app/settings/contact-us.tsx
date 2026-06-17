import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ContactUs() {
  const [form, setForm] = useState({
    subject: '',
    message: ''
  });

  const handleSubmit = () => {
    if (!form.subject || !form.message) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
      return;
    }
    // Burada backend entegrasyonu yapılacak
    Alert.alert("Mesaj Gönderildi", "Destek ekibimiz en kısa sürede size dönüş yapacaktır.");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bize Ulaşın</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Size nasıl yardımcı olabiliriz?</Text>
            <Text style={styles.infoDesc}>
              Sorunlarınızı, önerilerinizi veya iş birliği taleplerinizi aşağıdaki form aracılığıyla bize iletebilirsiniz.
            </Text>
          </View>

          {/* Konu Başlığı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>KONU</Text>
            <TextInput 
              style={styles.input}
              placeholder="Mesajınızın konusu nedir?"
              placeholderTextColor="#9CA3AF"
              value={form.subject}
              onChangeText={(t) => setForm({...form, subject: t})}
            />
          </View>

          {/* Mesaj Alanı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>MESAJINIZ</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Detaylı bir şekilde açıklayınız..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={form.message}
              onChangeText={(t) => setForm({...form, message: t})}
            />
          </View>

          <TouchableOpacity style={styles.sendBtn} onPress={handleSubmit}>
            <Text style={styles.sendBtnText}>Gönder</Text>
            <Ionicons name="send" size={18} color="#FFF" style={{ marginLeft: 10 }} />
          </TouchableOpacity>

          {/* Alternatif İletişim */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Kurumsal İletişim</Text>
            <Text style={styles.footerText}>destek@sonlokma.com</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 25 },

  infoBox: { marginBottom: 30 },
  infoTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  infoDesc: { fontSize: 14, color: '#6B7280', marginTop: 10, lineHeight: 22 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  input: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 16, 
    padding: 18, 
    fontSize: 15, 
    color: '#111827',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  textArea: { height: 150, paddingTop: 18 },

  sendBtn: { 
    backgroundColor: '#0A4D44', 
    flexDirection: 'row',
    borderRadius: 18, 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    elevation: 4,
    shadowColor: '#0A4D44',
    shadowOpacity: 0.2,
    shadowRadius: 10
  },
  sendBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },

  footerInfo: { marginTop: 40, alignItems: 'center' },
  footerLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  footerText: { fontSize: 14, color: '#0A4D44', fontWeight: '700', marginTop: 5 }
});