/* =========================================================
ATOMIA ⚛️
JavaScript principal
========================================================= */


/* =========================================================
1. VARIABLES PRINCIPALES
========================================================= */

// Tous les éléments contenus dans elements.json
let elements = [];

// Tous les ions contenus dans ions.json
let ions = [];

// Tous les nucléides contenus dans les 4 fichiers
let nuclides = [];


// Éléments HTML dont nous avons besoin
const periodicTable =
    document.getElementById("periodic-table");

const searchInput =
    document.getElementById("search");

const elementView =
    document.getElementById("element-view");


/* =========================================================
2. CHARGEMENT DES DONNÉES
========================================================= */

async function loadData() {

    try {

        console.log("⚛️ Chargement d'ATOMIA...");


        /* -------------------------------------------------
           ÉLÉMENTS
           ------------------------------------------------- */

        const elementsResponse =
            await fetch("elements.json");


        if (!elementsResponse.ok) {

            throw new Error(
                `elements.json : HTTP ${elementsResponse.status}`
            );
        }


        elements =
            await elementsResponse.json();


        /* -------------------------------------------------
           IONS
           ------------------------------------------------- */

        const ionsResponse =
            await fetch("ions.json");


        if (!ionsResponse.ok) {

            throw new Error(
                `ions.json : HTTP ${ionsResponse.status}`
            );
        }


        ions =
            await ionsResponse.json();


        /* -------------------------------------------------
           NUCLÉIDES
           ------------------------------------------------- */

        const nuclideFiles = [

            "nuclides-1.json",
            "nuclides-2.json",
            "nuclides-3.json",
            "nuclides-4.json"

        ];


        const nuclideResponses =
            await Promise.all(

                nuclideFiles.map(
                    file => fetch(file)
                )

            );


        nuclideResponses.forEach(
            (response, index) => {

                if (!response.ok) {

                    throw new Error(
                        `${nuclideFiles[index]} : HTTP ${response.status}`
                    );
                }

            }
        );


        const nuclideData =
            await Promise.all(

                nuclideResponses.map(
                    response => response.json()
                )

            );


        nuclides =
            nuclideData.flat();


        /* -------------------------------------------------
           DEBUG
           ------------------------------------------------- */

        console.log("✅ ATOMIA chargé !");

        console.log(
            "Éléments :",
            elements.length
        );

        console.log(
            "Ions :",
            ions.length
        );

        console.log(
            "Nucléides :",
            nuclides.length
        );


        /* -------------------------------------------------
           CRÉATION DU TABLEAU
           ------------------------------------------------- */

        createPeriodicTable();


    } catch (error) {

        console.error(
            "❌ Erreur lors du chargement des données :",
            error
        );


        periodicTable.innerHTML = `
            <p class="error">
                Impossible de charger les données d'ATOMIA.
            </p>
        `;
    }

}


/* =========================================================
3. CRÉATION DU TABLEAU PÉRIODIQUE
========================================================= */

function createPeriodicTable() {

    periodicTable.innerHTML = "";


    elements.forEach(element => {

        const cell =
            document.createElement("div");


        cell.classList.add(
            "element",
            element.category
        );


        if (element.group) {

            cell.style.gridColumn =
                element.group;
        }


        if (element.period) {

            cell.style.gridRow =
                element.period;
        }


        if (
            element.category === "lanthanide"
        ) {

            const position =
                getFBlockPosition(element);

            cell.style.gridColumn =
                position;

            cell.style.gridRow = 8;
        }


        if (
            element.category === "actinide"
        ) {

            const position =
                getFBlockPosition(element);

            cell.style.gridColumn =
                position;

            cell.style.gridRow = 9;
        }


        cell.innerHTML = `

            <span class="atomic-number">
                ${element.atomicNumber}
            </span>

            <span class="symbol">
                ${element.symbol}
            </span>

            <span class="name">
                ${element.name}
            </span>

            <span class="atomic-mass">
                ${formatAtomicMass(
                    element.atomicMass
                )}
            </span>

        `;


        cell.addEventListener(
            "click",
            () => {

                showElement(element);

            }
        );


        cell.setAttribute(
            "tabindex",
            "0"
        );


        cell.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    showElement(element);

                }

            }
        );


        periodicTable.appendChild(cell);

    });

}


/* =========================================================
4. POSITION DES LANTHANIDES / ACTINIDES
========================================================= */

function getFBlockPosition(element) {

    if (
        element.category === "lanthanide"
    ) {

        return (
            element.atomicNumber - 57 + 4
        );

    }


    if (
        element.category === "actinide"
    ) {

        return (
            element.atomicNumber - 89 + 4
        );

    }


    return 4;

}


/* =========================================================
5. FORMATAGE DE LA MASSE ATOMIQUE
========================================================= */

function formatAtomicMass(mass) {

    if (
        mass === null ||
        mass === undefined
    ) {

        return "—";

    }


    return mass;

}


