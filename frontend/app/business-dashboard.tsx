import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Alert,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Başlangıç Stok Verisi
const INITIAL_STOCK = [
  { id: '1', title: 'Sürpriz Paket (Standart)', count: 5, price: '50.00₺' },
  { id: '2', title: 'Unlu Mamul Paketi', count: 2, price: '40.00₺' },
];

const RECENT_ORDERS = [
  { id: '101', customer: 'Ahmet H.', time: '18:45', status: 'Teslim Edildi' },
  { id: '102', customer: 'Ayşe K.', time: '18:20', status: 'Teslim Edildi' },
];

export default function BusinessDashboard() {
  const [stocks, setStocks] = useState(INITIAL_STOCK);
  
  // Kamera State'leri
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraVisible, setIsCameraVisible] = useState(false);

  // Stok Arttırma Fonksiyonu
  const increaseStock = (id: string) => {
    setStocks(stocks.map(item => item.id === id ? { ...item, count: item.count + 1 } : item));
  };

  // Stok Azaltma Fonksiyonu
  const decreaseStock = (id: string) => {
    setStocks(stocks.map(item => 
      item.id === id && item.count > 0 ? { ...item, count: item.count - 1 } : item
    ));
  };

  // QR Tarama Butonuna Basıldığında
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

  // Kamera Bir QR Kod Okuduğunda
  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    setIsCameraVisible(false);
    // Burada barkoddan gelen datayı backend'e atabilirsin
    Alert.alert(
      'Sipariş Bulundu!', 
      `QR Kod Başarıyla Okundu.\n\nSipariş Kodu: ${data}\n\nPaketi müşteriye teslim edebilirsiniz.`,
      [{ text: 'Tamam, Teslim Et', onPress: () => console.log('Stok düşme işlemi yapılacak') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Üst Bar (profile.tsx ile uyumlu) */}
      <View style={styles.header}>
        <View style={styles.bagIconBg}>
          <MaterialCommunityIcons name="storefront-outline" size={28} color="#0A4D44" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.welcomeText}>Hoş Geldiniz,</Text>
          <Text style={styles.headerName}>Trakya Pastanesi</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={26} color="#0A4D44" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Özet Kartları */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Text style={styles.statLabel}>Kalan Paket</Text>
            <Text style={styles.statValue}>{stocks.reduce((acc, curr) => acc + curr.count, 0)}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.statLabel}>Günlük Kazanç</Text>
            <Text style={[styles.statValue, { color: '#10B981' }]}>330.00₺</Text>
          </View>
        </View>

        {/* ANA AKSİYON: QR OKUTMA (profile.tsx'deki davet kartına benzer) */}
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

        {/* Stok Yönetimi Başlığı (index.tsx ile uyumlu) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Aktif Stoklar</Text>
          <TouchableOpacity onPress={() => Alert.alert('Bilgi', 'Buradan yeni ürün ekleme sayfasına gidilecek.')}>
            <Text style={styles.seeAllText}>+ Yeni Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Stok Listesi */}
        <View style={styles.cardsContainer}>
          {stocks.map((item) => (
            <View key={item.id} style={styles.stockItemCard}>
              <View style={styles.stockInfo}>
                <Text style={styles.storeName}>{item.title}</Text>
                <Text style={styles.productDesc}>Birim Fiyat: {item.price}</Text>
              </View>
              
              {/* Çalışan + / - Butonları */}
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={[styles.counterBtn, item.count === 0 && styles.counterBtnDisabled]} 
                  onPress={() => decreaseStock(item.id)}
                  disabled={item.count === 0}
                >
                  <Ionicons name="remove" size={20} color={item.count === 0 ? "#9CA3AF" : "#111827"} />
                </TouchableOpacity>
                <Text style={styles.countText}>{item.count}</Text>
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => increaseStock(item.id)}
                >
                  <Ionicons name="add" size={20} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Son İşlemler */}
        <View style={[styles.sectionHeader, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Bugünkü Teslimatlar</Text>
        </View>
        <View style={styles.cardsContainer}>
          {RECENT_ORDERS.map((order) => (
            <View key={order.id} style={styles.orderRow}>
              <Ionicons name="checkmark-circle" size={28} color="#10B981" />
              <View style={styles.orderInfo}>
                <Text style={styles.storeName}>{order.customer}</Text>
                <Text style={styles.timeDistanceText}>{order.time}</Text>
              </View>
              <Text style={styles.orderStatus}>{order.status}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* QR OKUYUCU MODALI */}
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
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          
          {/* Kamera Üzerindeki Çerçeve Efekti */}
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
  
  // Header Stilleri (profile.tsx baz alındı)
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  bagIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  welcomeText: { fontSize: 13, color: '#6B7280' },
  headerName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  settingsBtn: { padding: 5 },
  
  scrollContent: { padding: 16 },

  // Kart Stilleri (index.tsx baz alındı)
  statsRow: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  card: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  statLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: '600' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#111827' },

  // QR Kartı (profile.tsx davet kartı baz alındı)
  qrCard: { backgroundColor: '#0A4D44', borderRadius: 20, overflow: 'hidden', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  qrContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
  qrTextContent: { flex: 1, paddingRight: 10 },
  qrTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  qrDesc: { fontSize: 14, color: '#A7D1C6', lineHeight: 20 },
  qrIconPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  // Başlıklar (index.tsx baz alındı)
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  seeAllText: { fontSize: 15, fontWeight: '700', color: '#0A4D44' },

  cardsContainer: { gap: 12 },

  // Stok Kartı (index.tsx card yapısı)
  stockItemCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  stockInfo: { flex: 1 },
  storeName: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  productDesc: { fontSize: 14, color: '#6B7280' },
  
  counterContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 4 },
  counterBtn: { width: 36, height: 36, backgroundColor: '#FFFFFF', borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  counterBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  countText: { paddingHorizontal: 16, fontSize: 16, fontWeight: '800', color: '#111827' },

  // Sipariş Satırı
  orderRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  orderInfo: { flex: 1, marginLeft: 12 },
  timeDistanceText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  orderStatus: { fontSize: 14, color: '#10B981', fontWeight: '700' },

  // Kamera Modalı Stilleri
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraHeader: { position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
  closeCameraBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cameraTitle: { flex: 1, color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginRight: 44 },
  scannerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 250, height: 250, borderWidth: 4, borderColor: '#10B981', borderRadius: 20, backgroundColor: 'transparent' }
});