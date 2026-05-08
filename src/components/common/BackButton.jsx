function BackButton({ className = "", onClick }) {
  return (
    <button className={`page-back-button ${className}`.trim()} onClick={onClick}>
      &lt;
    </button>
  );
}

export default BackButton;
