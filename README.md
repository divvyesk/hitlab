# HitLab

AI-powered Billboard hit prediction studio built with Next.js, MongoDB Atlas, and a Python ML service.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Set `DATABASE_URL` in `.env` (MongoDB Atlas, database name `/hitlab`, URL-encode password special chars).

Predictions use a local Python worker by default. Requires Python 3.11+ and `pip install -r ml/requirements.txt`.

Optional ML HTTP mode:

```bash
cd ml && python server.py
# set ML_SERVICE_URL=http://localhost:8000 in .env
```

---

## Deploy on Railway (recommended: one service)

Deploy **everything** (Next.js + ML) in a **single Railway service** from the repo root.

### Why your `ml/` deploy failed

Railway only saw `artifacts/` because key files were **not pushed to GitHub** yet (`server.py`, `Dockerfile`, `railway.toml`). Railpack then could not detect a build. The unified root Dockerfile avoids that.

### Steps

1. **Commit and push all code** (especially `ml/server.py`, `Dockerfile`, `scripts/railway-start.sh`, `railway.toml`):

```bash
git add .
git commit -m "Add Railway unified deployment"
git push
```

2. **Railway** → New Project → Deploy from GitHub repo.

3. **Do not set a root directory** — leave it as `/` (repo root).

4. Railway uses [`railway.toml`](railway.toml) + [`Dockerfile`](Dockerfile), which:
   - Builds Next.js
   - Installs Python + ML dependencies
   - Starts ML on internal port `8000`
   - Starts Next.js on Railway's `PORT`

5. **Environment variables** on the web service:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | MongoDB Atlas connection string |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |

`ML_SERVICE_URL` is set automatically inside the container (`http://127.0.0.1:8000`). You do not need to set it for the one-service deploy.

6. **MongoDB Atlas** → Network Access → allow `0.0.0.0/0` so Railway can connect.

7. First deploy may take several minutes (Next.js build + ~25MB model load).

### Verify

- Open your Railway public URL
- Sign up / log in
- Run a prediction

---

## Deploy on Railway (optional: two services)

If you prefer splitting web and ML:

| Service | Root directory | Config |
|---|---|---|
| Web | `/` | [`railway.toml`](railway.toml) with Dockerfile **or** Nixpacks |
| ML | `/ml` | [`ml/railway.toml`](ml/railway.toml) + [`ml/Dockerfile`](ml/Dockerfile) |

**Important:** All `ml/*.py`, `ml/Dockerfile`, and `ml/railway.toml` must be committed and pushed. Set **`ML_SERVICE_URL`** on the web service to the ML service's public URL.

For the ML service alone, Railway must use the **Dockerfile** builder (configured in `ml/railway.toml`), not Railpack auto-detect.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm start` | Production server |
