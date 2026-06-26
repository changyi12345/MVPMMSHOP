import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  ApiGameDetail,
  fetchGame,
  formatMmk,
  validatePlayer,
} from '../data/mockData';
import { MLBB_REGIONS, MlbbRegion } from '../data/mlbb-regions';
import { GameFieldDefinition } from '../utils/game-fields';
import { colors, spacing, radius } from '../theme/colors';
import { screen, chip, packageStyles } from '../theme/screenStyles';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { addToCart, buyNow, playerIdFromFields, serverIdFromFields } from '../lib/cart-store';

interface Props {
  imageUrl: string | null;
  onBack: () => void;
  onCheckout: () => void;
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: GameFieldDefinition;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === 'select' && field.options) {
    return (
      <View style={styles.fieldBlock}>
        <Text style={styles.label}>{field.label} *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {field.options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[chip.base, value === opt.value && chip.active]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[chip.text, value === opt.value && chip.textActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{field.label} *</Text>
      <TextInput
        style={screen.input}
        placeholder={`Enter ${field.label}`}
        placeholderTextColor={colors.darkGray}
        keyboardType={field.name.toLowerCase().includes('id') ? 'numeric' : 'default'}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

export default function MlbbDetailScreen({ imageUrl, onBack, onCheckout }: Props) {
  const [selectedRegion, setSelectedRegion] = useState<MlbbRegion | null>(null);
  const [game, setGame] = useState<ApiGameDetail | null>(null);
  const [loadingGame, setLoadingGame] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedRegion) {
      setGame(null);
      return;
    }

    setLoadingGame(true);
    setValidated(false);
    setPlayerName('');
    setSelectedPackageId(null);
    setError('');

    fetchGame(selectedRegion.gameCode)
      .then((data) => {
        setGame(data);
        const initial: Record<string, string> = {};
        data.playerFields.forEach((f) => { initial[f.name] = ''; });
        setFieldValues(initial);
      })
      .catch(() => {
        setGame(null);
        setError('Game data load မအောင်မြင်ပါ');
      })
      .finally(() => setLoadingGame(false));
  }, [selectedRegion]);

  const handleRegionSelect = (region: MlbbRegion) => {
    setSelectedRegion(region);
  };

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    setValidated(false);
    setPlayerName('');
    setError('');
  };

  const handleValidate = async () => {
    if (!game || !selectedRegion) return;
    setValidating(true);
    setError('');
    try {
      const result = await validatePlayer(selectedRegion.gameCode, fieldValues);
      setValidated(true);
      setPlayerName(result.playerName);
    } catch (err) {
      setValidated(false);
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const buildCartItem = () => {
    if (!game || !selectedRegion || !selectedPackage) return null;
    return {
      type: 'direct_topup' as const,
      name: `MLBB ${selectedRegion.label} — ${selectedPackage.name}`,
      price: selectedPackage.unitPrice,
      g2bulkGameCode: selectedRegion.gameCode,
      gameCode: selectedRegion.gameCode,
      catalogueName: selectedPackage.name,
      packageName: selectedPackage.name,
      playerId: playerIdFromFields(fieldValues),
      serverId: serverIdFromFields(fieldValues),
      playerName: playerName || undefined,
    };
  };

  const selectedPackage = game?.packages.find((p) => p.id === selectedPackageId);

  return (
    <View style={screen.root}>
      <ScreenHeader title="Mobile Legends" onBack={onBack} />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.gameHeader}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.gameImage} resizeMode="cover" />
          ) : (
            <Text style={styles.fallbackIcon}>⚔️</Text>
          )}
          <Text style={styles.gameName}>Mobile Legends: Bang Bang</Text>
        </View>

        {/* Step 1: Country / Region */}
        <View style={screen.card}>
          <Text style={styles.stepTitle}>1. Region ရွေးချယ်ပါ</Text>
          <Text style={styles.stepHint}>Player account ရှိတဲ့ region ကို ရွေးပါ</Text>
          <View style={styles.regionGrid}>
            {MLBB_REGIONS.map((region) => (
              <TouchableOpacity
                key={region.id}
                style={[
                  styles.regionCard,
                  selectedRegion?.id === region.id && styles.regionCardActive,
                ]}
                onPress={() => handleRegionSelect(region)}
                activeOpacity={0.8}
              >
                <Text style={styles.regionFlag}>{region.flag}</Text>
                <Text style={[
                  styles.regionLabel,
                  selectedRegion?.id === region.id && styles.regionLabelActive,
                ]}>
                  {region.labelMm}
                </Text>
                {region.note ? (
                  <Text style={styles.regionNote} numberOfLines={2}>{region.note}</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedRegion && loadingGame && (
          <ActivityIndicator color={colors.violet} size="large" style={{ marginVertical: spacing.lg }} />
        )}

        {selectedRegion && !loadingGame && game && (
          <>
            <View style={styles.regionBadge}>
              <Text style={styles.regionBadgeText}>
                {selectedRegion.flag} {selectedRegion.label} — {selectedRegion.gameCode}
              </Text>
            </View>

            {/* Step 2: Player Info */}
            <View style={screen.card}>
              <Text style={styles.stepTitle}>2. Player Info</Text>

              {game.fieldNotes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>ℹ️ {game.fieldNotes}</Text>
                </View>
              ) : null}

              {game.playerFields.map((field) => (
                <DynamicField
                  key={field.name}
                  field={field}
                  value={fieldValues[field.name] ?? ''}
                  onChange={(v) => handleFieldChange(field.name, v)}
                />
              ))}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title={validating ? 'Validating...' : '🔍 Validate Player'}
                variant="blue"
                onPress={handleValidate}
                disabled={validating}
                fullWidth
              />

              {validated && playerName ? (
                <Text style={styles.success}>✅ Player: {playerName}</Text>
              ) : null}
            </View>

            {/* Step 3: Packages */}
            <View style={screen.card}>
              <Text style={styles.stepTitle}>3. Package ရွေးချယ်ပါ</Text>
              {game.packages.length === 0 ? (
                <Text style={styles.emptyPackages}>Package မရှိသေးပါ</Text>
              ) : (
                <View style={styles.packageGrid}>
                  {game.packages.map((pkg) => (
                    <TouchableOpacity
                      key={pkg.id}
                      style={[
                        packageStyles.item,
                        selectedPackageId === pkg.id && packageStyles.selected,
                        !validated && styles.packageDisabled,
                      ]}
                      onPress={() => validated && setSelectedPackageId(pkg.id)}
                      disabled={!validated}
                    >
                      <Text style={packageStyles.name}>{pkg.name}</Text>
                      <Text style={packageStyles.price}>{formatMmk(pkg.unitPrice)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {selectedPackage && validated && selectedRegion && (
        <View style={styles.footer}>
          <Text style={styles.footerRegion}>{selectedRegion.flag} {selectedRegion.label}</Text>
          <Text style={styles.footerPrice}>
            {selectedPackage.name} — {formatMmk(selectedPackage.unitPrice)}
          </Text>
          <View style={styles.footerBtns}>
            <Button
              title="Add to Cart"
              variant="outline"
              onPress={() => {
                const item = buildCartItem();
                if (item) {
                  addToCart(item);
                  onBack();
                }
              }}
              fullWidth
            />
            <Button
              title="Buy Now"
              onPress={() => {
                const item = buildCartItem();
                if (item) {
                  buyNow(item);
                  onCheckout();
                }
              }}
              fullWidth
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.md },
  gameHeader: { alignItems: 'center', marginBottom: spacing.md },
  gameImage: { width: 100, height: 100, borderRadius: radius.sm, marginBottom: spacing.sm },
  fallbackIcon: { fontSize: 64, marginBottom: spacing.sm },
  gameName: { fontSize: 18, fontWeight: '700', color: colors.white },
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, color: colors.white },
  stepHint: { fontSize: 13, color: colors.darkGray, marginBottom: spacing.md },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  regionCard: {
    width: '47%',
    borderWidth: 2,
    borderColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  regionCardActive: {
    borderColor: colors.cyan,
    backgroundColor: 'rgba(6,182,212,0.1)',
  },
  regionFlag: { fontSize: 32, marginBottom: 4 },
  regionLabel: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: colors.white },
  regionLabelActive: { color: colors.cyan },
  regionNote: { fontSize: 11, color: colors.darkGray, textAlign: 'center', marginTop: 4 },
  regionBadge: {
    backgroundColor: colors.violetDark,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  regionBadgeText: { color: colors.cyan, fontSize: 13, fontWeight: '600' },
  notesBox: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  notesText: { fontSize: 13, color: colors.darkGray },
  fieldBlock: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.white },
  errorText: { color: colors.red, marginBottom: spacing.sm, fontSize: 14 },
  success: { color: colors.green, marginTop: spacing.sm, fontWeight: '500' },
  emptyPackages: { color: colors.darkGray, textAlign: 'center', padding: spacing.lg },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  packageDisabled: { opacity: 0.5 },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  footerRegion: { fontSize: 13, color: colors.darkGray, textAlign: 'center', marginBottom: 4 },
  footerPrice: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center', color: colors.cyan },
  footerBtns: { gap: spacing.sm },
});
