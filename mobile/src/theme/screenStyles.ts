import { StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from './colors';

/** Shared layout + component styles aligned with web globals.css */
export const screen = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backLink: {
    color: colors.cyan,
    fontSize: 16,
    minWidth: 72,
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  heroCard: {
    backgroundColor: colors.violetDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.25)',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  labelLight: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.text,
    fontSize: 15,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  price: {
    color: colors.cyan,
    fontWeight: '700',
  },
  priceLarge: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export const select = StyleSheet.create({
  option: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.violet,
    backgroundColor: 'rgba(99,102,241,0.08)',
  },
  optionDisabled: {
    opacity: 0.45,
  },
});

export const chip = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  active: {
    backgroundColor: colors.violetDark,
    borderColor: colors.violetLight,
  },
  text: {
    fontSize: 13,
    color: colors.textMuted,
  },
  textActive: {
    color: colors.white,
    fontWeight: '600',
  },
});

export const packageStyles = StyleSheet.create({
  item: {
    width: '47%',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.08)',
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    color: colors.text,
  },
  price: {
    color: colors.cyan,
    fontWeight: '700',
  },
});
