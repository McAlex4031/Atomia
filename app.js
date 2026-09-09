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

/*
   Cette fonction permet de récupérer les données
   depuis les fichiers JSON.

   Les fichiers sont à la racine du projet :

   elements.json
   ions.json
   nuclides-1.json
   nuclides-2.json
   nuclides-3.json
   nuclides-4.json
*/

async function loadData() {

    try {

        console.log("⚛️ Chargement d'ATOMIA...");


        /* -------------------------------------------------
           ÉLÉMENTS
           ------------------------------------------------- */

        const elementsResponse =
            await fetch("elements.json");


        /*
           response.ok vérifie que le fichier existe
           et que le serveur l'a correctement envoyé.
        */

        if (!elementsResponse.ok) {

            throw new Error(
                `elements.json : HTTP ${elementsResponse.status}`
            );
        }


        /*
           On transforme la réponse en véritable
           tableau JavaScript.

           C'était cette étape qui manquait dans ton code.
        */

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


        /*
           Même chose pour les ions.
        */

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


        /*
           On demande les 4 fichiers en même temps.

           Promise.all() attend que les 4 fichiers
           soient chargés.
        */

        const nuclideResponses =
            await Promise.all(

                nuclideFiles.map(
                    file => fetch(file)
                )

            );


        /*
           On vérifie que les 4 fichiers existent.
        */

        nuclideResponses.forEach(
            (response, index) => {

                if (!response.ok) {

                    throw new Error(
                        `${nuclideFiles[index]} : HTTP ${response.status}`
                    );
                }

            }
        );


        /*
           On transforme les 4 réponses en JSON.
        */

        const nuclideData =
            await Promise.all(

                nuclideResponses.map(
                    response => response.json()
                )

            );


        /*
           nuclideData contient maintenant 4 tableaux.

           Exemple :

           [
               [nucléides 1],
               [nucléides 2],
               [nucléides 3],
               [nucléides 4]
           ]

           flat() rassemble tout en un seul tableau.
        */

        nuclides =
            nuclideData.flat();


        /* -------------------------------------------------
           INFORMATIONS DE DEBUG
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

        /*
           Si quelque chose ne fonctionne pas,
           l'erreur exacte apparaît dans la console.
        */

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

    // On vide le tableau avant de le reconstruire
    periodicTable.innerHTML = "";


    /*
       On parcourt les 118 éléments.

       forEach() exécute la fonction une fois
       pour chaque élément.
    */

    elements.forEach(element => {

        // Création d'une nouvelle case
        const cell =
            document.createElement("div");


        /*
           On ajoute les classes CSS.

           Exemple :

           class="element transition-metal"
        */

        cell.classList.add(
            "element",
            element.category
        );


        /* -------------------------------------------------
           POSITION DANS LA GRILLE
           ------------------------------------------------- */

        /*
           group = colonne
           period = ligne
        */

        if (element.group) {

            cell.style.gridColumn =
                element.group;
        }

        if (element.period) {

            cell.style.gridRow =
                element.period;
        }


        /* -------------------------------------------------
           LANTHANIDES
           ------------------------------------------------- */

        if (
            element.category === "lanthanide"
        ) {

            const position =
                getFBlockPosition(element);

            cell.style.gridColumn =
                position;

            cell.style.gridRow = 8;
        }


        /* -------------------------------------------------
           ACTINIDES
           ------------------------------------------------- */

        if (
            element.category === "actinide"
        ) {

            const position =
                getFBlockPosition(element);

            cell.style.gridColumn =
                position;

            cell.style.gridRow = 9;
        }


        /* -------------------------------------------------
           CONTENU DE LA CASE
           ------------------------------------------------- */

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


        /* -------------------------------------------------
           CLIC
           ------------------------------------------------- */

        cell.addEventListener(
            "click",
            () => {

                showElement(element);

            }
        );


        /* -------------------------------------------------
           ACCESSIBILITÉ CLAVIER
           ------------------------------------------------- */

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


        /* -------------------------------------------------
           AJOUT AU TABLEAU
           ------------------------------------------------- */

        periodicTable.appendChild(cell);

    });
}


/* =========================================================
   4. POSITION DES LANTHANIDES / ACTINIDES
   ========================================================= */

function getFBlockPosition(element) {

    /*
       Les lanthanides vont de La à Lu.

       Les actinides vont de Ac à Lr.

       On commence à la colonne 4.
    */


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

    /* -----------------------------------------------------
       NUCLÉIDES
       ----------------------------------------------------- */

    const elementNuclides =
        nuclides.filter(nuclide => {

            /*
               Pour l'instant, on cherche le symbole
               dans "element" ou "symbol".

               Si tes fichiers nucléides ne contiennent
               pas ces propriétés, ils seront simplement
               absents de cette liste.
            */

            return (
                nuclide.element === element.symbol ||
                nuclide.symbol === element.symbol
            );

        });


    /* -----------------------------------------------------
       IONS
       ----------------------------------------------------- */

    const elementIons =
        ions.filter(
            ion =>
                ion.element === element.symbol
        );


    /* -----------------------------------------------------
       CONSTRUCTION DE LA FICHE
       ----------------------------------------------------- */

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


        <div class="element-info">


            <div class="info-card">

                <span>Symbole</span>

                <strong>
                    ${element.symbol}
                </strong>

            </div>


            <div class="info-card">

                <span>Numéro atomique</span>

                <strong>
                    ${element.atomicNumber}
                </strong>

            </div>


            <div class="info-card">

                <span>Masse atomique</span>

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


        <div class="element-section">

            <h3>
                ☢️ Nucléides
            </h3>

            <div class="nuclide-list">

                ${
                    createNuclideList(
                        elementNuclides
                    )
                }

            </div>

        </div>


        <div class="element-section">

            <h3>
                ⚡ Ions
            </h3>

            <div class="ion-list">

                ${
                    createIonList(
                        elementIons
                    )
                }

            </div>

        </div>


        <button
            class="close-element"
            id="close-element">

            Fermer

        </button>

    `;


    /* -----------------------------------------------------
       AFFICHAGE
       ----------------------------------------------------- */

    elementView.classList.remove(
        "hidden"
    );


    /* -----------------------------------------------------
       BOUTON FERMER
       ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       DÉFILEMENT VERS LA FICHE
       ----------------------------------------------------- */

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


    /*
       Tri par nombre de masse.
    */

    const sorted =
        [...list].sort(
            (a, b) =>
                a.massNumber -
                b.massNumber
        );


    return sorted
        .map(nuclide => {

            /*
               Nombre de protons.

               Dans ton format actuel,
               "protons" existe normalement.
            */

            const protons =
                nuclide.protons ??
                nuclide.atomicNumber;


            /*
               Les neutrons peuvent être :
               
               soit directement fournis,
               soit calculés avec :

               N = A - Z
            */

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


    /*
       Tri par charge.
    */

    const sorted =
        [...list].sort(
            (a, b) =>
                a.charge -
                b.charge
        );


    return sorted
        .map(ion => {

            /*
               Les protons correspondent toujours
               au numéro atomique.
            */

            const protons =
                ion.atomicNumber;


            /*
               Formule :

               électrons = Z - charge
            */

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


    /*
       Recherche vide :
       on réaffiche tout.
    */

    if (query === "") {

        showAllElements();

        return;
    }


    /*
       Récupération des cases du tableau.
    */

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


        /*
           La recherche fonctionne avec :

           - nom
           - symbole
           - numéro atomique
        */

        const matches =
            name.includes(query) ||
            symbol.includes(query) ||
            atomicNumber === query;


        /*
           Les éléments non correspondants
           deviennent très transparents.
        */

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
15. LÉGENDE DÉPLIABLE
========================================================= */

const legend =
    document.querySelector(".legend");

const legendToggle =
    document.getElementById("legend-toggle");


legendToggle.addEventListener(
    "click",
    () => {

        legend.classList.toggle("open");

    }
);


/* =========================================================
   14. DÉMARRAGE D'ATOMIA
   ========================================================= */

/*
   C'est ici que tout commence.

   JavaScript lance le chargement des données,
   puis construit automatiquement le tableau.
*/

loadData();
