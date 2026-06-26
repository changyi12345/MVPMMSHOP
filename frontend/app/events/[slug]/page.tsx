'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { fetchEventBySlug, ShopEvent } from '@/lib/api/content';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const [event, setEvent] = useState<ShopEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    fetchEventBySlug(params.slug)
      .then(setEvent)
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (missing) notFound();
  if (loading || !event) {
    return (
      <PageLayout>
        <div className="container" style={{ padding: 48, textAlign: 'center' }}>{t('loading')}</div>
      </PageLayout>
    );
  }

  const img = resolveMediaUrl(event.imageUrl);

  return (
    <PageLayout>
      <div className="container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 48 }}>
        <Link href="/events" style={{ color: 'var(--dark-gray)', marginBottom: 24, display: 'inline-block' }}>
          ← {t('backToEvents')}
        </Link>
        {img && (
          <div style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
            <Image src={img} alt={event.title} width={720} height={360} unoptimized style={{ width: '100%', height: 'auto' }} />
          </div>
        )}
        <h1 className="page-title">{event.title}</h1>
        <p style={{ color: 'var(--dark-gray)', marginBottom: 24 }}>
          {new Date(event.publishedAt).toLocaleDateString()}
          {event.isPinned ? ` · 📌 ${t('pinned')}` : ''}
        </p>
        {event.excerpt && (
          <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 24, color: 'var(--black)' }}>{event.excerpt}</p>
        )}
        <div className="card" style={{ padding: 24, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
          {event.content}
        </div>
      </div>
    </PageLayout>
  );
}
