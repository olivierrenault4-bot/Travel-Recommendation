
const searchBtn = document.getElementById("searchBtn");
const resetBtn = document.getElementById("resetBtn");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

// Récupération des données avec Fetch API
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

// Affichage des recommandations
async function searchRecommendations() {
    const keyword = searchInput.value.trim().toLowerCase();

    results.innerHTML = "";

    if (!keyword) {
        results.textContent = "Veuillez saisir une destination.";
        return;
    }

    const data = await fetchRecommendations();

    if (!data) {
        results.textContent = "Impossible de charger les données.";
        return;
    }

    let destinations = [];

    data.countries.forEach(country => {
        country.cities.forEach(city => {
            destinations.push({
                ...city,
                country: country.name
            });
        });
    });

    destinations = destinations.concat(data.temples, data.beaches);

    const matches = destinations.filter(place => {
        return (
            place.name.toLowerCase().includes(keyword) ||
            place.description.toLowerCase().includes(keyword) ||
            (place.country || "").toLowerCase().includes(keyword) ||
            (data.temples.includes(place) &&
                /temple/i.test(keyword)) ||
            (data.beaches.includes(place) &&
                /plage|beach/i.test(keyword))
        );
    });

    if (matches.length === 0) {
        results.textContent = "Aucune recommandation trouvée.";
        return;
    }

    matches.forEach(place => {
        const card = document.createElement("div");
        card.className = "result-card";

        const title = document.createElement("h3");
        title.textContent = place.name;

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = place.name;
        image.style.width = "100%";

        const description = document.createElement("p");
        description.textContent = place.description;

        card.append(title, image, description);
        results.appendChild(card);
    });
}

// Bouton Rechercher
searchBtn.addEventListener("click", searchRecommendations);

// Bouton Réinitialiser
resetBtn.addEventListener("click", () => {
    searchInput.value = "";
    results.innerHTML = "";
});

// Vérification des données dans la console
fetchRecommendations();
