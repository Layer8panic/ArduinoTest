/* Arduino Lab · illustrazioni e glossario (da EserTinkercad) */
"use strict";
const LEDC={rosso:'#F23A3A',giallo:'#FFD21F',verde:'#2BD45A',blu:'#3A8BFF',arancione:'#FF8A1F',bianco:'#F4F4F4'};
const fmtR=v=>v>=1000?(v%1000===0?v/1000:(v/1000).toFixed(1).replace('.',','))+' kΩ':v+' Ω';
function bands(v){const C=['#000','#8B4513','#E00','#F80','#EE0','#0A0','#00E','#80F','#888','#FFF'];let e=0,x=v;while(x>=100){x/=10;e++}x=Math.round(x);const d1=Math.floor(x/10),d2=x%10;return[C[d1],C[d2],C[e],'#C9A227']}
const EN={
 'Serial.println':'si legge "sìrial print-lain": seriale → stampa e vai a capo (ln = line, riga)','Serial.print':'seriale → stampa (scrive senza andare a capo)','Serial.begin':'seriale → inizia (apre la comunicazione con il PC)',
 'INPUT_PULLUP':'ingresso con resistenza interna "verso l\'alto" (pull-up = tirare su)','digitalWrite':'"scrivi digitale": mette il pin a HIGH o LOW','digitalRead':'"leggi digitale": legge se il pin è HIGH o LOW','pinMode':'"modo del pin": dice se il pin ascolta o comanda',
 'LED_BUILTIN':'"LED incorporato": il LED già montato sulla scheda (pin 13)','breadboard':'letteralmente "tagliere del pane": la basetta per montare i circuiti senza saldare','pull-down':'"tirare giù": tiene il pin a LOW (0 V)','pull-up':'"tirare su": tiene il pin a HIGH (5 V)',
 'Tinkercad':'il nome del programma online in cui simuliamo i circuiti','OUTPUT':'uscita: il pin comanda (dà 5 V o 0 V)','INPUT':'ingresso: il pin ascolta (misura la tensione)','Serial':'seriale: la comunicazione tra Arduino e il computer',
 'setup':'"preparazione": la parte del programma che si esegue una volta sola, all\'inizio','loop':'"giro, ciclo": la parte del programma che si ripete all\'infinito','delay':'"ritardo, attesa": fa aspettare Arduino (in millisecondi)',
 'HIGH':'"alto": c\'è tensione (5 V) → acceso','LOW':'"basso": non c\'è tensione (0 V) → spento','else':'"altrimenti"','void':'"vuoto": la funzione fa delle cose ma non restituisce un risultato','int':'abbreviazione di "integer" = numero intero (senza virgola)','if':'"se"',
 'GND':'abbreviazione di "ground" = terra: il polo negativo, 0 volt','LED':'sigla di "Light Emitting Diode" = diodo che emette luce','Reset':'"azzera, ricomincia"','baud':'unità di misura della velocità di comunicazione','Arduino Uno':'"Uno" è proprio la parola italiana: è il modello più famoso di Arduino'};
const EN_KEYS=Object.keys(EN).sort((a,b)=>b.length-a.length);
const EN_RE=new RegExp('(^|[^A-Za-z0-9_.])('+EN_KEYS.map(k=>k.replace(/[.]/g,'\\.')).join('|')+')(?![A-Za-z0-9_])','g');
function enLegend(code){const found=EN_KEYS.filter(k=>!/ /.test(k)&&new RegExp('(^|[^A-Za-z0-9_.])'+k.replace(/[.]/g,'\\.')+'(?![A-Za-z0-9_])').test(code)&&!['LED','GND','Reset','breadboard','pull-down','pull-up','Tinkercad','baud','Serial'].includes(k));
  return found.length?found.map(k=>`<span class="enc"><b>${k}</b> ${EN[k].replace(/^"[^"]*":\s*/,m=>m)}</span>`).join(''):'<span class="enc">Scrivi il codice: qui comparirà il significato delle parole inglesi che usi.</span>'}

