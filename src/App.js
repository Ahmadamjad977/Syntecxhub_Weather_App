const { useState, useEffect, useMemo, useCallback } = React;

function App() {
  // ---------- State ----------
  const [inputValue, setInputValue] = useState(DEFAULT_CITY);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search history and theme are both loaded from localStorage on first
  // render, using the "lazy initializer" form of useState (a function,
  // not a value) so localStorage is only read once, not on every render.
  const [history, setHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.HISTORY, [])
  );
  const [theme, setTheme] = useState(() =>
    loadFromStorage(STORAGE_KEYS.THEME, "light")
  );

  // ---------- Theme handling ----------
  // Whenever "theme" changes, update the <body> class (which the CSS
  // reacts to) and remember the choice for the next visit.
  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    saveToStorage(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  // ---------- Search history handling ----------
  // Adds a city to the front of the list, removes duplicates,
  // and keeps only the most recent MAX_HISTORY_ITEMS entries.
  const addToHistory = useCallback((cityName) => {
    setHistory((prevHistory) => {
      const withoutDuplicate = prevHistory.filter(
        (item) => item.toLowerCase() !== cityName.toLowerCase()
      );
      const updatedHistory = [cityName, ...withoutDuplicate].slice(
        0,
        MAX_HISTORY_ITEMS
      );
      saveToStorage(STORAGE_KEYS.HISTORY, updatedHistory);
      return updatedHistory;
    });
  }, []);

  // ---------- Weather fetching ----------
  // Fetches weather once we already know latitude/longitude.
  // Both "search by city" and "use my location" end up calling this,
  // so the actual API-calling logic only exists in one place.
  const fetchWeatherByCoords = useCallback(async (latitude, longitude, placeName) => {
    setLoading(true);
    setError("");

    try {
      const weatherRes = await fetch(
        WEATHER_API_URL +
          "?latitude=" + latitude +
          "&longitude=" + longitude +
          "&current=" + CURRENT_WEATHER_PARAMS +
          "&hourly=" + HOURLY_WEATHER_PARAMS +
          "&daily=" + DAILY_WEATHER_PARAMS +
          "&timezone=auto&forecast_days=6"
      );

      if (!weatherRes.ok) {
        throw new Error("Weather service did not respond correctly.");
      }

      const weatherJson = await weatherRes.json();

      setWeatherData({
        placeName,
        current: weatherJson.current,
        hourly: weatherJson.hourly,
        daily: weatherJson.daily,
      });
    } catch (err) {
      // Covers both network failures (fetch throws) and bad responses.
      console.error(err);
      setError(
        "Could not load weather data. Please check your internet connection and try again."
      );
      setWeatherData(null);
    }

    setLoading(false);
  }, []);

  // Turns a typed city name into coordinates (geocoding), then reuses
  // fetchWeatherByCoords above to get the actual forecast.
  const fetchWeatherByCityName = useCallback(
    async (rawCityName) => {
      // Trim extra spaces so " lahore " and "lahore" behave the same.
      const cityName = rawCityName.trim();

      if (cityName === "") {
        setError("Please enter a city name.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const geoRes = await fetch(
          GEOCODING_API_URL + "?name=" + encodeURIComponent(cityName) + "&count=1"
        );

        if (!geoRes.ok) {
          throw new Error("Geocoding service did not respond correctly.");
        }

        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
          setError("City not found. Please check the spelling and try again.");
          setWeatherData(null);
          setLoading(false);
          return;
        }

        const place = geoData.results[0];
        const placeName = place.name + (place.country ? ", " + place.country : "");

        await fetchWeatherByCoords(place.latitude, place.longitude, placeName);
        addToHistory(placeName);
      } catch (err) {
        // A network failure (e.g. user is offline) lands here.
        console.error(err);
        setError("Network error while searching for the city. Please try again.");
        setWeatherData(null);
        setLoading(false);
      }
    },
    [fetchWeatherByCoords, addToHistory]
  );

  // Load weather for the default city once, when the app first mounts.
  useEffect(() => {
    fetchWeatherByCityName(DEFAULT_CITY);
    // We intentionally run this only once on mount, so the dependency
    // array is left empty even though fetchWeatherByCityName is defined above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Event handlers passed down to components ----------
  const handleSearch = useCallback(() => {
    fetchWeatherByCityName(inputValue);
  }, [inputValue, fetchWeatherByCityName]);

  const handleHistorySelect = useCallback(
    (cityName) => {
      setInputValue(cityName);
      fetchWeatherByCityName(cityName);
    },
    [fetchWeatherByCityName]
  );

  // Uses the browser's Geolocation API to find the user, then fetches
  // weather for that exact spot. Reverse geocoding is used only to get
  // a friendly place name - if it fails, we still show the weather.
  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let placeName = "Your Location";

        try {
          const reverseRes = await fetch(
            REVERSE_GEOCODING_API_URL +
              "?latitude=" + latitude +
              "&longitude=" + longitude +
              "&localityLanguage=en"
          );
          const reverseData = await reverseRes.json();
          placeName = reverseData.city || reverseData.locality || placeName;
          if (reverseData.countryName) {
            placeName += ", " + reverseData.countryName;
          }
        } catch (err) {
          // Not a fatal error - we just keep the "Your Location" fallback.
          console.warn("Reverse geocoding failed, using default label.");
        }

        await fetchWeatherByCoords(latitude, longitude, placeName);
        setInputValue(placeName);
        addToHistory(placeName);
      },
      (geoError) => {
        console.error(geoError);
        setError("Could not access your location. Please allow location access and try again.");
        setLoading(false);
      }
    );
  }, [fetchWeatherByCoords, addToHistory]);

  // ---------- Derived data ----------
  // Recomputes the "next 24 hours" list only when weatherData actually
  // changes, instead of recalculating it on every single re-render.
  const next24Hours = useMemo(
    () => getNext24Hours(weatherData ? weatherData.hourly : null),
    [weatherData]
  );

  // ---------- Render ----------
  return (
    <div className="app">
      <div className="header">
        <div className="header-top">
          <div>
            <h1>🌦️ Weather Forecast App</h1>
            <p>Check current weather, 24-hour forecast, sunrise time and 5-day outlook</p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <SearchBar
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSearch={handleSearch}
          onUseLocation={handleUseLocation}
          loading={loading}
        />

        <SearchHistory history={history} onSelect={handleHistorySelect} />
      </div>

      {loading && <LoadingSpinner />}

      {!loading && <ErrorMessage message={error} />}

      {!loading && !error && weatherData && (
        <React.Fragment>
          <CurrentWeather weatherData={weatherData} />
          <HourlyForecast hourlyList={next24Hours} />
          <DailyForecast dailyData={weatherData.daily} />
        </React.Fragment>
      )}

      <footer>Built for Syntecxhub Internship - Web Development Task | Weather data by Open-Meteo</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
