# SUS Internal Update Tool

A web tool for SUS staff to submit and review updates to the public SUS website (susubc.ca).

---

## Signing In

1. Go to the tool and enter your **@sus.ubc.ca email address**.
2. You will receive a **sign-in link** from Firebase (sent from `noreply@internal-updates-f2609.firebaseapp.com`). Check your inbox — it may land in spam the first time.
3. Click the link in the email. You will be signed in automatically and redirected to the dashboard.

- Add `noreply@internal-updates-f2609.firebaseapp.com` to your whitelist to avoid checking spam in the future.

> The link expires after a short time. If it has expired, go back to the login page and request a new one.

---

## Submitting a New Update

1. Navigate to the **Submission** page from the navbar.
2. Select a **category** from the dropdown:
   - **Events** — upcoming SUS events
   - **Initiatives** — ongoing SUS programs (no fixed date)
   - **Clubs** — sponsored science clubs
   - **Tutors** — SUS tutors and the courses they teach
   - **Pantry** — pantry-related updates
3. Fill in the relevant fields and click **Submit**.
4. Your submission is sent to the review queue. You will see a confirmation screen once it is submitted.

> Submissions do not appear on the public website immediately — they must be reviewed and approved first.

### Event-specific fields

When submitting an **Event**, you have two additional options:

- **Featured in Upcoming Events** — check this box to have the event appear in the "Upcoming Events" section on the public Events & Initiatives page, in addition to its regular placement. Useful for highlighting events that are coming up soon.

---

## Editing or Deleting an Existing Item

1. Go to the **Dashboard** page.
2. Select a category using the dropdown to browse current live items.
3. To **edit** an item, click the **Edit** button. You will be taken to the Submission page with the fields pre-filled. Make your changes and click **Submit for Review**. The existing item stays live until the edit is approved.
4. To **delete** an item, click the **Delete** button. A deletion request will be sent to the review queue. The item stays live until the deletion is approved.

> Items with a pending edit show a yellow **Edit Pending Review** banner.
> Items with a pending deletion show a red **Deletion Pending Review** banner and the Delete button is disabled until it is resolved.

---

## Review Page (VP Communications, AVP Communications, Web Developer only)

The **Review** tab is only visible to accounts with an approved role. If you do not see it, your account does not have review access.

1. Navigate to the **Review** page.
2. Each pending submission is shown with a colour-coded banner:
   - **New Submission** — a brand new item to be added
   - **Edit Request** — a proposed change to an existing item
   - **Deletion Request** — a request to remove an existing item
3. Click **Approve** to publish the change to the live website. The public site will update automatically.
4. Click **Reject** to discard the submission. The existing live content is left unchanged.

### Preview

On the Submission and Review pages, events and initiatives have a **Preview** button. Clicking it opens a modal with an iframe showing exactly how the item will look on the public site.

For events, there are three preview tabs:
- **Current Month** — how it appears in the main events section
- **Upcoming** — how it appears in the Upcoming Events section
- **As Initiative** — how it would look if treated as an initiative

The preview loads the public site's `/preview/events` page with the submission data passed as query parameters, so it reflects the real component styles without needing the item to be live first.

---

## How It Works

### Submission flow

```
Staff submits → Firestore "submissions" collection (status: pending)
                        ↓
              Reviewer approves on /review
                        ↓
         Document written to live collection
         (e.g. "events", "clubs", "tutors")
                        ↓
         Public site revalidated via /api/revalidate
                        ↓
         susubc.ca shows updated content
```

### Firebase collections

| Collection | Contents |
|---|---|
| `submissions` | Pending changes waiting for review |
| `events` | Live approved events |
| `initiatives` | Live approved initiatives |
| `clubs` | Live approved club listings |
| `tutors` | Live approved tutor listings |
| `pantry` | Live pantry updates |

### How the public site stays fast

The public site (susubc.ca) uses **Next.js ISR (Incremental Static Regeneration)**. Pages are built once and cached as static HTML. Firebase is only read when the cache is refreshed — not on every visitor request.

When a reviewer approves a submission, the tool calls the public site's `/api/revalidate` endpoint, which immediately invalidates the relevant cached page so the next visitor gets the updated content. Outside of approvals, pages fall back to a weekly revalidation schedule.

### Authentication

- Any `@sus.ubc.ca` email can sign in via Firebase email link authentication
- Access to the **Review** page is restricted to: `vpcommunications`, `avpcommunications`, `webdeveloper`
- Role is determined by the username portion of the email (e.g. `webdeveloper@sus.ubc.ca` → role `webdeveloper`)

---

## Notes

- All changes go through review before appearing on the public website.
- If you have any issues signing in or using the tool, contact **webdeveloper@sus.ubc.ca** or the webdev team on Slack.
