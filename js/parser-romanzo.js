let romanzo = [];

const PAROLE_PER_PARTE = 2000;

async function caricaRomanzo(){

    let risposta =
        await fetch("testi/romanzo.md");


    let testo =
        await risposta.text();


    romanzo =
        analizzaRomanzo(testo);


}



function analizzaRomanzo(testo){

    let blocchiCapitolo =
        testo.split("# CAPITOLO")
        .slice(1);


    let capitoli = [];


    blocchiCapitolo.forEach((blocco,index)=>{


        let sezioni =
            blocco.split("--- FINE METADATI ---");


        let intestazione =
            sezioni[0];


        let contenuto =
            sezioni[1] || "";


        contenuto =
            contenuto.replace(/\\n/g, "\n");



        let metadati =
            estraiMetadati(intestazione);



        let capitolo = {

            id:
            metadati.id,


            numero:
            index + 1,


            titolo:
            metadati.titolo,


            descrizione:
            metadati.descrizione,


            immagine:
            metadati.immagine,


            parti:[]

        };



       let parti =
            dividiInParti(contenuto);



        parti.forEach((testoParte,i)=>{


            capitolo.parti.push({

                id:
                capitolo.numero +
                "-" +
                (i+1),


                testo:
                testoParte.trim()

            });


        });



        capitoli.push(capitolo);


    });



    return capitoli;

}



function estraiMetadati(testo){


    let dati={};


    let righe =
        testo.split("\n");



    righe.forEach(riga=>{


        if(riga.includes(":")){


            let separatore =
            riga.indexOf(":");


            let chiave =
            riga.substring(0,separatore)
            .trim();



            let valore =
            riga.substring(separatore+1)
            .trim();



            dati[chiave]=valore;


        }


    });


    return dati;

}


function dividiInParti(testo, limite = PAROLE_PER_PARTE){

    let blocchi =
        testo.split(/(\n\s*\n)/);


    let parti = [];

    let parteCorrente = "";

    let paroleCorrenti = 0;


    blocchi.forEach(blocco => {


        if(blocco.trim().length === 0){

            parteCorrente += blocco;

            return;

        }


        let paroleBlocco =
            blocco
            .trim()
            .split(/\s+/)
            .length;


        if(
            paroleCorrenti + paroleBlocco > limite &&
            parteCorrente.trim().length > 0
        ){

            parti.push(
                parteCorrente.trim()
            );


            parteCorrente = "";

            paroleCorrenti = 0;

        }


        parteCorrente += blocco;

        paroleCorrenti += paroleBlocco;


    });


    if(parteCorrente.trim().length > 0){

        parti.push(
            parteCorrente.trim()
        );

    }


    return parti;

}