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



                <div class="stato-capitolo">

                    <div class="progresso-capitolo">
                    </div>

                </div>


            </div>



            <div class="parti" style="display:none"></div>


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


        stato.innerHTML = `

        ${partiLette}/${totaleParti}

        `;

        cap.parti.forEach(parte => {


            let elementoParte =
                document.createElement("p");

            elementoParte.innerHTML = `

                <span class="stato ${stato}">
                </span>

                <a href="lettura.html?id=${parte.id}">
                    Parte ${parte.id}
                </a>

            `;


            listaParti.appendChild(elementoParte);


        });



        elementoCapitolo
            .querySelector(".card-capitolo")
            .onclick = function() {


            let aperto =
                listaParti.style.display === "block";


           if (aperto) {

                listaParti.style.display="none";

                elementoCapitolo.classList.remove("aperto");

                salvaCapitoloAperto(null);

            }
            else {

                chiudiTutti();

                listaParti.style.display="block";

                elementoCapitolo.classList.add("aperto");

                salvaCapitoloAperto(cap.id);

            }


        };



        contenitore.appendChild(elementoCapitolo);



        // ripristino stato precedente

        if (cap.id === capitoloAperto) {

            listaParti.style.display = "block";

        }


    });

}



function chiudiTutti() {


    document.querySelectorAll(".parti")
    .forEach(p => {

        p.style.display = "none";

    });

    document.querySelectorAll(".capitolo")
    .forEach(c=>{
        c.classList.remove("aperto");
    });
}



creaIndice();