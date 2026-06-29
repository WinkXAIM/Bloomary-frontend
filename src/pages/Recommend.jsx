import { useEffect, useMemo, useRef, useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import { getRecommendation } from "../api/bloomaryApi";
import "./Recommend.css";

const COPY = {
  pageTitle: "\uaf43\ub2e4\ubc1c \ucd94\ucc9c",
  questionFirst: "\uc5b4\ub5a4 \uc0c1\ud669\uc5d0",
  questionSecond: "\uc120\ubb3c\ud558\uc2dc\ub098\uc694?",
  placeholder: "\uc608: \uc5ec\uc790\uce5c\uad6c \uc0dd\uc77c \uc120\ubb3c...",
  submit: "\ucd94\ucc9c\ubc1b\uae30",
  resultLabel: "\ucd94\ucc9c \uacb0\uacfc",
  emptyResult: "\uc0c1\ud669\uc744 \uc785\ub825\ud558\uace0 \ucd94\ucc9c\uc744 \ubc1b\uc544\ubcf4\uc138\uc694.",
  again: "\ub2e4\ub978 \ucd94\ucc9c \ubcf4\uae30",
  loadingTitle: "\uaf43\ub2e4\ubc1c\uc744 \ucd94\ucc9c\ud558\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc0c1\ud669\uc5d0 \uc5b4\uc6b8\ub9ac\ub294 \uaf43\ub9d0 \uc870\ud569\uc744 \ucc3e\ub294 \uc911\uc785\ub2c8\ub2e4.",
  fallbackError: "\uaf43\ub2e4\ubc1c \ucd94\ucc9c\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.",
};

function Recommend({ onBack }) {
  const recommendAbortRef = useRef(null);
  const [situation, setSituation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      recommendAbortRef.current?.abort();
    };
  }, []);

  const handleRecommend = async () => {
    if (!situation.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");
    recommendAbortRef.current?.abort();
    const abortController = new AbortController();
    recommendAbortRef.current = abortController;

    try {
      const nextRecommendation = await getRecommendation(situation.trim(), {
        signal: abortController.signal,
      });
      setRecommendation(nextRecommendation);
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Failed to get recommendation.", error);
      setErrorMessage(error.message || COPY.fallbackError);
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const recommendedFlowers = useMemo(
    () => recommendation?.flowers?.map((flower) => flower.nameKo || flower.nameEn).filter(Boolean).join(" + ") ?? "",
    [recommendation],
  );

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
        {recommendation ? (
          <>
            <h2>{recommendation.title}</h2>
            <p className="recommend-flowers">{recommendedFlowers}</p>
            <p className="recommend-message">{recommendation.content}</p>
          </>
        ) : (
          <p className="recommend-message">{errorMessage || COPY.emptyResult}</p>
        )}
      </section>

      <AppButton
        className="recommend-again-button"
        variant="secondary"
        disabled={!recommendation || isLoading}
        onClick={() => {
          setRecommendation(null);
          setSituation("");
          setErrorMessage("");
        }}
      >
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
