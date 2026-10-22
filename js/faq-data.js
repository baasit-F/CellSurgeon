/* FAQ content — shared by the chat helper and the FAQ section on the page.

   Each entry:
     q        the question as shown on the page / in suggestion buttons
     a        the answer (HTML allowed), or a function returning it
     keys     words and phrases the chat helper matches against
     actions  buttons shown under the chat answer: "quote", "call", "email", "directions"
     onPage   true = also listed in the FAQ section on the page
     chip     short label for the chat's suggestion buttons (optional)

   To add a question, copy an entry and edit it. Keep answers to things
   that are true for the shop — when in doubt, point people to a quote or a call. */
window.TECHCARE_FAQ = [
  {
    id: "hours",
    q: "What are your hours?",
    chip: "Hours",
    a: function () {
      var s = window.TechCareHours ? window.TechCareHours.status().text + ".<br>" : "";
      return s + "<strong>Mon–Fri</strong> 10 am – 7 pm<br><strong>Saturday</strong> 10 am – 6 pm<br><strong>Sunday</strong> 12 pm – 5 pm";
    },
    keys: ["hours", "open", "close", "closed", "closing", "time", "today", "tomorrow", "sunday", "saturday", "weekend", "when"],
    actions: ["directions"],
    onPage: true
  },
  {
    id: "location",
    q: "Where are you located?",
    chip: "Location",
    a: "We're at <strong>4720 Kirkwood Hwy, Wilmington, DE 19808</strong> — look for the big blue TECH ⚡ CARE sign. There's a parking lot right out front.",
    keys: ["where", "location", "located", "address", "directions", "find", "parking", "park", "kirkwood", "map", "get there"],
    actions: ["directions"],
    onPage: true
  },
  {
    id: "repairs",
    q: "What repairs do you do?",
    chip: "Repairs",
    a: "We fix smartphones and tablets right here in the shop: <strong>cracked screens</strong>, <strong>battery replacements</strong>, <strong>charging port repairs</strong>, <strong>back glass</strong>, home buttons, screen protectors and <strong>diagnostics</strong> for other issues. We work on laptops too. Not sure what's wrong? We'll take a look and give you a free quote.",
    keys: ["repair", "repairs", "fix", "fixing", "service", "services", "broken", "screen", "cracked", "battery", "charge", "charging", "port", "back glass", "home button", "protector"],
    actions: ["quote"],
    onPage: true
  },
  {
    id: "devices",
    q: "Which phones and tablets do you work on?",
    a: "Smartphones and tablets of all kinds — iPhone, Samsung, Motorola and more — plus laptops. The fastest way to check your exact model is to send a quick quote request — tell us the device and what's wrong, and we'll let you know.",
    keys: ["iphone", "samsung", "galaxy", "pixel", "google", "ipad", "tablet", "android", "apple", "motorola", "moto", "lg", "oneplus", "model", "brand", "laptop", "computer", "macbook"],
    actions: ["quote"],
    onPage: false
  },
  {
    id: "price",
    q: "How much does a repair cost?",
    chip: "Pricing",
    a: "It depends on your device model and the part it needs, so we price each repair individually. Quotes are <strong>free with no obligation</strong> — send us your model and the problem and we'll get back to you with a price.",
    keys: ["price", "prices", "pricing", "cost", "costs", "how much", "charge", "fee", "expensive", "cheap", "estimate", "quote", "$"],
    actions: ["quote", "call"],
    onPage: true
  },
  {
    id: "time",
    q: "How long does a repair take?",
    a: "Our repair bench is right here in the shop, so many common fixes — like screens and charging ports — are done while you wait, often in under an hour. We'll give you a time estimate for your specific repair along with your quote.",
    keys: ["how long", "long", "take", "turnaround", "same day", "wait", "today", "fast", "quick", "ready", "minutes", "hours long"],
    actions: ["quote"],
    onPage: true
  },
  {
    id: "diagnostic",
    q: "Is it free to have my phone checked?",
    a: "Yes — diagnostics for common issues come with a <strong>free quote, no obligation</strong>. If you decide not to go ahead, you don't pay anything.",
    keys: ["free", "diagnostic", "diagnose", "diagnosis", "check", "inspect", "what's wrong", "not sure", "obligation"],
    actions: ["quote"],
    onPage: true
  },
  {
    id: "walkin",
    q: "Do I need an appointment?",
    a: "No appointment needed — just stop by during open hours. If you'd like a price before you come in, send a quote request first.",
    keys: ["appointment", "book", "booking", "schedule", "reserve", "walk in", "walk-in", "walkin", "drop off", "drop-off", "come in", "stop by"],
    actions: ["quote", "directions"],
    onPage: true
  },
  {
    id: "water",
    q: "Can you fix water damage?",
    a: "Water damage varies a lot from phone to phone, so the best first step is a diagnosis. Bring it in (or send a quote request) and we'll let you know what we can do. Tip: power it off and don't try to charge it in the meantime.",
    keys: ["water", "wet", "dropped in", "liquid", "spill", "toilet", "pool", "rain"],
    actions: ["quote"],
    onPage: false
  },
  {
    id: "warranty",
    q: "Do your repairs come with a warranty?",
    a: "Yes — our repairs come with a warranty. We'll go over the coverage for your specific repair when you get your quote.",
    keys: ["warranty", "guarantee", "guaranteed", "if it breaks again", "stops working", "failed"],
    actions: ["quote", "call"],
    onPage: true
  },
  {
    id: "parts",
    q: "What if you don't have the part for my phone?",
    a: "We keep parts for lots of popular phones in stock and can order the rest — often arriving the next day. For ordered parts we ask for a small deposit to cover delivery; it goes toward your repair bill and isn't refundable.",
    keys: ["part", "parts", "in stock part", "order", "ordered", "deposit", "genuine", "original", "oem"],
    actions: ["quote", "call"],
    onPage: false
  },
  {
    id: "reviews",
    q: "Are you any good?",
    chip: "Reviews",
    a: function () {
      var R = window.TECHCARE_REVIEWS || { rating: 4.9, count: 218 };
      return "We'll let our customers answer that: we're rated <strong>" + R.rating.toFixed(1) + "★ from " + R.count + " Google reviews</strong>. People mention our friendly staff, fast screen repairs and fair prices most.";
    },
    keys: ["review", "reviews", "rating", "rated", "stars", "good", "any good", "trust", "legit", "reliable", "recommend", "best"],
    actions: ["reviews", "quote"],
    onPage: false
  },
  {
    id: "data",
    q: "Will I lose my data?",
    a: "Screen, battery and charging port repairs don't normally touch your data, but it's always smart to back up your phone before any repair if you can.",
    keys: ["data", "photos", "pictures", "lose", "erase", "wipe", "backup", "back up", "contacts"],
    actions: ["quote"],
    onPage: false
  },
  {
    id: "buy-cards",
    q: "Do you buy Pokémon cards?",
    chip: "Sell my cards",
    a: "Yes! We <strong>buy, sell and trade</strong> Pokémon TCG cards and product with fair, transparent pricing. Bring your cards in during open hours and we'll take a look.",
    keys: ["you buy", "buy my", "sell my", "sell you", "trade my", "buy", "sell", "selling", "trade","trading", "trade in", "cash", "collection", "my cards", "offer", "value", "worth"],
    actions: ["directions", "call"],
    onPage: true
  },
  {
    id: "products",
    q: "What Pokémon products do you carry?",
    chip: "Pokémon stock",
    a: "Sealed product like <strong>Elite Trainer Boxes, booster boxes, tins and premium collections</strong>, plus <strong>singles</strong> and supplies — <strong>sleeves, binders, deck boxes and top loaders</strong>. We also carry other anime and TCG collectibles.",
    keys: ["pokemon", "pokémon", "tcg", "cards", "card", "etb", "elite trainer", "booster", "boosters", "pack", "packs", "tin", "tins", "singles", "single", "sleeves", "binder", "binders", "deck box", "top loader", "toploader", "sealed", "carry", "stock", "anime", "collectible", "collectibles"],
    actions: ["directions"],
    onPage: true
  },
  {
    id: "stock-check",
    q: "Do you have a specific card or set in stock?",
    a: "Stock changes quickly! Give us a call at <a href=\"tel:+13026094060\">(302) 609-4060</a> and we'll check for you, or stop by and browse.",
    keys: ["in stock", "available", "set", "new set", "release", "specific", "looking for", "chase", "charizard", "pikachu"],
    actions: ["call"],
    onPage: false
  },
  {
    id: "online",
    q: "Do you sell online or ship?",
    a: "Our cards and collectibles are sold in the shop. Call us if you're looking for something specific and we'll let you know what we've got.",
    keys: ["online", "ship", "shipping", "deliver", "delivery", "website", "order", "mail"],
    actions: ["call"],
    onPage: false
  },
  {
    id: "contact",
    q: "How can I contact you?",
    chip: "Contact",
    a: "Call us at <a href=\"tel:+13026094060\">(302) 609-4060</a> or email <a href=\"mailto:info@techcarecollectibles.com\">info@techcarecollectibles.com</a>. For repair prices, the quote form is the quickest way.",
    keys: ["contact", "phone number", "call", "email", "reach", "talk", "speak", "human", "person", "someone", "number"],
    actions: ["call", "email"],
    onPage: false
  }
];
