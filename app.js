// ============================================================
// ATOMIA ⚛️
// Explorateur de la matière interactif
// ============================================================


// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const periodicTable =
    document.getElementById("periodic-table");

const elementView =
    document.getElementById("element-view");

const searchInput =
    document.getElementById("search");

const legend =
    document.querySelector(".legend");

const legendToggle =
    document.getElementById("legend-toggle");

const valencesList =
    document.querySelector(".valences-list");

const valenceSearchInput =
    document.getElementById("valence-search");


// ============================================================
// DONNÉES
// ============================================================

let elements = [];
let ions = [];
let nuclides = [];
let supplementaryData = {};
let valences = [];


// ============================================================
// FICHIERS JSON
// ============================================================

const elementFiles = [
    "data/elements.json"
];

const ionFiles = [
    "data/ions.json"
];

const nuclideFiles = [
    "data/nuclides-1.json",
    "data/nuclides-2.json",
    "data/nuclides-3.json",
    "data/nuclides-4.json"
];

const supplementaryFiles = [
    "data/sections-1.json",
    "data/sections-2.json",
    "data/sections-3.json",
    "data/sections-4.json",
    "data/sections-5.json"
];

const valenceFile =
    "data/valences.json";


// ============================================================
// TRADUCTIONS
// ============================================================

const translations = {

    families: {
        "Alkali metals": "Métaux alcalins",
        "Alkaline earth metals": "Métaux alcalino-terreux",
        "Transition metals": "Métaux de transition",
        "Post-transition metals": "Autres métaux",
        "Metalloids": "Métalloïdes",
        "Nonmetals": "Non-métaux",
        "Halogens": "Halogènes",
        "Noble gases": "Gaz nobles",
        "Lanthanides": "Lanthanides",
        "Actinides": "Actinides"
    },

    states: {
        "solid": "Solide",
        "liquid": "Liquide",
        "gas": "Gaz"
    },

    magnetism: {
        "diamagnetic": "Diamagnétique",
        "paramagnetic": "Paramagnétique",
        "ferromagnetic": "Ferromagnétique"
    },

    countries: {
        "England": "Angleterre",
        "France": "France",
        "Germany": "Allemagne",
        "Sweden": "Suède",
        "Russia": "Russie",
        "Italy": "Italie",
        "Denmark": "Danemark",
        "United States": "États-Unis",
        "USA": "États-Unis",
        "Japan": "Japon",
        "Poland": "Pologne",
        "Austria": "Autriche",
        "Finland": "Finlande",
        "Norway": "Norvège",
        "Netherlands": "Pays-Bas"
    }

};


// ============================================================
// OUTILS
// ============================================================

/*
 * Vérifie si une donnée existe réellement.
 *
 * Cela permet de ne pas afficher :
 * - null
 * - undefined
 * - une chaîne vide
 * - un tableau vide
 */

function hasValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return false;
    }

    if (
        Array.isArray(value) &&
        value.length === 0
    ) {
        return false;
    }

    return true;
}


/*
 * Protège les données avant de les insérer
 * dans du HTML.
 *
 * C'est important car les données JSON
 * sont ensuite affichées avec innerHTML.
 */

