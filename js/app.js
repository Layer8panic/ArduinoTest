/* =====================================================
   Arduino Lab · SCHERMATE E NAVIGAZIONE
   ===================================================== */
"use strict";
const main=$('#main');
const totalSlides=MODULES.reduce((a,m)=>a+m.slides.length,0);
const VER=SIM;const findEx=id=>EXS.find(e=>e.id===id)||SIM.find(e=>e.id===id);
function overall(){const d=Object.keys(PROG.done).length,e=Object.keys(PROG.ex).length,b=VER.filter(v=>PROG.bench[v.id]).length;return Math.min(100,Math.round(d/totalSlides*50+e/EXS.length*30+b/VER.length*20))}
const modDone=m=>!!PROG.mods[m.id]||m.slides.every((_,j)=>PROG.done[`m${m.id}s${j}`]);
const skillLv=k=>Math.min(3,(PROG.skills[k]||[]).length);
const tableHTML=t=>`<div class="tblwrap"><table class="tbl"><tr>${t[0].map(c=>`<th>${esc(c)}</th>`).join('')}</tr>${t.slice(1).map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;

/* ---------- HOME ---------- */
function home(){const pct=overall();const last=PROG.last;
  main.innerHTML=`<section class="hero"><svg class="float" viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="14" width="52" height="36" rx="5" fill="#fff" opacity=".9"/><circle cx="46" cy="26" r="6" fill="#F5A623"/><rect x="12" y="20" width="22" height="4" fill="#00878F"/><rect x="12" y="28" width="16" height="4" fill="#00878F"/></svg>
    <span class="kick">Arduino · Tinkercad</span><h2>Un pulsante, un LED e un if</h2><p>Da zero alla verifica: circuiti, codice e simulazione, un passo alla volta.</p>
    <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avanzamento"><i style="width:${pct}%"></i></div><p class="small" style="margin:6px 0 10px">Hai completato il ${pct}% del percorso</p>
    <a class="btn" style="background:#fff;color:#006B72;border:0" href="#/${last||'lezione/0/0'}">${last?'▶ Continua da dove eri':'▶ Comincia da zero'}</a></section>
  <div class="tiles">
    <a class="tile" href="#/lezioni"><span class="i" aria-hidden="true">📘</span><b>Lezioni</b><span>9 lezioni brevi, con un’attività in ogni pagina</span></a>
    <a class="tile" href="#/lab"><span class="i" aria-hidden="true">🧪</span><b>Laboratorio</b><span>4 esercizi guidati dal tutor, passo passo</span></a>
    <a class="tile" href="#/banco"><span class="i" aria-hidden="true">🛠</span><b>Banco</b><span>Arduino e breadboard come in Tinkercad, con il codice</span></a>
    <a class="tile" href="#/verifica"><span class="i" aria-hidden="true">📝</span><b>Verifica simulata</b><span>3 esercizi nuovi da fare da solo, con controllo automatico</span></a></div>
  <div class="list">
   <a class="item" href="#/competenze"><span class="i" aria-hidden="true">🏅</span><span class="tx"><b>Le mie competenze</b><span>${SKILLS.filter(s=>skillLv(s[0])>0).length} su ${SKILLS.length} acquisite</span></span><span class="st" aria-hidden="true">›</span></a>
   <a class="item" href="#/ripasso"><span class="i" aria-hidden="true">📒</span><span class="tx"><b>Ripasso</b><span>Collegamenti, istruzioni, schemi di codice, errori da evitare e domande lampo</span></span><span class="st" aria-hidden="true">›</span></a>
   <button class="item" data-settings><span class="i" aria-hidden="true">⚙️</span><span class="tx"><b>Impostazioni e accessibilità</b><span>Testo più grande, contrasto, LIM, suoni</span></span><span class="st" aria-hidden="true">›</span></button></div>`;
  $('[data-settings]').addEventListener('click',settings)}

/* ---------- LEZIONI ---------- */
function lessons(){main.innerHTML=`<h2>Lezioni</h2><p class="muted">Segui l’ordine: ogni lezione usa quello che hai visto prima. Dopo la lezione 6 puoi già fare il primo esercizio del laboratorio.</p><div class="list">${MODULES.map((m,i)=>{const d=m.slides.filter((_,j)=>PROG.done[`m${m.id}s${j}`]).length;const all=modDone(m);const pc=all?100:Math.round(d/m.slides.length*100);
  return `<a class="item lesson${all?' done':''}" href="#/lezione/${i}/0"><span class="i" aria-hidden="true">${all?'✅':m.icon}</span><span class="tx"><b>${i+1}. ${esc(m.title)}</b><span>${esc(m.sub)} · ${m.slides.length} pagine · circa ${m.min} minuti</span><span class="bar mini-bar"><i style="width:${pc}%"></i></span></span><span class="st">${all?'<span class="chip ok">Fatta</span>':pc?pc+'%':'›'}</span></a>`}).join('')}</div>`}
function slide(mi,si){const m=MODULES[mi];if(!m)return go('#/lezioni');
  if(si==='end')return moduleEnd(mi);si=+si;const s=m.slides[si];if(!s)return go(`#/lezione/${mi}/0`);
  PROG.last=`lezione/${mi}/${si}`;save();
  const key=`m${m.id}s${si}`;const done=!!PROG.done[key];
  main.innerHTML=`<div class="slidehead"><span class="chip">${m.icon} Lezione ${mi+1}</span><span class="small muted">${si+1} di ${m.slides.length}</span><div class="dots" aria-label="Pagina ${si+1} di ${m.slides.length}">${m.slides.map((_,j)=>`<i class="${j===si?'c':PROG.done[`m${m.id}s${j}`]?'d':''}"></i>`).join('')}</div></div>
    <article class="slide card${s.act&&s.act.type==='run'?' wide':''}"><h2>${esc(s.t)}</h2><div class="rv">${s.h}</div><div class="act" data-act></div></article>
    <div class="slidenav"><button class="btn" data-prev ${si===0&&mi===0?'disabled':''}>← Indietro</button><button class="btn pri" data-next ${done||SET.lim?'':'disabled'}>${si===m.slides.length-1?'Fine lezione ✓':'Avanti →'}</button></div>
    <p class="small muted" data-lock style="text-align:center;margin-top:-6px">${done||SET.lim?'':'Completa l’attività per andare avanti'}</p>`;
  initIll(main);annotate($('.rv',main));
  mountAct($('[data-act]'),s.act,()=>{PROG.done[key]=1;if(s.act.skill)addSkill(s.act.skill,key);save();const n=$('[data-next]');n.disabled=false;n.classList.add('pop');$('[data-lock]').textContent='';announce('Attività completata. Puoi andare avanti.')});
  $('[data-prev]').addEventListener('click',()=>go(si>0?`#/lezione/${mi}/${si-1}`:`#/lezione/${mi-1}/${MODULES[mi-1].slides.length-1}`));
  $('[data-next]').addEventListener('click',()=>{PROG.done[key]=1;save();go(si<m.slides.length-1?`#/lezione/${mi}/${si+1}`:`#/lezione/${mi}/end`)})}
