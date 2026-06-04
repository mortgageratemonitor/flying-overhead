# ✈ Flying Overhead — Live Flight Tracker

A real-time ADS-B flight tracker that displays aircraft flying near any location in the world. Built as a static web app hosted on GitHub Pages, backed by a lightweight proxy server on Render.com.

![Flying Overhead Dashboard](https://img.shields.io/badge/status-live-4ade80?style=flat-square) ![GitHub Pages](https://img.shields.io/badge/frontend-GitHub%20Pages-22d3ee?style=flat-square) ![Render](https://img.shields.io/badge/proxy-Render.com-7c3aed?style=flat-square) ![AirLabs](https://img.shields.io/badge/data-AirLabs%20ADS--B-f59e0b?style=flat-square)

---

## Features

### Nearest Aircraft Panel
- Full-width hero panel showing the closest aircraft to your location
- Airline wordmark logo for 20+ major carriers, with styled badge fallback for all others
- Departure and arrival airports displayed with both IATA code and full airport name
- Live stats: altitude, speed (knots + mph), heading (degrees + compass direction), distance (miles), status, and country
- Aircraft category approximation (Wide-body Jet, Narrow-body Jet, Regional Jet, Cargo/Freighter, Business Jet, Private Piston, Military)
- Auto-generated narrative summary describing the flight in plain English

### Aircraft Overhead Table
- Sortable list of all aircraft within your selected radius
- Columns: Callsign, Airline (hover for full name), Type, Aircraft Category, Origin (hover for full airport name), Destination (hover for full airport name), Altitude, Speed in kts (hover for MPH), Heading °, Direction (N/NE/E etc.), Distance in miles, Status
- Color-coded type badges: Commercial, Private, Military, Unknown
- Click any row to select it and update the Nearest Aircraft panel

### Radar Scope
- Live radar display showing all aircraft as dots with heading tails
- Tails on each dot indicate the direction that aircraft is flying
- Rotatable orientation — use arrow buttons to rotate in 45° increments so your current facing direction is at the top
- Click any dot to open a popup showing callsign, airline, aircraft category, altitude, speed (kts + mph), heading, distance, route, and an aircraft photo pulled from Planespotters.net
- Color coding: cyan = selected aircraft, green = all others

### Radar Stats
- Total aircraft tracked, airborne count, and on-ground count displayed below the radar

### Location Search
- Search by any city, address, street, or landmark — powered by OpenStreetMap Nominatim (free, no API key required)
- Coordinates auto-populate after search
- Manual lat/lon entry also supported

### Search Radius
- Dropdown with 5 mi, 15 mi, and 30 mi options
- 5 mi is ideal for seeing only what is directly overhead

### Auto-Refresh
- Automatically refreshes every 5 minutes to conserve AirLabs API quota
- Pauses when the browser tab is not visible (no wasted API calls)
- Progress bar in the header counts down to the next refresh
- Manual refresh button available at any time

### API Status Panel
- Live health indicator in the header showing the status of all external APIs
- Tracks: AirLabs (flight data), Nominatim (geocoding), Planespotters (aircraft photos), Airline Logos
- Shows last request time and error messages for any failures or timeouts
- Graceful error handling with descriptive messages if any API fails or times out

### Legend
- Collapsible legend in the header explaining all badge types, status indicators, and radar symbols

### Date & Time
- Live clock in the header showing day, date, and 12-hour time with seconds (e.g. `Wednesday, Jun 4 · 4:32:07 PM`)

### Scrolling Ticker
- Bottom ticker bar showing a live summary of all tracked aircraft

---

## Architecture

```
GitHub Pages          Render.com Proxy        External APIs
─────────────         ────────────────         ─────────────────────
index.html      ───►  server.js          ───►  AirLabs (flight data)
(static site)         (Node/Express)           
                                          ───►  Nominatim (geocoding)
                                               [direct from browser]
                                          ───►  Planespotters (photos)
                                               [direct from browser]
```

The proxy is required for AirLabs because:
1. Browsers block direct requests to the AirLabs API (CORS policy)
2. The AirLabs API key must be kept server-side and never exposed in frontend code

Nominatim and Planespotters are called directly from the browser since both support CORS and require no secret keys.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla) |
| Proxy server | Node.js + Express |
| Flight data | AirLabs ADS-B API (free tier) |
| Geocoding | OpenStreetMap Nominatim (free, no key) |
| Aircraft photos | Planespotters.net API (free, no key) |
| Airline logos | Embedded SVG wordmarks (no external dependency) |
| Frontend hosting | GitHub Pages |
| Proxy hosting | Render.com (free tier) |

---

## API Keys & Accounts Required

### AirLabs (required)
AirLabs provides the live ADS-B flight data.

