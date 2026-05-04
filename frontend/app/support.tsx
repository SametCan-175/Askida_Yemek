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
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '../contexts/AuthContext';
import { sendSupportMessage, ChatMessage } from '../services/support';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'agent';
};

export default function SupportScreen() {
  const { user } = useAuth();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      content: 'Merhaba! Ben Lokma, Son Lokma\'nın akıllı asistanı. Siparişlerin, rezervasyonların veya uygulamayla ilgili sana nasıl yardımcı olabilirim? 😊', 
      role: 'agent' 
    }
  ]);

  const flatListRef = useRef<FlatList>(null);

  // Frontend formatından backend formatına çevir
  const toBackendHistory = (msgs: Message[]): ChatMessage[] => {
    return msgs
      .slice(1) // İlk karşılama mesajını atla
      .map(m => ({
        rol: m.role === 'user' ? 'kullanici' as const : 'asistan' as const,
        mesaj: m.content,
      }));
  };

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    if (!user) {
      alert('Önce giriş yapmalısın.');
      return;
    }

    const userMessage: Message = { 
      id: Date.now().toString(), 
      content: trimmed, 
      role: 'user' 
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Backend'e gönderilecek geçmiş — sadece eski mesajlar (yeni mesaj zaten parametrede)
      const history = toBackendHistory(messages);
      
      const data = await sendSupportMessage(user.id, trimmed, history);
      const aiReply = data.yanit || 'Cevap alınamadı.';

      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        content: aiReply,
        role: 'agent' 
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      console.error("Chat API Hatası:", error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        content: error.message?.includes('500') 
          ? 'AI servisine ulaşamıyorum. Birkaç saniye sonra tekrar dene.' 
          : (error.message || 'Bir hata oluştu, lütfen tekrar dene.'),
        role: 'agent' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAI]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarEmoji}>🤖</Text>
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.content}
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Canlı Destek</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>Lokma — Çevrimiçi</Text>
            </View>
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
            <Text style={styles.loadingText}>Lokma yazıyor...</Text>
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
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]} 
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6', 
    elevation: 2, 
    zIndex: 10 
  },
  backBtn: { padding: 5, marginLeft: -5 },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  
  chatList: { padding: 20, paddingBottom: 10 },
  
  messageWrapper: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  messageWrapperUser: { justifyContent: 'flex-end' },
  messageWrapperAI: { justifyContent: 'flex-start' },
  
  aiAvatar: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#0A4D44', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8, 
    marginBottom: 5 
  },
  aiAvatarEmoji: { fontSize: 18 },
  
  messageBubble: { maxWidth: '80%', padding: 15, borderRadius: 20 },
  userBubble: { backgroundColor: '#0A4D44', borderBottomRightRadius: 5 },
  aiBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 5, borderWidth: 1, borderColor: '#E5E7EB' },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  aiText: { color: '#111827' },

  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  loadingText: { marginLeft: 10, fontSize: 13, color: '#6B7280', fontStyle: 'italic' },

  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 15, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6' 
  },
  textInput: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 20, 
    minHeight: 45, 
    maxHeight: 100, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    fontSize: 15, 
    color: '#111827', 
    marginRight: 10 
  },
  sendBtn: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: '#10B981', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' }
});