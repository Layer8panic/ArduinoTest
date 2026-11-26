/* =====================================================
   Arduino Lab · IL TUTOR DEL LABORATORIO
   Leggi → Analisi → Circuito → Codice → Prova → Trova l'errore → Domanda
   (struttura del tutor di Flowchart Lab, adattata ad Arduino)
   ===================================================== */
"use strict";
const STOP=Symbol('stop');
const STAGES=['Leggi','Analisi','Circuito','Codice','Prova','Errore','Domanda','Fine'];
function Tutor(chat,choices,token){
  const alive=()=>R.token===token;
  const scroll=()=>{try{(SET.lim?chat:choices).scrollIntoView({block:'end',behavior:SET.rm?'auto':'smooth'})}catch(e){}};
  async function say(html,cls=''){if(!alive())throw STOP;const m=document.createElement('div');m.className='msg';m.innerHTML=`<div class="av" aria-hidden="true">🤖</div><div class="bub"><span class="typing" aria-label="Il tutor sta scrivendo"><span></span><span></span><span></span></span></div>`;chat.appendChild(m);scroll();
    await sleep(SET.rm?60:Math.min(1000,260+html.replace(/<[^>]+>/g,'').length*8));if(!alive())throw STOP;m.className='msg '+cls;m.querySelector('.bub').innerHTML=html;scroll()}
  function me(html){const m=document.createElement('div');m.className='msg me';m.innerHTML=`<div class="bub">${html}</div>`;chat.appendChild(m)}
  function pick(build){return new Promise(res=>{choices.innerHTML=build;scroll();const h=e=>{const b=e.target.closest('[data-c]');if(!b||b.disabled)return;choices.removeEventListener('click',h);res(b)};choices.addEventListener('click',h);
    R.cleanup.push(()=>choices.removeEventListener('click',h))})}
  /* domanda a scelta: opts = [[testo, giusto, perché]] */
  async function ask(q,opts,okMsg,o={}){await say(q);const order=shuffle(opts.map((_,i)=>i));
    if(o.multi){const sel=new Set();const draw=()=>`<div class="opts">${order.map(i=>`<button class="opt" data-t="${i}" aria-pressed="${sel.has(i)}"${window.__T&&opts[i][1]?' data-ok':''}><span class="mk" aria-hidden="true">${sel.has(i)?'✓':''}</span><span>${o.code?`<code>${esc(opts[i][0])}</code>`:esc(opts[i][0])}</span></button>`).join('')}</div><button class="btn pri wide" data-c style="margin-top:8px">Controlla</button>`;
      const tog=e=>{const t=e.target.closest('[data-t]');if(!t)return;const i=+t.dataset.t;sel.has(i)?sel.delete(i):sel.add(i);t.setAttribute('aria-pressed',sel.has(i));t.querySelector('.mk').textContent=sel.has(i)?'✓':''};
      choices.addEventListener('click',tog);R.cleanup.push(()=>choices.removeEventListener('click',tog));
      for(;;){await pick(draw());const ch=[...sel];me(ch.length?ch.map(i=>esc(opts[i][0])).join(', '):'(niente)');
        const wrong=ch.filter(i=>!opts[i][1]),miss=opts.map((_,i)=>i).filter(i=>opts[i][1]&&!sel.has(i));
        if(!wrong.length&&!miss.length){choices.removeEventListener('click',tog);await say('✅ '+okMsg,'good');return}
        let m=wrong.map(i=>'• '+esc(opts[i][2]||`“${opts[i][0]}” non c’entra.`)).join('<br>');if(miss.length)m+=(m?'<br>':'')+'• Manca ancora qualcosa. Rileggi il testo.';
        await say('Quasi! '+m+'<br>Correggi e premi di nuovo Controlla.','bad')}}
    const tried=new Set();let errs=0;
    for(;;){const b=await pick(`<div class="opts">${order.map(i=>`<button class="opt${errs>=2&&opts[i][1]?' hint':''}" data-c data-i="${i}"${tried.has(i)?' disabled':''}${window.__T&&opts[i][1]?' data-ok':''}><span class="mk" aria-hidden="true">${tried.has(i)?'✗':''}</span><span>${o.code?`<code>${esc(opts[i][0])}</code>`:esc(opts[i][0])}</span></button>`).join('')}</div>`);
      const i=+b.dataset.i,op=opts[i];me(o.code?`<code>${esc(op[0])}</code>`:esc(op[0]));
      if(op[1]){await say('✅ '+okMsg,'good');return errs}tried.add(i);errs++;await say('Non proprio. '+esc(op[2]||'')+(errs>=2?' Ti ho evidenziato quella giusta.':' Riprova.'),'bad')}}
  return{say,me,pick,ask,alive,clear(){chat.innerHTML='';choices.innerHTML=''},choices}}

