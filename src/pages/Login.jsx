import PageShell from "../components/common/PageShell";
import LeonSansLogo from "../components/LeonSansLogo";
import { getKakaoLoginUrl } from "../api/bloomaryApi";
import "./Login.css";

const COPY = {
  subtitle: "GGOTTMAL",
  kakaoLogin: "\uce74\uce74\uc624\ub85c \uc2dc\uc791\ud558\uae30",
  notice: "\ub85c\uadf8\uc778\ud558\uba74 \uc774\uc6a9\uc57d\uad00\uc5d0 \ub3d9\uc758\ud558\uac8c \ub429\ub2c8\ub2e4.",
};

function Login({ onLogin }) {
  const handleKakaoLogin = () => {
    const loginUrl = getKakaoLoginUrl();

    if (loginUrl) {
      window.location.href = loginUrl;
      return;
    }

    if (import.meta.env.DEV) {
      onLogin();
    }
  };

  return (
    <PageShell className="login-page">
      <section className="login-logo-box">
        <LeonSansLogo text="Bloomary" size={50} color="#1a1a1a" />
        <p className="login-subtitle">{COPY.subtitle}</p>
      </section>

      <button className="kakao-login-button" type="button" onClick={handleKakaoLogin}>
        {COPY.kakaoLogin}
      </button>

      <p className="login-notice">{COPY.notice}</p>
    </PageShell>
  );
}

export default Login;
