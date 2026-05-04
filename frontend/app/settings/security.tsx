import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Security() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdatePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      Alert.alert("Hata", "Yeni şifreler birbiriyle eşleşmiyor.");
      return;
    }
    // Başarılı simülasyonu
    Alert.alert("Başarılı", "Şifreniz başarıyla güncellendi.");
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Şifre ve Güvenlik</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.sectionLabel}>ŞİFRE DEĞİŞTİR</Text>
          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mevcut Şifre</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={passwords.current}
                onChangeText={(t) => setPasswords({...passwords, current: t})}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Yeni Şifre</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={passwords.new}
                onChangeText={(t) => setPasswords({...passwords, new: t})}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={passwords.confirm}
                onChangeText={(t) => setPasswords({...passwords, confirm: t})}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdatePassword}>
            <Text style={styles.updateBtnText}>Şifreyi Güncelle</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>EKSTRA GÜVENLİK</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.rowLeft}>
                <MaterialCommunityIcons name="shield-check-outline" size={24} color="#0A4D44" />
                <View style={styles.rowTexts}>
                  <Text style={styles.rowTitle}>İki Faktörlü Doğrulama</Text>
                  <Text style={styles.rowSubtitle}>Girişlerde SMS kodu istenir.</Text>
                </View>
              </View>
              <Switch 
                value={twoFactor} 
                onValueChange={setTwoFactor}
                trackColor={{ false: "#E5E7EB", true: "#0A4D44" }}
              />
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.rowContainer} onPress={() => Alert.alert("Cihazlar", "Şu an aktif 1 cihazınız bulunuyor.")}>
              <View style={styles.rowLeft}>
                <MaterialCommunityIcons name="cellphone-link" size={24} color="#374151" />
                <View style={styles.rowTexts}>
                  <Text style={styles.rowTitle}>Aktif Oturumlar</Text>
                  <Text style={styles.rowSubtitle}>Hesabınıza bağlı cihazları yönetin.</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          <View style={styles.footerInfo}>
            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.footerText}>
              Şifreniz en az 8 karakterden oluşmalı ve sayı içermelidir.
            </Text>
          </View>

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

  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', marginBottom: 12, letterSpacing: 1, marginTop: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', overflow: 'hidden', marginBottom: 20 },
  
  inputWrapper: { padding: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: { fontSize: 16, color: '#111827', paddingVertical: 5 },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: 16 },

  updateBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 18, alignItems: 'center', marginBottom: 30, elevation: 2 },
  updateBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },

  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowTexts: { marginLeft: 15 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  rowSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },

  footerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  footerText: { color: '#9CA3AF', fontSize: 12, marginLeft: 8, textAlign: 'center' }
});