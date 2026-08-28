# C言語との相互運用

NagiScript から C 関数を呼び出す方法と、C から NagiScript を呼び出す方法を学びます。

---

## C 関数の呼び出し

### extern 宣言

```ngs
// C 関数の宣言
extern fn printf(format: *const u8, ...) i32
extern fn malloc(size: i32) *mut u8
extern fn free(ptr: *mut u8) void
extern fn strlen(s: *const u8) i32
```

### 使用例

```ngs
fn main() void {
    val msg = "Hello, C!"
    
    unsafe {
        printf(msg.as_ptr())
    }
}
```

---

## C 標準ライブラリ

### math.h

```ngs
extern fn sqrt(x: f64) f64
extern fn pow(base: f64, exp: f64) f64
extern fn sin(x: f64) f64
extern fn cos(x: f64) f64

fn main() void {
    val result = sqrt(16.0)  // 4.0
    val power = pow(2.0, 10.0)  // 1024.0
}
```

### stdio.h

```ngs
extern fn fopen(path: *const u8, mode: *const u8) *mut FILE
extern fn fclose(stream: *mut FILE) i32
extern fn fgets(buffer: *mut u8, size: i32, stream: *mut FILE) *mut u8

fn read_file(path: str) str {
    unsafe {
        val file = fopen(path.as_ptr(), "r".as_ptr())
        if file == null {
            return ""
        }
        
        var buffer = alloc<u8>(1024)
        fgets(buffer, 1024, file)
        fclose(file)
        
        val result = str::from_cstr(buffer)
        free(buffer)
        result
    }
}
```

---

## C 構造体との連携

### 構造体の定義

```ngs
// C 側の構造体
// struct Point { double x; double y; };

// NagiScript 側
struct Point {
    x: f64
    y: f64
}

extern fn c_distance(p1: *const Point, p2: *const Point) f64

fn main() void {
    val p1 = Point { x: 0.0, y: 0.0 }
    val p2 = Point { x: 3.0, y: 4.0 }
    
    val dist = c_distance(&p1, &p2)  // 5.0
}
```

---

## C から NagiScript を呼び出す

### エクスポート関数

```ngs
// NagiScript 関数を C から呼び出せるようにエクスポート
export fn add(a: i32, b: i32) i32 {
    a + b
}

export fn process_string(input: *const u8, len: i32) *mut u8 {
    unsafe {
        val s = str::from_utf8(input, len)
        val result = s.to_upper()
        result.as_mut_ptr()
    }
}
```

### C 側の宣言

```c
// header.h
extern int add(int a, int b);
extern char* process_string(const char* input, int len);
```

---

## ポインタ操作

### アドレス取得

```ngs
val x = 42
val ptr = &x  // アドレスを取得

unsafe {
    val value = *ptr  // 値を参照
    io.println(value)  // 42
}
```

### ポインタ演算

```ngs
fn sum_array(arr: *const i32, len: i32) i32 {
    var total = 0
    var i = 0
    
    unsafe {
        while i < len {
            total += *arr.offset(i)
            i += 1
        }
    }
    
    total
}

fn main() void {
    val numbers = [10, 20, 30, 40, 50]
    val sum = sum_array(&numbers[0], 5)  // 150
}
```

---

## 動的ライブラリのロード

```ngs
extern fn dlopen(path: *const u8, flags: i32) *mut void
extern fn dlsym(handle: *mut void, symbol: *const u8) *mut void
extern fn dlclose(handle: *mut void) i32

fn load_library(path: str) *mut void {
    unsafe {
        dlopen(path.as_ptr(), 1)  // RTLD_LAZY
    }
}

fn get_function(handle: *mut void, name: str) *mut void {
    unsafe {
        dlsym(handle, name.as_ptr())
    }
}
```

---

## 実践的な例: C ライブラリのラッパー

```ngs
// libcurl のラッパー例

extern fn curl_easy_init() *mut void
extern fn curl_easy_setopt(curl: *mut void, option: i32, ...) i32
extern fn curl_easy_perform(curl: *mut void) i32
extern fn curl_easy_cleanup(curl: *mut void) void

struct Curl {
    handle: *mut void
}

fn Curl.init() Curl {
    Curl {
        handle: curl_easy_init()
    }
}

fn Curl.get(self: Curl, url: str) Result<str, str> {
    unsafe {
        curl_easy_setopt(self.handle, 10002, url.as_ptr())  // CURLOPT_URL
        val result = curl_easy_perform(self.handle)
        
        if result == 0 {
            Result.Ok("Success")
        } else {
            Result.Err("Request failed")
        }
    }
}

fn Curl.cleanup(self: Curl) void {
    curl_easy_cleanup(self.handle)
}

fn main() void {
    val curl = Curl.init()
    
    match curl.get("https://example.com") {
        Result.Ok(response) => io.println(response),
        Result.Err(e) => io.println("Error: " + e)
    }
    
    curl.cleanup()
}
```

---

## 注意事項

1. **型の整合性**: C と NagiScript の型サイズが一致することを確認
2. **メモリ管理**: C で確保したメモリは C で解放する
3. **文字列の変換**: C の文字列は null 終端、NagiScript は長さ付き
4. **スレッド安全性**: C 関数がスレッド安全かどうかを確認

---

[戻る: ドキュメント一覧 →](../index.md)
