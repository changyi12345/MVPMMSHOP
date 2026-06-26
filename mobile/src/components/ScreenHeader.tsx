import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { screen } from '../theme/screenStyles';
import { t } from '../i18n';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  style?: ViewStyle;
}

export default function ScreenHeader({ title, onBack, right, style }: Props) {
  return (
    <View style={[screen.headerBar, style]}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={screen.backLink}>← {t('back')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={screen.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  spacer: { width: 72 },
});
