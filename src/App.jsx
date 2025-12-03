import { useEffect, useState } from 'react';
import './App.css';
import SearchBar from './Components/SearchBar/SearchBar.jsx';
import WeatherCard from './Components/WeatherCard/WeatherCard.jsx';
import KeyMetrics from './Components/KeyMetrics/KeyMetrics.jsx';
import StatusBanner from './Components/StatusBanner/StatusBanner.jsx';
import { fetchCitySuggestions } from './services/weatherApi.js';
import { useWeatherData, WEATHER_STATUS } from './hooks/useWeatherData.js';

const MIN_QUERY_LENGTH = 3;

function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsFetched, setSuggestionsFetched] = useState(false);
  const [blockedSuggestions, setBlockedSuggestions] = useState(new Set());
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });

  const {
    weather,
    metrics,
    range,
    status,
    loading,
    cityNotFound,
    hasActiveCity,
    loadByCityName,
    loadByCoordinates,
    canRetry,
    retryLast,
  } = useWeatherData();

  const handleSubmit = async () => {
    const success = await loadByCityName(query);
    if (success) {
      setQuery('');
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (suggestion) => {
    if (!suggestion) return;
    const parts = [suggestion.name, suggestion.state, suggestion.country]
      .filter(Boolean)
      .join(', ');
    setQuery('');
    setSuggestions([]);
    setSuggestionsFetched(false);
    setSuggestionsLoading(false);
    const success = await loadByCoordinates({
      cityName: parts,
      lat: suggestion.lat,
      lon: suggestion.lon,
    });
    if (success) {
      return;
    }
    if (!success) {
      setBlockedSuggestions((prev) => {
        const next = new Set(prev);
        next.add(
          `${suggestion.name}|${suggestion.country}|${suggestion.state || ''}`
        );
        return next;
      });
      setSuggestions((prev) =>
        prev.filter(
          (item) =>
            `${item.name}|${item.country}|${item.state || ''}` !==
            `${suggestion.name}|${suggestion.country}|${suggestion.state || ''}`
        )
      );
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setSuggestionsFetched(false);
      return;
    }

    let cancelled = false;
    setSuggestionsLoading(true);
    setSuggestionsFetched(false);
    const timeoutId = setTimeout(async () => {
      try {
        const results = await fetchCitySuggestions(trimmed, 6);
        if (!cancelled) {
          setSuggestions(
            results.filter(
              (item) =>
                !blockedSuggestions.has(
                  `${item.name}|${item.country}|${item.state || ''}`
                )
            )
          );
          setSuggestionsFetched(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Suggestion fetch failed', err);
          setSuggestions([]);
          setSuggestionsFetched(false);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, blockedSuggestions]);

  useEffect(() => {
    if (cityNotFound) {
      setQuery('');
      setSuggestions([]);
    }
  }, [cityNotFound]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const readyCityError = status.type === WEATHER_STATUS.NOT_FOUND;
  const searchPlaceholder = readyCityError
    ? 'City not found, try another city'
    : 'Search for a city';

  const shouldShowWeather = status.type === WEATHER_STATUS.READY;
  const bannerProps = !isOnline
    ? {
        message: 'You are offline. Showing the last available weather data.',
        variant: 'error',
      }
    : status.type === WEATHER_STATUS.ERROR && status.message
      ? {
          message: status.message,
          variant: 'error',
          actionLabel: canRetry ? 'Try again' : undefined,
          onAction: canRetry ? retryLast : undefined,
        }
      : null;

  return (
    <>
      <SearchBar
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onSubmit={handleSubmit}
        loading={loading}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        suggestionsFetched={suggestionsFetched}
        onSuggestionSelect={handleSuggestionSelect}
        placeholder={searchPlaceholder}
        hasError={readyCityError}
      />
      {bannerProps && <StatusBanner {...bannerProps} />}
      <WeatherCard
        weather={weather}
        showPlaceholder={!shouldShowWeather}
        isLoading={loading}
      />
      {shouldShowWeather && <KeyMetrics metrics={metrics} range={range} />}
    </>
  );
}

export default App;
