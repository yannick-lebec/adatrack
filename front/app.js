// URL de l’API backend
const API_URL = "http://localhost:4242";

// Récupération des éléments principaux du DOM
const portfolioEl = document.getElementById("portfolio");
const form = document.getElementById("skillForm");

/***********************************************************
 * Détermine la couleur du cercle en fonction du pourcentage
 ***********************************************************/

function getColorByValue(value) {
  if (value <= 40) return "#e53935";
  if (value <= 70) return "#fb8c00"; 
  return "#43a047";                  
}

/************************************************
 * Affiche le portfolio (thèmes + compétences)
 ************************************************/

function renderPortfolio(portfolio) {
  // Nettoie l’affichage avant de recréer le contenu
  portfolioEl.innerHTML = "";

  // Cas où aucun thème n’est présent
  if (!portfolio || portfolio.length === 0) {
    portfolioEl.innerHTML = `<section class="sport"><h2>Aucun thème</h2></section>`;
    return;
  }

  // Parcours de chaque thème
  portfolio.forEach((theme) => {
    // Création de la section du thème
    const section = document.createElement("section");
    section.className = "sport";

    // Structure HTML du thème
    section.innerHTML = `
      <div class="container">
        <div class="theme-header">
          <h2>🏅 ${theme.name}</h2>
          <button class="delete-theme" data-theme-id="${theme.id}">
            Supprimer le sport
          </button>
        </div>
        <ul class="skills"></ul>
      </div>
    `;

    // Liste des compétences du thème
    const ul = section.querySelector(".skills");

    // Parcours des compétences du thème
    (theme.skills || []).forEach((s) => {
      const li = document.createElement("li");

      // Création d’une compétence avec cercle de progression coloré
      li.innerHTML = `
        <div class="progress-circle" 
             style="--value: ${s.value}; --color: ${getColorByValue(s.value)}">
          <span>${s.value}%</span>
        </div>
        <p>${s.name}</p>
        <button class="delete-skill" data-id="${s.id}">✖</button>
      `;

      ul.appendChild(li);
    });

    // Ajout du thème au DOM
    portfolioEl.appendChild(section);
  });
}

/**************************************************************
 * Récupère les données depuis l’API et déclenche l’affichage
 **************************************************************/

async function loadPortfolio() {
  const res = await fetch(`${API_URL}/portfolio`);
  if (!res.ok) throw new Error("Impossible de charger le portfolio");

  const data = await res.json();
  renderPortfolio(data);
}

// Chargement automatique du portfolio au chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadPortfolio();
  } catch (e) {
    console.error(e);
    portfolioEl.innerHTML = `<section class="sport"><h2>Erreur chargement</h2></section>`;
  }
});

/******************************************************
 * Gestion des clics (suppression thème ou compétence)
 ******************************************************/

portfolioEl.addEventListener("click", async (e) => {
  // Suppression d’un thème
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

  // Suppression d’une compétence
  if (e.target.classList.contains("delete-skill")) {
    const id = e.target.dataset.id;

    if (!confirm("Supprimer cette compétence ?")) return;

    try {
      const res = await fetch(`${API_URL}/skills/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erreur suppression skill");
      }

      await loadPortfolio();
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer la compétence.");
    }
  }
});

/***********************************************
 * Gestion du formulaire d’ajout de compétence
 ***********************************************/

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Récupération des valeurs du formulaire
  const theme = document.getElementById("themeName").value.trim();
  const name = document.getElementById("skillName").value.trim();
  const value = Number(document.getElementById("skillValue").value);

  // Vérification des champs
  if (!theme || !name || Number.isNaN(value)) return;

  try {
    // Envoi des données au backend
    const res = await fetch(`${API_URL}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme, name, value }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur API");
    }

    // Réinitialisation du formulaire et rechargement du portfolio
    form.reset();
    await loadPortfolio();
  } catch (err) {
    console.error(err);
    alert("Impossible d’ajouter la compétence.");
  }
});