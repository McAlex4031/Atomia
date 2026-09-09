// ============================================================
// ATOMIA ⚛️
// Explorateur de la matière interactif
// ============================================================


// ============================================================
// DONNÉES
// ============================================================

let elements = [];
let ions = [];
let nuclides = [];
let sectionsSupplementaires = {};


// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const periodicTable =
    document.getElementById("periodic-table");

const elementView =
    document.getElementById("element-view");

const searchInput =
    document.getElementById("search");


// ============================================================
// TRADUCTIONS
// ============================================================

const translations = {

    // Familles
    "Alkali metals": "Métaux alcalins",
    "Alkaline earth metals": "Métaux alcalino-terreux",
    "Transition metals": "Métaux de transition",
    "Post-transition metals": "Autres métaux",
    "Metalloids": "Métalloïdes",
    "Nonmetals": "Non-métaux",
    "Non-metals": "Non-métaux",
    "Halogens": "Halogènes",
    "Noble gases": "Gaz nobles",
    "Lanthanides": "Lanthanides",
    "Actinides": "Actinides",

    "Alkali metal": "Métal alcalin",
    "Alkaline earth metal": "Métal alcalino-terreux",
    "Transition metal": "Métal de transition",
    "Post-transition metal": "Autre métal",
    "Metalloid": "Métalloïde",
    "Non-metal": "Non-métal",
    "Halogen": "Halogène",
    "Noble gas": "Gaz noble",

    // Familles particulières
    "Pnictogens": "Pnictogènes",
    "Chalcogens": "Chalcogènes",
    "Hydrogen (special case, outside standard families)":
        "Hydrogène (cas particulier, hors familles standards)",

    // États physiques
    "gas": "gaz",
    "liquid": "liquide",
    "solid": "solide",
    "Gas": "Gaz",
    "Liquid": "Liquide",
    "Solid": "Solide",

    // Pays
    "England": "Angleterre",
    "Scotland": "Écosse",
    "France": "France",
    "Germany": "Allemagne",
    "Sweden": "Suède",
    "Denmark": "Danemark",
    "Russia": "Russie",
    "United States": "États-Unis",
    "USA": "États-Unis",
    "Italy": "Italie",
    "Austria": "Autriche",
    "Finland": "Finlande",
    "Norway": "Norvège",
    "Poland": "Pologne",
    "Japan": "Japon",
    "England, United Kingdom":
        "Angleterre, Royaume-Uni",

    // Magnétisme
    "diamagnetic": "Diamagnétique",
    "paramagnetic": "Paramagnétique",
    "ferromagnetic": "Ferromagnétique",

    // Langues
    "Greek": "Grec",
    "Latin": "Latin",
    "German": "Allemand",
    "French": "Français",
    "English": "Anglais",

    // Termes scientifiques
    "Stable": "Stable",
    "Unknown": "Inconnu"
};


// ============================================================
// TRADUIRE UN TEXTE
// ============================================================

function translateText(value) {

    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value !== "string") {
        return value;
    }

    if (translations[value]) {
        return translations[value];
    }

    return value;
}


// ============================================================
// VÉRIFIER SI UNE VALEUR EXISTE
// ============================================================

function hasValue(value) {

    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === "string") {
        return value.trim() !== "";
    }

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return true;
}


// ============================================================
// CHARGEMENT DES DONNÉES
// ============================================================

