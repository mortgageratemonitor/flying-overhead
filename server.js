const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.OPENSKY_CLIENT_ID;
const CLIENT_SECRET = process.env.OPENSKY_CLIENT_SECRET;

const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';
const OPENSKY_BASE = 'https://opensky-network.org/api';

// --- Token cache ---
let cachedToken = null;
let tokenExpiresAt = 0;

async function getBearerToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 30000) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET env vars are required');
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token fetch failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 1800) * 1000;
  return cachedToken;
}

// --- CORS middleware ---
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- Health check ---
app.get('/', (req, res) => {
  res.json({ status: 'NearbyAir proxy running', authenticated: !!(CLIENT_ID && CLIENT_SECRET) });
});

// --- States proxy: /flights?lamin=&lamax=&lomin=&lomax= ---
app.get('/flights', async (req, res) => {
  const { lamin, lamax, lomin, lomax } = req.query;
  if (!lamin || !lamax || !lomin || !lomax) {
    return res.status(400).json({ error: 'Missing bounding box params: lamin, lamax, lomin, lomax' });
  }

  try {
    const token = await getBearerToken();
    const url = `${OPENSKY_BASE}/states/all?lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`;

    const apiRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (apiRes.status === 429) {
      return res.status(429).json({ error: 'OpenSky rate limit hit. Try again in a few seconds.' });
    }
    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({ error: `OpenSky API error: ${text}` });
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NearbyAir proxy listening on port ${PORT}`);
});
