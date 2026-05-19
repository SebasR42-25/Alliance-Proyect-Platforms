import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import type { NewsItem } from '../../types';

export function NewsCard({ title, content, category, author, createdAt, imageUrl }: NewsItem) {
  const fallback = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image source={{ uri: imageUrl || fallback }} style={styles.img} resizeMode="cover" />
      <View style={styles.body}>
        <View style={styles.catRow}>
          <View style={styles.catBadge}><Text style={styles.catText}>{category}</Text></View>
          <Text style={styles.date}>{new Date(createdAt).toLocaleDateString('es-CO')}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.excerpt} numberOfLines={3}>{content}</Text>
        <Text style={styles.author}>Por {author?.name ?? 'Redacción Alliance'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  img:     { width: '100%', height: 170 },
  body:    { padding: 16 },
  catRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  catBadge:{ backgroundColor: Colors.primary + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  catText: { fontSize: 11, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  date:    { fontSize: 11, color: Colors.textLight, fontWeight: '600' },
  title:   { fontSize: 16, fontWeight: '900', color: Colors.textDark, lineHeight: 22, marginBottom: 8 },
  excerpt: { fontSize: 13, color: Colors.textGray, lineHeight: 20, marginBottom: 10 },
  author:  { fontSize: 12, color: Colors.primary, fontWeight: '700' },
});
