(() => {
  const form = document.querySelector('#trees-application-form');
  if (!form) return;

  const status = document.querySelector('#form-status');
  const frame = document.querySelector('#submission-frame');
  const submitButton = form.querySelector('button[type="submit"]');
  const birthDate = document.querySelector('#birth-date');
  const ageField = document.querySelector('#calculated-age');
  const minorSection = document.querySelector('#minor-section');
  const guardianName = document.querySelector('#guardian-name');
  const guardianPhone = document.querySelector('#guardian-phone');
  const guardianConsent = document.querySelector('#guardian-consent');
  const hasExperience = document.querySelector('#has-experience');
  const experienceWrapper = document.querySelector('#experience-details-wrapper');
  const experienceDetails = document.querySelector('#experience-details');
  const jeremieResident = document.querySelector('#jeremie-resident');
  const travelWrapper = document.querySelector('#travel-wrapper');
  const canTravel = document.querySelector('#can-travel');

  let submitted = false;

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const birth = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  };

  const updateMinorFields = () => {
    const age = calculateAge(birthDate.value);
    ageField.value = age === null ? '' : String(age);
    const isMinor = age !== null && age < 18;
    minorSection.hidden = !isMinor;
    guardianName.required = isMinor;
    guardianPhone.required = isMinor;
    guardianConsent.required = isMinor;
    if (!isMinor) {
      guardianName.value = '';
      guardianPhone.value = '';
      guardianConsent.checked = false;
    }
  };

  const updateExperienceField = () => {
    const show = hasExperience.value === 'Oui';
    experienceWrapper.hidden = !show;
    experienceDetails.required = show;
    if (!show) experienceDetails.value = '';
  };

  const updateTravelField = () => {
    const show = jeremieResident.value === 'Non';
    travelWrapper.hidden = !show;
    canTravel.required = show;
    if (!show) canTravel.value = '';
  };

  birthDate.addEventListener('change', updateMinorFields);
  hasExperience.addEventListener('change', updateExperienceField);
  jeremieResident.addEventListener('change', updateTravelField);

  form.addEventListener('submit', (event) => {
    updateMinorFields();
    updateExperienceField();
    updateTravelField();

    const endpoint = form.getAttribute('action') || '';
    if (endpoint.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
      event.preventDefault();
      setStatus("Le formulaire n'est pas encore connecté. Remplacez l’URL dans l’attribut action de application.html par votre URL Google Apps Script se terminant par /exec.", 'error');
      return;
    }

    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      setStatus('Veuillez vérifier les champs obligatoires avant de continuer.', 'error');
      return;
    }

    submitted = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours…';
    setStatus('Transmission sécurisée de votre candidature…', 'pending');
  });

  frame.addEventListener('load', () => {
    if (!submitted) return;
    setStatus('Votre candidature a bien été envoyée. Un courriel de confirmation vous sera transmis.', 'success');
    form.reset();
    updateMinorFields();
    updateExperienceField();
    updateTravelField();
    submitButton.disabled = false;
    submitButton.textContent = 'Envoyer ma candidature';
    submitted = false;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  updateMinorFields();
  updateExperienceField();
  updateTravelField();
})();
