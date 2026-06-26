'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShopEvent } from '@/lib/api/content';
import { resolveMediaUrl } from '@/lib/media-url';
import { useLang } from '@/lib/useLang';

interface Props {
  events: ShopEvent[];
}

export default function EventsSection({ events }: Props) {
  const { t } = useLang();

  if (events.length === 0) return null;

  return (
    <section className="home-section">
      <div className="home-section-head">
        <div>
          <span className="home-section-badge home-section-badge--amber">📢 News</span>
          <h2 className="home-section-title">{t('eventsNews')}</h2>
        </div>
        <Link href="/events" className="home-section-link">{t('viewAll')} →</Link>
      </div>
      <div className="events-grid">
        {events.slice(0, 4).map((event) => {
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
                <h3 className="event-card-title">{event.title}</h3>
                <p className="event-card-excerpt">{event.excerpt ?? event.content.slice(0, 100)}</p>
                <span className="event-card-date">{new Date(event.publishedAt).toLocaleDateString()}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
