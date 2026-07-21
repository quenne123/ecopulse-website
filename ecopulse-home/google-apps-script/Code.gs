/**
 * EcoPulse Foundation — TREES application receiver
 * 1) Add your Google Sheet ID and notification email below.
 * 2) Deploy as a Web app: Execute as "Me"; access "Anyone".
 * 3) Copy the /exec URL into application.html as the form action.
 */
const CONFIG = {
  SPREADSHEET_ID: 'PASTE_YOUR_GOOGLE_SHEET_ID_HERE',
  SHEET_NAME: 'Candidatures TREES 2',
  NOTIFICATION_EMAIL: 'ecopulse.contact@gmail.com',
  SEND_APPLICANT_CONFIRMATION: true
};

const HEADERS = [
  'Horodatage', 'Numéro de candidature', 'Nom complet', 'Date de naissance',
  'Genre', 'Ville / Commune', 'Département', 'Téléphone', 'WhatsApp',
  'Courriel', 'Niveau d’études', 'École / Organisation', 'Expérience antérieure',
  'Motivation', 'Problème communautaire et solution', 'Disponibilité',
  'Source de référence', 'Engagement confirmé', 'Consentement mineur',
  'Consentement confidentialité'
];

function doGet() {
  return ContentService.createTextOutput('EcoPulse TREES application endpoint is active.');
}

function doPost(e) {
  try {
    const data = e && e.parameter ? e.parameter : {};

    // Honeypot anti-spam: legitimate applicants never fill this hidden field.
    if (String(data.website || '').trim()) {
      return response_({ ok: true });
    }

    validate_(data);

    const applicationId = createApplicationId_();
    const submittedAt = new Date();
    const row = [
      submittedAt, applicationId, clean_(data.fullName), clean_(data.birthDate),
      clean_(data.gender), clean_(data.city), clean_(data.department),
      clean_(data.phone), clean_(data.whatsapp), clean_(data.email),
      clean_(data.educationLevel), clean_(data.school),
      clean_(data.previousExperience), clean_(data.motivation),
      clean_(data.communityChallenge), clean_(data.availability),
      clean_(data.referral), clean_(data.commitment), clean_(data.minorConsent),
      clean_(data.privacyConsent)
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      const sheet = getSheet_();
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    sendTeamEmail_(data, applicationId, submittedAt);
    if (CONFIG.SEND_APPLICANT_CONFIRMATION && data.email) {
      sendApplicantConfirmation_(data, applicationId);
    }

    return response_({ ok: true, applicationId: applicationId });
  } catch (error) {
    console.error(error);
    return response_({ ok: false, message: error.message });
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function validate_(data) {
  const required = ['fullName','birthDate','city','department','phone','email',
    'educationLevel','previousExperience','motivation','communityChallenge',
    'availability','commitment','minorConsent','privacyConsent'];
  const missing = required.filter(key => !String(data[key] || '').trim());
  if (missing.length) throw new Error('Champs obligatoires manquants: ' + missing.join(', '));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email))) {
    throw new Error('Adresse courriel invalide.');
  }
}

function createApplicationId_() {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `TREES2-${stamp}-${suffix}`;
}

function clean_(value) {
  // Prefix formula-like values to prevent spreadsheet formula injection.
  const text = String(value || '').trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function escapeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

function field_(label, value) {
  return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;font-weight:bold;vertical-align:top">${escapeHtml_(label)}</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml_(value)}</td></tr>`;
}

function sendTeamEmail_(data, applicationId, submittedAt) {
  const subject = `[TREES 2] Nouvelle candidature — ${clean_(data.fullName)} — ${applicationId}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:760px;margin:auto">
      <h2 style="color:#087f58">Nouvelle candidature TREES — Deuxième édition</h2>
      <p><strong>Numéro:</strong> ${escapeHtml_(applicationId)}<br>
      <strong>Soumise le:</strong> ${escapeHtml_(submittedAt)}</p>
      <table style="border-collapse:collapse;width:100%">
        ${field_('Nom complet', data.fullName)}
        ${field_('Date de naissance', data.birthDate)}
        ${field_('Genre', data.gender)}
        ${field_('Ville / Commune', data.city)}
        ${field_('Département', data.department)}
        ${field_('Téléphone', data.phone)}
        ${field_('WhatsApp', data.whatsapp)}
        ${field_('Courriel', data.email)}
        ${field_('Niveau d’études', data.educationLevel)}
        ${field_('École / Organisation', data.school)}
        ${field_('Expérience', data.previousExperience)}
        ${field_('Motivation', data.motivation)}
        ${field_('Problème et solution', data.communityChallenge)}
        ${field_('Disponibilité', data.availability)}
        ${field_('Référence', data.referral)}
      </table>
      <p style="color:#666;font-size:12px">La candidature complète est également enregistrée dans votre Google Sheet.</p>
    </div>`;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    htmlBody: html,
    name: 'EcoPulse — Programme TREES',
    replyTo: clean_(data.email)
  });
}

function sendApplicantConfirmation_(data, applicationId) {
  MailApp.sendEmail({
    to: clean_(data.email),
    subject: `Confirmation de candidature TREES — ${applicationId}`,
    name: 'EcoPulse Foundation',
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto">
      <h2 style="color:#087f58">Candidature reçue</h2>
      <p>Bonjour ${escapeHtml_(data.fullName)},</p>
      <p>Nous confirmons la réception de votre candidature à la deuxième édition du programme TREES.</p>
      <p><strong>Numéro de candidature:</strong> ${escapeHtml_(applicationId)}</p>
      <p>L’équipe EcoPulse communiquera avec les candidats après l’étude des dossiers.</p>
      <p>Merci pour votre engagement envers un avenir durable.</p>
      <p><strong>EcoPulse Foundation</strong></p>
    </div>`
  });
}

function response_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
