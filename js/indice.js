const contenitore = document.getElementById("indice");

let capitoloAperto = getCapitoloAperto();


function creaIndice(){

    contenitore.innerHTML = "";


    let wrapper =
        document.createElement("div");

    wrapper.className =
        "indice-wrapper";


    let lista =
        document.createElement("div");

    lista.className =
        "indice-collassabile";


    wrapper.appendChild(
        lista
    );


    contenitore.appendChild(
        wrapper
    );


    for(let cap of romanzo){

        if(cap.tipo === "interludio"){

            creaCardInterludio(
                cap,
                lista
            );

        }
        else{

            creaCardCapitolo(
                cap,
                lista
            );

        }

    }


    if(romanzo.length > 6){

        let mostra =
            document.createElement("div");

        mostra.className =
            "mostra-tutti";


        mostra.innerHTML = `
            <div class="espandi-indice">
                <span>Mostra tutti</span>
            </div>
        `;


        wrapper.appendChild(
            mostra
        );


        mostra.onclick = function(){

            lista.classList.add("aperto");

            mostra.remove();

        }

    }

}

function creaCardInterludio(
    cap,
    contenitoreIndice
){

    let elemento =
        document.createElement("div");

    elemento.className="interludio";


    elemento.innerHTML = `

        <div class="card card-interludio">

            <img 
                class="immagine-interludio"
                src="${cap.immagine}"
                alt="${cap.titolo}"
            >

            <div class="info-interludio">

                <h3>Interludio</h3>

                <h2>
                    ${cap.titolo}
                </h2>

            </div>

            <div class="progresso-interludio">
            </div>

        </div>

    `;


    let stato =
        elemento.querySelector(
            ".progresso-interludio"
        );


    if(parteLetta(cap.id)){

        stato.innerHTML=`
            <div class="icona-progresso letto">
                ✓
            </div>
        `;

    }


    elemento
    .querySelector(".card-interludio")
    .onclick=function(){

        window.location.href =
            "lettura.html?id=" + cap.id;

    };


    contenitoreIndice.appendChild(elemento);

}

function aggiornaProgressoCapitolo(elemento, cap){

    let partiLette =
        cap.parti.filter(
            parte => parteLetta(parte.id)
        ).length;


    let totaleParti =
        cap.parti.length;


    let stato =
        elemento.querySelector(".progresso-capitolo");


    let statoCap =
        statoCapitolo(cap);


    let icona="";


    if(statoCap==="letto"){
        icona="✓";
    }
    else if(statoCap==="lettura"){
        icona="▶";
    }


    stato.innerHTML=`

        <div class="icona-progresso ${statoCap}">
            ${icona}
        </div>

        <div>
            ${partiLette}/${totaleParti}
        </div>

    `;

}

function creaCardCapitolo(
    cap,
    contenitoreIndice
){

    let elemento =
        document.createElement("div");


    elemento.className="capitolo";

    elemento.dataset.id=cap.id;


    elemento.innerHTML=`

        <div class="card card-capitolo">

            <img 
                class="immagine-capitolo"
                src="${cap.immagine}"
                alt="${cap.titolo}"
            >

            <div class="info-capitolo">

                <h3>
                    Capitolo ${cap.numero}
                </h3>

                <h2>
                    ${cap.titolo}
                </h2>

                <p>
                    ${cap.descrizione}
                </p>

            </div>

            <div class="progresso-capitolo">
            </div>

        </div>

        <div class="parti"></div>

    `;


    aggiornaProgressoCapitolo(
        elemento,
        cap
    );

    creaPartiCapitolo(
        elemento,
        cap
    );


    gestisciAperturaCapitolo(
        elemento,
        cap
    );


    contenitoreIndice.appendChild(elemento);


    if(cap.id === capitoloAperto){

        elemento
        .querySelector(".parti")
        .classList.add("aperta");

    }

}

function creaPartiCapitolo(elemento, cap){

    let lista =
        elemento.querySelector(".parti");


    cap.parti.forEach((parte,index)=>{

        let scheda =
            document.createElement("div");


        scheda.className="scheda-parte";


        let simbolo =
            statoParte(parte.id)==="letto"
            ? "✓"
            : "";


        scheda.innerHTML=`

            <span>
                Parte ${index+1}
            </span>

            <span class="stato">
                ${simbolo}
            </span>

        `;


        scheda.onclick=function(e){

            e.stopPropagation();

            window.location.href =
                "lettura.html?id=" + parte.id;

        };


        lista.appendChild(scheda);

    });


}

function gestisciAperturaCapitolo(elemento, cap){

    let card =
        elemento.querySelector(".card-capitolo");


    let lista =
        elemento.querySelector(".parti");


    card.onclick=function(){

        let aperto =
            lista.classList.contains("aperta");


        if(aperto){

            lista.classList.remove("aperta");

            card.classList.remove("aperta");

            salvaCapitoloAperto(null);

        }
        else{

            chiudiTutti();

            lista.classList.add("aperta");

            card.classList.add("aperta");

            salvaCapitoloAperto(cap.id);

        }

    };

}

function chiudiTutti(){

    document.querySelectorAll(".parti")
        .forEach(p=>{
        p.classList.remove("aperta");
    });

}


