# WeatherApp

Reactive weather dashboard built with React 19 + Vite. Search for any city, preview live conditions, and review key metrics with graceful fallbacks, offline messaging, and resilient data flow.

## Features

- 🔍 **Smart search** with typeahead suggestions backed by the OpenWeather geocoding API
- 🌤️ **Weather card** that swaps between live data, animated placeholders, and helpful errors
- 📊 **Key metrics** section highlighting feels-like, humidity, wind, pressure, highs/lows, and sun cycle
- 💾 **Persistent location** storage that autosaves the last successful lookup while guarding against corrupt data
- 🛡️ **Resilient UX** with structured API error messages, retry support, and offline detection via `StatusBanner`
- 💨 **Reduced-motion friendly** placeholder animations that respect `prefers-reduced-motion`

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20)
- npm 9+

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and provide your OpenWeather key.

```
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

The app will refuse to fetch weather data if the key is missing or invalid and will surface a clear banner message.

### Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start Vite dev server with HMR       |
| `npm run build`   | Create a production build (Vite)     |
| `npm run preview` | Preview the production build locally |

## Architecture Notes

- `src/hooks/useWeatherData.js` centralizes fetching, formatting, storage, and status management. It exposes retry helpers, status enums, and derived metrics.
- `src/services/weatherApi.js` wraps OpenWeather calls, normalizes errors via `WeatherApiError`, and protects against network/rate-limit failures.
- UI is composed of small, focused components (`WeatherCardContent`, `WeatherCardPlaceholder`, `MetricSection`, `StatusBanner`, etc.) backed by a shared `GlassCard` wrapper for consistent styling.
- Search flow lives in `SearchBar` and `SearchSuggestions`, keeping the input logic decoupled from the rest of the dashboard.

## Resilience & UX Enhancements

- Structured error codes map to friendly banner copy (network loss, rate limits, API key issues, not-found, validation).
- Offline detection leverages `online/offline` events to pin a banner and keep the last successful data visible.
- Retry button replays the last lookup without retyping and only appears when an actionable request exists.
- Local storage entries are sanitized and cleared automatically if they become invalid, preventing boot loops.

## Testing

Automated tests are not yet included. For manual verification see `docs/TESTING.md`, which enumerates happy paths, error paths, offline flows, and accessibility considerations. Add your preferred test runner (Vitest, Cypress, Playwright) as needed; the project structure is ready for future `src/__tests__` suites.

## Deployment

Any static host that supports Vite output will work (Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

1. Ensure `VITE_OPENWEATHER_API_KEY` is configured in your hosting provider’s environment settings.
2. Run `npm run build` during deployment.
3. Serve the `dist/` directory.

For local artifact verification run `npm run preview` after building.

### GitHub Pages via Actions

This repo ships with `.github/workflows/deploy.yml`, which builds the site and deploys it to GitHub Pages whenever `main` is updated (or when manually triggered).

Setup steps:

1. Go to **Settings → Secrets and variables → Actions** and create a repository secret named `VITE_OPENWEATHER_API_KEY`.
2. Under **Settings → Pages**, choose **GitHub Actions** as the source.
3. Push to `main` (or use **Actions → Deploy WeatherApp → Run workflow**). The workflow will:
   - Install dependencies and build with Node 20
   - Inject the API key via the secret and create a production bundle
   - Upload the `dist/` artifact and publish it via `actions/deploy-pages`

Once the workflow finishes, the run summary lists the published Pages URL in the `deploy` job output.
