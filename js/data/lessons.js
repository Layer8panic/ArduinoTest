/* =====================================================
   Arduino Lab · LEZIONI (da zero alla verifica)
   ogni pagina: spiegazione + un'attività veloce
   widget nelle pagine: data-ill="water|led|res|bb|btn|float|build|delay"
   ===================================================== */
"use strict";
/* ---------- circuiti e programmi usati nelle lezioni ---------- */
const DEMO={
 blink:{circuit:k=>{k.R_();k.RAILS_();k.LEDLAB_(10,'rosso',12)},code:`int ledRosso = 12;              // il LED rosso è sul pin 12

void setup() {
  pinMode(ledRosso, OUTPUT);      // il pin del LED comanda
}

void loop() {
  digitalWrite(ledRosso, HIGH);   // accendo il LED
  delay(1000);                    // aspetto 1 secondo
  digitalWrite(ledRosso, LOW);    // spengo il LED
  delay(1000);                    // aspetto 1 secondo
}`},
 ciao:{circuit:k=>{k.R_();k.RAILS_()},code:`int giri = 0;                      // conta i giri del loop

void setup() {
  Serial.begin(9600);              // apro il Monitor seriale
  Serial.println("Ciao, sono Arduino!"); // scritto una volta sola
}

void loop() {
  giri = giri + 1;                 // un giro in più
  Serial.print("Sono nel loop, giro ");  // testo, senza andare a capo
  Serial.println(giri);            // il numero, poi a capo
  delay(1000);                     // aspetto 1 secondo
}`},
 float:{circuit:k=>{k.R_();k.RAILS_();k.BTNFLOAT_(16,2)},code:`int pulsante = 2;                // pulsante sul pin 2, SENZA resistenza
int stato = 0;                   // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);      // il pin ascolta
  Serial.begin(9600);            // apro il monitor
}

void loop() {
  stato = digitalRead(pulsante); // leggo il pin
  Serial.println(stato);         // scrivo 1 (HIGH) oppure 0 (LOW)
  delay(300);                    // aspetto un po'
}`},
 pulldown:{circuit:k=>{k.R_();k.RAILS_();k.BTNPD_(16,2)},code:`int pulsante = 2;                // pulsante sul pin 2, CON pull-down da 10 kΩ
int stato = 0;                   // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);      // il pin ascolta
  Serial.begin(9600);            // apro il monitor
}

void loop() {
  stato = digitalRead(pulsante); // leggo il pin
  Serial.println(stato);         // scrivo 1 (HIGH) oppure 0 (LOW)
  delay(300);                    // aspetto un po'
}`},
 spia:{circuit:k=>{k.R_();k.RAILS_();k.LEDLAB_(8,'blu',12);k.BTNPD_(18,2)},code:`int pulsante = 2;                  // pulsante sul pin 2
int ledBlu = 12;                   // LED blu sul pin 12
int stato = 0;                     // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);        // il pulsante ascolta
  pinMode(ledBlu, OUTPUT);         // il LED comanda
  Serial.begin(9600);              // apro il monitor
}

void loop() {
  stato = digitalRead(pulsante);   // leggo il pulsante
  if (stato == HIGH) {             // se è premuto...
    digitalWrite(ledBlu, HIGH);    // ...accendo il LED
    Serial.println("SI");          // ...e scrivo SI
  } else {                         // altrimenti...
    digitalWrite(ledBlu, LOW);     // ...spengo il LED
    Serial.println("NO");          // ...e scrivo NO
  }
  delay(100);                      // pausa per il monitor
}`},
 lento:{circuit:k=>{k.R_();k.RAILS_();k.LEDLAB_(5,'verde',11);k.LEDLAB_(10,'rosso',12);k.BTNPD_(20,2)},code:`int pulsante = 2;                  // pulsante sul pin 2
int ledVerde = 11;                 // LED verde sul pin 11
int ledRosso = 12;                 // LED rosso sul pin 12
int stato = 0;                     // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);        // il pulsante ascolta
  pinMode(ledVerde, OUTPUT);       // il verde comanda
  pinMode(ledRosso, OUTPUT);       // il rosso comanda
}

void loop() {
  stato = digitalRead(pulsante);   // leggo il pulsante
  if (stato == HIGH) {             // premuto:
    digitalWrite(ledVerde, LOW);   // spengo il verde
    digitalWrite(ledRosso, HIGH);  // rosso acceso...
    delay(1500);                   // ...per 1,5 secondi
    digitalWrite(ledRosso, LOW);   // rosso spento...
    delay(1500);                   // ...per 1,5 secondi
  } else {                         // rilasciato:
    digitalWrite(ledVerde, HIGH);  // verde acceso
  }
}`},
 sequenza:{circuit:k=>{k.R_();k.RAILS_();k.LEDLAB_(3,'rosso',12);k.LEDLAB_(7,'giallo',11);k.LEDLAB_(11,'verde',10);k.BTNPD_(20,2)},code:`int pulsante = 2;                  // pulsante sul pin 2
int ledRosso = 12;                 // rosso sul pin 12
int ledGiallo = 11;                // giallo sul pin 11
int ledVerde = 10;                 // verde sul pin 10
int stato = 0;                     // cosa legge il pulsante
int volte = 0;                     // quante volte ho premuto

void setup() {
  pinMode(pulsante, INPUT);        // il pulsante ascolta
  pinMode(ledRosso, OUTPUT);       // i LED comandano
  pinMode(ledGiallo, OUTPUT);      // giallo
  pinMode(ledVerde, OUTPUT);       // verde
  Serial.begin(9600);              // apro il monitor
}

void loop() {
  stato = digitalRead(pulsante);   // leggo il pulsante
  if (stato == HIGH) {             // premuto: parte la sequenza
    volte = volte + 1;             // una volta in più
    Serial.print("Volta numero "); // testo senza andare a capo
    Serial.println(volte);         // il numero e a capo
    digitalWrite(ledRosso, HIGH);  // 1) rosso
    delay(1000);                   // per 1 secondo
    digitalWrite(ledRosso, LOW);   // spengo il rosso
    digitalWrite(ledGiallo, HIGH); // 2) giallo
    delay(1000);                   // per 1 secondo
    digitalWrite(ledGiallo, LOW);  // spengo il giallo
    digitalWrite(ledVerde, HIGH);  // 3) verde
    delay(1000);                   // per 1 secondo
    digitalWrite(ledVerde, LOW);   // spengo il verde
  }
}`}};

