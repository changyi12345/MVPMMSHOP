import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 1500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MVPMMSHOP</Text>
      <Text style={styles.subtitle}>Game Top Up</Text>
      <ActivityIndicator size="large" color={colors.cyan} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.violetLight,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
    marginBottom: spacing.xl,
  },
  loader: { marginTop: spacing.md },
});
