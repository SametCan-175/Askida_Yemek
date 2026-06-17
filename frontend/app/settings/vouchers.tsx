import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Alert,
  Keyboard
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Vouchers() {
  const [voucherCode, setVoucherCode] = useState('');
  const [vouchers, setVouchers] = useState([
    { id: '1', title: 'Hoş Geldin İndirimi', code: 'MERHABA50', discount: '50₺', expiry: '31.12.2026' }
  ]);

  const handleAddVoucher = () => {
    if (voucherCode.trim().length < 3) {
      Alert.alert("Hata", "Lütfen geçerli bir kupon kodu gir.");
      return;
    }

    // Basit bir kontrol simülasyonu
    const newVoucher = {
      id: Math.random().toString(),
      title: 'Özel İndirim',
      code: voucherCode.toUpperCase(),
      discount: '25%',
      expiry: '15.05.2026'
    };

    setVouchers([newVoucher, ...vouchers]);
    setVoucherCode('');
    Keyboard.dismiss();
    Alert.alert("Başarılı", "Kuponun başarıyla tanımlandı!");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kuponlar ve İndirimler</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* Kupon Ekleme Alanı */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>KUPON KODU EKLE</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Örn: INDIRIM20"
              placeholderTextColor="#9CA3AF"
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={[styles.applyBtn, { backgroundColor: voucherCode.length > 2 ? '#0A4D44' : '#E5E7EB' }]} 
              onPress={handleAddVoucher}
              disabled={voucherCode.length < 3}
            >
              <Text style={styles.applyBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>AKTİF KUPONLARIN</Text>

        {vouchers.length > 0 ? (
          vouchers.map((v) => (
            <View key={v.id} style={styles.voucherCard}>
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="ticket-percent" size={24} color="#0A4D44" />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.voucherTitle}>{v.title}</Text>
                  <Text style={styles.voucherCodeText}>Kod: <Text style={{fontWeight: '800'}}>{v.code}</Text></Text>
                  <Text style={styles.expiryText}>Son kullanma: {v.expiry}</Text>
                </View>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{v.discount}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="ticket-outline" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>Şu an aktif bir kuponun bulunmuyor.</Text>
          </View>
        )}

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
    backgroundColor: '#FFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 15, letterSpacing: 1, marginTop: 10 },
  
  inputSection: { marginBottom: 30 },
  inputWrapper: { flexDirection: 'row', gap: 10 },
  input: { 
    flex: 1, 
    backgroundColor: '#FFF', 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    borderRadius: 12, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    fontWeight: '600'
  },
  applyBtn: { 
    paddingHorizontal: 20, 
    justifyContent: 'center', 
    borderRadius: 12 
  },
  applyBtnText: { color: '#FFF', fontWeight: '800' },

  voucherCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFF', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#E6F0EE', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  cardInfo: { gap: 2 },
  voucherTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  voucherCodeText: { fontSize: 13, color: '#374151' },
  expiryText: { fontSize: 11, color: '#9CA3AF' },
  
  discountBadge: { backgroundColor: '#0A4D44', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  discountText: { color: '#FFF', fontWeight: '900', fontSize: 14 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9CA3AF', marginTop: 15, textAlign: 'center', fontSize: 15 }
});