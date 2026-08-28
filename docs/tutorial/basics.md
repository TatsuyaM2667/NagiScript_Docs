# 基本概念

変数、型、制御構文の基礎を学びます。

---

## 変数と定数

### 不変変数 (`val`)

```ngs
val x: i32 = 10
val name: str = "NagiScript"
val pi: f64 = 3.14159
```

`val` で宣言された変数は再代入できません。

### 可変変数 (`var`)

```ngs
var counter: i32 = 0
counter = 10  // OK
counter += 1  // OK
```

### 型推論

型を省略すると自動推論されます：

```ngs
val x = 10        // i32 と推論
val name = "Hello" // str と推論
val flag = true    // bool と推論
```

---

## 基本型

### 整数型

| 型 | ビット幅 | 範囲 |
|----|---------|------|
| `i8` | 8 | -128 〜 127 |
| `i16` | 16 | -32,768 〜 32,767 |
| `i32` | 32 | 約 ±21 億 |
| `i64` | 64 | 約 ±922京 |
| `u8` | 8 | 0 〜 255 |
| `u16` | 16 | 0 〜 65,535 |
| `u32` | 32 | 0 〜 約42億 |
| `u64` | 64 | 0 〜 約1844京 |

```ngs
val a: i32 = 42
val b: u8 = 255
val c: i64 = 999999999999
```

### 浮動小数点型

```ngs
val f1: f32 = 3.14
val f2: f64 = 2.71828182845
```

### 文字列型

```ngs
val s1: str = "Hello, World!"
val s2 = "型推論でもOK"

// 文字列連結
val greeting = "Hello, " + "World!"

// 文字列の長さ
val len = greeting.len()
```

### 真偽値型

```ngs
val flag1: bool = true
val flag2 = false
```

### 単型 (Unit)

```ngs
val nothing: void = void
```

---

## 制御構文

### if 式

NagiScript の `if` は**式**です。戻り値を持ちます。

```ngs
val x = 10

val result = if x > 5 {
    "大きい"
} else {
    "小さい"
}
// result = "大きい"
```

### for ループ

`for` ループは**範囲構文**のみ対応しています：

```ngs
// 基本構文
for i in 0..5 {
    io.println(i)
}
// 出力: 0, 1, 2, 3, 4

// step を指定
for i in 0..10 step 2 {
    io.println(i)
}
// 出力: 0, 2, 4, 6, 8
```

### while ループ

```ngs
var i = 0
while i < 5 {
    io.println(i)
    i += 1
}
```

### match 式（パターンマッチング）

```ngs
val x = 2

val result = match x {
    1 => "one",
    2 => "two",
    3 => "three",
    _ => "other"
}
// result = "two"
```

### ブロック

```ngs
val result = {
    val a = 10
    val b = 20
    a + b
}
// result = 30
```

---

## 型変換

### 隱示的変換 (i64 → i32)

```ngs
val a: i64 = 100
val b: i32 = a  // OK: i64 から i32 へ安全な縮小
```

### 型注釈による変換

```ngs
val x: i32 = 42
val y: f64 = x  // OK: i32 から f64 への拡張
```

---

## 文字列操作

```ngs
val s = "Hello"

// 長さ
val len = s.len()  // 5

// 接続
val greeting = s + ", World!"

// 比較
val eq = s == "Hello"  // true
```

---

## コメント

```ngs
// これは単一行コメント

/*
   これは
   複数行コメント
*/

@doc {
    doc = "この関数は挨拶を表示します"
}
fn greet(name: str) void {
    io.println("Hello, " + name + "!")
}
```

---

[次: 関数とモジュール →](./functions.md)
