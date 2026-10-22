/* Tech Care — review "trading cards", rating badges and the holo tilt effect.
   Used on both index.html (featured teaser) and reviews.html (full binder). */
(function () {
  "use strict";
  var R = window.TECHCARE_REVIEWS;
  if (!R) return;

  var TYPES = {
    screen:  { label: "Screen",  icon: '<rect x="11" y="4" width="18" height="32" rx="4"/><path d="M15 12l5 6-3 4 6 7M24 14l-3 4"/>' },
    power:   { label: "Power",   icon: '<path d="M23 4 11 22h8l-3 14 13-19h-8z"/>' },
    glass:   { label: "Glass",   icon: '<rect x="11" y="4" width="18" height="32" rx="4"/><rect x="14" y="7" width="7" height="9" rx="2"/><circle cx="17.5" cy="11.5" r="1.6"/>' },
    cards:   { label: "Cards",   icon: '<rect x="8" y="9" width="16" height="23" rx="2.5" transform="rotate(-10 16 20)"/><rect x="16" y="7" width="16" height="23" rx="2.5" transform="rotate(8 24 18)"/>' },
    service: { label: "Service", icon: '<path d="M20 34s-12-7.5-12-16a7 7 0 0 1 12-4.8A7 7 0 0 1 32 18c0 8.5-12 16-12 16z"/>' }
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function pad(n) { return String(n).padStart(3, "0"); }

  function card(r, i) {
    var t = TYPES[r.type] || TYPES.service;
    return '<article class="rcard rcard--' + r.type + ' holo" data-type="' + r.type + '">' +
      '<div class="rcard-inner">' +
        '<header class="rcard-top"><span class="rcard-name">' + esc(r.name) + '</span>' +
          '<span class="rcard-hp" aria-label="5 out of 5 stars">★★★★★</span></header>' +
        '<div class="rcard-art">' +
          '<svg viewBox="0 0 40 40" aria-hidden="true">' + t.icon + '</svg>' +
          '<span class="rcard-type">' + t.label + ' type</span>' +
        '</div>' +
        '<p class="rcard-tag">' + esc(r.tag) + '</p>' +
        '<blockquote class="rcard-text">“' + esc(r.text) + '”</blockquote>' +
        '<footer class="rcard-foot"><span>Google review</span><span>No. ' + pad(i + 1) + '/' + R.count + '</span></footer>' +
      '</div>' +
      '<span class="holo-shine" aria-hidden="true"></span>' +
    '</article>';
  }

  /* ---------- numbers & links from the data file ---------- */
  document.querySelectorAll("[data-rating]").forEach(function (el) { el.textContent = R.rating.toFixed(1); });
  document.querySelectorAll("[data-review-count]").forEach(function (el) { el.textContent = R.count; });
  document.querySelectorAll("[data-reviews-read]").forEach(function (el) { el.href = R.readUrl; });
  document.querySelectorAll("[data-reviews-write]").forEach(function (el) { el.href = R.writeUrl; });

  /* ---------- home page teaser ---------- */
  var teaser = document.getElementById("review-teaser");
  if (teaser) {
    teaser.innerHTML = R.list.map(function (r, i) { return r.featured ? card(r, i) : ""; }).join("");
  }

  /* ---------- reviews page: topic bars ---------- */
  var topics = document.getElementById("topics");
  if (topics) {
    var max = Math.max.apply(null, R.topics.map(function (t) { return t.n; }));
    topics.innerHTML = R.topics.map(function (t) {
      return '<li><span class="topic-label">' + esc(t.label) + '</span>' +
        '<span class="topic-bar"><span style="--w:' + (t.n / max * 100).toFixed(1) + '%"></span></span>' +
        '<span class="topic-n">' + t.n + '</span></li>';
    }).join("");
  }

  /* ---------- reviews page: binder + filters ---------- */
  var grid = document.getElementById("review-grid");
  if (grid) {
    grid.innerHTML = R.list.map(card).join("");
    var buttons = document.querySelectorAll("[data-filter]");
    buttons.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.dataset.filter;
        buttons.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        grid.querySelectorAll(".rcard").forEach(function (c) {
          c.hidden = f !== "all" && c.dataset.type !== f;
        });
      });
    });
  }

  if (window.TechCareReveal) window.TechCareReveal();

  /* ---------- holo tilt (mouse / pen only) ---------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fine && !still) {
    document.addEventListener("pointermove", function (e) {
      var el = e.target.closest && e.target.closest(".holo");
      if (!el) return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
      el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      el.style.setProperty("--ry", ((x - 0.5) * 14).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - y) * 14).toFixed(2) + "deg");
      el.classList.add("is-active");
    });
    document.addEventListener("pointerout", function (e) {
      var el = e.target.closest && e.target.closest(".holo");
      if (el && !el.contains(e.relatedTarget)) {
        el.classList.remove("is-active");
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
      }
    });
  }
})();
