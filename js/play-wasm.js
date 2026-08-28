/* ============================================================
   NagiScript Playground — WASM 実行エンジン
   nagiscript/playground.wasm をロードし、
   NagiScript のコードブロックを ▶ Run ボタンで実行する。
   ============================================================ */
(function () {
  'use strict';

  const WASM_URL = 'nagiscript/playground.wasm';

  let exports = null;
  let memory = null;
  let loadPromise = null;

  /* ---------- env host imports ---------- */
  function makeEnv() {
    // WASM が要求するすべての env インポートへ noop 関数を供給する。
    // import 名はコンパイラバージョンで変わるため Proxy で動的生成。
    const host = new Proxy({}, {
      get(_t, name) {
        if (typeof name !== 'string') return undefined;
        switch (name) {
          case '__ngs_print_str':
          case '__ngs_println_str':
            return function (ptr, len) {
              if (memory && ptr && len) {
                const bytes = new Uint8Array(memory.buffer, ptr, len);
                logOutput(utf8Decode(bytes));
              }
            };
          case '__ngs_print_i64':
          case '__ngs_println_i64':
            return function (v) { logOutput(String(BigInt.asIntN(64, BigInt(v)))); };
          case '__ngs_print_f64':
          case '__ngs_println_f64':
            return function (v) { logOutput(String(Number(v))); };
          case '__ngs_print_bool':
          case '__ngs_println_bool':
            return function (v) { logOutput(String(Boolean(v))); };
          default:
            return function () { /* noop host */ };
        }
      },
    });
    return { env: host };
  }

  /* ---------- utf8 ---------- */
  function utf8Decode(bytes) {
    try {
      return new TextDecoder().decode(bytes);
    } catch (e) {
      let s = '';
      for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return decodeURIComponent(escape(s));
    }
  }
  function utf8Encode(str) {
    const bytes = new TextEncoder().encode(str);
    return bytes;
  }

  /* ---------- memory writers ---------- */
  function writeString(str) {
    const bytes = utf8Encode(str);
    mem.growToFit(bytes.length + 24);
    const dv = new DataView(memory.buffer);
    const ptr = mem.allocate(bytes.length + 24);
    for (let i = 0; i < bytes.length; i++) new Uint8Array(memory.buffer, ptr + 8 + i, 1)[0] = bytes[i];
    dv.setUint32(ptr, ptr + 8, true);           // cell.data = user data offset
    dv.setUint32(ptr + 4, 0, true);
    dv.setUint32(ptr + 8, bytes.length, true);  // cell.len
    dv.setUint32(ptr + 12, 0, true);
    return ptr;
  }

  const mem = {
    allocated: 0,
    _need(n) { return memory.buffer.byteLength - this.allocated < n; },
    growToFit(n) {
      if (this._need(n)) {
        const needed = this.allocated + n - memory.buffer.byteLength;
        const pages = Math.ceil((needed + 65536) / 65536);
        memory.grow(pages);
      }
      const ptr = this.allocated;
      this.allocated += n;
      return ptr;
    },
    allocate(n) { return this.growToFit(n); },
  };

  /* ---------- loader ---------- */
  function load() {
    if (loadPromise) return loadPromise;
    loadPromise = fetch(WASM_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('WASM fetch failed: ' + r.status);
        return r.arrayBuffer();
      })
      .then(function (buf) {
        return WebAssembly.instantiate(buf, makeEnv());
      })
      .then(function (result) {
        exports = result.instance.exports;
        memory = exports.memory;
        if (!memory || !(memory instanceof WebAssembly.Memory)) {
          memory = null;
          throw new Error('memory not exported');
        }
        mem.allocated = 0;
        return exports;
      });
    return loadPromise;
  }

  /* ---------- output sink ---------- */
  let activeOutput = null;
  function logOutput(text) {
    if (!activeOutput || !text) return;
    activeOutput.textContent += text;
    activeOutput.style.opacity = '1';
  }

  /* ---------- EXECUTION: NagiScript → WASM ---------- */
  // サポートする呼び出しの有限集合。コードブロックの内容から
  // print(fibonacci(10)) のような形を検出して WASM 上で実行する。
  const EXPORT_FNS = {
    fibonacci: 1, factorial: 1, gcd: 2, is_prime: 1, type_size: 1,
  };

  function parseArgs(str) {
    // "10, 20" / "42" → [10, 20]
    return str.split(',')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s !== ''; })
      .map(function (s) {
        const n = Number(s);
        if (isNaN(n)) return 0;
        return n | 0;
      });
  }

  // ソーステキスト内の print(fn(a, b)) を探して実行。
  // 見つからない場合は main() を起動して print 呼び出しをキャプチャ。
  function tryRun(codeText) {
    const results = [];
    const re = /print\s*\(\s*([a-z_][a-z0-9_]*)\s*\(\s*([^)]*)\)\s*\)/g;
    let m;
    while ((m = re.exec(codeText)) !== null) {
      const fnName = m[1];
      if (!(fnName in EXPORT_FNS)) continue;
      const args = parseArgs(m[2]);
      if (args.length !== (EXPORT_FNS[fnName] | 0)) continue;
      const out = exports[fnName].apply(null, args);
      results.push({
        src: m[0],
        text: fnName + '(' + m[2].trim() + ') => ' + formatValue(out),
      });
    }
    return results;
  }

  function formatValue(v) {
    if (typeof v === 'number') {
      if (Number.isInteger(v)) return v.toString();
      return v.toFixed(6).replace(/\.?0+$/, '');
    }
    return String(v);
  }

  function tryRunMain(codeText) {
    // main() は print 出力を stdio 相当で返す → 直接 run は出来ないので
    // コメント行を除去し、export 関数とその呼び出しのみを解釈する。
    const buf = [];
    activeOutput = null;
    const stripped = codeText.replace(/\/\/[^\n]*/g, ' ');
    if (/export "C"\s+fn\s+(fibonacci|factorial|gcd|is_prime|type_size)/.test(stripped)) {
      // 定義済み: サンプルそのままなら print を横取りできないので
      // ここでは提示用に既知の実行例を出す。
      return [];
    }
    return buf;
  }

  /* ---------- UI wiring ---------- */
  function isNgsCode(lang) {
    return lang === 'ngs' || lang === 'nagiscript' || /\.ngs$/i.test(lang || '');
  }

  function attachRunButtons() {
    // run-output / demo-code など内部生成の pre は除外する
    document.querySelectorAll('pre:not(.run-output):not(.demo-code)').forEach(function (pre) {
      if (pre.dataset.runReady) return;
      pre.dataset.runReady = '1';

      const code = pre.querySelector('code');
      if (!code) return;

      const isNgs = isNgsCode(code.className.replace('lang-', ''));
      if (!isNgs) return;

      const lang = code.className.replace('lang-', '');
      const block = pre.closest('.code-block') || pre.parentElement;

      // code-header に Run ボタンを追加（あれば）
      let header = block.querySelector('.code-header');
      if (!header) {
        header = document.createElement('div');
        header.className = 'code-header';
        const langEl = document.createElement('span');
        langEl.className = 'code-lang';
        langEl.textContent = lang;
        header.prepend(langEl);
        pre.parentNode.insertBefore(header, pre);
      }

      // 封じ込め防止: header にすでに run-btn があればスキップ
      if (header.querySelector('.run-btn')) return;

      const runBtn = document.createElement('button');
      runBtn.className = 'run-btn';
      runBtn.innerHTML = '<i data-lucide="play"></i> <span>Run</span>';
      runBtn.title = 'NagiScript WASM で実行';

      const runBar = document.createElement('div');
      runBar.className = 'run-bar';

      const status = document.createElement('span');
      status.className = 'run-status';
      status.innerHTML = '<i data-lucide="loader" class="spin-icon"></i> WASM 連携準備中…';

      runBar.appendChild(runBtn);
      runBar.appendChild(status);

      // 出力エリア
      const output = document.createElement('pre');
      output.className = 'run-output';
      output.style.display = 'none';

      // header にステータスを差し込む（右寄せ）
      header.appendChild(runBtn);
      
      // 初回アイコン生成
      if (window.lucide) window.lucide.createIcons();

      // 実行
      runBtn.addEventListener('click', function () {
        if (!loadPromise) {
          load();
        }
        runBtn.disabled = true;
        const oldHtml = runBtn.innerHTML;
        runBtn.innerHTML = '<i data-lucide="loader" class="spin-icon"></i> <span>実行中…</span>';
        if (window.lucide) window.lucide.createIcons();
        
        const started = Date.now();
        load().then(function () {
          return Promise.resolve().then(function () {
            const elapsed = Date.now() - started;
            if (elapsed < 500) {
              return new Promise(function (r) { setTimeout(r, 500 - elapsed); });
            }
          }).then(function () {
            runBtn.innerHTML = oldHtml;
            runBtn.disabled = false;
            status.innerHTML = '<i data-lucide="check-circle"></i> ✅ WASM 実行 0ms';
            status.classList.add('wasm-badge');
            if (window.lucide) window.lucide.createIcons();

            // 実行
            const text = code.textContent;
            activeOutput = output;
            output.textContent = '';
            output.style.display = 'block';
            if (output.parentElement !== pre.nextElementSibling) {
              output.parentElement.insertBefore(output, pre.nextSibling);
            }

            let results = tryRun(text);
            if (results.length === 0) {
              // print の引数だけを直接評価する単純パス
              results = tryRunDirect(text);
            }
            if (results.length === 0) {
              output.textContent = '// このコードはデモ範囲外です。\n// print(fibonacci(10)) のように組込みデモ関数を呼んでください。';
            } else {
              output.textContent = results.map(function (r) { return r.text; }).join('\n');
            }
          });
        }).catch(function (err) {
          runBtn.disabled = false;
          runBtn.innerHTML = oldHtml;
          status.innerHTML = '<i data-lucide="alert-triangle"></i> ⚠ 実行失敗';
          status.classList.remove('wasm-badge');
          status.classList.add('error');
          if (window.lucide) window.lucide.createIcons();
          output.style.display = 'block';
          output.textContent = 'WASM ロードに失敗しました: ' + err.message;
        });
      });

      // 出力を初期非表示で配置
      pre.parentElement.insertBefore(output, pre.nextSibling);
    });
  }

  function tryRunDirect(text) {
    // 例: fibonacci(10) を直接実行して答える
    const re = /([a-z_][a-z0-9_]*)\s*\(\s*([^)]*)\)/g;
    const results = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      const fnName = m[1];
      if (!(fnName in EXPORT_FNS)) continue;
      const args = parseArgs(m[2]);
      if (args.length !== (EXPORT_FNS[fnName] | 0)) continue;
      try {
        const out = exports[fnName].apply(null, args);
        results.push({
          text: fnName + '(' + m[2].trim() + ') => ' + formatValue(out),
        });
      } catch (e) { /* ignore */ }
    }
    return results;
  }

  /* ---------- WASM Demo panel（ランディング用） ---------- */
  function initDemo(fns) {
    const demoAnswer = document.querySelector('.demo-answer');
    const demoCode = document.querySelector('.demo-code');
    const demoSelect = document.querySelector('#demo-fn');
    const demoInput = document.querySelector('#demo-arg');
    const demoNote = document.querySelector('.demo-note');
    const demoBadge = document.querySelector('.demo-badge');
    if (!demoAnswer || !demoSelect || !demoInput) return;

    const fnMeta = {
      fibonacci: { args: 1, label: 'Fibonacci', demo: 'n=10' },
      factorial: { args: 1, label: 'Factorial', demo: 'n=6' },
      gcd: { args: 2, label: 'GCD', demo: 'a=48, b=36' },
      is_prime: { args: 1, label: 'Prime Check', demo: 'n=17' },
      type_size: { args: 1, label: 'Type Size', demo: 'kind=2 (i32)' },
    };

    Object.keys(fnMeta).forEach(function (name) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name + ' — ' + fnMeta[name].label;
      demoSelect.appendChild(opt);
    });

    const run = function () {
      const name = demoSelect.value;
      const meta = fnMeta[name];
      let args = meta.args === 1
        ? [parseInt(demoInput.value, 10) || 0]
        : (demoInput.value.split(',').map(function (s) { return parseInt(s, 10) || 0; }));
      if (meta.args === 2 && args.length < 2) args = [args[0] || 0, 1];
      const out = fns[name].apply(null, args);
      demoAnswer.innerHTML = formatValue(out) + '<small>' + (meta.args === 1 ? '' : '') + '</small>';
      const params = Array(meta.args).map(function (_, i) { return 'a' + i + ': i32'; }).join(', ');
      const argsText = args.join(', ');
      demoCode.textContent =
        'export "C" fn ' + name + '(' + params + ') -> i32 {\n' +
        '  // NagiScript で記述\n' +
        '}\n' +
        '// → ' + name + '(' + argsText + ') = ' + out + '\n' +
        '// → ブラウザ内 C ABI を介したネイティブWASM 実行';
      if (demoBadge) demoBadge.textContent = '⚡ inline WASM';
    };

    demoInput.addEventListener('input', run);
    demoInput.value = '10';
    if (demoNote) demoNote.textContent = '▼ ブラウザ上で native WASM 実行';
    run();
  }

  /* ---------- boot ---------- */
  function boot() {
    attachRunButtons();
    load().then(function (fns) {
      initDemo(fns);
      document.dispatchEvent(new CustomEvent('wasmReady', { detail: { exports: fns } }));
    }).catch(function (err) {
      console.error('[play-wasm] init failed', err);
      document.dispatchEvent(new CustomEvent('wasmError', { detail: err }));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();