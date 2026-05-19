import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useToastStore } from '../../store/toastStore';
import { Colors } from '../../theme/colors';

const BG: Record<string, string> = {
  success: Colors.success,
  error:   Colors.error,
  warning: Colors.warning,
  info:    Colors.info,
};

const ICON: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((t) => (
        <View key={t.id} style={[styles.toast, { backgroundColor: BG[t.type] }]}>
          <Text style={styles.icon}>{ICON[t.type]}</Text>
          <Text style={styles.msg}>{t.message}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 10,
  },
  icon: { color: '#fff', fontWeight: '900', fontSize: 14 },
  msg:  { color: '#fff', fontWeight: '600', fontSize: 14, flex: 1 },
});
