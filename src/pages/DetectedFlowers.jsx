import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./DetectedFlowers.css";

function DetectedFlowers({ onBack, onGoResult }) {
  return (
    <PageShell className="detected-page">
      <BackButton onClick={onBack} />

      <PageTitle>인식 결과</PageTitle>

      <section className="detected-image-box">
        <div className="flower-box rose">
          <span>장미</span>
        </div>
        <div className="flower-box tulip">
          <span>튤립</span>
        </div>
        <div className="flower-box baby">
          <span>안개꽃</span>
        </div>
      </section>

      <p className="detected-section-title">인식된 꽃</p>
      <div className="section-line detected-line" />

      <section className="detected-list">
        <div className="detected-item">
          <div className="item-bar" />
          <div>
            <h2>빨간 장미</h2>
            <p>정확도 98%</p>
          </div>
        </div>

        <div className="detected-item">
          <div className="item-bar" />
          <div>
            <h2>튤립</h2>
            <p>정확도 95%</p>
          </div>
        </div>

        <div className="detected-item">
          <div className="item-bar" />
          <div>
            <h2>안개꽃</h2>
            <p>정확도 92%</p>
          </div>
        </div>
      </section>

      <AppButton className="flower-meaning-button" onClick={onGoResult}>
        꽃말 확인하기
      </AppButton>

      <AppButton className="retry-button" variant="ghost" onClick={onBack}>
        인식이 잘못되었나요? 다시 촬영해보세요
      </AppButton>
    </PageShell>
  );
}

export default DetectedFlowers;
