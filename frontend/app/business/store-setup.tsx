import React, { useState, useEffect, useRef } from 'react'; 
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import MapView from 'react-native-maps'; 
import * as Location from 'expo-location'; 

const CATEGORIES = [
  { label: "Fırın & Pastane", value: "fırın" },
  { label: "Restoran", value: "restoran" },
  { label: "Kafe", value: "kafe" },
  { label: "Market", value: "market" },
  { label: "Diğer", value: "diğer" },
];

export default function StoreSetupScreen() {
  const mapRef = useRef<MapView>(null); 
  const [storeName, setStoreName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let curr = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({
          latitude: curr.coords.latitude,
          longitude: curr.coords.longitude
        });
      }
    })();
  }, []);

  const goToMyLocation = async () => {
    let curr = await Location.getLastKnownPositionAsync({});

    if (!curr) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("İzin Gerekli", "Konumunu bulabilmemiz için izin vermen gerekiyor.");
        return;
      }
      curr = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    }

    if (curr) {
      const newRegion = {
        latitude: curr.coords.latitude,
        longitude: curr.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      mapRef.current?.animateToRegion(newRegion, 1000);
      setLocation({
        latitude: curr.coords.latitude,
        longitude: curr.coords.longitude
      });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleConfirmLocation = () => {
    if (location) {
      setAddress(`Konum Belirlendi (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`);
      setIsMapVisible(false);
    }
  };

  const handleNext = () => {
    if (!storeName || !selectedCategory || !location) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }
    
    // Verileri step2'ye taşı
    router.push({
      pathname: '/business/store-setup-step2',
      params: {
        storeName,
        category: selectedCategory,
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        imageUri: imageUri || '',
      }
    });
  };

  const isFormValid = storeName.trim().length >= 2 && selectedCategory && location;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İşletme Profilini Oluştur</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepText}>Adım 1 / 2</Text>
        <Text style={styles.mainTitle}>Mağazanı müşterilerine tanıt</Text>

        <TouchableOpacity style={styles.imagePickerBtn} activeOpacity={0.8} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.storeImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <View style={styles.iconCircle}><Ionicons name="camera" size={28} color="#0A4D44" /></View>
              <Text style={styles.uploadText}>Mağaza Görseli Ekle (opsiyonel)</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>İşletme Adı *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="storefront-outline" size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Örn: Ayşe'nin Fırını"
            placeholderTextColor="#9CA3AF"
            value={storeName}
            onChangeText={setStoreName}
            maxLength={60}
          />
        </View>

        <Text style={styles.label}>İşletme Türü *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.value}
              style={[styles.categoryChip, selectedCategory === cat.value && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.value)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat.value && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Konum & Adres *</Text>
        <TouchableOpacity 
          style={styles.locationButton}
          activeOpacity={0.7}
          onPress={() => setIsMapVisible(true)}
        >
          <View style={styles.locationIconBg}><Ionicons name="location" size={24} color="#EA4335" /></View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationTitle}>Haritadan Konum Seç</Text>
            <Text style={styles.locationDesc} numberOfLines={1}>
              {address || (location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Konum aranıyor...")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.continueButton, !isFormValid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isFormValid}
        >
          <Text style={styles.continueButtonText}>İleri</Text>
        </TouchableOpacity>
      </View>

      {/* HARİTA MODALI */}
      <Modal visible={isMapVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View style={styles.mapHeader}>
            <TouchableOpacity onPress={() => setIsMapVisible(false)}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.mapHeaderText}>Konumu İşaretle</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={{ flex: 1 }}>
            <MapView 
              ref={mapRef} 
              style={{ flex: 1 }}
              showsUserLocation={true} 
              showsMyLocationButton={false} 
              initialRegion={{
                latitude: location?.latitude || 40.8533, 
                longitude: location?.longitude || 26.6300,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              onRegionChangeComplete={(region) => {
                setLocation({
                  latitude: region.latitude,
                  longitude: region.longitude
                });
              }}
            />
            
            <View style={styles.fixedMarker} pointerEvents="none">
              <Ionicons name="location" size={48} color="#EA4335" />
              <View style={styles.markerShadow} />
            </View>

            <TouchableOpacity 
              style={styles.locateMeBtn}
              onPress={goToMyLocation}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={26} color="#0A4D44" />
            </TouchableOpacity>
          </View>

          <View style={styles.mapFooter}>
            <Text style={styles.liveCoordText}>
              {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Konum aranıyor..."}
            </Text>
            <TouchableOpacity style={styles.confirmMapBtn} onPress={handleConfirmLocation}>
              <Text style={styles.confirmMapBtnText}>Bu Konumu Onayla</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  content: { padding: 20, paddingBottom: 40 },
  stepText: { fontSize: 13, fontWeight: '700', color: '#0A4D44', marginBottom: 8, textTransform: 'uppercase' },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 10 },
  imagePickerBtn: { height: 160, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 25 },
  placeholderContainer: { alignItems: 'center' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  uploadText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  storeImage: { width: '100%', height: '100%' },
  label: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 25 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#111827' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  categoryChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryChipActive: { backgroundColor: '#0A4D44', borderColor: '#0A4D44' },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },
  categoryTextActive: { color: '#FFFFFF' },
  locationButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  locationIconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  locationTextContainer: { flex: 1 },
  locationTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  locationDesc: { fontSize: 13, color: '#6B7280' },
  footer: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10 },
  continueButton: { height: 56, backgroundColor: '#0A4D44', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  mapHeaderText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  mapFooter: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  confirmMapBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  confirmMapBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  fixedMarker: { position: 'absolute', top: '50%', left: '50%', marginLeft: -24, marginTop: -48, alignItems: 'center', zIndex: 1 },
  markerShadow: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.3)', marginTop: -5 },
  liveCoordText: { textAlign: 'center', fontSize: 12, color: '#6B7280', marginBottom: 10, fontFamily: 'monospace' },
  locateMeBtn: { position: 'absolute', bottom: 20, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 10 }
});