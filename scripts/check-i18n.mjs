import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function walk(dir, exts) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, exts));
    else if (exts.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hasKey(obj, dottedKey) {
  const parts = dottedKey.split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object" || !(p in cur)) return false;
    cur = cur[p];
  }
  return true;
}

function posFromIndex(text, index) {
  // 1-based line, 1-based column
  let line = 1;
  let lastLineStart = 0;
  for (let i = 0; i < index && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) {
      line++;
      lastLineStart = i + 1;
    }
  }
  return { line, col: index - lastLineStart + 1 };
}

/**
 * Collect translation function bindings like:
 *   const t = useTranslations("home")
 *   const t = useTranslations()
 *
 * Returns Map<fnName, namespace|null> where null means "root".
 */
function collectUseTranslationsBindings(source) {
  const bindings = new Map();
  const re =
    /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*useTranslations\s*\(\s*(?:["'`](.*?)["'`])?\s*\)/g;
  for (const m of source.matchAll(re)) {
    const fnName = m[1];
    const ns = m[2] != null && m[2].length > 0 ? m[2] : null;
    bindings.set(fnName, ns);
  }
  return bindings;
}

/**
 * Find calls like:
 *   t("key")
 *   t.raw("key")
 *   t.rich("key")
 * Only string-literal keys are checked.
 */
function collectCalls(source, bindings) {
  const calls = [];
  for (const [fnName, ns] of bindings) {
    const callRe = new RegExp(
      String.raw`(^|[^\w$])${fnName}\s*(?:\.(raw|rich))?\s*\(\s*["'\`]([^"'\`]+)["'\`]`,
      "gm"
    );
    for (const m of source.matchAll(callRe)) {
      const key = m[3];
      // Ignore template-ish keys accidentally captured from non-literal usage.
      if (key.includes("${")) continue;
      const idx = m.index ?? 0;
      calls.push({ fnName, ns, key, index: idx });
    }
  }
  return calls;
}

function makeFullKey(ns, key) {
  // next-intl allows nested keys with dots even within a namespace.
  // Full key in message JSON is:
  // - ns === null => key
  // - else => `${ns}.${key}`
  if (ns == null) return key;
  return `${ns}.${key}`;
}

const srcDir = path.join(projectRoot, "src");
const messagesDir = path.join(projectRoot, "messages");

const messageFiles = fs
  .readdirSync(messagesDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.join(messagesDir, f))
  .filter((fp) => !fp.endsWith("ar-string-map.json"));

const locales = messageFiles.map((fp) => path.basename(fp, ".json"));
const messagesByLocale = Object.fromEntries(locales.map((l, i) => [l, readJson(messageFiles[i])]));

function flattenKeys(obj, prefix = "") {
  const out = [];
  if (obj == null || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v)) out.push(...flattenKeys(v, next));
    else out.push(next);
  }
  return out;
}

// Use zh as primary for suggestions if present, else first locale.
const suggestionLocale = locales.includes("zh") ? "zh" : locales[0];
const allKnownKeys = new Set(flattenKeys(messagesByLocale[suggestionLocale]));
const allKnownKeysArr = Array.from(allKnownKeys);

function suggestPaths(key) {
  const suffix = `.${key}`;
  const candidates = allKnownKeysArr.filter((k) => k === key || k.endsWith(suffix));
  // Prefer shorter (closer) paths first.
  candidates.sort((a, b) => a.split(".").length - b.split(".").length || a.localeCompare(b));
  return candidates.slice(0, 5);
}

const codeFiles = walk(srcDir, [".ts", ".tsx", ".js", ".jsx"]);

const missing = [];
let totalCalls = 0;

for (const filePath of codeFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const bindings = collectUseTranslationsBindings(source);
  if (bindings.size === 0) continue;

  const calls = collectCalls(source, bindings);
  if (calls.length === 0) continue;

  for (const c of calls) {
    totalCalls++;
    const fullKey = makeFullKey(c.ns, c.key);
    const missingLocales = locales.filter((loc) => !hasKey(messagesByLocale[loc], fullKey));
    if (missingLocales.length > 0) {
      const pos = posFromIndex(source, c.index);
      missing.push({
        file: path.relative(projectRoot, filePath).replaceAll("\\", "/"),
        line: pos.line,
        col: pos.col,
        fn: c.fnName,
        ns: c.ns,
        key: c.key,
        fullKey,
        missingLocales,
        suggestions: suggestPaths(c.key)
      });
    }
  }
}

missing.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));

const summary = {
  locales,
  scannedFiles: codeFiles.length,
  translationCallsChecked: totalCalls,
  missingCount: missing.length
};

console.log(JSON.stringify({ summary, missing }, null, 2));

if (missing.length > 0) process.exitCode = 2;

