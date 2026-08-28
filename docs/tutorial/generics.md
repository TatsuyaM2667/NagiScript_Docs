# ジェネリクス

型をパラメータとして受け取る汎用コードの書き方を学びます。

---

## 基本概念

NagiScript のジェネリクスは**コンパイル時に単型化（monomorphization）**されます。 Zig や Odin と同様に、 使用時には具体的な型に展開されます。

```ngs
// この関数は T が i32 なら fn(i32) i32 に、
// T が str なら fn(str) str に展開されます
fn identity<T>(x: T) T {
    x
}

val n = identity<i32>(42)    // 42
val s = identity<str>("hi")  // "hi"
```

---

## 型推論

型パラメータを省略すると推論されます：

```ngs
val n = identity(42)      // T = i32 と推論
val s = identity("hi")    // T = str と推論
```

---

## 複数の型パラメータ

```ngs
fn pair<A, B>(first: A, second: B) (A, B) {
    (first, second)
}

val p = pair<i32, str>(42, "hello")
// p = (42, "hello")
```

---

## 制約 (Constraints)

### 型クラス風の制約

```ngs
// Printable 型クラス（仮想的）
fn print_all<T: Printable>(items: List<T>) void {
    for item in items {
        item.print()
    }
}
```

### 構造的制約

```ngs
// T が .len() メソッドを持つことを要求（構造的制約）
fn length_of<T>(x: T) i32 {
    x.len()
}

val s_len = length_of("hello")  // 5
val v_len = length_of(List<i32> { 1, 2, 3 })  // 3
```

---

## ジェネリクス構造体

```ngs
struct Stack<T> {
    items: List<T>
}

fn Stack<T>.push(self: Stack<T>, item: T) void {
    self.items.add(item)
}

fn Stack<T>.pop(self: Stack<T>) Option<T> {
    if self.items.is_empty() {
        Option.None
    } else {
        val last = self.items[self.items.len() - 1]
        self.items.remove(self.items.len() - 1)
        Option.Some(last)
    }
}

fn Stack<T>.peek(self: Stack<T>) Option<T> {
    if self.items.is_empty() {
        Option.None
    } else {
        Option.Some(self.items[self.items.len() - 1])
    }
}

// 使用例
var stack = Stack<i32> { items: List<i32> {} }
stack.push(10)
stack.push(20)
stack.push(30)

val top = stack.pop()  // Option.Some(30)
```

---

## ジェネリクス列挙型

### Result 型

```ngs
enum Result<T, E> {
    Ok(T)
    Err(E)
}

fn Result<T, E>.is_ok(self: Result<T, E>) bool {
    match self {
        Result.Ok(_) => true,
        Result.Err(_) => false
    }
}

fn Result<T, E>.unwrap(self: Result<T, E>) T {
    match self {
        Result.Ok(v) => v,
        Result.Err(_) => panic("unwrap on Err")
    }
}
```

### Option 型

```ngs
enum Option<T> {
    Some(T)
    None
}

fn Option<T>.is_some(self: Option<T>) bool {
    match self {
        Option.Some(_) => true,
        Option.None => false
    }
}

fn Option<T>.unwrap_or(self: Option<T>, default: T) T {
    match self {
        Option.Some(v) => v,
        Option.None => default
    }
}
```

---

## 関数型のジェネリクス

```ngs
fn map<T, U>(list: List<T>, f: fn(T) U) List<U> {
    var result = List<U> {}
    for item in list {
        result.add(f(item))
    }
    result
}

val doubled = map(List<i32> { 1, 2, 3 }, fn(x: i32) i32 { x * 2 })
// doubled = [2, 4, 6]

val lengths = map(List<str> { "hello", "world" }, fn(s: str) i32 { s.len() })
// lengths = [5, 5]
```

---

## 型推論の仕組み

```ngs
// 型パラメータが明示的
val v1 = Vec2<i32> { x: 1, y: 2 }

// 型推論による省略
val v2 = Vec2 { x: 1, y: 2 }  // Vec2<i32> と推論

// 複数の型パラメータでは推論が難しい場合
val p = pair<i32, str>(42, "hello")  // 明示的に指定
```

---

## モノモーフィゼーションの例

```ngs
// このコードは以下のように展開されます

// 元のコード
fn add<T: Numeric>(a: T, b: T) T {
    a + b
}

val x = add(10, 20)      // T = i32
val y = add(1.5, 2.5)    // T = f64

// 展開後（コンパイル時に生成される）
fn add_i32(a: i32, b: i32) i32 {
    a + b
}

fn add_f64(a: f64, b: f64) f64 {
    a + b
}
```

---

## 実践的な例: 汎用リスト

```ngs
struct List<T> {
    data: Rc<ListData<T>>
}

struct ListData<T> {
    items: RawSlice<T>
    len: i32
}

fn List<T>.push(self: List<T>, item: T) void {
    // Rc を fork してコピー-on-write を実現
    val new_data = self.data.fork()
    new_data.items.add(item)
    self.data = new_data
}

fn List<T>.get(self: List<T>, index: i32) T {
    self.data.items[index]
}

fn List<T>.len(self: List<T>) i32 {
    self.data.len
}

// 使用例
val numbers = List<i32> {}
numbers.push(10)
numbers.push(20)
numbers.push(30)

io.println(numbers.get(0))  // 10
io.println(numbers.len())   // 3
```

---

[次: エラーハンドリング →](./error-handling.md)
