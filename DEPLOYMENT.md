# Guide de Déploiement — BabyStore (Supabase + Vercel)

Le projet a été migré vers **Supabase** (backend/DB) + **Vercel** (frontend). Plus de MongoDB ni de backend Node séparé.

---

## 1. Supabase — Configuration du Backend

### 1.1 Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com) et créez un compte / connectez-vous.
2. Cliquez sur **New Project** → donnez un nom (ex: `babystore`).
3. Choisissez une région proche de vos utilisateurs.
4. Notez quelque part le **Project URL** et le **anon/public key** (Settings → API).

### 1.2 Exécuter le schéma
1. Dans le dashboard Supabase → **SQL Editor**.
2. Ouvrez `supabase/schema.sql` et collez-le dans l'éditeur.
3. Cliquez sur **Run** pour créer toutes les tables, triggers et policies.

### 1.3 Ajouter les données de test
1. Toujours dans le **SQL Editor**.
2. Ouvrez `supabase/seed.sql` et collez-le.
3. Cliquez sur **Run** — les catégories et produits sont injectés.

### 1.4 Créer le bucket de stockage
1. Dans Supabase → **Storage** → **New bucket**.
2. Nom : `product-images` | Cochez **Public bucket**.

---

## 2. Vercel — Déploiement du Frontend

### 2.1 Préparer le fichier d'environnement local
Dans `frontend/`, créez un fichier `.env` (à côté de `.env.example`) :
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```
> Ces valeurs viennent de l'étape 1.1 (Settings → API → `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`).

### 2.2 Pousser sur GitHub
```bash
cd BabyShop
git init                    # si pas encore fait
git add .
git commit -m "BabyStore - migration complete"
# Créez un repo sur github.com puis :
git remote add origin https://github.com/your-username/babystore.git
git push -u origin master
```

### 2.3 Déployer sur Vercel
1. Allez sur [vercel.com](https://vercel.com) → **Add New...** → **Project**.
2. Importez le repo GitHub.
3. Dans **Root Directory**, cliquez sur **Edit** et sélectionnez `frontend`.
4. Vercel détecte automatiquement Vite comme framework.
5. Dans **Environment Variables**, ajoutez :
   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
6. Cliquez sur **Deploy**.

Vercel construit et déploie automatiquement à chaque push sur `master`.

---

## 3. Tester le déploiement

Ouvrez l'URL Vercel (ex: `https://babystore.vercel.app`) et vérifiez :

- [ ] La page d'accueil s'affiche avec les produits
- [ ] Le changement de langue fonctionne
- [ ] La navigation vers le catalogue et les détails produit fonctionne
- [ ] L'inscription / connexion via Supabase fonctionne
- [ ] Ajouter au panier → le badge s'incrémente
- [ ] Passer une commande → le PIX mock s'affiche

---

## 4. Configurer l'authentification (optionnel mais recommandé)

Dans Supabase → **Authentication** → **URL Configuration** :
- **Site URL** : `https://your-app.vercel.app`
- **Redirect URLs** : ajoutez aussi `http://localhost:5173` pour le développement local.

---

## 5. Développement local

```bash
cd frontend
cp .env.example .env
# Éditez .env avec vos clés Supabase
npm install
npm run dev
```

> Le backend Supabase est toujours accessible depuis localhost — il n'y a plus de serveur Node local à lancer.
