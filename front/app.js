const API_URL = "http://localhost:4242";
const portfolioEl = document.getElementById("portfolio");
const form = document.getElementById("skillForm");

function getColorByValue(value) {
  if (value <= 40) return "#e53935";
  if (value <= 70) return "#fb8c00";
  return "#43a047";                     
}

function renderPortfolio(portfolio) {
  portfolioEl.innerHTML = "";

  if (!portfolio || portfolio.length === 0) {
    portfolioEl.innerHTML = `<section class="sport"><h2>Aucun thème</h2></section>`;
    return;
  }

  
  portfolio.forEach((theme) => {
    const section = document.createElement("section");
    section.className = "sport";

    section.innerHTML = `
      <div class="theme-header">
        <h2>🏅 ${theme.name}</h2>
        <button class="delete-theme" data-theme-id="${theme.id}">Supprimer le sport</button>
      </div>
      <ul class="skills"></ul>
    `;

    const ul = section.querySelector(".skills");

    
    (theme.skills || []).forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="progress-circle" style="--value: ${s.value}; --color: ${getColorByValue(s.value)}">
          <span>${s.value}%</span>
        </div>
        <p>${s.name}</p>
        <button class="delete-skill" data-id="${s.id}">✖</button>
      `;
      ul.appendChild(li);
    });

    portfolioEl.appendChild(section);
  });
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

// Un seul listener pour gérer les deux suppressions
portfolioEl.addEventListener("click", async (e) => {
  // supprimer un thème
  if (e.target.classList.contains("delete-theme")) {
    const themeId = e.target.dataset.themeId;
    if (!confirm("Supprimer ce thème et toutes ses compétences ?")) return;

    try {
      const res = await fetch(`${API_URL}/themes/${themeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur suppression thème");
      }

      await loadPortfolio();
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer le thème.");
    }
    return;
  }

  // supprimer une skill
  if (e.target.classList.contains("delete-skill")) {
    const id = e.target.dataset.id;
    if (!confirm("Supprimer cette compétence ?")) return;

    try {
      const res = await fetch(`${API_URL}/skills/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur suppression skill");
      }

      await loadPortfolio();
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer la compétence.");
    }
    return;
  }
});

// Ajout d'une skill (thème + skill + value)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const theme = document.getElementById("themeName").value.trim();
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