import React from 'react';
import { Image, StyleSheet, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { resolveShopLogoSource } from '../lib/branding';
import CircleImage from './CircleImage';

type Props = {
  shopLogoUrl?: string | null;
  variant?: 'default' | 'mark';
  style?: StyleProp<ImageStyle>;
  size?: number;
};

export default function BrandLogo({ shopLogoUrl, variant = 'default', style, size }: Props) {
  const source = resolveShopLogoSource(shopLogoUrl);
  const isMark = variant === 'mark';
  const flat = StyleSheet.flatten(style);
  const markSize = size ?? (typeof flat?.width === 'number' ? flat.width : 96);

  if (isMark) {
    const isRemote = typeof source === 'object' && source !== null && 'uri' in source;
    const uri = isRemote ? (source as { uri: string }).uri : undefined;
    const localSource = isRemote ? undefined : source;
    return (
      <CircleImage
        size={markSize}
        uri={uri}
        source={localSource}
        borderColor="rgba(255, 255, 255, 0.35)"
        borderWidth={2}
        style={style as StyleProp<ViewStyle> | undefined}
      />
    );
  }

  return (
    <Image
      source={source}
      style={[styles.default, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="MVPMMSHOP"
    />
  );
}

const styles = StyleSheet.create({
  default: { width: 140, height: 40 },
});
