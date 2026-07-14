// ========================================
// SCROLL-POSITION BEIM SEITENSTART
// ========================================

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}


// ========================================
// ELEMENTE
// ========================================

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navigationLinks = document.querySelectorAll(".nav-links a");
const revealElements = document.querySelectorAll(".reveal");
const reservationForm = document.querySelector("#reservation-form");
const reservationDate = document.querySelector('input[name="date"]');


// ========================================
// BEIM NORMALEN SEITENAUFRUF OBEN STARTEN
// ========================================

window.addEventListener("load", () => {

  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }

});


// ========================================
// HAMBURGER-MENÜ
// ========================================

function openMenu() {

  if (!menuToggle || !navLinks) {
    return;
  }

  menuToggle.classList.add("active");
  navLinks.classList.add("active");
  document.body.classList.add("menu-open");

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Menü schließen");
}


function closeMenu() {

  if (!menuToggle || !navLinks) {
    return;
  }

  menuToggle.classList.remove("active");
  navLinks.classList.remove("active");
  document.body.classList.remove("menu-open");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Menü öffnen");
}


function toggleMenu() {

  if (!navLinks) {
    return;
  }

  const isOpen = navLinks.classList.contains("active");

  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }

}


if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", toggleMenu);
}


// ========================================
// MENÜ NACH KLICK SCHLIESSEN
// ========================================

navigationLinks.forEach((link) => {

  link.addEventListener("click", () => {
    closeMenu();
  });

});


// ========================================
// MENÜ MIT ESC SCHLIESSEN
// ========================================

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {
    closeMenu();
  }

});


// ========================================
// NAVBAR BEIM SCROLLEN
// ========================================

function updateNavbar() {

  if (!navbar) {
    return;
  }

  if (window.scrollY > 40) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

}


window.addEventListener(
  "scroll",
  updateNavbar,
  { passive: true }
);

updateNavbar();


// ========================================
// SCROLL-ANIMATIONEN
// ========================================

if ("IntersectionObserver" in window) {

  const revealObserver = new IntersectionObserver(

    (entries, observer) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

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

} else {

  revealElements.forEach((element) => {
    element.classList.add("visible");
  });

}


// ========================================
// HEUTIGES DATUM FÜR RESERVIERUNG
// ========================================

function setMinimumReservationDate() {

  if (!reservationDate) {
    return;
  }

  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  reservationDate.min =
    `${year}-${month}-${day}`;

}


setMinimumReservationDate();


// ========================================
// DEMO-RESERVIERUNGSFORMULAR
// ========================================

if (reservationForm) {

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
        `Ihre Reservierungsanfrage für ${guests} Person(en) ` +
        `am ${reservationDay} wurde in dieser Demo erfasst.\n\n` +
        `In der echten Restaurant-Version wird die Anfrage ` +
        `direkt an das Restaurant übermittelt.`
      );


      reservationForm.reset();

      setMinimumReservationDate();

    }
  );

}


// ========================================
// MENÜ BEI DESKTOP-WECHSEL ZURÜCKSETZEN
// ========================================

window.addEventListener("resize", () => {

  if (window.innerWidth > 900) {
    closeMenu();
  }

});
