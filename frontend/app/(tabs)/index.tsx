import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const SURPRISE_BAGS = [
  {
    id: '1',
    name: 'Keşan Merkez Fırını',
    description: 'Taze simit, poğaça ve unlu mamuller',
    time: 'Bugün: 19:30 - 20:30',
    distance: '1.2 km',
    stock: 5, // Fiyat yerine stok ekledik
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=60',
    logo: 'https://images.unsplash.com/photo-1555507036-ab1d4075c6f1?auto=format&fit=crop&w=100&q=60'
  },
  {
    id: '2',
    name: 'Yusuf Çapraz Kampüs Kantini',
    description: 'Öğle yemeğinden kalan taze sandviçler',
    time: 'Bugün: 15:00 - 16:00',
    distance: '0.5 km',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=60',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=100&q=60'
  },
];

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Keşan, Edirne</Text>
          <Text style={styles.headerTitle}>Bugün Ne Kurtarıyoruz?</Text>
        </View>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {SURPRISE_BAGS.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push({
              pathname: `/shop/${item.id}`,
              params: { name: item.name, image: item.image, logo: item.logo, distance: item.distance }
            })}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>YENİ</Text>
              </View>
              <View style={styles.logoContainer}>
                <Image source={{ uri: item.logo }} style={styles.storeLogo} />
              </View>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardTopRow}>
                <Text style={styles.storeName}>{item.name}</Text>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={12} color="#D97706" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
              </View>
              
              <Text style={styles.productDesc}>{item.description}</Text>
              
              <View style={styles.footerRow}>
                <View style={styles.infoGroup}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>{item.time}</Text>
                </View>

                {/* İNDİRİMLİ FİYAT YERİNE STOK BİLGİSİ GELDİ */}
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>{item.stock} Ürün Kaldı</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  profileIcon: { padding: 10, backgroundColor: '#FFFFFF', borderRadius: 15, elevation: 2 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 25, marginBottom: 25, overflow: 'hidden', elevation: 4 },
  imageContainer: { width: '100%', height: 180 },
  cardImage: { width: '100%', height: '100%' },
  newBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  newBadgeText: { fontSize: 11, fontWeight: '800', color: '#0A4D44' },
  logoContainer: { position: 'absolute', bottom: -20, left: 20, padding: 3, backgroundColor: '#FFFFFF', borderRadius: 15, elevation: 5 },
  storeLogo: { width: 50, height: 50, borderRadius: 12 },
  
  cardContent: { padding: 20, paddingTop: 30 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { marginLeft: 4, fontSize: 12, fontWeight: '700', color: '#D97706' },
  productDesc: { fontSize: 14, color: '#6B7280', marginTop: 5, marginBottom: 15 },
  
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoGroup: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 6, fontSize: 13, color: '#4B5563', fontWeight: '500' },

  // Yeni Stok Rozeti Tasarımı
  stockBadge: { 
    backgroundColor: '#F0F9F6', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7D1C6'
  },
  stockText: { 
    color: '#0A4D44', 
    fontSize: 12, 
    fontWeight: '800' 
  }
});