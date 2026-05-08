function PageTitle({ className = "", children }) {
  return <h1 className={`page-title ${className}`.trim()}>{children}</h1>;
}

export default PageTitle;
