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
import { GameFieldDefinition } from '../utils/game-fields';
import { colors, spacing, radius } from '../theme/colors';
import { screen, chip, packageStyles } from '../theme/screenStyles';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { addToCart, buyNow, playerIdFromFields, serverIdFromFields } from '../lib/cart-store';

interface Props {
  slug: string;
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
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

export default function GameDetailScreen({ slug, onBack, onCheckout }: Props) {
  const [game, setGame] = useState<ApiGameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [validated, setValidated] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGame(slug)
      .then((data) => {
        setGame(data);
        const initial: Record<string, string> = {};
        data.playerFields.forEach((f) => { initial[f.name] = ''; });
        setFieldValues(initial);
      })
      .catch(() => setGame(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    setValidated(false);
    setPlayerName('');
    setError('');
  };

  const handleValidate = async () => {
    if (!game) return;
    setValidating(true);
    setError('');
    try {
      const result = await validatePlayer(game.code, fieldValues);
      setValidated(true);
      setPlayerName(result.playerName);
    } catch (err) {
      setValidated(false);
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <View style={[screen.root, styles.center]}>
        <ActivityIndicator color={colors.violet} size="large" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={[screen.root, styles.center]}>
        <Text style={{ color: colors.white }}>Game not found</Text>
        <Button title="Back" onPress={onBack} />
      </View>
    );
  }

  const selectedPackage = game.packages.find((p) => p.id === selectedPackageId);

  return (
    <View style={screen.root}>
      <ScreenHeader title={game.name} onBack={onBack} />

      <ScrollView style={styles.content}>
        <View style={styles.gameHeader}>
          {game.imageUrl ? (
            <Image source={{ uri: game.imageUrl }} style={styles.gameImage} resizeMode="cover" />
          ) : (
            <Text style={styles.fallbackIcon}>🎮</Text>
          )}
        </View>

        <View style={screen.card}>
          <Text style={styles.stepTitle}>1. Player Info</Text>

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

        <View style={screen.card}>
          <Text style={styles.stepTitle}>2. Select Package</Text>
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
        </View>
      </ScrollView>

      {selectedPackage && validated && (
        <View style={styles.footer}>
          <Text style={styles.footerPrice}>Total: {formatMmk(selectedPackage.unitPrice)}</Text>
          <View style={styles.footerBtns}>
            <Button
              title="Add to Cart"
              variant="outline"
              onPress={() => {
                addToCart({
                  type: 'direct_topup',
                  name: `${game.name} — ${selectedPackage.name}`,
                  price: selectedPackage.unitPrice,
                  g2bulkGameCode: game.code,
                  gameCode: game.code,
                  catalogueName: selectedPackage.name,
                  packageName: selectedPackage.name,
                  playerId: playerIdFromFields(fieldValues),
                  serverId: serverIdFromFields(fieldValues),
                  playerName: playerName || undefined,
                });
                onBack();
              }}
              fullWidth
            />
            <Button
              title="Buy Now"
              onPress={() => {
                buyNow({
                  type: 'direct_topup',
                  name: `${game.name} — ${selectedPackage.name}`,
                  price: selectedPackage.unitPrice,
                  g2bulkGameCode: game.code,
                  gameCode: game.code,
                  catalogueName: selectedPackage.name,
                  packageName: selectedPackage.name,
                  playerId: playerIdFromFields(fieldValues),
                  serverId: serverIdFromFields(fieldValues),
                  playerName: playerName || undefined,
                });
                onCheckout();
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.black },
  content: { flex: 1, padding: spacing.md },
  gameHeader: { alignItems: 'center', marginBottom: spacing.md },
  gameImage: { width: 120, height: 120, borderRadius: radius.sm },
  fallbackIcon: { fontSize: 64 },
  stepTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.md, color: colors.white },
  notesBox: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  notesText: { fontSize: 13, color: colors.darkGray },
  fieldBlock: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '500', marginBottom: spacing.sm, color: colors.white },
  chipScroll: { flexGrow: 0 },
  errorText: { color: colors.red, marginBottom: spacing.sm, fontSize: 14 },
  success: { color: colors.green, marginTop: spacing.sm, fontWeight: '500' },
  packageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  packageDisabled: { opacity: 0.5 },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  footerPrice: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center', color: colors.cyan },
  footerBtns: { gap: spacing.sm },
});
