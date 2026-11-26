/* =====================================================
   Arduino Lab · utilità comuni
   (stile e logica presi da Flowchart Lab, adattati)
   ===================================================== */
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const store={get(k,d){try{const v=localStorage.getItem('alab_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('alab_'+k,JSON.stringify(v))}catch(e){}}};
const SET=Object.assign({fs:2,hc:false,rm:false,lim:false,sound:true},store.get('set',{}));
const PROG=Object.assign({done:{},ex:{},skills:{},mods:{},bench:{},last:''},store.get('prog',{}));
const save=()=>{store.set('prog',PROG);store.set('set',SET)};
/* stato della pagina: ogni cambio di pagina invalida i tutor e pulisce i timer */
const R={cleanup:[],token:{}};

/* ---------- elementi condivisi: tooltip, fantasma del trascinamento, toast ---------- */
const UI={
  esc,
  tipEl(){let t=document.getElementById('tip');if(!t){t=document.createElement('div');t.id='tip';t.hidden=true;document.body.append(t)}return t},
  ghostEl(){let g=document.getElementById('ghost');if(!g){g=document.createElement('div');g.id='ghost';g.hidden=true;document.body.append(g)}return g},
  toast(msg,ms=3200){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.append(t)}
    t.innerHTML=msg;t.hidden=false;t.style.animation='none';void t.offsetWidth;t.style.animation='';clearTimeout(UI._tt);UI._tt=setTimeout(()=>t.hidden=true,ms)}
};
const toast=(m,ms)=>UI.toast(m,ms);
function announce(t){const l=$('#live');if(!l)return;l.textContent='';setTimeout(()=>l.textContent=t,30)}

/* ---------- suoni discreti ---------- */
let AC=null;
function beep(f=880,d=.08,v=.04){if(!SET.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g).connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
const ding=()=>{beep(988,.1);setTimeout(()=>beep(1319,.18),90)};
function confetti(){if(SET.rm||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const cs=['#00878F','#F5A623','#2E7D4F','#E05A5A','#8E5BD0','#FFD43B'];
  for(let i=0;i<46;i++){const d=document.createElement('i');d.className='confetti';d.style.left=Math.random()*100+'vw';d.style.background=cs[i%cs.length];d.style.setProperty('--d',(1.6+Math.random()*1.8)+'s');d.style.animationDelay=Math.random()*.4+'s';document.body.appendChild(d);setTimeout(()=>d.remove(),4200)}}

/* ---------- finestra dal basso (sheet) ---------- */
let CUR_SHEET=null;
function sheet(html){closeSheet();const s=document.createElement('div');s.className='scrim';s.innerHTML=`<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  s._prev=document.activeElement;document.body.appendChild(s);CUR_SHEET=s;
  s.addEventListener('click',e=>{if(e.target===s||e.target.closest('[data-x]'))closeSheet()});
  const f=s.querySelector('button,input,select,textarea');f&&f.focus();return s.firstElementChild}
function closeSheet(){if(CUR_SHEET){const p=CUR_SHEET._prev;CUR_SHEET.remove();CUR_SHEET=null;if(p&&p.focus)try{p.focus()}catch(e){}}}
addEventListener('keydown',e=>{if(e.key==='Escape'&&CUR_SHEET)closeSheet()});

/* ---------- colorazione del codice Arduino ---------- */
function hl(src){const re=/(\/\/[^\n]*)|("[^"\n]*")|\b(void|int|if|else|for|while|long|bool|boolean|byte|const)\b|\b(HIGH|LOW|OUTPUT|INPUT_PULLUP|INPUT|LED_BUILTIN|true|false)\b|(Serial\.begin|Serial\.println|Serial\.print|\bpinMode|\bdigitalWrite|\bdigitalRead|\bdelay|\bsetup|\bloop)\b|\b(\d+)\b/g;
  let o='',l=0,m;while((m=re.exec(src))){o+=esc(src.slice(l,m.index));const c=m[1]?'cm':m[2]?'s':m[3]?'k':m[4]?'c':m[5]?'f':'n';o+=`<span class="${c}">${esc(m[0])}</span>`;l=re.lastIndex}return o+esc(src.slice(l))}
/* blocco di codice di sola lettura, con numeri di riga */
function codeBlock(src,o={}){const L=src.split('\n');return `<div class="cblock${o.cls?' '+o.cls:''}"><button class="cbcopy" type="button" data-copy aria-label="Copia il codice">📋 Copia</button><pre>${L.map((l,i)=>`<span class="ln${o.mark&&o.mark.includes(i+1)?' mk':''}" data-ln="${i+1}"><i>${i+1}</i>${hl(l)||' '}</span>`).join('')}</pre></div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(!b)return;const pre=b.parentElement.querySelector('pre');if(!pre)return;
  const txt=[...pre.querySelectorAll(".ln")].map(s=>{const c=s.cloneNode(true);c.querySelector('i')&&c.querySelector('i').remove();return c.textContent.replace(/^ $/,'')}).join('\n');
  (navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast('Codice copiato: incollalo in Tinkercad (Codice → Testo)')).catch(()=>{const t=document.createElement('textarea');t.value=txt;document.body.append(t);t.select();try{document.execCommand('copy');toast('Codice copiato')}catch(x){}t.remove()})});

/* ---------- impostazioni ---------- */
function applySettings(){const b=document.body;b.classList.toggle('lim',!!SET.lim);b.classList.toggle('hc',!!SET.hc);b.classList.toggle('rm',!!SET.rm);
  b.classList.remove('fs-1','fs-2','fs-3','fs-4');b.classList.add('fs-'+(SET.fs||2));const lb=$('#limBtn');if(lb)lb.setAttribute('aria-pressed',!!SET.lim);save()}
const lvlStars=n=>'<span class="stars" aria-label="difficoltà '+n+' su 3">'+'●'.repeat(n)+'<span style="opacity:.25">'+'●'.repeat(3-n)+'</span></span>';
function addSkill(s,src){if(!s)return;const a=PROG.skills[s]=PROG.skills[s]||[];if(!a.includes(src)){a.push(src);save()}}
