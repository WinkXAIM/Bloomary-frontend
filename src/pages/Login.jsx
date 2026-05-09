import { useEffect } from "react";
import PageShell from "../components/common/PageShell";
import LeonSansLogo from "../components/LeonSansLogo";
import "./Login.css";

function Login({ onLogin }) {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("40de8269c06809463d8206e48eeabd26");
      console.log("Kakao SDK initialized");
    }
  }, []);

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      onLogin();
      return;
    }

    window.Kakao.Auth.authorize({
      redirectUri: "http://localhost:5174",
    });
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
