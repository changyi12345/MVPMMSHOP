import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { fetchVoucherCategories, VoucherCategory } from '../api/vouchers';
import { colors, spacing, radius } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import VoucherCategoryCard from '../components/VoucherCategoryCard';
import NetworkErrorView from '../components/NetworkErrorView';
import AppHeader from '../components/AppHeader';
import { useApiLoad } from '../hooks/useApiLoad';
import { subscribeLang, t } from '../i18n';

interface Props {
  onCategoryPress: (categoryId: number, title: string) => void;
  onNotificationsPress?: () => void;
  notificationRefreshKey?: number;
}

export default function VouchersScreen({
  onCategoryPress,
  onNotificationsPress,
  notificationRefreshKey,
}: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [, langBump] = useState(0);
  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const loader = useCallback(() => fetchVoucherCategories(), []);
  const { data: categories, loading, error, reload } = useApiLoad(loader, [] as VoucherCategory[]);

  const chips = useMemo(
    () => [
      { id: 'all', label: t('filterAll') },
      ...categories.map((c) => ({ id: String(c.id), label: c.title })),
    ],
    [categories],
  );

  const filtered = useMemo(() => {
    let list = categories;
    if (categoryFilter !== 'all') {
      const id = Number(categoryFilter);
      list = list.filter((c) => c.id === id);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [categories, categoryFilter, search]);

  return (
    <View style={screen.root}>
      <AppHeader
        title={`🎁 ${t('vouchers')}`}
        onNotificationsPress={onNotificationsPress}
        notificationRefreshKey={notificationRefreshKey}
        onLangChange={() => langBump((n) => n + 1)}
      />
      <ScrollView contentContainerStyle={screen.content}>
        <TextInput
          style={screen.searchInput}
          placeholder={`🔍 ${t('searchVouchers')}`}
          placeholderTextColor={colors.darkGray}
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {chips.map((chip) => (
            <TouchableOpacity
              key={chip.id}
              style={[styles.chip, categoryFilter === chip.id && styles.chipActive]}
              onPress={() => setCategoryFilter(chip.id)}
            >
              <Text
                style={[styles.chipText, categoryFilter === chip.id && styles.chipTextActive]}
                numberOfLines={1}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.violet} size="large" />
        ) : error && categories.length === 0 ? (
          <NetworkErrorView message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <Text style={screen.emptyText}>{t('noVouchersFound')}</Text>
        ) : (
          filtered.map((c) => (
            <VoucherCategoryCard
              key={c.id}
              category={c}
              onPress={() => onCategoryPress(c.id, c.title)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chipsRow: { marginBottom: spacing.md, flexGrow: 0 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
    backgroundColor: colors.surface,
    marginRight: 8,
    maxWidth: 160,
  },
  chipActive: {
    backgroundColor: colors.violet,
    borderColor: colors.violet,
  },
  chipText: { color: colors.darkGray, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.white },
});
