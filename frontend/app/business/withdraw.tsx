import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchMyShop, 
  fetchWalletBalance, 
  fetchShopBank,
  createWithdraw,
  WalletBalance,
  ShopBank
} from '../../services/business';

function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  return `${iban.slice(0, 4)} •••• •••• ${iban.slice(-4)}`;
}

export default function WithdrawScreen() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<number | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [bank, setBank] = useState<ShopBank | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        try {
          const myShop = await fetchMyShop(user.id);
          if (!myShop) {
            Alert.alert('Hata', 'Mağaza bulunamadı.');
            return;
          }
          if (!active) return;
          setShopId(myShop.id);

          const [bal, bankInfo] = await Promise.all([
            fetchWalletBalance(myShop.id),
            fetchShopBank(myShop.id),
          ]);
          if (active) {
            setBalance(bal);
            setBank(bankInfo);
          }
        } catch (err) {
          console.log('Veri yüklenemedi:', err);
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [user])
  );

  const maxAvailable = balance?.available_balance || 0;

  const handleWithdraw = async () => {
    if (!shopId) return;
    
    const num = parseFloat(amount.replace(',', '.'));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Geçersiz miktar', 'Lütfen pozitif bir sayı gir.');
      return;
    }
    if (num > maxAvailable) {
      Alert.alert('Yetersiz bakiye', `Çekilebilir tutar: ${maxAvailable.toFixed(2)}₺`);
      return;
    }
    if (!bank) {
      Alert.alert('IBAN Eksik', 'Önce banka bilgilerini kaydetmen gerek.');
      return;
    }

    setIsSaving(true);
    try {
      await createWithdraw(shopId, { amount: num });
      setSuccessModalVisible(true);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Çekim talebi oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const closeAndGoBack = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  // Bakiye yetersiz veya IBAN yoksa hata göster
  if (!bank) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Para Çek</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <Ionicons name="alert-circle" size={60} color="#F59E0B" />
          <Text style={{ fontSize: 18, fontWeight: '800', marginTop: 16, color: '#111827' }}>
            IBAN Bilgisi Yok
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 }}>
            Para çekebilmek için önce banka bilgilerini kaydetmen lazım.
          </Text>
          <TouchableOpacity 
            style={[styles.confirmBtn, { paddingHorizontal: 30, marginTop: 20 }]}
            onPress={() => router.replace('/business/edit-bank')}
          >
            <Text style={styles.confirmBtnText}>IBAN Ekle</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const numAmount = parseFloat(amount.replace(',', '.'));
  const isButtonDisabled = !amount || isNaN(numAmount) || numAmount <= 0 || numAmount > maxAvailable || isSaving;

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
            <Text style={styles.infoLabel}>Kullanılabilir Bakiye</Text>
            <Text style={styles.infoValue}>{maxAvailable.toFixed(2)}₺</Text>
          </View>

          <View style={styles.bankPreview}>
            <Ionicons name="card-outline" size={18} color="#6B7280" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.bankPreviewLabel}>Hedef Hesap</Text>
              <Text style={styles.bankPreviewIban}>{maskIban(bank.iban)}</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Çekmek İstediğin Tutar</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
              editable={!isSaving}
            />
            <Text style={styles.currency}>₺</Text>
          </View>

          {numAmount > maxAvailable && (
            <Text style={styles.errorText}>
              ⚠️ Bakiyeden fazla giriş yaptın
            </Text>
          )}

          <TouchableOpacity 
            style={styles.allAmountBtn}
            onPress={() => setAmount(maxAvailable.toFixed(2))}
            disabled={isSaving}
          >
            <Text style={styles.allAmountText}>Tümünü Çek ({maxAvailable.toFixed(2)}₺)</Text>
          </TouchableOpacity>

          <View style={styles.warningBox}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.warningText}>
              Talebin onaylandıktan sonra ödeme kayıtlı IBAN'ına 1-3 iş günü içinde yansıtılır.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmBtn, isButtonDisabled && styles.disabledBtn]}
            onPress={handleWithdraw}
            disabled={isButtonDisabled}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.confirmBtnText, isButtonDisabled && styles.disabledText]}>
                Çekim Talebi Oluştur
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* BAŞARI MODALI */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBg}>
              <Ionicons name="checkmark" size={40} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Talebin Alındı</Text>
            <Text style={styles.modalDesc}>
              {amount}₺ tutarındaki çekim talebin başarıyla oluşturuldu. Onaylanınca IBAN'ına yansıyacak.
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
  infoCard: { backgroundColor: '#F0F9F6', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
  infoLabel: { color: '#0A4D44', fontSize: 14, fontWeight: '600', opacity: 0.7 },
  infoValue: { color: '#0A4D44', fontSize: 28, fontWeight: '900', marginTop: 5 },

  bankPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 14, marginBottom: 25 },
  bankPreviewLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', letterSpacing: 0.5 },
  bankPreviewIban: { fontSize: 13, fontWeight: '700', color: '#111827', marginTop: 2, fontFamily: 'monospace' },

  inputLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: '#0A4D44', paddingBottom: 10 },
  input: { flex: 1, fontSize: 40, fontWeight: '800', color: '#111827' },
  currency: { fontSize: 30, fontWeight: '800', color: '#111827', marginLeft: 10 },
  errorText: { color: '#E11D48', fontSize: 13, fontWeight: '600', marginTop: 8 },
  allAmountBtn: { marginTop: 15, alignSelf: 'flex-end' },
  allAmountText: { color: '#0A4D44', fontWeight: '700', fontSize: 14 },
  warningBox: { flexDirection: 'row', marginTop: 30, backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, alignItems: 'center' },
  warningText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#6B7280', lineHeight: 20 },
  footer: { padding: 24 },
  confirmBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  disabledBtn: { backgroundColor: '#F3F4F6' },
  disabledText: { color: '#9CA3AF' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%' },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalBtn: { backgroundColor: '#0A4D44', width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});