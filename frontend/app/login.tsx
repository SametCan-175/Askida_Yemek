import React, { useState } from 'react';
import { router } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  StatusBar,
  Modal 
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  // Modal'ın açık/kapalı durumunu tutacak state
  const [isModalVisible, setModalVisible] = useState(false);

  // İşletme seçildiğinde çalışacak fonksiyon
  const handleBusinessSelection = () => {
    setModalVisible(false);
    // Rol bilgisini parametre olarak email-login sayfasına gönderiyoruz
    router.push({ pathname: '/email-login', params: { role: 'business' } });
  };

  // Müşteri diğer seçeneğiyle devam etmek isterse
  const handleCustomerSelection = () => {
    setModalVisible(false);
    router.push({ pathname: '/email-login', params: { role: 'customer' } });
  };

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
        <Image
          source={require('../assets/login_logo.png')}
          style={styles.heroImage}
          resizeMode="contain"
        />
      </View>

      {/* Butonlar Alanı */}
      <View style={styles.buttonContainer}>
        
        <TouchableOpacity style={[styles.button, styles.googleButton]} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="google" size={20} color="#EA4335" />
          </View>
          <Text style={[styles.buttonText, styles.googleButtonText]}>Google ile devam et</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.facebookButton]} activeOpacity={0.8}>
          <View style={styles.iconWrapper}>
            <FontAwesome5 name="facebook-f" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.buttonText}>Facebook ile devam et</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.emailButton]} 
          activeOpacity={0.8}
          onPress={() => router.push({ pathname: '/email-login', params: { role: 'customer' } })}
        >
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.buttonText}>E-posta ile devam et</Text>
        </TouchableOpacity>

        {/* Diğer Seçeneği - Tıklanınca Modal Açılacak */}
        <TouchableOpacity 
          style={styles.otherButton} 
          activeOpacity={0.6}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.otherButtonText}>Diğer</Text>
        </TouchableOpacity>

      </View>

      {/* Rol Seçim Modalı (Alttan Açılır Menü) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nasıl Devam Etmek İstersin?</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.roleButton} onPress={handleCustomerSelection}>
              <View style={styles.roleIconBg}>
                <Ionicons name="person-outline" size={24} color="#0A4D44" />
              </View>
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleTitle}>Müşteri Olacağım</Text>
                <Text style={styles.roleDesc}>Yemek kurtarmak ve fırsatları görmek istiyorum</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.roleButton, { borderBottomWidth: 0 }]} onPress={handleBusinessSelection}>
              <View style={styles.roleIconBg}>
                <Ionicons name="storefront-outline" size={24} color="#0A4D44" />
              </View>
              <View style={styles.roleTextContainer}>
                <Text style={styles.roleTitle}>İşletme Olacağım</Text>
                <Text style={styles.roleDesc}>Fazla yemeklerimi sürpriz paket olarak satmak istiyorum</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
    backgroundColor: '#F7F6F2',
  },
  heroImage: {
    width: '100%',
    height: undefined,
    aspectRatio: 4/3,
    marginHorizontal: -24,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
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
    backgroundColor: '#1877F2',
  },
  emailButton: {
    backgroundColor: '#0A4D44',
  },
  otherButton: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 10,
  },
  otherButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0AAB2',
  },
  
  // EKLENEN MODAL STİLLERİ
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Arka planı hafif karartır
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F6', // Projendeki açık yeşil ton
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
});