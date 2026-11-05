/* Shop settings used by the quote form and chat helper.
   Edit these values — no other code needs to change. */
window.TECHCARE = {
  phone: "(302) 609-4060",
  phoneHref: "tel:+13026094060",
  email: "info@techcarecollectibles.com",
  address: "4720 Kirkwood Hwy, Wilmington, DE 19808",
  mapsUrl: "https://maps.app.goo.gl/MrAmSJkTdqbsVuTa9",
  timeZone: "America/New_York",

  // Opening hours by weekday (0 = Sunday). 24h "HH:MM"; null = closed.
  hours: {
    0: ["12:00", "17:00"],
    1: ["10:00", "19:00"],
    2: ["10:00", "19:00"],
    3: ["10:00", "19:00"],
    4: ["10:00", "19:00"],
    5: ["10:00", "19:00"],
    6: ["10:00", "18:00"]
  },

  // Quote requests are handled by Netlify Forms: the form in index.html is
  // posted to the site itself and shows up under Forms → "quote" in the
  // Netlify dashboard. Turn on email alerts there (Forms → Form
  // notifications) to get each request in the shop's inbox.
  quoteEndpoint: "/",

  // Appointment booking page (book.html). Requests arrive in Netlify under
  // Forms → "booking"; the shop confirms each one by text or call.
  booking: {
    slotMinutes: 30,      // length of each time slot
    lastSlotBeforeClose: 30, // no slot starts later than this many minutes before closing
    leadMinutes: 60,      // earliest bookable time is this far from now
    daysAhead: 30,        // how far ahead people can book
    closedDates: []       // holidays etc., as "YYYY-MM-DD" strings, e.g. ["2026-12-25"]
  }
};
