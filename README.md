# Tech Care — website

Website for **Tech Care**, phone repair & Pokémon hobby shop at 4720 Kirkwood Hwy, Wilmington, DE.
Plain HTML/CSS/JS — no build step, no frameworks — set up for hosting on Netlify.

## What's on the site

- **Repairs** — services, free-quote callout, 3-step "how it works"
- **Quote request form** — device/model, problem, name, phone, email (Netlify Forms)
- **Hobby shop** — Pokémon TCG products and buy / sell / trade
- **FAQ** + **chat helper** — answers common questions instantly, and can **schedule a repair** right in the chat:
  a calendar, time slots, then a few questions about the problem (e.g. "does the display still work?",
  "tried another cable?") — sent to the same Netlify "booking" form, with the answers in the notes
- **Schedule Repair page** (`book.html`) — month calendar with time slots built from the shop hours; appointment
  requests arrive in Netlify under Forms → "booking" and the shop confirms each one by text or call
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
| `js/chat.js` | Chat helper, including scheduling (the per-problem questions are in `SERVICES` at the top of the scheduling section) |
| `book.html` | Appointment booking page |
| `js/slots.js` | Open days and time slots, shared by the Schedule Repair page and the chat |
| `js/booking.js` | Calendar, time slots and booking form (slot length, lead time, holidays: `booking` in `js/config.js`) |
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

## Changing the current deal

The "$70 or less on screen repairs" deal (excluding the iPhone 18 lineup / newest models) appears in a few places.
Search the repo for `$70` to update or remove it: the hero badge, sticker and ticker in `index.html`, the deal cards
(`id="deals"`), the `price` and `deal` answers in `js/faq-data.js`, and the cracked-screen tip in `js/chat.js`.

Price matching and part options are described in the same deal cards, the FAQ (`pricematch`, `parts`) and the chat's
`PARTS_Q` question. Keep the part-options wording about *choice of parts*. The repair work is always the same quality.

## Editing the chat helper / FAQ

Open `js/faq-data.js`. Each entry has a question, an answer and a list of `keys` (words people might type).
Set `onPage: true` to also show it in the FAQ section. The chat only answers from this file — it doesn't make things up.

A few answers are based on what customers say in Google reviews (warranty offered, parts ordered overnight with a
deposit, laptops repaired). Others are deliberately general — worth confirming with the owner:

- **Warranty** — says repairs come with a warranty; add the actual length/terms if he wants them shown.
- **Walk-ins** — says no appointment is needed, with a link to book online; change if that's not the case.
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
