// Grid of the next 5 days. Index 0 in the API's daily arrays is
// "today" (already shown in CurrentWeather), so we skip it here.
function DailyForecast({ dailyData }) {
  if (!dailyData) return null;

  const upcomingDays = dailyData.time.slice(1, 6);

  return (
    <React.Fragment>
      <h3 className="section-title">5-Day Forecast</h3>
      <div className="daily-grid">
        {upcomingDays.map((day, i) => {
          const index = i + 1; // real position in the original API arrays
          const { icon } = getWeatherInfo(dailyData.weather_code[index]);

          return (
            <div className="day-card" key={day}>
              <div className="day-name">{formatDayName(day, index)}</div>
              <div className="day-icon">{icon}</div>
              <div className="day-temps">
                <span className="max">
                  {Math.round(dailyData.temperature_2m_max[index])}°
                </span>
                {" / "}
                <span className="min">
                  {Math.round(dailyData.temperature_2m_min[index])}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
