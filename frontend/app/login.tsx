import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'business' | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F6F2" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>YEMEK KURTARMAYA</Text>
        <Text style={styles.headerText}>BAŞLAYALIM</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/login_logo.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomContainer}>
        {!selectedRole ? (
          // Rol seçimi (eskisi gibi - hiçbir şey değişmedi)
          <View style={styles.roleSelectionContainer}>
            <Text style={styles.sectionTitle}>Nasıl devam etmek istersin?</Text>
            
            <TouchableOpacity 
              style={styles.roleCard} 
              activeOpacity={0.8}
              onPress={() => setSelectedRole('customer')}
            >
              <View style={styles.roleIconBg}>
                <Ionicons name="person-outline" size={24} color="#0A4D44" />
              </View>
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleTitle}>Müşteri Olacağım</Text>
                <Text style={styles.roleDesc}>Yemek kurtarmak ve fırsatları görmek istiyorum</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.roleCard} 
              activeOpacity={0.8}
              onPress={() => setSelectedRole('business')}
            >
              <View style={styles.roleIconBg}>
                <Ionicons name="storefront-outline" size={24} color="#0A4D44" />
              </View>
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleTitle}>İşletme Olacağım</Text>
                <Text style={styles.roleDesc}>Fazla ürünlerimi değerlendirmek ve israfın önüne geçmek istiyorum.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        ) : (
          // Auth seçenekleri - SADECE EMAIL kalıyor
          <View style={styles.authContainer}>
            <View style={styles.authHeader}>
              <TouchableOpacity onPress={() => setSelectedRole(null)} style={styles.backButtonCircle}>
                <Ionicons name="chevron-back" size={22} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.authTitle}>
                {selectedRole === 'customer' ? 'Müşteri Girişi' : 'İşletme Girişi'}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Sadece email butonu kaldı */}
            <TouchableOpacity 
              style={[styles.button, styles.emailButton]} 
              activeOpacity={0.8}
              onPress={() => router.push({ pathname: '/email-login', params: { role: selectedRole } })}
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons name="email-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.buttonText}>E-posta ile devam et</Text>
            </TouchableOpacity>

          
          </View>
        )}
      </View>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2',
    justifyContent: 'space-between',
  },
  headerContainer: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0A4D44',
    letterSpacing: 0.5,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '110%',
    alignSelf: 'center',
    marginVertical: 0,
  },
  heroImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 4/3,
    marginHorizontal: -24,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: 260,
    justifyContent: 'flex-end',
  },
  roleSelectionContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  authContainer: {
    width: '100%',
    gap: 16,
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    position: 'absolute',
    left: 24,
    width: 24, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0A4D44',
  },
  googleButtonText: {
    color: '#0A4D44',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  emailButton: {
    backgroundColor: '#0A4D44',
  },
  
});