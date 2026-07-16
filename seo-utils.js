(function initializeRestaurantSeoUtils(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.RestaurantSeoUtils = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createSeoUtils() {
  "use strict";

  const DAY_NAMES = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
  ];
  const DAY_CODES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function resolveValue(object, key, fallbackValue = "") {
    if (!isPlainObject(object) || !Object.prototype.hasOwnProperty.call(object, key)) {
      return fallbackValue;
    }

    const value = object[key];

    if (value === null || value === undefined) {
      return fallbackValue;
    }

    return typeof value === "string"
      ? value.trim() || fallbackValue
      : value;
  }

  function getIdentityValue(config, key, fallbackValue = "") {
    const identity = isPlainObject(config?.identity) ? config.identity : null;

    if (identity && Object.prototype.hasOwnProperty.call(identity, key)) {
      const value = resolveValue(identity, key, "");
      return value || fallbackValue;
    }

    const restaurant = isPlainObject(config?.restaurant) ? config.restaurant : null;
    return resolveValue(restaurant, key, fallbackValue) || fallbackValue;
  }

  function getSeoText(config, key, fallbackValue = "") {
    const value = resolveValue(config?.seo, key, "");
    return isNonEmptyString(value) ? value : fallbackValue;
  }

  function getLocalBusinessValue(config, key, fallbackValue = "") {
    return resolveValue(config?.localBusiness, key, fallbackValue);
  }

  function getLocalBusinessText(config, key, fallbackValue = "") {
    const value = getLocalBusinessValue(config, key, fallbackValue);

    if (isNonEmptyString(value)) {
      return value.trim();
    }

    return isNonEmptyString(fallbackValue) ? fallbackValue.trim() : "";
  }

  function toStringArray(value) {
    if (Array.isArray(value)) {
      return value.filter(isNonEmptyString).map((entry) => entry.trim());
    }

    return isNonEmptyString(value) ? [value.trim()] : [];
  }

  function normalizeUrl(value, baseUrl = "") {
    if (!isNonEmptyString(value)) {
      return "";
    }

    try {
      const url = baseUrl ? new URL(value, baseUrl) : new URL(value);
      url.hash = "";
      url.search = "";
      return url.href;
    } catch {
      return "";
    }
  }

  function getCanonicalUrl(config, locationHref = "") {
    const identityWebsite = getIdentityValue(config, "website", locationHref);
    const configuredUrl = getSeoText(
      config,
      "canonical",
      getLocalBusinessText(config, "website", identityWebsite)
    );

    return normalizeUrl(configuredUrl, locationHref);
  }

  function getRestaurantImages(config) {
    const candidates = [
      getSeoText(config, "ogImage", ""),
      getSeoText(config, "twitterImage", ""),
      getIdentityValue(config, "logoImage", ""),
      resolveValue(config?.about, "image", ""),
      ...(Array.isArray(config?.signatureDishes)
        ? config.signatureDishes.map((dish) => resolveValue(dish, "image", ""))
        : []),
      ...(Array.isArray(config?.gallery)
        ? config.gallery.map((entry) => resolveValue(entry, "image", ""))
        : [])
    ];

    return [...new Set(candidates.filter(isNonEmptyString).map((image) => image.trim()))];
  }

  function expandDayRange(dayRange) {
    const [startCode, endCode = startCode] = dayRange.split("-");
    const startIndex = DAY_CODES.indexOf(startCode);
    const endIndex = DAY_CODES.indexOf(endCode);

    if (startIndex < 0 || endIndex < startIndex) {
      return [];
    }

    return DAY_NAMES
      .slice(startIndex, endIndex + 1)
      .map((day) => `https://schema.org/${day}`);
  }

  function getOpeningHoursSpecification(config) {
    if (!Array.isArray(config?.openingHours)) {
      return [];
    }

    return config.openingHours.flatMap((entry) => {
      if (!isPlainObject(entry) || !Array.isArray(entry.schemaHours)) {
        return [];
      }

      return entry.schemaHours.flatMap((value) => {
        if (!isNonEmptyString(value)) {
          return [];
        }

        const match = value.trim().match(
          /^(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?\s+(\d{2}:\d{2})-(\d{2}:\d{2})$/
        );

        if (!match) {
          return [];
        }

        const dayRange = match[2] ? `${match[1]}-${match[2]}` : match[1];
        const dayOfWeek = expandDayRange(dayRange);

        if (dayOfWeek.length === 0) {
          return [];
        }

        return [{
          "@type": "OpeningHoursSpecification",
          dayOfWeek,
          opens: match[3],
          closes: match[4]
        }];
      });
    });
  }

  function getAlternateLanguages(config) {
    const alternatives = config?.seo?.alternateLanguages;

    if (!Array.isArray(alternatives)) {
      return [];
    }

    return alternatives.flatMap((entry) => {
      if (!isPlainObject(entry)) {
        return [];
      }

      const language = resolveValue(entry, "language", "");
      const href = normalizeUrl(resolveValue(entry, "url", ""));

      return isNonEmptyString(language) && href
        ? [{ language: language.trim(), href }]
        : [];
    });
  }

  function createSeoModel(config, options = {}) {
    const locationHref = isNonEmptyString(options.locationHref)
      ? options.locationHref
      : "";
    const identityName = getIdentityValue(config, "name", "Restaurant");
    const fullName = getIdentityValue(config, "fullName", identityName);
    const slogan = getIdentityValue(
      config,
      "slogan",
      resolveValue(config?.restaurant, "tagline", "")
    );
    const city = getIdentityValue(config, "city", "");
    const title = getSeoText(
      config,
      "title",
      `${fullName}${city ? ` | Restaurant in ${city}` : ""}`
    );
    const description = getSeoText(
      config,
      "description",
      `${fullName}${city ? ` in ${city}` : ""}. ${slogan || "Willkommen bei uns."}`
    );
    const languageCandidate = getSeoText(
      config,
      "language",
      resolveValue(config?.system, "locale", "de")
    );
    const language = isNonEmptyString(languageCandidate) ? languageCandidate : "de";
    const themeColor = getSeoText(
      config,
      "themeColor",
      resolveValue(
        config?.design?.theme,
        "background",
        resolveValue(config?.design?.colors, "background", "#11100f")
      )
    );
    const canonicalUrl = getCanonicalUrl(config, locationHref);
    const images = getRestaurantImages(config);
    const primaryImage = images[0] || "";
    const imageAlt = `${fullName}${city ? ` in ${city}` : ""}`;
    const favicon = getIdentityValue(
      config,
      "favicon",
      getIdentityValue(config, "logoImage", "")
    );
    const telephone = getLocalBusinessText(
      config,
      "telephone",
      getIdentityValue(config, "phone", "")
    );
    const email = getLocalBusinessText(
      config,
      "email",
      getIdentityValue(config, "email", "")
    );
    const website = normalizeUrl(
      getLocalBusinessText(
        config,
        "website",
        getIdentityValue(config, "website", canonicalUrl)
      ),
      canonicalUrl
    ) || canonicalUrl;
    const cuisine = toStringArray(getLocalBusinessValue(config, "servesCuisine", []));
    const paymentAccepted = toStringArray(
      getLocalBusinessValue(config, "paymentAccepted", [])
    );
    const geo = isPlainObject(config?.localBusiness?.geo)
      ? config.localBusiness.geo
      : {};
    const latitude = Number(resolveValue(geo, "latitude", NaN));
    const longitude = Number(resolveValue(geo, "longitude", NaN));
    const address = {
      "@type": "PostalAddress",
      streetAddress: getIdentityValue(config, "street", ""),
      postalCode: getIdentityValue(config, "postalCode", ""),
      addressLocality: city,
      addressCountry: getIdentityValue(config, "country", "")
    };
    const sameAs = ["instagram", "facebook", "tiktok", "youtube", "linkedin"]
      .map((key) => getIdentityValue(config, key, ""))
      .filter(isNonEmptyString);
    const openingHoursSpecification = getOpeningHoursSpecification(config);
    const acceptsReservations = typeof config?.localBusiness?.acceptsReservations === "boolean"
      ? config.localBusiness.acceptsReservations
      : Boolean(options.acceptsReservationsFallback);
    const schema = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      "@id": canonicalUrl ? `${canonicalUrl}#restaurant` : undefined,
      name: fullName,
      alternateName: identityName !== fullName ? identityName : undefined,
      description,
      slogan: slogan || undefined,
      url: website || undefined,
      image: images.length > 0 ? images : undefined,
      logo: getIdentityValue(config, "logoImage", "") || undefined,
      telephone: telephone || undefined,
      email: email || undefined,
      priceRange: getLocalBusinessText(config, "priceRange", "€€"),
      servesCuisine: cuisine.length > 0 ? cuisine : undefined,
      acceptsReservations,
      currenciesAccepted: getLocalBusinessText(
        config,
        "currenciesAccepted",
        resolveValue(config?.system, "currency", "EUR")
      ),
      paymentAccepted: paymentAccepted.length > 0
        ? paymentAccepted.join(", ")
        : undefined,
      areaServed: getLocalBusinessText(config, "areaServed", city) || undefined,
      openingHoursSpecification: openingHoursSpecification.length > 0
        ? openingHoursSpecification
        : undefined,
      address: Object.values(address).some((value) => value && value !== "PostalAddress")
        ? address
        : undefined,
      geo: Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { "@type": "GeoCoordinates", latitude, longitude }
        : undefined,
      sameAs: sameAs.length > 0 ? sameAs : undefined
    };

    return {
      title,
      description,
      keywords: getSeoText(config, "keywords", ""),
      author: getSeoText(config, "author", fullName),
      robots: getSeoText(config, "robots", "index,follow"),
      canonicalUrl,
      themeColor,
      language,
      favicon,
      alternates: getAlternateLanguages(config),
      openGraph: {
        type: "website",
        siteName: fullName,
        locale: language.replace("-", "_"),
        url: canonicalUrl,
        title: getSeoText(config, "ogTitle", title),
        description: getSeoText(config, "ogDescription", description),
        image: getSeoText(config, "ogImage", primaryImage),
        imageAlt
      },
      twitter: {
        card: primaryImage ? "summary_large_image" : "summary",
        title: getSeoText(config, "twitterTitle", title),
        description: getSeoText(config, "twitterDescription", description),
        image: getSeoText(config, "twitterImage", primaryImage),
        imageAlt
      },
      schema
    };
  }

  function getConfiguredDomainIssues(config) {
    const values = [
      ["seo.canonical", resolveValue(config?.seo, "canonical", "")],
      ["identity.website", resolveValue(config?.identity, "website", "")],
      ["localBusiness.website", resolveValue(config?.localBusiness, "website", "")]
    ];

    const issues = values.flatMap(([field, value]) => {
      if (!isNonEmptyString(value)) {
        return [{ field, code: "empty", message: `${field} ist leer.` }];
      }

      let url;

      try {
        url = new URL(value);
      } catch {
        return [{ field, code: "invalid", message: `${field} ist keine gültige absolute URL.` }];
      }

      const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
      const placeholderDomains = ["example.com", "example.net", "example.org"];
      const placeholder = placeholderDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      ) || hostname.endsWith(".example") ||
        hostname.endsWith(".invalid") ||
        hostname.endsWith(".test");
      const local = hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname === "127.0.0.1";

      if (!["http:", "https:"].includes(url.protocol)) {
        return [{ field, code: "protocol", message: `${field} muss HTTP oder HTTPS verwenden.` }];
      }

      if (placeholder) {
        return [{ field, code: "placeholder", message: `${field} verwendet eine Platzhalterdomain.` }];
      }

      if (local) {
        return [{ field, code: "local", message: `${field} verwendet eine lokale Domain.` }];
      }

      if (url.protocol !== "https:") {
        return [{ field, code: "insecure", message: `${field} muss im Produktionsmodus HTTPS verwenden.` }];
      }

      return [];
    });

    if (issues.length === 0) {
      const origins = new Set(values.map(([, value]) => new URL(value).origin));

      if (origins.size > 1) {
        issues.push({
          field: "productionUrls",
          code: "origin-mismatch",
          message: "seo.canonical, identity.website und localBusiness.website verwenden unterschiedliche Domains."
        });
      }
    }

    return issues;
  }

  function isPublicProductionUrl(value) {
    if (!isNonEmptyString(value)) {
      return false;
    }

    const config = {
      seo: { canonical: value },
      identity: { website: value },
      localBusiness: { website: value }
    };

    return getConfiguredDomainIssues(config).length === 0;
  }

  return {
    createSeoModel,
    getConfiguredDomainIssues,
    isNonEmptyString,
    isPlainObject,
    isPublicProductionUrl,
    normalizeUrl,
    resolveValue,
    toStringArray
  };
});
