import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';
import { t } from '../i18n';

type BadgeTone = 'default' | 'cyan' | 'amber' | 'violet';

type Props = {
  badge: string;
  badgeTone?: BadgeTone;
  title: string;
  onViewAll?: () => void;
  centered?: boolean;
  children: ReactNode;
};

const badgeToneStyle: Record<BadgeTone, object> = {
  default: {},
  cyan: { backgroundColor: 'rgba(6,182,212,0.12)', color: colors.cyanDark },
  amber: { backgroundColor: 'rgba(245,158,11,0.12)', color: colors.amber },
  violet: { backgroundColor: 'rgba(99,102,241,0.12)', color: colors.violetDark },
};

export default function HomeSection({
  badge,
  badgeTone = 'default',
  title,
  onViewAll,
  centered,
  children,
}: Props) {
  const tone = badgeToneStyle[badgeTone];

  return (
    <View style={styles.section}>
      <View style={[styles.head, centered && styles.headCenter]}>
        <View style={centered ? styles.headCopyCenter : undefined}>
          <Text style={[styles.badge, tone]}>{badge}</Text>
          <Text style={[styles.title, centered && styles.titleCenter]}>{title}</Text>
        </View>
        {onViewAll && !centered ? (
          <TouchableOpacity onPress={onViewAll} hitSlop={8}>
            <Text style={styles.link}>{t('viewAll')} →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  headCenter: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headCopyCenter: {
    alignItems: 'center',
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '700',
    color: colors.violetDark,
    backgroundColor: 'rgba(99,102,241,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textTitle,
    letterSpacing: -0.3,
  },
  titleCenter: {
    textAlign: 'center',
  },
  link: {
    color: colors.cyanDark,
    fontSize: 14,
    fontWeight: '600',
  },
});