async function loadData() {

    try {

        // ----------------------------------------------------
        // ELEMENTS
        // ----------------------------------------------------

        const elementsResponse =
            await fetch("data/elements.json");

        if (!elementsResponse.ok) {
            throw new Error(
                "Impossible de charger elements.json"
            );
        }

        elements =
            await elementsResponse.json();


        // ----------------------------------------------------
        // IONS
        // ----------------------------------------------------

        const ionsResponse =
            await fetch("data/ions.json");

        if (!ionsResponse.ok) {
            throw new Error(
                "Impossible de charger ions.json"
            );
        }

        ions =
            await ionsResponse.json();


        // ----------------------------------------------------
        // NUCLÉIDES
        // ----------------------------------------------------

        const nuclideFiles = [

            "data/nuclides-1.json",
            "data/nuclides-2.json",
            "data/nuclides-3.json",
            "data/nuclides-4.json"

        ];


        const nuclideResponses =
            await Promise.all(

                nuclideFiles.map(
                    file => fetch(file)
                )

            );


        for (const response of nuclideResponses) {

            if (!response.ok) {

                throw new Error(
                    "Impossible de charger un fichier de nucléides"
                );

            }

        }


        const nuclideData =
            await Promise.all(

                nuclideResponses.map(
                    response => response.json()
                )

            );


        nuclides = [];


        nuclideData.forEach(data => {

            if (Array.isArray(data)) {

                nuclides.push(...data);

            }

        });


        // ----------------------------------------------------
        // SECTIONS SUPPLÉMENTAIRES
        // ----------------------------------------------------

        const sectionFiles = [

            "data/sections-1.json",
            "data/sections-2.json",
            "data/sections-3.json",
            "data/sections-4.json",
            "data/sections-5.json"

        ];


        const sectionResponses =
            await Promise.all(

                sectionFiles.map(
                    file => fetch(file)
                )

            );


        for (const response of sectionResponses) {

            if (!response.ok) {

                throw new Error(
                    "Impossible de charger un fichier sections"
                );

            }

        }


        const sectionData =
            await Promise.all(

                sectionResponses.map(
                    response => response.json()
                )

            );


        sectionsSupplementaires = {};


        sectionData.forEach(data => {

            if (
                data &&
                typeof data === "object" &&
                !Array.isArray(data)
            ) {

                Object.assign(
                    sectionsSupplementaires,
                    data
                );

            }

        });


        // ----------------------------------------------------
        // AFFICHER LE TABLEAU
        // ----------------------------------------------------

        displayPeriodicTable();


        console.log(
            "ATOMIA : données chargées",
            {
                elements: elements.length,
                ions: ions.length,
                nuclides: nuclides.length,
                sections:
                    Object.keys(
                        sectionsSupplementaires
                    ).length
            }
        );


    } catch (error) {

        console.error(
            "Erreur ATOMIA :",
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


        elementCard.className =
            `element ${element.category || ""}`;


        elementCard.dataset.atomicNumber =
            element.atomicNumber;


        elementCard.innerHTML = `

            <span class="atomic-number">
                ${element.atomicNumber}
            </span>

            <span class="symbol">
                ${element.symbol}
            </span>

            <span class="element-name">
                ${element.name}
            </span>

        `;


        elementCard.addEventListener(
            "click",
            () => showElement(element)
        );


        periodicTable.appendChild(
            elementCard
        );

    });

}


// ============================================================
// AFFICHER UN ÉLÉMENT
// ============================================================

