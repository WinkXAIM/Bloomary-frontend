import { useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import "./Analyze.css";

function Analyze({ onBack, onAnalyze }) {
  const [preview, setPreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  return (
    <PageShell className="analyze-page">
      <BackButton onClick={onBack} />

      <PageTitle>꽃말 확인</PageTitle>

      <label className="upload-box">
        {preview ? (
          <img className="upload-preview" src={preview} alt="업로드 이미지" />
        ) : (
          <>
            <span className="upload-plus">+</span>
            <span className="upload-text">사진을 올려주세요</span>
          </>
        )}

        <input
          className="upload-input"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </label>

      <AppButton className="analyze-button" onClick={onAnalyze}>
        분석하기
      </AppButton>
    </PageShell>
  );
}

export default Analyze;
