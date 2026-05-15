cd ~/GITHUB_WORK
mkdir -p devto-cli
cd devto-cli

cat > devtoctl.py <<'PY'
#!/usr/bin/env python3
import json
import os
import re
import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import certifi
except ImportError:
    certifi = None

BASE = "https://dev.to/api"
ACCEPT = "application/vnd.forem.api-v1+json"

def ctx():
    return ssl.create_default_context(cafile=certifi.where()) if certifi else None

def key():
    k = os.environ.get("DEVTO_API_KEY", "")
    if not k:
        raise SystemExit("DEVTO_API_KEY is not set.")
    return k

def request(method, path, payload=None, auth=True):
    headers = {
        "Accept": ACCEPT,
        "Content-Type": "application/json",
        "User-Agent": "TizWildinDevToCLI/1.0 (+https://github.com/GareBear99)",
    }
    if auth:
        headers["api-key"] = key()

    data = None
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        BASE + path,
        data=data,
        headers=headers,
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=45, context=ctx()) as res:
            raw = res.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"HTTP {e.code}: {body}")

def parse_md(path):
    text = Path(path).read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise SystemExit("Missing frontmatter.")
    raw, body = m.groups()
    meta = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        v = v.strip()
        if v.lower() == "true":
            v = True
        elif v.lower() == "false":
            v = False
        meta[k.strip()] = v
    return meta, body.strip()

def article_payload(path):
    meta, body = parse_md(path)
    tags = meta.get("tags", "")
    if isinstance(tags, str):
        tags = [t.strip() for t in tags.split(",") if t.strip()]
    return {
        "article": {
            "title": meta["title"],
            "published": bool(meta.get("published", False)),
            "body_markdown": body,
            "tags": tags,
            "canonical_url": meta.get("canonical_url"),
            "description": meta.get("description", ""),
        }
    }

def cmd_me():
    print(json.dumps(request("GET", "/users/me"), indent=2))

def cmd_list():
    data = request("GET", "/articles/me/all?per_page=1000")
    rows = []
    for a in data:
        rows.append({
            "id": a.get("id"),
            "published": bool(a.get("published_at")),
            "title": a.get("title"),
            "url": a.get("url"),
            "tags": a.get("tag_list") or a.get("tags"),
            "reactions": a.get("public_reactions_count"),
            "comments": a.get("comments_count"),
            "reading_time": a.get("reading_time_minutes"),
        })
    print(json.dumps(rows, indent=2))

def cmd_export():
    outdir = Path("export")
    outdir.mkdir(exist_ok=True)
    data = request("GET", "/articles/me/all?per_page=1000")
    (outdir / "articles.json").write_text(json.dumps(data, indent=2), encoding="utf-8")

    lines = [
        "# DEV.to Post Tracker",
        "",
        "Profile: https://dev.to/tizwildin",
        "",
        "| Status | Title | Tags | Reactions | Comments | URL |",
        "|---|---|---|---:|---:|---|",
    ]
    for a in data:
        status = "Published" if a.get("published_at") else "Draft"
        tags = ", ".join(a.get("tag_list") or a.get("tags") or [])
        lines.append(
            f"| {status} | {a.get('title','').replace('|','-')} | {tags} | "
            f"{a.get('public_reactions_count',0)} | {a.get('comments_count',0)} | {a.get('url','')} |"
        )
    (outdir / "DEVTO_POST_INDEX.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Wrote export/articles.json and export/DEVTO_POST_INDEX.md")

def cmd_publish(path):
    data = request("POST", "/articles", article_payload(path))
    print(json.dumps({
        "id": data.get("id"),
        "title": data.get("title"),
        "published_at": data.get("published_at"),
        "url": data.get("url"),
    }, indent=2))

def cmd_update(article_id, path):
    data = request("PUT", f"/articles/{article_id}", article_payload(path))
    print(json.dumps({
        "id": data.get("id"),
        "title": data.get("title"),
        "published_at": data.get("published_at"),
        "url": data.get("url"),
    }, indent=2))

def cmd_unpublish(article_id):
    data = request("PUT", f"/articles/{article_id}/unpublish")
    print(json.dumps(data, indent=2))

def cmd_public(username="tizwildin"):
    q = urllib.parse.urlencode({"username": username, "state": "all", "per_page": 1000})
    data = request("GET", f"/articles?{q}", auth=False)
    print(json.dumps(data, indent=2))

def usage():
    print("""Usage:
  ./devtoctl.py me
  ./devtoctl.py list
  ./devtoctl.py export
  ./devtoctl.py publish path/to/post.md
  ./devtoctl.py update ARTICLE_ID path/to/post.md
  ./devtoctl.py unpublish ARTICLE_ID
  ./devtoctl.py public [username]
""")
    raise SystemExit(2)

def main():
    if len(sys.argv) < 2:
        usage()
    cmd = sys.argv[1]
    if cmd == "me":
        cmd_me()
    elif cmd == "list":
        cmd_list()
    elif cmd == "export":
        cmd_export()
    elif cmd == "publish" and len(sys.argv) == 3:
        cmd_publish(sys.argv[2])
    elif cmd == "update" and len(sys.argv) == 4:
        cmd_update(sys.argv[2], sys.argv[3])
    elif cmd == "unpublish" and len(sys.argv) == 3:
        cmd_unpublish(sys.argv[2])
    elif cmd == "public":
        cmd_public(sys.argv[2] if len(sys.argv) > 2 else "tizwildin")
    else:
        usage()

if __name__ == "__main__":
    main()
PY

chmod +x devtoctl.py