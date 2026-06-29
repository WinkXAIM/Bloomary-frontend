import FlowerBloomCanvas from "./FlowerBloomCanvas";

const PHOTO_FRAME_SIZE = {
  width: 253,
  height: 342,
};
const CROP_PADDING_RATIO = 0.1;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function getCropBackgroundStyle({ box2d, imageUrl, sourceImageSize }) {
  if (!imageUrl) return undefined;

  const fallbackStyle = {
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: "center",
    backgroundSize: "cover",
  };

  if (
    !sourceImageSize?.width ||
    !sourceImageSize?.height ||
    !Array.isArray(box2d) ||
    box2d.length !== 4
  ) {
    return fallbackStyle;
  }

  const coords = box2d.map(Number);
  if (coords.some((coord) => !Number.isFinite(coord))) {
    return fallbackStyle;
  }

  const imageWidth = sourceImageSize.width;
  const imageHeight = sourceImageSize.height;
  let [x1, y1, x2, y2] = coords;

  if (Math.max(x1, y1, x2, y2) <= 1.5) {
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

  if (boxWidth < 2 || boxHeight < 2) {
    return fallbackStyle;
  }

  const padding = Math.max(boxWidth, boxHeight) * CROP_PADDING_RATIO;
  const cropLeft = clamp(left - padding, 0, imageWidth);
  const cropTop = clamp(top - padding, 0, imageHeight);
  const cropRight = clamp(right + padding, 0, imageWidth);
  const cropBottom = clamp(bottom + padding, 0, imageHeight);
  const cropWidth = cropRight - cropLeft;
  const cropHeight = cropBottom - cropTop;

  if (cropWidth < 2 || cropHeight < 2) {
    return fallbackStyle;
  }

  const scale = Math.max(PHOTO_FRAME_SIZE.width / cropWidth, PHOTO_FRAME_SIZE.height / cropHeight);
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  const cropCenterX = cropLeft + cropWidth / 2;
  const cropCenterY = cropTop + cropHeight / 2;
  const positionX = clamp(
    PHOTO_FRAME_SIZE.width / 2 - cropCenterX * scale,
    PHOTO_FRAME_SIZE.width - renderedWidth,
    0,
  );
  const positionY = clamp(
    PHOTO_FRAME_SIZE.height / 2 - cropCenterY * scale,
    PHOTO_FRAME_SIZE.height - renderedHeight,
    0,
  );

  return {
    backgroundImage: `url("${imageUrl}")`,
    backgroundPosition: `${positionX}px ${positionY}px`,
    backgroundSize: `${renderedWidth}px ${renderedHeight}px`,
  };
}

function DetectedFlowerCard({
  flower,
  isBackSide,
  isDraggingPhoto,
  isPhotoAutoRotating,
  isPhotoSettled,
  shouldShowHint,
  hintDirection,
  photoRotation,
  bloomProgress,
  sourceImageSize,
  style,
  onCardClick,
  onPhotoPointerDown,
  onPhotoPointerMove,
  onPhotoPointerEnd,
}) {
  const photoClassName = [
    "detected-flower-photo",
    isBackSide ? "flipped" : "",
    shouldShowHint ? "hint" : "",
    shouldShowHint && hintDirection < 0 ? "hint-reverse" : "",
    isDraggingPhoto ? "photo-dragging" : "",
    isPhotoAutoRotating ? "photo-auto-rotating" : "",
    isPhotoSettled ? "photo-settled" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const frontStyle =
    flower.imageMode === "source-crop"
      ? getCropBackgroundStyle({
          box2d: flower.box2d,
          imageUrl: flower.imageUrl,
          sourceImageSize,
        })
      : undefined;

  return (
    <article className="detected-flower-card" style={style} onClick={onCardClick}>
      <button
        type="button"
        className={photoClassName}
        style={{ "--photo-rotation": `${photoRotation}deg` }}
        aria-label={`${flower.name} \uc0ac\uc9c4 \ub4a4\uc9d1\uae30`}
        aria-pressed={isBackSide}
        onPointerDown={onPhotoPointerDown}
        onPointerMove={onPhotoPointerMove}
        onPointerUp={onPhotoPointerEnd}
        onPointerCancel={onPhotoPointerEnd}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <span className="detected-photo-inner">
          <span className="detected-photo-face detected-photo-front" style={frontStyle}>
            {flower.imageUrl && flower.imageMode !== "source-crop" ? (
              <img className="detected-flower-crop-image" src={flower.imageUrl} alt="" draggable="false" />
            ) : null}
          </span>
          <span className="detected-photo-face detected-photo-back">
            <FlowerBloomCanvas bloom={flower.bloom} bloomType={flower.bloomType} progress={bloomProgress} />
          </span>
        </span>
      </button>

      <div className="detected-flower-info">
        <h2>{flower.name}</h2>
        <p>{flower.meaning}</p>
      </div>
    </article>
  );
}

export default DetectedFlowerCard;
