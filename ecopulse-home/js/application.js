(() => {
  const form = document.querySelector('#trees-application-form');
  if (!form) return;

  const status = document.querySelector('#form-status');
  const frame = document.querySelector('#submission-frame');
  const submitButton = form.querySelector('button[type="submit"]');
  let submitted = false;

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = `form-status ${type}`.trim();
  };

  form.addEventListener('submit', (event) => {
    const endpoint = form.getAttribute('action') || '';
    if (endpoint.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
      event.preventDefault();
      setStatus("Le formulaire n'est pas encore connecté. Ajoutez l’URL Google Apps Script dans application.html.", 'error');
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
    setStatus('Votre candidature a bien été envoyée. Merci pour votre intérêt envers TREES !', 'success');
    form.reset();
    submitButton.disabled = false;
    submitButton.textContent = 'Envoyer ma candidature';
    submitted = false;
    status.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