function miniBoard(){return`<svg viewBox="0 0 470 205" class="svg0"><rect x="20" y="20" width="300" height="160" rx="12" fill="#127B8A"/><rect x="6" y="50" width="44" height="36" rx="3" fill="#C9CED6"/><rect x="190" y="120" width="110" height="24" fill="#1C1D22"/>
 <rect x="110" y="26" width="200" height="14" fill="#202226"/>${Array.from({length:14},(_,i)=>`<rect x="${116+i*14}" y="30" width="6" height="6" fill="#000"/>`).join('')}
 <text x="230" y="100" fill="#fff" font-size="26" font-weight="800" font-family="Arial" text-anchor="middle">UNO</text>
 <g font-family="Atkinson Hyperlegible,Arial,sans-serif" font-size="13" font-weight="700" fill="#1F2933"><path d="M210 26 Q240 0 330 10" stroke="#F57C00" stroke-width="2" fill="none"/><text x="335" y="15">i pin</text>
 <path d="M28 68 Q0 120 40 190" stroke="#F57C00" stroke-width="2" fill="none"/><text x="44" y="196">cavo USB: energia e programma</text>
 <path d="M245 132 Q300 170 340 150" stroke="#F57C00" stroke-width="2" fill="none"/><text x="342" y="154">il mini-computer</text></g></svg>`}
function waterSVG(open){return`<svg viewBox="0 0 520 210" class="svg0"><rect x="40" y="40" width="440" height="130" rx="20" fill="none" stroke="#90CAF9" stroke-width="16"/>
 <rect x="40" y="40" width="440" height="130" rx="20" fill="none" stroke="#1E88E5" stroke-width="5" stroke-dasharray="12 12" class="${open?'':'flow0'}"/>
 <circle cx="40" cy="105" r="30" fill="#FFB300" stroke="#E65100" stroke-width="3"/><text x="40" y="111" text-anchor="middle" font-weight="800" font-size="15" font-family="Arial">5V</text><text x="40" y="160" text-anchor="middle" font-size="12" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="700">pompa</text>
 ${open?'<rect x="250" y="20" width="40" height="40" fill="#EBEEF2"/><text x="270" y="16" text-anchor="middle" font-size="12" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800" fill="#C62828">aperto!</text>':''}
 <g transform="translate(480 105)"><circle r="26" fill="${open?'#9E9E9E':'#FFEB3B'}" stroke="#555" stroke-width="2"/>${open?'':'<circle r="40" fill="#FFEB3B" opacity=".3"/>'}<text y="5" text-anchor="middle" font-size="18">💡</text></g>
 <text x="260" y="200" text-anchor="middle" font-size="13" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="700" fill="#455A64">${open?'il giro è interrotto: la corrente si ferma':'il giro è chiuso: la corrente scorre e il LED si accende'}</text></svg>`}
function ledSVG(rev){return`<svg viewBox="0 0 520 170" class="svg0"><text x="60" y="30" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800" font-size="14" fill="#C62828">5V (+)</text><text x="420" y="30" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800" font-size="14" fill="#1565C0">GND (−)</text>
 <path d="M60 80 H210 M310 80 H460" stroke="#455A64" stroke-width="4"/><g transform="translate(260 80) ${rev?'scale(-1 1)':''}"><path d="M-40 -28 L20 0 L-40 28Z" fill="${rev?'#BDBDBD':'#F23A3A'}"/><rect x="20" y="-30" width="6" height="60" fill="#333"/>
 ${rev?'':'<circle cx="0" cy="0" r="46" fill="#F23A3A" opacity=".2"/>'}<text x="-60" y="-36" font-size="12" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800">+</text><text x="30" y="-36" font-size="12" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800">−</text></g>
 ${rev?'':'<path d="M100 80 H200" stroke="#FFB300" stroke-width="4" stroke-dasharray="10 8" class="flow0"/><path d="M320 80 H440" stroke="#FFB300" stroke-width="4" stroke-dasharray="10 8" class="flow0"/>'}
 <text x="260" y="150" text-anchor="middle" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="700" font-size="14" fill="#455A64">${rev?'🚫 al contrario: la porta è chiusa, il LED resta spento':'✅ nel verso giusto: la corrente passa e il LED si accende'}</text></svg>`}
