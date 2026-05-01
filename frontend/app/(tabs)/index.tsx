import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Platform,
  LogBox 
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// GÜNCELLENEN KISIM 1: Hafızayı çağırıyoruz
import { FavoritesContext } from './_layout'; 

const { width } = Dimensions.get('window');

LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, 
    shouldShowList: true,   
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// GÜNCELLENEN KISIM 2: 'export' ekledik ki favoriler sayfası da dükkan verilerini görebilsin
export const SURPRISE_BAGS = [
  {
    id: '1',
    name: 'Keşan Merkez Fırını',
    description: 'Taze simit, poğaça ve unlu mamuller',
    time: 'Bugün: 19:30 - 20:30',
    distance: '1.2 km',
    stock: 5, 
    badge_text: 'TÜKENİYOR',
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
    badge_text: 'YENİ',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=60',
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=100&q=60'
  },
];

export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState('');
  
  // GÜNCELLENEN KISIM 3: Context'ten favori listesini ve fonksiyonunu alıyoruz
  const { favorites, toggleFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    async function initNotifications() {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) setExpoPushToken(token);
      } catch (error) {
        console.log("Bildirim kurulumu atlandı.");
      }
    }
    initNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Keşan, Edirne</Text>
          <Text style={styles.headerTitle}>Bugün Ne Kurtarıyoruz?</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileIcon} 
          onPress={() => alert(expoPushToken ? `Token: ${expoPushToken}` : "Token: Expo Go kısıtlaması nedeniyle alınamadı.")}
        >
          <Ionicons name="notifications-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {SURPRISE_BAGS.map((item) => {
          // Bu dükkan favoriler listesinde var mı diye kontrol ediyoruz
          const isFavorite = favorites?.includes(item.id);

          return (
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

                {/* GÜNCELLENEN KISIM 4: Kalp Butonu */}
                <TouchableOpacity 
                  style={styles.favoriteBtn}
                  activeOpacity={0.7}
                  onPress={() => toggleFavorite(item.id)}
                >
                  <Ionicons 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    size={22} 
                    color={isFavorite ? "#EF4444" : "#111827"} 
                  />
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
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0A4D44',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') return null;

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "proje-id-buraya-gelecek" 
    });
    return tokenData.data;
  } catch (e) {
    console.log("Expo Go push uyarısı yakalandı ve engellendi.");
    return null;
  }
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
  newBadgeText: { fontSize: 11, fontWeight: '900', color: '#0A4D44', textTransform: 'uppercase' },

  favoriteBtn: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    backgroundColor: '#FFFFFF', 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },

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