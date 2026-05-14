import { useRef, useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import DetectedFlowerCard from "../components/detected/DetectedFlowerCard";
import detectedFlowers from "../data/detectedFlowers";
import "./DetectedFlowers.css";

const SWIPE_THRESHOLD = 64;
const DOT_MORPH_DISTANCE = 150;
const DOT_SIZE = 7;
const DOT_ACTIVE_WIDTH = 18;
const CARD_STEP = 315;
const PHOTO_FLIP_THRESHOLD = 110;
const PHOTO_FLIP_DISTANCE = 360;
const PHOTO_AUTO_ROTATE_DURATION = 2200;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeInOut = (value) => value * value * (3 - 2 * value);

function DetectedFlowers({ onBack, onGoResult }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.28);
  const [photoRotations, setPhotoRotations] = useState({});
  const [bloomRotations, setBloomRotations] = useState({});
  const [photoDragOffsets, setPhotoDragOffsets] = useState({});
  const [touchedPhotos, setTouchedPhotos] = useState({});
  const dragStartRef = useRef(null);
  const dragStartTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const suppressClickRef = useRef(false);
  const photoSwipeStartRef = useRef(null);
  const bloomAnimationRef = useRef({});

  const getSafeIndex = (index) => clamp(index, 0, detectedFlowers.length - 1);

  const snapToCard = (index) => {
    setActiveIndex(getSafeIndex(index));
    setDragOffset(0);
  };

  const goToCard = (index, duration = 0.28) => {
    setTransitionDuration(duration);
    snapToCard(index);
  };

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (event.target.closest(".detected-flower-photo")) {
      return;
    }

    dragStartRef.current = event.clientX;
    dragStartTimeRef.current = performance.now();
    dragDistanceRef.current = 0;
    setTransitionDuration(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (dragStartRef.current === null) {
      return;
    }

    const distance = event.clientX - dragStartRef.current;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(distance));
    setDragOffset(distance);
  };

  const handlePointerEnd = () => {
    if (dragStartRef.current === null) {
      return;
    }

    const direction = dragOffset < 0 ? 1 : -1;
    const shouldMove = Math.abs(dragOffset) > SWIPE_THRESHOLD;
    const wasDragging = dragDistanceRef.current > 8;
    const elapsed = Math.max(performance.now() - dragStartTimeRef.current, 1);
    const velocity = Math.abs(dragOffset) / elapsed;
    const duration = clamp(0.38 - velocity * 0.22, 0.16, 0.36);

    suppressClickRef.current = wasDragging;
    setTransitionDuration(duration);
    snapToCard(shouldMove ? activeIndex + direction : activeIndex);
    dragStartRef.current = null;

    window.setTimeout(() => {
      dragDistanceRef.current = 0;
      suppressClickRef.current = false;
    }, 0);
  };

  const animateBloomRotation = (flowerName, startRotation, targetRotation) => {
    window.cancelAnimationFrame(bloomAnimationRef.current[flowerName]);

    let startTime;

    const animate = (currentTime) => {
      startTime ??= currentTime;
      const progress = Math.min((currentTime - startTime) / PHOTO_AUTO_ROTATE_DURATION, 1);
      const rotation = startRotation + (targetRotation - startRotation) * easeInOut(progress);

      setBloomRotations((current) => ({
        ...current,
        [flowerName]: rotation,
      }));

      if (progress < 1) {
        bloomAnimationRef.current[flowerName] = window.requestAnimationFrame(animate);
      }
    };

    setBloomRotations((current) => ({
      ...current,
      [flowerName]: startRotation,
    }));
    bloomAnimationRef.current[flowerName] = window.requestAnimationFrame(animate);
  };

  const handlePhotoPointerDown = (event, flowerName) => {
    event.stopPropagation();
    photoSwipeStartRef.current = event.clientX;
    setTouchedPhotos((current) => ({
      ...current,
      [flowerName]: true,
    }));
    setPhotoDragOffsets((current) => ({
      ...current,
      [flowerName]: 0,
    }));
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePhotoPointerMove = (event, flowerName) => {
    event.stopPropagation();

    if (photoSwipeStartRef.current === null) {
      return;
    }

    const distance = event.clientX - photoSwipeStartRef.current;
    const limitedDistance = clamp(distance, -PHOTO_FLIP_DISTANCE, PHOTO_FLIP_DISTANCE);
    const baseRotation = photoRotations[flowerName] ?? 0;
    const rotation = baseRotation + (limitedDistance / PHOTO_FLIP_DISTANCE) * 180;

    setPhotoDragOffsets((current) => ({
      ...current,
      [flowerName]: limitedDistance,
    }));
    setBloomRotations((current) => ({
      ...current,
      [flowerName]: rotation,
    }));
  };

  const finishPhotoRotation = (flowerName, releaseRotation, targetRotation) => {
    setPhotoRotations((current) => ({
      ...current,
      [flowerName]: releaseRotation,
    }));

    window.requestAnimationFrame(() => {
      setPhotoRotations((current) => ({
        ...current,
        [flowerName]: targetRotation,
      }));
    });
    animateBloomRotation(flowerName, releaseRotation, targetRotation);
  };

  const handlePhotoPointerEnd = (event, flowerName) => {
    event.stopPropagation();

    if (photoSwipeStartRef.current === null) {
      return;
    }

    const distance = event.clientX - photoSwipeStartRef.current;
    const baseRotation = photoRotations[flowerName] ?? 0;
    const limitedDistance = clamp(distance, -PHOTO_FLIP_DISTANCE, PHOTO_FLIP_DISTANCE);
    const releaseRotation = baseRotation + (limitedDistance / PHOTO_FLIP_DISTANCE) * 180;

    if (Math.abs(distance) > PHOTO_FLIP_THRESHOLD) {
      const direction = distance > 0 ? 1 : -1;
      finishPhotoRotation(flowerName, releaseRotation, baseRotation + direction * 180);
    } else {
      finishPhotoRotation(flowerName, releaseRotation, baseRotation);
    }

    photoSwipeStartRef.current = null;
    setPhotoDragOffsets((current) => ({
      ...current,
      [flowerName]: 0,
    }));
  };

  const getPhotoRotation = (flowerName) => {
    const baseRotation = photoRotations[flowerName] ?? 0;
    const dragOffset = photoDragOffsets[flowerName] ?? 0;

    return baseRotation + (dragOffset / PHOTO_FLIP_DISTANCE) * 180;
  };

  const getBloomProgress = (flowerName) => {
    const rotation = bloomRotations[flowerName] ?? getPhotoRotation(flowerName);
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const distanceFromBack = Math.abs(normalizedRotation - 180);
    const visibleBackProgress = 1 - Math.min(distanceFromBack, 90) / 90;

    return clamp((visibleBackProgress - 0.08) / 0.92, 0, 1);
  };

  const isPhotoDragging = (flowerName) => Math.abs(photoDragOffsets[flowerName] ?? 0) > 0;

  const isPhotoBackSide = (flowerName) => {
    const rotation = photoRotations[flowerName] ?? 0;

    return Math.abs(Math.round(rotation / 180)) % 2 === 1;
  };

  const handleCardClick = (event) => {
    if (suppressClickRef.current || event.target.closest(".detected-flower-photo")) {
      return;
    }

    const { left, width } = event.currentTarget.getBoundingClientRect();
    const clickedRightSide = event.clientX - left > width / 2;

    goToCard(activeIndex + (clickedRightSide ? 1 : -1), 0.32);
  };

  const getDotProgress = (index) => {
    if (dragOffset === 0) {
      return activeIndex === index ? 1 : 0;
    }

    const direction = dragOffset < 0 ? 1 : -1;
    const nextIndex = getSafeIndex(activeIndex + direction);
    const rawProgress = Math.min(Math.abs(dragOffset) / DOT_MORPH_DISTANCE, 1);
    const progress = easeInOut(rawProgress);

    if (index === activeIndex) {
      return 1 - progress;
    }

    if (index === nextIndex) {
      return progress;
    }

    return 0;
  };

  return (
    <PageShell className="detected-page">
      <BackButton onClick={onBack} />

      <PageTitle>인식 결과</PageTitle>

      <section
        className="detected-card-slider"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        aria-label="인식된 꽃 카드"
      >
        <div
          className="detected-card-track"
          style={{
            transform: `translateX(${-activeIndex * CARD_STEP + dragOffset}px)`,
            transitionDuration: `${transitionDuration}s`,
          }}
        >
          {detectedFlowers.map((flower, index) => {
            const isBackSide = isPhotoBackSide(flower.name);
            const isDraggingPhoto = isPhotoDragging(flower.name);
            const shouldShowHint =
              activeIndex === index &&
              !isBackSide &&
              !isDraggingPhoto &&
              !touchedPhotos[flower.name];

            return (
              <DetectedFlowerCard
                bloomProgress={getBloomProgress(flower.name)}
                flower={flower}
                isBackSide={isBackSide}
                isDraggingPhoto={isDraggingPhoto}
                key={flower.name}
                photoRotation={getPhotoRotation(flower.name)}
                shouldShowHint={shouldShowHint}
                onCardClick={handleCardClick}
                onPhotoPointerDown={(event) => handlePhotoPointerDown(event, flower.name)}
                onPhotoPointerMove={(event) => handlePhotoPointerMove(event, flower.name)}
                onPhotoPointerEnd={(event) => handlePhotoPointerEnd(event, flower.name)}
              />
            );
          })}
        </div>
      </section>

      <div className="detected-card-dots" aria-label="꽃 카드 선택">
        {detectedFlowers.map((flower, index) => (
          <button
            type="button"
            className={`detected-card-dot ${activeIndex === index ? "active" : ""}`}
            aria-label={`${flower.name} 카드 보기`}
            aria-current={activeIndex === index}
            key={flower.name}
            style={{
              width: `${DOT_SIZE + (DOT_ACTIVE_WIDTH - DOT_SIZE) * getDotProgress(index)}px`,
            }}
            onClick={() => goToCard(index)}
          />
        ))}
      </div>

      <div className="detected-actions">
        <AppButton className="flower-meaning-button" onClick={onGoResult}>
          꽃말 확인하기
        </AppButton>

        <AppButton className="retry-button" variant="ghost" onClick={onBack}>
          인식이 잘못되었나요? 다시 촬영해보세요
        </AppButton>
      </div>
    </PageShell>
  );
}

export default DetectedFlowers;
