# Weather App v2 - Refactored (Syntecxhub Internship, Project 2)

Same weather app, same look, same Open-Meteo API — refactored into clean,
reusable components with several new features and performance improvements.

## File Structure
```
weather-app-v2/
├── index.html                 (page shell, loads everything in order)
├── style.css                  (all styling, now with CSS variables + dark mode)
└── src/
    ├── constants.js           (API URLs, storage keys, app settings)
    ├── utils.js                (pure helper/formatting functions)
    ├── App.js                  (main component - state + logic)
    └── components/
        ├── SearchBar.js
        ├── SearchHistory.js
        ├── ThemeToggle.js
        ├── CurrentWeather.js
        ├── HourlyForecast.js
        ├── DailyForecast.js
        ├── LoadingSpinner.js
        └── ErrorMessage.js
```

No build tools are used (same as before) — React/Babel load from CDN and
JSX is compiled in the browser. Because the code is now split across files,
run it with a local server instead of double-clicking `index.html` (see
"How to Run" below).

---

## 1. Component Refactor
The single `app.js` file was split into one component per UI section:
**SearchBar, CurrentWeather, HourlyForecast, DailyForecast, ErrorMessage**,
plus a couple of small extras needed for the new features
(**SearchHistory, ThemeToggle, LoadingSpinner**).

**Why:** each component now has one job. If something is wrong with the
5-day forecast, you open `DailyForecast.js` — you don't scroll through 250
lines of unrelated JSX to find it. It also makes the components reusable
and easy to test in isolation.

## 2. Readability Improvements
- **`constants.js`** — all API URLs, `localStorage` keys, and settings
  (default city, max history size) now live in one place instead of being
  typed inline wherever they were needed.
- **`utils.js`** — `getWeatherInfo`, `formatHour`, `formatTime`,
  `formatDayName`, `getNext24Hours` were pulled out of the component and
  into standalone functions. `formatHour` and `formatTime` used to each
  repeat the same 12-hour-clock math — that's now one shared helper,
  `to12HourClock`, removing the duplication.
- **`fetchWeatherByCoords`** is a new shared function. Previously, "search
  by city" contained all the fetch logic inline. Now both "search by city"
  and "use my location" call this same function, so the actual weather-API
  call exists in exactly one place.
- Variable and function names were made more explicit (e.g. `cityName`
  instead of `cityName` reused ambiguously, `handleHistorySelect` instead
  of an anonymous inline arrow function).

**Why:** less duplication means fewer places a bug can hide, and a new
contributor can find "the code that calls the weather API" in seconds.

## 3. UX Improvements
- **Search button disabled while loading** (`disabled={loading}` in
  `SearchBar`), and its label changes to "Searching..." so it's obvious
  something is happening.
- **Loading spinner** — a small CSS-animated spinner (`LoadingSpinner.js` +
  `.spinner` keyframes in `style.css`) replaces the plain "Loading..." text.
- **Enter key search** — the input and button live inside a `<form>`, and
  submitting a form (which Enter does automatically for a text input)
  calls `onSearch`. No extra keydown listener needed.
- **Auto-trim spaces** — `cityName.trim()` runs before the city is ever
  sent to the API, so `"  lahore  "` behaves exactly like `"lahore"`.

**Why:** these are small touches, but they're what makes an app feel
finished instead of like a rough prototype.

## 4. Error Handling Improvements
- **Empty search blocked** — if the trimmed input is empty, we show
  "Please enter a city name." and never call the API.
- **Network failures** — every `fetch` call is wrapped in `try/catch`.
  If the user is offline or the API times out, they see a friendly message
  ("Could not load weather data. Please check your internet connection...")
  instead of a blank screen or a console error only they can't see.
- **City not found** — handled separately from network errors, with its
  own specific message ("City not found. Please check the spelling...").
- **Geolocation errors** — if the user denies location access or it's
  unsupported, they get a clear message instead of the app hanging on
  "Loading...".

**Why:** users should never see a frozen spinner or a dead end — they
should always know what went wrong and, ideally, what to do next.

