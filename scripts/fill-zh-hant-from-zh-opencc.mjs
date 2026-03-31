import fs from "node:fs";
import path from "node:path";
import * as opencc from "opencc-js";

const projectRoot = process.cwd();
const messagesDir = path.join(projectRoot, "messages");

const zhPath = path.join(messagesDir, "zh.json");
const zhHantPath = path.join(messagesDir, "zh-Hant.json");

function readJson(fp) {
  return JSON.parse(fs.readFileSync(fp, "utf8"));
}

function writeJson(fp, obj) {
  fs.writeFileSync(fp, JSON.stringify(obj, null, 2) + "\n", "utf8");
}

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function deepFillConverted({ baseZh, targetZhHant, currentZhHant, converter, stats }) {
  if (typeof baseZh === "string") {
    // Only overwrite if current equals zh exactly (i.e., placeholder leak).
    if (typeof currentZhHant === "string" && currentZhHant === baseZh) {
      stats.updated++;
      return converter(baseZh);
    }
    return currentZhHant ?? targetZhHant ?? converter(baseZh);
  }

  if (Array.isArray(baseZh)) {
    const out = Array.isArray(currentZhHant) ? [...currentZhHant] : [];
    for (let i = 0; i < baseZh.length; i++) {
      out[i] = deepFillConverted({
        baseZh: baseZh[i],
        targetZhHant: Array.isArray(targetZhHant) ? targetZhHant[i] : undefined,
        currentZhHant: out[i],
        converter,
        stats,
      });
    }
    return out;
  }

  if (isPlainObject(baseZh)) {
    const out = isPlainObject(currentZhHant) ? { ...currentZhHant } : {};
    for (const [k, v] of Object.entries(baseZh)) {
      out[k] = deepFillConverted({
        baseZh: v,
        targetZhHant: isPlainObject(targetZhHant) ? targetZhHant[k] : undefined,
        currentZhHant: out[k],
        converter,
        stats,
      });
    }
    return out;
  }

  return currentZhHant ?? targetZhHant ?? baseZh;
}

async function main() {
  const zh = readJson(zhPath);
  const zhHant = readJson(zhHantPath);

  // Simplified Chinese -> Traditional Chinese (Taiwan) conversion
  const converter = opencc.Converter({ from: "cn", to: "tw" });
  const convert = (text) => converter(text);

  const stats = { updated: 0 };
  const next = deepFillConverted({
    baseZh: zh,
    targetZhHant: zhHant,
    currentZhHant: zhHant,
    converter: convert,
    stats,
  });

  writeJson(zhHantPath, next);
  console.log(JSON.stringify({ updated: stats.updated, file: "messages/zh-Hant.json" }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

