function PageShell({ className = "", children }) {
  const pageClassName = className.trim();

  return (
    <main className={`app-viewport ${pageClassName}`.trim()}>
      <div className={`app-page ${pageClassName}`.trim()}>{children}</div>
    </main>
  );
}

export default PageShell;
