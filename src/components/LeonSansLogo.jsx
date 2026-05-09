import { useEffect, useRef } from "react";

function LeonSansLogo({ text = "Bloomary", size = 50, color = "#1a1a1a" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !window.LeonSans || !window.TweenMax) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;

    const width = 280;
    const height = 80;
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
      requestAnimationFrame(animate);
    };

    startAnimation();
    animate();
  }, [text, size, color]);

  return (
    <canvas
      ref={canvasRef}
      className="leon-sans-logo"
      style={{
        display: "block",
        margin: "0 auto",
      }}
    />
  );
}

export default LeonSansLogo;