function escapeHTML(value) {

    if (!hasValue(value)) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*
 * Traduit les familles chimiques.
 */

function translateFamily(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.families[value] || value;
}


/*
 * Traduit les états physiques.
 */

function translateState(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.states[value] || value;
}


/*
 * Traduit les pays.
 */

function translateCountry(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.countries[value] || value;
}


/*
 * Traduit le magnétisme.
 */

function translateMagnetism(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.magnetism[value] || value;
}


/*
 * Transforme une charge numérique
 * en notation chimique.
 *
 * Exemple :
 *
 * 1  → ⁺
 * 2  → 2⁺
 * -1 → ⁻
 * -2 → 2⁻
 */

function formatCharge(charge) {

    if (charge === 0) {
        return "";
    }

    if (charge > 0) {

        return charge === 1
            ? "⁺"
            : `${charge}⁺`;
    }

    const absolute =
        Math.abs(charge);

    return absolute === 1
        ? "⁻"
        : `${absolute}⁻`;
}


/*
 * Transforme un état d'oxydation
 * en notation classique.
 *
 * Exemple :
 *
 * 2  → +2
 * -1 → -1
 */

function formatOxidationState(value) {

    if (value > 0) {
        return `+${value}`;
    }

    return String(value);
}


/*
 * Transforme une valence en notation
 * avec son signe.
 */

function formatValence(value) {

    const number =
        Number(value);

    if (Number.isNaN(number)) {
        return String(value);
    }

    if (number > 0) {
        return `+${number}`;
    }

    return String(number);
}


// ============================================================
// CHARGEMENT DES FICHIERS JSON
// ============================================================

/*
 * Fonction générale utilisée pour charger
 * n'importe quel fichier JSON.
 */

async function loadJSON(file) {

    const response =
        await fetch(file);

    if (!response.ok) {

        throw new Error(
            `Impossible de charger ${file}`
        );
    }

    return await response.json();
}


// ============================================================
// CHARGEMENT DES DONNÉES
// ============================================================

/*
 * Cette fonction détermine automatiquement
 * quelles données doivent être chargées.
 *
 * ATOMIA utilise le même app.js sur plusieurs pages.
 *
 * Si on est sur :
 *
 * - valences.html → on charge les valences
 * - index.html → on charge les éléments,
 *   ions, nucléides et données supplémentaires
 * - book.html / plus.html → aucune donnée
 *   spécifique n'est nécessaire
 */

async function loadData() {


    // ========================================================
    // PAGE VALENCES
    // ========================================================

    if (valencesList) {

        await loadValences();

        return;
    }


    // ========================================================
    // PAGE TABLEAU PÉRIODIQUE
    // ========================================================

    /*
     * Si le tableau périodique n'existe pas,
     * on est sur une autre page.
     */

    if (!periodicTable) {
        return;
    }


    try {


        // ----------------------------------------------------
        // ÉLÉMENTS
        // ----------------------------------------------------

        elements =
            await loadJSON(
                elementFiles[0]
            );


        // ----------------------------------------------------
        // IONS
        // ----------------------------------------------------

        ions =
            await loadJSON(
                ionFiles[0]
            );


        // ----------------------------------------------------
        // NUCLÉIDES
        // ----------------------------------------------------

        /*
         * Les nucléides sont répartis dans
         * quatre fichiers JSON.
         *
         * Promise.all permet de charger
         * les quatre fichiers ensemble.
         */

        const nuclideResults =
            await Promise.all(
                nuclideFiles.map(file =>
                    loadJSON(file)
                )
            );


        /*
         * Chaque fichier contient un tableau.
         * flat() transforme les différents tableaux
         * en un seul grand tableau.
         */

        nuclides =
            nuclideResults.flat();


        // ----------------------------------------------------
        // DONNÉES SUPPLÉMENTAIRES
        // ----------------------------------------------------

        const supplementaryResults =
            await Promise.all(
                supplementaryFiles.map(file =>
                    loadJSON(file)
                )
            );


        /*
         * Les cinq fichiers sont fusionnés
         * dans un seul objet.
         */

        supplementaryData = {};


        supplementaryResults.forEach(
            section => {

                Object.assign(
                    supplementaryData,
                    section
                );

            }
        );


        // ----------------------------------------------------
        // AFFICHER LE TABLEAU
        // ----------------------------------------------------

        displayPeriodicTable();


        // ----------------------------------------------------
        // OUVRIR UNE FICHE DEMANDÉE PAR URL
        // ----------------------------------------------------

        /*
         * Exemple :
         *
         * index.html?element=Fe
         *
         * ouvre automatiquement la fiche du fer.
         */

        openElementFromURL();


    } catch (error) {


        // ----------------------------------------------------
        // GESTION DES ERREURS
        // ----------------------------------------------------

        console.error(
            "Erreur de chargement des données :",
            error
        );


        if (periodicTable) {

            periodicTable.innerHTML = `
                <p class="empty-data">
                    Impossible de charger les données.
                </p>
            `;
        }

    }

}


// ============================================================
// CHARGEMENT DES VALENCES
// ============================================================

async function loadValences() {

    try {


        // ----------------------------------------------------
        // CHARGER LE FICHIER
        // ----------------------------------------------------

        valences =
            await loadJSON(
                valenceFile
            );


        // ----------------------------------------------------
        // AFFICHER LES VALENCES
        // ----------------------------------------------------

        displayValences();


    } catch (error) {


        console.error(
            "Erreur de chargement des valences :",
            error
        );


        if (valencesList) {

            valencesList.innerHTML = `
                <p class="empty-data">
                    Impossible de charger les données des valences.
                </p>
            `;
        }

    }

}


// ============================================================
// TABLEAU PÉRIODIQUE
// ============================================================

function displayPeriodicTable() {

    if (!periodicTable) {
        return;
    }


    // --------------------------------------------------------
    // VIDER LE TABLEAU
    // --------------------------------------------------------

    periodicTable.innerHTML = "";


    // --------------------------------------------------------
    // CRÉER CHAQUE ÉLÉMENT
    // --------------------------------------------------------

    elements.forEach(element => {


        // ----------------------------------------------------
        // CRÉER LA CARTE
        // ----------------------------------------------------

        const elementCard =
            document.createElement("button");

        elementCard.type = "button";


        // ----------------------------------------------------
        // CLASSE DE L'ÉLÉMENT
        // ----------------------------------------------------

        elementCard.className =
            `element ${element.category || ""}`;


        // ----------------------------------------------------
        // DONNÉES POUR LA RECHERCHE
        // ----------------------------------------------------

        elementCard.dataset.atomicNumber =
            element.atomicNumber;

        elementCard.dataset.symbol =
            element.symbol;

        elementCard.dataset.name =
            element.name;


        // ----------------------------------------------------
        // POSITION DANS LE TABLEAU
        // ----------------------------------------------------

        if (
            element.group &&
            element.period
        ) {

            elementCard.style.gridColumn =
                String(element.group);

            elementCard.style.gridRow =
                String(element.period);
        }


        // ----------------------------------------------------
        // LANTHANIDES
        // ----------------------------------------------------

        if (
            element.atomicNumber >= 57 &&
            element.atomicNumber <= 71
        ) {

            elementCard.style.gridColumn =
                String(
                    element.atomicNumber - 56
                );

            elementCard.style.gridRow =
                "8";
        }


        // ----------------------------------------------------
        // ACTINIDES
        // ----------------------------------------------------

        if (
            element.atomicNumber >= 89 &&
            element.atomicNumber <= 103
        ) {

            elementCard.style.gridColumn =
                String(
                    element.atomicNumber - 88
                );

            elementCard.style.gridRow =
                "9";
        }


        // ----------------------------------------------------
        // CONTENU DE LA CARTE
        // ----------------------------------------------------

        elementCard.innerHTML = `

            <span class="atomic-number">
                ${escapeHTML(element.atomicNumber)}
            </span>

            <span class="symbol">
                ${escapeHTML(element.symbol)}
            </span>

            <span class="element-name">
                ${escapeHTML(element.name)}
            </span>

        `;


        // ----------------------------------------------------
        // CLIC SUR L'ÉLÉMENT
        // ----------------------------------------------------

        elementCard.addEventListener(
            "click",
            () => {

                showElement(element);

            }
        );


        // ----------------------------------------------------
        // AJOUT AU TABLEAU
        // ----------------------------------------------------

        periodicTable.appendChild(
            elementCard
        );

    });

}


// ============================================================
// PAGE VALENCES
// ============================================================

function displayValences() {

    if (!valencesList) {
        return;
    }


    // --------------------------------------------------------
    // AFFICHER LA LISTE
    // --------------------------------------------------------

    function renderValences(search = "") {

        valencesList.innerHTML = "";


        // ----------------------------------------------------
        // TEXTE RECHERCHÉ
        // ----------------------------------------------------

        const query =
            search
                .trim()
                .toLowerCase();


        // ----------------------------------------------------
        // CALCULER LA PERTINENCE
        // ----------------------------------------------------

        const results =
            valences.map(element => {


                const symbol =
                    String(
                        element.symbole || ""
                    ).toLowerCase();


                const name =
                    String(
                        element.nom || ""
                    ).toLowerCase();


                const atomicNumber =
                    String(
                        element.numero_atomique ?? ""
                    );


                const elementValences =
                    Array.isArray(element.valences)
                        ? element.valences.map(
                            value => String(value)
                        )
                        : [];


                let score = 0;


                // ------------------------------------------------
                // AUCUNE RECHERCHE
                // ------------------------------------------------

                if (!query) {

                    score = 0;

                } else {


                    // ============================================
                    // SYMBOLE
                    // ============================================

                    if (symbol === query) {

                        score += 1000;

                    } else if (
                        symbol.startsWith(query)
                    ) {

                        score += 700;

                    } else if (
                        symbol.includes(query)
                    ) {

                        score += 400;
                    }


                    // ============================================
                    // NOM
                    // ============================================

                    if (name === query) {

                        score += 900;

                    } else if (
                        name.startsWith(query)
                    ) {

                        score += 600;

                    } else if (
                        name.includes(query)
                    ) {

                        score += 300;
                    }


                    // ============================================
                    // NUMÉRO ATOMIQUE
                    // ============================================

                    if (
                        atomicNumber === query
                    ) {

                        score += 850;

                    } else if (
                        atomicNumber.startsWith(query)
                    ) {

                        score += 200;
                    }


                    // ============================================
                    // VALENCE
                    // ============================================

                    if (
                        elementValences.includes(query)
                    ) {

                        score += 500;

                    } else if (
                        elementValences.some(
                            value =>
                                value.includes(query)
                        )
                    ) {

                        score += 150;
                    }

                }


                return {
                    element,
                    score
                };

            });


        // ----------------------------------------------------
        // TRI
        // ----------------------------------------------------

        if (query) {

            results.sort(
                (a, b) => {

                    if (
                        b.score !== a.score
                    ) {

                        return (
                            b.score -
                            a.score
                        );
                    }


                    return (
                        Number(
                            a.element.numero_atomique
                        ) -
                        Number(
                            b.element.numero_atomique
                        )
                    );

                }
            );

        } else {

            results.sort(
                (a, b) =>
                    Number(
                        a.element.numero_atomique
                    ) -
                    Number(
                        b.element.numero_atomique
                    )
            );

        }


        // ----------------------------------------------------
        // CRÉER LES LIGNES
        // ----------------------------------------------------

        results.forEach(
            ({ element }) => {


                // --------------------------------------------
                // CONTENEUR
                // --------------------------------------------

                const item =
                    document.createElement("article");


                item.className =
                    "valence-item";


                item.tabIndex = 0;


                // --------------------------------------------
                // DONNÉES
                // --------------------------------------------

                item.dataset.symbol =
                    element.symbole;

                item.dataset.atomicNumber =
                    element.numero_atomique;


                // --------------------------------------------
                // VALENCES
                // --------------------------------------------

                const values =
                    Array.isArray(
                        element.valences
                    )
                        ? element.valences
                        : [];


                // --------------------------------------------
                // SINGULIER / PLURIEL
                // --------------------------------------------

                const label =
                    values.length === 1
                        ? "Valence"
                        : "Valences";


                // --------------------------------------------
                // PASTILLES
                // --------------------------------------------

                const badges =
                    values.length > 0

                        ? values
                            .map(
                                value => `
                                    <span
                                        class="valence-badge">

                                        ${escapeHTML(
                                            formatValence(
                                                value
                                            )
                                        )}

                                    </span>
                                `
                            )
                            .join("")

                        : `
                            <span
                                class="valence-badge">

                                —

                            </span>
                        `;


                // --------------------------------------------
                // HTML DE LA LIGNE
                // --------------------------------------------

                item.innerHTML = `

                    <div class="valence-element">

                        <span class="valence-symbol">
                            ${escapeHTML(
                                element.symbole
                            )}
                        </span>

                        <span class="valence-number">
                            ${escapeHTML(
                                element.numero_atomique
                            )}
                        </span>

                    </div>


                    <div class="valence-information">

                        <h3>
                            ${escapeHTML(
                                element.nom
                            )}
                        </h3>

                        <p>

                            <strong>
                                ${label} :
                            </strong>

                            <span class="valence-values">

                                ${badges}

                            </span>

                        </p>

                    </div>

                `;


                // --------------------------------------------
                // CLIC SUR UNE LIGNE
                // --------------------------------------------

                item.addEventListener(
                    "click",
                    () => {

                        goToElement(
                            element.symbole
                        );

                    }
                );


                // --------------------------------------------
                // CLAVIER
                // --------------------------------------------

                item.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            goToElement(
                                element.symbole
                            );
                        }

                    }
                );


                // --------------------------------------------
                // AJOUT DE LA LIGNE
                // --------------------------------------------

                valencesList.appendChild(
                    item
                );

            }
        );


        // ----------------------------------------------------
        // AUCUN RÉSULTAT
        // ----------------------------------------------------

        if (
            results.length === 0
        ) {

            const message =
                document.createElement("p");

            message.className =
                "empty-data";

            message.textContent =
                "Aucun élément ne correspond à votre recherche.";

            valencesList.appendChild(
                message
            );
        }

    }


    // --------------------------------------------------------
    // AFFICHAGE INITIAL
    // --------------------------------------------------------

    renderValences();


    // --------------------------------------------------------
    // RECHERCHE EN DIRECT
    // --------------------------------------------------------

    if (valenceSearchInput) {

        valenceSearchInput.addEventListener(
            "input",
            () => {

                renderValences(
                    valenceSearchInput.value
                );

            }
        );

    }

}


