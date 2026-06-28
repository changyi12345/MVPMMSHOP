import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';
import LogoMarkRing from '../components/LogoMarkRing';

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
      <LogoMarkRing size={96} />
      <ActivityIndicator size="large" color={colors.violet} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundTop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: { marginTop: spacing.lg },
});
