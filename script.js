document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const body = document.body;


  if (!menuToggle || !navLinks) {
    return;
  }


  function closeMenu() {

    navLinks.classList.remove("active");

    menuToggle.classList.remove("active");

    body.classList.remove("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Menü öffnen"
    );

  }


  function openMenu() {

    navLinks.classList.add("active");

    menuToggle.classList.add("active");

    body.classList.add("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Menü schließen"
    );

  }


  menuToggle.addEventListener("click", () => {

    const isOpen = navLinks.classList.contains("active");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  });


  navLinks
    .querySelectorAll("a")
    .forEach((link) => {

      link.addEventListener("click", () => {
        closeMenu();
      });

    });


  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      navLinks.classList.contains("active")
    ) {
      closeMenu();
    }

  });


  window.addEventListener("resize", () => {

    if (
      window.innerWidth > 800 &&
      navLinks.classList.contains("active")
    ) {
      closeMenu();
    }

  });

});
