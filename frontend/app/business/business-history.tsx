import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BusinessHistory() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Geçmiş Teslimatlar</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.emptyIconBg}>
          <MaterialCommunityIcons name="clipboard-text-search-outline" size={80} color="#A7D1C6" />
        </View>
        <Text style={styles.emptyTitle}>Henüz teslimat yok</Text>
        <Text style={styles.emptyDesc}>
          Tamamlanan teslimatlarınız ve satış detaylarınız burada listelenecek.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0A4D44', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22 }
});