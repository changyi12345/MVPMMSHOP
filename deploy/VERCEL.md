# Vercel — Frontend Deploy

Deploy the Next.js shop from the **`frontend/`** folder (monorepo root is not the app root).

## 1. Import from GitHub

1. Open [vercel.com/new](https://vercel.com/new)
2. **Import** `changyi12345/MVPMMSHOP`
3. **Root Directory** → **Edit** → select **`frontend`**
4. Framework: **Next.js** (auto-detected)
5. Build Command: `npm run build` (default)
6. Output: default (Vercel handles Next.js)

## 2. Environment variables

Add these under **Settings → Environment Variables** (Production + Preview):

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://api.rankage.shop` (or Railway URL when API moves) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `NEXT_PUBLIC_GA_ID` | Optional Google Analytics ID |

Redeploy after changing env vars.

## 3. Custom domain (rankage.shop)

1. **Project → Settings → Domains** → Add `rankage.shop` and `www.rankage.shop`
2. At your DNS host, point to Vercel (A/CNAME as shown in Vercel dashboard)
3. Remove or stop the cPanel Node app for `rankage.shop` to avoid conflicts

## 4. Backend CORS

Ensure API `CORS_ORIGINS` includes:

```
https://rankage.shop,https://www.rankage.shop,https://your-project.vercel.app
```

## 5. Google OAuth

In Google Cloud Console → OAuth client → **Authorized JavaScript origins**:

- `https://rankage.shop`
- `https://www.rankage.shop`
- `https://your-project.vercel.app` (for preview deploys)

## CLI (optional)

```bash
cd frontend
npx vercel login
npx vercel link
npx vercel --prod
```

Set env vars in the Vercel dashboard or `vercel env add`.

## Notes

- `server.js` is for **cPanel only** — Vercel uses the default Next.js runtime.
- `frontend/vercel.json` pins framework/build settings for this folder.
