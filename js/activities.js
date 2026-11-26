/* =====================================================
   Arduino Lab · ATTIVITÀ DELLE LEZIONI E DISEGNI INTERATTIVI
   ===================================================== */
"use strict";
function mountAct(el,a,done){
  let fired=false;const ok=()=>{if(fired)return;fired=true;el.classList.add('won');const s=document.createElement('div');s.className='star';s.setAttribute('aria-hidden','true');s.textContent='⭐ Bravo!';el.appendChild(s);setTimeout(()=>s.remove(),1600);ding();done()};
  const KIND={quiz:['⚡','Verifica lampo'],tf:['⚡','Verifica lampo'],classify:['⚡','Verifica lampo'],order:['⚡','Verifica lampo'],fill:['🧩','Completa il codice'],run:['▶️','Prova tu nel simulatore']};
  const k=KIND[a.type]||['✋','Prova tu'];const head=`<div class="ah"><span aria-hidden="true">${k[0]}</span>${k[1]}</div>`;
  const fb=(box,html,good)=>{box.innerHTML=`<div class="fb ${good?'ok':'ko'}" role="status">${good?'✅ ':'💡 '}${html}</div>`};
  const txt=s=>a.mono?`<code>${esc(s)}</code>`:esc(s);
  if(a.type==='quiz'){const order=shuffle(a.opts.map((_,i)=>i));
    el.innerHTML=head+`<p><b>${a.q}</b></p><div class="opts">${order.map((i,j)=>`<button class="opt" data-i="${i}"><span class="mk" aria-hidden="true">${'ABCD'[j]}</span><span>${esc(a.opts[i][0])}</span></button>`).join('')}</div><div data-fb></div>`;
    el.addEventListener('click',e=>{const b=e.target.closest('.opt');if(!b||b.disabled)return;const o=a.opts[+b.dataset.i];
      if(o[1]){b.classList.add('right');b.querySelector('.mk').textContent='✓';$$('.opt',el).forEach(x=>x.disabled=true);fb($('[data-fb]',el),esc(o[2]||'Giusto!'),true);ok()}
      else{b.classList.add('wrong','shake');b.disabled=true;b.querySelector('.mk').textContent='✗';fb($('[data-fb]',el),esc(o[2]||'Non è questa.')+' Riprova.',false)}})}
  else if(a.type==='tf'||a.type==='classify'){let right=0;const bins=a.type==='tf'?['Vero','Falso']:a.bins;const val=(it,j)=>a.type==='tf'?(j===0)===it[1]:j===it[1];
    el.innerHTML=head+`<p><b>${esc(a.q)}</b></p><div class="cls">${a.items.map((it,i)=>`<div class="clsrow" data-i="${i}"><div>${a.type==='classify'&&/[;{(]/.test(it[0])?`<code>${esc(it[0])}</code>`:esc(it[0])}</div><div class="seg">${bins.map((bn,j)=>`<button data-j="${j}">${esc(bn)}</button>`).join('')}</div><div data-fb></div></div>`).join('')}</div>`;
    el.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b||b.disabled)return;const row=b.closest('.clsrow');const it=a.items[+row.dataset.i];
      if(val(it,+b.dataset.j)){row.classList.remove('wrong');row.classList.add('right');$$('button',row).forEach(x=>x.disabled=true);fb($('[data-fb]',row),esc(it[2]),true);if(++right===a.items.length)ok()}
      else{row.classList.add('wrong','shake');setTimeout(()=>row.classList.remove('shake'),400);fb($('[data-fb]',row),a.type==='tf'?'Non proprio. Ripensaci e riprova.':'Non qui. Pensa a cosa fa e riprova.',false)}})}
  else if(a.type==='order'){let pool,ans=[];do{pool=shuffle(a.items)}while(pool.join()===a.items.join()&&a.items.length>1);
    const render=()=>{el.innerHTML=head+`<p><b>${esc(a.q)}</b></p><div class="ph">La tua sequenza</div><div class="orderans">${ans.length?ans.map((t,i)=>`<button class="opt" data-a="${i}" aria-label="Passo ${i+1}: ${esc(t)}. Tocca per toglierlo"><span class="n">${i+1}</span><span>${txt(t)}</span></button>`).join(''):'<p class="small muted" style="margin:6px">Tocca i passi qui sotto nell’ordine giusto.</p>'}</div>
      <div class="opts">${pool.map((t,i)=>`<button class="opt" data-p="${i}"><span class="mk" aria-hidden="true">+</span><span>${txt(t)}</span></button>`).join('')}</div><div data-fb></div>`};
    render();
    el.addEventListener('click',e=>{const p=e.target.closest('[data-p]'),q=e.target.closest('[data-a]');if(fired)return;
      if(p){ans.push(pool.splice(+p.dataset.p,1)[0])}else if(q){pool.push(ans.splice(+q.dataset.a,1)[0])}else return;render();
      if(!pool.length){let k=0;while(k<ans.length&&ans[k]===a.items[k])k++;
        if(k===ans.length){render();$$('.orderans .opt',el).forEach(x=>{x.classList.add('right');x.disabled=true});$$('.opts',el).forEach(x=>x.remove());fb($('[data-fb]',el),esc(a.ok||'Ordine perfetto!'),true);ok()}
        else{const b=$$('.orderans .opt',el)[k];b&&b.classList.add('wrong','shake');fb($('[data-fb]',el),`Il passo ${k+1} non è al posto giusto. Toccalo per toglierlo e riprova.`,false)}}})}
  else if(a.type==='fill'){const order=shuffle(a.opts.map((_,i)=>i));const show=v=>hl(a.code).replace('___',v?`<b class="slot ok">${esc(v)}</b>`:'<b class="slot">?</b>');
    el.innerHTML=head+`<p><b>${esc(a.q)}</b></p><pre class="code0" data-code>${show()}</pre><div class="seg">${order.map(i=>`<button data-i="${i}"><code>${esc(a.opts[i])}</code></button>`).join('')}</div><div data-fb></div>`;
    el.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b||b.disabled)return;const i=+b.dataset.i;
      if(i===a.ok){$('[data-code]',el).innerHTML=show(a.opts[i]);$$('.seg button',el).forEach(x=>x.disabled=true);b.setAttribute('aria-pressed','true');fb($('[data-fb]',el),esc(a.why[i]),true);ok()}
      else{b.disabled=true;b.classList.add('shake');fb($('[data-fb]',el),esc(a.why[i])+' Riprova.',false)}})}
  else if(a.type==='run'){const D=DEMO[a.demo];el.innerHTML=head+`<div data-wb></div><div data-after></div><p class="small muted" data-need>${a.need==='press'?'👉 Avvia la simulazione e <b>tieni premuto</b> il pulsante.':'👉 Premi <b>▶ Avvia simulazione</b>.'}</p>`;
    let ran=false,pressed=false,shown=false;
    const check=()=>{if(shown)return;if(a.need==='press'?ran&&pressed:ran){shown=true;$('[data-need]',el).remove();
      if(a.after){const sub=document.createElement('div');$('[data-after]',el).appendChild(sub);sub.className='after';mountAct(sub,{type:'quiz',...a.after},ok)}else ok()}};
    mountWorkbench($('[data-wb]',el),{circuit:D.circuit,code:D.code,onRun:()=>{ran=true;setTimeout(check,a.need==='press'?0:1800)},onPress:d=>{if(d){pressed=true;check()}}})}
}

