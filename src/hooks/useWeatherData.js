import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultWeather } from '../Components/WeatherCard/WeatherCard.jsx';
import {
  defaultMetrics,
  defaultRange,
} from '../Components/KeyMetrics/KeyMetrics.jsx';
import {
  fetchWeatherByCity,
  fetchWeatherByCoordinates,
  WEATHER_ERROR_CODES,
} from '../services/weatherApi.js';

const STORAGE_KEY = 'weather:last-location';
const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const MIN_LOADING_DURATION = 1000;
const GENERIC_ERROR_MESSAGE = 'Unable to fetch weather data right now.';

export const WEATHER_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
  NOT_FOUND: 'not-found',
};

const sanitizeLocation = (location) => {
  if (!location || typeof location !== 'object') return null;
  const city = typeof location.city === 'string' ? location.city.trim() : '';
  const lat = Number(location.lat);
  const lon = Number(location.lon);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
  if (!city && !hasCoords) return null;
  return {
    city,
    lat: hasCoords ? lat : null,
    lon: hasCoords ? lon : null,
  };
};

const getStoredLocation = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return sanitizeLocation(parsed);
  } catch {
    return null;
  }
};

const clearStoredLocation = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

const setStoredLocation = (location) => {
  if (typeof window === 'undefined') return;
  const sanitized = sanitizeLocation(location);
  if (!sanitized) {
    clearStoredLocation();
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    /* ignore */
  }
};

const formatTemperature = (value) =>
  Number.isFinite(value) ? `${Math.round(value)}°C` : 'N/A';

const formatWind = (speed, degrees) => {
  if (!Number.isFinite(speed)) return 'N/A';
  const kmh = Math.round(speed * 3.6);
  const directionIndex = Number.isFinite(degrees)
    ? Math.round(degrees / 45) % WIND_DIRECTIONS.length
    : 0;
  return `${kmh} km/h ${WIND_DIRECTIONS[directionIndex]}`;
};

const formatTime = (timestamp, timezoneOffset = 0) => {
  if (!Number.isFinite(timestamp)) return 'N/A';
  const offsetSeconds = Number.isFinite(timezoneOffset) ? timezoneOffset : 0;
  const utcMillis = (timestamp + offsetSeconds) * 1000;
  return new Date(utcMillis).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
};

const buildWeatherCard = (data) => {
  const weatherEntry = data.weather?.[0];
  const iconCode = weatherEntry?.icon;
  const fallbackIcon = defaultWeather.conditionIcon;
  return {
    temperature: formatTemperature(data.main?.temp),
    condition: weatherEntry?.main ?? 'N/A',
    conditionIcon: iconCode
      ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
      : fallbackIcon,
    conditionIconAlt: weatherEntry?.description ?? 'Weather icon',
    city: data.name ?? defaultWeather.city,
  };
};

const buildMetrics = (data) => {
  const { main, wind } = data;
  return defaultMetrics.map((metric) => {
    switch (metric.label) {
      case 'Feels like':
        return { ...metric, value: formatTemperature(main?.feels_like) };
      case 'Humidity':
        return {
          ...metric,
          value: Number.isFinite(main?.humidity) ? `${main.humidity}%` : 'N/A',
        };
      case 'Wind speed':
        return {
          ...metric,
          value: formatWind(wind?.speed, wind?.deg),
        };
      case 'Pressure':
        return {
          ...metric,
          value: Number.isFinite(main?.pressure)
            ? `${main.pressure} hPa`
            : 'N/A',
        };
      default:
        return metric;
    }
  });
};

const buildRange = (data) => {
  const { main, sys, timezone } = data;
  return defaultRange.map((metric) => {
    switch (metric.label) {
      case 'High':
        return { ...metric, value: formatTemperature(main?.temp_max) };
      case 'Low':
        return { ...metric, value: formatTemperature(main?.temp_min) };
      case 'Sunrise':
        return {
          ...metric,
          value: formatTime(sys?.sunrise, timezone ?? 0),
        };
      case 'Sunset':
        return {
          ...metric,
          value: formatTime(sys?.sunset, timezone ?? 0),
        };
      default:
        return metric;
    }
  });
};

