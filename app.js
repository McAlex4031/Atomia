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
 *  1  → ⁺
 *  2  → 2⁺
 * -1  → ⁻
 * -2  → 2⁻
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
 *  2  → +2
 * -1  → -1
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
     *
     * On arrête donc ici sans provoquer
     * d'erreur JavaScript.
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
         *
         * flat() transforme :
         *
         * [
         *   [H, He, Li],
         *   [Be, B, C],
         *   ...
         * ]
         *
         * en :
         *
         * [
         *   H, He, Li, Be, B, C, ...
         * ]
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
         *
         * Exemple :
         *
         * supplementaryData["H"]
         * supplementaryData["Fe"]
         * supplementaryData["Og"]
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
         * Cette fonction permet par exemple
         * d'ouvrir directement :
         *
         * index.html?element=Fe
         *
         * et donc d'afficher automatiquement
         * la fiche du fer.
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

        /*
         * La catégorie présente dans elements.json
         * devient une classe CSS.
         *
         * Exemple :
         *
         * category: "alkali-metal"
         *
         * devient :
         *
         * class="element alkali-metal"
         */

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

        /*
         * Le groupe correspond à la colonne.
         * La période correspond à la ligne.
         */

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

        /*
         * La série va de La (57) à Lu (71).
         *
         * On les place sur une ligne séparée.
         */

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

        /*
         * La série va de Ac (89) à Lr (103).
         */

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

        /*
         * Quand on clique sur un élément,
         * sa fiche est ouverte.
         */

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
    // VIDER LA LISTE
    // --------------------------------------------------------

    valencesList.innerHTML = "";


    // --------------------------------------------------------
    // CRÉER UNE LIGNE POUR CHAQUE ÉLÉMENT
    // --------------------------------------------------------

    valences.forEach(element => {


        // ----------------------------------------------------
        // CONTENEUR
        // ----------------------------------------------------

        const item =
            document.createElement("article");


        item.className =
            "valence-item";


        /*
         * tabIndex permet aussi de sélectionner
         * la ligne avec le clavier.
         */

        item.tabIndex = 0;


        // ----------------------------------------------------
        // DONNÉES
        // ----------------------------------------------------

        item.dataset.symbol =
            element.symbole;

        item.dataset.atomicNumber =
            element.numero_atomique;


        // ----------------------------------------------------
        // VALENCES
        // ----------------------------------------------------

        const values =
            Array.isArray(element.valences)
                ? element.valences
                : [];


        // ----------------------------------------------------
        // SINGULIER / PLURIEL
        // ----------------------------------------------------

        const label =
            values.length === 1
                ? "Valence"
                : "Valences";


        // ----------------------------------------------------
        // PASTILLES
        // ----------------------------------------------------

        /*
         * Chaque valence est affichée
         * sous forme de pastille.
         *
         * Exemple :
         *
         * Valences : [ +2 ] [ +3 ]
         */

        const badges =
            values.length > 0

                ? values
                    .map(value => `
                        <span class="valence-badge">
                            ${escapeHTML(
                                formatValence(value)
                            )}
                        </span>
                    `)
                    .join("")

                : `
                    <span class="valence-badge">
                        —
                    </span>
                `;


        // ----------------------------------------------------
        // HTML DE LA LIGNE
        // ----------------------------------------------------

        item.innerHTML = `

            <div class="valence-element">

                <span class="valence-symbol">
                    ${escapeHTML(element.symbole)}
                </span>

                <span class="valence-number">
                    ${escapeHTML(element.numero_atomique)}
                </span>

            </div>


            <div class="valence-information">

                <h3>
                    ${escapeHTML(element.nom)}
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


        // ----------------------------------------------------
        // CLIC SUR UNE LIGNE
        // ----------------------------------------------------

        /*
         * C'est ici que fonctionne le lien
         * Valences → fiche de l'élément.
         *
         * Exemple :
         *
         * clic sur Fer
         *
         * ↓
         *
         * index.html?element=Fe
         *
         * ↓
         *
         * le tableau se charge
         *
         * ↓
         *
         * la fiche du Fe s'ouvre automatiquement.
         */

        item.addEventListener(
            "click",
            () => {

                goToElement(
                    element.symbole
                );

            }
        );


        // ----------------------------------------------------
        // CLAVIER
        // ----------------------------------------------------

        /*
         * Même fonctionnement avec :
         *
         * Entrée
         * ou
         * Espace
         */

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


        // ----------------------------------------------------
        // AJOUT DE LA LIGNE
        // ----------------------------------------------------

        valencesList.appendChild(
            item
        );

    });

}


// ============================================================
// ALLER VERS LA FICHE D'UN ÉLÉMENT
// ============================================================

function goToElement(symbol) {

    /*
     * On utilise un paramètre dans l'URL.
     *
     * Exemple :
     *
     * Fe
     *
     * devient :
     *
     * index.html?element=Fe
     *
     * encodeURIComponent protège le symbole
     * au cas où il contiendrait un caractère spécial.
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
     * nombre de protons = numéro atomique
     * nombre d'électrons = numéro atomique
     */

    const protons =
        Number(element.atomicNumber);

    const electrons =
        Number(element.atomicNumber);


    // ========================================================
    // NOMBRE DE NEUTRONS APPROXIMATIF
    // ========================================================

    /*
     * La masse atomique d'un élément
     * est une moyenne des isotopes naturels.
     *
     * On l'arrondit donc ici pour obtenir
     * une estimation du nombre de masse.
     *
     * Pour un isotope précis :
     * consulter la section Nucléides.
     */

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

    /*
     * On cherche tous les nucléides
     * correspondant au symbole de l'élément.
     *
     * On accepte plusieurs formats possibles
     * dans les fichiers JSON.
     */

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

    /*
     * Si aucune donnée n'existe,
     * on ne crée même pas la carte.
     */

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

    /*
     * On retire toutes les données
     * nulles ou vides.
     */

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

    /*
     * Un nucléide affiché ici est considéré
     * comme un atome neutre.
     *
     * Les électrons sont donc égaux
     * aux protons.
     */

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

    /*
     * La charge d'un ion ne change pas
     * son nombre de protons.
     */

    const protons =
        atomicNumber;


    // --------------------------------------------------------
    // ÉLECTRONS
    // --------------------------------------------------------

    /*
     * Pour un ion :
     *
     * électrons = Z - charge
     *
     * Exemple :
     *
     * Fe³⁺
     *
     * 26 - 3 = 23 électrons
     */

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
// RECHERCHE
// ============================================================

/*
 * La recherche n'est activée que si :
 *
 * - l'input #search existe
 * - le tableau périodique existe
 *
 * Cela évite toute erreur sur les autres pages.
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


                /*
                 * La recherche fonctionne sur :
                 *
                 * - nom
                 * - symbole
                 * - numéro atomique
                 */

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

/*
 * La légende n'existe que sur la page
 * du tableau périodique.
 *
 * On vérifie donc que les deux éléments
 * existent avant d'ajouter le bouton.
 */

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


    /*
     * ATOMIA est sombre par défaut.
     *
     * Si l'utilisateur a précédemment
     * choisi le mode clair, on le restaure.
     */

    if (
        savedTheme === "light"
    ) {

        document.body.classList.add(
            "light-theme"
        );

    }


    // --------------------------------------------------------
    // CRÉER LE BOUTON
    // --------------------------------------------------------

    const themeButton =
        document.createElement("button");


    themeButton.type = "button";


    themeButton.className =
        "theme-toggle";


    themeButton.setAttribute(
        "aria-label",
        "Changer de thème"
    );


    updateThemeButton(
        themeButton
    );


    // --------------------------------------------------------
    // AJOUTER LE BOUTON AU BODY
    // --------------------------------------------------------

    document.body.prepend(
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


    /*
     * Mode sombre :
     * 🌙 = permet de passer au clair
     *
     * Mode clair :
     * ☀️ = permet de passer au sombre
     */

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

/*
 * Utilisé notamment pour :
 *
 * 📍 Où le trouve-t-on ?
 * 🛠️ Utilisations
 *
 * Si la liste est vide, rien n'est affiché.
 */

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
 *
 * Cela permet d'avoir le même mode clair/sombre
 * dans :
 *
 * - Tableau
 * - Bibliothèque
 * - Valences
 * - En savoir plus
 */

setupTheme();


/*
 * Ensuite, ATOMIA regarde automatiquement
 * quelle page est actuellement ouverte
 * et charge uniquement ce dont elle a besoin.
 */

loadData();
