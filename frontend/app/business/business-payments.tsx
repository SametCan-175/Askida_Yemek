
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BusinessPayments() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>IBAN ve Ödemeler</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Kayıtlı IBAN Adresi</Text>
        <View style={styles.ibanBox}>
          <Text style={styles.ibanText}>TR00 0000 0000 0000 0000 0000 00</Text>
          <TouchableOpacity onPress={() => router.push('/business/store-setup-step2')}>
            <Text style={styles.editText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#0A4D44" />
          <Text style={styles.infoText}>Ödemeleriniz her haftanın Cuma günü hesabınıza aktarılır.</Text>
        </View>
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
  label: { fontSize: 14, fontWeight: '700', color: '#9CA3AF', marginBottom: 10 },
  ibanBox: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderOuterWidth: 1, borderColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ibanText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  editText: { color: '#0A4D44', fontWeight: '800' },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F0EE', padding: 15, borderRadius: 12, marginTop: 20 },
  infoText: { marginLeft: 10, color: '#0A4D44', fontSize: 13, fontWeight: '500' }
});