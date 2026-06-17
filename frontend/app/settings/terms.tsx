import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Madde işareti bileşeni
const TermSection = ({ title, content }: { title: string, content: string }) => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <View style={styles.dot} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Text style={styles.sectionText}>{content}</Text>
  </View>
);

export default function TermsOfUse() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanım Koşulları</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Giriş Görseli/İkonu */}
        <View style={styles.topIllustration}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="file-document-check-outline" size={40} color="#0A4D44" />
          </View>
          <Text style={styles.lastUpdate}>Son Güncelleme: 23 Nisan 2026</Text>
        </View>

        <View style={styles.introBox}>
          <Text style={styles.introText}>
            Son Lokma platformuna hoş geldiniz. Uygulamamızı kullanarak aşağıdaki kuralları ve şartları kabul etmiş sayılırsınız. Lütfen bu metni dikkatlice okuyunuz.
          </Text>
        </View>

        {/* Koşullar Listesi */}
        <TermSection 
          title="Hizmet Amacı" 
          content="Son Lokma, işletmelerin gün sonunda kalan taze ürünlerini uygun fiyatlarla tüketicilerle buluşturarak gıda israfını önlemeyi amaçlayan bir platformdur." 
        />

        <TermSection 
          title="Kullanıcı Sorumlulukları" 
          content="Kullanıcılar, verdikleri siparişleri belirtilen teslimat saatleri içerisinde ilgili işletmeden teslim almakla yükümlüdür. Teslim alınmayan paketlerin ücret iadesi yapılmaz." 
        />

        <TermSection 
          title="Sürpriz Paket İçeriği" 
          content="Paket içerikleri o günkü stok durumuna göre belirlendiği için değişiklik gösterebilir. Alerjen hassasiyeti olan kullanıcıların işletme açıklamalarını okuması önerilir." 
        />

        <TermSection 
          title="Ödeme ve İptal" 
          content="Ödemeler uygulama üzerinden dijital olarak tahsil edilir. Teslimat saatine 2 saat kalana kadar yapılan iptallerde tam iade sağlanır." 
        />

        <TermSection 
          title="Fikri Mülkiyet" 
          content="Uygulama içerisindeki tüm tasarımlar, logolar ve yazılımlar Son Lokma'ya aittir ve izinsiz kopyalanamaz." 
        />

        <View style={styles.footerNote}>
          <Text style={styles.footerNoteText}>
            Herhangi bir sorunuz varsa lütfen Destek Merkezi üzerinden bizimle iletişime geçin.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  
  scrollContent: { padding: 25 },

  topIllustration: { alignItems: 'center', marginBottom: 30 },
  iconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#F0F9F7', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 15
  },
  lastUpdate: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },

  introBox: { 
    backgroundColor: '#F9FAFB', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  introText: { fontSize: 14, color: '#4B5563', lineHeight: 22, textAlign: 'center' },

  sectionContainer: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0A4D44', marginRight: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sectionText: { fontSize: 14, color: '#6B7280', lineHeight: 22, paddingLeft: 20 },

  footerNote: { 
    marginTop: 20, 
    paddingTop: 30, 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    marginBottom: 40 
  },
  footerNoteText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' }
});