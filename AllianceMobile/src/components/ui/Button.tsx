import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'lime' | 'outline' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({ label, onPress, variant = 'primary', loading, disabled, style, fullWidth }: Props) {
  const bg = variant === 'lime' ? Colors.lime : variant === 'outline' ? 'transparent' : variant === 'ghost' ? 'transparent' : Colors.primary;
  const textColor = variant === 'lime' ? Colors.textDark : variant === 'outline' ? Colors.primary : variant === 'ghost' ? Colors.textGray : '#fff';
  const border = variant === 'outline' ? 2 : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: bg, borderWidth: border, borderColor: Colors.primary, opacity: disabled ? 0.5 : 1 },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={textColor} size="small" />
        : <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  label: { fontWeight: '800', fontSize: 14, letterSpacing: 0.5, textTransform: 'uppercase' },
});
