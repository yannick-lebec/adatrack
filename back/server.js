// Charge les variables d’environnement depuis le fichier .env
require("dotenv").config();

// Import des dépendances
const express = require("express");          // Framework web Node.js
const cors = require("cors");                // Autorise les requêtes cross-origin
const { neon } = require("@neondatabase/serverless"); // Client PostgreSQL (Neon)

// Création de l'application Express
const app = express();

// Port du serveur (défini dans .env ou par défaut 4242)
const PORT = process.env.PORT || 4242;

// Middlewares globaux
app.use(cors());               // Autorise les requêtes venant du front
app.use(express.json());       // Permet de lire le JSON dans req.body

// Connexion à la base de données via Neon
const sql = neon(process.env.DATABASE_URL);

// --------------------
// ROUTES
// --------------------

// Route de test (healthcheck)
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// --------------------
// GET /portfolio
// Récupère tous les thèmes avec leurs compétences associées
// --------------------
app.get("/portfolio", async (req, res) => {
  try {
    // Récupération des thèmes
    const themes = await sql`
      SELECT id, name
      FROM themes
      ORDER BY id;
    `;

    // Récupération des compétences
    const skills = await sql`
      SELECT s.id, s.name, s.value, s.theme_id
      FROM skills s
      ORDER BY s.theme_id, s.id;
    `;

    // Regroupement des compétences par thème
    const skillsByTheme = new Map();

    for (const s of skills) {
      if (!skillsByTheme.has(s.theme_id)) {
        skillsByTheme.set(s.theme_id, []);
      }

      skillsByTheme.get(s.theme_id).push({
        id: s.id,
        name: s.name,
        value: s.value,
      });
    }

    // Construction de la réponse finale
    const portfolio = themes.map((t) => ({
      id: t.id,
      name: t.name,
      skills: skillsByTheme.get(t.id) || [],
    }));

    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// --------------------
// POST /skills
// Ajoute une compétence
// Crée le thème s’il n’existe pas
// --------------------
app.post("/skills", async (req, res) => {
  const { theme, name, value } = req.body;

  // Vérification des champs obligatoires
  if (!theme || !name || value === undefined) {
    return res.status(400).json({
      error: "theme, name, value are required",
    });
  }

  // Nettoyage des données
  const cleanedTheme = String(theme).trim();
  const cleanedName = String(name).trim();
  const intValue = Number(value);

  // Validation du nom de la compétence
  if (!cleanedName) {
    return res.status(400).json({ error: "name cannot be empty" });
  }

  // Validation de la valeur (0 à 100)
  if (Number.isNaN(intValue) || intValue < 0 || intValue > 100) {
    return res.status(400).json({
      error: "value must be between 0 and 100",
    });
  }

  try {
    // Vérifie si le thème existe déjà
    let t = await sql`
      SELECT id
      FROM themes
      WHERE name = ${cleanedTheme}
      LIMIT 1;
    `;

    // Si le thème n’existe pas, on le crée
    if (t.length === 0) {
      t = await sql`
        INSERT INTO themes (name)
        VALUES (${cleanedTheme})
        RETURNING id;
      `;
    }

    const themeId = t[0].id;

    // Insertion de la compétence
    const inserted = await sql`
      INSERT INTO skills (name, value, theme_id)
      VALUES (${cleanedName}, ${intValue}, ${themeId})
      RETURNING id, name, value, theme_id;
    `;

    res.status(201).json({
      inserted: inserted[0],
      theme: cleanedTheme,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// --------------------
// DELETE /themes/:id
// Supprime un thème et toutes ses compétences
// (ON DELETE CASCADE)
// --------------------
app.delete("/themes/:id", async (req, res) => {
  const id = Number(req.params.id);

  // Validation de l’ID
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid theme id" });
  }

  try {
    const deleted = await sql`
      DELETE FROM themes
      WHERE id = ${id}
      RETURNING id;
    `;

    // Si le thème n’existe pas
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Theme not found" });
    }

    // Les compétences liées sont supprimées automatiquement
    res.json({ deleted: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// --------------------
// DELETE /skills/:id
// Supprime une compétence
// --------------------
app.delete("/skills/:id", async (req, res) => {
  const id = Number(req.params.id);

  // Validation de l’ID
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    await sql`
      DELETE FROM skills
      WHERE id = ${id};
    `;

    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// --------------------
// Lancement du serveur
// --------------------
app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});