/* =========================================================
6. AFFICHAGE D'UN ÉLÉMENT
========================================================= */

function showElement(element) {


    /* -------------------------------------------------
       CALCULS DE L'ATOME NEUTRE
       ------------------------------------------------- */

    // Z = nombre de protons
    const protons =
        element.atomicNumber;


    // Un atome neutre possède autant
    // d'électrons que de protons.
    const electrons =
        element.atomicNumber;


    /*
       Pour la fiche générale, on utilise
       la masse atomique arrondie comme
       approximation du nombre de masse.

       N = A - Z
    */
    const massNumber =
        element.atomicMass !== null &&
        element.atomicMass !== undefined
            ? Math.round(element.atomicMass)
            : null;


    const neutrons =
        massNumber !== null
            ? massNumber - element.atomicNumber
            : null;


    /* -------------------------------------------------
       NUCLÉIDES DE L'ÉLÉMENT
       ------------------------------------------------- */

    const elementNuclides =
        nuclides.filter(nuclide => {

            /*
               Les fichiers de nucléides peuvent
               ne pas posséder "element" ou "symbol".

               Exemple :
               id = "C-14"

               On récupère donc le symbole
               directement depuis l'identifiant.
            */

            if (
                nuclide.element === element.symbol ||
                nuclide.symbol === element.symbol
            ) {

                return true;

            }


            if (
                typeof nuclide.id === "string"
            ) {

                return nuclide.id
                    .toLowerCase()
                    .startsWith(
                        element.symbol.toLowerCase() + "-"
                    );

            }


            return false;

        });


    /* -------------------------------------------------
       IONS DE L'ÉLÉMENT
       ------------------------------------------------- */

    const elementIons =
        ions.filter(
            ion =>
                ion.element === element.symbol
        );


    /* -------------------------------------------------
       CONSTRUCTION DE LA FICHE
       ------------------------------------------------- */

    elementView.innerHTML = `

        <div class="element-header">

            <div class="big-symbol">
                ${element.symbol}
            </div>

            <div>

                <h2>
                    ${element.name}
                </h2>

                <p>
                    Numéro atomique :
                    <strong>
                        ${element.atomicNumber}
                    </strong>
                </p>

            </div>

        </div>


        <!-- =========================================
             INFORMATIONS GÉNÉRALES
             ========================================= -->

        <div class="element-section collapsible-section">

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


                <div class="element-info">


                    <div class="info-card">

                        <span>
                            Symbole
                        </span>

                        <strong>
                            ${element.symbol}
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Protons (Z)
                        </span>

                        <strong>
                            ${protons}
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Électrons
                        </span>

                        <strong>
                            ${electrons}
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Neutrons
                        </span>

                        <strong>
                            ${
                                neutrons !== null
                                    ? neutrons
                                    : "—"
                            }
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Masse atomique
                        </span>

                        <strong>
                            ${formatAtomicMass(
                                element.atomicMass
                            )}
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            État à température ambiante
                        </span>

                        <strong>
                            ${
                                element.stateAtRoomTemperature
                                ?? "—"
                            }
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Point de fusion
                        </span>

                        <strong>
                            ${
                                formatValue(
                                    element.meltingPoint,
                                    "°C"
                                )
                            }
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Point d'ébullition
                        </span>

                        <strong>
                            ${
                                formatValue(
                                    element.boilingPoint,
                                    "°C"
                                )
                            }
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Densité
                        </span>

                        <strong>
                            ${
                                formatValue(
                                    element.density,
                                    "g/cm³"
                                )
                            }
                        </strong>

                    </div>


                    <div class="info-card">

                        <span>
                            Configuration électronique
                        </span>

                        <strong>
                            ${
                                element.electronConfiguration
                                ?? "—"
                            }
                        </strong>

                    </div>


                </div>


                <div class="element-section">

                    <h3>
                        ⚛️ Électrons par couche
                    </h3>

                    <p>
                        ${
                            element.electronsPerShell
                            ? element.electronsPerShell.join(" • ")
                            : "—"
                        }
                    </p>

                </div>


                <div class="element-section">

                    <h3>
                        🌍 Où trouve-t-on cet élément ?
                    </h3>

                    ${
                        createList(
                            element.commonOccurrences
                        )
                    }

                </div>


                <div class="element-section">

                    <h3>
                        🔧 Utilisations
                    </h3>

                    ${
                        createList(
                            element.commonUses
                        )
                    }

                </div>

            </div>

        </div>


        <!-- =========================================
             NUCLÉIDES
             ========================================= -->

        <div class="element-section collapsible-section">

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

                <div class="nuclide-list">

                    ${
                        createNuclideList(
                            elementNuclides
                        )
                    }

                </div>

            </div>

        </div>


        <!-- =========================================
             IONS
             ========================================= -->

        <div class="element-section collapsible-section">

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

                <div class="ion-list">

                    ${
                        createIonList(
                            elementIons
                        )
                    }

                </div>

            </div>

        </div>


        <button
            class="close-element"
            id="close-element">

            Fermer

        </button>

    `;


    /* -------------------------------------------------
       OUVERTURE / FERMETURE DES SECTIONS
       ------------------------------------------------- */

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


                section.classList.toggle(
                    "open"
                );

            }
        );

    });


    /* -------------------------------------------------
       BOUTON FERMER
       ------------------------------------------------- */

    document
        .getElementById("close-element")
        .addEventListener(
            "click",
            () => {

                elementView.classList.add(
                    "hidden"
                );


                elementView.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );


    elementView.classList.remove(
        "hidden"
    );


    elementView.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
7. LISTES
========================================================= */

function createList(items) {

    if (
        !items ||
        items.length === 0
    ) {

        return "<p>—</p>";

    }


    return `

        <ul>

            ${
                items
                    .map(
                        item => `
                            <li>
                                ${item}
                            </li>
                        `
                    )
                    .join("")
            }

        </ul>

    `;

}


/* =========================================================
8. NUCLÉIDES
========================================================= */

function createNuclideList(list) {

    if (list.length === 0) {

        return `
            <p>
                Aucun nucléide trouvé.
            </p>
        `;

    }


    const sorted =
        [...list].sort(
            (a, b) =>
                a.massNumber -
                b.massNumber
        );


    return sorted
        .map(nuclide => {


            const protons =
                nuclide.protons ??
                nuclide.atomicNumber;


            const neutrons =
                nuclide.neutrons ??
                (
                    nuclide.massNumber -
                    protons
                );


            return `

                <div class="nuclide-card">

                    <strong>
                        ${nuclide.id}
                    </strong>

                    <span>
                        A = ${nuclide.massNumber}
                    </span>

                    <span>
                        Protons : ${protons}
                    </span>

                    <span>
                        Neutrons : ${neutrons}
                    </span>

                </div>

            `;

        })
        .join("");

}


/* =========================================================
9. IONS
========================================================= */

function createIonList(list) {

    if (list.length === 0) {

        return `
            <p>
                Aucun ion enregistré.
            </p>
        `;

    }


    const sorted =
        [...list].sort(
            (a, b) =>
                a.charge -
                b.charge
        );


    return sorted
        .map(ion => {


            const protons =
                ion.atomicNumber;


            const electrons =
                ion.atomicNumber -
                ion.charge;


            return `

                <div class="ion-card">

                    <strong>
                        ${ion.id}
                    </strong>

                    <span>
                        Charge :
                        ${formatCharge(
                            ion.charge
                        )}
                    </span>

                    <span>
                        Protons :
                        ${protons}
                    </span>

                    <span>
                        Électrons :
                        ${electrons}
                    </span>

                </div>

            `;

        })
        .join("");

}


/* =========================================================
10. FORMATAGE DES CHARGES
========================================================= */

function formatCharge(charge) {

    if (charge > 0) {

        return "+" + charge;

    }


    return charge;

}


/* =========================================================
11. FORMATAGE DES VALEURS
========================================================= */

function formatValue(
    value,
    unit
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "—";

    }


    return `${value} ${unit}`;

}


