import { useEffect, useRef } from "react";

const easeInOut = (value) => value * value * (3 - 2 * value);
const getFastBloomProgress = (progress) => Math.min(Math.sqrt(Math.max(progress, 0)), 1);

function drawStem(context, bloom, width, height, centerX, centerY) {
  context.save();
  context.globalAlpha = 0.22;
  context.fillStyle = bloom.stem;
  context.beginPath();
  context.ellipse(centerX, height * 0.78, 46, 14, -0.08, 0, Math.PI * 2);
  context.fill();
  context.restore();

  context.strokeStyle = bloom.stem;
  context.lineWidth = 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(centerX, height * 0.82);
  context.quadraticCurveTo(centerX - 8, height * 0.64, centerX, centerY + 18);
  context.stroke();
}

function drawRoseBloom(context, bloom, width, height, progress) {
  const centerX = width / 2;
  const centerY = height * 0.46;
  const roseProgress = getFastBloomProgress(progress);

  drawStem(context, bloom, width, height, centerX, centerY);

  context.save();
  context.fillStyle = bloom.stem;
  [
    { t: 0.28, side: -1 },
    { t: 0.45, side: 1 },
    { t: 0.62, side: -1 },
  ].forEach((thorn) => {
    const startX = centerX;
    const startY = height * 0.82;
    const controlX = centerX - 8;
    const controlY = height * 0.64;
    const endX = centerX;
    const endY = centerY + 18;
    const inverseT = 1 - thorn.t;
    const stemX = inverseT * inverseT * startX + 2 * inverseT * thorn.t * controlX + thorn.t * thorn.t * endX;
    const stemY = inverseT * inverseT * startY + 2 * inverseT * thorn.t * controlY + thorn.t * thorn.t * endY;
    const thornX = stemX + thorn.side * 4;

    context.beginPath();
    context.moveTo(thornX, stemY);
    context.lineTo(thornX + thorn.side * 8, stemY - 4);
    context.lineTo(thornX + thorn.side * 2, stemY + 4);
    context.closePath();
    context.fill();
  });
  context.restore();

  [3, 2, 1, 0].forEach((layer) => {
    const petalCount = 4 + layer * 2;
    const layerProgress = Math.min(Math.max(roseProgress * 1.25 - layer * 0.1, 0), 1);
    const radius = layer * 5 + 12 * layerProgress;
    const curl = 0.7 + layer * 0.16;

    for (let index = 0; index < petalCount; index += 1) {
      const angle = (Math.PI * 2 * index) / petalCount + layer * 0.58 + layerProgress * 0.7;
      const petalX = centerX + Math.cos(angle) * radius;
      const petalY = centerY + Math.sin(angle) * radius * 0.72;
      const petalLength = 8 + layer * 8 + 16 * layerProgress;
      const petalWidth = 5 + layer * 4 + 12 * layerProgress;

      context.save();
      context.translate(petalX, petalY);
      context.rotate(angle + Math.PI / 2);
      context.globalAlpha = layerProgress * (0.88 + (3 - layer) * 0.03);
      context.fillStyle = layer > 1 ? bloom.petalDark : bloom.petal;
      context.beginPath();
      context.moveTo(0, -petalLength / 2);
      context.bezierCurveTo(
        -petalWidth * curl,
        -petalLength * 0.25,
        -petalWidth * 0.6,
        petalLength * 0.35,
        0,
        petalLength / 2,
      );
      context.bezierCurveTo(
        petalWidth * 0.6,
        petalLength * 0.25,
        petalWidth * curl,
        -petalLength * 0.28,
        0,
        -petalLength / 2,
      );
      context.fill();
      context.restore();
    }
  });

  context.save();
  context.strokeStyle = bloom.petalDark;
  context.lineWidth = 2 + 2 * roseProgress;
  context.lineCap = "round";
  context.globalAlpha = 0.85;
  context.translate(centerX, centerY);
  context.beginPath();
  context.arc(0, 0, 9 + 8 * roseProgress, -0.8, Math.PI * 1.25);
  context.stroke();
  context.beginPath();
  context.arc(0, 0, 5 + 5 * roseProgress, Math.PI * 0.25, Math.PI * 1.75);
  context.stroke();
  context.restore();

  context.fillStyle = bloom.center;
  context.beginPath();
  context.arc(centerX, centerY, 6 + 5 * progress, 0, Math.PI * 2);
  context.fill();
}

