


let commenti = [];

const TESTI_COMMENTI = {

    rispondi:
        "↩ Rispondi",

    annulla:
        "Annulla",

    elimina:
        "Elimina"
}

const COMMENTI_CONFIG = {
    cooldown: 10000,
    maxNome: 30,
    maxTesto: 1000
};

// ogni commento ha un "proprietario" che avrà diritti di cancellazione o modifica
function ottieniOwnerToken(){

    let token =
        localStorage.getItem(
            "owner-token"
        );

    if(!token){

        token =
            crypto.randomUUID();

        localStorage.setItem(
            "owner-token",
            token
        );

    }

    return token;

}

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

    
    let statoCommenti = {
        parentIdCorrente:null,
        bottoneAttivo:null
    };

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
        

        <div class="contenitore-form-commento"></div>


        <form class="form form-commento">

            <div class="destinazione-risposta"></div>

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

            <div class="azioni-commento">

                <button class="button">
                    Invia commento
                </button>

            </div>

            

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
            contenitore
            .querySelector(".campo-testo-commento")
            .value          
            .replace(/^[ \t]+|[ \t]+$/gm,"")  // rimuove gli spazi iniziali/finali di ogni riga            
            .trim();// elimina righe vuote iniziali/finali

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

        if(nome.length > COMMENTI_CONFIG.maxNome){
            mostraEsito(
                contenitore,
                "Nome troppo lungo.",
                "errore"
            );

            return;

        }


        if(testo.length > COMMENTI_CONFIG.maxTesto){
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
        if (ultimoInvio && adesso - ultimoInvio < COMMENTI_CONFIG.cooldown){

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

                parent_id: statoCommenti.parentIdCorrente,

                owner_token: ottieniOwnerToken(),

                nome: nome || "Anonimo",

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

        riportaFormInFondo(
            contenitore,
            statoCommenti
        );


        aggiornaListaCommenti(
            idCapitolo,
            contenitore,
            statoCommenti
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

        renderCommenti(
            lista,
            commenti,
            statoCommenti
        );

    });

    let contenitoreForm =
        contenitore.querySelector(
            ".contenitore-form-commento"
        );

    contenitoreForm.appendChild(form);

       
    return contenitore;

}

async function aggiornaListaCommenti(
    idCapitolo,
    contenitore,
    statoCommenti
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

    renderCommenti(
        lista,
        commenti,
        statoCommenti
    );    
 

}

async function eliminaCommento(
    commento,
    contenitore
){

    if(
        !confirm(
            "Vuoi eliminare questo commento?"
        )
    ){
        return;
    }


    // se è padre elimino anche figli

    if(commento.parent_id === null){

        let { error: erroreFigli } =
            await supabaseClient
            .from("commenti")
            .delete()
            .eq(
                "parent_id",
                commento.id
            );


        if(erroreFigli){

            console.error(
                erroreFigli
            );

            return;

        }

    }


    let { error } =
        await supabaseClient
        .from("commenti")
        .delete()
        .eq(
            "id",
            commento.id
        )
        .eq(
            "owner_token",
            ottieniOwnerToken()
        );


    if(error){

        console.error(error);

        return;

    }


    aggiornaListaCommenti(
        commento.id_capitolo,
        contenitore
    );

}

function creaElementoCommento(c, statoCommenti){

    let div =
        document.createElement("div");


    div.className =
        "commento";


    if(c.parent_id !== null){

        div.classList.add(
            "risposta-commento"
        );

    }


    div.innerHTML = `
        <div class="intestazione-commento">
            <strong class="autore-commento">
                ${escapeHTML(c.nome)}
            </strong>

            <small class="data-commento">
                ${new Date(c.created_at).toLocaleString("it-IT")}
            </small>
        </div>
    `;


    let p =
        document.createElement("p");


    p.className =
        "testo-commento";


    p.textContent =
        c.testo;


    div.appendChild(p);



    let azioni =
        creaAzioniCommento(
            c,
            div,
            statoCommenti
        );


    if(azioni){

        div.appendChild(
            azioni
        );

    }



    if(c.parent_id === null){

        let risposte =
            document.createElement("div");


        risposte.className =
            "risposte-commenti";


        div.appendChild(
            risposte
        );

    }


    return div;

}

