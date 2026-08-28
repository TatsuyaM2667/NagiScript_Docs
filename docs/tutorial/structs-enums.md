# 構造体と列挙型

独自の型を定義する方法を学びます。

---

## 構造体 (Struct)

### 定義

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

### インスタンス化

```ngs
val p = Point { x: 10.0, y: 20.0 }
val person = Person { name: "Alice", age: 30, email: "alice@example.com" }
```

### フィールドアクセス

```ngs
val x = p.x
val name = person.name

// フィールドの変更（var のみ）
var p2 = Point { x: 1.0, y: 2.0 }
p2.x = 10.0  // OK: p2 は var
```

---

## メソッド

### 基本的なメソッド

```ngs
struct Point {
    x: f64
    y: f64
}

fn Point.distance_to(self: Point, other: Point) f64 {
    val dx = self.x - other.x
    val dy = self.y - other.y
    math.sqrt(dx * dx + dy * dy)
}

fn Point.to_string(self: Point) str {
    "(" + str(self.x) + ", " + str(self.y) + ")"
}

// 使用例
val p1 = Point { x: 0.0, y: 0.0 }
val p2 = Point { x: 3.0, y: 4.0 }

val dist = p1.distance_to(p2)  // 5.0
val s = p1.to_string()          // "(0, 0)"
```

---

## 列挙型 (Enum)

### 基本的な列挙型

```ngs
enum Color {
    Red
    Green
    Blue
}

val c = Color.Red
```

### データを持つ列挙型

```ngs
enum Shape {
    Circle(f64)                    // radius
    Rectangle(f64, f64)            // width, height
    Triangle(f64, f64, f64)        // side lengths
}

val area = match shape {
    Shape.Circle(r) => math.PI * r * r,
    Shape.Rectangle(w, h) => w * h,
    Shape.Triangle(a, b, c) => {
        val s = (a + b + c) / 2.0
        math.sqrt(s * (s - a) * (s - b) * (s - c))
    }
}
```

---

## Result 型

エラーハンドリングのための Result 型：

```ngs
enum Result<T, E> {
    Ok(T)
    Err(E)
}
```

### 例

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

### `?` 演算子

エラーを上位関数に伝播させる：

```ngs
fn parse_int(s: str) Result<i32, str> {
    // 実装は省略
    Result.Ok(42)
}

fn process(s: str) Result<i32, str> {
    val n = parse_int(s)?  // エラーなら即座に return
    Result.Ok(n * 2)
}
```

---

## ジェネリクス

### 構造体のジェネリクス

```ngs
struct Vec2<T> {
    x: T
    y: T
}

val v1 = Vec2<i32> { x: 1, y: 2 }
val v2 = Vec2<f64> { x: 1.5, y: 2.5 }
```

### 関数のジェネリクス

```ngs
fn first<T>(arr: List<T>) T {
    arr[0]
}

val n = first(List<i32> { 10, 20, 30 })  // 10
val s = first(List<str> { "a", "b", "c" })  // "a"
```

---

## Option 型

```ngs
enum Option<T> {
    Some(T)
    None
}
```

```ngs
fn find_user(id: i32) Option<User> {
    if id == 1 {
        Option.Some(User { name: "Alice" })
    } else {
        Option.None
    }
}

val user = find_user(1)
match user {
    Option.Some(u) => io.println(u.name),
    Option.None => io.println("Not found")
}
```

---

[次: ジェネリクス →](./generics.md)
