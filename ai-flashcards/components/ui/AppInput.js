// components/ui/AppInput.js
import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export default function AppInput({ label, style, dark=false, ...props }) {
  return (
    <View style={style}>
      {label ? <Text style={[styles.label, { color: dark ? colors.textMuted : colors.textMutedDark }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={dark ? '#94a3b8' : '#9ca3af'}
        style={[styles.input, { 
          backgroundColor: dark ? '#0b1220' : '#fff',
          color: dark ? colors.text : colors.textDark,
          borderColor: dark ? colors.borderDark : colors.borderLight
        }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25),
  },
});