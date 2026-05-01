import React, { useState } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Modal,
  Animated // Animasyon için eklendi
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function StoreSetupStep2Screen() {
  const [phone, setPhone] = useState('');
  const [iban, setIban] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  
  // Başarı Modalı State'i
  const [showSuccess, setShowSuccess] = useState(false);
  const scaleValue = useState(new Animated.Value(0))[0];

  const handleFinishSetup = () => {
    if (!phone || !iban || !pickupTime) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    
    // Önce modalı aç, sonra animasyonu başlat
    setShowSuccess(true);
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşletme Profilini Oluştur</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepText}>Adım 2 / 2</Text>
        <Text style={styles.mainTitle}>Ödeme ve İletişim Bilgileri</Text>
        <Text style={styles.descText}>
          Kazançlarını sana ulaştırabilmemiz ve gerektiğinde ulaşabilmemiz için bu bilgileri doldur.
        </Text>

        <Text style={styles.label}>İletişim Numarası</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="05XX XXX XX XX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={11}
          />
        </View>

        <Text style={styles.label}>IBAN (Kazançların için)</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.ibanPrefix}>TR</Text>
          <TextInput
            style={styles.input}
            placeholder="XX XXXX XXXX XXXX XXXX XXXX XX"
            keyboardType="numeric"
            value={iban}
            onChangeText={setIban}
            maxLength={24}
          />
        </View>

        <Text style={styles.label}>Varsayılan Teslimat Saati</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="time-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Örn: 19:00 - 20:30"
            value={pickupTime}
            onChangeText={setPickupTime}
          />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#0A4D44" />
          <Text style={styles.infoCardText}>
            Bilgileriniz uçtan uca şifrelenir ve üçüncü şahıslarla asla paylaşılmaz.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, (!phone || !iban || !pickupTime) && styles.buttonDisabled]}
          onPress={handleFinishSetup}
          disabled={!phone || !iban || !pickupTime}
        >
          <Text style={styles.continueButtonText}>Kaydı Tamamla ve Başla</Text>
        </TouchableOpacity>
      </View>

      {/* ŞIK BAŞARI MODALI */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: scaleValue }] }]}>
            <View style={styles.successIconBg}>
              <Ionicons name="checkmark-done" size={60} color="#0A4D44" />
            </View>
            <Text style={styles.successTitle}>Tebrikler!</Text>
            <Text style={styles.successMessage}>
              Son Lokma işletme profiliniz başarıyla oluşturuldu. Artık gıda israfını önlemeye hazırsınız!
            </Text>
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => {
                setShowSuccess(false);
                router.replace('/business/business-dashboard');
              }}
            >
              <Text style={styles.successButtonText}>Panele Git</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  stepText: { fontSize: 13, fontWeight: '700', color: '#0A4D44', marginBottom: 8, textTransform: 'uppercase' },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10 },
  descText: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 25 },
  label: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 25 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  ibanPrefix: { fontSize: 16, fontWeight: '700', color: '#111827', marginRight: 8, paddingRight: 8, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9F6', padding: 16, borderRadius: 16, marginTop: 10, borderWidth: 1, borderColor: '#A7D1C6' },
  infoCardText: { flex: 1, fontSize: 13, color: '#0A4D44', marginLeft: 12, lineHeight: 18, fontWeight: '500' },
  footer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 },
  continueButton: { height: 56, backgroundColor: '#0A4D44', borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#0A4D44', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Başarı Modalı Stilleri
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  successCard: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  successIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#0A4D44', marginBottom: 12 },
  successMessage: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  successButton: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, width: '100%', justifyContent: 'center', alignItems: 'center' },
  successButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' }
});