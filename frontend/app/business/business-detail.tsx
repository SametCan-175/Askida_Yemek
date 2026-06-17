import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { fetchMyShop, updateShop, Shop } from '../../services/business';

export default function BusinessDetail() {
  const { user } = useAuth();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit edilecek alanlar
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        console.log('🔵 Logged in user:', JSON.stringify(user));
        try {
          const myShop = await fetchMyShop(user.id);
          console.log('🔵 My shop:', JSON.stringify(myShop));
          if (active && myShop) {
            setShop(myShop);
            setName(myShop.name || '');
            setCategory(myShop.category || '');
            setDescription(myShop.description || '');
            setAddress(myShop.address || '');
            setCity(myShop.city || '');
            setPhone(myShop.phone || '');
          }
        } catch (err) {
          console.log('Mağaza yüklenemedi:', err);
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [user])
  );

  const handleSave = async () => {
    if (!shop) return;
    if (name.trim().length < 2) {
      Alert.alert('Eksik bilgi', 'İşletme adı en az 2 karakter olmalı.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateShop(shop.id, {
        name: name.trim(),
        category: category.trim() || undefined,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setShop(updated);
      Alert.alert('✅ Kaydedildi', 'Mağaza bilgileri güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Güncellenemedi, tekrar dene.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Mağaza bilgileri yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <Ionicons name="storefront-outline" size={60} color="#A7D1C6" />
        <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '700', color: '#0A4D44', textAlign: 'center' }}>
          Henüz bir mağazan yok.
        </Text>
        <Text style={{ marginTop: 6, fontSize: 13, color: '#6B7280', textAlign: 'center' }}>
          İşletme profilini oluşturmak için "İşletme Kurulumu"na git.
        </Text>
        <TouchableOpacity 
          style={[styles.saveBtn, { marginTop: 20, paddingHorizontal: 30 }]} 
          onPress={() => router.push('/business/store-setup')}
        >
          <Text style={styles.saveBtnText}>Mağaza Oluştur</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mağaza Bilgileri</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Mağaza Görseli */}
          <Text style={styles.sectionLabel}>MAĞAZA GÖRSELİ</Text>
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: shop.logo_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500' 
              }} 
              style={styles.storeImage} 
            />
            <TouchableOpacity 
              style={styles.editImageBtn}
              onPress={() => Alert.alert('Yakında', 'Görsel yükleme özelliği geliştirme aşamasında.')}
            >
              <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Düzenlenebilir Bilgiler */}
          <Text style={styles.sectionLabel}>TEMEL BİLGİLER</Text>
          <View style={styles.infoCard}>
            <Text style={styles.fieldLabel}>İşletme Adı *</Text>
            <TextInput
              style={styles.fieldInput}
              value={name}
              onChangeText={setName}
              placeholder="Örn: Ayşe'nin Fırını"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            <Text style={styles.fieldLabel}>Kategori</Text>
            <TextInput
              style={styles.fieldInput}
              value={category}
              onChangeText={setCategory}
              placeholder="Örn: fırın, restoran, kafe"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            <Text style={styles.fieldLabel}>Telefon</Text>
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="0216 000 00 00"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              editable={!isSaving}
            />

            <Text style={styles.fieldLabel}>Açıklama</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldTextarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Mağazanız hakkında kısa bilgi..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isSaving}
            />
          </View>

          {/* Konum */}
          <Text style={styles.sectionLabel}>ADRES</Text>
          <View style={styles.infoCard}>
            <Text style={styles.fieldLabel}>Şehir</Text>
            <TextInput
              style={styles.fieldInput}
              value={city}
              onChangeText={setCity}
              placeholder="Edirne"
              placeholderTextColor="#9CA3AF"
              editable={!isSaving}
            />

            <Text style={styles.fieldLabel}>Açık Adres</Text>
            <TextInput
              style={[styles.fieldInput, styles.fieldTextarea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Mahalle, sokak, no..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              editable={!isSaving}
            />

            {(shop.latitude && shop.longitude) ? (
              <View style={styles.coordBox}>
                <Ionicons name="location" size={18} color="#0A4D44" />
                <Text style={styles.coordText}>
                  {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                </Text>
              </View>
            ) : null}
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  imageContainer: { width: '100%', height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: 25, backgroundColor: '#F3F4F6' },
  storeImage: { width: '100%', height: '100%' },
  editImageBtn: { position: 'absolute', bottom: 12, right: 12, backgroundColor: '#0A4D44', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  infoCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#F3F4F6' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 6, marginTop: 8, letterSpacing: 0.5 },
  fieldInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 4 },
  fieldTextarea: { minHeight: 70, paddingTop: 12 },
  coordBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F9F6', padding: 12, borderRadius: 10, marginTop: 12 },
  coordText: { fontSize: 13, color: '#0A4D44', fontWeight: '600' },
  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 28, alignItems: 'center', marginTop: 10 },
  saveBtnDisabled: { backgroundColor: '#9CA3AF' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});