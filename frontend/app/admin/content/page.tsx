'use client';

import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ImageUploader from '@/components/ImageUploader';
import ConfirmModal from '@/components/ConfirmModal';
import {
  fetchAdminBanners,
  fetchAdminEvents,
  fetchShopSettings,
  createBanner,
  updateBanner,
  deleteBanner,
  createEvent,
  updateEvent,
  deleteEvent,
  updateBranding,
  AdminBanner,
  AdminEvent,
} from '@/lib/api/admin';
import { resolveMediaUrl } from '@/lib/media-url';
import { useToast } from '@/components/Toast';
import { useAdminLang } from '@/lib/useAdminLang';
import Image from 'next/image';
import AdminLegalTab from '@/components/AdminLegalTab';

type Tab = 'branding' | 'banners' | 'events' | 'legal';

const emptyBanner = (): Partial<AdminBanner> & { title: string; imageUrl: string } => ({
  title: '',
  imageUrl: '',
  linkUrl: '',
  position: 'home_hero',
  sortOrder: 0,
  isActive: true,
});

export default function AdminContentPage() {
  const { t } = useAdminLang();
  const [tab, setTab] = useState<Tab>('branding');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerForm, setBannerForm] = useState(emptyBanner());
  const [editBannerId, setEditBannerId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({ title: '', excerpt: '', content: '', imageUrl: '', isPublished: true, isPinned: false });
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'banner' | 'event'; id: number } | null>(null);
  const { showToast } = useToast();

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [shop, b, e] = await Promise.all([fetchShopSettings(), fetchAdminBanners(), fetchAdminEvents()]);
      setLogoUrl(shop.logoUrl ?? null);
      setFaviconUrl(shop.faviconUrl ?? null);
      setBanners(b);
      setEvents(e);
    } catch {
      showToast('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void reload(); }, [reload]);

  const saveBranding = async () => {
    setSaving(true);
    try {
      await updateBranding({ logoUrl, faviconUrl });
      showToast('Logo saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveBanner = async () => {
    if (!bannerForm.title || !bannerForm.imageUrl) {
      showToast('Title and image required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editBannerId) {
        await updateBanner(editBannerId, bannerForm);
        showToast('Banner updated', 'success');
      } else {
        await createBanner(bannerForm);
        showToast('Banner created', 'success');
      }
      setBannerForm(emptyBanner());
      setEditBannerId(null);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.content) {
      showToast('Title and content required', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: eventForm.title,
        excerpt: eventForm.excerpt || null,
        content: eventForm.content,
        imageUrl: eventForm.imageUrl || null,
        isPublished: eventForm.isPublished,
        isPinned: eventForm.isPinned,
      };
      if (editEventId) {
        await updateEvent(editEventId, payload);
        showToast('Event updated', 'success');
      } else {
        await createEvent(payload);
        showToast('Event published', 'success');
      }
      setEventForm({ title: '', excerpt: '', content: '', imageUrl: '', isPublished: true, isPinned: false });
      setEditEventId(null);
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'banner') await deleteBanner(deleteTarget.id);
      else await deleteEvent(deleteTarget.id);
      showToast('Deleted', 'success');
      await reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <h1 className="page-title">{t('contentTitle')}</h1>
      <p style={{ color: 'var(--dark-gray)', marginBottom: 16 }}>{t('contentDesc')}</p>

      <div className="filter-chips" style={{ marginBottom: 24 }}>
        {(['branding', 'banners', 'events', 'legal'] as Tab[]).map((tabKey) => (
          <button key={tabKey} type="button" className={`chip ${tab === tabKey ? 'active' : ''}`} onClick={() => setTab(tabKey)}>
            {tabKey === 'branding' ? `🏷 ${t('tabBranding')}` : tabKey === 'banners' ? `🖼 ${t('tabBanners')}` : tabKey === 'events' ? `📢 ${t('tabEvents')}` : `📄 ${t('tabLegal')}`}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--dark-gray)' }}>{t('loading')}</p>
      ) : tab === 'branding' ? (
        <div className="card" style={{ maxWidth: 520, padding: 24 }}>
          <h2 className="section-title">{t('shopLogo')}</h2>
          <ImageUploader label="Logo" value={logoUrl} onChange={setLogoUrl} hint="Header မှာ ပြမည့် logo (PNG/JPG, max 3MB)" />
          <ImageUploader label="Favicon (optional)" value={faviconUrl} onChange={setFaviconUrl} />
          {logoUrl && resolveMediaUrl(logoUrl) && (
            <div style={{ marginBottom: 16, padding: 16, background: 'var(--gray)', borderRadius: 8 }}>
              <p style={{ fontSize: 12, marginBottom: 8 }}>Preview:</p>
              <Image src={resolveMediaUrl(logoUrl)!} alt="Logo preview" width={160} height={48} unoptimized style={{ objectFit: 'contain' }} />
            </div>
          )}
          <button type="button" className="btn btn-primary" onClick={saveBranding} disabled={saving}>
            {saving ? t('saving') : t('saveLogo')}
          </button>
        </div>
      ) : tab === 'banners' ? (
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'minmax(280px, 400px) 1fr' }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">{editBannerId ? 'Edit Banner' : 'New Banner'}</h2>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} />
            </div>
            <ImageUploader label="Banner Image" value={bannerForm.imageUrl || null} onChange={(url) => setBannerForm({ ...bannerForm, imageUrl: url ?? '' })} />
            <div className="form-group">
              <label className="form-label">Link URL (optional)</label>
              <input className="form-input" placeholder="/games or https://..." value={bannerForm.linkUrl ?? ''} onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <select className="form-input" value={bannerForm.position} onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}>
                <option value="home_hero">Home Hero (top slider)</option>
                <option value="home_mid">Home Middle (between sections)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Sort</label>
                <input type="number" className="form-input" value={bannerForm.sortOrder ?? 0} onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: Number(e.target.value) })} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24 }}>
                <input type="checkbox" checked={bannerForm.isActive ?? true} onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })} />
                Active
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={saveBanner} disabled={saving}>
                {editBannerId ? 'Update' : 'Create'}
              </button>
              {editBannerId && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditBannerId(null); setBannerForm(emptyBanner()); }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <h2 className="section-title">All Banners ({banners.length})</h2>
            {banners.length === 0 ? (
              <p className="empty-text">No banners yet</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Preview</th><th>Title</th><th>Position</th><th>Active</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {banners.map((b) => (
                      <tr key={b.id}>
                        <td>
                          {resolveMediaUrl(b.imageUrl) && (
                            <Image src={resolveMediaUrl(b.imageUrl)!} alt="" width={80} height={40} unoptimized style={{ objectFit: 'cover', borderRadius: 4 }} />
                          )}
                        </td>
                        <td>{b.title}</td>
                        <td>{b.position === 'home_hero' ? 'Hero' : 'Mid'}</td>
                        <td>{b.isActive ? '✅' : '—'}</td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditBannerId(b.id); setBannerForm({ ...b }); }}>Edit</button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteTarget({ type: 'banner', id: b.id })}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : tab === 'events' ? (
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'minmax(280px, 420px) 1fr' }}>
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title">{editEventId ? 'Edit Event' : 'New Event Post'}</h2>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Short excerpt</label>
              <input className="form-input" value={eventForm.excerpt} onChange={(e) => setEventForm({ ...eventForm, excerpt: e.target.value })} />
            </div>
            <ImageUploader label="Cover Image" value={eventForm.imageUrl || null} onChange={(url) => setEventForm({ ...eventForm, imageUrl: url ?? '' })} />
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-input" rows={8} value={eventForm.content} onChange={(e) => setEventForm({ ...eventForm, content: e.target.value })} placeholder="Event details, promo info..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input type="checkbox" checked={eventForm.isPublished} onChange={(e) => setEventForm({ ...eventForm, isPublished: e.target.checked })} />
              Published
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <input type="checkbox" checked={eventForm.isPinned} onChange={(e) => setEventForm({ ...eventForm, isPinned: e.target.checked })} />
              Pin to top
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-primary" onClick={saveEvent} disabled={saving}>
                {editEventId ? 'Update' : 'Publish'}
              </button>
              {editEventId && (
                <button type="button" className="btn btn-outline" onClick={() => { setEditEventId(null); setEventForm({ title: '', excerpt: '', content: '', imageUrl: '', isPublished: true, isPinned: false }); }}>
                  Cancel
                </button>
              )}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <h2 className="section-title">All Events ({events.length})</h2>
            {events.length === 0 ? (
              <p className="empty-text">No events yet</p>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.isPinned ? '📌 ' : ''}{ev.title}</td>
                        <td>{ev.isPublished ? 'Live' : 'Draft'}</td>
                        <td>{ev.publishedAt.slice(0, 10)}</td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditEventId(ev.id); setEventForm({ title: ev.title, excerpt: ev.excerpt ?? '', content: ev.content, imageUrl: ev.imageUrl ?? '', isPublished: ev.isPublished, isPinned: ev.isPinned }); }}>Edit</button>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => setDeleteTarget({ type: 'event', id: ev.id })}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : tab === 'legal' ? (
        <AdminLegalTab />
      ) : null}

      <ConfirmModal
        open={deleteTarget != null}
        title="Delete?"
        message="This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
