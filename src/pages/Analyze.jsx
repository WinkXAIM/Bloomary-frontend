import { useState } from "react";
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
    <main className="analyze-page">
      <button className="analyze-back-button" onClick={onBack}>
        &lt;
      </button>

      <h1 className="analyze-title">꽃말 확인</h1>

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

      <button className="analyze-button" onClick={onAnalyze}>분석하기</button>
    </main>
  );
}

export default Analyze;