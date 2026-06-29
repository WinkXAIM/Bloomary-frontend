import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import DetectedFlowerCard from "../components/detected/DetectedFlowerCard";
import { createAnalysis } from "../api/bloomaryApi";
import useCardSwipe from "../hooks/useCardSwipe";
import useFilePreviewUrl from "../hooks/useFilePreviewUrl";
import usePhotoFlip from "../hooks/usePhotoFlip";
import "./DetectedFlowers.css";

const DOT_SIZE = 7;
const DOT_ACTIVE_WIDTH = 18;
const CARD_STEP = 315;
const CARD_CROP_SIZE = {
  width: 506,
  height: 684,
};
const CROP_PADDING_RATIO = 0.1;

const COPY = {
  title: "\uc778\uc2dd \uacb0\uacfc",
  cardLabel: "\uc778\uc2dd\ub41c \uaf43 \uce74\ub4dc",
  dotLabel: "\uaf43 \uce74\ub4dc \uc120\ud0dd",
  empty: "\uc778\uc2dd\ub41c \uaf43\uc774 \uc5c6\uc5b4\uc694.",
  submit: "\uaf43\ub9d0 \ud655\uc778\ud558\uae30",
  retry: "\uc778\uc2dd\uc774 \uc798\ubabb\ub418\uc5c8\ub098\uc694? \ub2e4\uc2dc \ucd2c\uc601\ud574\ubcf4\uc138\uc694",
  loadingTitle: "\uaf43\ub9d0\uc744 \ub9cc\ub4e4\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc778\uc2dd\ub41c \uaf43\uc744 \ubc14\ud0d5\uc73c\ub85c \uac10\uc131 \ubb38\uad6c\ub97c \uc900\ube44\ud558\ub294 \uc911\uc785\ub2c8\ub2e4.",
  fallbackError: "\uaf43\ub9d0 \uc0dd\uc131\uc5d0 \uc2e4\ud328\ud588\uc5b4\uc694.",
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getFlowerKey = (flower, index) => flower.id ?? `${flower.nameKo || flower.name || "flower"}-${index}`;

const normalizeColorHex = (value) => {
  if (!value || typeof value !== "string") return "";

  const color = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(color)) return color.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(color)) return `#${color.toUpperCase()}`;

  return "";
};

const hexToRgb = (hex) => {
  const color = normalizeColorHex(hex);
  if (!color) return null;

  return {
    r: Number.parseInt(color.slice(1, 3), 16),
    g: Number.parseInt(color.slice(3, 5), 16),
    b: Number.parseInt(color.slice(5, 7), 16),
  };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;

const mixRgb = (from, to, amount) => ({
  r: from.r + (to.r - from.r) * amount,
  g: from.g + (to.g - from.g) * amount,
  b: from.b + (to.b - from.b) * amount,
});

const colorizeBloom = (bloom, colorHex) => {
  const base = hexToRgb(colorHex);
  if (!base) return bloom;
  const softenedPetal = mixRgb(base, { r: 255, g: 255, b: 255 }, 0.2);
  const shadowPetal = mixRgb(base, { r: 40, g: 40, b: 40 }, 0.2);

  return {
    ...bloom,
    petal: rgbToHex(softenedPetal),
    petalDark: rgbToHex(shadowPetal),
  };
};

const hasBoundingBox = (flower) =>
  Array.isArray(flower.box2d) &&
  flower.box2d.length === 4 &&
  flower.box2d.every((coord) => Number.isFinite(Number(coord)));

function loadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageUrl;
  });
}

