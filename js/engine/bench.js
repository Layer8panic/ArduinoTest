/* =====================================================
   Arduino Lab · BANCO DI LAVORO
   Arduino Uno R3 + breadboard: modello, disegno, fili, analisi elettrica
   e simulazione. Derivato dall'editor di EserTinkercad, trasformato in
   componente riutilizzabile: createBench(host, opzioni) crea un banco
   indipendente (se ne possono avere più di uno nella stessa pagina).
   ===================================================== */
"use strict";
function createBench(host,opts={}){
opts={editable:true,...opts};
host.classList.add('bench');
host.innerHTML=`<svg class="ws" role="img" aria-label="Arduino Uno e breadboard"><defs><filter id="glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="7"/></filter></defs><g class="world"><g class="g-bb"></g><g class="g-ard"></g><g class="g-comps"></g><g class="g-wires"></g><g class="g-temp"></g></g></svg>
<div class="simtime" hidden></div><div class="insp" hidden></div><div class="banner" hidden></div>
<div class="zoom"><button type="button" data-z="in" title="Zoom avanti" aria-label="Zoom avanti">+</button><button type="button" data-z="out" title="Zoom indietro" aria-label="Zoom indietro">−</button><button type="button" data-z="fit" title="Adatta alla vista" aria-label="Adatta alla vista">⤢</button></div>`;
const Q=s=>host.querySelector(s);
const P=16, BX=470, BY=96, AX=30, AY=96;
const NS='http://www.w3.org/2000/svg';
const LEDC={rosso:'#F23A3A',giallo:'#FFD21F',verde:'#2BD45A',blu:'#3A8BFF',arancione:'#FF8A1F',bianco:'#F4F4F4'};
/* ---------- pin di Arduino ---------- */
const PINS=(()=>{const L=[];
  const top=['SCL','SDA','AREF','GND3','D13','D12','D11','D10','D9','D8',null,'D7','D6','D5','D4','D3','D2','D1','D0'];
  let x=AX+104;top.forEach(n=>{if(!n){x+=10;return}L.push({n,x,y:AY+20,top:true});x+=14});
  const bot=['IOREF','RESET','3V3','5V','GND1','GND2','VIN',null,'A0','A1','A2','A3','A4','A5'];
  x=AX+150;bot.forEach(n=>{if(!n){x+=14;return}L.push({n,x,y:AY+268,top:false});x+=14});return L})();
const PIN_LABEL=n=>n.startsWith('GND')?'GND':n==='3V3'?'3.3V':n.startsWith('D')?n.slice(1):n;
const pinNice=n=>n.startsWith('GND')?'GND':n==='3V3'?'3.3V':n.startsWith('D')?'pin '+n.slice(1):n;
/* ---------- fori della breadboard ---------- */
const BB_COLS=30, ROWS=[0,1,3,4,5,6,7,9,10,11,12,13,15,16];
const holeXY=(c,r)=>({x:BX+28+c*P,y:BY+24+r*P});
const rowName=r=>({0:'+',1:'−',15:'+',16:'−'})[r]||'abcde fghij'[r-3];
const stripOf=(c,r)=>r<=1||r>=15?'R'+r:(r<=7?'T'+c:'B'+c);
const HOLES=[];for(let c=0;c<BB_COLS;c++)for(const r of ROWS)HOLES.push({c,r,...holeXY(c,r),k:`H:${c}:${r}`,s:stripOf(c,r)});
const HOLE_AT=new Map(HOLES.map(h=>[Math.round(h.x)+','+Math.round(h.y),h]));
/* ---------- geometria dei componenti (in passi) ---------- */
const GEO={led:[[0,0],[1,0]],res:[[0,0],[4,0]],btn:[[0,0],[2,0],[0,2],[2,2]]};
const LEGNAME={led:['lato − (catodo): va verso GND','lato + (anodo): va verso il pin'],res:['terminale 1','terminale 2'],btn:['terminale 1a','terminale 2a','terminale 1b','terminale 2b']};
function rot([x,y],r){for(let i=0;i<r;i++)[x,y]=[-y,x];return[x,y]}
function legsOf(c){return GEO[c.type].map(o=>{const [dx,dy]=rot(o,c.rot);return{x:c.x+dx*P,y:c.y+dy*P}})}
function holeAt(x,y){return HOLE_AT.get(Math.round(x)+','+Math.round(y))||null}
/* ---------- stato del circuito ---------- */
const CIR={comps:[],wires:[],nid:1};
const fmtR=v=>v>=1000?(v%1000===0?v/1000:(v/1000).toFixed(1).replace('.',','))+' kΩ':v+' Ω';
function compName(c){const same=CIR.comps.filter(x=>x.type===c.type);const i=same.indexOf(c)+1;return({led:'LED',res:'Resistenza',btn:'Pulsante'})[c.type]+' '+i}
/* ---------- rete elettrica (union-find) ---------- */
function buildNets(pressed){
  const p={};const f=x=>{if(p[x]===undefined)p[x]=x;while(p[x]!==x){p[x]=p[p[x]];x=p[x]}return x};const u=(a,b)=>{a=f(a);b=f(b);if(a!==b)p[a]=b};
  HOLES.forEach(h=>u(h.k,'S:'+h.s));
  u('P:GND1','P:GND2');u('P:GND2','P:GND3');
  CIR.comps.forEach(c=>{legsOf(c).forEach((l,i)=>{const h=holeAt(l.x,l.y);if(h)u(`L:${c.id}:${i}`,h.k);else f(`L:${c.id}:${i}`)});
    if(c.type==='btn'){u(`L:${c.id}:0`,`L:${c.id}:1`);u(`L:${c.id}:2`,`L:${c.id}:3`);if(pressed&&pressed[c.id])u(`L:${c.id}:0`,`L:${c.id}:2`)}});
  CIR.wires.forEach(w=>u(w.a,w.b));
  PINS.forEach(pn=>f('P:'+pn.n));
  return f;
}
/* sorgenti: 5V/3.3V = H, GND = L, pin OUTPUT = H/L */
function evalCircuit(f,modes,outs){
  const st={};const mark=(k,v)=>{const n=f(k);st[n]=(st[n]||'')+(st[n]&&st[n].includes(v)?'':v)};
  mark('P:5V','H');mark('P:3V3','H');mark('P:GND1','L');
  for(const p in modes)if(modes[p]===1)mark('P:D'+p,outs[p]?'H':'L');
  const shorts=Object.entries(st).filter(([n,v])=>v.includes('H')&&v.includes('L')).map(([n])=>n);
  const edges={};CIR.comps.filter(c=>c.type==='res').forEach(c=>{const a=f(`L:${c.id}:0`),b=f(`L:${c.id}:1`);if(a===b)return;(edges[a]=edges[a]||[]).push([b,c.value]);(edges[b]=edges[b]||[]).push([a,c.value])});
  const dist=(start,want)=>{const d={[start]:0},q=[[0,start]];while(q.length){q.sort((x,y)=>x[0]-y[0]);const [dd,n]=q.shift();if(dd>d[n])continue;if((st[n]||'').includes(want))return dd;for(const [m,r] of edges[n]||[]){const nd=dd+r;if(d[m]===undefined||nd<d[m]){d[m]=nd;q.push([nd,m])}}}return Infinity};
  const leds={},burn=[];
  CIR.comps.filter(c=>c.type==='led').forEach(c=>{const A=f(`L:${c.id}:1`),K=f(`L:${c.id}:0`);const da=dist(A,'H'),dk=dist(K,'L');const R=da+dk;
    let b=0;if(isFinite(R)&&A!==K){b=R<=2000?1:R<=15000?.35:0;if(R===0)burn.push(c.id)}leds[c.id]=b});
  const level=(pin,mode)=>{const n=f('P:D'+pin);const s=st[n]||'';if(s.includes('H')&&s.includes('L'))return 1;if(s.includes('H'))return 1;if(s.includes('L'))return 0;
    const dh=dist(n,'H'),dl=dist(n,'L');if(isFinite(dh)||isFinite(dl))return dh<dl?1:0;if(mode===2)return 1;return null};
  return{leds,burn,shorts,level};
}
/* ---------- analisi del circuito per le verifiche ---------- */
function analyze(){
  const f=buildNets({});const pinsIn=n=>PINS.filter(p=>p.n.startsWith('D')&&f('P:'+p.n)===n).map(p=>+p.n.slice(1));
  const has=(n,k)=>f(k)===n;const isGND=n=>has(n,'P:GND1'),is5V=n=>has(n,'P:5V');
  const res=CIR.comps.filter(c=>c.type==='res').map(c=>({c,a:f(`L:${c.id}:0`),b:f(`L:${c.id}:1`)}));
  const viaRes=n=>res.filter(r=>r.a===n||r.b===n).map(r=>({r,other:r.a===n?r.b:r.a}));
  const legsIn=c=>legsOf(c).map(l=>!!holeAt(l.x,l.y));
  const leds=CIR.comps.filter(c=>c.type==='led').map(c=>{const A=f(`L:${c.id}:1`),K=f(`L:${c.id}:0`);
    const o={id:c.id,c,color:c.color,name:compName(c),inBoard:legsIn(c).every(Boolean),same:A===K,pin:null,res:null,gnd:false,reversed:false,direct5V:false};
    let pa=pinsIn(A);if(pa.length)o.pin=pa[0];else viaRes(A).forEach(v=>{const pp=pinsIn(v.other);if(pp.length&&o.pin===null){o.pin=pp[0];o.res=v.r.c.value}});
    if(is5V(A))o.direct5V=true;
    if(isGND(K))o.gnd=true;else viaRes(K).forEach(v=>{if(isGND(v.other)){o.gnd=true;o.res=v.r.c.value}});
    const pk=pinsIn(K);if(!o.pin&&pk.length&&(isGND(A)||viaRes(A).some(v=>isGND(v.other))))o.reversed=true;
    if(!o.pin&&pk.length){o.reversed=true}
    return o});
  const btns=CIR.comps.filter(c=>c.type==='btn').map(c=>{const NA=f(`L:${c.id}:0`),NB=f(`L:${c.id}:2`);const o={id:c.id,c,name:compName(c),inBoard:legsIn(c).every(Boolean),pin:null,to5V:false,pull:null,pullup:false,rotated:false,floating:false};
    for(const [X,Y] of [[NA,NB],[NB,NA]]){const px=pinsIn(X);if(px.length){o.pin=px[0];
        if(is5V(X))o.rotated=true;
        if(is5V(Y))o.to5V=true;
        if(isGND(Y))o.pullup=true;
        viaRes(X).forEach(v=>{if(isGND(v.other))o.pull=v.r.c.value});
        if(!o.pull&&!o.rotated&&o.to5V)o.floating=true;break}}
    if(o.pin===null){const pa=pinsIn(NA).concat(pinsIn(NB));if(pa.length)o.pin=pa[0]}
    return o});
  const rails={plus:[0,15].some(r=>is5V(f(`H:0:${r}`))),minus:[1,16].some(r=>isGND(f(`H:0:${r}`)))};
  const st=evalCircuit(f,{},{});
  return{leds,btns,rails,shorts:st.shorts.length>0,f};
}
/* ---------- colori delle bande della resistenza ---------- */
function bands(v){const C=['#000','#8B4513','#E00','#F80','#EE0','#0A0','#00E','#80F','#888','#FFF'];let e=0,x=v;while(x>=100){x/=10;e++}x=Math.round(x);const d1=Math.floor(x/10),d2=x%10;return[C[d1],C[d2],C[e],'#C9A227']}

/* =====================================================
   DISEGNO E INTERAZIONE DELL'AREA DI LAVORO
   ===================================================== */
const ED={sel:null,wiring:null,drag:null,pan:null,view:{x:0,y:0,z:1},hist:[],sim:false,pressed:{},bright:{},onChange:()=>{}};
const svg=Q('.ws'),world=Q('.world');
const gA=Q('.g-ard'),gB=Q('.g-bb'),gC=Q('.g-comps'),gW=Q('.g-wires'),gT=Q('.g-temp');
const el=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e};
function toWorld(ev){const p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;return p.matrixTransform(world.getScreenCTM().inverse())}
function applyView(){world.setAttribute('transform',`translate(${ED.view.x} ${ED.view.y}) scale(${ED.view.z})`)}
function fitView(){const r=svg.getBoundingClientRect();if(r.width<20||r.height<20)return;
  let b;try{b=world.getBBox()}catch(e){b=null}if(!b||!b.width)b={x:0,y:50,width:1000,height:390};
  const pad=34,W=b.width+pad*2,H=b.height+pad*2;const z=Math.max(.25,Math.min(2.2,Math.min(r.width/W,r.height/H)));
  ED.view={z,x:(r.width-W*z)/2-(b.x-pad)*z,y:(r.height-H*z)/2-(b.y-pad)*z};applyView()}
