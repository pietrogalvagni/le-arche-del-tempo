import subprocess
from pathlib import Path
import re
import json


input_file = Path("../sorgente/romanzo.docx")
descrizioni_file = Path("../sorgente/descrizioni.json")
grezzo_file = Path("../generato/romanzo_grezzo.md")
output_file = Path("../generato/romanzo.md")

def carica_descrizioni():

    if not descrizioni_file.exists():

        print("FILE DESCRIZIONI NON TROVATO:", descrizioni_file)

        return {}

    with open(
        descrizioni_file,
        encoding="utf-8"
    ) as f:

        dati = json.load(f)

        return dati

def converti_pandoc():

    print("Conversione Word → Markdown...")

    subprocess.run([
        "pandoc",
        str(input_file),
        "-t",
        "markdown",
        "-o",
        str(grezzo_file)
    ],
    check=True)


def crea_id(titolo):

    titolo = titolo.lower()

    titolo = (
        titolo
        .replace("'", "_")
        .replace("’", "_")
    )

    titolo = re.sub(
        r"[^a-z0-9àèéìòù\s_]",
        "",
        titolo
    )

    titolo = re.sub(
        r"\s+",
        "_",
        titolo
    )

    titolo = re.sub(
        r"_+",
        "_",
        titolo
    )

    return titolo.strip("_")



def pulisci_testo(testo):

    # elimina slash aggiunti da pandoc
    testo = testo.replace("\\'", "'")

    # elimina intestazione iniziale
    posizione = testo.find("# Capitolo")

    testo = testo.replace('\\"','"')

    if posizione != -1:
        testo = testo[posizione:]

    return testo



def trasforma_capitoli(testo, descrizioni):

    blocchi = re.split(
        r"(?m)^# ",
        testo
    )


    risultato = ""

    numero_interludio = 0

    conteggio_capitoli = 0

    conteggio_interludi = 0

    mancanti_descrizione = []

    for blocco in blocchi:

        if not blocco.strip():
            continue


        righe = blocco.split("\n",1)


        titolo_grezzo = righe[0].strip()

        contenuto = (
            righe[1]
            if len(righe)>1
            else ""
        )


        match = re.match(
            r"Capitolo \d+\.\s*(.+)",
            titolo_grezzo,
            re.IGNORECASE
        )


        if match:

            tipo = "capitolo"

            titolo = match.group(1).strip()

            conteggio_capitoli += 1


        else:

            tipo = "interludio"

            titolo = titolo_grezzo

            numero_interludio += 1

            conteggio_interludi += 1



        id_base = crea_id(titolo)

        if tipo == "interludio":

            id_capitolo = (
                id_base +
                "_" +
                str(numero_interludio)
            )

        else:

            id_capitolo = id_base

        if id_capitolo not in descrizioni:

            mancanti_descrizione.append(
                id_capitolo
            )

        if id_capitolo in descrizioni:

            metadati_extra = descrizioni[id_capitolo]

        else:

            print(
                "Descrizione mancante:",
                id_capitolo
            )

            metadati_extra = {}

        risultato += (
            "# CAPITOLO\n\n"
            f"id: {id_capitolo}\n"
            f"tipo: {tipo}\n"
            f"titolo: {titolo}\n"
            f"descrizione: {metadati_extra.get('descrizione','')}\n"
            f"immagine: {metadati_extra.get('immagine','img/capitoli/'+id_base+'.jpg')}\n\n"
                        "--- FINE METADATI ---\n\n"
        )


        risultato += contenuto.strip()

        risultato += "\n\n"



    statistiche = {

        "capitoli": conteggio_capitoli,

        "interludi": conteggio_interludi,

        "totale": conteggio_capitoli + conteggio_interludi,

        "descrizioni_mancanti": mancanti_descrizione

    }


    return risultato, statistiche

def report(statistiche):

    print("")
    print("===== REPORT =====")

    print(
        "Capitoli:",
        statistiche["capitoli"]
    )

    print(
        "Interludi:",
        statistiche["interludi"]
    )

    print(
        "Totale blocchi:",
        statistiche["totale"]
    )


    print("")


    print("Descrizioni mancanti:")


    if statistiche["descrizioni_mancanti"]:

        for id_capitolo in statistiche["descrizioni_mancanti"]:

            print(
                "-",
                id_capitolo
            )

    else:

        print("Nessuna")


    print("")
    print("==================")



def main():

    converti_pandoc()


    testo = grezzo_file.read_text(
        encoding="utf-8"
    )


    testo = pulisci_testo(
        testo
    )


    descrizioni = carica_descrizioni()
    print(descrizioni)

    testo, statistiche = trasforma_capitoli(testo, descrizioni)


    output_file.write_text(
        testo,
        encoding="utf-8"
    )


    print("")
    print("Conversione completata!")
    print(output_file)


    report(statistiche)



main()