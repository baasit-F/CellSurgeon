/* Tech Care — FAQ chat helper.
   Runs entirely in the browser: it matches the visitor's question against
   faq-data.js and replies with the best answer. It can also schedule a repair:
   a calendar right in the chat, then a few questions about the problem, sent
   as a Netlify Forms "booking" request (same as the Schedule Repair page). */
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
  var flow = null;            // the scheduling conversation, while one is running
  var DEFAULT_PLACEHOLDER = input.placeholder;

  var ACTIONS = {
    quote: { label: "Get a free quote", run: function () {
      close();
      if (window.TechCareQuote) window.TechCareQuote.open(lastDevice);
      else location.href = "/#quote";   // pages without the form (e.g. reviews)
    } },
    call: { label: "Call " + C.phone, href: C.phoneHref },
    email: { label: "Email us", href: "mailto:" + C.email },
    directions: { label: "Get directions", href: C.mapsUrl, external: true },
    reviews: { label: "See our reviews", href: "/reviews.html" },
    book: { label: "Schedule a repair", run: function () { startBooking(); } }
  };

  /* ---------- open / close ---------- */
  function open() {
    root.dataset.state = "open";
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      bot("Hi! 👋 I'm the Tech Care helper. Ask me about <strong>phone repairs</strong>, <strong>Pokémon cards</strong>, our <strong>hours</strong> — or I can <strong>schedule a repair</strong> for you.", ["book"]);
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
    return m;
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
    if (flow) {
      var stop = document.createElement("button");
      stop.type = "button";
      stop.textContent = "✕ Cancel scheduling";
      stop.addEventListener("click", function () { user("Cancel"); cancelBooking(); });
      suggest.appendChild(stop);
      return;
    }
    var sched = document.createElement("button");
    sched.type = "button";
    sched.className = "is-primary";
    sched.textContent = "📅 Schedule a repair";
    sched.addEventListener("click", function () { user("Schedule a repair"); startBooking(); });
    suggest.appendChild(sched);
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

  var GENERIC = ["repair", "fix", "fixing", "service", "phone", "good", "best", "time"];

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
          // word hit ("card"/"cards" count once); everyday words like "fix" count less
          // so "do repairs have a warranty" lands on warranty, not the repairs overview
          if (!seen[stem] && tokens.indexOf(stem) > -1) score += GENERIC.indexOf(stem) > -1 ? 0.5 : 1;
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

    // "Can I book / schedule a time?" goes straight to the calendar.
    if (!forced && /\b(schedule|book|booking|reserve|make an appointment|set up an appointment|drop it off)\b/.test(norm)) {
      return startBooking(true);
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
    if (flow) {
      user(text);
      if (/^(cancel|stop|quit|never ?mind|exit)\.?$/i.test(text)) return cancelBooking();
      return flow.onText(text);
    }
    ask(text);
  });

  /* =====================================================================
     Scheduling: calendar → time → what's wrong → targeted questions →
     name + phone → confirm → send.
     ===================================================================== */
  var S = window.TechCareSlots;

  // Each service asks a few questions that help the tech prepare for the visit.
  // Same work either way; only the part changes — keep this wording careful.
  var PARTS_Q = {
    q: "We offer a few part options at different prices. The repair work is the same high quality either way. Any preference?",
    a: ["Premium parts", "Most budget-friendly", "Not sure, explain at the shop"]
  };
  var SERVICES = [
    { label: "Cracked screen", service: "Screen repair", device: true,
      tip: "Good news: screen repairs are <strong>$70 or less</strong> right now (except the iPhone 18 lineup and the very newest models).", qs: [
      { q: "Does the display still work under the crack?",
        a: ["Yes, just the glass is cracked", "Lines, spots or flickering", "Screen is black", "Touch isn't responding"] },
      { q: "Is the back glass or camera lens cracked too?", a: ["Yes", "No", "Not sure"] },
      PARTS_Q
    ] },
    { label: "Battery", service: "Battery replacement", device: true, qs: [
      { q: "What's the battery doing?",
        a: ["Drains really fast", "Shuts off at random", "Looks swollen / screen lifting", "Won't turn on at all"],
        tips: { "Looks swollen / screen lifting": "⚠️ Please stop charging it and keep it somewhere cool. A swollen battery should be looked at soon." } },
      { q: "Roughly how old is the phone?", a: ["Under 2 years", "2–4 years", "Older than that", "Not sure"] },
      PARTS_Q
    ] },
    { label: "Won't charge", service: "Charging port", device: true, qs: [
      { q: "What happens when you plug it in?",
        a: ["Nothing at all", "Only at certain angles", "Charges really slowly", "\u201cAccessory not supported\u201d"] },
      { q: "Have you tried a different cable and charger?", a: ["Yes, same problem", "Not yet"] }
    ] },
    { label: "Water damage", service: "Water damage", device: true,
      tip: "Tip: keep it powered off and don't try to charge it until we've had a look.", qs: [
      { q: "When did it get wet?", a: ["Today", "In the last few days", "Over a week ago"] },
      { q: "Does it turn on right now?", a: ["Yes", "No", "Haven't tried"] },
      { q: "What kind of liquid was it?", a: ["Water", "Pool / salt water", "Soda, coffee or other"] }
    ] },
    { label: "Something else", service: "Diagnosis", device: true, qs: [],
      free: "No problem. Tell me a bit about what's going on with it." },
    { label: "Pokémon cards", service: "Pokémon cards — buy / sell / trade", device: false, qs: [
      { q: "What are you looking to do?", a: ["Sell cards", "Trade", "Buy", "A bit of everything"] },
      { q: "Roughly how much are you bringing in?", a: ["A few cards", "A binder or box", "A whole collection", "Nothing, just shopping"] }
    ] }
  ];

  function esc(t) {
    return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  function startBooking(fromText) {
    if (!S) { location.href = "/book.html"; return; }
    if (root.dataset.state !== "open") open();
    flow = { data: { answers: [] }, row: null, onText: function () {} };
    renderSuggestions();
    if (!S.firstOpenDay()) {
      endBooking();
      return reply(function () {
        bot("Looks like there are no open times online right now. Give us a call at <a href=\"" + C.phoneHref + "\">" + C.phone + "</a> and we'll fit you in.", ["call"]);
      });
    }
    pickDay(fromText ? "Sure, let's get you scheduled! 📅 Pick a day that works:" : "Let's get you scheduled! 📅 Pick a day that works:");
  }

  function endBooking() {
    flow = null;
    input.placeholder = DEFAULT_PLACEHOLDER;
    input.removeAttribute("inputmode");
    lockAll();
    renderSuggestions();
  }
  function cancelBooking() {
    endBooking();
    reply(function () { bot("No problem, I've stopped scheduling. Anything else I can help with?"); });
  }

  function lock(row) {
    if (!row) return;
    row.dataset.done = "1";
    row.querySelectorAll("button").forEach(function (b) { b.disabled = true; });
  }
  function lockAll() { log.querySelectorAll(".msg-choices, .chat-cal").forEach(lock); }

  // A bot question with tap-to-answer options and/or a typed answer.
  //   opts: ["Label", …] or [{ label, value }, …]
  //   text: { placeholder, validate(t) → true | "error message", inputmode }
  //   cls:  extra class for the options row (e.g. "is-times" lays times out in a grid)
  function step(html, opts, onAnswer, text, cls) {
    reply(function () {
      if (!flow) return;
      if (flow.tip) { html = flow.tip + "<br><br>" + html; flow.tip = null; }
      var m = bot(html);
      var row = null;
      if (opts && opts.length) {
        row = document.createElement("div");
        row.className = "msg-choices" + (cls ? " " + cls : "");
        opts.forEach(function (o) {
          var label = typeof o === "string" ? o : o.label;
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = label;
          b.addEventListener("click", function () {
            if (row.dataset.done || !flow) return;
            lock(row);
            b.classList.add("is-picked");
            user(label);
            onAnswer(typeof o === "string" ? o : o.value, label);
          });
          row.appendChild(b);
        });
        m.appendChild(row);
        scrollDown();
      }
      flow.row = row;
      input.placeholder = text ? text.placeholder : "Tap an option above…";
      if (text && text.inputmode) input.setAttribute("inputmode", text.inputmode); else input.removeAttribute("inputmode");
      flow.onText = function (t) {
        if (!text) {
          return reply(function () { bot("Tap one of the options above, or type <strong>cancel</strong> to stop scheduling."); });
        }
        var ok = text.validate ? text.validate(t) : true;
        if (ok !== true) return reply(function () { bot(ok); });
        lock(row);
        onAnswer(t, t);
      };
    });
  }

  /* ---------- 1. day (calendar inside the chat) ---------- */
  function pickDay(html) {
    reply(function () {
      if (!flow) return;
      var m = bot(html || "Pick a day that works for you:");
      m.classList.add("msg-wide");
      m.appendChild(chatCalendar(function (k) {
        user(S.niceDate(k));
        pickTime(k);
      }));
      scrollDown();
      flow.row = null;
      input.placeholder = "Tap a day on the calendar…";
      flow.onText = function () {
        reply(function () { bot("Tap a day on the calendar above, or type <strong>cancel</strong> to stop scheduling."); });
      };
    });
  }

  function chatCalendar(onPick) {
    var R = S.range(), first = S.firstOpenDay();
    var view = { y: first.y, m: first.m };
    var el = document.createElement("div");
    el.className = "chat-cal";
    el.innerHTML =
      "<div class=\"chat-cal-head\">" +
        "<button type=\"button\" data-prev aria-label=\"Previous month\">‹</button>" +
        "<p data-title></p>" +
        "<button type=\"button\" data-next aria-label=\"Next month\">›</button>" +
      "</div>" +
      "<div class=\"chat-cal-dow\" aria-hidden=\"true\"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>" +
      "<div class=\"chat-cal-grid\" role=\"group\" aria-label=\"Choose a date\"></div>";
    var title = el.querySelector("[data-title]"), grid = el.querySelector(".chat-cal-grid");
    var prev = el.querySelector("[data-prev]"), next = el.querySelector("[data-next]");
    var picked = "";

    function render() {
      title.textContent = S.MONTHS[view.m] + " " + view.y;
      var done = !!el.dataset.done;
      prev.disabled = done || (view.y === R.today.y && view.m === R.today.m);
      next.disabled = done || view.y > R.last.y || (view.y === R.last.y && view.m >= R.last.m);
      grid.innerHTML = "";
      for (var i = 0, lead = S.weekday(view.y, view.m, 1); i < lead; i++) grid.appendChild(document.createElement("span"));
      for (var d = 1, n = S.daysInMonth(view.y, view.m); d <= n; d++) {
        var k = S.key(view.y, view.m, d), openDay = S.slotsFor(k).length > 0;
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = d;
        b.dataset.date = k;
        b.disabled = done || !openDay;
        if (!openDay) b.classList.add("is-off");
        if (k === R.todayKey) b.classList.add("is-today");
        if (k === picked) b.classList.add("is-picked");
        b.setAttribute("aria-label", S.niceDate(k) + (openDay ? "" : " — not available"));
        grid.appendChild(b);
      }
    }
    prev.addEventListener("click", function () { view.m--; if (view.m < 0) { view.m = 11; view.y--; } render(); });
    next.addEventListener("click", function () { view.m++; if (view.m > 11) { view.m = 0; view.y++; } render(); });
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || b.disabled || el.dataset.done || !flow) return;
      picked = b.dataset.date;
      el.dataset.done = "1";
      render();
      onPick(picked);
    });
    render();
    return el;
  }

  /* ---------- 2. time ---------- */
  function pickTime(k) {
    var slots = S.slotsFor(k);
    if (!slots.length) return pickDay("No times are left on that day. Please pick another:");
    var opts = slots.map(function (t) { return { label: S.fmtTime(t), value: t }; });
    opts.push({ label: "← Different day", value: "back" });
    step("What time on <strong>" + S.niceDate(k) + "</strong>?", opts, function (v) {
      if (v === "back") return pickDay();
      flow.data.date = k;
      flow.data.time = S.fmtTime(v);
      pickService();
    }, null, "is-times");
  }

  /* ---------- 3. what's wrong + targeted questions ---------- */
  function pickService() {
    var d = flow.data;
    step("<strong>" + S.niceDate(d.date) + " at " + d.time + "</strong> it is. What do you need help with?",
      SERVICES.map(function (s, i) { return { label: s.label, value: i }; }),
      function (i) {
        d.svc = SERVICES[i];
        if (d.svc.tip) flow.tip = d.svc.tip;
        d.svc.device ? askDevice() : askQuestion(0);
      });
  }

  function askDevice() {
    var opts = [];
    if (lastDevice) opts.push(lastDevice);
    opts.push("Not sure of the model");
    step("Which phone or tablet is it? Type the model, like <em>iPhone 13</em> or <em>Galaxy S22</em>.", opts, function (v) {
      var named = detectDevice(v);
      flow.data.device = named || v;
      if (named) lastDevice = named;
      askQuestion(0);
    }, {
      placeholder: "e.g. iPhone 13, Galaxy S22, iPad",
      validate: function (t) { return t.length >= 2 || "Just the make and model is fine, like <em>iPhone 13</em>."; }
    });
  }

  function askQuestion(i) {
    var d = flow.data, qs = d.svc.qs;
    if (i >= qs.length) return askExtra();
    var q = qs[i];
    step(q.q, q.a, function (ans) {
      d.answers.push(q.q + " " + ans);
      if (q.tips && q.tips[ans]) flow.tip = q.tips[ans];
      askQuestion(i + 1);
    });
  }

  function askExtra() {
    var d = flow.data;
    if (d.svc.free) {
      return step(d.svc.free, [], function (t) { d.details = t; askName(); }, {
        placeholder: "Describe the problem",
        validate: function (t) { return t.length >= 3 || "A few words is fine, like <em>speaker is crackly</em>."; }
      });
    }
    step("Anything else we should know?", ["No, that's everything"], function (t, label) {
      if (t !== "No, that's everything") d.details = t;
      askName();
    }, { placeholder: "Optional details" });
  }

  /* ---------- 4. contact ---------- */
  function askName() {
    step("Almost done! What's your name?", [], function (t) { flow.data.name = t; askPhone(); }, {
      placeholder: "Your name",
      validate: function (t) { return t.length >= 2 || "Please type your name."; }
    });
  }
  function askPhone() {
    step("And the best number to text or call you to confirm?", [], function (t) { flow.data.phone = t; confirmBooking(); }, {
      placeholder: "(302) 555-0123", inputmode: "tel",
      validate: function (t) { return t.replace(/\D/g, "").length >= 10 || "That doesn't look like a full number. Please include the area code."; }
    });
  }

  /* ---------- 5. confirm + send ---------- */
  function confirmBooking() {
    var d = flow.data;
    var rows = [
      ["When", S.niceDate(d.date) + " at " + d.time],
      ["For", d.svc.label + (d.device ? " · " + d.device : "")]
    ];
    d.answers.forEach(function (a) { rows.push(["", a]); });
    if (d.details) rows.push(["Notes", d.details]);
    rows.push(["Name", d.name], ["Phone", d.phone]);
    var html = "Here's your request:<span class=\"chat-summary\">" + rows.map(function (r) {
      return "<span>" + (r[0] ? "<strong>" + r[0] + ":</strong> " : "") + esc(r[1]) + "</span>";
    }).join("") + "</span>Send it?";
    step(html, [{ label: "✓ Send request", value: "send" }, { label: "Start over", value: "restart" }, { label: "Cancel", value: "cancel" }],
      function (v) {
        if (v === "send") return sendBooking();
        if (v === "restart") { flow.data = { answers: [] }; return pickDay(); }
        cancelBooking();
      });
  }

  function sendBooking() {
    var d = flow.data;
    var notes = "Booked through the chat helper.\n" + d.answers.join("\n") + (d.details ? "\nNotes: " + d.details : "");
    var body = new URLSearchParams({
      "form-name": "booking", "bot-field": "", source: "chat helper",
      date: d.date, time: d.time, service: d.svc.service, device: d.device || "",
      name: d.name, phone: d.phone, email: "", notes: notes
    });
    var when = S.niceDate(d.date) + " at " + d.time;
    input.placeholder = "Sending…";
    fetch(C.quoteEndpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() })
      .then(function (r) { if (!r.ok) throw new Error("Request failed: " + r.status); })
      .then(function () {
        endBooking();
        reply(function () {
          bot("You're all set! 🎉 We've got your request for <strong>" + when + "</strong>. We'll text or call <strong>" + esc(d.phone) +
            "</strong> to confirm. Need to change it? Call <a href=\"" + C.phoneHref + "\">" + C.phone + "</a>.", ["directions"]);
        });
      })
      .catch(function () {
        var mail = "mailto:" + C.email + "?subject=" + encodeURIComponent("Appointment request — " + when) +
          "&body=" + encodeURIComponent("Appointment request: " + when + "\nService: " + d.svc.service +
          (d.device ? "\nDevice: " + d.device : "") + "\nName: " + d.name + "\nPhone: " + d.phone + "\n\n" + notes);
        endBooking();
        reply(function () {
          bot("Sorry, that didn't go through. You can <a href=\"" + mail + "\">send it by email instead</a> or call <a href=\"" +
            C.phoneHref + "\">" + C.phone + "</a> and we'll book you in.", ["call"]);
        });
      });
  }
})();
