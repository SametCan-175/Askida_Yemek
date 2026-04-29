import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BusinessTimes() {
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Teslimat Saatleri</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoBanner}>
          <Ionicons name="time-outline" size={24} color="#0A4D44" />
          <Text style={styles.infoBannerText}>
            Müşteriler, satın aldıkları Sürpriz Paketleri bu saat aralığında dükkanınızdan teslim alacaktır.
          </Text>
        </View>

        <Text style={styles.label}>TESLİMAT ARALIĞI</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeInputBox}>
            <Text style={styles.inputLabel}>Başlangıç</Text>
            <TextInput 
              style={styles.timeInput} 
              value={startTime} 
              onChangeText={setStartTime}
              placeholder="00:00"
            />
          </View>
          <Ionicons name="arrow-forward" size={24} color="#D1D5DB" />
          <View style={styles.timeInputBox}>
            <Text style={styles.inputLabel}>Bitiş</Text>
            <TextInput 
              style={styles.timeInput} 
              value={endTime} 
              onChangeText={setEndTime}
              placeholder="00:00"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveBtn} 
          onPress={() => {
            Alert.alert("Başarılı", "Teslimat saatleriniz güncellendi.");
            router.back();
          }}
        >
          <Text style={styles.saveBtnText}>Ayarları Kaydet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  content: { padding: 20 },
  infoBanner: { flexDirection: 'row', backgroundColor: '#F0F9F6', padding: 20, borderRadius: 16, marginBottom: 30, alignItems: 'center' },
  infoBannerText: { flex: 1, marginLeft: 15, fontSize: 14, color: '#0A4D44', lineHeight: 20, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 15, letterSpacing: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 },
  timeInputBox: { flex: 0.45, backgroundColor: '#FFF', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center' },
  inputLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 5, fontWeight: '700' },
  timeInput: { fontSize: 24, fontWeight: '800', color: '#111827' },
  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 28, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});