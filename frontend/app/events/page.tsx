'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShopPageShell from '@/components/ShopPageShell';
import { fetchPublishedEvents, ShopEvent } from '@/lib/api/content';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

export default function EventsPage() {
  const [events, setEvents] = useState<ShopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetchPublishedEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ShopPageShell
      title={t('eventsNews')}
      emoji="📢"
      badge="News"
      subtitle={t('eventsDesc')}
    >
      {loading ? (
        <p className="shop-muted">{t('loading')}</p>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📢</div>
          <p className="empty-text">{t('noEvents')}</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => {
            const img = resolveMediaUrl(event.imageUrl);
            return (
              <Link key={event.id} href={`/events/${event.slug}`} className="event-card">
                <div className="event-card-image-wrap">
                  {img ? (
                    <Image src={img} alt={event.title} fill className="event-card-image" unoptimized />
                  ) : (
                    <div className="event-card-placeholder">📢</div>
                  )}
                  {event.isPinned && <span className="event-pin">📌 {t('pinned')}</span>}
                </div>
                <div className="event-card-body">
                  <h2 className="event-card-title">{event.title}</h2>
                  <p className="event-card-excerpt">{event.excerpt ?? event.content.slice(0, 120)}</p>
                  <span className="event-card-date">{new Date(event.publishedAt).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </ShopPageShell>
  );
}
