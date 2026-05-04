import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, 
  Dimensions, SafeAreaView, ActivityIndicator 
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { fetchListingById, Listing } from '../../services/listings';

const { width } = Dimensions.get('window');

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=60';
const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1555507036-ab1d4075c6f1?auto=format&fit=crop&w=100&q=60';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await fetchListingById(parseInt(id as string));
        setListing(data);
      } catch (err: any) {
        setError(err.message || 'Fırsat yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <Text style={{ fontSize: 16, color: '#DC2626', textAlign: 'center', marginBottom: 20 }}>
          {error || 'Fırsat bulunamadı'}
        </Text>
        <TouchableOpacity style={styles.reserveButton} onPress={() => router.back()}>
          <Text style={styles.reserveButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const image = listing.image_url || DEFAULT_IMAGE;
  const totalPrice = count * listing.discounted_price;
  const stock = listing.quantity;

  const updateCount = (delta: number) => {
    setCount(prev => Math.max(0, Math.min(stock, prev + delta)));
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.imageHeader}>
          <Image source={{ uri: image }} style={styles.mainImage} />
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.storeHeader}>
            <Image source={{ uri: DEFAULT_LOGO }} style={styles.storeLogo} />
            <View style={styles.storeTitleInfo}>
              <Text style={styles.storeName}>{listing.shop?.name || listing.title}</Text>
              <Text style={styles.distanceText}>
                {listing.shop?.city || ''} {listing.shop?.district ? `• ${listing.shop.district}` : ''}
              </Text>
            </View>
          </View>

          {listing.ai_description ? (
            <View style={styles.aiDescBox}>
              <Ionicons name="sparkles" size={18} color="#D97706" />
              <Text style={styles.aiDescText}>{listing.ai_description}</Text>
            </View>
          ) : listing.description ? (
            <Text style={styles.normalDescText}>{listing.description}</Text>
          ) : null}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Sürpriz Paket</Text>
          <View style={styles.productCard}>
            <View style={styles.productLeft}>
              <Text style={styles.productTitle}>{listing.title}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.newPrice}>{listing.discounted_price.toFixed(2)}₺</Text>
                <Text style={styles.oldPrice}>{listing.original_price.toFixed(2)}₺</Text>
              </View>
              <Text style={styles.stockText}>Stok: {stock} adet</Text>
            </View>
            <View style={styles.counter}>
              <TouchableOpacity onPress={() => updateCount(-1)} style={styles.countBtn}>
                <Ionicons name="remove" size={18} color="#0A4D44" />
              </TouchableOpacity>
              <Text style={styles.countText}>{count}</Text>
              <TouchableOpacity onPress={() => updateCount(1)} style={styles.countBtn}>
                <Ionicons name="add" size={18} color="#0A4D44" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Teslim Alma Saatleri</Text>
          <View style={styles.timeBox}>
            <Ionicons name="time-outline" size={20} color="#0A4D44" />
            <Text style={styles.timeText}>
              {new Date(listing.pickup_start).toLocaleString('tr-TR')} {'\n→ '}
              {new Date(listing.pickup_end).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.totalItemsLabel}>{count} Adet</Text>
          <Text style={styles.totalPriceText}>Toplam: {totalPrice.toFixed(2)}₺</Text>
        </View>
        <TouchableOpacity 
          style={[styles.reserveButton, count === 0 && { backgroundColor: '#D1D5DB' }]} 
          disabled={count === 0}
          onPress={() => router.push({
            pathname: '/shop/checkout',
            params: { 
              listing_id: listing.id.toString(),
              storeName: listing.shop?.name || listing.title,
              totalItems: count.toString(),
              totalPrice: totalPrice.toFixed(2),
              time: `${new Date(listing.pickup_start).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})} - ${new Date(listing.pickup_end).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}`,
            }
          })}
        >
          <Text style={styles.reserveButtonText}>Devam Et</Text>
        </TouchableOpacity>
      </View>
    </View> 
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 140 },
  imageHeader: { width: width, height: 250, backgroundColor: '#F3F4F6' },
  mainImage: { width: '100%', height: '100%' },
  headerButtons: { position: 'absolute', top: 10, left: 20 },
  iconBtn: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 25, elevation: 5 },
  mainCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 25 },
  storeHeader: { flexDirection: 'row', alignItems: 'center' },
  storeLogo: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  storeTitleInfo: { marginLeft: 12, flex: 1 },
  storeName: { fontSize: 18, fontWeight: '800' },
  distanceText: { color: '#6B7280', fontSize: 12 },
  
  aiDescBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginTop: 15, alignItems: 'flex-start', borderWidth: 1, borderColor: '#FDE68A' },
  aiDescText: { flex: 1, marginLeft: 8, fontSize: 14, color: '#92400E', fontWeight: '700', lineHeight: 20 },
  normalDescText: { marginTop: 15, fontSize: 14, color: '#4B5563', lineHeight: 20 },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 10 },
  productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, marginBottom: 10 },
  productLeft: { flex: 1 },
  productTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  newPrice: { fontSize: 16, fontWeight: '800', color: '#0A4D44' },
  oldPrice: { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through', marginLeft: 8 },
  stockText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, padding: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  countBtn: { padding: 6 },
  countText: { paddingHorizontal: 10, fontSize: 15, fontWeight: '800' },

  timeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9F6', padding: 15, borderRadius: 12, gap: 10 },
  timeText: { flex: 1, fontSize: 13, color: '#0A4D44', fontWeight: '600' },

  footer: { position: 'absolute', bottom: 0, width: width, padding: 20, paddingBottom: 35, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flex: 1 },
  totalItemsLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  totalPriceText: { fontSize: 20, fontWeight: '900', color: '#111827' },
  reserveButton: { backgroundColor: '#0A4D44', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 15 },
  reserveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 }
});