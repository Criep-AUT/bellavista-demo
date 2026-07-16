// ========================================
// RESTAURANTOS INSTANCE
// BISTRIK PILOTKONFIGURATION
// ========================================
//
// Öffentlich belegte Daten wurden am 16.07.2026 geprüft.
// Fehlende Betreiberangaben bleiben bewusst leer.
//
// Sämtliche Bilder sind Demo-Platzhalter und müssen
// vor einem produktiven Einsatz ersetzt werden.
//
// ========================================


const restaurantConfig = {


  // ========================================
  // SYSTEM
  // ========================================

  system: {

    // Pflichtwerte für die Basisinitialisierung:
    // templateVersion, customerId, demoMode, currency und locale.
    templateVersion: "3.0.0",

    customerId: "bistrik-001",

    demoMode: true,

    currency: "EUR",
    locale: "de-AT"

  },


  // ========================================
  // IDENTITY
  // ========================================
  // Diese Werte haben Vorrang vor der alten
  // restaurant-Struktur und machen das Template
  // für neue Kunden konfigurierbarer.

  identity: {

    name: "Bistrik",

    fullName: "Restaurant Bistrik",

    slogan: "Bosnische & österreichische Küche · Kalsdorf bei Graz",

    logoText: "Bistrik",

    logoImage: "",
    favicon: "assets/favicon.svg",

    phone: "+43 3135 82573",

    email: "",

    website: "",

    street: "Hauptstraße 62",

    postalCode: "8401",

    city: "Kalsdorf bei Graz",

    country: "Österreich",

    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Restaurant%20Bistrik%2C%20Hauptstra%C3%9Fe%2062%2C%208401%20Kalsdorf%20bei%20Graz",

    whatsapp: "",
    instagram: "",
    facebook: "https://www.facebook.com/bisstrick/",
    tiktok: "",
    youtube: "",
    linkedin: ""

  },


  // ========================================
  // SEO
  // ========================================

  seo: {

    title: "Restaurant Bistrik | Bosnische Küche in Kalsdorf bei Graz",

    description: "Restaurant Bistrik in Kalsdorf bei Graz mit bosnischer und österreichischer Küche.",

    keywords: "restaurant bistrik, bistrik kalsdorf, bosnische küche kalsdorf, österreichische küche kalsdorf",

    author: "Restaurant Bistrik",
    robots: "noindex,nofollow",
    canonical: "",
    ogTitle: "Restaurant Bistrik in Kalsdorf bei Graz",
    ogDescription: "Bosnische und österreichische Küche in Kalsdorf bei Graz.",
    ogImage: "",
    twitterTitle: "Restaurant Bistrik in Kalsdorf bei Graz",
    twitterDescription: "Bosnische und österreichische Küche in Kalsdorf bei Graz.",
    twitterImage: "",
    themeColor: "#171311",
    language: "de-AT"

  },


  // ========================================
  // PILOT-DATENSTATUS
  // ========================================

  instance: {

    id: "bistrik",
    status: "draft",
    dataReviewedAt: "2026-07-16",
    productionReady: false,
    imageStatus: "DEMO_PLACEHOLDERS_REPLACE_BEFORE_PRODUCTION",

    sources: [
      "https://de.restaurantguru.com/Bisstrick-Kalsdorf-bei-Graz",
      "https://www.waze.com/live-map/directions/at/steiermark/kalsdorf-bei-graz/restaurant-bistrik?to=place.ChIJr5okL1m1b0cRFIdcQMKVDsg",
      "https://www.tripadvisor.de/Restaurant_Review-g4758389-d32824814-Reviews-Restaurant_Bistrik-Kalsdorf_bei_Graz_Styria.html",
      "https://www.facebook.com/bisstrick/"
    ],

    needsOwnerConfirmation: [
      "Öffnungszeiten",
      "E-Mail-Adresse",
      "offizielle Website und Canonical URL",
      "Geo-Koordinaten",
      "Zahlungsarten und Reservierungsweg",
      "Impressums- und Datenschutzdaten",
      "Logo, Markenfarben und sämtliches Bildmaterial",
      "vollständige Speisekarte und Preise"
    ]

  },


  // ========================================
  // LOCAL BUSINESS
  // ========================================
  // Leere Kontaktwerte verwenden automatisch
  // die entsprechenden Werte der Identity Engine.

  localBusiness: {

    priceRange: "€10–20",

    servesCuisine: [
      "Bosnisch",
      "Österreichisch"
    ],

    telephone: "+43 3135 82573",

    email: "",

    website: "",

    geo: {
      latitude: "",
      longitude: ""
    },

    acceptsReservations: true,

    currenciesAccepted: "EUR",

    paymentAccepted: [
      "Kreditkarte"
    ],

    areaServed: "Kalsdorf bei Graz"

  },


  // ========================================
  // LEGAL
  // ========================================

  legal: {

    company: "",

    owner: "",

    vatNumber: "",
    commercialRegister: "",
    privacyUrl: "#privacy",
    imprintUrl: "#imprint",
    copyrightText: ""

  },


  // ========================================
  // RESTAURANT-STAMMDATEN
  // ========================================
  // Diese Struktur bleibt als Fallback erhalten,
  // damit bestehende Konfigurationen weiterhin funktionieren.

  restaurant: {

    // Pflichtwerte: name, fullName und city.
    // Alle weiteren Restaurantwerte sind optional.

    name: "Bistrik",

    fullName: "Restaurant Bistrik",

    tagline: "Bosnische & österreichische Küche · Kalsdorf bei Graz",

    eyebrow: "Bosnische & österreichische Küche · Kalsdorf bei Graz",

    heroTitle: "Bistrik",

    heroSubtitle:
      "Bosnische und österreichische Küche in Kalsdorf bei Graz.",

    city: "Kalsdorf bei Graz",

    postalCode: "8401",

    street: "Hauptstraße 62",

    country: "Österreich",

    phone: "+43 3135 82573",

    email: ""

  },


  // ========================================
  // DESIGN
  // ========================================

  design: {

    // Theme-Werte steuern die zentralen CSS-Farben.
    // Fehlende Werte verwenden die Template-Defaults.
    theme: {

      name: "Bistrik Pilot",

      primary: "#c9a66b",

      primaryLight: "#e1c58f",

      background: "#171311",

      surface: "#241d19",

      text: "#f7f1e7",

      textMuted: "#beb2a4",

      success: "#78a77c",

      warning: "#c9a66b",

      danger: "#a55347"

    },

    colors: {

      background: "#171311",

      backgroundSoft: "#1e1815",

      backgroundCard: "#241d19",

      textPrimary: "#f7f1e7",

      textMuted: "#beb2a4",

      accent: "#c9a66b",

      accentLight: "#e1c58f"

    }

  },


  // ========================================
  // MODULE
  // ========================================
  //
  // Erlaubte Modulstatus:
  // included, trial, subscription, inactive, expired
  //
  // trial:
  // Ein Modul ist aktiv, solange es innerhalb des
  // Gültigkeitszeitraums liegt. Danach kann optional
  // eine Grace-Period über gracePeriodDays gelten.
  //
  // validFrom / validUntil:
  // Optionales Datum im Format YYYY-MM-DD.
  //
  // gracePeriodDays:
  // Anzahl der zusätzlichen Tage nach validUntil.
  //
  // demoMode:
  // Im Demo-Modus bleiben aktivierte Module sichtbar,
  // auch wenn ihre Statuslogik sonst nicht aktiv wäre.
  //
  // ========================================

  modules: {


    // ----------------------------------------
    // SPEISEKARTE
    // ----------------------------------------

    menu: {

      enabled: true,

      status: "included",

      validFrom: null,

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

      validFrom: null,

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 0

    },


    // ----------------------------------------
    // BEWERTUNGEN
    // ----------------------------------------

    reviews: {

      enabled: false,

      status: "inactive",

      validFrom: null,

      validUntil: null,

      gracePeriodDays: 0,

      monthlyPrice: 0

    },


    // ----------------------------------------
    // RESERVIERUNGEN
    // ----------------------------------------

    reservations: {
      enabled: true,
      status: "included",
      validFrom: null,
      validUntil: null,
      gracePeriodDays: 0,
      monthlyPrice: 19.90
    },


    // ----------------------------------------
    // ANALYTICS
    // ----------------------------------------

    analytics: {

      enabled: false,

      status: "inactive",

      validFrom: null,

      validUntil: null,

      gracePeriodDays: 0,

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

    label: "Restaurant Bistrik",

    title: "Bosnische Küche in Kalsdorf.",

    paragraphs: [

      "Das Restaurant Bistrik befindet sich in der Hauptstraße 62 in Kalsdorf bei Graz.",

      "Öffnungszeiten und Speisenangebot basieren derzeit auf öffentlich verfügbaren Verzeichnisdaten und benötigen noch die Bestätigung des Betriebs."

    ],

    // Vorhandener RestaurantOS-Demo-Platzhalter; vor Livegang ersetzen.
    image:
      "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=85"

  },


  // ========================================
  // SIGNATURE GERICHTE
  // ========================================

  signatureDishes: [

    {

      name: "Ćevapčići",

      description:
        "Im Fladenbrot mit Kajmak und Ajvar.",

      price: null,

      image: ""

    },

    {

      name: "Tarhana",

      description:
        "Suppe mit Kalbfleisch.",

      price: null,

      image: ""

    },

    {

      name: "Begova",

      description:
        "Hühnercremesuppe.",

      price: null,

      image: ""

    }

  ],


  // ========================================
  // SPEISEKARTE
  // ========================================

  menuItems: [

    {

      name: "Ćevapčići",

      description:
        "Im Fladenbrot mit Kajmak und Ajvar.",

      price: null

    },

    {

      name: "Tarhana",

      description:
        "Suppe mit Kalbfleisch.",

      price: null

    },

    {

      name: "Begova",

      description:
        "Hühnercremesuppe.",

      price: null

    }

  ],


  // ========================================
  // BEWERTUNGEN
  // ========================================

  reviews: {

    sourceText: "Noch keine freigegebenen Bewertungen",

    entries: []

  },


  // ========================================
  // ÖFFNUNGSZEITEN
  // ========================================

  openingHours: [

    {

      days: "Montag",

      hours: "11:00 – 20:00",

      schemaHours: ["Mo 11:00-20:00"]

    },

    {

      days: "Dienstag",

      hours: "11:00 – 20:00",

      schemaHours: ["Tu 11:00-20:00"]

    },

    {

      days: "Mittwoch",

      hours: "11:00 – 16:00",

      schemaHours: ["We 11:00-16:00"]

    },

    {

      days: "Donnerstag",

      hours: "Ruhetag",

      schemaHours: []

    },

    {

      days: "Freitag – Samstag",

      hours: "11:00 – 21:00",

      schemaHours: ["Fr-Sa 11:00-21:00"]

    },

    {

      days: "Sonntag",

      hours: "11:00 – 20:00",

      schemaHours: ["Su 11:00-20:00"]

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
        "Demo-Platzhalter – Restaurant-Innenraum"

    },

    {

      image:
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=85",

      alt:
        "Demo-Platzhalter – gedeckter Tisch"

    },

    {

      image:
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85",

      alt:
        "Demo-Platzhalter – Restaurant-Atmosphäre"

    },

    {

      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=85",

      alt:
        "Demo-Platzhalter – Gericht"

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
