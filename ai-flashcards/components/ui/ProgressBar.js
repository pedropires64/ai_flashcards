// components/ui/ProgressBar.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../../theme';

export default function ProgressBar({ value=0, dark=false, height=10 }) {
  return (
    <View style={[styles.wrap, { backgroundColor: dark ? '#0b1220' : '#eef2ff', height, borderRadius: radius.lg }]}>
      <View style={[
        styles.fill,
        { width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: colors.success, borderRadius: radius.lg }
      ]}/>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});