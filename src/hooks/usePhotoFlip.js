import { useRef, useState } from "react";

const PHOTO_FLIP_THRESHOLD = 84;
const PHOTO_FLICK_THRESHOLD = 28;
const PHOTO_FLICK_VELOCITY = 0.42;
const PHOTO_INTENT_THRESHOLD = 12;
const PHOTO_TAP_MOVE_THRESHOLD = 24;
const PHOTO_FLIP_DISTANCE = 360;
const PHOTO_AUTO_ROTATE_DURATION = 1200;
const PHOTO_INTRO_ROTATE_DURATION = 900;
const PHOTO_AUTO_ROTATE_LOCK_PROGRESS = 0.75;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeInOut = (value) => value * value * (3 - 2 * value);

function usePhotoFlip({ isCardDragging }) {
  const [photoRotations, setPhotoRotations] = useState({});
  const [photoDragOffsets, setPhotoDragOffsets] = useState({});
  const [autoRotatingPhotos, setAutoRotatingPhotos] = useState({});
  const [settledPhotos, setSettledPhotos] = useState({});
  const [touchedPhotos, setTouchedPhotos] = useState({});
  const photoInteractionRef = useRef(null);
  const photoAnimationRef = useRef({});
  const photoAnimationProgressRef = useRef({});
  const photoAnimationTargetRef = useRef({});
  const photoRotationsRef = useRef({});
  const photoSettleTimeoutRef = useRef({});

  const playPhotoSettleFeedback = (flowerName) => {
    window.clearTimeout(photoSettleTimeoutRef.current[flowerName]);
    setSettledPhotos((current) => ({
      ...current,
      [flowerName]: false,
    }));

    window.requestAnimationFrame(() => {
      setSettledPhotos((current) => ({
        ...current,
        [flowerName]: true,
      }));

      photoSettleTimeoutRef.current[flowerName] = window.setTimeout(() => {
        setSettledPhotos((current) => ({
          ...current,
          [flowerName]: false,
        }));
      }, 360);
    });
  };

  const setPhotoRotation = (flowerName, rotation) => {
    const nextRotations = {
      ...photoRotationsRef.current,
      [flowerName]: rotation,
    };

    photoRotationsRef.current = nextRotations;
    setPhotoRotations(nextRotations);
  };

  const getSettledPhotoRotation = (rotation) => Math.round(rotation / 180) * 180;

  const getDirectionalPhotoTarget = (rotation, direction) => {
    if (direction > 0) {
      return Math.ceil((rotation + 0.001) / 180) * 180;
    }

    return Math.floor((rotation - 0.001) / 180) * 180;
  };

  const animatePhotoRotation = (flowerName, startRotation, targetRotation, duration = PHOTO_AUTO_ROTATE_DURATION) => {
    window.cancelAnimationFrame(photoAnimationRef.current[flowerName]);
    photoAnimationTargetRef.current[flowerName] = targetRotation;

    let startTime;

    const animate = (currentTime) => {
      startTime ??= currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const rotation = startRotation + (targetRotation - startRotation) * easeInOut(progress);

      photoAnimationProgressRef.current[flowerName] = progress;
      setPhotoRotation(flowerName, rotation);

      if (progress < 1) {
        photoAnimationRef.current[flowerName] = window.requestAnimationFrame(animate);
      } else {
        setPhotoRotation(flowerName, targetRotation);
        photoAnimationProgressRef.current[flowerName] = 1;
        photoAnimationTargetRef.current[flowerName] = null;
        playPhotoSettleFeedback(flowerName);
        setAutoRotatingPhotos((current) => ({
          ...current,
          [flowerName]: false,
        }));
      }
    };

    setAutoRotatingPhotos((current) => ({
      ...current,
      [flowerName]: true,
    }));
    photoAnimationProgressRef.current[flowerName] = 0;
    setPhotoRotation(flowerName, startRotation);
    photoAnimationRef.current[flowerName] = window.requestAnimationFrame(animate);
  };

  const releasePointerCapture = (event) => {
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already be released by the browser.
    }
  };

  const finishPhotoRotation = (flowerName, releaseRotation, targetRotation) => {
    animatePhotoRotation(flowerName, releaseRotation, targetRotation);
  };

  const resetPhotoInteraction = (event, flowerName) => {
    photoInteractionRef.current = null;
    setPhotoDragOffsets((current) => ({
      ...current,
      [flowerName]: 0,
    }));
    releasePointerCapture(event);
  };

  const handlePhotoPointerDown = (event, flowerName) => {
    event.stopPropagation();

    if (isCardDragging()) {
      return;
    }

    const wasAutoRotating = Boolean(autoRotatingPhotos[flowerName]);
    const autoRotationProgress = photoAnimationProgressRef.current[flowerName] ?? 1;

    if (wasAutoRotating && autoRotationProgress >= PHOTO_AUTO_ROTATE_LOCK_PROGRESS) {
      return;
    }

    window.cancelAnimationFrame(photoAnimationRef.current[flowerName]);
    photoInteractionRef.current = {
      autoTargetRotation: photoAnimationTargetRef.current[flowerName],
      flowerName,
      intent: null,
      pointerId: event.pointerId,
      startRotation: photoRotationsRef.current[flowerName] ?? 0,
      startTime: event.timeStamp,
      startX: event.clientX,
      startY: event.clientY,
      wasAutoRotating,
    };
    setAutoRotatingPhotos((current) => ({
      ...current,
      [flowerName]: false,
    }));
    setTouchedPhotos((current) => ({
      ...current,
      [flowerName]: true,
    }));
    setPhotoDragOffsets((current) => ({
      ...current,
      [flowerName]: 0,
    }));

    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Some touch browsers can reject pointer capture after a canceled gesture.
    }
  };

  const handlePhotoPointerMove = (event, flowerName) => {
    event.stopPropagation();

    const interaction = photoInteractionRef.current;

    if (!interaction || interaction.flowerName !== flowerName || interaction.pointerId !== event.pointerId) {
      return;
    }

    const clientX = event.type === "pointercancel" ? interaction.startX : event.clientX;
    const clientY = event.type === "pointercancel" ? interaction.startY : event.clientY;
    const distance = clientX - interaction.startX;
    const verticalDistance = clientY - interaction.startY;
    const absDistance = Math.abs(distance);
    const absVerticalDistance = Math.abs(verticalDistance);

    if (interaction.intent === null && Math.max(absDistance, absVerticalDistance) > PHOTO_INTENT_THRESHOLD) {
      interaction.intent = absDistance > absVerticalDistance * 1.1 ? "horizontal" : "vertical";
    }

    if (interaction.intent === "vertical" || interaction.intent !== "horizontal") {
      return;
    }

    const limitedDistance = clamp(distance, -PHOTO_FLIP_DISTANCE, PHOTO_FLIP_DISTANCE);

    setPhotoDragOffsets((current) => ({
      ...current,
      [flowerName]: limitedDistance,
    }));
  };

  const handlePhotoPointerEnd = (event, flowerName) => {
    event.stopPropagation();

    const interaction = photoInteractionRef.current;

    if (!interaction || interaction.flowerName !== flowerName || interaction.pointerId !== event.pointerId) {
      return;
    }

    const clientX = event.type === "pointercancel" ? interaction.startX : event.clientX;
    const distance = clientX - interaction.startX;
    const baseRotation = interaction.startRotation;
    const limitedDistance = clamp(distance, -PHOTO_FLIP_DISTANCE, PHOTO_FLIP_DISTANCE);
    const releaseRotation = baseRotation + (limitedDistance / PHOTO_FLIP_DISTANCE) * 180;
    const elapsed = Math.max(event.timeStamp - interaction.startTime, 1);
    const velocity = Math.abs(distance) / elapsed;
    const isHorizontalDrag = interaction.intent === "horizontal";
    const isFlick = Math.abs(distance) > PHOTO_FLICK_THRESHOLD && velocity > PHOTO_FLICK_VELOCITY;

    if (event.type === "pointercancel") {
      finishPhotoRotation(flowerName, releaseRotation, baseRotation);
    } else if (isHorizontalDrag && (Math.abs(distance) > PHOTO_FLIP_THRESHOLD || isFlick)) {
      const direction = distance > 0 ? 1 : -1;
      const targetRotation = getDirectionalPhotoTarget(releaseRotation, direction);

      finishPhotoRotation(flowerName, releaseRotation, targetRotation);
    } else if (interaction.intent === "vertical") {
      finishPhotoRotation(flowerName, releaseRotation, baseRotation);
      resetPhotoInteraction(event, flowerName);
      return;
    } else if (interaction.wasAutoRotating) {
      const targetRotation = interaction.autoTargetRotation ?? getSettledPhotoRotation(baseRotation);

      finishPhotoRotation(flowerName, releaseRotation, targetRotation);
      resetPhotoInteraction(event, flowerName);
      return;
    } else if (Math.abs(distance) > PHOTO_TAP_MOVE_THRESHOLD) {
      finishPhotoRotation(flowerName, releaseRotation, getSettledPhotoRotation(releaseRotation));
      resetPhotoInteraction(event, flowerName);
      return;
    } else {
      const { left, width } = event.currentTarget.getBoundingClientRect();
      const clickedRightSide = clientX - left > width / 2;
      const direction = clickedRightSide ? 1 : -1;
      const settledBaseRotation = getSettledPhotoRotation(baseRotation);

      finishPhotoRotation(flowerName, releaseRotation, settledBaseRotation + direction * 180);
    }

    resetPhotoInteraction(event, flowerName);
  };

  const getPhotoRotation = (flowerName) => {
    const baseRotation = photoRotations[flowerName] ?? 0;
    const dragOffset = photoDragOffsets[flowerName] ?? 0;

    return baseRotation + (dragOffset / PHOTO_FLIP_DISTANCE) * 180;
  };

  const getBloomProgress = (flowerName) => {
    const rotation = getPhotoRotation(flowerName);
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const distanceFromBack = Math.abs(normalizedRotation - 180);
    const visibleBackProgress = 1 - Math.min(distanceFromBack, 90) / 90;

    return clamp((visibleBackProgress - 0.08) / 0.92, 0, 1);
  };

  const isPhotoBackSide = (flowerName) => {
    const rotation = photoRotations[flowerName] ?? 0;

    return Math.abs(Math.round(rotation / 180)) % 2 === 1;
  };

  return {
    getBloomProgress,
    getPhotoRotation,
    handlePhotoPointerDown,
    handlePhotoPointerEnd,
    handlePhotoPointerMove,
    isPhotoAutoRotating: (flowerName) => Boolean(autoRotatingPhotos[flowerName]),
    isPhotoBackSide,
    isPhotoDragging: (flowerName) => Math.abs(photoDragOffsets[flowerName] ?? 0) > 0,
    isPhotoSettled: (flowerName) => Boolean(settledPhotos[flowerName]),
    playIntroRotation: (flowerName) => {
      animatePhotoRotation(flowerName, photoRotationsRef.current[flowerName] ?? 0, 180, PHOTO_INTRO_ROTATE_DURATION);
    },
    resetTouchedPhoto: (flowerName) => {
      setTouchedPhotos((current) => ({
        ...current,
        [flowerName]: false,
      }));
    },
    wasPhotoTouched: (flowerName) => Boolean(touchedPhotos[flowerName]),
  };
}

export default usePhotoFlip;
