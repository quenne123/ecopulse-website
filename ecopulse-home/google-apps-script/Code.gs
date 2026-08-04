/**
 * EcoPulse Foundation — TREES 2 application backend
 *
 * 1. Create a blank Google Sheet.
 * 2. Paste the Sheet ID in CONFIG.SPREADSHEET_ID.
 * 3. In Google Sheets: Extensions > Apps Script.
 * 4. Paste this file into Code.gs.
 * 5. Deploy as a Web app: Execute as "Me"; access "Anyone".
 * 6. Copy the /exec URL into application.html.
 */
const CONFIG = {
  SPREADSHEET_ID: 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE',
  SHEET_NAME: 'Candidatures TREES 2',
  NOTIFICATION_EMAIL: 'ecopulse.contact@gmail.com',
  SEND_APPLICANT_CONFIRMATION: true,
  PROGRAM_DATES: '18 au 20 septembre'
};

const HEADERS = [
  'Horodatage','Numéro de candidature','Statut','Prénom','Nom de famille','Nom complet',
  'Date de naissance','Âge','Sexe','Ville d’origine','Ville actuelle','Département',
  'Courriel','Téléphone','WhatsApp','Niveau scolaire','Établissement','Domaine d’études',
  'Langue préférée','Expérience préalable','Description de l’expérience',
  'Source de découverte','Personne référente','Disponibilité','Réside à Jérémie',
  'Déplacement vers Jérémie','Motivation','Deux problèmes environnementaux',
  'Action communautaire proposée','Besoins particuliers','Nom du parent / responsable',
  'Téléphone du parent / responsable','Consentement du parent','Engagement confirmé',
  'Consentement confidentialité','Consentement photo / vidéo','Notes internes','Décision'
];

function doGet() {
  return ContentService.createTextOutput('EcoPulse TREES application endpoint is active.');
}

function doPost(e) {
  try {
    const data = e && e.parameter ? e.parameter : {};
    if (String(data.website || '').trim()) return response_({ ok: true });

    validate_(data);

    const submittedAt = new Date();
    const applicationId = createApplicationId_();
    const fullName = `${clean_(data.firstName)} ${clean_(data.lastName)}`.trim();
    const age = calculateAge_(data.birthDate);

    const row = [
      submittedAt, applicationId, 'À examiner', clean_(data.firstName), clean_(data.lastName),
      fullName, clean_(data.birthDate), age, clean_(data.gender), clean_(data.originCity),
      clean_(data.currentCity), clean_(data.department), clean_(data.email), clean_(data.phone),
      clean_(data.whatsapp), clean_(data.educationLevel), clean_(data.school),
      clean_(data.studyField), clean_(data.preferredLanguage), clean_(data.hasExperience),
      clean_(data.previousExperience), clean_(data.heardAbout), clean_(data.referrerName),
      clean_(data.availability), clean_(data.jeremieResident), clean_(data.canTravelToJeremie),
      clean_(data.motivation), clean_(data.environmentalIssues), clean_(data.communityAction),
      clean_(data.specialNeeds), clean_(data.guardianName), clean_(data.guardianPhone),
      clean_(data.guardianConsent), clean_(data.commitment), clean_(data.privacyConsent),
      clean_(data.mediaConsent), '', ''
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      getSheet_().appendRow(row);
    } finally {
      lock.releaseLock();
    }

    sendTeamEmail_(data, fullName, age, applicationId, submittedAt);
    if (CONFIG.SEND_APPLICANT_CONFIRMATION && data.email) {
      sendApplicantConfirmation_(data, fullName, applicationId);
    }

    return response_({ ok: true, applicationId });
  } catch (error) {
    console.error(error);
    return response_({ ok: false, message: error.message || 'Une erreur inconnue est survenue.' });
  }
}

function getSheet_() {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID === 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Ajoutez votre identifiant Google Sheet dans CONFIG.SPREADSHEET_ID.');
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#087f58')
      .setFontColor('#ffffff');
    sheet.autoResizeColumns(1, HEADERS.length);
  }
  return sheet;
}

function validate_(data) {
  const required = [
    'firstName','lastName','birthDate','originCity','currentCity','department','email','phone',
    'educationLevel','preferredLanguage','hasExperience','heardAbout','availability',
    'jeremieResident','motivation','environmentalIssues','communityAction','commitment',
    'privacyConsent','mediaConsent'
  ];

  const missing = required.filter(key => !String(data[key] || '').trim());

  if (String(data.hasExperience || '') === 'Oui' && !String(data.previousExperience || '').trim()) {
    missing.push('previousExperience');
  }
  if (String(data.jeremieResident || '') === 'Non' && !String(data.canTravelToJeremie || '').trim()) {
    missing.push('canTravelToJeremie');
  }

  const age = calculateAge_(data.birthDate);
  if (age < 18) {
    ['guardianName','guardianPhone','guardianConsent'].forEach(key => {
      if (!String(data[key] || '').trim()) missing.push(key);
    });
  }

  if (missing.length) {
    throw new Error('Champs obligatoires manquants : ' + [...new Set(missing)].join(', '));
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
    throw new Error('Adresse courriel invalide.');
  }
  if (String(data.motivation).trim().length < 100) {
    throw new Error('La réponse de motivation doit contenir au moins 100 caractères.');
  }
  if (String(data.environmentalIssues).trim().length < 100) {
    throw new Error('La réponse sur les problèmes environnementaux doit contenir au moins 100 caractères.');
  }
  if (String(data.communityAction).trim().length < 80) {
    throw new Error('La proposition d’action doit contenir au moins 80 caractères.');
  }
}

