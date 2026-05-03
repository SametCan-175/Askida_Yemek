import { useAuth } from '../../contexts/AuthContext'; // Yol dosyaya göre değişir
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
const SettingsRow = ({ icon, label, isLast = false, onPress }: any) => (
  <TouchableOpacity 
    style={[styles.rowContainer, isLast && styles.lastRow]} 
    onPress={onPress} // Tıklama özelliği burada aktif
    activeOpacity={0.7}
  >
    <View style={styles.rowLeft}>
      <MaterialCommunityIcons name={icon} size={24} color="#111827" style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function BusinessSettingsScreen() {
  const { logout } = useAuth();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşletme Ayarları</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileHeader}>
          <View style={styles.storeLogoCircle}>
            <Text style={styles.storeLogoText}>TP</Text>
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.storeName}>Trakya Pastanesi</Text>
            <TouchableOpacity onPress={() => router.push('/business/store-setup')}>
              <Text style={styles.editProfileText}>İşletme Profilini Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.groupLabel}>MAĞAZA VE FİNANS</Text>
        <View style={styles.menuCard}>
          <SettingsRow 
            icon="storefront-outline" 
            label="Mağaza Detayları ve Konum" 
            onPress={() => router.push('/business/business-detail')} // Adım 1'e gider
          />
          <SettingsRow 
            icon="clock-time-four-outline" 
            label="Teslimat Saatleri" 
            onPress={() => router.push('/business/business-times')} // Adım 2'ye gider
          />
          <SettingsRow 
            icon="bank-outline" 
            label="IBAN ve Ödeme Bilgileri" 
            onPress={() => router.push('/business/business-payments')} // Adım 2'ye gider
          />
          <SettingsRow 
            icon="history" 
            label="Geçmiş Teslimatlar" 
            isLast={true} 
            onPress={() => router.push('/business/business-history')} 
          />
        </View>

        <Text style={styles.groupLabel}>CİHAZ VE TERCİHLER</Text>
        <View style={styles.menuCard}>
          {/* Senin 'settings' klasöründeki dosyalara gidiyorlar */}
          <SettingsRow 
            icon="bell-outline" 
            label="Bildirim Ayarları" 
            onPress={() => router.push('/settings/notifications')} //
          />
          <SettingsRow 
            icon="shield-lock-outline" 
            label="Şifre ve Güvenlik" 
            isLast={true} 
            onPress={() => router.push('/settings/security')} //
          />
        </View>

        <Text style={styles.groupLabel}>DESTEK VE YASAL</Text>
        <View style={styles.menuCard}>
          <SettingsRow 
            icon="help-circle-outline" 
            label="Yardım Merkezi" 
            onPress={() => router.push('/settings/support')} //
          />
          <SettingsRow 
            icon="file-document-outline" 
            label="Kullanım Koşulları" 
            onPress={() => router.push('/settings/terms')} //
          />
          <SettingsRow 
            icon="shield-check-outline" 
            label="Gizlilik Politikası" 
            isLast={true} 
            onPress={() => router.push('/settings/privacy')} //
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
         onPress={async () => {
  await logout();
  router.replace('/login');
}} //
        >
          <Text style={styles.logoutText}>Hesaptan Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Son Lokma İşletme v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  storeLogoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center' },
  storeLogoText: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  profileTextContainer: { marginLeft: 16 },
  storeName: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  editProfileText: { fontSize: 14, color: '#6B7280', textDecorationLine: 'underline' },
  groupLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 24, paddingHorizontal: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  lastRow: { borderBottomWidth: 0 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 16 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: '#111827' },
  logoutButton: { backgroundColor: '#FEF2F2', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
  versionText: { textAlign: 'center', fontSize: 12, color: '#D1D5DB', fontWeight: '600' }
});