/* ---------- Arduino ---------- */
function drawArduino(){
  gA.innerHTML='';const g=gA;
  el('rect',{x:AX,y:AY,width:390,height:290,rx:12,fill:'#127B8A',stroke:'#0B5C67','stroke-width':3},g);
  for(const [x,y] of [[AX+14,AY+14],[AX+376,AY+14],[AX+14,AY+276],[AX+376,AY+276]])el('circle',{cx:x,cy:y,r:6,fill:'#E6E6E6',stroke:'#0B5C67'},g);
  el('rect',{x:AX-16,y:AY+46,width:58,height:50,rx:3,fill:'#C9CED6',stroke:'#8D96A3','stroke-width':2},g);
  el('rect',{x:AX-12,y:AY+196,width:50,height:58,rx:4,fill:'#1D1F24'},g);
  el('rect',{x:AX+190,y:AY+192,width:160,height:34,rx:3,fill:'#1C1D22'},g);
  for(let i=0;i<14;i++){el('rect',{x:AX+195+i*11,y:AY+186,width:5,height:6,fill:'#BFC4CC'},g);el('rect',{x:AX+195+i*11,y:AY+226,width:5,height:6,fill:'#BFC4CC'},g)}
  el('rect',{x:AX+60,y:AY+110,width:22,height:22,rx:3,fill:'#D9D9D9',stroke:'#8D96A3'},g);el('circle',{cx:AX+71,cy:AY+121,r:6,fill:'#C0392B'},g);
  const t=(x,y,s,o={})=>{const e=el('text',{x,y,fill:'#fff','font-family':'Arial','font-weight':700,'font-size':o.s||11,'text-anchor':o.a||'middle',...(o.r?{transform:`rotate(-90 ${x} ${y})`}:{})},g);e.textContent=s;return e};
  t(AX+250,AY+130,'UNO',{s:30});t(AX+250,AY+160,'ARDUINO',{s:13});t(AX+71,AY+148,'RESET',{s:8});
  /* LED di bordo */
  el('rect',{x:AX+110,y:AY+64,width:9,height:6,fill:'#5a3',class:'ledL'},g);t(AX+128,AY+70,'L',{s:9,a:'start'});
  el('rect',{x:AX+110,y:AY+80,width:9,height:6,fill:'#2ecc71'},g);t(AX+128,AY+86,'ON',{s:9,a:'start'});
  el('rect',{x:AX+110,y:AY+96,width:9,height:6,fill:'#665',class:'ledTX'},g);t(AX+128,AY+102,'TX',{s:9,a:'start'});
  /* connettori */
  const tops=PINS.filter(p=>p.top),bots=PINS.filter(p=>!p.top);
  el('rect',{x:tops[0].x-8,y:AY+12,width:tops[9].x-tops[0].x+16,height:16,fill:'#202226',rx:2},g);el('rect',{x:tops[10].x-8,y:AY+12,width:tops[17].x-tops[10].x+16,height:16,fill:'#202226',rx:2},g);
  el('rect',{x:bots[0].x-8,y:AY+260,width:bots[6].x-bots[0].x+16,height:16,fill:'#202226',rx:2},g);el('rect',{x:bots[7].x-8,y:AY+260,width:bots[12].x-bots[7].x+16,height:16,fill:'#202226',rx:2},g);
  t((tops[10].x+tops[17].x)/2,AY+64,'DIGITAL (PWM~)',{s:9});t((bots[0].x+bots[6].x)/2,AY+218,'POWER',{s:9});t((bots[7].x+bots[12].x)/2,AY+218,'ANALOG IN',{s:9});
  PINS.forEach(p=>{el('rect',{x:p.x-3.5,y:p.y-3.5,width:7,height:7,fill:'#0A0A0A'},g);
    t(p.x+3,p.top?AY+34:AY+254,PIN_LABEL(p.n),{s:8,r:true,a:p.top?'end':'start'});
    const c=el('circle',{cx:p.x,cy:p.y,r:6,class:'cp pinpt','data-k':'P:'+p.n,fill:'transparent'},g)});
}
/* ---------- Breadboard ---------- */
const holeEls={};
function drawBreadboard(){
  gB.innerHTML='';const g=gB,W=BB_COLS*P+40,H=16*P+48,Y=r=>BY+24+r*P;
  /* corpo con bordo in rilievo */
  el('rect',{x:BX+2,y:BY+3,width:W,height:H,rx:7,fill:'rgba(0,0,0,.12)'},g);
  el('rect',{x:BX,y:BY,width:W,height:H,rx:7,fill:'#F3F3EF',stroke:'#BFC0B8','stroke-width':1.5},g);
  /* fasce dei binari, leggermente più scure */
  [[Y(0)-12,Y(1)+12],[Y(15)-12,Y(16)+12]].forEach(([a,b])=>el('rect',{x:BX+4,y:a,width:W-8,height:b-a,rx:4,fill:'#E9E9E3'},g));
  /* scanalatura centrale */
  el('rect',{x:BX+4,y:Y(7.5)-6,width:W-8,height:12,rx:3,fill:'#D3D3CB'},g);
  el('line',{x1:BX+6,x2:BX+W-6,y1:Y(7.5)-5,y2:Y(7.5)-5,stroke:'rgba(0,0,0,.12)','stroke-width':1.5},g);
  const ln=(y,c)=>el('line',{x1:BX+20,x2:BX+W-20,y1:y,y2:y,stroke:c,'stroke-width':2.2,'stroke-linecap':'round'},g);
  ln(Y(0)-10,'#D83A3A');ln(Y(1)+10,'#2F6BD1');ln(Y(15)-10,'#D83A3A');ln(Y(16)+10,'#2F6BD1');
  const t=(x,y,s,c='#7D8088',sz=9)=>{const e=el('text',{x,y,fill:c,'font-family':'Arial,Helvetica,sans-serif','font-size':sz,'text-anchor':'middle','font-weight':700,'pointer-events':'none'},g);e.textContent=s};
  [0,15].forEach(r=>{t(BX+11,Y(r)+4,'+','#D83A3A',13);t(BX+W-11,Y(r)+4,'+','#D83A3A',13)});[1,16].forEach(r=>{t(BX+11,Y(r)+4,'−','#2F6BD1',13);t(BX+W-11,Y(r)+4,'−','#2F6BD1',13)});
  for(let r=3;r<=13;r++)if(r!==8){t(BX+12,Y(r)+3.5,rowName(r));t(BX+W-12,Y(r)+3.5,rowName(r))}
  for(let c=0;c<BB_COLS;c++)if(c%5===0||c===BB_COLS-1){t(BX+28+c*P,Y(2)+4,c+1);t(BX+28+c*P,Y(14)+4,c+1)}
  HOLES.forEach(h=>{el('rect',{x:h.x-3.5,y:h.y-3.5,width:7,height:7,rx:1.2,fill:'#4A4E57',class:'hole','data-s':h.s},g);
    const c=el('circle',{cx:h.x,cy:h.y,r:7,class:'cp holept','data-k':h.k,'data-s':h.s,fill:'transparent'},g);(holeEls[h.s]=holeEls[h.s]||[]).push(c.previousSibling)});
}
/* ---------- componenti ---------- */
function drawComp(c){
  const g=el('g',{class:'comp'+(ED.sel&&ED.sel.id===c.id?' sel':''),'data-id':c.id,transform:`translate(${c.x} ${c.y}) rotate(${c.rot*90})`},gC);
  if(c.type==='led'){const col=LEDC[c.color]||'#F23A3A',b=ED.bright[c.id]||0;
    el('path',{d:`M0 0 V-14`,stroke:'#9BA3AE','stroke-width':2.5,fill:'none'},g);el('path',{d:`M${P} 0 V-8 L${P-4} -14`,stroke:'#9BA3AE','stroke-width':2.5,fill:'none'},g);
    [[-8,'−','#1565C0'],[P+8,'+','#C62828']].forEach(([x,t,f])=>{const T=el('text',{x,y:-4,'text-anchor':'middle','font-size':11,'font-weight':800,'font-family':'Arial',fill:f,'pointer-events':'none'},g);T.textContent=t});
    if(b)el('circle',{cx:P/2,cy:-30,r:24,fill:col,opacity:.35*b,filter:'url(#glow)'},g);
    el('rect',{x:-4,y:-18,width:P+8,height:5,rx:1.5,fill:col,stroke:'rgba(0,0,0,.35)'},g);
    el('path',{d:`M-1 -18 V-30 A${P/2+1} ${P/2+1} 0 0 1 ${P+1} -30 V-18Z`,fill:col,stroke:'rgba(0,0,0,.35)','stroke-width':1,opacity:b?1:.78},g);
    el('ellipse',{cx:P/2-3,cy:-31,rx:2.5,ry:5,fill:'#fff',opacity:.6},g);
    if(b)el('circle',{cx:P/2,cy:-27,r:6,fill:'#fff',opacity:.7*b},g);
    if(c.label){const T=el('text',{x:P/2,y:-50,'text-anchor':'middle','font-size':10,'font-weight':800,'font-family':'Arial',fill:'#1F2933','pointer-events':'none',transform:`rotate(${-c.rot*90} ${P/2} -50)`},g);T.textContent=c.label}
    el('rect',{x:-6,y:-44,width:P+12,height:46,fill:'transparent',class:'body'},g);
  }else if(c.type==='res'){const L=4*P,bd=bands(c.value);
    el('line',{x1:0,y1:0,x2:L,y2:0,stroke:'#9BA3AE','stroke-width':2.5},g);
    el('rect',{x:14,y:-7,width:L-28,height:14,rx:6,fill:'#E3C79A',stroke:'#A88A5A'},g);
    bd.forEach((col,i)=>el('rect',{x:20+i*7+(i===3?5:0),y:-7,width:4,height:14,fill:col},g));
    el('rect',{x:8,y:-10,width:L-16,height:20,fill:'transparent',class:'body'},g);
  }else if(c.type==='btn'){const pr=ED.pressed[c.id];
    [[0,0],[2*P,0],[0,2*P],[2*P,2*P]].forEach(([x,y])=>el('circle',{cx:x,cy:y,r:3,fill:'#9BA3AE'},g));
    el('rect',{x:-3,y:-3,width:2*P+6,height:2*P+6,rx:3,fill:'#2D3038',stroke:'#16181D'},g);
    el('rect',{x:2,y:2,width:2*P-4,height:2*P-4,rx:2,fill:'#3A3E48'},g);
    el('circle',{cx:P,cy:P,r:pr?8:10,fill:pr?'#A9262E':'#D8343E',stroke:'#7E1A20','stroke-width':1.5},g);
    el('rect',{x:-6,y:-6,width:2*P+12,height:2*P+12,fill:'transparent',class:'body btnbody'},g);
  }
  legsOf(c).forEach((l,i)=>{const inH=holeAt(l.x,l.y);const [dx,dy]=rot(GEO[c.type][i],0);
    const lx=GEO[c.type][i][0]*P,ly=GEO[c.type][i][1]*P;
    el('circle',{cx:lx,cy:ly,r:inH?2.5:3.5,fill:inH?'#2B2F36':'#E04848',class:'legdot'},g);
    if(!inH)el('circle',{cx:lx,cy:ly,r:7,fill:'transparent',class:'cp legpt','data-k':`L:${c.id}:${i}`,'data-n':LEGNAME[c.type][i]},g);});
}
function drawComps(){gC.innerHTML='';CIR.comps.forEach(drawComp)}
/* ---------- fili ---------- */
function ptPos(k){const a=k.split(':');if(a[0]==='P'){const p=PINS.find(x=>x.n===a[1]);return{x:p.x,y:p.y}}if(a[0]==='H')return holeXY(+a[1],+a[2]);
  const c=CIR.comps.find(x=>x.id==a[1]);return c?legsOf(c)[+a[2]]:{x:0,y:0}}
