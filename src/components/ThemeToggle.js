// Light/Dark mode switch button. The actual theme value and its
// localStorage persistence are handled by App.js - this component
// only displays the current state and reports clicks.
function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Toggle light or dark mode"
      title="Toggle Light/Dark Mode"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