const RVAL=[[0,'Nessuna'],[220,'220 Ω'],[1000,'1 kΩ'],[10000,'10 kΩ'],[100000,'100 kΩ']];
function resSVG(v){const b=v===0?0:v<=1000?1:v<=10000?.3:.05,burn=v===0;const sp=v===0?.2:v<=220?.6:v<=1000?1:v<=10000?2.5:6;
 return`<svg viewBox="0 0 560 170" class="svg0"><path d="M30 90 H140 M240 90 H330 M430 90 H530 V140 H30 V90" stroke="#90CAF9" stroke-width="14" fill="none"/>
 <path d="M30 90 H140 M240 90 H330 M430 90 H530 V140 H30 V90" stroke="#1E88E5" stroke-width="4" fill="none" stroke-dasharray="10 10" style="animation:flow0 ${sp}s linear infinite"/>
 <text x="30" y="70" font-family="Arial" font-weight="800" font-size="14">5V</text>
 ${v===0?'<path d="M140 90 H240" stroke="#90CAF9" stroke-width="14"/><text x="190" y="70" text-anchor="middle" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-size="12" font-weight="800" fill="#C62828">nessun freno</text>':`<path d="M140 90 H240" stroke="#9BA3AE" stroke-width="4"/><rect x="160" y="78" width="60" height="24" rx="10" fill="#E3C79A" stroke="#A88A5A"/>${bands(v).map((c,i)=>`<rect x="${170+i*10+(i===3?6:0)}" y="78" width="5" height="24" fill="${c}"/>`).join('')}<text x="190" y="70" text-anchor="middle" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-size="12" font-weight="800">${fmtR(v)}</text>`}
 <g transform="translate(380 90)">${burn?'<circle r="24" fill="#3E2723"/><text y="-30" text-anchor="middle" font-size="26">💥</text>':`<circle r="${30+20*b}" fill="#FF5252" opacity="${.35*b}"/><circle r="22" fill="#F23A3A" opacity="${.35+.65*b}"/>`}</g></svg>`}
function bbSVG(){const N=12,X=c=>74+c*36,R='abcdefghij';let s='<svg viewBox="0 0 560 396" class="svg0" id="bb0" role="img" aria-label="Breadboard"><g font-family="Arial,Helvetica,sans-serif" font-weight="700">';
 s+='<rect x="22" y="12" width="516" height="374" rx="10" fill="#F3F3EF" stroke="#BFC0B8" stroke-width="2"/>';
 s+='<rect x="28" y="20" width="504" height="58" rx="6" fill="#E9E9E3"/><rect x="28" y="318" width="504" height="58" rx="6" fill="#E9E9E3"/><rect x="28" y="190" width="504" height="14" rx="3" fill="#D3D3CB"/>';
 const ln=(y,c)=>`<line x1="52" x2="508" y1="${y}" y2="${y}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
 s+=ln(27,'#D83A3A')+ln(71,'#2F6BD1')+ln(325,'#D83A3A')+ln(369,'#2F6BD1');
 const lab=(x,y,t,c='#7D8088',z=13)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${z}" text-anchor="middle">${t}</text>`;
 [[40,'+','#D83A3A'],[60,'−','#2F6BD1'],[338,'+','#D83A3A'],[358,'−','#2F6BD1']].forEach(([y,t,c])=>{s+=lab(38,y+5,t,c,18)+lab(522,y+5,t,c,18)});
 const hole=(x,y,g)=>`<rect x="${x-6}" y="${y-6}" width="12" height="12" rx="2" fill="#4A4E57" data-g="${g}" class="h0"/><rect x="${x-12}" y="${y-10}" width="24" height="20" fill="transparent" data-g="${g}" class="h0t"/>`;
 for(let c=0;c<N;c++){s+=hole(X(c),40,'TP')+hole(X(c),60,'TM')+hole(X(c),338,'BP')+hole(X(c),358,'BM');
   s+=lab(X(c),95,c+1)+lab(X(c),309,c+1);
   for(let r=0;r<5;r++)s+=hole(X(c),110+r*18,'A'+c)+hole(X(c),214+r*18,'B'+c)}
 for(let r=0;r<5;r++){s+=lab(46,114+r*18,R[r])+lab(514,114+r*18,R[r])+lab(46,218+r*18,R[r+5])+lab(514,218+r*18,R[r+5])}
 return s+'</g></svg><p class="bbcap" id="bbCap">Tocca o passa sopra un foro.</p>'}
