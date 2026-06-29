import { useEffect, useRef, useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import { classifyFlowers } from "../api/bloomaryApi";
import "./Analyze.css";

const COPY = {
  title: "\uaf43\ub9d0 \ud655\uc778",
  uploadAlt: "\uc5c5\ub85c\ub4dc \uc774\ubbf8\uc9c0",
  uploadText: "\uc0ac\uc9c4\uc744 \uc62c\ub824\uc8fc\uc138\uc694",
  analyze: "\ubd84\uc11d\ud558\uae30",
  loadingTitle: "\uaf43\uc744 \ubd84\uc11d\ud558\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc0ac\uc9c4 \uc18d \uaf43\uc758 \ud2b9\uc9d5\uc744 \uc0b4\ud3b4\ubcf4\ub294 \uc911\uc785\ub2c8\ub2e4.",
};

function Analyze({ onBack, onAnalyze }) {
  const previewRef = useRef(null);
  const analyzeAbortRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    const imageUrl = URL.createObjectURL(file);

    previewRef.current = imageUrl;
    setSelectedFile(file);
    setPreview(imageUrl);
    setErrorMessage("");
  };

  useEffect(() => {
    return () => {
      analyzeAbortRef.current?.abort();
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage("");
    analyzeAbortRef.current?.abort();
    const abortController = new AbortController();
    analyzeAbortRef.current = abortController;

    try {
      const flowers = await classifyFlowers(selectedFile, preview, {
        signal: abortController.signal,
      });
      onAnalyze({
        imageFile: selectedFile,
        imageUrl: preview,
        flowers,
      });
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Failed to classify flowers.", error);
      setErrorMessage(error.message || "\uaf43 \uc778\uc2dd\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.");
    } finally {
      if (!abortController.signal.aborted) {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <PageShell className="analyze-page">
      <BackButton onClick={onBack} />

      <PageTitle>{COPY.title}</PageTitle>

      <label className="upload-box">
        {preview ? (
          <img className="upload-preview" src={preview} alt={COPY.uploadAlt} />
        ) : (
          <>
            <span className="upload-plus">+</span>
            <span className="upload-text">{COPY.uploadText}</span>
          </>
        )}

        <input
          className="upload-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </label>

      <AppButton
        className="analyze-button"
        onClick={handleAnalyze}
        disabled={!selectedFile || isAnalyzing}
      >
        {COPY.analyze}
      </AppButton>
      {errorMessage ? (
        <p className="section-label analyze-error-message">
          {errorMessage}
        </p>
      ) : null}
      <LoadingOverlay
        isOpen={isAnalyzing}
        title={COPY.loadingTitle}
        description={COPY.loadingDescription}
      />
    </PageShell>
  );
}

export default Analyze;
