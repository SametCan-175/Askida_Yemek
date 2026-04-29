import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// 1. KART BİLEŞENİ GÜNCELLENDİ: Artık API'den gelen 'emoji' parametresini de destekliyor
const AchievementCard = ({ title, desc, icon, emoji, current, total, color, unlocked = false }: any) => {
  const progress = (current / total) * 100;
  
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: unlocked ? color + '15' : '#F3F4F6' }]}>
          {/* Eğer backend'den emoji gelirse onu bas, gelmezse eski ikon sistemini kullan */}
          {emoji ? (
            <Text style={{ fontSize: 26 }}>{emoji}</Text>
          ) : (
            <MaterialCommunityIcons 
              name={icon} 
              size={28} 
              color={unlocked ? color : '#9CA3AF'} 
            />
          )}
        </View>
        <View style={styles.cardTextContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>
        {unlocked && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-done" size={16} color="#FFF" />
          </View>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>İlerleme</Text>
          <Text style={styles.progressValue}>{current}/{total}</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
};

export default function SpecialRewards() {
  // 2. STATE'LER EKLENDİ
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. SAYFA AÇILDIĞINDA API'YE İSTEK ATACAK useEffect
  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      // Backend'in verdiği endpoint
      const response = await fetch('https://api.seninsiten.com/users/rozetler', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // auth: true olduğu için kullanıcının token'ını buraya ekliyoruz
          'Authorization': `Bearer BURAYA_KULLANICI_TOKENI_GELECEK` 
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEarnedBadges(data); // API'den gelen diziyi state'e kaydet
      } else {
        console.log('Rozetler çekilemedi, durum kodu:', response.status);
      }
    } catch (error) {
      console.error("Rozet API Hatası:", error);
      Alert.alert("Bağlantı Hatası", "Rozetleriniz şu an yüklenemiyor.");
    } finally {
      setIsLoading(false); // Yükleme bitti
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Özel Ödüller</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Üst Özet Kartı */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            {/* Dinamik sayı: Kazanılan rozet sayısı */}
            <Text style={styles.summaryNumber}>{earnedBadges.length}</Text>
            <Text style={styles.summaryLabel}>Kazanılan</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            {/* Şimdilik statik bir hedef belirledik (Örn: Toplam 10 rozet var) */}
            <Text style={styles.summaryNumber}>{Math.max(10 - earnedBadges.length, 0)}</Text>
            <Text style={styles.summaryLabel}>Bekleyen</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>KAZANILAN ROZETLER</Text>

        {/* 4. YÜKLEME DURUMU VE VERİLERİN EKRANA BASILMASI */}
        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0A4D44" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Rozetlerin yükleniyor...</Text>
          </View>
        ) : earnedBadges.length > 0 ? (
          // Backend'den gelen veriyi (map ile) kartlara dönüştürüyoruz
          earnedBadges.map((badge) => (
            <AchievementCard 
              key={badge.id}
              title={badge.name} 
              desc={badge.description}
              emoji={badge.emoji}
              current={10} // Backend ilerleme verisi yollamadığı için kazanılmışlarda full gösteriyoruz
              total={10}
              color="#10B981"
              unlocked={true}
            />
          ))
        ) : (
          <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16 }}>
            <Text style={{ color: '#6B7280' }}>Henüz kazanılmış bir rozetin yok. Sipariş vererek rozet kazanmaya başla!</Text>
          </View>
        )}

        {/* İleride backend "kilitli rozetleri" de dönerse buraya ekleyebiliriz. 
            Şimdilik eski statik kilitli rozetleri örnek olarak aşağıda tutuyorum */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>KİLİTLİ BAŞARIMLAR</Text>

        <AchievementCard 
          title="Tasarruf Ustası" 
          desc="Toplamda 1000₺ tasarruf sınırına ulaş."
          icon="piggy-bank"
          current={450}
          total={1000}
          color="#3B82F6"
          unlocked={false}
        />

        <AchievementCard 
          title="Gurme Avcısı" 
          desc="10 farklı işletmeden sipariş ver."
          icon="silverware-variant"
          current={3}
          total={10}
          color="#F59E0B"
          unlocked={false}
        />
        
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },

  scrollContent: { padding: 20 },

  summaryBox: { 
    flexDirection: 'row', 
    backgroundColor: '#0A4D44', 
    padding: 25, 
    borderRadius: 24, 
    marginBottom: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0A4D44',
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNumber: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  summaryLabel: { fontSize: 12, color: '#E6F0EE', marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 15, letterSpacing: 1 },

  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTextContent: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  cardDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  completedBadge: { backgroundColor: '#10B981', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  progressSection: { marginTop: 5 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  progressValue: { fontSize: 11, fontWeight: '800', color: '#111827' },
  progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  footerSpacing: { height: 40 }
});