function exItem(e){return `<a class="item${PROG.ex[e.id]?' done':''}" href="#/es/${e.id}"><span class="i" aria-hidden="true">${PROG.ex[e.id]?'✅':e.icon}</span><span class="tx"><b>${esc(e.title)}</b><span><span class="chip">esercizio ${e.n}</span> ${lvlStars(e.lvl)}${PROG.bench[e.id]?' · 🛠 rifatto da solo':''}</span></span><span class="st" aria-hidden="true">›</span></a>`}
function moduleEnd(mi){const m=MODULES[mi];const nx=MODULES[mi+1];confetti();PROG.mods[m.id]=1;m.slides.forEach((_,j)=>PROG.done[`m${m.id}s${j}`]=1);save();
  main.innerHTML=`<section class="card" style="text-align:center"><div style="font-size:3rem" aria-hidden="true">🎉</div><h2>Lezione ${mi+1} completata!</h2><p>${esc(m.title)}</p></section>
  ${m.ex.length?`<section class="card"><h3>🧪 Ora mettiti alla prova</h3><p class="muted small">Il tutor ti segue passo passo.</p><div class="list">${m.ex.map(id=>exItem(EXS.find(x=>x.id===id))).join('')}</div></section>`:''}
  <div class="row">${nx?`<a class="btn pri" href="#/lezione/${mi+1}/0">Lezione ${mi+2}: ${esc(nx.title)} →</a>`:'<a class="btn pri" href="#/ripasso">📒 Vai al ripasso</a>'}<a class="btn" href="#/lezioni">Tutte le lezioni</a></div>`}

/* ---------- LABORATORIO ---------- */
function lab(){main.innerHTML=`<h2>Laboratorio</h2><p class="muted">Ogni esercizio si fa con il tutor: analisi, circuito, codice riga per riga, prova, caccia all’errore e domanda. Alla fine di ognuno lo rifai da solo nel Banco.</p>
  ${[6,7,8].map(mod=>{const M=MODULES.find(x=>x.id===mod);return `<h3 style="margin-top:16px">${M.icon} Dopo la lezione ${mod}: ${esc(M.title)}</h3><div class="list">${EXS.filter(e=>e.mod===mod).map(exItem).join('')}</div>`}).join('')}`}