function showElement(element) {

    if (!elementView) {
        return;
    }


    if (periodicTable) {
        periodicTable.classList.add("hidden");
    }


    elementView.classList.remove("hidden");


    // --------------------------------------------------------
    // DONNÉES SUPPLÉMENTAIRES
    // --------------------------------------------------------

    const supplementary =
        sectionsSupplementaires[
            element.symbol
        ] || {};


    // --------------------------------------------------------
    // CALCULS
    // --------------------------------------------------------

    const protons =
        element.atomicNumber;


    const electrons =
        element.atomicNumber;


    let approximateMassNumber = null;


    if (
        element.atomicMass !== null &&
        element.atomicMass !== undefined
    ) {

        approximateMassNumber =
            Math.round(
                element.atomicMass
            );

    }


    const neutrons =
        approximateMassNumber !== null
            ? approximateMassNumber -
              element.atomicNumber
            : null;


    // --------------------------------------------------------
    // CONSTRUCTION DE LA FICHE
    // --------------------------------------------------------

    elementView.innerHTML = `

        <!-- ==================================================
             EN-TÊTE
             ================================================== -->

        <div class="element-header">

            <div class="element-symbol-large">
                ${element.symbol}
            </div>

            <div>

                <h2>
                    ${element.name}
                </h2>

                <p>
                    Numéro atomique :
                    ${element.atomicNumber}
                </p>

            </div>

        </div>


        <!-- ==================================================
             INFORMATIONS GÉNÉRALES
             ================================================== -->

        <section class="collapsible-section open">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    ⚛️ Informations générales
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                <div class="info-grid">

                    ${infoCard(
                        "Protons",
                        protons
                    )}

                    ${infoCard(
                        "Électrons",
                        electrons
                    )}

                    ${infoCard(
                        "Neutrons",
                        neutrons
                    )}

                    ${infoCard(
                        "Masse atomique",
                        hasValue(
                            element.atomicMass
                        )
                            ? `${element.atomicMass} u`
                            : null
                    )}

                    ${infoCard(
                        "État à température ambiante",
                        hasValue(
                            element.stateAtRoomTemperature
                        )
                            ? translateText(
                                element.stateAtRoomTemperature
                            )
                            : null
                    )}

                    ${infoCard(
                        "Point de fusion",
                        hasValue(
                            element.meltingPoint
                        )
                            ? `${element.meltingPoint} °C`
                            : null
                    )}

                    ${infoCard(
                        "Point d'ébullition",
                        hasValue(
                            element.boilingPoint
                        )
                            ? `${element.boilingPoint} °C`
                            : null
                    )}

                    ${infoCard(
                        "Densité",
                        hasValue(element.density)
                            ? `${element.density} g/cm³`
                            : null
                    )}

                    ${infoCard(
                        "Configuration électronique",
                        element.electronConfiguration
                    )}

                    ${infoCard(
                        "Électrons par couche",
                        hasValue(
                            element.electronsPerShell
                        )
                            ? element
                                .electronsPerShell
                                .join(" • ")
                            : null
                    )}

                </div>


                ${
                    hasValue(element.commonUses)
                        ? `

                            <div class="sub-info">

                                <h4>
                                    Utilisations courantes
                                </h4>

                                <ul>

                                    ${
                                        element.commonUses
                                            .map(
                                                use =>
                                                    `<li>${use}</li>`
                                            )
                                            .join("")
                                    }

                                </ul>

                            </div>

                        `
                        : ""
                }


                ${
                    hasValue(
                        element.commonOccurrences
                    )
                        ? `

                            <div class="sub-info">

                                <h4>
                                    Présence courante
                                </h4>

                                <ul>

                                    ${
                                        element
                                            .commonOccurrences
                                            .map(
                                                occurrence =>
                                                    `<li>${occurrence}</li>`
                                            )
                                            .join("")
                                    }

                                </ul>

                            </div>

                        `
                        : ""
                }

            </div>

        </section>


        <!-- ==================================================
             FAMILLE CHIMIQUE
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    🧪 Famille chimique
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                <div class="info-grid">

                    ${
                        supplementary.famille_chimique
                            ? infoCard(
                                "Famille",
                                translateText(
                                    supplementary
                                        .famille_chimique
                                        .famille
                                )
                            )
                            : ""
                    }

                    ${infoCard(
                        "Groupe",
                        element.group
                    )}

                    ${infoCard(
                        "Période",
                        element.period
                    )}

                    ${infoCard(
                        "Bloc",
                        element.block
                    )}

                    ${infoCard(
                        "Catégorie",
                        hasValue(
                            element.classification
                        )
                            ? translateText(
                                element.classification
                            )
                            : null
                    )}

                </div>

            </div>

        </section>


        <!-- ==================================================
             FORMULES
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    🧬 Formules
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                ${displayFormulas(
                    supplementary.formules
                )}

            </div>

        </section>


        <!-- ==================================================
             ÉTATS D'OXYDATION
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    ⚡ États d'oxydation
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                ${displayOxidationStates(
                    supplementary.etats_oxydation
                )}

            </div>

        </section>


        <!-- ==================================================
             HISTOIRE
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    🧑‍🔬 Histoire
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                ${displayHistory(
                    supplementary.histoire
                )}

            </div>

        </section>


        <!-- ==================================================
             EN SAVOIR PLUS
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    🌡️ En savoir plus
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                ${displayAdditionalProperties(
                    supplementary
                        .proprietes_supplementaires
                )}

            </div>

        </section>


        <!-- ==================================================
             NUCLÉIDES
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    ☢️ Nucléides
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                ${displayNuclides(element)}

            </div>

        </section>


        <!-- ==================================================
             IONS
             ================================================== -->

        <section class="collapsible-section">

            <button
                class="section-toggle"
                type="button">

                <h3>
                    ⚡ Ions
                </h3>

                <span
                    class="section-arrow"
                    aria-hidden="true">
                </span>

            </button>


            <div class="section-content">

                ${displayIons(element)}

            </div>

        </section>


        <!-- ==================================================
             FERMER
             ================================================== -->

        <button
            id="close-element"
            class="close-element"
            type="button">

            Fermer

        </button>

    `;


    // --------------------------------------------------------
    // SECTIONS DÉPLIABLES
    // --------------------------------------------------------

    const sectionToggles =
        elementView.querySelectorAll(
            ".section-toggle"
        );


    sectionToggles.forEach(toggle => {

        toggle.addEventListener(
            "click",
            () => {

                const section =
                    toggle.closest(
                        ".collapsible-section"
                    );


                if (section) {

                    section.classList.toggle(
                        "open"
                    );

                }

            }
        );

    });


    // --------------------------------------------------------
    // BOUTON FERMER
    // --------------------------------------------------------

    const closeButton =
        document.getElementById(
            "close-element"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeElement
        );

    }


    // --------------------------------------------------------
    // FORMULES CLIQUABLES
    // --------------------------------------------------------

    const formulaButtons =
        elementView.querySelectorAll(
            ".formula-button"
        );


    formulaButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const formula =
                    button.dataset.formula;


                if (formula) {

                    showCompound(
                        formula
                    );

                }

            }
        );

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// CARTE D'INFORMATION
// ============================================================

