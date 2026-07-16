
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

let config = window.restaurantConfig || null;
let configValidation = null;


function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}


function isValidDateString(value) {
  if (typeof value !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === value;
}


function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}


function resolveConfigValue(configObject, key, fallbackValue = "") {
  if (!isPlainObject(configObject)) {
    return fallbackValue;
  }

  if (!Object.prototype.hasOwnProperty.call(configObject, key)) {
    return fallbackValue;
  }

  const value = configObject[key];

  if (value === null || value === undefined) {
    return fallbackValue;
  }

  if (typeof value === "string") {
    return value.trim() || fallbackValue;
  }

  return value;
}


function getIdentityValue(key, fallbackValue = "") {
  const identityConfig = isPlainObject(config?.identity)
    ? config.identity
    : null;

  if (identityConfig && Object.prototype.hasOwnProperty.call(identityConfig, key)) {
    const identityValue = resolveConfigValue(identityConfig, key, "");
    return identityValue || fallbackValue;
  }

  const restaurantConfig = isPlainObject(config?.restaurant)
    ? config.restaurant
    : null;

  const restaurantValue = resolveConfigValue(restaurantConfig, key, "");

  return restaurantValue || fallbackValue;
}


function isValidAbsoluteUrl(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return ["http:", "https:"].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}


function pushConfigIssue(result, type, message) {
  if (type === "error") {
    result.errors.push(message);
  } else {
    result.warnings.push(message);
  }
}