1. Sign up for a free account at [airlabs.co](https://airlabs.co)
2. Free tier includes **1,000 API calls per month**
3. After signing up, copy your API key from the dashboard
4. The app refreshes every 5 minutes and only when the tab is visible, keeping usage well within the free limit for normal personal use

### Everything Else (no account needed)
- **OpenStreetMap Nominatim** — free, no key, used for location search
- **Planespotters.net** — free, no key, used for aircraft photos in the radar popup
- **Airline logos** — embedded SVGs, no external requests

---

## Deployment Guide

### Step 1 — Fork or clone this repository

```bash
git clone https://github.com/YOUR_USERNAME/flying-overhead.git
cd flying-overhead
```

### Step 2 — Deploy the proxy to Render.com

The proxy lives in `server.js` and handles all AirLabs API communication.

1. Push this repo to GitHub if you haven't already
2. Go to [render.com](https://render.com) and sign in (or sign up — free)
3. Click **New → Web Service**
4. Connect your GitHub account and select this repository
5. Configure the service:

| Setting | Value |
|---|---|
| **Runtime** | Node |
| **Root Directory** | *(leave blank if files are in repo root, or set to subfolder name)* |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

6. Add **Environment Variables** under the Settings tab:

| Key | Value |
|---|---|
| `AIRLABS_API_KEY` | Your AirLabs API key from Step 1 |

7. Click **Deploy**. Once deployed, copy your Render URL — it will look like:
   ```
   https://flying-overhead.onrender.com
   ```

> **Note:** Free Render instances spin down after 15 minutes of inactivity. The first request after idle may take 20–30 seconds while the instance wakes up. Subsequent requests are fast.

### Step 3 — Deploy the frontend to GitHub Pages

1. In your GitHub repo, go to **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Set branch to `main` and folder to `/ (root)`
4. Click **Save**
5. Your site will be live at:
   ```
   https://YOUR_USERNAME.github.io/flying-overhead
   ```

### Step 4 — Connect the frontend to your proxy

1. Open your GitHub Pages site
2. A proxy configuration modal will appear automatically on first load
3. Enter your Render URL (e.g. `https://flying-overhead.onrender.com`)
4. Click **Save & Connect**

The proxy URL is saved in your browser's `localStorage` — it never leaves your device and is not stored anywhere else. If you need to update it later, click the **⚙** gear icon in the top-right corner of the app.

---

## Project File Structure

```
flying-overhead/
├── index.html          # Full frontend — layout, styles, and JavaScript
├── server.js           # Render.com proxy — AirLabs API relay with CORS headers
├── package.json        # Node.js dependencies (express, node-fetch)
└── README.md           # This file
```

---

## API Rate Limits & Usage Tips

| API | Free Limit | How This App Uses It |
|---|---|---|
| AirLabs | 1,000 calls/month | 1 call per manual refresh or 5-min auto-refresh |
| Nominatim | Reasonable use | 1 call per location search |
| Planespotters | Unlimited | 1 call per radar dot click |
| Airline logos | N/A — embedded | No network requests |

**Tips to stay within the AirLabs free tier:**
- Use the 5 mi radius when you just want to see what's directly overhead — fewer results, same 1 API call
- The app pauses auto-refresh when you switch to another tab
- At 5-minute intervals with normal usage (a few hours per week), 1,000 calls per month is very comfortable

---

## Supported Airline Logos

The following airlines have embedded SVG wordmark logos. All other airlines display a styled color badge using their brand colors.

| ICAO | Airline |
|---|---|
| AAL | American Airlines |
| DAL | Delta Air Lines |
| UAL | United Airlines |
| SWA | Southwest Airlines |
| ASA | Alaska Airlines |
| JBU | JetBlue |
| FFT | Frontier Airlines |
| NKS | Spirit Airlines |
| ACA | Air Canada |
| ROU | Air Canada Rouge |
| BAW | British Airways |
| DLH | Lufthansa |
| AFR | Air France |
| KLM | KLM Royal Dutch Airlines |
| UAE | Emirates |
| QFA | Qantas |
| EJA | NetJets |
| JSX | JSX Air |
| SKW | SkyWest Airlines |
| FDY | Southern Airways Express |

---

## Troubleshooting

**App stuck on "FETCHING…"**
- Check the **API Status** panel in the header for error details
- Verify your Render proxy URL is correct via the ⚙ gear icon
- If Render is on the free tier, the first request after 15 min idle takes 20–30 seconds — wait and try again

**"Server error 500" in the console**
- Your proxy is running but AirLabs is returning an error
- Check your Render logs (Render dashboard → your service → Logs tab)
- Most common cause: `AIRLABS_API_KEY` environment variable is missing or incorrect

**Location search not working**
- Nominatim requires an internet connection and occasionally rate-limits heavy usage
- Try a more specific search (e.g. "Phoenix, Arizona" instead of "Phoenix")
- As a fallback, enter coordinates manually in the LAT/LON fields

**No aircraft showing up**
- Try increasing the radius to 30 mi
- Some areas have low traffic — try refreshing at a different time
- Verify your location coordinates are correct

**Radar popup photo not loading**
- Planespotters may not have a photo for that specific aircraft registration
- The popup will display "No photo available" in this case — this is expected

---

## License

MIT — free to use, modify, and deploy for personal use.

---

*Built with the help of Claude by Anthropic.*
