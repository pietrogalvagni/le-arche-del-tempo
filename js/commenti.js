let commenti = [];


async function caricaCommenti(){


    let risposta =
        await fetch("dati/commenti.json");


    commenti =
        await risposta.json();

}

function creaAreaCommenti(idCapitolo){


    let contenitore =
        document.createElement("section");


    contenitore.className="commenti";

    let lista =
        commenti.filter(
            c => c.id_capitolo == idCapitolo
        );
  
    contenitore.innerHTML = `

        <h2>
            Commenti al capitolo
        </h2>


        <div class="lista-commenti">

            ${
                lista.length
                ?
                lista.map(c => `

                    <div class="commento">

                        <strong>
                            ${c.nome || "Anonimo"}
                        </strong>

                        <small>
                            ${new Date(c.timestamp).toLocaleString("it-IT")}
                        </small>

                        <p>
                            ${c.testo}
                        </p>

                    </div>

                `).join("")
                :
                "<p>Nessun commento ancora.</p>"
            }

        </div>


        <form class="form-commento">

            <input
                class="nome-commento"
                placeholder="Nome (facoltativo)"
            >


            <textarea
                class="testo-commento"
                placeholder="Scrivi un commento..."
            ></textarea>


            <button class="button">
                Invia commento
            </button>

        </form>

    `;


    let form =
    contenitore.querySelector(".form-commento");


    form.addEventListener("submit", function(e){

        e.preventDefault();


        let nome =
            contenitore.querySelector(".nome-commento")
            .value;


        let testo =
            contenitore.querySelector(".testo-commento")
            .value;


        let nuovoCommento = {

            id_capitolo: idCapitolo,

            nome:
                nome || "Anonimo",

            testo: testo,

            timestamp:
                new Date().toISOString()

        };

        if(testo.trim().length < 3){

            alert("Commento troppo breve");

            return;

        }


        if(testo.length > 1000){

            alert("Commento troppo lungo");

            return;

        }

        let elemento =
            creaElementoCommento(nuovoCommento);


        listaCommenti.appendChild(elemento);


        form.reset();

    });

    let listaCommenti =
        contenitore.querySelector(".lista-commenti");

    return contenitore;

}

function creaElementoCommento(c){

    let div =
        document.createElement("div");


    div.className="commento";


    div.innerHTML = `

        <strong>
            ${c.nome}
        </strong>


        <small>
            ${new Date(c.timestamp).toLocaleString("it-IT")}
        </small>


        <p>
            ${c.testo}
        </p>

    `;


    return div;

}