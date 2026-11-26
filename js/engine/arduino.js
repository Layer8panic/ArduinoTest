/* Arduino Lab · motore Arduino didattico (derivato da EserTinkercad, esteso) */
"use strict";
const ARD=(()=>{
  const E=(line,msg)=>{const e=new Error(msg);e.line=line;return e};
  const TYPES=['int','long','byte','bool','boolean','float','unsigned','const','void'];
  function tokenize(src){
    const T=[];let i=0,line=1;
    while(i<src.length){const c=src[i];
      if(c==='\n'){line++;i++;continue}
      if(/\s/.test(c)){i++;continue}
      if(c==='/'&&src[i+1]==='/'){while(i<src.length&&src[i]!=='\n')i++;continue}
      if(c==='/'&&src[i+1]==='*'){i+=2;while(i<src.length&&!(src[i]==='*'&&src[i+1]==='/')){if(src[i]==='\n')line++;i++}i+=2;continue}
      if(/[0-9]/.test(c)){let j=i;while(j<src.length&&/[0-9]/.test(src[j]))j++;T.push({t:'num',v:+src.slice(i,j),line});i=j;continue}
      if(/[A-Za-z_]/.test(c)){let j=i;while(j<src.length&&(/[A-Za-z0-9_]/.test(src[j])||(src[j]==='.'&&/[A-Za-z_]/.test(src[j+1]||''))))j++;T.push({t:'id',v:src.slice(i,j),line});i=j;continue}
      if(c==='"'){let j=i+1;while(j<src.length&&src[j]!=='"'&&src[j]!=='\n')j++;if(src[j]!=='"')throw E(line,'manca la virgoletta di chiusura "');T.push({t:'str',v:src.slice(i+1,j),line});i=j+1;continue}
      const two=src.substr(i,2);
      if(['==','!=','<=','>=','&&','||','++','--','+=','-='].includes(two)){T.push({t:'op',v:two,line});i+=2;continue}
      if('=<>+-*/%!(){};,'.includes(c)){T.push({t:'op',v:c,line});i++;continue}
      if(c==='?')throw E(line,'c\'è ancora uno spazio vuoto "?" da completare');
      throw E(line,`carattere non riconosciuto "${c}"`)}
    T.push({t:'eof',v:'fine del codice',line});return T;
  }
  function parse(T){
    let p=0;const pk=()=>T[p],nx=()=>T[p++],is=v=>T[p].t==='op'&&T[p].v===v,isw=v=>T[p].t==='id'&&T[p].v===v;
    const ex=(v,msg)=>{if(!is(v))throw E((T[p].t==='eof'||v===';'||v===')')&&p>0?T[p-1].line:T[p].line,msg||`manca "${v}"`);return nx()};
    const prog={globals:[],funcs:{}};
    function skipType(){let ty=nx().v;while(pk().t==='id'&&['int','long','byte'].includes(pk().v))ty=nx().v;return ty}
    while(pk().t!=='eof'){
      const t=pk();if(t.t!=='id'||!TYPES.includes(t.v))throw E(t.line,`mi aspettavo una dichiarazione (int …) o una funzione (void …), non "${t.v}"`);
      skipType();const nm=nx();if(nm.t!=='id')throw E(nm.line,'manca il nome della variabile o della funzione');
      if(is('(')){nx();ex(')',`manca la parentesi ")" dopo ${nm.v}(`);prog.funcs[nm.v]=block()}
      else{let init=null;if(is('=')){nx();init=expr()}ex(';',`manca il punto e virgola ";" dopo la dichiarazione di ${nm.v}`);prog.globals.push({k:'decl',name:nm.v,init,line:nm.line})}
    }
    return prog;
    function block(){const o=ex('{','manca la parentesi graffa "{"');const body=[];while(!is('}')){if(pk().t==='eof')throw E(o.line,'manca una parentesi graffa di chiusura "}"');body.push(stmt())}const c=nx();return{k:'block',body,end:c.line}}
    function stmt(){const t=pk();
      if(is('{'))return block();
      if(is(';')){nx();return{k:'empty',line:t.line}}
      if(isw('if')){nx();ex('(','dopo if ci vuole la parentesi tonda "("');const c=expr();ex(')','manca la parentesi tonda ")" che chiude la condizione dell\'if');const th=stmt();let el=null,elLine=0;if(isw('else')){elLine=pk().line;nx();el=stmt()}return{k:'if',c,th,el,elLine,line:t.line}}
      if(isw('else'))throw E(t.line,'"else" senza if: controlla di non aver messo il punto e virgola dopo la parentesi dell\'if');
      if(isw('while')){nx();ex('(','dopo while ci vuole la parentesi tonda "("');const c=expr();ex(')','manca la parentesi tonda ")" che chiude la condizione del while');return{k:'while',c,body:stmt(),line:t.line}}
      if(isw('for')){nx();ex('(','dopo for ci vuole la parentesi tonda "("');let init=null;
        if(pk().t==='id'&&TYPES.includes(pk().v)&&pk().v!=='void'){skipType();const nm=nx();if(nm.t!=='id')throw E(nm.line,'manca il nome della variabile del for');let iv=null;if(is('=')){nx();iv=expr()}init={k:'decl',name:nm.v,init:iv,line:nm.line}}
        else if(!is(';'))init={k:'expr',e:expr(),line:t.line};
        ex(';','nel for le tre parti si separano con il punto e virgola: for (int i = 0; i < 4; i++)');
        const c=is(';')?{k:'num',v:1}:expr();ex(';','nel for le tre parti si separano con il punto e virgola: for (int i = 0; i < 4; i++)');
        const st=is(')')?null:expr();ex(')','manca la parentesi tonda ")" del for');return{k:'for',init,c,st,body:stmt(),line:t.line}}
      if(t.t==='id'&&['do','switch'].includes(t.v))throw E(t.line,`"${t.v}" non fa parte di questa lezione: usa if / else, for o while`);
      if(t.t==='id'&&TYPES.includes(t.v)&&t.v!=='void'){skipType();const nm=nx();if(nm.t!=='id')throw E(nm.line,'manca il nome della variabile');let init=null;if(is('=')){nx();init=expr()}ex(';','manca il punto e virgola ";" alla fine della riga');return{k:'decl',name:nm.v,init,line:nm.line}}
      const e=expr();ex(';','manca il punto e virgola ";" alla fine della riga');return{k:'expr',e,line:t.line}}
    function expr(){return asg()}
    function asg(){const l=or();if(is('=')||is('+=')||is('-=')){const t=nx();if(l.k!=='var')throw E(t.line,'a sinistra di "'+t.v+'" ci vuole il nome di una variabile');const v=asg();return{k:'asg',name:l.name,v:t.v==='='?v:{k:'bin',op:t.v[0],l:{k:'var',name:l.name,line:t.line},r:v},line:t.line}}return l}
    function or(){let l=and();while(is('||')){nx();l={k:'bin',op:'||',l,r:and()}}return l}
    function and(){let l=eq();while(is('&&')){nx();l={k:'bin',op:'&&',l,r:eq()}}return l}
    function eq(){let l=rel();while(is('==')||is('!=')){const op=nx().v;l={k:'bin',op,l,r:rel()}}return l}
    function rel(){let l=add();while(is('<')||is('>')||is('<=')||is('>=')){const op=nx().v;l={k:'bin',op,l,r:add()}}return l}
    function add(){let l=mul();while(is('+')||is('-')){const op=nx().v;l={k:'bin',op,l,r:mul()}}return l}
    function mul(){let l=un();while(is('*')||is('/')||is('%')){const op=nx().v;l={k:'bin',op,l,r:un()}}return l}
    function un(){if(is('!')){nx();return{k:'not',e:un()}}if(is('-')){nx();return{k:'neg',e:un()}}return post()}
    function post(){const e=prim();if(is('++')||is('--')){const t=nx();if(e.k!=='var')throw E(t.line,`"${t.v}" si usa dopo una variabile`);return{k:'inc',name:e.name,d:t.v==='++'?1:-1,line:t.line}}return e}
    function prim(){const t=nx();
      if(t.t==='num')return{k:'num',v:t.v};if(t.t==='str')return{k:'str',v:t.v};
      if(t.t==='op'&&t.v==='('){const e=expr();ex(')','manca una parentesi tonda ")"');return e}
      if(t.t==='id'){if(is('(')){nx();const args=[];if(!is(')')){args.push(expr());while(is(',')){nx();args.push(expr())}}ex(')',`manca la parentesi ")" nella chiamata a ${t.v}`);return{k:'call',name:t.v,args,line:t.line}}return{k:'var',name:t.v,line:t.line}}
      throw E(t.line,t.t==='eof'?'il codice finisce troppo presto: manca qualcosa':`non mi aspettavo "${t.v}" qui`)}
  }
  const CONST={HIGH:1,LOW:0,INPUT:0,OUTPUT:1,INPUT_PULLUP:2,true:1,false:0,LED_BUILTIN:13};
  const ARGS={pinMode:2,digitalWrite:2,digitalRead:1,delay:1,'Serial.begin':1,'Serial.println':[0,1],'Serial.print':1};
  function* program(prog,hw){
    const G={};hw.vars=G;
    const look=(sc,n)=>{for(let i=sc.length-1;i>=0;i--)if(n in sc[i])return sc[i];return null};
    function* ex(s,sc){switch(s.k){
      case'block':{const ns=[...sc,{}];hw.locals=ns;for(const x of s.body)yield* ex(x,ns);return}
      case'empty':yield{line:s.line,note:'istruzione vuota ";" (non fa niente)'};return;
      case'decl':yield{line:s.line};sc[sc.length-1][s.name]=s.init?yield* ev(s.init,sc):0;return;
      case'expr':yield{line:s.line};yield* ev(s.e,sc);return;
      case'if':{yield{line:s.line};const c=yield* ev(s.c,sc);yield{line:s.line,cond:!!c};if(c)yield* ex(s.th,sc);else if(s.el){yield{line:s.elLine,note:'else'};yield* ex(s.el,sc)}return}
      case'while':{for(;;){yield{line:s.line};const c=yield* ev(s.c,sc);yield{line:s.line,cond:!!c,tick:1};if(!c)return;yield* ex(s.body,sc)}}
      case'for':{const ns=[...sc,{}];if(s.init)yield* ex(s.init,ns);for(;;){yield{line:s.line};const c=yield* ev(s.c,ns);yield{line:s.line,cond:!!c,tick:1};if(!c)return;yield* ex(s.body,ns);if(s.st)yield* ev(s.st,ns)}}}}
    function* ev(e,sc){switch(e.k){
      case'num':case'str':return e.v;
      case'var':{if(e.name in CONST)return CONST[e.name];const s=look(sc,e.name);if(!s)throw E(e.line,`la variabile "${e.name}" non è stata dichiarata`);return s[e.name]}
      case'asg':{const v=yield* ev(e.v,sc);if(e.name in CONST)return v;const s=look(sc,e.name);if(!s)throw E(e.line,`la variabile "${e.name}" non è stata dichiarata`);s[e.name]=v;return v}
      case'inc':{const s=look(sc,e.name);if(!s)throw E(e.line,`la variabile "${e.name}" non è stata dichiarata`);const o=s[e.name];s[e.name]=o+e.d;return o}
      case'not':return (yield* ev(e.e,sc))?0:1;
      case'neg':return -(yield* ev(e.e,sc));
      case'bin':{const l=yield* ev(e.l,sc);if(e.op==='&&')return l&&(yield* ev(e.r,sc))?1:0;if(e.op==='||')return(l||(yield* ev(e.r,sc)))?1:0;const r=yield* ev(e.r,sc);
        switch(e.op){case'==':return l==r?1:0;case'!=':return l!=r?1:0;case'<':return l<r?1:0;case'>':return l>r?1:0;case'<=':return l<=r?1:0;case'>=':return l>=r?1:0;case'+':return l+r;case'-':return l-r;case'*':return l*r;case'/':return r?Math.trunc(l/r):0;case'%':return r?l%r:0}}
      case'call':{const a=[];for(const x of e.args)a.push(yield* ev(x,sc));
        if(prog.funcs[e.name]){yield* ex(prog.funcs[e.name],[G]);return 0}
        const n=ARGS[e.name];if(n===undefined)throw E(e.line,`"${e.name}" non è un'istruzione che conosciamo (controlla maiuscole e minuscole)`);
        if(Array.isArray(n)?!n.includes(a.length):n!==a.length)throw E(e.line,`${e.name} vuole ${Array.isArray(n)?n.join(' o '):n} valor${(Array.isArray(n)?2:n)===1?'e':'i'} tra parentesi`);
        if(e.name==='delay'){yield{delay:a[0],line:e.line};return 0}
        return hw.call(e.name,a,e.line)}}}
    for(const d of prog.globals)G[d.name]=d.init?yield* ev(d.init,[G]):0;
    if(!prog.funcs.setup)throw E(1,'manca la funzione void setup()');
    if(!prog.funcs.loop)throw E(1,'manca la funzione void loop()');
    yield{phase:'setup'};yield* ex(prog.funcs.setup,[G]);
    let n=0;while(true){yield{phase:'loop',n:++n};yield* ex(prog.funcs.loop,[G]);yield{tick:1,line:prog.funcs.loop.end}}
  }
  function compile(src){return parse(tokenize(src))}

  /* ---------- Hardware simulato ---------- */
  const WIRING={pulldown:'pull-down 10 kΩ (verso 5 V)',pullup:'verso GND (per INPUT_PULLUP)',floating:'nessuna resistenza (verso 5 V)',rotated:'pulsante ruotato (stessa coppia)'};
  class HW{
    constructor(){this.mode={};this.out={};this.btn={};this.serialOn=false;this.sbuf='';this.warns=[];this.warned={};this.noise={}}
    reset(){this.mode={};this.out={};this.serialOn=false;this.sbuf='';this.warns=[];this.warned={}}
    noisy(p){const t=performance.now();const n=this.noise[p]||(this.noise[p]={v:0,t:0});if(t-n.t>140){n.v=Math.random()<.5?1:0;n.t=t}return n.v}
    level(p){const m=this.mode[p];const b=this.btn[p];
      if(m===undefined||m===1)return null;
      if(!b)return m===2?1:this.noisy(p);
      const pr=b.pressed,w=b.wiring;
      if(w==='rotated')return 1;
      if(m===2){if(w==='pullup')return pr?0:1;return 1}
      if(w==='pulldown')return pr?1:0;
      if(w==='floating')return pr?1:this.noisy(p);
      if(w==='pullup')return pr?0:this.noisy(p);
      return 0}
    warn(k,msg){if(this.warned[k])return;this.warned[k]=1;this.warns.push(msg);this.onWarn&&this.onWarn(msg)}
    call(name,a,line){
      if(name==='pinMode'){this.mode[a[0]]=a[1];if(a[1]===1&&this.btn[a[0]])this.warn('pm'+a[0],`riga ${line}: sul pin ${a[0]} c'è un pulsante, ma l'hai messo in OUTPUT. Per ascoltarlo serve INPUT.`);this.onPin&&this.onPin();return 0}
      if(name==='digitalWrite'){const p=a[0];if(this.mode[p]!==1){this.warn('dw'+p,`riga ${line}: digitalWrite sul pin ${p}, che non è in OUTPUT. Manca pinMode(${p}, OUTPUT) nel setup()?`);return 0}
        this.out[p]=a[1]?1:0;this.onWrite&&this.onWrite(p,this.out[p]);return 0}
      if(name==='digitalRead'){const p=a[0];if(this.mode[p]===undefined)this.warn('dr'+p,`riga ${line}: leggi il pin ${p} ma non hai scritto pinMode(${p}, INPUT) nel setup().`);
        if(this.mode[p]===1)return this.out[p]||0;const v=this.level(p);const r=v===null?this.noisy(p):v;this.lastRead={pin:p,v:r,line};return r}
      if(name==='Serial.begin'){this.serialOn=true;return 0}
      if(name==='Serial.println'||name==='Serial.print'){if(!this.serialOn){this.warn('sb',`riga ${line}: per usare il monitor seriale scrivi prima Serial.begin(9600) nel setup().`);return 0}
        this.sbuf+=(a.length?String(a[0]):'')+(name==='Serial.println'?'\n':'');return 0}
      return 0}
  }

  /* ---------- Runner: tempo reale o rallentatore ---------- */
  class Runner{
    constructor(src,hw,o){this.src=src;this.hw=hw;this.o=o||{};this.alive=false}
    start(){
      let prog;try{prog=compile(this.src)}catch(e){this.o.onError&&this.o.onError(e,true);return false}
      this.hw.reset();this.gen=program(prog,this.hw);this.alive=true;this.tok={};this.step(this.tok);return true}
    stop(){this.alive=false;this.tok=null;clearTimeout(this.timer);this.o.onLine&&this.o.onLine(0)}
    step(tok){
      if(!this.alive||tok!==this.tok)return;const t0=performance.now();let it=0;const slow=this.o.slow&&this.o.slow();
      try{
        while(true){const r=this.gen.next();if(r.done){this.stop();return}const y=r.value;
          if(y.line&&slow){this.o.onLine&&this.o.onLine(y.line,y);this.o.onFlush&&this.o.onFlush();
            const wait=y.delay!==undefined?Math.max(y.delay,this.o.stepMs()):this.o.stepMs();
            if(y.delay!==undefined&&this.o.onDelay)this.o.onDelay(y.delay);
            this.timer=setTimeout(()=>this.step(tok),wait);return}
          if(y.phase&&this.o.onPhase)this.o.onPhase(y);
          if(y.delay!==undefined){this.o.onFlush&&this.o.onFlush();this.o.onLine&&this.o.onLine(y.line,y,true);this.timer=setTimeout(()=>this.step(tok),Math.max(0,y.delay));return}
          if(y.tick&&(++it>=60||performance.now()-t0>10)){this.o.onFlush&&this.o.onFlush();this.timer=setTimeout(()=>this.step(tok),8);return}
        }
      }catch(e){this.alive=false;this.o.onError&&this.o.onError(e,false)}
    }
  }
  return{compile,program,HW,Runner,WIRING,CONST};
})();

