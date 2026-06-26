import { StyleSheet } from 'react-native';
import { colors, spacing, radius } from './colors';

/** Shared layout + component styles aligned with web globals.css */
export const screen = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black,
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
    borderBottomColor: colors.surfaceAlt,
  },
  backLink: {
    color: colors.cyan,
    fontSize: 16,
    minWidth: 72,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
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
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  label: {
    color: colors.darkGray,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  labelLight: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  bodyText: {
    color: colors.white,
    fontSize: 15,
  },
  metaText: {
    color: colors.darkGray,
    fontSize: 13,
  },
  price: {
    color: colors.cyan,
    fontWeight: '700',
  },
  priceLarge: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  input: {
    backgroundColor: colors.black,
    color: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    marginBottom: spacing.sm,
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    marginBottom: spacing.lg,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  rowCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  emptyText: {
    color: colors.darkGray,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export const select = StyleSheet.create({
  option: {
    borderWidth: 2,
    borderColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.violet,
    backgroundColor: 'rgba(99,102,241,0.12)',
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
    borderColor: colors.surfaceAlt,
    marginRight: spacing.sm,
    backgroundColor: colors.surface,
  },
  active: {
    backgroundColor: colors.violetDark,
    borderColor: colors.violetLight,
  },
  text: {
    fontSize: 13,
    color: colors.darkGray,
  },
  textActive: {
    color: colors.cyan,
    fontWeight: '600',
  },
});

export const packageStyles = StyleSheet.create({
  item: {
    width: '47%',
    borderWidth: 2,
    borderColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  selected: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.1)',
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
    color: colors.white,
  },
  price: {
    color: colors.cyan,
    fontWeight: '700',
  },
});
