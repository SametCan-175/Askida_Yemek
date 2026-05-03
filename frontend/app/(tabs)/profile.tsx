import { useAuth } from '../../contexts/AuthContext'; // Yol dosyaya göre değişir
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  Share 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [showInviteCard, setShowInviteCard] = useState(true);
  const { user, logout } = useAuth();
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Son Lokma ile yemek israfını önle, sürpriz paketleri indirimli al! Uygulamayı hemen indir: [Market Linki Buraya Gelecek]',
      });
    } catch (error) {
      console.log('Paylaşım hatası:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="happy-outline" size={32} color="#0A4D44" />
        <Text style={styles.headerName}>{user?.full_name || 'Kullanıcı'}</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={26} color="#0A4D44" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.emptyOrderSection}>
          <View style={styles.bagIconBg}>
            <MaterialCommunityIcons name="shopping-outline" size={40} color="#0A4D44" />
          </View>
          <Text style={styles.sectionTitle}>Hiç siparişin yok</Text>
          <Text style={styles.sectionDesc}>Kurtarılmayı bekleyen harika yemekler var!</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/')}>
            <Text style={styles.linkText}>Bir Sürpriz Paket Bul</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/profile/orders')}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconBg}>
                <Ionicons name="receipt-outline" size={20} color="#0A4D44" />
              </View>
              <Text style={styles.menuText}>Geçmiş Siparişlerim</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/favorites')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#FFF0F2' }]}>
                <Ionicons name="heart-outline" size={20} color="#E11D48" />
              </View>
              <Text style={styles.menuText}>Favori İşletmelerim</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          {/* GÜNCELLENEN KISIM: Canlı Destek butonu artık user_id gönderiyor */}
          <TouchableOpacity 
            style={styles.menuItem} 
            activeOpacity={0.7}
            onPress={() => router.push({
              pathname: '/support',
              params: { user_id: 'berkay_123' } // Arkadaşının istediği ID parametresi
            })}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="chatbubbles-outline" size={20} color="#4F46E5" />
              </View>
              <Text style={styles.menuText}>Canlı Destek (AI)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {showInviteCard && (
          <View style={styles.inviteCard}>
            <View style={styles.inviteContent}>
              <View style={styles.inviteTextContent}>
                <Text style={styles.inviteTitle}>Arkadaşlarını davet et</Text>
                <Text style={styles.inviteDesc}>
                  Katılan ve yemek kurtaran her arkadaşın için kupon kazan!
                </Text>
                <TouchableOpacity style={styles.voucherBadge} onPress={handleShare}>
                  <Ionicons name="ticket-outline" size={16} color="#0A4D44" />
                  <Text style={styles.voucherBadgeText}>60₺ kupon kazan</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inviteImagePlaceholder}>
                <Ionicons name="people" size={60} color="#A7D1C6" />
              </View>
            </View>

            <View style={styles.promoBottom}>
               <Text style={styles.promoMainTitle}>Kazanabildiğin kadar 60₺ kupon kazan</Text>
               <Text style={styles.promoSub}>
                  Arkadaşların ilk Sürpriz Paketlerini kurtarsın, sen de her seferinde 60₺ kupon kazan — hem de gezegene yardım ederken!
               </Text>
               <TouchableOpacity style={styles.gotItBtn} onPress={() => setShowInviteCard(false)}>
                  <Text style={styles.gotItBtnText}>Tamam, anladım</Text>
               </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerName: { fontSize: 20, fontWeight: '800', color: '#111827', marginLeft: 12, flex: 1 },
  settingsBtn: { padding: 5 },
  scrollContent: { padding: 20, flexGrow: 1 },
  emptyOrderSection: { alignItems: 'center', marginVertical: 20 },
  bagIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sectionDesc: { fontSize: 15, color: '#4B5563', marginBottom: 10 },
  linkText: { fontSize: 16, fontWeight: '700', color: '#0A4D44', textDecorationLine: 'underline' },
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 30, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 16, fontWeight: '700', color: '#374151' },
  inviteCard: { backgroundColor: '#0A4D44', borderRadius: 20, overflow: 'hidden', marginTop: 'auto' },
  inviteContent: { flexDirection: 'row', backgroundColor: '#F0F9F6', padding: 20, alignItems: 'center' },
  inviteTextContent: { flex: 1, paddingRight: 10 },
  inviteTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  inviteDesc: { fontSize: 14, color: '#4B5563', marginBottom: 12 },
  voucherBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#A7D1C6' },
  voucherBadgeText: { marginLeft: 6, fontSize: 13, fontWeight: '700', color: '#0A4D44' },
  inviteImagePlaceholder: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  promoBottom: { padding: 20, alignItems: 'center' },
  promoMainTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  promoSub: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', lineHeight: 20, opacity: 0.9, marginBottom: 20 },
  gotItBtn: { backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, width: '100%', alignItems: 'center' },
  gotItBtnText: { color: '#0A4D44', fontSize: 16, fontWeight: '800' }
});