/* =========================================================
12. RECHERCHE
========================================================= */

searchInput.addEventListener(
    "input",
    handleSearch
);


function handleSearch() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (query === "") {

        showAllElements();

        return;

    }


    const cells =
        document.querySelectorAll(
            ".periodic-table .element"
        );


    cells.forEach(cell => {

        const atomicNumber =
            cell
                .querySelector(
                    ".atomic-number"
                )
                ?.textContent
                .trim()
                .toLowerCase();


        const symbol =
            cell
                .querySelector(
                    ".symbol"
                )
                ?.textContent
                .trim()
                .toLowerCase();


        const name =
            cell
                .querySelector(
                    ".name"
                )
                ?.textContent
                .trim()
                .toLowerCase();


        const matches =
            name.includes(query) ||
            symbol.includes(query) ||
            atomicNumber === query;


        cell.style.opacity =
            matches
                ? "1"
                : "0.15";


        cell.style.filter =
            matches
                ? "none"
                : "grayscale(1)";

    });

}


/* =========================================================
13. RÉAFFICHER TOUS LES ÉLÉMENTS
========================================================= */

function showAllElements() {

    const cells =
        document.querySelectorAll(
            ".periodic-table .element"
        );


    cells.forEach(cell => {

        cell.style.opacity = "1";

        cell.style.filter = "none";

    });

}


/* =========================================================
14. LÉGENDE DÉPLIABLE
========================================================= */

const legend =
    document.querySelector(".legend");

const legendToggle =
    document.getElementById("legend-toggle");


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


/* =========================================================
15. DÉMARRAGE D'ATOMIA
========================================================= */

loadData();
