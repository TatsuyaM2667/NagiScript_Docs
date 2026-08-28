(() => {
  // ---------- Utilities ----------
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function span(type, text) {
    if (type === 'plain') return esc(text);
    return `<span class="${type}">${esc(text)}</span>`;
  }

  // ---------- NagiScript tokenizer ----------
  const KEYWORDS = new Set([
    'fn', 'val', 'var', 'if', 'else', 'for', 'while', 'match', 'struct', 'enum',
    'unsafe', 'extern', 'export', 'return', 'impl', 'in', 'as', 'break', 'continue',
    'true', 'false', 'void', 'import', 'async', 'await', 'pub', 'self', 'Self',
    'Ok', 'Err', 'Some', 'None',
    'i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'usize', 'isize',
    'f32', 'f64', 'bool', 'str', 'string', 'List', 'Rc', 'Result', 'Option',
  ]);

  const NGS_BUILTINS = new Set(['print', 'println', 'panic', 'abort', 'len']);

  function highlightNgs(code) {
    const tokens = [];
    let i = 0;
    const len = code.length;

    while (i < len) {
      const c = code[i];
      if (c === '/' && code[i + 1] === '/') {
        let end = code.indexOf('\n', i);
        if (end === -1) end = len;
        tokens.push({ type: 'cm', text: code.slice(i, end) });
        i = end;
      } else if (c === '/' && code[i + 1] === '*') {
        let end = code.indexOf('*/', i + 2);
        if (end === -1) end = len; else end += 2;
        tokens.push({ type: 'cm', text: code.slice(i, end) });
        i = end;
      } else if (c === '"' || c === "'") {
        const q = c;
        let j = i + 1;
        while (j < len && code[j] !== q && code[j] !== '\n') {
          if (code[j] === '\\') j++;
          j++;
        }
        if (j < len && code[j] === q) j++;
        tokens.push({ type: 'str', text: code.slice(i, j) });
        i = j;
      } else if (/[0-9]/.test(c) || (c === '.' && i + 1 < len && /[0-9]/.test(code[i + 1]))) {
        let j = i;
        if (code[j] === '0' && (code[j + 1] === 'x' || code[j + 1] === 'X')) {
          j += 2;
          while (j < len && /[0-9a-fA-F_]/.test(code[j])) j++;
        } else {
          while (j < len && /[0-9_]/.test(code[j])) j++;
          if (j < len && code[j] === '.') {
            j++;
            while (j < len && /[0-9_]/.test(code[j])) j++;
          }
          if (j < len && (code[j] === 'e' || code[j] === 'E')) {
            j++;
            if (j < len && (code[j] === '+' || code[j] === '-')) j++;
            while (j < len && /[0-9_]/.test(code[j])) j++;
          }
        }
        if (j < len && code[j] === 'f') j++;
        tokens.push({ type: 'num', text: code.slice(i, j) });
        i = j;
      } else if (/[a-zA-Z_]/.test(c)) {
        let j = i;
        while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++;
        const word = code.slice(i, j);
        if (KEYWORDS.has(word)) {
          tokens.push({ type: 'kw', text: word });
        } else if (NGS_BUILTINS.has(word)) {
          tokens.push({ type: 'fn', text: word });
        } else if (j < len && code[j] === '(') {
          tokens.push({ type: 'fn', text: word });
        } else if (/^[A-Z]/.test(word)) {
          tokens.push({ type: 'tp', text: word });
        } else {
          tokens.push({ type: 'plain', text: word });
        }
        i = j;
      } else if (/[+\-*/%=!<>&|^~?:]/.test(c)) {
        let j = i;
        while (j < len && /[+\-*/%=!<>&|^~?:]/.test(code[j])) j++;
        tokens.push({ type: 'op', text: code.slice(i, j) });
        i = j;
      } else if (c === '@') {
        let j = i + 1;
        while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++;
        tokens.push({ type: 'kw', text: code.slice(i, j) });
        i = j;
      } else {
        tokens.push({ type: 'plain', text: c });
        i++;
      }
    }
    return tokens.map(t => span(t.type, t.text)).join('');
  }

  // ---------- Bash tokenizer (safe, token-order based) ----------
  function tokenizeBash(code) {
    const tokens = [];
    let i = 0;
    const len = code.length;

    while (i < len) {
      const c = code[i];
      if (c === '#') {
        tokens.push({ type: 'cm', text: code.slice(i) });
        break;
      } else if (c === '"' || c === "'") {
        const q = c;
        let j = i + 1;
        while (j < len && code[j] !== q) {
          if (code[j] === '\\') j++;
          j++;
        }
        if (j < len && code[j] === q) j++;
        tokens.push({ type: 'str', text: code.slice(i, j) });
        i = j;
      } else if (c === '$') {
        let j = i + 1;
        if (code[j] === '{') {
          j++;
          while (j < len && /[a-zA-Z0-9_}]/.test(code[j])) j++;
          if (j < len && code[j] === '}') j++;
        } else {
          while (j < len && /[a-zA-Z0-9_]/.test(code[j])) j++;
        }
        tokens.push({ type: 'op', text: code.slice(i, j) });
        i = j;
      } else if (/[a-zA-Z0-9_.\/+-]/.test(c)) {
        let j = i;
        while (j < len && /[a-zA-Z0-9_.\/+-]/.test(code[j])) j++;
        const prev = tokens[tokens.length - 1];
        const lastText = prev ? prev.text : '';
        const atCommand = !prev || /(^|[;|&])\s*$/.test(lastText);
        tokens.push({ type: atCommand ? 'fn' : 'plain', text: code.slice(i, j) });
        i = j;
      } else if (/[;|&><]/.test(c)) {
        let j = i;
        while (j < len && /[;|&><]/.test(code[j])) j++;
        tokens.push({ type: 'op', text: code.slice(i, j) });
        i = j;
      } else {
        tokens.push({ type: 'plain', text: c });
        i++;
      }
    }
    return tokens.map(t => span(t.type, t.text)).join('');
  }

  // ---------- TOML tokenizer ----------
  function highlightToml(code) {
    const lines = code.split('\n');
    return lines.map(line => {
      const trimmed = line.trimStart();
      const indent = line.slice(0, line.length - trimmed.length);
      if (/^\[.*\]$/.test(trimmed)) {
        return esc(line);
      }
      let i = 0;
      let out = '';
      const len = trimmed.length;
      while (i < len) {
        const c = trimmed[i];
        if (c === '#') {
          out += span('cm', trimmed.slice(i));
          break;
        } else if (c === '"' || c === "'") {
          const q = c;
          let j = i + 1;
          while (j < len && trimmed[j] !== q) {
            if (trimmed[j] === '\\') j++;
            j++;
          }
          if (j < len && trimmed[j] === q) j++;
          out += span('str', trimmed.slice(i, j));
          i = j;
        } else if (/[a-zA-Z0-9_]/.test(c)) {
          let j = i;
          while (j < len && /[a-zA-Z0-9_]/.test(trimmed[j])) j++;
          const word = trimmed.slice(i, j);
          const rest = trimmed.slice(j);
          if (/^\s*=/.test(rest)) {
            out += span('tp', word);
          } else {
            out += esc(word);
          }
          i = j;
        } else if (c === '[') {
          out += `<span class="kw">${esc(trimmed.slice(i))}</span>`;
          break;
        } else if (c === '=') {
          out += '<span class="op">=</span>';
          i++;
        } else {
          out += esc(c);
          i++;
        }
      }
      return indent + out;
    }).join('\n');
  }

  function highlightCodeBlocks() {
    document.querySelectorAll('pre code').forEach(block => {
      if (block.dataset.highlighted) return;
      block.dataset.highlighted = 'true';

      let code = block.textContent;
      let highlighted;
      const cls = block.className;

      if (cls.includes('lang-ngs') || cls.includes('language-ngs')) {
        highlighted = highlightNgs(code);
      } else if (cls.includes('lang-bash') || cls.includes('language-bash') ||
                 cls.includes('lang-sh') || cls.includes('language-sh')) {
        highlighted = tokenizeBash(code);
      } else if (cls.includes('lang-toml') || cls.includes('language-toml')) {
        highlighted = highlightToml(code);
      } else if (cls.includes('lang-c') || cls.includes('language-c')) {
        highlighted = esc(code);
      } else {
        highlighted = esc(code);
      }

      block.innerHTML = highlighted;
    });
  }

  // ---------- Copy buttons ----------
  // code-header 内の copy-btn に、直後の pre > code の内容をコピーする動作を付与する。
  // pre への直接追加は行わない（code-header が UI の唯一のコピーボタン）。
  function addCopyButtons() {
    document.querySelectorAll('.code-header').forEach(header => {
      const btn = header.querySelector('.copy-btn');
      if (!btn || btn.dataset.copyReady) return;
      btn.dataset.copyReady = 'true';

      // .code-header の直後の兄弟 pre を探す
      const pre = header.nextElementSibling;
      if (!pre || pre.tagName !== 'PRE') return;

      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const span = btn.querySelector('span');
          if (span) {
            span.textContent = 'Copied!';
            setTimeout(() => { span.textContent = 'Copy'; }, 2000);
          } else {
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
          }
        });
      });
    });
  }

  function updateThemeIcon(theme) {
    const moon = document.querySelector('.theme-toggle .icon-moon');
    const sun = document.querySelector('.theme-toggle .icon-sun');
    if (moon && sun) {
      if (theme === 'dark') {
        moon.style.display = 'none';
        sun.style.display = 'inline-block';
      } else {
        moon.style.display = 'inline-block';
        sun.style.display = 'none';
      }
    }
  }

  function initTheme() {
    const saved = localStorage.getItem('nagiscript-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
    return theme;
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('nagiscript-theme', next);
    updateThemeIcon(next);
  }

  // ---------- Sidebar & Mobile Menu ----------
  function initSidebar() {
    const toggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const headerNav = document.querySelector('.header-nav');

    if (toggle) {
      toggle.addEventListener('click', () => {
        if (sidebar) sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
        if (headerNav && !sidebar) headerNav.classList.toggle('open'); // Home用
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.endsWith(href.replace(/^\.\.?\/?/, ''))) {
        link.classList.add('active');
      }
    });
  }

  // ---------- Search ----------
  function initSearch() {
    const input = document.querySelector('.search-box input');
    if (!input) return;

    const pages = [
      { title: 'はじめに', url: 'docs/getting-started.html', keywords: 'install getting started setup インストール' },
      { title: '基本概念', url: 'docs/tutorial/basics.html', keywords: 'variables types control 変数 型' },
      { title: '関数とモジュール', url: 'docs/tutorial/functions.html', keywords: 'function module import export' },
      { title: '構造体と列挙型', url: 'docs/tutorial/structs-enums.html', keywords: 'struct enum pattern match' },
      { title: 'ジェネリクス', url: 'docs/tutorial/generics.html', keywords: 'generic monomorphization' },
      { title: 'エラーハンドリング', url: 'docs/tutorial/error-handling.html', keywords: 'error result option panic' },
      { title: 'メモリ管理', url: 'docs/tutorial/memory.html', keywords: 'memory rc reference count unsafe' },
      { title: '型システム', url: 'docs/reference/types.html', keywords: 'type system primitives' },
      { title: '構文リファレンス', url: 'docs/reference/syntax.html', keywords: 'syntax reference' },
      { title: '演算子', url: 'docs/reference/operators.html', keywords: 'operators precedence' },
      { title: '標準ライブラリ', url: 'docs/reference/standard-library.html', keywords: 'standard library std' },
      { title: 'キーワード一覧', url: 'docs/reference/keywords.html', keywords: 'keywords reserved' },
      { title: 'Wasm チュートリアル', url: 'docs/tutorial/webassembly.html', keywords: 'wasm webassembly react' },
      { title: 'ブラウザアプリ', url: 'docs/tutorial/browser-app.html', keywords: 'browser wasm dom ui gui ブラウザ アプリ' },
      { title: 'TUI アプリ', url: 'docs/tutorial/tui-app.html', keywords: 'tui terminal ansi interface ターミナル' },
      { title: 'CLI ツール開発', url: 'docs/tutorial/cli.html', keywords: 'cli command line' },
      { title: 'C言語相互運用', url: 'docs/tutorial/cinterop.html', keywords: 'c interop extern' },
      { title: 'コンパイラ内部構造', url: 'docs/reference/compiler.html', keywords: 'compiler internals llvm' },
    ];

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = input.value.toLowerCase().trim();
        const match = pages.find(p =>
          p.title.toLowerCase().includes(q) || p.keywords.toLowerCase().includes(q)
        );
        if (match) window.location.href = match.url;
      }
    });
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initSidebar();
    initSearch();
    highlightCodeBlocks();
    addCopyButtons();

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });
})();