const ADMIN_MODE = "modalita_admin";

function renderTabellaLimitata(
    dati,
    tabella,
    creaRiga,
    numeroColonne,
    limite = 10
){

    tabella.innerHTML = "";


    let datiVisibili =
        dati.slice(
            0,
            limite
        );


    for(let elemento of datiVisibili){

        tabella.appendChild(
            creaRiga(elemento)
        );

    }


    if(dati.length <= limite){

        return;

    }


    let rigaMostra =
        document.createElement("tr");

    rigaMostra.className =
        "mostra-tutto-tabella";


    rigaMostra.innerHTML = `
        <td colspan="${numeroColonne}">
            Mostra tutti (${dati.length})
        </td>
    `;


    rigaMostra.onclick = function(){

        rigaMostra.remove();


        for(
            let i = limite;
            i < dati.length;
            i++
        ){

            tabella.appendChild(
                creaRiga(
                    dati[i]
                )
            );

        }

    };


    tabella.appendChild(
        rigaMostra
    );

}

function aggiornaStato(){

    let attiva =
        localStorage.getItem(
            ADMIN_MODE
        ) === "true";


    document.getElementById(
        "stato-admin"
    ).textContent =
        attiva
        ? "Modalità admin attiva"
        : "Modalità admin disattiva";

}

async function caricaVisite(){

    let { data, error } =
        await supabaseClient
        .from("visite")
        .select("*");


    if(error){

        console.error(
            "Errore caricamento visite:",
            error
        );

        return [];

    }


    return data;

}

function calcolaStatisticheGenerali(visite){

    let visitatori =
        new Set(
            visite.map(
                visita => visita.visitor_token
            )
        );


    return {

        visitatoriUnici:
            visitatori.size,

        eventiTotali:
            visite.length

    };

}

function mostraStatisticheGenerali(statistiche){

    document.getElementById(
        "numero-visitatori"
    ).textContent =
        statistiche.visitatoriUnici;


    document.getElementById(
        "numero-eventi"
    ).textContent =
        statistiche.eventiTotali;

}

document.getElementById(
    "attiva-admin"
)
.onclick = function(){

    localStorage.setItem(
        ADMIN_MODE,
        "true"
    );


    aggiornaStato();

};



document.getElementById(
    "disattiva-admin"
)
.onclick = function(){

    localStorage.removeItem(
        ADMIN_MODE
    );


    aggiornaStato();

};

function calcolaVisitePerPagina(visite){

    let pagine =
        new Map();


    for(let visita of visite){

        if(
            !pagine.has(
                visita.pagina
            )
        ){

            pagine.set(
                visita.pagina,
                new Set()
            );

        }


        pagine
            .get(visita.pagina)
            .add(visita.visitor_token);

    }


    return Array.from(
        pagine,
        ([pagina, visitatori]) => {

            return {

                pagina:
                    pagina,

                visite:
                    visitatori.size

            };

        }
    )
    .sort(
        (a, b) =>
            b.visite - a.visite
    );

}

function mostraVisitePerPagina(pagine){

    let tabella =
        document.getElementById(
            "tabella-pagine"
        );


    tabella.innerHTML = "";


    for(let pagina of pagine){

        let riga =
            document.createElement("tr");


        riga.innerHTML = `
            <td>
                ${pagina.pagina}
            </td>

            <td>
                ${pagina.visite}
            </td>
        `;


        tabella.appendChild(
            riga
        );

    }

}


function calcolaVisitePerUtente(visite){

    let visitatori =
        {};


    for(let visita of visite){

        let token =
            visita.visitor_token;


        if(!visitatori[token]){

            visitatori[token] = 0;

        }


        visitatori[token]++;

    }


    return Object.entries(
        visitatori
    )
    .map(
        ([token, visite]) => {

            return {

                token:
                    token,

                visite:
                    visite

            };

        }
    )
    .sort(
        (a, b) =>
            b.visite - a.visite
    );

}

function mostraVisitePerUtente(visitatori){

    let tabella =
        document.getElementById(
            "tabella-visitatori"
        );


    renderTabellaLimitata(
        visitatori,
        tabella,
        creaRigaVisitatore,
        2
    );

}

function creaRigaVisitatore(visitatore){

    let riga =
        document.createElement("tr");


    riga.innerHTML = `
        <td>
            ${visitatore.token}
        </td>

        <td>
            ${visitatore.visite}
        </td>
    `;


    return riga;

}





async function avviaDashboard(){

    aggiornaStato();


    let visite =
        await caricaVisite();


    let statistiche =
        calcolaStatisticheGenerali(
            visite
        );


    mostraStatisticheGenerali(
        statistiche
    );

    let visitePerPagina =
        calcolaVisitePerPagina(
            visite
        );


    mostraVisitePerPagina(
        visitePerPagina
    );

    let visitePerUtente =
        calcolaVisitePerUtente(
            visite
        );


    mostraVisitePerUtente(
        visitePerUtente
    );

}


avviaDashboard();