function bbCaption(g){if(g==='TP'||g==='BP')return'Tutta la riga rossa <b>+</b> è collegata: qui di solito arriva il <b>5V</b>.';if(g==='TM'||g==='BM')return'Tutta la riga blu <b>−</b> è collegata: qui di solito arriva il <b>GND</b>.';
 const c=+g.slice(1)+1;return g[0]==='A'?`Questi <b>5 fori</b> (colonna ${c}, righe a–e) sono collegati tra loro.`:`Questi <b>5 fori</b> (colonna ${c}, righe f–j) sono collegati tra loro. Non toccano quelli di sopra: in mezzo c'è la scanalatura.`}
function btnSVG(p){return`<svg viewBox="0 0 400 200" class="svg0"><g font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800" font-size="20"><text x="70" y="62">A</text><text x="320" y="62">A</text><text x="70" y="152">B</text><text x="320" y="152">B</text></g>
 <g stroke="#9BA3AE" stroke-width="8" stroke-linecap="round"><line x1="95" y1="55" x2="135" y2="55"/><line x1="265" y1="55" x2="305" y2="55"/><line x1="95" y1="145" x2="135" y2="145"/><line x1="265" y1="145" x2="305" y2="145"/></g>
 <rect x="130" y="30" width="140" height="140" rx="14" fill="#2D3038"/><line x1="140" y1="55" x2="260" y2="55" stroke="#FBC02D" stroke-width="5" stroke-dasharray="8 6"/><line x1="140" y1="145" x2="260" y2="145" stroke="#FBC02D" stroke-width="5" stroke-dasharray="8 6"/>
 ${p?'<line x1="200" y1="55" x2="200" y2="145" stroke="#43A047" stroke-width="8"/>':''}<circle cx="200" cy="100" r="${p?28:34}" fill="#D8343E" stroke="#7E1A20" stroke-width="3"/>
 <text x="200" y="192" text-anchor="middle" font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="700" font-size="13" fill="#455A64">${p?'premuto: A e B sono unite, la corrente passa':'rilasciato: A e B sono separate'}</text></svg>`}
function batterySVG(){return`<svg viewBox="0 0 520 170" class="svg0"><rect x="30" y="50" width="120" height="70" rx="8" fill="#37474F"/><rect x="150" y="70" width="10" height="30" fill="#90A4AE"/>
 <text x="60" y="95" font-size="26" font-weight="800" fill="#EF5350" font-family="Arial">−</text><text x="120" y="95" font-size="26" font-weight="800" fill="#EF5350" font-family="Arial" text-anchor="middle">+</text>
 <path d="M160 85 H260 V40 H420 V85" stroke="#C62828" stroke-width="4" fill="none"/><path d="M30 85 H10 V150 H420 V115" stroke="#263238" stroke-width="4" fill="none"/>
 <circle cx="420" cy="100" r="16" fill="#FFEB3B" stroke="#555"/><circle cx="420" cy="100" r="30" fill="#FFEB3B" opacity=".3"/>
 <g font-family="Atkinson Hyperlegible,Arial,sans-serif" font-weight="800" font-size="13"><text x="300" y="32" fill="#C62828">+ (su Arduino: 5V)</text><text x="200" y="142" fill="#263238">− (su Arduino: GND)</text></g></svg>`}
