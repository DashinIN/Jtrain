import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Translator } from "../i18n/translations";
import { recognizeKanaDrawing } from "../utils/handwriting";

interface Props {
  candidates: string[];
  expectedKana?: string;
  t: Translator;
  disabled?: boolean;
  onMatch: (value: string) => void;
}

type Point = { x: number; y: number };
type Stroke = Point[];

const WIDTH = 320;
const HEIGHT = 320;

function cloneStrokes(strokes: Stroke[]) {
  return strokes.map((stroke) => stroke.map((point) => ({ ...point })));
}

export function KanaHandwritingPad({ candidates, expectedKana, t, disabled, onMatch }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [hint, setHint] = useState<string>("");
  const [candidate, setCandidate] = useState<{ kana: string; score: number } | null>(null);

  const uniqueCandidates = useMemo(() => Array.from(new Set(candidates)), [candidates]);

  const redraw = (nextStrokes: Stroke[]) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.03)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(255, 255, 255, 0.08)";
    context.lineWidth = 1;

    for (let index = 1; index < 4; index += 1) {
      const x = (canvas.width / 4) * index;
      const y = (canvas.height / 4) * index;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }

    context.strokeStyle = "#ffffff";
    context.lineWidth = 14;
    context.lineCap = "round";
    context.lineJoin = "round";

    for (const stroke of nextStrokes) {
      if (!stroke.length) continue;
      context.beginPath();
      stroke.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
    }
  };

  useEffect(() => {
    redraw([]);
  }, []);

  useEffect(() => {
    setStrokes([]);
    setDrawing(false);
    setHint("");
    setCandidate(null);
    redraw([]);
  }, [uniqueCandidates, disabled]);

  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFromEvent(event);
    setHint("");
    setCandidate(null);
    setDrawing(true);
    setStrokes((current) => {
      const next = [...cloneStrokes(current), [point]];
      redraw(next);
      return next;
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing || disabled) return;
    const point = pointFromEvent(event);
    setStrokes((current) => {
      if (!current.length) return current;
      const next = cloneStrokes(current);
      next[next.length - 1].push(point);
      redraw(next);
      return next;
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDrawing(false);
  };

  const clear = () => {
    setStrokes([]);
    setHint("");
    setCandidate(null);
    redraw([]);
  };

  const recognize = () => {
    const result = recognizeKanaDrawing(strokes, uniqueCandidates, expectedKana);
    if (!result) {
      setCandidate(null);
      setHint(t("noCloseMatchYet"));
      return;
    }
    setCandidate(result);
    setHint(`${t("recognizedKana")}: ${result.kana} · ${Math.round(result.score * 100)}%`);
  };

  return (
    <div className="handwriting-pad">
      <canvas
        ref={canvasRef}
        className="handwriting-canvas"
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      <div className="handwriting-actions">
        <button type="button" className="secondary icon-action" onClick={clear} disabled={disabled} aria-label={t("clearDrawing")} title={t("clearDrawing")}>
          <span aria-hidden="true">🗑</span>
        </button>
        <button
          type="button"
          className="primary icon-action"
          onClick={candidate ? () => onMatch(candidate.kana) : recognize}
          disabled={disabled || !strokes.length}
          aria-label={candidate ? t("confirmDrawing") : t("recognizeDrawing")}
          title={candidate ? t("confirmDrawing") : t("recognizeDrawing")}
        >
          <span aria-hidden="true">✓</span>
        </button>
      </div>
      <div className="handwriting-hint">
        {hint || (candidate ? t("tapCheckToSubmit") : t("drawKanaHint"))}
      </div>
    </div>
  );
}