// ============================================================
// ALLER VERS LA FICHE D'UN ÉLÉMENT
// ============================================================

function goToElement(symbol) {

    /*
     * Exemple :
     *
     * Fe
     *
     * devient :
     *
     * index.html?element=Fe
     */

    window.location.href =
        `index.html?element=${encodeURIComponent(symbol)}`;

}


// ============================================================
// OUVRIR UNE FICHE DEPUIS L'URL
// ============================================================

function openElementFromURL() {

    if (
        !elementView ||
        elements.length === 0
    ) {
        return;
    }


    // --------------------------------------------------------
    // LIRE LES PARAMÈTRES DE L'URL
    // --------------------------------------------------------

    const params =
        new URLSearchParams(
            window.location.search
        );


    const symbol =
        params.get("element");


    // --------------------------------------------------------
    // AUCUN ÉLÉMENT DEMANDÉ
    // --------------------------------------------------------

    if (!symbol) {
        return;
    }


    // --------------------------------------------------------
    // TROUVER L'ÉLÉMENT
    // --------------------------------------------------------

    const element =
        elements.find(item =>
            String(item.symbol).toLowerCase() ===
            String(symbol).toLowerCase()
        );


    // --------------------------------------------------------
    // SYMBOLE INCONNU
    // --------------------------------------------------------

    if (!element) {
        return;
    }


    // --------------------------------------------------------
    // OUVRIR LA FICHE
    // --------------------------------------------------------

    showElement(element);

}


// ============================================================
// FICHE D'UN ÉLÉMENT
// ============================================================

