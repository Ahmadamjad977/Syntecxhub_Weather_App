// ---------------------------------------------------------
// All the "fixed values" the app needs, kept in one place so
// nothing is hard-coded (repeated) inside components.
// ---------------------------------------------------------

// Open-Meteo API endpoints (same API as before - not changed)
const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

// Free reverse-geocoding API, used only for the "Use My Location" button
// so we can show a city name instead of raw coordinates.
const REVERSE_GEOCODING_API_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// Which weather fields we ask the API for (kept exactly as the original app).
const CURRENT_WEATHER_PARAMS =
  "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m";
const HOURLY_WEATHER_PARAMS = "temperature_2m,weather_code";
const DAILY_WEATHER_PARAMS =
  "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset";

// General app settings
const DEFAULT_CITY = "Lahore";
const MAX_HISTORY_ITEMS = 5;

// Keys used when reading/writing to localStorage, kept in one place
// so we never mistype a key name in two different files.
const STORAGE_KEYS = {
  THEME: "weatherApp_theme",
  HISTORY: "weatherApp_history",
};
