/* =====================================================
   Arduino Lab · ESERCIZI DEL LABORATORIO
   p* = allenamento (simili alla verifica)   v* = esercizi della verifica
   Ogni esercizio: analisi → circuito → codice riga per riga → prova → errore → domanda
   ===================================================== */
"use strict";
/* L = riga che lo studente deve scegliere, A = riga che il tutor scrive da solo */
const L=(c,cm,why,wrong,say)=>({c,cm,why,wrong:wrong||[],say});
const A=(c,cm,say)=>({c,cm,auto:true,say});
/* commento automatico per le righe ripetute (nel compito ogni riga va commentata) */
const bareLine=t=>!t||/^[{}]+;?$/.test(t)||t.startsWith('//')||/^(void\s+\w+\s*\(\s*\)\s*\{?|\}?\s*else\s*\{?)$/.test(t);
function autoCm(t){let m;
  if(m=t.match(/pinMode\((\w+),\s*(INPUT_PULLUP|INPUT|OUTPUT)\)/))return m[2]==='OUTPUT'?`${m[1]} comanda (uscita)`:`${m[1]} ascolta (ingresso)`;
  if(m=t.match(/digitalWrite\((\w+),\s*(HIGH|LOW)\)/))return (m[2]==='HIGH'?'accendo ':'spengo ')+m[1];
  if(m=t.match(/delay\((\d+)\)/))return `aspetto ${m[1]} ms`;
  return 'istruzione'}
const codeOf=lines=>{lines.forEach(l=>{if(!l.cm&&!bareLine(l.c.trim()))l.cm=autoCm(l.c.trim())});const w=Math.max(...lines.filter(l=>l.cm).map(l=>l.c.length))+2;return lines.map(l=>l.cm?(l.c.padEnd(Math.min(w,36),' ')+' // '+l.cm):l.c).join('\n')};
/* aiuti per i test sul comportamento (r = risultato di vrun) */
const hasLine=(r,a,b,txt)=>r.lines(a,b).some(l=>l.trim().toUpperCase()===txt.toUpperCase());

/* ---------- parti del circuito (usate dal tutor per costruirlo passo passo) ---------- */
const PARTS={
 p1:[{t:'rails'},{t:'led',color:'giallo',pin:12,col:8},{t:'btn',pin:2,col:18}],
 p2:[{t:'rails'},{t:'led',color:'arancione',pin:12,col:8},{t:'btn',pin:2,col:18}],
 p4:[{t:'rails'},{t:'led',color:'verde',pin:11,col:5},{t:'led',color:'arancione',pin:12,col:10},{t:'btn',pin:2,col:20}],
 s1:[{t:'rails'},{t:'led',color:'blu',pin:7,col:8},{t:'btn',pin:3,col:18}],
 s2:[{t:'rails'},{t:'led',color:'blu',pin:9,col:5},{t:'led',color:'giallo',pin:10,col:10},{t:'btn',pin:3,col:20}],
 s3:[{t:'rails'},{t:'led',color:'verde',pin:6,col:2},{t:'led',color:'giallo',pin:5,col:6},{t:'led',color:'rosso',pin:4,col:10},{t:'led',color:'bianco',pin:7,col:15,label:'campanella'},{t:'btn',pin:3,col:22}],
 p3:[{t:'rails'},{t:'led',color:'rosso',pin:12,col:3},{t:'led',color:'giallo',pin:11,col:7},{t:'led',color:'verde',pin:10,col:11},{t:'btn',pin:2,col:20}]};
function buildParts(parts,k,upto=parts.length){k.R_();parts.slice(0,upto).forEach(p=>{if(p.t==='rails')k.RAILS_();else if(p.t==='led')k.LEDLAB_(p.col,p.color,p.pin,p.label);else if(p.t==='btn')k.BTNPD_(p.col,p.pin);else if(p.t==='btnfloat')k.BTNFLOAT_(p.col,p.pin)})}

/* ---------- righe di codice comuni ---------- */
const W_SEMI=(c)=>[c.replace(/;$/,''),'Manca il punto e virgola ; alla fine: per Arduino è come una frase senza punto.'];

const EXS=[
/* ================= ALLENAMENTO 1 ================= */
{id:'p1',n:1,mod:6,lvl:1,icon:'💡',title:'La lampada da scrivania',skills:['circuito','ifelse','seriale'],
 text:'Quando <mark>premi il pulsante</mark> il <mark>LED giallo</mark> si accende, quando lo <mark>lasci</mark> si spegne. Sul Monitor seriale deve comparire <mark>LUCE ACCESA</mark> oppure <mark>LUCE SPENTA</mark>.',
 table:[['Pulsante','LED giallo','Monitor seriale'],['Premuto','acceso','LUCE ACCESA'],['Rilasciato','spento','LUCE SPENTA']],
 analysis:[
  {q:'Partiamo dall’analisi, come per i diagrammi di flusso. Che cosa <b>entra</b> in Arduino (input)?',opts:[['Il pulsante: Arduino lo ascolta',1],['Il LED giallo',0,'Il LED non dà informazioni ad Arduino: è Arduino che lo comanda. È un’uscita.'],['Il Monitor seriale',0,'Sul monitor Arduino scrive: è un’uscita.']],ok:'Giusto: il pulsante è l’<b>ingresso</b>. Il suo pin sarà in modalità INPUT.'},
  {q:'E che cosa <b>esce</b> (output)? Scegli tutte le risposte giuste.',multi:1,opts:[['Il LED giallo',1],['La scritta sul Monitor seriale',1],['Il pulsante',0,'Il pulsante è un ingresso: lo premi tu, non Arduino.']],ok:'Esatto: Arduino comanda il LED (OUTPUT) e scrive sul monitor.'},
  {q:'Brainstorming: serve una <b>scelta</b> (if / else)?',opts:[['Sì: se il pulsante è premuto faccio una cosa, altrimenti un’altra',1],['No, basta accendere il LED nel setup',0,'Così il LED resterebbe sempre acceso: non ascolteremmo mai il pulsante.'],['Serve solo un delay',0,'Il delay fa aspettare, ma non decide niente.']],ok:'Sì. Due casi (premuto / rilasciato) = un <b>if</b> con il suo <b>else</b>.'}],
 parts:PARTS.p1,
 code:[
  L('int pulsante = 2;','il pulsante è sul pin 2','Una variabile è una scatola con un nome: dentro c’è il numero del pin. Così nel codice scriviamo “pulsante” e non dobbiamo ricordare il 2.',[['int pulsante = 13;','Nel nostro circuito il pulsante è collegato al pin 2, non al 13.'],W_SEMI('int pulsante = 2;'),['pulsante = 2;','Una scatola nuova va creata con il suo tipo davanti: int (numero intero).']]),
  L('int ledGiallo = 12;','il LED giallo è sul pin 12','Un nome chiaro (ledGiallo) aiuta chi legge. I nomi non possono avere spazi.',[['int led giallo = 12;','Un nome non può avere spazi: si scrive ledGiallo.'],['int ledGiallo = 2;','Il pin 2 è già del pulsante. Il LED è sul 12.']]),
  L('int stato = 0;','qui salvo cosa legge il pulsante','Ci serve una terza scatola per ricordare cosa legge il pulsante: HIGH o LOW.',[['int stato;','Meglio dare subito un valore di partenza: int stato = 0;'],['int stato = HIGH;','Partire da HIGH vorrebbe dire “premuto” prima ancora di leggere. Si parte da 0.']]),
  A(''),
  A('void setup() {','','Ora la parte <b>setup()</b>: si esegue una volta sola, all’accensione.'),
  L('  pinMode(pulsante, INPUT);','il pin del pulsante ascolta','INPUT = ingresso: il pin ascolta se arriva il 5V.',[['  pinMode(pulsante, OUTPUT);','OUTPUT vuol dire che il pin comanda. Il pulsante va ascoltato: INPUT.'],['  digitalWrite(pulsante, INPUT);','Per dire se un pin ascolta o comanda si usa pinMode, non digitalWrite.']]),
  L('  pinMode(ledGiallo, OUTPUT);','il pin del LED comanda','OUTPUT = uscita: il pin dà 5 V (acceso) o 0 V (spento).',[['  pinMode(ledGiallo, INPUT);','Il LED va comandato: OUTPUT.'],['  pinMode(12);','pinMode vuole due cose: il pin e il modo.']]),
  L('  Serial.begin(9600);','apro il monitor seriale','Senza Serial.begin il monitor resta vuoto. 9600 è la velocità.',[['  Serial.println(9600);','Così scrivi il numero 9600 sul monitor, ma il monitor non è ancora acceso. Serve Serial.begin.'],['  Serial.begin();','Serial.begin vuole la velocità tra parentesi: 9600.']]),
  A('}'),A(''),
  A('void loop() {','','Ora il <b>loop()</b>: si ripete all’infinito, migliaia di volte al secondo.'),
  L('  stato = digitalRead(pulsante);','leggo il pulsante','digitalRead legge il pin: HIGH se il pulsante è premuto, LOW se no. Il risultato va nella scatola stato.',[['  digitalRead(stato);','Dentro le parentesi ci va il pin da leggere (pulsante), e il risultato va salvato: stato = digitalRead(pulsante);'],['  stato = digitalWrite(pulsante);','digitalWrite scrive, non legge. Per leggere: digitalRead.']]),
  L('  if (stato == HIGH) {','se è premuto...','Nell’if si fa una domanda: si usano due uguali ==.',[['  if (stato = HIGH) {','Con un solo = metti HIGH nella scatola, non fai una domanda. Servono due uguali: ==.'],['  if (stato == HIGH); {','Dopo la parentesi dell’if non va il punto e virgola: chiuderebbe l’if subito.'],['  if (pulsante == HIGH) {','pulsante contiene il numero del pin (2), non quello che legge. Bisogna guardare stato.']]),
  L('    digitalWrite(ledGiallo, HIGH);','accendo il LED','HIGH = 5 V sul pin: il LED si accende.',[['    digitalWrite(ledGiallo, LOW);','LOW spegne. Qui il pulsante è premuto: va acceso.'],['    pinMode(ledGiallo, HIGH);','pinMode si usa nel setup per dire il modo. Per accendere: digitalWrite.']]),
  L('    Serial.println("LUCE ACCESA");','scrivo LUCE ACCESA','Il testo va tra virgolette doppie. println va a capo dopo aver scritto.',[['    Serial.println(LUCE ACCESA);','Senza virgolette Arduino pensa che LUCE e ACCESA siano variabili. Il testo va tra "virgolette".'],['    Serial.println(\'LUCE ACCESA\');','Il testo va tra virgolette doppie "così", non tra apostrofi.']]),
  L('  } else {','altrimenti (rilasciato)...','else vuol dire “altrimenti”: è la strada per quando la condizione è falsa.',[['  } else (stato == LOW) {','Dopo else non si scrive una condizione: è già “tutto il resto”.'],['  else {','Prima di else bisogna chiudere il blocco dell’if con }.']]),
  L('    digitalWrite(ledGiallo, LOW);','spengo il LED','LOW = 0 V: il LED si spegne.',[['    digitalWrite(ledGiallo, HIGH);','Il pulsante è rilasciato: il LED va spento, LOW.']]),
  L('    Serial.println("LUCE SPENTA");','scrivo LUCE SPENTA','',[['    Serial.print("LUCE SPENTA")','Mancano il punto e virgola e il ln: senza println le scritte si attaccano sulla stessa riga.']]),
  A('  }'),
  L('  delay(100);','piccola pausa per non intasare il monitor','Senza pausa il monitor riceverebbe migliaia di righe al secondo. 100 ms non si notano premendo il pulsante.',[['  delay(100000);','100000 ms sono 100 secondi! Arduino si bloccherebbe quasi due minuti.'],['  delay 100;','delay vuole le parentesi: delay(100);']]),
  A('}')],
 tests:[{d:'Pulsante rilasciato: LED giallo spento e LUCE SPENTA',until:1200,check:r=>!r.on('giallo',900)&&hasLine(r,0,1200,'LUCE SPENTA')||'A pulsante rilasciato il LED deve essere spento e il monitor deve scrivere LUCE SPENTA.'},
  {d:'Pulsante premuto: LED giallo acceso e LUCE ACCESA',script:[[400,true]],until:1500,check:r=>r.on('giallo',1200)&&hasLine(r,500,1500,'LUCE ACCESA')||'Tenendo premuto il pulsante il LED deve accendersi e il monitor deve scrivere LUCE ACCESA.'},
  {d:'Lo rilasci: il LED si rispegne',script:[[300,true],[900,false]],until:1600,check:r=>r.on('giallo',800)&&!r.on('giallo',1400)||'Quando lasci il pulsante il LED deve tornare spento.'}],
 variant:{swap:'ledGiallo',swapMsg:['LUCE ACCESA','LUCE SPENTA'],q:'Variante: <b>luce notturna</b>. Ora il LED deve essere acceso quando il pulsante <b>non</b> è premuto e spegnersi quando lo premi. Quali righe cambi?',opts:[['Scambio HIGH e LOW nelle due righe digitalWrite del LED',1],['Cambio il pinMode del pulsante in OUTPUT',0,'Così Arduino smette di ascoltare il pulsante.'],['Tolgo la resistenza da 10 kΩ',0,'Il pin diventerebbe flottante e il LED farebbe come vuole.'],['Cambio i testi del Monitor seriale',0,'I testi devono dire cosa fa la luce: se cambi solo quelli il LED continua a fare come prima.']],
  ok:'Giusto: basta scambiare HIGH e LOW nelle due <code>digitalWrite</code>, una nell’if e una nell’else. Qui i messaggi parlano della luce, quindi scambio anche LUCE ACCESA e LUCE SPENTA.',alt:'Funziona anche lasciare le digitalWrite e cambiare la condizione in <code>if (stato == LOW)</code>: pensa tu a cosa va scambiato in quel caso.'},
 testsB:[{d:'Luce notturna, rilasciato: LED acceso',until:1200,check:r=>r.on('giallo',900)},{d:'Luce notturna, premuto: LED spento',script:[[400,true]],until:1500,check:r=>!r.on('giallo',1200)}],
 need:{leds:['giallo'],btn:true},
 bug:{lines:['int pulsante = 2;','int ledGiallo = 12;','int stato = 0;','','void setup() {','  pinMode(pulsante, OUTPUT);','  pinMode(ledGiallo, OUTPUT);','  Serial.begin(9600);','}','','void loop() {','  stato = digitalRead(pulsante);','  if (stato == HIGH) {','    digitalWrite(ledGiallo, HIGH);','    Serial.println("LUCE ACCESA");','  } else {','    digitalWrite(ledGiallo, LOW);','    Serial.println("LUCE SPENTA");','  }','  delay(100);','}'],bad:6,
  q:'Un compagno ha scritto questo programma. Preme il pulsante ma il LED non si accende mai. <b>Tocca la riga sbagliata.</b>',why:'Il pin del pulsante è in OUTPUT: così Arduino non lo ascolta. Deve essere <code>pinMode(pulsante, INPUT);</code>',hint:'Guarda nel setup: quale pin deve ascoltare?'},
 question:{q:'Domanda di ragionamento: a cosa serve la resistenza da 10 kΩ tra il pin del pulsante e GND?',opts:[['Tiene il pin a LOW quando il pulsante non è premuto, così non legge valori a caso',1],['Protegge il LED',0,'Il LED è protetto dalla sua resistenza da 220 Ω. Quella da 10 kΩ è del pulsante.'],['Fa accendere il LED più forte',0,'Non c’entra con il LED: riguarda il pin del pulsante.']],
  model:'Senza resistenza, quando non premo, il pin non è collegato a niente (flottante) e legge HIGH e LOW a caso. La resistenza da 10 kΩ verso GND (pull-down) lo tiene a LOW; quando premo arriva il 5V e legge HIGH.'}},

/* ================= ALLENAMENTO 2 ================= */
{id:'p2',n:2,mod:7,lvl:2,icon:'🚲',title:'La freccia della bici',skills:['delay','ifelse'],
 text:'Finché <mark>tieni premuto</mark> il pulsante, il <mark>LED arancione lampeggia</mark>: 300 ms acceso, 300 ms spento, e il monitor scrive <mark>FRECCIA</mark>. Quando lo <mark>lasci</mark> il LED è spento e il monitor scrive <mark>SPENTA</mark>.',
 table:[['Pulsante','LED arancione','Monitor seriale'],['Premuto','lampeggia 300 / 300 ms','FRECCIA'],['Rilasciato','spento','SPENTA']],
 analysis:[
  {q:'Come si fa lampeggiare un LED?',opts:[['Acceso, aspetta, spento, aspetta',1],['Acceso e poi spento, senza aspettare',0,'Arduino è velocissimo: senza delay il LED si accenderebbe e spegnerebbe in un milionesimo di secondo. Non lo vedresti.'],['Con delay(300) da solo',0,'Il delay aspetta e basta: bisogna anche accendere e spegnere.']],ok:'Esatto: <code>HIGH</code>, <code>delay(300)</code>, <code>LOW</code>, <code>delay(300)</code>. Quattro righe.'},
  {q:'Dove va il lampeggio?',opts:[['Dentro l’if (pulsante premuto)',1],['Nel setup',0,'Il setup si esegue una volta sola: lampeggerebbe una volta all’accensione.'],['Nell’else',0,'L’else è il caso rilasciato: lì il LED è spento.']],ok:'Sì: ogni giro di loop, se il pulsante è ancora premuto, fa un lampeggio completo. Ecco perché sembra lampeggiare di continuo.'}],
 parts:PARTS.p2,
 code:[
  A('int pulsante = 2;','pulsante sul pin 2'),A('int ledArancione = 12;','LED arancione sul pin 12'),A('int stato = 0;','cosa legge il pulsante'),A(''),
  A('void setup() {','','Variabili e setup sono come nell’esercizio di prima: te li scrivo io.'),A('  pinMode(pulsante, INPUT);','il pulsante ascolta'),A('  pinMode(ledArancione, OUTPUT);','il LED comanda'),A('  Serial.begin(9600);','avvio il monitor'),A('}'),A(''),
  A('void loop() {'),A('  stato = digitalRead(pulsante);','leggo il pulsante'),
  L('  if (stato == HIGH) {','se è premuto...','',[['  if (stato == LOW) {','Premuto vuol dire HIGH.']]),
  L('    Serial.println("FRECCIA");','scrivo FRECCIA','Conviene scriverlo subito, prima del lampeggio.',[['    Serial.println("SPENTA");','Siamo nel caso premuto.']]),
  L('    digitalWrite(ledArancione, HIGH);','accendo','Primo pezzo del lampeggio: acceso.',[['    digitalWrite(ledArancione, LOW);','Si comincia accendendo.']]),
  L('    delay(300);','resto acceso 300 ms','',[['    delay(3);','3 ms: troppo poco, non vedresti niente.'],['    delay(300)','Manca il punto e virgola.']]),
  L('    digitalWrite(ledArancione, LOW);','spengo','',[['    digitalWrite(ledArancione, HIGH);','È già acceso: ora va spento.']]),
  L('    delay(300);','resto spento 300 ms','Senza questa attesa il LED si riaccenderebbe subito al giro dopo e sembrerebbe sempre acceso.',[['    delay(0);','Senza attesa da spento, il LED sembrerebbe sempre acceso.']]),
  L('  } else {','altrimenti...','',[]),
  L('    digitalWrite(ledArancione, LOW);','LED spento','',[['    digitalWrite(ledArancione, HIGH);','Rilasciato: spento.']]),
  L('    Serial.println("SPENTA");','scrivo SPENTA','',[]),
  A('    delay(100);','pausa per il monitor'),A('  }'),A('}')],
 tests:[{d:'Rilasciato: LED spento e SPENTA',until:1200,check:r=>!r.anyOn('arancione',300,1200)&&hasLine(r,0,1200,'SPENTA')},
  {d:'Premuto: il LED lampeggia e scrive FRECCIA',script:[[300,true]],until:2600,check:r=>r.edges('arancione',300,2600).rise>=3&&hasLine(r,300,2600,'FRECCIA')||'Tenendo premuto, il LED deve accendersi e spegnersi più volte.'}],
 need:{leds:['arancione'],btn:true},
 bug:{lines:['void loop() {','  stato = digitalRead(pulsante);','  if (stato == HIGH) {','    Serial.println("FRECCIA");','    digitalWrite(ledArancione, HIGH);','    delay(300);','    digitalWrite(ledArancione, LOW);','  } else {','    digitalWrite(ledArancione, LOW);','    Serial.println("SPENTA");','    delay(100);','  }','}'],bad:7,
  q:'Con questo loop, premendo il pulsante, il LED sembra <b>sempre acceso</b>. Dove manca qualcosa? <b>Tocca la riga dopo la quale manca un’istruzione.</b>',why:'Dopo <code>digitalWrite(ledArancione, LOW);</code> manca <code>delay(300);</code>. Il LED si spegne e si riaccende subito al giro dopo: resta spento per un tempo così breve che non lo vedi.',hint:'Il lampeggio ha quattro pezzi: quale manca?'},
 question:{q:'Mentre il LED lampeggia lasci il pulsante. Quando si spegne del tutto?',opts:[['Dopo un attimo: Arduino deve finire il lampeggio prima di rileggere il pulsante',1],['Subito, nello stesso istante',0,'Durante i delay Arduino aspetta e non guarda il pulsante. Se ne accorge solo al giro dopo.'],['Mai: resta acceso',0,'Al giro dopo digitalRead legge LOW e si va nell’else: il LED si spegne.']],
  model:'Con un piccolo ritardo (al massimo 600 ms): durante i delay Arduino è fermo ad aspettare e non legge il pulsante. Se ne accorge solo quando finisce il lampeggio, torna all’inizio del loop e rifà digitalRead.'}},

/* ================= ALLENAMENTO 3: due LED ================= */
{id:'p4',n:3,mod:7,lvl:2,icon:'🍲',title:'Il forno a microonde',skills:['delay','ifelse','seriale'],
 text:'A riposo (pulsante <mark>rilasciato</mark>) il <mark>LED verde</mark> è acceso fisso e il monitor scrive <mark>PRONTO</mark>. Finché <mark>tieni premuto</mark> il pulsante il forno cuoce: verde spento, <mark>LED arancione lampeggia</mark> 500 ms acceso e 500 ms spento, monitor <mark>CUOCE</mark>.',
 table:[['Pulsante','LED verde','LED arancione','Monitor seriale'],['Rilasciato','acceso fisso','spento','PRONTO'],['Premuto','spento','lampeggia 500 / 500 ms','CUOCE']],
 analysis:[
  {q:'Quanti LED e quante resistenze servono?',opts:[['Due LED, ognuno con la sua resistenza da 220 Ω, più la 10 kΩ del pulsante',1],['Due LED con una resistenza sola',0,'Ogni LED vuole la sua resistenza.'],['Un LED solo',0,'Ci sono il verde e l’arancione.']],ok:'Giusto. Due LED = due pin in OUTPUT e due variabili con il nome del colore.'},
  {q:'Dove va il lampeggio dell’arancione? E il verde fisso?',opts:[['Lampeggio nell’if (premuto), verde fisso nell’else (rilasciato)',1],['Tutto nell’if',0,'Il verde fisso è la situazione di riposo: va nell’else.'],['Tutto nel setup',0,'Il setup si esegue una sola volta.']],ok:'Esatto: due casi, due blocchi.'},
  {q:'Nell’if, cosa conviene fare per <b>primo</b>?',opts:[['Spegnere il verde',1],['Accendere il verde',0,'Mentre cuoce il verde deve essere spento.'],['Niente di speciale',0,'Il verde è rimasto acceso dal giro prima: se non lo spegni tu, resta acceso.']],ok:'Sì: un LED resta come l’hai lasciato. Per lo stesso motivo nell’else spegneremo l’arancione.'}],
 parts:PARTS.p4,
 code:[
  A('int pulsante = 2;','pulsante sul pin 2'),
  L('int ledVerde = 11;','LED verde sul pin 11','',[['int ledVerde = 12;','Il 12 è l’arancione.']]),
  L('int ledArancione = 12;','LED arancione sul pin 12','',[['int led arancione = 12;','I nomi non hanno spazi.']]),
  A('int stato = 0;','cosa legge il pulsante'),A(''),A('void setup() {'),A('  pinMode(pulsante, INPUT);','il pulsante ascolta'),
  L('  pinMode(ledVerde, OUTPUT);','il verde comanda','Due LED, due pinMode.',[['  pinMode(ledVerde, INPUT);','È un LED: OUTPUT.']]),
  L('  pinMode(ledArancione, OUTPUT);','l’arancione comanda','',[]),
  A('  Serial.begin(9600);','avvio il monitor'),A('}'),A(''),A('void loop() {'),A('  stato = digitalRead(pulsante);','leggo il pulsante'),
  L('  if (stato == HIGH) {','premuto: cuoce','',[['  if (stato == HIGH); {','Il punto e virgola dopo la parentesi chiude l’if subito.']]),
  L('    digitalWrite(ledVerde, LOW);','spengo il verde','',[]),
  L('    Serial.println("CUOCE");','scrivo CUOCE','',[]),
  L('    digitalWrite(ledArancione, HIGH);','arancione acceso...','',[]),
  L('    delay(500);','...per 500 ms','',[['    delay(5);','500, non 5.']]),
  L('    digitalWrite(ledArancione, LOW);','arancione spento...','',[]),
  L('    delay(500);','...per 500 ms','',[]),
  L('  } else {','rilasciato: pronto','',[]),
  L('    digitalWrite(ledArancione, LOW);','l’arancione resta spento','Se lasci il pulsante proprio mentre l’arancione è acceso, qui lo spegni.',[]),
  L('    digitalWrite(ledVerde, HIGH);','verde acceso fisso','',[]),
  L('    Serial.println("PRONTO");','scrivo PRONTO','',[]),
  A('    delay(100);','pausa per il monitor'),A('  }'),A('}')],
 tests:[{d:'Rilasciato: verde acceso, arancione spento, PRONTO',until:1200,check:r=>r.on('verde',900)&&!r.anyOn('arancione',200,1200)&&hasLine(r,0,1200,'PRONTO')},
  {d:'Premuto: verde spento, arancione che lampeggia, CUOCE',script:[[400,true],[3600,false]],until:4400,check:r=>!r.anyOn('verde',900,3500)&&r.edges('arancione',500,3600).rise>=3&&hasLine(r,400,3700,'CUOCE')||'Mentre premi il verde va spento e l’arancione deve accendersi e spegnersi più volte (500 + 500 ms).'},
  {d:'Lo rilasci: torna il verde e l’arancione si spegne',script:[[400,true],[2000,false]],until:3600,check:r=>r.on('verde',3400)&&!r.on('arancione',3400)}],
 need:{leds:['verde','arancione'],btn:true},
 bug:{lines:['void loop() {','  stato = digitalRead(pulsante);','  if (stato == HIGH); {','    digitalWrite(ledVerde, LOW);','    Serial.println("CUOCE");','    digitalWrite(ledArancione, HIGH);','    delay(500);','    digitalWrite(ledArancione, LOW);','    delay(500);','  } else {','    digitalWrite(ledArancione, LOW);','    digitalWrite(ledVerde, HIGH);','    Serial.println("PRONTO");','  }','}'],bad:3,
  q:'Questo loop non viene nemmeno accettato da Arduino: dà errore sull’else. <b>Tocca la riga sbagliata.</b>',why:'Dopo <code>if (stato == HIGH)</code> c’è un punto e virgola: chiude l’if subito, e l’else resta senza il suo if. Va tolto.',hint:'Guarda la punteggiatura dopo le parentesi.'},
 question:{q:'Mentre l’arancione è acceso lasci il pulsante. Quanto tempo può passare, al massimo, prima che si riaccenda il verde?',opts:[['Circa un secondo: Arduino deve finire i due delay da 500 ms prima di rileggere il pulsante',1],['Zero: si riaccende subito',0,'Durante i delay Arduino è fermo e non legge il pulsante.'],['500 ms esatti, sempre',0,'Dipende da quando lo lasci: se lo lasci all’inizio del lampeggio mancano quasi due delay.']],
  model:'Fino a circa 1 secondo. Il pulsante si legge solo all’inizio del loop; durante i delay Arduino aspetta e basta. Se lo lascio subito dopo digitalRead, devo aspettare tutti e due i delay da 500 ms.'}},

/* ================= ALLENAMENTO 4 ================= */
{id:'p3',n:4,mod:8,lvl:2,icon:'🅿️',title:'La sbarra del parcheggio',skills:['sequenza','contatore','delay'],
 text:'Normalmente è acceso il <mark>rosso</mark>. Quando un’auto preme il pulsante: monitor <mark>AUTO IN ARRIVO</mark>, il rosso si spegne, il <mark>giallo</mark> resta acceso <mark>1 secondo</mark>, poi il <mark>verde 3 secondi</mark> (monitor <mark>PASSA PURE</mark>), poi il giallo <mark>lampeggia 3 volte</mark> (200 + 200 ms) e si torna al rosso. Bonus: conta le auto e scrivi <mark>Auto numero 1</mark>, 2, 3…',
 table:[['Momento','Rosso','Giallo','Verde','Monitor'],['A riposo','acceso','spento','spento',''],['Premuto','spento','acceso 1 s','spento','AUTO IN ARRIVO'],['Poi','spento','spento','acceso 3 s','PASSA PURE'],['Avviso','spento','lampeggia ×3','spento',''],['Fine','acceso','spento','spento','']],
 analysis:[
  {q:'Qui non c’è un lampeggio: c’è una <b>sequenza</b> di passi uno dopo l’altro. Dove la scriviamo?',opts:[['Tutta dentro l’if del pulsante, in ordine',1],['Metà nell’if e metà nell’else',0,'L’else è il riposo: lì il semaforo è rosso e basta.'],['Nel setup',0,'Il setup si esegue una sola volta: la sbarra funzionerebbe per una sola auto.']],ok:'Sì: quando premi, Arduino esegue tutta la sequenza dall’alto in basso, poi torna al loop.'},
  {q:'Per contare le auto ci serve…',opts:[['Una variabile che parte da 0 e a ogni pressione aumenta di 1',1],['Un delay più lungo',0,'Il delay non conta niente.'],['Un LED in più',0,'Il conteggio si fa nel codice, con una variabile.']],ok:'Esatto: <code>int conta = 0;</code> in alto e <code>conta = conta + 1;</code> nell’if.'}],
 parts:PARTS.p3,
 code:[
  A('int pulsante = 2;','pulsante sul pin 2'),A('int ledRosso = 12;','rosso sul pin 12'),A('int ledGiallo = 11;','giallo sul pin 11'),A('int ledVerde = 10;','verde sul pin 10'),A('int stato = 0;','cosa legge il pulsante'),
  L('int conta = 0;','quante auto sono passate','Il contatore parte da 0: all’inizio non è passato nessuno. Va scritto in alto, fuori dal loop, altrimenti ripartirebbe da 0 ogni giro.',[['int conta = 1;','All’inizio non è passata nessuna auto: si parte da 0.']]),
  A(''),A('void setup() {'),A('  pinMode(pulsante, INPUT);','il pulsante ascolta'),A('  pinMode(ledRosso, OUTPUT);','i LED comandano'),A('  pinMode(ledGiallo, OUTPUT);'),A('  pinMode(ledVerde, OUTPUT);'),A('  Serial.begin(9600);','avvio il monitor'),A('}'),A(''),
  A('void loop() {'),A('  stato = digitalRead(pulsante);','leggo il pulsante'),A('  if (stato == HIGH) {','arriva un’auto'),
  L('    conta = conta + 1;','un’auto in più','Si legge da destra: prendo il valore di conta, aggiungo 1 e lo rimetto in conta.',[['    conta + 1;','Così calcoli conta + 1 ma non lo salvi da nessuna parte.'],['    conta = 1;','Così conta varrebbe sempre 1.']]),
  L('    Serial.print("Auto numero ");','scrivo il testo senza andare a capo','print (senza ln) resta sulla stessa riga: il numero verrà scritto subito dopo. Nota lo spazio prima della virgoletta.',[['    Serial.println("Auto numero ");','println andrebbe a capo: il numero finirebbe sulla riga sotto.']]),
  L('    Serial.println(conta);','scrivo il numero e vado a capo','Senza virgolette: si scrive il valore della variabile.',[['    Serial.println("conta");','Con le virgolette scriveresti la parola “conta”, non il numero.']]),
  L('    Serial.println("AUTO IN ARRIVO");','avviso','',[]),
  L('    digitalWrite(ledRosso, LOW);','spengo il rosso','',[['    digitalWrite(ledRosso, HIGH);','La sbarra si apre: il rosso va spento.']]),
  L('    digitalWrite(ledGiallo, HIGH);','accendo il giallo','',[]),
  L('    delay(1000);','giallo per 1 secondo','1000 millisecondi = 1 secondo.',[['    delay(1);','delay conta in millisecondi: 1 secondo = 1000.']]),
  L('    digitalWrite(ledGiallo, LOW);','spengo il giallo','',[['    digitalWrite(ledVerde, LOW);','Il verde è ancora spento: va spento il giallo.']]),
  L('    digitalWrite(ledVerde, HIGH);','accendo il verde','',[]),
  L('    Serial.println("PASSA PURE");','avviso','',[]),
  L('    delay(3000);','verde per 3 secondi','',[['    delay(300);','300 ms sono meno di un terzo di secondo.']]),
  L('    digitalWrite(ledVerde, LOW);','spengo il verde','',[]),
  A('    digitalWrite(ledGiallo, HIGH);','avviso: il giallo lampeggia 3 volte','Prima di richiudere la sbarra il giallo lampeggia <b>3 volte</b> (200 acceso, 200 spento). Il primo lampeggio lo scrivi tu.'),
  L('    delay(200);','acceso 200 ms','',[['    delay(2);','200 ms, non 2.']]),
  L('    digitalWrite(ledGiallo, LOW);','spento','',[]),
  L('    delay(200);','spento 200 ms','Senza questa attesa il LED si riaccenderebbe subito e non vedresti il lampeggio.',[]),
  A('    digitalWrite(ledGiallo, HIGH);','lampeggio 2','Gli altri due lampeggi sono uguali: li copio io. Si poteva usare anche un <code>for</code>.'),A('    delay(200);'),A('    digitalWrite(ledGiallo, LOW);'),A('    delay(200);'),
  A('    digitalWrite(ledGiallo, HIGH);','lampeggio 3'),A('    delay(200);'),A('    digitalWrite(ledGiallo, LOW);'),A('    delay(200);'),
  L('    digitalWrite(ledRosso, HIGH);','torna il rosso','',[]),
  A('  } else {','a riposo'),A('    digitalWrite(ledRosso, HIGH);','rosso acceso'),A('    digitalWrite(ledGiallo, LOW);','giallo spento'),A('    digitalWrite(ledVerde, LOW);','verde spento'),A('  }'),A('}')],
 tests:[{d:'A riposo: solo il rosso acceso',until:1000,check:r=>r.on('rosso',800)&&!r.on('giallo',800)&&!r.on('verde',800)},
  {d:'Premuto: giallo per 1 s, poi verde per 3 s, poi rosso',script:[[500,true],[800,false]],until:6000,check:r=>r.on('giallo',1000)&&!r.on('rosso',1000)&&r.on('verde',2500)&&r.on('verde',4300)&&!r.on('verde',4800)&&!r.on('rosso',5000)&&r.on('rosso',6000)||'Controlla la sequenza e i tempi: giallo 1000 ms, verde 3000 ms, poi i lampeggi, poi il rosso.'},
  {d:'Il giallo lampeggia 3 volte prima del rosso',script:[[500,true],[800,false]],until:6500,check:r=>{const e=r.edges('giallo',4490,5800);return e.rise>=2&&e.rise<=3&&e.fall>=3&&e.fall<=4||'Dopo il verde il giallo deve accendersi e spegnersi 3 volte (200 + 200 ms).'}},
  {d:'Messaggi AUTO IN ARRIVO e PASSA PURE',script:[[500,true],[800,false]],until:6000,check:r=>hasLine(r,400,1200,'AUTO IN ARRIVO')&&hasLine(r,1300,2000,'PASSA PURE')},
  {d:'Bonus: Auto numero 1, poi 2',script:[[500,true],[800,false],[6500,true],[6800,false]],until:11000,check:r=>hasLine(r,0,11000,'Auto numero 1')&&hasLine(r,0,11000,'Auto numero 2')||'Il monitor deve scrivere “Auto numero 1” e poi “Auto numero 2”.'}],
 need:{leds:['rosso','giallo','verde'],btn:true},
 bug:{lines:['    digitalWrite(ledRosso, LOW);','    digitalWrite(ledGiallo, HIGH);','    delay(1000);','    digitalWrite(ledVerde, HIGH);','    Serial.println("PASSA PURE");','    delay(3000);','    digitalWrite(ledVerde, LOW);','    digitalWrite(ledRosso, HIGH);'],bad:3,
  q:'In questo pezzo, quando arriva il verde, il <b>giallo resta acceso</b>. <b>Tocca la riga dopo la quale manca un’istruzione.</b>',why:'Dopo <code>delay(1000);</code> bisogna spegnere il giallo: <code>digitalWrite(ledGiallo, LOW);</code>. Un LED resta acceso finché non lo spegni tu.',hint:'Ogni LED che accendi, prima o poi va spento.'},
 question:{q:'Perché <code>int conta = 0;</code> si scrive in alto e non dentro il loop?',opts:[['Perché nel loop ripartirebbe da 0 a ogni giro e conterebbe sempre 1',1],['Perché in alto è più veloce',0,'Non è questione di velocità: dentro il loop la variabile verrebbe ricreata a ogni giro.'],['È uguale, si può scrivere dove si vuole',0,'Prova a pensare: il loop si ripete. Ogni volta ripartirebbe da 0.']],
  model:'Le variabili scritte in alto, fuori da setup e loop, esistono per tutto il programma e ricordano il loro valore. Se la scrivessi dentro il loop, a ogni giro ripartirebbe da 0 e il conteggio sarebbe sempre 1.'}}
];
EXS.forEach(e=>{e.sol=codeOf(e.code)});

/* =====================================================
   VERIFICA SIMULATA: tre esercizi nuovi, dello stesso tipo e della
   stessa difficoltà di una verifica vera. Si fanno da soli nel Banco.
   ===================================================== */
const SIM=[
{id:'s1',n:1,lvl:1,icon:'🛎',title:'La prenotazione al bancone',points:'3 punti',
 text:'Quando <mark>premi il pulsante</mark> il <mark>LED blu</mark> si accende, quando lo <mark>rilasci</mark> si spegne. Monitor seriale: <mark>PRENOTATO</mark> / <mark>LIBERO</mark>.<br><b>b)</b> Modifica il programma così che il LED blu sia acceso quando il pulsante <b>non</b> è premuto. Scrivi quali righe hai cambiato.',
 table:[['Pulsante','LED blu','Monitor seriale'],['Premuto','acceso','PRENOTATO'],['Rilasciato','spento','LIBERO']],
 question:'Nel tuo circuito, tra il pin del pulsante e GND, c’è una resistenza da 10 kΩ. A cosa serve? Che cosa leggerebbe Arduino senza di lei, a pulsante rilasciato?',
 parts:PARTS.s1,need:{leds:['blu'],btn:true},
 tests:[{d:'Rilasciato: LED blu spento e LIBERO',until:1200,check:r=>!r.on('blu',900)&&hasLine(r,0,1200,'LIBERO')||'Rilasciato: LED spento e scritta LIBERO.'},
  {d:'Premuto: LED blu acceso e PRENOTATO',script:[[400,true]],until:1500,check:r=>r.on('blu',1200)&&hasLine(r,500,1500,'PRENOTATO')||'Premuto: LED acceso e scritta PRENOTATO.'}],
 sol:`int pulsante = 3;                  // pulsante sul pin 3
int ledBlu = 7;                    // LED blu sul pin 7
int stato = 0;                     // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);        // il pulsante ascolta
  pinMode(ledBlu, OUTPUT);         // il LED comanda
  Serial.begin(9600);              // avvio il monitor seriale
}

void loop() {
  stato = digitalRead(pulsante);   // leggo il pulsante
  if (stato == HIGH) {             // se è premuto...
    digitalWrite(ledBlu, HIGH);    // ...accendo il LED blu
    Serial.println("PRENOTATO");   // ...e scrivo PRENOTATO
  } else {                         // altrimenti...
    digitalWrite(ledBlu, LOW);     // ...spengo il LED blu
    Serial.println("LIBERO");      // ...e scrivo LIBERO
  }
  delay(100);                      // pausa per non intasare il monitor
}`},
{id:'s2',n:2,lvl:2,icon:'🥤',title:'Il distributore di bevande',points:'3 punti',
 text:'A riposo (pulsante <mark>rilasciato</mark>) il <mark>LED blu</mark> è acceso fisso, il giallo è spento e il monitor scrive <mark>PRONTO</mark>. Quando <mark>premi</mark> il pulsante il distributore eroga: blu spento, <mark>LED giallo lampeggia</mark> 300 ms acceso e 300 ms spento, monitor <mark>EROGAZIONE</mark>.',
 table:[['Pulsante','LED blu','LED giallo','Monitor seriale'],['Rilasciato','acceso fisso','spento','PRONTO'],['Premuto','spento','lampeggia 300 / 300 ms','EROGAZIONE']],
 question:'Mentre il giallo lampeggia lasci il pulsante. Quanto tempo può passare, al massimo, prima che si riaccenda il blu? Spiega perché, pensando a cosa fa Arduino durante il delay.',
 parts:PARTS.s2,need:{leds:['blu','giallo'],btn:true},
 tests:[{d:'Rilasciato: blu acceso, giallo spento, PRONTO',until:1200,check:r=>r.on('blu',900)&&!r.anyOn('giallo',200,1200)&&hasLine(r,0,1200,'PRONTO')},
  {d:'Premuto: blu spento, giallo che lampeggia, EROGAZIONE',script:[[400,true],[2800,false]],until:3600,check:r=>!r.anyOn('blu',1000,2700)&&r.edges('giallo',500,2800).rise>=3&&hasLine(r,400,2900,'EROGAZIONE')||'Mentre premi il blu va spento e il giallo deve accendersi e spegnersi più volte (300 + 300 ms).'},
  {d:'Lo rilasci: torna il blu e il giallo si spegne',script:[[400,true],[2000,false]],until:3400,check:r=>r.on('blu',3200)&&!r.on('giallo',3200)}],
 sol:`int pulsante = 3;                  // pulsante sul pin 3
int ledBlu = 9;                    // LED blu sul pin 9
int ledGiallo = 10;                // LED giallo sul pin 10
int stato = 0;                     // cosa legge il pulsante

void setup() {
  pinMode(pulsante, INPUT);        // il pulsante ascolta
  pinMode(ledBlu, OUTPUT);         // il blu comanda
  pinMode(ledGiallo, OUTPUT);      // il giallo comanda
  Serial.begin(9600);              // avvio il monitor
}

void loop() {
  stato = digitalRead(pulsante);   // leggo il pulsante
  if (stato == HIGH) {             // premuto: eroga
    digitalWrite(ledBlu, LOW);     // spengo il blu
    Serial.println("EROGAZIONE");  // scrivo EROGAZIONE
    digitalWrite(ledGiallo, HIGH); // giallo acceso...
    delay(300);                    // ...per 300 ms
    digitalWrite(ledGiallo, LOW);  // giallo spento...
    delay(300);                    // ...per 300 ms
  } else {                         // rilasciato: pronto
    digitalWrite(ledGiallo, LOW);  // giallo spento
    digitalWrite(ledBlu, HIGH);    // blu acceso fisso
    Serial.println("PRONTO");      // scrivo PRONTO
    delay(100);                    // pausa per il monitor
  }
}`},
{id:'s3',n:3,lvl:3,icon:'🚂',title:'Il passaggio a livello',points:'4 punti + 1 bonus',
 text:'A riposo è acceso il <mark>verde</mark> per le auto, tutto il resto spento. Quando arriva il treno (premi il pulsante): 1) il verde resta acceso ancora <mark>1 s</mark>; 2) verde spento, <mark>giallo 1 s</mark>; 3) giallo spento, <mark>rosso acceso</mark> e monitor <mark>TRENO IN ARRIVO</mark>, per <mark>2 s</mark>; 4) il <mark>LED bianco</mark> (la campanella) <mark>lampeggia 5 volte</mark> (200 ms acceso, 200 ms spento) mentre il rosso resta acceso; 5) si spengono rosso e bianco, torna il verde e il monitor scrive <mark>STRADA LIBERA</mark>.<br><b>Bonus:</b> conta i treni e scrivi <mark>Treno numero 1</mark>, 2, 3…',
 table:[['Passo','Verde','Giallo','Rosso','Bianco','Tempo'],['Riposo','acceso','–','–','–','sempre'],['1','acceso','–','–','–','1 s'],['2','–','acceso','–','–','1 s'],['3','–','–','acceso','–','2 s'],['4','–','–','acceso','lampeggia ×5','2 s'],['5','acceso','–','–','–','']],
 question:'Durante la sequenza passa un secondo treno e preme il pulsante per un attimo. Il bonus lo conta? Spiega perché.',
 parts:PARTS.s3,need:{leds:['verde','giallo','rosso','bianco'],btn:true},
 tests:[{d:'A riposo: solo il verde acceso',until:900,check:r=>r.on('verde',700)&&!r.on('giallo',700)&&!r.on('rosso',700)&&!r.on('bianco',700)},
  {d:'Passi 1 e 2: verde ancora 1 s, poi giallo 1 s',script:[[1000,true],[1300,false]],until:4000,check:r=>r.on('verde',1700)&&!r.on('giallo',1700)&&!r.on('verde',2500)&&r.on('giallo',2500)||'Dopo la pressione: verde ancora 1 s, poi giallo per 1 s.'},
  {d:'Passo 3: rosso e TRENO IN ARRIVO',script:[[1000,true],[1300,false]],until:5500,check:r=>r.on('rosso',3500)&&r.on('rosso',4800)&&!r.on('giallo',3500)&&!r.on('bianco',3500)&&hasLine(r,2900,3200,'TRENO IN ARRIVO')||'Dopo il giallo: rosso per 2 s, con il messaggio TRENO IN ARRIVO.'},
  {d:'Passo 4: il bianco lampeggia 5 volte, il rosso resta acceso',script:[[1000,true],[1300,false]],until:7500,check:r=>{const e=r.edges('bianco',4990,7100);return e.rise>=4&&e.rise<=5&&e.fall>=4&&e.fall<=5&&r.on('rosso',6500)||'Il bianco deve accendersi e spegnersi 5 volte (200 + 200 ms) con il rosso sempre acceso.'}},
  {d:'Passo 5: torna il verde e STRADA LIBERA',script:[[1000,true],[1300,false]],until:8000,check:r=>r.on('verde',7500)&&!r.on('rosso',7500)&&!r.on('bianco',7500)&&hasLine(r,6900,7600,'STRADA LIBERA')},
  {d:'Bonus: Treno numero 1, poi 2',script:[[1000,true],[1300,false],[8000,true],[8300,false]],until:9500,check:r=>hasLine(r,0,9500,'Treno numero 1')&&hasLine(r,0,9500,'Treno numero 2')||'Bonus (facoltativo): il monitor scrive “Treno numero 1”, poi “Treno numero 2”.'}],
 sol:`int pulsante = 3;                  // pulsante sul pin 3
int ledVerde = 6;                  // verde per le auto sul pin 6
int ledGiallo = 5;                 // giallo sul pin 5
int ledRosso = 4;                  // rosso sul pin 4
int campanella = 7;                // LED bianco (campanella) sul pin 7
int stato = 0;                     // cosa legge il pulsante
int treni = 0;                     // BONUS: quanti treni sono passati

void setup() {
  pinMode(pulsante, INPUT);        // il pulsante ascolta
  pinMode(ledVerde, OUTPUT);       // verde comanda
  pinMode(ledGiallo, OUTPUT);      // giallo comanda
  pinMode(ledRosso, OUTPUT);       // rosso comanda
  pinMode(campanella, OUTPUT);     // bianco comanda
  Serial.begin(9600);              // avvio il monitor
}

void loop() {
  stato = digitalRead(pulsante);   // leggo il pulsante
  if (stato == HIGH) {             // arriva il treno
    treni = treni + 1;             // BONUS: un treno in più
    Serial.print("Treno numero "); // BONUS: testo, resto sulla riga
    Serial.println(treni);         // BONUS: il numero, poi a capo
    delay(1000);                   // 1) il verde resta acceso 1 s
    digitalWrite(ledVerde, LOW);   // 2) spengo il verde
    digitalWrite(ledGiallo, HIGH); // 2) accendo il giallo
    delay(1000);                   // 2) giallo per 1 s
    digitalWrite(ledGiallo, LOW);  // 3) spengo il giallo
    digitalWrite(ledRosso, HIGH);  // 3) accendo il rosso
    Serial.println("TRENO IN ARRIVO"); // 3) messaggio
    delay(2000);                   // 3) rosso per 2 s
    for (int i = 0; i < 5; i++) {  // 4) ripeto 5 volte
      digitalWrite(campanella, HIGH); // campanella accesa
      delay(200);                  // 200 ms
      digitalWrite(campanella, LOW);  // campanella spenta
      delay(200);                  // 200 ms
    }
    digitalWrite(ledRosso, LOW);   // 5) spengo il rosso
    digitalWrite(ledVerde, HIGH);  // 5) riaccendo il verde
    Serial.println("STRADA LIBERA"); // 5) messaggio
  } else {                         // a riposo
    digitalWrite(ledVerde, HIGH);  // verde acceso
    digitalWrite(ledGiallo, LOW);  // giallo spento
    digitalWrite(ledRosso, LOW);   // rosso spento
    digitalWrite(campanella, LOW); // campanella spenta
  }
}`}];
