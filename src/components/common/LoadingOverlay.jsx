import "./LoadingOverlay.css";
import LeonSansLogo from "../LeonSansLogo";

const DEFAULT_TITLE = "\uc7a0\uc2dc\ub9cc \uae30\ub2e4\ub824 \uc8fc\uc138\uc694";
const DEFAULT_DESCRIPTION = "\uc694\uccad\uc744 \ucc98\ub9ac\ud558\uace0 \uc788\uc5b4\uc694.";
const LOADING_CYCLE_MS = 2400;

function LoadingOverlay({
  isOpen,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}) {
  if (!isOpen) return null;

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-busy="true">
      <div className="loading-panel">
        <div className="loading-logo" aria-hidden="true">
          <LeonSansLogo
            className="loading-leon-logo"
            text="Bloomary"
            size={28}
            width={178}
            height={50}
            loop
            loopDuration={LOADING_CYCLE_MS}
          />
        </div>
        <p className="loading-title">{title}</p>
        <p className="loading-description">{description}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
