import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchMyShop, 
  fetchWalletBalance, 
  fetchWalletTransactions, 
  fetchShopBank,
  WalletBalance,
  WalletTransaction,
  ShopBank
} from '../../services/business';

function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  return `${iban.slice(0, 4)} •••• •••• •••• •••• ${iban.slice(-4)}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  
  const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) return `Bugün, ${time}`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Dün, ${time}`;
  
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' }) + `, ${time}`;
}

export default function WalletScreen() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<number | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [bank, setBank] = useState<ShopBank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const myShop = await fetchMyShop(user.id);
      if (!myShop) {
        Alert.alert('Hata', 'Mağaza bulunamadı.');
        return;
      }
      setShopId(myShop.id);

      const [bal, trans, bankInfo] = await Promise.all([
        fetchWalletBalance(myShop.id),
        fetchWalletTransactions(myShop.id),
        fetchShopBank(myShop.id),
      ]);
      setBalance(bal);
      setTransactions(trans);
      setBank(bankInfo);
    } catch (err: any) {
      console.log('Cüzdan yüklenemedi:', err);
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

  const handleWithdrawPress = () => {
    if (!bank) {
      Alert.alert(
        'IBAN Eksik', 
        'Para çekmek için önce banka bilgilerinizi kaydedin.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'IBAN Ekle', onPress: () => router.push('/business/edit-bank') }
        ]
      );
      return;
    }
    if (!balance || balance.available_balance <= 0) {
      Alert.alert('Yetersiz Bakiye', 'Çekilebilecek bakiye yok.');
      return;
    }
    router.push('/business/withdraw');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Cüzdan yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  // Son 5 işlemi göster
  const recentTransactions = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cüzdanım</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
      >
        
        {/* Ana Bakiye Kartı */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Kullanılabilir Bakiye</Text>
          <Text style={styles.balanceAmount}>{balance?.available_balance.toFixed(2) || '0.00'}₺</Text>
          
          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceFooter}>
            <View>
              <Text style={styles.subBalanceLabel}>Bekleyen Çekim</Text>
              <Text style={styles.subBalanceValue}>{balance?.pending_withdraw.toFixed(2) || '0.00'}₺</Text>
            </View>
            <TouchableOpacity 
              style={styles.withdrawBtn}
              onPress={handleWithdrawPress}
            >
              <Text style={styles.withdrawBtnText}>Para Çek</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Toplam Kazanç</Text>
            <Text style={styles.statValue}>{balance?.total_earned.toFixed(0) || '0'}₺</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Toplam Çekilen</Text>
            <Text style={styles.statValue}>{balance?.total_withdrawn.toFixed(0) || '0'}₺</Text>
          </View>
        </View>

        {/* IBAN Bilgisi Kartı */}
        <Text style={styles.sectionTitle}>Banka Bilgileri</Text>
        {bank ? (
          <TouchableOpacity style={styles.ibanCard} onPress={() => router.push('/business/edit-bank')}>
            <View style={styles.ibanIconBg}>
              <FontAwesome5 name="university" size={18} color="#0A4D44" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.ibanTitle}>{bank.bank_name || 'Kayıtlı Banka'}</Text>
              <Text style={styles.ibanNumber}>{maskIban(bank.iban)}</Text>
            </View>
            <Ionicons name="create-outline" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addBankCard} onPress={() => router.push('/business/edit-bank')}>
            <Ionicons name="add-circle" size={22} color="#0A4D44" />
            <Text style={styles.addBankText}>Banka Bilgisi Ekle</Text>
          </TouchableOpacity>
        )}

        {/* Son İşlemler */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          {transactions.length > 5 && (
            <TouchableOpacity onPress={() => router.push('/business/transactions')}>
              <Text style={styles.seeAllText}>Tümü ({transactions.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="wallet-outline" size={40} color="#A7D1C6" />
            <Text style={styles.emptyText}>Henüz işlem yok</Text>
            <Text style={styles.emptyHelper}>İlk siparişin geldiğinde burada görünecek.</Text>
          </View>
        ) : (
          <View style={styles.transactionsContainer}>
            {recentTransactions.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={[
                  styles.transIconBg, 
                  { backgroundColor: item.type === 'income' ? '#F0F9F6' : '#FFF1F2' }
                ]}>
                  <Ionicons 
                    name={item.type === 'income' ? "arrow-down" : "arrow-up"} 
                    size={18} 
                    color={item.type === 'income' ? "#10B981" : "#E11D48"} 
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.transTitle} numberOfLines={1}>{item.description}</Text>
                  <Text style={styles.transDate}>{formatDate(item.created_at)}</Text>
                </View>
                <Text style={[
                  styles.transAmount, 
                  { color: item.type === 'income' ? "#10B981" : "#E11D48" }
                ]}>
                  {item.amount >= 0 ? '+' : ''}{item.amount.toFixed(2)}₺
                </Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scrollContent: { padding: 20 },

  balanceCard: { backgroundColor: '#0A4D44', borderRadius: 24, padding: 24, marginBottom: 20, elevation: 8 },
  balanceLabel: { color: '#A7D1C6', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '900' },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subBalanceLabel: { color: '#A7D1C6', fontSize: 12, fontWeight: '500' },
  subBalanceValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  withdrawBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  withdrawBtnText: { color: '#0A4D44', fontWeight: '800', fontSize: 14 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 25 },
  statBox: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111827', marginTop: 4 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 12 },
  seeAllText: { fontSize: 14, fontWeight: '700', color: '#0A4D44' },

  ibanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 25 },
  ibanIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  ibanTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  ibanNumber: { fontSize: 12, color: '#6B7280', marginTop: 2, fontFamily: 'monospace' },

  addBankCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F9F6', padding: 16, borderRadius: 16, marginBottom: 25, gap: 8 },
  addBankText: { fontSize: 15, fontWeight: '700', color: '#0A4D44' },

  emptyBox: { backgroundColor: '#FFF', padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#0A4D44' },
  emptyHelper: { marginTop: 4, fontSize: 13, color: '#6B7280' },

  transactionsContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  transIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  transTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  transDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  transAmount: { fontSize: 14, fontWeight: '800' }
});