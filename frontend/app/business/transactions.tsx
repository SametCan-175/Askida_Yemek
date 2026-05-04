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
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { fetchMyShop, fetchWalletTransactions, WalletTransaction } from '../../services/business';

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

export default function TransactionsScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'income' | 'withdraw'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const myShop = await fetchMyShop(user.id);
      if (!myShop) return;
      const trans = await fetchWalletTransactions(myShop.id);
      setTransactions(trans);
    } catch (err) {
      console.log('İşlemler yüklenemedi:', err);
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

  const filtered = transactions.filter(t => 
    filter === 'all' ? true : t.type === filter
  );

  // Toplamları hesapla
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdraw = transactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>İşlemler yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Geçmişi</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Özet kartları */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: '#F0F9F6' }]}>
          <Text style={[styles.summaryLabel, { color: '#10B981' }]}>Toplam Gelir</Text>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>+{totalIncome.toFixed(0)}₺</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FFF1F2' }]}>
          <Text style={[styles.summaryLabel, { color: '#E11D48' }]}>Toplam Çekim</Text>
          <Text style={[styles.summaryValue, { color: '#E11D48' }]}>-{totalWithdraw.toFixed(0)}₺</Text>
        </View>
      </View>

      {/* Filtreler */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Tümü ({transactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'income' && styles.activeFilterTab]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterText, filter === 'income' && styles.activeFilterText]}>Gelirler</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'withdraw' && styles.activeFilterTab]}
          onPress={() => setFilter('withdraw')}
        >
          <Text style={[styles.filterText, filter === 'withdraw' && styles.activeFilterText]}>Çekimler</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={50} color="#A7D1C6" />
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'Henüz işlem yok' : 'Bu filtrede işlem yok'}
            </Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {filtered.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={[
                  styles.iconBg, 
                  { backgroundColor: item.type === 'income' ? '#F0F9F6' : '#FFF1F2' }
                ]}>
                  <Ionicons 
                    name={item.type === 'income' ? "arrow-down" : "arrow-up"} 
                    size={20} 
                    color={item.type === 'income' ? "#10B981" : "#E11D48"} 
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.transTitle} numberOfLines={1}>{item.description}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.transDate}>{formatDate(item.created_at)}</Text>
                    {item.type === 'withdraw' && (
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: item.status === 'paid' ? '#DCFCE7' : '#FEF3C7' }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          { color: item.status === 'paid' ? '#166534' : '#92400E' }
                        ]}>
                          {item.status === 'paid' ? 'Ödendi' : item.status === 'pending' ? 'Bekliyor' : item.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </Text>
                      </View>
                    )}
                  </View>
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

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },

  summaryRow: { flexDirection: 'row', gap: 10, padding: 15, paddingBottom: 5 },
  summaryCard: { flex: 1, padding: 14, borderRadius: 14 },
  summaryLabel: { fontSize: 12, fontWeight: '700' },
  summaryValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  
  filterContainer: { flexDirection: 'row', padding: 15, gap: 10 },
  filterTab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  activeFilterTab: { backgroundColor: '#0A4D44', borderColor: '#0A4D44' },
  filterText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  activeFilterText: { color: '#FFFFFF' },

  scrollContent: { padding: 20 },
  transactionsList: { backgroundColor: '#FFFFFF' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 15 },
  transTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  transDate: { fontSize: 12, color: '#9CA3AF' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  transAmount: { fontSize: 16, fontWeight: '800' },

  emptyBox: { alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#0A4D44' },
});