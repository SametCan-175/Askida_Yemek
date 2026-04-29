import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

// GÜNCELLENEN KISIM: Backend'in (Yapay Zekanın) anladığı format
type Message = {
  id: string;
  content: string; // text yerine content
  role: 'user' | 'agent'; // sender yerine role
};

export default function SupportScreen() {
  // GÜNCELLENEN KISIM: Profile sayfasından gelen user_id'yi yakalıyoruz
  const { user_id } = useLocalSearchParams();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // GÜNCELLENEN KISIM: Başlangıç mesajının formatı uyarlandı
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'Merhaba! Ben Lokmacık, senin akıllı asistanın. Siparişlerin veya uygulamayla ilgili sana nasıl yardımcı olabilirim? 😊', role: 'agent' }
  ]);

  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Kullanıcının yazdığını objeye çevir
    const userMessage: Message = { id: Date.now().toString(), content: inputText.trim(), role: 'user' };
    
    // GÜNCELLENEN KISIM: Mevcut mesajların üstüne yeni mesajı ekle (Geçmiş - History)
    const updatedHistory = [...messages, userMessage];
    
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const response = await fetch('https://api.seninsiten.com/ai/destek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ 
          user_id: user_id, 
          history: updatedHistory 
        }), 
      });

      const data = await response.json();

      // AI'dan gelen cevabı ekrana ekle
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        content: data.reply || data.message || "Mesajın alındı, ancak API yanıt formatı eşleşmedi.", 
        role: 'agent' 
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Chat API Hatası:", error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        content: "Şu anda sunucularımıza ulaşamıyoruz. Backend tarafı aktif olmayabilir.", 
        role: 'agent' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user'; // sender yerine role kontrolü
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAI]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Image 
              source={require('../assets/lokmacik.png')}
              style={styles.lokmacikImage}
            />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content} {/* text yerine content */}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Canlı Destek</Text>
            <Text style={styles.headerSubtitle}>Lokmacık</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0A4D44" />
            <Text style={styles.loadingText}>Asistan yanıtlıyor...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Bir mesaj yazın..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={200}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', elevation: 2, zIndex: 10 },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#0A4D44', fontWeight: '800', marginTop: 2 },
  
  chatList: { padding: 20, paddingBottom: 10 },
  
  messageWrapper: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperAI: { justifyContent: 'flex-start' },
  
  aiAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#0A4D44', justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 5, overflow: 'hidden' },
  lokmacikImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' // Resmi yuvarlağın içine tam oturtur
  },
  
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
  userBubble: { backgroundColor: '#0A4D44', borderBottomRightRadius: 5 },
  aiBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E5E7EB' },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  aiText: { color: '#111827' },

  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  loadingText: { marginLeft: 10, fontSize: 13, color: '#6B7280', fontStyle: 'italic' },

  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 15, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  textInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, minHeight: 45, maxHeight: 100, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15, color: '#111827', marginRight: 10 },
  sendBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' }
});