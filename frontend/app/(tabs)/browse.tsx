import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BrowseScreen() {
  return (
    <View style={styles.container}>
      {/* Harita Arka Planı (Şimdilik görsel, yakında gerçek harita olacak) */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80' }} 
        style={styles.mapBackground} 
      />

      {/* Üst Arama ve Filtreleme Çubuğu */}
      <SafeAreaView style={styles.topControls}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text style={styles.searchText}>Search</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="location-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="options-outline" size={22} color="#0A4D44" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Alttaki Beyaz Uyarı Paneli (Fotoğraftaki gibi) */}
      <View style={styles.bottomSheet}>
        <Text style={styles.sheetTitle}>No location selected</Text>
        <Text style={styles.sheetDesc}>
          Let us know where you would like to save surplus food.
        </Text>
        <TouchableOpacity style={styles.chooseButton}>
          <Text style={styles.chooseButtonText}>Choose location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E5E7EB' },
  mapBackground: { width: '100%', height: '100%', position: 'absolute' },
  
  topControls: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 50, gap: 10, alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', height: 48, borderRadius: 24, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  searchText: { marginLeft: 10, fontSize: 16, color: '#9CA3AF' },
  iconButton: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  sheetDesc: { fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 24 },
  chooseButton: { backgroundColor: '#0A4D44', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 24 },
  chooseButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});