const WCOL={rosso:'#E53935',nero:'#222',verde:'#2E9E44',blu:'#1E6FD9',giallo:'#F2C200',arancione:'#F57C00',bianco:'#EEE',viola:'#8E44AD'};
function wirePath(w){const pts=[ptPos(w.a),...(w.pts||[]),ptPos(w.b)];return pts.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' ')}
function drawWires(){gW.innerHTML='';CIR.wires.forEach(w=>{const g=el('g',{class:'wire'+(ED.sel&&ED.sel.wid===w.id?' sel':''),'data-wid':w.id},gW);const d=wirePath(w);
  el('path',{d,stroke:'rgba(0,0,0,.25)','stroke-width':6,fill:'none','stroke-linejoin':'round','stroke-linecap':'round',transform:'translate(0 1.5)'},g);
  el('path',{d,stroke:WCOL[w.color]||'#2E9E44','stroke-width':4,fill:'none','stroke-linejoin':'round','stroke-linecap':'round',class:'wpath'},g);
  el('path',{d,stroke:'transparent','stroke-width':12,fill:'none',class:'whit'},g);
  [ptPos(w.a),ptPos(w.b)].forEach(p=>el('circle',{cx:p.x,cy:p.y,r:3,fill:WCOL[w.color]||'#2E9E44',stroke:'#222','stroke-width':1},g));
  if(ED.sel&&ED.sel.wid===w.id&&!ED.sim)(w.pts||[]).forEach((p,i)=>el('circle',{cx:p.x,cy:p.y,r:5,class:'bend','data-w':w.id,'data-i':i,fill:'#fff',stroke:'#1E6FD9','stroke-width':2},g))})}
