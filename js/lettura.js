const parametri = new URLSearchParams(
    window.location.search
);


const idParte =
    parametri.get("id");



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



async function caricaPartiCapitolo(file){

    let testo =
        await caricaTesto(file);


    let sezioni =
        testo.split("---");


    return sezioni.map((sezione,index)=>{

        return {
            numero:index+1,
            testo:sezione.trim()
        };

    });

}

async function avvia(){    

    let interludio =
        romanzo.find(
            cap => cap.id === idParte && cap.tipo === "interludio"
        );


    if(interludio){

        mostraInterludio(interludio);

        return;

    }

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
    risultato.parte.testo;
    
    let blocchi =
        testo.split(/\n\s*\n/);

           

    let contenuto =
        testo
        .replace(/\r\n/g,"\n")
        .replace(/\n\n\n+/g,"\n\n[STACCO]\n\n")
        .split(/\n\n/)
        .map(blocco=>{

            if(blocco === "[STACCO]"){
                return "<div class='stacco'></div>";
            }

            return "<p>" +
                blocco.replace(/\n/g," ") +
                "</p>";

        })
        .join("");

    
    document.getElementById("testo").innerHTML = contenuto;

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


    if(pulsanteTema){


        pulsanteTema.textContent =
            tipo === "chiaro"
            ?
            "☀"
            :
            "☾";


    }


}

function mostraInterludio(interludio){


    document.getElementById("titolo-capitolo")
    .textContent =
    interludio.titolo;


    document.getElementById("titolo-parte")
    .textContent =
    "";


    let testo =
        interludio.parti[0].testo;


    let contenuto =
        testo
        .trim()
        .replace(/\r\n/g,"\n")
        .replace(/\n\n\n+/g,"\n\n")
        .split(/\n\n/)
        .map(blocco=>{

            return "<p>" +
                blocco.replace(/\n/g," ") +
                "</p>";

        })
        .join("");


    document.getElementById("testo")
    .innerHTML =
    contenuto;

    let indice =
    romanzo.findIndex(
        cap => cap.id === interludio.id
    );


    let precedente =
        romanzo[indice - 1];


    let successiva =
        romanzo[indice + 1];

    document.querySelectorAll(".precedente")
    .forEach(bottone=>{

        if(precedente){

            let parte =
                precedente.parti[
                    precedente.parti.length - 1
                ];

            bottone.href =
                "lettura.html?id=" + parte.id;

            bottone.style.visibility="visible";

        }
        else{

            bottone.style.visibility="hidden";

        }

    });


    document.querySelectorAll(".continua")
    .forEach(bottone=>{

        if(successiva){

            let parte =
                successiva.parti[0];

            bottone.textContent =
                "Continua →";

            bottone.href =
                "lettura.html?id=" + parte.id;

        }
        else{

            bottone.textContent =
                "Fine";

            bottone.href =
                "capitoli.html";

        }

    });

    document.querySelectorAll(".continua")
    .forEach(bottone => {

        bottone.onclick = function(){

            completaParte(interludio.id);

        };

    }); 
}

inizializzaControlliLettura();


(async function(){

    await caricaRomanzo();

    avvia();

})();