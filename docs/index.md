# NagiScript 公式ドキュメント

> メモリ安全性と C言語 ABI 互換性を備えた Systems Programming 言語

NagiScript は、LLVM IR に直接マッピングされ、C ABI と完全互換な Systems Programming 言語です。 Rust の安全性と C のパフォーマンスを両立します。

---

## 特徴

- **静的型付け** — 実行時エラーを排除
- **C ABI 互換** — 既存の C ライブラリをそのまま利用可能
- **LLVM IR 直接生成** — C/C++ と同等のパフォーマンス
- **自動メモリ管理 (Rc)** — 侵入型参照カウントによる安全なヒープ確保
- **Unsafe ブロック** — 必要に応じてポインタ操作を許可
- **Wasm 対応** — Web ブラウザでも動作
- **JSX ネイティブ対応** — React コンポーネントを直接記述

---

## クイックスタート

### インストール

```bash
# npm でインストール（推奨）
npm install -g nagiscript

# または cargo でインストール
cargo install ngs_driver
```

### 最初のプロジェクト

```bash
nagiscript init hello && cd hello
nagiscript run main.ngs
# → Hello from hello!
```

---

## ドキュメント構成

### 入門ガイド
- [はじめに](./getting-started.md) — インストールと初回実行
- [基本概念](./tutorial/basics.md) — 変数、型、制御構文

### チュートリアル（レッスン形式）
- [関数とモジュール](./tutorial/functions.md)
- [構造体と列挙型](./tutorial/structs-enums.md)
- [ジェネリクス](./tutorial/generics.md)
- [エラーハンドリング](./tutorial/error-handling.md)
- [メモリ管理](./tutorial/memory.md)
- [非同期プログラミング](./tutorial/async.md)
- [WebAssembly](./tutorial/webassembly.md)
- [CLI ツール開発](./tutorial/cli.md)
- [組み込み・マイコン開発](./tutorial/microcontroller.md)
- [C言語との相互運用](./tutorial/cinterop.md)

### 実践プロジェクト
- [Todo アプリケーション](./examples/todo-app.md)
- [Web フレームワーク](./examples/web-framework.md)
- [IoT センサーデータ収集](./examples/iot-sensor.md)

### 言語リファレンス
- [型システム](./reference/types.md)
- [構文リファレンス](./reference/syntax.md)
- [演算子リファレンス](./reference/operators.md)
- [標準ライブラリ](./reference/standard-library.md)
- [C 標準ライブラリ](./reference/standard-c-library.md)
- [コンパイラー内部構造](./reference/compiler.md)
- [キーワード一覧](./reference/keywords.md)

### その他のドキュメント
- [コントリビューション](./contributing.md)

---

## 対応プラットフォーム

| ターゲット | 状態 | 用途 |
|-----------|------|------|
| x86_64 Linux | ✅ 実用 | デスクトップ / サーバー |
| WebAssembly | ✅ 実用 | Web アプリケーション |
| Embedded (ARM Cortex-M) | 🔶 準備中 | IoT / マイコン |

---

## ライセンス

MIT License

---

*Version 0.2.0 — 2026年8月*
