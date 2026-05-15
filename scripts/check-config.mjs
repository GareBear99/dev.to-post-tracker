import { readFileSync, existsSync } from "node:fs";

const required = [
  "README.md",
  "CHANGELOG.md",
  "wrangler.toml",
  "cloudflare-worker/src/index.js",
  "docs/CLOUDFLARE_AUTOPOSTER_PLAN.md",
  "docs/SYNDICATION_TARGETS.md",
  "docs/LIBHUNT_AND_DISCOVERY_LANE.md",
  "docs/MONGODB_ATLAS_ARCHIVE_LAYER.md",
  "data/syndication-targets.json",
  "data/schemas/mongodb-receipt.schema.json",
  "server/mongodb-archive-api/src/index.js"
];

let ok = true;
for (const file of required) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    ok = false;
  }
}

const worker = readFileSync("cloudflare-worker/src/index.js", "utf8");
for (const term of ["mastodon", "discord", "telegram", "libhunt", "scheduled", "STATE", "ARCHIVE_WEBHOOK_URL", "archiveReceiptIfEnabled"]) {
  if (!worker.includes(term)) {
    console.error(`Worker missing expected term: ${term}`);
    ok = false;
  }
}

const targets = JSON.parse(readFileSync("data/syndication-targets.json", "utf8"));
for (const key of ["mastodon", "bluesky", "discord", "telegram", "libhunt", "mongodb_atlas"]) {
  if (!targets.targets[key]) {
    console.error(`Target matrix missing: ${key}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log("Config/docs check passed.");
