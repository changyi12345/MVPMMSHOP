import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ApiGame, formatMmk } from '../data/mockData';
import { colors, spacing, radius, shadows } from '../theme/colors';
import { t } from '../i18n';
import CircleImage from './CircleImage';

interface GameCardProps {
  game: ApiGame;
  onPress: () => void;
  compact?: boolean;
  home?: boolean;
}

export default function GameCard({ game, onPress, compact, home }: GameCardProps) {
  const size = compact ? 72 : 96;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compact, home && styles.home]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {game.imageUrl ? (
          <CircleImage uri={game.imageUrl} size={size} />
        ) : (
          <CircleImage
            size={size}
            fallback={<Text style={styles.fallbackIcon}>🎮</Text>}
          />
        )}
      </View>
      <Text style={styles.name} numberOfLines={compact ? 2 : 3}>{game.name}</Text>
      {home && compact && game.minPriceMmk != null && (
        <Text style={styles.priceHome}>{formatMmk(game.minPriceMmk)}+</Text>
      )}
      {home && compact && (
        <View style={styles.homeAction}>
          <Text style={styles.homeActionText}>{t('topUpNow')}</Text>
        </View>
      )}
      {!compact && (
        <Text style={styles.type}>
          {game.isMlbbUnified ? t('allRegions') : t('directTopUp')}
        </Text>
      )}
      {!compact && !home && (
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{t('topUpNow')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderBrand,
    ...shadows.sm,
  },
  compact: { width: 148, marginRight: spacing.md, marginBottom: 0 },
  home: {
    borderTopWidth: 3,
    borderTopColor: colors.cyan,
  },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 96,
  },
  imageWrapCompact: { minHeight: 72 },
  fallbackIcon: { fontSize: 36 },
  name: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4, textAlign: 'center' },
  priceHome: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cyanDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  homeAction: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  homeActionText: { fontSize: 11, fontWeight: '700', color: colors.violetDark },
  type: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  cta: {
    marginTop: spacing.sm,
    backgroundColor: colors.violet,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
  },
  ctaText: { color: colors.white, fontWeight: '700', fontSize: 13 },
});
