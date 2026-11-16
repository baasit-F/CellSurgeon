# Tech Care — Project Brief (Marketing & Analytics)

Source: the `baasit-F/CellSurgeon` repository, `main` branch, inspected 2026-11-16.
Everything below is taken from the code. Items the code does not contain are marked `[Not specified in codebase]`.

## 1. Business & Brand Profile

**Company**
- Name: **Tech Care** (two words in all copy; the logo reads "TECH ⚡ CARE"). JSON-LD on the home page uses "Tech Care — Phone Repair & Hobby Shop".
- Tagline (home page H1): "Fix your phone. Grow your collection."
- Footer descriptor: "Phone, Console & Laptop Repair · Pokémon Hobby Shop"
- Value proposition (home page intro): "Expert phone, console & laptop repair at the back counter. Pokémon TCG, anime and collectibles up front. Buy, sell and trade — all under one roof."

**Core services**
- Phone and tablet repair: cracked screens, battery replacement, charging ports, back glass, water damage, free diagnostics. Also home buttons, speakers and microphones, screen protectors.
- Game console repair (PS5, PS4, Xbox Series X|S, Xbox One): HDMI port replacement, overheating and loud fan, disc drive problems, won't turn on, controller repair, free diagnostics.
- Laptop repair (MacBook and Windows): screen replacement, battery replacement, charging and power, keyboard and trackpad, SSD/RAM upgrades, free diagnostics.
- Hobby shop: Pokémon TCG sealed product, singles, supplies, other anime and TCG collectibles; buy, sell and trade.

**Offers stated in the copy**
- "$70 or less on screen repairs". Excludes "the iPhone 18 lineup and the very newest releases".
- Price match: "Bring in an official quote from another repair provider and we'll match their price."
- Part options: same repair work, choice of parts at different prices ("premium parts to more budget-friendly ones").
- Lifetime warranty on parts: covers defects in the part or workmanship; excludes accidental damage and normal wear and tear.
- Free diagnostics and free, no-obligation quotes. Walk-ins welcome.
- No prices are stated for console or laptop repairs.

**Audience, location, contact**
- Target audience: `[Not specified in codebase]`. The copy addresses local device owners and Pokémon card collectors in Wilmington, DE.
- Service area: `[Not specified in codebase]` beyond the single shop location. Copy says "Wilmington, DE" and "Kirkwood Hwy".
- Address: 4720 Kirkwood Hwy, Wilmington, DE 19808
- Phone: (302) 609-4060 (`tel:+13026094060`)
- Email: info@techcarecollectibles.com
- Hours (America/New_York): Mon–Fri 10:00–19:00, Sat 10:00–18:00, Sun 12:00–17:00
- Google Maps link: https://maps.app.goo.gl/MrAmSJkTdqbsVuTa9
- Google reviews: rating 4.9, count 218, with read and write-review links (all in `js/reviews-data.js`)
- Social links (Facebook, Instagram, TikTok, X): `[Not specified in codebase]`

**Brand tone**
- Friendly, casual and local; short punchy headlines in uppercase italics ("Broken today. Fixed fast.", "Back in the game").
- Playful trading-card theme (holographic review "cards", stickers, lightning bolt).
- Plain-spoken reassurance: "no obligation", "no mail-in, no waiting weeks".
- Rule recorded in `README.md`: part options must be framed as a choice of parts; the repair work is always the same quality.

## 2. Tech Stack & Deployment Architecture

- **Framework:** none. Plain static HTML, CSS and vanilla JavaScript. No build step, no bundler, no `package.json`.
- **Styling:** one stylesheet, `styles.css`. Font: Archivo from Google Fonts.
- **CMS / backend / database:** none. Content is hard-coded in the HTML files and in `js/*.js` data files.
- **Forms backend:** Netlify Forms (`data-netlify="true"`). Two form names: `quote` and `booking`.
- **Hosting:** Netlify. `netlify.toml` sets `publish = "."` (repo root served as-is) plus security and image cache headers.
- **Domain:** canonical and Open Graph URLs use `https://techcarecollectibles.com`. The Netlify site name and whether the domain is connected: `[Not specified in codebase]`.
- **Environment variables:** none. There is no `.env` file. Shop settings live in `js/config.js` (`window.TECHCARE`).

