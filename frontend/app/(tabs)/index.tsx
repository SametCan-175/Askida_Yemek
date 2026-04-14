import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Tasarımı anında görebilmen için internetten çekilen geçici görseller kullandım
const SURPRISE_BAGS = [
  {
    id: '1',
    name: 'Keşan Merkez Fırını',
    description: 'Sürpriz Unlu Mamuller',
    time: 'Yarın: 19:30 - 20:30',
    distance: '1.2 km',
    oldPrice: '150.00₺',
    newPrice: '50.00₺',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=60',
    logo: 'https://images.unsplash.com/photo-1555507036-ab1d4075c6f1?auto=format&fit=crop&w=100&q=60'
  },
  {
    id: '2',
    name: 'Yusuf Çapraz Kampüs Kantini',
    description: 'Karışık Sürpriz Paket',
    time: 'Bugün: 16:00 - 17:00',
    distance: '3.5 km',
    oldPrice: '120.00₺',
    newPrice: '40.00₺',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=60',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&q=60'
  }
];

const CATEGORIES = ["Tümü", "Yemekler", "Fırın & Pastane", "Market"];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState("Tümü");

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Uyarı Barı */}
      <TouchableOpacity style={styles.alertBar} activeOpacity={0.8}>
        <Ionicons name="warning-outline" size={20} color="#FFFFFF" />
        <Text style={styles.alertText}>E-posta adresini doğrula</Text>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" style={{ marginLeft: 'auto' }} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Mesafede Mağaza Yok Uyarı Alanı (Senin fotoğraftaki gibi) */}
        <View style={styles.noStoreContainer}>
          <MaterialCommunityIcons name="sign-direction" size={40} color="#0A4D44" />
          <Text style={styles.noStoreTitle}>Seçili mesafede mağaza yok</Text>
          <Text style={styles.noStoreDesc}>
            Seçtiğin mesafede mağaza bulamadık, bu yüzden sana daha uzakta kurtarılmayı bekleyen paketleri gösteriyoruz.
          </Text>
          <Text style={styles.sectionDivider}>- - -  30.0 km içindeki Sürpriz Paketler  - - -</Text>
        </View>

        {/* Kategoriler (Yatay Kaydırılabilir) */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Yeni Sürpriz Paketler Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yeni Sürpriz Paketler</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Tümünü gör</Text>
          </TouchableOpacity>
        </View>

        {/* Ürün Kartları */}
        <View style={styles.cardsContainer}>
          {SURPRISE_BAGS.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Yeni</Text>
                </View>
                <View style={styles.logoContainer}>
                  <Image source={{ uri: item.logo }} style={styles.storeLogo} />
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.storeName} numberOfLines={1}>{item.name}</Text>
                  <TouchableOpacity>
                    <Ionicons name="heart-outline" size={24} color="#0A4D44" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.productDesc}>{item.description}</Text>
                <Text style={styles.timeDistanceText}>Teslim al: {item.time}  |  {item.distance}</Text>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.oldPrice}>{item.oldPrice}</Text>
                  <Text style={styles.newPrice}>{item.newPrice}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        {/* Favoriler Alanı (Şimdilik boş yer tutucu) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Favorileriniz</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Tümünü gör</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyFavouriteCard}>
          <View style={styles.circlePlaceholder} />
          <Text style={styles.emptyFavouriteText}>Favorilerinize eklemek için kalp simgesine dokunun</Text>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  alertBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A4D44', padding: 14, gap: 10 },
  alertText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  
  noStoreContainer: { alignItems: 'center', padding: 24, paddingBottom: 10 },
  noStoreTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 12, marginBottom: 8 },
  noStoreDesc: { fontSize: 15, color: '#4B5563', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  sectionDivider: { fontSize: 14, fontWeight: '700', color: '#111827', marginVertical: 10 },

  categoryScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  categoryChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipActive: { backgroundColor: '#0A4D44', borderColor: '#0A4D44' },
  categoryText: { fontSize: 15, fontWeight: '600', color: '#4B5563' },
  categoryTextActive: { color: '#FFFFFF' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  seeAllText: { fontSize: 15, fontWeight: '700', color: '#0A4D44' },

  cardsContainer: { paddingHorizontal: 16, gap: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  imageContainer: { position: 'relative' },
  cardImage: { width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  newBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  newBadgeText: { fontSize: 12, fontWeight: '700', color: '#111827' },
  logoContainer: { position: 'absolute', bottom: -24, left: 16, backgroundColor: '#FFFFFF', padding: 2, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  storeLogo: { width: 48, height: 48, borderRadius: 24 },
  
  cardContent: { padding: 16, paddingTop: 32 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  storeName: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1, paddingRight: 10 },
  productDesc: { fontSize: 15, color: '#4B5563', marginBottom: 8 },
  timeDistanceText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  priceContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'baseline', gap: 8 },
  oldPrice: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  newPrice: { fontSize: 20, fontWeight: '900', color: '#111827' },

  emptyFavouriteCard: { marginHorizontal: 16, backgroundColor: '#E5E7EB', borderRadius: 16, padding: 20, alignItems: 'center', height: 140, justifyContent: 'center' },
  circlePlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', marginBottom: 12 },
  emptyFavouriteText: { color: '#6B7280', fontSize: 14, textAlign: 'center' }
});