function infoCard(label, value) {

    if (!hasValue(value)) {
        return "";
    }


    return `

        <div class="info-card">

            <strong>
                ${label}
            </strong>

            <span>
                ${translateText(value)}
            </span>

        </div>

    `;

}


// ============================================================
// FORMULES
// ============================================================

function displayFormulas(formulas) {

    if (!hasValue(formulas)) {

        return `

            <p class="empty-data">
                Aucun composé enregistré pour le moment.
            </p>

        `;

    }


    const html =
        formulas
            .map(formula => {

                // --------------------------------------------
                // FORMULE SIMPLE
                // --------------------------------------------

                if (
                    typeof formula === "string"
                ) {

                    return `

                        <button
                            class="formula-button"
                            type="button"
                            data-formula="${formula}">

                            <strong>
                                ${formula}
                            </strong>

                        </button>

                    `;

                }


                // --------------------------------------------
                // OBJET
                // --------------------------------------------

                if (
                    formula &&
                    typeof formula === "object"
                ) {

                    const value =
                        formula.formule ||
                        formula.formula ||
                        formula.id;


                    const name =
                        formula.nom ||
                        formula.name;


                    if (!hasValue(value)) {
                        return "";
                    }


                    return `

                        <button
                            class="formula-button"
                            type="button"
                            data-formula="${value}">

                            <strong>
                                ${value}
                            </strong>

                            ${
                                hasValue(name)
                                    ? `
                                        <span>
                                            ${translateText(name)}
                                        </span>
                                    `
                                    : ""
                            }

                        </button>

                    `;

                }


                return "";

            })
            .join("");


    if (!html) {

        return `

            <p class="empty-data">
                Aucun composé enregistré pour le moment.
            </p>

        `;

    }


    return `

        <div class="formulas-list">
            ${html}
        </div>

    `;

}


