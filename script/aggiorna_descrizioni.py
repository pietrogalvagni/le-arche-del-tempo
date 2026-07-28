import json
from pathlib import Path


descrizioni_file = Path("../sorgente/descrizioni.json")
output_file = Path("../generato/romanzo.md")


def carica_descrizioni():

    with open(
        descrizioni_file,
        encoding="utf-8"
    ) as f:

        return json.load(f)



def aggiorna_metadati(testo, descrizioni):

    righe = testo.splitlines()

    id_corrente = None

    aggiornati = 0
    mancanti = []


    for i, riga in enumerate(righe):

        if riga.startswith("id:"):

            id_corrente = riga.replace(
                "id:",
                ""
            ).strip()


        if (
            id_corrente
            and riga.startswith("descrizione:")
        ):

            if id_corrente in descrizioni:

                righe[i] = (
                    "descrizione: "
                    +
                    descrizioni[id_corrente]["descrizione"]
                )

            else:

                mancanti.append(id_corrente)


        if (
            id_corrente
            and riga.startswith("immagine:")
        ):

            if id_corrente in descrizioni:

                righe[i] = (
                    "immagine: "
                    +
                    descrizioni[id_corrente]["immagine"]
                )


    print(f"{len(set(mancanti))} id non trovati.")

    print(
        f"{len(descrizioni)-len(set(mancanti))} capitoli aggiornati."
    )


    return "\n".join(righe)



def main():

    descrizioni = carica_descrizioni()

    testo = output_file.read_text(
        encoding="utf-8"
    )

    testo = aggiorna_metadati(
        testo,
        descrizioni
    )

    output_file.write_text(
        testo,
        encoding="utf-8"
    )

    print("Descrizioni aggiornate.")



if __name__ == "__main__":
    main()