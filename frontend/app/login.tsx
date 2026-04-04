import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
// İkonlar için Expo veya react-native-vector-icons kullanıldığını varsayıyoruz.
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F6F2" />
      
      {/* Üst Başlık */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>YEMEK KURTARMAYA</Text>
        <Text style={styles.headerText}>BAŞLAYALIM</Text>
      </View>

      {/* Görsel Alanı */}
      <View style={styles.imageContainer}>
        {/* Not: Buraya kendi projenizdeki çantayı/logoyu tutan eller görselini eklemelisin. 
            Örnek: source={require('../assets/images/hero-image.png')} */}
        <Image
          source={{ uri: 'https://via.placeholder.com/400x300/115545/FFFFFF?text=Gorsel+Alani' }}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Butonlar Alanı */}
      <View style={styles.buttonContainer}>
        
        {/* Google Butonu */}
        <TouchableOpacity style={[styles.button, styles.googleButton]} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="google" size={20} color="#EA4335" />
          </View>
          <Text style={[styles.buttonText, styles.googleButtonText]}>Google ile devam et</Text>
        </TouchableOpacity>

        {/* Facebook Butonu */}
        <TouchableOpacity style={[styles.button, styles.facebookButton]} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="facebook-f" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.buttonText}>Facebook ile devam et</Text>
        </TouchableOpacity>

        {/* E-posta Butonu */}
        <TouchableOpacity style={[styles.button, styles.emailButton]} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.buttonText}>E-posta ile devam et</Text>
        </TouchableOpacity>

        {/* Diğer Seçeneği */}
        <TouchableOpacity style={styles.otherButton} activeOpacity={0.6}>
          <Text style={styles.otherButtonText}>Diğer</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6F2', // Görseldeki krem/kırık beyaz arka plan
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
    color: '#0A4D44', // Too Good To Go koyu yeşil tonu
    letterSpacing: 0.5,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16, // React Native 0.71+ ile butonlar arası boşluk için
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28, // Tam yuvarlak köşeler (hap şekli)
    paddingHorizontal: 20,
  },
  iconWrapper: {
    position: 'absolute',
    left: 24, // İkonları sola sabitler
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#1877F2', // Facebook orijinal mavisi
  },
  emailButton: {
    backgroundColor: '#0A4D44', // Koyu yeşil
  },
  otherButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 10,
  },
  otherButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0AAB2', // Görseldeki açık gri ton
  },
});