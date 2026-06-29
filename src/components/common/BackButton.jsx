function BackButton({ className = "", onClick }) {
  return (
    <button
      className={`page-back-button ${className}`.trim()}
      type="button"
      aria-label="\ub4a4\ub85c \uac00\uae30"
      onClick={onClick}
    >
      <span aria-hidden="true">&lt;</span>
    </button>
  );
}

export default BackButton;
