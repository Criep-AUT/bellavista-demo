
// ========================================
// RESTAURANT WEBSITE TEMPLATE
// HAUPT-SCRIPT
// ========================================


// ========================================
// SCROLL-POSITION
// ========================================

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}


// ========================================
// KONFIGURATION LADEN
// ========================================

const config = window.restaurantConfig;

if (!config) {
  console.error(
    "Fehler: restaurantConfig wurde nicht gefunden. " +
    "Prüfe, ob config.js vor script.js geladen wird."
  );
}


// ========================================
// HILFSFUNKTIONEN
// ========================================

function getElement(selector) {
  return document.querySelector(selector);
}


function getAllElements(selector) {
  return document.querySelectorAll(selector);
}


function setText(selector, value) {

  const element = getElement(selector);

  if (!element || value === undefined || value === null) {
    return;
  }

  element.textContent = value;
}


function setImage(selector, src, alt = "") {

  const image = getElement(selector);

  if (!image || !src) {
    return;
  }

  image.src = src;
  image.alt = alt;
}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatPrice(price) {

  if (price === undefined || price === null) {
    return "";
  }

  const locale =
    config?.system?.locale || "de-AT";

  const currency =
    config?.system?.currency || "EUR";

  return new Intl.NumberFormat(
    locale,
    {
      style: "currency",
      currency: currency
    }
  ).format(price);
}


function formatRating(rating) {

  if (rating === undefined || rating === null) {
    return "";
  }

  return Number(rating)
    .toFixed(1)
    .replace(".", ",");
}