function redraw(){drawComps();drawWires();ED.onChange()}
/* ---------- storia (annulla) ---------- */
/* messaggi brevi in basso: spiegano perché qualcosa non è successo */
const toast=(m,ms)=>UI.toast(m,ms);
const SIMLOCK='⏸ La simulazione è accesa: fermala con <b>■ Arresta simulazione</b> per modificare il circuito.';
function checkPlaced(c){const legs=legsOf(c);const free=legs.filter(l=>!holeAt(l.x,l.y)).length;
  if(free===legs.length)return toast('Il componente non è nei fori: trascinalo <b>sopra la breadboard</b>, si aggancia da solo.');
  if(free)return toast('Una gamba è fuori dai fori (pallino rosso): avvicina il componente alla breadboard.');
  if(legs.some(l=>{const h=holeAt(l.x,l.y);return h&&occupied(h,c)}))return toast('⚠ Due gambe sono nello <b>stesso foro</b>: sposta il componente di un foro.');
  if(c.type==='btn'){const ys=legs.map(l=>holeAt(l.x,l.y)).map(h=>h.k.split(':')[2]);/* nessun controllo extra */}}
function snapshot(){ED.hist.push(JSON.stringify(CIR));if(ED.hist.length>60)ED.hist.shift()}
function undo(){if(ED.sim)return toast(SIMLOCK);if(!ED.hist.length)return toast('Non c\'è niente da annullare.');const s=JSON.parse(ED.hist.pop());CIR.comps=s.comps;CIR.wires=s.wires;CIR.nid=s.nid;ED.sel=null;redraw();showInspector()}
/* ---------- operazioni ---------- */
function addComp(type,x,y,props={}){const c={id:CIR.nid++,type,x,y,rot:0,...(type==='led'?{color:'rosso'}:type==='res'?{value:220}:{}),...props};CIR.comps.push(c);return c}
function snapComp(c){const l0=legsOf(c)[0];let best=null,bd=P;HOLES.forEach(h=>{const d=Math.hypot(h.x-l0.x,h.y-l0.y);if(d<bd){bd=d;best=h}});if(best){c.x+=best.x-l0.x;c.y+=best.y-l0.y}}
function deleteSel(){if(ED.sim)return toast(SIMLOCK);if(!ED.sel)return toast('Prima <b>clicca</b> il componente o il filo da eliminare.');snapshot();if(ED.sel.id){const id=ED.sel.id;CIR.comps=CIR.comps.filter(c=>c.id!==id);CIR.wires=CIR.wires.filter(w=>!w.a.startsWith(`L:${id}:`)&&!w.b.startsWith(`L:${id}:`))}
  else CIR.wires=CIR.wires.filter(w=>w.id!==ED.sel.wid);ED.sel=null;redraw();showInspector()}
