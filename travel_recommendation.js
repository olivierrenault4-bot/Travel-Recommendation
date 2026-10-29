
document.addEventListener("DOMContentLoaded", () => {

    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetBtn");
    const searchInput = document.getElementById("searchInput");
    const results = document.getElementById("results");

    // Vérification des éléments HTML
    if (!searchBtn || !resetBtn || !searchInput || !results) {
        console.error("Éléments HTML manquants :", {
            searchBtn: !!searchBtn,
            resetBtn: !!resetBtn,
            searchInput: !!searchInput,
            results: !!results
        });
        return;
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

        // Pays et villes
        (data.countries || []).forEach(country => {
            (country.cities || []).forEach(city => {
                destinations.push({
                    ...city,
                    country: country.name,
                    category: "ville"
                });
            });
        });

        // Temples
        (data.temples || []).forEach(temple => {
            destinations.push({
                ...temple,
                category: "temple"
            });
        });

        // Plages
        (data.beaches || []).forEach(beach => {
            destinations.push({
                ...beach,
                category: "plage"
            });
        });

        // Filtrage des résultats
        const matches = destinations.filter(place => {

            const name = (place.name || "").toLowerCase();
            const description = (place.description || "").toLowerCase();
            const country = (place.country || "").toLowerCase();

            return (
                name.includes(keyword) ||
                description.includes(keyword) ||
                country.includes(keyword) ||
                (place.category === "temple" &&
                    /temple/i.test(keyword)) ||
                (place.category === "plage" &&
                    /plage|beach/i.test(keyword))
            );
        });

        if (matches.length === 0) {
            results.textContent = "Aucune recommandation trouvée.";
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

    // Bouton Rechercher
    searchBtn.addEventListener("click", searchRecommendations);

    // Recherche avec la touche Entrée
    searchInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            searchRecommendations();
        }
    });

    // Bouton Réinitialiser
    resetBtn.addEventListener("click", () => {
        searchInput.value = "";
        results.innerHTML = "";
    });

    // Test du chargement JSON
    fetchRecommendations();

});
