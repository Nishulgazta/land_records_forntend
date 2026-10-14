"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

/* ─── Types ────────────────────────────────────────────────────────── */

export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  type: "pen" | "eraser";
}

export interface CanvasHandle {
  undo(): void;
  redo(): void;
  clear(): void;
  exportImage(): string;
  getStrokes(): Stroke[];
  setStrokes(strokes: Stroke[]): void;
}

const LEDGER_HEADERS = [
  "खेवट नं. नाम पट्टी या तरफ मय नाम नम्बरदार मुतवल्ली व शहर मुहालमा व हदूद",
  "खतौनी नं. लगान जो मुकररा अदा करता है व तपशील शरह व तदाद",
  "नाम मालिक व एहवाल",
  "नाम काश्तकार व एहवाल",
  "नाम चाह व दीगर वसाइल आबपाशी",
  "नम्बर खसरा हाल",
  "रकबा हर खेत व मिजान खाता मय किस्म अराजी मीट्रिक इकाइयों में",
  "हिस्सा या पैमाना हकियत व तरीका बाग",
  "कैफियत",
];

const LEDGER_COLUMN_WIDTHS = [0.08, 0.09, 0.13, 0.15, 0.09, 0.08, 0.16, 0.11, 0.11];
const LEDGER_HEADER_HEIGHT = 150;
const LEDGER_ENTRY_ROWS = 3;

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawLedgerTemplate(
  context: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  context.fillStyle = "#fffdf8";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "#f5f0e5";
  context.fillRect(0, 0, width, LEDGER_HEADER_HEIGHT);

  const columnEdges = [0];
  for (const fraction of LEDGER_COLUMN_WIDTHS) {
    columnEdges.push(columnEdges[columnEdges.length - 1] + fraction * width);
  }

  context.strokeStyle = "#948a79";
  context.lineWidth = 1;
  context.beginPath();
  context.rect(0.5, 0.5, width - 1, height - 1);

  for (const x of columnEdges.slice(1, -1)) {
    context.moveTo(x, 0);
    context.lineTo(x, height);
  }

  const headerNumberY = LEDGER_HEADER_HEIGHT - 28;
  context.moveTo(0, headerNumberY);
  context.lineTo(width, headerNumberY);

  const entryHeight = (height - LEDGER_HEADER_HEIGHT) / LEDGER_ENTRY_ROWS;
  for (let row = 1; row <= LEDGER_ENTRY_ROWS; row++) {
    const y = LEDGER_HEADER_HEIGHT + entryHeight * row;
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  context.stroke();

  context.textAlign = "center";
  context.textBaseline = "top";

  LEDGER_HEADERS.forEach((header, index) => {
    const cellWidth = LEDGER_COLUMN_WIDTHS[index] * width;
    const cellCenter = columnEdges[index] + cellWidth / 2;
    const maxTextWidth = cellWidth - 12;
    let fontSize = 12;
    let lines: string[];

    do {
      context.font = `${fontSize}px "Nirmala UI", "Mangal", sans-serif`;
      lines = wrapText(context, header, maxTextWidth);
      if (lines.length > 7) fontSize -= 1;
    } while (lines.length > 7 && fontSize > 9);

    const lineHeight = fontSize + 4;
    lines.slice(0, 7).forEach((line, lineIndex) => {
      context.fillStyle = "#28251f";
      context.fillText(line, cellCenter, 10 + lineIndex * lineHeight);
    });

    context.font = '12px "Nirmala UI", "Mangal", sans-serif';
    context.fillStyle = "#4f493f";
    context.fillText(String(index + 1), cellCenter, headerNumberY + 6);
  });
}

interface Props {
  penColor?: string;
  penWidth?: number;
  eraserWidth?: number;
  tool?: "pen" | "eraser";
  className?: string;
  width?: number;
  height?: number;
}

/* ─── Component ───────────────────────────────────────────────────── */

const NotebookCanvas = forwardRef<CanvasHandle, Props>(
  function NotebookCanvas(
    {
      penColor = "#1a1a2e",
      penWidth = 2.5,
      eraserWidth = 24,
      tool = "pen",
      className,
      width = 1040,
      height = 720,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const templateRef = useRef<HTMLCanvasElement>(null);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [undone, setUndone] = useState<Stroke[]>([]);
    const currentStroke = useRef<Stroke | null>(null);
    const isDrawing = useRef(false);
    const snapshotRef = useRef<ImageData | null>(null);

    /* ── Draw a single stroke to the canvas ──────────────────────── */
    const drawStroke = useCallback(
      (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
        const pts = stroke.points;
        if (pts.length === 0) return;

        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (stroke.type === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.strokeStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = stroke.color;
        }

        // Average pressure for consistent stroke width
        const avgPressure =
          pts.reduce((s, p) => s + p.pressure, 0) / pts.length;
        ctx.lineWidth = stroke.width * Math.max(0.3, avgPressure);

        if (pts.length === 1) {
          ctx.beginPath();
          ctx.arc(
            pts[0].x,
            pts[0].y,
            ctx.lineWidth / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);

          // Smooth curves using quadratic bezier
          for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
          }
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
        }

        ctx.restore();
      },
      []
    );

    /* ── Full redraw ─────────────────────────────────────────────── */
    const redrawAll = useCallback(
      (allStrokes: Stroke[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const s of allStrokes) drawStroke(ctx, s);
        // Take snapshot after redraw
        snapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      },
      [drawStroke]
    );

    /* ── Setup canvas resolution ─────────────────────────────────── */
    useEffect(() => {
      const canvas = canvasRef.current;
      const template = templateRef.current;
      if (!canvas || !template) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      template.width = width * dpr;
      template.height = height * dpr;
      template.style.width = `${width}px`;
      template.style.height = `${height}px`;
      const templateContext = template.getContext("2d")!;
      templateContext.scale(dpr, dpr);
      drawLedgerTemplate(templateContext, width, height);
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      redrawAll(strokes);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    /* ── Re-render when strokes change ───────────────────────────── */
    useEffect(() => {
      redrawAll(strokes);
    }, [strokes, redrawAll]);

    /* ── Pointer helpers ─────────────────────────────────────────── */
    const getPoint = (e: React.PointerEvent): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressure: e.pressure > 0 ? e.pressure : 0.5,
      };
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.button !== 0) return; // Only primary button
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.setPointerCapture(e.pointerId);
      isDrawing.current = true;

      const pt = getPoint(e);
      currentStroke.current = {
        points: [pt],
        color: tool === "pen" ? penColor : "#000",
        width: tool === "pen" ? penWidth : eraserWidth,
        type: tool,
      };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !currentStroke.current) return;
      e.preventDefault();

      const pt = getPoint(e);
      currentStroke.current.points.push(pt);

      // Restore snapshot and draw current stroke on top
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;

      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }
      drawStroke(ctx, currentStroke.current);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current || !currentStroke.current) return;
      e.preventDefault();

      isDrawing.current = false;

      if (currentStroke.current.points.length > 0) {
        const completed = currentStroke.current;
        setStrokes((prev) => [...prev, completed]);
        setUndone([]);
      }
      currentStroke.current = null;
    };

    /* ── Imperative handle ───────────────────────────────────────── */
    useImperativeHandle(
      ref,
      () => ({
        undo() {
          setStrokes((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setUndone((u) => [...u, last]);
            return prev.slice(0, -1);
          });
        },
        redo() {
          setUndone((u) => {
            if (u.length === 0) return u;
            const last = u[u.length - 1];
            setStrokes((prev) => [...prev, last]);
            return u.slice(0, -1);
          });
        },
        clear() {
          setStrokes([]);
          setUndone([]);
        },
        exportImage(): string {
          const canvas = canvasRef.current;
          if (!canvas) return "";

          const dpr = window.devicePixelRatio || 1;

          // Create export canvas with background rules
          const exp = document.createElement("canvas");
          exp.width = width * dpr;
          exp.height = height * dpr;
          const ctx = exp.getContext("2d")!;
          ctx.scale(dpr, dpr);

          drawLedgerTemplate(ctx, width, height);

          // Draw all strokes
          for (const s of strokes) drawStroke(ctx, s);

          return exp.toDataURL("image/png");
        },
        getStrokes(): Stroke[] {
          return strokes;
        },
        setStrokes(newStrokes: Stroke[]) {
          setStrokes(newStrokes);
          setUndone([]);
        },
      }),
      [strokes, drawStroke, width, height]
    );

    const hasUndo = strokes.length > 0;
    const hasRedo = undone.length > 0;

    return (
      <div
        className={`canvas-notebook ${
          tool === "eraser" ? "canvas-notebook--eraser" : ""
        } ${className || ""}`}
        data-has-undo={hasUndo}
        data-has-redo={hasRedo}
        style={{ width, height }}
      >
        <canvas
          ref={templateRef}
          className="canvas-notebook__template"
          width={width}
          height={height}
          aria-hidden="true"
        />
        <canvas
          ref={canvasRef}
          className="canvas-notebook__ink"
          width={width}
          height={height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    );
  }
);

export default NotebookCanvas;