## 5. "Use My Location" Button (new feature)
Uses the browser's built-in `navigator.geolocation.getCurrentPosition()`
to get the user's coordinates, then calls the same `fetchWeatherByCoords`
function used for city search. A free reverse-geocoding API
(BigDataCloud) turns those coordinates into a readable place name; if that
call fails for any reason, the app falls back to labeling it "Your
Location" rather than breaking.

## 6. Search History (new feature)
The last 5 searched cities are stored in React state and mirrored to
`localStorage` (`weatherApp_history`), so they survive a page refresh.
Duplicate entries are removed (searching "Lahore" twice doesn't create two
chips), and clicking a chip re-runs the search for that city.

## 7. Dark Mode (new feature)
A `ThemeToggle` button switches between `"light"` and `"dark"`, saved to
`localStorage` (`weatherApp_theme`) so the choice persists. The switch is
implemented with **CSS variables**: `:root` defines the light palette,
`body.dark` overrides the same variable names with dark values, and every
card/button in `style.css` references `var(--card-bg)`, `var(--text-main)`,
etc. This means dark mode needed zero duplicate CSS rules — just one
override block.

## 8. Performance Optimizations
- **`useMemo`** — `next24Hours` (the hourly forecast data) is recalculated
  with `useMemo(() => getNext24Hours(...), [weatherData])`, so it's only
  recomputed when `weatherData` actually changes, not on every re-render
  (e.g. when the user is just typing in the search box).
- **`useCallback`** — event handlers like `handleSearch`,
  `handleUseLocation`, `handleHistorySelect`, `toggleTheme`, and the fetch
  functions are wrapped in `useCallback` with correct dependency arrays.
  This keeps their function reference stable across re-renders, which
  matters once components are split apart (as they are now) since it
  avoids passing a "new" function prop to children on every render.
- **Lazy `useState` initializers** — `history` and `theme` are loaded from
  `localStorage` using `useState(() => loadFromStorage(...))`. The
  function form means `localStorage` is read once on mount, not on every
  render.

## 9. CSS Improvements
- Converted repeated color values into **CSS variables** for a proper
  light/dark theme system.
- Added **hover and transition effects**: cards lift slightly on hover
  (`transform: translateY(-4px)`), buttons darken smoothly, and the
  background gradient and text colors transition smoothly when toggling
  dark mode (`transition: background 0.4s ease, color 0.4s ease`).
- Improved **responsiveness**: a dedicated `@media (max-width: 600px)`
  block stacks the header/search on small screens and makes buttons/input
  full-width, on top of the flex-wrap/grid layout that was already
  responsive.
- The original visual design (gradient background, card style, layout,
  colors) is unchanged — dark mode uses a separate palette rather than
  altering the light theme.

## 10. API / Functionality
The Open-Meteo geocoding + forecast endpoints, and every existing feature
(current weather, sunrise/sunset, 24-hour forecast, 5-day forecast) are
untouched. Nothing that worked before was removed or altered — only
reorganized, and extended with the features above.

## 11. Comments
Every file has short comments explaining *why*, not just *what*, so it
stays beginner-friendly (e.g. why `useMemo` is used on `next24Hours`, why
`fetchWeatherByCoords` is shared between two features).

## 12. Other React Best Practices Applied
- Components receive data only through **props** — no component reaches
  into another's state directly.
- **Controlled inputs** — the search box's value always comes from React
  state, never read directly from the DOM.
- **Keys on list items** (`.map()` calls) use stable values (city name,
  date string) instead of array index where possible, so React can track
  items correctly across re-renders.
- **Accessibility** — `aria-label`s added to the search input and theme
  toggle button for screen readers.

---

## How to Run
Because the app is now split into multiple files loaded via `<script src="...">`,
opening `index.html` directly (double-click) can be blocked by the browser's
CORS policy for local files. Use one of these instead:
- **VS Code:** install the "Live Server" extension → right-click
  `index.html` → "Open with Live Server"
- **Terminal:** run `python3 -m http.server` in the project folder, then
  open `http://localhost:8000`

## Verified Working
Every JS file was individually syntax-checked with Babel before delivery
to confirm there are no typos or broken JSX. Since this environment can't
reach the Open-Meteo/BigDataCloud APIs directly, please do a quick manual
test after downloading: search a city, try "Use My Location", click a
history chip, and toggle dark mode.

## Repository Naming (per internship instructions)
`Syntecxhub_Weather_App`
