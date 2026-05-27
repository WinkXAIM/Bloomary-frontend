import PageShell from "../components/common/PageShell";
import LeonSansLogo from "../components/LeonSansLogo";
import "./Login.css";

function Login() {
  const handleKakaoLogin = () => {
    window.location.href = "http://127.0.0.1:8080/auth/kakao";
  };

  return (
    <PageShell className="login-page">
      <section className="login-logo-box">
        <LeonSansLogo text="Bloomary" size={50} color="#1a1a1a" />
        <p className="login-subtitle">GGOTTMAL</p>
      </section>

      <button className="kakao-login-button" onClick={handleKakaoLogin}>
        카카오로 시작하기
      </button>

      <p className="login-notice">로그인하면 이용약관에 동의하게 됩니다</p>
    </PageShell>
  );
}

export default Login;
