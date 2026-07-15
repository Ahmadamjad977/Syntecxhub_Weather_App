// Shows up to 5 recently searched cities as clickable "chips".
// Clicking one searches that city again.
function SearchHistory({ history, onSelect }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="history-row">
      <span className="history-label">Recent:</span>
      {history.map((cityName) => (
        <button
          key={cityName}
          type="button"
          className="history-chip"
          onClick={() => onSelect(cityName)}
        >
          {cityName}
        </button>
      ))}
    </div>
  );
}
