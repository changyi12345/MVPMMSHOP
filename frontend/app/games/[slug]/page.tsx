'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { useToast } from '@/components/Toast';
import PlayerInfoForm from '@/components/PlayerInfoForm';
import MlbbGameDetail from '@/components/MlbbGameDetail';
import { isMlbbUnified } from '@/lib/mlbb-regions';
import { ApiGameDetail, fetchGame, fetchGames, formatMmk, validatePlayer } from '@/lib/api/games';
import { groupGamesForDisplay } from '@/lib/groupGames';
import {
  addToCart,
  buyNow,
  formatPlayerInfo,
  playerIdFromFields,
  serverIdFromFields,
} from '@/lib/cart-store';

function StandardGameDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { showToast } = useToast();
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

  const selectedPackage = game?.packages.find((p) => p.id === selectedPackageId);

  const buildCartItem = () => {
    if (!game || !selectedPackage) return null;
    return {
      type: 'direct_topup' as const,
      name: `${game.name} — ${selectedPackage.name}`,
      price: selectedPackage.unitPrice,
      g2bulkGameCode: game.code,
      gameCode: game.code,
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

  if (loading) return <p>Loading...</p>;
  if (!game) notFound();

  return (
    <>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 32 }}>
        {game.imageUrl ? (
          <Image src={game.imageUrl} alt={game.name} width={120} height={120} className="game-card-image" unoptimized />
        ) : (
          <div style={{ fontSize: 80 }}>🎮</div>
        )}
        <div>
          <h1 className="page-title" style={{ marginBottom: 8 }}>{game.name}</h1>
          <span className="badge badge-blue">Direct Top-Up</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Step 1: Enter Player Info</h2>
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
        <h2 className="section-title">Step 2: Select Package</h2>
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
      </div>

      {selectedPackage && validated && (
        <div className="card">
          <h2 className="section-title">Step 3: Order Summary</h2>
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
  );
}

export default function GameDetailPage({ params }: { params: { slug: string } }) {
  const [mlbbImageUrl, setMlbbImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isMlbbUnified(params.slug)) {
      fetchGames()
        .then((games) => {
          const grouped = groupGamesForDisplay(games);
          const mlbb = grouped.find((g) => g.isMlbbUnified);
          setMlbbImageUrl(mlbb?.imageUrl ?? null);
        })
        .catch(() => setMlbbImageUrl(null));
    }
  }, [params.slug]);

  return (
    <PageLayout>
      <div className="container">
        <Link href="/games" style={{ color: 'var(--dark-gray)', marginBottom: 24, display: 'inline-block' }}>
          ← Back to Games
        </Link>

        {isMlbbUnified(params.slug) ? (
          <MlbbGameDetail imageUrl={mlbbImageUrl} />
        ) : (
          <StandardGameDetail slug={params.slug} />
        )}
      </div>
    </PageLayout>
  );
}