export function useWeatherData() {
  const [weather, setWeather] = useState(defaultWeather);
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [range, setRange] = useState(defaultRange);
  const [status, setStatus] = useState({
    type: WEATHER_STATUS.IDLE,
    message: '',
  });
  const [cityNotFound, setCityNotFound] = useState(false);
  const [hasActiveCity, setHasActiveCity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const loadingTimeoutRef = useRef(null);
  const lastRequestRef = useRef(null);
  const storageAttemptRef = useRef(null);

  const finalizeLoading = useCallback((startTime) => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_LOADING_DURATION - elapsed);
    if (remaining === 0) {
      setLoading(false);
      return;
    }
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      loadingTimeoutRef.current = null;
    }, remaining);
  }, []);

  const loadWeather = useCallback(
    async ({ cityName, lat, lon } = {}) => {
      const trimmedCity = cityName?.trim();
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);
      if (!trimmedCity && !hasCoords) {
        setStatus({
          type: WEATHER_STATUS.ERROR,
          message: 'Please enter a city name.',
        });
        return false;
      }

      lastRequestRef.current = {
        cityName: trimmedCity || cityName || '',
        lat: hasCoords ? lat : undefined,
        lon: hasCoords ? lon : undefined,
      };

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      let startTime = Date.now();
      try {
        setLoading(true);
        setStatus({ type: WEATHER_STATUS.LOADING, message: '' });
        setCityNotFound(false);

        const data = hasCoords
          ? await fetchWeatherByCoordinates(lat, lon)
          : await fetchWeatherByCity(trimmedCity);

        setWeather(buildWeatherCard(data));
        setMetrics(buildMetrics(data));
        setRange(buildRange(data));

        const resolvedCity = data.name?.trim() || trimmedCity;
        const resolvedLocation = {
          city: resolvedCity || '',
          lat: Number.isFinite(data.coord?.lat)
            ? data.coord.lat
            : (lat ?? null),
          lon: Number.isFinite(data.coord?.lon)
            ? data.coord.lon
            : (lon ?? null),
        };
        if (resolvedCity) {
          setStoredLocation(resolvedLocation);
        }
        setCurrentLocation(resolvedLocation);

        setHasActiveCity(true);
        setStatus({ type: WEATHER_STATUS.READY, message: '' });
        return true;
      } catch (err) {
        const isApiError = err?.name === 'WeatherApiError';
        const errorCode = isApiError ? err.code : null;
        const notFound = errorCode === WEATHER_ERROR_CODES.NOT_FOUND;
        const fallbackMessage = err?.message || GENERIC_ERROR_MESSAGE;

        let friendlyMessage = fallbackMessage;
        switch (errorCode) {
          case WEATHER_ERROR_CODES.NETWORK:
            friendlyMessage =
              'Network connection lost. Please check your internet connection and try again.';
            break;
          case WEATHER_ERROR_CODES.RATE_LIMIT:
            friendlyMessage =
              'OpenWeather rate limit reached. Please wait a moment and try again.';
            break;
          case WEATHER_ERROR_CODES.UNAUTHORIZED:
            friendlyMessage =
              'OpenWeather API key is missing or invalid. Update your VITE_OPENWEATHER_API_KEY value.';
            break;
          case WEATHER_ERROR_CODES.VALIDATION:
          default:
            friendlyMessage = fallbackMessage;
        }

        setCityNotFound(notFound);
        setHasActiveCity((prev) => (notFound ? false : prev));
        setStatus({
          type: notFound ? WEATHER_STATUS.NOT_FOUND : WEATHER_STATUS.ERROR,
          message: notFound ? '' : friendlyMessage,
        });

        if (
          (notFound || errorCode === WEATHER_ERROR_CODES.VALIDATION) &&
          storageAttemptRef.current
        ) {
          clearStoredLocation();
          storageAttemptRef.current = null;
        }
        return false;
      } finally {
        finalizeLoading(startTime);
      }
    },
    [finalizeLoading]
  );

  const loadByCityName = useCallback(
    (cityName) => loadWeather({ cityName }),
    [loadWeather]
  );

  const loadByCoordinates = useCallback(
    ({ lat, lon, cityName } = {}) => loadWeather({ lat, lon, cityName }),
    [loadWeather]
  );

  const retryLast = useCallback(() => {
    if (!lastRequestRef.current) return false;
    return loadWeather(lastRequestRef.current);
  }, [loadWeather]);

  useEffect(() => {
    const storedLocation = getStoredLocation();
    if (storedLocation?.lat != null && storedLocation?.lon != null) {
      storageAttemptRef.current = storedLocation;
      loadWeather({
        cityName: storedLocation.city,
        lat: storedLocation.lat,
        lon: storedLocation.lon,
      }).finally(() => {
        storageAttemptRef.current = null;
      });
      return;
    }
    if (storedLocation?.city) {
      storageAttemptRef.current = storedLocation;
      loadWeather({ cityName: storedLocation.city }).finally(() => {
        storageAttemptRef.current = null;
      });
    }
  }, [loadWeather]);

  useEffect(
    () => () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    },
    []
  );

  return {
    weather,
    metrics,
    range,
    status,
    loading,
    cityNotFound,
    hasActiveCity,
    currentLocation,
    canRetry: Boolean(lastRequestRef.current),
    retryLast,
    loadByCityName,
    loadByCoordinates,
  };
}
