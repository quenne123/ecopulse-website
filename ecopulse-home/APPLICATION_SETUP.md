# Connecter la page de candidature à Google Sheets et Gmail

Cette solution ne nécessite aucun abonnement payant. Les candidatures sont enregistrées dans un Google Sheet appartenant à votre compte Google, et un courriel est envoyé à EcoPulse. Vous pouvez ensuite télécharger le Sheet en CSV ou Excel pour conserver une copie sur votre ordinateur.

## 1. Créer le fichier de stockage

1. Ouvrez Google Sheets et créez une feuille nommée `Candidatures TREES 2`.
2. Copiez l’identifiant du fichier dans son URL. Dans `https://docs.google.com/spreadsheets/d/IDENTIFIANT/edit`, l’identifiant est la partie entre `/d/` et `/edit`.

## 2. Créer le récepteur Apps Script

1. Dans la feuille Google, ouvrez **Extensions → Apps Script**.
2. Effacez le contenu de `Code.gs`.
3. Copiez le contenu du fichier `google-apps-script/Code.gs` de ce projet.
4. Remplacez `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` par l’identifiant de votre feuille.
5. Vérifiez `NOTIFICATION_EMAIL`. Il est actuellement configuré sur `ecopulse.contact@gmail.com`.
6. Dans **Project Settings**, choisissez le fuseau horaire approprié, par exemple `America/Port-au-Prince`.
7. Enregistrez.

## 3. Déployer le script

1. Cliquez **Deploy → New deployment**.
2. Sélectionnez **Web app**.
3. Dans **Execute as**, choisissez **Me**.
4. Dans **Who has access**, choisissez **Anyone**.
5. Cliquez **Deploy** et autorisez les permissions demandées.
6. Copiez l’URL qui se termine par `/exec`. N’utilisez pas l’URL `/dev`.

## 4. Connecter le site

1. Ouvrez `application.html` dans VS Code.
2. Recherchez `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL`.
3. Remplacez cette valeur par l’URL `/exec` copiée à l’étape précédente.
4. Enregistrez et rechargez la page avec Live Server.

## 5. Tester

1. Faites une candidature test avec une adresse courriel à laquelle vous avez accès.
2. Vérifiez que la ligne apparaît dans le Google Sheet.
3. Vérifiez que `ecopulse.contact@gmail.com` reçoit le courriel.
4. Si les confirmations sont activées, vérifiez également le courriel du candidat.

## Mise à jour ultérieure

Après toute modification de `Code.gs`, créez une nouvelle version du déploiement via **Deploy → Manage deployments → Edit → New version → Deploy**. L’URL `/exec` peut rester la même.

## Sauvegarde sur votre ordinateur

Dans Google Sheets, utilisez **File → Download → Microsoft Excel (.xlsx)** ou **Comma-separated values (.csv)**. Faites cette sauvegarde régulièrement pendant la période de candidature.

## Limites et sécurité

- Ne recueillez pas de mots de passe, de données bancaires ou de copies de pièces d’identité dans ce formulaire.
- Limitez l’accès au Google Sheet aux responsables autorisés.
- Google Apps Script applique des quotas quotidiens, notamment pour les courriels. Pour une campagne normale de candidatures, la solution convient généralement; surveillez toutefois les quotas si vous prévoyez un volume élevé.
- Le formulaire comprend un champ invisible anti-robot, mais un CAPTCHA pourra être ajouté plus tard si du spam apparaît.
