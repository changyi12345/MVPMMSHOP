import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ShopBanner } from '../api/content';
import { DEFAULT_HERO_BANNERS, isDefaultBanner, resolveBannerSource } from '../lib/branding';
import { colors, radius, spacing } from '../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_H = Math.round(SCREEN_W * 0.52);

interface Props {
  banners: ShopBanner[];
  onBannerPress?: (banner: ShopBanner) => void;
}

export default function BannerCarousel({ banners, onBannerPress }: Props) {
  const slides = useMemo(
    () => (banners.length > 0 ? banners : DEFAULT_HERO_BANNERS),
    [banners],
  );
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<ShopBanner>>(null);
  const promo = slides.some(isDefaultBanner);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length <= 1) return;
      const i = ((next % slides.length) + slides.length) % slides.length;
      setIndex(i);
      listRef.current?.scrollToIndex({ index: i, animated: true });
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => goTo(index + 1), 6000);
    return () => clearInterval(id);
  }, [slides.length, index, goTo]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i >= 0 && i < slides.length) setIndex(i);
  };

  const renderItem = ({ item }: { item: ShopBanner }) => {
    const source = resolveBannerSource(item);
    const inner = source ? (
      <Image source={source} style={styles.image} resizeMode="cover" />
    ) : null;

    if (onBannerPress) {
      return (
        <TouchableOpacity
          style={styles.slide}
          activeOpacity={0.92}
          onPress={() => onBannerPress(item)}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          {inner}
        </TouchableOpacity>
      );
    }

    return <View style={styles.slide}>{inner}</View>;
  };

  return (
    <View style={[styles.wrap, promo && styles.wrapPromo]}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(b) => String(b.id)}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
      />
      {slides.length > 1 && (
        <View style={[styles.dots, promo && styles.dotsPromo]}>
          {slides.map((b, i) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.dot, i === index && styles.dotActive]}
              onPress={() => goTo(i)}
              accessibilityRole="button"
              accessibilityLabel={`${b.title} ${i + 1}/${slides.length}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.backgroundTop,
  },
  wrapPromo: {
    backgroundColor: colors.backgroundTop,
  },
  slide: {
    width: SCREEN_W,
    height: BANNER_H,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  dotsPromo: {
    paddingBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.lightGray,
  },
  dotActive: {
    backgroundColor: colors.violet,
    width: 20,
  },
});