function formatDateForInput(date) {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ========================================
// MODUL-LOGIK
// ========================================

function getModuleStatus(moduleName) {

  const moduleConfig =
    config?.modules?.[moduleName];

  if (!moduleConfig) {
    return "inactive";
  }

  if (!moduleConfig.enabled) {
    return "inactive";
  }


  // Im Demo-Modus bleiben aktivierte Module sichtbar.

  if (config?.system?.demoMode === true) {
    return moduleConfig.status || "included";
  }


  const status =
    moduleConfig.status || "inactive";


  // Dauerhaft enthalten

  if (status === "included") {
    return "included";
  }


  // Aktives Abo

  if (status === "subscription") {
    return "subscription";
  }


  // Manuell deaktiviert oder abgelaufen

  if (
    status === "inactive" ||
    status === "expired"
  ) {
    return status;
  }


  // Testphase prüfen

  if (status === "trial") {

    const now = new Date();


    if (moduleConfig.validFrom) {

      const validFrom =
        new Date(
          `${moduleConfig.validFrom}T00:00:00`
        );

      if (now < validFrom) {
        return "inactive";
      }

    }


    if (!moduleConfig.validUntil) {
      return "trial";
    }


    const validUntil =
      new Date(
        `${moduleConfig.validUntil}T23:59:59`
      );


    if (now <= validUntil) {
      return "trial";
    }


    const gracePeriodDays =
      Number(
        moduleConfig.gracePeriodDays || 0
      );


    const graceUntil =
      new Date(validUntil);

    graceUntil.setDate(
      graceUntil.getDate() + gracePeriodDays
    );


    if (now <= graceUntil) {
      return "grace";
    }


    return "expired";

  }


  return "inactive";
}


function isModuleActive(moduleName) {

  const status =
    getModuleStatus(moduleName);

  return [
    "included",
    "trial",
    "subscription",
    "grace"
  ].includes(status);
}


function applyModuleVisibility() {

  const moduleSections =
    getAllElements("[data-module-section]");


  moduleSections.forEach((element) => {

    const moduleName =
      element.dataset.moduleSection;

    const active =
      isModuleActive(moduleName);

    element.hidden = !active;

  });


  const moduleLinks =
    getAllElements("[data-module-link]");


  moduleLinks.forEach((element) => {

    const moduleName =
      element.dataset.moduleLink;

    const active =
      isModuleActive(moduleName);

    element.hidden = !active;

  });

}


// ========================================
// DESIGNFARBEN
// ========================================

function applyDesign() {

  const colors =
    config?.design?.colors;

  if (!colors) {
    return;
  }


  const root =
    document.documentElement;


  if (colors.background) {
    root.style.setProperty(
      "--bg",
      colors.background
    );
  }


  if (colors.backgroundSoft) {
    root.style.setProperty(
      "--bg-soft",
      colors.backgroundSoft
    );
  }


  if (colors.backgroundCard) {
    root.style.setProperty(
      "--bg-card",
      colors.backgroundCard
    );
  }


  if (colors.textPrimary) {
    root.style.setProperty(
      "--cream",
      colors.textPrimary
    );
  }


  if (colors.textMuted) {
    root.style.setProperty(
      "--muted",
      colors.textMuted
    );
  }


  if (colors.accent) {
    root.style.setProperty(
      "--gold",
      colors.accent
    );
  }


  if (colors.accentLight) {
    root.style.setProperty(
      "--gold-light",
      colors.accentLight
    );
  }

}


// ========================================
// RESTAURANT-STAMMDATEN
// ========================================

function renderRestaurantData() {

  const restaurant =
    config?.restaurant;

  if (!restaurant) {
    return;
  }


  setText(
    "#restaurant-logo",
    restaurant.name?.toUpperCase()
  );


  setText(
    "#hero-eyebrow",
    restaurant.eyebrow
  );


  setText(
    "#hero-title",
    restaurant.heroTitle
  );


  setText(
    "#hero-subtitle",
    restaurant.heroSubtitle
  );


  setText(
    "#visit-title",
    `${restaurant.city}. Ein Ort zum Genießen.`
  );


  setText(
    "#address-name",
    restaurant.fullName
  );


  setText(
    "#footer-brand",
    restaurant.name?.toUpperCase()
  );


  setText(
    "#footer-tagline",
    restaurant.tagline
  );


  setText(
    "#footer-copyright",
    `© ${new Date().getFullYear()} ${restaurant.fullName}`
  );


  const addressDetails =
    getElement("#address-details");


  if (addressDetails) {

    addressDetails.innerHTML = `
      ${escapeHtml(restaurant.street || "")}
      <br>

      ${escapeHtml(restaurant.postalCode || "")}
      ${escapeHtml(restaurant.city || "")}

      <br><br>

      ${escapeHtml(restaurant.phone || "")}
      <br>

      ${escapeHtml(restaurant.email || "")}
    `;

  }


  const routeLink =
    getElement("#route-link");


  if (routeLink) {

    const fullAddress = [
      restaurant.street,
      restaurant.postalCode,
      restaurant.city,
      restaurant.country
    ]
      .filter(Boolean)
      .join(", ");


    routeLink.href =
      `https://www.google.com/maps/search/?api=1&query=${
        encodeURIComponent(fullAddress)
      }`;


    routeLink.target = "_blank";

    routeLink.rel = "noopener noreferrer";

  }


  document.title =
    `${restaurant.fullName} | ${restaurant.tagline}`;


  const metaDescription =
    getElement('meta[name="description"]');


  if (metaDescription) {

    metaDescription.content =
      `${restaurant.fullName} in ${restaurant.city}. ` +
      `${restaurant.heroSubtitle}`;

  }

}


// ========================================
// ÜBER UNS
// ========================================

function renderAbout() {

  const about =
    config?.about;

  if (!about) {
    return;
  }


  setText(
    "#about-label",
    about.label
  );


  setText(
    "#about-title",
    about.title
  );


  setImage(
    "#about-image",
    about.image,
    `${config.restaurant.fullName} – Über uns`
  );


  const paragraphsContainer =
    getElement("#about-paragraphs");


  if (!paragraphsContainer) {
    return;
  }


  const paragraphs =
    Array.isArray(about.paragraphs)
      ? about.paragraphs
      : [];


  paragraphsContainer.innerHTML =
    paragraphs
      .map((paragraph) => `
        <p class="section-text">
          ${escapeHtml(paragraph)}
        </p>
      `)
      .join("");

}


// ========================================
// SIGNATURE GERICHTE
// ========================================

function renderSignatureDishes() {

  const container =
    getElement("#signature-dishes");


  if (!container) {
    return;
  }


  const dishes =
    Array.isArray(config?.signatureDishes)
      ? config.signatureDishes
      : [];


  container.innerHTML =
    dishes
      .map((dish) => `

        <article class="dish-card reveal">

          <div class="dish-image-wrap">

            <img
              src="${escapeHtml(dish.image || "")}"
              alt="${escapeHtml(dish.name || "Gericht")}"
              loading="lazy"
            >

          </div>


          <div class="dish-content">

            <h3 class="dish-title">
              ${escapeHtml(dish.name || "")}
            </h3>


            <p class="dish-description">
              ${escapeHtml(dish.description || "")}
            </p>


            <div class="dish-price">
              ${formatPrice(dish.price)}
            </div>

          </div>

        </article>

      `)
      .join("");

}


// ========================================
// SPEISEKARTE
// ========================================

function renderMenu() {

  const container =
    getElement("#menu-items");


  if (!container) {
    return;
  }


  const items =
    Array.isArray(config?.menuItems)
      ? config.menuItems
      : [];


  container.innerHTML =
    items
      .map((item) => `

        <div class="menu-item reveal">

          <div class="menu-top">

            <span class="menu-name">
              ${escapeHtml(item.name || "")}
            </span>


            <span class="menu-price">
              ${formatPrice(item.price)}
            </span>

          </div>


          <p class="menu-description">
            ${escapeHtml(item.description || "")}
          </p>

        </div>

      `)
      .join("");

}


// ========================================
// GALERIE
// ========================================

function renderGallery() {

  const container =
    getElement("#gallery-grid");


  if (!container) {
    return;
  }


  const images =
    Array.isArray(config?.gallery)
      ? config.gallery
      : [];


  container.innerHTML =
    images
      .map((image, index) => {

        let extraClass = "";


        if (index === 0) {
          extraClass = "gallery-large";
        }


        if (index === 3) {
          extraClass = "gallery-wide";
        }


        return `

          <figure
            class="gallery-item ${extraClass} reveal"
          >

            <img
              src="${escapeHtml(image.image || "")}"
              alt="${escapeHtml(image.alt || "Restaurant")}"
              loading="lazy"
            >

          </figure>

        `;

      })
      .join("");

}


// ========================================
// BEWERTUNGEN
// ========================================

function renderReviews() {

  const reviews =
    config?.reviews;


  if (!reviews) {
    return;
  }


  setText(
    "#rating-score",
    formatRating(reviews.rating)
  );


  setText(
    "#rating-source",
    reviews.sourceText
  );


  const container =
    getElement("#reviews-grid");


  if (!container) {
    return;
  }


  const entries =
    Array.isArray(reviews.entries)
      ? reviews.entries
      : [];


  container.innerHTML =
    entries
      .map((review) => {

        const stars =
          "★".repeat(
            Math.max(
              0,
              Math.min(
                5,
                Number(review.rating || 0)
              )
            )
          );


        return `

          <article class="review-card reveal">

            <div class="review-stars">
              ${stars}
            </div>


            <blockquote>
              „${escapeHtml(review.text || "")}“
            </blockquote>


            <p class="review-author">
              — ${escapeHtml(review.author || "")}
            </p>

          </article>

        `;

      })
      .join("");

}


// ========================================
// ÖFFNUNGSZEITEN
// ========================================

function renderOpeningHours() {

  const container =
    getElement("#opening-hours");


  if (!container) {
    return;
  }


  const openingHours =
    Array.isArray(config?.openingHours)
      ? config.openingHours
      : [];


  container.innerHTML =
    openingHours
      .map((entry) => `

        <div class="hours-row">

          <span>
            ${escapeHtml(entry.days || "")}
          </span>


          <span>
            ${escapeHtml(entry.hours || "")}
          </span>

        </div>

      `)
      .join("");

}


// ========================================
// SCROLL-ANIMATIONEN
// ========================================

function initializeRevealAnimations() {

  const revealElements =
    getAllElements(".reveal");


  if (!("IntersectionObserver" in window)) {

    revealElements.forEach((element) => {
      element.classList.add("visible");
    });

    return;

  }


  const revealObserver =
    new IntersectionObserver(

      (entries, observer) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },

      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }

    );


  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

}


