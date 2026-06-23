import { useEffect, useRef, useState } from "react";
import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
import LoadingOverlay from "../components/common/LoadingOverlay";
import PageShell from "../components/common/PageShell";
import PageTitle from "../components/common/PageTitle";
import DetectedFlowerCard from "../components/detected/DetectedFlowerCard";
import detectedFlowers from "../data/detectedFlowers";
import useCardSwipe from "../hooks/useCardSwipe";
import usePhotoFlip from "../hooks/usePhotoFlip";
import "./DetectedFlowers.css";

const DOT_SIZE = 7;
const DOT_ACTIVE_WIDTH = 18;
const CARD_STEP = 315;
const LOADING_DELAY_MS = 3000;

const COPY = {
  loadingTitle: "\uaf43\ub9d0\uc744 \ub9cc\ub4e4\uace0 \uc788\uc5b4\uc694",
  loadingDescription: "\uc778\uc2dd\ub41c \uaf43\uc744 \ubc14\ud0d5\uc73c\ub85c \uac10\uc131 \ubb38\uad6c\ub97c \uc900\ube44\ud558\ub294 \uc911\uc785\ub2c8\ub2e4.",
};

function DetectedFlowers({ onBack, onGoResult }) {
  const hasPlayedIntroRef = useRef(false);
  const [hasIntroCompleted, setHasIntroCompleted] = useState(false);
  const [isCreatingMeaning, setIsCreatingMeaning] = useState(false);
  const photoFlip = usePhotoFlip({
    isCardDragging: () => cardSwipe.isDragging(),
  });

  const cardSwipe = useCardSwipe({
    cardStep: CARD_STEP,
    itemCount: detectedFlowers.length,
    onCardChange: (index) => {
      photoFlip.resetTouchedPhoto(detectedFlowers[index].name);
    },
  });

  useEffect(() => {
    if (hasPlayedIntroRef.current || detectedFlowers.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (hasPlayedIntroRef.current) {
        return;
      }

      hasPlayedIntroRef.current = true;
      photoFlip.playIntroRotation(detectedFlowers[0].name);
      window.setTimeout(() => {
        setHasIntroCompleted(true);
      }, 860);
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [photoFlip]);

  const handleGoResult = () => {
    if (isCreatingMeaning) return;

    setIsCreatingMeaning(true);
    window.setTimeout(() => {
      onGoResult();
      setIsCreatingMeaning(false);
    }, LOADING_DELAY_MS);
  };

  return (
    <PageShell className="detected-page">
      <BackButton onClick={onBack} />

      <PageTitle>인식 결과</PageTitle>

      <section
        className={`detected-card-slider ${cardSwipe.edgeFeedback}`}
        onPointerDown={cardSwipe.handlePointerDown}
        onPointerMove={cardSwipe.handlePointerMove}
        onPointerUp={cardSwipe.handlePointerEnd}
        onPointerCancel={cardSwipe.handlePointerEnd}
        aria-label="인식된 꽃 카드"
      >
        <div
          className="detected-card-track"
          style={{
            transform: `translateX(${-cardSwipe.activeIndex * CARD_STEP + cardSwipe.dragOffset}px)`,
            transitionDuration: `${cardSwipe.transitionDuration}s`,
          }}
        >
          {detectedFlowers.map((flower, index) => {
            const isBackSide = photoFlip.isPhotoBackSide(flower.name);
            const isDraggingPhoto = photoFlip.isPhotoDragging(flower.name);
            const shouldShowHint =
              cardSwipe.activeIndex === index &&
              !(index === 0 && !hasIntroCompleted) &&
              !isBackSide &&
              !isDraggingPhoto &&
              !photoFlip.wasPhotoTouched(flower.name);

            return (
              <DetectedFlowerCard
                bloomProgress={photoFlip.getBloomProgress(flower.name)}
                flower={flower}
                hintDirection={cardSwipe.hintDirection}
                isBackSide={isBackSide}
                isDraggingPhoto={isDraggingPhoto}
                isPhotoAutoRotating={photoFlip.isPhotoAutoRotating(flower.name)}
                isPhotoSettled={photoFlip.isPhotoSettled(flower.name)}
                key={flower.name}
                photoRotation={photoFlip.getPhotoRotation(flower.name)}
                shouldShowHint={shouldShowHint}
                style={cardSwipe.getCardStyle(index)}
                onCardClick={cardSwipe.handleCardClick}
                onPhotoPointerDown={(event) => photoFlip.handlePhotoPointerDown(event, flower.name)}
                onPhotoPointerMove={(event) => photoFlip.handlePhotoPointerMove(event, flower.name)}
                onPhotoPointerEnd={(event) => photoFlip.handlePhotoPointerEnd(event, flower.name)}
              />
            );
          })}
        </div>
      </section>

      <div className="detected-card-dots" aria-label="꽃 카드 선택">
        {detectedFlowers.map((flower, index) => (
          <button
            type="button"
            className={`detected-card-dot ${cardSwipe.activeIndex === index ? "active" : ""}`}
            aria-label={`${flower.name} 카드 보기`}
            aria-current={cardSwipe.activeIndex === index}
            key={flower.name}
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
          disabled={isCreatingMeaning}
          onClick={handleGoResult}
        >
          꽃말 확인하기
        </AppButton>

        <AppButton className="retry-button" variant="ghost" onClick={onBack}>
          인식이 잘못되었나요? 다시 촬영해보세요
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
