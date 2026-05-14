import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 64;
const SWIPE_FLICK_THRESHOLD = 24;
const SWIPE_FLICK_VELOCITY = 0.48;
const SWIPE_INTENT_THRESHOLD = 8;
const DOT_MORPH_DISTANCE = 150;
const EDGE_DRAG_RESISTANCE = 0.32;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeInOut = (value) => value * value * (3 - 2 * value);

function useCardSwipe({ cardStep, itemCount, onCardChange }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.28);
  const [hintDirection, setHintDirection] = useState(1);
  const [edgeFeedback, setEdgeFeedback] = useState("");
  const dragStartRef = useRef(null);
  const dragStartYRef = useRef(0);
  const dragIntentRef = useRef(null);
  const dragPointerIdRef = useRef(null);
  const dragRawOffsetRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const suppressClickRef = useRef(false);

  const getSafeIndex = (index) => clamp(index, 0, itemCount - 1);

  const getSliderDragOffset = (distance) => {
    const isFirstCard = activeIndex === 0;
    const isLastCard = activeIndex === itemCount - 1;
    const isDraggingPastStart = isFirstCard && distance > 0;
    const isDraggingPastEnd = isLastCard && distance < 0;

    return isDraggingPastStart || isDraggingPastEnd ? distance * EDGE_DRAG_RESISTANCE : distance;
  };

  const playEdgeFeedback = (direction) => {
    setEdgeFeedback("");

    window.requestAnimationFrame(() => {
      setEdgeFeedback(direction < 0 ? "edge-left" : "edge-right");
    });
  };

  const snapToCard = (index) => {
    const safeIndex = getSafeIndex(index);

    if (safeIndex !== activeIndex) {
      setHintDirection(safeIndex > activeIndex ? 1 : -1);
      onCardChange?.(safeIndex);
    }

    setActiveIndex(safeIndex);
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
    dragStartYRef.current = event.clientY;
    dragIntentRef.current = null;
    dragPointerIdRef.current = event.pointerId;
    dragRawOffsetRef.current = 0;
    dragStartTimeRef.current = performance.now();
    dragDistanceRef.current = 0;
    setTransitionDuration(0);

    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Some touch browsers can reject pointer capture after a canceled gesture.
    }
  };

  const handlePointerMove = (event) => {
    if (dragStartRef.current === null || dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const distance = event.clientX - dragStartRef.current;
    const verticalDistance = event.clientY - dragStartYRef.current;
    const absDistance = Math.abs(distance);
    const absVerticalDistance = Math.abs(verticalDistance);

    if (dragIntentRef.current === null && Math.max(absDistance, absVerticalDistance) > SWIPE_INTENT_THRESHOLD) {
      dragIntentRef.current = absDistance > absVerticalDistance * 1.15 ? "horizontal" : "vertical";
    }

    if (dragIntentRef.current === "vertical") {
      dragStartRef.current = null;
      dragPointerIdRef.current = null;
      dragRawOffsetRef.current = 0;
      setDragOffset(0);

      try {
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Pointer capture may already be released by the browser.
      }

      return;
    }

    if (dragIntentRef.current !== "horizontal") {
      return;
    }

    dragRawOffsetRef.current = distance;
    dragDistanceRef.current = Math.max(dragDistanceRef.current, absDistance);
    setDragOffset(getSliderDragOffset(distance));
  };

  const handlePointerEnd = (event) => {
    if (dragStartRef.current === null || dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    const rawOffset = dragRawOffsetRef.current;
    const direction = rawOffset < 0 ? 1 : -1;
    const targetIndex = activeIndex + direction;
    const safeTargetIndex = getSafeIndex(targetIndex);
    const wasDragging = dragDistanceRef.current > 8;
    const elapsed = Math.max(performance.now() - dragStartTimeRef.current, 1);
    const velocity = Math.abs(rawOffset) / elapsed;
    const shouldMove =
      Math.abs(rawOffset) > SWIPE_THRESHOLD ||
      (Math.abs(rawOffset) > SWIPE_FLICK_THRESHOLD && velocity > SWIPE_FLICK_VELOCITY);
    const duration = clamp(0.42 - velocity * 0.22, 0.18, 0.4);

    suppressClickRef.current = wasDragging;
    setTransitionDuration(duration);
    snapToCard(shouldMove ? safeTargetIndex : activeIndex);

    if (shouldMove && safeTargetIndex === activeIndex) {
      playEdgeFeedback(direction);
    }

    dragStartRef.current = null;
    dragPointerIdRef.current = null;
    dragIntentRef.current = null;
    dragRawOffsetRef.current = 0;

    try {
      if (event?.currentTarget?.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already be released by the browser.
    }

    window.setTimeout(() => {
      dragDistanceRef.current = 0;
      suppressClickRef.current = false;
    }, 0);
  };

  const handleCardClick = (event) => {
    if (suppressClickRef.current || event.target.closest(".detected-flower-photo")) {
      return;
    }

    const { left, width } = event.currentTarget.getBoundingClientRect();
    const clickedRightSide = event.clientX - left > width / 2;

    goToCard(activeIndex + (clickedRightSide ? 1 : -1), 0.32);
  };

  const getCardStyle = (index) => {
    const position = index - activeIndex + dragOffset / cardStep;
    const distanceFromCenter = Math.min(Math.abs(position), 1);
    const focus = 1 - distanceFromCenter;
    const scale = 0.955 + focus * 0.045;
    const translateY = distanceFromCenter * 8;
    const opacity = 0.72 + focus * 0.28;

    return {
      "--card-opacity": opacity,
      "--card-scale": scale,
      "--card-translate-y": `${translateY}px`,
      "--card-transition-duration": `${transitionDuration}s`,
      zIndex: Math.round(focus * 10),
    };
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

  return {
    activeIndex,
    dragOffset,
    edgeFeedback,
    getCardStyle,
    getDotProgress,
    goToCard,
    handleCardClick,
    handlePointerDown,
    handlePointerEnd,
    handlePointerMove,
    hintDirection,
    isDragging: () => dragStartRef.current !== null,
    transitionDuration,
  };
}

export default useCardSwipe;
