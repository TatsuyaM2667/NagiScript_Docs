# WebAssembly 対応

NagiScript を WebAssembly にコンパイルし、ブラウザで実行する方法を学びます。

---

## 基本的な Wasm コンパイル

```bash
nagiscript wasm main.ngs -o output.wasm
```

生成されるファイル：
- `output.wasm` — Wasm バイナリ
- `output.d.ts` — TypeScript 型定義

---

## ブラウザでの利用

### HTML ファイル

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>NagiScript Wasm</title>
</head>
<body>
    <div id="output"></div>
    <script>
        async function loadWasm() {
            const response = await fetch('output.wasm');
            const bytes = await response.arrayBuffer();
            const { instance } = await WebAssembly.instantiate(bytes, {
                env: { 
                    memory: new WebAssembly.Memory({ initial: 256 }) 
                }
            });
            
            // 関数を呼び出す
            const result = instance.exports.add(10, 20);
            document.getElementById('output').textContent = result;
        }
        loadWasm();
    </script>
</body>
</html>
```

---

## React との連携

### コンポーネント例

```tsx
import React, { useEffect, useState } from 'react';

function WasmComponent() {
    const [result, setResult] = useState<number | null>(null);
    
    useEffect(() => {
        async function loadWasm() {
            const response = await fetch('/output.wasm');
            const bytes = await response.arrayBuffer();
            const { instance } = await WebAssembly.instantiate(bytes);
            
            const result = instance.exports.process(42);
            setResult(result);
        }
        loadWasm();
    }, []);
    
    return (
        <div>
            <h1>NagiScript Wasm Result</h1>
            <p>Result: {result}</p>
        </div>
    );
}

export default WasmComponent;
```

---

## 型定義ファイル (.d.ts)

コンパイル時に自動生成される型定義：

```typescript
// output.d.ts
export function add(a: number, b: number): number;
export function process(input: string): string;
```

---

## メモリ操作

### JS 側からのメモリアクセス

```javascript
const memory = new WebAssembly.Memory({ initial: 256 });
const { instance } = await WebAssembly.instantiate(bytes, {
    env: { memory }
});

// メモリに文字列を書き込む
const encoder = new TextEncoder();
const str = encoder.encode("Hello, Wasm!");
const ptr = instance.exports.malloc(str.length);
new Uint8Array(memory.buffer, ptr, str.length).set(str);

// Wasm 関数を呼び出す
instance.exports.process_string(ptr, str.length);
```

---

## ビルド設定

### project.toml

```toml
[build]
target = "wasm"
output = "dist/"

[build.wasm]
memory_initial = 256
memory_maximum = 512
```

---

## パフォーマンスのヒント

1. **関数エクスポートを最小限に**: 必要な関数のみエクスポート
2. **バッチ処理**: 大量のデータは一度に渡す
3. **TypedArray の活用**: メモリ操作には `Uint8Array` を使用

---

[次: CLI ツール開発 →](./cli.md)