function exercise(id){const ex=EXS.find(e=>e.id===id);if(!ex)return go('#/lab');PROG.last='es/'+id;save();
  main.innerHTML=`<div class="exhead" id="exSteps">${STAGES.map(s=>`<span>${s}</span>`).join('')}</div>
   <div class="exgrid"><div><section class="card"><div class="row"><span class="chip">${ex.icon} Esercizio ${ex.n}</span>${lvlStars(ex.lvl)}</div><h2>${esc(ex.title)}</h2><p>${ex.text}</p>${tableHTML(ex.table)}</section>
   <section class="card" id="exPanel" hidden></section></div>
   <section class="card tutorbox" aria-label="Tutor"><div class="chat" id="chat" aria-live="polite"></div><div class="choices" id="choices"></div></section></div>`;
  annotate($('.exgrid section',main));tutorRun(ex)}

/* ---------- BANCO ---------- */
function banco(id){const ex=id?findEx(id):null;const isSim=ex&&SIM.includes(ex);if(id&&!ex)return go('#/banco');
  const key=ex?'bench_'+ex.id:'bench_free';const saved=store.get(key,null);
  main.innerHTML=`${ex?`<details class="card consegna" ${SET.lim?'':'open'}><summary><b>${ex.icon} ${esc(ex.title)}</b> <span class="small muted">· consegna</span></summary><p>${ex.text}</p>${tableHTML(ex.table)}${ex.question?`<p class="callout small"><b>Domanda:</b> ${esc(ex.question)}<br><span class="muted">Rispondi su un foglio, con parole tue.</span></p>`:''}
     <p class="small muted">Monta tu il circuito (scegli tu pin e resistenze), scrivi il codice commentando ogni riga, avvia la simulazione e poi premi <b>✔ Controlla il mio lavoro</b>.</p>
     <div class="row"><button class="btn sm" data-sol>👀 Soluzione</button><button class="btn sm" data-reset>↺ Ricomincia</button>${isSim?'':`<a class="btn sm ghost" href="#/es/${ex.id}">🤖 Fallo con il tutor</a>`}</div></details>`
    :`<div class="row" style="justify-content:space-between"><h2 style="margin:0">Banco di lavoro</h2><div class="row"><button class="btn sm" data-ex>📂 Esempi</button><button class="btn sm" data-reset>🗒️ Nuovo</button></div></div><p class="muted small">Il tuo Tinkercad tascabile: trascina i componenti, collega i fili con due clic, scrivi il codice e avvia. Tutto resta salvato su questo dispositivo.</p>`}
   <div data-wb></div>`;
  const wb=mountWorkbench($('[data-wb]',main),{editable:true,palette:true,check:ex,circuit:saved&&saved.cir?saved.cir:(k=>{k.R_()}),code:saved&&saved.code!=null?saved.code:CODE0,
    onCircuit:c=>{const s=store.get(key,{})||{};s.cir=c;store.set(key,s)},onCode:c=>{const s=store.get(key,{})||{};s.code=c;store.set(key,s)}});
  const r=$('[data-reset]');r&&r.addEventListener('click',()=>{if(!confirm('Ricominciare da zero? Circuito e codice di questo banco verranno cancellati.'))return;store.set(key,null);route()});
  const sb=$('[data-sol]');sb&&sb.addEventListener('click',()=>{if(isSim&&!PROG.bench[ex.id]&&!confirm('Prima prova davvero da solo: la soluzione serve per controllare dopo. Vuoi vederla lo stesso?'))return;const s=sheet(`<h3>👀 Una soluzione possibile</h3><p class="small muted">I pin possono essere diversi dai tuoi: conta che circuito e codice usino gli stessi.</p>${codeBlock(ex.sol)}
     <div class="row end" style="margin-top:10px"><button class="btn" data-load>Carica circuito e codice della soluzione</button><button class="btn pri" data-x>Chiudi</button></div>`);
    $('[data-load]',s).onclick=()=>{if(!confirm('Sostituire il tuo lavoro con la soluzione?'))return;wb.bench.build(k=>buildParts(ex.parts,k));wb.code=ex.sol;store.set(key,{cir:wb.bench.save(),code:ex.sol});closeSheet()}});
  const eb=$('[data-ex]');eb&&eb.addEventListener('click',()=>{const L=[['blink','Il LED che lampeggia (Blink)'],['ciao','Monitor seriale'],['float','Pulsante senza resistenza (flottante)'],['pulldown','Pulsante con pull-down'],['spia','if / else: la spia blu'],['lento','delay lunghi: Arduino è sordo'],['sequenza','Sequenza con contatore']];
    const s=sheet(`<h3>Apri un esempio</h3><div class="list">${L.map(([k,t])=>`<button class="item" data-k="${k}"><span class="i">📄</span><span class="tx"><b>${t}</b></span></button>`).join('')}</div><div class="row end" style="margin-top:12px"><button class="btn x" data-x>Annulla</button></div>`);
    s.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;const D=DEMO[b.dataset.k];wb.bench.build(D.circuit);wb.code=D.code;store.set(key,{cir:wb.bench.save(),code:D.code});closeSheet()})})}

