// Handles typing a city name, submitting the search (button click OR
// pressing Enter, since both trigger a form's onSubmit), and the
// "Use My Location" button.
function SearchBar({ inputValue, onInputChange, onSearch, onUseLocation, loading }) {
  function handleSubmit(event) {
    // Prevents the page from refreshing. This also fires when the
    // user presses Enter inside the input, so Enter-to-search works
    // automatically without any extra key-press code.
    event.preventDefault();
    onSearch();
  }

  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Enter city name (e.g. Lahore)"
        aria-label="City name"
        disabled={loading}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      <button
        type="button"
        className="location-btn"
        onClick={onUseLocation}
        disabled={loading}
      >
        📍 Use My Location
      </button>
    </form>
  );
}
