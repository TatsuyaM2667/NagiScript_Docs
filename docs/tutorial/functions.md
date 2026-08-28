# 関数とモジュール

関数の定義、呼び出し、モジュール分割を学びます。

---

## 関数の定義

### 基本構文

```ngs
fn add(a: i32, b: i32) i32 {
    a + b
}
```

### 戻り値なし

```ngs
fn greet(name: str) void {
    io.println("Hello, " + name + "!")
}
```

### 引数なし

```ngs
fn get_version() str {
    "1.0.0"
}
```

---

## 関数の呼び出し

```ngs
val result = add(10, 20)  // 30
greet("Alice")            // Hello, Alice!
val ver = get_version()   // "1.0.0"
```

---

## 関数式 (Fn)

関数は変数に代入できます：

```ngs
val double = fn(x: i32) i32 {
    x * 2
}

val result = double(5)  // 10
```

---

## 高階関数

関数を引数に取る関数：

```ngs
fn apply(f: fn(i32) i32, x: i32) i32 {
    f(x)
}

val result = apply(double, 5)  // 10
```

---

## モジュール

### import

```ngs
// 標準ライブラリ
import "std:io"
import "std:math"

// ローカルファイル
import "utils.ngs"
import "utils/string.ngs"
```

### モジュールの利用

```ngs
import "std:io"
import "std:math"

fn main() void {
    io.println("Hello!")
    
    val pi = math.PI
    val sqrt2 = math.sqrt(2.0)
    
    io.println(pi)
    io.println(sqrt2)
}
```

### エクスポート

```ngs
// utils.ngs
export fn add(a: i32, b: i32) i32 {
    a + b
}

export fn multiply(a: i32, b: i32) i32 {
    a * b
}
```

```ngs
// main.ngs
import "utils"

fn main() void {
    val sum = utils.add(10, 20)
    val product = utils.multiply(10, 20)
    
    io.println(sum)
    io.println(product)
}
```

---

## ドキュメントコメント

```ngs
@doc {
    doc = "2つの整数を加算します"
    param_a = "最初の整数"
    param_b = "2番目の整数"
    return = "加算結果"
    example = """
    val result = add(10, 20)
    // result = 30
    """
}
fn add(a: i32, b: i32) i32 {
    a + b
}
```

---

## メソッド（関数の呼び出し方）

### メソッド構文

```ngs
import "std:io"

val s = "Hello, World!"

// 通常の呼び出し
val len1 = str.len(s)

// メソッド構文
val len2 = s.len()
// len1 == len2
```

### チェーン呼び出し

```ngs
val result = "hello".to_upper().len()
// "hello" → "HELLO" → 5
```

---

## 再帰関数

```ngs
fn factorial(n: i32) i32 {
    if n <= 1 {
        1
    } else {
        n * factorial(n - 1)
    }
}

val result = factorial(5)  // 120
```

---

## クロージャ

```ngs
fn make_adder(x: i32) fn(i32) i32 {
    fn(y: i32) i32 {
        x + y
    }
}

val add5 = make_adder(5)
val result = add5(10)  // 15
```

---

[次: 構造体と列挙型 →](./structs-enums.md)