const BUILD=[
 ['Ecco <b>Arduino</b> (a sinistra) e la <b>breadboard</b> (a destra), ancora vuota. Guarda le due righe lunghe che useremo: la riga <b style="color:#C62828">rossa +</b> in alto e la riga <b style="color:#1565C0">blu −</b> in basso.'],
 ['<b>1. Filo dal pin 5V alla riga rossa + (in alto).</b><br>Perché: così la spinta dell\'elettricità arriva su tutta la riga rossa, e ogni pezzo la può prendere da lì.'],
 ['<b>2. Filo dal pin GND alla riga blu − (in basso).</b><br>Perché: è la strada di ritorno. Ogni circuito deve finire qui, altrimenti la corrente non gira.'],
 ['<b>3. Il LED</b>, nella parte di sotto, con le gambe nelle colonne 12 e 13.<br>Il lato <b style="color:#C62828">+</b> è nella colonna 12 (lì arriverà il pin di Arduino), il lato <b style="color:#1565C0">−</b> nella colonna 13 (andrà verso GND).'],
 ['<b>4. La resistenza da 220 Ω</b>, dalla colonna 13 (lato − del LED) alla riga blu −.<br>Perché: frena la corrente, così il LED non si brucia.'],
 ['<b>5. Filo dal pin 12 alla colonna 12</b> (lato + del LED).<br>Perché: da questo pin Arduino accende (HIGH) e spegne (LOW) il LED.'],
 ['<b>6. Il pulsante</b>, a cavallo della scanalatura centrale (colonne 5 e 7), e un filo dalle sue gambe <b>di sopra</b> alla riga rossa +.<br>Perché: quando lo premi, fa passare la spinta del 5V verso le gambe di sotto.'],
 ['<b>7. Filo dalle gambe di sotto del pulsante al pin 2.</b><br>Perché: da qui Arduino "ascolta" se il pulsante è premuto.'],
 ['<b>8. La resistenza da 10 kΩ</b>, dalle gambe di sotto del pulsante alla riga blu −.<br>Perché: quando non premi, tiene il pin 2 a 0 volt (LOW). Senza, Arduino leggerebbe valori a caso.'],
 ['<b>Finito!</b> Tieni premuto il pulsante: la spinta del 5V arriva al pin 2, Arduino legge HIGH e, con il programma giusto, accende il LED dal pin 12.']];
