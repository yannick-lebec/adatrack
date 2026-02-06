require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { neon } = require("@neondatabase/serverless");

const app = express();
const PORT = process.env.PORT || 4242;

app.use(cors());
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

// Healthcheck
app.get("/", (req, res) => {
  res.json({ ok: true });
});

// Récupérer tous les thèmes + leurs skills
app.get("/portfolio", async (req, res) => {
  try {
    const themes = await sql`
      SELECT id, name
      FROM themes
      ORDER BY id;
    `;

    const skills = await sql`
      SELECT s.id, s.name, s.value, s.theme_id
      FROM skills s
      ORDER BY s.theme_id, s.id;
    `;

    // regrouper skills par theme_id
    const skillsByTheme = new Map();
    for (const s of skills) {
      if (!skillsByTheme.has(s.theme_id)) skillsByTheme.set(s.theme_id, []);
      skillsByTheme
        .get(s.theme_id)
        .push({ id: s.id, name: s.name, value: s.value });
    }

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

// Ajouter une skill + créer le thème si nécessaire
app.post("/skills", async (req, res) => {
  const { theme, name, value } = req.body;

  if (!theme || !name || value === undefined) {
    return res.status(400).json({ error: "theme, name, value are required" });
  }

  const cleanedTheme = String(theme).trim().toLowerCase();
  const cleanedName = String(name).trim();
  const intValue = Number(value);

  if (!cleanedName) {
    return res.status(400).json({ error: "name cannot be empty" });
  }

  if (Number.isNaN(intValue) || intValue < 0 || intValue > 100) {
    return res.status(400).json({ error: "value must be between 0 and 100" });
  }

  try {
    // trouver ou créer le thème
    let t =
      await sql`SELECT id FROM themes WHERE name = ${cleanedTheme} LIMIT 1`;
    if (t.length === 0) {
      t = await sql`
        INSERT INTO themes (name)
        VALUES (${cleanedTheme})
        RETURNING id;
      `;
    }
    const themeId = t[0].id;

    const inserted = await sql`
      INSERT INTO skills (name, value, theme_id)
      VALUES (${cleanedName}, ${intValue}, ${themeId})
      RETURNING id, name, value, theme_id;
    `;

    res.status(201).json({ inserted: inserted[0], theme: cleanedTheme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/themes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid theme id" });
  }

  try {
    const deleted = await sql`
      DELETE FROM themes
      WHERE id = ${id}
      RETURNING id;
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Theme not found" });
    }

    // Les skills liées sont supprimées automatiquement (ON DELETE CASCADE)
    res.json({ deleted: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.delete("/skills/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    await sql`DELETE FROM skills WHERE id = ${id}`;
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening to http://localhost:${PORT}`);
});
