---
name: remotion-go-board
description: Use when creating Go (Igo/Baduk/Weiqi) board animations in Remotion. Provides the GoBoard component API, SGF format rules, and best practices for rendering animated Go game sequences.
metadata:
  tags: remotion, go, igo, baduk, weiqi, sgf, go-board, animation
---

## When to use

Use this skill whenever you are creating Go board animations in Remotion, working with SGF game records, or need to render animated Go game sequences.

## Installation

```bash
npm install remotion-go-board
```

Peer dependencies: `react >= 18`, `remotion >= 4.0`

## GoBoard Component

The main component. Import from `remotion-go-board`.

```tsx
import { GoBoard } from "remotion-go-board";

<GoBoard
  sgf="(;SZ[19];B[pd];W[dd];B[pq];W[dp];B[qk])"
  speed={15}
  boardSize={500}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sgf` | `string` | **(required)** | SGF game record string |
| `startMove` | `number` | `1` | Starting move number (1-based). Moves before this are shown immediately without animation |
| `endMove` | `number` | last move | Ending move number (1-based) |
| `speed` | `number` | `10` | Frames per move. Higher = slower playback |
| `boardSize` | `number` | `500` | Board display size in pixels |
| `showNumbers` | `boolean` | `false` | Show move numbers on stones |
| `boardColor` | `string` | `"#DEB887"` | Outer board color |
| `boardInnerColor` | `string` | `"#D4A56A"` | Inner board color |
| `lineColor` | `string` | `"#333"` | Grid line and star point color |

### Speed reference (at 30fps)

| speed | Time per move | Use case |
|-------|---------------|----------|
| `30` | 1 sec | Slow commentary |
| `15` | 0.5 sec | Normal playback |
| `10` | 0.33 sec | Slightly fast (default) |
| `6` | 0.2 sec | Fast playback |
| `1` | Instant | Static display |

### Calculating durationInFrames

```
durationInFrames = (endMove - startMove + 1) × speed + padding
```

Always add padding (30–60 frames) for comfortable viewing.

Example: 5 moves at speed 15 → `5 × 15 + 60 = 135` frames.

### Supported board sizes

6×6, 7×7, 9×9, 11×11, 13×13, 19×19 — auto-detected from SGF `SZ[n]` property.

## SGF Format

### Basic structure

```
(;SZ[19];B[pd];W[dd];B[pq];W[dp])
```

- `SZ[n]` — board size (default 19 if omitted)
- `B[xy]` — black move at column x, row y
- `W[xy]` — white move at column x, row y
- Coordinates: `a`=1st, `b`=2nd, ..., `s`=19th (left-to-right, top-to-bottom)

### Initial stone placement (for tsumego/problems)

Use `AB` (add black) and `AW` (add white) in the first node:

```
(;SZ[7]AB[df][ee][ed]AW[de][ef][fe][gf][fg];B[ce];W[dd];B[dc])
```

### Supported SGF features

- `SZ` — board size
- `B`, `W` — moves (main line only)
- `AB`, `AW` — initial stone placement
- Automatic capture handling

### NOT supported

- Variations/branches
- Comments (`C[...]`)
- Marks (`TR`, `SQ`, `MA`)
- Player names (`PB`, `PW`)

## Standalone Parser

For advanced use, the SGF parser and board state builder can be used directly:

```tsx
import { parseSgf, buildBoardState } from "remotion-go-board";

const data = parseSgf("(;SZ[9];B[ee];W[ge];B[eg])");
// data.size → 9
// data.moves → [{ color: "B", x: 4, y: 4 }, ...]

const board = buildBoardState(data, 2);
// board[y][x] → "B" | "W" | null
```

## Best Practices

### Composition sizing

| Video size | Recommended boardSize |
|---|---|
| 720 × 720 | 500–600 |
| 1080 × 1080 | 700–900 |
| 1920 × 1080 | 700–900 |
| 720 × 1280 (vertical) | 500–650 |

### Tsumego (problem) videos

1. Show problem first with `endMove={0}` and `speed={1}` (initial stones only)
2. Show answer with `showNumbers={true}` and slow `speed={30}`
3. Use `<Sequence>` to separate problem display (3 sec) from answer playback

```tsx
<Sequence from={0} durationInFrames={90}>
  <GoBoard sgf={sgf} endMove={0} speed={1} boardSize={400} />
</Sequence>
<Sequence from={90}>
  <GoBoard sgf={sgf} speed={30} showNumbers={true} boardSize={400} />
</Sequence>
```

### Partial game playback

Use `startMove` and `endMove` to show specific sections:

```tsx
// Show moves 10–20 (moves 1–9 shown immediately)
<GoBoard sgf={sgf} startMove={10} endMove={20} speed={15} />
```

### Animation behavior

- Stone appearance uses spring animation (damping: 12, stiffness: 200)
- Spring is disabled when `speed < 4` to avoid jitter
- Last move is marked with a circle (white on black stones, red on white stones)
- Stones have radial gradient and subtle shadow for realistic appearance
