/* =====================================================
   Arduino Lab · POSTAZIONE DI LAVORO
   banco (Arduino + breadboard) + editor del codice + monitor seriale
   + simulazione dal vivo o al rallentatore + controllo automatico
   ===================================================== */
"use strict";
const CODE0=`void setup() {

}

void loop() {

}`;

function mountWorkbench(el,o={}){
  o={editable:false,codeEditable:true,palette:false,slowBtn:true,check:null,...o};
  const id='wb'+Math.random().toString(36).slice(2,7);
  el.innerHTML=`<div class="wb${o.editable?' edit':''}" id="${id}">
   <div class="wbbar">
    <button class="btn sm pri" data-run>▶ Avvia simulazione</button>
    ${o.slowBtn?'<button class="btn sm" data-slow aria-pressed="false" title="Esegue una riga alla volta e mostra le variabili">🐢 Al rallentatore</button>':''}
    <button class="btn sm press" data-press disabled title="Tieni premuto: è come premere il pulsante del circuito">👆 Tieni premuto il pulsante</button>
    ${o.editable?'<span class="wbsep"></span><button class="btn sm icon" data-rot title="Ruota il componente scelto (R)" aria-label="Ruota">⟳</button><button class="btn sm icon" data-del title="Elimina (Canc)" aria-label="Elimina">🗑</button><button class="btn sm icon" data-undo title="Annulla (Ctrl+Z)" aria-label="Annulla">↶</button><button class="btn sm" data-clear title="Svuota il banco">🧹 Svuota</button>':''}
    ${o.check?'<span class="wbsep"></span><button class="btn sm ok" data-check>✔ Controlla il mio lavoro</button>':''}
   </div>
   <div class="wbmain">
    <div class="wbstage"></div>
    <div class="wbside">
     ${o.palette?`<div class="wbtabs" role="tablist"><button data-tab="code" class="on" role="tab">📝 Codice</button><button data-tab="comp" role="tab">🧩 Componenti</button></div>`:''}
     <div class="wbpal" hidden>
      <div class="pal" data-t="led"><svg viewBox="0 0 52 46"><path d="M20 40 V30 M30 40 V32 L27 28" stroke="#9BA3AE" stroke-width="2.5" fill="none"/><path d="M16 28 V14 A9 9 0 0 1 34 14 V28Z" fill="#F23A3A"/><rect x="14" y="26" width="22" height="4" fill="#C62828"/></svg><div><b>LED</b><span>Lato + verso il pin, lato − verso GND. Clic sul LED per cambiare colore.</span></div></div>
      <div class="pal" data-t="res"><svg viewBox="0 0 52 46"><line x1="2" y1="23" x2="50" y2="23" stroke="#9BA3AE" stroke-width="2.5"/><rect x="12" y="16" width="28" height="14" rx="6" fill="#E3C79A" stroke="#A88A5A"/><rect x="17" y="16" width="3" height="14" fill="#E00"/><rect x="23" y="16" width="3" height="14" fill="#E00"/><rect x="29" y="16" width="3" height="14" fill="#8B4513"/></svg><div><b>Resistenza</b><span>220 Ω per ogni LED, 10 kΩ per la pull-down del pulsante.</span></div></div>
      <div class="pal" data-t="btn"><svg viewBox="0 0 52 46"><rect x="10" y="7" width="32" height="32" rx="3" fill="#2D3038"/><circle cx="26" cy="23" r="9" fill="#D8343E"/><circle cx="10" cy="7" r="2.5" fill="#9BA3AE"/><circle cx="42" cy="7" r="2.5" fill="#9BA3AE"/><circle cx="10" cy="39" r="2.5" fill="#9BA3AE"/><circle cx="42" cy="39" r="2.5" fill="#9BA3AE"/></svg><div><b>Pulsante</b><span>Va a cavallo della scanalatura centrale.</span></div></div>
      <div class="keys2"><b>Come si fa</b><br>Trascina un componente sulla breadboard: si aggancia ai fori.<br><b>Filo</b>: clic su un pin o un foro, poi clic sul punto di arrivo (clic nel vuoto = curva).<br><kbd>R</kbd> ruota · <kbd>Canc</kbd> elimina · <kbd>Esc</kbd> annulla il filo · <kbd>Ctrl</kbd>+<kbd>Z</kbd> annulla<br>Trascina lo sfondo per spostare la vista, rotellina per lo zoom.</div>
     </div>
     <div class="wbcode">
      <div class="ed"><div class="gut"></div><div class="area"><pre class="codehl"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Codice Arduino" ${o.codeEditable?'':'readonly'}></textarea></div></div>
      <div class="lint" aria-live="polite"></div>
      <div class="slowinfo" hidden></div>
      <div class="vars" hidden></div>
      <div class="monh"><span>🖥 Monitor seriale</span><button type="button" data-mclr>Cancella</button></div>
      <pre class="mon" aria-live="off"></pre>
      <details class="enbox"><summary>🇬🇧→🇮🇹 Le parole inglesi del codice</summary><div class="enleg"></div></details>
     </div>
    </div>
   </div></div>`;
  const root=$('#'+id,el);const q=s=>root.querySelector(s);
  const bench=createBench(q('.wbstage'),{editable:o.editable});
  if(o.circuit){if(typeof o.circuit==='function')bench.build(o.circuit);else bench.load(o.circuit)}
  const ta=q('textarea'),pre=q('.codehl'),gut=q('.gut'),mon=q('.mon'),lint=q('.lint');
  let errLine=0,execLine=0,slow=false,running=false,pressedOnce=false,serialTxt='';
  ta.value=o.code!=null?o.code:CODE0;
  function renderCode(){const L=ta.value.split('\n');gut.textContent=L.map((_,i)=>i+1).join('\n');
    pre.innerHTML=L.map((l,i)=>{const n=i+1;return n===errLine?`<span class="errl">${hl(l)||' '}</span>`:n===execLine?`<span class="exl">${hl(l)||' '}</span>`:hl(l)}).join('\n')+'\n';
    try{q('.enleg').innerHTML=enLegend(ta.value)}catch(e){}}
  let lintT=0;const cap=m=>m?m[0].toUpperCase()+m.slice(1):m;
  function liveLint(){const code=ta.value;
    try{ARD.compile(code)}catch(e){errLine=e.line||0;renderCode();lint.className='lint bad';lint.innerHTML=`<b>⛔ Riga ${e.line||'?'}:</b> ${esc(cap(e.message))}`;return false}
    if(errLine){errLine=0;renderCode()}
    let W=[];try{W=ARD.warnings(code)}catch(e){}
    if(W.length){lint.className='lint warn';lint.innerHTML=W.slice(0,3).map(([l,m])=>`<div><b>⚠ Riga ${l||'?'}:</b> ${esc(cap(m))}</div>`).join('')}
    else{lint.className='lint good';lint.innerHTML='✓ Scritto bene: nessun errore. Prova il programma con ▶ Avvia simulazione.'}return true}
  ta.addEventListener('input',()=>{if(/[“”„]/.test(ta.value)){const p=ta.selectionStart;ta.value=ta.value.replace(/[“”„]/g,'"');ta.selectionStart=ta.selectionEnd=p}
    errLine=0;renderCode();clearTimeout(lintT);lintT=setTimeout(liveLint,450);if(running)toast('Il codice nuovo verrà usato quando <b>riavvii</b> la simulazione.');o.onCode&&o.onCode(ta.value)});
  ta.addEventListener('scroll',()=>{pre.scrollTop=ta.scrollTop;pre.scrollLeft=ta.scrollLeft;gut.scrollTop=ta.scrollTop});
  ta.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();ta.setRangeText('  ',ta.selectionStart,ta.selectionEnd,'end');renderCode()}});
  renderCode();liveLint();
  function serialOut(s){serialTxt+=s;let t=mon.textContent+s;const ls=t.split('\n');if(ls.length>300)t=ls.slice(-300).join('\n');mon.textContent=t;mon.scrollTop=mon.scrollHeight;o.onSerial&&o.onSerial(s)}
  q('[data-mclr]').onclick=()=>{mon.textContent=''};
  /* variabili e rallentatore */
  const varsBox=q('.vars'),slowInfo=q('.slowinfo');
  function showVars(hw){if(!slow||!hw||!hw.vars){varsBox.hidden=true;return}const v=hw.vars;const ks=Object.keys(v);
    varsBox.hidden=!ks.length;varsBox.innerHTML='<div class="ph">Le scatole (variabili)</div><div class="vlist">'+ks.map(k=>`<span class="var"><small>${esc(k)}</small><b>${esc(v[k]===1&&/stato|premuto|lettura/i.test(k)?'1 (HIGH)':v[k]===0&&/stato|premuto|lettura/i.test(k)?'0 (LOW)':v[k])}</b></span>`).join('')+'</div>'}
  function setRunUI(on){running=on;q('[data-run]').innerHTML=on?'■ Arresta':'▶ Avvia simulazione';q('[data-run]').classList.toggle('stop',on);q('[data-press]').disabled=!on||!bench.circuit.comps.some(c=>c.type==='btn');
    if(!on){execLine=0;renderCode();slowInfo.hidden=true;varsBox.hidden=true}}
  function start(){if(running){bench.stop();return}
    if(!liveLint()){toast('Prima correggi l’errore nel codice (riga in rosso).');return}
    mon.textContent='';serialTxt='';
    const ok=bench.run(ta.value,{slow:()=>slow,stepMs:()=>SET.lim?900:700,
      onSerial:serialOut,
      onLine:(l,y,isDelay,hw)=>{if(slow||isDelay){execLine=l;renderCode();const L=pre.querySelector('.exl');if(L&&slow)L.scrollIntoView({block:'nearest'})}
        if(slow){showVars(hw);slowInfo.hidden=false;slowInfo.innerHTML=y&&y.cond!==undefined?`🔀 Riga ${l}: la condizione è <b>${y.cond?'VERA':'FALSA'}</b>${y.cond?'':' (si salta il blocco)'}`:y&&y.delay!==undefined?`⏳ Riga ${l}: <b>delay(${y.delay})</b>. Arduino aspetta e intanto <b>non guarda il pulsante</b>.`:`▶ Riga ${l}`}},
      onError:(e,compile)=>{errLine=e.line||0;renderCode();lint.className='lint bad';lint.innerHTML=`⛔ <b>${compile?'Il programma non parte':'Errore'}${e.line?' (riga '+e.line+')':''}</b>: ${esc(e.message)}`;setRunUI(false)},
      onStart:()=>{}});
    if(ok){setRunUI(true);o.onRun&&o.onRun()}}
  bench.onStop=()=>setRunUI(false);
  q('[data-run]').onclick=start;
  if(o.slowBtn)q('[data-slow]').onclick=e=>{slow=!slow;e.currentTarget.setAttribute('aria-pressed',slow);e.currentTarget.classList.toggle('on',slow);if(!slow){execLine=0;renderCode();slowInfo.hidden=true;varsBox.hidden=true}toast(slow?'🐢 Rallentatore acceso: una riga alla volta. Avvia (o riavvia) la simulazione.':'Velocità normale.')};
  const pb=q('[data-press]');const down=e=>{e.preventDefault();if(bench.press(true)){pb.classList.add('down');pressedOnce=true}};const up=()=>{if(pb.classList.contains('down')){bench.press(false);pb.classList.remove('down')}};
  pb.addEventListener('pointerdown',down);pb.addEventListener('pointerup',up);pb.addEventListener('pointerleave',up);pb.addEventListener('pointercancel',up);
  pb.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)down(e)});pb.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')up()});
  bench.onPress=(id,d)=>{if(d){pressedOnce=true;beep(660,.04,.03)}o.onPress&&o.onPress(d)};
  if(o.editable){q('[data-rot]').onclick=()=>bench.rotateSel();q('[data-del]').onclick=()=>bench.deleteSel();q('[data-undo]').onclick=()=>bench.undo();
    q('[data-clear]').onclick=()=>{if(confirm('Vuoi togliere tutti i componenti e i fili dal banco?')){bench.clear();o.onCircuit&&o.onCircuit(bench.save())}};
    bench.onChange=()=>{o.onCircuit&&o.onCircuit(bench.save())}}
  if(o.palette){$$('.pal',root).forEach(p=>p.addEventListener('pointerdown',ev=>bench.startPaletteDrag(ev,p.dataset.t)));
    $$('[data-tab]',root).forEach(b=>b.onclick=()=>{$$('[data-tab]',root).forEach(x=>x.classList.toggle('on',x===b));q('.wbpal').hidden=b.dataset.tab!=='comp';q('.wbcode').hidden=b.dataset.tab!=='code';bench.fit()})}
  if(o.check)q('[data-check]').onclick=()=>showCheck(runChecks(o.check,bench,ta.value),o.check);
  const api={bench,root,get code(){return ta.value},set code(v){ta.value=v;errLine=0;renderCode();liveLint()},get serial(){return serialTxt},get pressedOnce(){return pressedOnce},get running(){return running},
    start,stop:()=>bench.stop(),setSlow(v){slow=!!v;const b=q('[data-slow]');if(b){b.setAttribute('aria-pressed',slow);b.classList.toggle('on',slow)}},
    destroy(){bench.destroy()}};
  R.cleanup.push(()=>bench.destroy());
  return api;
}

