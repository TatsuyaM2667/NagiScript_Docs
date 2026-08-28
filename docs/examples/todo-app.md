# Todo アプリケーション

NagiScript で Todo アプリケーションを開発するチュートリアルです。

---

## 概要

このチュートリアルでは、NagiScript で简单的な Todo アプリケーションを作成します。

- Todo の追加、削除、一覧表示
- ファイルへの保存と読み込み
- エラーハンドリング

---

## プロジェクト構成

```
todo_app/
├── main.ngs
├── todo.ngs
└── storage.ngs
```

---

## 実装

### todo.ngs — Todo 型の定義

```ngs
struct Todo {
    id: i32
    title: str
    completed: bool
}

fn Todo.to_string(self: Todo) str {
    val status = if self.completed { "[x]" } else { "[ ]" }
    status + " " + self.title
}
```

### storage.ngs — ファイル操作

```ngs
import "std:io"
import "std:fs"

fn save_todos(todos: List<Todo>, path: str) Result<void, str> {
    var content = ""
    
    for todo in todos {
        val line = str(todo.id) + "," + todo.title + "," + str(todo.completed)
        content = content + line + "\n"
    }
    
    fs.write_to_string(path, content)
        .map_err(fn(e: str) str { "Failed to save: " + e })
}

fn load_todos(path: str) Result<List<Todo>, str> {
    val content = fs.read_to_string(path)
        .map_err(fn(e: str) str { "Failed to load: " + e })?
    
    var todos = List<Todo> {}
    var id_counter = 1
    
    for line in content.split("\n") {
        if line.len() > 0 {
            val parts = line.split(",")
            if parts.len() >= 2 {
                todos.add(Todo {
                    id: id_counter,
                    title: parts[1],
                    completed: parts[2] == "true"
                })
                id_counter += 1
            }
        }
    }
    
    Result.Ok(todos)
}
```

### main.ngs — メインプログラム

```ngs
import "std:io"
import "std:args"
import "todo"
import "storage"

fn main() void {
    val command = args.get("command")
    
    match command {
        Option.Some(cmd) => {
            match cmd {
                "add" => add_todo(),
                "list" => list_todos(),
                "done" => complete_todo(),
                "remove" => remove_todo(),
                _ => print_help()
            }
        },
        Option.None => print_help()
    }
}

fn print_help() void {
    io.println("Usage:")
    io.println("  todo add <title>     - Add a new todo")
    io.println("  todo list            - List all todos")
    io.println("  todo done <id>       - Mark todo as completed")
    io.println("  todo remove <id>     - Remove a todo")
}

fn add_todo() void {
    val title = args.get("title")
    
    match title {
        Option.Some(t) => {
            val todos = load_todos("todos.txt")
                .unwrap_or(List<Todo> {})
            
            val new_todo = Todo {
                id: todos.len() + 1,
                title: t,
                completed: false
            }
            
            todos.add(new_todo)
            
            match save_todos(todos, "todos.txt") {
                Result.Ok(_) => io.println("Added: " + t),
                Result.Err(e) => io.println("Error: " + e)
            }
        },
        Option.None => io.println("Please provide a title")
    }
}

fn list_todos() void {
    val todos = load_todos("todos.txt")
        .unwrap_or(List<Todo> {})
    
    if todos.is_empty() {
        io.println("No todos yet!")
    } else {
        for todo in todos {
            io.println(todo.to_string())
        }
    }
}

fn complete_todo() void {
    val id = args.get("id")
    
    match id {
        Option.Some(id_str) => {
            val target_id = atoi(id_str)
            val todos = load_todos("todos.txt")
                .unwrap_or(List<Todo> {})
            
            var found = false
            var i = 0
            
            while i < todos.len() {
                if todos[i].id == target_id {
                    todos[i].completed = true
                    found = true
                }
                i += 1
            }
            
            if found {
                match save_todos(todos, "todos.txt") {
                    Result.Ok(_) => io.println("Completed todo " + id_str),
                    Result.Err(e) => io.println("Error: " + e)
                }
            } else {
                io.println("Todo not found")
            }
        },
        Option.None => io.println("Please provide a todo ID")
    }
}

fn remove_todo() void {
    val id = args.get("id")
    
    match id {
        Option.Some(id_str) => {
            val target_id = atoi(id_str)
            val todos = load_todos("todos.txt")
                .unwrap_or(List<Todo> {})
            
            var new_todos = List<Todo> {}
            var found = false
            
            for todo in todos {
                if todo.id != target_id {
                    new_todos.add(todo)
                } else {
                    found = true
                }
            }
            
            if found {
                match save_todos(new_todos, "todos.txt") {
                    Result.Ok(_) => io.println("Removed todo " + id_str),
                    Result.Err(e) => io.println("Error: " + e)
                }
            } else {
                io.println("Todo not found")
            }
        },
        Option.None => io.println("Please provide a todo ID")
    }
}
```

---

## 実行例

```bash
# Todo を追加
nagiscript run main.ngs --command add --title "Buy groceries"

# Todo を一覧表示
nagiscript run main.ngs --command list

# Todo を完了
nagiscript run main.ngs --command done --id 1

# Todo を削除
nagiscript run main.ngs --command remove --id 1
```

---

## 学べること

1. **モジュール分割**: 複数ファイルに分けてコードを整理
2. **ファイル操作**: fs モジュールを使った読み書き
3. **エラーハンドリング**: Result 型を使用したエラー処理
4. **コマンドライン引数**: args モジュールを使用

---

[次: Web フレームワーク →](./web-framework.md)
