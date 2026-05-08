import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./Result.css";

function Result({ onBack, onGoStory }) {
  return (
    <PageShell className="result-page">
      <BackButton onClick={onBack} />

      <PageTitle>분석 결과</PageTitle>

      <section className="result-image-box">
        <span className="result-flower-icon">꽃</span>
      </section>

      <p className="section-label result-section-label flower-label">인식된 꽃</p>
      <div className="section-line result-line flower-line" />

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
          <p>순수, 천진</p>
        </div>
      </section>

      <p className="section-label result-section-label ai-label">AI 해석</p>
      <div className="section-line result-line ai-line" />

      <p className="ai-message">
        "열정적이고 영원한 사랑을
        <br />
        순수하게 전하는 꽃다발입니다."
      </p>

      <AppButton className="story-preview-button" onClick={onGoStory}>
        스토리 미리보기
      </AppButton>
    </PageShell>
  );
}

export default Result;
