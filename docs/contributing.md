# コントリビューション

NagiScript へのコントリビューション方法を解説します。

---

## 開発環境のセットアップ

### 必要なもの

- Rust 1.75 以上
- LLVM 15 以上
- Node.js 18 以上 (npm パッケージ用)

### リポジトリのクローン

```bash
git clone https://github.com/TatsuyaM2667/nagiscript_lang.git
cd nagiscript_lang
```

### ビルド

```bash
cargo build
```

### テスト

```bash
cargo test
```

---

## プロジェクト構造

```
nagiscript_lang/
├── Cargo.toml              # ワークスペース設定
├── crates/
│   ├── ngs_ast/            # AST 定義
│   ├── ngs_lexer/          # 字句解析
│   ├── ngs_parser/         # 構文解析
│   ├── ngs_sema/           # 意味解析
│   ├── ngs_ir/             # 中間表現
│   ├── ngs_codegen_llvm/   # LLVM バックエンド
│   ├── ngs_codegen_wasm/   # Wasm バックエンド
│   ├── ngs_driver/         # CLI ドライバー
│   └── ngs_std/            # 標準ライブラリ
├── examples/               # サンプルコード
├── docs/                   # ドキュメント
└── npm/                    # npm パッケージ
```

---

## コーディング規約

### Rust コードスタイル

- `rustfmt` を使用
- `clippy` の警告を回避
- ドキュメントコメント (`///`) を追加

### テスト

- 新機能にはテストを追加
- テストファイルは `tests/` ディレクトリに配置
- テスト関数名は `test_` プレフィックス

```rust
#[test]
fn test_add_function() {
    let result = add(10, 20);
    assert_eq!(result, 30);
}
```

---

## プルリクエスト

### 作業手順

1. Issue で議論（バグ修正や新機能）
2. ブランチを作成
3. 変更を実装
4. テストを追加
5. ドキュメントを更新
6. プルリクエストを作成

### プルリクエストのタイトル

```
[Feature] 新機能の説明
[Bugfix] バグ修正の説明
[Doc] ドキュメント更新の説明
```

### レビュー

- CI テストが通ること
- コードレビューを受けること
- 必要に応じて修正を加えること

---

## Issue の作成

### バグ報告

```markdown
## バグの説明
バグの内容を記述

## 再現手順
1. ...
2. ...
3. ...

## 期待する動作
期待する動作を記述

## 実際の動作
実際の動作を記述

## 環境
- OS: ...
- バージョン: ...
```

### 新機能の提案

```markdown
## 機能の説明
新機能の内容を記述

## 使用例
使用例を記述

## なぜ必要か
必要性を記述
```

---

## ロードマップ

現在の開発優先事項：

1. **組み込みサポート**: ARM Cortex-M 対応
2. **Wasm 改善**: React との連携向上
3. **エラーメッセージ**: より親切なエラー表示
4. **パフォーマンス**: コンパイル速度の改善
5. **ドキュメント**: チュートリアルの追加

---

## 質問

質問がある場合は、GitHub の Discussions を利用してください：

https://github.com/TatsuyaM2667/nagiscript_lang/discussions

---

[戻る: ドキュメント一覧 →](./index.md)
