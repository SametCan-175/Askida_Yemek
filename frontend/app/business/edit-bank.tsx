import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EditBankScreen() {
  const [bankName, setBankName] = useState('Ziraat Bankası');
  const [holderName, setHolderName] = useState('Trakya Pastanesi LTD. ŞTİ.');
  const [iban, setIban] = useState('TR560001200000000012345678');
  
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  const handleSave = () => {
    // Backend kayıt işlemi, şimdilik modal açıyoruz
    setSuccessModalVisible(true);
  };

  const closeAndGoBack = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Banka Bilgilerini Düzenle</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.warningBox}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#0A4D44" />
          <Text style={styles.warningText}>
            Ödemelerinizin sorunsuz gerçekleşmesi için IBAN bilgilerinizin işletme adına kayıtlı olduğundan emin olun.
          </Text>
        </View>

        <Text style={styles.label}>Banka Adı</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="Örn: Ziraat Bankası"
          />
        </View>

        <Text style={styles.label}>Hesap Sahibi</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={holderName}
            onChangeText={setHolderName}
            placeholder="Ad Soyad veya Unvan"
          />
        </View>

        <Text style={styles.label}>IBAN Numarası</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={iban}
            onChangeText={(txt) => setIban(txt.toUpperCase())}
            placeholder="TR..."
            maxLength={26}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Bilgileri Güncelle</Text>
        </TouchableOpacity>
      </View>

      {/* ŞIK BAŞARI MODALI */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Ionicons name="shield-checkmark" size={40} color="#0A4D44" />
            </View>
            <Text style={styles.modalTitle}>Bilgiler Güncellendi</Text>
            <Text style={styles.modalDesc}>
              Banka bilgileriniz başarıyla kaydedildi ve ödemeleriniz için güvene alındı.
            </Text>
            <TouchableOpacity style={styles.modalBtn} onPress={closeAndGoBack}>
              <Text style={styles.modalBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  content: { padding: 24 },
  warningBox: { flexDirection: 'row', backgroundColor: '#F0F9F6', padding: 16, borderRadius: 16, marginBottom: 25, alignItems: 'center' },
  warningText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#0A4D44', lineHeight: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 8, marginLeft: 4 },
  inputBox: { backgroundColor: '#F9FAFB', borderRadius: 15, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, height: 56, justifyContent: 'center', marginBottom: 20 },
  input: { fontSize: 16, color: '#111827', fontWeight: '600' },
  footer: { padding: 24 },
  saveBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  // Modal Stilleri
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalBtn: { backgroundColor: '#0A4D44', width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});