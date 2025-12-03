const OPENWEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GEOCODE_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export const WEATHER_ERROR_CODES = {
  NETWORK: 'network',
  NOT_FOUND: 'not-found',
  RATE_LIMIT: 'rate-limit',
  UNAUTHORIZED: 'unauthorized',
  VALIDATION: 'validation',
  UNKNOWN: 'unknown',
};

export class WeatherApiError extends Error {
  constructor(message, code = WEATHER_ERROR_CODES.UNKNOWN, status = null) {
    super(message);
    this.name = 'WeatherApiError';
    this.code = code;
    this.status = status;
  }
}

const capitalize = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);

const buildWeatherParams = (overrides = {}) => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  return new URLSearchParams({
    units: 'metric',
    appid: apiKey,
    ...overrides,
  });
};

const safeFetch = async (url, options) => {
  try {
    return await fetch(url, options);
  } catch {
    throw new WeatherApiError(
      'Network request failed. Please check your connection and try again.',
      WEATHER_ERROR_CODES.NETWORK
    );
  }
};

const responseCodeToError = (status) => {
  switch (status) {
    case 401:
    case 403:
      return WEATHER_ERROR_CODES.UNAUTHORIZED;
    case 404:
      return WEATHER_ERROR_CODES.NOT_FOUND;
    case 429:
      return WEATHER_ERROR_CODES.RATE_LIMIT;
    default:
      return WEATHER_ERROR_CODES.UNKNOWN;
  }
};

const parseJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const ensureOk = async (response, fallbackMessage) => {
  const payload = await parseJson(response);
  if (!response.ok) {
    const message = capitalize(payload?.message) || fallbackMessage;
    throw new WeatherApiError(
      message,
      responseCodeToError(response.status),
      response.status
    );
  }
  return payload;
};

const ensureApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new WeatherApiError(
      'Missing OpenWeather API key. Set VITE_OPENWEATHER_API_KEY in your .env.local file.',
      WEATHER_ERROR_CODES.VALIDATION
    );
  }
  return apiKey;
};

export async function fetchWeatherByCoordinates(lat, lon) {
  ensureApiKey();
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new WeatherApiError(
      'Invalid coordinates provided.',
      WEATHER_ERROR_CODES.VALIDATION
    );
  }

  const params = buildWeatherParams({ lat: String(lat), lon: String(lon) });
  const response = await safeFetch(`${OPENWEATHER_URL}?${params.toString()}`);
  return ensureOk(response, 'Unable to fetch weather data right now.');
}

export async function fetchWeatherByCity(city) {
  const apiKey = ensureApiKey();
  const trimmedCity = city?.trim();

  if (!trimmedCity) {
    throw new WeatherApiError(
      'Please enter a city name.',
      WEATHER_ERROR_CODES.VALIDATION
    );
  }

  const geoParams = new URLSearchParams({
    q: trimmedCity,
    limit: '1',
    appid: apiKey,
  });

  const geoResponse = await safeFetch(`${GEOCODE_URL}?${geoParams.toString()}`);
  const geoPayload = await ensureOk(
    geoResponse,
    'Unable to locate that city right now.'
  );
  const [location] = Array.isArray(geoPayload) ? geoPayload : [];
  if (
    !location ||
    !Number.isFinite(location.lat) ||
    !Number.isFinite(location.lon)
  ) {
    throw new WeatherApiError('City not found', WEATHER_ERROR_CODES.NOT_FOUND);
  }

  return fetchWeatherByCoordinates(location.lat, location.lon);
}

export async function fetchCitySuggestions(query, limit = 5) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) return [];
  if (!apiKey) return [];

  const params = new URLSearchParams({
    q: trimmedQuery,
    limit: String(limit),
    appid: apiKey,
  });

  try {
    const response = await safeFetch(`${GEOCODE_URL}?${params.toString()}`);
    const cities = await ensureOk(response, 'Unable to fetch suggestions.');
    return Array.isArray(cities)
      ? cities.map((city) => ({
          id: `${city.lat},${city.lon}`,
          name: city.name,
          state: city.state || '',
          country: city.country,
          lat: city.lat,
          lon: city.lon,
        }))
      : [];
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return [];
    }
    return [];
  }
}
