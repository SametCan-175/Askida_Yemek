import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ShopDetailScreen() {
  const params = useLocalSearchParams();
  const { name, image, logo, distance } = params;

  // Ürünler ve Hesaplama Mantığı
  const [products, setProducts] = useState([
    { id: '1', title: 'Susamlı Simit', priceVal: 10.00, oldPrice: '15.00₺', count: 0, stock: 5 },
    { id: '2', title: 'Peynirli Poğaça', priceVal: 12.50, oldPrice: '20.00₺', count: 0, stock: 3 },
    { id: '3', title: 'Zeytinli Açma', priceVal: 15.00, oldPrice: '25.00₺', count: 0, stock: 8 },
    { id: '4', title: 'Tam Buğday Ekmeği', priceVal: 8.00, oldPrice: '12.00₺', count: 0, stock: 10 },
  ]);

  const totalItems = products.reduce((sum, p) => sum + p.count, 0);
  const totalPrice = products.reduce((sum, p) => sum + (p.count * p.priceVal), 0);

  const updateCount = (id: string, delta: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newCount = Math.max(0, Math.min(p.stock, p.count + delta));
        return { ...p, count: newCount };
      }
      return p;
    }));
  };

  // Hata veren dış link yerine direkt browse sekmesine yönlendiriyoruz
  const openMap = () => {
    router.push('/browse');
  };

  const REVIEWS = [
    { id: 1, user: 'Berkay', initial: 'B', rating: 5, comment: 'Keşan fırınları arasında en tazesi burası! Ürün seçme özelliği aşırı iyi olmuş.', date: '2 saat önce' },
    { id: 2, user: 'Ayşe Y.', initial: 'A', rating: 4, comment: 'Fiyatlar çok uygun, tam öğrenci dostu bir uygulama.', date: 'Dün' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Üst Görsel */}
        <View style={styles.imageHeader}>
          <Image source={{ uri: image as string }} style={styles.mainImage} />
          <SafeAreaView style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.storeHeader}>
            <Image source={{ uri: logo as string }} style={styles.storeLogo} />
            <View style={styles.storeTitleInfo}>
              <Text style={styles.storeName}>{name}</Text>
              <Text style={styles.distanceText}>{distance} uzaklıkta • Keşan</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Ürün Seçim Alanı */}
          <Text style={styles.sectionTitle}>Ürünleri Seç</Text>
          {products.map((item) => (
            <View key={item.id} style={styles.productCard}>
              <View style={styles.productLeft}>
                <Text style={styles.productTitle}>{item.title}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.newPrice}>{item.priceVal.toFixed(2)}₺</Text>
                  <Text style={styles.oldPrice}>{item.oldPrice}</Text>
                </View>
              </View>
              <View style={styles.counter}>
                <TouchableOpacity onPress={() => updateCount(item.id, -1)} style={styles.countBtn}>
                  <Ionicons name="remove" size={18} color="#0A4D44" />
                </TouchableOpacity>
                <Text style={styles.countText}>{item.count}</Text>
                <TouchableOpacity onPress={() => updateCount(item.id, 1)} style={styles.countBtn}>
                  <Ionicons name="add" size={18} color="#0A4D44" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={styles.divider} />

          {/* İşletme Konumu - Browse'a yönlendirir */}
          <Text style={styles.sectionTitle}>İşletme Konumu</Text>
          <TouchableOpacity 
            style={styles.mapBox} 
            onPress={openMap} 
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="google-maps" size={32} color="#0A4D44" />
            <Text style={styles.mapText}>Haritada Görüntüle</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Yorumlar */}
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.sectionTitle}>Yorumlar</Text>
            <View style={styles.overallRating}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingNum}>4.9</Text>
            </View>
          </View>

          {REVIEWS.map((rev) => (
            <View key={rev.id} style={styles.modernReviewCard}>
              <View style={styles.reviewUserRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{rev.initial}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{rev.user}</Text>
                  <View style={styles.starRow}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Ionicons key={i} name="star" size={12} color="#FBBF24" />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDateText}>{rev.date}</Text>
              </View>
              <Text style={styles.reviewCommentText}>{rev.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.totalItemsLabel}>{totalItems} Ürün Seçildi</Text>
          <Text style={styles.totalPriceText}>Toplam: {totalPrice.toFixed(2)}₺</Text>
        </View>
        <TouchableOpacity 
          style={[styles.reserveButton, totalItems === 0 && { backgroundColor: '#D1D5DB' }]} 
          disabled={totalItems === 0}
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
  imageHeader: { width: width, height: 250 },
  mainImage: { width: '100%', height: '100%' },
  headerButtons: { position: 'absolute', top: 10, left: 20 },
  iconBtn: { backgroundColor: '#FFFFFF', padding: 10, borderRadius: 25, elevation: 5 },
  mainCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, padding: 25 },
  storeHeader: { flexDirection: 'row', alignItems: 'center' },
  storeLogo: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  storeTitleInfo: { marginLeft: 12 },
  storeName: { fontSize: 18, fontWeight: '800' },
  distanceText: { color: '#6B7280', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },

  productCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, marginBottom: 10 },
  productLeft: { flex: 1 },
  productTitle: { fontSize: 15, fontWeight: '700', color: '#374151' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  newPrice: { fontSize: 14, fontWeight: '800', color: '#0A4D44' },
  oldPrice: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through', marginLeft: 5 },
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, padding: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  countBtn: { padding: 4 },
  countText: { paddingHorizontal: 10, fontSize: 15, fontWeight: '800' },

  mapBox: { height: 100, backgroundColor: '#F0F9F6', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#0A4D44' },
  mapText: { color: '#0A4D44', fontWeight: '700', fontSize: 13, marginTop: 5 },

  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  overallRating: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingNum: { marginLeft: 4, fontSize: 13, fontWeight: '700', color: '#D97706' },
  modernReviewCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  reviewUserRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  userDetails: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  starRow: { flexDirection: 'row', marginTop: 2 },
  reviewDateText: { fontSize: 11, color: '#9CA3AF' },
  reviewCommentText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },

  footer: { position: 'absolute', bottom: 0, width: width, padding: 20, paddingBottom: 35, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLeft: { flex: 1 },
  totalItemsLabel: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  totalPriceText: { fontSize: 20, fontWeight: '900', color: '#111827' },
  reserveButton: { backgroundColor: '#0A4D44', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 15 },
  reserveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 }
});