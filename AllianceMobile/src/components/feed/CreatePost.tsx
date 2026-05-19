import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import type { AuthUser } from '../../types';

interface Props {
  user: AuthUser | null;
  onSubmit: (content: string) => Promise<void>;
}

export function CreatePost({ user, onSubmit }: Props) {
  const [modal, setModal] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const avatarUrl = user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'U')}&background=E91E8C&color=fff`;

  const handlePost = async () => {
    if (!content.trim()) return;
    setLoading(true);
    await onSubmit(content.trim());
    setContent('');
    setLoading(false);
    setModal(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setModal(true)} activeOpacity={0.8}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <Text style={styles.placeholder}>¿Qué estás pensando, {user?.name?.split(' ')[0]}?</Text>
      </TouchableOpacity>

      <Modal visible={modal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <View style={styles.box}>
            <View style={styles.boxHeader}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.meta}>Publicar para todos</Text>
              </View>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Comparte una idea, logro o pregunta..."
              placeholderTextColor={Colors.textLight}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => { setModal(false); setContent(''); }} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePost} disabled={loading || !content.trim()} style={[styles.post, { opacity: content.trim() ? 1 : 0.5 }]}>
                <Text style={styles.postText}>{loading ? '...' : 'Publicar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar:      { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.cardBorder },
  placeholder: { flex: 1, fontSize: 14, color: Colors.textLight, fontWeight: '500' },
  overlay:     { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  box:         { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  boxHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  name:        { fontWeight: '800', fontSize: 16, color: Colors.textDark },
  meta:        { fontSize: 12, color: Colors.textGray },
  input:       { backgroundColor: Colors.inputBg, borderRadius: 16, padding: 14, fontSize: 15, color: Colors.textDark, minHeight: 100, textAlignVertical: 'top', marginBottom: 20 },
  actions:     { flexDirection: 'row', gap: 12 },
  cancel:      { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center' },
  cancelText:  { fontWeight: '700', color: Colors.textGray },
  post:        { flex: 1, padding: 14, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center' },
  postText:    { fontWeight: '900', color: '#fff', fontSize: 15 },
});