function rotateSel(){if(ED.sim)return toast(SIMLOCK);if(!ED.sel||!ED.sel.id)return toast('Prima <b>clicca</b> il componente da ruotare (i fili non si ruotano).');const c=CIR.comps.find(x=>x.id===ED.sel.id);if(!c)return;snapshot();c.rot=(c.rot+1)%4;snapComp(c);redraw();checkPlaced(c)}
function autoColor(a,b){const s=a+b;if(/P:5V|P:3V3|:0$|:15$/.test(a)&&/^H:\d+:(0|15)$/.test(b)||/P:5V/.test(s))return'rosso';if(/P:GND/.test(s)||/^H:\d+:(1|16)$/.test(a)||/^H:\d+:(1|16)$/.test(b))return'nero';
  const cyc=['verde','blu','giallo','arancione','viola'];return cyc[CIR.wires.length%cyc.length]}
/* ---------- ispettore ---------- */
const insp=Q('.insp');
function showInspector(){
  if(!ED.sel||ED.sim){insp.hidden=true;return}insp.hidden=false;
  if(ED.sel.id){const c=CIR.comps.find(x=>x.id===ED.sel.id);if(!c){insp.hidden=true;return}
    let h=`<div class="ih"><b>${compName(c)}</b><span>${({led:'LED',res:'Resistore',btn:'Pulsante'})[c.type]}</span></div>`;
    if(c.type==='led')h+=`<label>Colore<select id="ipCol">${Object.keys(LEDC).map(k=>`<option ${c.color===k?'selected':''}>${k}</option>`).join('')}</select></label>`;
    if(c.type==='res'){const kv=c.value>=1000;h+=`<label>Resistenza<div class="irow"><input id="ipVal" type="number" min="1" value="${kv?c.value/1000:c.value}"><select id="ipUnit"><option value="1" ${!kv?'selected':''}>Ω</option><option value="1000" ${kv?'selected':''}>kΩ</option></select></div></label><div class="ihint">Per un LED: <b>220 Ω</b> · per la pull-down: <b>10 kΩ</b></div>`}
    h+=`<div class="ibtns"><button id="ipRot">⟳ Ruota</button><button id="ipDel">🗑 Elimina</button></div>`;insp.innerHTML=h;
    if(c.type==='led')insp.querySelector('#ipCol').onchange=e=>{snapshot();c.color=e.target.value;redraw()};
    if(c.type==='res'){const up=()=>{const v=Math.max(1,Math.round(+insp.querySelector('#ipVal').value*+insp.querySelector('#ipUnit').value));snapshot();c.value=v;redraw()};insp.querySelector('#ipVal').onchange=up;insp.querySelector('#ipUnit').onchange=up}
    insp.querySelector('#ipRot').onclick=rotateSel;insp.querySelector('#ipDel').onclick=deleteSel;
  }else{const w=CIR.wires.find(x=>x.id===ED.sel.wid);if(!w){insp.hidden=true;return}
    insp.innerHTML=`<div class="ih"><b>Filo</b><span>${descPt(w.a)} → ${descPt(w.b)}</span></div><label>Colore</label><div class="swatch">${Object.entries(WCOL).map(([k,v])=>`<button data-c="${k}" title="${k}" style="background:${v}" class="${w.color===k?'on':''}"></button>`).join('')}</div><div class="ihint">Trascina i pallini bianchi per spostare le curve del filo.</div><div class="ibtns"><button id="ipAuto">↻ Percorso automatico</button><button id="ipStr">／ Diritto</button></div><div class="ibtns"><button id="ipDel">🗑 Elimina</button></div>`;
    insp.querySelector('#ipAuto').onclick=()=>{snapshot();w.pts=[];w.pts=route(w.a,w.b);redraw();showInspector()};insp.querySelector('#ipStr').onclick=()=>{snapshot();w.pts=[];redraw();showInspector()};
    insp.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{w.color=b.dataset.c;redraw();showInspector()});insp.querySelector('#ipDel').onclick=deleteSel}
}
function descPt(k){const a=k.split(':');if(a[0]==='P')return pinNice(a[1]);if(a[0]==='H'){const r=+a[2];return r<=1||r>=15?`binario ${rowName(r)}`:`foro ${rowName(r)}${+a[1]+1}`}const c=CIR.comps.find(x=>x.id==a[1]);return c?compName(c)+' ('+LEGNAME[c.type][+a[2]]+')':'?'}
/* ---------- tooltip ---------- */
const tip=UI.tipEl();
function showTip(ev,txt){tip.hidden=false;tip.textContent=txt;tip.style.left=ev.clientX+14+'px';tip.style.top=ev.clientY+14+'px'}
function tipFor(k,t){const a=k.split(':');if(a[0]==='P')return'Arduino · '+pinNice(a[1])+(a[1]==='D0'||a[1]==='D1'?' (usato dal monitor seriale: meglio evitarlo)':'');if(a[0]==='H'){const r=+a[2];return r<=1||r>=15?`Binario ${rowName(r)==='+'?'+ (positivo)':'− (negativo)'}: tutta la riga è collegata`:`Foro ${rowName(r)}${+a[1]+1}: collegato agli altri 4 fori della stessa colonna (${r<=7?'a–e':'f–j'})`}return t||''}
/* ---------- punti di collegamento e aggancio magnetico ---------- */
function allCPs(){const L=PINS.map(p=>({k:'P:'+p.n,x:p.x,y:p.y}));HOLES.forEach(h=>L.push({k:h.k,x:h.x,y:h.y}));
  CIR.comps.forEach(c=>legsOf(c).forEach((l,i)=>{if(!holeAt(l.x,l.y))L.push({k:`L:${c.id}:${i}`,x:l.x,y:l.y})}));return L}
