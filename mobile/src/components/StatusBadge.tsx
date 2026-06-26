import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor, getStatusTextColor } from '../data/mockData';
import { tStatus } from '../i18n';
import { radius, spacing } from '../theme/colors';

export default function StatusBadge({ status }: { status: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={[styles.text, { color: getStatusTextColor(status) }]}>{tStatus(status)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