function creaAzioniCommento(
    c,
    div,
    statoCommenti
){

    let azioni =
        document.createElement("div");

    azioni.className =
        "azioni-commento";


    // Rispondi solo ai commenti principali

    if(c.parent_id === null){

        let risposta =
            document.createElement("button");

        risposta.className =
            "bottone-commento rispondi-commento";

        risposta.textContent =
            TESTI_COMMENTI.rispondi;



        risposta.onclick = function(){

            if(
                statoCommenti.parentIdCorrente === c.id
            ){

                riportaFormInFondo(
                    div.closest(".commenti"),
                    statoCommenti
                );

                return;

            }


            if(
                statoCommenti.bottoneAttivo
            ){

                statoCommenti.bottoneAttivo.textContent =
                    TESTI_COMMENTI.rispondi;

            }


            statoCommenti.parentIdCorrente =
                c.id;


            statoCommenti.bottoneAttivo =
                risposta;


            risposta.textContent =
                TESTI_COMMENTI.annulla;


            spostaFormSottoCommento(
                div
            );

        };


        azioni.appendChild(
            risposta
        );

    }



    // Elimina

    if(
        c.owner_token ===
        ottieniOwnerToken()
    ){

        let elimina =
            document.createElement("button");


        elimina.className =
            "bottone-commento elimina-commento";


        elimina.textContent =
            TESTI_COMMENTI.elimina;



        elimina.onclick = function(){

            eliminaCommento(
                c,
                div.closest(".commenti")
            );

        };


        azioni.appendChild(
            elimina
        );

    }



    if(
        azioni.children.length
    ){

        return azioni;

    }


    return null;

}



function spostaFormSottoCommento(commento){

    let areaCommenti =
        commento.closest(".commenti");


    let form =
        areaCommenti.querySelector(
            ".form-commento"
        );


    let risposte =
        commento.querySelector(
            ".risposte-commenti"
        );


    risposte.appendChild(form);


    areaCommenti
        .querySelector(".contenitore-form-commento")
        .classList.add("form-risposta");

}

function riportaFormInFondo(
    areaCommenti,
    statoCommenti
){

    statoCommenti.parentIdCorrente = null;

    let contenitoreForm =
        areaCommenti.querySelector(
            ".contenitore-form-commento"
        );

    let form =
        areaCommenti.querySelector(
            ".form-commento"
        );


    let destinazione =
        form.querySelector(
            ".destinazione-risposta"
        );

    destinazione.textContent = "";

    
    // rimette il contenitore nella posizione originale
    areaCommenti.appendChild(
        contenitoreForm
    );


    // rimette il form dentro il contenitore
    contenitoreForm.appendChild(
        form
    );

    contenitoreForm.classList.remove(
        "form-risposta"
    );

    if(statoCommenti.bottoneAttivo){

        statoCommenti.bottoneAttivo.textContent = TESTI_COMMENTI.rispondi;

        statoCommenti.bottoneAttivo = null;

    }

    statoCommenti.parentIdCorrente = null;
}

function renderCommenti(
    lista,
    commenti,
    statoCommenti
){

    lista.innerHTML = "";

    let principali =
        commenti.filter(
            c => c.parent_id === null
        );


    principali.forEach(commento => {

        let elemento =
            creaElementoCommento(
                commento,
                statoCommenti
            );


        lista.appendChild(
            elemento
        );


        let risposte =
            commenti.filter(
                c => c.parent_id === commento.id
            );


        risposte.forEach(risposta => {

            let elementoRisposta =
                creaElementoCommento(
                    risposta,
                    statoCommenti
                );


            elementoRisposta.classList.add(
                "risposta-commento"
            );


            let contenitoreRisposte =
                elemento.querySelector(
                    ".risposte-commenti"
                );


            contenitoreRisposte.appendChild(
                elementoRisposta
            );

        });

    });

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