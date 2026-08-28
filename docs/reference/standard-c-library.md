# C 標準ライブラリ

NagiScript から利用可能な C 標準ライブラリを解説します。

---

## 概要

NagiScript は C ABI と完全互換のため、C 標準ライブラリの関数をそのまま利用可能です。 ただし、以下の点に注意してください：

- **文字列**: C の文字列は null 終端、NagiScript は長さ付き
- **ポインタ**: unsafe ブロック内で操作が必要
- **メモリ管理**: C で確保したメモリは C で解放する

---

## stdio.h

### 基本的な入出力

```ngs
extern fn printf(format: *const u8, ...) i32
extern fn scanf(format: *const u8, ...) i32
extern fn fprintf(stream: *mut FILE, format: *const u8, ...) i32
extern fn fscanf(stream: *mut FILE, format: *const u8, ...) i32
```

### 使用例

```ngs
fn main() void {
    unsafe {
        printf("Hello, %s!\n", "World")
    }
}
```

---

## stdlib.h

### メモリ管理

```ngs
extern fn malloc(size: i32) *mut u8
extern fn calloc(num: i32, size: i32) *mut u8
extern fn realloc(ptr: *mut u8, size: i32) *mut u8
extern fn free(ptr: *mut u8) void
```

### 使用例

```ngs
fn main() void {
    unsafe {
        val ptr = malloc(100)

        // メモリを使用
        *ptr = 42

        // メモリを解放
        free(ptr)
    }
}
```

### 文字列変換

```ngs
extern fn atoi(s: *const u8) i32
extern fn atof(s: *const u8) f64
extern fn atol(s: *const u8) i64
```

---

## string.h

### 文字列操作

```ngs
extern fn strlen(s: *const u8) i32
extern fn strcpy(dest: *mut u8, src: *const u8) *mut u8
extern fn strncpy(dest: *mut u8, src: *const u8, n: i32) *mut u8
extern fn strcat(dest: *mut u8, src: *const u8) *mut u8
extern fn strcmp(s1: *const u8, s2: *const u8) i32
extern fn strncmp(s1: *const u8, s2: *const u8, n: i32) i32
extern fn strchr(s: *const u8, c: i32) *mut u8
extern fn strrchr(s: *const u8, c: i32) *mut u8
extern fn strstr(haystack: *const u8, needle: *const u8) *mut u8
```

### 使用例

```ngs
fn main() void {
    unsafe {
        val s = "Hello, World!"
        val len = strlen(s)

        io.println("Length: " + str(len))
    }
}
```

---

## math.h

### 三角関数

```ngs
extern fn sin(x: f64) f64
extern fn cos(x: f64) f64
extern fn tan(x: f64) f64
extern fn asin(x: f64) f64
extern fn acos(x: f64) f64
extern fn atan(x: f64) f64
extern fn atan2(y: f64, x: f64) f64
```

### べき乗・対数

```ngs
extern fn pow(base: f64, exp: f64) f64
extern fn sqrt(x: f64) f64
extern fn cbrt(x: f64) f64
extern fn log(x: f64) f64
extern fn log10(x: f64) f64
extern fn log2(x: f64) f64
extern fn exp(x: f64) f64
```

### 丸め関数

```ngs
extern fn ceil(x: f64) f64
extern fn floor(x: f64) f64
extern fn round(x: f64) f64
extern fn trunc(x: f64) f64
```

### 使用例

```ngs
fn main() void {
    val x = 2.0
    val y = pow(x, 3.0)  // 8.0
    val z = sqrt(y)       // 2.8284271247461903

    io.println("y = " + str(y))
    io.println("z = " + str(z))
}
```

---

## time.h

### 時間操作

```ngs
extern fn time(timer: *mut i64) i64
extern fn difftime(time1: i64, time2: i64) f64
extern fn clock() i64
```

### 使用例

```ngs
fn main() void {
    unsafe {
        val now = time(null)
        io.println("Current time: " + str(now))
    }
}
```

---

## ctype.h

### 文字判定

```ngs
extern fn isalpha(c: i32) i32
extern fn isdigit(c: i32) i32
extern fn isalnum(c: i32) i32
extern fn isspace(c: i32) i32
extern fn isupper(c: i32) i32
extern fn islower(c: i32) i32
```

### 文字変換

```ngs
extern fn toupper(c: i32) i32
extern fn tolower(c: i32) i32
```

---

## stdint.h

### 固定幅整数型

```ngs
// int8_t, int16_t, int32_t, int64_t
// uint8_t, uint16_t, uint32_t, uint64_t
// intmax_t, uintmax_t
// intmin_t, uintmin_t
```

### 使用例

```ngs
fn main() void {
    val a: i32 = 42
    val b: u8 = 255
    val c: i64 = 999999999999
}
```

---

## 実践的な例: C ライブラリのラッパー

```ngs
// libcurl のラッパー

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
```

---

## 注意事項

1. **文字列の変換**: C の文字列は null 終端、NagiScript は長さ付き
2. **メモリ管理**: C で確保したメモリは C で解放する
3. **スレッド安全性**: C 関数がスレッド安全かどうかを確認
4. **型の整合性**: C と NagiScript の型サイズが一致することを確認

---

[次: コンパイラー内部構造 →](./compiler.md)
