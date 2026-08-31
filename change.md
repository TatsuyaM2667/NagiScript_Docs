# 変更履歴（2026年8月）

NagiScript コンパイラーへの最近の変更をまとめます。ここには**言語機能の追加・修正**と、それに伴う**既存バグの修正**を、一つのドキュメントとして整理しています。

> すべての変更は現行コンパイラー（`nagiscript check|ir|build|run`）で動作確認済みで、`cargo test`（105 テスト）を通過しています。

---

## 目次

1. [`for ... step` 構文の追加](#1-for--step-構文の追加)
2. [ループ変数の再宣言バグを修正](#2-ループ変数の再宣言バグを修正)
3. [`if`/`else` を返り値にする関数の誤拒否を修正](#3-ifelse-を返り値にする関数の誤拒否を修正)
4. [配列 `len()` メソッドの追加](#4-配列-len-メソッドの追加)

---

## 1. `for ... step` 構文の追加

範囲 `for` ループに、任意の増分（ステップ値）を指定できる `step` 節を追加しました。

### 使い方

```nagi
fn main() {
    // 昇順・正のステップ
    for i in 0..10 step 2 { println(i) }
    // → 0 2 4 6 8

    // 降順・負のステップ
    for i in 10..0 step -3 { println(i) }
    // → 10 7 4 1
}
```

- `step` を省略すると従来どおり `1` ずつ増えます。
- 負のステップは降順ループ（`10..0 step -1` など）で使用できます。
- 継続条件は `step * (end - i) > 0` で評価されるため、`0..10 step -1` のような「進まない向き」のループは即座に終了します（無限ループにはなりません）。

### 実装のポイント

- **Lexer / AST**: キーワード `step` と、`Stmt::ForRange` に `step: Option<Expr>` フィールドを追加。
- **Parser**: `parse_for` で終了値の後に省略可能な `step <expr>` を解析。
- **Sema**: `ForRange` を `(var, ty, start, end, Option<step>, body)` の 6 要素に拡張し、step 式の型チェックを実施。
- **IR Lowering**: ループ変数を格納するアロカに加えて、ステップ値を保持するアロカを導入。増分ブロックで `i = i + step` を実行するように変更。

---

## 2. ループ変数の再宣言バグを修正

### 症状

同一スコープ内で、2 つのループが**同じ変数名**をループ変数として使うと、コンパイルがクラッシュしていました。

```nagi
fn main() {
    for i in 0..3   { println(i) }   // 1 ループ目
    for i in 3..0 step -1 { println(i) } // 2 ループ目（同じ i を再宣言）
}
```

これまでコンパイラが `Option::unwrap()` の `None` でパニックしていました（`cleanup_locals` 内の `ctx.locals.remove(&name).unwrap()`）。

### 原因

IR ロワラーの `ForRange` 処理が、ループ変数を `declare` した**後**にスコープの基準位置 `base` を取得していました。そのためスコープ解放（`truncate`）時にループ変数が除去されず、2 ループ目で同じ名前を再宣言するとローカル名が重複し、末尾のクリーンアップで不一致が発生していました。

### 修正

`base` の取得をループ変数の `declare` より**前**に移動し、`ForC`（C 言語風 for）と同じスコープ管理パターンに統一しました。これにより、ループ変数は本体の終わりで確実に解放されます。

---

## 3. `if`/`else` を返り値にする関数の誤拒否を修正

### 症状

`if`/`else` の両分岐が値を返す、ごく一般的な関数形が「戻り値なしで末尾に到達可能」と誤って拒否されていました。

```nagi
fn fib(n: i32) -> i32 {
    if n < 2 { n } else { fib(n - 1) + fib(n - 2) }
}
```

これをコンパイルすると、`lowering failed: function can reach the end of its body without returning i32` というエラーが出て、再帰関数が書けないという深刻な問題でした。

### 原因（2 つ）

1. **パーサ**: 文位置の `if` / `match` は常に「文」（値を捨てる）として扱われていました。関数本体の末尾に置いた `if` も文になり、その値が返り値として扱われないため、戻り値が「なし」と判定されていました。
2. **sema**: 非 `void` 関数の「末尾まで制御が流れる経路」を検査する仕組みがありませんでした（`if x { return 1 }` のように `else` が無く戻り値が欠ける関数を検出できていませんでした）。

### 修正

- **パーサ**: ブロック末尾（`}` 直前）に置いた `if` / `match` を、返り値の tail 式として扱うよう変更。
- **sema**: 非 `void` 関数の本体検査に、全経路で値を返す（または `return` する）ことを検証する到達性解析（`block_guarantees_value`）を追加。

### 実行結果

```nagi
fn classify(n: i32) -> string { if n > 0 { "pos" } else { "non-pos" } }
fn fib(n: i32) -> i32 { if n < 2 { n } else { fib(n - 1) + fib(n - 2) } }
fn main() {
    println(classify(5))   // pos
    println(classify(-1))  // non-pos
    println(fib(10))       // 55
}
```

一方、本当に戻り値が欠けている関数は、これまで同様に`check` で正しく拒否されます。

```nagi
fn f(x: bool) -> i32 {
    if x { return 1; }   // else が無い → コンパイルエラー
}
// error: function can reach the end of its body without returning `i32`
```

---

## 4. 配列 `len()` メソッドの追加

配列（`[T; N]`）の要素数を返す `.len()` メソッドを追加しました。関数形式の `len(arr)` は従来からありましたが、メソッド形式に対応しました。

```nagi
fn main() {
    val a = [10, 20, 30]
    println(a.len())          // 3（メソッド形式）
    println(len([1, 2, 3, 4])) // 4（関数形式）
}
```

- 配列の長さはコンパイル時に判明する定数として扱われ、実行時にオーバーヘッドは発生しません。
- 文字列 `s.len()` / `len(s)`、リスト `list.len()` / `len(list)` も引き続き利用できます。

### 実装のポイント

- sema のメソッドディスパッチ（`call_method_with_args` / `resolve_method_call`）に `Ty::Array` の分岐を追加し、`Intrinsic::Len` へ導線を追加。
- ロワラー側では配列の長さをコンパイル時定数（`const_int(n)`）として出力。

---

## 関連ドキュメント

- [コンパイラー内部構造 →](./compiler.md)
- [標準ライブラリ →](./standard-library.md)
- [構文リファレンス →](./syntax.md)
- [型システム →](./types.md)
