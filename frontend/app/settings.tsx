import { useAuth } from '../contexts/AuthContext'; // Yol dosyaya göre değişir
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { logout } from '../services/auth';

const SettingRow = ({ icon, title, path, color = "#111827", isLast = false }: any) => (
<TouchableOpacity 
  style={styles.logoutSection}
  onPress={async () => {
    await logout();
    router.replace('/login');
  }}
>
    <View style={styles.rowLeft}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
      <Text style={styles.rowText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
const { logout } = useAuth(); 
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Profil Alanı */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>B</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Berkay</Text>
            <TouchableOpacity onPress={() => router.push('/settings/account-details')}>
              <Text style={styles.editProfileText}>Profilini Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuWrapper}>
          
          <Text style={styles.sectionLabel}>HESAP VE GÜVENLİK</Text>
          <View style={styles.sectionCard}>
            <SettingRow icon="account-outline" title="Hesap Detayları" path="/settings/account-details" />
            <SettingRow icon="map-marker-outline" title="Adreslerim" path="/settings/addresses" />
            <SettingRow icon="shield-lock-outline" title="Şifre ve Güvenlik" path="/settings/security" />
            <SettingRow icon="trophy-variant-outline" title="Özel Ödüller" path="/settings/special-rewards" isLast={true} />
          </View>

          <Text style={styles.sectionLabel}>TERCİHLER</Text>
          <View style={styles.sectionCard}>
            <SettingRow icon="bell-outline" title="Bildirim Ayarları" path="/settings/notifications" />
            <SettingRow icon="credit-card-outline" title="Ödeme Yöntemleri" path="/settings/payments" />
            <SettingRow icon="ticket-percent-outline" title="Kuponlarım" path="/settings/vouchers" />
            <SettingRow icon="heart-outline" title="Favori İşletmeler" path="/settings/favorites" />
            <SettingRow icon="earth" title="Dil Seçeneği" path="/settings/language" isLast={true} />
          </View>

          <Text style={styles.sectionLabel}>DESTEK VE YASAL</Text>
          <View style={styles.sectionCard}>
            <SettingRow icon="help-circle-outline" title="Yardım Merkezi" path="/settings/support" />
            <SettingRow icon="message-text-outline" title="Bize Ulaşın" path="/settings/contact-us" />
            <SettingRow icon="file-document-outline" title="Kullanım Koşulları" path="/settings/terms" />
            <SettingRow icon="eye-outline" title="Gizlilik Politikası" path="/settings/privacy" isLast={true} />
          </View>
        </View>

        {/* Çıkış Butonu */}
        <TouchableOpacity 
          style={styles.logoutSection}
          onPress={async () => {
 // await logout();
  router.replace('/login');
}}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Oturumu Kapat</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Versiyon 1.0.4 | Son Lokma</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' }, // Hafif gri arka plan (kartları belli eder)
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    backgroundColor: '#FFF'
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  
  profileHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 25,
    backgroundColor: '#FFF'
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: '#0A4D44', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarLetter: { color: '#FFF', fontSize: 24, fontWeight: '700' },
  profileInfo: { marginLeft: 15 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#111827' },
  editProfileText: { fontSize: 14, color: '#6B7280', marginTop: 3 },

  menuWrapper: { paddingHorizontal: 16 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#9CA3AF', 
    marginTop: 25, 
    marginBottom: 10,
    marginLeft: 5,
    letterSpacing: 1
  },
  
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },

  rowContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 15, fontWeight: '600', color: '#111827', marginLeft: 12 },

  logoutSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginTop: 30,
    paddingVertical: 15,
    justifyContent: 'center'
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444', marginLeft: 10 },
  versionText: { textAlign: 'center', color: '#D1D5DB', fontSize: 12, marginTop: 10, marginBottom: 40 }
});