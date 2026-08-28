# エラーハンドリング

NagiScript のエラーハンドリング戦略を学びます。

---

## Result 型

NagiScript では `Result<T, E>` 型を使用してエラーを表現します。

```ngs
enum Result<T, E> {
    Ok(T)
    Err(E)
}
```

---

## 基本的な使い方

### 関数の戻り値として

```ngs
fn divide(a: f64, b: f64) Result<f64, str> {
    if b == 0.0 {
        Result.Err("ZeroDivision")
    } else {
        Result.Ok(a / b)
    }
}

fn main() void {
    val result = divide(10.0, 3.0)
    
    match result {
        Result.Ok(v) => io.println("Result: " + str(v)),
        Result.Err(e) => io.println("Error: " + e)
    }
}
```

---

## `?` 演算子

エラーを上位関数に伝播させる `?` 演算子：

```ngs
fn parse_int(s: str) Result<i32, str> {
    // 実際のパース処理
    if s.len() == 0 {
        Result.Err("EmptyString")
    } else {
        // 簡易的な実装
        Result.Ok(42)
    }
}

fn process(s: str) Result<i32, str> {
    val n = parse_int(s)?  // エラーなら即座に return Err(...)
    Result.Ok(n * 2)
}

fn main() void {
    val result = process("123")
    
    match result {
        Result.Ok(v) => io.println("Processed: " + str(v)),
        Result.Err(e) => io.println("Error: " + e)
    }
}
```

### `?` の動作

```ngs
// このコード
fn process(s: str) Result<i32, str> {
    val n = parse_int(s)?
    Result.Ok(n * 2)
}

// 以下と同じです
fn process(s: str) Result<i32, str> {
    val n = match parse_int(s) {
        Result.Ok(v) => v,
        Result.Err(e) => return Result.Err(e)
    }
    Result.Ok(n * 2)
}
```

---

## Option 型

値が存在しない場合の表現：

```ngs
enum Option<T> {
    Some(T)
    None
}
```

### 使い方

```ngs
fn find_user(id: i32) Option<User> {
    if id == 1 {
        Option.Some(User { name: "Alice", age: 30 })
    } else {
        Option.None
    }
}

fn main() void {
    val user = find_user(1)
    
    match user {
        Option.Some(u) => io.println("Found: " + u.name),
        Option.None => io.println("User not found")
    }
}
```

---

## Option の `?` 演算子

```ngs
fn get_user_email(user_id: i32) Option<str> {
    val user = find_user(user_id)?  // None なら即座に return None
    Option.Some(user.email)
}
```

---

## エラーハンドリングのパターン

### パターン 1: match による分岐

```ngs
fn read_config(path: str) Result<Config, str> {
    val content = fs.read_to_string(path)?
    val config = parse_config(content)?
    Result.Ok(config)
}

fn main() void {
    match read_config("config.toml") {
        Result.Ok(config) => {
            io.println("Loaded: " + config.name)
        },
        Result.Err(e) => {
            io.println("Failed to load config: " + e)
            std.process.exit(1)
        }
    }
}
```

### パターン 2: エラー値の変換

```ngs
enum AppError {
    IoError(str)
    ParseError(str)
    NotFound(str)
}

fn read_config(path: str) Result<Config, AppError> {
    val content = fs.read_to_string(path)
        .map_err(fn(e: str) AppError { AppError.IoError(e) })?
    
    val config = parse_config(content)
        .map_err(fn(e: str) AppError { AppError.ParseError(e) })?
    
    Result.Ok(config)
}
```

### パターン 3: エラーチェーン

```ngs
fn process_file(path: str) Result<str, str> {
    val content = fs.read_to_string(path)?
    val lines = content.split("\n")
    val result = lines
        .filter(fn(line: str) bool { line.len() > 0 })
        .map(fn(line: str) str { line.to_upper() })
        .join("\n")
    Result.Ok(result)
}
```

---

## panic

 unrecoverable なエラーには `panic` を使用します：

```ngs
fn divide_or_panic(a: f64, b: f64) f64 {
    if b == 0.0 {
        panic("Division by zero")
    }
    a / b
}
```

---

## エラーハンドリングのベストプラクティス

### 1. Result を使い忘れない

```ngs
// 悪い例
fn main() void {
    fs.write_to_string("output.txt", "data")  // エラーが無視される
}

// 良い例
fn main() void {
    match fs.write_to_string("output.txt", "data") {
        Result.Ok(_) => io.println("File written"),
        Result.Err(e) => io.println("Write failed: " + e)
    }
}
```

### 2. エラーメッセージにコンテキストを含める

```ngs
// 悪い例
fn read_user(id: i32) Result<User, str> {
    val data = fs.read_to_string("users.json")?
    // エラー時に "No such file or directory" しか分からない
}

// 良い例
fn read_user(id: i32) Result<User, str> {
    val data = fs.read_to_string("users.json")
        .map_err(fn(e: str) str {
            "Failed to read users.json: " + e
        })?
    // エラー時に何が起きたか分かる
}
```

### 3. `unwrap` の使用を避ける

```ngs
// 悪い例（ランタイムで panic する可能性）
val config = read_config("config.toml").unwrap()

// 良い例
match read_config("config.toml") {
    Result.Ok(config) => use_config(config),
    Result.Err(e) => {
        io.println("Error: " + e)
        std.process.exit(1)
    }
}
```

---

## エラーハンドリングフロー

```
関数呼び出し
    ↓
Result<T, E> を返す
    ↓
match で分岐
    ├─ Ok(v) → 正常処理を続行
    └─ Err(e) → エラー処理
        ↓
    ? 演算子で伝播
        ↓
    上位関数で処理
```

---

[次: メモリ管理 →](./memory.md)
