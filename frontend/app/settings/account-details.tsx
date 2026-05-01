import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image // YENİ: Fotoğrafı ekranda göstermek için eklendi
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // YENİ: Galeriye erişim paketi

export default function AccountDetails() {
  const [userInfo, setUserInfo] = useState({
    name: 'Berkay',
    surname: 'Uygulama Kullanıcısı',
    email: 'berkay@trakya.edu.tr',
    phone: '+90 5xx xxx xx xx',
    birthDate: '01.01.2004',
    gender: 'Erkek',
    city: 'Bursa',
    district: 'Orhangazi',
    address: 'Hürriyet Mah. No:12'
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState({ key: '', label: '', value: '' });
  
  // YENİ: Seçilen profil fotoğrafının linkini (URI) tutacak state
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // YENİ: Galeriyi açıp fotoğraf seçtiren fonksiyon
  const pickImage = async () => {
    // Önce kullanıcıdan galeriye erişim izni istiyoruz
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Hata', 'Fotoğraf seçmek için galeri iznine ihtiyacımız var kanka!');
      return;
    }

    // Galeriyi açıyoruz
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Kullanıcı fotoğrafı kırpabilsin
      aspect: [1, 1], // Yuvarlak alana tam otursun diye kare (1:1) oranında kırpmaya zorluyoruz
      quality: 0.8, // Fotoğraf kalitesi (0 ile 1 arası)
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Seçilen fotoğrafı state'e kaydediyoruz
    }
  };

  const openEditModal = (key: string, label: string, value: string) => {
    setEditingField({ key, label, value });
    setModalVisible(true);
  };

  const handleSave = () => {
    setUserInfo({ ...userInfo, [editingField.key]: editingField.value });
    setModalVisible(false);
  };

  const DetailRow = ({ label, value, icon, fieldKey, isLast = false }: any) => (
    <TouchableOpacity 
      style={[styles.detailItem, isLast && { borderBottomWidth: 0 }]} 
      onPress={() => openEditModal(fieldKey, label, value)}
      activeOpacity={0.6}
    >
      <View style={styles.detailLeft}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={22} color="#0A4D44" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.detailLabel}>{label}</Text>
          <Text style={styles.detailValue}>{value}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesap Bilgileri</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              {/* YENİ: Eğer fotoğraf seçildiyse fotoğrafı, seçilmediyse ismin baş harflerini göster */}
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.uploadedImage} />
              ) : (
                <Text style={styles.avatarText}>{userInfo.name[0]}{userInfo.surname[0]}</Text>
              )}
            </View>
            
            {/* YENİ: Butona pickImage fonksiyonunu bağladık */}
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} activeOpacity={0.8}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userInfo.name} {userInfo.surname}</Text>
          <Text style={styles.userStatus}>Trakya Üniversitesi / Öğrenci</Text>
        </View>

        <Text style={styles.groupLabel}>KİŞİSEL BİLGİLER</Text>
        <View style={styles.infoGroup}>
          <DetailRow icon="account-outline" label="Ad" value={userInfo.name} fieldKey="name" />
          <DetailRow icon="account-details-outline" label="Soyad" value={userInfo.surname} fieldKey="surname" />
          <DetailRow icon="calendar-range" label="Doğum Tarihi" value={userInfo.birthDate} fieldKey="birthDate" />
          <DetailRow icon="gender-male-female" label="Cinsiyet" value={userInfo.gender} fieldKey="gender" isLast={true} />
        </View>

        <Text style={styles.groupLabel}>İLETİŞİM BİLGİLERİ</Text>
        <View style={styles.infoGroup}>
          <DetailRow icon="email-outline" label="E-posta" value={userInfo.email} fieldKey="email" />
          <DetailRow icon="phone-outline" label="Telefon" value={userInfo.phone} fieldKey="phone" isLast={true} />
        </View>

        <Text style={styles.groupLabel}>ADRES BİLGİLERİ</Text>
        <View style={styles.infoGroup}>
          <DetailRow icon="city-variant-outline" label="Şehir" value={userInfo.city} fieldKey="city" />
          <DetailRow icon="map-marker-outline" label="İlçe" value={userInfo.district} fieldKey="district" />
          <DetailRow icon="home-outline" label="Adres Detayı" value={userInfo.address} fieldKey="address" isLast={true} />
        </View>

        <TouchableOpacity style={styles.deleteAccountBtn} onPress={() => Alert.alert("Dikkat", "Hesabını silmek istediğine emin misin?")}>
          <Text style={styles.deleteAccountText}>Hesabı Kalıcı Olarak Sil</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingField.label} Güncelle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.modalInput} 
              value={editingField.value} 
              onChangeText={(t) => setEditingField({...editingField, value: t})}
              autoFocus
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  backBtn: { padding: 5 },
  
  scrollContent: { paddingBottom: 40 },

  profileSection: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#FFF', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 2 },
  avatarWrapper: { position: 'relative', marginBottom: 15 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }, // YENİ: overflow hidden eklendi
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  
  // YENİ: Seçilen fotoğrafın stili
  uploadedImage: { width: '100%', height: '100%', borderRadius: 45 },

  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#374151', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 20, fontWeight: '800', color: '#111827' },
  userStatus: { fontSize: 13, color: '#6B7280', marginTop: 4 },

  groupLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', paddingHorizontal: 25, marginTop: 25, marginBottom: 10, letterSpacing: 1 },
  infoGroup: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F3F4F6' },
  
  detailItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  detailLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F9F7', justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 15 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 2 },

  deleteAccountBtn: { marginTop: 30, alignItems: 'center', padding: 15 },
  deleteAccountText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalInput: { backgroundColor: '#F3F4F6', padding: 18, borderRadius: 15, fontSize: 16, marginBottom: 20 },
  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});