/* ---------- disegni interattivi (da EserTinkercad) ---------- */
function initIll(root){
  $$('[data-ill]',root).forEach(box=>{const k=box.dataset.ill;
    if(k==='water'){let o=false;box.innerHTML='<div data-s></div><div class="ctr"><button class="btn sm" data-b></button></div>';const d=()=>{$('[data-s]',box).innerHTML=waterSVG(o);$('[data-b]',box).textContent=o?'🔗 Chiudi il circuito':'✂️ Apri il circuito'};d();$('[data-b]',box).onclick=()=>{o=!o;d()}}
    if(k==='led'){let r=false;box.innerHTML='<div data-s></div><div class="ctr"><button class="btn sm" data-b>🔄 Gira il LED</button></div>';const d=()=>$('[data-s]',box).innerHTML=ledSVG(r);d();$('[data-b]',box).onclick=()=>{r=!r;d()}}
    if(k==='res'){let v=220;const M={0:'💥 <b>Bruciato!</b> Senza resistenza passa troppa corrente.',220:'✅ <b>Perfetto.</b> Con 220 Ω il LED è luminoso e al sicuro.',1000:'🙂 Funziona, un po’ meno luminoso.',10000:'😐 Freno troppo forte: il LED è quasi spento. 10 kΩ è per il pulsante.',100000:'🌑 Passa pochissima corrente: sembra spento.'};
      box.innerHTML='<div data-s></div><div class="rbtns"></div><div class="rmsg"></div>';const d=()=>{$('[data-s]',box).innerHTML=resSVG(v);$('.rmsg',box).innerHTML=M[v];$$('.rbtns button',box).forEach(b=>b.classList.toggle('on',+b.dataset.v===v))};
      $('.rbtns',box).innerHTML='<span>Resistenza:</span>'+RVAL.map(([x,l])=>`<button data-v="${x}">${l}</button>`).join('');$$('.rbtns button',box).forEach(b=>b.onclick=()=>{v=+b.dataset.v;d()});d()}
    if(k==='bb'){box.innerHTML=bbSVG();const all=$$('.h0',box),cap=$('#bbCap',box);const hl0=g=>{all.forEach(x=>x.setAttribute('fill',x.dataset.g===g?'#2E9E44':'#4A4E57'));cap.innerHTML=g?bbCaption(g):'Tocca o passa sopra un foro.'};
      $$('.h0t',box).forEach(h=>{h.addEventListener('pointerenter',()=>hl0(h.dataset.g));h.addEventListener('click',()=>hl0(h.dataset.g))});$('svg',box).addEventListener('pointerleave',()=>hl0(null))}
    if(k==='btn'){box.innerHTML='<div data-s></div><div class="ctr"><button class="btn sm" data-b>👆 Tieni premuto</button></div>';const d=p=>$('[data-s]',box).innerHTML=btnSVG(p);d(false);const b=$('[data-b]',box);b.onpointerdown=()=>d(true);b.onpointerup=b.onpointerleave=()=>d(false)}
    if(k==='float'){let res=false,pr=false;box.innerHTML=`<div class="flt"><div class="fltl"><button class="btn sm" data-r>➕ Metti la resistenza da 10 kΩ</button><button class="btn sm" data-p>👆 Tieni premuto il pulsante</button><div class="fltx"></div></div><pre class="fmon"></pre></div>`;
      const mon=$('.fmon',box);const iv=setInterval(()=>{if(!box.isConnected)return clearInterval(iv);const v=pr?1:res?0:(Math.random()<.5?1:0);$('.fltx',box).innerHTML=pr?'✅ Premuto: arriva il 5V → <b>HIGH</b>':res?'✅ Non premuto, con pull-down: il pin è a 0 V → <b>LOW</b>':'😵 Non premuto, senza resistenza: pin in aria → <b>valori a caso</b>';mon.textContent=(mon.textContent+v+(v?'  ← HIGH':'  ← LOW')+'\n').split('\n').slice(-9).join('\n')},300);
      R.cleanup.push(()=>clearInterval(iv));$('[data-r]',box).onclick=e=>{res=!res;e.currentTarget.textContent=res?'➖ Togli la resistenza':'➕ Metti la resistenza da 10 kΩ'};const b=$('[data-p]',box);b.onpointerdown=()=>pr=true;b.onpointerup=b.onpointerleave=()=>pr=false}
    if(k==='build'){let kk=0,pr=false;box.innerHTML='<div data-s></div><div class="bstep"></div><div class="ctr"><button class="btn sm ghost" data-pv>← Pezzo prima</button><button class="btn sm pri" data-nx>Pezzo dopo →</button><button class="btn sm" data-pr hidden>👆 Tieni premuto il pulsante</button></div>';
      const d=()=>{$('[data-s]',box).innerHTML=buildSVG(kk,pr);$('.bstep',box).innerHTML=BUILD[kk][0];$('[data-pv]',box).disabled=kk===0;$('[data-nx]',box).hidden=kk===BUILD.length-1;$('[data-pr]',box).hidden=kk!==BUILD.length-1};d();
      $('[data-pv]',box).onclick=()=>{kk=Math.max(0,kk-1);d()};$('[data-nx]',box).onclick=()=>{kk++;d()};const b=$('[data-pr]',box);b.onpointerdown=()=>{pr=true;d()};b.onpointerup=b.onpointerleave=()=>{pr=false;d()}}
    if(k==='delay')delayWidget(box);
  })}

