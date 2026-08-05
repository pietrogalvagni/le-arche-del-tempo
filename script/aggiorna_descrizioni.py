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

    # info per il report finale
    aggiornati = 0
    id_presenti = set()


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

            id_presenti.add(
                id_corrente
            )


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


    descrizioni_non_usate = sorted(
        set(descrizioni.keys()) - id_presenti
    )


    print()
    print("=" * 40)
    print("VERIFICA DESCRIZIONI")
    print("=" * 40)
    print()


    print(
        f"✓ capitoli aggiornati: {aggiornati}."
    )


    if len(descrizioni_non_usate) > 0:
        print()
        print(
            f"Capitoli con descrizione ma che non sono usati nel romanzo: {len(descrizioni_non_usate)}"
        )

        for id_capitolo in descrizioni_non_usate:

            print(
                f" - {id_capitolo}"
            )
        print("azione consigliata: elimina voci da sorgente/descrizoni.json")


    if len(mancanti) > 0:
        print()
        print(
            f"Capitoli presenti nel romanzo ma che non hanno descrizione: {len(mancanti)}"
        )

        for id_capitolo, titolo in mancanti:

            print(
                f" - {titolo} ({id_capitolo})"
            )
        print("azione consigliata: aggiungi voci in sorgente/descrizoni.json")

    print("")

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

    

if __name__ == "__main__":
    main()