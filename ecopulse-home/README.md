# Updated TREES application system

Replace in your website project:
- application.html
- js/application.js

Paste google-apps-script/Code.gs into:
Google Sheet > Extensions > Apps Script

Then:
1. Create a blank Google Sheet.
2. Copy the ID between /d/ and /edit in its URL.
3. Paste it into CONFIG.SPREADSHEET_ID in Code.gs.
4. Deploy Apps Script as a Web app.
5. Execute as: Me.
6. Who has access: Anyone.
7. Copy the deployment URL ending in /exec.
8. Paste it into application.html as the form action.
9. Test one application.

The system saves each application to Google Sheets, emails EcoPulse with the subject:
New TREES application received from [applicant name]

It also sends a confirmation to the applicant in French or Haitian Creole, based on the selected language.
