// A simple spinner + message, shown while we wait for the weather API.
function LoadingSpinner() {
  return (
    <div className="status-msg">
      <span className="spinner"></span>
      Loading weather data...
    </div>
  );
}
