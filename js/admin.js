function aggiornaStato(){

    let attiva =
        localStorage.getItem(
            "ignora_visite"
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
        "ignora_visite",
        "true"
    );


    aggiornaStato();

};



document.getElementById(
    "disattiva-admin"
)
.onclick = function(){

    localStorage.removeItem(
        "ignora_visite"
    );


    aggiornaStato();

};



aggiornaStato();