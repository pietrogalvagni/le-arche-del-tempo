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


    console.log(
        "COMMENTI CAPITOLO:",
        idCapitolo,
        data
    );


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


    form.addEventListener("submit", async function(e){

        e.preventDefault();


        let nome =
            contenitore.querySelector(".nome-commento")
            .value
            .trim();


        let testo =
            contenitore.querySelector(".testo-commento")
            .value
            .trim();



        if(testo.length === 0){

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

        <strong>
            ${c.nome}
        </strong>


        <small>
            ${new Date(c.created_at).toLocaleString("it-IT")}
        </small>


        <p>
            ${c.testo}
        </p>

    `;


    return div;

}