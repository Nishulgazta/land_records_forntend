"use client";

import React from "react";

interface ToolbarProps {
  tool: "pen" | "eraser";
  penWidth: number;
  eraserWidth: number;
  canUndo: boolean;
  canRedo: boolean;
  isRecognizing: boolean;
  onToolChange: (tool: "pen" | "eraser") => void;
  onPenWidthChange: (w: number) => void;
  onEraserWidthChange: (w: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onRecognize: () => void;
}

export default function Toolbar({
  tool,
  penWidth,
  eraserWidth,
  canUndo,
  canRedo,
  isRecognizing,
  onToolChange,
  onPenWidthChange,
  onEraserWidthChange,
  onUndo,
  onRedo,
  onClear,
  onRecognize,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      {/* History */}
      <div className="toolbar__group">
        <button
          className="toolbar__btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩
        </button>
        <button
          className="toolbar__btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↪
        </button>
      </div>

      <div className="toolbar__separator" />

      {/* Drawing tools */}
      <div className="toolbar__group">
        <button
          className={`toolbar__btn ${
            tool === "pen" ? "toolbar__btn--active" : ""
          }`}
          onClick={() => onToolChange("pen")}
          title="Pen"
        >
          ✏️ Pen
        </button>
        <button
          className={`toolbar__btn ${
            tool === "eraser" ? "toolbar__btn--active" : ""
          }`}
          onClick={() => onToolChange("eraser")}
          title="Eraser"
        >
          🧹 Eraser
        </button>
      </div>

      <div className="toolbar__separator" />

      {/* Pen width */}
      {tool === "pen" && (
        <div className="toolbar__group">
          <span className="toolbar__label">Size</span>
          <input
            type="range"
            className="toolbar__slider"
            min={1}
            max={8}
            step={0.5}
            value={penWidth}
            onChange={(e) => onPenWidthChange(parseFloat(e.target.value))}
          />
          <span className="toolbar__label">{penWidth}</span>
        </div>
      )}

      {/* Eraser width */}
      {tool === "eraser" && (
        <div className="toolbar__group">
          <span className="toolbar__label">Size</span>
          <input
            type="range"
            className="toolbar__slider"
            min={8}
            max={50}
            step={2}
            value={eraserWidth}
            onChange={(e) =>
              onEraserWidthChange(parseFloat(e.target.value))
            }
          />
          <span className="toolbar__label">{eraserWidth}</span>
        </div>
      )}

      <div className="toolbar__separator" />

      {/* Actions */}
      <div className="toolbar__group">
        <button
          className="toolbar__btn"
          onClick={onClear}
          title="Clear canvas"
        >
          🗑️ Clear
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* Recognition */}
      <div className="toolbar__group">
        <button
          className="toolbar__btn toolbar__btn--active"
          onClick={onRecognize}
          disabled={isRecognizing}
          title="Send handwriting for recognition"
          style={{ padding: "4px 12px" }}
        >
          {isRecognizing ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Recognizing…
            </>
          ) : (
            <>🔍 Recognize Handwriting</>
          )}
        </button>
      </div>
    </div>
  );
}
