import AppButton from "../components/common/AppButton";
import PageShell from "../components/common/PageShell";
import LeonSansLogo from "../components/LeonSansLogo";
import "./Home.css";

function Home({ onGoAnalyze, onGoHistory, onGoRecommend }) {
  return (
    <PageShell className="home-page">
      <LeonSansLogo text="Bloomary" size={32} color="#1a1a1a" />

      <section className="home-greeting">
        <p>안녕하세요</p>
        <p className="bold">무엇을 도와드릴까요?</p>
      </section>

      <section className="home-card">
        <h2>꽃말 확인하기</h2>
        <p>
          꽃다발 사진을 올리면
          <br />
          AI가 꽃말을 알려드려요
        </p>
        <AppButton onClick={onGoAnalyze}>사진 분석</AppButton>
      </section>

      <section className="home-card second">
        <h2>꽃다발 추천받기</h2>
        <p>
          상황을 알려주시면
          <br />
          어울리는 꽃을 추천해요
        </p>
        <AppButton onClick={onGoRecommend}>추천받기</AppButton>
      </section>

      <AppButton className="history-button" variant="ghost" onClick={onGoHistory}>
        분석 히스토리 보기
      </AppButton>

      <AppButton className="logout-button" variant="ghost">
        로그아웃
      </AppButton>
    </PageShell>
  );
}

export default Home;
