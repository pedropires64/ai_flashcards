// components/ui/Tag.js
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme';

export default function Tag({ text, dark=false }) {
  return (
    <View style={[styles.chip, { backgroundColor: dark ? '#0b1220' : '#eef2ff', borderColor: dark ? colors.borderDark : 'transparent' }]}>
      <Text style={{ color: dark ? colors.text : colors.textDark, fontWeight: '600' }}>#{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing(1),
    paddingVertical: 6,
    borderRadius: radius.md,
    marginRight: 6,
    borderWidth: 1,
  },
});