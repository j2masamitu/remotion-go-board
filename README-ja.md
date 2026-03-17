# remotion-go-board

SGF棋譜から碁盤アニメーションを生成する [Remotion](https://www.remotion.dev/) コンポーネント。

## インストール

```bash
npm install remotion-go-board
```

> `react` と `remotion` が peerDependencies です。

## 基本的な使い方

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

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| `sgf` | `string` | **(必須)** | SGF棋譜文字列 |
| `startMove` | `number` | `1` | 開始手数（1-based） |
| `endMove` | `number` | 最終手 | 終了手数（1-based） |
| `speed` | `number` | `10` | フレーム/手（10 = 30fpsで1秒3手） |
| `boardSize` | `number` | `500` | 表示サイズ（px） |
| `showNumbers` | `boolean` | `false` | 手番号を表示するか |
| `boardColor` | `string` | `"#DEB887"` | 碁盤の外側の色 |
| `boardInnerColor` | `string` | `"#D4A56A"` | 碁盤の内側の色 |
| `lineColor` | `string` | `"#333"` | 罫線・星の色 |

### speed の目安（30fps の場合）

| speed | 再生速度 |
|---|---|
| `30` | 1秒に1手（ゆっくり） |
| `15` | 1秒に2手 |
| `10` | 1秒に3手（デフォルト） |
| `6` | 1秒に5手（速い） |
| `1` | 静止表示（最終盤面を即座に表示） |

## 対応盤サイズ

6路・7路・9路・11路・13路・19路に対応しています。盤サイズはSGFの `SZ` プロパティから自動判定されます。

## SGF形式

標準的なSGF (Smart Game Format) に対応しています。

```
(;SZ[19];B[pd];W[dd];B[pq];W[dp])
```

### 初期配石（AB/AW）

詰碁や局面図のように、あらかじめ石が置かれた状態から始める場合：

```
(;SZ[7]AB[df][ee][ed]AW[de][ef][fe][gf][fg];B[ce];W[dd];B[dc])
```

- `AB[xy][xy]...` — 黒石の初期配置
- `AW[xy][xy]...` — 白石の初期配置

## SGFパーサーの単体利用

コンポーネントを使わず、パーサーだけ利用することもできます。

```ts
import { parseSgf, buildBoardState } from "remotion-go-board";

const sgf = "(;SZ[9];B[ee];W[ge];B[eg])";
const data = parseSgf(sgf);

console.log(data.size);   // 9
console.log(data.moves);  // [{ color: "B", x: 4, y: 4 }, ...]

// 2手目までの盤面を取得（石の取り上げ処理込み）
const board = buildBoardState(data, 2);
// board[y][x] は "B" | "W" | null
```

## ライセンス

MIT
