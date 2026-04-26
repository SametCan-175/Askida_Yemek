import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function CheckoutScreen() {
  const params = useLocalSearchParams();
  const { storeName, totalItems, totalPrice, time } = params;

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState({ id: 'card', name: 'Kredi / Banka Kartı', icon: 'credit-card', color: '#111827' });

  const PAYMENT_METHODS = [
    { id: 'card', name: 'Kredi / Banka Kartı', icon: 'credit-card', color: '#111827' },
    { id: 'gpay', name: 'Google Pay', icon: 'google-pay', color: '#111827' },
    { id: 'apple', name: 'Apple Pay', icon: 'apple-pay', color: '#111827' },
  ];

  const subtotal = parseFloat(totalPrice as string) || 0;
  const tax = subtotal * 0.01;
  const finalTotal = subtotal + tax;

  // DİNAMİK SİPARİŞ OLUŞTURMA FONKSİYONU
  const handleCompleteOrder = () => {
    // Benzersiz bir Sipariş ID'si oluşturuyoruz (Örn: SL-8F4A2C)
    const uniqueOrderId = 'SL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Yönlendirme yaparken bu ID'yi de beraberinde gönderiyoruz
    router.replace({
      pathname: '/shop/order-success',
      params: { 
        storeName: storeName, 
        time: time,
        orderId: uniqueOrderId
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Siparişi Onayla</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={styles.storeIconBg}>
            <Ionicons name="storefront" size={32} color="#0A4D44" />
          </View>
          <Text style={styles.storeName}>{storeName}</Text>
          <Text style={styles.itemCount}>{totalItems} Ürün Seçildi</Text>
          
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeLabel}>Teslim Alma Zamanı</Text>
            <Text style={styles.timeBadgeValue}>{time || 'Bugün 19:30 - 20:30'}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ÖDEME YÖNTEMİ</Text>
        <TouchableOpacity 
          style={styles.paymentSelector} 
          activeOpacity={0.7}
          onPress={() => setPaymentModalVisible(true)}
        >
          <View style={styles.paymentSelectorLeft}>
            <View style={styles.paymentIconBox}>
              <FontAwesome5 name={selectedPayment.icon as any} size={20} color={selectedPayment.color} />
            </View>
            <Text style={styles.paymentName}>{selectedPayment.name}</Text>
          </View>
          <Text style={styles.changeText}>Değiştir</Text>
        </TouchableOpacity>

        <View style={styles.receiptContainer}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Ara Toplam</Text>
            <Text style={styles.receiptValue}>{subtotal.toFixed(2)}₺</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>KDV (%1)</Text>
            <Text style={styles.receiptValue}>{tax.toFixed(2)}₺</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.receiptRow}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{finalTotal.toFixed(2)}₺</Text>
          </View>
        </View>

        <Text style={styles.termsText}>
          Bu siparişi onaylayarak Son Lokma'nın <Text style={styles.termsLink}>Şartlar ve Koşullarını</Text> kabul etmiş olursunuz.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepperPlaceholder}>
           <Text style={styles.itemCountFooter}>{totalItems} Adet</Text>
        </View>
        <TouchableOpacity 
          style={styles.payButton}
          onPress={handleCompleteOrder} // Butonu yeni fonksiyona bağladık
        >
          {selectedPayment.id === 'gpay' ? (
            <FontAwesome5 name="google-pay" size={32} color="#FFFFFF" />
          ) : selectedPayment.id === 'apple' ? (
            <FontAwesome5 name="apple-pay" size={32} color="#FFFFFF" />
          ) : (
            <Text style={styles.payButtonText}>Ödemeyi Tamamla</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={paymentModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ödeme yöntemi seçin</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity 
                key={method.id} 
                style={styles.modalOption}
                onPress={() => {
                  setSelectedPayment(method);
                  setPaymentModalVisible(false);
                }}
              >
                <View style={[styles.paymentIconBox, { backgroundColor: '#F3F4F6' }]}>
                  <FontAwesome5 name={method.icon as any} size={20} color={method.color} />
                </View>
                <Text style={styles.modalOptionText}>{method.name}</Text>
                {selectedPayment.id === method.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#0A4D44" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF' },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { padding: 20 },
  summaryContainer: { alignItems: 'center', marginBottom: 30 },
  storeIconBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F0F9F6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  storeName: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 4, textAlign: 'center' },
  itemCount: { fontSize: 15, color: '#6B7280', marginBottom: 15 },
  timeBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  timeBadgeLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '700', marginBottom: 2 },
  timeBadgeValue: { fontSize: 15, fontWeight: '800', color: '#111827' },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#9CA3AF', marginBottom: 10, letterSpacing: 1 },
  paymentSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 25 },
  paymentSelectorLeft: { flexDirection: 'row', alignItems: 'center' },
  paymentIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  paymentName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  changeText: { fontSize: 14, fontWeight: '700', color: '#0A4D44' },
  receiptContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  receiptLabel: { fontSize: 15, color: '#6B7280' },
  receiptValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: '#111827' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#0A4D44' },
  termsText: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  termsLink: { color: '#0A4D44', fontWeight: '700' },
  footer: { flexDirection: 'row', padding: 20, paddingBottom: 35, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', alignItems: 'center' },
  stepperPlaceholder: { backgroundColor: '#F3F4F6', paddingHorizontal: 20, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  itemCountFooter: { fontSize: 16, fontWeight: '800', color: '#111827' },
  payButton: { flex: 1, height: 56, backgroundColor: '#111827', borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  payButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111827' }
});