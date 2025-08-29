// components/ui/AppButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, shadow } from '../../theme';

export default function AppButton({
  title,
  onPress,
  style,
  variant = 'primary',   // primary | success | danger | ghost | warning
  size = 'sm',           // sm | md
  disabled = false,
  loading = false,
}) {
  const palette = {
    primary:  { bg: colors.primary, fg: '#fff' },
    success:  { bg: colors.success, fg: '#fff' },
    danger:   { bg: colors.danger,  fg: '#fff' },
    ghost:    { bg: 'transparent',  fg: colors.primary, borderColor: colors.primary },
    warning:  { bg: '#f59e0b', fg: '#fff' }, // laranja
  }[variant];

  const sizeStyle = size === 'sm'
    ? { paddingH: spacing(1.25), radius: radius.lg, fontSize: 14, minH: 40 }
    : { paddingH: spacing(2),    radius: radius.lg, fontSize: 16, minH: 48 };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled || loading}
      style={[
        styles.btn,
        {
          backgroundColor: palette.bg,
          borderColor: palette.borderColor ?? 'transparent',
          borderRadius: sizeStyle.radius,
          minHeight: sizeStyle.minH,
          paddingHorizontal: sizeStyle.paddingH,
        },
        shadow.card,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={palette.fg} />
        : <Text numberOfLines={1} style={[styles.title, { color: palette.fg, fontSize: sizeStyle.fontSize }]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // centra vertical e horizontal
    borderWidth: 1,
    maxWidth: '100%',
    paddingVertical: 0,
  },
  title: { fontWeight: '700', textAlign: 'center' },
});