// ========================================
// RESTAURANT WEBSITE TEMPLATE
// ZENTRALE KONFIGURATION
// ========================================
//
// Diese Datei enthält alle kundenspezifischen
// Einstellungen der Restaurant-Website.
//
// Ziel:
// Für einen neuen Kunden sollen möglichst nur
// die Werte in dieser Datei geändert werden.
//
// ========================================


const restaurantConfig = {


  // ========================================
  // SYSTEM
  // ========================================

  system: {

    templateVersion: "1.0.0",

    customerId: "bellavista-001",

    demoMode: true,

    currency: "EUR",

    locale: "de-AT"

  },


  // ========================================
  // RESTAURANT-STAMMDATEN
  // ========================================

  restaurant: {

    name: "Bellavista",

    fullName: "Ristorante Bellavista",

    tagline: "Cucina Italiana · Graz",

    eyebrow: "Cucina Italiana · Graz",

    heroTitle: "Bellavista",

    heroSubtitle:
      "Wo italienische Tradition auf moderne Gastfreundschaft trifft.",

    city: "Graz",

    postalCode: "8010",

    street: "Musterstraße 12",

    country: "Österreich",

    phone: "+43 316 123456",

    email: "ciao@bellavista.at"

  },


  // ========================================
  // DESIGN
  // ========================================

  design: {

    colors: {

      background: "#11100f",

      backgroundSoft: "#181715",

      backgroundCard: "#1d1b19",

      textPrimary: "#f5f0e6",

      textMuted: "#b9b1a4",

      accent: "#d6b77a",

      accentLight: "#ead29f"

    }

  },


  // ========================================
  // MODULE
  // ========================================
  //
  // Mögliche Status:
  //
  // included
  // trial
  // subscription
  // inactive
  // expired
  //
  // ========================================

  modules: {


    // ----------------------------------------
    // SPEISEKARTE
    // ----------------------------------------

    menu: {

      enabled: true,

      status: "included",

      validFrom: "2026-07-14",

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 0

    },


    // ----------------------------------------
    // GALERIE
    // ----------------------------------------

    gallery: {

      enabled: true,

      status: "included",

      validFrom: "2026-07-14",

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 0

    },


    // ----------------------------------------
    // BEWERTUNGEN
    // ----------------------------------------

    reviews: {

      enabled: true,

      status: "included",

      validFrom: "2026-07-14",

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 0

    },


    // ----------------------------------------
    // RESERVIERUNGEN
    // ----------------------------------------

    reservations: {

      enabled: true,

      status: "trial",

      validFrom: "2026-07-14",

      validUntil: "2026-10-14",

      gracePeriodDays: 7,

      monthlyPrice: 19.90

    },


    // ----------------------------------------
    // ANALYTICS
    // ----------------------------------------

    analytics: {

      enabled: true,

      status: "trial",

      validFrom: "2026-07-14",

      validUntil: "2026-10-14",

      gracePeriodDays: 7,

      monthlyPrice: 14.90

    },


    // ----------------------------------------
    // GOOGLE SICHTBARKEIT
    // ----------------------------------------

    googleVisibility: {

      enabled: false,

      status: "inactive",

      validFrom: null,

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 39.90

    },


    // ----------------------------------------
    // KI SICHTBARKEIT
    // ----------------------------------------

    aiVisibility: {

      enabled: false,

      status: "inactive",

      validFrom: null,

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 29.90

    },


    // ----------------------------------------
    // FRIENDLY REMINDER
    // ----------------------------------------

    friendlyReminder: {

      enabled: false,

      status: "inactive",

      validFrom: null,

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 9.90

    }

  },


  // ========================================
  // ÜBER UNS
  // ========================================

  about: {

    label: "La nostra storia",

    title: "Italien beginnt am Tisch.",

    paragraphs: [

      "Im Bellavista verbinden wir traditionelle italienische Rezepte mit modernen Ideen und sorgfältig ausgewählten Zutaten.",

      "Hausgemachte Pasta, aromatische Tomaten, feines Olivenöl und ehrliche Gastfreundschaft stehen im Mittelpunkt unserer Küche."

    ],

    image:
      "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=85"

  },


  // ========================================
  // SIGNATURE GERICHTE
  // ========================================

  signatureDishes: [

    {

      name: "Tagliatelle al Tartufo",

      description:
        "Hausgemachte Tagliatelle, Trüffelcreme und Parmigiano Reggiano.",

      price: 21.90,

      image:
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85"

    },

    {

      name: "Pizza Bellavista",

      description:
        "San-Marzano-Tomaten, Fior di Latte, Prosciutto und Rucola.",

      price: 16.90,

      image:
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85"

    },

    {

      name: "Tiramisù Classico",

      description:
        "Mascarpone, Espresso, Savoiardi und feiner Kakao.",

      price: 8.50,

      image:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=900&q=85"

    }

  ],


  // ========================================
  // SPEISEKARTE
  // ========================================

  menuItems: [

    {

      name: "Bruschetta Classica",

      description:
        "Geröstetes Brot, Tomaten, Basilikum und natives Olivenöl.",

      price: 8.90

    },

    {

      name: "Burrata Pugliese",

      description:
        "Cremige Burrata, Tomaten, Basilikum und Olivenöl.",

      price: 13.90

    },

    {

      name: "Spaghetti Carbonara",

      description:
        "Guanciale, Pecorino Romano, Eigelb und schwarzer Pfeffer.",

      price: 17.90

    },

    {

      name: "Risotto ai Funghi",

      description:
        "Cremiges Risotto mit Pilzen, Parmesan und Kräutern.",

      price: 19.50

    },

    {

      name: "Saltimbocca alla Romana",

      description:
        "Kalbfleisch, Prosciutto, Salbei und Weißweinjus.",

      price: 24.90

    },

    {

      name: "Panna Cotta",

      description:
        "Klassische Panna Cotta mit saisonalen Früchten.",

      price: 7.90

    }

  ],


  // ========================================
  // BEWERTUNGEN
  // ========================================

  reviews: {

    rating: 4.8,

    sourceText: "Beispielbewertung · Demo",

    entries: [

      {

        author: "Anna M.",

        rating: 5,

        text:
          "Wunderbares Essen, großartige Atmosphäre und ein Service, bei dem man sich sofort willkommen fühlt."

      },

      {

        author: "Markus K.",

        rating: 5,

        text:
          "Die Pasta war hervorragend und das Ambiente perfekt für einen entspannten Abend zu zweit."

      },

      {

        author: "Julia S.",

        rating: 5,

        text:
          "Von der Vorspeise bis zum Tiramisù einfach ausgezeichnet. Wir kommen definitiv wieder."

      }

    ]

  },


  // ========================================
  // ÖFFNUNGSZEITEN
  // ========================================

  openingHours: [

    {

      days: "Montag",

      hours: "Ruhetag"

    },

    {

      days: "Dienstag – Donnerstag",

      hours: "11:30 – 14:30 / 17:30 – 22:00"

    },

    {

      days: "Freitag – Samstag",

      hours: "11:30 – 23:00"

    },

    {

      days: "Sonntag",

      hours: "11:30 – 21:00"

    }

  ],


  // ========================================
  // GALERIE
  // ========================================

  gallery: [

    {

      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85",

      alt:
        "Stilvoller Restaurant-Innenraum"

    },

    {

      image:
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=85",

      alt:
        "Gemütlicher Tisch im Restaurant"

    },

    {

      image:
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85",

      alt:
        "Restaurant-Atmosphäre am Abend"

    },

    {

      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85",

      alt:
        "Italienisches Gericht im Bellavista"

    }

  ]

};


// ========================================
// KONFIGURATION GLOBAL VERFÜGBAR MACHEN
// ========================================
//
// Dadurch kann script.js später auf die
// Konfiguration zugreifen.
//
// ========================================

window.restaurantConfig = restaurantConfig;
