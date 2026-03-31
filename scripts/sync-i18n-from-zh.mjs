import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const messagesDir = path.join(projectRoot, "messages");
const baseLocale = "zh";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function deepMergeMissing(target, base) {
  // Fill only missing keys from base into target.
  if (!isPlainObject(base)) return target;
  const out = isPlainObject(target) ? { ...target } : {};
  for (const [k, v] of Object.entries(base)) {
    if (!(k in out)) {
      out[k] = v;
      continue;
    }
    if (isPlainObject(out[k]) && isPlainObject(v)) {
      out[k] = deepMergeMissing(out[k], v);
    }
  }
  return out;
}

const files = fs
  .readdirSync(messagesDir)
  .filter((f) => f.endsWith(".json"))
  .filter((f) => f !== "ar-string-map.json");

if (!files.includes(`${baseLocale}.json`)) {
  console.error(`Base locale file missing: ${baseLocale}.json`);
  process.exit(1);
}

const base = readJson(path.join(messagesDir, `${baseLocale}.json`));

const results = [];
for (const f of files) {
  const locale = path.basename(f, ".json");
  if (locale === baseLocale) continue;
  const fp = path.join(messagesDir, f);
  const cur = readJson(fp);
  const merged = deepMergeMissing(cur, base);
  if (JSON.stringify(cur) !== JSON.stringify(merged)) {
    writeJson(fp, merged);
    results.push(locale);
  }
}

console.log(
  JSON.stringify(
    {
      baseLocale,
      updatedLocales: results.sort(),
      updatedCount: results.length,
    },
    null,
    2
  )
);

