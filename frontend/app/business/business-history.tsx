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
import { fetchMyShop, fetchShopListings, fetchShopReservations } from '../../services/business';
import { Listing } from '../../services/listings';
import { Reservation } from '../../services/reservations';

export default function BusinessHistory() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const myShop = await fetchMyShop(user.id);
      const [shopListings, shopReservations] = await Promise.all([
        myShop ? fetchShopListings(myShop.id) : Promise.resolve([]),
        fetchShopReservations(),
      ]);
      setListings(shopListings);
      setReservations(shopReservations);
    } catch (err) {
      console.log('Geçmiş yüklenemedi:', err);
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

  // Sadece teslim edilenler, en yeniden eskiye
  const completedReservations = reservations
    .filter(r => r.status === 'picked_up')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // İstatistikler
  const totalEarnings = completedReservations.reduce((sum, r) => {
    const listing = listings.find(l => l.id === r.listing_id);
    return sum + (listing ? listing.discounted_price * r.quantity : 0);
  }, 0);

  const totalSavedKg = parseFloat((completedReservations.length * 0.35).toFixed(1));

  // Tarihe göre grupla
  const groupedByDate: { [key: string]: Reservation[] } = {};
  completedReservations.forEach(r => {
    const dateKey = new Date(r.created_at).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(r);
  });

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Geçmiş yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geçmiş Teslimatlar</Text>
        <View style={{ width: 26 }} />
      </View>

      {completedReservations.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.emptyContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
        >
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name="clipboard-text-search-outline" size={80} color="#A7D1C6" />
          </View>
          <Text style={styles.emptyTitle}>Henüz teslimat yok</Text>
          <Text style={styles.emptyDesc}>
            Tamamlanan teslimatlarınız ve satış detaylarınız burada listelenecek.
          </Text>
          <Text style={styles.helperText}>
            Müşteri sipariş verince QR kodunu okutarak teslimatı tamamla.
          </Text>
        </ScrollView>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
        >
          {/* İstatistik kartları */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="basket-check" size={24} color="#0A4D44" />
              <Text style={styles.statValue}>{completedReservations.length}</Text>
              <Text style={styles.statLabel}>Teslimat</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="cash" size={24} color="#92400E" />
              <Text style={[styles.statValue, { color: '#92400E' }]}>{totalEarnings.toFixed(0)}₺</Text>
              <Text style={[styles.statLabel, { color: '#92400E' }]}>Toplam Kazanç</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
              <MaterialCommunityIcons name="leaf" size={24} color="#166534" />
              <Text style={[styles.statValue, { color: '#166534' }]}>{totalSavedKg} kg</Text>
              <Text style={[styles.statLabel, { color: '#166534' }]}>Kurtarılan</Text>
            </View>
          </View>

          {/* Tarih grupları */}
          {Object.entries(groupedByDate).map(([date, items]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateLabel}>{date}</Text>
              {items.map(r => {
                const listing = listings.find(l => l.id === r.listing_id);
                const totalPrice = listing ? listing.discounted_price * r.quantity : 0;
                return (
                  <View key={r.id} style={styles.orderCard}>
                    <View style={styles.orderIconBg}>
                      <Ionicons name="checkmark-done" size={22} color="#10B981" />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderTitle}>
                        {listing?.title || 'Silinmiş ilan'}
                      </Text>
                      <Text style={styles.orderMeta}>
                        Sipariş #{r.id} · {r.quantity} adet · {formatTime(r.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.orderPrice}>{totalPrice.toFixed(0)}₺</Text>
                  </View>
                );
              })}
            </View>
          ))}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },

  emptyContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0A4D44', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  helperText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 12, fontStyle: 'italic' },

  scrollContent: { padding: 20 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#F0F9F6', 
    padding: 14, 
    borderRadius: 16, 
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 18, fontWeight: '900', color: '#0A4D44', marginTop: 6 },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#0A4D44', marginTop: 2 },

  dateGroup: { marginBottom: 20 },
  dateLabel: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, marginLeft: 4, letterSpacing: 0.5 },
  orderCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 14, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: '#F3F4F6' 
  },
  orderIconBg: { 
    width: 42, 
    height: 42, 
    borderRadius: 21, 
    backgroundColor: '#DCFCE7', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  orderInfo: { flex: 1, marginLeft: 12 },
  orderTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  orderMeta: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  orderPrice: { fontSize: 16, fontWeight: '900', color: '#0A4D44' },
});