function showElement(element) {

    if (!elementView) {
        return;
    }


    // ========================================================
    // DONNÉES SUPPLÉMENTAIRES
    // ========================================================

    const supplementary =
        supplementaryData[element.symbol] || {};


    // ========================================================
    // PROTONS / ÉLECTRONS
    // ========================================================

    /*
     * Pour un atome neutre :
     *
     * protons = numéro atomique
     * électrons = numéro atomique
     */

    const protons =
        Number(element.atomicNumber);

    const electrons =
        Number(element.atomicNumber);


    // ========================================================
    // NOMBRE DE NEUTRONS APPROXIMATIF
    // ========================================================

    const approximateMassNumber =
        Math.round(
            Number(element.atomicMass)
        );


    const approximateNeutrons =
        approximateMassNumber -
        protons;


    // ========================================================
    // FAMILLE CHIMIQUE
    // ========================================================

    const familyData =
        supplementary.famille_chimique || {};


    // ========================================================
    // FORMULES
    // ========================================================

    const formulas =
        supplementary.formules || [];


    // ========================================================
    // ÉTATS D'OXYDATION
    // ========================================================

    const oxidationStates =
        supplementary.etats_oxydation || [];


    // ========================================================
    // HISTOIRE
    // ========================================================

    const history =
        supplementary.histoire?.decouverte || {};


    // ========================================================
    // PROPRIÉTÉS SUPPLÉMENTAIRES
    // ========================================================

    const extra =
        supplementary.proprietes_supplementaires || {};


    // ========================================================
    // NUCLÉIDES DE L'ÉLÉMENT
    // ========================================================

    const elementNuclides =
        nuclides.filter(nuclide => {

            if (
                nuclide.element ===
                element.symbol
            ) {
                return true;
            }


            if (
                nuclide.symbol ===
                element.symbol
            ) {
                return true;
            }


            if (
                typeof nuclide.id === "string" &&
                nuclide.id.startsWith(
                    `${element.symbol}-`
                )
            ) {
                return true;
            }


            return false;

        });


    // ========================================================
    // IONS DE L'ÉLÉMENT
    // ========================================================

    const elementIons =
        ions.filter(ion => {

            return (
                ion.element ===
                element.symbol
            );

        });


    // ========================================================
    // CONSTRUCTION DE LA FICHE
    // ========================================================

    elementView.innerHTML = `

        <!-- =================================================
             EN-TÊTE
             ================================================= -->

        <div class="element-header">

            <div class="element-symbol-large">
                ${escapeHTML(element.symbol)}
            </div>

            <div>

                <h2>
                    ${escapeHTML(element.name)}
                </h2>

                <p>
                    Numéro atomique :
                    <strong>
                        ${escapeHTML(element.atomicNumber)}
                    </strong>
                </p>

            </div>

        </div>


        <!-- =================================================
             INFORMATIONS GÉNÉRALES
             ================================================= -->

        <section class="collapsible-section open">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    ⚛️ Informations générales
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                <div class="info-grid">

                    ${createInfoCard(
                        "Masse atomique",
                        hasValue(element.atomicMass)
                            ? `${element.atomicMass} u`
                            : null
                    )}

                    ${createInfoCard(
                        "Protons",
                        protons
                    )}

                    ${createInfoCard(
                        "Électrons",
                        electrons
                    )}

                    ${createInfoCard(
                        "Neutrons*",
                        approximateNeutrons
                    )}

                    ${createInfoCard(
                        "État à température ambiante",
                        translateState(
                            element.stateAtRoomTemperature
                        )
                    )}

                    ${createInfoCard(
                        "Point de fusion",
                        hasValue(element.meltingPoint)
                            ? `${element.meltingPoint} °C`
                            : null
                    )}

                    ${createInfoCard(
                        "Point d'ébullition",
                        hasValue(element.boilingPoint)
                            ? `${element.boilingPoint} °C`
                            : null
                    )}

                    ${createInfoCard(
                        "Densité",
                        hasValue(element.density)
                            ? `${element.density} g/cm³`
                            : null
                    )}

                    ${createInfoCard(
                        "Configuration électronique",
                        element.electronConfiguration
                    )}

                    ${createInfoCard(
                        "Bloc",
                        element.block
                    )}

                </div>


                <!-- =========================================
                     OCCURRENCES
                     ========================================= -->

                ${createListSection(
                    "📍 Où le trouve-t-on ?",
                    element.commonOccurrences
                )}


                <!-- =========================================
                     UTILISATIONS
                     ========================================= -->

                ${createListSection(
                    "🛠️ Utilisations",
                    element.commonUses
                )}


                <p class="sub-info">

                    * Le nombre de neutrons est calculé ici
                    à partir de la masse atomique arrondie.
                    Pour un isotope précis, consultez les nucléides.

                </p>

            </div>

        </section>


        <!-- =================================================
             FAMILLE CHIMIQUE
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    🧪 Famille chimique
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${createInfoGrid([

                    [
                        "Famille",
                        familyData.famille
                    ],

                    [
                        "Groupe",
                        element.group
                    ],

                    [
                        "Période",
                        element.period
                    ],

                    [
                        "Bloc",
                        element.block
                    ],

                    [
                        "Catégorie",
                        familyData.categorie ||
                        element.category
                    ]

                ])}

            </div>

        </section>


        <!-- =================================================
             FORMULES
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    🧬 Formules
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${
                    formulas.length > 0

                    ? `

                        <div class="formulas-list">

                            ${formulas.map(
                                (formula, index) => {

                                    let display =
                                        formula;

                                    let title =
                                        formula;


                                    if (
                                        typeof formula ===
                                        "object"
                                    ) {

                                        display =
                                            formula.formule ||
                                            formula.formula ||
                                            formula.nom ||
                                            formula.name ||
                                            `Formule ${index + 1}`;


                                        title =
                                            formula.nom ||
                                            formula.name ||
                                            display;
                                    }


                                    return `

                                        <button
                                            type="button"
                                            class="formula-button"
                                            data-formula-index="${index}">

                                            <strong>
                                                ${escapeHTML(display)}
                                            </strong>

                                            ${
                                                display !== title

                                                ? `<span>
                                                    ${escapeHTML(title)}
                                                   </span>`

                                                : ""
                                            }

                                        </button>

                                    `;

                                }
                            ).join("")}

                        </div>

                    `

                    : `

                        <p class="empty-data">
                            Aucune formule enregistrée.
                        </p>

                    `
                }

            </div>

        </section>


        <!-- =================================================
             ÉTATS D'OXYDATION
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    ⚡ États d'oxydation
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${
                    oxidationStates.length > 0

                    ? `

                        <div class="oxidation-states">

                            ${oxidationStates
                                .map(state => `

                                    <span
                                        class="oxidation-state">

                                        ${escapeHTML(
                                            formatOxidationState(state)
                                        )}

                                    </span>

                                `)
                                .join("")}

                        </div>

                    `

                    : `

                        <p class="empty-data">
                            Aucune donnée disponible.
                        </p>

                    `
                }

            </div>

        </section>


        <!-- =================================================
             HISTOIRE
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    🧑‍🔬 Histoire
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${createInfoGrid([

                    [
                        "Découvert par",
                        history.qui
                    ],

                    [
                        "Année",
                        history.quand
                    ],

                    [
                        "Lieu",
                        translateCountry(history.lieu)
                    ],

                    [
                        "Comment",
                        history.comment
                    ],

                    [
                        "Origine du nom",
                        history.origine_du_nom
                    ]

                ])}

            </div>

        </section>


        <!-- =================================================
             EN SAVOIR PLUS
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    🌡️ En savoir plus
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${createInfoGrid([

                    [
                        "Électronégativité (Pauling)",
                        extra.electronegativite_pauling
                    ],

                    [
                        "Énergie d'ionisation",
                        hasValue(extra.energie_ionisation_eV)
                            ? `${extra.energie_ionisation_eV} eV`
                            : null
                    ],

                    [
                        "Affinité électronique",
                        hasValue(extra.affinite_electronique_eV)
                            ? `${extra.affinite_electronique_eV} eV`
                            : null
                    ],

                    [
                        "Rayon atomique",
                        hasValue(extra.rayon_atomique_pm)
                            ? `${extra.rayon_atomique_pm} pm`
                            : null
                    ],

                    [
                        "Rayon covalent",
                        hasValue(extra.rayon_covalent_pm)
                            ? `${extra.rayon_covalent_pm} pm`
                            : null
                    ],

                    [
                        "Conductivité thermique",
                        hasValue(extra.conductivite_thermique_W_mK)
                            ? `${extra.conductivite_thermique_W_mK} W/m·K`
                            : null
                    ],

                    [
                        "Magnétisme",
                        translateMagnetism(extra.magnetisme)
                    ],

                    [
                        "Chaleur spécifique",
                        hasValue(extra.chaleur_specifique_J_gK)
                            ? `${extra.chaleur_specifique_J_gK} J/g·K`
                            : null
                    ],

                    [
                        "Chaleur molaire",
                        hasValue(extra.chaleur_molaire_J_molK)
                            ? `${extra.chaleur_molaire_J_molK} J/mol·K`
                            : null
                    ],

                    [
                        "Abondance dans la croûte",
                        hasValue(extra.abondance_croute_mg_kg)
                            ? `${extra.abondance_croute_mg_kg} mg/kg`
                            : null
                    ],

                    [
                        "Abondance dans la mer",
                        hasValue(extra.abondance_mer_mg_L)
                            ? `${extra.abondance_mer_mg_L} mg/L`
                            : null
                    ]

                ])}

            </div>

        </section>


        <!-- =================================================
             NUCLÉIDES
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    ☢️ Nucléides
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${
                    elementNuclides.length > 0

                    ? `

                        <div class="nuclides-list">

                            ${elementNuclides
                                .map(nuclide =>
                                    createNuclideCard(
                                        nuclide
                                    )
                                )
                                .join("")}

                        </div>

                    `

                    : `

                        <p class="empty-data">
                            Aucun nucléide enregistré.
                        </p>

                    `
                }

            </div>

        </section>


        <!-- =================================================
             IONS
             ================================================= -->

        <section class="collapsible-section">

            <button
                type="button"
                class="section-toggle">

                <h3>
                    ⚡ Ions
                </h3>

                <span
                    class="section-arrow">
                </span>

            </button>


            <div class="section-content">

                ${
                    elementIons.length > 0

                    ? `

                        <div class="ions-list">

                            ${elementIons
                                .map(ion =>
                                    createIonCard(
                                        ion
                                    )
                                )
                                .join("")}

                        </div>

                    `

                    : `

                        <p class="empty-data">
                            Aucun ion enregistré.
                        </p>

                    `
                }

            </div>

        </section>


        <!-- =================================================
             FERMER
             ================================================= -->

        <button
            type="button"
            class="close-element">

            Fermer la fiche

        </button>

    `;


    // ========================================================
    // OUVERTURE / FERMETURE DES SECTIONS
    // ========================================================

    const sectionButtons =
        elementView.querySelectorAll(
            ".section-toggle"
        );


    sectionButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.closest(
                        ".collapsible-section"
                    );


                if (!section) {
                    return;
                }


                section.classList.toggle(
                    "open"
                );

            }
        );

    });


    // ========================================================
    // FORMULES
    // ========================================================

    const formulaButtons =
        elementView.querySelectorAll(
            ".formula-button"
        );


    formulaButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                () => {

                    const formula =
                        formulas[index];

                    let name =
                        formula;


                    if (
                        typeof formula ===
                        "object"
                    ) {

                        name =
                            formula.nom ||
                            formula.name ||
                            formula.formule ||
                            formula.formula ||
                            "composé";
                    }


                    alert(
                        `La fiche du composé « ${name} » sera ajoutée prochainement.`
                    );

                }
            );

        }
    );


    // ========================================================
    // BOUTON FERMER
    // ========================================================

    const closeButton =
        elementView.querySelector(
            ".close-element"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                elementView.classList.add(
                    "hidden"
                );


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    // ========================================================
    // AFFICHER LA FICHE
    // ========================================================

    elementView.classList.remove(
        "hidden"
    );


    elementView.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// ============================================================
// CARTE D'INFORMATION
// ============================================================

function createInfoCard(
    label,
    value
) {

    if (!hasValue(value)) {
        return "";
    }


    return `

        <div class="info-card">

            <strong>
                ${escapeHTML(label)}
            </strong>

            <span>
                ${escapeHTML(value)}
            </span>

        </div>

    `;

}


// ============================================================
// GRILLE D'INFORMATIONS
// ============================================================

function createInfoGrid(items) {

    const validItems =
        items.filter(
            item => hasValue(item[1])
        );


    if (validItems.length === 0) {

        return `
            <p class="empty-data">
                Aucune donnée disponible.
            </p>
        `;
    }


    return `

        <div class="info-grid">

            ${validItems
                .map(item =>
                    createInfoCard(
                        item[0],
                        item[1]
                    )
                )
                .join("")}

        </div>

    `;

}


// ============================================================
// CARTE NUCLÉIDE
// ============================================================

function createNuclideCard(nuclide) {


    // --------------------------------------------------------
    // PROTONS
    // --------------------------------------------------------

    const protons =
        hasValue(nuclide.protons)
            ? Number(nuclide.protons)
            : null;


    // --------------------------------------------------------
    // NEUTRONS
    // --------------------------------------------------------

    const neutrons =
        hasValue(nuclide.neutrons)
            ? Number(nuclide.neutrons)
            : null;


    // --------------------------------------------------------
    // ÉLECTRONS
    // --------------------------------------------------------

    const electrons =
        protons !== null
            ? protons
            : null;


    // --------------------------------------------------------
    // DÉSINTÉGRATION
    // --------------------------------------------------------

    let decayHTML = "";


    if (
        Array.isArray(nuclide.decayModes) &&
        nuclide.decayModes.length > 0
    ) {

        decayHTML = `

            <p>

                <strong>
                    Désintégration :
                </strong>

                ${escapeHTML(
                    nuclide.decayModes.join(", ")
                )}

            </p>

        `;
    }


    // --------------------------------------------------------
    // DEMI-VIE
    // --------------------------------------------------------

    let halfLifeHTML = "";


    if (
        nuclide.halfLife &&
        hasValue(nuclide.halfLife.display)
    ) {

        halfLifeHTML = `

            <p>

                <strong>
                    Demi-vie :
                </strong>

                ${escapeHTML(
                    nuclide.halfLife.display
                )}

            </p>

        `;
    }


    // --------------------------------------------------------
    // HTML
    // --------------------------------------------------------

    return `

        <article class="nuclide-card">

            <h4>
                ${escapeHTML(nuclide.id)}
            </h4>


            ${createInfoGrid([

                [
                    "Protons",
                    protons
                ],

                [
                    "Neutrons",
                    neutrons
                ],

                [
                    "Électrons",
                    electrons
                ],

                [
                    "Radioactif",
                    nuclide.isRadioactive === true
                        ? "Oui"
                        : nuclide.isRadioactive === false
                            ? "Non"
                            : null
                ]

            ])}


            ${halfLifeHTML}


            ${decayHTML}


            ${
                hasValue(nuclide.source)

                ? `

                    <p>

                        <strong>
                            Source :
                        </strong>

                        ${escapeHTML(
                            nuclide.source
                        )}

                    </p>

                `

                : ""
            }

        </article>

    `;

}


// ============================================================
// CARTE ION
// ============================================================

function createIonCard(ion) {


    // --------------------------------------------------------
    // NUMÉRO ATOMIQUE
    // --------------------------------------------------------

    const atomicNumber =
        Number(ion.atomicNumber);


    // --------------------------------------------------------
    // CHARGE
    // --------------------------------------------------------

    const charge =
        Number(ion.charge);


    // --------------------------------------------------------
    // PROTONS
    // --------------------------------------------------------

    const protons =
        atomicNumber;


    // --------------------------------------------------------
    // ÉLECTRONS
    // --------------------------------------------------------

    const electrons =
        atomicNumber - charge;


    // --------------------------------------------------------
    // HTML
    // --------------------------------------------------------

    return `

        <article class="ion-card">

            <h4>

                ${escapeHTML(ion.element)}

                ${escapeHTML(
                    formatCharge(charge)
                )}

            </h4>


            <p>

                <strong>
                    Charge :
                </strong>

                ${escapeHTML(
                    formatOxidationState(charge)
                )}

            </p>


            <p>

                <strong>
                    Protons :
                </strong>

                ${protons}

            </p>


            <p>

                <strong>
                    Électrons :
                </strong>

                ${electrons}

            </p>

        </article>

    `;

}


// ============================================================
// RECHERCHE DU TABLEAU PÉRIODIQUE
// ============================================================

/*
 * Cette recherche concerne uniquement
 * la page du tableau périodique.
 */

if (
    searchInput &&
    periodicTable
) {

    searchInput.addEventListener(
        "input",
        () => {


            // ------------------------------------------------
            // TEXTE RECHERCHÉ
            // ------------------------------------------------

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            // ------------------------------------------------
            // CARTES DU TABLEAU
            // ------------------------------------------------

            const cards =
                periodicTable.querySelectorAll(
                    ".element"
                );


            // ------------------------------------------------
            // TESTER CHAQUE ÉLÉMENT
            // ------------------------------------------------

            cards.forEach(card => {


                const name =
                    (
                        card.dataset.name ||
                        ""
                    ).toLowerCase();


                const symbol =
                    (
                        card.dataset.symbol ||
                        ""
                    ).toLowerCase();


                const atomicNumber =
                    String(
                        card.dataset.atomicNumber ||
                        ""
                    );


                const matches =
                    name.includes(query) ||
                    symbol.includes(query) ||
                    atomicNumber.includes(query);


                card.style.display =
                    matches
                        ? ""
                        : "none";

            });

        }
    );

}


// ============================================================
// LÉGENDE
// ============================================================

if (
    legend &&
    legendToggle
) {

    legendToggle.addEventListener(
        "click",
        () => {

            legend.classList.toggle(
                "open"
            );

        }
    );

}


// ============================================================
// MODE CLAIR / SOMBRE
// ============================================================

function setupTheme() {


    // --------------------------------------------------------
    // RÉCUPÉRER LE THÈME SAUVEGARDÉ
    // --------------------------------------------------------

    const savedTheme =
        localStorage.getItem(
            "atomia-theme"
        );


    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );

    }


    // --------------------------------------------------------
    // ÉVITER DE CRÉER LE BOUTON DEUX FOIS
    // --------------------------------------------------------

    let themeButton =
        document.querySelector(
            ".theme-toggle"
        );


    // --------------------------------------------------------
    // CRÉER LE BOUTON
    // --------------------------------------------------------

    if (!themeButton) {

        themeButton =
            document.createElement("button");


        themeButton.type = "button";


        themeButton.className =
            "theme-toggle";


        themeButton.setAttribute(
            "aria-label",
            "Changer de thème"
        );


        document.body.prepend(
            themeButton
        );

    }


    // --------------------------------------------------------
    // ICÔNE
    // --------------------------------------------------------

    updateThemeButton(
        themeButton
    );


    // --------------------------------------------------------
    // CHANGER LE THÈME
    // --------------------------------------------------------

    themeButton.addEventListener(
        "click",
        () => {


            document.body.classList.toggle(
                "light-theme"
            );


            const isLight =
                document.body.classList.contains(
                    "light-theme"
                );


            // ------------------------------------------------
            // SAUVEGARDER LE CHOIX
            // ------------------------------------------------

            localStorage.setItem(
                "atomia-theme",
                isLight
                    ? "light"
                    : "dark"
            );


            // ------------------------------------------------
            // METTRE À JOUR L'ICÔNE
            // ------------------------------------------------

            updateThemeButton(
                themeButton
            );

        }
    );

}