/* ---------- la linea del tempo del loop: perché il pulsante si “sente” in ritardo ---------- */
function delayWidget(box){
  const SEG=[['👀','digitalRead',30,'read'],['🔴','rosso acceso · delay(200)',200,'on'],['⚫','rosso spento · delay(200)',200,'off']];const TOT=SEG.reduce((a,s)=>a+s[2],0);
  box.innerHTML=`<div class="tline noen"><div class="tlbar">${SEG.map(s=>`<div class="tls ${s[3]}" style="flex:${s[2]}"><span>${s[0]}</span><small>${s[1]}</small></div>`).join('')}<i class="tlcur"></i><i class="tlrel" hidden></i></div>
   <div class="ctr"><button class="btn sm pri" data-go>👆 Lascia il pulsante adesso</button></div><p class="tlmsg">Il cursore è Arduino che esegue il loop, giro dopo giro. Premi il bottone in un momento qualsiasi.</p></div>`;
  const cur=$('.tlcur',box),rel=$('.tlrel',box),msg=$('.tlmsg',box);let t0=performance.now(),relAt=null,raf;const speed=.25;
  const tick=now=>{if(!box.isConnected)return;const t=((now-t0)*speed)%TOT;cur.style.left=(t/TOT*100)+'%';
    if(relAt!==null){const since=(now-relAt.real)*speed;const wait=relAt.t<30?30-relAt.t:TOT-relAt.t;if(since>=wait){msg.innerHTML=`✅ Arduino se n’è accorto <b>${Math.round(wait)} ms</b> dopo, quando è tornato a <code>digitalRead</code>. Prova di nuovo in un altro punto!`;relAt=null;rel.hidden=true}}
    raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);R.cleanup.push(()=>cancelAnimationFrame(raf));
  $('[data-go]',box).onclick=()=>{const now=performance.now();const t=((now-t0)*speed)%TOT;relAt={t,real:now};rel.hidden=false;rel.style.left=(t/TOT*100)+'%';
    const inSeg=t<30?'mentre legge il pulsante':t<230?'durante il delay del rosso acceso':'durante il delay del rosso spento';msg.innerHTML=`Hai lasciato il pulsante <b>${inSeg}</b>. Arduino è ${t<30?'già lì':'fermo ad aspettare'}: guarda quando se ne accorge…`}}
