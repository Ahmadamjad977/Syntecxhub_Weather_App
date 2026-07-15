// Small presentational component - shows nothing if there is no error.
// Keeping this logic here means App.js doesn't need an if/else for it.
function ErrorMessage({ message }) {
  if (!message) return null;

  return <p className="error-msg">⚠️ {message}</p>;
}
