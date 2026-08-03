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


        <form class="form-commento">

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

function creaElementoCommento(c, statoCommenti){

    console.log(
        "creaElementoCommento",
        c.id,
        statoCommenti
    );

    console.log(
        "owner db:",
        c.owner_token,
        "owner locale:",
        ottieniOwnerToken()
    );

    console.log(
        c.owner_token === ottieniOwnerToken()
    );


    let div = document.createElement("div");
    div.className = "commento";


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


    let p = document.createElement("p");

    p.className = "testo-commento";

    p.textContent = c.testo;

    div.appendChild(p);


     // Elimina commento
    let elimina =
        document.createElement("button");

    elimina.className =
        "elimina-commento";

    elimina.textContent =
        "Elimina";


    if(
        c.owner_token ===
        ottieniOwnerToken()
    ){

        div.appendChild(
            elimina
        );

    }


    elimina.onclick = async function(){

        if(
            !confirm(
                "Vuoi eliminare questo commento?"
            )
        ){
            return;
        }


        let query =
            supabaseClient
            .from("commenti")
            .delete();


        // Se è un commento principale
        if(c.parent_id === null){

            let { error: erroreFigli } =
                await query
                .eq(
                    "parent_id",
                    c.id
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
                c.id
            )
            .eq(
                "owner_token",
                ottieniOwnerToken()
            );


        if(error){

            console.error(
                error
            );

            alert(
                "Errore durante l'eliminazione."
            );

            return;

        }


        aggiornaListaCommenti(
            c.id_capitolo,
            div.closest(".commenti")
        );

    }

    if(c.parent_id === null){

        let risposte =
            document.createElement("div");

        risposte.className = "risposte-commenti";

        div.appendChild(risposte);


        let risposta =
            document.createElement("button");

        risposta.className =
            "rispondi-commento";

        risposta.textContent =
            "↩ Rispondi";


        div.insertBefore(
            risposta,
            risposte
        );


       


        risposta.onclick = function(){

            // se sto cliccando di nuovo sullo stesso commento → annulla

            if(statoCommenti.parentIdCorrente === c.id){

                riportaFormInFondo(
                    div.closest(".commenti"),
                    statoCommenti
                );

                return;

            }


            // ripristina l'eventuale vecchio bottone

            if(statoCommenti.bottoneAttivo){

                statoCommenti.bottoneAttivo.textContent =
                    "Rispondi";

            }


            statoCommenti.parentIdCorrente =
                c.id;


            statoCommenti.bottoneAttivo =
                risposta;


            risposta.textContent =
                "Annulla";


            spostaFormSottoCommento(div);

        }
        

        
        
    }

    


    return div;

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

        statoCommenti.bottoneAttivo.textContent = "↩ Rispondi";

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