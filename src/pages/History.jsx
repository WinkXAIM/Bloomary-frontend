import { useState, useEffect } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import { getHistory, deleteFromHistory } from "./historyStorage";
import "./History.css";

function formatDate(isoString) {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function History({ onBack, onView }) {
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    setHistoryList(getHistory());
  }, []);

  function handleView(id) {
    localStorage.setItem("selectedHistoryId", String(id));
    onView();
  }

  function handleDelete(id) {
    deleteFromHistory(id);
    setHistoryList(getHistory());
  }

  return (
    <PageShell className="history-page">
      <BackButton onClick={onBack} />

      <PageTitle>분석 히스토리</PageTitle>

      <p className="history-count">총 {historyList.length}개의 분석 기록</p>

      <section className="history-list">
        {historyList.length === 0 ? (
          <div className="history-empty">
            <p className="history-empty-icon">🌸</p>
            <p className="history-empty-text">아직 분석 기록이 없어요.</p>
            <p className="history-empty-sub">꽃다발 사진을 분석해보세요!</p>
          </div>
        ) : (
          historyList.map((item) => (
            <article className="history-card" key={item.id}>
              <div className="history-thumb">
                {item.image_url ? (
                  <img src={item.image_url} alt="꽃다발" />
                ) : (
                  "꽃"
                )}
              </div>

              <div className="history-info">
                <p className="history-date">{formatDate(item.created_at)}</p>
                <h2 className="history-flower-name">
                  {item.flower_list.map((f) => f.name).join(", ")}
                </h2>
                <p className="history-meaning">{item.story_message}</p>
              </div>

              <button
                className="history-delete-button"
                onClick={() => handleDelete(item.id)}
              >
                삭제
              </button>
              <AppButton
                className="history-view-button"
                onClick={() => handleView(item.id)}
              >
                보기
              </AppButton>
            </article>
          ))
        )}
      </section>

      <p className="history-notice">최근 30일간의 기록을 표시합니다</p>
    </PageShell>
  );
}

export default History;
