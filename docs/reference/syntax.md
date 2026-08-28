# 構文リファレンス

NagiScript の構文全体を解説します。

---

## プログラム構造

### 基本構造

```ngs
// インポート
import "std:io"
import "utils.ngs"

// 定数定義
const MAX_SIZE: i32 = 100

// 型定義
struct Point {
    x: f64
    y: f64
}

// 関数定義
fn main() void {
    io.println("Hello, World!")
}
```

---

## 変数宣言

### 不変変数

```ngs
val x: i32 = 42
val name = "NagiScript"  // 型推論
```

### 可変変数

```ngs
var counter: i32 = 0
counter = 10  // OK
counter += 1  // OK
```

---

## 関数定義

### 基本構文

```ngs
fn add(a: i32, b: i32) i32 {
    a + b
}
```

### 関数式

```ngs
val double = fn(x: i32) i32 {
    x * 2
}
```

### ジェネリクス関数

```ngs
fn first<T>(list: List<T>) T {
    list[0]
}
```

---

## 制御構文

### if 式

```ngs
val result = if x > 5 {
    "大きい"
} else {
    "小さい"
}
```

### for ループ

```ngs
for i in 0..5 {
    io.println(i)
}

// step を指定
for i in 0..10 step 2 {
    io.println(i)
}
```

### while ループ

```ngs
var i = 0
while i < 5 {
    io.println(i)
    i += 1
}
```

### match 式

```ngs
val result = match x {
    1 => "one",
    2 => "two",
    3 => "three",
    _ => "other"
}
```

---

## 型定義

### 構造体

```ngs
struct Point {
    x: f64
    y: f64
}

// メソッド
fn Point.distance_to(self: Point, other: Point) f64 {
    val dx = self.x - other.x
    val dy = self.y - other.y
    math.sqrt(dx * dx + dy * dy)
}
```

### 列挙型

```ngs
enum Color {
    Red
    Green
    Blue
}

// データを持つ列挙型
enum Shape {
    Circle(f64)
    Rectangle(f64, f64)
}
```

### ジェネリクス型

```ngs
struct Vec2<T> {
    x: T
    y: T
}
```

---

## エラーハンドリング

### Result 型

```ngs
fn divide(a: f64, b: f64) Result<f64, str> {
    if b == 0.0 {
        Result.Err("ZeroDivision")
    } else {
        Result.Ok(a / b)
    }
}
```

### `?` 演算子

```ngs
fn process(s: str) Result<i32, str> {
    val n = parse_int(s)?  // エラーなら即座に return
    Result.Ok(n * 2)
}
```

---

## メモリ管理

### Rc (参照カウント)

```ngs
val data = Rc.new(Data { x: 10 })
val data2 = data  // 参照カウントが増加
```

### Unsafe ブロック

```ngs
unsafe {
    val ptr = &x
    val value = *ptr
}
```

---

## モジュール

### インポート

```ngs
import "std:io"
import "utils.ngs"
import "utils/string.ngs"
```

### エクスポート

```ngs
export fn add(a: i32, b: i32) i32 {
    a + b
}
```

---

## コメント

```ngs
// 単一行コメント

/*
   複数行コメント
*/

@doc {
    doc = "ドキュメントコメント"
}
fn greet(name: str) void {
    io.println("Hello, " + name + "!")
}
```

---

## 演算子

### 算術演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `+` | 加算 | `a + b` |
| `-` | 減算 | `a - b` |
| `*` | 乗算 | `a * b` |
| `/` | 除算 | `a / b` |
| `%` | 剰余 | `a % b` |

### 比較演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `==` | 等しい | `a == b` |
| `!=` | 等しくない | `a != b` |
| `<` | 小さい | `a < b` |
| `>` | 大きい | `a > b` |
| `<=` | 以下 | `a <= b` |
| `>=` | 以上 | `a >= b` |

### 論理演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `and` | 論理AND | `a and b` |
| `or` | 論理OR | `a or b` |
| `not` | 論理NOT | `not a` |

### その他の演算子

| 演算子 | 説明 | 例 |
|--------|------|-----|
| `&&` | アドレス取得 | `&x` |
| `*` | 参照 | `*ptr` |
| `?` | エラー伝播 | `result?` |

---

[次: 演算子リファレンス →](./operators.md)
