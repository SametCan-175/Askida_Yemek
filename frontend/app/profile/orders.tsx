import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Image 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Örnek geçmiş veri
const PAST_ORDERS = [
  {
    id: 'SL-8F4A2C',
    storeName: 'Keşan Merkez Fırını',
    date: '24 Nisan 2026',
    total: '25.00₺',
    items: '2 Ürün',
    status: 'Teslim Edildi',
    color: '#10B981'
  },
  {
    id: 'SL-A9B4C2',
    storeName: 'Trakya Pastanesi',
    date: '22 Nisan 2026',
    total: '40.00₺',
    items: '1 Ürün',
    status: 'Teslim Edildi',
    color: '#10B981'
  }
];

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Siparişlerim</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {PAST_ORDERS.length > 0 ? (
          PAST_ORDERS.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderCard}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.storeRow}>
                  <View style={styles.storeIconBg}>
                    <MaterialCommunityIcons name="storefront" size={20} color="#0A4D44" />
                  </View>
                  <Text style={styles.storeName}>{order.storeName}</Text>
                </View>
                <Text style={styles.orderId}>{order.id}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Tarih</Text>
                  <Text style={styles.infoValue}>{order.date}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Miktar</Text>
                  <Text style={styles.infoValue}>{order.items}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Toplam</Text>
                  <Text style={styles.totalValue}>{order.total}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: order.color + '15' }]}>
                  <View style={[styles.statusDot, { backgroundColor: order.color }]} />
                  <Text style={[styles.statusText, { color: order.color }]}>{order.status}</Text>
                </View>
                <TouchableOpacity style={styles.detailBtn}>
                  <Text style={styles.detailBtnText}>Detaylar</Text>
                  <Ionicons name="chevron-forward" size={16} color="#0A4D44" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <MaterialCommunityIcons name="package-variant" size={80} color="#A7D1C6" />
            </View>
            <Text style={styles.emptyTitle}>Henüz siparişin yok</Text>
            <Text style={styles.emptyDesc}>Kurtarılmayı bekleyen lezzetleri keşfetmeye ne dersin?</Text>
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
  scrollContent: { padding: 16 },

  orderCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  storeRow: { flexDirection: 'row', alignItems: 'center' },
  storeIconBg: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  storeName: { fontSize: 15, fontWeight: '800', color: '#111827' },
  orderId: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { fontSize: 13, fontWeight: '700', color: '#374151' },
  totalValue: { fontSize: 14, fontWeight: '800', color: '#0A4D44' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '800' },
  detailBtn: { flexDirection: 'row', alignItems: 'center' },
  detailBtnText: { fontSize: 13, fontWeight: '700', color: '#0A4D44', marginRight: 4 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyIconBg: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0A4D44', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 }
});