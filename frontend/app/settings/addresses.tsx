import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Adres Kartı Bileşeni
const AddressCard = ({ id, title, fullAddress, type, onEmailDelete }: any) => (
  <View style={styles.addressCard}>
    <View style={styles.cardHeader}>
      <View style={styles.titleWrapper}>
        <MaterialCommunityIcons 
          name={type === 'Ev' ? 'home-variant-outline' : 'briefcase-outline'} 
          size={22} 
          color="#0A4D44" 
        />
        <Text style={styles.addressTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={() => onEmailDelete(id)}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
    <Text style={styles.addressText}>{fullAddress}</Text>
    <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert("Düzenle", "Adres düzenleme ekranına yönlendiriliyorsunuz.")}>
      <Text style={styles.editBtnText}>Düzenle</Text>
    </TouchableOpacity>
  </View>
);

export default function Addresses() {
  // Örnek Adres Verileri
  const [addresses, setAddresses] = useState([
    { id: 1, title: 'Evim', type: 'Ev', fullAddress: 'Hürriyet Mah. No:12, Orhangazi, Bursa' },
    { id: 2, title: 'İş Yerim', type: 'İş', fullAddress: 'Keşan Yusuf Çapraz Kampüsü, Keşan, Edirne' }
  ]);

  const handleDelete = (id: number) => {
    Alert.alert("Adresi Sil", "Bu adresi silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Sil", 
        style: "destructive", 
        onPress: () => setAddresses(addresses.filter(a => a.id !== id)) 
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adreslerim</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.topSection}>
          <Text style={styles.sectionDesc}>
            Siparişlerinizin teslim edileceği kayıtlı adreslerinizi buradan yönetebilirsiniz.
          </Text>
        </View>

        {addresses.length > 0 ? (
          addresses.map((item) => (
            <AddressCard 
              key={item.id}
              id={item.id}
              title={item.title}
              type={item.type}
              fullAddress={item.fullAddress}
              onEmailDelete={handleDelete}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="map-marker-off-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>Henüz kayıtlı bir adresiniz bulunmuyor.</Text>
          </View>
        )}

        {/* Yeni Adres Ekle Butonu */}
        <TouchableOpacity 
          style={styles.addAddressBtn}
          onPress={() => Alert.alert("Yeni Adres", "Haritadan adres seçme ekranı açılacak.")}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addAddressText}>Yeni Adres Ekle</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    backgroundColor: '#FFF' 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  
  scrollContent: { padding: 20 },
  topSection: { marginBottom: 25 },
  sectionDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  addressCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleWrapper: { flexDirection: 'row', alignItems: 'center' },
  addressTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginLeft: 10 },
  addressText: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 15 },
  
  editBtn: { alignSelf: 'flex-start' },
  editBtnText: { color: '#0A4D44', fontWeight: '700', fontSize: 14 },

  addAddressBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#0A4D44', 
    padding: 18, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 10,
    elevation: 4
  },
  addAddressText: { color: '#FFF', fontWeight: '800', fontSize: 16, marginLeft: 10 },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9CA3AF', marginTop: 15, fontSize: 15, textAlign: 'center' }
});