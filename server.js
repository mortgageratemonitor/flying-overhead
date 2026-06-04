const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;
const AIRLABS_API_KEY = process.env.AIRLABS_API_KEY;

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
  res.json({ status: 'NearbyAir proxy running', authenticated: !!AIRLABS_API_KEY });
});

// --- Flights proxy: /flights?lamin=&lamax=&lomin=&lomax= ---
app.get('/flights', async (req, res) => {
  const { lamin, lamax, lomin, lomax } = req.query;
  if (!lamin || !lamax || !lomin || !lomax) {
    return res.status(400).json({ error: 'Missing bounding box params: lamin, lamax, lomin, lomax' });
  }

  if (!AIRLABS_API_KEY) {
    return res.status(500).json({ error: 'AIRLABS_API_KEY environment variable is not set' });
  }

  try {
    // AirLabs bbox format: SW lat, SW lng, NE lat, NE lng
    const bbox = `${lamin},${lomin},${lamax},${lomax}`;
    const url = `https://airlabs.co/api/v9/flights?bbox=${bbox}&api_key=${AIRLABS_API_KEY}`;

    const apiRes = await fetch(url);

    if (apiRes.status === 429) {
      return res.status(429).json({ error: 'AirLabs rate limit hit. Try again shortly.' });
    }
    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({ error: `AirLabs API error: ${text}` });
    }

    const data = await apiRes.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'AirLabs API error' });
    }

    // Normalize AirLabs response to match what the frontend expects
    const flights = (data.response || []).map(f => ({
      icao: f.hex || '',
      callsign: f.flight_iata || f.flight_icao || f.hex || '',
      country: f.flag || '—',
      lat: f.lat,
      lon: f.lng,
      altM: f.alt || 0,
      onGround: f.status === 'landed' || f.alt === 0,
      speed: f.speed ? f.speed / 3.6 : 0, // km/h to m/s to match previous unit
      heading: f.dir || 0,
      vertRate: f.v_speed || 0,
      depIata: f.dep_iata || '',
      arrIata: f.arr_iata || '',
      airlineIata: f.airline_iata || '',
      airlineIcao: f.airline_icao || '',
      status: f.status || '',
    }));

    res.json({ flights });
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`NearbyAir proxy listening on port ${PORT}`);
});
