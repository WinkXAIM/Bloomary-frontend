import "./Login.css";

function Login({ onLogin }) {
  return (
    <main className="login-page">
      <section className="login-logo-box">
        <h1 className="login-title">Bloomary</h1>
        <p className="login-subtitle">GGOTTMAL</p>
      </section>

      <button className="kakao-login-button" onClick={onLogin}>
        카카오로 시작하기
      </button>

      <p className="login-notice">로그인 시 이용약관에 동의하게 됩니다</p>
    </main>
  );
}

export default Login;