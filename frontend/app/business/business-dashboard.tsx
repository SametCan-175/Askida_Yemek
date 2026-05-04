import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchMyShop, 
  fetchShopListings, 
  fetchShopReservations, 
  updateReservationStatus,
  Shop 
} from '../../services/business';
import { Listing } from '../../services/listings';
import { Reservation } from '../../services/reservations';

export default function BusinessDashboard() {
  const { user } = useAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isProcessingScan, setIsProcessingScan] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Mağaza bilgisini bul
      const myShop = await fetchMyShop(user.id);
      setShop(myShop);

      // Paralel olarak listing'ler ve rezervasyonlar
      const [shopListings, shopReservations] = await Promise.all([
        myShop ? fetchShopListings(myShop.id) : Promise.resolve([]),
        fetchShopReservations(),
      ]);

      setListings(shopListings);
      setReservations(shopReservations);
    } catch (err: any) {
      console.error('Dashboard yüklenemedi:', err);
      Alert.alert('Hata', err.message || 'Veriler yüklenirken bir sorun oluştu.');
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

  // Bugünün teslim edilen siparişlerinden günlük kazanç hesapla
  const dailyEarnings = (() => {
    const today = new Date().toDateString();
    const todayPickedUp = reservations.filter(r => {
      const isToday = new Date(r.created_at).toDateString() === today;
      const isPickedUp = r.status === 'picked_up';
      return isToday && isPickedUp;
    });

    return todayPickedUp.reduce((sum, r) => {
      const listing = listings.find(l => l.id === r.listing_id);
      return sum + (listing ? listing.discounted_price * r.quantity : 0);
    }, 0);
  })();

  // Aktif stok toplamı
  const totalStock = listings
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.quantity, 0);

  // Bugünkü teslimatlar
  const todayDeliveries = reservations.filter(r => {
    const today = new Date().toDateString();
    return new Date(r.created_at).toDateString() === today;
  });

  // QR Tarama
  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Hata', 'QR kod taramak için kamera iznine ihtiyacımız var.');
        return;
      }
    }
    setIsCameraVisible(true);
  };

  const handleBarCodeScanned = async ({ data }: { type: string, data: string }) => {
    if (isProcessingScan) return;
    setIsProcessingScan(true);
    setIsCameraVisible(false);

    try {
      // QR kod ya direkt rezervasyon ID'si ya da "SL-000123" gibi formatlanmış olabilir
      let reservationId: number;
      if (data.startsWith('SL-')) {
        reservationId = parseInt(data.replace('SL-', ''));
      } else {
        reservationId = parseInt(data);
      }

      if (isNaN(reservationId)) {
        Alert.alert('Geçersiz QR', 'Bu QR kod tanımlanamadı.');
        return;
      }

      await updateReservationStatus(reservationId, 'picked_up');
      Alert.alert(
        '✅ Sipariş Teslim Edildi!', 
        `Sipariş #${reservationId} başarıyla onaylandı.`,
        [{ text: 'Harika!', onPress: () => loadData() }]
      );
    } catch (error: any) {
      console.error("Teslimat API Hatası:", error);
      Alert.alert(
        'Hata', 
        error.message?.includes('404') 
          ? 'Bu rezervasyon bulunamadı.' 
          : 'Teslimat onaylanamadı, tekrar dene.'
      );
    } finally {
      setIsProcessingScan(false);
    }
  };

  // Status'ten Türkçe etiket
  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'picked_up': return 'Teslim Edildi';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'picked_up': return '#10B981';
      case 'confirmed': return '#3B82F6';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>İşletme verileri yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <View style={styles.bagIconBg}>
          <MaterialCommunityIcons name="storefront-outline" size={28} color="#0A4D44" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.welcomeText}>Hoş Geldin,</Text>
          <Text style={styles.headerName}>{shop?.name || user?.full_name || 'İşletme'}</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/business/business-settings')}>
          <Ionicons name="settings-outline" size={26} color="#0A4D44" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
      >
        {/* Özet Kartları */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Text style={styles.statLabel}>Aktif Stok</Text>
            <Text style={styles.statValue}>{totalStock}</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.statLabel}>Bugünkü Kazanç</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{dailyEarnings.toFixed(0)}₺</Text>
          </View>
        </View>

        {/* QR OKUTMA */}
        <TouchableOpacity 
          style={styles.qrCard}
          activeOpacity={0.8}
          onPress={handleOpenScanner}
        >
          <View style={styles.qrContent}>
            <View style={styles.qrTextContent}>
              <Text style={styles.qrTitle}>Teslimat İçin QR Tara</Text>
              <Text style={styles.qrDesc}>Müşterinin kodunu okutarak paketi güvenle teslim et.</Text>
            </View>
            <View style={styles.qrIconPlaceholder}>
              <MaterialCommunityIcons name="qrcode-scan" size={40} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Aktif Stoklar */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktif Stoklar</Text>
          <TouchableOpacity onPress={() => router.push('/business/add-product')}>
            <Text style={styles.seeAllText}>+ Yeni Ekle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          {listings.length === 0 ? (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="package-variant-closed" size={50} color="#A7D1C6" />
              <Text style={styles.emptyText}>Henüz aktif ilan yok.</Text>
              <Text style={styles.emptyHelper}>"+ Yeni Ekle" ile sürpriz paket oluştur.</Text>
            </View>
          ) : (
            listings.map((item) => (
              <View key={item.id} style={styles.stockItemCard}>
                <View style={styles.stockInfo}>
                  <Text style={styles.storeName}>{item.title}</Text>
                  <Text style={styles.productDesc}>
                    Birim: {item.discounted_price.toFixed(2)}₺ · Kalan: {item.quantity}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#10B981' : '#9CA3AF' }]} />
                  <Text style={styles.statusBadgeText}>
                    {item.status === 'active' ? 'Aktif' : 'Pasif'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Bugünkü Teslimatlar */}
        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Bugünkü Siparişler</Text>
          <Text style={styles.countText}>{todayDeliveries.length} adet</Text>
        </View>
        <View style={styles.cardsContainer}>
          {todayDeliveries.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={50} color="#A7D1C6" />
              <Text style={styles.emptyText}>Bugün henüz sipariş yok.</Text>
            </View>
          ) : (
            todayDeliveries.map((order) => {
              const listing = listings.find(l => l.id === order.listing_id);
              return (
                <View key={order.id} style={styles.orderRow}>
                  <Ionicons 
                    name={order.status === 'picked_up' ? 'checkmark-circle' : 'time'} 
                    size={28} 
                    color={statusColor(order.status)} 
                  />
                  <View style={styles.orderInfo}>
                    <Text style={styles.storeName}>
                      Sipariş #{order.id} · {order.quantity} adet
                    </Text>
                    <Text style={styles.timeDistanceText}>
                      {listing?.title || 'İlan silinmiş'} · {new Date(order.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                    </Text>
                  </View>
                  <Text style={[styles.orderStatus, { color: statusColor(order.status) }]}>
                    {statusLabel(order.status)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* QR OKUYUCU MODAL */}
      <Modal visible={isCameraVisible} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => setIsCameraVisible(false)} style={styles.closeCameraBtn}>
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Müşterinin Kodunu Okutun</Text>
          </View>
          
          <CameraView 
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={isProcessingScan ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          
          <View style={styles.scannerOverlay}>
             <View style={styles.scannerFrame} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F2' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  bagIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  welcomeText: { fontSize: 13, color: '#6B7280' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  settingsBtn: { padding: 5 },
  scrollContent: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, elevation: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  statLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  qrCard: { backgroundColor: '#0A4D44', borderRadius: 20, overflow: 'hidden', marginBottom: 25, elevation: 5 },
  qrContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  qrTextContent: { flex: 1, paddingRight: 10 },
  qrTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  qrDesc: { fontSize: 14, color: '#A7D1C6', lineHeight: 20 },
  qrIconPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  seeAllText: { fontSize: 15, fontWeight: '700', color: '#0A4D44' },
  countText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  cardsContainer: { gap: 12 },
  emptyBox: { backgroundColor: '#FFFFFF', padding: 30, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  emptyText: { marginTop: 12, fontSize: 15, fontWeight: '700', color: '#0A4D44' },
  emptyHelper: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  stockItemCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6' },
  stockInfo: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  productDesc: { fontSize: 13, color: '#6B7280' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F9F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: '#0A4D44' },
  orderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  orderInfo: { flex: 1, marginLeft: 12 },
  timeDistanceText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  orderStatus: { fontSize: 13, fontWeight: '800' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraHeader: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
  closeCameraBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cameraTitle: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginRight: 44 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 250, height: 250, borderWidth: 4, borderColor: '#10B981', borderRadius: 20, backgroundColor: 'transparent' }
});