/* distrattori automatici per le righe di codice che non ne hanno */
function mutate(c){const out=[];
  if(/HIGH/.test(c))out.push([c.replace('HIGH','LOW'),'HIGH e LOW sono scambiati: guarda cosa deve fare questa riga.']);
  else if(/LOW/.test(c))out.push([c.replace('LOW','HIGH'),'HIGH e LOW sono scambiati: guarda cosa deve fare questa riga.']);
  const d=c.match(/delay\((\d+)\)/);if(d)out.push([c.replace(d[1],String(+d[1]/10)),`delay conta in millisecondi: ${d[1]/10} ms non è il tempo richiesto.`]);
  if(/digitalWrite/.test(c))out.push([c.replace('digitalWrite','digitalRead'),'digitalRead legge, non accende né spegne.']);
  if(/Serial\.println\("/.test(c))out.push([c.replace(/"([^"]*)"/,'$1'),'Il testo va tra virgolette, altrimenti Arduino cerca una variabile con quel nome.']);
  if(/;\s*$/.test(c))out.push([c.replace(/;\s*$/,''),'Manca il punto e virgola alla fine.']);
  if(/\{\s*$/.test(c)&&/else/.test(c))out.push([c.replace('else','else if'),'Basta else: copre tutti gli altri casi.']);
  return out}

async function tutorRun(ex){
  const token=R.token;const T=Tutor($('#chat'),$('#choices'),token);const panel=$('#exPanel');
  const stages=$$('#exSteps span');const stage=i=>{stages.forEach((s,j)=>{s.className=j<i?'d':j===i?'c':''});const c=stages[i];c&&c.scrollIntoView&&c.scrollIntoView({block:'nearest',inline:'center'})};
  const brief=ex.n>2;
  try{
    stage(0);
    await T.say(`Ciao! Sono il tutor 🤖. Facciamo insieme l’<b>esercizio ${ex.n}</b>: <b>${esc(ex.title.replace(/^Verifica · /,''))}</b>.`);
    await T.say('<b>Leggi bene il testo</b> e la tabella qui accanto: le parole evidenziate sono quelle importanti.');
    if(ex.note)await T.say('⚠️ '+ex.note);
    await T.pick(`<button class="btn pri wide" data-c>Ho letto 👍</button>`);T.me('Ho letto');
    /* ---------- ANALISI ---------- */
    stage(1);
    for(const q of ex.analysis)await T.ask(q.q,q.opts,q.ok,{multi:q.multi});
    await T.say('Analisi fatta 🎯. Ora <b>progettiamo il circuito</b>: nella verifica i pin e i collegamenti li scegli tu, quindi ragioniamo su ogni pezzo.');
    await T.pick(`<button class="btn pri wide" data-c>Montiamo il circuito 🔧</button>`);
    /* ---------- CIRCUITO ---------- */
    stage(2);T.clear();panel.hidden=false;panel.innerHTML='<div class="ph">Il tuo circuito</div><div class="benchbox"></div><div data-pins></div>';
    const bench=createBench($('.benchbox',panel),{editable:false});R.cleanup.push(()=>bench.destroy());
    const parts=ex.parts;let ledN=0;const used=[];
    for(let i=0;i<parts.length;i++){const p=parts[i];
      if(p.t==='rails'){
        if(!brief)await T.ask('Primo passo: portiamo <b>5V</b> e <b>GND</b> sulla breadboard. Il filo che parte dal pin <b>5V</b> dove lo mettiamo?',[['Sulla riga lunga rossa +',1],['Sulla riga lunga blu −',0,'La riga − è per il GND. I colori servono a non confondersi.'],['Direttamente nel pin 13',0,'Il 5V non va in un pin digitale: va sul binario +, così tutti i componenti lo trovano vicino.']],'Giusto: 5V sul binario <b>+</b> (filo rosso) e GND sul binario <b>−</b> (filo nero).');
        else await T.say('Come sempre, per prima cosa: <b>5V</b> sul binario + (filo rosso) e <b>GND</b> sul binario − (filo nero).');
        bench.build(k=>buildParts(parts,k,i+1))}
      else if(p.t==='led'){const nm=`LED ${p.color}${p.label?' delle '+p.label:''}`;
        if(ledN===0&&!brief){
          await T.ask(`Ora il <b>${nm}</b>. La gamba <b>+</b> (anodo, la più lunga) va…`,[[`Verso il pin ${p.pin} di Arduino`,1],['Verso GND',0,'Così il LED sarebbe al contrario e resterebbe spento.'],['Direttamente al 5V',0,'Così sarebbe sempre acceso: Arduino non potrebbe comandarlo.']],`Sì: dal <b>pin ${p.pin}</b> arriva la spinta quando il programma scrive HIGH.`);
          await T.ask('E sulla gamba <b>−</b>, prima di arrivare a GND, cosa mettiamo?',[['Una resistenza da 220 Ω',1],['Una resistenza da 10 kΩ',0,'Troppo grande: il LED sarebbe quasi spento.'],['Niente, un filo',0,'Senza resistenza il LED si brucerebbe.']],'Perfetto: 220 Ω tra la gamba − e il binario −.')}
        else{const opts=[[`pin ${p.pin}`,1]];const u=used[used.length-1];if(u)opts.push([`pin ${u.pin}`,0,`Il pin ${u.pin} è già usato da ${u.what}.`]);opts.push(['pin 0',0,'I pin 0 e 1 servono al Monitor seriale.']);if(opts.length<3)opts.push(['5V',0,'Al 5V il LED sarebbe sempre acceso.']);
          await T.ask(`Il <b>${nm}</b>: lo montiamo come gli altri, con la sua 220 Ω verso GND. A quale pin colleghiamo la gamba +?`,opts,`Ok: <b>${nm} → pin ${p.pin}</b>.`)}
        used.push({pin:p.pin,what:'il '+nm});ledN++;bench.build(k=>buildParts(parts,k,i+1))}
      else if(p.t==='btn'){
        if(!brief){await T.ask('Ora il <b>pulsante</b>. Come lo mettiamo sulla breadboard?',[['A cavallo della scanalatura centrale',1],['Tutto nella parte di sopra',0,'Le gambe finirebbero nelle stesse colonne: il pulsante sarebbe sempre “premuto”.'],['Fuori dalla breadboard',0,'Va infilato nei fori.']],'Giusto: a cavallo della scanalatura le due coppie di gambe restano separate.');
          await T.ask(`Un lato del pulsante va al <b>5V</b>, l’altro al <b>pin ${p.pin}</b>. Cosa manca?`,[['Una resistenza da 10 kΩ tra il pin e GND (pull-down)',1],['Niente, così basta',0,'Quando non premi il pin resterebbe “in aria” e leggerebbe valori a caso.'],['Una resistenza da 220 Ω tra pin e 5V',0,'La 220 Ω è per i LED. Al pulsante serve la pull-down da 10 kΩ verso GND.']],'Esatto: con la <b>pull-down</b> il pin legge LOW quando non premi e HIGH quando premi.')}
        else await T.ask(`E il pulsante sul <b>pin ${p.pin}</b>: tra il pin e GND mettiamo…`,[['La pull-down da 10 kΩ',1],['Niente',0,'Il pin sarebbe flottante.'],['La 220 Ω',0,'La 220 Ω è per i LED.']],'Sì, sempre la pull-down da 10 kΩ.');
        used.push({pin:p.pin,what:'il pulsante'});bench.build(k=>buildParts(parts,k,i+1))}}
    const pinsHtml=`<table class="tbl pins"><tr><th>Componente</th><th>Pin</th><th>Resistenza</th></tr>${parts.filter(p=>p.t!=='rails').map(p=>p.t==='led'?`<tr><td><span class="dotc" style="background:${LEDC[p.color]}"></span>LED ${p.color}${p.label?' ('+p.label+')':''}</td><td><b>${p.pin}</b></td><td>220 Ω verso GND</td></tr>`:`<tr><td>🔘 Pulsante</td><td><b>${p.pin}</b></td><td>10 kΩ pull-down verso GND</td></tr>`).join('')}</table>`;
    $('[data-pins]',panel).innerHTML='<div class="ph" style="margin-top:10px">Elenco dei pin (da consegnare!)</div>'+pinsHtml;
    confetti();await T.say('🎉 Circuito completo! Qui sotto c’è l’<b>elenco dei pin</b>: in verifica va sempre consegnato insieme allo screenshot.','good');
    await T.say('Ricorda: i pin puoi sceglierli tu. L’importante è che <b>codice e circuito usino gli stessi numeri</b>.');
    await T.pick(`<button class="btn pri wide" data-c>Scriviamo il codice ⌨️</button>`);
    /* ---------- CODICE ---------- */
    stage(3);T.clear();const done=[];let helped=0;
    const show=(ghost)=>{const lines=done.map(l=>l.cm?(l.c.padEnd(34,' ')+' // '+l.cm):l.c);if(ghost)lines.push(ghost);
      panel.innerHTML=`<div class="ph">Il tuo codice</div><div class="codescroll">${codeBlock(lines.join('\n'),{mark:ghost?[lines.length]:[],cls:'small'})}</div><div class="ph" style="margin-top:8px">Elenco dei pin</div>${pinsHtml}`;
      const m=panel.querySelector('.ln.mk');if(m){m.classList.add('ghost');try{const sc=$('.codescroll',panel);sc.scrollTop=m.offsetTop-sc.clientHeight/2}catch(e){}}};
    let section='';
    for(const l of ex.code){
      const sec=/void setup/.test(l.c)?'setup':/void loop/.test(l.c)?'loop':section;
      if(l.auto){done.push(l);show();if(l.say)await T.say(l.say);if(sec!==section)section=sec;continue}
      section=sec;show('▢ ?');
      await T.say(`Prossima riga${section?` (nel <b>${section}()</b>)`:''}${l.cm?`: quella che fa <i>“${esc(l.cm)}”</i>`:''}. Qual è?`);
      let wr=[...l.wrong];if(wr.length<2)mutate(l.c).forEach(m=>{if(wr.length<2&&!wr.some(w=>w[0]===m[0])&&m[0]!==l.c)wr.push(m)});
      const opts=[[l.c.trim(),1],...shuffle(wr).slice(0,2).map(w=>[w[0].trim(),0,w[1]])];const ord=shuffle(opts.map((_,i)=>i));const tried=new Set();let errs=0;
      for(;;){const b=await T.pick(`<div class="opts">${ord.map(i=>`<button class="opt${errs>=2&&opts[i][1]?' hint':''}" data-c data-i="${i}"${tried.has(i)?' disabled':''}${window.__T&&opts[i][1]?' data-ok':''}><span class="mk" aria-hidden="true">${tried.has(i)?'✗':''}</span><code>${esc(opts[i][0])}</code></button>`).join('')}</div><button class="btn ghost sm" data-c data-skip style="align-self:center">⏩ Scrivila tu</button>`);
        if(b.dataset.skip!==undefined){T.me('Scrivila tu');helped++;done.push(l);show();await T.say(`Eccola: <code>${esc(l.c.trim())}</code>${l.why?'. '+l.why:''}`);break}
        const i=+b.dataset.i,o=opts[i];T.me(`<code>${esc(o[0])}</code>`);
        if(o[1]){done.push(l);show();await T.say('✅ '+(l.why||'Giusto!'),'good');break}
        tried.add(i);errs++;await T.say(esc(o[2]||'Non è questa.')+(errs>=2?' Ti ho evidenziato quella giusta.':' Riprova.'),'bad')}}
    show();confetti();await T.say(`🎉 Programma completo${helped?'':' e scritto tutto da te'}! Ogni riga ha il suo <b>commento //</b>: in verifica è obbligatorio.`,'good');
    await T.pick(`<button class="btn pri wide" data-c>Proviamolo ▶</button>`);
    /* ---------- PROVA ---------- */
    stage(4);T.clear();panel.innerHTML='<div class="ph">Circuito e codice: provali</div><div data-wb></div>';let tested=false;
    const wb=mountWorkbench($('[data-wb]',panel),{circuit:k=>buildParts(ex.parts,k),code:ex.sol});
    await T.say('Premi <b>▶ Avvia simulazione</b>. Poi <b>tieni premuto</b> il pulsante: con il mouse sul pulsante rosso del circuito, oppure con il tasto <b>👆</b>.');
    await T.say('Guarda i LED e il <b>Monitor seriale</b>: devono fare esattamente quello che dice la tabella. Con il 🐢 <b>rallentatore</b> vedi anche la riga che Arduino sta eseguendo.');
    const report=async(tests,code)=>{const rows=tests.map(t=>{const r=wb.bench.vrun(code,t.script||[],t.until||3000);let good=false;if(!r.err)try{good=t.check(r)===true}catch(e){}return `${good?'✅':'❌'} ${esc(t.d)}`});
      await T.say('Ho provato il programma premendo e rilasciando il pulsante al posto tuo:<br>'+rows.join('<br>'),rows.every(r=>r.startsWith('✅'))?'good':'bad')};
    for(;;){const b=await T.pick(`<button class="btn wide" data-c data-k="auto">🧪 Fai il test automatico</button><button class="btn pri wide" data-c data-k="ok">Ho provato: funziona ✓</button>`);
      if(b.dataset.k==='auto'){T.me('Fai il test automatico');await report(ex.tests,wb.code);tested=true;continue}
      if(!tested&&!(wb.pressedOnce)){T.me('Ho provato');await T.say('Prima avvia la simulazione e premi il pulsante almeno una volta, oppure fai il test automatico. 😉','bad');continue}
      T.me('Funziona ✓');break}
    wb.stop();
    if(ex.variant){const v=ex.variant;await T.ask(v.q,v.opts,v.ok);if(v.alt)await T.say('💡 '+v.alt);
      const V=v.swap;let inIf=false;const codeB=codeOf(ex.code.map(l=>{const t=l.c.trim();if(/^if \(/.test(t))inIf=true;if(t===`digitalWrite(${V}, HIGH);`)return{...l,c:l.c.replace('HIGH','LOW'),cm:'CAMBIATA: premuto = LED spento'};if(t===`digitalWrite(${V}, LOW);`)return{...l,c:l.c.replace('LOW','HIGH'),cm:'CAMBIATA: rilasciato = LED acceso'};return l})).replace(v.swapMsg?new RegExp('"('+v.swapMsg.join('|')+')"','g'):/$^/,m=>m==='"'+v.swapMsg[0]+'"'?'"'+v.swapMsg[1]+'"':'"'+v.swapMsg[0]+'"');
      wb.code=codeB;await T.say('Ho messo nel codice la variante: le righe cambiate hanno il commento “CAMBIATA”. Avviala e prova.');await report(ex.testsB,codeB);
      await T.pick(`<button class="btn pri wide" data-c>Avanti →</button>`)}
    /* ---------- TROVA L’ERRORE ---------- */
    stage(5);T.clear();const bug=ex.bug;
    await T.say('Sfida: <b>trova l’errore</b> 🔍');await T.say(bug.q);
    panel.innerHTML=`<div class="ph">Il codice del compagno: tocca una riga</div><div class="buglist">${bug.lines.map((l,i)=>`<button class="bugl" data-l="${i+1}"><i>${i+1}</i><code>${hl(l)||' '}</code></button>`).join('')}</div>`;
    let tries=0;
    await new Promise(res=>{const h=async e=>{const b=e.target.closest('.bugl');if(!b||b.disabled||!T.alive())return;const n=+b.dataset.l;if(!bug.lines[n-1].trim())return;
        if(n===bug.bad){b.classList.add('ok');panel.removeEventListener('click',h);$$('.bugl',panel).forEach(x=>x.disabled=true);try{await T.say('✅ Trovato! '+bug.why,'good')}catch(x){}res()}
        else{tries++;b.classList.add('no');b.disabled=true;try{await T.say(tries>=2?'Quella riga va bene. 💡 '+esc(bug.hint):'Quella riga va bene. Cerca ancora…','bad')}catch(x){}}};
      panel.addEventListener('click',h);R.cleanup.push(()=>{panel.removeEventListener('click',h);res()})});
    if(!T.alive())throw STOP;addSkill('debug',ex.id);
    await T.pick(`<button class="btn pri wide" data-c>Ultima domanda →</button>`);
    /* ---------- DOMANDA ---------- */
    stage(6);T.clear();const qq=ex.question;
    await T.ask(qq.q,qq.opts,'Giusto!');
    await T.say(`✍️ <b>Una risposta scritta bene:</b><br><i>${esc(qq.model)}</i>`);
    if(ex.extra)await T.say(ex.extra);
    /* ---------- FINE ---------- */
    stage(7);PROG.ex[ex.id]=1;save();(ex.skills||[]).forEach(s=>addSkill(s,ex.id));confetti();
    const next=EXS[EXS.findIndex(e=>e.id===ex.id)+1];
    await T.say(`🏆 <b>Fatto!</b> Analisi, circuito, codice, prova, errore e domanda: hai fatto tutto il percorso.`,'good');
    await T.say('Ora rifallo <b>da solo nel Banco</b>, senza tutor: monta il circuito, scrivi il codice e premi <b>✔ Controlla</b>. Quando ti senti pronto, prova la <b>verifica simulata</b>.');
    T.choices.innerHTML=`<a class="btn pri wide" href="#/banco/${ex.id}">🛠 Rifallo da solo nel Banco</a>${next?`<a class="btn wide" href="#/es/${next.id}">${esc(next.title)} →</a>`:''}<a class="btn wide ghost" href="#/lab">Torna al laboratorio</a>`;
  }catch(e){if(e!==STOP)console.error(e)}}
