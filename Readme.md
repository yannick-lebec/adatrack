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

## ⚙️ Installation et lancement

### 1️⃣ Back-end
```bash
cd back
npm install
npm run dev
Le serveur démarre sur :

http://localhost:4242



 2️⃣ Front-end

Ouvrir front/index.html

ou utiliser Live Server (VS Code)

🧠 Fonctionnement

Le front récupère les données via l’API (GET /portfolio)

Les thèmes et compétences sont générés dynamiquement

Les ajouts et suppressions sont immédiatement synchronisés avec la base de données

🎓 Objectif pédagogique

Ce projet a été réalisé dans un cadre pédagogique afin de mettre en pratique :

la communication front / back

l’utilisation d’une base de données relationnelle

la création d’une API REST

la manipulation dynamique du DOM

les bonnes pratiques JavaScript

🔮 Améliorations possibles

Modifier une compétence

Ajouter un emoji par thème

Authentification utilisateur

Déploiement en ligne