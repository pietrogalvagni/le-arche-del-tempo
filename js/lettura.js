const parametri = new URLSearchParams(
    window.location.search
);


const idParte =
    parametri.get("id");
console.log("ID parte:", idParte);


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

    let contenuto =
        testo
        .split(/\n\s*\n/)
        .map(paragrafo => {

            return `<p>${paragrafo.trim()}</p>`;

        })
        .join("");

    document.getElementById("testo")
    .innerHTML = contenuto;



    let precedente =
        risultato.precedente;

    let successiva =
        risultato.successiva

    let bottoniPrecedente =
    document.querySelectorAll(".precedente");


    bottoniPrecedente.forEach(bottone => {


        if (precedente) {

            bottone.href =
                "lettura.html?id=" + precedente.id;

            bottone.style.visibility = "visible";

        }

        else {

            bottone.style.visibility = "hidden";

        }


    });

    let bottoniContinua =
        document.querySelectorAll(".continua");



    bottoniContinua.forEach(bottone => {


        if (successiva) {


            bottone.textContent =
                "Continua →";


            bottone.href =
                "lettura.html?id=" + successiva.id;


            bottone.onclick=function(){

                completaParte(idParte);

            };


        }

        else {


            bottone.textContent =
                "Fine";


            bottone.href =
                "capitoli.html";


            bottone.onclick=function(){

                completaParte(idParte);

            };


        }


    });

}

function inizializzaControlliLettura(){


    let fontSalvato =
        localStorage.getItem("font-lettura")
        ||
        "medio";


    applicaFont(fontSalvato);



    document.querySelectorAll("[data-font]")
    .forEach(bottone=>{


        bottone.onclick=function(){


            applicaFont(
                this.dataset.font
            );


        };


    });



    let temaSalvato =
        localStorage.getItem("tema-lettura")
        ||
        "scuro";


    applicaTema(temaSalvato);



    document
        .getElementById("tema")
        .onclick=function(){


        let lettore =
            document.getElementById("lettore");


        let nuovoTema =
            lettore.classList.contains("tema-chiaro")
            ?
            "scuro"
            :
            "chiaro";


        applicaTema(nuovoTema);


    };


}



function applicaFont(tipo){


    document.body.classList.remove(
        "font-piccolo",
        "font-medio",
        "font-grande"
    );


    document.body.classList.add(
        "font-" + tipo
    );


    localStorage.setItem(
        "font-lettura",
        tipo
    );



    document
    .querySelectorAll("[data-font]")
    .forEach(b=>{


        b.classList.toggle(
            "attivo",
            b.dataset.font === tipo
        );


    });


}



function applicaTema(tipo){


   document
    .getElementById("lettore")
    .classList.toggle(
        "tema-chiaro",
        tipo === "chiaro"
    );


    localStorage.setItem(
        "tema-lettura",
        tipo
    );


    let pulsanteTema =
        document.getElementById("tema");

    console.log(pulsanteTema);
    if(pulsanteTema){


        pulsanteTema.textContent =
            tipo === "chiaro"
            ?
            "☀"
            :
            "☾";


    }


}



inizializzaControlliLettura();

avvia();