import "./Result.css";

function Result({ onBack, onGoStory }) {
  return (
    <main className="result-page">
      <button className="result-back-button" onClick={onBack}>
        &lt;
      </button>

      <h1 className="result-title">분석 결과</h1>

      <section className="result-image-box">
        <span className="result-flower-icon">🌸</span>
      </section>

      <p className="result-section-label flower-label">인식된 꽃</p>
      <div className="result-line flower-line" />

      <section className="flower-meaning-list">
        <div className="flower-meaning-item">
          <h2>빨간 장미</h2>
          <p>열정적인 사랑</p>
        </div>

        <div className="flower-meaning-item">
          <h2>튤립</h2>
          <p>영원한 사랑</p>
        </div>

        <div className="flower-meaning-item">
          <h2>안개꽃</h2>
          <p>순수, 청순</p>
        </div>
      </section>

      <p className="result-section-label ai-label">AI 해석</p>
      <div className="result-line ai-line" />

      <p className="ai-message">
        "열정적이고 영원한 사랑을
        <br />
        순수하게 전하는 꽃다발입니다."
      </p>

      <button className="story-preview-button" onClick={onGoStory}>스토리 미리보기</button>

    </main>
  );
}

export default Result;