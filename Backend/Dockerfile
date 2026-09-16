# TalentForge backend — Node 22 + python3 (python3 lets the built-in
# judge fallback run Python solutions on hosted deploys).
FROM node:22-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]