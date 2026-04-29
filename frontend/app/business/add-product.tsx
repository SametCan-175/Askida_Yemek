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
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function AddProductScreen() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [count, setCount] = useState(1);
  const [description, setDescription] = useState('');

  const handleSave = () => {
    console.log("Yeni Ürün:", { productName, price, count, description });
    router.back();
  };

  const isSaveDisabled = productName.trim() === '' || price.trim() === '';

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
          <Text style={styles.headerTitle}>Yeni Ürün Ekle</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color="#0A4D44" />
            <Text style={styles.infoText}>
              Günün sonunda elinizde kalan fazla ürünleri bir paket haline getirip uygun fiyata satışa sunabilirsiniz.
            </Text>
          </View>

          <Text style={styles.label}>Paket Adı</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Örn: Sürpriz Paket (Standart)"
              placeholderTextColor="#9CA3AF"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Birim Fiyat (₺)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Stok Adedi</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setCount(Math.max(1, count - 1))}
                >
                  <Ionicons name="remove" size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.countText}>{count}</Text>
                <TouchableOpacity 
                  style={styles.counterBtn} 
                  onPress={() => setCount(count + 1)}
                >
                  <Ionicons name="add" size={20} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Açıklama (İsteğe Bağlı)</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={styles.textArea}
              placeholder="Paket içeriği hakkında kısa bir ipucu verebilirsiniz..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, isSaveDisabled && styles.saveBtnDisabled]}
            disabled={isSaveDisabled}
            onPress={handleSave}
          >
            <Text style={[styles.saveBtnText, isSaveDisabled && styles.saveBtnTextDisabled]}>
              Ürünü Ekle
            </Text>
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

  counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 6, height: 56, marginBottom: 20 },
  counterBtn: { width: 42, height: 42, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  countText: { fontSize: 18, fontWeight: '800', color: '#111827' },

  textAreaContainer: { height: 120, paddingVertical: 16 },
  textArea: { fontSize: 16, color: '#111827', flex: 1 },

  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  saveBtn: { backgroundColor: '#0A4D44', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: '#0A4D44', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  saveBtnTextDisabled: { color: '#9CA3AF' }
});