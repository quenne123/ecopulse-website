
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
