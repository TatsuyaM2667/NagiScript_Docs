# 非同期プログラミング

async/await による非同期処理を学びます。

---

## async 関数

```ngs
import "std:io"
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
    
    match data {
        Result.Ok(body) => io.println(body),
        Result.Err(e) => io.println("Error: " + e)
    }
}
```

---

## await

`await` は非同期操作の完了を待ちます：

```ngs
async fn process() void {
    val a = await heavy_computation()
    val b = await another_computation()
    io.println(a + b)
}
```

---

## async ブロック

```ngs
async fn parallel() void {
    val result = async {
        val a = await fetch("url1")
        val b = await fetch("url2")
        (a, b)
    }
    
    val (data1, data2) = await result
}
```

---

## Result との組み合わせ

```ngs
async fn safe_fetch(url: str) Result<str, str> {
    val response = await http.get(url)
        .map_err(fn(e: str) str { "Network error: " + e })
    
    response
}
```

---

[次: WebAssembly →](./webassembly.md)
