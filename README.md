# ✈ Flying Overhead — Live Flight Tracker

A real-time ADS-B flight tracker displaying aircraft near any location in the world. Static frontend on GitHub Pages, backed by a lightweight proxy on Render.com.

![Flying Overhead Dashboard](https://img.shields.io/badge/status-live-4ade80?style=flat-square) ![GitHub Pages](https://img.shields.io/badge/frontend-GitHub%20Pages-22d3ee?style=flat-square) ![Render](https://img.shields.io/badge/proxy-Render.com-7c3aed?style=flat-square) ![AirLabs](https://img.shields.io/badge/data-AirLabs%20ADS--B-f59e0b?style=flat-square)

---

## Features

### Nearest Aircraft Panel
- Full-width hero panel showing the closest aircraft to your location
- Embedded SVG wordmark logos for 30+ airlines, with styled badge fallback for all others
- Departure and arrival airports with both IATA code and full airport name
- Live stats: altitude, speed (kts + mph), heading (degrees + compass direction), distance (miles), status, country (full name), and aircraft category
- Aircraft category approximation: Wide-body Jet, Narrow-body Jet, Regional Jet, Cargo/Freighter, Business Jet, Private Piston, Military
- Narrative summary describing the selected flight in plain English
- **Story line** — a second line below the narrative that surfaces contextual observations each refresh (e.g. traffic surges, circling aircraft, dominant headings, altitude extremes)

### Aircraft Overhead Table
- Sortable list of all aircraft within your selected radius
- Columns: Callsign, Airline (hover for full name), Type, Aircraft Category, Origin (hover for full airport name), Destination (hover for full airport name), Altitude, Speed in kts (hover for MPH), Heading °, Direction, Distance in miles, Status
- Click any **callsign** to open an aircraft photo popup from Planespotters.net
- Color-coded type badges: Commercial, Private, Military, Unknown

### Radar Scope
- Live radar showing all aircraft as dots with heading tails
- Tails indicate direction of travel
- **Rotatable orientation** — use the ◁ ▷ buttons to rotate in 45° increments so your current facing direction is at the top instead of always North. Cardinal labels (N/E/S/W) reposition accordingly
- Click any dot to open a popup: callsign, airline, aircraft category, altitude, speed (kts + mph), heading, distance, route, and aircraft photo from Planespotters.net
- Color coding: cyan = selected aircraft, green = all others
- Stats below radar: Total, Airborne, On Ground

### Legend
- Collapsible panel in the header (⊞ LEGEND button) explaining all badge types, status indicators, and radar symbols
- Sections: Aircraft Type, Flight Status, Radar Scope

### Flight History & Streaks
- Collapsible panel below the Aircraft Overhead table
- Header strip always shows: flights today, peak count with time, and your daily streak
- Expands to show: mini bar chart of today's refreshes, notable sightings (military, cargo, low altitude, unusual registrations), and all-time bests
- Powered entirely by browser localStorage — no server required
- **Data persists** across page refreshes and browser restarts on the same device and browser
- **Data does not transfer** to other devices or browsers — history and streaks are local only
- To reset history, clear your browser's localStorage for this site (DevTools → Application → Local Storage)

### Stories
- After each refresh, a contextual observation appears below the narrative in the Nearest Aircraft panel
- Surfaces: military detections, circling aircraft, traffic surges or lulls, dominant heading corridors, altitude extremes, cargo concentrations
- Updates automatically on every refresh

### Alerts (Automatic)
- Toast notifications slide in from the top-right when something notable is detected:
  - ★ Military aircraft enters your radius
  - ↓ Aircraft below 3,000 ft (airborne)
  - ↑ Aircraft count jumps by 5+ in one refresh
  - 🌐 Aircraft with an unusual country registration
- Queued if multiple fire at once — each displays for 5 seconds then dismisses

### Location Search
- Search by city, address, street, or landmark — powered by OpenStreetMap Nominatim (free, no key)
- Manual lat/lon entry also supported

### Share & Bookmark
- The **⤴ SHARE** button in the header copies a direct URL encoding your current lat, lon, and radius as query parameters (e.g. `?lat=33.5387&lon=-112.3418&radius=48`)
- Opening that URL on any device automatically loads the saved location and triggers a fetch — no re-entry needed
- The URL also updates automatically whenever you search or refresh, so your browser bookmark always stays current

### Alert Controls
- The **⚠ ALERTS** dropdown in the header lets you mute individual alert types independently
- Four toggles: Military Aircraft, Low Altitude, Traffic Surge, Unusual Registration
- Mute state is saved in localStorage and persists across sessions

### Search Radius
- 5 mi, 15 mi, and 30 mi options
- 5 mi is ideal for seeing only what is directly overhead

### Auto-Refresh
- Refreshes every 5 minutes to conserve API quota
- Pauses when the browser tab is not visible
- Progress bar counts down in the header
- Manual refresh available anytime
- **Smart timeout handling** — auto-refresh allows 35 seconds for the proxy to respond (accommodating Render free tier cold starts), while manual refresh uses a 12-second timeout for faster feedback
- If an auto-refresh times out, a clear "PROXY WAKING UP" message is shown with context-appropriate guidance rather than a generic error

### API Status Panel
- Live health indicator in the header for all external APIs
- Tracks: AirLabs, Nominatim, Planespotters, Airline Logos
- Shows last request time and error messages on failure or timeout

### Flights Today Counter
- Live count of total flights tracked today, displayed in the header to the left of the date

### Date & Time
- Live clock: full day, full month, date, and 12-hour time with seconds (e.g. `Wednesday, June 4 · 4:32:07 PM`)
- Header bar order: Date/Time · ✈ Today · Status · Refresh In · API Status · Legend · Alerts · ⤴ Share · ⚙ Settings

---

## Why Military Aircraft May Not Appear

If you live near a military base and can see or hear aircraft overhead that don't show up in the tracker, this is expected behavior — not a bug.

**ADS-B is a civilian system.** Commercial aircraft are legally required to broadcast their position via ADS-B. Military aircraft are explicitly exempt and most choose not to broadcast at all. Fighter jets, in particular, use encrypted military transponder systems (Mode 5 IFF) that civilian ADS-B receivers and APIs like AirLabs cannot decode.

**What you may occasionally see:** Transport and tanker aircraft (C-17, KC-135, KC-46) sometimes broadcast because they operate in shared civilian airspace. Some military training aircraft appear intermittently. REACH and RCH callsigns (Air Mobility Command) are the most commonly visible military flights.

**What you will not see:** Fighter jets and other tactical aircraft on training sorties. These operate in restricted military airspace, use non-civilian transponder modes, and are intentionally off the civilian tracking grid.

The military aircraft alert in this app will fire when transports or tankers with active transponders enter your radius — but tactical aircraft will rarely if ever appear, by design.

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

The proxy is required because browsers block direct AirLabs API requests (CORS), and the API key must stay server-side.

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
| History/streaks | Browser localStorage |
| Frontend hosting | GitHub Pages |
| Proxy hosting | Render.com (free tier) |

---

## API Keys & Accounts Required

### AirLabs (required)
1. Sign up at [airlabs.co](https://airlabs.co)
2. Free tier: **1,000 API calls/month**
3. Copy your API key from the dashboard — it goes in Render as an environment variable (see deployment steps below)

At a 5-minute refresh interval with normal personal use, 1,000 calls/month is comfortable.

### Everything Else (no account needed)
- **OpenStreetMap Nominatim** — location search
- **Planespotters.net** — aircraft photos
- **Airline logos** — embedded SVGs, zero network requests

---

## Deployment Guide

### Step 1 — Fork or clone this repository

```bash
git clone https://github.com/YOUR_USERNAME/flying-overhead.git
cd flying-overhead
```

### Step 2 — Deploy the proxy to Render.com

1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub account and select this repository
4. Configure:

| Setting | Value |
|---|---|
| **Runtime** | Node |
| **Root Directory** | *(blank if files are in repo root, otherwise set to subfolder)* |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free |

5. Add **Environment Variable**:

| Key | Value |
|---|---|
| `AIRLABS_API_KEY` | Your AirLabs API key |

6. Deploy. Copy your Render URL (e.g. `https://flying-overhead.onrender.com`)

> **Note:** Free Render instances sleep after 15 minutes idle. The first request after sleep takes 20–30 seconds to wake up.

### Step 3 — Deploy the frontend to GitHub Pages

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**, branch: `main`, folder: `/ (root)`
3. Save. Your site will be live at `https://YOUR_USERNAME.github.io/flying-overhead`

### Step 4 — Connect the frontend to your proxy

1. Open your GitHub Pages site
2. Enter your Render URL in the proxy configuration modal
3. Click **Save & Connect**

The proxy URL is saved in your browser's `localStorage` only. To update it later, click the **⚙** gear icon.

---

## File Structure

```
flying-overhead/
├── index.html    # Full frontend — layout, styles, JavaScript
├── server.js     # Render.com proxy — AirLabs relay with CORS headers
├── package.json  # Node.js dependencies (express, node-fetch)
└── README.md     # This file
```

---

## API Rate Limits

| API | Free Limit | Usage |
|---|---|---|
| AirLabs | 1,000/month | 1 call per refresh |
| Nominatim | Reasonable use | 1 call per location search |
| Planespotters | Unlimited | 1 call per photo popup |
| Airline logos | N/A — embedded | No network requests |

---

## Supported Airline Logos

The following airlines have embedded SVG wordmark logos. All others display a styled color badge using their brand colors.

| ICAO | Airline | ICAO | Airline |
|---|---|---|---|
| AAL | American Airlines | DAL | Delta Air Lines |
| UAL | United Airlines | SWA | Southwest Airlines |
| ASA | Alaska Airlines | JBU | JetBlue |
| FFT | Frontier Airlines | NKS | Spirit Airlines |
| ACA | Air Canada | ROU | Air Canada Rouge |
| BAW | British Airways | DLH | Lufthansa |
| AFR | Air France | KLM | KLM Royal Dutch Airlines |
| UAE | Emirates | QFA | Qantas |
| EJA | NetJets | JSX | JSX Air |
| SKW | SkyWest Airlines | FDY | Southern Airways Express |
| WJA | WestJet | ENY | Envoy Air |
| JZA | Jazz Aviation | VTE | Contour Airlines |
| JTL | Jet Linx Aviation | SCX | Sun Country Airlines |
| AAY | Allegiant Air | UPS | UPS Airlines |
| FDX | FedEx Express | CTF | Cutter Aviation |
| VOI | Volaris | VAR | Veca Airlines |
| WSN | Advanced Air | KEN | Kenmore Air |
| ATN | Air Transport International | AMX | Aeroméxico |
| AMF | Ameriflight | QXE | Horizon Air |
| LXJ | Flexjet | NDU | University of North Dakota Aviation |
| LYM | Key Lime Air | CFS | Empire Airlines |
| VJA | Vista America | GTI | Atlas Air |
| RVJ | Aircraft Management Group | ABX | ABX Air |

---

## Troubleshooting

**Stuck on "FETCHING…"**
Check the API Status panel in the header. If Render is on the free tier, the first request after 15 min idle takes 20–30 seconds — wait and retry.

**Auto-refresh shows "PROXY WAKING UP"**
This is normal on Render's free tier. The proxy instance spins down after 15 minutes of inactivity. The auto-refresh timeout is set to 35 seconds to accommodate the wake-up time, but occasionally the instance takes longer. The app will retry automatically at the next 5-minute interval. Triggering a manual refresh after 20–30 seconds usually succeeds immediately.

**"Server error 500"**
Your proxy is running but AirLabs is returning an error. Check Render logs → most common cause is a missing or incorrect `AIRLABS_API_KEY` environment variable.

**Location search not working**
Try a more specific query (e.g. "Phoenix, Arizona" instead of "Phoenix"), or enter coordinates manually.

**No aircraft showing**
Try the 30 mi radius. Some areas have low traffic — try again at a different time.

**Military aircraft not appearing**
See the [Why Military Aircraft May Not Appear](#why-military-aircraft-may-not-appear) section above.

**Radar popup photo not loading**
Planespotters may not have a photo for that registration. "No photo available" is expected for some aircraft.

**Stories not appearing**
Stories appear after the first successful refresh that returns results. If you've refreshed and see aircraft in the table but no story line, try a manual refresh using the ↺ button.

---

## License

MIT — free to use, modify, and deploy for personal use.

---

*Built with the help of Claude by Anthropic.*