/* =====================================================
   ERRORI DEL CODICE SPIEGATI IN MODO SEMPLICE
   (si aggancia a ARD.compile: prima e dopo la compilazione)
   ===================================================== */
(()=>{
const E=(line,msg)=>{const e=new Error(msg);e.line=line;return e};
const KNOWN=['pinMode','digitalWrite','digitalRead','delay','Serial.begin','Serial.print','Serial.println','HIGH','LOW','INPUT','OUTPUT','INPUT_PULLUP','LED_BUILTIN','setup','loop','void','int','long','byte','bool','boolean','float','unsigned','const','if','else','true','false','for','while'];
const TYPES=['int','long','byte','bool','boolean','float','unsigned','const'];
/* toglie commenti e testi tra virgolette, ma tiene le righe allineate */
function clean(code){let o='',i=0;while(i<code.length){const c=code[i];
  if(c==='/'&&code[i+1]==='/'){while(i<code.length&&code[i]!=='\n')i++;continue}
  if(c==='/'&&code[i+1]==='*'){i+=2;while(i<code.length&&!(code[i]==='*'&&code[i+1]==='/')){o+=code[i]==='\n'?'\n':' ';i++}i+=2;continue}
  if(c==='"'){o+='"';i++;while(i<code.length&&code[i]!=='"'&&code[i]!=='\n'){o+=' ';i++}if(code[i]==='"'){o+='"';i++}continue}
  o+=c;i++}return o}
function idents(src){const out=[];src.split('\n').forEach((l,i)=>{const re=/[A-Za-z_À-ÿ][A-Za-z0-9_À-ÿ]*(?:\.[A-Za-z_]\w*)?/g;let m;while((m=re.exec(l))){const prev=l[m.index-1]||'';if(/[0-9]/.test(prev))continue;out.push({v:m[0],line:i+1,next:l.slice(m.index+m[0].length).trim()[0]||''})}});return out}
function pre(code){
  if(!code.trim())throw E(1,'il programma è vuoto. Servono almeno le due parti: void setup() { } e void loop() { }.');
  const L=code.split('\n'),C=clean(code).split('\n');
  for(let i=0;i<L.length;i++){const raw=L[i],l=C[i],n=i+1;
    if(/[“”„«»]/.test(raw.replace(/\/\/.*$/,'')))throw E(n,'ci sono delle virgolette "storte" (succede copiando da Word o dal telefono). Cancellale e riscrivile con il tasto " della tastiera.');
    if(/'/.test(l))throw E(n,'il testo va tra virgolette doppie "così", non tra apostrofi \'così\'.');
    if(/[À-ÿ]/.test(l))throw E(n,'le lettere accentate (à, è, ò…) si possono usare solo nei commenti o dentro le virgolette. Nei nomi usa lettere senza accento.');
    if(/\d+[.,]\d+/.test(l))throw E(n,'i numeri si scrivono tutti attaccati, senza punto né virgola: per esempio 9600, non 9.600.');
    if(/\bif\s*\(/.test(l)&&/[^=!<>]=[^=]/.test(l.slice(l.indexOf('(')))&&!/==/.test(l))throw E(n,'nell\'if, per fare una domanda, si usano due uguali: == (per esempio stato == HIGH). Un solo = serve a mettere un valore in una variabile.');
    if(/\b(Void|VOID)\b/.test(l))throw E(n,'"void" si scrive tutto minuscolo.');
    if(/\b(If|IF|Else|ELSE|Int|INT)\b/.test(l))throw E(n,`"${l.match(/\b(If|IF|Else|ELSE|Int|INT)\b/)[1]}" si scrive tutto minuscolo: ${l.match(/\b(If|IF|Else|ELSE|Int|INT)\b/)[1].toLowerCase()}.`);
    if(/\bdelay\s*\(\s*\)/.test(l))throw E(n,'delay vuole un numero tra parentesi: quanti millisecondi aspettare. Per esempio delay(500); = mezzo secondo.');
  }
  const cnt=(re)=>(clean(code).match(re)||[]).length;
  if(cnt(/\bvoid\s+setup\s*\(/g)>1)throw E(1,'hai scritto due volte void setup(). Deve esserci una sola parte setup.');
  if(cnt(/\bvoid\s+loop\s*\(/g)>1)throw E(1,'hai scritto due volte void loop(). Deve esserci una sola parte loop.');
  const o=cnt(/\{/g),c=cnt(/\}/g);
  if(c>o)throw E(lastLine(code,'}'),`c'è una parentesi graffa } di troppo (ne hai aperte ${o} e chiuse ${c}).`);
}
function lastLine(code,ch){const C=clean(code).split('\n');for(let i=C.length-1;i>=0;i--)if(C[i].includes(ch))return i+1;return 1}
function post(code){
  const src=clean(code),ids=idents(src);
  const declared=new Set();let m;const dre=/\b(?:int|long|byte|bool|boolean|float|unsigned|const)\s+(?:int\s+|long\s+)?([A-Za-z_]\w*)/g;while((m=dre.exec(src)))declared.add(m[1]);
  const all=[...KNOWN,...declared];
  for(const t of ids){if(KNOWN.includes(t.v)||declared.has(t.v))continue;
    const same=all.find(k=>k.toLowerCase()===t.v.toLowerCase());
    if(same)throw E(t.line,`hai scritto "${t.v}": forse volevi "${same}"? Arduino fa differenza tra maiuscole e minuscole.`);
    if(/^Serial\./i.test(t.v))throw E(t.line,`"${t.v}" non esiste. Per il monitor seriale si usano Serial.begin, Serial.print e Serial.println.`);
    if(t.next==='(')throw E(t.line,`"${t.v}" non è un'istruzione che conosciamo. Le istruzioni sono: pinMode, digitalWrite, digitalRead, delay, Serial.begin, Serial.print, Serial.println.`);
    throw E(t.line,`la parola "${t.v}" non esiste nel programma. Se è il nome di una variabile, va creata in alto (per esempio int ${t.v} = 2;). Se è un testo da scrivere sul monitor, mettilo tra virgolette: "${t.v}".`)}
  /* i pin */
  const val={};const vre=/\b(?:int|byte|const\s+int)\s+([A-Za-z_]\w*)\s*=\s*(\d+)\s*;/g;while((m=vre.exec(src)))val[m[1]]=+m[2];
  const usesSerial=/Serial\.(print|println)\s*\(/.test(src);
  src.split('\n').forEach((l,i)=>{const re=/\b(pinMode|digitalWrite|digitalRead)\s*\(\s*([A-Za-z_]\w*|\d+)\s*(?:,\s*([A-Za-z_]\w*|\d+))?/g;let k;while((k=re.exec(l))){
    const a=k[2],pin=/^\d+$/.test(a)?+a:a==='LED_BUILTIN'?13:val[a];
    if(pin!==undefined&&(pin<0||pin>13))throw E(i+1,`il pin ${pin} non esiste: Arduino Uno ha i pin digitali da 0 a 13.`);
    if(pin!==undefined&&pin<=1&&usesSerial)throw E(i+1,`il pin ${pin} serve al monitor seriale: scegli un pin da 2 a 13.`);
    if(k[1]==='pinMode'&&k[3]&&!['INPUT','OUTPUT','INPUT_PULLUP'].includes(k[3]))throw E(i+1,`in pinMode il secondo valore deve essere INPUT (il pin ascolta) oppure OUTPUT (il pin comanda), non "${k[3]}".`);
    if(k[1]==='digitalWrite'&&k[3]&&/^\d+$/.test(k[3])&&+k[3]>1)throw E(i+1,`digitalWrite accetta HIGH (acceso) o LOW (spento), non il numero ${k[3]}.`);
    if(k[1]==='pinMode'&&!k[3])throw E(i+1,'pinMode vuole due valori: il pin e il modo. Per esempio pinMode(2, INPUT);');
    if(k[1]==='digitalWrite'&&!k[3])throw E(i+1,'digitalWrite vuole due valori: il pin e HIGH oppure LOW. Per esempio digitalWrite(12, HIGH);');}});
}
/* avvisi: il programma funziona, ma probabilmente non come vuoi */
function warnings(code){const src=clean(code),W=[];
  const setupBody=(src.match(/void\s+setup\s*\(\s*\)\s*\{([\s\S]*?)\}/)||[])[1]||'';
  const line=re=>{const ls=src.split('\n');for(let i=0;i<ls.length;i++)if(re.test(ls[i]))return i+1;return 0};
  if(/Serial\.print/.test(src)&&!/Serial\.begin\s*\(/.test(src))W.push([line(/Serial\.print/),'usi Serial.print ma manca Serial.begin(9600); nel setup(): il monitor seriale resterà vuoto.']);
  const val={};let m;const vre=/\b(?:int|byte|const\s+int)\s+([A-Za-z_]\w*)\s*=\s*(\d+)\s*;/g;while((m=vre.exec(src)))val[m[1]]=+m[2];
  const pinOf=a=>/^\d+$/.test(a)?+a:a==='LED_BUILTIN'?13:val[a];
  const modes={};const mre=/pinMode\s*\(\s*(\w+)\s*,\s*(\w+)/g;while((m=mre.exec(src)))modes[pinOf(m[1])]=m[2];
  const done=new Set();
  const wre=/digitalWrite\s*\(\s*(\w+)/g;while((m=wre.exec(src))){const p=pinOf(m[1]);if(p===undefined||done.has('w'+p))continue;done.add('w'+p);
    if(!modes[p])W.push([line(new RegExp('digitalWrite\\s*\\(\\s*'+m[1]+'\\b')),`il pin ${p} non ha il suo pinMode(${m[1]}, OUTPUT); nel setup(): il LED non si accenderà.`]);
    else if(modes[p]!=='OUTPUT')W.push([line(new RegExp('pinMode\\s*\\(\\s*'+m[1]+'\\b')),`con il pin ${p} accendi un LED, quindi nel pinMode ci vuole OUTPUT, non ${modes[p]}.`])}
  const rre=/digitalRead\s*\(\s*(\w+)/g;while((m=rre.exec(src))){const p=pinOf(m[1]);if(p===undefined||done.has('r'+p))continue;done.add('r'+p);
    if(!modes[p])W.push([line(new RegExp('digitalRead\\s*\\(\\s*'+m[1]+'\\b')),`il pin ${p} non ha il suo pinMode(${m[1]}, INPUT); nel setup().`]);
    else if(modes[p]==='OUTPUT')W.push([line(new RegExp('pinMode\\s*\\(\\s*'+m[1]+'\\b')),`con il pin ${p} leggi il pulsante, quindi nel pinMode ci vuole INPUT, non OUTPUT.`])}
  if(/pinMode|Serial\.begin/.test(src)&&!/pinMode|Serial\.begin/.test(setupBody))W.push([line(/pinMode|Serial\.begin/),'pinMode e Serial.begin vanno scritti dentro void setup() { }.']);
  const dre2=/delay\s*\(\s*(\d+)\s*\)/g;let dd;while((dd=dre2.exec(src))){if(+dd[1]>10000){W.push([src.slice(0,dd.index).split('\n').length,`delay(${dd[1]}) fa aspettare Arduino ${Math.round(+dd[1]/1000)} secondi: sei sicuro? Ricorda che 1000 = 1 secondo.`]);break}}
  return W}
/* riscrive in modo più semplice gli errori del compilatore */
function rephrase(e){const r=[[/carattere non riconosciuto "(.)"/,(m,c)=>`il carattere "${c}" qui non va bene. Controlla di averlo scritto giusto.`],
  [/mi aspettavo una dichiarazione \(int …\) o una funzione \(void …\), non "(.*)"/,(m,c)=>c==='}'?'c\'è una parentesi graffa } di troppo.':`fuori da setup() e loop() si possono scrivere solo le variabili (int …). "${c}" va spostato dentro una delle due parti.`],
  [/manca il punto e virgola ";" dopo la dichiarazione di (\w+)/,(m,c)=>`dopo "${c}" ci vuole il punto e virgola ;. Attenzione: un nome non può avere spazi (scrivi ledVerde, non led verde).`],
  [/manca la parentesi "\)" nella chiamata a (\S+)/,(m,c)=>`manca la parentesi ) di ${c}. Ricorda: dentro le parentesi i valori si separano con la virgola , e alla fine si chiude con ).`],
  [/a sinistra di "=" ci vuole il nome di una variabile/,()=>'nell\'if per fare una domanda si usano due uguali ==.']];
  for(const[re,f]of r){const m=e.message.match(re);if(m){e.message=f(...m);break}}return e}
const orig=ARD.compile;
ARD.compile=code=>{pre(code);let p;try{p=orig(code)}catch(e){throw rephrase(e)}post(code);return p};
ARD.warnings=warnings;
})();

window.ARD=ARD;
