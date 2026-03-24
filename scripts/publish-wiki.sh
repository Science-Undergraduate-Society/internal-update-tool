#!/bin/bash
# Publishes wiki pages to the GitHub wiki repo.
# Run from the repo root: bash scripts/publish-wiki.sh

set -e

WIKI_REPO="https://github.com/Science-Undergraduate-Society/internal-update-tool.wiki.git"
tmpdir=$(mktemp -d)

echo "Cloning wiki..."
git clone "$WIKI_REPO" "$tmpdir"

# ─── Home ────────────────────────────────────────────────────────────────────
cat > "$tmpdir/Home.md" << 'EOF'
# SUS Internal Update Tool — Wiki

Welcome to the internal documentation for the SUS Internal Update Tool.

## Pages

- [[Website Workflow]] — How submissions flow from staff → review → live site
- [[Caching]] — How the public site caches content and when it refreshes
- [[How Preview Works]] — How the Preview button works on submission and review pages

---

For general usage (signing in, submitting, reviewing), see the [README](../blob/main/README.md).
EOF

# ─── Website Workflow ─────────────────────────────────────────────────────────
cat > "$tmpdir/Website-Workflow.md" << 'EOF'
# Website Workflow

## Submission → Live flow

```
Staff submits on /submission
        ↓
Written to Firestore "submissions" collection
(status: pending)
        ↓
Reviewer approves on /review
        ↓
Document written to live collection
(e.g. "events", "clubs", "tutors")
        ↓
/api/revalidate called on susubc.ca
        ↓
Updated content is live
```

## Firestore collections

| Collection | Contents |
|---|---|
| `submissions` | Pending changes awaiting review |
| `events` | Live approved events |
| `initiatives` | Live approved initiatives |
| `clubs` | Live approved club listings |
| `tutors` | Live approved tutor listings |
| `pantry` | Live pantry updates |

## Event fields

Events are stored with the following fields:

| Field | Type | Notes |
|---|---|---|
| `type` | `"event"` \| `"initiative"` | Required — items missing this field are not displayed |
| `title` | string | |
| `date` | string | Format: `YYYY-MM-DD` |
| `time` | string | Format: `HH:MM` (24hr) |
| `location` | string | Optional |
| `description` | string | |
| `link` | string | Registration or info URL |
| `image` | string | Image URL |
| `isFeatured` | boolean | If `true`, appears in the Upcoming Events section on the public site |

## Authentication & roles

- Any `@sus.ubc.ca` email can sign in and submit updates
- The **Review** page is restricted to:
  - `vpcommunications@sus.ubc.ca`
  - `avpcommunications@sus.ubc.ca`
  - `webdeveloper@sus.ubc.ca`
- Role is derived from the username portion of the email
EOF

# ─── Caching ──────────────────────────────────────────────────────────────────
cat > "$tmpdir/Caching.md" << 'EOF'
# Caching

## How the public site stays fast

susubc.ca uses **Next.js ISR (Incremental Static Regeneration)**. Pages are rendered once and served as static HTML — Firebase is not queried on every visitor request.

## When the cache refreshes

There are two ways the cache gets invalidated:

### 1. On approval (on-demand)
When a reviewer approves a submission in the internal tool, it immediately calls the public site's `/api/revalidate` endpoint. This invalidates the relevant cached page so the very next visitor gets updated content.

### 2. Weekly fallback
Pages are configured with `revalidate = 604800` (one week). If for some reason the on-demand revalidation didn't fire, the cache will still refresh on its own within a week.

## What this means in practice

- Visitors always get fast static pages — no Firebase reads per request
- After an approval, the site updates within one page load
- If the revalidation call fails (e.g. network issue), content will still update within a week
EOF

# ─── How Preview Works ────────────────────────────────────────────────────────
cat > "$tmpdir/How-Preview-Works.md" << 'EOF'
# How Preview Works

## Overview

The **Preview** button appears on the Submission and Review pages for events and initiatives. It lets you see exactly how an item will look on the public site before approving it, without needing to publish it first.

## What it does

Clicking Preview opens a modal with an iframe. The iframe loads a special page on the public site (`/preview/events`) with the submission's data passed as URL query parameters. The public site renders the real event component using that data, so the preview reflects the actual styles and layout.

## Preview modes (events only)

| Tab | What it shows |
|---|---|
| **Current Month** | How the event appears in the main monthly events section |
| **Upcoming** | How it appears in the Upcoming Events section |
| **As Initiative** | How it would look if rendered as an initiative |

For initiatives, only the **Initiative** tab is shown.

## How the URL is built

The preview URL looks like:

```
https://susubc.ca/preview/events?mode=current&title=...&date=...&description=...
```

Each field (title, description, date, time, location, link, image) is appended as a query parameter. The `mode` parameter controls which component variant is rendered.

## Where it's used

- **Submission page** — preview your own submission before sending it for review
- **Review page** — reviewers can preview a submission before approving or rejecting it
EOF

# ─── Push ─────────────────────────────────────────────────────────────────────
cd "$tmpdir"
git add Home.md Website-Workflow.md Caching.md How-Preview-Works.md
git commit -m "Update wiki: workflow, caching, preview docs"
git push

echo "Wiki updated successfully."
rm -rf "$tmpdir"
