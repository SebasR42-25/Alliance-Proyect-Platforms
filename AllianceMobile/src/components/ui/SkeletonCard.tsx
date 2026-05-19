import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface Props { style?: ViewStyle; }

export function SkeletonCard({ style }: Props) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: anim }, style]}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.lines}>
          <View style={[styles.line, { width: '60%' }]} />
          <View style={[styles.line, { width: '40%', marginTop: 6 }]} />
        </View>
      </View>
      <View style={[styles.line, { width: '100%', height: 12, marginTop: 16 }]} />
      <View style={[styles.line, { width: '85%', height: 12, marginTop: 8 }]} />
      <View style={[styles.line, { width: '70%', height: 12, marginTop: 8 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E2E8F0' },
  lines: { flex: 1 },
  line: { height: 14, backgroundColor: '#E2E8F0', borderRadius: 8 },
});
