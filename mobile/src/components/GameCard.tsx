import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { ApiGame } from '../data/mockData';
import { colors, spacing, radius } from '../theme/colors';

interface GameCardProps {
  game: ApiGame;
  onPress: () => void;
  compact?: boolean;
}

export default function GameCard({ game, onPress, compact }: GameCardProps) {
  const size = compact ? 64 : 96;

  return (
    <TouchableOpacity style={[styles.card, compact && styles.compact]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        {game.imageUrl ? (
          <Image
            source={{ uri: game.imageUrl }}
            style={{ width: size, height: size, borderRadius: radius.sm }}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.fallbackIcon}>🎮</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={compact ? 2 : 3}>{game.name}</Text>
      {!compact && (
        <Text style={styles.type}>
          {game.isMlbbUnified ? 'All Regions' : 'Direct Top-Up'}
        </Text>
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
    borderColor: colors.surfaceAlt,
  },
  compact: { width: 148, marginRight: spacing.md, marginBottom: 0 },
  imageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    minHeight: 96,
  },
  imageWrapCompact: { minHeight: 64 },
  fallbackIcon: { fontSize: 40 },
  name: { fontSize: 16, fontWeight: '600', color: colors.white, marginBottom: 4 },
  type: { fontSize: 13, color: colors.darkGray },
});
