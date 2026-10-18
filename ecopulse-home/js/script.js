
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


/* ==========================================
   OUR IMPACT — TESTIMONIAL PHOTO SLIDESHOWS
========================================== */

document.querySelectorAll(".impact-slideshow[data-carousel]").forEach(gallery => {

  const slides = Array.from(
    gallery.querySelectorAll(".impact-slide")
  );

  const previousButton = gallery.querySelector("[data-prev]");
  const nextButton = gallery.querySelector("[data-next]");
  const counter = gallery.querySelector("[data-position]");

  if (slides.length === 0) return;

  let currentIndex = 0;

  function showSlide(index) {
    currentIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentIndex;

      slide.classList.toggle("is-current", active);
      slide.setAttribute("aria-hidden", String(!active));
    });

    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }
  }

  previousButton?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
  });

  nextButton?.addEventListener("click", () => {
    showSlide(currentIndex + 1);
  });

  showSlide(0);
});


(() => {
  const form = document.querySelector("#trees-application-form");
  if (!form) return;

  const get = id => document.getElementById(id);

  const status = get("form-status");
  const frame = get("submission-frame");
  const submitButton = form.querySelector('button[type="submit"]');

  const birthDate = get("birth-date");
  const ageField = get("calculated-age");
  const minorSection = get("minor-section");
  const guardianName = get("guardian-name");
  const guardianPhone = get("guardian-phone");
  const guardianConsent = get("guardian-consent");

  const hasExperience = get("has-experience");
  const experienceWrapper = get("experience-details-wrapper");
  const experienceDetails = get("experience-details");

  const jeremieResident = get("jeremie-resident");
  const travelWrapper = get("travel-wrapper");
  const canTravel = get("can-travel");

  const isFrench = document.documentElement.lang.toLowerCase().startsWith("fr");

  const messages = {
    en: {
      configuration: "The application form is not connected. Please configure the Google Apps Script endpoint.",
      invalid: "Please complete all required fields before continuing.",
      sending: "Submitting your application securely…",
      success: "Your application has been submitted. A confirmation email will be sent to you.",
      submit: "Submit Application"
    },
    fr: {
      configuration: "Le formulaire n'est pas encore connecté. Veuillez configurer l'URL Google Apps Script.",
      invalid: "Veuillez vérifier les champs obligatoires avant de continuer.",
      sending: "Transmission sécurisée de votre candidature…",
      success: "Votre candidature a bien été envoyée. Un courriel de confirmation vous sera transmis.",
      submit: "Envoyer ma candidature"
    }
  }[isFrench ? "fr" : "en"];

  let submitted = false;

  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  }

  function calculateAge(value) {
    if (!value) return null;

    const birth = new Date(`${value}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();

    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) age--;

    return age;
  }

  function toggleFields(wrapper, fields, show) {
    wrapper.hidden = !show;

    fields.forEach(field => {
      field.required = show;

      if (!show) {
        if (field.type === "checkbox") field.checked = false;
        else field.value = "";
      }
    });
  }

  function updateFields() {
    const age = calculateAge(birthDate.value);
    ageField.value = age ?? "";

    toggleFields(
      minorSection,
      [guardianName, guardianPhone, guardianConsent],
      age !== null && age < 18
    );

    toggleFields(
      experienceWrapper,
      [experienceDetails],
      hasExperience.value === "Oui"
    );

    toggleFields(
      travelWrapper,
      [canTravel],
      jeremieResident.value === "Non"
    );
  }

  [birthDate, hasExperience, jeremieResident].forEach(field => {
    field.addEventListener("change", updateFields);
  });

  form.addEventListener("submit", event => {
    updateFields();

    const endpoint = form.getAttribute("action") || "";

    if (!endpoint || endpoint.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
      event.preventDefault();
      setStatus(messages.configuration, "error");
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      setStatus(messages.invalid, "error");
      return;
    }

    submitted = true;
    submitButton.disabled = true;
    submitButton.textContent = messages.sending;
    setStatus(messages.sending, "pending");
  });

  frame.addEventListener("load", () => {
    if (!submitted) return;

    setStatus(messages.success, "success");
    form.reset();
    updateFields();

    submitButton.disabled = false;
    submitButton.textContent = messages.submit;
    submitted = false;

    status.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

  updateFields();
})();
