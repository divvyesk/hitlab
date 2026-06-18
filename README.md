# HitLab AI

**Predict the next Billboard hit.**
[Live demo →](https://hitlab.up.railway.app)

<img width="1440" height="714" alt="image" src="https://github.com/user-attachments/assets/4fb91a51-75fa-4722-853d-59ee60117f2d" />
<br/><br/>
HitLab is a full-stack AI studio that estimates how long a song might stay at **#1 on the Billboard Hot 100**, based on real chart data and audio features from 1,000+ historical hits. Configure a track’s sonic DNA, run a prediction, explore similar chart-toppers, and experiment with what-if scenarios — all in a Spotify-inspired interface.

---

## Features

### Prediction Studio
- **22-feature input form** — genre, song structure, BPM, energy, danceability, happiness, loudness, acousticness, length, and more
- **Contextual help** — clickable explanations for technical fields (song structure codes, Spotify metrics, genre taxonomy)
- **Demo presets** — one-click profiles (Pop Anthem, Dance Hit, Acoustic Ballad, Hip-Hop Smash, Summer Hit) that auto-run predictions
- **Tier forecast** — `SHORT` (1–2 weeks), `MODERATE` (3–4 weeks), or `SUSTAINED` (5+ weeks) with probability breakdown
- **Hit probability meter** — weighted score across tier probabilities
- **Song DNA radar** — compare your track against median Billboard #1 averages

### Why This Prediction?
- Top feature importances from the trained Random Forest model, showing which characteristics drove the result

### Similar Billboard Hits
- k-nearest-neighbor search over the production feature space
- Surfaces the 5 closest historical #1 songs with similarity scores

### What-If Studio
- Live sliders for energy and intro length
- Instant re-prediction to see how small changes shift chart potential

### Chart Intelligence
- Analytics dashboard exploring genre dominance, tempo trends, and the energy–popularity sweet spot across decades of Billboard data

### Auth
- Email/password sign-up and login
- JWT session cookies
- User accounts stored in MongoDB Atlas

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Recharts |
| UI | Radix UI, Lucide icons |
| Backend | Next.js App Router API routes, Zod validation |
| Auth | bcryptjs, jose (JWT) |
| Database | MongoDB Atlas |
| ML | Python 3, scikit-learn, pandas, joblib |
| Model | Random Forest classifier (3-tier HitTier) + Nearest Neighbors similarity |
| Deployment | Railway (Docker — Next.js + ML in one service) |

---

## How It Works

```
User input → Next.js API → Python ML service → Tier + probabilities
                ↓
         MongoDB Atlas (users)
                ↓
         Similar songs (k-NN over 1,177 Billboard #1 hits)
```

The model is trained on the **Billboard #1 hits dataset** (~1,177 songs) using leakage-free features selected from a curated data dictionary. Chart longevity (`weeks at #1`) is bucketed into three tiers and predicted from sonic and structural characteristics — not from post-release chart data.

Tier assignment uses **expected chart weeks** derived from class probabilities, calibrated against historical tier means for more balanced predictions than raw argmax.

---

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+ (for local ML worker)
- MongoDB Atlas database (or local MongoDB)

### Install & run

```bash
git clone https://github.com/YOUR_USERNAME/hitlab.git
cd hitlab
npm install
cp .env.example .env
```

Set in `.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | MongoDB connection string (include database name, e.g. `/hitlab`) |
| `AUTH_SECRET` | Random secret for JWT sessions |

For local predictions, install Python dependencies:

```bash
pip install -r ml/requirements.txt
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional — run the ML HTTP service separately:

```bash
cd ml && python server.py
# then set ML_SERVICE_URL=http://localhost:8000 in .env
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## ML Pipeline

Training data lives in `src/data/billboard_hits.csv`. The pipeline:

1. **`ml/build_dataset.py`** — normalize columns, export UI defaults
2. **`ml/train.py`** — train Random Forest with 5-fold stratified CV, save artifacts
3. **`ml/build_similarity.py`** — build k-NN similarity index
4. **`ml/inference.py`** — production prediction with expected-weeks tier logic

Retrain:

```bash
pip install -r ml/requirements.txt
python ml/train.py
python ml/build_similarity.py
```

Artifacts are written to `ml/artifacts/`.

---

## Deployment

HitLab is deployed on **[Railway](https://railway.app)** as a single Docker service (Next.js + Python ML):

- **Dockerfile** at repo root builds the app and bundles the ML service
- **`scripts/railway-start.sh`** starts ML internally, then Next.js
- **MongoDB Atlas** handles persistence (external to Railway)

Required environment variables:

| Variable | Required |
|---|---|
| `DATABASE_URL` | Yes |
| `AUTH_SECRET` | Yes |

See [`railway.toml`](railway.toml) and [`Dockerfile`](Dockerfile) for build configuration.

**Live site:** [https://hitlab.up.railway.app](https://hitlab.up.railway.app)

---

## Project Structure

```
hitlab/
├── src/
│   ├── app/              # Pages & API routes
│   ├── components/       # UI (studio, auth, analytics, landing)
│   └── lib/              # Prediction, auth, ML client, helpers
├── ml/
│   ├── artifacts/        # Trained model, preprocessor, similarity index
│   ├── inference.py      # Prediction logic
│   ├── server.py         # ML HTTP service
│   └── train.py          # Model training
├── src/data/             # Billboard dataset & data dictionary
├── Dockerfile            # Unified Railway deployment
└── scripts/              # Railway startup script
```

---

## Data

Predictions are grounded in the [**Billboard Hot 100 #1 hits dataset**](https://docs.google.com/spreadsheets/d/1j1AUgtMnjpFTz54UdXgCKZ1i4bNxFjf01ImJ-BqBEt0/edit?usp=sharing) with expert-assigned genres (CDR taxonomy), Spotify audio features, and hand-coded song structure labels. See `src/data/data_dictionary.csv` for field definitions.

---

## Acknowledgments

Built with chart data and feature definitions from the Billboard hits research dataset. Genre labels follow the CDR (Chris Dalla Riva) taxonomy used in the source material.
