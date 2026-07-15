// ---------------------------------------------------------
// Small, reusable helper functions used across components.
// Keeping them here avoids repeating the same logic in
// CurrentWeather, HourlyForecast and DailyForecast.
// ---------------------------------------------------------

// Turns an Open-Meteo weather code into a simple { icon, text } pair.
function getWeatherInfo(code) {
  if (code === 0) return { icon: "☀️", text: "Clear Sky" };
  if (code === 1 || code === 2) return { icon: "🌤️", text: "Partly Cloudy" };
  if (code === 3) return { icon: "☁️", text: "Cloudy" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "Foggy" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", text: "Drizzle" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", text: "Rain" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "Snow" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", text: "Rain Showers" };
  if (code >= 95) return { icon: "⛈️", text: "Thunderstorm" };
  return { icon: "🌡️", text: "Unknown" };
}

// Both formatHour() and formatTime() need the same 12-hour-clock
// conversion, so that shared piece lives here instead of being
// copy-pasted twice (this used to be duplicated code).
function to12HourClock(date) {
  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return { hours, ampm };
}

// e.g. "3 PM" - used on the hourly forecast cards
function formatHour(dateString) {
  const { hours, ampm } = to12HourClock(new Date(dateString));
  return hours + " " + ampm;
}

// e.g. "6:05 AM" - used for sunrise / sunset
function formatTime(dateString) {
  const date = new Date(dateString);
  const { hours, ampm } = to12HourClock(date);
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return hours + ":" + minutes + " " + ampm;
}

// "Today" for the first day, otherwise the short weekday name
function formatDayName(dateString, index) {
  if (index === 0) return "Today";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date(dateString).getDay()];
}

// Picks the next 24 hourly entries starting from the current hour,
// so the app always shows "the next 24 hours" instead of "today's hours".
function getNext24Hours(hourly) {
  if (!hourly) return [];

  const now = new Date();
  const times = hourly.time;

  let startIndex = times.findIndex((time) => new Date(time) >= now);
  if (startIndex === -1) startIndex = 0;

  return times.slice(startIndex, startIndex + 24).map((time, i) => ({
    time,
    temp: hourly.temperature_2m[startIndex + i],
    code: hourly.weather_code[startIndex + i],
  }));
}

// ---------------------------------------------------------
// Tiny localStorage helpers - components/App don't need to
// worry about JSON.stringify/parse or try/catch every time.
// ---------------------------------------------------------
function loadFromStorage(key, fallbackValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallbackValue;
  } catch (err) {
    console.error("Could not read from localStorage:", err);
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error("Could not save to localStorage:", err);
  }
}
