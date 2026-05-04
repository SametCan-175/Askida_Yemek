import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, ActivityIndicator, RefreshControl
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';

import { useFavorites } from './_layout';
import { useAuth } from '../../contexts/AuthContext';
import { fetchListings, Listing } from '../../services/listings';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=60';
const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1555507036-ab1d4075c6f1?auto=format&fit=crop&w=100&q=60';

function formatPickupTime(start: string, end: string): string {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    const isToday = startDate.toDateString() === now.toDateString();
    const prefix = isToday ? 'Bugün' : startDate.toLocaleDateString('tr-TR');
    const fmt = (d: Date) => d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    return `${prefix}: ${fmt(startDate)} - ${fmt(endDate)}`;
  } catch {
    return 'Saat bilgisi yok';
  }
}

export default function Index() {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();

  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Konum izni
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  const loadListings = useCallback(async () => {
    try {
      setError(null);
      const filters: any = { limit: 50 };
      if (userLocation) {
        filters.lat = userLocation.lat;
        filters.lon = userLocation.lon;
        filters.radius = 10;
        if (user) filters.user_id = user.id;
      }

      const response = await fetchListings(filters);
      setListings(response.listings);
    } catch (err: any) {
      setError(err.message || 'Fırsatlar yüklenemedi');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [userLocation, user]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={styles.loadingText}>Fırsatlar yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  // Kullanıcı adının ilk kelimesi
  const firstName = user?.full_name?.split(' ')[0] || 'Hoş geldin';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Merhaba, {firstName}</Text>
          <Text style={styles.headerTitle}>Bugün Ne Kurtarıyoruz?</Text>
        </View>
        <TouchableOpacity style={styles.profileIcon} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle-outline" size={28} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A4D44']} />}
      >
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadListings}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {listings.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="basket-off-outline" size={80} color="#A7D1C6" />
            <Text style={styles.emptyTitle}>Henüz fırsat yok</Text>
            <Text style={styles.emptyDesc}>Bölgende yeni paketler eklendiğinde burada göreceksin.</Text>
          </View>
        ) : (
          listings.map((item) => {
            const isFav = favorites.includes(item.id);
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
                    <View style={styles.aiBadge}>
                      <Ionicons name="sparkles" size={12} color="#92400E" />
                      <Text style={styles.aiBadgeText}>{item.badge_text}</Text>
                    </View>
                  )}

                  <TouchableOpacity 
                    style={styles.favoriteBtn}
                    activeOpacity={0.7}
                    onPress={() => toggleFavorite(item.id)}
                  >
                    <Ionicons 
                      name={isFav ? "heart" : "heart-outline"} 
                      size={22} 
                      color={isFav ? "#EF4444" : "#111827"} 
                    />
                  </TouchableOpacity>

                  <View style={styles.logoContainer}>
                    <Image source={{ uri: DEFAULT_LOGO }} style={styles.storeLogo} />
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.storeName} numberOfLines={1}>
                      {item.shop?.name || item.title}
                    </Text>
                    <View style={styles.priceBox}>
                      <Text style={styles.discountedPrice}>{item.discounted_price.toFixed(2)}₺</Text>
                      <Text style={styles.originalPrice}>{item.original_price.toFixed(2)}₺</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.productDesc} numberOfLines={2}>
                    {item.ai_description || item.description || item.title}
                  </Text>
                  
                  <View style={styles.footerRow}>
                    <View style={styles.infoGroup}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
                      <Text style={styles.infoText}>{formatPickupTime(item.pickup_start, item.pickup_end)}</Text>
                    </View>
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockText}>{item.quantity} kaldı</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  profileIcon: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 15, elevation: 2 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626' },
  retryText: { fontSize: 13, color: '#0A4D44', fontWeight: '700' },

  emptyState: { alignItems: 'center', padding: 50, marginTop: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#0A4D44', marginTop: 20 },
  emptyDesc: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 25, marginBottom: 25, overflow: 'hidden', elevation: 4 },
  imageContainer: { width: '100%', height: 180, backgroundColor: '#F3F4F6' },
  cardImage: { width: '100%', height: '100%' },
  
  aiBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: '#FDE68A', flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiBadgeText: { fontSize: 11, fontWeight: '900', color: '#92400E' },

  favoriteBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: '#FFFFFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  
  logoContainer: { position: 'absolute', bottom: -20, left: 20, padding: 3, backgroundColor: '#FFFFFF', borderRadius: 15, elevation: 5 },
  storeLogo: { width: 50, height: 50, borderRadius: 12 },

  cardContent: { padding: 20, paddingTop: 30 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1, marginRight: 10 },
  priceBox: { alignItems: 'flex-end' },
  discountedPrice: { fontSize: 16, fontWeight: '900', color: '#0A4D44' },
  originalPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  
  productDesc: { fontSize: 14, color: '#6B7280', marginTop: 5, marginBottom: 15 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  infoText: { marginLeft: 6, fontSize: 12, color: '#4B5563', fontWeight: '500' },
  stockBadge: { backgroundColor: '#F0F9F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#A7D1C6' },
  stockText: { color: '#0A4D44', fontSize: 12, fontWeight: '800' }
});