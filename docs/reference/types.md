# 型システム リファレンス

NagiScript の型システム全体を解説します。

---

## 基本型

### 整数型

| 型 | ビット幅 | 範囲 | デフォルト |
|----|---------|------|-----------|
| `i8` | 8 | -128 〜 127 | |
| `i16` | 16 | -32,768 〜 32,767 | |
| `i32` | 32 | 約 ±21 億 | ✓ |
| `i64` | 64 | 約 ±922京 | |
| `u8` | 8 | 0 〜 255 | |
| `u16` | 16 | 0 〜 65,535 | |
| `u32` | 32 | 0 〜 約42億 | |
| `u64` | 64 | 0 〜 約1844京 | |

### 浮動小数点型

| 型 | ビット幅 | 精度 |
|----|---------|------|
| `f32` | 32 | 約7桁 |
| `f64` | 64 | 約15桁 |

### その他の基本型

| 型 | 説明 |
|----|------|
| `bool` | 真偽値 (`true` / `false`) |
| `str` | 文字列（不変） |
| `void` | 単型（戻り値なし） |

---

## 複合型

### 構造体 (Struct)

```ngs
struct Point {
    x: f64
    y: f64
}

struct Person {
    name: str
    age: i32
    email: str
}
```

### 列挙型 (Enum)

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
    Triangle(f64, f64, f64)
}
```

### タプル

```ngs
val pair: (i32, str) = (42, "hello")
val triple: (i32, f64, bool) = (1, 2.0, true)

val (a, b, c) = triple  // デストラクチャリング
```

---

## ジェネリクス型

### 基本的なジェネリクス

```ngs
struct Vec2<T> {
    x: T
    y: T
}

val v1 = Vec2<i32> { x: 1, y: 2 }
val v2 = Vec2<f64> { x: 1.5, y: 2.5 }
```

### 複数の型パラメータ

```ngs
struct Pair<A, B> {
    first: A
    second: B
}

val p = Pair<i32, str> { first: 42, second: "hello" }
```

---

## 標準ジェネリクス型

### Option<T>

```ngs
enum Option<T> {
    Some(T)
    None
}
```

### Result<T, E>

```ngs
enum Result<T, E> {
    Ok(T)
    Err(E)
}
```

### List<T>

```ngs
struct List<T> {
    data: Rc<ListData<T>>
}

struct ListData<T> {
    items: RawSlice<T>
    len: i32
}
```

---

## 型変換

### 隱示的変換

```ngs
val a: i64 = 100
val b: i32 = a  // OK: i64 から i32 へ安全な縮小

val x: i32 = 42
val y: f64 = x  // OK: i32 から f64 への拡張
```

### 明示的なキャスト

```ngs
val x: i32 = 42
val y: f64 = x as f64  // 明示的な型変換
```

---

## ポインタ型

### 基本的なポインタ

```ngs
val x = 42
val ptr: *const i32 = &x  // 不変ポインタ
val mut_ptr: *mut i32 = &x  // 可変ポインタ
```

### 配列ポインタ

```ngs
val arr = [1, 2, 3, 4, 5]
val ptr: *const i32 = &arr[0]
```

---

## 関数型

```ngs
// 関数ポインタ
val add: fn(i32, i32) i32 = fn(a: i32, b: i32) i32 { a + b }

// 関数型の引数
fn apply(f: fn(i32) i32, x: i32) i32 {
    f(x)
}

val result = apply(fn(x: i32) i32 { x * 2 }, 5)  // 10
```

---

## 型エイリアス

```ngs
type IntVec = Vec2<i32>
type Result<T> = Result<T, str>

val v: IntVec = Vec2 { x: 1, y: 2 }
```

---

## 型安全性

### コンパイル時チェック

```ngs
val x: i32 = 42
val y: str = "hello"

// 型エラー: i32 と str は加算できない
// val z = x + y  // コンパイルエラー
```

### 実行時チェック

```ngs
val list = List<i32> { 1, 2, 3 }
// val value = list[5]  // 実行時エラー: インデックス範囲外
```

---

[次: 構文リファレンス →](./syntax.md)