/* ---------- PROVA DI VERIFICA ---------- */
function verifica(){main.innerHTML=`<h2>📝 Verifica simulata</h2>
  <section class="card"><p>Tre esercizi <b>nuovi</b>, dello stesso tipo e della stessa difficoltà di una verifica vera, dal più facile al più difficile. Fai finta di essere in classe: niente tutor, monti il circuito, scrivi il codice e alla fine premi <b>✔ Controlla</b>. Il controllo guarda il circuito, prova il programma premendo il pulsante al posto tuo e conta i commenti.</p>
  <ul class="small"><li>Il circuito lo progetti tu: scegli pin, resistenze e collegamenti.</li><li>Commenta ogni riga con <code>//</code>.</li><li>Per ogni esercizio prepara: screenshot del circuito, elenco dei pin, codice, risposta alla domanda.</li><li>Se ti blocchi, torna al <a href="#/ripasso">ripasso</a> prima di guardare la soluzione.</li></ul></section>
  <div class="list">${VER.map(e=>`<a class="item${PROG.bench[e.id]?' done':''}" href="#/banco/${e.id}"><span class="i" aria-hidden="true">${PROG.bench[e.id]?'✅':e.icon}</span><span class="tx"><b>${e.n}. ${esc(e.title)}</b><span>${e.points} · ${lvlStars(e.lvl)} · ${PROG.bench[e.id]?'superato':'da fare'}</span></span><span class="st">›</span></a>`).join('')}</div>`}

/* ---------- COMPETENZE ---------- */
function competenze(){const tot=SKILLS.reduce((a,s)=>a+skillLv(s[0]),0),max=SKILLS.length*3,pct=Math.round(tot/max*100);const r=46,C=2*Math.PI*r;
  main.innerHTML=`<h2>Le mie competenze</h2><section class="card" style="text-align:center"><svg class="ring" viewBox="0 0 110 110" aria-hidden="true"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--pri)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct/100)}" transform="rotate(-90 55 55)"/><text x="55" y="62" text-anchor="middle" font-size="22" font-weight="800" fill="var(--ink)">${pct}%</text></svg><p class="muted small">Ogni competenza si consolida facendo attività ed esercizi diversi.</p></section>
   <section class="card">${SKILLS.map(([k,t])=>{const l=skillLv(k);return `<div class="sk"><span style="font-size:1.3rem" aria-hidden="true">${l>=3?'🏅':l?'✅':'⬜'}</span><div style="flex:1"><b>${esc(t)}</b><div class="small muted">${l?(l>=3?'Consolidata':'Acquisita, continua ad allenarla'):'Ancora da fare'}</div></div><div class="lv" aria-label="livello ${l} su 3">${[0,1,2].map(i=>`<i class="${i<l?'on':''}"></i>`).join('')}</div></div>`}).join('')}</section>`}

