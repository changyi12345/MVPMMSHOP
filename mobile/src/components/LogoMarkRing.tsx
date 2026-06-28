import React from 'react';
import { View, StyleSheet } from 'react-native';
import BrandLogo from './BrandLogo';

type Props = {
  shopLogoUrl?: string | null;
  size?: number;
};

/** Web `.logo-mark` + `.logo-ring` + `.logo-ring-glow` — circular logo in ring */
export default function LogoMarkRing({ shopLogoUrl, size = 40 }: Props) {
  const ring = size + 8;
  const glow = size + 16;
  return (
    <View style={[styles.wrap, { width: glow, height: glow }]}>
      <View style={[styles.glow, { width: glow, height: glow, borderRadius: glow / 2 }]} />
      <View style={[styles.ring, { width: ring, height: ring, borderRadius: ring / 2 }]} />
      <BrandLogo shopLogoUrl={shopLogoUrl} variant="mark" size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
