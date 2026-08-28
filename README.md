# NagiScript Docs

[NagiScript](https://github.com/TatsuyaM2667/nagiscript_lang) 公式ドキュメントサイトです。

## 特徴

- **静的サイト** — HTML / CSS / JS のみ。ビルド不要で Cloudflare Pages にデプロイできます
- **Orangestar 風テーマ** — 青空 × ガラスモーフィズムのライトテーマと、夜空のダークテーマ
- **シンタックスハイライト** — NagiScript / bash / TOML のトークナイザー方式ハイライト（生成HTMLを再処理しない安全な実装）
- **Inline WASM Playground** — `nagiscript/playground.wasm` をブラウザ上で実行するデモ（fibonacci / factorial / gcd / is_prime / type_size）
- **検索機能** — ドキュメントページのジャンプ検索

## ドキュメント構成

```
index.html                    ランディング
docs/
├── getting-started.html      はじめに
├── tutorial/                 チュートリアル
│   ├── basics.html           基本概念
│   ├── functions.html        関数とモジュール
│   ├── structs-enums.html    構造体と列挙型
│   ├── generics.html         ジェネリクス
│   ├── error-handling.html   エラーハンドリング
│   ├── memory.html           メモリ管理
│   ├── async.html            非同期プログラミング
│   ├── webassembly.html      WebAssembly
│   ├── browser-app.html      ブラウザアプリ
│   ├── tui-app.html          TUI アプリ
│   ├── cli.html              CLI ツール開発
│   ├── microcontroller.html  組み込み開発
│   └── cinterop.html         C言語との相互運用
├── reference/                リファレンス
└── examples/                 実践例
js/
├── main.js                   ハイライト / テーマ / 検索 / サイドバー
└── play-wasm.js              WASM ローダー + ▶ Run ボタン統合
nagiscript/                   WASM デモ用 NagiScript ソース (.ngs / .wasm)
```

## WASM デモをビルドし直すには

`nagiscript/playground.ngs` を編集後、NagiScript コンパイラでエクスポートします。

```bash
nagiscript wasm nagiscript/playground.ngs -o nagiscript/playground.wasm
```

## デプロイ

[Cloudflare Pages](https://pages.cloudflare.com/) に静的サイトとしてアップロードしています。
ローカルから更新する場合:

```bash
npx wrangler pages deploy . --project-name=nagiscript-docs --commit-dirty=true
```

`_headers` でキャッシュ方針、`_routes.json` で静的配信ルールを管理しています。

## License

MIT © Tatsuya M