/* ---------- IMPOSTAZIONI ---------- */
function settings(){const s=sheet(`<h3>Impostazioni e accessibilità</h3>
  <div class="fld"><label>Grandezza del testo</label><div class="seg">${[1,2,3,4].map(n=>`<button data-fs="${n}" aria-pressed="${SET.fs===n}" style="font-size:${.75+n*.12}rem">A</button>`).join('')}</div></div>
  <div class="list" style="margin-top:10px">
   <button class="item" data-t="hc" aria-pressed="${SET.hc}"><span class="i">🌓</span><span class="tx"><b>Contrasto alto</b><span>${SET.hc?'Attivo':'Spento'}</span></span></button>
   <button class="item" data-t="rm" aria-pressed="${SET.rm}"><span class="i">🧘</span><span class="tx"><b>Riduci le animazioni</b><span>${SET.rm?'Attivo':'Spento'}</span></span></button>
   <button class="item" data-t="sound" aria-pressed="${SET.sound}"><span class="i">🔔</span><span class="tx"><b>Suoni</b><span>${SET.sound?'Attivo':'Spento'}</span></span></button>
   <button class="item" data-t="lim" aria-pressed="${SET.lim}"><span class="i">🖥️</span><span class="tx"><b>Modalità LIM (lavagna)</b><span>Tutto lo schermo, testi grandi, pagine sbloccate. Si attiva anche con l’icona in alto a destra.</span></span></button>
   <button class="item" data-reset><span class="i">🗑️</span><span class="tx"><b>Azzera i progressi</b><span>Ricomincia da capo (anche i banchi salvati)</span></span></button></div>
  <div class="row end" style="margin-top:12px"><button class="btn pri x" data-x>Fatto</button></div>`);
  s.addEventListener('click',e=>{if(e.target.closest('[data-x]')){route();return}
    const f=e.target.closest('[data-fs]');if(f){SET.fs=+f.dataset.fs;applySettings();$$('[data-fs]',s).forEach(b=>b.setAttribute('aria-pressed',b===f))}
    const t=e.target.closest('[data-t]');if(t){const k=t.dataset.t;SET[k]=!SET[k];applySettings();t.setAttribute('aria-pressed',SET[k]);t.querySelector('.tx span').textContent=SET[k]?'Attivo':'Spento'}
    if(e.target.closest('[data-reset]')&&confirm('Sicuro? Tutti i progressi verranno cancellati.')){Object.assign(PROG,{done:{},ex:{},skills:{},mods:{},bench:{},last:''});save();['bench_free',...EXS.map(x=>'bench_'+x.id),...SIM.map(x=>'bench_'+x.id)].forEach(k=>store.set(k,null));closeSheet();go('#/')}})}

/* ---------- ROUTER ---------- */
function go(h){if(location.hash===h)route();else location.hash=h}
const TITLES={'':'Arduino Lab',lezioni:'Lezioni',lab:'Laboratorio',banco:'Banco di lavoro',verifica:'Verifica simulata',ripasso:'Ripasso',competenze:'Competenze'};
function route(){R.cleanup.forEach(f=>{try{f()}catch(e){}});R.cleanup=[];R.token={};closeSheet();
  const h=location.hash.replace(/^#\/?/,'');const [a='',b,c]=h.split('/');
  document.body.classList.toggle('wide',['banco','es'].includes(a)||(a==='lezione'&&MODULES[+b]&&MODULES[+b].slides[+c]&&MODULES[+b].slides[+c].act.type==='run'));
  try{({'':home,lezioni:lessons,lezione:()=>slide(+b,c),lab,es:()=>exercise(b),banco:()=>banco(b),verifica,ripasso,competenze}[a]||home)()}
  catch(e){console.error(e);main.innerHTML=`<div class="card"><h2>Ops!</h2><p>Qualcosa non ha funzionato in questa pagina. Torna alla <a href="#/">Home</a>.</p></div>`}
  const navKey={'':'home',lezioni:'lezioni',lezione:'lezioni',lab:'lab',es:'lab',banco:'banco',verifica:'verifica',ripasso:'home'}[a]||'home';
  $$('.nav a').forEach(x=>{if(x.dataset.nav===navKey)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});
  const t=a==='lezione'&&MODULES[+b]?MODULES[+b].title:a==='es'?(EXS.find(e=>e.id===b)||{}).title||'Esercizio':a==='banco'&&b?'Banco · '+((findEx(b)||{}).title||''):TITLES[a]||'Arduino Lab';
  $('#title').textContent=t;document.title=t+' · Arduino Lab';$('#backBtn').hidden=!a;window.scrollTo(0,0)}
$('#backBtn').addEventListener('click',()=>{const h=location.hash.replace(/^#\/?/,'').split('/');if(h[0]==='lezione')go('#/lezioni');else if(h[0]==='es')go('#/lab');else if(h[0]==='banco'&&h[1])go(SIM.find(e=>e.id===h[1])?'#/verifica':'#/lab');else go('#/')});
$('#limBtn').addEventListener('click',()=>{SET.lim=!SET.lim;applySettings();
  try{if(SET.lim&&document.documentElement.requestFullscreen&&!document.fullscreenElement)document.documentElement.requestFullscreen().catch(()=>{});if(!SET.lim&&document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}
  toast(SET.lim?'Modalità LIM attiva':'Modalità LIM disattivata');route()});
window.addEventListener('hashchange',route);
applySettings();route();
