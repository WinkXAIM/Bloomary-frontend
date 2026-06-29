import { useEffect, useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import { getAnalyses } from "../api/bloomaryApi";
import "./History.css";

const COPY = {
  title: "\ubd84\uc11d \ud788\uc2a4\ud1a0\ub9ac",
  totalPrefix: "\ucd1d",
  totalSuffix: "\uac1c\uc758 \ubd84\uc11d \uae30\ub85d",
  emptyTitle: "\uc544\uc9c1 \ubd84\uc11d \uae30\ub85d\uc774 \uc5c6\uc5b4\uc694",
  emptySub: "\uaf43\ub2e4\ubc1c \uc0ac\uc9c4\uc744 \ubd84\uc11d\ud574\ubcf4\uc138\uc694!",
  view: "\ubcf4\uae30",
  notice: "\ucd5c\uc2e0 \ubd84\uc11d \uae30\ub85d\uc744 \ud45c\uc2dc\ud569\ub2c8\ub2e4.",
  cardSub: "\uc0c1\uc138 \uacb0\uacfc\uc5d0\uc11c \uaf43\ub9d0\uc744 \ud655\uc778\ud574\ubcf4\uc138\uc694.",
  fallbackSummary: "\uaf43\ub2e4\ubc1c \ubd84\uc11d",
  loadingTitle: "\ubd84\uc11d \uae30\ub85d\uc744 \ubd88\ub7ec\uc624\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc800\uc7a5\ub41c \uaf43\ub2e4\ubc1c \ubd84\uc11d\uc744 \ud655\uc778\ud558\ub294 \uc911\uc785\ub2c8\ub2e4.",
  fallbackError: "\ubd84\uc11d \uae30\ub85d \uc870\ud68c\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.",
  fallbackImage: "\uaf43",
};

function formatDate(isoString) {
  if (!isoString) return "";

  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function History({ onBack, onView }) {
  const [historyList, setHistoryList] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    getAnalyses({ page: 1, size: 30, signal: abortController.signal })
      .then((payload) => {
        setHistoryList(payload.analyses);
        setTotal(payload.total);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        console.error("Failed to load history.", error);
        setErrorMessage(error.message || COPY.fallbackError);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <PageShell className="history-page">
      <BackButton onClick={onBack} />

      <PageTitle>{COPY.title}</PageTitle>

      <p className="history-count">
        {COPY.totalPrefix} {total}
        {COPY.totalSuffix}
      </p>

      <section className="history-list">
        {errorMessage ? <p className="section-label">{errorMessage}</p> : null}
        {!errorMessage && historyList.length === 0 ? (
          <div className="history-empty">
            <p className="history-empty-icon">{COPY.fallbackImage}</p>
            <p className="history-empty-text">{COPY.emptyTitle}</p>
            <p className="history-empty-sub">{COPY.emptySub}</p>
          </div>
        ) : (
          historyList.map((item) => {
            const createdDate = formatDate(item.createdAt);
            const summary = item.summary || COPY.fallbackSummary;

            return (
              <article className="history-card" key={item.id}>
                <div className="history-thumb">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={summary} />
                  ) : (
                    COPY.fallbackImage
                  )}
                </div>

                <div className="history-info">
                  <p className="history-date">{createdDate || COPY.title}</p>
                  <h2 className="history-flower-name">{summary}</h2>
                  <p className="history-meaning">{COPY.cardSub}</p>
                </div>

                <AppButton className="history-view-button" onClick={() => onView(item.id)}>
                  {COPY.view}
                </AppButton>
              </article>
            );
          })
        )}
      </section>

      <p className="history-notice">{COPY.notice}</p>
      <LoadingOverlay
        isOpen={isLoading}
        title={COPY.loadingTitle}
        description={COPY.loadingDescription}
      />
    </PageShell>
  );
}

export default History;
