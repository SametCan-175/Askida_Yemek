import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Platform,
  Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Bildirim Satırı Bileşeni (Tekrarı önlemek için burada tanımlı)
const NotificationRow = ({ title, subtitle, icon, value, onToggle, color = "#0A4D44" }: any) => (
  <View style={styles.itemRow}>
    <View style={styles.itemLeft}>
      <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.textStack}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <Switch
      trackColor={{ false: "#E5E7EB", true: "#0A4D44" }}
      thumbColor="#FFF"
      ios_backgroundColor="#E5E7EB"
      onValueChange={onToggle}
      value={value}
    />
  </View>
);

export default function Notifications() {
  const [settings, setSettings] = useState({
    orders: true,
    campaigns: true,
    reminders: false,
    news: true,
    security: true
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>SİPARİŞ VE HESAP</Text>
        <View style={styles.groupCard}>
          <NotificationRow 
            title="Sipariş Durumu" 
            subtitle="Paketinizin hazırlık ve teslimat aşamaları"
            icon="shopping"
            value={settings.orders}
            onToggle={() => toggle('orders')}
          />
          <View style={styles.divider} />
          <NotificationRow 
            title="Hesap Güvenliği" 
            subtitle="Giriş denemeleri ve şifre işlemleri"
            icon="shield-check"
            value={settings.security}
            onToggle={() => toggle('security')}
          />
        </View>

        <Text style={styles.sectionLabel}>PAZARLAMA VE HABERLER</Text>
        <View style={styles.groupCard}>
          <NotificationRow 
            title="Kampanyalar" 
            subtitle="Sana özel indirim ve fırsatlar"
            icon="tag-outline"
            color="#F59E0B"
            value={settings.campaigns}
            onToggle={() => toggle('campaigns')}
          />
          <View style={styles.divider} />
          <NotificationRow 
            title="Hatırlatıcılar" 
            subtitle="Kaçırmak istemeyeceğin fırsatlar"
            icon="bell-ring-outline"
            color="#3B82F6"
            value={settings.reminders}
            onToggle={() => toggle('reminders')}
          />
          <View style={styles.divider} />
          <NotificationRow 
            title="Haber Bülteni" 
            subtitle="Güncellemeler ve yenilikler"
            icon="newspaper-variant-outline"
            color="#8B5CF6"
            value={settings.news}
            onToggle={() => toggle('news')}
          />
        </View>

        <TouchableOpacity 
          style={styles.systemBtn}
          onPress={() => Alert.alert("Bilgi", "Sistem ayarlarına yönlendiriliyorsunuz.")}
        >
          <Text style={styles.systemBtnText}>Tümünü Sistem Ayarlarından Yönet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },
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
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 12, letterSpacing: 1 },
  groupCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden'
  },
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16 
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textStack: { marginLeft: 12, flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F9FAFB', marginHorizontal: 16 },
  systemBtn: { marginTop: 10, padding: 15, alignItems: 'center' },
  systemBtnText: { color: '#0A4D44', fontWeight: '700' }
});