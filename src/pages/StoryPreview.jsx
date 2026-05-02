import "./StoryPreview.css";

function StoryPreview({ onBack, onGoHome }) {
  return (
    <main className="story-page">
      <button className="story-back-button" onClick={onBack}>
        &lt;
      </button>

      <h1 className="story-title">스토리 미리보기</h1>

      <section className="story-card">
        <div className="story-image-box">
          <span className="story-flower-icons">🌸🌹💐</span>
        </div>

        <p className="story-message">
          "Passionate love,
          <br />
          delivered with purity"
        </p>

        <p className="story-flowers">
          Rose · Tulip · Baby&apos;s Breath
        </p>

        <p className="story-brand">Bloomary</p>
      </section>

      <div className="story-theme-buttons">
        <button className="theme-button dark">다크</button>
        <button className="theme-button light">라이트</button>
      </div>

      <button className="save-image-button">
        이미지 저장하기
      </button>

      <button className="save-image-button">이미지 저장하기</button>

      <button className="go-home-button" onClick={onGoHome}>
        홈으로 돌아가기
      </button>
    </main>
  );
}

export default StoryPreview;