// ============================================================
// ICÔNE DU BOUTON DE THÈME
// ============================================================

function updateThemeButton(button) {

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );


    button.textContent =
        isLight
            ? "☀️"
            : "🌙";


    button.title =
        isLight
            ? "Passer au mode sombre"
            : "Passer au mode clair";

}


// ============================================================
// LISTE D'INFORMATIONS
// ============================================================

function createListSection(
    title,
    items
) {


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return "";

    }


    return `

        <div class="sub-info">

            <h4>
                ${escapeHTML(title)}
            </h4>

            <ul>

                ${items.map(item => `

                    <li>
                        ${escapeHTML(item)}
                    </li>

                `).join("")}

            </ul>

        </div>

    `;

}


// ============================================================
// DÉMARRAGE D'ATOMIA
// ============================================================

/*
 * Le thème est lancé sur toutes les pages.
 */

setupTheme();


/*
 * Ensuite, ATOMIA regarde automatiquement
 * quelle page est actuellement ouverte
 * et charge uniquement ce dont elle a besoin.
 */

loadData();

// ============================================================
// BIBLIOTHÈQUE — NOMENCLATURE SPA
// ============================================================

/*
 * Les nomenclatures sont affichées directement
 * dans book.html.
 *
 * Aucune nouvelle page HTML n'est utilisée.
 *
 * Fichiers :
 *
 * data/nomenclature_inorganique.json
 * data/nomenclature_organique.json
 */


