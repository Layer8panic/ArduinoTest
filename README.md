# Arduino Lab · Pulsante e if

Lezione interattiva per prepararsi a una verifica su Arduino e Tinkercad (pulsante, LED, if / else, delay) partendo da zero.

**Apri l’app:** https://layer8panic.github.io/ArduinoTest/

## Cosa c’è dentro

- **Lezioni** (9 moduli, una pagina per concetto, un’attività di controllo in ogni pagina): Arduino e Tinkercad, LED e resistenza, primo programma, Monitor seriale, pulsante e pull-down, if / else, delay, sequenze e contatori, consegna.
- **Laboratorio con tutor**: 4 esercizi guidati (lampada, freccia della bici, forno a microonde, sbarra del parcheggio). Per ognuno: analisi, progetto del circuito pezzo per pezzo, codice riga per riga, prova in simulazione con test automatico, caccia all’errore, domanda di ragionamento.
- **Banco**: Arduino Uno R3 e breadboard come in Tinkercad (trascini i componenti, colleghi i fili, scrivi il codice, avvii la simulazione, anche al rallentatore con le variabili). Il pulsante **✔ Controlla** verifica circuito, comportamento e commenti.
- **Verifica simulata**: tre esercizi nuovi, dello stesso tipo di una verifica vera, da fare da soli con il controllo automatico.
- **Ripasso**: collegamenti, istruzioni, schemi di codice, concetti da saper spiegare, errori da evitare, checklist di consegna e domande lampo.
- **Modalità LIM** (icona 🖥 in alto): schermo intero, testi grandi, pagine sbloccate.

## Struttura

```
index.html              guscio dell'app
css/app.css             stile di base (da Flowchartapp)
css/lab.css             banco, editor, tutor, LIM
js/core.js              utilità, impostazioni, salvataggio
js/ill.js               disegni interattivi e glossario inglese → italiano
js/engine/arduino.js    interprete Arduino didattico (if/else, for, while, delay, Serial)
js/engine/bench.js      banco Arduino + breadboard: disegno, fili, analisi elettrica, simulazione
js/workbench.js         postazione: banco + codice + monitor + controllo automatico
js/activities.js        attività delle lezioni
js/tutor.js             tutor del laboratorio
js/data/lessons.js      contenuto delle lezioni
js/data/exercises.js    esercizi, soluzioni, test
js/ripasso.js           scheda di ripasso
js/app.js               schermate e navigazione
sketch/*.ino            soluzioni degli esercizi di allenamento
```

Nessuna dipendenza esterna: basta GitHub Pages. I progressi restano nel browser (localStorage).

Motore del banco e disegni derivati da [EserTinkercad](https://github.com/Layer8panic/EserTinkercad); struttura delle lezioni e del tutor da [Flowchartapp](https://github.com/Layer8panic/Flowchartapp).
