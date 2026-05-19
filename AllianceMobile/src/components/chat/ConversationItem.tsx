import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import type { Conversation } from '../../types';

interface Props {
  conversation: Conversation;
  active: boolean;
  onPress: () => void;
}

export function ConversationItem({ conversation, active, onPress }: Props) {
  const avatar = conversation.user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.user?.name ?? 'U')}&background=E91E8C&color=fff`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.item, active && styles.itemActive]}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.body}>
        <Text style={styles.name}>{conversation.user?.name}</Text>
        <Text style={styles.last} numberOfLines={1}>{conversation.lastMessage ?? 'Sin mensajes aún'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16 },
  itemActive: { backgroundColor: Colors.primary + '12' },
  avatar:     { width: 48, height: 48, borderRadius: 14, backgroundColor: Colors.cardBorder },
  body:       { flex: 1 },
  name:       { fontWeight: '800', fontSize: 14, color: Colors.textDark },
  last:       { fontSize: 12, color: Colors.textGray, marginTop: 2 },
});
