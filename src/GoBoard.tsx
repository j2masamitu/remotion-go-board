import React from "react";
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { parseSgf, buildBoardState } from "./sgf";
import type { SgfData } from "./sgf";

export interface GoBoardProps {
  /** SGF game record string */
  sgf: string;
  /** Starting move number (1-based, default: 1) */
  startMove?: number;
  /** Ending move number (1-based, default: last move) */
  endMove?: number;
  /** Frames per move (default: 10 = 3 moves/sec at 30fps) */
  speed?: number;
  /** Display size in pixels (default: 500) */
  boardSize?: number;
  /** Show move numbers on stones (default: false) */
  showNumbers?: boolean;
  /** Outer board color (default: "#DEB887") */
  boardColor?: string;
  /** Inner board color (default: "#D4A56A") */
  boardInnerColor?: string;
  /** Grid line and star point color (default: "#333") */
  lineColor?: string;
}

/** Return star point (hoshi) positions for a given board size */
function getStarPoints(size: number): [number, number][] {
  if (size === 19) {
    return [
      [3, 3], [9, 3], [15, 3],
      [3, 9], [9, 9], [15, 9],
      [3, 15], [9, 15], [15, 15],
    ];
  }
  if (size === 13) {
    return [[3, 3], [9, 3], [6, 6], [3, 9], [9, 9]];
  }
  if (size === 11) {
    return [[2, 2], [8, 2], [5, 5], [2, 8], [8, 8]];
  }
  if (size === 9) {
    return [[2, 2], [6, 2], [4, 4], [2, 6], [6, 6]];
  }
  if (size === 7) {
    return [[2, 2], [4, 2], [3, 3], [2, 4], [4, 4]];
  }
  if (size === 6) {
    return [[2, 2], [3, 3]];
  }
  return [];
}

export const GoBoard: React.FC<GoBoardProps> = ({
  sgf,
  startMove = 1,
  endMove,
  speed = 10,
  boardSize = 500,
  showNumbers = false,
  boardColor = "#DEB887",
  boardInnerColor = "#D4A56A",
  lineColor = "#333",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sgfData = React.useMemo<SgfData>(() => parseSgf(sgf), [sgf]);
  const finalEnd = endMove ?? sgfData.moves.length;
  const start = Math.max(1, startMove);

  // Calculate the current move index based on frame and speed
  const currentMoveIndex = Math.min(
    start - 1 + Math.floor(frame / speed),
    finalEnd,
  );

  // Build the board state up to the current move
  const board = React.useMemo(
    () => buildBoardState(sgfData, currentMoveIndex),
    [sgfData, currentMoveIndex],
  );

  // Get the last placed stone for marker display
  const lastMove = currentMoveIndex > 0 ? sgfData.moves[currentMoveIndex - 1] : null;

  // Board rendering calculations
  const size = sgfData.size;
  const outerPadding = 4;
  const cellSize = (boardSize - outerPadding * 2) / size;
  const margin = cellSize * 0.5 + outerPadding;
  const stoneRadius = cellSize * 0.47;

  // Spring animation for the latest stone (disabled when speed is too low)
  const stoneAppear = speed >= 4
    ? spring({
        frame: frame % speed,
        fps,
        config: { damping: 12, stiffness: 200 },
        durationInFrames: Math.min(speed, 8),
      })
    : 1;

  return (
    <div
      style={{
        width: boardSize,
        height: boardSize,
        position: "relative",
      }}
    >
      <svg width={boardSize} height={boardSize} viewBox={`0 0 ${boardSize} ${boardSize}`}>
        {/* Board background */}
        <rect x={0} y={0} width={boardSize} height={boardSize} rx={6} fill={boardColor} />
        <rect
          x={margin - cellSize * 0.5}
          y={margin - cellSize * 0.5}
          width={boardSize - margin * 2 + cellSize}
          height={boardSize - margin * 2 + cellSize}
          fill={boardInnerColor}
          rx={2}
        />

        {/* Grid lines */}
        {Array.from({ length: size }, (_, i) => {
          const pos = margin + i * cellSize;
          return (
            <React.Fragment key={`line-${i}`}>
              <line
                x1={margin} y1={pos} x2={margin + (size - 1) * cellSize} y2={pos}
                stroke={lineColor} strokeWidth={i === 0 || i === size - 1 ? 1.5 : 0.8}
              />
              <line
                x1={pos} y1={margin} x2={pos} y2={margin + (size - 1) * cellSize}
                stroke={lineColor} strokeWidth={i === 0 || i === size - 1 ? 1.5 : 0.8}
              />
            </React.Fragment>
          );
        })}

        {/* Star points (hoshi) */}
        {getStarPoints(size).map(([sx, sy]) => (
          <circle
            key={`star-${sx}-${sy}`}
            cx={margin + sx * cellSize}
            cy={margin + sy * cellSize}
            r={cellSize * 0.12}
            fill={lineColor}
          />
        ))}

        {/* Stones */}
        {board.map((row, y) =>
          row.map((cell, x) => {
            if (!cell) return null;
            const cx = margin + x * cellSize;
            const cy = margin + y * cellSize;
            const isLast = lastMove && lastMove.x === x && lastMove.y === y;
            const scale = isLast ? stoneAppear : 1;

            // Find move number for this position
            let moveNum: number | null = null;
            if (showNumbers) {
              for (let mi = currentMoveIndex - 1; mi >= 0; mi--) {
                const m = sgfData.moves[mi];
                if (m.x === x && m.y === y) {
                  moveNum = mi + 1;
                  break;
                }
              }
            }

            return (
              <g key={`stone-${x}-${y}`} transform={`translate(${cx}, ${cy}) scale(${scale})`}>
                {/* Stone shadow */}
                <circle cx={1.5} cy={1.5} r={stoneRadius} fill="rgba(0,0,0,0.25)" />
                {/* Stone body */}
                <circle
                  cx={0} cy={0} r={stoneRadius}
                  fill={cell === "B"
                    ? "url(#remotion-go-board-black)"
                    : "url(#remotion-go-board-white)"}
                  stroke={cell === "W" ? "#888" : "none"}
                  strokeWidth={cell === "W" ? 0.5 : 0}
                />
                {/* Last move marker */}
                {isLast && (
                  <circle
                    cx={0} cy={0} r={stoneRadius * 0.35}
                    fill="none"
                    stroke={cell === "B" ? "#fff" : "#f00"}
                    strokeWidth={2}
                  />
                )}
                {/* Move number */}
                {showNumbers && moveNum !== null && (
                  <text
                    x={0} y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={cell === "B" ? "#fff" : "#000"}
                    fontSize={stoneRadius * 0.9}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {moveNum}
                  </text>
                )}
              </g>
            );
          }),
        )}

        {/* Gradient definitions */}
        <defs>
          <radialGradient id="remotion-go-board-black" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#666" />
            <stop offset="50%" stopColor="#222" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <radialGradient id="remotion-go-board-white" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="50%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#ccc" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};
