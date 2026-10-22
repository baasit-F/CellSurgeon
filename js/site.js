/* Tech Care — page behavior: menu, live hours, FAQ list, quote form. */
(function () {
  "use strict";
  var C = window.TECHCARE;
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- hours (always in the shop's time zone) ---------- */
  function shopNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: C.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var get = function (t) { return parts.find(function (p) { return p.type === t; }).value; };
    var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day: day, minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10) };
  }
  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function fmt(hhmm) {
    var m = toMin(hhmm), h = Math.floor(m / 60), mm = m % 60;
    var suffix = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (mm ? ":" + String(mm).padStart(2, "0") : "") + " " + suffix;
  }

  // { open: bool, text: "Open now · until 7 pm" }
  function hoursStatus() {
    var now = shopNow(), today = C.hours[now.day];
    if (today && now.minutes >= toMin(today[0]) && now.minutes < toMin(today[1])) {
      return { open: true, text: "Open now · until " + fmt(today[1]) };
    }
    if (today && now.minutes < toMin(today[0])) {
      return { open: false, text: "Closed now · opens today at " + fmt(today[0]) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7, h = C.hours[d];
      if (h) {
        var when = i === 1 ? "tomorrow" : DAY_NAMES[d];
        return { open: false, text: "Closed now · opens " + when + " at " + fmt(h[0]) };
      }
    }
    return { open: false, text: "Closed now" };
  }
  window.TechCareHours = { status: hoursStatus, now: shopNow, fmt: fmt };

  function paintHours() {
    var s = hoursStatus();
    var el = document.querySelector("[data-open-status]");
    if (el) {
      el.classList.toggle("is-open", s.open);
      el.classList.toggle("is-closed", !s.open);
      el.querySelector("[data-status-text]").textContent = s.text;
    }
    var day = shopNow().day;
    document.querySelectorAll("#hours tr[data-days]").forEach(function (tr) {
      tr.classList.toggle("is-today", tr.dataset.days.split(",").indexOf(String(day)) > -1);
    });
  }
  paintHours();
  setInterval(paintHours, 60 * 1000);

  document.getElementById("yr").textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- FAQ accordion (same content as the chat helper) ---------- */
  var faqList = document.getElementById("faq-list");
  if (faqList && window.TECHCARE_FAQ) {
    window.TECHCARE_FAQ.filter(function (f) { return f.onPage; }).forEach(function (f) {
      var d = document.createElement("details");
      d.className = "faq-item";
      d.innerHTML = "<summary></summary><div class=\"faq-a\"></div>";
      d.querySelector("summary").textContent = f.q;
      d.querySelector(".faq-a").innerHTML = typeof f.a === "function" ? f.a() : f.a;
      faqList.appendChild(d);
    });
  }

  /* ---------- quote form ---------- */
  var form = document.getElementById("quote-form");
  var done = document.querySelector(".quote-done");
  var statusEl = form.querySelector(".form-status");
  var problem = form.elements.problem;
  var submitBtn = form.querySelector("button[type=submit]");

  // Problem chips add/remove a line in the description box.
  form.querySelectorAll(".chip").forEach(function (chip) {
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", function () {
      var label = chip.dataset.problem;
      var lines = problem.value.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      var idx = lines.indexOf(label);
      if (idx > -1) lines.splice(idx, 1); else lines.unshift(label);
      problem.value = lines.join("\n") + (lines.length && idx === -1 ? "\n" : "");
      chip.setAttribute("aria-pressed", String(idx === -1));
      clearError("problem");
      problem.focus();
      problem.setSelectionRange(problem.value.length, problem.value.length);
    });
  });

  var rules = {
    device: function (v) { return v.length >= 2 || "Tell us the device or model (e.g. iPhone 13)."; },
    problem: function (v) { return v.length >= 3 || "Let us know what's wrong with it."; },
    name: function (v) { return v.length >= 2 || "Please enter your name."; },
    phone: function (v) { return v.replace(/\D/g, "").length >= 10 || "Enter a phone number with area code."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address."; }
  };

  function setError(name, msg) {
    var input = form.elements[name];
    input.closest(".field").classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    form.querySelector('[data-err-for="' + name + '"]').textContent = msg;
  }
  function clearError(name) {
    var input = form.elements[name];
    input.closest(".field").classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    form.querySelector('[data-err-for="' + name + '"]').textContent = "";
  }
  Object.keys(rules).forEach(function (name) {
    form.elements[name].addEventListener("input", function () { clearError(name); });
  });

  function validate() {
    var first = null;
    Object.keys(rules).forEach(function (name) {
      var res = rules[name](form.elements[name].value.trim());
      if (res === true) clearError(name);
      else { setError(name, res); first = first || form.elements[name]; }
    });
    if (first) first.focus();
    return !first;
  }

  function mailtoFallback(data) {
    var body = "Device / model: " + data.device + "\n\nProblem:\n" + data.problem +
      "\n\nName: " + data.name + "\nPhone: " + data.phone + "\nEmail: " + data.email;
    return "mailto:" + C.email + "?subject=" + encodeURIComponent("Repair quote request — " + data.device) +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";
    if (!validate()) return;

    var data = {
      device: form.elements.device.value.trim(),
      problem: form.elements.problem.value.trim(),
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim()
    };

    // Bots fill the hidden field; quietly pretend it worked.
    if (form.elements["bot-field"].value) { showDone(data.device); return; }

    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-label").textContent = "Sending…";

    fetch(C.quoteEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (r) { if (!r.ok) throw new Error("Request failed: " + r.status); })
      .then(function () { showDone(data.device); })
      .catch(function () {
        statusEl.className = "form-status is-error";
        statusEl.innerHTML = "Sorry — that didn't go through. You can <a href=\"" + mailtoFallback(data) +
          "\">send it by email instead</a> or call <a href=\"" + C.phoneHref + "\">" + C.phone + "</a>.";
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector(".btn-label").textContent = "Send my quote request";
      });
  });

  function showDone(device) {
    done.querySelector("[data-done-device]").textContent = device;
    form.hidden = true;
    done.hidden = false;
    done.querySelector("h3").setAttribute("tabindex", "-1");
    done.querySelector("h3").focus();
  }

  done.querySelector("[data-quote-reset]").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    done.hidden = true;
    form.hidden = false;
    form.elements.device.focus();
  });

  // Lets the chat helper jump to the form (and prefill the device if it knows it).
  window.TechCareQuote = {
    open: function (device) {
      if (device) form.elements.device.value = device;
      document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
      setTimeout(function () { (device ? problem : form.elements.device).focus({ preventScroll: true }); }, 500);
    }
  };
})();
