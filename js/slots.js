/* Tech Care — appointment days and time slots, shared by the Schedule Repair
   page (booking.js) and the chat helper (chat.js). Built from the shop hours
   and the `booking` settings in config.js, always in the shop's time zone.
   Dates are plain {y, m (0-11), d}; keys are "YYYY-MM-DD". */
(function () {
  "use strict";
  var C = window.TECHCARE, B = C.booking;
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function shopToday() {
    var p = new Intl.DateTimeFormat("en-CA", { timeZone: C.timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date());
    var g = function (t) { return +p.find(function (x) { return x.type === t; }).value; };
    return { y: g("year"), m: g("month") - 1, d: g("day") };
  }
  function nowMinutes() {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: C.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date());
    var g = function (t) { return +p.find(function (x) { return x.type === t; }).value; };
    return g("hour") * 60 + g("minute");
  }
  function key(y, m, d) { return y + "-" + String(m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
  function weekday(y, m, d) { return new Date(Date.UTC(y, m, d)).getUTCDay(); }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
  function addDays(t, n) {
    var dt = new Date(Date.UTC(t.y, t.m, t.d + n));
    return { y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate() };
  }
  function toMin(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
  function fmtTime(m) {
    var h = Math.floor(m / 60), mm = m % 60, suffix = h >= 12 ? "pm" : "am";
    return (h % 12 || 12) + ":" + String(mm).padStart(2, "0") + " " + suffix;
  }
  function niceDate(k) {
    var p = k.split("-").map(Number);
    return DAYS[weekday(p[0], p[1] - 1, p[2])] + ", " + MONTHS[p[1] - 1] + " " + p[2];
  }

  function range() {
    var today = shopToday(), last = addDays(today, B.daysAhead);
    return { today: today, todayKey: key(today.y, today.m, today.d), last: last, lastKey: key(last.y, last.m, last.d) };
  }

  // Open start times (minutes after midnight) for a date key.
  function slotsFor(k) {
    var r = range();
    if (k < r.todayKey || k > r.lastKey || B.closedDates.indexOf(k) > -1) return [];
    var p = k.split("-").map(Number);
    var hours = C.hours[weekday(p[0], p[1] - 1, p[2])];
    if (!hours) return [];
    var start = toMin(hours[0]), end = toMin(hours[1]) - B.lastSlotBeforeClose;
    var earliest = k === r.todayKey ? nowMinutes() + B.leadMinutes : 0;
    var out = [];
    for (var t = start; t <= end; t += B.slotMinutes) if (t >= earliest) out.push(t);
    return out;
  }

  function firstOpenDay() {
    var r = range();
    for (var i = 0; i <= B.daysAhead; i++) {
      var t = addDays(r.today, i), k = key(t.y, t.m, t.d);
      if (slotsFor(k).length) return t;
    }
    return null;
  }

  window.TechCareSlots = {
    MONTHS: MONTHS, DAYS: DAYS, range: range, key: key, weekday: weekday, daysInMonth: daysInMonth,
    addDays: addDays, slotsFor: slotsFor, firstOpenDay: firstOpenDay, fmtTime: fmtTime, niceDate: niceDate
  };
})();