const SKILLS=[
 ['arduino','So cos’è Arduino e cosa sono i pin, 5V e GND'],
 ['circuito','So montare un LED con la sua resistenza'],
 ['pulsante','So collegare un pulsante con la pull-down'],
 ['codice','Conosco setup, loop, pinMode, digitalWrite, delay'],
 ['seriale','So scrivere sul Monitor seriale'],
 ['ifelse','So decidere con if / else'],
 ['delay','So cosa fa Arduino durante un delay'],
 ['sequenza','So scrivere una sequenza con i tempi giusti'],
 ['contatore','So contare con una variabile'],
 ['debug','So trovare e correggere un errore']];

const MODULES=[
{id:1,icon:'🤖',title:'Arduino e Tinkercad',sub:'La scheda, i pin, dove si lavora',min:10,ex:[],slides:[
 {t:'Benvenuto!',h:`<p class="lead">In queste lezioni impari a far <b>accendere</b> e <b>decidere</b> una scheda Arduino. Si parte da zero.</p>
  <p>Alla fine saprai montare un circuito con LED e pulsante, scrivere il programma e provarlo in <b>Tinkercad</b>: proprio quello che serve per la verifica.</p>
  <div class="callout">Ogni pagina finisce con una <b>verifica lampo</b>. Se sbagli puoi riprovare: serve a capire.</div>`,
  act:{type:'tf',q:'Vero o falso?',items:[['Per seguire le lezioni devo già sapere l’elettronica.',false,'Falso: si parte da zero.'],['Nella verifica il circuito lo progetto io.',true,'Vero: scegli tu pin, resistenze e collegamenti. Qui impari come.']]}},
 {t:'Cos’è Arduino',h:`<p class="lead">Arduino è una <b>piccola scheda elettronica</b> con dentro un mini-computer (il <i>microcontrollore</i>).</p>
  <div class="ill">${miniBoard()}</div>
  <p>Da solo non fa niente: aspetta un <b>programma</b> (si chiama anche <i>sketch</i>). Lo scriviamo noi, Arduino lo esegue passo dopo passo, senza stancarsi mai.</p>`,
  act:{type:'quiz',q:'Che cosa fa Arduino senza un programma?',opts:[['Niente: aspetta le nostre istruzioni',1,'Esatto: è come un cuoco senza ricetta.'],['Accende tutti i LED',0,'Senza programma non sa cosa accendere.'],['Si collega a Internet',0,'Arduino Uno non ha nemmeno il Wi-Fi.']],skill:'arduino'}},
 {t:'I pin: mani e orecchie',h:`<p class="lead">Ai bordi della scheda ci sono tanti forellini numerati: i <b>pin</b>.</p>
  <div class="grid2"><div class="callout"><b>✋ Pin in uscita (OUTPUT)</b><br>Arduino <b>comanda</b>: dà 5 V o 0 V. Serve per accendere un LED.</div><div class="callout ok"><b>👂 Pin in ingresso (INPUT)</b><br>Arduino <b>ascolta</b>: misura se arriva tensione. Serve per leggere un pulsante.</div></div>
  <p>I pin digitali vanno da <b>0 a 13</b>. I pin <b>0 e 1</b> servono al Monitor seriale: nei nostri circuiti useremo quelli <b>da 2 a 13</b>.</p>`,
  act:{type:'classify',q:'Il pin serve per comandare o per ascoltare?',bins:['Comanda (OUTPUT)','Ascolta (INPUT)'],items:[['Il pin di un LED',0,'Il LED lo accende Arduino: OUTPUT.'],['Il pin di un pulsante',1,'Il pulsante lo premi tu e Arduino lo ascolta: INPUT.'],['Il pin del LED rosso del semaforo',0,'Ogni LED è un’uscita.']],skill:'arduino'}},
 {t:'Il più e il meno: 5V e GND',h:`<p class="lead">Come una pila, anche Arduino ha un <b style="color:#C62828">+</b> e un <b style="color:#1565C0">−</b>.</p>
  <div class="ill">${batterySVG()}</div>
  <ul class="big"><li><b>5V</b> è il più: la “spinta” dell’elettricità.</li><li><b>GND</b> (si legge “ground”, terra) è il meno: la strada di ritorno, 0 volt.</li></ul>
  <div class="callout warn">Per non confondersi: filo del 5V <b style="color:#C62828">rosso</b>, filo del GND <b>nero</b>. Il 5V non va <b>mai</b> collegato direttamente al GND: è un cortocircuito.</div>`,
  act:{type:'quiz',q:'Cosa vuol dire GND?',opts:[['Il meno: dove la corrente torna indietro (0 volt)',1,'Giusto. 5V è il più, GND il meno.'],['Il pin del LED',0,'GND è il polo negativo, non un pin per i LED.'],['Il più di Arduino',0,'Il più è il 5V.']],skill:'arduino'}},
 {t:'Dove si lavora: Tinkercad',h:`<p class="lead">Nella verifica lavori su <b>Tinkercad</b>, un simulatore gratuito: monti il circuito e scrivi il codice senza rischiare di bruciare niente.</p>
  <div class="phases">${['Vai su <b>tinkercad.com</b> ed entra con il tuo account','<b>Crea → Circuito</b>: un progetto nuovo per ogni esercizio','Trascina <b>Arduino Uno R3</b> e una <b>breadboard</b>','Aggiungi LED, resistenze e pulsante, poi i fili','<b>Codice → Testo</b>: scrivi il programma','<b>Avvia simulazione</b> e apri il <b>Monitor seriale</b>'].map((t,i)=>`<div class="phase" style="--i:${i}"><span>${i+1}</span>${t}</div>`).join('')}</div>
  <p class="small muted">In questa app c’è un <b>Banco</b> che funziona quasi come Tinkercad: puoi esercitarti anche dal telefono.</p>`,
  act:{type:'order',q:'Rimetti in ordine i passi in Tinkercad.',items:['Crea → Circuito','Metti Arduino e la breadboard','Monta i componenti e i fili','Scrivi il codice (Codice → Testo)','Avvia la simulazione e guarda il Monitor seriale'],ok:'Perfetto: prima il circuito, poi il codice, poi la prova.'}}
]},
{id:2,icon:'💡',title:'Corrente, LED e resistenza',sub:'Il circuito chiuso e la breadboard',min:12,ex:[],slides:[
 {t:'L’elettricità è come l’acqua',h:`<p class="lead">Immagina l’elettricità come <b>acqua nei tubi</b>: il 5V è la pompa, la corrente è l’acqua che scorre.</p>
  <div class="ill" data-ill="water"></div>
  <p>La corrente scorre solo se il giro è <b>chiuso</b>: parte dal +, attraversa i componenti e torna al −.</p>`,
  act:{type:'quiz',q:'Il circuito è aperto (il giro è interrotto). Il LED…',opts:[['Si spegne: la corrente non può girare',1,'Esatto: senza giro chiuso non scorre niente.'],['Si accende più forte',0,'Senza giro chiuso non passa corrente.'],['Lampeggia',0,'Non c’è niente che lo faccia lampeggiare.']]}},
 {t:'Il LED ha un verso',h:`<p class="lead">Il <b>LED</b> è una piccola lampadina a senso unico: la corrente passa in <b>una sola direzione</b>.</p>
  <div class="ill" data-ill="led"></div>
  <ul class="big"><li>Gamba <b>+</b> (anodo, la più <b>lunga</b>): va verso il <b>pin</b> di Arduino.</li><li>Gamba <b>−</b> (catodo, la più corta): va verso <b>GND</b>.</li></ul>`,
  act:{type:'quiz',q:'Hai montato il LED al contrario. Cosa succede?',opts:[['Resta spento',1,'Giusto: il LED funziona solo nel verso giusto. Non si rompe, basta girarlo.'],['Si accende lo stesso',0,'Il LED è un diodo: in un verso la corrente non passa.'],['Esplode',0,'Al contrario resta solo spento.']],skill:'circuito'}},
 {t:'La resistenza protegge il LED',h:`<p class="lead">La <b>resistenza</b> frena la corrente. Senza, nel LED passa troppa corrente e si brucia.</p>
  <div class="ill" data-ill="res"></div>
  <div class="grid2"><div class="callout"><b>220 Ω</b> con ogni LED.</div><div class="callout ok"><b>10 kΩ</b> (10.000 Ω) con il pulsante: lo vedremo nella lezione 5.</div></div>
  <p class="small muted">Ω si legge “ohm”. k vuol dire mille.</p>`,
  act:{type:'quiz',q:'Che resistenza metti in serie a un LED?',opts:[['220 Ω',1,'Giusto: è il freno giusto per un LED a 5 V.'],['10 kΩ',0,'Troppo grande: il LED resterebbe quasi spento.'],['Nessuna',0,'Il LED si brucerebbe.']],skill:'circuito'}},
 {t:'La breadboard',h:`<p class="lead">La <b>breadboard</b> serve per montare i circuiti senza saldare.</p>
  <div class="ill" data-ill="bb"></div>
  <ul class="big"><li>Ogni <b>colonna di 5 fori</b> (a–e oppure f–j) è collegata dentro.</li><li>Le righe lunghe <b style="color:#D33">+</b> e <b style="color:#36C">−</b> (i <b>binari</b>) sono collegate per tutta la lunghezza: ci portiamo 5V e GND.</li><li>La <b>scanalatura</b> in mezzo separa la parte di sopra da quella di sotto.</li></ul>`,
  act:{type:'tf',q:'Vero o falso?',items:[['Due gambe nella stessa colonna di 5 fori sono collegate tra loro.',true,'Vero: dentro c’è una lamella di metallo.'],['Il foro a1 e il foro f1 sono collegati.',false,'Falso: in mezzo c’è la scanalatura.'],['Il binario + è collegato per tutta la lunghezza.',true,'Vero: per questo ci portiamo il 5V.']],skill:'circuito'}},
 {t:'Il circuito di un LED',h:`<p class="lead">Ecco come si collega un LED ad Arduino:</p>
  <div class="chain"><span class="pin">pin 12</span>→<span>gamba + del LED</span>→<span>💡</span>→<span>gamba −</span>→<span class="r">220 Ω</span>→<span class="gnd">GND</span></div>
  <p>Quando il programma mette il pin a <b>HIGH</b> (5 V) la corrente fa il giro e il LED si accende. Con <b>LOW</b> (0 V) si spegne.</p>
  <div class="callout">La resistenza può stare prima o dopo il LED: l’importante è che sia nello stesso giro.</div>`,
  act:{type:'order',q:'Segui il giro della corrente: mettilo in ordine.',items:['Pin di Arduino (HIGH)','Gamba + del LED','Gamba − del LED','Resistenza da 220 Ω','GND'],ok:'Esatto: è proprio questo il giro che monterai nella verifica.',skill:'circuito'}}
]},
{id:3,icon:'📜',title:'Il primo programma',sub:'setup, loop, pinMode, digitalWrite, delay',min:14,ex:[],slides:[
 {t:'Le due parti di ogni programma',h:`<pre class="code0">${hl(`void setup() {
  // qui le istruzioni che si fanno UNA volta, all'accensione
}

void loop() {
  // qui le istruzioni che si ripetono ALL'INFINITO
}`)}</pre>
  <div class="grid2"><div class="callout"><b>setup</b> = “preparazione”. Si dice ad Arduino quali pin ascoltano e quali comandano.</div><div class="callout ok"><b>loop</b> = “giro”. Finito l’ultimo comando, ricomincia dal primo. Per sempre.</div></div>`,
  act:{type:'quiz',q:'Quale parte si ripete all’infinito?',opts:[['loop()',1,'Sì: loop vuol dire giro.'],['setup()',0,'setup si esegue una volta sola.'],['Tutte e due',0,'Solo loop si ripete.']],skill:'codice'}},
 {t:'Le prime istruzioni',h:`<div class="codebox"><code>pinMode(12, OUTPUT);</code><span>il pin 12 comanda (nel setup)</span><code>digitalWrite(12, HIGH);</code><span>5 V sul pin 12: LED acceso</span><code>digitalWrite(12, LOW);</code><span>0 V sul pin 12: LED spento</span><code>delay(1000);</code><span>aspetta 1000 ms = 1 secondo</span></div>
  <div class="callout warn">Ogni istruzione finisce con il <b>punto e virgola ;</b>. Arduino distingue le <b>maiuscole</b>: <code>digitalWrite</code> sì, <code>digitalwrite</code> no.</div>`,
  act:{type:'classify',q:'Scritto bene o scritto male?',bins:['Giusto','Sbagliato'],items:[['digitalWrite(12, HIGH);',0,'Perfetto.'],['digitalwrite(12, HIGH);',1,'La W va maiuscola: digitalWrite.'],['delay(500)',1,'Manca il punto e virgola.'],['pinMode(12, OUTPUT);',0,'Giusto.']],skill:'codice'}},
 {t:'Le variabili: scatole con un nome',h:`<p class="lead">Invece di scrivere sempre il numero del pin, gli diamo un <b>nome</b>:</p>
  <pre class="code0">${hl(`int ledRosso = 12;   // una scatola "ledRosso" che contiene 12`)}</pre>
  <p><code>int</code> vuol dire numero intero. Le variabili si scrivono <b>in alto</b>, prima di setup.</p>
  <ul class="big"><li>Il nome non ha spazi né accenti: <code>ledRosso</code>, non <code>led rosso</code>.</li><li>Se cambi pin nel circuito, cambi una riga sola.</li></ul>`,
  act:{type:'quiz',q:'Quale riga crea bene una variabile per il pulsante sul pin 2?',opts:[['int pulsante = 2;',1,'Giusto: tipo, nome, valore e punto e virgola.'],['int pulsante 2;',0,'Manca l’uguale.'],['pulsante = 2',0,'Manca int e manca il punto e virgola.']],skill:'codice'}},
 {t:'I commenti //',h:`<p class="lead">Dopo <code>//</code> puoi scrivere quello che vuoi: Arduino lo ignora. È una nota per chi legge.</p>
  <pre class="code0">${hl(`digitalWrite(ledRosso, HIGH);   // accendo il LED rosso`)}</pre>
  <div class="callout warn">Nella verifica <b>ogni riga va commentata</b>: il codice senza commenti <b>perde punti</b>. Scrivi cosa fa la riga, con parole tue.</div>`,
  act:{type:'quiz',q:'Qual è il commento migliore per <code>delay(2000);</code>?',opts:[['// aspetto 2 secondi',1,'Chiaro e giusto: 2000 ms = 2 s.'],['// delay',0,'Ripete la parola, non spiega niente.'],['// aspetto 2000 secondi',0,'delay conta in millisecondi: 2000 ms = 2 secondi.']]}},
 {t:'Prova: il LED che lampeggia',h:`<p>Ecco il programma più famoso: <b>Blink</b>. Premi <b>▶ Avvia</b> e guarda il LED. Poi prova il <b>🐢 rallentatore</b>: vedrai la riga che Arduino sta eseguendo.</p>`,
  act:{type:'run',demo:'blink',need:'run',hint:'Avvia la simulazione almeno una volta.',skill:'codice'}},
 {t:'Quanto dura un delay?',h:`<p class="lead"><code>delay</code> conta in <b>millisecondi</b> (ms): 1000 ms = 1 secondo.</p>
  <div class="codebox"><code>delay(250);</code><span>un quarto di secondo</span><code>delay(500);</code><span>mezzo secondo</span><code>delay(2000);</code><span>2 secondi</span><code>delay(3000);</code><span>3 secondi</span></div>`,
  act:{type:'fill',q:'Il semaforo deve restare giallo per 2 secondi. Completa.',code:'digitalWrite(ledGiallo, HIGH);\ndelay(___);',opts:['2000','2','200'],ok:0,why:['Giusto: 2 secondi = 2000 ms.','2 ms! Non lo vedresti nemmeno.','200 ms è un quinto di secondo.']}}
]},
{id:4,icon:'🖥',title:'Il Monitor seriale',sub:'Arduino scrive sul computer',min:8,ex:[],slides:[
 {t:'Arduino ti scrive',h:`<p class="lead">Il <b>Monitor seriale</b> è una finestra dove Arduino scrive messaggi. In Tinkercad lo apri dal pannello del codice.</p>
  <div class="codebox"><code>Serial.begin(9600);</code><span>nel setup: apre la comunicazione</span><code>Serial.println("CIAO");</code><span>scrive CIAO e va a capo</span><code>Serial.print("Volta ");</code><span>scrive e resta sulla stessa riga</span></div>
  <div class="callout warn">Il testo va <b>tra virgolette doppie</b> "così". Senza <code>Serial.begin</code> il monitor resta vuoto.</div>`,
  act:{type:'quiz',q:'Hai scritto Serial.println("CIAO"); ma il monitor è vuoto. Cosa manca?',opts:[['Serial.begin(9600); nel setup',1,'Esatto: senza begin la comunicazione è chiusa.'],['Un delay',0,'Il delay non c’entra.'],['Le virgolette',0,'Le virgolette ci sono già.']],skill:'seriale'}},
 {t:'print o println?',h:`<p><code>ln</code> sta per <i>line</i>, riga: <code>println</code> va a capo dopo aver scritto, <code>print</code> no.</p>
  <pre class="code0">${hl(`Serial.print("Volta numero ");     // resto sulla riga
Serial.println(3);                  // scrivo 3 e vado a capo`)}</pre>
  <p>Sul monitor compare: <code>Volta numero 3</code>. È il trucco per scrivere un testo seguito da un numero.</p>
  <div class="callout">Un numero o una variabile si scrivono <b>senza</b> virgolette: <code>Serial.println(volte);</code></div>`,
  act:{type:'quiz',q:'Cosa scrive <code>Serial.println("conta");</code>?',opts:[['La parola conta',1,'Sì: tra virgolette è testo. Per il valore della variabile si scrive Serial.println(conta);'],['Il valore della variabile conta',0,'Con le virgolette è un testo, non la variabile.'],['Niente',0,'Scrive la parola tra virgolette.']],skill:'seriale'}},
 {t:'Prova il Monitor seriale',h:`<p>Avvia la simulazione e guarda il Monitor seriale sotto il codice. Quante volte compare “Ciao, sono Arduino!”? E perché?</p>`,
  act:{type:'run',demo:'ciao',need:'run',after:{q:'Quante volte compare “Ciao, sono Arduino!”?',opts:[['Una sola: è nel setup',1,'Giusto: il setup si esegue una volta, il loop invece continua a scrivere.'],['Una volta al secondo',0,'Quello è il messaggio del loop.']]},skill:'seriale'}}
]},
{id:5,icon:'🔘',title:'Il pulsante',sub:'digitalRead e la resistenza di pull-down',min:14,ex:[],slides:[
 {t:'Il pulsante è un ponte',h:`<p class="lead">Il pulsante ha 4 gambe in 2 coppie. Quando lo <b>premi</b> unisce le due coppie e la corrente passa. Quando lo <b>lasci</b>, una molla lo riapre.</p>
  <div class="ill" data-ill="btn"></div>
  <div class="callout">Sulla breadboard si mette <b>a cavallo della scanalatura</b>: così le due coppie stanno in colonne diverse.</div>`,
  act:{type:'quiz',q:'Cosa succede quando lasci il pulsante?',opts:[['Si riapre e la corrente si ferma',1,'Esatto: il contatto è chiuso solo mentre premi.'],['Resta chiuso',0,'Quello è un interruttore. Il pulsante torna su da solo.']],skill:'pulsante'}},
 {t:'Arduino ascolta: digitalRead',h:`<p class="lead"><code>digitalRead(pin)</code> chiede: “su questo pin arriva il 5V?”</p>
  <div class="codebox"><code>pinMode(pulsante, INPUT);</code><span>nel setup: il pin ascolta</span><code>stato = digitalRead(pulsante);</code><span>nel loop: leggo e metto il risultato in stato</span></div>
  <ul class="big"><li><b>HIGH</b> (1) = arriva il 5V = premuto</li><li><b>LOW</b> (0) = non arriva niente = rilasciato</li></ul>`,
  act:{type:'fill',q:'Completa la lettura del pulsante.',code:'stato = ___(pulsante);',opts:['digitalRead','digitalWrite','pinMode'],ok:0,why:['Giusto: Read = leggi.','Write scrive, non legge.','pinMode dice solo il modo del pin, nel setup.'],skill:'pulsante'}},
 {t:'Il problema del pin “in aria”',h:`<p class="lead">Colleghiamo il pulsante tra 5V e pin 2, <b>senza nient’altro</b>. Quando non premi, il pin non è collegato a niente: si dice <b>flottante</b>.</p>
  <p>Avvia e guarda il Monitor seriale <b>senza premere</b>. Che numeri escono?</p>`,
  act:{type:'run',demo:'float',need:'run',after:{q:'Senza premere, che cosa legge il pin?',opts:[['Valori a caso: un po’ 1 e un po’ 0',1,'Proprio così: il pin flottante capta disturbi e legge a caso.'],['Sempre 0',0,'Guarda meglio il monitor: escono anche degli 1.']]},skill:'pulsante'}},
 {t:'La soluzione: pull-down da 10 kΩ',h:`<p class="lead">Mettiamo una resistenza da <b>10 kΩ tra il pin e GND</b>. Si chiama <b>pull-down</b> (“tirare giù”).</p>
  <div class="ill" data-ill="float"></div>
  <ul class="big"><li>Non premi: il pin è collegato a GND attraverso la resistenza → legge <b>LOW</b>, sempre.</li><li>Premi: arriva il 5V, che “vince” sulla resistenza → legge <b>HIGH</b>.</li></ul>
  <div class="callout warn">Perché una resistenza e non un filo? Con un filo, premendo, il 5V andrebbe dritto a GND: cortocircuito.</div>`,
  act:{type:'quiz',q:'Dove va la resistenza da 10 kΩ?',opts:[['Tra il pin del pulsante e GND',1,'Giusto: è la pull-down.'],['Tra il LED e GND',0,'Lì va la 220 Ω del LED.'],['Tra 5V e GND',0,'Così non serve a niente e scalda.']],skill:'pulsante'}},
 {t:'Prova con la pull-down',h:`<p>Stesso programma, ma ora il pulsante ha la sua resistenza. Avvia e guarda il monitor. Poi <b>tieni premuto</b> il pulsante (col mouse sul pulsante rosso o con il tasto 👆).</p>`,
  act:{type:'run',demo:'pulldown',need:'press',hint:'Avvia e tieni premuto il pulsante almeno una volta.',skill:'pulsante'}},
 {t:'Come si monta, pezzo per pezzo',h:`<div class="ill" data-ill="build"></div>`,
  act:{type:'order',q:'Il giro del pulsante: rimettilo in ordine, da 5V fino a GND.',items:['5V','Prima coppia di gambe del pulsante','Seconda coppia (che va al pin 2)','Resistenza da 10 kΩ','GND'],ok:'Esatto. E dal punto tra pulsante e resistenza parte il filo per il pin.',skill:'pulsante'}}
]},
{id:6,icon:'🔀',title:'if / else: Arduino decide',sub:'Condizioni, == e la logica al contrario',min:14,ex:['p1'],slides:[
 {t:'Se… altrimenti…',h:`<p class="lead">Con <b>if</b> (“se”) ed <b>else</b> (“altrimenti”) Arduino sceglie cosa fare.</p>
  <pre class="code0">${hl(`if (stato == HIGH) {         // SE il pulsante è premuto...
  digitalWrite(ledBlu, HIGH);  // ...accendo
} else {                     // ALTRIMENTI...
  digitalWrite(ledBlu, LOW);   // ...spengo
}`)}</pre>
  <p>È proprio il <b>rombo</b> dei diagrammi di flusso: una domanda, due strade.</p>`,
  act:{type:'quiz',q:'Cosa vuol dire else?',opts:[['Altrimenti',1,'Sì: la strada di quando la condizione è falsa.'],['Allora',0,'else vuol dire altrimenti.'],['Ancora',0,'Non ripete niente: è l’altra strada.']],skill:'ifelse'}},
 {t:'Uno o due uguali?',h:`<div class="grid2"><div class="callout"><b>=</b> metti dentro<br><code>stato = HIGH;</code><br>mette HIGH nella scatola</div><div class="callout ok"><b>==</b> fai una domanda<br><code>stato == HIGH</code><br>chiede: vale HIGH?</div></div>
  <div class="callout warn">Nell’if si usano <b>sempre due uguali</b>. E dopo la parentesi dell’if <b>non</b> va il punto e virgola.</div>`,
  act:{type:'classify',q:'Giusto o sbagliato?',bins:['Giusto','Sbagliato'],items:[['if (stato == HIGH) {',0,'Perfetto.'],['if (stato = HIGH) {',1,'Un solo =: non è una domanda.'],['if (stato == HIGH); {',1,'Il ; dopo la parentesi chiude l’if subito.'],['stato = digitalRead(pulsante);',0,'Qui un solo = è giusto: metti il valore letto nella scatola.']],skill:'ifelse'}},
 {t:'Prova: la spia blu',h:`<p>Tieni premuto il pulsante e guarda LED e monitor. Poi accendi il 🐢 rallentatore: vedrai quale strada prende Arduino, l’if o l’else.</p>`,
  act:{type:'run',demo:'spia',need:'press',skill:'ifelse'}},
 {t:'Il programma, riga per riga',h:`<p>Rimetti in ordine il loop della spia. Poi è il turno del <b>laboratorio</b>.</p>`,
  act:{type:'order',q:'Metti in ordine le righe del loop.',items:['stato = digitalRead(pulsante);','if (stato == HIGH) {','  digitalWrite(ledBlu, HIGH);','} else {','  digitalWrite(ledBlu, LOW);','}'],ok:'Esatto: prima leggi, poi decidi.',skill:'ifelse',mono:1}},
 {t:'La logica al contrario',h:`<p class="lead">E se il LED dovesse essere acceso quando <b>non</b> premi?</p>
  <p>Il pulsante e i messaggi non cambiano. Cambiano solo le due righe che comandano il LED:</p>
  <pre class="code0">${hl(`if (stato == HIGH) {
  digitalWrite(ledBlu, LOW);    // CAMBIATA: premuto = spento
  Serial.println("SI");
} else {
  digitalWrite(ledBlu, HIGH);   // CAMBIATA: rilasciato = acceso
  Serial.println("NO");
}`)}</pre>
  <div class="callout">Se ti chiedono “quali righe hai cambiato”, scrivi proprio quelle righe, con il numero di riga.</div>`,
  act:{type:'quiz',q:'Quante righe hai cambiato?',opts:[['Due: le due digitalWrite del LED',1,'Esatto: HIGH e LOW scambiati, una nell’if e una nell’else.'],['Una: il pinMode',0,'Il pinMode resta uguale: il pulsante ascolta sempre.'],['Tutte',0,'Basta scambiare HIGH e LOW nelle due digitalWrite.']],skill:'ifelse'}}
]},
{id:7,icon:'⏱',title:'Il tempo e il delay',sub:'Lampeggiare, e cosa fa Arduino mentre aspetta',min:14,ex:['p2','p4'],slides:[
 {t:'Far lampeggiare un LED',h:`<p class="lead">Un lampeggio è fatto di <b>quattro pezzi</b>:</p>
  <pre class="code0">${hl(`digitalWrite(ledGiallo, HIGH);  // acceso
delay(300);                     // aspetto 300 ms
digitalWrite(ledGiallo, LOW);   // spento
delay(300);                     // aspetto 300 ms`)}</pre>
  <p>Se mancasse l’ultimo delay, il LED si riaccenderebbe subito: sembrerebbe sempre acceso.</p>`,
  act:{type:'order',q:'Metti in ordine il lampeggio 300 / 300.',items:['digitalWrite(ledGiallo, HIGH);','delay(300);','digitalWrite(ledGiallo, LOW);','delay(300);'],ok:'Giusto: acceso, attesa, spento, attesa.',mono:1,skill:'delay'}},
 {t:'Un LED resta come lo lasci',h:`<p class="lead">Quando scrivi <code>digitalWrite(ledVerde, HIGH);</code> il verde resta acceso <b>finché non scrivi LOW</b>.</p>
  <p>Per questo, se a riposo c’è un LED verde acceso e quando premi ne lampeggia un altro:</p><ul class="big"><li>nell’<b>if</b> spegni il verde (altrimenti resta acceso dal giro prima);</li><li>nell’<b>else</b> spegni il rosso.</li></ul>`,
  act:{type:'quiz',q:'Nell’if (pulsante premuto) dimentichi digitalWrite(ledVerde, LOW). Cosa succede?',opts:[['Il verde resta acceso anche mentre l’altro LED lampeggia',1,'Sì: nessuno lo spegne.'],['Il verde si spegne da solo',0,'I LED non si spengono da soli.'],['Il programma non parte',0,'Il programma parte, ma fa una cosa sbagliata.']],skill:'delay'}},
 {t:'Mentre aspetta, Arduino è sordo',h:`<p class="lead">Durante un <code>delay</code> Arduino <b>si ferma</b>: non legge il pulsante, non fa niente. Il pulsante lo guarda solo quando torna a <code>digitalRead</code>, all’inizio del loop.</p>
  <div data-ill="delay"></div>`,
  act:{type:'quiz',q:'Il giallo lampeggia (300 + 300 ms) e a riposo c’è il blu. Rilasci il pulsante a metà lampeggio. Quando torna il blu?',opts:[['Dopo un piccolo ritardo, quando il lampeggio finisce e Arduino rilegge il pulsante',1,'Esatto: Arduino se ne accorge solo quando torna a digitalRead.'],['Subito',0,'Durante il delay Arduino non guarda il pulsante.'],['Mai',0,'Al giro dopo legge LOW e riaccende il verde.']],skill:'delay'}},
 {t:'Provalo davvero',h:`<p>Qui i tempi sono lunghi apposta: 1,5 secondi. <b>Tieni premuto</b> il pulsante e lascialo mentre il rosso è acceso. Quanto ci mette a tornare il verde? Con il 🐢 rallentatore vedi la riga del delay.</p>`,
  act:{type:'run',demo:'lento',need:'press',skill:'delay'}}
]},
{id:8,icon:'🚦',title:'Sequenze e contatori',sub:'Tanti passi in fila e una variabile che conta',min:14,ex:['p3'],slides:[
 {t:'Una sequenza dentro l’if',h:`<p class="lead">Quando il pulsante è premuto Arduino può eseguire <b>tanti passi in fila</b>: accendi, aspetta, spegni, accendi un altro…</p>
  <p>Scrivili dall’alto in basso, nell’ordine in cui devono succedere. Un consiglio: <b>numera i passi nei commenti</b>, come nel testo dell’esercizio.</p>
  <pre class="code0">${hl(`delay(2000);                     // 1) il verde resta acceso 2 s
digitalWrite(ledVerde, LOW);     // 2) spengo il verde
digitalWrite(ledGiallo, HIGH);   // 2) accendo il giallo
delay(2000);                     // 2) giallo per 2 s`)}</pre>`,
  act:{type:'order',q:'Un semaforo: rimetti in ordine dopo che hai premuto.',items:['delay(2000);  // verde ancora 2 s','digitalWrite(ledVerde, LOW);','digitalWrite(ledGiallo, HIGH);','delay(2000);  // giallo 2 s','digitalWrite(ledGiallo, LOW);','digitalWrite(ledRosso, HIGH);'],ok:'Perfetto: verde, giallo, rosso.',mono:1,skill:'sequenza'}},
 {t:'Prova la sequenza',h:`<p>Premi il pulsante (basta un attimo) e guarda la sequenza. Prova a premerlo di nuovo <b>mentre</b> è acceso il giallo: succede qualcosa?</p>`,
  act:{type:'run',demo:'sequenza',need:'press',after:{q:'Premendo durante la sequenza, Arduino se ne accorge?',opts:[['No: è dentro i delay e non legge il pulsante',1,'Giusto: il pulsante si legge solo all’inizio del loop.'],['Sì, ricomincia subito',0,'Il pulsante si legge solo all’inizio del loop.']]},skill:'sequenza'}},
 {t:'Ripetere 4 volte',h:`<p class="lead">Per far lampeggiare un LED 4 volte puoi semplicemente <b>copiare</b> le 4 righe del lampeggio <b>4 volte</b>. Va benissimo.</p>
  <p>Chi vuole può usare un ciclo <b>for</b>, che ripete un blocco un certo numero di volte:</p>
  <pre class="code0">${hl(`for (int i = 0; i < 4; i++) {     // ripeto 4 volte
  digitalWrite(ledBianco, HIGH);  // acceso
  delay(250);                       // 250 ms
  digitalWrite(ledBianco, LOW);   // spento
  delay(250);                       // 250 ms
}`)}</pre>`,
  act:{type:'quiz',q:'Copiando il lampeggio 4 volte, quante righe scrivi?',opts:[['16',1,'4 righe × 4 volte = 16 righe. Ognuna con il suo commento!'],['4',0,'Quello è un lampeggio solo.'],['8',0,'Sono 2 lampeggi.']],skill:'sequenza'}},
 {t:'Una variabile che conta',h:`<p class="lead">Per contare quante volte succede qualcosa serve una variabile contatore:</p>
  <pre class="code0">${hl(`int volte = 0;                      // in alto: parte da 0
...
volte = volte + 1;                  // nell'if: una in più
Serial.print("Volta numero ");      // testo, resto sulla riga
Serial.println(volte);              // il numero, poi a capo`)}</pre>
  <p><code>volte = volte + 1</code> si legge da destra: prendo il valore, aggiungo 1, lo rimetto nella scatola.</p>`,
  act:{type:'quiz',q:'volte vale 2. Dopo <code>volte = volte + 1;</code> quanto vale?',opts:[['3',1,'Sì.'],['1',0,'Si aggiunge 1 al valore che c’era.'],['2',0,'Il valore cambia: diventa 3.']],skill:'contatore'}}
]},
{id:9,icon:'📝',title:'Pronti per la verifica',sub:'Come si consegna, gli errori da evitare',min:8,ex:[],slides:[
 {t:'Cosa devi consegnare',h:`<p class="lead">Per <b>ogni esercizio</b>:</p>
  <div class="phases">${['Lo <b>screenshot del circuito</b> in Tinkercad','L’<b>elenco dei pin</b> che hai scelto (es. pulsante → 2, LED rosso → 12)','Il <b>codice</b> copiato, con un <b>commento //</b> su ogni riga','La <b>risposta alla domanda</b>'].map((t,i)=>`<div class="phase" style="--i:${i}"><span>${i+1}</span>${t}</div>`).join('')}</div>
  <div class="callout warn">Prima di consegnare: <b>avvia la simulazione</b> e controlla il <b>Monitor seriale</b>.</div>`,
  act:{type:'tf',q:'Vero o falso?',items:[['Devo consegnare anche l’elenco dei pin.',true,'Vero.'],['Il codice senza commenti va bene lo stesso.',false,'Falso: si perdono punti.'],['Ogni esercizio va in un progetto Tinkercad diverso.',true,'Vero: Crea → Circuito per ognuno.']]}},
 {t:'Gli errori più comuni',h:`<ul class="big"><li><code>if (stato = HIGH)</code> con un solo uguale</li><li>Il <code>;</code> dimenticato a fine riga</li><li><code>digitalwrite</code> con la w minuscola</li><li>Il <code>pinMode</code> dimenticato per un LED</li><li>Testo senza virgolette: <code>Serial.println(CIAO);</code></li><li>LED montato al contrario, o senza resistenza</li><li>Pulsante senza pull-down: legge a caso</li><li>Nel codice un pin diverso da quello del circuito</li></ul>`,
  act:{type:'classify',q:'Errore di circuito o di codice?',bins:['Circuito','Codice'],items:[['Il LED è girato al contrario',0,'È un problema di montaggio.'],['Manca il punto e virgola',1,'È nel codice.'],['Manca la resistenza da 10 kΩ',0,'È un componente del circuito.'],['pinMode(ledVerde, INPUT)',1,'È nel codice: il LED vuole OUTPUT.']],skill:'debug'}},
 {t:'Il metodo in 5 passi',h:`<div class="phases">${['<b>Leggi</b> la tabella: cosa entra, cosa esce, cosa scrive il monitor','<b>Scegli i pin</b> e scrivili su un foglio','<b>Monta</b> il circuito: binari, LED con 220 Ω, pulsante con 10 kΩ','<b>Scrivi</b> variabili, setup, loop. Commenta ogni riga','<b>Prova</b>: premi, rilascia, guarda LED e monitor'].map((t,i)=>`<div class="phase" style="--i:${i}"><span>${i+1}</span>${t}</div>`).join('')}</div>
  <p>Ora ripassa con la <a href="#/ripasso">scheda di ripasso</a> e prova la <a href="#/verifica">verifica simulata</a>: tre esercizi nuovi da fare da solo, con il controllo automatico.</p>`,
  act:{type:'order',q:'Il metodo: in ordine.',items:['Leggo la tabella','Scelgo i pin','Monto il circuito','Scrivo e commento il codice','Provo e guardo il monitor'],ok:'Così non ti perdi. In bocca al lupo!'}}
]}];
