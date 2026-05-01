import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Payments() {
  const [modalVisible, setModalVisible] = useState(false);
  const [cards, setCards] = useState([
    { id: '1', last4: '4242', brand: 'credit-card', name: 'Ziraat Bankası' },
  ]);

  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const addCard = () => {
    if (newCard.number.length < 16) {
      Alert.alert("Hata", "Lütfen 16 haneli kart numaranızı girin.");
      return;
    }
    
    const cardEntry = {
      id: Math.random().toString(),
      last4: newCard.number.slice(-4),
      brand: 'credit-card', // Hata almamak için sabit ve güvenli bir ikon ismi
      name: newCard.name || 'Yeni Kart'
    };

    setCards([...cards, cardEntry]);
    setModalVisible(false);
    setNewCard({ number: '', expiry: '', cvv: '', name: '' });
    Alert.alert("Başarılı", "Kart eklendi.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme Yöntemleri</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.sectionTitle}>KAYITLI KARTLARIN</Text>

        {cards.map(card => (
          <View key={card.id} style={styles.cardItem}>
            <View style={styles.cardInfoLeft}>
              <View style={styles.brandIconBox}>
                {/* Burası kırmızı hataya sebep olabiliyor, güvenli ikona çektim */}
                <MaterialCommunityIcons name="credit-card-chip-outline" size={26} color="#0A4D44" />
              </View>
              <View>
                <Text style={styles.cardLabel}>{card.name}</Text>
                <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setCards(cards.filter(c => c.id !== card.id))}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addCardRow} onPress={() => setModalVisible(true)}>
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={24} color="#0A4D44" />
          </View>
          <Text style={styles.addCardText}>Yeni Kart Ekle</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Kısmı (Aynı kalabilir) */}
      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kart Bilgileri</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Kart İsmi" value={newCard.name} onChangeText={(t) => setNewCard({...newCard, name: t})} />
            <TextInput style={styles.input} placeholder="Kart Numarası" keyboardType="numeric" maxLength={16} value={newCard.number} onChangeText={(t) => setNewCard({...newCard, number: t})} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <TextInput style={[styles.input, { flex: 1 }]} placeholder="AA/YY" value={newCard.expiry} onChangeText={(t) => setNewCard({...newCard, expiry: t})} />
               <TextInput style={[styles.input, { flex: 1 }]} placeholder="CVV" keyboardType="numeric" maxLength={3} value={newCard.cvv} onChangeText={(t) => setNewCard({...newCard, cvv: t})} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={addCard}>
              <Text style={styles.saveBtnText}>Kartı Kaydet</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 15, letterSpacing: 1 },
  cardItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12 },
  cardInfoLeft: { flexDirection: 'row', alignItems: 'center' },
  brandIconBox: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#E6F0EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardLabel: { fontSize: 15, fontWeight: '700' },
  cardNumber: { fontSize: 13, color: '#6B7280' },
  addCardRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  addIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E6F0EE', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addCardText: { fontSize: 16, fontWeight: '700', color: '#0A4D44' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  input: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12, marginBottom: 10 },
  saveBtn: { backgroundColor: '#0A4D44', padding: 18, borderRadius: 30, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: '800' }
});