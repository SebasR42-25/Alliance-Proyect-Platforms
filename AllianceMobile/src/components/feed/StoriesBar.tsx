import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import type { Story, AuthUser } from '../../types';

interface Props {
  stories: Story[];
  user: AuthUser | null;
}

const SEEDS = ['Vanessa', 'Andres', 'Mariana', 'Carlos', 'Isabella', 'Mateo'];

export function StoriesBar({ stories, user }: Props) {
  const myAvatar = user?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name ?? 'Yo')}&background=E91E8C&color=fff`;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.item} activeOpacity={0.8}>
        <View style={[styles.ring, styles.myRing]}>
          <Image source={{ uri: myAvatar }} style={styles.avatar} />
          <View style={styles.addBadge}><Text style={styles.addIcon}>+</Text></View>
        </View>
        <Text style={styles.label} numberOfLines={1}>Mi historia</Text>
      </TouchableOpacity>

      {(stories.length > 0 ? stories : SEEDS).map((item, i) => {
        const isStory = typeof item === 'object' && '_id' in item;
        const name = isStory ? (item as Story).author?.name : item as string;
        const seed = isStory ? (item as Story).author?.name : item;
        const avatar = isStory && (item as Story).author?.profilePicture
          ? (item as Story).author.profilePicture
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(String(seed ?? 'U'))}&background=random&color=fff&size=128`;

        return (
          <TouchableOpacity key={i} style={styles.item} activeOpacity={0.8}>
            <View style={styles.ring}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </View>
            <Text style={styles.label} numberOfLines={1}>{typeof name === 'string' ? name.split(' ')[0] : 'User'}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:   { },
  content:  { paddingHorizontal: 4, gap: 12, paddingVertical: 4 },
  item:     { alignItems: 'center', gap: 6 },
  ring:     {
    width: 66,
    height: 66,
    borderRadius: 20,
    padding: 2,
    borderWidth: 2.5,
    borderColor: Colors.primary,
    position: 'relative',
  },
  myRing:   { borderStyle: 'dashed', borderColor: Colors.textLight },
  avatar:   { width: '100%', height: '100%', borderRadius: 17, backgroundColor: Colors.cardBorder },
  addBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addIcon:  { color: '#fff', fontSize: 12, fontWeight: '900', lineHeight: 14 },
  label:    { fontSize: 11, fontWeight: '600', color: Colors.textGray, maxWidth: 66, textAlign: 'center' },
});
