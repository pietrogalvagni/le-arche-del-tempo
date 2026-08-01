# le-arche-del-tempo
Sito ufficiale del romanzo Le Arche del Tempo


Aggiornare il sito con una nuova versione del romanzo
- caricare romanzo.docx formato word in sorgente/romanzo.docx
- lanciare da terminale: PS C:\Users\galva\OneDrive\Documenti\GitHub\le-arche-del-tempo\script> python .\converti.py
questo produce anche un pdf in generato/romanzo.pdf che però non viene aggiornato nel sito. Bisogna manualmente convertire il pdf con un altro metodo e poi caricarlo in pdf/

se ci sono descrizioni mancanti
- aggiungerle in sorgente/descrizioni.json
- lanciare aggiorna_descrizioni.py

se ci sono id non trovati, significa che il file descrizioni e il file