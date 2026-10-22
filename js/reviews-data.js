/* Customer reviews shown on reviews.html (and 3 "featured" ones on the home page).
   Short excerpts from real Google reviews — copy new ones from the Google listing,
   keep them brief, and credit the reviewer as shown on Google (first name + initial).

   type: screen | power | glass | cards | service   (drives the card color + filter) */
window.TECHCARE_REVIEWS = {
  rating: 4.9,
  count: 218,
  readUrl: "https://www.google.com/search?q=Tech+Care+Phone+repair+Hobby+Shop+Wilmington+DE#lrd=0x89c7012ae7439535:0x20eab4f4b3d4c8bd,1,,,,",
  writeUrl: "https://www.google.com/search?q=Tech+Care+Phone+repair+Hobby+Shop+Wilmington+DE#lrd=0x89c7012ae7439535:0x20eab4f4b3d4c8bd,3,,,,",

  // What reviewers mention most (Google's review topics)
  topics: [
    { label: "Friendly staff", n: 50 },
    { label: "Screen repair", n: 22 },
    { label: "Reliable phone repair", n: 8 },
    { label: "iPhone 15", n: 6 },
    { label: "Quick diagnosis", n: 5 },
    { label: "Laptop repair", n: 4 },
    { label: "Efficient repairs", n: 4 }
  ],

  list: [
    { name: "Roland T.", type: "power", tag: "Charging port · Samsung", featured: true,
      text: "Fantastic job for a fantastic price! … fixed it in 30 minutes!" },
    { name: "Michael G.", type: "service", tag: "Warranty", featured: true,
      text: "They honored their warranty and replaced the screen at no cost." },
    { name: "Patrick M.", type: "cards", tag: "Pokémon cards", featured: true,
      text: "Place is a hidden gem. … they have a huge selection of pokemon cards." },
    { name: "Selçuk O.", type: "screen", tag: "Screen + battery · iPhone 16 Pro Max",
      text: "The entire process was completed in just 1 hour, which really impressed me." },
    { name: "Gina J.", type: "power", tag: "Charging · iPhone",
      text: "Returned in about an hour and phone was ready and working beautifully." },
    { name: "Reese M.", type: "service", tag: "Shop vibes",
      text: "Best prices, quickest work, great environment… you won't be disappointed" },
    { name: "Ramil G.", type: "glass", tag: "Back glass · iPhone 14 Pro Max",
      text: "My phone looks as if I just bought it brand new" },
    { name: "Josue M.", type: "cards", tag: "Pokémon cards",
      text: "Sandra was a great help in the store! Tons of Pokemon selection!" },
    { name: "Jaz V.", type: "screen", tag: "Screen · iPhone 15",
      text: "My phone looks and works like new again." },
    { name: "Ilker Y.", type: "service", tag: "Honest advice",
      text: "They even offered options instead of charging me for a more expensive screen!" },
    { name: "OGVisuals", type: "glass", tag: "Run over — fully rebuilt",
      text: "My phone got ran over and split open … GOOD AS NEW!" },
    { name: "Jhovany T.", type: "cards", tag: "Pokémon cards",
      text: "Great variety of products and welcoming service." },
    { name: "Sergio L.", type: "power", tag: "Charging port",
      text: "I was ready to buy a new phone … he fixed it super quick" },
    { name: "Joshua G.", type: "screen", tag: "Screen · iPhone",
      text: "They fixed it in under 30 minutes." },
    { name: "Karen R.", type: "service", tag: "Phone emergency",
      text: "Liss was incredibly helpful and very determined to solve my issue." },
    { name: "Niaz C.", type: "glass", tag: "Front, back & battery",
      text: "Got my front screen, back screen and battery done within 1 hour." },
    { name: "Navy K.", type: "service", tag: "Laptop repair",
      text: "The repair was done ahead of schedule, and my laptop works perfectly now." },
    { name: "Tony P.", type: "service", tag: "Repeat customer",
      text: "Efe is wonderful, quick service and good pricing and quality" },
    { name: "Cash T.", type: "screen", tag: "Screen repair",
      text: "Fast & efficient work! 10/10 definitely recommend." },
    { name: "Nate B.", type: "screen", tag: "Screen protector",
      text: "Helped me out with putting on a new screen protector." }
  ]
};
