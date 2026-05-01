import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BusinessDetail() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mağaza Bilgileri</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Mağaza Görseli */}
        <Text style={styles.sectionLabel}>MAĞAZA GÖRSELİ</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' }} 
            style={styles.storeImage} 
          />
          <TouchableOpacity style={styles.editImageBtn} onPress={() => router.push('/business/store-setup')}>
            <Ionicons name="camera" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Bilgi Kartı */}
        <Text style={styles.sectionLabel}>TEMEL BİLGİLER</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>İşletme Adı</Text>
            <Text style={styles.infoValue}>Trakya Pastanesi</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kategori</Text>
            <Text style={styles.infoValue}>Fırın & Pastane</Text>
          </View>
        </View>

        {/* Konum Kartı */}
        <Text style={styles.sectionLabel}>MAĞAZA KONUMU</Text>
        <TouchableOpacity style={styles.locationCard} onPress={() => router.push('/business/store-setup')}>
          <View style={styles.locationIconBg}>
            <Ionicons name="map-outline" size={24} color="#0A4D44" />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.locationTitle}>Haritadaki Konum</Text>
            <Text style={styles.locationDesc}>Konumu güncellemek için dokunun</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={() => router.back()}>
          <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  imageContainer: { width: '100%', height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: 25 },
  storeImage: { width: '100%', height: '100%' },
  editImageBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#0A4D44', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderOuterWidth: 2, borderColor: '#FFF' },
  infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#F3F4F6' },
  infoRow: { paddingVertical: 10 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  divider: { height: 1, backgroundColor: '#F9FAFB' },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  locationIconBg: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  locationTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  locationDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 28, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});