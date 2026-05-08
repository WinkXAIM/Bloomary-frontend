function PageShell({ className = "", children }) {
  return <main className={`app-page ${className}`.trim()}>{children}</main>;
}

export default PageShell;
