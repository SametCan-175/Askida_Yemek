import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function FavouritesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoriler</Text>
      </View>

      <View style={styles.content}>
        {/* Üzgün Surat İllüstrasyonu */}
        <View style={styles.illustrationContainer}>
          <View style={styles.sadFaceCircle}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={100} color="#A7D1C6" />
          </View>
        </View>

        <Text style={styles.title}>GPS etkin değil</Text>
        <Text style={styles.description}>
          GPS'i etkinleştirmek için butona dokunun veya yukarıdan bir konum seçin.
        </Text>

        <TouchableOpacity style={styles.gpsButton} activeOpacity={0.8}>
          <Text style={styles.gpsButtonText}>GPS'i Etkinleştir</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  illustrationContainer: { marginBottom: 30 },
  sadFaceCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#0A4D44', marginBottom: 12, textAlign: 'center' },
  description: { fontSize: 16, color: '#4B5563', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  gpsButton: { backgroundColor: '#0A4D44', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  gpsButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});