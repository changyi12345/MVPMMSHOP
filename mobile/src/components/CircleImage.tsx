import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  size: number;
  uri?: string | null;
  source?: ImageSourcePropType;
  fallback?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  borderWidth?: number;
};

/** Circular image — overflow hidden + cover for sharp logos/icons in round frames. */
export default function CircleImage({
  size,
  uri,
  source,
  fallback,
  style,
  borderColor = 'rgba(99, 102, 241, 0.15)',
  borderWidth = 1,
}: Props) {
  const radius = size / 2;
  const hasImage = Boolean(source ?? uri);

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor,
          borderWidth,
        },
        style,
      ]}
    >
      {hasImage ? (
        <Image
          source={source ?? { uri: uri! }}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      ) : (
        fallback ?? (
          <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
            <Text style={{ fontSize: size * 0.4 }}>🎮</Text>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
});
