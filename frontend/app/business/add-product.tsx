import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { createListing } from '../../services/business';

export default function AddProductScreen() {
  const [productName, setProductName] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validasyon
    if (productName.trim().length < 3) {
      Alert.alert('Eksik bilgi', 'Paket adı en az 3 karakter olmalı.');
      return;
    }
    
    const original = parseFloat(originalPrice.replace(',', '.'));
    const discounted = parseFloat(discountedPrice.replace(',', '.'));
    
    if (isNaN(original) || original <= 0) {
      Alert.alert('Geçersiz fiyat', 'Orijinal fiyat 0\'dan büyük olmalı.');
      return;
    }
    if (isNaN(discounted) || discounted <= 0) {
      Alert.alert('Geçersiz fiyat', 'İndirimli fiyat 0\'dan büyük olmalı.');
      return;
    }
    if (discounted >= original) {
      Alert.alert('Geçersiz indirim', 'İndirimli fiyat orijinal fiyattan düşük olmalı.');
      return;
    }

    // Pickup saatleri: bugün 18:00 - 23:00 (TIME yarın olmuş olabilir, kontrol et)
    const now = new Date();
    const pickupStart = new Date();
    pickupStart.setHours(18, 0, 0, 0);
    
    // Eğer bu saat geçtiyse "bir saat sonra" yap
    if (pickupStart < now) {
      pickupStart.setTime(now.getTime() + 60 * 60 * 1000); // +1 saat
    }
    
    const pickupEnd = new Date(pickupStart);
    pickupEnd.setHours(pickupEnd.getHours() + 5); // 5 saat alma penceresi

    setIsSaving(true);
    try {
      const newListing = await createListing({
        title: productName.trim(),
        description: description.trim() || undefined,
        original_price: original,
        discounted_price: discounted,
        quantity: count,
        pickup_start: pickupStart.toISOString(),
        pickup_end: pickupEnd.toISOString(),
      });

      Alert.alert(
        '✅ Paket Eklendi!',
        `"${newListing.title}" sürpriz paketi oluşturuldu. Müşteriler artık görebilir.`,
        [{ text: 'Harika', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert(
        'Hata',
        err.message || 'Paket eklenemedi. Lütfen tekrar dene.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isSaveDisabled = 
    productName.trim() === '' || 
    originalPrice.trim() === '' || 
    discountedPrice.trim() === '' ||
    isSaving;

  // Otomatik indirim oranı hesapla
  const original = parseFloat(originalPrice.replace(',', '.'));
  const discounted = parseFloat(discountedPrice.replace(',', '.'));
  const discountPercent = (!isNaN(original) && !isNaN(discounted) && original > 0 && discounted < original)
    ? Math.round((1 - discounted / original) * 100)
    : null;

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
          <Text style={styles.headerTitle}>Yeni Sürpriz Paket</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#0A4D44" />
            <Text style={styles.infoText}>
              Günün sonunda kalan ürünleri sürpriz paket halinde indirimli satışa çıkarın. Müşteri uygulamasında anında görünür.
            </Text>
          </View>

          <Text style={styles.label}>Paket Adı *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Örn: Günün Sonu Ekmek Sepeti"
              placeholderTextColor="#9CA3AF"
              value={productName}
              onChangeText={setProductName}
              editable={!isSaving}
              maxLength={80}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Normal Fiyat (₺) *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  editable={!isSaving}
                />
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>İndirimli (₺) *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="40"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={discountedPrice}
                  onChangeText={setDiscountedPrice}
                  editable={!isSaving}
                />
              </View>
            </View>
          </View>

          {discountPercent !== null && (
            <View style={styles.discountBadge}>
              <Ionicons name="flash" size={16} color="#92400E" />
              <Text style={styles.discountText}>%{discountPercent} indirim</Text>
            </View>
          )}

          <Text style={styles.label}>Stok Adedi</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity 
              style={styles.counterBtn} 
              onPress={() => setCount(Math.max(1, count - 1))}
              disabled={isSaving}
            >
              <Ionicons name="remove" size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.countText}>{count}</Text>
            <TouchableOpacity 
              style={styles.counterBtn} 
              onPress={() => setCount(count + 1)}
              disabled={isSaving}
            >
              <Ionicons name="add" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Açıklama</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={styles.textArea}
              placeholder="Paket içeriği hakkında kısa bir ipucu..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              editable={!isSaving}
              maxLength={300}
            />
          </View>

          <View style={styles.pickupBox}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.pickupText}>
              Teslim alma: bugün 18:00 - 23:00 arası
            </Text>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, isSaveDisabled && styles.saveBtnDisabled]}
            disabled={isSaveDisabled}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.saveBtnText, isSaveDisabled && styles.saveBtnTextDisabled]}>
                Paketi Yayınla
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  
  scrollContent: { padding: 20 },
  
  infoBox: { flexDirection: 'row', backgroundColor: '#F0F9F6', padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#0A4D44', lineHeight: 20, fontWeight: '500' },

  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginLeft: 4 },
  inputContainer: { backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, height: 56, justifyContent: 'center', marginBottom: 20 },
  input: { fontSize: 16, color: '#111827', flex: 1 },
  
  row: { flexDirection: 'row', gap: 16 },
  halfWidth: { flex: 1 },

  discountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6, marginTop: -10, marginBottom: 20 },
  discountText: { fontSize: 13, fontWeight: '900', color: '#92400E' },

  counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 6, height: 56, marginBottom: 20 },
  counterBtn: { width: 42, height: 42, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  countText: { fontSize: 18, fontWeight: '800', color: '#111827' },

  textAreaContainer: { height: 100, paddingVertical: 12 },
  textArea: { fontSize: 16, color: '#111827', flex: 1 },

  pickupBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, gap: 10, marginTop: 8 },
  pickupText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  saveBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  saveBtnDisabled: { backgroundColor: '#E5E7EB', elevation: 0 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  saveBtnTextDisabled: { color: '#9CA3AF' }
});