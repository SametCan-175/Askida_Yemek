import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Favori Kartı Bileşeni
const FavoriteCard = ({ item, onRemove }: any) => (
  <TouchableOpacity 
    style={styles.card} 
    activeOpacity={0.8}
    onPress={() => router.push(`/shop/${item.id}` as any)}
  >
    <View style={styles.imageContainer}>
      <View style={styles.imagePlaceholder}>
        <MaterialCommunityIcons name="storefront-outline" size={30} color="#0A4D44" />
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.isOpen ? '#0A4D44' : '#9CA3AF' }]}>
        <Text style={styles.statusText}>{item.isOpen ? 'AÇIK' : 'KAPALI'}</Text>
      </View>
    </View>

    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.shopName}>{item.name}</Text>
          <Text style={styles.shopCategory}>{item.category}</Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(item.id)}>
          <Ionicons name="heart" size={26} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.ratingBox}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviews})</Text>
        </View>
        <View style={styles.distanceBox}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.distanceText}>{item.distance} km</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function Favorites() {
  const [favorites, setFavorites] = useState([
    { 
      id: 1, 
      name: 'Keşan Merkez Fırını', 
      category: 'Pastane & Unlu Mamüller', 
      rating: 4.8, 
      reviews: 124, 
      distance: 0.8,
      isOpen: true 
    },
    { 
      id: 2, 
      name: 'Bursa Gurme Restoran', 
      category: 'Ev Yemekleri', 
      rating: 4.9, 
      reviews: 89, 
      distance: 1.5,
      isOpen: true 
    }
  ]);

  const removeFavorite = (id: number) => {
    setFavorites(favorites.filter(item => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favori İşletmeler</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topInfo}>
          <Text style={styles.countText}>{favorites.length} İşletme Kayıtlı</Text>
          <Text style={styles.subtitle}>En sevdiğiniz mekanların fırsatlarını buradan takip edebilirsiniz.</Text>
        </View>

        {favorites.length > 0 ? (
          favorites.map((item) => (
            <FavoriteCard 
              key={item.id} 
              item={item} 
              onRemove={removeFavorite} 
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-dislike-outline" size={50} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Henüz Favori Yok</Text>
            <Text style={styles.emptyDesc}>Beğendiğiniz işletmeleri kalbe basarak buraya ekleyebilirsiniz.</Text>
            <TouchableOpacity 
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/browse' as any)}
            >
              <Text style={styles.exploreBtnText}>Keşfetmeye Başla</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  topInfo: { marginBottom: 20 },
  countText: { fontSize: 18, fontWeight: '900', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 24, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  imageContainer: { width: '100%', height: 120, backgroundColor: '#F3F4F6' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  shopName: { fontSize: 17, fontWeight: '800', color: '#111827' },
  shopCategory: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F9FAFB' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#111827', marginLeft: 4 },
  reviewCount: { fontSize: 12, color: '#9CA3AF', marginLeft: 2 },
  distanceBox: { flexDirection: 'row', alignItems: 'center' },
  distanceText: { fontSize: 13, color: '#6B7280', marginLeft: 4 },
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  emptyDesc: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  exploreBtn: { marginTop: 25, backgroundColor: '#0A4D44', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  exploreBtnText: { color: '#FFF', fontWeight: '700' }
});