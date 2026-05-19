import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import type { User } from '../../types';

interface Props {
  user: User;
  onConnect: (id: string) => void;
  onMessage: (id: string) => void;
}

export function NetworkCard({ user, onConnect, onMessage }: Props) {
  const avatar = user.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=E91E8C&color=fff&size=128`;

  return (
    <View style={styles.card}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.body}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.career}>{user.career ?? 'Ingeniería'}</Text>
        {user.skills?.length > 0 && (
          <View style={styles.skills}>
            {user.skills.slice(0, 3).map((s) => (
              <View key={s} style={styles.skillBadge}><Text style={styles.skillText}>{s}</Text></View>
            ))}
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onConnect(user._id)} style={styles.connectBtn} activeOpacity={0.8}>
          <Text style={styles.connectText}>Conectar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onMessage(user._id)} style={styles.msgBtn} activeOpacity={0.8}>
          <MaterialCommunityIcons name="message-outline" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar:      { width: 56, height: 56, borderRadius: 16, backgroundColor: Colors.cardBorder },
  body:        { flex: 1 },
  name:        { fontWeight: '800', fontSize: 15, color: Colors.textDark },
  career:      { fontSize: 12, color: Colors.primary, fontWeight: '700', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  skills:      { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  skillBadge:  { backgroundColor: Colors.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  skillText:   { fontSize: 10, fontWeight: '700', color: Colors.textGray },
  actions:     { gap: 8, alignItems: 'center' },
  connectBtn:  { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  connectText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  msgBtn:      { backgroundColor: Colors.inputBg, width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  msgIcon:     { fontSize: 16 },
});
