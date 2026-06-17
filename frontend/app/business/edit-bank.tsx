import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { fetchMyShop, fetchShopBank, updateShopBank } from '../../services/business';

/**
 * IBAN'ı 4'erli gruplara ayır (görsel için)
 * TR560001200000000012345678 → "TR56 0001 2000 0000 0012 3456 78"
 */
function formatIban(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}

export default function EditBankScreen() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<number | null>(null);
  const [bankName, setBankName] = useState('');
  const [holderName, setHolderName] = useState('');
  const [iban, setIban] = useState('');
  
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
          
          const existingBank = await fetchShopBank(myShop.id);
          if (active && existingBank) {
            setBankName(existingBank.bank_name || '');
            setHolderName(existingBank.account_holder || '');
            setIban(formatIban(existingBank.iban));
          } else if (active && user.full_name) {
            // Yeni kayıt — hesap sahibini default user adından doldur
            setHolderName(user.full_name);
          }
        } catch (err) {
          console.log('Banka bilgisi yüklenemedi:', err);
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [user])
  );

  const handleSave = async () => {
    if (!shopId) return;

    if (holderName.trim().length < 3) {
      Alert.alert('Eksik bilgi', 'Hesap sahibi adını gir.');
      return;
    }

    // IBAN'ı temizle
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    if (!cleanIban.startsWith('TR') || cleanIban.length !== 26) {
      Alert.alert('Geçersiz IBAN', 'IBAN "TR" ile başlamalı ve 26 karakter olmalı (TR + 24 hane).');
      return;
    }

    setIsSaving(true);
    try {
      await updateShopBank(shopId, {
        iban: cleanIban,
        account_holder: holderName.trim(),
        bank_name: bankName.trim() || undefined,
      });
      setSuccessModalVisible(true);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Banka bilgisi kaydedilemedi.');
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Banka Bilgileri</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.warningBox}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#0A4D44" />
            <Text style={styles.warningText}>
              Ödemelerinizin sorunsuz gerçekleşmesi için IBAN bilgilerinizin işletme adına kayıtlı olduğundan emin olun.
            </Text>
          </View>

          <Text style={styles.label}>Banka Adı (Opsiyonel)</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="Örn: Ziraat Bankası"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />
          </View>

          <Text style={styles.label}>Hesap Sahibi *</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={holderName}
              onChangeText={setHolderName}
              placeholder="Ad Soyad veya İşletme Unvanı"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />
          </View>

          <Text style={styles.label}>IBAN Numarası *</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={iban}
              onChangeText={(txt) => setIban(formatIban(txt))}
              placeholder="TR.. .... .... .... .... .... .."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={32}  // 26 karakter + boşluklar
              editable={!isSaving}
            />
          </View>
          <Text style={styles.helperText}>
            TR ile başlayan 26 karakterlik IBAN'ınızı girin.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Bilgileri Kaydet</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* BAŞARI MODALI */}
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
  inputBox: { backgroundColor: '#F9FAFB', borderRadius: 15, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, height: 56, justifyContent: 'center', marginBottom: 16 },
  input: { fontSize: 16, color: '#111827', fontWeight: '600' },
  helperText: { fontSize: 12, color: '#9CA3AF', marginLeft: 4, marginTop: -8, marginBottom: 20 },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  saveBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, alignItems: 'center', width: '100%' },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 10, textAlign: 'center' },
  modalDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  modalBtn: { backgroundColor: '#0A4D44', width: '100%', height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});