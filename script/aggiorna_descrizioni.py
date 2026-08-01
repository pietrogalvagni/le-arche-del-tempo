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
    titolo_corrente = ""

    aggiornati = 0
    mancanti = []


    for i, riga in enumerate(righe):

        if riga.startswith("id:"):

            id_corrente = riga.replace(
                "id:",
                ""
            ).strip()


        if riga.startswith("titolo:"):

            titolo_corrente = riga.replace(
                "titolo:",
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

                aggiornati += 1

            else:

                mancanti.append(
                    (
                        id_corrente,
                        titolo_corrente
                    )
                )


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


    mancanti = list(
        dict.fromkeys(mancanti)
    )


    print(
        f"{len(mancanti)} id non trovati."
    )

    if mancanti:

        print()

        for id_capitolo, titolo in mancanti:

            print(
                f" - {titolo} ({id_capitolo})"
            )


    print()

    print(
        f"{aggiornati} capitoli aggiornati."
    )


    return "\n".join(righe)


def aggiorna_versione():

    versione_file = Path("../generato/versione.txt")

    if versione_file.exists():

        versione = int(
            versione_file.read_text(
                encoding="utf-8"
            )
        ) + 1

    else:

        versione = 1

    versione_file.write_text(
        str(versione),
        encoding="utf-8"
    )


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

    aggiorna_versione()

    print("Descrizioni e immagini aggiornate.")



if __name__ == "__main__":
    main()