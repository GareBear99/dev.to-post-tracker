import express from "express";
import { MongoClient } from "mongodb";

const PORT = Number(process.env.PORT || 8788);
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "tizwildin_syndication";
const ARCHIVE_WEBHOOK_TOKEN = process.env.ARCHIVE_WEBHOOK_TOKEN;

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "1mb" }));

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db(MONGODB_DB);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "devto-mongodb-archive-api" });
});

app.post("/archive", async (req, res) => {
  if (ARCHIVE_WEBHOOK_TOKEN) {
    const expected = `Bearer ${ARCHIVE_WEBHOOK_TOKEN}`;
    if (req.get("authorization") !== expected) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
  }

  const payload = req.body || {};
  const receipt = payload.receipt || {};
  const article = receipt.article || {};
  const now = new Date();

  if (!article.url) {
    return res.status(400).json({ ok: false, error: "Missing receipt.article.url" });
  }

  await db.collection("articles").updateOne(
    { url: article.url },
    {
      $set: {
        ...article,
        updated_at: now
      },
      $setOnInsert: {
        created_at: now
      }
    },
    { upsert: true }
  );

  const receiptDoc = {
    provider: payload.provider || "mongodb-atlas-collector",
    source: payload.source || "unknown",
    article,
    targets: receipt.targets || [],
    context: receipt.context || {},
    processedAt: receipt.processedAt || now.toISOString(),
    created_at: now
  };

  const inserted = await db.collection("receipts").insertOne(receiptDoc);

  const targetRows = (receipt.targets || []).map((targetResult) => ({
    article_url: article.url,
    article_title: article.title || null,
    target: targetResult.target,
    lane: targetResult.mode || inferLane(targetResult.target),
    status: targetResult.ok ? "ok" : "failed",
    result: targetResult,
    receipt_id: inserted.insertedId,
    created_at: now
  }));

  if (targetRows.length) {
    await db.collection("target_results").insertMany(targetRows);
  }

  const discoveryRows = targetRows
    .filter((row) => row.lane === "discovery_checklist")
    .map((row) => ({
      article_url: row.article_url,
      article_title: row.article_title,
      target: row.target,
      status: "todo",
      result: row.result,
      created_at: now,
      updated_at: now
    }));

  if (discoveryRows.length) {
    await db.collection("discovery_tasks").insertMany(discoveryRows);
  }

  const draftRows = targetRows
    .filter((row) => row.lane === "draft_only")
    .map((row) => ({
      article_url: row.article_url,
      article_title: row.article_title,
      target: row.target,
      status: "needs_manual_approval",
      draft: row.result?.draft || null,
      created_at: now,
      updated_at: now
    }));

  if (draftRows.length) {
    await db.collection("draft_tasks").insertMany(draftRows);
  }

  res.json({ ok: true, receipt_id: inserted.insertedId, targets: targetRows.length });
});

function inferLane(target) {
  if (["libhunt", "saashub", "alternativeto", "awesome_lists"].includes(target)) return "discovery_checklist";
  if (["reddit", "facebook", "linkedin", "github_discussion", "hacker_news"].includes(target)) return "draft_only";
  return "auto_post";
}

app.listen(PORT, () => {
  console.log(`Archive API listening on :${PORT}`);
});