// ============================================================
// ÉTATS D'OXYDATION
// ============================================================

function displayOxidationStates(states) {

    if (!hasValue(states)) {

        return `

            <p class="empty-data">
                Aucun état d'oxydation enregistré.
            </p>

        `;

    }


    return `

        <div class="oxidation-states">

            ${
                states
                    .map(state => {

                        let display =
                            String(state);


                        if (
                            typeof state === "number" &&
                            state > 0
                        ) {

                            display =
                                "+" + state;

                        }


                        return `

                            <span
                                class="oxidation-state">

                                ${display}

                            </span>

                        `;

                    })
                    .join("")
            }

        </div>

    `;

}


// ============================================================
// HISTOIRE
// ============================================================

function displayHistory(history) {

    if (!history) {

        return `

            <p class="empty-data">
                Aucune donnée historique disponible.
            </p>

        `;

    }


    const discovery =
        history.decouverte ||
        history.discovery ||
        history;


    let html = "";


    // --------------------------------------------------------
    // QUI ?
    // --------------------------------------------------------

    if (hasValue(discovery.qui)) {

        html += `

            <p>
                <strong>
                    Qui ?
                </strong>

                ${discovery.qui}

            </p>

        `;

    }


    // --------------------------------------------------------
    // QUAND ?
    // --------------------------------------------------------

    if (hasValue(discovery.quand)) {

        html += `

            <p>
                <strong>
                    Quand ?
                </strong>

                ${discovery.quand}

            </p>

        `;

    }

    else if (hasValue(discovery.when)) {

        html += `

            <p>
                <strong>
                    Quand ?
                </strong>

                ${discovery.when}

            </p>

        `;

    }


    // --------------------------------------------------------
    // LIEU
    // --------------------------------------------------------

    if (hasValue(discovery.lieu)) {

        html += `

            <p>
                <strong>
                    Lieu :
                </strong>

                ${translateText(
                    discovery.lieu
                )}

            </p>

        `;

    }


    // --------------------------------------------------------
    // COMMENT
    // --------------------------------------------------------

    // IMPORTANT :
    // Si "comment" vaut null, rien n'est affiché.

    if (hasValue(discovery.comment)) {

        html += `

            <p>
                <strong>
                    Comment ?
                </strong>

                ${translateText(
                    discovery.comment
                )}

            </p>

        `;

    }


    // --------------------------------------------------------
    // ORIGINE DU NOM
    // --------------------------------------------------------

    if (
        hasValue(
            discovery.origine_du_nom
        )
    ) {

        html += `

            <p>
                <strong>
                    Origine du nom :
                </strong>

                ${translateText(
                    discovery.origine_du_nom
                )}

            </p>

        `;

    }


    // --------------------------------------------------------
    // SI AUCUNE DONNÉE
    // --------------------------------------------------------

    if (!html) {

        return `

            <p class="empty-data">
                Aucune donnée historique disponible.
            </p>

        `;

    }


    return html;

}


// ============================================================
// PROPRIÉTÉS SUPPLÉMENTAIRES
// ============================================================

