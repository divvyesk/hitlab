FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN pip3 install --no-cache-dir --break-system-packages -r ml/requirements.txt

ENV NEXT_TELEMETRY_DISABLED=1
ENV ML_SERVICE_URL=http://127.0.0.1:8000
ENV ML_INTERNAL_PORT=8000
ENV HOSTNAME=0.0.0.0

RUN npm run build
RUN chmod +x scripts/railway-start.sh

CMD ["scripts/railway-start.sh"]
