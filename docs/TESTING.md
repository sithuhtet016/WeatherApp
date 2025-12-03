# WeatherApp Testing Guide

This project currently relies on manual verification. The checklist below covers the key flows introduced during the optimization work so you can confirm resilience and UX guarantees before every release.

## 1. Environment Setup

1. Copy `.env.example` to `.env.local` and provide a valid `VITE_OPENWEATHER_API_KEY`.
2. Run `npm install` once.
3. Start the dev server with `npm run dev`.

## 2. Search & Load Flows

| Scenario               | Steps                                         | Expected Outcome                                                                               |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Happy path city search | Enter "Lisbon" and submit                     | Weather card shows Lisbon data, key metrics populate, storage saves the city                   |
| Suggestion selection   | Type "San" → click "San Francisco" suggestion | Weather updates for San Francisco, search input clears                                         |
| Trimmed input handling | Enter spaces only and submit                  | Status banner (or inline error) prompts for a city; no fetch occurs                            |
| Rapid city switches    | Search two different cities back-to-back      | Loading state stays smooth (min-duration), placeholder animates, final data reflects last city |

## 3. Error & Resilience Paths

| Scenario                  | Steps                                                                            | Expected Outcome                                                                             |
| ------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| City not found            | Enter nonsense text (e.g., `abcd1234`)                                           | Search bar placeholder flips to error copy, NOT_FOUND banner stays hidden, suggestions clear |
| Offline mode              | Disable network (DevTools → Offline) then submit                                 | Banner states you are offline, last successful data remains visible, retry button hidden     |
| Network recovery          | Re-enable network and click "Try again"                                          | Data reloads using last request, banner disappears                                           |
| Rate limit / forced error | Temporarily edit API key to an invalid value                                     | Banner warns about missing/invalid API key, retries remain available once key is fixed       |
| Corrupt storage           | Manually set `localStorage['weather:last-location'] = '{"city":123}'` and reload | App clears bad entry, boots without crashing, prompts for new search                         |

## 4. Accessibility & Motion

- **Keyboard navigation**: Tab through the search bar, suggestions list, retry button. All controls should be focusable and actionable via keyboard.
- **Reduced motion**: Enable "Reduce motion" at OS level → placeholder animations stop (verify CSS media query).
- **ARIA roles**: Confirm `StatusBanner` has `role="status"` and suggestions list uses `role="listbox"`.

## 5. Build Verification

Run the production build before deploy:

```bash
npm run build
npm run preview # optional sanity check
```

## 6. Future Automated Testing

When ready to add automated coverage, consider:

- **Vitest** for unit testing `useWeatherData` (mock `weatherApi` responses to assert status transitions and storage handling).
- **Playwright or Cypress** for end-to-end flows (search, offline simulation, retry button).
- **Lighthouse CI** to monitor PWA/accessibility metrics, especially after styling or layout changes.
