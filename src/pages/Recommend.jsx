import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./Recommend.css";

function Recommend({ onBack }) {
  return (
    <PageShell className="recommend-page">
      <BackButton onClick={onBack} />

      <PageTitle>꽃다발 추천</PageTitle>

      <h2 className="recommend-question">
        어떤 상황에
        <br />
        선물하시나요?
      </h2>

      <textarea
        className="recommend-input"
        placeholder="예: 여자친구 생일 선물..."
      />

      <AppButton className="recommend-submit-button">추천받기</AppButton>

      <p className="section-label recommend-section-label">추천 결과</p>
      <div className="section-line recommend-line" />

      <section className="recommend-result">
        <h2>프로포즈 꽃다발</h2>
        <p className="recommend-flowers">
          빨간 장미 7송이 + 안개꽃 + 유칼립투스
        </p>
        <p className="recommend-message">
          "열정적인 사랑과 영원한 약속을 표현합니다"
        </p>
      </section>

      <AppButton className="recommend-again-button" variant="secondary">
        다른 추천 보기
      </AppButton>
    </PageShell>
  );
}

export default Recommend;
