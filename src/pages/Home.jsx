import "./Home.css";

function Home({ onGoAnalyze, onGoHistory, onGoRecommend }) {
  return (
    <main className="home-page">
        <h1 className="home-logo">Bloomary</h1>

        <section className="home-greeting">
            <p>안녕하세요.</p>
            <p className="bold">무엇을 도와드릴까요?</p>
        </section>

        <section className="home-card">
            <h2>꽃말 확인하기</h2>
            <p>
            꽃다발 사진을 올리면
            <br />
            AI가 꽃말을 알려드려요
            </p>
            <button onClick={onGoAnalyze}>사진 분석 →</button>
        </section>

    <section className="home-card second">
        <h2>꽃다발 추천받기</h2>
        <p>
            상황을 알려주시면
            <br />
            어울리는 꽃을 추천해요
        </p>
        <button onClick={onGoRecommend}>추천받기 →</button>
    </section>

    <button className="history-button" onClick={onGoHistory}>📋 분석 히스토리 보기</button>

      <button className="logout-button">로그아웃</button>
    </main>
  );
}

export default Home;