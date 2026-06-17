import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg'; // GERÇEK QR KOD KÜTÜPHANESİ

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams();
  // Checkout'tan gelen orderId'yi yakalıyoruz
  const { storeName, time, orderId } = params; 

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <View style={styles.successHeader}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={60} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Son Lokmayı Kurtardın!</Text>
          <Text style={styles.successDesc}>
            Harika! Hem cebini korudun hem de doğaya kocaman bir iyilik yaptın.
          </Text>
        </View>

        <View style={styles.qrCard}>
          <Text style={styles.qrStoreName}>{storeName || 'İşletme Adı'}</Text>
          <Text style={styles.qrTimeLabel}>Teslim Alma Aralığı</Text>
          <Text style={styles.qrTimeValue}>{time || '19:30 - 20:30'}</Text>
          
          <View style={styles.qrPlaceholder}>
            {/* GERÇEK QR KOD ÇİZİMİ */}
            <QRCode
              value={(orderId as string) || 'HATA-KOD-YOK'}
              size={160}
              color="#111827"
              backgroundColor="#F9FAFB"
            />
          </View>
          
          {/* Sipariş numarasını metin olarak da gösterelim */}
          <Text style={styles.orderIdText}>Sipariş No: {orderId}</Text>
          
          <Text style={styles.qrInstruction}>
            Bu kodu dükkandaki görevliye okutarak paketini teslim alabilirsin.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.infoBoxText}>
            Sipariş detaylarına profilindeki "Siparişlerim" kısmından da ulaşabilirsin.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)/')}
        >
          <Text style={styles.homeButtonText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A4D44' },
  content: { flex: 1, alignItems: 'center', padding: 24, justifyContent: 'center' },
  
  successHeader: { alignItems: 'center', marginBottom: 30 },
  checkCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, textAlign: 'center' },
  successDesc: { fontSize: 15, color: '#A7D1C6', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 },

  qrCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 30, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  qrStoreName: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 15, textAlign: 'center' },
  qrTimeLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  qrTimeValue: { fontSize: 16, fontWeight: '800', color: '#0A4D44', marginBottom: 20 },
  
  qrPlaceholder: { width: 200, height: 200, backgroundColor: '#F9FAFB', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 15 },
  orderIdText: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 15, letterSpacing: 1 },
  
  qrInstruction: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },

  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 30, backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 15 },
  infoBoxText: { flex: 1, marginLeft: 10, fontSize: 12, color: '#FFFFFF', opacity: 0.8 },

  footer: { padding: 24, backgroundColor: 'transparent' },
  homeButton: { backgroundColor: '#FFFFFF', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  homeButtonText: { color: '#0A4D44', fontSize: 16, fontWeight: '800' }
});