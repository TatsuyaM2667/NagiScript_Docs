# はじめに

NagiScript のインストールから最初のプログラム実行までを解説します。

---

## NagiScript とは

NagiScript は、以下の特性を持つ Systems Programming 言語です：

| 特性 | 説明 |
|------|------|
| **型安全性** | 実行時エラーを排除する静的型付け |
| **C ABI 互換** | 既存の C ライブラリをそのまま利用可能 |
| **高性能** | LLVM IR への直接マッピング |
| **安全性** | 自動メモリ管理（Rc）とUnsafe制御 |
| **軽量** | 最小限のランタイム（libc のみ） |

---

## インストール

### npm（推奨）

```bash
npm install -g nagiscript
```

### cargo

```bash
cargo install ngs_driver
```

### 検証

```bash
nagiscript --version
# nagiscript 0.2.0
```

---

## 最初のプロジェクト

### ステップ 1: プロジェクト作成

```bash
nagiscript init my_project
```

これで以下が生成されます：

```
my_project/
├── main.ngs      ← メインファイル
└── project.toml  ← プロジェクト設定
```

### ステップ 2: コードを確認

```bash
cat main.ngs
```

```ngs
import "std:io"

fn main() void {
    io.println("Hello from my_project!")
}
```

### ステップ 3: 実行

```bash
nagiscript run main.ngs
# Hello from my_project!
```

---

## その他のコマンド

```bash
# チェック（コンパイルのみ、実行しない）
nagiscript check main.ngs

# LLVM IR を出力
nagiscript ir main.ngs

# バイナリをビルド
nagiscript build main.ngs -o my_app

# 型定義ファイル（.d.ts）を生成
nagiscript dts main.ngs -o main.d.ts
```

---

## プロジェクト設定（project.toml）

```toml
[project]
name = "my_project"
version = "0.1.0"

[build]
entry = "main.ngs"
target = "native"  # "native" or "wasm"
output = "build/"
```

---

## エディタサポート

### VSCode 拡張（準備中）

現在は以下の方法でシンタックスハイライトを設定できます：

1. **TextMate グラマーファイル**: `assets/nagiscript.tmLanguage.json`
2. **Tree-sitter グラマー**: `grammars/nagiscript/`

### プリプロセッサマクロ

```ngs
import "std:io"

// 開発中のみ有効なコード
@dev {
    io.println("Debug: This runs only in dev builds")
}
```

---

## トラブルシューティング

### インストール失敗

```bash
# Cargo のバージョンを確認
cargo --version  # 1.75 以上が必要

# npm の権限問題
sudo npm install -g nagiscript  # Linux/macOS
```

### ビルドエラー

```bash
# LLVM がインストールされているか確認
llc --version

# エラーメッセージを詳細に表示
nagiscript check main.ngs 2>&1
```

---

[次: 基本概念 →](./tutorial/basics.md)