// ============================================================
// ÉLÉMENTS DE LA BIBLIOTHÈQUE
// ============================================================

const bookPage =
    document.querySelector(".book-page");


// ============================================================
// FICHIERS DE NOMENCLATURE
// ============================================================

const nomenclatureFiles = {

    inorganique:
        "data/nomenclature_inorganique.json",

    organique:
        "data/nomenclature_organique.json"

};


// ============================================================
// DONNÉES DE NOMENCLATURE
// ============================================================

let nomenclatureData = {

    inorganique: null,

    organique: null

};


// ============================================================
// CHARGEMENT DES NOMENCLATURES
// ============================================================

async function loadNomenclature() {

    if (!bookPage) {
        return;
    }


    try {

        const results =
            await Promise.all([

                loadJSON(
                    nomenclatureFiles.inorganique
                ),

                loadJSON(
                    nomenclatureFiles.organique
                )

            ]);


        nomenclatureData.inorganique =
            results[0];

        nomenclatureData.organique =
            results[1];


        setupNomenclatureLibrary();


    } catch (error) {

        console.error(
            "Erreur de chargement des nomenclatures :",
            error
        );

    }

}


// ============================================================
// INITIALISER LA BIBLIOTHÈQUE
// ============================================================

function setupNomenclatureLibrary() {

    if (!bookPage) {
        return;
    }


    /*
     * On cherche les cartes de nomenclature.
     *
     * Les cartes existantes dans book.html
     * sont conservées.
     */

    const cards =
        bookPage.querySelectorAll(
            ".book-card"
        );


    cards.forEach(card => {

        const title =
            card.querySelector(
                "h3"
            );


        if (!title) {
            return;
        }


        const text =
            title.textContent
                .toLowerCase();


        // ----------------------------------------------------
        // NOMENCLATURE INORGANIQUE
        // ----------------------------------------------------

        if (
            text.includes("nomenclature") &&
            text.includes("inorgan")
        ) {

            prepareNomenclatureCard(
                card,
                "inorganique"
            );

        }


        // ----------------------------------------------------
        // NOMENCLATURE ORGANIQUE
        // ----------------------------------------------------

        else if (
            text.includes("nomenclature") &&
            text.includes("organ")
        ) {

            prepareNomenclatureCard(
                card,
                "organique"
            );

        }

    });


    /*
     * Si l'ancienne carte unique de nomenclature
     * est encore présente, on peut également
     * la transformer en entrée inorganique.
     */

    const oldCard =
        bookPage.querySelector(
            ".book-card:not(.book-card-disabled)"
        );


    if (oldCard) {

        const title =
            oldCard.querySelector("h3");


        if (
            title &&
            title.textContent
                .toLowerCase()
                .includes("nomenclature")
        ) {

            if (
                !oldCard.dataset.nomenclatureType
            ) {

                prepareNomenclatureCard(
                    oldCard,
                    "inorganique"
                );

            }

        }

    }


    // --------------------------------------------------------
    // OUVERTURE DEPUIS L'URL
    // --------------------------------------------------------

    const hash =
        window.location.hash
            .replace("#", "")
            .toLowerCase();


    if (
        hash === "inorganique" ||
        hash === "organique"
    ) {

        showNomenclature(
            hash,
            false
        );

    }

}