**Where to inject GTM, GA4 or Meta Pixel**
- There is **no shared layout or template**. Each page has its own `<head>`, so a tag must be added to every HTML file:
  `index.html`, `repairs.html`, `phone-repair.html`, `console-repair.html`, `laptop-repair.html`, `reviews.html`, `book.html`, `thanks.html`, `404.html`
- Head snippet: place before `</head>` in each file. GTM `<noscript>` snippet: place right after `<body>`.
- Scripts are loaded at the end of `<body>` in each page. `js/config.js` and `js/site.js` load on every page except `thanks.html` and `404.html`.
- Alternative without editing files: Netlify's "Snippet injection" setting. This is a Netlify feature, `[Not specified in codebase]`.

**Key files**
- `js/config.js`: phone, email, address, hours, booking rules, form endpoint (`quoteEndpoint: "/"`)
- `js/site.js`: menu, open/closed status, FAQ list, quote form
- `js/booking.js`, `js/slots.js`: Schedule Repair page calendar, slots and form
- `js/chat.js`, `js/faq-data.js`: scripted chat helper (no AI) and its answers
- `js/devices.js`, `js/device-picker.js`: device/model dropdown
- `js/reviews-data.js`, `js/reviews.js`: rating, review count, review cards

## 3. Site Map & Conversion Architecture

**Pages**

| URL path | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` | Home: repairs, offers, reviews, quote form, hobby shop, FAQ, visit |
| `/repairs.html` | `repairs.html` | Repair overview landing page (no hobby-shop content) |
| `/phone-repair.html` | `phone-repair.html` | Phone and tablet repair landing page |
| `/console-repair.html` | `console-repair.html` | PS5 / Xbox repair landing page |
| `/laptop-repair.html` | `laptop-repair.html` | Laptop and MacBook repair landing page |
| `/reviews.html` | `reviews.html` | Google reviews page |
| `/book.html` | `book.html` | Schedule Repair (calendar, time slots, form). Accepts `?service=screen`, `console` or `laptop` |
| `/thanks.html` | `thanks.html` | Form fallback page (only reached when JavaScript is off). `noindex` |
| `/404.html` | `404.html` | Not found. `noindex` |

Home page anchors: `#repairs`, `#deals`, `#quote`, `#shop`, `#faq`, `#visit`. Repair pages: `#repairs`, `#deals`, `#quote`, `#faq`, `#visit`.

**Form 1: quote request** (Netlify form name `quote`)
- Lives in: `index.html`, `repairs.html`, `phone-repair.html`, `console-repair.html`, `laptop-repair.html` (`<form id="quote-form">`)
- Fields: `form-name` (hidden, "quote"), `device`, `problem`, `name`, `phone`, `email`, `bot-field` (honeypot)
- Hidden `source` field: "repairs page", "phone repair page", "console repair page", "laptop repair page". **The home page form has no `source` field.**
- Submit handler: `initQuote()` in `js/site.js`. Validates, then sends by `fetch` POST to `/` (URL-encoded).
- Success: the form is replaced in place by `.quote-done` (function `showDone()` in `js/site.js`). **There is no redirect and no page load.**
- Failure: shows a `mailto:` fallback link and the phone number.

**Form 2: booking request** (Netlify form name `booking`)
- Lives in: `book.html` (`<form id="book-form">`)
- Fields: `form-name` (hidden, "booking"), `date`, `time`, `source` ("schedule page"), `service`, `device`, `name`, `phone`, `email` (optional), `notes` (optional), `bot-field`
- Submit handler: `js/booking.js` (`form.addEventListener("submit", …)`), `fetch` POST to `/`.
- Success: inline `.quote-done` via `showDone()` in `js/booking.js`. No redirect.
- Booking is a request only. The site does not track which slots are taken.