function buildSVG(k,pr){const v=i=>k>=i?(k===i?'now':''):'off';const on=k>=9&&pr;
 const X=c=>300+c*34,RY=r=>r<5?120+r*18:232+(r-5)*18,TOPP=80,TOPM=60,BOTM=340,BOTP=360,F='Atkinson Hyperlegible,Arial,sans-serif';
 const W=(d,c)=>`<path d="${d}" stroke="#fff" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" stroke="${c}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`;
 const dot=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="#fff" stroke-width="2"/>`;
 const RES=(x,y1,y2,b,lab)=>{const m=(y1+y2)/2;return`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#8E949C" stroke-width="3"/><rect x="${x-7}" y="${m-13}" width="14" height="26" rx="5" fill="#E3C79A" stroke="#A88A5A"/>${b.map((c,i)=>`<rect x="${x-7}" y="${m-9+i*6}" width="14" height="3.5" fill="${c}"/>`).join('')}${dot(x,y1,'#8E949C')}${dot(x,y2,'#8E949C')}<text x="${x+12}" y="${m+4}" font-size="13" font-weight="700" fill="#232136">${lab}</text>`};
 let bb=`<rect x="268" y="40" width="474" height="340" rx="10" fill="#F3F3EF" stroke="#BFC0B8" stroke-width="2"/><rect x="274" y="48" width="462" height="44" rx="5" fill="#E9E9E3"/><rect x="274" y="328" width="462" height="44" rx="5" fill="#E9E9E3"/><rect x="274" y="205" width="462" height="14" rx="3" fill="#D3D3CB"/>`;
 const ln=(y,c)=>`<line x1="292" x2="718" y1="${y}" y2="${y}" stroke="${c}" stroke-width="2.5"/>`;
 bb+=ln(TOPM-10,'#2F6BD1')+ln(TOPP+10,'#D83A3A')+ln(BOTM-10,'#2F6BD1')+ln(BOTP+10,'#D83A3A');
 for(let c=0;c<13;c++){[TOPM,TOPP,BOTM,BOTP].forEach(y=>bb+=`<rect x="${X(c)-4}" y="${y-4}" width="8" height="8" rx="1.5" fill="#4A4E57"/>`);for(let r=0;r<10;r++)bb+=`<rect x="${X(c)-4}" y="${RY(r)-4}" width="8" height="8" rx="1.5" fill="#4A4E57"/>`;bb+=`<text x="${X(c)}" y="106" font-size="10" text-anchor="middle" fill="#8A8698">${c+1}</text>`}
 'abcdefghij'.split('').forEach((l,r)=>bb+=`<text x="282" y="${RY(r)+4}" font-size="10" text-anchor="middle" fill="#8A8698">${l}</text><text x="728" y="${RY(r)+4}" font-size="10" text-anchor="middle" fill="#8A8698">${l}</text>`);
 const lab=(y,t,c)=>`<text x="752" y="${y+5}" font-size="14" font-weight="700" fill="${c}">${t}</text>`;
 bb+=lab(TOPP,'+ (5V)','#C62828')+lab(BOTM,'− (GND)','#1565C0')+lab(TOPM,'−','#8A8698')+lab(BOTP,'+','#8A8698');
 const ard=`<rect x="20" y="70" width="180" height="280" rx="12" fill="#127B8A"/><text x="88" y="215" fill="#fff" font-size="22" font-weight="700" text-anchor="middle">Arduino</text>`+[['5V',110],['pin 2',180],['pin 12',250],['GND',320]].map(([t,y])=>`<rect x="186" y="${y-8}" width="16" height="16" rx="2" fill="#1C1D22"/><text x="178" y="${y+5}" fill="#fff" font-size="14" font-weight="700" text-anchor="end">${t}</text>`).join('');
 const ledOn=on?`<circle cx="${X(11.5)}" cy="246" r="36" fill="#FFD54F" opacity=".55"/>`:'';
 const LX1=X(11),LX2=X(12),LY=RY(7);
 return`<svg viewBox="0 0 830 400" class="svg0 bsvg"><style>.bsvg .off{opacity:0}.bsvg .now{animation:now0 1s ease-in-out infinite}@keyframes now0{50%{filter:drop-shadow(0 0 7px #FF9800)}}</style><g font-family="${F}">
 ${ard}${bb}
 <g class="${v(1)}">${W(`M202 110 H232 V${TOPP} H${X(0)}`,'#D83A3A')}${dot(X(0),TOPP,'#D83A3A')}</g>
 <g class="${v(2)}">${W(`M202 320 H232 V${BOTM} H${X(0)}`,'#263238')}${dot(X(0),BOTM,'#263238')}</g>
 <g class="${v(3)}">${ledOn}<line x1="${LX1}" y1="${LY}" x2="${LX1}" y2="252" stroke="#8E949C" stroke-width="3"/><line x1="${LX2}" y1="${LY}" x2="${LX2}" y2="252" stroke="#8E949C" stroke-width="3"/>
   <path d="M${LX1-9} 254 V236 A${(LX2-LX1)/2+9} ${(LX2-LX1)/2+9} 0 0 1 ${LX2+9} 236 V254Z" fill="${on?'#FFC107':'#F6D365'}" stroke="#8a6d00" stroke-width="1.5"/>
   <text x="${LX1}" y="250" font-size="15" font-weight="700" fill="#C62828" text-anchor="middle">+</text><text x="${LX2}" y="250" font-size="15" font-weight="700" fill="#1565C0" text-anchor="middle">−</text>
   ${dot(LX1,LY,'#8E949C')}${dot(LX2,LY,'#8E949C')}<text x="${X(11.5)}" y="${236-(LX2-LX1)/2-16}" font-size="14" font-weight="700" text-anchor="middle" fill="#232136">LED</text></g>
 <g class="${v(4)}">${RES(X(12),RY(9),BOTM,['#D32F2F','#D32F2F','#6D4C41'],'')}<text x="${X(12)-14}" y="${RY(9)+24}" font-size="13" font-weight="700" fill="#232136" text-anchor="end">220 Ω</text></g>
 <g class="${v(5)}">${W(`M202 250 H240 V${RY(8)} H${X(11)}`,'#F57C00')}${dot(X(11),RY(8),'#F57C00')}</g>
 <g class="${v(6)}"><rect x="${X(4)-12}" y="180" width="${X(6)-X(4)+24}" height="64" rx="6" fill="#2D3038"/><circle cx="${X(5)}" cy="212" r="${on?15:18}" fill="#D8343E" stroke="#7E1A20" stroke-width="2"/>
   ${[X(4),X(6)].map(x=>dot(x,RY(4),'#8E949C')+dot(x,RY(5),'#8E949C')).join('')}<text x="${X(5)}" y="174" font-size="14" font-weight="700" text-anchor="middle" fill="#232136">pulsante</text>
   ${W(`M${X(6)} ${RY(0)} V${TOPP}`,'#D83A3A')}${dot(X(6),RY(0),'#D83A3A')}${dot(X(6),TOPP,'#D83A3A')}</g>
 <g class="${v(7)}">${W(`M202 180 H250 V${RY(7)} H${X(6)}`,'#2E9E44')}${dot(X(6),RY(7),'#2E9E44')}</g>
 <g class="${v(8)}">${RES(X(4),RY(9),BOTM,['#6D4C41','#212121','#FF8F00'],'10 kΩ')}</g>
 </g></svg>`}