function drawTulipBloom(context, bloom, width, height, progress) {
  const centerX = width / 2;
  const centerY = height * 0.48;
  const bloomProgress = getFastBloomProgress(progress);
  const openProgress = easeInOut(bloomProgress);
  const spread = 58 * openProgress;
  const petalHeight = 42 + 50 * bloomProgress;
  const petalWidth = 6 + 32 * openProgress;
  const baseX = centerX;
  const baseY = centerY + 18;
  const shoulderY = baseY - petalHeight * 0.38;

  drawStem(context, bloom, width, height, centerX, centerY);

  [
    { x: -spread * 0.52, rotation: -0.04 - 0.6 * openProgress, color: bloom.petalDark, alpha: openProgress },
    { x: 0, rotation: 0, color: bloom.petal, alpha: 1 },
    { x: spread * 0.52, rotation: 0.04 + 0.6 * openProgress, color: bloom.petalDark, alpha: openProgress },
    { x: -spread * 0.24, rotation: -0.36 * openProgress, color: bloom.center, alpha: 0.35 + 0.65 * openProgress },
    { x: spread * 0.24, rotation: 0.36 * openProgress, color: bloom.petal, alpha: 0.35 + 0.65 * openProgress },
  ].forEach((petal) => {
    const tipX = centerX + petal.x;
    const tipY = centerY - petalHeight * 0.5 - 8 * bloomProgress;
    const sideLean = Math.sin(petal.rotation) * petalWidth * 0.65;

    context.save();
    context.globalAlpha = (0.2 + 0.8 * bloomProgress) * petal.alpha;
    context.fillStyle = petal.color;
    context.beginPath();
    context.moveTo(baseX, baseY);
    context.bezierCurveTo(
      baseX - petalWidth + sideLean,
      shoulderY,
      tipX - petalWidth * 0.45,
      centerY - petalHeight * 0.42,
      tipX,
      tipY,
    );
    context.bezierCurveTo(
      tipX + petalWidth * 0.45,
      centerY - petalHeight * 0.42,
      baseX + petalWidth + sideLean,
      shoulderY,
      baseX,
      baseY,
    );
    context.fill();
    context.restore();
  });
}

