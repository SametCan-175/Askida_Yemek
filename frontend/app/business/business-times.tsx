import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchMyShop, 
  fetchShopHours, 
  updateShopHours, 
  ShopHoursItem 
} from '../../services/business';

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export default function BusinessTimes() {
  const { user } = useAuth();
  const [shopId, setShopId] = useState<number | null>(null);
  const [hours, setHours] = useState<ShopHoursItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!user) return;
        try {
          const myShop = await fetchMyShop(user.id);
          if (!myShop) {
            Alert.alert('Hata', 'Mağaza bulunamadı.');
            return;
          }
          if (!active) return;
          setShopId(myShop.id);
          const shopHours = await fetchShopHours(myShop.id);
          if (active) setHours(shopHours);
        } catch (err) {
          console.log('Saatler yüklenemedi:', err);
        } finally {
          if (active) setIsLoading(false);
        }
      })();
      return () => { active = false; };
    }, [user])
  );

  const updateDay = (dayIdx: number, field: keyof ShopHoursItem, value: any) => {
    setHours(prev => prev.map(h => 
      h.day_of_week === dayIdx ? { ...h, [field]: value } : h
    ));
  };

  // Bir günün ayarını tüm günlere uygula
  const copyToAll = (sourceIdx: number) => {
    const source = hours.find(h => h.day_of_week === sourceIdx);
    if (!source) return;

    Alert.alert(
      'Tüm günlere uygula',
      `${DAY_NAMES[sourceIdx]} ayarları tüm günlere kopyalansın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Uygula',
          onPress: () => {
            setHours(prev => prev.map(h => ({
              ...h,
              is_open: source.is_open,
              open_time: source.open_time,
              close_time: source.close_time,
              pickup_start: source.pickup_start,
              pickup_end: source.pickup_end,
            })));
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!shopId) return;
    setIsSaving(true);
    try {
      await updateShopHours(shopId, hours);
      Alert.alert('✅ Kaydedildi', 'Çalışma saatleri güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Saatler kaydedilemedi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0A4D44" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Saatler yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Çalışma Saatleri</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoBanner}>
          <Ionicons name="time-outline" size={24} color="#0A4D44" />
          <Text style={styles.infoBannerText}>
            Müşteriler sürpriz paketlerini "Teslim Alma" saat aralığında dükkanınızdan alacak.
          </Text>
        </View>

        {hours.map((day) => (
          <View key={day.day_of_week} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayName}>{DAY_NAMES[day.day_of_week]}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity onPress={() => copyToAll(day.day_of_week)}>
                  <Ionicons name="copy-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
                <Switch
                  value={day.is_open}
                  onValueChange={(v) => updateDay(day.day_of_week, 'is_open', v)}
                  trackColor={{ false: '#E5E7EB', true: '#A7D1C6' }}
                  thumbColor={day.is_open ? '#0A4D44' : '#9CA3AF'}
                />
              </View>
            </View>

            {day.is_open ? (
              <View style={styles.timesGrid}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeLabel}>Açılış - Kapanış</Text>
                  <View style={styles.timeRowMini}>
                    <TextInput
                      style={styles.timeInputMini}
                      value={day.open_time || ''}
                      onChangeText={(v) => updateDay(day.day_of_week, 'open_time', v)}
                      placeholder="09:00"
                      maxLength={5}
                    />
                    <Text style={styles.dashText}>—</Text>
                    <TextInput
                      style={styles.timeInputMini}
                      value={day.close_time || ''}
                      onChangeText={(v) => updateDay(day.day_of_week, 'close_time', v)}
                      placeholder="22:00"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={styles.timeBlock}>
                  <Text style={[styles.timeLabel, { color: '#0A4D44' }]}>Teslim Alma</Text>
                  <View style={styles.timeRowMini}>
                    <TextInput
                      style={[styles.timeInputMini, { borderColor: '#A7D1C6' }]}
                      value={day.pickup_start || ''}
                      onChangeText={(v) => updateDay(day.day_of_week, 'pickup_start', v)}
                      placeholder="19:00"
                      maxLength={5}
                    />
                    <Text style={styles.dashText}>—</Text>
                    <TextInput
                      style={[styles.timeInputMini, { borderColor: '#A7D1C6' }]}
                      value={day.pickup_end || ''}
                      onChangeText={(v) => updateDay(day.day_of_week, 'pickup_end', v)}
                      placeholder="21:30"
                      maxLength={5}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.closedText}>Bugün kapalı</Text>
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.saveBtn, isSaving && { opacity: 0.6 }]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Ayarları Kaydet</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  content: { padding: 20 },

  infoBanner: { flexDirection: 'row', backgroundColor: '#F0F9F6', padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  infoBannerText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#0A4D44', lineHeight: 18, fontWeight: '500' },

  dayCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  dayName: { fontSize: 16, fontWeight: '800', color: '#111827' },

  timesGrid: { gap: 12 },
  timeBlock: {},
  timeLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 6, letterSpacing: 0.5 },
  timeRowMini: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInputMini: { 
    flex: 1, 
    backgroundColor: '#F9FAFB', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 10, 
    paddingVertical: 10, 
    paddingHorizontal: 12, 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827', 
    textAlign: 'center' 
  },
  dashText: { fontSize: 16, color: '#9CA3AF', fontWeight: '700' },

  closedText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', paddingVertical: 8 },

  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 28, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});