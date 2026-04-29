import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// GÜNCELLENEN KISIM: Ortak hafızayı ve Ana sayfadaki dükkan verilerini içeri aktarıyoruz
import { FavoritesContext } from './_layout'; 
import { SURPRISE_BAGS } from './index';

export default function FavouritesScreen() {
  const { favorites, toggleFavorite } = useContext(FavoritesContext);
  
  // Ana listedeki dükkanlardan sadece ID'si kalplenmiş olanları filtreleyip alıyoruz
  const favoriteShops = SURPRISE_BAGS.filter(shop => favorites?.includes(shop.id));

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoriler</Text>
      </View>

      {/* EĞER FAVORİ LİSTESİ BOŞSA: Senin orijinal illüstrasyonlu tasarımın çıkar */}
      {favoriteShops.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <View style={styles.emptyCircle}>
              <MaterialCommunityIcons name="store-search-outline" size={100} color="#A7D1C6" />
            </View>
          </View>

          <Text style={styles.title}>Favori restoranınız yok</Text>
          <Text style={styles.description}>
            Henüz listene hiçbir işletme eklemedin. Favori restoranlarını seçerek onlardan gelen fırsatları anında görebilirsin.
          </Text>

          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/')} 
          >
            <Text style={styles.actionButtonText}>Restoran Seçin</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* EĞER FAVORİ LİSTESİ DOLUYSA: Ana sayfadaki kartların aynısını buraya dizer */
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {favoriteShops.map((item) => (
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
                
                {item.badge_text ? (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>{item.badge_text}</Text>
                  </View>
                ) : null}

                {/* Tıklanınca favorilerden çıkaracak kırmızı kalp butonu */}
                <TouchableOpacity 
                  style={styles.favoriteBtn} 
                  activeOpacity={0.7} 
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons name="heart" size={22} color="#EF4444" />
                </TouchableOpacity>

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
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockText}>{item.stock} Ürün Kaldı</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  },

  // EKLENEN KISIM: Dolu liste çıktığında dükkan kartlarının tasarımı (index.tsx ile birebir aynı)
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 25, marginBottom: 25, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  imageContainer: { width: '100%', height: 180 },
  cardImage: { width: '100%', height: '100%' },
  newBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  newBadgeText: { fontSize: 11, fontWeight: '900', color: '#0A4D44', textTransform: 'uppercase' },
  favoriteBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FFFFFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
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
  stockBadge: { backgroundColor: '#F0F9F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#A7D1C6' },
  stockText: { color: '#0A4D44', fontSize: 12, fontWeight: '800' }
});