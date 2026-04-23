import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Görseldeki gibi İlerleme Çubuklu Ödül Kartı
const AchievementCard = ({ title, desc, icon, current, total, color, unlocked = false }: any) => {
  const progress = (current / total) * 100;
  
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBox, { backgroundColor: unlocked ? color + '15' : '#F3F4F6' }]}>
          <MaterialCommunityIcons 
            name={icon} 
            size={28} 
            color={unlocked ? color : '#9CA3AF'} 
          />
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
            <Text style={styles.summaryNumber}>12</Text>
            <Text style={styles.summaryLabel}>Tamamlanan</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>4</Text>
            <Text style={styles.summaryLabel}>Bekleyen</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>AKTİF BAŞARIMLAR</Text>

        <AchievementCard 
          title="Doğa Dostu I" 
          desc="5 adet sürpriz paket kurtararak karbon ayak izini azalt."
          icon="leaf"
          current={5}
          total={5}
          color="#10B981"
          unlocked={true}
        />

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

        <AchievementCard 
          title="Sadık Müşteri" 
          desc="Aynı işletmeden 5 kez paket al."
          icon="heart"
          current={4}
          total={5}
          color="#EC4899"
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

  footerSpacing: { height: 20 }
});