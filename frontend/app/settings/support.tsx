import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Android için LayoutAnimation desteği (Açılır menülerin akıcı olması için)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Genişleyebilir Soru-Cevap Bileşeni
const FAQItem = ({ title, content }: { title: string, content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen(!isOpen);
  };

  return (
    <View style={styles.faqCard}>
      <TouchableOpacity style={styles.faqHeader} onPress={toggleOpen} activeOpacity={0.7}>
        <Text style={styles.faqTitle}>{title}</Text>
        <Ionicons name={isOpen ? "remove-circle" : "add-circle"} size={24} color={isOpen ? "#0A4D44" : "#D1D5DB"} />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.faqContent}>
          <Text style={styles.faqText}>{content}</Text>
        </View>
      )}
    </View>
  );
};

export default function Support() {
  const [activeCategory, setActiveCategory] = useState('Siparişler');

  // Telefon Araması Fonksiyonu
  const handleCallSupport = () => {
    const phoneNumber = 'tel:08500000000';
    Linking.canOpenURL(phoneNumber).then(supported => {
      if (supported) Linking.openURL(phoneNumber);
      else Alert.alert("Hata", "Bu cihaz aramayı desteklemiyor.");
    });
  };

  // Kategori Bazlı Tüm Veriler
  const helpData: any = {
    'Siparişler': [
      { q: "Siparişimi nasıl takip edebilirim?", a: "Siparişlerim sekmesine giderek aktif paketinizin durumunu 'Hazırlanıyor' veya 'Teslim Alınmayı Bekliyor' şeklinde görebilirsiniz." },
      { q: "Paketi vaktinde almazsam ne olur?", a: "İşletmeler gıda güvenliği nedeniyle paketleri teslimat saati sonunda imha edebilir. Bu durumda ücret iadesi yapılmamaktadır." },
      { q: "İçerikte alerjen madde var mı?", a: "Sürpriz paketler günlük kalan taze ürünlerden oluşur. Alerjiniz varsa lütfen paketi almadan önce işletme detayındaki alerjen uyarılarını okuyun." }
    ],
    'Ödemeler': [
      { q: "Hangi ödeme yöntemleri geçerli?", a: "Uygulamamızda tüm kredi ve banka kartları (Visa, Mastercard, Troy) geçerlidir. Nakit ödeme kabul edilmemektedir." },
      { q: "Kart bilgilerim güvende mi?", a: "Evet, kart bilgileriniz BDDK onaylı ödeme sistemleri tarafından 256-bit SSL sertifikası ile korunmaktadır." },
      { q: "İade süreci nasıl işler?", a: "İptal edilen siparişlerin ücret iadesi bankanıza bağlı olarak 3-10 iş günü içinde kartınıza yansıtılır." }
    ],
    'Hesap': [
      { q: "Hesabımı nasıl kalıcı olarak silerim?", a: "Hesap Detayları sayfasının en altındaki 'Hesabı Sil' butonuna basarak tüm verilerinizi silebilirsiniz." },
      { q: "Şifremi değiştirmek istiyorum?", a: "Profil sekmesindeki 'Şifremi Güncelle' butonuna basarak kayıtlı e-postanıza bir sıfırlama linki isteyebilirsiniz." }
    ],
    'İadeler': [
      { q: "Siparişimi iptal edebilir miyim?", a: "Teslimat saatine 2 saat kalana kadar siparişinizi cezasız iptal edebilirsiniz." },
      { q: "Bozuk ürün gelirse ne yapmalıyım?", a: "Ürünün fotoğrafını çekerek 'Bize Ulaşın' kısmından destek talebi oluşturun, ekibimiz hemen incelesin." }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım Merkezi</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Arama Alanı */}
        <View style={styles.searchSection}>
          <Text style={styles.welcomeText}>Merhaba Berkay,{"\n"}Hangi konuda yardıma ihtiyacın var?</Text>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput placeholder="Soru veya anahtar kelime ara..." style={styles.searchInput} placeholderTextColor="#9CA3AF" />
          </View>
        </View>

        {/* Yatay Kategori Seçimi */}
        <View style={styles.tabWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
            {Object.keys(helpData).map((cat) => (
              <TouchableOpacity 
                key={cat} 
                style={[styles.tabBtn, activeCategory === cat && styles.activeTabBtn]}
                onPress={() => {
                  LayoutAnimation.easeInEaseOut();
                  setActiveCategory(cat);
                }}
              >
                <Text style={[styles.tabText, activeCategory === cat && styles.activeTabText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sorular Bölümü */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>{activeCategory.toUpperCase()} HAKKINDA SIKÇA SORULANLAR</Text>
          {helpData[activeCategory].map((item: any, index: number) => (
            <FAQItem key={index} title={item.q} content={item.a} />
          ))}
        </View>

        {/* İLETİŞİM BÖLÜMÜ (Burayı genişlettim kanka) */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>HALA SORUNUNUZ MU VAR?</Text>
          
          <TouchableOpacity style={styles.contactCard} onPress={() => router.push('/settings/contact-us')}>
            <View style={[styles.iconCircle, { backgroundColor: '#E6F0EE' }]}>
              <Ionicons name="chatbubbles-outline" size={24} color="#0A4D44" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Bize Mesaj Gönderin</Text>
              <Text style={styles.contactSubtitle}>En geç 24 saat içinde dönüş yapalım.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={handleCallSupport}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="call-outline" size={24} color="#374151" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Destek Hattını Ara</Text>
              <Text style={styles.contactSubtitle}>Hemen bir temsilciye bağlan.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>Son Lokma Destek Ekibi</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },

  searchSection: { padding: 25, backgroundColor: '#FFF' },
  welcomeText: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 15, borderRadius: 16, height: 55 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#111827' },

  tabWrapper: { marginTop: 10, marginBottom: 5 },
  tabsContainer: { paddingHorizontal: 20, gap: 10, paddingVertical: 10 },
  tabBtn: { paddingHorizontal: 22, paddingVertical: 12, borderRadius: 30, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F3F4F6' },
  activeTabBtn: { backgroundColor: '#0A4D44', borderColor: '#0A4D44' },
  tabText: { fontWeight: '700', color: '#9CA3AF' },
  activeTabText: { color: '#FFF' },

  faqSection: { padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 15, letterSpacing: 1 },
  
  faqCard: { backgroundColor: '#FFF', borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6', elevation: 1 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  faqTitle: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, paddingRight: 15 },
  faqContent: { paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F9FAFB', paddingTop: 15 },
  faqText: { fontSize: 14, color: '#6B7280', lineHeight: 22 },

  contactSection: { padding: 20, paddingBottom: 40 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 24, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  iconCircle: { width: 55, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  contactInfo: { flex: 1, marginLeft: 15 },
  contactTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  contactSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 3 },

  footerNote: { textAlign: 'center', color: '#D1D5DB', marginBottom: 40, fontWeight: '600' }
});