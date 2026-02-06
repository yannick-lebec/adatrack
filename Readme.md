# 🏅 Portfolio Sport – Adatrack

Application web permettant de créer un **portfolio sportif dynamique** avec des thèmes (sports) et des compétences associées, stockées en base de données.

---

## 🚀 Fonctionnalités

- Création de thèmes sportifs (ex: Vélo, Course, Musculation)
- Ajout de compétences avec un niveau en pourcentage
- Suppression de compétences
- Suppression de thèmes (et de leurs compétences associées)
- Données persistantes en base de données
- Interface mise à jour dynamiquement

---

## 🛠️ Technologies utilisées

### Front-end
- HTML5
- CSS3
- JavaScript (Vanilla JS)
  - `fetch`
  - manipulation du DOM
  - `forEach`
  - gestion des événements

### Back-end
- Node.js
- Express.js
- API REST (GET / POST / DELETE)
- dotenv
- cors

### Base de données
- PostgreSQL (Neon)
- Relations avec clés étrangères
- Suppression en cascade (`ON DELETE CASCADE`)

---

## 📂 Structure du projet

adatrack/
|
|--- back/
| |-- server.js
| |-- package.json
| |-- .env
|
|--- front/
| |-- index.html
| |-- styles.css
| |-- app.js
| 
|--- README.md
|
|---.gitignore

## 🧠 Fonctionnement de l’application

### 1️⃣ Chargement des données
- Au chargement de la page, le front appelle l’API `GET /portfolio`
- Le backend récupère les thèmes et leurs compétences
- Le front génère dynamiquement l’affichage avec JavaScript

---

### 2️⃣ Ajout d’une compétence
- L’utilisateur remplit le formulaire (thème, compétence, niveau)
- Une requête `POST /skills` est envoyée au serveur
- Le backend crée le thème s’il n’existe pas
- La compétence est ajoutée en base de données
- L’interface est mise à jour automatiquement

---

### 3️⃣ Suppression d’une compétence
- Clic sur le bouton ❌
- Appel `DELETE /skills/:id`
- La compétence est supprimée en base
- Le portfolio est rechargé

---

### 4️⃣ Suppression d’un thème
- Clic sur “Supprimer le thème”
- Appel `DELETE /themes/:id`
- Toutes les compétences liées sont supprimées automatiquement
- L’affichage est mis à jour

---

## 🧩 Concepts techniques mis en pratique

- API REST
- Architecture front / back
- Base de données relationnelle
- Clés étrangères et suppression en cascade
- Manipulation dynamique du DOM
- Gestion des événements
- Boucles `forEach`
- Persistance des données

---

## ⚙️ Installation et lancement

### Back-end
```bash
cd back
npm install
npm run dev