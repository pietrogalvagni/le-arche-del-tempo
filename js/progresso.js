function getProgresso() {

    let dati = localStorage.getItem("progresso");

    if (dati === null) {

        return {
            lette: [],
            capitoloAperto: null
        };

    }

    return JSON.parse(dati);

}



function salvaProgresso(progresso) {

    localStorage.setItem(
        "progresso",
        JSON.stringify(progresso)
    );

}



// restituisce true/false
function parteLetta(idParte) {

    let progresso = getProgresso();

    return progresso.lette.includes(idParte);

}



// segna una parte come completata
function completaParte(idParte) {
 console.log("SALVO PARTE:", idParte);
    let progresso = getProgresso();


    if (!progresso.lette.includes(idParte)) {

        progresso.lette.push(idParte);

    }


    salvaProgresso(progresso);

}



// stato visuale della parte
function statoParte(idParte) {

    if (parteLetta(idParte)) {

        return "letto";

    }

    return "vuoto";

}



// stato visuale del capitolo
function statoCapitolo(capitolo) {

    let tutteLette = capitolo.parti.every(
        parte => parteLetta(parte.id)
    );


    if (tutteLette) {

        return "letto";

    }


    let almenoUna =
        capitolo.parti.some(
            parte => parteLetta(parte.id)
        );


    if (almenoUna) {

        return "lettura";

    }


    return "vuoto";

}



// trova la prima parte non letta
function trovaPuntoLettura(capitoli) {


    for (let capitolo of capitoli) {


        for (let parte of capitolo.parti) {


            if (!parteLetta(parte.id)) {

                return parte;

            }

        }

    }


    return null;

}



// gestione capitolo aperto nell'indice
function salvaCapitoloAperto(idCapitolo) {

    let progresso = getProgresso();

    progresso.capitoloAperto = idCapitolo;

    salvaProgresso(progresso);

}



function getCapitoloAperto() {

    let progresso = getProgresso();

    return progresso.capitoloAperto;

}