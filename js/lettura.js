const parametri = new URLSearchParams(
    window.location.search
);


const idParte =
    parametri.get("id");
console.log("ID parte:", idParte);

let bottonePrecedente =
    document.getElementById("precedente");


if (precedente) {

    bottonePrecedente.href =
        "lettura.html?id=" + precedente.id;

}

else {

    bottonePrecedente.style.visibility = "hidden";

}


function trovaParte(id) {


    for(let capitolo of romanzo){

        for(let parte of capitolo.parti){

            if(parte.id === id){

                return {
                    capitolo: capitolo,
                    parte: parte
                };

            }

        }

    }


    return null;

}



function trovaParte(id) {

    for (let i = 0; i < romanzo.length; i++) {

        let capitolo = romanzo[i];

        for (let j = 0; j < capitolo.parti.length; j++) {

            let parte = capitolo.parti[j];

            if (parte.id === id) {

                let precedente = null;
                let successiva = null;

                // parte precedente

                if (j > 0) {

                    precedente = capitolo.parti[j - 1];

                }

                else if (i > 0) {

                    let capitoloPrecedente = romanzo[i - 1];

                    precedente =
                        capitoloPrecedente.parti[
                            capitoloPrecedente.parti.length - 1
                        ];

                }


                // parte successiva

                if (j < capitolo.parti.length - 1) {

                    successiva = capitolo.parti[j + 1];

                }

                else if (i < romanzo.length - 1) {

                    successiva = romanzo[i + 1].parti[0];

                }


                return {

                    capitolo: capitolo,
                    parte: parte,
                    precedente: precedente,
                    successiva: successiva

                };

            }

        }

    }

    return null;

}



async function caricaTesto(file){


    let risposta =
        await fetch(file);


    return await risposta.text();

}



async function avvia(){


    let risultato =
        trovaParte(idParte);



    if(!risultato){

        document.getElementById("testo")
        .innerHTML="Parte non trovata";

        return;

    }



    document.getElementById("titolo-capitolo")
    .textContent =
    "Capitolo " +
    risultato.capitolo.numero +
    " - " +
    risultato.capitolo.titolo;



    document.getElementById("titolo-parte")
    .textContent =
    "Parte " + risultato.parte.id;



    let testo =
        await caricaTesto(
            risultato.parte.file
        );


    document.getElementById("testo")
    .innerHTML = testo;



    let precedente =
        risultato.precedente;

    let successiva =
        risultato.successiva

    let bottonePrecedente =
        document.getElementById("precedente");


    if (precedente) {

        bottonePrecedente.href =
            "lettura.html?id=" + precedente.id;

    }

    else {

        bottonePrecedente.style.visibility = "hidden";

    }

    let bottoneContinua =
        document.getElementById("continua");



    if (successiva) {

        bottoneContinua.textContent = "Continua →";

        bottoneContinua.href =
            "lettura.html?id=" + successiva.id;

        bottoneContinua.onclick = function () {

            completaParte(idParte);

        };

    }

    else {

        bottoneContinua.textContent = "Fine";

        bottoneContinua.href = "capitoli.html";

        bottoneContinua.onclick = function () {

            completaParte(idParte);

        };

    }

}



avvia();