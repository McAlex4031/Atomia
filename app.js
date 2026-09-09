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


// ============================================================
// DONNÉES
// ============================================================

let elements = [];
let ions = [];
let nuclides = [];
let supplementaryData = {};


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

function hasValue(value) {

    if (value === null ||
        value === undefined ||
        value === "") {
        return false;
    }

    if (Array.isArray(value) &&
        value.length === 0) {
        return false;
    }

    return true;
}


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


function translateFamily(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.families[value] || value;
}


function translateState(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.states[value] || value;
}


function translateCountry(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.countries[value] || value;
}


function translateMagnetism(value) {

    if (!hasValue(value)) {
        return "";
    }

    return translations.magnetism[value] || value;
}


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


function formatOxidationState(value) {

    if (value > 0) {
        return `+${value}`;
    }

    return String(value);
}


// ============================================================
// CHARGEMENT DES DONNÉES
// ============================================================

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


async function loadData() {

    try {

        // ----------------------------------------------------
        // ÉLÉMENTS
        // ----------------------------------------------------

        elements =
            await loadJSON(elementFiles[0]);


        // ----------------------------------------------------
        // IONS
        // ----------------------------------------------------

        ions =
            await loadJSON(ionFiles[0]);


        // ----------------------------------------------------
        // NUCLÉIDES
        // ----------------------------------------------------

        const nuclideResults =
            await Promise.all(
                nuclideFiles.map(file =>
                    loadJSON(file)
                )
            );

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

        supplementaryData = {};

        supplementaryResults.forEach(section => {

            Object.assign(
                supplementaryData,
                section
            );

        });


        // ----------------------------------------------------
        // AFFICHAGE
        // ----------------------------------------------------

        displayPeriodicTable();

    } catch (error) {

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
// TABLEAU PÉRIODIQUE
// ============================================================

function displayPeriodicTable() {

    if (!periodicTable) {
        return;
    }

    periodicTable.innerHTML = "";

    elements.forEach(element => {

        const elementCard =
            document.createElement("button");

        elementCard.type = "button";

        // ----------------------------------------------------
        // CLASSE DE L'ÉLÉMENT
        // ----------------------------------------------------

        elementCard.className =
            `element ${element.category || ""}`;

        // ----------------------------------------------------
        // DONNÉES
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
         * Tableau périodique principal :
         *
         * groupe  = colonne
         * période = ligne
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
         * La → Lu
         * numéros atomiques 57 → 71
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
         * Ac → Lr
         * numéros atomiques 89 → 103
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
        // CONTENU
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
        // CLIC
        // ----------------------------------------------------

        elementCard.addEventListener(
            "click",
            () => {

                showElement(element);

            }
        );


        periodicTable.appendChild(
            elementCard
        );

    });

}


// ============================================================
// FICHE D'UN ÉLÉMENT
// ============================================================

function showElement(element) {

    if (!elementView) {
        return;
    }


    // --------------------------------------------------------
    // DONNÉES SUPPLÉMENTAIRES
    // --------------------------------------------------------

    const supplementary =
        supplementaryData[element.symbol] || {};


    // --------------------------------------------------------
    // PROTONS / ÉLECTRONS
    // --------------------------------------------------------

    const protons =
        Number(element.atomicNumber);

    const electrons =
        Number(element.atomicNumber);


    // --------------------------------------------------------
    // NOMBRE DE MASSE APPROXIMATIF
    // --------------------------------------------------------

    const approximateMassNumber =
        Math.round(
            Number(element.atomicMass)
        );


    const approximateNeutrons =
        approximateMassNumber -
        protons;


    // --------------------------------------------------------
    // FAMILLE CHIMIQUE
    // --------------------------------------------------------

    const familyData =
        supplementary.famille_chimique || {};


    // --------------------------------------------------------
    // FORMULES
    // --------------------------------------------------------

    const formulas =
        supplementary.formules || [];


    // --------------------------------------------------------
    // ÉTATS D'OXYDATION
    // --------------------------------------------------------

    const oxidationStates =
        supplementary.etats_oxydation || [];


    // --------------------------------------------------------
    // HISTOIRE
    // --------------------------------------------------------

    const history =
        supplementary.histoire?.decouverte || {};


    // --------------------------------------------------------
    // PROPRIÉTÉS SUPPLÉMENTAIRES
    // --------------------------------------------------------

    const extra =
        supplementary.proprietes_supplementaires || {};


    // --------------------------------------------------------
    // NUCLÉIDES
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // IONS
    // --------------------------------------------------------

    const elementIons =
        ions.filter(ion => {

            return (
                ion.element ===
                element.symbol
            );

        });


    // ========================================================
    // HTML
    // ========================================================

    elementView.innerHTML = `

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

    const protons =
        hasValue(nuclide.protons)
            ? Number(nuclide.protons)
            : null;


    const neutrons =
        hasValue(nuclide.neutrons)
            ? Number(nuclide.neutrons)
            : null;


    const electrons =
        protons !== null
            ? protons
            : null;


    let decayHTML = "";


    if (
        Array.isArray(nuclide.decayModes) &&
        nuclide.decayModes.length > 0
    ) {

        decayHTML = `

            <p>
                <strong>Désintégration :</strong>
                ${escapeHTML(
                    nuclide.decayModes.join(", ")
                )}
            </p>

        `;

    }


    let halfLifeHTML = "";


    if (
        nuclide.halfLife &&
        hasValue(nuclide.halfLife.display)
    ) {

        halfLifeHTML = `

            <p>
                <strong>Demi-vie :</strong>
                ${escapeHTML(
                    nuclide.halfLife.display
                )}
            </p>

        `;

    }


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
                        <strong>Source :</strong>
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

    const atomicNumber =
        Number(ion.atomicNumber);


    const charge =
        Number(ion.charge);


    const protons =
        atomicNumber;


    const electrons =
        atomicNumber - charge;


    return `

        <article class="ion-card">

            <h4>
                ${escapeHTML(ion.element)}
                ${escapeHTML(
                    formatCharge(charge)
                )}
            </h4>

            <p>
                <strong>Charge :</strong>
                ${escapeHTML(
                    formatOxidationState(charge)
                )}
            </p>

            <p>
                <strong>Protons :</strong>
                ${protons}
            </p>

            <p>
                <strong>Électrons :</strong>
                ${electrons}
            </p>

        </article>

    `;

}


// ============================================================
// RECHERCHE
// ============================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const cards =
                periodicTable.querySelectorAll(
                    ".element"
                );


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
// DÉMARRAGE
// ============================================================

loadData();
