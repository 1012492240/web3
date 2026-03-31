const fs = require("node:fs");
const path = require("node:path");

// Uses devDependency: @vitalets/google-translate-api
const { translate } = require("@vitalets/google-translate-api");

const projectRoot = process.cwd();
const messagesDir = path.join(projectRoot, "messages");
const baseLocale = "zh";

const LOCALE_TO_TRANSLATE_TO = {
  en: "en",
  ja: "ja",
  ko: "ko",
  vi: "vi",
  ar: "ar",
  "zh-Hant": "zh-TW",
};

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

function writeJson(fp, obj) {
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function protectPlaceholders(text) {
  // Protect ICU-like placeholders: {name}, {balance}, {level}
  const vars = [];
  const out = text.replace(/\{[^}]+\}/g, (m) => {
    const token = `__VAR_${vars.length}__`;
    vars.push(m);
    return token;
  });
  return { text: out, vars };
}

function restorePlaceholders(text, vars) {
  let out = text;
  for (let i = 0; i < vars.length; i++) {
    out = out.replaceAll(`__VAR_${i}__`, vars[i]);
  }
  return out;
}

function splitByTags(text) {
  // Keep simple HTML-ish tags intact: <span ...>, </span>, <pink>, </pink>, <strong>...
  // Returns array of {type:'tag'|'text', value}
  const parts = [];
  const re = /(<[^>]+>)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    const idx = m.index;
    if (idx > last) parts.push({ type: "text", value: text.slice(last, idx) });
    parts.push({ type: "tag", value: m[1] });
    last = idx + m[1].length;
  }
  if (last < text.length) parts.push({ type: "text", value: text.slice(last) });
  return parts;
}

async function translateTextPreserving(text, to) {
  if (!text || typeof text !== "string") return text;

  // Skip if no non-whitespace.
  if (!text.trim()) return text;

  // Protect placeholders like {balance}
  const { text: protectedText, vars } = protectPlaceholders(text);

  // Preserve tags by translating only text chunks.
  const parts = splitByTags(protectedText);

  // If no text parts, return as-is.
  if (!parts.some((p) => p.type === "text" && p.value.trim())) {
    return restorePlaceholders(protectedText, vars);
  }

  const translatedParts = [];
  for (const p of parts) {
    if (p.type === "tag" || !p.value.trim()) {
      translatedParts.push(p.value);
      continue;
    }

    // Translate each chunk. Keep line breaks stable.
    const chunk = p.value;
    const res = await translate(chunk, { to });
    translatedParts.push(res.text);

    // Gentle rate limit.
    await sleep(120);
  }

  const joined = translatedParts.join("");
  return restorePlaceholders(joined, vars);
}

async function walkAndTranslate({ baseNode, targetNode, to, pathParts, stats }) {
  if (typeof baseNode === "string") {
    // Only translate if target is missing or equals base (i.e., still a zh placeholder).
    const targetIsString = typeof targetNode === "string";
    const shouldTranslate = !targetIsString || targetNode === baseNode;

    if (!shouldTranslate) return targetNode;

    // Keep brand/product tokens stable by relying on tag/placeholder protection.
    const translated = await translateTextPreserving(baseNode, to);
    stats.translated++;
    return translated;
  }

  if (Array.isArray(baseNode)) {
    // Translate arrays element-wise, aligning indices
    const out = Array.isArray(targetNode) ? [...targetNode] : [];
    for (let i = 0; i < baseNode.length; i++) {
      out[i] = await walkAndTranslate({
        baseNode: baseNode[i],
        targetNode: out[i],
        to,
        pathParts: pathParts.concat(String(i)),
        stats,
      });
    }
    return out;
  }

  if (isPlainObject(baseNode)) {
    const out = isPlainObject(targetNode) ? { ...targetNode } : {};
    for (const [k, v] of Object.entries(baseNode)) {
      out[k] = await walkAndTranslate({
        baseNode: v,
        targetNode: out[k],
        to,
        pathParts: pathParts.concat(k),
        stats,
      });
    }
    return out;
  }

  // Numbers/booleans/null: just copy.
  return targetNode ?? baseNode;
}

async function main() {
  const basePath = path.join(messagesDir, `${baseLocale}.json`);
  const base = readJson(basePath);

  const files = fs
    .readdirSync(messagesDir)
    .filter((f) => f.endsWith(".json"))
    .filter((f) => f !== "ar-string-map.json");

  const updated = [];

  for (const file of files) {
    const locale = path.basename(file, ".json");
    if (locale === baseLocale) continue;
    if (!(locale in LOCALE_TO_TRANSLATE_TO)) continue;

    const to = LOCALE_TO_TRANSLATE_TO[locale];
    const fp = path.join(messagesDir, file);
    const cur = readJson(fp);

    const stats = { locale, to, translated: 0 };
    const next = await walkAndTranslate({
      baseNode: base,
      targetNode: cur,
      to,
      pathParts: [],
      stats,
    });

    writeJson(fp, next);
    updated.push(stats);

    // Slight pause between locales.
    await sleep(300);
  }

  console.log(JSON.stringify({ baseLocale, updated }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

