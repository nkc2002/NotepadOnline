function ErrorMessage({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="error-message">
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="close-btn">
          ×
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;

