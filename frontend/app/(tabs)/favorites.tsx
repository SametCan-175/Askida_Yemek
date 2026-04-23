import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function FavouritesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoriler</Text>
      </View>

      <View style={styles.content}>
        {/* Görsel Alanı - Mağaza İkonu */}
        <View style={styles.illustrationContainer}>
          <View style={styles.emptyCircle}>
            <MaterialCommunityIcons name="store-search-outline" size={100} color="#A7D1C6" />
          </View>
        </View>

        {/* Yeni Mesajlar */}
        <Text style={styles.title}>Favori restoranınız yok</Text>
        <Text style={styles.description}>
          Henüz listene hiçbir işletme eklemedin. Favori restoranlarını seçerek onlardan gelen fırsatları anında görebilirsin.
        </Text>

        {/* Keşfet Butonu */}
        <TouchableOpacity 
          style={styles.actionButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/')} // Ana sayfadaki 'Keşfet'e atar
        >
          <Text style={styles.actionButtonText}>Restoran Seçin</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#111827' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  illustrationContainer: { 
    marginBottom: 30 
  },
  emptyCircle: { 
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    backgroundColor: '#F0F9F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '800', 
    color: '#0A4D44', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  description: { 
    fontSize: 16, 
    color: '#6B7280', 
    textAlign: 'center', 
    lineHeight: 24,
    marginBottom: 30
  },
  actionButton: {
    backgroundColor: '#0A4D44',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});