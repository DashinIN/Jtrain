export interface StrokePoint {
  x: number;
  y: number;
}

export type Stroke = StrokePoint[];

const CANVAS_SIZE = 128;
const SAMPLE_SIZE = 32;
const EXPECTED_MATCH_THRESHOLD = 0.1;
const GENERAL_MATCH_THRESHOLD = 0.12;

function createRaster(): number[] {
  return new Array(SAMPLE_SIZE * SAMPLE_SIZE).fill(0);
}

function boundsForStrokes(strokes: Stroke[]) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const stroke of strokes) {
    for (const point of stroke) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

function drawUserStrokes(strokes: Stroke[]): HTMLCanvasElement | null {
  const bounds = boundsForStrokes(strokes);
  if (!bounds) return null;

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min((CANVAS_SIZE * 0.78) / width, (CANVAS_SIZE * 0.78) / height);
  const offsetX = (CANVAS_SIZE - width * scale) / 2;
  const offsetY = (CANVAS_SIZE - height * scale) / 2;

  context.strokeStyle = "#111111";
  context.lineWidth = 12;
  context.lineCap = "round";
  context.lineJoin = "round";

  for (const stroke of strokes) {
    if (!stroke.length) continue;
    context.beginPath();
    stroke.forEach((point, index) => {
      const x = offsetX + (point.x - bounds.minX) * scale;
      const y = offsetY + (point.y - bounds.minY) * scale;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }

  return canvas;
}

function drawKanaGlyph(kana: string): HTMLCanvasElement | null {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.fillStyle = "#111111";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "96px 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif";
  context.fillText(kana, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 4);

  return canvas;
}

function rasterize(canvas: HTMLCanvasElement): number[] {
  const context = canvas.getContext("2d");
  if (!context) return createRaster();

  const matrix = createRaster();
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const stepX = canvas.width / SAMPLE_SIZE;
  const stepY = canvas.height / SAMPLE_SIZE;

  for (let row = 0; row < SAMPLE_SIZE; row += 1) {
    for (let column = 0; column < SAMPLE_SIZE; column += 1) {
      let dark = 0;
      let total = 0;
      const startX = Math.floor(column * stepX);
      const endX = Math.floor((column + 1) * stepX);
      const startY = Math.floor(row * stepY);
      const endY = Math.floor((row + 1) * stepY);

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const index = (y * canvas.width + x) * 4;
          const value = image.data[index];
          total += 1;
          if (value < 220) dark += 1;
        }
      }

      matrix[row * SAMPLE_SIZE + column] = total > 0 && dark / total > 0.14 ? 1 : 0;
    }
  }

  return matrix;
}

function compareRasters(a: number[], b: number[]) {
  let overlap = 0;
  let union = 0;

  for (let index = 0; index < a.length; index += 1) {
    if (a[index] || b[index]) union += 1;
    if (a[index] && b[index]) overlap += 1;
  }

  return union === 0 ? 0 : overlap / union;
}

export function recognizeKanaDrawing(strokes: Stroke[], candidates: string[], expectedKana?: string) {
  const userCanvas = drawUserStrokes(strokes);
  if (!userCanvas) return null;

  const userRaster = rasterize(userCanvas);
  let bestMatch: { kana: string; score: number } | null = null;
  let expectedMatch: { kana: string; score: number } | null = null;

  for (const kana of candidates) {
    const glyphCanvas = drawKanaGlyph(kana);
    if (!glyphCanvas) continue;
    const score = compareRasters(userRaster, rasterize(glyphCanvas));
    if (expectedKana && kana === expectedKana) {
      expectedMatch = { kana, score };
    }
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { kana, score };
    }
  }

  if (expectedMatch && expectedMatch.score >= EXPECTED_MATCH_THRESHOLD) {
    return expectedMatch;
  }

  return bestMatch && bestMatch.score >= GENERAL_MATCH_THRESHOLD ? bestMatch : null;
}