// ============================================================
// PRÉPARER UNE CARTE
// ============================================================

function prepareNomenclatureCard(
    card,
    type
) {

    if (!card) {
        return;
    }


    card.dataset.nomenclatureType =
        type;


    /*
     * Empêche le lien existant de book.html
     * d'ouvrir une autre page.
     */

    if (
        card.tagName.toLowerCase() ===
        "a"
    ) {

        card.removeAttribute(
            "href"
        );

    }


    card.setAttribute(
        "role",
        "button"
    );


    card.setAttribute(
        "tabindex",
        "0"
    );


    // --------------------------------------------------------
    // CLIC
    // --------------------------------------------------------

    card.addEventListener(
        "click",
        event => {

            event.preventDefault();

            showNomenclature(
                type,
                true
            );

        }
    );


    // --------------------------------------------------------
    // CLAVIER
    // --------------------------------------------------------

    card.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                showNomenclature(
                    type,
                    true
                );

            }

        }
    );

}


// ============================================================
// AFFICHER UNE NOMENCLATURE
// ============================================================

function showNomenclature(
    type,
    updateURL = true
) {

    if (!bookPage) {
        return;
    }


    const data =
        nomenclatureData[type];


    if (!data) {

        console.error(
            `Aucune donnée de nomenclature pour : ${type}`
        );

        return;
    }


    // --------------------------------------------------------
    // SAUVEGARDER LE TYPE
    // --------------------------------------------------------

    if (updateURL) {

        window.history.pushState(
            {
                nomenclature: type
            },
            "",
            `book.html#${type}`
        );

    }


    // --------------------------------------------------------
    // CONSTRUIRE LA FICHE
    // --------------------------------------------------------

    const content =
        createNomenclatureHTML(
            data,
            type
        );


    /*
     * On remplace le contenu de la bibliothèque
     * par la fiche.
     */

    bookPage.innerHTML = content;


    // --------------------------------------------------------
    // BOUTON RETOUR
    // --------------------------------------------------------

    const backButton =
        bookPage.querySelector(
            ".nomenclature-back"
        );


    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                showBookLibrary();

            }
        );

    }


    // --------------------------------------------------------
    // SECTIONS DÉPLIABLES
    // --------------------------------------------------------

    setupNomenclatureSections();


    // --------------------------------------------------------
    // SCROLL EN HAUT
    // --------------------------------------------------------

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// RETOUR À LA BIBLIOTHÈQUE
// ============================================================

function showBookLibrary() {

    /*
     * Recharge simplement la page.
     *
     * Cela permet de récupérer exactement
     * le HTML original de book.html.
     */

    window.location.hash = "";

    window.location.reload();

}


// ============================================================
// CONSTRUIRE LE HTML DE LA NOMENCLATURE
// ============================================================

function createNomenclatureHTML(
    data,
    type
) {

    const isInorganic =
        type === "inorganique";


    const icon =
        isInorganic
            ? "⚗️"
            : "🧬";


    const title =
        isInorganic
            ? "Nomenclature en chimie inorganique"
            : "Nomenclature en chimie organique";


    const subtitle =
        isInorganic
            ? "Règles, conventions et pièges de nomenclature IUPAC."
            : "Règles et conventions de nomenclature des composés organiques.";


    return `

        <!-- =================================================
             EN-TÊTE
             ================================================= -->

        <div class="nomenclature-header">

            <button
                type="button"
                class="nomenclature-back">

                ← Retour à la bibliothèque

            </button>


            <div class="nomenclature-title">

                <span class="nomenclature-icon">
                    ${icon}
                </span>

                <div>

                    <h2>
                        ${escapeHTML(title)}
                    </h2>

                    <p>
                        ${escapeHTML(subtitle)}
                    </p>

                </div>

            </div>

        </div>


        <!-- =================================================
             CONTENU
             ================================================= -->

        <div class="nomenclature-content">

            ${renderNomenclatureData(data)}

        </div>

    `;

}


// ============================================================
// AFFICHER LES DONNÉES JSON
// ============================================================

function renderNomenclatureData(
    data
) {

    /*
     * Le système accepte plusieurs structures JSON :
     *
     * - objet contenant des sections
     * - tableau de sections
     * - objet imbriqué
     *
     * On parcourt récursivement les données
     * pour pouvoir afficher les informations.
     */


    if (
        Array.isArray(data)
    ) {

        return data
            .map(
                item =>
                    renderNomenclatureNode(
                        item
                    )
            )
            .join("");

    }


    if (
        typeof data === "object" &&
        data !== null
    ) {

        return Object.entries(data)
            .map(
                ([key, value]) =>
                    renderNomenclatureEntry(
                        key,
                        value
                    )
            )
            .join("");

    }


    return `

        <div class="nomenclature-rule">

            ${escapeHTML(data)}

        </div>

    `;

}


// ============================================================
// AFFICHER UN OBJET
// ============================================================