// ========================================
// NAVIGATION
// ========================================

function initializeNavigation() {

  const navbar =
    getElement(".navbar");

  const menuToggle =
    getElement(".menu-toggle");

  const navLinks =
    getElement(".nav-links");

  const navigationLinks =
    getAllElements(".nav-links a");


  function openMenu() {

    if (!menuToggle || !navLinks) {
      return;
    }


    menuToggle.classList.add("active");

    navLinks.classList.add("active");

    document.body.classList.add(
      "menu-open"
    );


    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );


    menuToggle.setAttribute(
      "aria-label",
      "Menü schließen"
    );

  }


  function closeMenu() {

    if (!menuToggle || !navLinks) {
      return;
    }


    menuToggle.classList.remove("active");

    navLinks.classList.remove("active");

    document.body.classList.remove(
      "menu-open"
    );


    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );


    menuToggle.setAttribute(
      "aria-label",
      "Menü öffnen"
    );

  }


  function toggleMenu() {

    if (!navLinks) {
      return;
    }


    const isOpen =
      navLinks.classList.contains(
        "active"
      );


    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  }


  if (menuToggle && navLinks) {

    menuToggle.addEventListener(
      "click",
      toggleMenu
    );

  }


  navigationLinks.forEach((link) => {

    link.addEventListener(
      "click",
      closeMenu
    );

  });


  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {
        closeMenu();
      }

    }
  );


  function updateNavbar() {

    if (!navbar) {
      return;
    }


    if (window.scrollY > 40) {

      navbar.classList.add(
        "scrolled"
      );

    } else {

      navbar.classList.remove(
        "scrolled"
      );

    }

  }


  window.addEventListener(
    "scroll",
    updateNavbar,
    {
      passive: true
    }
  );


  updateNavbar();


  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth > 900) {
        closeMenu();
      }

    }
  );

}


