# Web フレームワーク

NagiScript でシンプルな Web フレームワークを開発するチュートリアルです。

---

## 概要

このチュートリアルでは、NagiScript で基本的な Web フレームワークを作成します。

- HTTP リクエストの処理
- ルーティング
- JSON レスポンス

---

## プロジェクト構成

```
web_framework/
├── main.ngs
├── router.ngs
└── handler.ngs
```

---

## 実装

### router.ngs — ルーター

```ngs
struct Route {
    method: str
    path: str
    handler: fn(Request) Response
}

struct Router {
    routes: List<Route>
}

fn Router.init() Router {
    Router {
        routes: List<Route> {}
    }
}

fn Router.add_route(self: Router, method: str, path: str, handler: fn(Request) Response) void {
    self.routes.add(Route {
        method: method,
        path: path,
        handler: handler
    })
}

fn Router.handle(self: Router, request: Request) Response {
    for route in self.routes {
        if route.method == request.method && route.path == request.path {
            return route.handler(request)
        }
    }
    
    Response {
        status: 404,
        body: "Not Found"
    }
}
```

### handler.ngs — ハンドラー

```ngs
struct Request {
    method: str
    path: str
    body: str
}

struct Response {
    status: i32
    body: str
}

fn home_handler(request: Request) Response {
    Response {
        status: 200,
        body: "Welcome to NagiScript Web Framework!"
    }
}

fn hello_handler(request: Request) Response {
    Response {
        status: 200,
        body: "Hello, World!"
    }
}

fn not_found_handler(request: Request) Response {
    Response {
        status: 404,
        body: "Page not found"
    }
}
```

### main.ngs — メインプログラム

```ngs
import "std:io"
import "std:net"
import "router"
import "handler"

fn main() void {
    val router = Router.init()
    
    router.add_route("GET", "/", home_handler)
    router.add_route("GET", "/hello", hello_handler)
    
    io.println("Starting server on port 8080...")
    
    val server = net.listen("0.0.0.0:8080")
    
    loop {
        val client = server.accept()
        
        val request = parse_request(client)
        val response = router.handle(request)
        
        send_response(client, response)
        client.close()
    }
}

fn parse_request(client: net.TcpStream) Request {
    val raw = client.read_line()
    val parts = raw.split(" ")
    
    Request {
        method: parts[0],
        path: parts[1],
        body: ""
    }
}

fn send_response(client: net.TcpStream, response: Response) void {
    val status_text = match response.status {
        200 => "OK",
        404 => "Not Found",
        _ => "Unknown"
    }
    
    val header = "HTTP/1.1 " + str(response.status) + " " + status_text + "\r\n" +
                 "Content-Length: " + str(response.body.len()) + "\r\n" +
                 "Content-Type: text/plain\r\n" +
                 "\r\n"
    
    client.write(header + response.body)
}
```

---

## 実行例

```bash
nagiscript run main.ngs
```

```bash
# テスト
curl http://localhost:8080/
# Welcome to NagiScript Web Framework!

curl http://localhost:8080/hello
# Hello, World!

curl http://localhost:8080/notfound
# Page not found
```

---

## 学べること

1. **ルーティング**: URL パスに基づくリクエスト振り分け
2. **HTTP プロトコル**: リクエスト/レスポンスの構造
3. **コールバック**: 関数を引数として渡す
4. **ネットワーク**: TCP ソケットの操作

---

[次: IoT センサーデータ収集 →](./iot-sensor.md)
