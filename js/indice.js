const contenitore = document.getElementById("indice");

let capitoloAperto = getCapitoloAperto();


function creaIndice() {

    romanzo.forEach(cap => {

        let elementoCapitolo = document.createElement("div");

        elementoCapitolo.className = "capitolo";


        elementoCapitolo.dataset.id = cap.id;



        elementoCapitolo.innerHTML = `


            <div class="card-capitolo">


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



        let listaParti =
            elementoCapitolo.querySelector(".parti");
        
        let partiLette =
            cap.parti.filter(
                parte => parteLetta(parte.id)
            ).length;


        let totaleParti =
            cap.parti.length;



        let stato =
            elementoCapitolo.querySelector(".progresso-capitolo");


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

        cap.parti.forEach(parte => {
            
            let stato = statoParte(parte.id);

            let simbolo = "";

            if(stato === "letto"){
                simbolo = "✓";
            }


            let elementoParte=document.createElement("div");

            elementoParte.className="scheda-parte";

           elementoParte.innerHTML = `

                <span>
                    Parte ${parte.id}
                </span>

                <span class="stato">
                ${simbolo}
                </span>

            `;

            elementoParte.onclick=function(){

                window.location.href=
                "lettura.html?id=" + parte.id;

            };

            listaParti.appendChild(elementoParte);


        });



        elementoCapitolo
        .querySelector(".card-capitolo")
        .onclick=function(){

            let aperto=
            listaParti.classList.contains("aperta");


            if (aperto){

                listaParti.classList.remove("aperta");

                salvaCapitoloAperto(null);

            }

            else{

                chiudiTutti();

                listaParti.classList.add("aperta");

                salvaCapitoloAperto(cap.id);

            }

        };



        contenitore.appendChild(elementoCapitolo);



        // ripristino stato precedente

        if (cap.id === capitoloAperto) {

            listaParti.classList.add("aperta");

        }


    });

}


function chiudiTutti(){

    document.querySelectorAll(".parti")
        .forEach(p=>{
        p.classList.remove("aperta");
    });

}



creaIndice();