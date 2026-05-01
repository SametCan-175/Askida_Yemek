import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Politika Bölümü Bileşeni
const PrivacySection = ({ icon, title, content }: { icon: any, title: string, content: string }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name={icon} size={22} color="#0A4D44" />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionText}>{content}</Text>
  </View>
);

export default function PrivacyPolicy() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Güvenlik Rozeti */}
        <View style={styles.topBanner}>
          <MaterialCommunityIcons name="shield-check" size={50} color="#0A4D44" />
          <Text style={styles.topTitle}>Verileriniz Güvende</Text>
          <Text style={styles.topSubtitle}>Gizliliğinizi nasıl koruduğumuzu öğrenin.</Text>
        </View>

        <View style={styles.lastUpdateBox}>
          <Text style={styles.lastUpdateText}>Son Güncelleme: 23 Nisan 2026</Text>
        </View>

        {/* Politika Maddeleri */}
        <PrivacySection 
          icon="database-eye-outline"
          title="Toplanan Veriler" 
          content="Adınız, e-posta adresiniz, telefon numaranız ve sipariş geçmişiniz size daha iyi bir hizmet sunabilmek adına toplanmaktadır." 
        />

        <PrivacySection 
          icon="map-marker-radius-outline"
          title="Konum Bilgileri" 
          content="Size en yakın işletmeleri göstermek ve teslimat sürecini yönetmek için konum verileriniz yalnızca uygulama açıkken kullanılır." 
        />

        <PrivacySection 
          icon="share-variant-outline"
          title="Veri Paylaşımı" 
          content="Kişisel verileriniz asla üçüncü taraf reklam şirketlerine satılmaz. Sadece siparişin tamamlanması için gerekli bilgiler işletme ile paylaşılır." 
        />

        <PrivacySection 
          icon="lock-outline"
          title="Veri Güvenliği" 
          content="Tüm verileriniz modern şifreleme yöntemleri (SSL/TLS) ile korunmakta ve güvenli sunucularımızda saklanmaktadır." 
        />

        <PrivacySection 
          icon="account-cancel-outline"
          title="Verileri Silme Hakkı" 
          content="Dilediğiniz zaman hesap ayarları üzerinden tüm verilerinizin kalıcı olarak silinmesini talep edebilirsiniz." 
        />

        <View style={styles.infoFooter}>
          <Text style={styles.infoFooterText}>
            Gizlilikle ilgili daha fazla soru için: 
            <Text style={{ fontWeight: '800', color: '#0A4D44' }}> privacy@sonlokma.com</Text>
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  
  scrollContent: { padding: 20 },

  topBanner: { alignItems: 'center', marginVertical: 20 },
  topTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginTop: 10 },
  topSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 5 },

  lastUpdateBox: { 
    backgroundColor: '#E6F0EE', 
    alignSelf: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginBottom: 25 
  },
  lastUpdateText: { fontSize: 11, fontWeight: '700', color: '#0A4D44' },

  sectionCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 18, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 1
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconWrapper: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    backgroundColor: '#F0F9F7', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sectionText: { fontSize: 14, color: '#6B7280', lineHeight: 22 },

  infoFooter: { marginTop: 20, marginBottom: 40, alignItems: 'center' },
  infoFooterText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' }
});