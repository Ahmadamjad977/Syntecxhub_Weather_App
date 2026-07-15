// Shows the current temperature/conditions card plus the sunrise/sunset row.
// Both were part of the "current weather" section in the original design,
// so they are kept together in one component.
function CurrentWeather({ weatherData }) {
  const { placeName, current, daily } = weatherData;
  const { icon, text } = getWeatherInfo(current.weather_code);

  return (
    <React.Fragment>
      <div className="current-card">
        <div className="current-left">
          <h2>{placeName}</h2>
          <div className="date">{new Date().toDateString()}</div>
          <div className="current-temp">{Math.round(current.temperature_2m)}°C</div>
          <div className="current-desc">{text}</div>
          <div className="extra-info">
            <span>Feels like {Math.round(current.apparent_temperature)}°C</span>
            <span>Humidity {current.relative_humidity_2m}%</span>
            <span>Wind {Math.round(current.wind_speed_10m)} km/h</span>
          </div>
        </div>

        <div className="current-right">
          <div className="weather-icon">{icon}</div>
        </div>
      </div>

      <div className="sun-row">
        <div className="sun-item">
          <span className="value">🌅 {formatTime(daily.sunrise[0])}</span>
          <span className="label">Sunrise</span>
        </div>
        <div className="sun-item">
          <span className="value">🌇 {formatTime(daily.sunset[0])}</span>
          <span className="label">Sunset</span>
        </div>
      </div>
    </React.Fragment>
  );
}
