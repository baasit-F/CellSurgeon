/* Tech Care — "Device / model" dropdown. Turns any <input data-device-picker>
   into a searchable list of models (from js/devices.js), grouped by brand.
   People can still type anything; the list only suggests. */
(function () {
  "use strict";
  var GROUPS = window.TECHCARE_DEVICES || [];
  var uid = 0;

  function squash(s) { return s.toLowerCase().replace(/[^a-z0-9+]/g, ""); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // Every word typed must appear somewhere in "group words + model"; spaces don't matter ("15pro" = "15 Pro").
  function search(q) {
    var words = q.toLowerCase().split(/\s+/).map(squash).filter(Boolean);
    var joined = words.join(""), byLength = /\d/.test(joined);   // only once a model number is typed
    var out = [];
    GROUPS.forEach(function (g) {
      var hits = [];
      g.models.forEach(function (m) {
        var hay = squash(g.group + " " + (g.also || "") + " " + m);
        if (words.every(function (w) { return hay.indexOf(w) > -1; })) {
          var starts = byLength && squash(m).indexOf(joined) > -1;   // typed text appears as one run
          hits.push({ label: m, starts: starts });
        }
      });
      // models containing what was typed as one run float to the top of their group, shortest first
      // ("iphone 13" → iPhone 13, iPhone 13 mini, iPhone 13 Pro, …); the rest keep their order
      hits.forEach(function (h, i) { h.i = i; });
      hits.sort(function (a, b) {
        if (a.starts !== b.starts) return a.starts ? -1 : 1;
        return a.starts ? a.label.length - b.label.length || a.i - b.i : a.i - b.i;
      });
      if (hits.length) out.push({ group: g.group, items: hits });
    });
    return { groups: out, words: words };
  }

  // Bold the parts of the model name that match what was typed.
  function highlight(label, words) {
    if (!words.length) return esc(label);
    var marks = new Array(label.length).fill(false);
    var squashMap = [], sq = "";
    for (var i = 0; i < label.length; i++) {
      var c = label[i].toLowerCase();
      if (/[a-z0-9+]/.test(c)) { squashMap.push(i); sq += c; }
    }
    words.forEach(function (w) {
      var at = sq.indexOf(w);
      if (at > -1) for (var k = at; k < at + w.length; k++) marks[squashMap[k]] = true;
    });
    var html = "", open = false;
    for (var j = 0; j < label.length; j++) {
      if (marks[j] && !open) { html += "<mark>"; open = true; }
      if (!marks[j] && open && /\S/.test(label[j])) { html += "</mark>"; open = false; }
      html += esc(label[j]);
    }
    return html + (open ? "</mark>" : "");
  }

  function attach(input) {
    var id = "dp-" + (++uid);
    var wrap = document.createElement("div");
    wrap.className = "dp";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var list = document.createElement("div");
    list.className = "dp-list";
    list.id = id;
    list.setAttribute("role", "listbox");
    list.hidden = true;
    wrap.appendChild(list);

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", id);
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("list");

    var options = [], active = -1;

    function render() {
      var r = search(input.value);
      options = [];
      list.innerHTML = "";
      r.groups.forEach(function (g) {
        var h = document.createElement("div");
        h.className = "dp-group";
        h.textContent = g.group;
        h.setAttribute("role", "presentation");
        list.appendChild(h);
        g.items.forEach(function (it) {
          var o = document.createElement("div");
          o.className = "dp-option";
          o.id = id + "-" + options.length;
          o.setAttribute("role", "option");
          o.dataset.value = it.label;
          o.innerHTML = highlight(it.label, r.words);
          list.appendChild(o);
          options.push(o);
        });
      });
      var foot = document.createElement("div");
      foot.className = "dp-foot";
      foot.textContent = options.length ? "Don't see yours? Just type it in." : "No match in our list. That's fine, just type your model.";
      list.appendChild(foot);
      setActive(r.words.length && options.length ? 0 : -1);
    }

    function setActive(i) {
      if (active > -1 && options[active]) options[active].classList.remove("is-active");
      active = i;
      if (active > -1 && options[active]) {
        options[active].classList.add("is-active");
        input.setAttribute("aria-activedescendant", options[active].id);
        var o = options[active], top = o.offsetTop, bottom = top + o.offsetHeight;
        if (top < list.scrollTop + 28) list.scrollTop = top - 28;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function open() {
      render();
      list.hidden = false;
      document.body.classList.add("dp-open");
      wrap.classList.add("is-open");
      input.setAttribute("aria-expanded", "true");
    }
    function close() {
      list.hidden = true;
      document.body.classList.remove("dp-open");
      wrap.classList.remove("is-open");
      input.setAttribute("aria-expanded", "false");
      setActive(-1);
    }
    function choose(o) {
      input.value = o.dataset.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));   // clears any "required" error
      close();
    }

    input.addEventListener("focus", open);
    input.addEventListener("click", function () { if (list.hidden) open(); });
    input.addEventListener("input", function (e) { if (e.isTrusted) { if (list.hidden) open(); else render(); } });
    input.addEventListener("blur", function () { setTimeout(close, 120); });
    input.addEventListener("keydown", function (e) {
      if (list.hidden && (e.key === "ArrowDown" || e.key === "ArrowUp")) { open(); e.preventDefault(); return; }
      if (list.hidden) return;
      if (e.key === "ArrowDown") { setActive(Math.min(active + 1, options.length - 1)); e.preventDefault(); }
      else if (e.key === "ArrowUp") { setActive(Math.max(active - 1, 0)); e.preventDefault(); }
      else if (e.key === "Enter" && active > -1) { choose(options[active]); e.preventDefault(); }
      else if (e.key === "Escape") { close(); e.stopPropagation(); }
      else if (e.key === "Tab") { close(); }
    });
    // mousedown (not click) so the input keeps focus while picking
    list.addEventListener("mousedown", function (e) {
      e.preventDefault();
      var o = e.target.closest(".dp-option");
      if (o) choose(o);
    });
    list.addEventListener("mousemove", function (e) {
      var o = e.target.closest(".dp-option");
      if (o) setActive(options.indexOf(o));
    });
  }

  document.querySelectorAll("input[data-device-picker]").forEach(attach);
})();
