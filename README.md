# Tech Care — website

Website for **Tech Care**, phone repair & Pokémon hobby shop at 4720 Kirkwood Hwy, Wilmington, DE.
Plain HTML/CSS/JS — no build step, no frameworks — set up for hosting on Netlify.

## What's on the site

- **Repairs** — services, free-quote callout, 3-step "how it works"
- **Quote request form** — device/model, problem, name, phone, email (Netlify Forms)
- **Hobby shop** — Pokémon TCG products and buy / sell / trade
- **FAQ** + **chat helper** — answers common questions instantly (no appointment booking)
- **Visit** — live "open now" status, today's hours highlighted, map

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | All styling |
| `js/config.js` | Phone, email, address, hours — **edit shop details here** |
| `js/faq-data.js` | FAQ questions & answers used by both the chat helper and the FAQ section |
| `js/site.js` | Menu, open/closed status, quote form |
| `js/chat.js` | Chat helper |
| `thanks.html` | Shown after a quote is sent if JavaScript is off |
| `404.html` | Not-found page |
| `netlify.toml` | Netlify settings |

## Deploy on Netlify

1. In Netlify: **Add new site → Import an existing project → GitHub** and pick this repo.
2. Leave the build command empty and the publish directory as `.` (already set in `netlify.toml`).
3. Deploy. Then point `techcarecollectibles.com` at it under **Domain management**.

### Getting quote requests by email

Netlify picks up the quote form automatically on deploy (it's tagged `data-netlify="true"`).

1. Make sure **Forms → Enable form detection** is on for the site, then redeploy once.
2. Go to **Site configuration → Notifications → Form submission notifications → Add notification → Email notification**,
   choose the `quote` form, and enter `info@techcarecollectibles.com`.

Every request also shows up under **Forms → quote** in the Netlify dashboard. Spam is filtered with a hidden honeypot field.
If sending ever fails, the visitor is offered a pre-filled email and the phone number instead.

## Editing the chat helper / FAQ

Open `js/faq-data.js`. Each entry has a question, an answer and a list of `keys` (words people might type).
Set `onPage: true` to also show it in the FAQ section. The chat only answers from this file — it doesn't make things up.

Answers that are deliberately general because the details weren't on the old site — worth confirming with the owner:

- **Warranty** — currently says "ask us"; add the actual warranty terms if there are any.
- **Walk-ins** — says no appointment is needed; change if that's not the case.
- **Pricing / turnaround** — says "depends on the model, free quote"; add typical prices if desired.
- **Online sales / shipping** — says products are sold in-store.

## Run locally

```bash
python3 -m http.server 8787
```

Then open http://localhost:8787. (The quote form only actually sends once deployed on Netlify.)
