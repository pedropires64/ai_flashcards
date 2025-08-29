// components/ui/AppCard.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadow } from '../../theme';

export default function AppCard({ children, dark=false, style }) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: dark ? colors.bgCard : colors.bgCardLight,
          borderColor: dark ? colors.borderDark : colors.borderLight,
        },
        shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing(2),
  },
});