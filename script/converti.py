import subprocess
from pathlib import Path
import re
import json
import zipfile
import shutil
import tempfile
import subprocess
from aggiorna_descrizioni import aggiorna_metadati
from aggiorna_descrizioni import aggiorna_versione


input_file = Path("../sorgente/romanzo.docx")
descrizioni_file = Path("../sorgente/descrizioni.json")

grezzo_file = Path("../generato/romanzo_grezzo.md")
html_file = Path("../generato/romanzo.html")
output_file = Path("../generato/romanzo.md")
pdf_file = Path("../generato/le_arche_del_tempo.pdf")
epub_file = Path("../generato/le_arche_del_tempo.epub")

chrome = Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def genera_formati():

    cartella_output = Path("../generato")

    cartella_output.mkdir(
        exist_ok=True
    )


    epub = (epub_file)

    pdf = (pdf_file)


    print("")
    print("Generazione EPUB...")

    subprocess.run(
        [
            "pandoc",
            str(input_file),
            "-o",
            str(epub)
        ],
        check=True
    )


    print("Generazione PDF...")

    subprocess.run(
        [
            "pandoc",
            str(input_file),
            "-o",
            str(pdf),
            "--pdf-engine=xelatex"
        ],
        check=True
    )


    print("EPUB:", epub)

    print("PDF :", pdf)




def prepara_docx_stacchi(input_file):

    docx_temp = Path("romanzo_temp.docx")

    with zipfile.ZipFile(input_file, "r") as zin:

        with zipfile.ZipFile(docx_temp, "w") as zout:

            for item in zin.infolist():

                contenuto = zin.read(item.filename)

                if item.filename == "word/document.xml":

                    testo = contenuto.decode("utf-8")

                    # sostituisce paragrafi vuoti
                    testo = testo.replace(
                        "</w:pPr></w:p>",
                        "</w:pPr><w:r><w:t>[STACCO]</w:t></w:r></w:p>"
                    )

                    contenuto = testo.encode("utf-8")


                zout.writestr(
                    item,
                    contenuto
                )

    return docx_temp


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

    docx_pulito = prepara_docx_stacchi(input_file)
    
    subprocess.run([
        "pandoc",
        str(docx_pulito),
        "-t",
        "markdown",
        "--wrap=preserve",
        "-o",
        str(grezzo_file)
    ],
    check=True)

    docx_pulito.unlink()

    return html_file


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


def trasforma_capitoli(testo):

    blocchi = re.split(
        r"(?m)^# ",
        testo
    )


    risultato = ""

    numero_interludio = 0

    conteggio_capitoli = 0

    conteggio_interludi = 0

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

        

        risultato += (
            "# CAPITOLO\n\n"
            f"id: {id_capitolo}\n"
            f"tipo: {tipo}\n"
            f"titolo: {titolo}\n"
            "descrizione:\n"
            "immagine:\n\n"
            "--- FINE METADATI ---\n\n"
        )


        risultato += contenuto.strip()

        risultato += "\n\n"



    statistiche = {

        "capitoli": conteggio_capitoli,

        "interludi": conteggio_interludi,

        "totale": conteggio_capitoli + conteggio_interludi,

        "descrizioni_mancanti": []

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


    if statistiche.get("descrizioni_mancanti"):

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

    if not input_file.exists():

        print("")
        print("ERRORE")
        print(f"File non trovato: {input_file}")
        print("Assicurati che il file 'romanzo.docx' sia presente nella cartella sorgente.")

        return

    # pdf e epub

    genera_formati();
  
    
    # genera html per sito web

    html_file = converti_pandoc()

    if html_file.exists():
        html_file.unlink()

    testo = grezzo_file.read_text(
        encoding="utf-8"
    )


    testo = pulisci_testo(
        testo
    )


    descrizioni = carica_descrizioni()

    testo, statistiche = trasforma_capitoli(testo)

    descrizioni = carica_descrizioni()

    testo = aggiorna_metadati(
        testo,
        descrizioni
    )

    output_file.write_text(
        testo,
        encoding="utf-8"
    )

    # versionamento

    aggiorna_versione();


    
    print("")
    print("Conversione completata!")
    print(output_file)

    report(statistiche)



main()