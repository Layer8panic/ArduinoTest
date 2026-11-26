/* =====================================================
   Arduino Lab · SCHEDA DI RIPASSO (per gli studenti)
   tutto quello che serve sapere, in una pagina
   ===================================================== */
"use strict";
const RIP=[
 {ic:'🔌',t:'Il circuito: come si collega ogni pezzo',h:`
  <div class="chain"><span class="pin">5V</span>→<span>binario rosso +</span><span class="gnd" style="margin-left:14px">GND</span>→<span>binario blu −</span></div>
  <div class="ph">Un LED</div>
  <div class="chain"><span class="pin">pin</span>→<span>gamba + (lunga)</span>→<span>💡</span>→<span>gamba −</span>→<span class="r">220 Ω</span>→<span class="gnd">GND</span></div>
  <div class="ph">Il pulsante</div>
  <div class="chain"><span class="pin">5V</span>→<span>🔘 pulsante (a cavallo della scanalatura)</span>→<span class="pin">pin</span>→<span class="r">10 kΩ</span>→<span class="gnd">GND</span></div>
  <ul><li>Ogni LED ha la <b>sua</b> resistenza da 220 Ω.</li><li>Usa i pin da <b>2 a 13</b>: 0 e 1 servono al Monitor seriale.</li><li>Scrivi su un foglio quale pin hai dato a ogni componente: è l’<b>elenco dei pin</b> da consegnare.</li><li>Nel codice i numeri dei pin devono essere <b>gli stessi</b> del circuito.</li></ul>`},
 {ic:'📜',t:'Le istruzioni da sapere',h:`<div class="tblwrap"><table class="tbl"><tr><th>Istruzione</th><th>Dove</th><th>Cosa fa</th></tr>
  <tr><td><code>int ledVerde = 11;</code></td><td>in alto</td><td>crea una variabile con il numero del pin</td></tr>
  <tr><td><code>pinMode(pin, OUTPUT);</code></td><td>setup</td><td>il pin comanda (LED)</td></tr>
  <tr><td><code>pinMode(pin, INPUT);</code></td><td>setup</td><td>il pin ascolta (pulsante)</td></tr>
  <tr><td><code>Serial.begin(9600);</code></td><td>setup</td><td>accende il Monitor seriale</td></tr>
  <tr><td><code>stato = digitalRead(pin);</code></td><td>loop</td><td>legge il pulsante: HIGH premuto, LOW rilasciato</td></tr>
  <tr><td><code>digitalWrite(pin, HIGH);</code></td><td>loop</td><td>LED acceso (LOW = spento)</td></tr>
  <tr><td><code>delay(1000);</code></td><td>loop</td><td>aspetta 1000 ms = 1 secondo</td></tr>
  <tr><td><code>Serial.println("TESTO");</code></td><td>loop</td><td>scrive e va a capo</td></tr>
  <tr><td><code>Serial.print("TESTO ");</code></td><td>loop</td><td>scrive e resta sulla riga</td></tr></table></div>`},
 {ic:'🧩',t:'Gli schemi di codice che ritornano',h:`
  <div class="ph">1 · Leggo il pulsante e decido</div><pre class="code0">${hl(`stato = digitalRead(pulsante);   // leggo
if (stato == HIGH) {             // premuto
  // cosa succede quando premo
} else {                         // rilasciato
  // la situazione normale
}`)}</pre>
  <div class="ph">2 · Un lampeggio (va dentro l’if: si ripete finché premi)</div><pre class="code0">${hl(`digitalWrite(led, HIGH);   // acceso
delay(300);                // tempo acceso
digitalWrite(led, LOW);    // spento
delay(300);                // tempo spento`)}</pre>
  <div class="ph">3 · Una sequenza con i tempi (passi numerati nei commenti)</div><pre class="code0">${hl(`delay(1000);                   // 1) resta tutto com'è per 1 s
digitalWrite(ledVerde, LOW);   // 2) spengo il verde
digitalWrite(ledGiallo, HIGH); // 2) accendo il giallo
delay(1000);                   // 2) giallo per 1 s`)}</pre>
  <div class="ph">4 · Ripetere un lampeggio N volte</div><p>Copia le 4 righe del lampeggio N volte, oppure:</p><pre class="code0">${hl(`for (int i = 0; i < 3; i++) {  // ripeto 3 volte
  digitalWrite(led, HIGH);     // acceso
  delay(200);                  // 200 ms
  digitalWrite(led, LOW);      // spento
  delay(200);                  // 200 ms
}`)}</pre>
  <div class="ph">5 · Contare e scrivere il numero</div><pre class="code0">${hl(`int volte = 0;                  // in alto, fuori dal loop
volte = volte + 1;              // nell'if: uno in più
Serial.print("Volta numero ");  // testo, resto sulla riga
Serial.println(volte);          // numero, poi a capo`)}</pre>`},
 {ic:'💡',t:'I concetti da saper spiegare',h:`
  <div class="dsteps">
   <div><b>Pin flottante e pull-down</b><p>Se il pulsante è collegato solo tra 5V e pin, quando non premi il pin non è collegato a niente: si dice <b>flottante</b> e legge HIGH e LOW a caso. La resistenza da 10 kΩ tra pin e GND (<b>pull-down</b>) lo tiene a LOW; quando premi arriva il 5V e legge HIGH. Con un filo al posto della resistenza, premendo, faresti un cortocircuito.</p></div>
   <div><b>Durante un delay Arduino non fa altro</b><p>Mentre aspetta, Arduino non legge il pulsante e non cambia i LED. Il pulsante viene letto solo quando il programma arriva a <code>digitalRead</code>, cioè all’inizio del loop. Quindi una reazione può arrivare in ritardo, al massimo di tutti i delay che ci sono nel giro.</p></div>
   <div><b>Durante una sequenza lunga</b><p>Se dentro l’if c’è una sequenza di più secondi, per tutto quel tempo nessuno guarda il pulsante: una pressione breve in quel momento va persa. Se invece lo tieni premuto fino alla fine, al giro dopo la sequenza riparte.</p></div>
   <div><b>Un LED resta come lo lasci</b><p>Dopo <code>digitalWrite(led, HIGH)</code> il LED resta acceso finché non scrivi LOW. Per questo nell’if spegni i LED della situazione normale, e nell’else spegni quelli che lampeggiano.</p></div>
   <div><b>Logica al contrario</b><p>Per avere il LED acceso quando <i>non</i> premi, scambi HIGH e LOW nelle <code>digitalWrite</code> del LED. Esiste anche <code>INPUT_PULLUP</code>: il pulsante va a GND senza resistenza esterna, ma allora premuto = LOW.</p></div>
   <div><b>Perché le variabili si scrivono in alto</b><p>Le variabili fuori da setup e loop ricordano il loro valore. Un contatore scritto dentro il loop ripartirebbe da 0 a ogni giro.</p></div></div>`},
 {ic:'🐞',t:'Errori da non fare',h:`<ul class="big"><li><code>if (stato = HIGH)</code>: nell’if servono <b>due uguali</b> ==</li><li><code>if (...);</code>: niente punto e virgola dopo la parentesi dell’if</li><li>Punto e virgola dimenticato a fine riga</li><li><code>digitalwrite</code>: maiuscole e minuscole contano</li><li>Testo senza virgolette: <code>Serial.println(CIAO);</code></li><li>Un LED senza il suo <code>pinMode(..., OUTPUT)</code></li><li>LED girato al contrario, o senza resistenza</li><li>Pulsante senza pull-down</li><li>Delay sbagliato: <code>delay(2)</code> sono 2 millisecondi, non 2 secondi</li><li>Il secondo delay del lampeggio dimenticato: il LED sembra sempre acceso</li></ul>`},
 {ic:'✅',t:'Prima di consegnare',h:`<div class="phases">${['Ogni esercizio in un progetto Tinkercad diverso (Crea → Circuito)','<b>Screenshot</b> del circuito','<b>Elenco dei pin</b> che hai scelto','Il <b>codice</b> copiato, con un commento <code>//</code> su ogni riga','La <b>risposta alla domanda</b>, con parole tue','Hai avviato la simulazione, premuto, rilasciato e guardato il <b>Monitor seriale</b>?'].map((t,i)=>`<div class="phase" style="--i:${i}"><span>${i+1}</span>${t}</div>`).join('')}</div>`}];

/* domande lampo di autoverifica */
const RIPQ=[
 {q:'Il pulsante non è premuto e manca la resistenza da 10 kΩ. Cosa legge il pin?',opts:[['Valori a caso',1,'Sì: il pin è flottante.'],['Sempre LOW',0,'Senza pull-down nessuno lo tiene a LOW.'],['Sempre HIGH',0,'Il 5V arriva solo quando premi.']]},
 {q:'Che resistenza va con ogni LED?',opts:[['220 Ω',1,'Giusto.'],['10 kΩ',0,'Quella è per il pulsante.'],['Nessuna',0,'Il LED si brucerebbe.']]},
 {q:'Quale riga è giusta?',opts:[['if (stato == HIGH) {',1,'Perfetto.'],['if (stato = HIGH) {',0,'Un solo uguale non fa una domanda.'],['if (stato == HIGH); {',0,'Il punto e virgola chiude l’if.']]},
 {q:'Un lampeggio 400 / 400 ms dentro l’if. Lasci il pulsante: quanto può passare, al massimo, prima che Arduino se ne accorga?',opts:[['Circa 800 ms',1,'Sì: deve finire i due delay e tornare a digitalRead.'],['Zero',0,'Durante i delay non legge il pulsante.'],['400 ms sempre',0,'Dipende da quando lo lasci: al massimo i due delay.']]},
 {q:'Vuoi scrivere “Volta numero 5” su una sola riga. Come?',opts:[['Serial.print("Volta numero "); poi Serial.println(volte);',1,'Giusto: print resta sulla riga, println va a capo.'],['Serial.println("Volta numero "); poi Serial.println(volte);',0,'Il numero finirebbe sulla riga sotto.'],['Serial.println("Volta numero volte");',0,'Così scrivi la parola “volte”, non il numero.']]},
 {q:'Un LED è acceso. Che cosa lo spegne?',opts:[['digitalWrite(led, LOW);',1,'Sì: finché non lo scrivi resta acceso.'],['Il delay finisce',0,'Il delay aspetta e basta.'],['Il loop ricomincia',0,'Il loop non spegne niente da solo.']]},
 {q:'Dove scrivi int volte = 0; per contare?',opts:[['In alto, fuori da setup e loop',1,'Così ricorda il valore.'],['Dentro il loop',0,'Ripartirebbe da 0 a ogni giro.'],['Dentro l’if',0,'Ripartirebbe da 0 a ogni pressione.']]},
 {q:'Quale pin eviti se usi il Monitor seriale?',opts:[['Il pin 1',1,'Sì: 0 e 1 servono alla comunicazione col computer.'],['Il pin 13',0,'Il 13 va bene.'],['Il pin 2',0,'Il 2 va benissimo.']]}];

function ripasso(){
  main.innerHTML=`<h2>📒 Ripasso</h2><p class="muted">Tutto quello che serve per la verifica, in una pagina. Aprila prima di cominciare e tienila sotto mano mentre ti alleni.</p>
  ${RIP.map((r,i)=>`<details class="card rip"${i<1?' open':''}><summary><span aria-hidden="true">${r.ic}</span> <b>${r.t}</b></summary><div class="ripb">${r.h}</div></details>`).join('')}
  <section class="card"><h3>⚡ Mettiti alla prova</h3><p class="muted small">Otto domande veloci. Se sbagli, leggi il perché e riprova.</p><div data-q></div><p class="small muted" data-qn></p></section>
  <div class="row"><a class="btn pri" href="#/verifica">📝 Vai alla verifica simulata</a><a class="btn" href="#/banco">🛠 Apri il Banco</a></div>`;
  annotate(main);let k=0;const box=$('[data-q]',main),qn=$('[data-qn]',main);
  const next=()=>{if(k>=RIPQ.length){box.innerHTML='<p class="callout ok">🎉 Tutte giuste! Sei pronto per la verifica simulata.</p>';qn.textContent='';confetti();return}
    qn.textContent=`Domanda ${k+1} di ${RIPQ.length}`;box.innerHTML='<div class="act"></div>';const a=$('.act',box);mountAct(a,{type:'quiz',...RIPQ[k]},()=>{k++;const b=document.createElement('button');b.className='btn pri';b.style.marginTop='10px';b.textContent=k<RIPQ.length?'Prossima →':'Fine';b.onclick=next;a.appendChild(b)})};
  next()}
