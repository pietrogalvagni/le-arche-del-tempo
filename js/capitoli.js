const azione =
    document.getElementById("azione-lettura");


const barra =
    document.getElementById("progresso-lettura");



function aggiornaProgresso(){


    let totale = 0;
    let lette = 0;



    romanzo.forEach(capitolo => {


        capitolo.parti.forEach(parte => {


            totale++;


            if(parteLetta(parte.id)){

                lette++;

            }


        });


    });



    let percentuale = 0;


    if(totale > 0){

        percentuale =
        Math.round((lette / totale) * 100);

    }



    barra.innerHTML = `

        Il tuo viaggio:
        ${percentuale}%

    `;

}



function creaBottoneLettura(){


    let punto =
        trovaPuntoLettura(romanzo);



    let bottone =
        document.createElement("a");
    bottone.className = "button";


    if(punto === null){


        bottone.textContent =
        "Rileggi il romanzo";


        bottone.href =
        "lettura.html?id=" + romanzo[0].parti[0].id;


    }


    else if(
        getProgresso().lette.length === 0
    ){


        bottone.textContent =
        "Inizia a leggere";


        bottone.href =
        "lettura.html?id=" + punto.id;


    }


    else {


        bottone.textContent =
        "Continua a leggere";


        bottone.href =
        "lettura.html?id=" + punto.id;


    }



    azione.appendChild(bottone);

}



aggiornaProgresso();

creaBottoneLettura();
