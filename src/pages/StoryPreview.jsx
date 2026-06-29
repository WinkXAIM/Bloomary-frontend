import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import useFilePreviewUrl from "../hooks/useFilePreviewUrl";
import "./StoryPreview.css";

const COPY = {
  title: "\uc2a4\ud1a0\ub9ac \ubbf8\ub9ac\ubcf4\uae30",
  dark: "\ub2e4\ud06c",
  light: "\ub77c\uc774\ud2b8",
  save: "\uc774\ubbf8\uc9c0 \uc800\uc7a5\ud558\uae30",
  home: "\ud648\uc73c\ub85c \ub3cc\uc544\uac00\uae30",
  fallbackStory: "Bloomary message is being prepared.",
  fallbackImage: "\uaf43",
};

function StoryPreview({ onBack, onGoHome }) {
  const location = useLocation();
  const analysis = location.state?.analysis;
  const uploadedImageFile = location.state?.imageFile ?? null;
  const [theme, setTheme] = useState("dark");
  const uploadedImageUrl = useFilePreviewUrl(uploadedImageFile);
  const story = analysis?.story || analysis?.content || COPY.fallbackStory;
  const displayImageUrl = analysis?.imageUrl || uploadedImageUrl;
  const flowers = useMemo(
    () => analysis?.flowers?.map((flower) => flower.nameEn || flower.nameKo).filter(Boolean).join(" \u00b7 "),
    [analysis],
  );

  return (
    <PageShell className="story-page">
      <BackButton onClick={onBack} />

      <PageTitle>{COPY.title}</PageTitle>

      <section className={`story-card ${theme}`}>
        <div className="story-image-box">
          {displayImageUrl ? (
            <img className="story-image" src={displayImageUrl} alt={COPY.title} />
          ) : (
            <span className="story-flower-icons">{COPY.fallbackImage}</span>
          )}
        </div>

        <p className="story-message">{story}</p>

        <p className="story-flowers">{flowers || "Bloomary"}</p>

        <p className="story-brand">Bloomary</p>
      </section>

      <div className="story-theme-buttons">
        <AppButton className="theme-button dark" onClick={() => setTheme("dark")}>
          {COPY.dark}
        </AppButton>
        <AppButton className="theme-button light" variant="secondary" onClick={() => setTheme("light")}>
          {COPY.light}
        </AppButton>
      </div>

      <AppButton className="save-image-button" variant="secondary" disabled>
        {COPY.save}
      </AppButton>

      <AppButton className="go-home-button" variant="secondary" onClick={onGoHome}>
        {COPY.home}
      </AppButton>
    </PageShell>
  );
}

export default StoryPreview;