// ========================================
// RESERVIERUNGSFORMULAR
// ========================================

function initializeReservationForm() {

  const reservationForm =
    getElement("#reservation-form");

  const reservationDate =
    getElement(
      'input[name="date"]'
    );


  function setMinimumReservationDate() {

    if (!reservationDate) {
      return;
    }


    reservationDate.min =
      formatDateForInput(
        new Date()
      );

  }


  setMinimumReservationDate();


  if (!reservationForm) {
    return;
  }


  reservationForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();


      const formData =
        new FormData(reservationForm);


      const guestName =
        formData.get("name");


      const reservationDay =
        formData.get("date");


      const guests =
        formData.get("guests");


      alert(
        `Danke ${guestName}!\n\n` +

        `Ihre Reservierungsanfrage für ` +
        `${guests} Person(en) am ` +
        `${reservationDay} wurde in dieser Demo erfasst.\n\n` +

        `In der echten Restaurant-Version wird die Anfrage ` +
        `direkt an ${config.restaurant.fullName} übermittelt.`
      );


      reservationForm.reset();

      setMinimumReservationDate();

    }
  );

}


// ========================================
// SEITENSTART
// ========================================

function initializeWebsite() {

  if (!config) {
    return;
  }


  applyDesign();

  renderRestaurantData();

  renderAbout();

  renderSignatureDishes();

  renderMenu();

  renderGallery();

  renderReviews();

  renderOpeningHours();

  applyModuleVisibility();

  initializeNavigation();

  initializeReservationForm();

  initializeRevealAnimations();

}


// ========================================
// WEBSITE STARTEN
// ========================================

initializeWebsite();


// ========================================
// BEIM NORMALEN SEITENAUFRUF OBEN STARTEN
// ========================================

window.addEventListener(
  "load",
  () => {

    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

  }
);
