import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  title: string;
  subtitle?: string;
  cta?: string;
  onPress?: () => void;
  variant?: 'pink' | 'lime' | 'blue';
}

export function Banner({ title, subtitle, cta, onPress, variant = 'pink' }: Props) {
  const bg = variant === 'lime' ? '#CCFF00' : variant === 'blue' ? Colors.textBlue : Colors.primary;
  const textColor = variant === 'lime' ? Colors.textDark : '#fff';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.banner, { backgroundColor: bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle && <Text style={[styles.sub, { color: textColor, opacity: 0.8 }]}>{subtitle}</Text>}
        {cta && (
          <View style={[styles.ctaBadge, { backgroundColor: variant === 'lime' ? Colors.primary : Colors.lime }]}>
            <Text style={[styles.ctaText, { color: variant === 'lime' ? '#fff' : Colors.textDark }]}>{cta}</Text>
          </View>
        )}
      </View>
      <Text style={styles.emoji}>🚀</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  content: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: '900', letterSpacing: -0.3 },
  sub:   { fontSize: 13, fontWeight: '500' },
  ctaBadge: { marginTop: 10, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  ctaText:  { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  emoji:    { fontSize: 32 },
});