function calculateAge_(birthDateValue) {
  const birth = new Date(String(birthDateValue) + 'T00:00:00');
  if (isNaN(birth.getTime())) throw new Error('Date de naissance invalide.');
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age--;
  if (age < 10 || age > 100) throw new Error('Veuillez vérifier la date de naissance.');
  return age;
}

function createApplicationId_() {
  const year = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy');
  const properties = PropertiesService.getScriptProperties();
  const key = `TREES_APPLICATION_SEQUENCE_${year}`;
  const current = Number(properties.getProperty(key) || '0') + 1;
  properties.setProperty(key, String(current));
  return `TREES-${year}-${String(current).padStart(4, '0')}`;
}

function clean_(value) {
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#039;').replace(/\n/g,'<br>');
}

function field_(label, value) {
  return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;vertical-align:top;width:34%">${escapeHtml_(label)}</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml_(value || '—')}</td></tr>`;
}

function sendTeamEmail_(data, fullName, age, applicationId, submittedAt) {
  const subject = `New TREES application received from ${clean_(fullName)}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:780px;margin:auto">
      <h2 style="color:#087f58">Nouvelle candidature TREES — Deuxième édition</h2>
      <p><strong>Numéro :</strong> ${escapeHtml_(applicationId)}<br>
      <strong>Date :</strong> ${escapeHtml_(submittedAt)}<br>
      <strong>Programme :</strong> ${escapeHtml_(CONFIG.PROGRAM_DATES)}</p>
      <table style="border-collapse:collapse;width:100%">
        ${field_('Nom complet', fullName)}
        ${field_('Date de naissance', data.birthDate)}
        ${field_('Âge', age)}
        ${field_('Sexe', data.gender)}
        ${field_('Ville d’origine', data.originCity)}
        ${field_('Ville actuelle', data.currentCity)}
        ${field_('Département', data.department)}
        ${field_('Courriel', data.email)}
        ${field_('Téléphone', data.phone)}
        ${field_('WhatsApp', data.whatsapp)}
        ${field_('Niveau scolaire', data.educationLevel)}
        ${field_('Établissement', data.school)}
        ${field_('Domaine d’études', data.studyField)}
        ${field_('Langue préférée', data.preferredLanguage)}
        ${field_('Expérience préalable', data.hasExperience)}
        ${field_('Description de l’expérience', data.previousExperience)}
        ${field_('A entendu parler de TREES par', data.heardAbout)}
        ${field_('Personne référente', data.referrerName)}
        ${field_('Disponibilité', data.availability)}
        ${field_('Réside à Jérémie', data.jeremieResident)}
        ${field_('Déplacement à Jérémie', data.canTravelToJeremie)}
        ${field_('Motivation', data.motivation)}
        ${field_('Deux problèmes environnementaux', data.environmentalIssues)}
        ${field_('Action communautaire proposée', data.communityAction)}
        ${field_('Besoins particuliers', data.specialNeeds)}
        ${field_('Parent ou responsable', data.guardianName)}
        ${field_('Téléphone du responsable', data.guardianPhone)}
        ${field_('Consentement photo / vidéo', data.mediaConsent)}
      </table>
      <p style="color:#666;font-size:12px">La candidature complète est également enregistrée dans votre Google Sheet.</p>
    </div>`;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject,
    htmlBody: html,
    name: 'EcoPulse — Programme TREES',
    replyTo: clean_(data.email)
  });
}

function sendApplicantConfirmation_(data, fullName, applicationId) {
  const isCreole = clean_(data.preferredLanguage) === 'Kreyòl ayisyen';
  const subject = isCreole
    ? `Konfimasyon kandidati TREES — ${applicationId}`
    : `Confirmation de candidature TREES — ${applicationId}`;

  const htmlBody = isCreole
    ? `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
        <h2 style="color:#087f58">Nou resevwa kandidati ou</h2>
        <p>Bonjou ${escapeHtml_(fullName)},</p>
        <p>Nou konfime ke nou resevwa kandidati ou pou dezyèm edisyon pwogram TREES la.</p>
        <p><strong>Nimewo kandidati :</strong> ${escapeHtml_(applicationId)}</p>
        <p>Pwogram nan ap fèt soti 18 pou rive 20 septanm. Ekip EcoPulse la ap kontakte kandida yo apre evalyasyon dosye yo.</p>
        <p>Mèsi pou angajman ou pou yon avni dirab.</p><p><strong>EcoPulse Foundation</strong></p></div>`
    : `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
        <h2 style="color:#087f58">Candidature reçue</h2>
        <p>Bonjour ${escapeHtml_(fullName)},</p>
        <p>Nous confirmons la réception de votre candidature à la deuxième édition du programme TREES.</p>
        <p><strong>Numéro de candidature :</strong> ${escapeHtml_(applicationId)}</p>
        <p>Le programme aura lieu du 18 au 20 septembre. L’équipe EcoPulse communiquera avec les candidats après l’étude des dossiers.</p>
        <p>Merci pour votre engagement envers un avenir durable.</p><p><strong>EcoPulse Foundation</strong></p></div>`;

  MailApp.sendEmail({
    to: clean_(data.email),
    subject,
    name: 'EcoPulse Foundation',
    htmlBody
  });
}

function response_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
