import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function WithdrawScreen() {
  const [amount, setAmount] = useState('');
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const maxAvailable = 845.50;

  const handleWithdraw = () => {
    // Burada backend işlemleri tetiklenecek, şimdilik sadece modalı açıyoruz
    setSuccessModalVisible(true);
  };

  const closeAndGoBack = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  const isButtonDisabled = !amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAvailable;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Para Çek</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Kullanılabilir Toplam Bakiye</Text>
            <Text style={styles.infoValue}>{maxAvailable.toFixed(2)}₺</Text>
          </View>

          <Text style={styles.inputLabel}>Çekmek İstediğiniz Tutar</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <Text style={styles.currency}>₺</Text>
          </View>

          <TouchableOpacity 
            style={styles.allAmountBtn}
            onPress={() => setAmount(maxAvailable.toString())}
          >
            <Text style={styles.allAmountText}>Tümünü Çek</Text>
          </TouchableOpacity>

          <View style={styles.warningBox}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.warningText}>
              Talebiniz onaylandıktan sonra ödemeniz kayıtlı IBAN adresinize 1 iş günü içinde yansıtılır.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmBtn, isButtonDisabled && styles.disabledBtn]}
            onPress={handleWithdraw}
            disabled={isButtonDisabled}
          >
            <Text style={[styles.confirmBtnText, isButtonDisabled && styles.disabledText]}>
              Çekim Talebi Oluştur
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ŞIK BAŞARI MODALI */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Ionicons name="checkmark" size={40} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Talebiniz Alındı</Text>
            <Text style={styles.modalDesc}>
              {amount}₺ tutarındaki çekim talebiniz başarıyla oluşturuldu. En geç 24 saat içinde hesabınıza aktarılacaktır.
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
  content: { flex: 1, padding: 24 },
  infoCard: { backgroundColor: '#F0F9F6', padding: 20, borderRadius: 20, marginBottom: 30, alignItems: 'center' },
  infoLabel: { color: '#0A4D44', fontSize: 14, fontWeight: '600', opacity: 0.7 },
  infoValue: { color: '#0A4D44', fontSize: 28, fontWeight: '900', marginTop: 5 },
  inputLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#0A4D44', paddingBottom: 10 },
  input: { flex: 1, fontSize: 40, fontWeight: '800', color: '#111827' },
  currency: { fontSize: 30, fontWeight: '800', color: '#111827', marginLeft: 10 },
  allAmountBtn: { marginTop: 15, alignSelf: 'flex-end' },
  allAmountText: { color: '#0A4D44', fontWeight: '700', fontSize: 15 },
  warningBox: { flexDirection: 'row', marginTop: 40, backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, alignItems: 'center' },
  warningText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#6B7280', lineHeight: 20 },
  footer: { padding: 24 },
  confirmBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabledBtn: { backgroundColor: '#F3F4F6' },
  disabledText: { color: '#9CA3AF' },

  // Modal Stilleri
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalBtn: { backgroundColor: '#0A4D44', width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});