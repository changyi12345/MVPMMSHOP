'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import PlayerInfoForm from '@/components/PlayerInfoForm';
import { useToast } from '@/components/Toast';
import { MLBB_REGIONS, MlbbRegion } from '@/lib/mlbb-regions';
import { ApiGameDetail, fetchGame, formatMmk, validatePlayer } from '@/lib/api/games';
import {
  addToCart,
  buyNow,
  formatPlayerInfo,
  playerIdFromFields,
  serverIdFromFields,
} from '@/lib/cart-store';

interface Props {
  imageUrl: string | null;
}

export default function MlbbGameDetail({ imageUrl }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
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

  const handleFieldChange = (name: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
    setValidated(false);
    setPlayerName('');
    setError('');
  };

  const handleValidate = async () => {
    if (!selectedRegion) return;
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

  const selectedPackage = game?.packages.find((p) => p.id === selectedPackageId);

  const buildCartItem = () => {
    if (!game || !selectedPackage || !selectedRegion) return null;
    return {
      type: 'direct_topup' as const,
      name: `${game.name} (${selectedRegion.label}) — ${selectedPackage.name}`,
      price: selectedPackage.unitPrice,
      g2bulkGameCode: selectedRegion.gameCode,
      gameCode: selectedRegion.gameCode,
      catalogueName: selectedPackage.name,
      packageName: selectedPackage.name,
      playerId: playerIdFromFields(fieldValues),
      serverId: serverIdFromFields(fieldValues),
      playerName: playerName || undefined,
      playerInfo: formatPlayerInfo(fieldValues, playerName),
    };
  };

  const handleAddToCart = () => {
    const item = buildCartItem();
    if (!item) return;
    addToCart({ ...item, quantity: 1 });
    showToast('Added to cart', 'success');
  };

  const handleBuyNow = () => {
    const item = buildCartItem();
    if (!item) return;
    buyNow({ ...item, quantity: 1 });
    router.push('/checkout');
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
        {imageUrl ? (
          <Image src={imageUrl} alt="Mobile Legends" width={120} height={120} className="game-card-image" unoptimized />
        ) : (
          <div style={{ fontSize: 80 }}>⚔️</div>
        )}
        <div>
          <h1 className="page-title" style={{ marginBottom: 8 }}>Mobile Legends: Bang Bang</h1>
          <span className="badge badge-blue">All Regions</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Step 1: Region ရွေးချယ်ပါ</h2>
        <p style={{ color: 'var(--dark-gray)', marginBottom: 16, fontSize: 14 }}>
          Player account ရှိတဲ့ region ကို ရွေးပါ
        </p>
        <div className="region-grid">
          {MLBB_REGIONS.map((region) => (
            <button
              key={region.id}
              type="button"
              className={`region-card ${selectedRegion?.id === region.id ? 'selected' : ''}`}
              onClick={() => setSelectedRegion(region)}
            >
              <span className="region-flag">{region.flag}</span>
              <span className="region-label">{region.labelMm}</span>
              {region.note && <span className="region-note">{region.note}</span>}
            </button>
          ))}
        </div>
      </div>

      {selectedRegion && loadingGame && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {selectedRegion && !loadingGame && game && (
        <>
          <div className="region-badge">
            {selectedRegion.flag} {selectedRegion.label} — {selectedRegion.gameCode}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 className="section-title">Step 2: Enter Player Info</h2>
            <PlayerInfoForm
              fields={game.playerFields}
              notes={game.fieldNotes}
              values={fieldValues}
              onChange={handleFieldChange}
              onValidate={handleValidate}
              validating={validating}
              validated={validated}
              playerName={playerName}
              error={error}
            />
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <h2 className="section-title">Step 3: Select Package</h2>
            {game.packages.length === 0 ? (
              <p className="empty-text">Package မရှိသေးပါ</p>
            ) : (
              <div className="package-grid">
                {game.packages.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    className={`package-item ${selectedPackageId === pkg.id ? 'selected' : ''}`}
                    onClick={() => validated && setSelectedPackageId(pkg.id)}
                    disabled={!validated}
                  >
                    <div className="package-name">{pkg.name}</div>
                    <div className="package-price">{formatMmk(pkg.unitPrice)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedPackage && validated && (
            <div className="card">
              <h2 className="section-title">Order Summary</h2>
              <p><strong>Region:</strong> {selectedRegion.flag} {selectedRegion.label}</p>
              <p><strong>Package:</strong> {selectedPackage.name}</p>
              <p><strong>Price:</strong> <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatMmk(selectedPackage.unitPrice)}</span></p>
              <p><strong>Player:</strong> {playerName}</p>
              {game.playerFields.map((f) =>
                fieldValues[f.name] ? (
                  <p key={f.name}><strong>{f.label}:</strong> {fieldValues[f.name]}</p>
                ) : null,
              )}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" onClick={handleAddToCart}>🛒 Add to Cart</button>
                <button type="button" className="btn btn-primary" onClick={handleBuyNow}>Buy Now</button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