function displayAdditionalProperties(properties) {

    if (!properties) {

        return `

            <p class="empty-data">
                Aucune donnée supplémentaire disponible.
            </p>

        `;

    }


    const labels = {

        electronegativite_pauling:
            "Électronégativité (Pauling)",

        energie_ionisation_eV:
            "Énergie d'ionisation",

        affinite_electronique_eV:
            "Affinité électronique",

        rayon_atomique_pm:
            "Rayon atomique",

        rayon_covalent_pm:
            "Rayon covalent",

        conductivite_thermique_W_mK:
            "Conductivité thermique",

        magnetisme:
            "Magnétisme",

        chaleur_specifique_J_gK:
            "Chaleur spécifique",

        chaleur_molaire_J_molK:
            "Chaleur molaire",

        abondance_croute_mg_kg:
            "Abondance dans la croûte terrestre",

        abondance_mer_mg_L:
            "Abondance dans la mer"

    };


    const units = {

        electronegativite_pauling:
            "",

        energie_ionisation_eV:
            " eV",

        affinite_electronique_eV:
            " eV",

        rayon_atomique_pm:
            " pm",

        rayon_covalent_pm:
            " pm",

        conductivite_thermique_W_mK:
            " W/m·K",

        magnetisme:
            "",

        chaleur_specifique_J_gK:
            " J/g·K",

        chaleur_molaire_J_molK:
            " J/mol·K",

        abondance_croute_mg_kg:
            " mg/kg",

        abondance_mer_mg_L:
            " mg/L"

    };


    let html =
        `<div class="info-grid">`;


    Object.keys(labels).forEach(key => {

        const value =
            properties[key];


        // Ne jamais afficher null
        if (!hasValue(value)) {
            return;
        }


        html += infoCard(

            labels[key],

            `${translateText(value)}${units[key]}`

        );

    });


    html += `</div>`;


    if (
        html ===
        `<div class="info-grid"></div>`
    ) {

        return `

            <p class="empty-data">
                Aucune donnée supplémentaire disponible.
            </p>

        `;

    }


    return html;

}


// ============================================================
// NUCLÉIDES
// ============================================================

function displayNuclides(element) {

    const elementNuclides =
        nuclides.filter(nuclide => {

            if (!nuclide) {
                return false;
            }


            // Structure réelle de tes JSON
            if (
                nuclide.element ===
                element.symbol
            ) {

                return true;

            }


            // Sécurité si certains fichiers
            // utilisent symbol
            if (
                nuclide.symbol ===
                element.symbol
            ) {

                return true;

            }


            // Sécurité avec l'id
            if (
                typeof nuclide.id ===
                "string"
            ) {

                return nuclide.id
                    .toLowerCase()
                    .startsWith(
                        element.symbol
                            .toLowerCase() +
                        "-"
                    );

            }


            return false;

        });


    if (
        elementNuclides.length === 0
    ) {

        return `

            <p class="empty-data">
                Aucun nucléide disponible.
            </p>

        `;

    }


    return `

        <div class="nuclides-list">

            ${
                elementNuclides
                    .map(
                        nuclide =>
                            createNuclideCard(
                                nuclide,
                                element
                            )
                    )
                    .join("")
            }

        </div>

    `;

}


// ============================================================
// CARTE NUCLÉIDE
// ============================================================

function createNuclideCard(
    nuclide,
    element
) {

    const massNumber =
        nuclide.massNumber;


    const protons =
        hasValue(nuclide.protons)
            ? nuclide.protons
            : element.atomicNumber;


    const neutrons =
        hasValue(nuclide.neutrons)
            ? nuclide.neutrons
            : (
                hasValue(massNumber)
                    ? massNumber - protons
                    : null
            );


    const electrons =
        protons;


    let html = `

        <div class="nuclide-card">

            <h4>
                ${element.symbol}-${massNumber}
            </h4>

    `;


    if (hasValue(protons)) {

        html += `

            <p>
                Protons :
                ${protons}
            </p>

        `;

    }


    if (hasValue(neutrons)) {

        html += `

            <p>
                Neutrons :
                ${neutrons}
            </p>

        `;

    }


    if (hasValue(electrons)) {

        html += `

            <p>
                Électrons :
                ${electrons}
            </p>

        `;

    }


    // --------------------------------------------------------
    // RADIOACTIVITÉ
    // --------------------------------------------------------

    if (
        hasValue(
            nuclide.isRadioactive
        )
    ) {

        html += `

            <p>
                ${
                    nuclide.isRadioactive
                        ? "Radioactif : Oui"
                        : "Radioactif : Non"
                }
            </p>

        `;

    }


    // --------------------------------------------------------
    // PÉRIODE RADIOACTIVE
    // --------------------------------------------------------

    if (
        nuclide.halfLife &&
        hasValue(
            nuclide.halfLife.display
        )
    ) {

        html += `

            <p>
                Période radioactive :
                ${translateText(
                    nuclide.halfLife.display
                )}
            </p>

        `;

    }


    // --------------------------------------------------------
    // MODES DE DÉSINTÉGRATION
    // --------------------------------------------------------

    if (
        hasValue(
            nuclide.decayModes
        )
    ) {

        html += `

            <p>
                Désintégration :
                ${nuclide.decayModes.join(", ")}
            </p>

        `;

    }


    // --------------------------------------------------------
    // SOURCE
    // --------------------------------------------------------

    if (
        hasValue(nuclide.source)
    ) {

        html += `

            <p>
                Source :
                ${nuclide.source}
            </p>

        `;

    }


    html += `</div>`;


    return html;

}


