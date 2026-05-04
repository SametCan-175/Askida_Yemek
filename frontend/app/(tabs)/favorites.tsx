import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, 
  ScrollView, Image, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useFavorites } from './_layout';
import { fetchListings, Listing } from '../../services/listings';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=60';
const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1555507036-ab1d4075c6f1?auto=format&fit=crop&w=100&q=60';

export default function FavouritesScreen() {
  const { favorites, toggleFavorite } = useFavorites();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa her odaklandığında yeniden çek
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const res = await fetchListings({ limit: 100 });
          if (active) setAllListings(res.listings);
        } catch {
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [])
  );

  const favoriteListings = allListings.filter(l => favorites.includes(l.id));

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoriler</Text>
      </View>

      {favoriteListings.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.emptyCircle}>
            <MaterialCommunityIcons name="store-search-outline" size={100} color="#A7D1C6" />
          </View>
          <Text style={styles.title}>Favori fırsatın yok</Text>
          <Text style={styles.description}>
            Beğendiğin paketleri kalbe basarak buraya ekleyebilirsin.
          </Text>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(tabs)/')}
          >
            <Text style={styles.actionButtonText}>Fırsatları Gör</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {favoriteListings.map((item) => {
            const image = item.image_url || DEFAULT_IMAGE;
            return (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card} 
                activeOpacity={0.9}
                onPress={() => router.push(`/shop/${item.id}`)}
              >
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.cardImage} />
                  {item.badge_text && (
                    <View style={styles.newBadge}>
                      <Ionicons name="sparkles" size={11} color="#92400E" />
                      <Text style={styles.newBadgeText}>{item.badge_text}</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    style={styles.favoriteBtn} 
                    onPress={() => toggleFavorite(item.id)}
                  >
                    <Ionicons name="heart" size={22} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.storeName}>{item.shop?.name || item.title}</Text>
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {item.ai_description || item.description || ''}
                  </Text>
                  <View style={styles.footerRow}>
                    <Text style={styles.priceText}>{item.discounted_price.toFixed(2)}₺</Text>
                    <Text style={styles.stockText}>{item.quantity} kaldı</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyCircle: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 22, fontWeight: '800', color: '#0A4D44', marginBottom: 12, textAlign: 'center' },
  description: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 30 },
  actionButton: { backgroundColor: '#0A4D44', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15, width: '100%', alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  imageContainer: { width: '100%', height: 150 },
  cardImage: { width: '100%', height: '100%' },
  newBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
  newBadgeText: { fontSize: 11, fontWeight: '900', color: '#92400E' },
  favoriteBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FFFFFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  cardContent: { padding: 16 },
  storeName: { fontSize: 16, fontWeight: '800', color: '#111827' },
  productDesc: { fontSize: 13, color: '#6B7280', marginTop: 5, marginBottom: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 16, fontWeight: '900', color: '#0A4D44' },
  stockText: { fontSize: 12, fontWeight: '700', color: '#0A4D44' }
});