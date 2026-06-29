import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import { getAnalysis } from "../api/bloomaryApi";
import useFilePreviewUrl from "../hooks/useFilePreviewUrl";
import "./Result.css";

const COPY = {
  title: "\ubd84\uc11d \uacb0\uacfc",
  imageAlt: "\ubd84\uc11d\ud55c \uaf43\ub2e4\ubc1c",
  flowersLabel: "\uc778\uc2dd\ub41c \uaf43",
  aiLabel: "AI \ud574\uc11d",
  empty: "\ubd84\uc11d \uacb0\uacfc\ub97c \ucc3e\uc744 \uc218 \uc5c6\uc5b4\uc694.",
  storyButton: "\uc2a4\ud1a0\ub9ac \ubbf8\ub9ac\ubcf4\uae30",
  loadingTitle: "\ubd84\uc11d \uacb0\uacfc\ub97c \ubd88\ub7ec\uc624\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc800\uc7a5\ub41c \uaf43\ub9d0\uacfc \uc774\ubbf8\uc9c0\ub97c \ud655\uc778\ud558\ub294 \uc911\uc785\ub2c8\ub2e4.",
  fallbackError: "\ubd84\uc11d \uacb0\uacfc \uc870\ud68c\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.",
  fallbackImage: "\uaf43",
};

function Result({ onBack, onGoStory }) {
  const location = useLocation();
  const routeAnalysis = location.state?.analysis ?? null;
  const analysisId = location.state?.analysisId ?? routeAnalysis?.id;
  const uploadedImageFile = location.state?.imageFile ?? null;
  const [analysis, setAnalysis] = useState(routeAnalysis);
  const [isLoading, setIsLoading] = useState(Boolean(analysisId && !routeAnalysis));
  const [errorMessage, setErrorMessage] = useState("");
  const uploadedImageUrl = useFilePreviewUrl(uploadedImageFile);

  useEffect(() => {
    if (!analysisId || routeAnalysis?.id === analysisId) {
      return;
    }

    const abortController = new AbortController();

    getAnalysis(analysisId, { signal: abortController.signal })
      .then((nextAnalysis) => {
        setAnalysis(nextAnalysis);
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        console.error("Failed to load analysis.", error);
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
  }, [analysisId, routeAnalysis]);

  const flowers = analysis?.flowers ?? [];
  const aiMessage = analysis?.content || analysis?.summary || COPY.empty;
  const displayImageUrl = analysis?.imageUrl || uploadedImageUrl;

  return (
    <PageShell className="result-page">
      <BackButton onClick={onBack} />

      <PageTitle>{COPY.title}</PageTitle>

      <section className="result-image-box">
        {displayImageUrl ? (
          <img className="result-image" src={displayImageUrl} alt={COPY.imageAlt} />
        ) : (
          <span className="result-flower-icon">{COPY.fallbackImage}</span>
        )}
      </section>

      <p className="section-label result-section-label flower-label">{COPY.flowersLabel}</p>
      <div className="section-line result-line flower-line" />

      <section className="flower-meaning-list">
        {flowers.length === 0 ? (
          <div className="flower-meaning-item">
            <p>{errorMessage || COPY.empty}</p>
          </div>
        ) : (
          flowers.map((flower) => (
            <div className="flower-meaning-item" key={flower.id ?? flower.name}>
              <h2>{flower.nameKo || flower.name}</h2>
              <p>{flower.meaning}</p>
            </div>
          ))
        )}
      </section>

      <p className="section-label result-section-label ai-label">{COPY.aiLabel}</p>
      <div className="section-line result-line ai-line" />

      <p className="ai-message">{aiMessage}</p>

      <AppButton
        className="story-preview-button"
        onClick={() => onGoStory(analysis, { imageFile: uploadedImageFile })}
        disabled={!analysis}
      >
        {COPY.storyButton}
      </AppButton>

      <LoadingOverlay
        isOpen={isLoading}
        title={COPY.loadingTitle}
        description={COPY.loadingDescription}
      />
    </PageShell>
  );
}

export default Result;
