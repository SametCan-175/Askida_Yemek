import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Daha geniş bir örnek veri seti
const ALL_TRANSACTIONS = [
  { id: '1', title: 'Sipariş Ödemesi (SL-8F4A2C)', amount: '+45.50₺', date: 'Bugün, 14:20', type: 'income' },
  { id: '2', title: 'Sipariş Ödemesi (SL-A9B4C2)', amount: '+32.00₺', date: 'Bugün, 12:45', type: 'income' },
  { id: '3', title: 'Banka Hesabına Transfer', amount: '-500.00₺', date: 'Dün, 09:15', type: 'withdrawal' },
  { id: '4', title: 'Sipariş Ödemesi (SL-C3D4E5)', amount: '+55.00₺', date: '24 Nisan, 20:10', type: 'income' },
  { id: '5', title: 'Sipariş Ödemesi (SL-D5E6F7)', amount: '+28.00₺', date: '23 Nisan, 18:30', type: 'income' },
  { id: '6', title: 'Banka Hesabına Transfer', amount: '-250.00₺', date: '20 Nisan, 11:00', type: 'withdrawal' },
  { id: '7', title: 'Sipariş Ödemesi (SL-G7H8I9)', amount: '+120.00₺', date: '19 Nisan, 14:15', type: 'income' },
];

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<'all' | 'income' | 'withdrawal'>('all');

  const filteredData = ALL_TRANSACTIONS.filter(item => 
    filter === 'all' ? true : item.type === filter
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşlem Geçmişi</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Filtreleme Sekmeleri */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'income' && styles.activeFilterTab]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterText, filter === 'income' && styles.activeFilterText]}>Kazançlar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, filter === 'withdrawal' && styles.activeFilterTab]}
          onPress={() => setFilter('withdrawal')}
        >
          <Text style={[styles.filterText, filter === 'withdrawal' && styles.activeFilterText]}>Ödemeler</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.transactionsList}>
          {filteredData.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[
                styles.iconBg, 
                { backgroundColor: item.type === 'income' ? '#F0F9F6' : '#FFF1F2' }
              ]}>
                <Ionicons 
                  name={item.type === 'income' ? "arrow-down" : "arrow-up"} 
                  size={20} 
                  color={item.type === 'income' ? "#10B981" : "#E11D48"} 
                />
              </View>
              <View style={styles.textContainer}>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  
  filterContainer: { flexDirection: 'row', padding: 15, gap: 10, backgroundColor: '#F9FAFB' },
  filterTab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  activeFilterTab: { backgroundColor: '#0A4D44', borderColor: '#0A4D44' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  activeFilterText: { color: '#FFFFFF' },

  scrollContent: { padding: 20 },
  transactionsList: { backgroundColor: '#FFFFFF' },
  transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 15 },
  transTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  transDate: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  transAmount: { fontSize: 16, fontWeight: '800' }
});