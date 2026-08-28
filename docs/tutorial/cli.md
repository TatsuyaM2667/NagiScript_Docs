# CLI ツール開発

NagiScript でコマンドラインツールを開発する方法を学びます。

---

## 基本的な CLI ツール

```ngs
import "std:io"
import "std:args"

fn main() void {
    val arguments = args.get_all()
    
    if arguments.len() < 2 {
        io.println("Usage: mytool <command>")
        std.process.exit(1)
    }
    
    val command = arguments[1]
    
    match command {
        "help" => print_help(),
        "version" => io.println("1.0.0"),
        "run" => run_task(arguments),
        _ => {
            io.println("Unknown command: " + command)
            std.process.exit(1)
        }
    }
}
```

---

## 引数パース

### 基本的な引数取得

```ngs
import "std:args"

fn main() void {
    val name = args.get("name")
    val verbose = args.has("verbose")
    val output = args.get("output")
    
    match name {
        Option.Some(n) => io.println("Name: " + n),
        Option.None => io.println("No name provided")
    }
    
    if verbose {
        io.println("Verbose mode enabled")
    }
}
```

### 使用例

```bash
$ mytool --name Alice --verbose --output result.txt
Name: Alice
Verbose mode enabled
```

---

## 出力の制御

```ngs
import "std:io"

fn print_colored(text: str, color: str) void {
    val prefix = match color {
        "red" => "\x1b[31m",
        "green" => "\x1b[32m",
        "blue" => "\x1b[34m",
        _ => ""
    }
    val reset = "\x1b[0m"
    
    io.println(prefix + text + reset)
}
```

---

## エラーハンドリング

```ngs
import "std:io"
import "std:fs"

fn main() void {
    match run() {
        Result.Ok(_) => std.process.exit(0),
        Result.Err(e) => {
            io.println("Error: " + e)
            std.process.exit(1)
        }
    }
}

fn run() Result<void, str> {
    val content = fs.read_to_string("config.toml")
        .map_err(fn(e: str) str {
            "Failed to read config: " + e
        })?
    
    // 処理
    Result.Ok(())
}
```

---

## 実践的な例: ファイルチェッカー

```ngs
import "std:io"
import "std:fs"
import "std:args"

fn main() void {
    val path = args.get("path")
        .unwrap_or(".")
    
    match check_path(path) {
        Result.Ok(report) => io.println(report),
        Result.Err(e) => {
            io.println("Error: " + e)
            std.process.exit(1)
        }
    }
}

fn check_path(path: str) Result<str, str> {
    val metadata = fs.metadata(path)
        .map_err(fn(e: str) str {
            "Cannot access path: " + e
        })?
    
    if metadata.is_dir {
        Result.Ok("Directory: " + path)
    } else {
        Result.Ok("File: " + path + " (" + str(metadata.size) + " bytes)")
    }
}
```

---

## ビルドと配布

```bash
# ビルド
nagiscript build main.ngs -o mytool

# 実行
./mytool --help
```

---

[次: 組み込み・マイコン開発 →](./microcontroller.md)
