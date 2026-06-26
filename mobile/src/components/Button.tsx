import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'blue';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  fullWidth?: boolean;
  small?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  small = false,
}: ButtonProps) {
  const bg: Record<Variant, string> = {
    primary: colors.violet,
    secondary: colors.cyan,
    outline: 'transparent',
    blue: colors.violetDark,
  };

  const textColor: Record<Variant, string> = {
    primary: colors.white,
    secondary: colors.black,
    outline: colors.cyan,
    blue: colors.white,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: bg[variant] },
        variant === 'outline' && styles.outline,
        fullWidth && styles.full,
        small && styles.small,
        disabled && styles.disabled,
      ]}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor[variant] }, small && styles.smallText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.cyan,
  },
  full: { width: '100%' },
  small: { paddingVertical: 8, paddingHorizontal: spacing.md },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '600' },
  smallText: { fontSize: 14 },
});