function nearestCP(wp,rad){let best=null,bd=rad;for(const p of allCPs()){const d=Math.hypot(p.x-wp.x,p.y-wp.y);if(d<bd){bd=d;best=p}}return best}
const snapMark=el('g',{id:'snapmark',style:'pointer-events:none'},world);
function showSnap(p,ok=true){snapMark.innerHTML='';if(!p)return;el('circle',{cx:p.x,cy:p.y,r:7,fill:ok?'rgba(46,158,68,.25)':'rgba(211,47,47,.25)',stroke:ok?'#2E9E44':'#D32F2F','stroke-width':2},snapMark)}
/* ---------- instradamento automatico dei fili (a "L", su corsie libere) ---------- */
function usedY(){const Y=[];CIR.wires.forEach(w=>{const pts=[ptPos(w.a),...(w.pts||[]),ptPos(w.b)];for(let i=1;i<pts.length;i++)if(Math.abs(pts[i].y-pts[i-1].y)<1)Y.push({y:pts[i].y,x1:Math.min(pts[i].x,pts[i-1].x),x2:Math.max(pts[i].x,pts[i-1].x)})});return Y}
function usedX(){const X=[];CIR.wires.forEach(w=>{const pts=[ptPos(w.a),...(w.pts||[]),ptPos(w.b)];for(let i=1;i<pts.length;i++)if(Math.abs(pts[i].x-pts[i-1].x)<1)X.push({x:pts[i].x,y1:Math.min(pts[i].y,pts[i-1].y),y2:Math.max(pts[i].y,pts[i-1].y)})});return X}
function freeLane(base,step,x1,x2){const U=usedY();for(let k=0;k<30;k++){const y=base+k*step;if(!U.some(u=>Math.abs(u.y-y)<4&&u.x2>x1-2&&u.x1<x2+2))return y}return base}
function route(a,b){const A=ptPos(a),B=ptPos(b);const top=k=>k.startsWith('P:')&&PINS.find(p=>'P:'+p.n===k).top,bot=k=>k.startsWith('P:')&&!PINS.find(p=>'P:'+p.n===k).top;
  const x1=Math.min(A.x,B.x),x2=Math.max(A.x,B.x);
  if(top(a)||top(b)){const y=freeLane(AY-10,-7,x1,x2);return[{x:A.x,y},{x:B.x,y}]}
  if(bot(a)||bot(b)){const y=freeLane(AY+302,7,x1,x2);return[{x:A.x,y},{x:B.x,y}]}
  if(Math.abs(A.x-B.x)<1||Math.abs(A.y-B.y)<1)return[];
  return[{x:A.x,y:B.y}]}
/* ---------- input ---------- */
let downPt=null,moved=false,handle=null;
function finishWire(k){const a=ED.wiring.a;
  if(k===a){toast('Il filo deve finire in un <b>punto diverso</b> da quello di partenza. Clicca un altro pin o foro.');ED.wiring=null;gT.innerHTML='';showSnap(null);return}
  if(CIR.wires.some(w=>(w.a===a&&w.b===k)||(w.a===k&&w.b===a))){toast('Questo filo c\'è già.');ED.wiring=null;gT.innerHTML='';showSnap(null);return}
  {snapshot();const pts=ED.wiring.pts.length?ED.wiring.pts:route(ED.wiring.a,k);const w={id:CIR.nid++,a:ED.wiring.a,b:k,pts,color:autoColor(ED.wiring.a,k)};CIR.wires.push(w);ED.sel={wid:w.id}}
  ED.wiring=null;gT.innerHTML='';showSnap(null);redraw();showInspector();
  try{if(analyze().shorts)toast('⚡ <b>Attenzione:</b> così il 5V è collegato direttamente al GND. È un <b>cortocircuito</b>: togli questo filo (Canc).',6000)}catch(e){}}
svg.addEventListener('pointerdown',ev=>{
  const t=ev.target,wp=toWorld(ev);downPt={x:ev.clientX,y:ev.clientY};moved=false;
  if(!opts.editable&&!ED.sim){startPan(ev);return}
  if(ED.sim){const b=t.closest('.comp');if(b){const c=CIR.comps.find(x=>x.id==b.dataset.id);if(c&&c.type==='btn'){ED.pressed[c.id]=true;drawComps();ED.onPress&&ED.onPress(c.id,true);ev.preventDefault()}}else startPan(ev);return}
  if(t.classList.contains('bend')){const w=CIR.wires.find(x=>x.id===+t.dataset.w);snapshot();handle={w,i:+t.dataset.i};svg.setPointerCapture(ev.pointerId);return}
  const near=nearestCP(wp,ED.wiring?11:8);
  if(ED.wiring){if(near)finishWire(near.k);else{ED.wiring.pts.push({x:Math.round(wp.x),y:Math.round(wp.y)});drawTemp(wp)}ev.preventDefault();return}
  const cg=t.closest('.comp');
  if(cg&&!(near&&Math.hypot(near.x-wp.x,near.y-wp.y)<4)){const c=CIR.comps.find(x=>x.id==cg.dataset.id);ED.sel={id:c.id};snapshot();ED.drag={c,dx:wp.x-c.x,dy:wp.y-c.y,moved:false};svg.setPointerCapture(ev.pointerId);redraw();showInspector();return}
  const wg=t.closest('.wire');
  if(near&&!(wg&&Math.hypot(near.x-wp.x,near.y-wp.y)>5)){ED.wiring={a:near.k,pts:[]};ED.sel=null;showInspector();drawTemp(wp);ev.preventDefault();return}
  if(wg){ED.sel={wid:+wg.dataset.wid};redraw();showInspector();return}
  ED.sel=null;redraw();showInspector();startPan(ev);
});
function startPan(ev){ED.pan={x:ev.clientX,y:ev.clientY,vx:ED.view.x,vy:ED.view.y};svg.setPointerCapture(ev.pointerId);svg.classList.add('panning')}
function dragTargets(c){return legsOf(c).map(l=>{let best=null,bd=P*.6;HOLES.forEach(h=>{const d=Math.hypot(h.x-l.x,h.y-l.y);if(d<bd){bd=d;best=h}});return best})}
function occupied(h,except){return CIR.comps.some(o=>o!==except&&legsOf(o).some(l=>Math.abs(l.x-h.x)<1&&Math.abs(l.y-h.y)<1))}
svg.addEventListener('pointermove',ev=>{
  const wp=toWorld(ev);
  if(handle){handle.w.pts[handle.i]={x:Math.round(wp.x/4)*4,y:Math.round(wp.y/4)*4};drawWires();return}
  if(ED.drag){ED.drag.moved=true;const c=ED.drag.c;c.x=wp.x-ED.drag.dx;c.y=wp.y-ED.drag.dy;drawComps();drawWires();
    snapMark.innerHTML='';const tg=dragTargets({...c});const l0=legsOf(c)[0];let off=null;
    if(tg[0]){off={x:tg[0].x-l0.x,y:tg[0].y-l0.y}}
    if(off){legsOf(c).forEach(l=>{const h=holeAt(l.x+off.x,l.y+off.y);const okh=h&&!occupied(h,c);el('circle',{cx:l.x+off.x,cy:l.y+off.y,r:6,fill:okh?'rgba(46,158,68,.35)':'rgba(211,47,47,.35)',stroke:okh?'#2E9E44':'#D32F2F','stroke-width':2},snapMark)})}
    return}
  if(ED.pan){ED.view.x=ED.pan.vx+ev.clientX-ED.pan.x;ED.view.y=ED.pan.vy+ev.clientY-ED.pan.y;applyView();return}
  const near=ED.sim?null:nearestCP(wp,ED.wiring?11:8);
  if(ED.wiring){drawTemp(near?{x:near.x,y:near.y}:wp);showSnap(near)}else showSnap(near&&!ev.target.closest('.comp')?near:null);
  if(near)showTip(ev,tipFor(near.k,near.k.startsWith('L:')?LEGNAME[CIR.comps.find(c=>c.id==near.k.split(':')[1]).type][+near.k.split(':')[2]]:''));else tip.hidden=true;
  if(near&&near.k.startsWith('H:')){const s=HOLES.find(h=>h.k===near.k).s;if(ED._hs!==s){if(ED._hs)(holeEls[ED._hs]||[]).forEach(h=>h.classList.remove('hl'));ED._hs=s;(holeEls[s]||[]).forEach(h=>h.classList.add('hl'))}}
  else if(ED._hs){(holeEls[ED._hs]||[]).forEach(h=>h.classList.remove('hl'));ED._hs=null}
});
svg.addEventListener('pointerup',ev=>{
  if(ED.sim){let ch=false;for(const k in ED.pressed)if(ED.pressed[k]){ED.pressed[k]=false;ch=true;ED.onPress&&ED.onPress(+k,false)}if(ch)drawComps()}
  if(handle){handle=null;redraw();return}
  if(ED.drag){const c=ED.drag.c;snapMark.innerHTML='';if(ED.drag.moved){snapComp(c);redraw();checkPlaced(c)}else ED.hist.pop();ED.drag=null}
  if(ED.pan){ED.pan=null;svg.classList.remove('panning')}
});
svg.addEventListener('pointerleave',()=>{showSnap(null);tip.hidden=true});
svg.addEventListener('wheel',ev=>{ev.preventDefault();const r=svg.getBoundingClientRect();const mx=ev.clientX-r.left,my=ev.clientY-r.top;const z0=ED.view.z,z=Math.max(.4,Math.min(3,z0*(ev.deltaY<0?1.1:1/1.1)));
  ED.view.x=mx-(mx-ED.view.x)*z/z0;ED.view.y=my-(my-ED.view.y)*z/z0;ED.view.z=z;applyView()},{passive:false});
