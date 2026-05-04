import React, { useState, useEffect } from 'react';
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
  Image,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../../contexts/AuthContext';
import { updateMyProfile } from '../../services/auth';

export default function AccountDetails() {
  const { user, refreshUser } = useAuth();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState({ key: '', label: '', value: '' });
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri iznine ihtiyacımız var.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openEditModal = (key: string, label: string, value: string) => {
    setEditingField({ key, label, value: value || '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // full_name özel: name + surname şeklinde değil, tek field
      // Ama edit modal'ında "Ad" ve "Soyad" ayrı. O yüzden bunları
      // mevcut full_name'i parse ederek birleştireceğiz.
      const parts = (user.full_name || '').trim().split(' ');
      const currentName = parts[0] || '';
      const currentSurname = parts.slice(1).join(' ') || '';

      let updatePayload: any = {};

      switch (editingField.key) {
        case 'name':
          updatePayload.full_name = `${editingField.value.trim()} ${currentSurname}`.trim();
          break;
        case 'surname':
          updatePayload.full_name = `${currentName} ${editingField.value.trim()}`.trim();
          break;
        case 'phone':
          updatePayload.phone = editingField.value.trim();
          break;
        case 'birth_date':
          updatePayload.birth_date = editingField.value.trim();
          break;
        case 'gender':
          updatePayload.gender = editingField.value.trim();
          break;
        case 'city':
          updatePayload.city = editingField.value.trim();
          break;
        case 'district':
          updatePayload.district = editingField.value.trim();
          break;
        case 'address':
          updatePayload.address = editingField.value.trim();
          break;
        case 'email':
          // Email değiştirme şu an desteklenmiyor (giriş için kullanılıyor)
          Alert.alert('Bilgi', 'E-posta adresi değiştirilemez. Bu giriş için kullanılan kimliğindir.');
          setModalVisible(false);
          setIsSaving(false);
          return;
      }

      await updateMyProfile(updatePayload);
      await refreshUser();
      setModalVisible(false);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Güncellenemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Dikkat", 
      "Hesabını kalıcı olarak silmek istediğine emin misin?",
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Hesabımı Sil', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Bilgi', 'Hesap silme özelliği yakında eklenecek. Destek ekibiyle iletişime geç.');
          }
        }
      ]
    );
  };

  const DetailRow = ({ label, value, icon, fieldKey, isLast = false, placeholder }: any) => {
    const displayValue = value || placeholder || 'Belirtilmemiş';
    return (
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
            <Text style={[styles.detailValue, !value && { color: '#9CA3AF', fontStyle: 'italic' }]}>
              {displayValue}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
      </SafeAreaView>
    );
  }

  // İsim parçaları
  const nameParts = (user.full_name || '').trim().split(' ');
  const name = nameParts[0] || '';
  const surname = nameParts.slice(1).join(' ') || '';

  const initials = `${name[0] || ''}${surname[0] || ''}`.toUpperCase() || (user.email[0] || 'U').toUpperCase();
  const roleStatus = user.role === 'business' ? 'İşletme Hesabı' : 'Müşteri Hesabı';

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
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.uploadedImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} activeOpacity={0.8}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.full_name || 'Kullanıcı'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons 
              name={user.role === 'business' ? 'storefront' : 'person'} 
              size={12} 
              color="#0A4D44" 
            />
            <Text style={styles.userStatus}>{roleStatus}</Text>
          </View>
        </View>

        <Text style={styles.groupLabel}>KİŞİSEL BİLGİLER</Text>
        <View style={styles.infoGroup}>
          <DetailRow icon="account-outline" label="Ad" value={name} fieldKey="name" />
          <DetailRow icon="account-details-outline" label="Soyad" value={surname} fieldKey="surname" />
          <DetailRow 
            icon="calendar-range" 
            label="Doğum Tarihi" 
            value={user.birth_date} 
            fieldKey="birth_date"
            placeholder="GG.AA.YYYY"
          />
          <DetailRow 
            icon="gender-male-female" 
            label="Cinsiyet" 
            value={user.gender} 
            fieldKey="gender" 
            isLast={true}
          />
        </View>

        <Text style={styles.groupLabel}>İLETİŞİM BİLGİLERİ</Text>
        <View style={styles.infoGroup}>
          <DetailRow icon="email-outline" label="E-posta" value={user.email} fieldKey="email" />
          <DetailRow 
            icon="phone-outline" 
            label="Telefon" 
            value={user.phone} 
            fieldKey="phone" 
            isLast={true}
            placeholder="+90 5xx xxx xx xx"
          />
        </View>

        <Text style={styles.groupLabel}>ADRES BİLGİLERİ</Text>
        <View style={styles.infoGroup}>
          <DetailRow 
            icon="city-variant-outline" 
            label="Şehir" 
            value={user.city} 
            fieldKey="city"
          />
          <DetailRow 
            icon="map-marker-outline" 
            label="İlçe" 
            value={user.district} 
            fieldKey="district"
          />
          <DetailRow 
            icon="home-outline" 
            label="Adres Detayı" 
            value={user.address} 
            fieldKey="address" 
            isLast={true}
            placeholder="Mahalle, sokak, no..."
          />
        </View>

        <View style={styles.infoNote}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.infoNoteText}>
            Hesap kayıt tarihi: {new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteAccountText}>Hesabı Kalıcı Olarak Sil</Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingField.label} Güncelle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={isSaving}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <TextInput 
              style={styles.modalInput} 
              value={editingField.value} 
              onChangeText={(t) => setEditingField({...editingField, value: t})}
              autoFocus
              placeholder={`${editingField.label} gir`}
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />
            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
              )}
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
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#FFF' },
  uploadedImage: { width: '100%', height: '100%', borderRadius: 45 },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#374151', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 20, fontWeight: '800', color: '#111827' },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F9F6', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 6 },
  userStatus: { fontSize: 12, color: '#0A4D44', fontWeight: '700' },

  groupLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', paddingHorizontal: 25, marginTop: 25, marginBottom: 10, letterSpacing: 1 },
  infoGroup: { backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: '#F3F4F6' },
  detailItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0F9F7', justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 15, flex: 1 },
  detailLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 2 },

  infoNote: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, padding: 14, backgroundColor: '#F3F4F6', borderRadius: 12 },
  infoNoteText: { flex: 1, marginLeft: 8, fontSize: 12, color: '#6B7280' },

  deleteAccountBtn: { marginTop: 20, alignItems: 'center', padding: 15 },
  deleteAccountText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800' },
  modalInput: { backgroundColor: '#F3F4F6', padding: 18, borderRadius: 15, fontSize: 16, marginBottom: 20 },
  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 15, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});