// ============================================================
// IONS
// ============================================================

function displayIons(element) {

    const elementIons =
        ions.filter(
            ion =>
                ion &&
                ion.element ===
                element.symbol
        );


    if (
        elementIons.length === 0
    ) {

        return `

            <p class="empty-data">
                Aucun ion disponible.
            </p>

        `;

    }


    return `

        <div class="ions-list">

            ${
                elementIons
                    .map(
                        ion =>
                            createIonCard(
                                ion,
                                element
                            )
                    )
                    .join("")
            }

        </div>

    `;

}


// ============================================================
// CARTE ION
// ============================================================

function createIonCard(
    ion,
    element
) {

    const protons =
        element.atomicNumber;


    const electrons =
        element.atomicNumber -
        ion.charge;


    let chargeDisplay =
        ion.charge > 0
            ? `+${ion.charge}`
            : `${ion.charge}`;


    return `

        <div class="ion-card">

            <h4>
                ${formatIon(ion.id)}
            </h4>

            <p>
                Charge :
                ${chargeDisplay}
            </p>

            <p>
                Protons :
                ${protons}
            </p>

            <p>
                Électrons :
                ${electrons}
            </p>

        </div>

    `;

}


// ============================================================
// FORMATAGE D'UN ION
// ============================================================

function formatIon(id) {

    if (!hasValue(id)) {
        return "";
    }


    const match =
        id.match(
            /^([A-Za-z]+)(\d*)([+-])$/
        );


    if (!match) {
        return id;
    }


    const symbol =
        match[1];


    const number =
        match[2];


    const sign =
        match[3];


    return `

        ${symbol}<sup>
            ${number}${sign}
        </sup>

    `;

}


// ============================================================
// COMPOSÉ
// ============================================================

function showCompound(formula) {

    // Pour le moment les composés n'ont pas
    // encore leur propre JSON.

    alert(
        `La fiche du composé ${formula} sera ajoutée prochainement.`
    );

}


// ============================================================
// FERMER LA FICHE
// ============================================================

function closeElement() {

    if (elementView) {

        elementView.classList.add(
            "hidden"
        );

    }


    if (periodicTable) {

        periodicTable.classList.remove(
            "hidden"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

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
                    .toLowerCase()
                    .trim();


            const elementCards =
                periodicTable
                    ? periodicTable
                        .querySelectorAll(
                            ".element"
                        )
                    : [];


            elementCards.forEach(card => {

                const atomicNumber =
                    card.dataset.atomicNumber;


                const element =
                    elements.find(
                        item =>
                            String(
                                item.atomicNumber
                            ) ===
                            atomicNumber
                    );


                if (!element) {
                    return;
                }


                const name =
                    String(
                        element.name || ""
                    ).toLowerCase();


                const symbol =
                    String(
                        element.symbol || ""
                    ).toLowerCase();


                const number =
                    String(
                        element.atomicNumber
                    );


                const matches =

                    name.includes(query)

                    ||

                    symbol.includes(query)

                    ||

                    number.includes(query);


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

const legend =
    document.querySelector(
        ".legend"
    );


const legendToggle =
    document.getElementById(
        "legend-toggle"
    );


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
// LANCEMENT
// ============================================================

loadData();
