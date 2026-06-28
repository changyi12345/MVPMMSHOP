import React from 'react';
import { View, StyleSheet } from 'react-native';
import BrandLogo from './BrandLogo';

type Props = {
  shopLogoUrl?: string | null;
};

/** Matches web `AuthBrandLogo` — wide horizontal logo on auth screens */
export default function AuthBrandLogo({ shopLogoUrl }: Props) {
  return (
    <View style={styles.wrap}>
      <BrandLogo shopLogoUrl={shopLogoUrl} style={styles.logo} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 200,
    height: 72,
  },
});
