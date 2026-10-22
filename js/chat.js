/* Tech Care — FAQ chat helper.
   Runs entirely in the browser: it matches the visitor's question against
   faq-data.js and replies with the best answer. No appointment booking. */
(function () {
  "use strict";
  var C = window.TECHCARE;
  var FAQ = window.TECHCARE_FAQ || [];

  var root = document.getElementById("chat");
  var launcher = root.querySelector(".chat-launcher");
  var panel = document.getElementById("chat-panel");
  var log = document.getElementById("chat-log");
  var suggest = document.getElementById("chat-suggest");
  var chatForm = document.getElementById("chat-form");
  var input = document.getElementById("chat-text");
  var greeted = false;
  var lastDevice = "";

  var ACTIONS = {
    quote: { label: "Get a free quote", run: function () { close(); window.TechCareQuote.open(lastDevice); } },
    call: { label: "Call " + C.phone, href: C.phoneHref },
    email: { label: "Email us", href: "mailto:" + C.email },
    directions: { label: "Get directions", href: C.mapsUrl, external: true }
  };

  /* ---------- open / close ---------- */
  function open() {
    root.dataset.state = "open";
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      bot("Hi! 👋 I'm the Tech Care helper. Ask me about <strong>phone repairs</strong>, <strong>Pokémon cards</strong>, our <strong>hours</strong> — or tap a topic below.");
      renderSuggestions();
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() {
    root.dataset.state = "closed";
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus({ preventScroll: true });
  }
  launcher.addEventListener("click", function () { root.dataset.state === "open" ? close() : open(); });
  panel.querySelector(".chat-x").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.dataset.state === "open") close(); });
  document.querySelectorAll("[data-open-chat]").forEach(function (b) { b.addEventListener("click", open); });

  /* ---------- messages ---------- */
  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function user(text) {
    var m = document.createElement("div");
    m.className = "msg msg-user";
    m.textContent = text;
    log.appendChild(m);
    scrollDown();
  }

  function bot(html, actions) {
    var m = document.createElement("div");
    m.className = "msg msg-bot";
    m.innerHTML = "<p>" + html + "</p>";
    if (actions && actions.length) {
      var row = document.createElement("div");
      row.className = "msg-actions";
      actions.forEach(function (key) {
        var a = ACTIONS[key];
        var el;
        if (a.href) {
          el = document.createElement("a");
          el.href = a.href;
          if (a.external) { el.target = "_blank"; el.rel = "noopener"; }
        } else {
          el = document.createElement("button");
          el.type = "button";
          el.addEventListener("click", a.run);
        }
        el.textContent = key === "quote" && lastDevice ? "Get a quote for " + lastDevice : a.label;
        row.appendChild(el);
      });
      m.appendChild(row);
    }
    log.appendChild(m);
    scrollDown();
  }

  // Short "typing" pause so replies feel conversational.
  function reply(fn) {
    var t = document.createElement("div");
    t.className = "msg msg-bot typing";
    t.setAttribute("aria-label", "Typing");
    t.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(t);
    scrollDown();
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(function () { t.remove(); fn(); }, reduce ? 0 : 450);
  }

  function renderSuggestions() {
    suggest.innerHTML = "";
    FAQ.filter(function (f) { return f.chip; }).forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = f.chip;
      b.addEventListener("click", function () { ask(f.q, f); });
      suggest.appendChild(b);
    });
  }

  /* ---------- matching ---------- */
  function normalize(s) {
    return " " + s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9$'\s-]/g, " ").replace(/\s+/g, " ").trim() + " ";
  }
  function words(s) {
    return s.trim().split(" ").map(function (w) { return w.replace(/'s$/, "").replace(/s$/, ""); });
  }

  function bestMatch(text) {
    var norm = normalize(text);
    var tokens = words(norm);
    var best = null, bestScore = 0;
    FAQ.forEach(function (f) {
      var score = 0, seen = {};
      f.keys.forEach(function (k) {
        var key = normalize(k);
        if (key.trim().indexOf(" ") > -1 || key.indexOf("$") > -1) {
          if (norm.indexOf(key.trim()) > -1) score += 2;           // phrase hit
        } else {
          var stem = words(key)[0];
          if (!seen[stem] && tokens.indexOf(stem) > -1) score += 1; // word hit ("card"/"cards" count once)
          seen[stem] = true;
        }
      });
      if (score > bestScore) { bestScore = score; best = f; }
    });
    return best;
  }

  var DEVICE_RE = /\b(iphone\s?(?:\d{1,2}|se|x[rs]?)(?:\s?(?:pro max|pro|plus|mini|max))?|galaxy\s?(?:[sazn]\d{1,3}\w*|note\s?\d+|tab\s?\w+)|pixel\s?\d\w*(?:\s?(?:pro|xl|a))?|ipad(?:\s?(?:pro|air|mini))?)s?\b/i;
  function detectDevice(text) {
    var m = text.match(DEVICE_RE);
    if (!m) return "";
    return m[1].replace(/\b(iphone)/i, "iPhone").replace(/\b(ipad)/i, "iPad")
      .replace(/\bgalaxy\s?([a-z])?/i, function (_, l) { return "Galaxy " + (l ? l.toUpperCase() : ""); })
      .replace(/\bpixel/i, "Pixel")
      .replace(/\b(pro|max|plus|mini|air)\b/gi, function (w) { return w[0].toUpperCase() + w.slice(1).toLowerCase(); });
  }

  function answer(text, forced) {
    var device = detectDevice(text);
    if (device) lastDevice = device;
    var norm = normalize(text);

    if (!forced && /^ (hi|hey|hello|yo|sup|good (morning|afternoon|evening)|hiya)\b/.test(norm) && norm.split(" ").length < 5) {
      return bot("Hey there! What can I help with — a <strong>repair</strong>, <strong>Pokémon cards</strong>, or our <strong>hours</strong>?");
    }
    if (!forced && /\b(thanks|thank you|thx|ty|appreciate)\b/.test(norm)) {
      return bot("You're welcome! Anything else? If not, hope to see you at the shop. ⚡");
    }

    var f = forced || bestMatch(text);
    if (!f) {
      return bot("Hmm, I'm not sure about that one. The team can help — give us a call at <a href=\"" + C.phoneHref + "\">" + C.phone +
        "</a>, or if it's about a repair, send a quote request and we'll get back to you.", ["quote", "call"]);
    }

    var a = typeof f.a === "function" ? f.a() : f.a;
    // Someone named their phone while asking about a repair: point them straight at a quote.
    if (device && ["repairs", "devices", "price", "time", "diagnostic", "water"].indexOf(f.id) > -1) {
      a += "<br><br>Want a price for your <strong>" + device + "</strong>? I can start the quote form for you.";
    }
    bot(a, f.actions);
  }

  function ask(text, forced) {
    user(text);
    reply(function () { answer(text, forced); });
  }

  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    ask(text);
  });
})();
