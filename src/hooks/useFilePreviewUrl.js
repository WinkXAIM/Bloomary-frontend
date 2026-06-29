import { useEffect, useState } from "react";

function useFilePreviewUrl(file, fallbackUrl = "") {
  const [previewState, setPreviewState] = useState({
    file: null,
    url: "",
  });

  useEffect(() => {
    if (!file) {
      return undefined;
    }

    let isActive = true;
    const reader = new FileReader();

    reader.onload = () => {
      if (isActive) {
        setPreviewState({
          file,
          url: typeof reader.result === "string" ? reader.result : "",
        });
      }
    };

    reader.onerror = () => {
      if (isActive) {
        setPreviewState({
          file,
          url: "",
        });
      }
    };

    reader.readAsDataURL(file);

    return () => {
      isActive = false;
      if (reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
    };
  }, [file]);

  if (!file) return fallbackUrl;
  return previewState.file === file ? previewState.url : "";
}

export default useFilePreviewUrl;
