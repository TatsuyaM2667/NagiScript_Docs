# 標準ライブラリ

NagiScript の標準ライブラリを解説します。

---

## io モジュール

### 基本的な出力

```ngs
import "std:io"

io.println("Hello, World!")  // 改行付き
io.print("Hello")            // 改行なし
```

### フォーマット出力

```ngs
import "std:io"

val name = "Alice"
val age = 30

io.println("Name: " + name + ", Age: " + str(age))
```

---

## math モジュール

### 定数

```ngs
import "std:math"

val pi = math.PI          // 3.141592653589793
val e = math.E            // 2.718281828459045
val infinity = math.INF   // 無限大
```

### 関数

```ngs
import "std:math"

// 三角関数
val sin_val = math.sin(math.PI / 2.0)  // 1.0
val cos_val = math.cos(0.0)             // 1.0

// べき乗
val pow_val = math.pow(2.0, 10.0)  // 1024.0

// 平方根
val sqrt_val = math.sqrt(16.0)  // 4.0

// 絶対値
val abs_val = math.abs(-5.0)  // 5.0

// 最大値・最小値
val max_val = math.max(10.0, 20.0)  // 20.0
val min_val = math.min(10.0, 20.0)  // 10.0
```

---

## fs モジュール

### ファイル読み込み

```ngs
import "std:fs"

// ファイル全体を読み込み
val content = fs.read_to_string("data.txt")
match content {
    Result.Ok(data) => io.println(data),
    Result.Err(e) => io.println("Error: " + e)
}
```

### ファイル書き込み

```ngs
import "std:fs"

// ファイルに書き込み
val result = fs.write_to_string("output.txt", "Hello, World!")
match result {
    Result.Ok(_) => io.println("File written"),
    Result.Err(e) => io.println("Error: " + e)
}
```

### ファイル情報

```ngs
import "std:fs"

val metadata = fs.metadata("data.txt")
match metadata {
    Result.Ok(meta) => {
        io.println("Size: " + str(meta.size) + " bytes")
        io.println("Is file: " + str(meta.is_file))
        io.println("Is dir: " + str(meta.is_dir))
    },
    Result.Err(e) => io.println("Error: " + e)
}
```

---

## args モジュール

### コマンドライン引数

```ngs
import "std:args"

// 全ての引数を取得
val all_args = args.get_all()

// 特定の引数を取得
val name = args.get("name")
match name {
    Option.Some(n) => io.println("Name: " + n),
    Option.None => io.println("No name provided")
}

// 引数の有無を確認
val verbose = args.has("verbose")
if verbose {
    io.println("Verbose mode enabled")
}
```

---

## async モジュール

### 非同期処理

```ngs
import "std:async"

async fn fetch_data(url: str) Result<str, str> {
    val response = await http.get(url)
    match response {
        Result.Ok(res) => Result.Ok(res.body),
        Result.Err(e) => Result.Err(e)
    }
}

fn main() async void {
    val data = await fetch_data("https://api.example.com/data")
}
```

---

## List<T> メソッド

### 基本操作

```ngs
val list = List<i32> { 1, 2, 3 }

// 要素の追加
list.add(4)

// 要素の取得
val first = list[0]  // 1

// 長さ
val len = list.len()  // 4

// 空かどうか
val empty = list.is_empty()  // false
```

### 関数型メソッド

```ngs
val numbers = List<i32> { 1, 2, 3, 4, 5 }

// フィルタリング
val evens = numbers.filter(fn(x: i32) bool { x % 2 == 0 })
// evens = [2, 4]

// マッピング
val doubled = numbers.map(fn(x: i32) i32 { x * 2 })
// doubled = [2, 4, 6, 8, 10]

// リダクション
val sum = numbers.reduce(0, fn(acc: i32, x: i32) i32 { acc + x })
// sum = 15
```

---

## str メソッド

### 文字列操作

```ngs
val s = "Hello, World!"

// 長さ
val len = s.len()  // 13

// 大文字変換
val upper = s.to_upper()  // "HELLO, WORLD!"

// 小文字変換
val lower = s.to_lower()  // "hello, world!"

// 部分文字列
val sub = s.substring(0, 5)  // "Hello"

// 文字列分割
val parts = s.split(", ")  // ["Hello", "World!"]

// 文字列結合
val joined = ["Hello", "World"].join(", ")  // "Hello, World!"
```

---

## Rc<T> メソッド

### 参照カウント操作

```ngs
val data = Rc.new(Data { x: 10 })

// 参照カウントの取得（デバッグ用）
val count = data.rc_count()  // 1

// コピー（浅いコピー）
val data2 = data.clone()  // 参照カウントが増加
```

---

## Option<T> メソッド

```ngs
val some_value = Option.Some(42)
val no_value = Option.None

// 値の取得
val value = some_value.unwrap()  // 42

// デフォルト値
val value = no_value.unwrap_or(0)  // 0

// 有無の確認
val is_some = some_value.is_some()  // true
val is_none = no_value.is_none()  // true
```

---

## Result<T, E> メソッド

```ngs
val ok_result = Result.Ok(42)
val err_result = Result.Err("Error")

// 値の取得
val value = ok_result.unwrap()  // 42

// デフォルト値
val value = err_result.unwrap_or(0)  // 0

// エラーの変換
val new_result = err_result.map_err(fn(e: str) str { "New: " + e })
```

---

[次: C 標準ライブラリ →](./standard-c-library.md)