function drawBabyBreathBloom(context, bloom, width, height, progress) {
  const centerX = width / 2;
  const centerY = height * 0.48;
  const bloomProgress = getFastBloomProgress(progress);

  context.strokeStyle = bloom.stem;
  context.lineWidth = 2;
  context.lineCap = "round";

  for (let index = 0; index < 9; index += 1) {
    const angle = -Math.PI / 2 + (index - 4) * 0.2;
    const length = 98 * bloomProgress * (0.78 + (index % 3) * 0.12);
    const endX = centerX + Math.cos(angle) * length;
    const endY = centerY + Math.sin(angle) * length;
    const radius = 10 * bloomProgress;

    context.beginPath();
    context.moveTo(centerX, height * 0.82);
    context.quadraticCurveTo(centerX + (index - 4) * 8, centerY + 58, endX, endY);
    context.stroke();

    context.fillStyle = bloom.center;
    context.beginPath();
    context.arc(endX, endY, 2.5 + 2.5 * (1 - bloomProgress), 0, Math.PI * 2);
    context.fill();

    for (let petal = 0; petal < 5; petal += 1) {
      const petalAngle = (Math.PI * 2 * petal) / 5;

      context.save();
      context.translate(endX + Math.cos(petalAngle) * radius * 0.62, endY + Math.sin(petalAngle) * radius * 0.62);
      context.globalAlpha = bloomProgress;
      context.fillStyle = petal % 2 === 0 ? bloom.petal : bloom.petalDark;
      context.beginPath();
      context.arc(0, 0, radius * 0.42, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    context.fillStyle = bloom.center;
    context.beginPath();
    context.arc(endX, endY, Math.max(1.5, radius * 0.2), 0, Math.PI * 2);
    context.fill();
  }
}

function drawGerberaBloom(context, bloom, width, height, progress) {
  const centerX = width / 2;
  const centerY = height * 0.46;
  const bloomProgress = getFastBloomProgress(progress);
  const openProgress = easeInOut(bloomProgress);

  drawStem(context, bloom, width, height, centerX, centerY);

  for (let index = 0; index < 24; index += 1) {
    const angle = (Math.PI * 2 * index) / 24 - Math.PI / 2;
    const radius = 20 * openProgress;
    const petalLength = 10 + 34 * openProgress;
    const petalWidth = 3 + 6 * openProgress;
    const tipRound = 3 + 2.5 * openProgress;

    context.save();
    context.translate(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    context.rotate(angle);
    context.globalAlpha = 0.12 + 0.88 * openProgress;
    context.fillStyle = index % 2 === 0 ? bloom.petal : bloom.petalDark;
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(
      petalLength * 0.25,
      -petalWidth * 0.78,
      petalLength * 0.78,
      -petalWidth * 0.58,
      petalLength - tipRound,
      -petalWidth * 0.52,
    );
    context.quadraticCurveTo(petalLength + tipRound * 0.36, 0, petalLength - tipRound, petalWidth * 0.52);
    context.bezierCurveTo(
      petalLength * 0.78,
      petalWidth * 0.58,
      petalLength * 0.25,
      petalWidth * 0.78,
      0,
      0,
    );
    context.fill();
    context.restore();
  }

  context.fillStyle = bloom.center;
  context.beginPath();
  context.arc(centerX, centerY, 13 - 4 * openProgress + 10 * progress, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#f0c15b";
  context.globalAlpha = 0.75;
  context.beginPath();
  context.arc(centerX, centerY, 3 + 4 * openProgress, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
}

function drawLilyBloom(context, bloom, width, height, progress) {
  const centerX = width / 2;
  const centerY = height * 0.46;
  const bloomProgress = getFastBloomProgress(progress);
  const openProgress = easeInOut(bloomProgress);

  drawStem(context, bloom, width, height, centerX, centerY);

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6 - Math.PI / 2;
    const length = 18 + 58 * openProgress;
    const widthScale = 7 + 18 * openProgress;

    context.save();
    context.translate(centerX + Math.cos(angle) * 14 * openProgress, centerY + Math.sin(angle) * 10 * openProgress);
    context.rotate(angle);
    context.globalAlpha = 0.08 + 0.92 * openProgress;
    context.fillStyle = index % 2 === 0 ? bloom.petal : bloom.petalDark;
    context.beginPath();
    context.moveTo(0, 0);
    context.bezierCurveTo(length * 0.22, -widthScale, length * 0.82, -widthScale * 0.55, length, 0);
    context.bezierCurveTo(length * 0.82, widthScale * 0.55, length * 0.22, widthScale, 0, 0);
    context.fill();
    context.restore();
  }

  context.strokeStyle = bloom.center;
  context.lineWidth = 2;
  context.lineCap = "round";
  for (let index = 0; index < 3; index += 1) {
    const angle = -Math.PI / 2 + (index - 1) * 0.34;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + Math.cos(angle) * (18 + 16 * openProgress), centerY + Math.sin(angle) * (18 + 16 * openProgress));
    context.stroke();
  }

  context.fillStyle = bloom.center;
  context.beginPath();
  context.arc(centerX, centerY, 9 - 4 * openProgress + 4 * progress, 0, Math.PI * 2);
  context.fill();
}

function drawLineBloom(context, bloom, width, height, progress) {
  const centerX = width / 2;
  const baseY = height * 0.82;
  const stemBaseY = height * 0.9;
  const topY = height * 0.25;
  const bloomProgress = getFastBloomProgress(progress);
  const openProgress = easeInOut(bloomProgress);

  context.strokeStyle = bloom.stem;
  context.lineWidth = 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(centerX, stemBaseY);
  context.quadraticCurveTo(centerX - 8, height * 0.55, centerX + 4, topY);
  context.stroke();

  for (let index = 0; index < 9; index += 1) {
    const t = index / 8;
    const y = baseY + (topY - baseY) * t;
    const side = index % 2 === 0 ? -1 : 1;
    const x = centerX + side * (12 + 26 * openProgress) * (0.55 + t * 0.45);
    const flowerProgress = Math.min(Math.max(openProgress * 1.2 - (1 - t) * 0.08, 0), 1);
    const radius = 15 * flowerProgress;
    const budRadius = 3.5 + 2.5 * (1 - flowerProgress);

    context.fillStyle = bloom.center;
    context.beginPath();
    context.arc(x, y, budRadius, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = bloom.stem;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(centerX, y + 12);
    context.quadraticCurveTo(centerX + side * 10, y + 4, x, y);
    context.stroke();

    for (let petal = 0; petal < 5; petal += 1) {
      const petalAngle = (Math.PI * 2 * petal) / 5 - Math.PI / 2;
      context.save();
      context.translate(x + Math.cos(petalAngle) * radius * 0.48, y + Math.sin(petalAngle) * radius * 0.48);
      context.globalAlpha = flowerProgress;
      context.fillStyle = petal % 2 === 0 ? bloom.petal : bloom.petalDark;
      context.beginPath();
      context.ellipse(0, 0, radius * 0.42, radius * 0.3, petalAngle, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    context.fillStyle = bloom.center;
    context.beginPath();
    context.arc(x, y, Math.max(1.8, budRadius * (1 - flowerProgress) + radius * 0.16), 0, Math.PI * 2);
    context.fill();
  }
}

const bloomDrawers = {
  baby: drawBabyBreathBloom,
  gerbera: drawGerberaBloom,
  lily: drawLilyBloom,
  line: drawLineBloom,
  rose: drawRoseBloom,
  tulip: drawTulipBloom,
};

function FlowerBloomCanvas({ bloom, bloomType, progress }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const drawBloom = bloomDrawers[bloomType] ?? drawBabyBreathBloom;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, width, height);
    drawBloom(context, bloom, width, height, easeInOut(progress));
  }, [bloom, bloomType, progress]);

  return <canvas className="detected-bloom-canvas" ref={canvasRef} aria-hidden="true" />;
}

export default FlowerBloomCanvas;
