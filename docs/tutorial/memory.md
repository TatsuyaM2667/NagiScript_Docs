# メモリ管理

NagiScript のメモリ管理戦略を学びます。

---

## メモリ管理の設計方針

| 戦略 | 用途 | 特徴 |
|------|------|------|
| **スタック確保** | 基本型、構造体 | 最速、自動管理 |
| **Rc (参照カウント)** | ヒープ確保 | 自動解放、安全 |
| **Unsafe** | ポインタ操作 | 開発者責任 |

---

## スタック確保

基本型と小さな構造体はスタックに確保されます：

```ngs
val x: i32 = 42
val p = Point { x: 1.0, y: 2.0 }

fn add(a: i32, b: i32) i32 {
    a + b
}
```

---

## Rc (参照カウント)

大きなオブジェクトや動的サイズのオブジェクトには Rc を使用します：

```ngs
import "std:io"

val data = Rc.new(Data {
    values: List<i32> { 1, 2, 3, 4, 5 }
})

val data2 = data  // 参照カウント: 2
io.println(data.values.len())  // 5
```

### 参照カウントの動作

```ngs
val a = Rc.new(Data { x: 10 })  // 参照カウント: 1
val b = a                        // 参照カウント: 2
val c = a                        // 参照カウント: 3
// b, c がスコープを抜けると a のみ残り、最終解放時にメモリ解放
```

---

## リスト (List)

動的配列はヒープに確保されます：

```ngs
import "std:io"

var numbers = List<i32> {}
numbers.add(10)
numbers.add(20)
numbers.add(30)

io.println(numbers.len())  // 3

val first = numbers[0]  // 10
numbers[1] = 200
```

### コピー-on-Write

```ngs
val a = List<i32> { 1, 2, 3 }
val b = a  // shallow copy（同じメモリを参照）

b.add(4)

io.println(a.len())  // 3（元のまま）
io.println(b.len())  // 4（コピーが変更された）
```

---

## Unsafe ブロック

ポインタ操作が必要な場合は `unsafe` ブロックを使用します：

```ngs
fn process_data(data: *mut i32, len: i32) void {
    unsafe {
        var i = 0
        while i < len {
            *data = *data * 2
            data = data.offset(1)
            i += 1
        }
    }
}
```

---

## C言語とのメモリ共有

```ngs
extern fn malloc(size: i32) *mut u8
extern fn free(ptr: *mut u8) void

fn process_c_buffer() void {
    val ptr = malloc(100)
    unsafe { *ptr = 42 }
    free(ptr)
}
```

---

[次: 非同期プログラミング →](./async.md)
