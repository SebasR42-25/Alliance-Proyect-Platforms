import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import type { Message } from '../../types';

interface Props {
  message: Message;
  isMine: boolean;
}

export function MessageBubble({ message, isMine }: Props) {
  const text = message.text ?? message.content ?? '';
  return (
    <View style={[styles.row, isMine && styles.rowMine]}>
      <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
        <Text style={[styles.text, isMine && styles.textMine]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:      { marginBottom: 8, maxWidth: '80%', alignSelf: 'flex-start' },
  rowMine:  { alignSelf: 'flex-end' },
  bubble:   { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  mine:     { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  theirs:   { backgroundColor: Colors.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.cardBorder },
  text:     { fontSize: 14, color: Colors.textDark, lineHeight: 20 },
  textMine: { color: '#fff' },
});
