/**
 * SGF Parser
 * Parses SGF (Smart Game Format) game record strings and computes board states.
 * Supports main line moves and initial stone placement (AB/AW).
 */

export interface SgfStone {
  color: "B" | "W";
  x: number; // 0-based column
  y: number; // 0-based row
}

export interface SgfMove {
  color: "B" | "W";
  x: number; // 0-based column
  y: number; // 0-based row
}

export interface SgfData {
  size: number;              // Board size (6, 7, 9, 11, 13, 19, etc.)
  initialStones: SgfStone[]; // Initial stone placement via AB/AW
  moves: SgfMove[];          // Sequence of moves
}

/** Convert an SGF coordinate character (a-s) to a 0-based index */
function charToCoord(c: string): number {
  return c.charCodeAt(0) - "a".charCodeAt(0);
}

/** Parse an SGF string and extract the main line moves */
export function parseSgf(sgf: string): SgfData {
  // Extract board size (default: 19)
  const sizeMatch = sgf.match(/SZ\[(\d+)\]/);
  const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 19;

  // Extract initial stone placement: AB[xy][xy]... / AW[xy][xy]...
  const initialStones: SgfStone[] = [];
  const addRegex = /A([BW])((?:\[[a-s][a-s]\])+)/g;
  let addMatch: RegExpExecArray | null;
  while ((addMatch = addRegex.exec(sgf)) !== null) {
    const color = addMatch[1] as "B" | "W";
    const coords = addMatch[2];
    const coordRegex = /\[([a-s])([a-s])\]/g;
    let coordMatch: RegExpExecArray | null;
    while ((coordMatch = coordRegex.exec(coords)) !== null) {
      initialStones.push({
        color,
        x: charToCoord(coordMatch[1]),
        y: charToCoord(coordMatch[2]),
      });
    }
  }

  // Extract main line moves in order
  const moves: SgfMove[] = [];
  const moveRegex = /;([BW])\[([a-s])([a-s])\]/g;
  let match: RegExpExecArray | null;

  while ((match = moveRegex.exec(sgf)) !== null) {
    moves.push({
      color: match[1] as "B" | "W",
      x: charToCoord(match[2]),
      y: charToCoord(match[3]),
    });
  }

  return { size, initialStones, moves };
}

/**
 * Compute the board state up to a given move number.
 * Places initial stones first, then applies moves sequentially with capture handling.
 */
export function buildBoardState(
  sgfData: SgfData,
  upToMove: number,
): (null | "B" | "W")[][] {
  const { size, initialStones, moves } = sgfData;
  const board: (null | "B" | "W")[][] = Array.from({ length: size }, () =>
    Array(size).fill(null),
  );

  // Place initial stones
  for (const s of initialStones) {
    board[s.y][s.x] = s.color;
  }

  // Apply moves sequentially
  const limit = Math.min(upToMove, moves.length);
  for (let i = 0; i < limit; i++) {
    const m = moves[i];
    board[m.y][m.x] = m.color;

    // Capture opponent stones if they have no liberties
    const opponent = m.color === "B" ? "W" : "B";
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = m.x + dx;
      const ny = m.y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === opponent) {
        const group = getGroup(board, nx, ny, size);
        if (countLiberties(board, group, size) === 0) {
          for (const [gx, gy] of group) {
            board[gy][gx] = null;
          }
        }
      }
    }
  }

  return board;
}

/** Get the connected group of stones starting from a given position */
function getGroup(
  board: (null | "B" | "W")[][],
  startX: number,
  startY: number,
  size: number,
): [number, number][] {
  const color = board[startY][startX];
  if (!color) return [];

  const visited = new Set<string>();
  const group: [number, number][] = [];
  const stack: [number, number][] = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (x < 0 || x >= size || y < 0 || y >= size) continue;
    if (board[y][x] !== color) continue;

    group.push([x, y]);
    stack.push([x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]);
  }

  return group;
}

/** Count the liberties (empty adjacent points) of a group */
function countLiberties(
  board: (null | "B" | "W")[][],
  group: [number, number][],
  size: number,
): number {
  const liberties = new Set<string>();
  for (const [x, y] of group) {
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[ny][nx] === null) {
        liberties.add(`${nx},${ny}`);
      }
    }
  }
  return liberties.size;
}
