import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SettingItem = ({ icon, title }: { icon: any, title: string }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={() => console.log(`${title} tıklandı`)}>
    <View style={styles.itemLeft}>
      <Ionicons name={icon} size={24} color="#374151" style={styles.itemIcon} />
      <Text style={styles.itemText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesabı yönet</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <SettingItem icon="person-outline" title="Hesap detayları" />
        <SettingItem icon="card-outline" title="Ödeme kartları" />
        <SettingItem icon="ticket-outline" title="Kuponlar ve indirimler" />
        <SettingItem icon="gift-outline" title="Özel Ödüller" />
        <SettingItem icon="notifications-outline" title="Bildirimler" />
        <SettingItem icon="headset-outline" title="Müşteri hizmetleri" />

        <Text style={styles.sectionHeader}>TOPLULUK</Text>
        <SettingItem icon="people-outline" title="Arkadaşlarını davet et" />
        <SettingItem icon="chatbox-ellipses-outline" title="Bir mağaza öner" />
        <SettingItem icon="person-add-outline" title="Son Lokma'ya Katıl" />

        <Text style={styles.sectionHeader}>DİĞER</Text>
        <SettingItem icon="eye-off-outline" title="Gizli mağazalar" />
        <SettingItem icon="document-text-outline" title="Blog" />
        <SettingItem icon="shield-checkmark-outline" title="Yasal" />

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/login')}>
          <Text style={styles.logoutText}>Çıkış yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  scrollContent: { paddingBottom: 40 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 30 },
  itemText: { fontSize: 16, color: '#374151', marginLeft: 10 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginTop: 30, marginBottom: 10, paddingHorizontal: 20 },
  logoutBtn: { marginHorizontal: 20, marginTop: 40, paddingVertical: 16, borderRadius: 30, borderWidth: 1.5, borderColor: '#EA4335', alignItems: 'center' },
  logoutText: { color: '#EA4335', fontSize: 16, fontWeight: '800' }
});