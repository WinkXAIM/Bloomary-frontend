import { useEffect, useRef } from "react";

function LeonSansLogo({
  text = "Bloomary",
  size = 50,
  color = "#1a1a1a",
  width = 280,
  height = 80,
  loop = false,
  loopDuration = 2400,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !window.LeonSans || !window.TweenMax) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(pixelRatio, pixelRatio);

    const leon = new window.LeonSans({
      text: text,
      size: size,
      weight: 400,
      color: [color],
      align: "center",
    });

    const startAnimation = () => {
      let i, total = leon.drawing.length;
      for (i = 0; i < total; i++) {
        window.TweenMax.killTweensOf(leon.drawing[i]);
        window.TweenMax.fromTo(
          leon.drawing[i],
          1.6,
          { value: 0 },
          {
            delay: i * 0.05,
            value: 1,
            ease: window.Power4.easeOut,
          }
        );
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const x = (width - leon.rect.w) / 2;
      const y = (height - leon.rect.h) / 2 + 10;
      leon.position(x, y);

      leon.draw(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };

    let animationFrameId;
    let animationTimerId;

    startAnimation();
    animate();

    if (loop) {
      animationTimerId = window.setInterval(startAnimation, loopDuration);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      if (animationTimerId) {
        window.clearInterval(animationTimerId);
      }
    };
  }, [text, size, color, width, height, loop, loopDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={`leon-sans-logo ${className}`.trim()}
      style={{
        display: "block",
        margin: "0 auto",
      }}
    />
  );
}

export default LeonSansLogo;
