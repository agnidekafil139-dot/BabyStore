# Guide de Déploiement - BabyStore (MERN + PIX)

Voici les étapes à suivre pour lancer le projet complètement en production.

## 1. Base de données : MongoDB Atlas
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Créez un nouveau projet et un cluster gratuit (Shared / M0).
3. Dans **Database Access**, créez un utilisateur (notez le nom d'utilisateur et le mot de passe).
4. Dans **Network Access**, ajoutez l'IP `0.0.0.0/0` pour autoriser toutes les connexions entrantes (nécessaire pour Render).
5. Cliquez sur **Connect** > **Connect your application** sur le cluster, et copiez l'URL de connexion (`MONGO_URI`). Remplacez `<password>` par le mot de passe de l'utilisateur.

## 2. Backend : Déploiement sur Render
Le backend sera hébergé sur Render (gratuit).

1. Poussez votre code (dossiers `backend` et `frontend`) sur un dépôt GitHub.
2. Créez un compte sur [Render](https://render.com/).
3. Cliquez sur **New Web Service**, et connectez votre compte GitHub.
4. Sélectionnez le dépôt de votre projet e-commerce.
5. Dans les paramètres de Render :
   - **Root Directory** : `backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
6. Allez dans **Environment Variables** (variables d'environnement) et ajoutez :
   - `PORT` : `5000`
   - `MONGO_URI` : *(votre URI Atlas copiée à l'étape 1)*
   - `JWT_SECRET` : *(une longue chaine aléatoire)*
   - `MERCADOPAGO_ACCESS_TOKEN` : *(votre clé d'API Prod MercadoPago pour le PIX)*
7. Cliquez sur **Create Web Service**. Une fois terminé, copiez l'URL de l'API (ex: `https://babystore-api.onrender.com`).

## 3. Frontend : Déploiement sur Vercel
Le frontend fonctionnant via Vite, Vercel est la plateforme idéale pour ses performances.

1. Allez dans le code frontend et mettez à jour la constante d'API pour pointer vers Render. Dans `frontend/src/constants.js` :
   ```javascript
   export const BASE_URL = 'https://babystore-api.onrender.com';
   ```
2. Mettez cette modification sur GitHub (`git push`).
3. Créez un compte sur [Vercel](https://vercel.com).
4. Cliquez sur **Add New...** > **Project** et importez votre dépôt GitHub.
5. Vercel détectera probablement qu'il y a un dossier frontend et backend. Dans la section **Root Directory**, cliquez sur `Edit` et sélectionnez le dossier `frontend`.
6. Les réglages de build par défaut de Vite seront reconnus (`npm run build` et public dir `dist`).
7. Cliquez sur **Deploy**.
8. Félicitations 🎉 ! Votre application est en ligne et accessible via l'URL générée par Vercel.

## 4. Webhook PIX (MercadoPago)
Une fois le backend en ligne sur Render :
1. Allez sur votre panel MercadoPago (Developer > Webhooks).
2. Ajoutez une URL de notification : `https://babystore-api.onrender.com/api/payments/webhook`.
3. Cochez les évènements de `Paiements` ("pagamentos").
4. Ainsi, chaque paiement PIX validé sur l'UX de Vercel sera notifié en production à votre Backend sur Render.
