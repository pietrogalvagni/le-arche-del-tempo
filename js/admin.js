const ADMIN_MODE = "modalita_admin";

function aggiornaStato(){

    let attiva =
        localStorage.getItem(
            ADMIN_MODE
        ) === "true";


    document.getElementById(
        "stato-admin"
    ).textContent =
        attiva
        ? "Modalità admin attiva"
        : "Modalità admin disattiva";

}



document.getElementById(
    "attiva-admin"
)
.onclick = function(){

    localStorage.setItem(
        ADMIN_MODE,
        "true"
    );


    aggiornaStato();

};



document.getElementById(
    "disattiva-admin"
)
.onclick = function(){

    localStorage.removeItem(
        ADMIN_MODE
    );


    aggiornaStato();

};



aggiornaStato();