# キーワード一覧

NagiScript のキーワード全体を解説します。

---

## 型を定義するキーワード

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `struct` | 構造体の定義 | `struct Point { x: f64 }` |
| `enum` | 列挙型の定義 | `enum Color { Red, Green }` |
| `fn` | 関数の定義 | `fn add(a: i32, b: i32) i32` |
| `type` | 型エイリアス | `type Int = i32` |

---

## 変数宣言

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `val` | 不変変数の宣言 | `val x = 42` |
| `var` | 可変変数の宣言 | `var counter = 0` |

---

## 制御構文

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `if` | 条件分岐 | `if x > 0 { ... }` |
| `else` | else ブランチ | `if ... { } else { }` |
| `for` | for ループ | `for i in 0..5 { }` |
| `while` | while ループ | `while x < 10 { }` |
| `match` | パターンマッチング | `match x { 1 => ... }` |
| `return` | 関数からの返却 | `return 42` |
| `break` | ループの脱出 | `break` |
| `continue` | 次の反復へ | `continue` |

---

## メモリ管理

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `unsafe` | Unsafe ブロック | `unsafe { *ptr }` |
| `async` | 非同期関数 | `async fn fetch() {}` |
| `await` | 非同期操作の待機 | `await fetch_data()` |

---

## モジュール

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `import` | モジュールのインポート | `import "std:io"` |
| `export` | 関数のエクスポート | `export fn add()` |

---

## リテラル

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `true` | 真 | `val flag = true` |
| `false` | 偽 | `val flag = false` |
| `void` | 単型 | `fn do_nothing() void` |
| `null` | ヌルポインタ | `val ptr = null` |

---

## 基本型

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `i8` | 8ビット整数 | `val x: i8 = 42` |
| `i16` | 16ビット整数 | `val x: i16 = 42` |
| `i32` | 32ビット整数 | `val x: i32 = 42` |
| `i64` | 64ビット整数 | `val x: i64 = 42` |
| `u8` | 8ビット符号なし整数 | `val x: u8 = 255` |
| `u16` | 16ビット符号なし整数 | `val x: u16 = 65535` |
| `u32` | 32ビット符号なし整数 | `val x: u32 = 4294967295` |
| `u64` | 64ビット符号なし整数 | `val x: u64 = 18446744073709551615` |
| `f32` | 32ビット浮動小数点 | `val x: f32 = 3.14` |
| `f64` | 64ビット浮動小数点 | `val x: f64 = 3.14159` |
| `bool` | 真偽値 | `val flag: bool = true` |
| `str` | 文字列 | `val name: str = "Alice"` |

---

## 演算子

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `and` | 論理AND | `a and b` |
| `or` | 論理OR | `a or b` |
| `not` | 論理NOT | `not a` |

---

## 特殊なキーワード

| キーワード | 説明 | 例 |
|-----------|------|-----|
| `step` | for ループのステップ | `for i in 0..10 step 2` |
| `as` | 型変換 | `val y = x as f64` |

---

## 予約語 (将来の拡張用)

以下のキーワードは現在使用されていませんが、将来の拡張用に予約されています：

- `class` — クラス (予約)
- `interface` — インターフェース (予約)
- `trait` — トレイト (予約)
- `impl` — 実装 (予約)
- `pub` — 公開 (予約)
- `self` — 自分自身 (予約)

---

## キーワードの使用例

```ngs
// 型定義
struct Point {
    x: f64
    y: f64
}

enum Color {
    Red
    Green
    Blue
}

// 関数定義
fn add(a: i32, b: i32) i32 {
    a + b
}

// 変数宣言
val x = 42
var counter = 0

// 制御構文
if x > 0 {
    io.println("Positive")
} else if x < 0 {
    io.println("Negative")
} else {
    io.println("Zero")
}

for i in 0..10 {
    io.println(i)
}

while counter < 10 {
    counter += 1
}

match color {
    Color.Red => "Red",
    Color.Green => "Green",
    Color.Blue => "Blue"
}

// メモリ管理
unsafe {
    val ptr = &x
    val value = *ptr
}

// 非同期
async fn fetch_data() void {
    val data = await http.get("https://example.com")
}

// モジュール
import "std:io"
export fn public_function() void {}
```

---

[戻る: ドキュメント一覧 →](../index.md)
