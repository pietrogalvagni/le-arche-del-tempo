let romanzo = [];


async function caricaRomanzo(){

    let risposta =
        await fetch("testi/romanzo.md");


    let testo =
        await risposta.text();


    romanzo =
        analizzaRomanzo(testo);


    console.log(romanzo);

}



function analizzaRomanzo(testo){


    let blocchiCapitolo =
        testo.split("# CAPITOLO")
        .slice(1);



    let capitoli = [];



    blocchiCapitolo.forEach(
    (blocco,index)=>{


        let parti =
            blocco.split("<!-- PARTE -->");


        let intestazione =
            parti[0];



        let contenuto =
            parti.slice(1);



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



        contenuto.forEach(
        (testoParte,i)=>{


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


    let righe =
        testo.split("\n");


    let dati={};



    righe.forEach(riga=>{


        if(riga.includes(":")){


            let [chiave,valore]=
            riga.split(":");


            dati[chiave.trim()]
            =
            valore.trim();


        }


    });



    return dati;


}

