const contenitore = document.getElementById("indice");

let capitoloAperto = getCapitoloAperto();


function creaIndice() {

    romanzo.forEach(cap => {


        let elementoCapitolo = document.createElement("div");

        elementoCapitolo.className = "capitolo";


        elementoCapitolo.dataset.id = cap.id;



        elementoCapitolo.innerHTML = `

            <div class="testata-capitolo">

                <button class="freccia">
                    +
                </button>

                <span>
                    Capitolo ${cap.numero} - ${cap.titolo}
                </span>

            </div>


            <div class="parti" style="display:none"></div>

        `;



        let listaParti =
            elementoCapitolo.querySelector(".parti");


        cap.parti.forEach(parte => {


            let stato = statoParte(parte.id);


            let simbolo = "○";

            if (stato === "letto") {
                simbolo = "✓";
            }

            if (stato === "lettura") {
                simbolo = "▶";
            }


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



        let pulsante =
            elementoCapitolo.querySelector(".freccia");



        pulsante.onclick = function() {

            let aperto = listaParti.style.display === "block";


            if (aperto) {

                // chiudo il capitolo corrente

                listaParti.style.display = "none";
                pulsante.textContent = "+";

                salvaCapitoloAperto(null);

            } 
            
            else {

                // chiudo gli altri capitoli

                chiudiTutti();


                // apro questo

                listaParti.style.display = "block";
                pulsante.textContent = "-";

                salvaCapitoloAperto(cap.id);

            }

        };



        contenitore.appendChild(elementoCapitolo);



        // ripristino stato precedente

        if (cap.id === capitoloAperto) {

            listaParti.style.display = "block";

            pulsante.textContent = "-";

        }


    });

}



function chiudiTutti() {


    document.querySelectorAll(".parti")
    .forEach(p => {

        p.style.display = "none";

    });



    document.querySelectorAll(".freccia")
    .forEach(f => {

        f.textContent = "+";

    });

}



creaIndice();