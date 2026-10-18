
/* MOBILE NAVIGATION */

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".primary-nav");

function closeMenu() {
  nav?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}

menuToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open") ?? false;
  menuToggle.setAttribute("aria-expanded", String(open));
});

nav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", closeMenu);
});


/* FOOTER YEAR */

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();


/* SCROLL REVEAL ANIMATIONS */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  revealElements.forEach(element => observer.observe(element));
} else {
  revealElements.forEach(element => element.classList.add("visible"));
}


/* ANIMATED COUNTERS */

const counters = document.querySelectorAll("[data-count]");

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const step = Math.max(1, Math.ceil(target / 30));
  let current = 0;

  const timer = setInterval(() => {
    current = Math.min(target, current + step);
    element.textContent = current;

    if (current >= target) clearInterval(timer);
  }, 40);
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(element => observer.observe(element));
} else {
  counters.forEach(element => {
    element.textContent = element.dataset.count;
  });
}


/* PROGRAMS DROPDOWN */

document.querySelectorAll(".nav-dropdown").forEach(dropdown => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  if (!toggle) return;

  function setOpen(open) {
    dropdown.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", event => {
    event.stopPropagation();
    setOpen(!dropdown.classList.contains("is-open"));
  });

  document.addEventListener("click", event => {
    if (!dropdown.contains(event.target)) setOpen(false);
  });

  dropdown.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setOpen(false);
      toggle.focus();
    }
  });

  dropdown.querySelectorAll(".nav-submenu a").forEach(link => {
    link.addEventListener("click", () => setOpen(false));
  });
});


/* ENGLISH / FRENCH LANGUAGE SWITCHER */

const pathname = window.location.pathname;
const isFrench = pathname === "/fr" || pathname.startsWith("/fr/");

let englishPath = isFrench
  ? pathname.replace(/^\/fr(?=\/|$)/, "") || "/index.html"
  : pathname;

if (englishPath === "/") englishPath = "/index.html";

const paths = {
  en: englishPath,
  fr: "/fr" + englishPath
};

document.querySelectorAll(".language-switcher").forEach(switcher => {
  switcher.querySelectorAll("[data-lang]").forEach(link => {
    const language = link.dataset.lang;
    if (!paths[language]) return;

    link.href = paths[language] + window.location.search;

    const active = language === (isFrench ? "fr" : "en");
    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});
