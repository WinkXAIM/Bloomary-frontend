import AppButton from "../components/common/AppButton";
import PageShell from "../components/common/PageShell";
import LeonSansLogo from "../components/LeonSansLogo";
import "./Home.css";

const COPY = {
  greeting: "\uc548\ub155\ud558\uc138\uc694",
  question: "\ubb34\uc5c7\uc744 \ub3c4\uc640\ub4dc\ub9b4\uae4c\uc694?",
  analyzeTitle: "\uaf43\ub9d0 \ud655\uc778\ud558\uae30",
  analyzeDescription: "\uaf43\ub2e4\ubc1c \uc0ac\uc9c4\uc744 \uc62c\ub9ac\uba74\nAI\uac00 \uaf43\ub9d0\uc744 \uc54c\ub824\ub4dc\ub824\uc694",
  analyzeButton: "\uc0ac\uc9c4 \ubd84\uc11d",
  recommendTitle: "\uaf43\ub2e4\ubc1c \ucd94\ucc9c\ubc1b\uae30",
  recommendDescription: "\uc0c1\ud669\uc744 \uc54c\ub824\uc8fc\uc2dc\uba74\n\uc5b4\uc6b8\ub9ac\ub294 \uaf43\uc744 \ucd94\ucc9c\ud574\uc694",
  recommendButton: "\ucd94\ucc9c\ubc1b\uae30",
  history: "\ubd84\uc11d \ud788\uc2a4\ud1a0\ub9ac \ubcf4\uae30",
  logout: "\ub85c\uadf8\uc544\uc6c3",
};

function Home({ onGoAnalyze, onGoHistory, onGoRecommend, onLogout }) {
  return (
    <PageShell className="home-page">
      <LeonSansLogo text="Bloomary" size={32} color="#1a1a1a" />

      <section className="home-greeting">
        <p>{COPY.greeting}</p>
        <p className="bold">{COPY.question}</p>
      </section>

      <section className="home-card">
        <h2>{COPY.analyzeTitle}</h2>
        <p>
          {COPY.analyzeDescription.split("\n").map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <AppButton onClick={onGoAnalyze}>{COPY.analyzeButton}</AppButton>
      </section>

      <section className="home-card second">
        <h2>{COPY.recommendTitle}</h2>
        <p>
          {COPY.recommendDescription.split("\n").map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <AppButton onClick={onGoRecommend}>{COPY.recommendButton}</AppButton>
      </section>

      <AppButton className="history-button" variant="ghost" onClick={onGoHistory}>
        {COPY.history}
      </AppButton>

      <AppButton className="logout-button" variant="ghost" onClick={onLogout}>
        {COPY.logout}
      </AppButton>
    </PageShell>
  );
}

export default Home;
