import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { fetchMyShop, fetchShopBank, ShopBank } from '../../services/business';

/**
 * IBAN'ı maskele: TR12 •••• •••• •••• •••• 5678
 */
function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  const start = iban.slice(0, 4);
  const end = iban.slice(-4);
  const middle = '•••• •••• •••• •••• ';
  return `${start} ${middle}${end}`;
}

export default function BusinessPayments() {
  const { user } = useAuth();
  const [bank, setBank] = useState<ShopBank | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const myShop = await fetchMyShop(user.id);
      if (!myShop) return;
      setShopId(myShop.id);
      const bankInfo = await fetchShopBank(myShop.id);
      setBank(bankInfo);
    } catch (err) {
      console.log('Banka bilgisi yüklenemedi:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Bilgiler yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IBAN ve Ödemeler</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
      >
        {bank ? (
          <>
            <Text style={styles.label}>KAYITLI BANKA HESABI</Text>
            <View style={styles.bankCard}>
              <View style={styles.bankCardHeader}>
                <View style={styles.bankIconBg}>
                  <MaterialCommunityIcons name="bank" size={24} color="#0A4D44" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.bankName}>{bank.bank_name || 'Banka'}</Text>
                  <Text style={styles.holderName}>{bank.account_holder}</Text>
                </View>
                <Ionicons name="shield-checkmark" size={22} color="#10B981" />
              </View>

              <View style={styles.divider} />

              <Text style={styles.ibanLabel}>IBAN</Text>
              <Text style={styles.ibanText}>{maskIban(bank.iban)}</Text>
            </View>

            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => router.push('/business/edit-bank')}
            >
              <Ionicons name="create-outline" size={20} color="#0A4D44" />
              <Text style={styles.editBtnText}>Bilgileri Düzenle</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconBg}>
              <MaterialCommunityIcons name="bank-plus" size={50} color="#A7D1C6" />
            </View>
            <Text style={styles.emptyTitle}>Henüz banka bilgisi yok</Text>
            <Text style={styles.emptyDesc}>
              Ödemelerinizi alabilmek için banka hesabı bilgilerinizi ekleyin.
            </Text>
            <TouchableOpacity 
              style={styles.addBtn} 
              onPress={() => router.push('/business/edit-bank')}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Banka Bilgisi Ekle</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#0A4D44" />
          <Text style={styles.infoText}>
            Ödemeleriniz her haftanın Cuma günü hesabınıza aktarılır.
          </Text>
        </View>

        <View style={styles.securityBox}>
          <Ionicons name="lock-closed" size={18} color="#6B7280" />
          <Text style={styles.securityText}>
            IBAN bilgileriniz şifrelenerek saklanır ve sadece sizin hesabınıza aktarım için kullanılır.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  content: { padding: 20 },
  label: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },

  bankCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16 },
  bankCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  bankIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  bankName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  holderName: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  ibanLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginBottom: 6, letterSpacing: 0.5 },
  ibanText: { fontSize: 15, fontWeight: '700', color: '#111827', fontFamily: 'monospace', letterSpacing: 1 },

  editBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F9F6', padding: 14, borderRadius: 14, gap: 8, marginBottom: 24 },
  editBtnText: { fontSize: 14, fontWeight: '700', color: '#0A4D44' },

  emptyBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#F3F4F6' },
  emptyIconBg: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0A4D44', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  addBtn: { flexDirection: 'row', backgroundColor: '#0A4D44', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, alignItems: 'center', gap: 6 },
  addBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },

  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F0EE', padding: 15, borderRadius: 12, marginBottom: 12 },
  infoText: { flex: 1, marginLeft: 10, color: '#0A4D44', fontSize: 13, fontWeight: '500', lineHeight: 18 },
  securityBox: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  securityText: { flex: 1, marginLeft: 10, color: '#6B7280', fontSize: 12, lineHeight: 16 },
});