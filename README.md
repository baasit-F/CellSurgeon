# Tech Care — website

Website for **Tech Care**, phone repair & Pokémon hobby shop at 4720 Kirkwood Hwy, Wilmington, DE.
Plain HTML/CSS/JS — no build step, no frameworks — set up for hosting on Netlify.

## What's on the site

- **Repairs** — services, free-quote callout, 3-step "how it works"
- **Quote request form** — device/model, problem, name, phone, email (Netlify Forms)
- **Hobby shop** — Pokémon TCG products and buy / sell / trade
- **FAQ** + **chat helper** — answers common questions instantly (no appointment booking)
- **Visit** — live "open now" status, today's hours highlighted, map
- **Reviews page** (`reviews.html`) — 4.9★ scoreboard, what customers mention most, and Google reviews shown as
  holographic "trading cards" you can filter; 3 featured cards also appear on the home page

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page |
| `styles.css` | All styling |
| `js/config.js` | Phone, email, address, hours — **edit shop details here** |
| `js/faq-data.js` | FAQ questions & answers used by both the chat helper and the FAQ section |
| `js/site.js` | Menu, open/closed status, quote form |
| `js/chat.js` | Chat helper |
| `reviews.html` | Reviews page |
| `js/reviews-data.js` | Rating, review count, Google links and the review excerpts — **update the numbers here** |
| `js/reviews.js` | Draws the review cards and the holo tilt effect |
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

A few answers are based on what customers say in Google reviews (warranty offered, parts ordered overnight with a
deposit, laptops repaired). Others are deliberately general — worth confirming with the owner:

- **Warranty** — says repairs come with a warranty; add the actual length/terms if he wants them shown.
- **Walk-ins** — says no appointment is needed; change if that's not the case.
- **Pricing / turnaround** — says "depends on the model, free quote" and "often under an hour"; add typical prices if desired.
- **Online sales / shipping** — says products are sold in-store.

## Updating reviews

The rating (4.9) and count (218) live at the top of `js/reviews-data.js` — update them every so often and every page picks it up.
To add a review card, copy an entry in `list`, paste a short excerpt from Google, and credit the reviewer as Google shows them
(first name + last initial). Set `featured: true` on any 3 to show them on the home page.

## Run locally

```bash
python3 -m http.server 8787
```

Then open http://localhost:8787. (The quote form only actually sends once deployed on Netlify.)
