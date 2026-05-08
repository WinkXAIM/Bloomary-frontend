import { useEffect } from "react";
import "./Login.css";

function Login({ onLogin }) {
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init("40de8269c06809463d8206e48eeabd26");
      console.log("✅ Kakao SDK 초기화 완료");
    }
  }, []);

  const handleKakaoLogin = () => {
    window.Kakao.Auth.authorize({
      redirectUri: "http://localhost:5174",
    });
  };

  return (
    <main className="login-page">
      <section className="login-logo-box">
        <h1 className="login-title">Bloomary</h1>
        <p className="login-subtitle">GGOTTMAL</p>
      </section>

      <button className="kakao-login-button" onClick={handleKakaoLogin}>
        카카오로 시작하기
      </button>

      <p className="login-notice">로그인 시 이용약관에 동의하게 됩니다</p>
    </main>
  );
}

export default Login;
