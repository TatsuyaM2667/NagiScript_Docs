# コンパイラー内部構造

NagiScript コンパイラーの内部構造を解説します。

---

## アーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│                    Source Code                       │
│                  (main.ngs)                          │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                    Lexer                             │
│              (ngs_lexer)                             │
│  Tokenize: keywords, identifiers, literals           │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                    Parser                            │
│               (ngs_parser)                           │
│  AST Generation: expressions, statements, types      │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               Semantic Analysis                      │
│               (ngs_sema)                             │
│  Type checking, name resolution, borrow checking     │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                    IR Lowering                       │
│                (ngs_ir)                              │
│  HIR → MIR: type erasure, monomorphization           │
└─────────────────┬───────────────────────────────────┘
                  │
          ┌───────┴───────┐
          │               │
┌─────────▼─────┐ ┌───────▼─────────┐
│  LLVM Backend │ │  Wasm Backend    │
│ (codegen_llvm)│ │ (codegen_wasm)   │
│  Native code  │ │  WAT/Wasm        │
└─────────┬─────┘ └───────┬─────────┘
          │               │
┌─────────▼─────┐ ┌───────▼─────────┐
│  Object File  │ │  .wasm + .d.ts   │
│   (.o → ELF)  │ │  (Wasm binary)   │
└───────────────┘ └─────────────────┘
```

---

## Lexer (字句解析)

### 処理

1. ソースコードをトークンに分割
2. キーワード、識別子、リテラルを認識
3. 行番号・列番号を追跡

### トークンタイプ

```rust
enum Token {
    // キーワード
    Fn, Val, Var, Struct, Enum, If, Else, For, While, Match,
    Return, Break, Continue, Import, Export, Async, Await,
    
    // リテラル
    IntLit(f64), FloatLit(f64), StrLit(String), BoolLit(bool),
    
    // 識別子
    Ident(String),
    
    // 演算子
    Plus, Minus, Star, Slash, Percent,
    Eq, Neq, Lt, Gt, Leq, Geq,
    And, Or, Not,
    AmpAmp, StarStar, Question,
    
    // 区切り
    LParen, RParen, LBrace, RBrace, LBracket, RBracket,
    Comma, Colon, Semicolon, Dot, Arrow,
    
    // 特殊
    Eof, Newline, Indent, Dedent,
}
```

---

## Parser (構文解析)

### 処理

1. トークン列から抽象構文木 (AST) を構築
2. 構文ルールに従ってノードを作成
3. エラーメッセージを生成

### AST ノード

```rust
enum Expr {
    IntLit(i64),
    FloatLit(f64),
    StrLit(String),
    BoolLit(bool),
    Ident(String),
    BinaryOp { op: BinOp, left: Box<Expr>, right: Box<Expr> },
    UnaryOp { op: UnOp, operand: Box<Expr> },
    Call { func: Box<Expr>, args: Vec<Expr> },
    If { cond: Box<Expr>, then: Box<Block>, else_: Option<Box<Expr>> },
    Match { scrutinee: Box<Expr>, arms: Vec<MatchArm> },
    Block(Block),
    // ...
}

enum Stmt {
    Let { name: String, ty: Option<Type>, init: Expr },
    Assign { name: String, value: Expr },
    Return(Option<Expr>),
    Expr(Expr),
    // ...
}
```

---

## Semantic Analysis (意味解析)

### 処理

1. 型チェック
2. 名前解決
3. 借用チェック
4. エラー検出

### 型チェック

```rust
fn check_expr(expr: &Expr, env: &mut Env) -> Result<Type, Error> {
    match expr {
        Expr::IntLit(_) => Ok(Type::I32),
        Expr::Ident(name) => env.lookup(name),
        Expr::BinaryOp { op, left, right } => {
            let left_ty = check_expr(left, env)?;
            let right_ty = check_expr(right, env)?;
            
            if left_ty != right_ty {
                return Err(Error::TypeMismatch(left_ty, right_ty));
            }
            
            Ok(left_ty)
        }
        // ...
    }
}
```

### 借用チェック

```rust
fn check_borrow(expr: &Expr, env: &mut Env) -> Result<(), Error> {
    // 不変借用のチェック
    // 可変借用のチェック
    // 参照の寿命のチェック
    // ...
}
```

---

## IR Lowering (中間表現変換)

### 処理

1. AST → HIR (High-level IR) 変換
2. HIR → MIR (Mid-level IR) 変換
3. 型消去 (Type Erasure)
4. 単型化 (Monomorphization)

### 単型化の例

```ngs
// 元のコード
fn add<T: Numeric>(a: T, b: T) T {
    a + b
}

val x = add(10, 20)      // T = i32
val y = add(1.5, 2.5)    // T = f64
```

```rust
// 展開後
fn add_i32(a: i32, b: i32) i32 {
    a + b
}

fn add_f64(a: f64, b: f64) f64 {
    a + b
}
```

---

## LLVM Backend

### 処理

1. MIR → LLVM IR 変換
2. 最適化パスの適用
3. ネイティブコード生成

### LLVM IR 生成

```rust
fn codegen_expr(expr: &Expr, builder: &Builder) -> IntValue {
    match expr {
        Expr::IntLit(n) => builder.const_int(*n),
        Expr::BinaryOp { op, left, right } => {
            let l = codegen_expr(left, builder);
            let r = codegen_expr(right, builder);
            
            match op {
                BinOp::Add => builder.build_add(l, r),
                BinOp::Sub => builder.build_sub(l, r),
                BinOp::Mul => builder.build_mul(l, r),
                BinOp::Div => builder.build_signed_div(l, r),
                // ...
            }
        }
        // ...
    }
}
```

---

## Wasm Backend

### 処理

1. MIR → WAT (WebAssembly Text) 変換
2. WAT → Wasm バイナリ変換
3. 型定義ファイル (.d.ts) 生成

### WAT 生成

```wat
(module
  (func $add (param i32 i32) (result i32)
    local.get 0
    local.get 1
    i32.add
  )
  (export "add" (func $add))
)
```

---

## エラーハンドリング

### エラータイプ

```rust
enum Error {
    LexError { line: usize, col: usize, msg: String },
    ParseError { line: usize, col: usize, msg: String },
    TypeError { line: usize, col: usize, msg: String },
    NameError { line: usize, col: usize, msg: String },
    BorrowError { line: usize, col: usize, msg: String },
    CodegenError { msg: String },
}
```

### エラーメッセージの生成

```
Error[E001]: Type mismatch
  --> main.ngs:5:10
   |
 5 |     val x: i32 = "hello"
   |            ---   ^^^^^^^ expected i32, found str
   |
```

---

## 最適化

### LLVM 最適化パス

1. **Constant Folding**: 定数畳み込み
2. **Dead Code Elimination**: 死コード除去
3. **Inlining**: 関数インライン化
4. **Loop Unrolling**: ループ展開
5. **Vectorization**: ベクトル化

### コンパイル時の最適化レベル

```bash
nagiscript build main.ngs --opt 0  # 最適化なし
nagiscript build main.ngs --opt 2  # 標準最適化
nagiscript build main.ngs --opt 3  # 最大最適化
```

---

## パフォーマンス

### コンパイル速度

- **字句解析**: O(n)
- **構文解析**: O(n)
- **意味解析**: O(n log n)
- **IR 変換**: O(n)
- **コード生成**: O(n)

### 実行時パフォーマンス

- **関数呼び出し**: C ABI と同等
- **メモリアクセス**: ヒープ確保のみオーバーヘッド
- **エラーハンドリング**: Result 型による分岐

---

[次: キーワード一覧 →](./keywords.md)
