import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { fetchVouchers } from '../api/vouchers';
import { colors } from '../theme/colors';
import { screen } from '../theme/screenStyles';
import VoucherCard from '../components/VoucherCard';
import NetworkErrorView from '../components/NetworkErrorView';
import ScreenHeader from '../components/ScreenHeader';
import { useApiLoad } from '../hooks/useApiLoad';
import { subscribeLang, t } from '../i18n';

interface Props {
  categoryId: number;
  categoryTitle: string;
  onBack: () => void;
  onVoucherPress: (id: number) => void;
}

export default function VoucherCategoryScreen({
  categoryId,
  categoryTitle,
  onBack,
  onVoucherPress,
}: Props) {
  const [search, setSearch] = useState('');
  const [, langBump] = useState(0);
  useEffect(() => subscribeLang(() => langBump((n) => n + 1)), []);

  const loader = useCallback(() => fetchVouchers(categoryId), [categoryId]);
  const { data: products, loading, error, reload } = useApiLoad(loader, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title.toLowerCase().includes(q));
  }, [products, search]);

  return (
    <View style={screen.root}>
      <ScreenHeader title={categoryTitle} onBack={onBack} />
      <ScrollView contentContainerStyle={screen.content}>
        <TextInput
          style={screen.searchInput}
          placeholder={`🔍 ${t('searchInCategory')}`}
          placeholderTextColor={colors.darkGray}
          value={search}
          onChangeText={setSearch}
        />
        {loading ? (
          <ActivityIndicator color={colors.violet} size="large" />
        ) : error && products.length === 0 ? (
          <NetworkErrorView message={error} onRetry={reload} />
        ) : filtered.length === 0 ? (
          <Text style={screen.emptyText}>{t('noVouchersFound')}</Text>
        ) : (
          filtered.map((v) => (
            <VoucherCard key={v.id} voucher={v} onPress={() => onVoucherPress(v.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
