import { useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./Recommend.css";

const COPY = {
  pageTitle: "\uaf43\ub2e4\ubc1c \ucd94\ucc9c",
  questionFirst: "\uc5b4\ub5a4 \uc0c1\ud669\uc5d0",
  questionSecond: "\uc120\ubb3c\ud558\uc2dc\ub098\uc694?",
  placeholder: "\uc608: \uc5ec\uc790\uce5c\uad6c \uc0dd\uc77c \uc120\ubb3c...",
  submit: "\ucd94\ucc9c\ubc1b\uae30",
  resultLabel: "\ucd94\ucc9c \uacb0\uacfc",
  resultTitle: "\ud504\ub85c\ud3ec\uc988 \uaf43\ub2e4\ubc1c",
  resultFlowers: "\ube68\uac04 \uc7a5\ubbf8 7\uc1a1\uc774 + \uc548\uac1c\uaf43 + \uc720\uce7c\ub9bd\ud22c\uc2a4",
  resultMessage: '"\uc5f4\uc815\uc801\uc778 \uc0ac\ub791\uacfc \uc601\uc6d0\ud55c \uc57d\uc18d\uc744 \ud45c\ud604\ud569\ub2c8\ub2e4."',
  again: "\ub2e4\ub978 \ucd94\ucc9c \ubcf4\uae30",
  loadingTitle: "\uaf43\ub2e4\ubc1c\uc744 \ucd94\ucc9c\ud558\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc0c1\ud669\uc5d0 \uc5b4\uc6b8\ub9ac\ub294 \uaf43\ub9d0 \uc870\ud569\uc744 \ucc3e\ub294 \uc911\uc785\ub2c8\ub2e4.",
};

function Recommend({ onBack }) {
  const [situation, setSituation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRecommend = () => {
    if (!situation.trim() || isLoading) return;

    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <PageShell className="recommend-page">
      <BackButton onClick={onBack} />

      <PageTitle>{COPY.pageTitle}</PageTitle>

      <h2 className="recommend-question">
        {COPY.questionFirst}
        <br />
        {COPY.questionSecond}
      </h2>

      <textarea
        className="recommend-input"
        placeholder={COPY.placeholder}
        value={situation}
        disabled={isLoading}
        onChange={(event) => setSituation(event.target.value)}
      />

      <AppButton
        className="recommend-submit-button"
        disabled={!situation.trim() || isLoading}
        onClick={handleRecommend}
      >
        {COPY.submit}
      </AppButton>

      <p className="section-label recommend-section-label">{COPY.resultLabel}</p>
      <div className="section-line recommend-line" />

      <section className="recommend-result">
        <h2>{COPY.resultTitle}</h2>
        <p className="recommend-flowers">{COPY.resultFlowers}</p>
        <p className="recommend-message">{COPY.resultMessage}</p>
      </section>

      <AppButton className="recommend-again-button" variant="secondary">
        {COPY.again}
      </AppButton>
      <LoadingOverlay
        isOpen={isLoading}
        title={COPY.loadingTitle}
        description={COPY.loadingDescription}
      />
    </PageShell>
  );
}

export default Recommend;
