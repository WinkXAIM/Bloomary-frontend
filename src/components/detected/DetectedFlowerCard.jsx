import FlowerBloomCanvas from "./FlowerBloomCanvas";

function DetectedFlowerCard({
  flower,
  isBackSide,
  isDraggingPhoto,
  shouldShowHint,
  photoRotation,
  bloomProgress,
  onCardClick,
  onPhotoPointerDown,
  onPhotoPointerMove,
  onPhotoPointerEnd,
}) {
  const photoClassName = [
    "detected-flower-photo",
    flower.imageClass,
    isBackSide ? "flipped" : "",
    shouldShowHint ? "hint" : "",
    isDraggingPhoto ? "photo-dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className="detected-flower-card" onClick={onCardClick}>
      <button
        type="button"
        className={photoClassName}
        style={{ "--photo-rotation": `${photoRotation}deg` }}
        aria-label={`${flower.name} 사진 뒤집기`}
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
          <span className="detected-photo-face detected-photo-front" />
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
