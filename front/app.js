const API_URL = "http://localhost:4242";
const portfolioEl = document.getElementById("portfolio");
const form = document.getElementById("skillForm");

function renderPortfolio(portfolio) {
  portfolioEl.innerHTML = "";

  if (!portfolio || portfolio.length === 0) {
    portfolioEl.innerHTML = `<section class="sport"><h2>Aucun thème</h2></section>`;
    return;
  }

  for (const theme of portfolio) {
    const section = document.createElement("section");
    section.className = "sport";

    section.innerHTML = `
      <h2>🏅 ${theme.name}</h2>
      <ul class="skills"></ul>
    `;

    const ul = section.querySelector(".skills");

    for (const s of theme.skills) {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="progress-circle" style="--value: ${s.value}">
          <span>${s.value}%</span>
        </div>
        <p>${s.name}</p>
      `;
      ul.appendChild(li);
    }

    portfolioEl.appendChild(section);
  }
}

async function loadPortfolio() {
  const res = await fetch(`${API_URL}/portfolio`);
  if (!res.ok) throw new Error("Impossible de charger le portfolio");
  const data = await res.json();
  renderPortfolio(data);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadPortfolio();
  } catch (e) {
    console.error(e);
    portfolioEl.innerHTML = `<section class="sport"><h2>Erreur chargement</h2></section>`;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const theme = document.getElementById("themeName").value.trim().toLowerCase();
  const name = document.getElementById("skillName").value.trim();
  const value = Number(document.getElementById("skillValue").value);

  if (!theme || !name || Number.isNaN(value)) return;

  try {
    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme, name, value }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur API");
    }

    form.reset();
    await loadPortfolio();
  } catch (err) {
    console.error(err);
    alert("Impossible d’ajouter la compétence.");
  }
});