function drawTemp(wp){if(!ED.wiring){gT.innerHTML='';return}const pts=[ptPos(ED.wiring.a),...ED.wiring.pts,wp];gT.innerHTML='';
  el('path',{d:pts.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' '),stroke:'#2E9E44','stroke-width':4,fill:'none','stroke-dasharray':'8 5','stroke-linecap':'round'},gT)}
const onKey=ev=>{if(ev.target.closest&&ev.target.closest('textarea,input,select'))return;if(!opts.editable||!host.isConnected||document.querySelector('.scrim'))return;
  if(ev.key==='Escape'){ED.wiring=null;gT.innerHTML='';ED.sel=null;redraw();showInspector()}
  if(ev.key==='Delete'||(ev.key==='Backspace'&&ED.sel)){ev.preventDefault();deleteSel()}
  if((ev.key==='r'||ev.key==='R')&&!ev.ctrlKey&&!ev.metaKey)rotateSel();
  if((ev.ctrlKey||ev.metaKey)&&ev.key==='z'){ev.preventDefault();undo()}
  if(ED.sel&&ED.sel.id&&!ED.sim&&/^Arrow/.test(ev.key)){ev.preventDefault();const c=CIR.comps.find(x=>x.id===ED.sel.id);snapshot();c.x+=ev.key==='ArrowLeft'?-P:ev.key==='ArrowRight'?P:0;c.y+=ev.key==='ArrowUp'?-P:ev.key==='ArrowDown'?P:0;redraw()}};addEventListener('keydown',onKey);
/* ---------- trascinamento dal pannello componenti ---------- */
function startPaletteDrag(ev,type){if(ED.sim)return toast(SIMLOCK);ev.preventDefault();const ghost=UI.ghostEl();ghost.hidden=false;ghost.textContent=({led:'💡 LED',res:'〰 Resistenza',btn:'🔘 Pulsante'})[type];
  const mv=e=>{ghost.style.left=e.clientX+10+'px';ghost.style.top=e.clientY+10+'px'};mv(ev);
  const up=e=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);ghost.hidden=true;const r=svg.getBoundingClientRect();
    if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){const wp=toWorld(e);snapshot();const c=addComp(type,wp.x-(type==='res'?2*P:type==='btn'?P:P/2),wp.y+(type==='led'?0:type==='btn'?-P:0));snapComp(c);ED.sel={id:c.id};redraw();showInspector();checkPlaced(c)}else toast('Lascia il componente <b>sopra la breadboard</b>, non qui.')};
  addEventListener('pointermove',mv);addEventListener('pointerup',up)}

/* =====================================================
   ESERCIZI GUIDATI (6)
   ===================================================== */
/* ---------- costruttori dei circuiti di esempio ---------- */
/* ---------- costruttori di circuiti (per esempi e soluzioni) ---------- */
function R_(){CIR.comps=[];CIR.wires=[];CIR.nid=1}
function W_(a,b,color,pts){CIR.wires.push({id:CIR.nid++,a,b,color,pts:pts||route(a,b)})}
function LED_(c,r,color){const h=holeXY(c,r);return addComp('led',h.x,h.y,{color})}
function RES_(c,r,rotq,value){const h=holeXY(c,r);const x=addComp('res',h.x,h.y,{value});x.rot=rotq;return x}
function BTN_(c){const h=holeXY(c,7);return addComp('btn',h.x,h.y)}
function RAILS_(){W_('P:5V','H:0:0','rosso',[{x:222,y:410},{x:452,y:410},{x:452,y:120}]);W_('P:GND3','H:1:1','nero',[{x:176,y:76},{x:466,y:76},{x:466,y:136}]);W_('P:GND1','H:2:16','nero',[{x:236,y:400},{x:530,y:400}])}
function topRoute(hk,pin){const h=holeXY(+hk.split(':')[1],+hk.split(':')[2]),p=PINS.find(x=>x.n==='D'+pin),y=50+(pin%7)*4;return[{x:h.x,y},{x:p.x,y}]}
function LEDGND_(c,color,pin){LED_(c,7,color);RES_(c,5,3,220);W_(`H:${c+1}:3`,'P:D'+pin,pinColor(pin))}
function BTNPD_(c,pin){BTN_(c);W_(`H:${c}:3`,`H:${c}:0`,'rosso');RES_(c,12,1,10000);W_(`H:${c+2}:11`,'P:D'+pin,'blu')}
function pinColor(p){return['verde','giallo','arancione','viola','blu'][p%5]}
function LEDLAB_(c,color,pin,label){const l=LED_(c,7,color);if(label)l.label=label;RES_(c,5,3,220);W_(`H:${c+1}:3`,'P:D'+pin,pinColor(pin));return l}
function BTNFLOAT_(c,pin){BTN_(c);W_(`H:${c}:3`,`H:${c}:0`,'rosso');W_(`H:${c+2}:11`,'P:D'+pin,'blu')}
const KIT={R_,W_,LED_,RES_,BTN_,RAILS_,LEDGND_,LEDLAB_,BTNPD_,BTNFLOAT_,holeXY,addComp,route};

