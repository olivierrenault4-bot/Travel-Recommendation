
document.addEventListener("DOMContentLoaded", () => {

    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetBtn");
    const searchInput = document.getElementById("searchInput");
    const results = document.getElementById("results");

    if (!searchBtn || !resetBtn || !searchInput || !results) {
        console.error("Éléments HTML introuvables.");
        return;
    }

    // Normaliser les mots-clés
    function normalize(text) {
        return String(text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
    }

    // Charger le fichier JSON
    async function fetchRecommendations() {
        try {
            const response = await fetch(
                "./travel_recommendation_api.json"
            );

            if (!response.ok) {
                throw new Error("Erreur HTTP : " + response.status);
            }

            return await response.json();

        } catch (error) {
            console.error("Erreur JSON :", error);
            return null;
        }
    }

    // Afficher une destination
    function displayDestination(place) {

        const card = document.createElement("div");
        card.className = "result-card";

        const title = document.createElement("h3");
        title.textContent = place.name;

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = place.name;
        image.style.width = "100%";
        image.loading = "lazy";

        const description = document.createElement("p");
        description.textContent = place.description;

        card.appendChild(title);
        card.appendChild(image);
        card.appendChild(description);

        results.appendChild(card);
    }

    // Rechercher les destinations
    async function searchRecommendations() {

        const keyword = normalize(searchInput.value);

        results.innerHTML = "";

        if (!keyword) {
            results.textContent = "Veuillez saisir un mot-clé.";
            return;
        }

        const data = await fetchRecommendations();

        if (!data) {
            results.textContent =
                "Impossible de charger les recommandations.";
            return;
        }

        const countries = data.countries || [];
        const temples = data.temples || [];
        const beaches = data.beaches || [];

        // Toutes les villes des pays
        const cities = countries.flatMap(country =>
            (country.cities || []).map(city => ({
                ...city,
                country: country.name
            }))
        );

        let matches = [];

        // Recherche des plages
        if (["plage", "plages", "beach", "beaches"].includes(keyword)) {

            matches = beaches;

        // Recherche des temples
        } else if (["temple", "temples"].includes(keyword)) {

            matches = temples;

        // Recherche des pays
        } else if (["pays", "country", "countries"].includes(keyword)) {

            matches = cities;

        // Recherche par nom de destination ou pays
        } else {

            matches = [...cities, ...temples, ...beaches].filter(place =>

                normalize(place.name).includes(keyword) ||
                normalize(place.description).includes(keyword) ||
                normalize(place.country).includes(keyword)

            );
        }

        // Aucun résultat
        if (matches.length === 0) {

            results.textContent =
                "Aucune recommandation trouvée.";

            return;
        }

        // Affichage de tous les résultats
        matches.forEach(displayDestination);

        console.log(
            "Nombre de résultats affichés :",
            matches.length
        );
    }

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

});
