// Horizontally scrollable list of the next 24 hours.
// "hourlyList" is already pre-computed (see utils.getNext24Hours),
// this component only renders it.
function HourlyForecast({ hourlyList }) {
  if (!hourlyList || hourlyList.length === 0) return null;

  return (
    <React.Fragment>
      <h3 className="section-title">Next 24 Hours</h3>
      <div className="hourly-scroll">
        {hourlyList.map((hour, index) => {
          const { icon } = getWeatherInfo(hour.code);
          return (
            <div className="hour-card" key={index}>
              <div className="hour-time">{formatHour(hour.time)}</div>
              <div className="hour-icon">{icon}</div>
              <div className="hour-temp">{Math.round(hour.temp)}°</div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}
