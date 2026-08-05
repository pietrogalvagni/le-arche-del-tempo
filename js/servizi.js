const SUPABASE_URL =
    "https://qddffigxxjvzvgdvsjkb.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_y4tJjA_JqALJs-X1PwJing_PzM1n3Cj";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


function ottieniVisitorToken(){

    let token =
        localStorage.getItem(
            "visitor_token"
        );

    if(!token){

        token =
            crypto.randomUUID();

        localStorage.setItem(
            "visitor_token",
            token
        );

    }

    return token;

}

function adminMode(){

    return localStorage.getItem(
        "modalita_admin"
    ) === "true";

}

async function registraVisita(pagina){

    // Non loggare statistiche se sono admin.
    // Questo può essere cambiato dalla pagina
    // learchedeltempo/admin.html
    if(adminMode()){

        return;

    }


    let { error } =
        await supabaseClient
        .from("visite")
        .insert({

            visitor_token:
                ottieniVisitorToken(),

            pagina:
                pagina

        });


    if(error){

        console.error(
            "Errore registrazione visita:",
            error
        );

    }

}