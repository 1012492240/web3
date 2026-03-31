import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const messagesDir = path.join(projectRoot, "messages");

const BASE_LOCALE = "zh";
const IGNORE_FILES = new Set(["ar-string-map.json"]);

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function walkLeaves(node, prefix = "") {
  const out = [];
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean" || node == null) {
    out.push({ key: prefix, value: node });
    return out;
  }
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      out.push(...walkLeaves(node[i], prefix ? `${prefix}.${i}` : String(i)));
    }
    return out;
  }
  if (isPlainObject(node)) {
    for (const [k, v] of Object.entries(node)) {
      out.push(...walkLeaves(v, prefix ? `${prefix}.${k}` : k));
    }
    return out;
  }
  return out;
}

function getByDottedKey(obj, dottedKey) {
  if (!dottedKey) return obj;
  const parts = dottedKey.split(".").filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const idx = Number(p);
      if (!Number.isInteger(idx) || idx < 0 || idx >= cur.length) return undefined;
      cur = cur[idx];
      continue;
    }
    if (!isPlainObject(cur) || !(p in cur)) return undefined;
    cur = cur[p];
  }
  return cur;
}

function containsCJK(text) {
  if (typeof text !== "string") return false;
  return /[\u3400-\u9FFF]/.test(text);
}

function normalizeString(s) {
  return typeof s === "string" ? s.trim() : s;
}

const files = fs
  .readdirSync(messagesDir)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => !IGNORE_FILES.has(f));

if (!files.includes(`${BASE_LOCALE}.json`)) {
  console.error(`Missing base locale file: ${BASE_LOCALE}.json`);
  process.exit(1);
}

const base = readJson(path.join(messagesDir, `${BASE_LOCALE}.json`));
const baseLeaves = walkLeaves(base).filter((x) => typeof x.value === "string");

const locales = files.map((f) => path.basename(f, ".json"));
const targets = locales.filter((l) => l !== BASE_LOCALE);

const report = {
  baseLocale: BASE_LOCALE,
  locales: targets.sort(),
  generatedAt: new Date().toISOString(),
  summary: {},
  issues: {},
};

for (const locale of targets) {
  const obj = readJson(path.join(messagesDir, `${locale}.json`));
  const issues = [];
  for (const { key, value: zhValue } of baseLeaves) {
    const cur = getByDottedKey(obj, key);
    if (typeof cur !== "string") continue;

    const curNorm = normalizeString(cur);
    const zhNorm = normalizeString(zhValue);

    const sameAsZh = curNorm === zhNorm;

    // Heuristic: for non-Chinese locales, Chinese characters may indicate a placeholder.
    // Note: Japanese/Korean can legitimately contain CJK (kanji/hanja), so treat only as advisory.
    const localeIsChinese = locale === "zh" || locale === "zh-Hant";
    const hasCJK = !localeIsChinese && containsCJK(cur);

    if (sameAsZh || hasCJK) {
      issues.push({
        key,
        reason: sameAsZh ? "same_as_zh" : "contains_cjk",
        value: cur,
      });
    }
  }

  report.issues[locale] = issues;
  report.summary[locale] = {
    totalChecked: baseLeaves.length,
    flagged: issues.length,
    sameAsZh: issues.filter((x) => x.reason === "same_as_zh").length,
    containsCJK: issues.filter((x) => x.reason === "contains_cjk").length,
  };
}

const outPath = path.join(projectRoot, "i18n-translation-audit.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(
  JSON.stringify(
    {
      outPath: path.relative(projectRoot, outPath).replaceAll("\\", "/"),
      locales: report.locales,
      summary: report.summary,
    },
    null,
    2
  )
);

