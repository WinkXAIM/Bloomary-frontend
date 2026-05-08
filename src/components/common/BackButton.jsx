function BackButton({ className = "", onClick }) {
  return (
    <button
      className={`page-back-button ${className}`.trim()}
      type="button"
      aria-label="뒤로가기"
      onClick={onClick}
    >
      <span aria-hidden="true">&lt;</span>
    </button>
  );
}

export default BackButton;
