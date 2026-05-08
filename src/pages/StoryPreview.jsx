import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./StoryPreview.css";

function StoryPreview({ onBack, onGoHome }) {
  return (
    <PageShell className="story-page">
      <BackButton onClick={onBack} />

      <PageTitle>스토리 미리보기</PageTitle>

      <section className="story-card">
        <div className="story-image-box">
          <span className="story-flower-icons">꽃</span>
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
        <AppButton className="theme-button dark">다크</AppButton>
        <AppButton className="theme-button light" variant="secondary">라이트</AppButton>
      </div>

      <AppButton className="save-image-button" variant="secondary">
        이미지 저장하기
      </AppButton>

      <AppButton className="go-home-button" variant="secondary" onClick={onGoHome}>
        홈으로 돌아가기
      </AppButton>
    </PageShell>
  );
}

export default StoryPreview;
