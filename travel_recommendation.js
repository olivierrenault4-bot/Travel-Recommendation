
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

// Normalisation des mots-clés
function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

// Récupération des données JSON
async function fetchRecommendations() {
    try {
        const response = await fetch(
            "./travel_recommendation_api.json"
        );

        if (!response.ok) {
            throw new Error("Erreur HTTP : " + response.status);
        }

        const data = await response.json();

        console.log("Données récupérées :", data);

        return data;

    } catch (error) {
        console.error("Erreur de récupération :", error);
        return null;
    }
}

// Recherche des recommandations
async function searchRecommendations() {

    const keyword = normalize(searchInput.value);

    results.innerHTML = "";

    if (!keyword) {
        results.textContent =
            "Veuillez saisir un mot-clé ou une destination.";
        return;
    }

    const data = await fetchRecommendations();

    if (!data) {
        results.textContent =
            "Impossible de charger les données.";
        return;
    }

    let destinations = [];

    // Récupération des villes et des pays
    (data.countries || []).forEach(country => {
        (country.cities || []).forEach(city => {
            destinations.push({
                ...city,
                country: country.name,
                category: "country"
            });
        });
    });

    // Récupération des temples
    (data.temples || []).forEach(temple => {
        destinations.push({
            ...temple,
            category: "temple"
        });
    });

    // Récupération des plages
    (data.beaches || []).forEach(beach => {
        destinations.push({
            ...beach,
            category: "beach"
        });
    });

    // Reconnaissance des variantes
    const beachKeywords = [
        "plage", "plages", "beach", "beaches"
    ];

    const templeKeywords = [
        "temple", "temples"
    ];

    const countryKeywords = [
        "pays", "country", "countries"
    ];

    // Filtrage des résultats
    const matches = destinations.filter(place => {

        const name = normalize(place.name);
        const description = normalize(place.description);
        const country = normalize(place.country);

        if (beachKeywords.includes(keyword)) {
            return place.category === "beach";
        }

        if (templeKeywords.includes(keyword)) {
            return place.category === "temple";
        }

        if (countryKeywords.includes(keyword)) {
            return place.category === "country";
        }

        return (
            name.includes(keyword) ||
            description.includes(keyword) ||
            country.includes(keyword)
        );
    });

    // Aucun résultat
    if (matches.length === 0) {
        results.textContent =
            "Aucune recommandation trouvée.";
        return;
    }

    // Affichage des résultats
    matches.forEach(place => {

        const card = document.createElement("div");
        card.className = "result-card";

        const title = document.createElement("h3");
        title.textContent = place.name;

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = place.name;
        image.loading = "lazy";

        const description = document.createElement("p");
        description.textContent = place.description;

        card.append(title, image, description);

        results.appendChild(card);
    });
}

// Initialisation des boutons
if (searchBtn && resetBtn && searchInput && results) {

    // Recherche uniquement au clic
    searchBtn.addEventListener(
        "click",
        searchRecommendations
    );

    // Réinitialisation
    resetBtn.addEventListener("click", () => {
        searchInput.value = "";
        results.innerHTML = "";
    });

} else {
    console.error(
        "Un élément HTML est introuvable."
    );
}

// Vérification du fichier JSON dans la console
fetchRecommendations();