/* ---------- hardware simulato collegato al circuito ---------- */
class CircuitHW extends ARD.HW{
  constructor(pr){super();this.pr=pr;this.cache=new Map();this.floatPins=new Set()}
  nets(){const k=Object.keys(this.pr).filter(i=>this.pr[i]).join(',');if(!this.cache.has(k))this.cache.set(k,buildNets(this.pr));return this.cache.get(k)}
  state(){return evalCircuit(this.nets(),this.mode,this.out)}
  level(p){const v=this.state().level(p,this.mode[p]);if(v===null){this.floatPins.add(p);return this.noisy(p)}return v}
}
/* ---------- tester virtuale: esegue il programma in tempo simulato ---------- */
function vrun(code,script,until){
  let prog;try{prog=ARD.compile(code)}catch(e){return{err:e}}
  const pr={},hw=new CircuitHW(pr);const btn=CIR.comps.find(c=>c.type==='btn');
  const ev=[],lines=[];let t=0,buf='';
  const rec=()=>{const s=hw.state();ev.push({t,l:{...s.leds}})};rec();
  hw.onWrite=rec;
  const gen=ARD.program(prog,hw);let si=0,steps=0;
  const flush=()=>{if(hw.sbuf){buf+=hw.sbuf;hw.sbuf='';const parts=buf.split('\n');buf=parts.pop();parts.forEach(l=>lines.push({t,l}))}};
  try{while(t<until&&steps<600000){steps++;
      while(si<script.length&&script[si][0]<=t){if(btn)pr[btn.id]=script[si][1];si++;rec()}
      const r=gen.next();if(r.done)break;const y=r.value;flush();
      if(y.delay!==undefined){let tt=t+y.delay;while(si<script.length&&script[si][0]<=tt){t=script[si][0];if(btn)pr[btn.id]=script[si][1];si++;rec()}t=tt}
      else if(y.tick)t+=.25}}catch(e){return{err:e}}
  flush();if(buf)lines.push({t,l:buf});
  const ledIds=col=>CIR.comps.filter(c=>c.type==='led'&&(!col||c.color===col)).map(c=>c.id);
  const st=tq=>{let s=ev[0].l;for(const e of ev){if(e.t<=tq)s=e.l;else break}return s};
  const onId=(id,tq)=>st(tq)[id]>0;
  const at=(col,tq)=>ledIds(col).some(i=>onId(i,tq));
  const edgesId=(id,a,b)=>{let prev=onId(id,a),rise=0,fall=0;for(let x=a+5;x<=b;x+=5){const v=onId(id,x);if(v&&!prev)rise++;if(!v&&prev)fall++;prev=v}return{rise,fall}};
  return{hw,on:at,onId,ids:ledIds,anyOn:(col,a,b)=>{for(let x=a;x<=b;x+=25)if(at(col,x))return true;return false},
    edges:(col,a,b)=>{let prev=at(col,a),rise=0,fall=0;for(let x=a+5;x<=b;x+=5){const v=at(col,x);if(v&&!prev)rise++;if(!v&&prev)fall++;prev=v}return{rise,fall}},
    edgesId,lines:(a,b)=>lines.filter(x=>x.t>=a&&x.t<=b).map(x=>x.l),allLines:lines};
}
/* ---------- simulazione dal vivo ---------- */
let SIM=null;
const banner=Q('.banner'),simtime=Q('.simtime');
function run(code,o={}){
  stop();const hw=new CircuitHW(ED.pressed);banner.hidden=true;
  const runner=new ARD.Runner(code,hw,{slow:()=>!!(o.slow&&o.slow()),stepMs:()=>o.stepMs?o.stepMs():600,
    onLine:(l,y,isDelay)=>{o.onLine&&o.onLine(l,y,isDelay,hw)},onDelay:d=>{o.onDelay&&o.onDelay(d)},
    onFlush:()=>{if(hw.sbuf){o.onSerial&&o.onSerial(hw.sbuf);hw.sbuf='';const tx=Q('.ledTX');if(tx){tx.setAttribute('fill','#FFB000');setTimeout(()=>tx.setAttribute('fill','#665'),60)}}refreshLeds(hw)},
    onError:(e,compile)=>{stop();o.onError&&o.onError(e,compile)}});
  if(!runner.start())return false;
  SIM={runner,hw,t0:performance.now()};ED.sim=true;ED.sel=null;ED.wiring=null;showInspector();redraw();host.classList.add('simon');
  hw.onWarn=m=>{banner.hidden=false;banner.className='banner warn';banner.innerHTML='⚠ '+UI.esc(m)};
  SIM.iv=setInterval(()=>{refreshLeds(hw);const s=hw.state();
    const L=Q('.ledL');if(L)L.setAttribute('fill',hw.mode[13]===1&&hw.out[13]?'#FFB000':'#5a3');
    const msgs=[];if(s.shorts.length)msgs.push('Cortocircuito! Il 5V (o un pin HIGH) è collegato direttamente a GND.');if(s.burn.length)msgs.push('Un LED è collegato senza resistenza: nella realtà si brucerebbe!');
    if(hw.floatPins.size)msgs.push(`Il pin ${[...hw.floatPins].join(', ')} non è collegato a niente: è flottante e legge valori a caso.`);
    if(msgs.length){banner.hidden=false;banner.className='banner';banner.innerHTML='⚠ '+msgs.join('<br>⚠ ')}
    const ms=performance.now()-SIM.t0;simtime.textContent='⏱ '+new Date(ms).toISOString().substr(14,9).replace('.',',')},50);
  simtime.hidden=false;o.onStart&&o.onStart(hw);return true}
function refreshLeds(hw){const s=hw.state();let ch=false;for(const id in s.leds){if((ED.bright[id]||0)!==s.leds[id]){ch=true;ED.bright[id]=s.leds[id]}}if(ch){drawComps();api.onLeds&&api.onLeds(ED.bright)}}
function stop(){if(!SIM)return;SIM.runner.stop();clearInterval(SIM.iv);SIM=null;ED.sim=false;for(const k in ED.pressed)ED.pressed[k]=false;ED.bright={};drawComps();
  host.classList.remove('simon');simtime.hidden=true;banner.hidden=true;const L=Q('.ledL');if(L)L.setAttribute('fill','#5a3');api.onStop&&api.onStop()}
/* pulsante premuto da tastiera o da un bottone esterno (accessibilità e LIM) */
function press(down){const b=CIR.comps.find(c=>c.type==='btn');if(!b||!ED.sim)return false;ED.pressed[b.id]=!!down;drawComps();ED.onPress&&ED.onPress(b.id,!!down);return true}

host.querySelector('[data-z="in"]').onclick=()=>{ED.view.z=Math.min(3,ED.view.z*1.15);applyView()};
host.querySelector('[data-z="out"]').onclick=()=>{ED.view.z=Math.max(.3,ED.view.z/1.15);applyView()};
host.querySelector('[data-z="fit"]').onclick=fitView;
const ro=new ResizeObserver(()=>fitView());ro.observe(host);
drawBreadboard();drawArduino();redraw();applyView();requestAnimationFrame(fitView);

const api={
  get circuit(){return CIR},get sim(){return ED.sim},get hw(){return SIM&&SIM.hw},
  load(j){const s=typeof j==='string'?JSON.parse(j):j;CIR.comps=s.comps||[];CIR.wires=s.wires||[];CIR.nid=s.nid||1;ED.sel=null;ED.hist=[];redraw();showInspector();requestAnimationFrame(fitView)},
  save(){return JSON.stringify(CIR)},
  build(fn){stop();fn(KIT);ED.sel=null;redraw();showInspector();requestAnimationFrame(fitView)},
  clear(){stop();R_();ED.hist=[];redraw();showInspector()},
  kit:KIT,analyze,vrun,run,stop,press,fit:fitView,undo,rotateSel,deleteSel,
  startPaletteDrag,set onChange(f){ED.onChange=f||(()=>{})},set onPress(f){ED.onPress=f},onLeds:null,onStop:null,
  destroy(){stop();ro.disconnect();removeEventListener('keydown',onKey);host.innerHTML=''}};
return api;
}
window.createBench=createBench;
