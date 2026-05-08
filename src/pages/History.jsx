import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./History.css";

const historyList = [
  {
    date: "2026.04.02",
    flowers: "장미, 튤립, 안개꽃",
    meaning: "Passionate Love",
  },
  {
    date: "2026.03.28",
    flowers: "해바라기, 카네이션",
    meaning: "Gratitude & Joy",
  },
  {
    date: "2026.03.20",
    flowers: "백합, 라벤더",
    meaning: "Purity & Grace",
  },
  {
    date: "2026.03.15",
    flowers: "장미, 카네이션, 유칼립투스",
    meaning: "Love & Thanks",
  },
];

function History({ onBack, onView }) {
  return (
    <PageShell className="history-page">
      <BackButton onClick={onBack} />

      <PageTitle>분석 히스토리</PageTitle>

      <p className="history-count">총 4개의 분석 기록</p>

      <section className="history-list">
        {historyList.map((item, index) => (
          <article className="history-card" key={index}>
            <div className="history-thumb">꽃</div>

            <div className="history-info">
              <p className="history-date">{item.date}</p>
              <h2>{item.flowers}</h2>
              <p className="history-meaning">{item.meaning}</p>
            </div>

            <AppButton className="history-view-button" onClick={onView}>
              보기
            </AppButton>
          </article>
        ))}
      </section>

      <p className="history-notice">최근 30일간의 기록을 표시합니다</p>
    </PageShell>
  );
}

export default History;