function getCropRect(box2d, imageWidth, imageHeight) {
  const coords = box2d.map(Number);
  if (coords.some((coord) => !Number.isFinite(coord))) return null;

  let [x1, y1, x2, y2] = coords;
  const maxCoord = Math.max(x1, y1, x2, y2);

  if (maxCoord <= 1.5) {
    x1 *= imageWidth;
    x2 *= imageWidth;
    y1 *= imageHeight;
    y2 *= imageHeight;
  }

  const left = clamp(Math.min(x1, x2), 0, imageWidth);
  const top = clamp(Math.min(y1, y2), 0, imageHeight);
  const right = clamp(Math.max(x1, x2), 0, imageWidth);
  const bottom = clamp(Math.max(y1, y2), 0, imageHeight);
  const boxWidth = right - left;
  const boxHeight = bottom - top;

  if (boxWidth < 2 || boxHeight < 2) return null;

  const padding = Math.max(boxWidth, boxHeight) * CROP_PADDING_RATIO;
  let cropLeft = clamp(left - padding, 0, imageWidth);
  let cropTop = clamp(top - padding, 0, imageHeight);
  let cropRight = clamp(right + padding, 0, imageWidth);
  let cropBottom = clamp(bottom + padding, 0, imageHeight);

  const targetAspect = CARD_CROP_SIZE.width / CARD_CROP_SIZE.height;
  const cropCenterX = (cropLeft + cropRight) / 2;
  const cropCenterY = (cropTop + cropBottom) / 2;
  let cropWidth = cropRight - cropLeft;
  let cropHeight = cropBottom - cropTop;

  if (cropWidth / cropHeight > targetAspect) {
    cropHeight = cropWidth / targetAspect;
  } else {
    cropWidth = cropHeight * targetAspect;
  }

  cropWidth = Math.min(cropWidth, imageWidth);
  cropHeight = Math.min(cropHeight, imageHeight);
  cropLeft = clamp(cropCenterX - cropWidth / 2, 0, imageWidth - cropWidth);
  cropTop = clamp(cropCenterY - cropHeight / 2, 0, imageHeight - cropHeight);

  return {
    x: cropLeft,
    y: cropTop,
    width: cropWidth,
    height: cropHeight,
  };
}

const canvasToImageUrl = (canvas) => canvas.toDataURL("image/jpeg", 0.9);

function extractDominantColorHex(context, width, height) {
  const { data } = context.getImageData(0, 0, width, height);
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let totalWeight = 0;

  for (let index = 0; index < data.length; index += 16) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const alpha = data[index + 3];
    if (alpha < 200) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const brightness = max / 255;

    if (brightness < 0.14 || brightness > 0.985 || saturation < 0.07) {
      continue;
    }

    const weight = (0.35 + saturation) * (0.45 + brightness);
    totalR += r * weight;
    totalG += g * weight;
    totalB += b * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return "";

  return rgbToHex({
    r: totalR / totalWeight,
    g: totalG / totalWeight,
    b: totalB / totalWeight,
  });
}

async function createFlowerCropUrl(sourceImage, box2d) {
  const cropRect = getCropRect(box2d, sourceImage.naturalWidth, sourceImage.naturalHeight);
  if (!cropRect) return { colorHex: "", imageUrl: "" };

  const canvas = document.createElement("canvas");
  canvas.width = CARD_CROP_SIZE.width;
  canvas.height = CARD_CROP_SIZE.height;

  const context = canvas.getContext("2d");
  if (!context) return { colorHex: "", imageUrl: "" };

  context.drawImage(
    sourceImage,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    CARD_CROP_SIZE.width,
    CARD_CROP_SIZE.height,
  );

  return {
    colorHex: extractDominantColorHex(context, CARD_CROP_SIZE.width, CARD_CROP_SIZE.height),
    imageUrl: canvasToImageUrl(canvas),
  };
}