**Form 3: booking from the chat helper**
- Lives in: `js/chat.js`, function `sendBooking()`. Available on every page with the chat widget.
- Posts to the same Netlify `booking` form with `source` = "chat helper". Fields: `date`, `time`, `service`, `device`, `name`, `phone`, `email` (empty), `notes` (the answers to the chat questions).
- Success: a confirmation message in the chat. No redirect.

**Phone links (`tel:+13026094060`)**
- Top bar on all seven main pages (`.topbar-phone`)
- Header Call button on the four repair pages, phones only (`.header-call`)
- Quote section "Rather talk to someone?" (`.alt-link`), Visit section, footer, form success and error messages
- Chat helper action button "Call (302) 609-4060" (rendered by `js/chat.js`)

**Email links (`mailto:info@techcarecollectibles.com`)**
- Quote section (`.alt-link`), Visit section, footer; form-failure fallback built in `js/site.js`, `js/booking.js` and `js/chat.js`

**Primary CTA buttons**
- "Free repair quote" in the header menu (`.nav-cta`, to `#quote`)
- "Get a free repair quote" / "Get a free quote" in the hero (to `#quote`)
- "Schedule a drop-off" on repair pages (to `/book.html?service=…`); "Schedule Repair" menu link; "Schedule a repair" on the home deal card
- "Get directions" and "Open in Google Maps" (external Google Maps link)
- Google rating badge (`.rating-badge`, to `/reviews.html`)
- `reviews.html`: "Read every review on Google" (`data-reviews-read`), write-a-review button (`data-reviews-write`), "Get a free quote"
- Chat launcher "Questions? Ask us" (`.chat-launcher`) and "Ask the chat helper" (`data-open-chat`)
- Hero stickers "Screens $70 or less" and "We price match" (to `#deals`)

**Tracking implications**
- All three forms succeed without a page load, so a "thank-you page view" conversion will not fire. Conversions need a custom event (for example a `dataLayer.push`) added in `showDone()` in `js/site.js`, `showDone()` in `js/booking.js`, and the success branch of `sendBooking()` in `js/chat.js`. None exists today.
- UTM or click-ID capture (`utm_*`, `gclid`, `fbclid`) in forms: `[Not specified in codebase]`.

## 4. Existing SEO & Tracking Setup

**Present**
- `<title>` and `<meta name="description">` on all seven main pages; `<link rel="canonical">` on each.
- Open Graph tags on all seven main pages: `og:type`, `og:title`, `og:description`, `og:image` (`/images/storefront.jpg`), `og:url`.
- JSON-LD `LocalBusiness` on `index.html`, `repairs.html`, `phone-repair.html`, `console-repair.html`, `laptop-repair.html` (name, address, phone, hours, `priceRange` "$$"; repair pages add `makesOffer` services). Not on `reviews.html` or `book.html`.
- `<meta name="robots" content="noindex">` on `thanks.html` and `404.html`.
- `<meta name="theme-color">` and an SVG favicon.

**Absent**
- Google Tag Manager, Google Analytics 4, Google Ads tag, Meta Pixel, or any other analytics: `[Not specified in codebase]`
- `sitemap.xml`: `[Not specified in codebase]`
- `robots.txt`: `[Not specified in codebase]`
- Twitter/X card tags: `[Not specified in codebase]`
- Privacy policy or cookie consent: `[Not specified in codebase]`
- `package.json` and any tracking packages: `[Not specified in codebase]` (the project has no dependencies)
- `aggregateRating` or review schema in JSON-LD: `[Not specified in codebase]`

**Inconsistencies found**
- `index.html` `og:title` still reads "Tech Care — Phone Repair & Pokémon Hobby Shop", while its `<title>` now includes consoles and laptops.
- `book.html` and `reviews.html` descriptions mention only phones and tablets.
- The home page quote form has no `source` field, so home-page leads are not labelled.
