import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
// useLocalSearchParams eklendi
import { router, useLocalSearchParams } from 'expo-router'; 
import { MaterialIcons } from '@expo/vector-icons';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  
  // 1. ADIM: Gelen rol parametresini yakalıyoruz
  const { role } = useLocalSearchParams();

  const handleContinue = () => {
    // 2. ADIM: Rol kontrolü yaparak yönlendirme
    if (role === 'business') {
      // İşletme ise onboarding'i atla, direkt panele git
      // Not: Henüz bu dosyayı oluşturmadıysan hata verebilir, 
      // denemek için şimdilik profile sayfasına da yönlendirebilirsin.
      router.push('/store-setup'); 
    } else {
      // Müşteri ise normal onboarding akışına devam et
      router.push('/surprise-info');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {role === 'business' ? 'İşletme Girişi' : 'Kayıt ol veya giriş yap'}
        </Text>
        <View style={{ width: 20 }} /> 
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>E-posta</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresin nedir?"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          activeOpacity={0.7}
          onPress={() => setIsChecked(!isChecked)}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
          </View>
          <Text style={styles.checkboxText}>
            E-posta adresimin ve adımın gizlilik politikasına uygun olarak saklanmasına izin veriyorum.
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, (email.length > 0 && isChecked) ? styles.buttonActive : styles.buttonInactive]}
          disabled={!(email.length > 0 && isChecked)}
          onPress={handleContinue} // Değiştirilen fonksiyon
        >
          <Text style={[styles.continueButtonText, (email.length > 0 && isChecked) ? styles.textActive : styles.textInactive]}>
            Devam et
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Stiller aynı kalabilir...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, marginTop: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  label: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  inputContainer: { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, height: 56, justifyContent: 'center', marginBottom: 24 },
  input: { fontSize: 16, color: '#1f2937' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 10 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#0A4D44', borderRadius: 4, marginRight: 12, marginTop: 2, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#0A4D44' },
  checkboxText: { flex: 1, fontSize: 15, color: '#374151', lineHeight: 22 },
  footer: { paddingHorizontal: 20, paddingBottom: 40 },
  continueButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonInactive: { backgroundColor: '#D1D5DB' },
  buttonActive: { backgroundColor: '#0A4D44' },
  continueButtonText: { fontSize: 16, fontWeight: '700' },
  textInactive: { color: '#9CA3AF' },
  textActive: { color: '#FFFFFF' },
});