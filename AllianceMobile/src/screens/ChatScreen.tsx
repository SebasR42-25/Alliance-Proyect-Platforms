import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Image,
  ActivityIndicator, Modal, BackHandler, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Socket } from 'socket.io-client';
import { Colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import { getChatSocket } from '../services/socket.service';
import { getConversations, getMessages, createConversation } from '../services/chat.service';
import type { Conversation, Message } from '../types';

const AUTO_RESPONSES: { patterns: RegExp[]; replies: string[] }[] = [
  {
    patterns: [/hola/i, /buenas/i, /hey/i, /saludos/i, /qué tal/i, /como estas/i, /cómo estás/i],
    replies: [
      '¡Hola! 👋 ¿Cómo estás? Me alegra conectar contigo en Alliance.',
      '¡Qué tal! Gracias por escribir. ¿En qué puedo ayudarte?',
      '¡Buenas! Todo bien por aquí. ¿Tú cómo vas?',
    ],
  },
  {
    patterns: [/trabajo/i, /empleo/i, /vacante/i, /oferta/i, /contratar/i, /oportunidad/i],
    replies: [
      '¡Interesante! Estoy abierto/a a nuevas oportunidades. ¿De qué rol se trata?',
      'Claro, me interesa escuchar. ¿Cuál es el stack tecnológico?',
      '¡Gracias por contactarme! Cuéntame más sobre el proyecto.',
    ],
  },
  {
    patterns: [/proyecto/i, /colaborar/i, /equipo/i, /startup/i],
    replies: [
      'Me encanta colaborar en proyectos innovadores. ¿De qué trata?',
      '¡Suena interesante! ¿Qué tecnologías están usando?',
      '¡Con gusto! ¿Cuál es el alcance del proyecto?',
    ],
  },
  {
    patterns: [/gracias/i, /thank/i, /genial/i, /perfecto/i, /excelente/i, /chevere/i],
    replies: [
      '¡De nada! 😊 Fue un placer.',
      '¡Igualmente! Seguimos en contacto.',
      '¡Con gusto! Cualquier cosa me avisas.',
    ],
  },
  {
    patterns: [/cv/i, /hoja de vida/i, /portafolio/i, /experiencia/i],
    replies: [
      'Te puedo compartir mi perfil de Alliance, ahí está mi experiencia actualizada.',
      'Claro, tengo mi portafolio listo. ¿Me das tu correo para enviarlo?',
    ],
  },
  {
    patterns: [/reunión/i, /llamada/i, /videollamada/i, /meet/i, /agendar/i],
    replies: [
      '¡Perfecto! ¿Cuándo te queda bien? Puedo esta semana.',
      'Con gusto. ¿Prefieres Google Meet o Teams?',
    ],
  },
];

function getAutoReply(text: string): string {
  for (const g of AUTO_RESPONSES) {
    if (g.patterns.some(p => p.test(text))) {
      return g.replies[Math.floor(Math.random() * g.replies.length)];
    }
  }
  const generic = [
    '¡Entendido! Te respondo pronto. 😊',
    'Interesante, cuéntame más.',
    '¡Claro! ¿Cómo puedo ayudarte?',
    'Gracias por escribir. Estoy revisando tu mensaje.',
  ];
  return generic[Math.floor(Math.random() * generic.length)];
}

function avatarUri(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E91E8C&color=fff&size=128`;
}

function ChatModal({
  visible, onClose, conversation, currentUserId,
}: {
  visible: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  currentUserId: string;
}) {
  const { token, user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [typing, setTyping]     = useState(false);
  const listRef   = useRef<FlatList>(null);
  const autoIdRef = useRef(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  useEffect(() => {
    if (!visible || !conversation || !token) return;
    setLoading(true);
    setMessages([]);
    getMessages(token, conversation._id)
      .then(msgs => {
        setMessages(msgs);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 80);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = getChatSocket(token);
    socketRef.current = socket;
    socket.on('newMessage', (msg: Message) => {
      setMessages(prev =>
        prev.some(m => m._id === msg._id) ? prev : [...prev, msg]
      );
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    });
    return () => { socket.off('newMessage'); };
  }, [visible, conversation?._id]);

  const sendMessage = () => {
    if (!input.trim() || !conversation || !user) return;
    const text = input.trim();
    setInput('');

    const myMsg: Message = {
      _id: `local-${autoIdRef.current++}`,
      sender: currentUserId,
      text, content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, myMsg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);

    socketRef.current?.emit('sendMessage', {
      conversationId: conversation._id,
      senderId: currentUserId,
      content: text,
    });

    setTyping(true);
    setTimeout(() => {
      const replyText = getAutoReply(text);
    const reply: Message = {
        _id: `auto-${autoIdRef.current++}`,
        sender: conversation.user?._id ?? 'bot',
        text: replyText,
        content: replyText,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, reply]);
      setTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 60);
    }, 1200 + Math.random() * 1000);
  };

  const otherName = conversation?.user?.name ?? 'Usuario';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: Colors.mint }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header con safe area superior */}
        <View style={[styles.chatHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Image source={{ uri: avatarUri(otherName) }} style={styles.chatAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{otherName}</Text>
            {typing
              ? <Text style={styles.typingText}>escribiendo...</Text>
              : <Text style={styles.onlineText}>● En línea</Text>}
          </View>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialCommunityIcons name="dots-vertical" size={22} color={Colors.textGray} />
          </TouchableOpacity>
        </View>

        {/* Mensajes */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m, i) => m._id || i.toString()}
            contentContainerStyle={[styles.msgList, { paddingBottom: 16 }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <MaterialCommunityIcons name="message-text-outline" size={52} color={Colors.cardBorder} />
                <Text style={styles.emptyChatText}>Di hola a {otherName} 👋</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMine = item.sender === currentUserId;
              return (
                <View style={[styles.bubbleRow, isMine ? styles.rowMine : styles.rowOther]}>
                  {!isMine && (
                    <Image source={{ uri: avatarUri(otherName) }} style={styles.bubbleAvatar} />
                  )}
                  <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                      {item.text ?? item.content}
                    </Text>
                    <Text style={[styles.bubbleTime, isMine && { color: 'rgba(255,255,255,0.6)' }]}>
                      {new Date(item.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Typing indicator */}
        {typing && (
          <View style={styles.typingRow}>
            <Image source={{ uri: avatarUri(otherName) }} style={styles.bubbleAvatar} />
            <View style={styles.typingBubble}>
              <Text style={styles.typingDots}>• • •</Text>
            </View>
          </View>
        )}

        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.msgInput}
            placeholder={`Escríbele a ${otherName}...`}
            placeholderTextColor={Colors.textLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnOff]}
            activeOpacity={0.8}
            disabled={!input.trim()}
          >
            <MaterialCommunityIcons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface RouteParams { openUserId?: string; openUserName?: string }

export function ChatScreen({ route }: { route?: { params?: RouteParams } }) {
  const { user, token } = useAuthStore();
  const toast = useToast();
  const [conversations, setConvs]     = useState<Conversation[]>([]);
  const [activeConv, setActiveConv]   = useState<Conversation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading]         = useState(true);
  const [opening, setOpening]         = useState(false);

  const loadConvs = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getConversations(token);
      const unique = data.filter((c, i, arr) => arr.findIndex(x => x._id === c._id) === i);
      setConvs(unique);
    }
    catch { }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadConvs(); }, []);

  useEffect(() => {
    const params = route?.params;
    if (!params?.openUserId || !token) return;

    const open = async () => {
      setOpening(true);
      try {
        const convs = await getConversations(token);
        setConvs(convs);
        let conv = convs.find(c => c.user?._id === params.openUserId);
        if (!conv) {
          conv = await createConversation(token, params.openUserId!);
        }
        setConvs(prev => [conv!, ...prev.filter(c => c._id !== conv!._id)]);
        setActiveConv(conv);
        setModalVisible(true);
      } catch { toast.error('No se pudo abrir el chat'); }
      finally { setOpening(false); }
    };
    open();
  }, [route?.params?.openUserId]);

  const openConv = (conv: Conversation) => {
    setActiveConv(conv);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setActiveConv(null);
    loadConvs();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.listHeader}>
        <Text style={styles.pageTitle}>Mensajes</Text>
        <MaterialCommunityIcons name="message-plus-outline" size={24} color={Colors.primary} />
      </View>

      {/* Estado de apertura desde Mi Red */}
      {opening ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.openingText}>Abriendo chat...</Text>
        </View>
      ) : loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <MaterialCommunityIcons name="message-off-outline" size={56} color={Colors.cardBorder} />
          <Text style={styles.emptyTitle}>Sin conversaciones aún</Text>
          <Text style={styles.emptyHint}>Ve a Mi Red y toca 💬 para iniciar un chat</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={c => c._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.convItem} onPress={() => openConv(item)} activeOpacity={0.8}>
              <Image source={{ uri: avatarUri(item.user?.name ?? 'U') }} style={styles.convAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.convName}>{item.user?.name}</Text>
                <Text style={styles.convLast} numberOfLines={1}>
                  {item.lastMessage ?? 'Toca para chatear'}
                </Text>
              </View>
              <View style={styles.convRight}>
                <Text style={styles.convTime}>
                  {new Date(item.updatedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.textLight} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal fullscreen — sin nav bar */}
      <ChatModal
        visible={modalVisible}
        onClose={closeModal}
        conversation={activeConv}
        currentUserId={user?.id ?? ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: Colors.mint },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  openingText: { fontSize: 14, color: Colors.primary, fontWeight: '700' },

  listHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  pageTitle:   { fontSize: 24, fontWeight: '900', color: Colors.textDark },
  emptyTitle:  { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  emptyHint:   { fontSize: 13, color: Colors.textGray, textAlign: 'center', paddingHorizontal: 32 },
  convItem:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder, elevation: 1 },
  convAvatar:  { width: 50, height: 50, borderRadius: 15, backgroundColor: Colors.cardBorder },
  convName:    { fontWeight: '800', fontSize: 15, color: Colors.textDark },
  convLast:    { fontSize: 13, color: Colors.textGray, marginTop: 2 },
  convRight:   { alignItems: 'flex-end', gap: 4 },
  convTime:    { fontSize: 11, color: Colors.textLight, fontWeight: '600' },

  chatHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  backBtn:      { padding: 4 },
  chatAvatar:   { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.cardBorder },
  chatName:     { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  onlineText:   { fontSize: 11, color: Colors.success, fontWeight: '600' },
  typingText:   { fontSize: 11, color: Colors.primary, fontWeight: '600', fontStyle: 'italic' },
  headerAction: { padding: 6 },

  msgList:       { padding: 16, gap: 10 },
  emptyChat:     { alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 80 },
  emptyChatText: { fontSize: 15, color: Colors.textGray, fontWeight: '600' },

  bubbleRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 2 },
  rowMine:     { justifyContent: 'flex-end' },
  rowOther:    { justifyContent: 'flex-start' },
  bubbleAvatar:{ width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.cardBorder },
  bubble:      { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  bubbleMine:  { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.cardBorder },
  bubbleText:  { fontSize: 14, color: Colors.textDark, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTime:  { fontSize: 10, color: Colors.textLight, alignSelf: 'flex-end' },

  typingRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 6 },
  typingBubble: { backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.cardBorder },
  typingDots:   { fontSize: 16, color: Colors.textGray, letterSpacing: 2 },

  inputRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingTop: 10, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.cardBorder, alignItems: 'flex-end' },
  msgInput:    { flex: 1, backgroundColor: Colors.inputBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.textDark, maxHeight: 100 },
  sendBtn:     { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  sendBtnOff:  { backgroundColor: Colors.cardBorder },
});
