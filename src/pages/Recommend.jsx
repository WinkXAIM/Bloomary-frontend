import "./Recommend.css";

function Recommend({ onBack }) {
  return (
    <main className="recommend-page">
      <button className="recommend-back-button" onClick={onBack}>
        &lt;
      </button>

      <h1 className="recommend-title">꽃다발 추천</h1>

      <h2 className="recommend-question">
        어떤 상황에
        <br />
        선물하시나요?
      </h2>

      <textarea
        className="recommend-input"
        placeholder="예: 여자친구 생일에..."
      />

      <button className="recommend-submit-button">추천받기</button>

      <p className="recommend-section-label">추천 결과</p>
      <div className="recommend-line" />

      <section className="recommend-result">
        <h2>프로포즈 꽃다발</h2>
        <p className="recommend-flowers">
          빨간 장미 7송이 + 안개꽃 + 유칼립투스
        </p>
        <p className="recommend-message">
          "열정적인 사랑과 영원한 약속을 전합니다"
        </p>
      </section>

      <button className="recommend-again-button">다른 추천 보기</button>
    </main>
  );
}

export default Recommend;