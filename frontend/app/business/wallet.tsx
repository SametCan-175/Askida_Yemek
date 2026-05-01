import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Örnek finansal veriler
const TRANSACTIONS = [
  { id: '1', title: 'Sipariş Ödemesi (SL-8F4A2C)', amount: '+45.50₺', date: 'Bugün, 14:20', type: 'income' },
  { id: '2', title: 'Sipariş Ödemesi (SL-A9B4C2)', amount: '+32.00₺', date: 'Bugün, 12:45', type: 'income' },
  { id: '3', title: 'Banka Hesabına Transfer', amount: '-500.00₺', date: 'Dün, 09:15', type: 'withdrawal' },
  { id: '4', title: 'Sipariş Ödemesi (SL-C3D4E5)', amount: '+55.00₺', date: '24 Nisan, 20:10', type: 'income' },
];

export default function WalletScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cüzdanım</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Ana Bakiye Kartı */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Kullanılabilir Bakiye</Text>
          <Text style={styles.balanceAmount}>845.50₺</Text>
          
          <View style={styles.balanceDivider} />
          
          <View style={styles.balanceFooter}>
            <View>
              <Text style={styles.subBalanceLabel}>Bekleyen Ödeme</Text>
              <Text style={styles.subBalanceValue}>124.00₺</Text>
            </View>
            <TouchableOpacity 
              style={styles.withdrawBtn}
              onPress={() => router.push('/business/withdraw')}
            >
              <Text style={styles.withdrawBtnText}>Para Çek</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* IBAN Bilgisi Kartı */}
        <Text style={styles.sectionTitle}>Banka Bilgileri</Text>
        <TouchableOpacity style={styles.ibanCard} onPress={() => router.push('/business/edit-bank')}>
          <View style={styles.ibanIconBg}>
            <FontAwesome5 name="university" size={18} color="#0A4D44" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.ibanTitle}>Ziraat Bankası</Text>
            <Text style={styles.ibanNumber}>TR56 **** **** **** **** 42</Text>
          </View>
          <Ionicons name="create-outline" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Son İşlemler Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <TouchableOpacity onPress={() => router.push('/business/transactions')}>
            <Text style={styles.seeAllText}>Tümü</Text>
          </TouchableOpacity>
        </View>

        {/* İşlem Listesi */}
        <View style={styles.transactionsContainer}>
          {TRANSACTIONS.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[
                styles.transIconBg, 
                { backgroundColor: item.type === 'income' ? '#F0F9F6' : '#FFF1F2' }
              ]}>
                <Ionicons 
                  name={item.type === 'income' ? "arrow-down" : "arrow-up"} 
                  size={18} 
                  color={item.type === 'income' ? "#10B981" : "#E11D48"} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.transTitle}>{item.title}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
              </View>
              <Text style={[
                styles.transAmount, 
                { color: item.type === 'income' ? "#10B981" : "#E11D48" }
              ]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  
  scrollContent: { padding: 20 },

  balanceCard: { backgroundColor: '#0A4D44', borderRadius: 24, padding: 24, marginBottom: 30, shadowColor: '#0A4D44', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  balanceLabel: { color: '#A7D1C6', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '900' },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  balanceFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subBalanceLabel: { color: '#A7D1C6', fontSize: 12, fontWeight: '500' },
  subBalanceValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  withdrawBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  withdrawBtnText: { color: '#0A4D44', fontWeight: '800', fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 15 },
  seeAllText: { fontSize: 14, fontWeight: '700', color: '#0A4D44' },

  ibanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 25 },
  ibanIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  ibanTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  ibanNumber: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  transactionsContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  transIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  transTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  transDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  transAmount: { fontSize: 15, fontWeight: '800' }
});