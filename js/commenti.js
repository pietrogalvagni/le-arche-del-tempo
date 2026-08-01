const SUPABASE_URL =
    "https://qddffigxxjvzvgdvsjkb.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_y4tJjA_JqALJs-X1PwJing_PzM1n3Cj";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


let commenti = [];

function aggiornaTitoloCommenti(
    contenitore,
    numero
){

    let titolo =
        contenitore.querySelector(
            ".titolo-commenti"
        );

    if (numero == 0) {
        titolo.textContent =
        "Commenti al capitolo";
    }
    else {
        titolo.textContent =
            "Commenti al capitolo (" +
            numero +
            ")";
    }

}

async function caricaCommentiCapitolo(idCapitolo){


    let { data, error } =
        await supabaseClient
        .from("commenti")
        .select("*")
        .eq(
            "id_capitolo",
            idCapitolo
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(error){

        console.error(
            "Errore caricamento commenti:",
            error
        );

        return [];

    }

    return data;

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

        <h2 class="titolo-commenti">
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
                            ${new Date(c.created_at).toLocaleString("it-IT")}
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
                class="campo-nome-commento"
                maxlength="30"
                placeholder="Nome"                
            >


            <textarea
                class="campo-testo-commento"
                maxlength="1000"
                placeholder="Scrivi un commento..." 
            ></textarea>
            
            <input
                class="campo-trappola"
                autocomplete="off"
                tabindex="-1"
            >

            <button class="button">
                Invia commento
            </button>

            <div class="esito-commento"></div>

        </form>

    `;


    let form =
    contenitore.querySelector(".form-commento");


    form.addEventListener("submit", async function(e){

        e.preventDefault();


        let nome =
            contenitore.querySelector(".campo-nome-commento")
            .value
            .trim();


        let testo =
            contenitore.querySelector(".campo-testo-commento")
            .value
            .trim();

        if(nome.length === 0){

            mostraEsito(
                contenitore,
                "Inserisci un nome o un nickname.",
                "errore"
            );

            return;

        }


        if(testo.length === 0){
            mostraEsito(
                contenitore,
                "Inserisci un commento.",
                "errore"
            );
            return;

        }

        if(nome.length > 30){
            mostraEsito(
                contenitore,
                "Nome troppo lungo.",
                "errore"
            );

            return;

        }


        if(testo.length > 1000){
            mostraEsito(
                contenitore,
                "Commento troppo lungo.",
                "errore"
            );

            return;

        }

        let trappola =
            contenitore
            .querySelector(".campo-trappola")
            .value;


        if(trappola.length > 0){

            console.log("Spam bloccato");

            return;

        }

        let ultimoInvio =
            localStorage.getItem(
                "ultimo-commento"
            );


        let adesso =
            Date.now();

        // cooldown 10 sec
        if (ultimoInvio && adesso - ultimoInvio < 10000){

            mostraEsito(
                contenitore,
                "Attend qualche secondo prima di inviare un altro commento.",
                "errore"
            );

            return;

        }
        
        // controllo duplicati
        let { data: esistenti } =
            await supabaseClient
            .from("commenti")
            .select("id")
            .eq(
                "id_capitolo",
                idCapitolo
            )
            .eq(
                "testo",
                testo
            );


        if(esistenti.length > 0){

            alert(
                "Hai già inviato questo commento."
            );

            return;

        }

        let { error } =
            await supabaseClient
            .from("commenti")
            .insert({

                id_capitolo: idCapitolo,

                nome:
                    nome || "Anonimo",

                testo: testo

            });



        if(error){

            console.error(
                "Errore invio commento:",
                error
            );

            return;

        }

        localStorage.setItem(
            "ultimo-commento",
            Date.now()
        );

        mostraEsito(
            contenitore,
            "✓ Commento pubblicato!",
            "successo"
        );  

        form.reset();


        aggiornaListaCommenti(
            idCapitolo,
            contenitore
        );


    });

    let listaCommenti =
        contenitore.querySelector(".lista-commenti");

    
    caricaCommentiCapitolo(idCapitolo)
        .then(commenti => {


        let lista =
            contenitore.querySelector(".lista-commenti");
        
        aggiornaTitoloCommenti(
            contenitore,
            commenti.length
        );

        lista.innerHTML = "";


        commenti.forEach(c => {


            let elemento =
                creaElementoCommento(c);


            lista.appendChild(elemento);


        });


    });
    
    return contenitore;

}

async function aggiornaListaCommenti(
    idCapitolo,
    contenitore
){

    let commenti =
        await caricaCommentiCapitolo(idCapitolo);

    let titolo =
        contenitore.querySelector(".titolo-commenti");


    if(titolo){

        aggiornaTitoloCommenti(
            contenitore,
            commenti.length
        );

    }

    let lista =
        contenitore.querySelector(
            ".lista-commenti"
        );



    lista.innerHTML = "";



    commenti.forEach(commento=>{

        lista.appendChild(
            creaElementoCommento(commento)
        );

    });

}

function creaElementoCommento(c){

    let div =
        document.createElement("div");


    div.className="commento";


    div.innerHTML = `

        <div class="intestazione-commento">

            <strong class="autore-commento">
                ${escapeHTML(c.nome)}
            </strong>

            <small class="data-commento">
                ${new Date(c.created_at).toLocaleString("it-IT")}
            </small>

        </div>


        <p class="testo-commento">
            ${escapeHTML(c.testo)}
        </p>

    `;


    return div;

}

function escapeHTML(testo){

    return testo
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function mostraEsito(contenitore,testo,tipo){

    let esito =
        contenitore.querySelector(".esito-commento");


    esito.textContent =
        testo;


    esito.classList.remove(
        "successo",
        "errore"
    );


    esito.classList.add(
        tipo
    );


    esito.classList.add(
        "visibile"
    );


    setTimeout(()=>{

        esito.classList.remove(
            "visibile"
        );

    },2500);

}