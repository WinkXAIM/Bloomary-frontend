import AppButton from "../components/common/AppButton";
import BackButton from "../components/common/BackButton";
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

function DetectedFlowers({ onBack, onGoResult }) {
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