function DetectedFlowers({ onBack, onGoResult }) {
  const location = useLocation();
  const hasAnalysisState = Boolean(location.state);
  const flowers = useMemo(() => location.state?.flowers ?? [], [location.state?.flowers]);
  const imageFile = location.state?.imageFile ?? null;
  const sourceImageUrl = useFilePreviewUrl(imageFile, location.state?.imageUrl ?? "");
  const hasPlayedIntroRef = useRef(false);
  const createAnalysisAbortRef = useRef(null);
  const photoFlipRef = useRef(null);
  const [flowerVisuals, setFlowerVisuals] = useState({});
  const [sourceImageSize, setSourceImageSize] = useState(null);
  const [hasIntroCompleted, setHasIntroCompleted] = useState(false);
  const [isCreatingMeaning, setIsCreatingMeaning] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const cardSwipe = useCardSwipe({
    cardStep: CARD_STEP,
    itemCount: flowers.length,
    onCardChange: (index) => {
      const nextFlower = flowers[index];
      if (nextFlower) {
        photoFlipRef.current?.resetTouchedPhoto(getFlowerKey(nextFlower, index));
      }
    },
  });
  const photoFlip = usePhotoFlip({
    isCardDragging: () => cardSwipe.isDragging(),
  });

  useEffect(() => {
    photoFlipRef.current = photoFlip;
  }, [photoFlip]);

  useEffect(() => {
    return () => {
      createAnalysisAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!sourceImageUrl || flowers.length === 0) {
      return undefined;
    }

    let isActive = true;

    loadImage(sourceImageUrl)
      .then(async (sourceImage) => {
        if (isActive) {
          setSourceImageSize({
            width: sourceImage.naturalWidth,
            height: sourceImage.naturalHeight,
          });
        }

        const visualEntries = await Promise.all(
          flowers.map(async (flower, index) => {
            if (!hasBoundingBox(flower)) {
              return [getFlowerKey(flower, index), { colorHex: "", imageUrl: "" }];
            }

            const visual = await createFlowerCropUrl(sourceImage, flower.box2d);
            return [getFlowerKey(flower, index), visual];
          }),
        );
        const nextVisuals = Object.fromEntries(visualEntries);

        if (isActive) {
          setFlowerVisuals(nextVisuals);
        }
      })
      .catch((error) => {
        console.error("Failed to crop detected flower cards.", error);
      });

    return () => {
      isActive = false;
    };
  }, [sourceImageUrl, flowers]);

  const visibleFlowers = useMemo(
    () =>
      flowers.map((flower, index) => {
        const flowerKey = getFlowerKey(flower, index);
        const visual = flowerVisuals[flowerKey] ?? {};
        const colorHex = normalizeColorHex(flower.colorHex) || visual.colorHex || "";

        return {
          ...flower,
          uiKey: flowerKey,
          colorHex,
          bloom: colorizeBloom(flower.bloom, colorHex),
          imageMode: visual.imageUrl ? "canvas-crop" : "source-crop",
          imageUrl: visual.imageUrl || sourceImageUrl || "",
        };
      }),
    [sourceImageUrl, flowerVisuals, flowers],
  );

  useEffect(() => {
    if (hasPlayedIntroRef.current || visibleFlowers.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (hasPlayedIntroRef.current) {
        return;
      }

      hasPlayedIntroRef.current = true;
      photoFlip.playIntroRotation(visibleFlowers[0].uiKey);
      window.setTimeout(() => {
        setHasIntroCompleted(true);
      }, 860);
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [photoFlip, visibleFlowers]);

  const handleGoResult = async () => {
    if (isCreatingMeaning || flowers.length === 0) return;

    setIsCreatingMeaning(true);
    setErrorMessage("");
    createAnalysisAbortRef.current?.abort();
    const abortController = new AbortController();
    createAnalysisAbortRef.current = abortController;

    try {
      const analysis = await createAnalysis(
        { flowers },
        { signal: abortController.signal },
      );
      onGoResult(analysis, { imageFile });
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Failed to create analysis.", error);
      setErrorMessage(error.message || COPY.fallbackError);
    } finally {
      if (!abortController.signal.aborted) {
        setIsCreatingMeaning(false);
      }
    }
  };

  const createPhotoHandlers = useCallback(
    (flowerName) => ({
      onPhotoPointerDown: (event) => photoFlip.handlePhotoPointerDown(event, flowerName),
      onPhotoPointerMove: (event) => photoFlip.handlePhotoPointerMove(event, flowerName),
      onPhotoPointerEnd: (event) => photoFlip.handlePhotoPointerEnd(event, flowerName),
    }),
    [photoFlip],
  );

  if (!hasAnalysisState) {
    return <Navigate to="/analyze" replace />;
  }

  return (
    <PageShell className="detected-page">
      <BackButton onClick={onBack} />

      <PageTitle>{COPY.title}</PageTitle>

      <section
        className={`detected-card-slider ${cardSwipe.edgeFeedback}`}
        onPointerDown={cardSwipe.handlePointerDown}
        onPointerMove={cardSwipe.handlePointerMove}
        onPointerUp={cardSwipe.handlePointerEnd}
        onPointerCancel={cardSwipe.handlePointerEnd}
        aria-label={COPY.cardLabel}
      >
        {visibleFlowers.length === 0 ? (
          <p className="section-label">{COPY.empty}</p>
        ) : (
          <div
            className="detected-card-track"
            style={{
              transform: `translateX(${-cardSwipe.activeIndex * CARD_STEP + cardSwipe.dragOffset}px)`,
              transitionDuration: `${cardSwipe.transitionDuration}s`,
            }}
          >
            {visibleFlowers.map((flower, index) => {
              const flowerKey = flower.uiKey;
              const isBackSide = photoFlip.isPhotoBackSide(flowerKey);
              const isDraggingPhoto = photoFlip.isPhotoDragging(flowerKey);
              const shouldShowHint =
                cardSwipe.activeIndex === index &&
                !(index === 0 && !hasIntroCompleted) &&
                !isBackSide &&
                !isDraggingPhoto &&
                !photoFlip.wasPhotoTouched(flowerKey);

              return (
                <DetectedFlowerCard
                  bloomProgress={photoFlip.getBloomProgress(flowerKey)}
                  flower={flower}
                  hintDirection={cardSwipe.hintDirection}
                  isBackSide={isBackSide}
                  isDraggingPhoto={isDraggingPhoto}
                  isPhotoAutoRotating={photoFlip.isPhotoAutoRotating(flowerKey)}
                  isPhotoSettled={photoFlip.isPhotoSettled(flowerKey)}
                  key={flowerKey}
                  photoRotation={photoFlip.getPhotoRotation(flowerKey)}
                  shouldShowHint={shouldShowHint}
                  sourceImageSize={sourceImageSize}
                  style={cardSwipe.getCardStyle(index)}
                  onCardClick={cardSwipe.handleCardClick}
                  {...createPhotoHandlers(flowerKey)}
                />
              );
            })}
          </div>
        )}
      </section>

      <div className="detected-card-dots" aria-label={COPY.dotLabel}>
        {visibleFlowers.map((flower, index) => (
          <button
            type="button"
            className={`detected-card-dot ${cardSwipe.activeIndex === index ? "active" : ""}`}
            aria-label={`${flower.name} \uce74\ub4dc \ubcf4\uae30`}
            aria-current={cardSwipe.activeIndex === index}
            key={flower.uiKey}
            style={{
              width: `${DOT_SIZE + (DOT_ACTIVE_WIDTH - DOT_SIZE) * cardSwipe.getDotProgress(index)}px`,
            }}
            onClick={() => cardSwipe.goToCard(index)}
          />
        ))}
      </div>

      <div className="detected-actions">
        <AppButton
          className="flower-meaning-button"
          disabled={isCreatingMeaning || flowers.length === 0}
          onClick={handleGoResult}
        >
          {COPY.submit}
        </AppButton>

        {errorMessage ? <p className="section-label">{errorMessage}</p> : null}

        <AppButton className="retry-button" variant="ghost" onClick={onBack}>
          {COPY.retry}
        </AppButton>
      </div>
      <LoadingOverlay
        isOpen={isCreatingMeaning}
        title={COPY.loadingTitle}
        description={COPY.loadingDescription}
      />
    </PageShell>
  );
}

export default DetectedFlowers;
