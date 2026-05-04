import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router'; 
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function EmailLoginScreen() {
  const { role } = useLocalSearchParams<{ role: 'customer' | 'business' }>();
  const { login, register } = useAuth();

  // Login mu Register mı?
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Eksik bilgi', 'E-posta ve şifre gerekli.');
      return;
    }
    if (isRegisterMode && !name.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen adını gir.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Şifre kısa', 'Şifre en az 6 karakter olmalı.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        // Yeni kullanıcı kaydı
        await register(
          email.trim().toLowerCase(),
          password,
          name.trim(),
          (role || 'customer') as 'customer' | 'business'
        );
        // Müşteri kaydı sonrası onboarding'e, işletme ise mağaza setup'a
        if (role === 'business') {
          router.replace('/business/store-setup');
        } else {
          router.replace('/surprise-info');
        }
      } else {
        // Mevcut kullanıcı girişi
      const loggedUser = await login(email, password);
        if (loggedUser.role === 'business') {
          router.replace('/business/business-dashboard');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert(
        isRegisterMode ? 'Kayıt başarısız' : 'Giriş başarısız',
        error.message || 'Bir şeyler ters gitti. Tekrar dene.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {role === 'business' ? 'İşletme' : 'Müşteri'} {isRegisterMode ? 'Kaydı' : 'Girişi'}
          </Text>
          <View style={{ width: 20 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Mod Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, !isRegisterMode && styles.activeTab]}
              onPress={() => setIsRegisterMode(false)}
            >
              <Text style={[styles.tabText, !isRegisterMode && styles.activeTabText]}>Giriş Yap</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, isRegisterMode && styles.activeTab]}
              onPress={() => setIsRegisterMode(true)}
            >
              <Text style={[styles.tabText, isRegisterMode && styles.activeTabText]}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>

          {/* Ad alanı (sadece register'da) */}
          {isRegisterMode && (
            <>
              <Text style={styles.label}>Ad Soyad</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Adın ve soyadın"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  editable={!isLoading}
                />
              </View>
            </>
          )}

          {/* Email */}
          <Text style={styles.label}>E-posta</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="ornek@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Şifre */}
          <Text style={styles.label}>Şifre</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              placeholder="En az 6 karakter"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {!isRegisterMode && (
            <Text style={styles.helperText}>
              Hesabın yok mu? Yukarıdan "Kayıt Ol" sekmesini seç.
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.continueButton, isLoading && styles.buttonDisabled]}
            disabled={isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>
                {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, marginTop: 10 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937' },
  content: { padding: 20, paddingTop: 20 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  activeTabText: { color: '#0A4D44' },

  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, height: 56, marginBottom: 20, gap: 10 },
  input: { flex: 1, fontSize: 16, color: '#1f2937' },

  helperText: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 10 },

  footer: { paddingHorizontal: 20, paddingBottom: 40 },
  continueButton: { height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A4D44' },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});