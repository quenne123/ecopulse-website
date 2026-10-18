
/* MOBILE NAVIGATION */

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".primary-nav");

menuToggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

/* FOOTER YEAR */

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/* SCROLL REVEAL ANIMATIONS */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("visible");
  });
}

/* ANIMATED COUNTERS */

const counters = document.querySelectorAll("[data-count]");

if ("IntersectionObserver" in window) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = Number(element.dataset.count);

        let current = 0;

        const step = Math.max(1, Math.ceil(target / 30));

        const timer = setInterval(() => {
          current = Math.min(target, current + step);
          element.textContent = current;

          if (current === target) {
            clearInterval(timer);
          }
        }, 40);

        countObserver.unobserve(element);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((element) => {
    countObserver.observe(element);
  });
} else {
  counters.forEach((element) => {
    element.textContent = element.dataset.count;
  });
}

/* PROGRAMMES DROPDOWN — CLICK ONLY */

document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
  const dropdownToggle = dropdown.querySelector(".nav-dropdown-toggle");

  if (!dropdownToggle) return;

  function setOpen(open) {
    dropdown.classList.toggle("is-open", open);
    dropdownToggle.setAttribute("aria-expanded", String(open));
  }

  dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    setOpen(!dropdown.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      setOpen(false);
    }
  });

  dropdown.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      dropdownToggle.focus();
    }
  });
});


/* ENGLISH / FRENCH LANGUAGE SWITCHER */

(function () {
  const pathname = window.location.pathname;
  const isFrench = pathname === "/fr" || pathname.startsWith("/fr/");

  let englishPath = isFrench
    ? pathname.replace(/^\/fr(?=\/|$)/, "") || "/index.html"
    : pathname;

  if (englishPath === "/") {
    englishPath = "/index.html";
  }

  const frenchPath = "/fr" + englishPath;

  document.querySelectorAll(".language-switcher").forEach((switcher) => {
    const englishLink = switcher.querySelector('[data-lang="en"]');
    const frenchLink = switcher.querySelector('[data-lang="fr"]');

    if (englishLink) {
      englishLink.href = englishPath + window.location.search;
      englishLink.classList.toggle("active", !isFrench);

      if (!isFrench) {
        englishLink.setAttribute("aria-current", "page");
      } else {
        englishLink.removeAttribute("aria-current");
      }
    }

    if (frenchLink) {
      frenchLink.href = frenchPath + window.location.search;
      frenchLink.classList.toggle("active", isFrench);

      if (isFrench) {
        frenchLink.setAttribute("aria-current", "page");
      } else {
        frenchLink.removeAttribute("aria-current");
      }
    }
  });
})();
