# remotion-go-board

A [Remotion](https://www.remotion.dev/) component that renders animated Go board sequences from SGF game records.

[日本語版 README](./README-ja.md)

## Installation

```bash
npm install remotion-go-board
```

> `react` and `remotion` are peer dependencies.

## Basic Usage

```tsx
import { GoBoard } from "remotion-go-board";

export const MyComposition: React.FC = () => {
  return (
    <GoBoard
      sgf="(;SZ[19];B[pd];W[dd];B[pq];W[dp];B[qk])"
      startMove={1}
      endMove={5}
      speed={15}
      boardSize={500}
    />
  );
};
```

## GoBoard Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `sgf` | `string` | **(required)** | SGF game record string |
| `startMove` | `number` | `1` | Starting move number (1-based) |
| `endMove` | `number` | last move | Ending move number (1-based) |
| `speed` | `number` | `10` | Frames per move (10 = 3 moves/sec at 30fps) |
| `boardSize` | `number` | `500` | Display size in pixels |
| `showNumbers` | `boolean` | `false` | Show move numbers on stones |
| `boardColor` | `string` | `"#DEB887"` | Outer board color |
| `boardInnerColor` | `string` | `"#D4A56A"` | Inner board color |
| `lineColor` | `string` | `"#333"` | Grid line and star point color |

### Speed Reference (at 30fps)

| speed | Playback |
|---|---|
| `30` | 1 move/sec (slow) |
| `15` | 2 moves/sec |
| `10` | 3 moves/sec (default) |
| `6` | 5 moves/sec (fast) |
| `1` | Static display (shows final position immediately) |

## Supported Board Sizes

6×6, 7×7, 9×9, 11×11, 13×13, and 19×19. The board size is automatically detected from the `SZ` property in the SGF string.

## SGF Format

Standard [SGF (Smart Game Format)](https://www.red-bean.com/sgf/) is supported.

```
(;SZ[19];B[pd];W[dd];B[pq];W[dp])
```

### Initial Stone Placement (AB/AW)

For problems (tsumego) or board positions with pre-placed stones:

```
(;SZ[7]AB[df][ee][ed]AW[de][ef][fe][gf][fg];B[ce];W[dd];B[dc])
```

- `AB[xy][xy]...` — Add Black stones
- `AW[xy][xy]...` — Add White stones

## Using the SGF Parser Standalone

The parser can be used independently without the Remotion component.

```ts
import { parseSgf, buildBoardState } from "remotion-go-board";

const sgf = "(;SZ[9];B[ee];W[ge];B[eg])";
const data = parseSgf(sgf);

console.log(data.size);   // 9
console.log(data.moves);  // [{ color: "B", x: 4, y: 4 }, ...]

// Get board state after 2 moves (with capture handling)
const board = buildBoardState(data, 2);
// board[y][x] is "B" | "W" | null
```

## Features

- Realistic stone rendering with gradients and shadows
- Spring animation on newly placed stones
- Last move marker
- Stone capture (removal) with full group and liberty calculation
- Star points (hoshi) for all supported board sizes

## License

MIT
