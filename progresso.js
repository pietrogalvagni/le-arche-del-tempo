function segnaComeLetto(numeroCapitolo) {
    localStorage.setItem(
        "capitolo_" + numeroCapitolo,
        "letto"
    );
}


function statoCapitolo(numeroCapitolo) {

    return localStorage.getItem(
        "capitolo_" + numeroCapitolo
    );

}


function aggiornaLista() {

    let capitoli = document.querySelectorAll(".capitolo");

    capitoli.forEach(function(capitolo) {

        let numero = capitolo.dataset.numero;

        let stato = statoCapitolo(numero);

        if (stato === "letto") {
            capitolo.innerHTML = "✓ " + capitolo.innerHTML;
        }

    });

}
