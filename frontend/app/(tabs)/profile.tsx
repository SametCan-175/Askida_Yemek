import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <Ionicons name="happy-outline" size={32} color="#0A4D44" />
        <Text style={styles.headerName}>İsim ekle</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={26} color="#0A4D44" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Sipariş Yok Bölümü */}
        <View style={styles.emptyOrderSection}>
          <View style={styles.bagIconBg}>
            <MaterialCommunityIcons name="shopping-outline" size={40} color="#0A4D44" />
          </View>
          <Text style={styles.sectionTitle}>Hiç siparişin yok</Text>
          <Text style={styles.sectionDesc}>Kurtarılmayı bekleyen harika yemekler var!</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Bir Sürpriz Paket Bul</Text>
          </TouchableOpacity>
        </View>

        {/* Davet Kartı */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <View style={styles.inviteTextContent}>
              <Text style={styles.inviteTitle}>Arkadaşlarını davet et</Text>
              <Text style={styles.inviteDesc}>
                Katılan ve yemek kurtaran her arkadaşın için kupon kazan!
              </Text>
              <TouchableOpacity style={styles.voucherBadge}>
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
             <TouchableOpacity style={styles.gotItBtn}>
                <Text style={styles.gotItBtnText}>Tamam, anladım</Text>
             </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerName: { fontSize: 20, fontWeight: '800', color: '#111827', marginLeft: 12, flex: 1 },
  settingsBtn: { padding: 5 },
  scrollContent: { padding: 20 },

  emptyOrderSection: { alignItems: 'center', marginVertical: 30 },
  bagIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sectionDesc: { fontSize: 15, color: '#4B5563', marginBottom: 10 },
  linkText: { fontSize: 16, fontWeight: '700', color: '#0A4D44', textDecorationLine: 'underline' },

  inviteCard: { backgroundColor: '#0A4D44', borderRadius: 20, overflow: 'hidden' },
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