function renderNomenclatureEntry(
    key,
    value
) {

    /*
     * Les métadonnées sont affichées
     * différemment des grandes sections.
     */


    const title =
        formatNomenclatureTitle(
            key
        );


    // --------------------------------------------------------
    // TABLEAU
    // --------------------------------------------------------

    if (
        Array.isArray(value)
    ) {

        return `

            <section
                class="nomenclature-section">

                <h2>
                    ${escapeHTML(title)}
                </h2>

                ${renderNomenclatureArray(value)}

            </section>

        `;

    }


    // --------------------------------------------------------
    // OBJET
    // --------------------------------------------------------

    if (
        typeof value === "object" &&
        value !== null
    ) {

        return `

            <section
                class="nomenclature-section">

                <h2>
                    ${escapeHTML(title)}
                </h2>

                ${renderNomenclatureObject(
                    value
                )}

            </section>

        `;

    }


    // --------------------------------------------------------
    // TEXTE SIMPLE
    // --------------------------------------------------------

    return `

        <section
            class="nomenclature-section">

            <h2>
                ${escapeHTML(title)}
            </h2>

            <p>
                ${formatNomenclatureText(value)}
            </p>

        </section>

    `;

}


// ============================================================
// AFFICHER UN NŒUD
// ============================================================

function renderNomenclatureNode(
    item
) {

    if (
        typeof item === "string" ||
        typeof item === "number"
    ) {

        return `

            <div class="nomenclature-rule">

                ${formatNomenclatureText(item)}

            </div>

        `;

    }


    if (
        typeof item === "object" &&
        item !== null
    ) {

        return renderNomenclatureObject(
            item
        );

    }


    return "";

}


// ============================================================
// AFFICHER UN OBJET IMBRIQUÉ
// ============================================================

function renderNomenclatureObject(
    object
) {

    return Object.entries(object)
        .map(
            ([key, value]) => {

                const title =
                    formatNomenclatureTitle(
                        key
                    );


                // --------------------------------------------
                // TABLEAU
                // --------------------------------------------

                if (
                    Array.isArray(value)
                ) {

                    return `

                        <div
                            class="nomenclature-rule">

                            <h3>
                                ${escapeHTML(title)}
                            </h3>

                            ${renderNomenclatureArray(
                                value
                            )}

                        </div>

                    `;

                }


                // --------------------------------------------
                // OBJET
                // --------------------------------------------

                if (
                    typeof value === "object" &&
                    value !== null
                ) {

                    return `

                        <div
                            class="nomenclature-rule">

                            <h3>
                                ${escapeHTML(title)}
                            </h3>

                            ${renderNomenclatureObject(
                                value
                            )}

                        </div>

                    `;

                }


                // --------------------------------------------
                // VALEUR SIMPLE
                // --------------------------------------------

                return `

                    <div
                        class="nomenclature-rule">

                        <strong>
                            ${escapeHTML(title)}
                        </strong>

                        <p>
                            ${formatNomenclatureText(
                                value
                            )}
                        </p>

                    </div>

                `;

            }
        )
        .join("");

}


// ============================================================
// AFFICHER UN TABLEAU
// ============================================================

function renderNomenclatureArray(
    array
) {

    if (array.length === 0) {
        return "";
    }


    /*
     * Si le tableau contient des objets,
     * on vérifie s'il s'agit d'un tableau
     * suffisamment régulier pour devenir
     * un tableau HTML.
     */

    const objects =
        array.every(
            item =>
                typeof item === "object" &&
                item !== null &&
                !Array.isArray(item)
        );


    if (
        objects &&
        array.length > 0
    ) {

        const keys =
            [
                ...new Set(
                    array.flatMap(
                        item =>
                            Object.keys(item)
                    )
                )
            ];


        return `

            <div class="nomenclature-table-wrapper">

                <table class="nomenclature-table">

                    <thead>

                        <tr>

                            ${keys
                                .map(
                                    key => `

                                        <th>
                                            ${escapeHTML(
                                                formatNomenclatureTitle(
                                                    key
                                                )
                                            )}
                                        </th>

                                    `
                                )
                                .join("")}

                        </tr>

                    </thead>


                    <tbody>

                        ${array
                            .map(
                                item => `

                                    <tr>

                                        ${keys
                                            .map(
                                                key => `

                                                    <td>
                                                        ${formatNomenclatureText(
                                                            item[key]
                                                        )}
                                                    </td>

                                                `
                                            )
                                            .join("")}

                                    </tr>

                                `
                            )
                            .join("")}

                    </tbody>

                </table>

            </div>

        `;

    }


    // --------------------------------------------------------
    // LISTE SIMPLE
    // --------------------------------------------------------

    return `

        <ul>

            ${array
                .map(
                    item => `

                        <li>
                            ${formatNomenclatureText(
                                item
                            )}
                        </li>

                    `
                )
                .join("")}

        </ul>

    `;

}


// ============================================================
// FORMATER UN TITRE
// ============================================================

function formatNomenclatureTitle(
    value
) {

    if (!hasValue(value)) {
        return "";
    }


    const text =
        String(value)
            .replace(/_/g, " ")
            .replace(/-/g, " ");


    return text.charAt(0).toUpperCase() +
        text.slice(1);

}


// ============================================================
// FORMATER LE TEXTE
// ============================================================

function formatNomenclatureText(
    value
) {

    if (!hasValue(value)) {
        return "";
    }


    /*
     * Les objets sont transformés en texte
     * uniquement lorsqu'ils arrivent ici
     * dans une valeur simple.
     */

    if (
        typeof value === "object"
    ) {

        return escapeHTML(
            JSON.stringify(value)
        );

    }


    let text =
        String(value);


    /*
     * Remplacement de quelques notations
     * Markdown simples utilisées dans
     * les données de nomenclature.
     */

    text =
        escapeHTML(text);


    /*
     * Mettre les formules entre $...$
     * visuellement en évidence.
     */

    text =
        text.replace(
            /\$([^$]+)\$/g,
            `<span class="nomenclature-formula">$1</span>`
        );


    /*
     * Gras Markdown.
     */

    text =
        text.replace(
            /\*\*([^*]+)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
     * Italique Markdown.
     */

    text =
        text.replace(
            /\*([^*]+)\*/g,
            "<em>$1</em>"
        );


    /*
     * Retours à la ligne.
     */

    text =
        text.replace(
            /\n/g,
            "<br>"
        );


    return text;

}


// ============================================================
// SECTIONS DÉPLIABLES
// ============================================================

function setupNomenclatureSections() {

    const sections =
        bookPage.querySelectorAll(
            ".nomenclature-section"
        );


    sections.forEach(section => {

        const title =
            section.querySelector(
                "h2"
            );


        if (!title) {
            return;
        }


        /*
         * Les grandes sections restent visibles.
         *
         * On ajoute seulement un comportement
         * visuel si nécessaire.
         */

        title.style.cursor =
            "default";

    });

}


// ============================================================
// LANCEMENT
// ============================================================

/*
 * Important :
 *
 * loadData() est déjà lancé plus haut.
 *
 * Cette fonction est indépendante du système
 * du tableau périodique.
 */

loadNomenclature();


// ============================================================
// NAVIGATION AVEC LE BOUTON PRÉCÉDENT
// ============================================================

window.addEventListener(
    "popstate",
    () => {

        const hash =
            window.location.hash
                .replace("#", "")
                .toLowerCase();


        if (
            hash === "inorganique" ||
            hash === "organique"
        ) {

            showNomenclature(
                hash,
                false
            );

        } else if (bookPage) {

            window.location.reload();

        }

    }
);
