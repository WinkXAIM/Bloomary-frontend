function AppButton({ className = "", variant = "primary", children, ...props }) {
  return (
    <button type="button" className={`app-button app-button-${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default AppButton;