function validateRestaurantConfig(configToValidate) {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  if (!isPlainObject(configToValidate)) {
    pushConfigIssue(
      result,
      "error",
      "restaurantConfig fehlt vollständig oder ist ungültig."
    );

    result.valid = false;
    return result;
  }


  const system = configToValidate.system;

  if (!isPlainObject(system)) {
    pushConfigIssue(
      result,
      "error",
      "system ist erforderlich."
    );
  } else {
    if (!isNonEmptyString(system.customerId)) {
      pushConfigIssue(
        result,
        "error",
        "system.customerId ist ein nicht leerer String."
      );
    }

    if (!isNonEmptyString(system.templateVersion)) {
      pushConfigIssue(
        result,
        "error",
        "system.templateVersion ist ein nicht leerer String."
      );
    }

    if (typeof system.demoMode !== "boolean") {
      pushConfigIssue(
        result,
        "error",
        "system.demoMode muss ein Boolean sein."
      );
    }

    if (!isNonEmptyString(system.currency)) {
      pushConfigIssue(
        result,
        "error",
        "system.currency ist ein nicht leerer String."
      );
    }

    if (!isNonEmptyString(system.locale)) {
      pushConfigIssue(
        result,
        "error",
        "system.locale ist ein nicht leerer String."
      );
    }
  }


  const restaurant = configToValidate.restaurant;
  const identity = configToValidate.identity;

  const effectiveIdentityName = resolveConfigValue(
    identity,
    "name",
    resolveConfigValue(restaurant, "name", "")
  );

  const effectiveIdentityFullName = resolveConfigValue(
    identity,
    "fullName",
    resolveConfigValue(restaurant, "fullName", "")
  );

  const effectiveIdentityCity = resolveConfigValue(
    identity,
    "city",
    resolveConfigValue(restaurant, "city", "")
  );

  if (!isNonEmptyString(effectiveIdentityName)) {
    pushConfigIssue(
      result,
      "error",
      "identity.name ist ein nicht leerer String."
    );
  }

  if (!isNonEmptyString(effectiveIdentityFullName)) {
    pushConfigIssue(
      result,
      "error",
      "identity.fullName ist ein nicht leerer String."
    );
  }

  if (!isNonEmptyString(effectiveIdentityCity)) {
    pushConfigIssue(
      result,
      "error",
      "identity.city ist ein nicht leerer String."
    );
  }

  if (!isPlainObject(restaurant)) {
    pushConfigIssue(
      result,
      "warning",
      "restaurant ist nicht konfiguriert. Die identity-Struktur wird verwendet."
    );
  } else {
    if (!isNonEmptyString(restaurant.phone)) {
      pushConfigIssue(
        result,
        "warning",
        "restaurant.phone ist optional und kann leer bleiben."
      );
    }

    if (!isNonEmptyString(restaurant.email)) {
      pushConfigIssue(
        result,
        "warning",
        "restaurant.email ist optional und kann leer bleiben."
      );
    }
  }


  const modules = configToValidate.modules;

  if (modules === undefined) {
    pushConfigIssue(
      result,
      "warning",
      "modules ist nicht konfiguriert. Alle optionalen Module bleiben ausgeblendet."
    );
  } else if (!isPlainObject(modules)) {
    pushConfigIssue(
      result,
      "warning",
      "modules muss ein Objekt sein. Alle optionalen Module bleiben ausgeblendet."
    );
  } else {
    const allowedStatuses = [
      "included",
      "trial",
      "subscription",
      "inactive",
      "expired"
    ];

    Object.entries(modules).forEach(([moduleName, moduleConfig]) => {
      if (!isPlainObject(moduleConfig)) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName} ist ungültig.`
        );
        return;
      }

      if (typeof moduleConfig.enabled !== "boolean") {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.enabled muss ein Boolean sein.`
        );
      }

      if (
        typeof moduleConfig.status !== "string" ||
        !allowedStatuses.includes(moduleConfig.status)
      ) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.status ist ungültig.`
        );
      }

      if (
        moduleConfig.validFrom !== null &&
        moduleConfig.validFrom !== undefined &&
        !isValidDateString(moduleConfig.validFrom)
      ) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.validFrom muss YYYY-MM-DD sein oder null.`
        );
      }

      if (
        moduleConfig.validUntil !== null &&
        moduleConfig.validUntil !== undefined &&
        !isValidDateString(moduleConfig.validUntil)
      ) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.validUntil muss YYYY-MM-DD sein oder null.`
        );
      }

      if (
        moduleConfig.validFrom &&
        moduleConfig.validUntil &&
        moduleConfig.validUntil < moduleConfig.validFrom
      ) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.validUntil darf nicht vor validFrom liegen.`
        );
      }

      if (
        typeof moduleConfig.gracePeriodDays !== "number" ||
        Number.isNaN(moduleConfig.gracePeriodDays) ||
        moduleConfig.gracePeriodDays < 0
      ) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.gracePeriodDays muss eine nicht negative Zahl sein.`
        );
      }

      if (
        typeof moduleConfig.monthlyPrice !== "number" ||
        Number.isNaN(moduleConfig.monthlyPrice) ||
        moduleConfig.monthlyPrice < 0
      ) {
        pushConfigIssue(
          result,
          "warning",
          `modules.${moduleName}.monthlyPrice muss eine nicht negative Zahl sein.`
        );
      }
    });
  }


  [
    ["signatureDishes", configToValidate.signatureDishes],
    ["menuItems", configToValidate.menuItems],
    ["openingHours", configToValidate.openingHours],
    ["gallery", configToValidate.gallery]
  ].forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (!Array.isArray(value)) {
      pushConfigIssue(
        result,
        "warning",
        `${key} muss ein Array sein, wenn vorhanden.`
      );
      return;
    }

    if (value.length === 0) {
      pushConfigIssue(
        result,
        "warning",
        `${key} ist leer.`
      );
    }
  });


  if (Array.isArray(configToValidate.openingHours)) {
    configToValidate.openingHours.forEach((entry, index) => {
      if (!isPlainObject(entry) || entry.schemaHours === undefined) {
        return;
      }

      if (
        !Array.isArray(entry.schemaHours) ||
        entry.schemaHours.some((value) => !isNonEmptyString(value))
      ) {
        pushConfigIssue(
          result,
          "warning",
          `openingHours[${index}].schemaHours muss ein Array aus nicht leeren Strings sein.`
        );
      }
    });
  }


  if (configToValidate.reviews !== undefined) {
    if (!isPlainObject(configToValidate.reviews)) {
      pushConfigIssue(
        result,
        "warning",
        "reviews muss ein Objekt sein, wenn vorhanden."
      );
    } else {
      if (
        configToValidate.reviews.rating !== undefined &&
        (
          typeof configToValidate.reviews.rating !== "number" ||
          Number.isNaN(configToValidate.reviews.rating) ||
          configToValidate.reviews.rating < 0 ||
          configToValidate.reviews.rating > 5
        )
      ) {
        pushConfigIssue(
          result,
          "warning",
          "reviews.rating muss eine Zahl zwischen 0 und 5 sein."
        );
      }

      if (
        configToValidate.reviews.entries !== undefined &&
        !Array.isArray(configToValidate.reviews.entries)
      ) {
        pushConfigIssue(
          result,
          "warning",
          "reviews.entries muss ein Array sein, wenn vorhanden."
        );
      }
    }
  }


  if (configToValidate.seo !== undefined) {
    if (!isPlainObject(configToValidate.seo)) {
      pushConfigIssue(
        result,
        "warning",
        "seo muss ein Objekt sein, wenn vorhanden."
      );
    } else {
      [
        "title",
        "description",
        "keywords",
        "author",
        "robots",
        "canonical",
        "ogTitle",
        "ogDescription",
        "ogImage",
        "twitterTitle",
        "twitterDescription",
        "twitterImage",
        "themeColor",
        "language"
      ].forEach((key) => {
        if (
          configToValidate.seo[key] !== undefined &&
          typeof configToValidate.seo[key] !== "string"
        ) {
          pushConfigIssue(
            result,
            "warning",
            `seo.${key} muss ein String sein, wenn vorhanden.`
          );
        }
      });

      ["canonical", "ogImage", "twitterImage"].forEach((key) => {
        const value = configToValidate.seo[key];

        if (isNonEmptyString(value) && !isValidAbsoluteUrl(value)) {
          pushConfigIssue(
            result,
            "warning",
            `seo.${key} sollte eine absolute HTTP(S)-URL sein.`
          );
        }
      });

      if (
        isNonEmptyString(configToValidate.seo.themeColor) &&
        !/^#[0-9a-f]{6}$/i.test(configToValidate.seo.themeColor.trim())
      ) {
        pushConfigIssue(
          result,
          "warning",
          "seo.themeColor sollte eine sechsstellige Hex-Farbe sein."
        );
      }

      if (
        isNonEmptyString(configToValidate.seo.language) &&
        !/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(configToValidate.seo.language.trim())
      ) {
        pushConfigIssue(
          result,
          "warning",
          "seo.language sollte ein gültiger Sprachcode wie de-AT sein."
        );
      }
    }
  } else {
    pushConfigIssue(
      result,
      "warning",
      "seo ist nicht konfiguriert. Metadaten werden aus den Restaurantdaten erzeugt."
    );
  }


  const localBusiness = configToValidate.localBusiness;

  if (localBusiness === undefined) {
    pushConfigIssue(
      result,
      "warning",
      "localBusiness ist nicht konfiguriert. Schema.org verwendet verfügbare Identity-Fallbacks."
    );
  } else if (!isPlainObject(localBusiness)) {
    pushConfigIssue(
      result,
      "warning",
      "localBusiness muss ein Objekt sein, wenn vorhanden."
    );
  } else {
    [
      "priceRange",
      "telephone",
      "email",
      "website",
      "currenciesAccepted",
      "areaServed"
    ].forEach((key) => {
      if (
        localBusiness[key] !== undefined &&
        typeof localBusiness[key] !== "string"
      ) {
        pushConfigIssue(
          result,
          "warning",
          `localBusiness.${key} muss ein String sein, wenn vorhanden.`
        );
      }
    });

    ["servesCuisine", "paymentAccepted"].forEach((key) => {
      const value = localBusiness[key];

      if (
        value !== undefined &&
        typeof value !== "string" &&
        !Array.isArray(value)
      ) {
        pushConfigIssue(
          result,
          "warning",
          `localBusiness.${key} muss ein String oder Array sein, wenn vorhanden.`
        );
      }
    });

    if (
      localBusiness.acceptsReservations !== undefined &&
      typeof localBusiness.acceptsReservations !== "boolean"
    ) {
      pushConfigIssue(
        result,
        "warning",
        "localBusiness.acceptsReservations muss ein Boolean sein, wenn vorhanden."
      );
    }

    if (localBusiness.geo !== undefined && !isPlainObject(localBusiness.geo)) {
      pushConfigIssue(
        result,
        "warning",
        "localBusiness.geo muss ein Objekt sein, wenn vorhanden."
      );
    } else if (isPlainObject(localBusiness.geo)) {
      [
        ["latitude", -90, 90],
        ["longitude", -180, 180]
      ].forEach(([key, minimum, maximum]) => {
        const value = localBusiness.geo[key];

        if (value === "" || value === null || value === undefined) {
          return;
        }

        const numericValue = Number(value);

        if (
          !Number.isFinite(numericValue) ||
          numericValue < minimum ||
          numericValue > maximum
        ) {
          pushConfigIssue(
            result,
            "warning",
            `localBusiness.geo.${key} liegt außerhalb des gültigen Bereichs.`
          );
        }
      });
    }

    if (
      isNonEmptyString(localBusiness.website) &&
      !isValidAbsoluteUrl(localBusiness.website)
    ) {
      pushConfigIssue(
        result,
        "warning",
        "localBusiness.website sollte eine absolute HTTP(S)-URL sein."
      );
    }
  }


  if (configToValidate.identity !== undefined && !isPlainObject(configToValidate.identity)) {
    pushConfigIssue(
      result,
      "warning",
      "identity muss ein Objekt sein, wenn vorhanden."
    );
  }

  [
    "website",
    "whatsapp",
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
    "linkedin"
  ].forEach((socialKey) => {
    const socialValue = resolveConfigValue(
      configToValidate.identity,
      socialKey,
      ""
    );

    if (socialValue !== "" && typeof socialValue !== "string") {
      pushConfigIssue(
        result,
        "warning",
        `identity.${socialKey} muss ein String sein, wenn vorhanden.`
      );
    }
  });


  if (configToValidate.about && isPlainObject(configToValidate.about)) {
    if (
      configToValidate.about.image !== undefined &&
      typeof configToValidate.about.image !== "string"
    ) {
      pushConfigIssue(
        result,
        "warning",
        "about.image muss ein String sein, wenn vorhanden."
      );
    } else if (
      typeof configToValidate.about.image === "string" &&
      configToValidate.about.image.trim() === ""
    ) {
      pushConfigIssue(
        result,
        "warning",
        "about.image ist leer. Der Medien-Fallback wird verwendet."
      );
    }
  }


  if (Array.isArray(configToValidate.signatureDishes)) {
    configToValidate.signatureDishes.forEach((dish, index) => {
      if (
        isPlainObject(dish) &&
        dish.image !== undefined &&
        typeof dish.image !== "string"
      ) {
        pushConfigIssue(
          result,
          "warning",
          `signatureDishes[${index}].image muss ein String sein, wenn vorhanden.`
        );
      } else if (
        isPlainObject(dish) &&
        typeof dish.image === "string" &&
        dish.image.trim() === ""
      ) {
        pushConfigIssue(
          result,
          "warning",
          `signatureDishes[${index}].image ist leer. Der Medien-Fallback wird verwendet.`
        );
      }
    });
  }


  if (Array.isArray(configToValidate.gallery)) {
    configToValidate.gallery.forEach((image, index) => {
      if (!isPlainObject(image)) {
        return;
      }

      if (
        image.image !== undefined &&
        typeof image.image !== "string"
      ) {
        pushConfigIssue(
          result,
          "warning",
          `gallery[${index}].image muss ein String sein, wenn vorhanden.`
        );
      } else if (
        typeof image.image === "string" &&
        image.image.trim() === ""
      ) {
        pushConfigIssue(
          result,
          "warning",
          `gallery[${index}].image ist leer. Der Medien-Fallback wird verwendet.`
        );
      }

      if (
        image.alt !== undefined &&
        typeof image.alt !== "string"
      ) {
        pushConfigIssue(
          result,
          "warning",
          `gallery[${index}].alt muss ein String sein, wenn vorhanden.`
        );
      }
    });
  }


  result.valid = result.errors.length === 0;

  return result;
}


function logConfigIssues(validationResult) {
  if (!validationResult) {
    return;
  }

  validationResult.errors.forEach((message) => {
    console.error(`Konfigurationsfehler: ${message}`);
  });

  validationResult.warnings.forEach((message) => {
    console.warn(`Konfigurationswarnung: ${message}`);
  });
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

  if (!image) {
    return;
  }

  if (!isUsableImageSource(src)) {
    image.removeAttribute("src");
    image.alt = "";
    setMediaState(image, "error");
    return;
  }


  image.src = src.trim();
  image.alt = alt;

  initializeMediaImage(image);
}


function isUsableImageSource(source) {
  return typeof source === "string" && source.trim() !== "";
}


function getImageSourceAttribute(source) {
  if (!isUsableImageSource(source)) {
    return "";
  }

  return `src="${escapeHtml(source.trim())}"`;
}


function setMediaState(image, state) {
  if (!image) {
    return;
  }

  image.dataset.mediaState = state;

  const container =
    image.closest("[data-media-container]");

  if (container) {
    container.dataset.mediaState = state;
  }
}


function initializeMediaImage(image) {
  if (!image) {
    return;
  }

  const source =
    image.getAttribute("src");

  if (!isUsableImageSource(source)) {
    image.removeAttribute("src");
    setMediaState(image, "error");
    return;
  }


  setMediaState(image, "loading");


  image.addEventListener(
    "load",
    () => setMediaState(image, "loaded"),
    { once: true }
  );

  image.addEventListener(
    "error",
    () => setMediaState(image, "error"),
    { once: true }
  );


  if (image.complete) {
    setMediaState(
      image,
      image.naturalWidth > 0 ? "loaded" : "error"
    );
  }
}


function initializeMediaImages(container = document) {
  const images =
    container.querySelectorAll("[data-media-image]");

  images.forEach((image) => {
    initializeMediaImage(image);
  });
}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function setMetaTag(attributeName, content, attributeType = "name") {
  const metaElements = Array.from(
    document.head.querySelectorAll(
      `meta[name="${attributeName}"], meta[property="${attributeName}"]`
    )
  );

  if (!isNonEmptyString(content)) {
    metaElements.forEach((element) => element.remove());
    return;
  }

  let metaElement = metaElements.shift();

  if (!metaElement) {
    metaElement = document.createElement("meta");
    document.head.appendChild(metaElement);
  }

  metaElements.forEach((duplicateElement) => duplicateElement.remove());
  metaElement.removeAttribute(attributeType === "name" ? "property" : "name");
  metaElement.setAttribute(attributeType, attributeName);
  metaElement.content = content.trim();
}


function setLinkRel(rel, href) {
  const linkElements = Array.from(
    document.head.querySelectorAll(`link[rel="${rel}"]`)
  );

  if (!isNonEmptyString(href)) {
    linkElements.forEach((element) => element.remove());
    return;
  }

  let linkElement = linkElements.shift();

  if (!linkElement) {
    linkElement = document.createElement("link");
    document.head.appendChild(linkElement);
  }

  linkElements.forEach((duplicateElement) => duplicateElement.remove());
  linkElement.rel = rel;
  linkElement.href = href.trim();
}


function setRestaurantSchema(schemaData) {
  const schemaElements = Array.from(
    document.head.querySelectorAll(
      'script[type="application/ld+json"][data-restaurant-schema]'
    )
  );

  let schemaElement = schemaElements.shift();

  if (!schemaElement) {
    schemaElement = document.createElement("script");
    schemaElement.type = "application/ld+json";
    schemaElement.dataset.restaurantSchema = "true";
    document.head.appendChild(schemaElement);
  }

  schemaElements.forEach((duplicateElement) => duplicateElement.remove());
  schemaElement.textContent = JSON.stringify(schemaData);
}


function renderSeoData() {
  const seoUtils = window.RestaurantSeoUtils;

  if (!seoUtils || typeof seoUtils.createSeoModel !== "function") {
    console.warn("SEO-Utility fehlt. Die statischen SEO-Daten bleiben unverändert.");
    return;
  }

  const seoModel = seoUtils.createSeoModel(config, {
    locationHref: window.location.href,
    acceptsReservationsFallback: isModuleActive("reservations")
  });

  document.documentElement.lang = seoModel.language;
  document.title = seoModel.title;

  setMetaTag("description", seoModel.description);
  setMetaTag("keywords", seoModel.keywords);
  setMetaTag("author", seoModel.author);
  setMetaTag("robots", seoModel.robots);
  setMetaTag("theme-color", seoModel.themeColor);
  setMetaTag("og:type", seoModel.openGraph.type, "property");
  setMetaTag("og:site_name", seoModel.openGraph.siteName, "property");
  setMetaTag("og:locale", seoModel.openGraph.locale, "property");
  setMetaTag("og:url", seoModel.openGraph.url, "property");
  setMetaTag("og:title", seoModel.openGraph.title, "property");
  setMetaTag("og:description", seoModel.openGraph.description, "property");
  setMetaTag("og:image", seoModel.openGraph.image, "property");
  setMetaTag("og:image:alt", seoModel.openGraph.imageAlt, "property");
  setMetaTag("twitter:card", seoModel.twitter.card);
  setMetaTag("twitter:title", seoModel.twitter.title);
  setMetaTag("twitter:description", seoModel.twitter.description);
  setMetaTag("twitter:image", seoModel.twitter.image);
  setMetaTag("twitter:image:alt", seoModel.twitter.imageAlt);
  setLinkRel("canonical", seoModel.canonicalUrl);
  setLinkRel("icon", seoModel.favicon);
  setLinkRel("apple-touch-icon", seoModel.favicon);

  document.head
    .querySelectorAll("link[data-seo-alternate]")
    .forEach((element) => element.remove());

  seoModel.alternates.forEach((alternate) => {
    const linkElement = document.createElement("link");
    linkElement.rel = "alternate";
    linkElement.hreflang = alternate.language;
    linkElement.href = alternate.href;
    linkElement.dataset.seoAlternate = "true";
    document.head.appendChild(linkElement);
  });

  setRestaurantSchema(seoModel.schema);
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

    element.classList.toggle(
      "module-hidden",
      !active
    );

  });


  const moduleLinks =
    getAllElements("[data-module-link]");

  moduleLinks.forEach((element) => {

    const moduleName =
      element.dataset.moduleLink;

    const active =
      isModuleActive(moduleName);

    element.classList.toggle(
      "module-hidden",
      !active
    );

  });

}


// ========================================
// DESIGNFARBEN
// ========================================

function applyDesign() {

  const colors =
    config?.design?.colors || {};

  const theme =
    config?.design?.theme || {};


  const root =
    document.documentElement;

  function setThemeValue(property, value) {
    if (!isNonEmptyString(value)) {
      return;
    }

    root.style.setProperty(
      property,
      value
    );
  }


  // Bestehende colors-Konfiguration bleibt als Fallback erhalten.
  setThemeValue(
    "--color-background",
    colors.background
  );

  setThemeValue(
    "--color-background-soft",
    colors.backgroundSoft
  );

  setThemeValue(
    "--color-surface",
    colors.backgroundCard
  );

  setThemeValue(
    "--color-text",
    colors.textPrimary
  );

  setThemeValue(
    "--color-text-muted",
    colors.textMuted
  );

  setThemeValue(
    "--color-primary",
    colors.accent
  );

  setThemeValue(
    "--color-primary-light",
    colors.accentLight
  );


  // design.theme überschreibt die Fallback-Farben gezielt.
  setThemeValue(
    "--color-background",
    theme.background
  );

  setThemeValue(
    "--color-surface",
    theme.surface
  );

  setThemeValue(
    "--color-text",
    theme.text
  );

  setThemeValue(
    "--color-text-muted",
    theme.textMuted
  );

  setThemeValue(
    "--color-primary",
    theme.primary
  );

  setThemeValue(
    "--color-primary-light",
    theme.primaryLight
  );

  setThemeValue(
    "--color-success",
    theme.success
  );

  setThemeValue(
    "--color-warning",
    theme.warning
  );

  setThemeValue(
    "--color-danger",
    theme.danger
  );


  if (isNonEmptyString(theme.name)) {
    root.dataset.theme = theme.name;
  }

}


// ========================================
// RESTAURANT-STAMMDATEN
// ========================================

function renderRestaurantData() {

  const restaurant =
    config?.restaurant;

  const identityName = getIdentityValue("name", "Restaurant");
  const identityFullName = getIdentityValue("fullName", identityName);
  const identitySlogan = getIdentityValue("slogan", restaurant?.tagline || "");
  const identityLogoText = getIdentityValue("logoText", identityName);
  const identityPhone = getIdentityValue("phone", "");
  const identityEmail = getIdentityValue("email", "");
  const identityStreet = getIdentityValue("street", "");
  const identityPostalCode = getIdentityValue("postalCode", "");
  const identityCity = getIdentityValue("city", "");
  const identityCountry = getIdentityValue("country", "");
  const identityMapsUrl = getIdentityValue("googleMapsUrl", "");
  const identityWebsite = getIdentityValue("website", "");
  const legal = isPlainObject(config?.legal)
    ? config.legal
    : null;

  const displayName = identityFullName || identityName || "Restaurant Website";
  const displayCity = identityCity || restaurant?.city || "Ihre Stadt";
  const displaySlogan = identitySlogan || restaurant?.tagline || "Willkommen bei uns.";


  setText(
    "#restaurant-logo",
    identityLogoText.toUpperCase()
  );


  setText(
    "#hero-eyebrow",
    identitySlogan || restaurant?.eyebrow || identityName
  );


  setText(
    "#hero-title",
    identityName || restaurant?.heroTitle || "Restaurant"
  );


  setText(
    "#hero-subtitle",
    identitySlogan || restaurant?.heroSubtitle || "Willkommen bei uns."
  );


  setText(
    "#visit-title",
    `${displayCity}. Ein Ort zum Genießen.`
  );


  setText(
    "#address-name",
    identityFullName || identityName
  );


  setText(
    "#footer-brand",
    identityLogoText.toUpperCase()
  );


  setText(
    "#footer-tagline",
    displaySlogan
  );


  setText(
    "#footer-copyright",
    resolveConfigValue(
      legal,
      "copyrightText",
      `© ${new Date().getFullYear()} ${displayName}`
    )
  );


  const addressDetails =
    getElement("#address-details");


  if (addressDetails) {

    const detailLines = [];

    if (identityStreet) {
      detailLines.push(escapeHtml(identityStreet));
    }

    const cityLine = [
      identityPostalCode,
      identityCity
    ]
      .filter(Boolean)
      .join(" ");

    if (cityLine) {
      detailLines.push(escapeHtml(cityLine));
    }

    const contactLines = [];

    if (identityPhone) {
      contactLines.push(`<a href="tel:${escapeHtml(identityPhone)}">${escapeHtml(identityPhone)}</a>`);
    }

    if (identityEmail) {
      contactLines.push(`<a href="mailto:${escapeHtml(identityEmail)}">${escapeHtml(identityEmail)}</a>`);
    }

    if (contactLines.length > 0) {
      detailLines.push(contactLines.join("<br>"));
    }

    addressDetails.innerHTML =
      detailLines
        .map((line) => `<div>${line}</div>`)
        .join("");

  }


  const routeLink =
    getElement("#route-link");


  if (routeLink) {

    const fullAddress = [
      identityStreet,
      identityPostalCode,
      identityCity,
      identityCountry
    ]
      .filter(Boolean)
      .join(", ");

    const mapsUrl = identityMapsUrl ||
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

    routeLink.href = mapsUrl;
    routeLink.target = "_blank";
    routeLink.rel = "noopener noreferrer";

  }


  if (identityWebsite) {
    const footerWebsiteLink = getElement("#footer-website-link");

    if (footerWebsiteLink) {
      footerWebsiteLink.href = identityWebsite;
      footerWebsiteLink.target = "_blank";
      footerWebsiteLink.rel = "noopener noreferrer";
    }
  }


  renderSeoData();

  const logoLink = getElement("#restaurant-logo");

  if (logoLink && !logoLink.querySelector("img")) {
    const logoImage = getIdentityValue("logoImage", "");

    if (logoImage) {
      logoLink.innerHTML = `<img src="${escapeHtml(logoImage)}" alt="${escapeHtml(identityLogoText)}" loading="eager">`;
    }
  }

  renderFooterLinks();

}


function renderFooterLinks() {

  const footerLinks = getElement("#footer-links");

  if (!footerLinks) {
    return;
  }

  const socialLinks = [];
  const identityWebsite = getIdentityValue("website", "");
  const identityWhatsapp = getIdentityValue("whatsapp", "");
  const identityInstagram = getIdentityValue("instagram", "");
  const identityFacebook = getIdentityValue("facebook", "");
  const identityTiktok = getIdentityValue("tiktok", "");
  const identityYoutube = getIdentityValue("youtube", "");
  const identityLinkedin = getIdentityValue("linkedin", "");

  if (identityWebsite) {
    socialLinks.push(`<a href="${escapeHtml(identityWebsite)}" target="_blank" rel="noopener noreferrer">Website</a>`);
  }

  if (identityWhatsapp) {
    socialLinks.push(`<a href="https://wa.me/${escapeHtml(identityWhatsapp.replace(/\D/g, ""))}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
  }

  if (identityInstagram) {
    socialLinks.push(`<a href="${escapeHtml(identityInstagram)}" target="_blank" rel="noopener noreferrer">Instagram</a>`);
  }

  if (identityFacebook) {
    socialLinks.push(`<a href="${escapeHtml(identityFacebook)}" target="_blank" rel="noopener noreferrer">Facebook</a>`);
  }

  if (identityTiktok) {
    socialLinks.push(`<a href="${escapeHtml(identityTiktok)}" target="_blank" rel="noopener noreferrer">TikTok</a>`);
  }

  if (identityYoutube) {
    socialLinks.push(`<a href="${escapeHtml(identityYoutube)}" target="_blank" rel="noopener noreferrer">YouTube</a>`);
  }

  if (identityLinkedin) {
    socialLinks.push(`<a href="${escapeHtml(identityLinkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`);
  }

  const footerLinkMarkup = [
    '<a href="#about">Über uns</a>',
    '<a href="#menu" data-module-link="menu">Speisekarte</a>',
    '<a href="#reservation" data-module-link="reservations">Reservieren</a>',
    ...socialLinks
  ];

  footerLinks.innerHTML = footerLinkMarkup.join("");

  const imprintLink = getElement("#footer-imprint");
  const privacyLink = getElement("#footer-privacy");
  const legal = isPlainObject(config?.legal)
    ? config.legal
    : null;

  if (imprintLink) {
    imprintLink.href = resolveConfigValue(legal, "imprintUrl", "#imprint");
  }

  if (privacyLink) {
    privacyLink.href = resolveConfigValue(legal, "privacyUrl", "#privacy");
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
    `${getIdentityValue("fullName", "Restaurant")} – Über uns`
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
      .map((dish) => {

        const safeDish =
          isPlainObject(dish)
            ? dish
            : {};

        const hasImage =
          isUsableImageSource(safeDish.image);

        return `

        <article class="dish-card reveal">

          <div
            class="dish-image-wrap"
            data-media-container
          >

            <img
              data-media-image
              ${getImageSourceAttribute(safeDish.image)}
              alt="${escapeHtml(hasImage ? safeDish.name || "Gericht" : "")}"
              loading="lazy"
              decoding="async"
            >

          </div>


          <div class="dish-content">

            <h3 class="dish-title">
              ${escapeHtml(safeDish.name || "")}
            </h3>


            <p class="dish-description">
              ${escapeHtml(safeDish.description || "")}
            </p>


            <div class="dish-price">
              ${formatPrice(safeDish.price)}
            </div>

          </div>

        </article>

      `;

      })
      .join("");

  initializeMediaImages(container);

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

        <article class="menu-item reveal">

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

        </article>

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

        const safeImage =
          isPlainObject(image)
            ? image
            : {};

        const hasImage =
          isUsableImageSource(safeImage.image);

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
            data-media-container
          >

            <img
              data-media-image
              ${getImageSourceAttribute(safeImage.image)}
              alt="${escapeHtml(hasImage ? safeImage.alt || "Restaurant" : "")}"
              loading="lazy"
              decoding="async"
            >

          </figure>

        `;

      })
      .join("");

  initializeMediaImages(container);

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

          <dt>
            ${escapeHtml(entry.days || "")}
          </dt>


          <dd>
            ${escapeHtml(entry.hours || "")}
          </dd>

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

  const navOverlay =
    getElement(".nav-overlay");

  const navigationLinks =
    getAllElements(".nav-links a");


  function openMenu() {

    if (!menuToggle || !navLinks) {
      return;
    }


    menuToggle.classList.add("active");

    navLinks.classList.add("active");

    if (navOverlay) {
      navOverlay.classList.add("active");
    }

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


    const firstNavigationLink =
      navigationLinks[0];

    if (firstNavigationLink) {
      window.setTimeout(
        () => firstNavigationLink.focus(),
        0
      );
    }

  }


  function closeMenu(returnFocus = false) {

    if (!menuToggle || !navLinks) {
      return;
    }


    menuToggle.classList.remove("active");

    navLinks.classList.remove("active");

    if (navOverlay) {
      navOverlay.classList.remove("active");
    }

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


    if (returnFocus && window.innerWidth <= 900) {
      menuToggle.focus();
    }

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

  if (navOverlay) {
    navOverlay.addEventListener(
      "click",
      () => closeMenu(true)
    );
  }


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        navLinks?.classList.contains("active")
      ) {
        event.preventDefault();
        closeMenu(true);
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

  config = window.restaurantConfig || null;
  configValidation = validateRestaurantConfig(config);

  logConfigIssues(configValidation);

  if (!configValidation.valid) {
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