/* =====================================================
   CONTROLLO AUTOMATICO (circuito + comportamento + commenti)
   ex.need = {leds:[colori...], btn:true}, ex.tests = [{d, script, until, check}]
   ===================================================== */
function runChecks(ex,bench,code){const out=[];const an=bench.analyze();
  const add=(ok,txt,why)=>out.push({ok,txt,why});
  if(an.shorts)add(false,'Cortocircuito','Il 5V è collegato direttamente a GND: togli il filo sbagliato.');
  const need=ex.need||{};
  (need.leds||[]).forEach((col,i)=>{const same=need.leds.filter(c=>c===col).length;const L=an.leds.filter(l=>l.color===col);
    if(L.length<same){add(false,`LED ${col}${same>1?' ('+same+' in tutto)':''}`,`Sul banco ${L.length?'ce ne sono solo '+L.length:'non c’è'}. Trascinalo dai Componenti e cliccalo per scegliere il colore.`);return}
    if(need.leds.indexOf(col)!==i)return;
    L.forEach(l=>{if(!l.inBoard)return add(false,`LED ${col}`,'Una gamba è fuori dai fori.');
      if(l.reversed)return add(false,`LED ${col}`,'È montato al contrario: il lato + (anodo) va verso il pin.');
      if(l.pin===null)return add(false,`LED ${col}`,'Il lato + non arriva a nessun pin di Arduino.');
      if(!l.gnd)return add(false,`LED ${col} (pin ${l.pin})`,'Il lato − non torna a GND.');
      if(!l.res)return add(false,`LED ${col} (pin ${l.pin})`,'Manca la resistenza: nella realtà il LED si brucerebbe. Usa 220 Ω.');
      if(l.res>1000)return add(false,`LED ${col} (pin ${l.pin})`,`La resistenza è da ${fmtR(l.res)}: troppo grande, il LED resta quasi spento. Usa 220 Ω.`);
      add(true,`LED ${col} sul pin ${l.pin}, con resistenza da ${fmtR(l.res)}`)})});
  if(need.btn){const b=an.btns[0];
    if(!b)add(false,'Pulsante','Manca il pulsante.');
    else if(!b.inBoard)add(false,'Pulsante','Una gamba è fuori dai fori.');
    else if(b.pin===null)add(false,'Pulsante','Non è collegato a nessun pin.');
    else if(b.rotated)add(false,'Pulsante (pin '+b.pin+')','Il pin e il 5V sono sulla stessa coppia di gambe: il pin legge sempre HIGH. Ruota il pulsante o sposta i fili.');
    else if(!b.to5V&&!b.pullup)add(false,'Pulsante (pin '+b.pin+')','L’altro lato del pulsante deve andare al 5V.');
    else if(b.pullup&&!/INPUT_PULLUP/.test(code))add(false,'Pulsante (pin '+b.pin+')','Il pulsante va a GND: in questo caso nel codice serve INPUT_PULLUP.');
    else if(b.to5V&&!b.pull)add(false,'Pulsante (pin '+b.pin+')','Manca la resistenza di pull-down da 10 kΩ tra il pin e GND: senza, il pin è flottante e legge valori a caso.');
    else add(true,`Pulsante sul pin ${b.pin}${b.pull?', con pull-down da '+fmtR(b.pull):' (INPUT_PULLUP)'}`)}
  let compiled=true;try{ARD.compile(code)}catch(e){compiled=false;add(false,'Il codice non parte',`Riga ${e.line||'?'}: ${e.message}`)}
  if(compiled&&ex.tests)ex.tests.forEach(t=>{const r=bench.vrun(code,t.script||[],t.until||3000);if(r.err){add(false,t.d,'Errore durante la prova: '+r.err.message);return}
    let res;try{res=t.check(r,code)}catch(e){res=false}add(res===true,t.d,res===true?'':typeof res==='string'?res:(t.hint||'Il comportamento non è quello richiesto.'))});
  if(compiled){const miss=uncommented(code);const real=code.split('\n').filter(l=>{const t=l.trim();return t&&!/^[{}]+;?$/.test(t)&&!t.startsWith('//')&&!/^(void\s+\w+\s*\(\s*\)\s*\{?|\}?\s*else\s*\{?)$/.test(t)}).length;if(!real)add(false,'Commenti // su ogni riga','Prima scrivi il codice.');else add(!miss.length,'Commenti // su ogni riga',miss.length?`Mancano i commenti alle righe ${miss.slice(0,8).join(', ')}${miss.length>8?'…':''}. Nel compito ogni riga senza commento costa punti.`:'')}
  return out}
function uncommented(code){const bad=[];code.split('\n').forEach((l,i)=>{const t=l.trim();if(!t||/^[{}]+;?$/.test(t)||t.startsWith('//'))return;if(/^(void\s+\w+\s*\(\s*\)\s*\{?|\}?\s*else\s*\{?)$/.test(t))return;if(!t.includes('//'))bad.push(i+1)});return bad}
function showCheck(res,ex){const good=res.filter(r=>r.ok).length,all=res.length,full=good===all;if(full){confetti();ding();if(ex.id){PROG.bench[ex.id]=1;save()}}
  sheet(`<h3>${full?'🎉 Tutto giusto!':'🔍 Il controllo dice…'}</h3><p class="muted small">${good} controlli su ${all} superati.</p>
   <ul class="checks">${res.map(r=>`<li class="${r.ok?'ok':'ko'}"><span>${r.ok?'✅':'❌'}</span><div><b>${esc(r.txt)}</b>${r.why?`<div class="small">${esc(r.why)}</div>`:''}</div></li>`).join('')}</ul>
   ${full?'<p class="callout ok">Ora fai lo screenshot del circuito, scrivi l’elenco dei pin e copia il codice: è proprio quello che chiede la verifica.</p>':''}
   <div class="row end"><button class="btn pri" data-x>Ok</button></div>`)}