/* ---------- vista "Impara da zero" ---------- */

/* parole inglesi: significato al passaggio del mouse (o al tocco) */
function annotate(root){if(!root)return;const W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||p.closest('pre,textarea,script,style,button,select,.en,.noen,svg,.qo,h1,h2,.cover'))return NodeFilter.FILTER_REJECT;return EN_RE.test(n.nodeValue)?(EN_RE.lastIndex=0,NodeFilter.FILTER_ACCEPT):(EN_RE.lastIndex=0,NodeFilter.FILTER_REJECT)}});
  const nodes=[];while(W.nextNode())nodes.push(W.currentNode);
  nodes.forEach(n=>{const frag=document.createDocumentFragment();let last=0,s=n.nodeValue,m;EN_RE.lastIndex=0;
    while((m=EN_RE.exec(s))){const st=m.index+m[1].length;frag.append(s.slice(last,st));const sp=document.createElement('span');sp.className='en';sp.textContent=m[2];sp.dataset.en=m[2];sp.tabIndex=0;frag.append(sp);last=st+m[2].length}
    frag.append(s.slice(last));n.replaceWith(frag)})}
document.addEventListener('mouseover',e=>{const t=e.target.closest&&e.target.closest('.en');if(t){const tp=UI.tipEl();tp.hidden=false;tp.innerHTML=`🇬🇧 <b>${esc(t.dataset.en)}</b> = ${esc(EN[t.dataset.en])}`;const r=t.getBoundingClientRect();tp.style.left=Math.min(innerWidth-300,r.left)+'px';tp.style.top=r.bottom+6+'px'}});
document.addEventListener('mouseout',e=>{if(e.target.closest&&e.target.closest('.en'))UI.tipEl().hidden=true});
/* parole inglesi presenti nel codice */
