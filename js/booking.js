/* Tech Care — appointment booking: month calendar, time slots from the shop's
   hours (js/config.js), and the request form (Netlify Forms → "booking"). */
(function () {
  "use strict";
  var C = window.TECHCARE, S = window.TechCareSlots;
  var MONTHS = S.MONTHS, key = S.key, weekday = S.weekday, slotsFor = S.slotsFor;
  var fmtMin = S.fmtTime, niceDate = S.niceDate;
  var R = S.range(), today = R.today, todayKey = R.todayKey, last = R.last;

  var calTitle = document.querySelector("[data-cal-title]");
  var grid = document.querySelector("[data-cal-grid]");
  var prevBtn = document.querySelector("[data-cal-prev]");
  var nextBtn = document.querySelector("[data-cal-next]");
  var slotsEl = document.querySelector("[data-slots]");
  var slotsDay = document.querySelector("[data-slots-day]");
  var form = document.getElementById("book-form");
  var done = document.querySelector(".quote-done");
  var chosenEl = document.querySelector("[data-chosen]");
  var chosenText = document.querySelector("[data-chosen-text]");
  var statusEl = form.querySelector(".form-status");
  var submitBtn = form.querySelector("button[type=submit]");

  /* ---------- calendar ---------- */
  var view = { y: today.y, m: today.m };
  var picked = { date: "", time: null };

  function renderCal() {
    calTitle.textContent = MONTHS[view.m] + " " + view.y;
    prevBtn.disabled = view.y === today.y && view.m === today.m;
    nextBtn.disabled = view.y > last.y || (view.y === last.y && view.m >= last.m);
    grid.innerHTML = "";
    var lead = weekday(view.y, view.m, 1);
    var count = S.daysInMonth(view.y, view.m);
    for (var i = 0; i < lead; i++) grid.appendChild(document.createElement("span"));
    for (var d = 1; d <= count; d++) {
      var k = key(view.y, view.m, d);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = d;
      btn.dataset.date = k;
      var open = slotsFor(k).length > 0;
      btn.disabled = !open;
      if (k === todayKey) btn.classList.add("is-today");
      if (k === picked.date) btn.setAttribute("aria-pressed", "true");
      btn.setAttribute("aria-label", niceDate(k) + (open ? "" : " — not available"));
      grid.appendChild(btn);
    }
  }

  function renderSlots() {
    slotsEl.innerHTML = "";
    if (!picked.date) { slotsDay.textContent = "Choose a day above to see open times."; return; }
    var list = slotsFor(picked.date);
    slotsDay.textContent = niceDate(picked.date) + (list.length ? "" : ": no times left. Try another day.");
    list.forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "slot";
      b.textContent = fmtMin(t);
      b.dataset.time = t;
      b.setAttribute("aria-pressed", String(t === picked.time));
      slotsEl.appendChild(b);
    });
  }

  function syncChosen() {
    var ok = picked.date && picked.time !== null;
    form.elements.date.value = ok ? picked.date : "";
    form.elements.time.value = ok ? fmtMin(picked.time) : "";
    chosenEl.classList.toggle("is-set", !!ok);
    chosenText.textContent = ok ? niceDate(picked.date) + " at " + fmtMin(picked.time) : "No time picked yet";
    if (ok) setError("slot", "");
  }

  prevBtn.addEventListener("click", function () {
    view.m--; if (view.m < 0) { view.m = 11; view.y--; } renderCal();
  });
  nextBtn.addEventListener("click", function () {
    view.m++; if (view.m > 11) { view.m = 0; view.y++; } renderCal();
  });
  grid.addEventListener("click", function (e) {
    var b = e.target.closest(".cal-day");
    if (!b || b.disabled) return;
    if (picked.date !== b.dataset.date) picked.time = null;
    picked.date = b.dataset.date;
    renderCal(); renderSlots(); syncChosen();
    var first = slotsEl.querySelector(".slot");
    if (first && window.matchMedia("(max-width: 919px)").matches) {
      slotsDay.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  slotsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".slot");
    if (!b) return;
    picked.time = +b.dataset.time;
    renderSlots(); syncChosen();
  });

  // Start on the first day that still has times.
  var first = S.firstOpenDay();
  if (first) { picked.date = key(first.y, first.m, first.d); view = { y: first.y, m: first.m }; }
  renderCal(); renderSlots(); syncChosen();

  /* ---------- service chips ---------- */
  form.querySelectorAll(".chip").forEach(function (chip) {
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", function () {
      form.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
      form.elements.service.value = chip.dataset.service;
      setError("service", "");
    });
  });
  form.elements.service.addEventListener("input", function () {
    form.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", String(c.dataset.service === form.elements.service.value));
    });
  });

  /* ---------- validation + submit ---------- */
  function setError(name, msg) {
    var errEl = form.querySelector('[data-err-for="' + name + '"]');
    errEl.textContent = msg;
    var input = form.elements[name];
    if (input && input.closest && input.closest(".field")) {
      input.closest(".field").classList.toggle("has-error", !!msg);
      if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    }
  }
  var rules = {
    service: function (v) { return v.length >= 2 || "Pick a service or type what you need."; },
    name: function (v) { return v.length >= 2 || "Please enter your name."; },
    phone: function (v) { return v.replace(/\D/g, "").length >= 10 || "Enter a phone number with area code."; },
    email: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Enter a valid email address, or leave it blank."; }
  };
  Object.keys(rules).forEach(function (n) {
    form.elements[n].addEventListener("input", function () { setError(n, ""); });
  });

  function validate() {
    var first = null;
    if (!form.elements.date.value) { setError("slot", "Pick a day and time first."); first = chosenEl; }
    Object.keys(rules).forEach(function (n) {
      var r = rules[n](form.elements[n].value.trim());
      setError(n, r === true ? "" : r);
      if (r !== true && !first) first = form.elements[n];
    });
    if (first) {
      if (first === chosenEl) document.querySelector(".bk-pick").scrollIntoView({ behavior: "smooth" });
      else first.focus();
    }
    return !first;
  }

  function mailtoFallback() {
    var f = form.elements;
    var body = "Appointment request: " + chosenText.textContent + "\n\nService: " + f.service.value +
      "\nDevice: " + f.device.value + "\nName: " + f.name.value + "\nPhone: " + f.phone.value +
      "\nEmail: " + f.email.value + "\n\nNotes:\n" + f.notes.value;
    return "mailto:" + C.email + "?subject=" + encodeURIComponent("Appointment request — " + chosenText.textContent) +
      "&body=" + encodeURIComponent(body);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";
    if (!validate()) return;
    var when = chosenText.textContent;
    if (form.elements["bot-field"].value) { showDone(when); return; }

    submitBtn.disabled = true;
    submitBtn.querySelector(".btn-label").textContent = "Sending…";
    fetch(C.quoteEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (r) { if (!r.ok) throw new Error("Request failed: " + r.status); })
      .then(function () { showDone(when); })
      .catch(function () {
        statusEl.className = "form-status is-error";
        statusEl.innerHTML = "Sorry, that didn't go through. You can <a href=\"" + mailtoFallback() +
          "\">send it by email instead</a> or call <a href=\"" + C.phoneHref + "\">" + C.phone + "</a>.";
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.querySelector(".btn-label").textContent = "Request this appointment";
      });
  });

  function showDone(when) {
    done.querySelector("[data-done-when]").textContent = when;
    form.hidden = true;
    done.hidden = false;
    var h = done.querySelector("h3");
    h.setAttribute("tabindex", "-1");
    h.focus();
  }
  done.querySelector("[data-book-reset]").addEventListener("click", function () {
    form.reset();
    form.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
    picked.time = null;
    renderSlots(); syncChosen();
    done.hidden = true;
    form.hidden = false;
  });
})();
