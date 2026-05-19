import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import type { Post } from '../../types';

interface Props extends Post {
  token: string | null;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

export function PostCard({ _id, author, content, createdAt, likes, comments, hashtags, imageUrl, token, onLike, onComment }: Props) {
  const [commentModal, setCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  const avatarUrl = author?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(author?.name ?? 'U')}&background=E91E8C&color=fff`;

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(_id, commentText.trim());
    setCommentText('');
    setCommentModal(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{author?.name}</Text>
          <Text style={styles.meta}>{author?.career ?? 'Estudiante'} · {new Date(createdAt).toLocaleDateString('es-CO')}</Text>
        </View>
      </View>

      <Text style={styles.content}>{content}</Text>

      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.postImg} resizeMode="cover" />}

      {hashtags?.length > 0 && (
        <View style={styles.tags}>
          {hashtags.map((h) => (
            <Text key={h} style={styles.tag}>#{h}</Text>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onLike(_id)} style={styles.action} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>❤️</Text>
          <Text style={styles.actionCount}>{likes?.length ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCommentModal(true)} style={styles.action} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{comments?.length ?? 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.action, { marginLeft: 'auto' }]} activeOpacity={0.7}>
          <Text style={styles.actionIcon}>🚀</Text>
          <Text style={styles.actionCount}>Compartir</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={commentModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Comentar</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Escribe tu comentario..."
              placeholderTextColor={Colors.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setCommentModal(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleComment} style={styles.sendBtn}>
                <Text style={styles.sendText}>Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.cardBorder },
  info:   { flex: 1 },
  name:   { fontWeight: '800', fontSize: 15, color: Colors.textDark },
  meta:   { fontSize: 11, color: Colors.textGray, marginTop: 1 },
  content:{ fontSize: 14, color: Colors.textDark, lineHeight: 22, marginBottom: 10 },
  postImg:{ width: '100%', height: 200, borderRadius: 14, marginBottom: 10 },
  tags:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag:    { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  actions:{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.cardBorder, paddingTop: 10, gap: 16 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionIcon: { fontSize: 16 },
  actionCount:{ fontSize: 12, fontWeight: '700', color: Colors.textGray },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBox:     { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle:   { fontSize: 18, fontWeight: '900', color: Colors.textDark, marginBottom: 16 },
  modalInput:   { backgroundColor: Colors.inputBg, borderRadius: 14, padding: 14, fontSize: 14, color: Colors.textDark, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn:    { flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center' },
  cancelText:   { fontWeight: '700', color: Colors.textGray },
  sendBtn:      { flex: 1, padding: 14, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center' },
  sendText:     { fontWeight: '800', color: '#fff' },
});
