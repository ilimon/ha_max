(async()=>{
const root=document.getElementById('cmp');
if(!root)return;
const AC=window.AudioContext||window.webkitAudioContext;
if(!AC){
root.innerHTML='<p class="x-warn"><b>Unsupported.</b> This browser has no Web Audio API.</p>';
return;
}
let D;
try{
D=await(await fetch('data/assets.json')).json();
}catch(e){
root.innerHTML='<p class="x-warn"><b>Unavailable.</b> data/assets.json could not be loaded.</p>';
return;
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SR=48000,TRIALS=16,PI=Math.PI;
const F=Array.from({length:160},(_,i)=>20*1000**(i/159));
const st={dev:'iem',A:{vdc:'',irs:''},B:{vdc:'',irs:''},act:'A',lm:true,abx:null,src:'pink'};
let ctx,src,master,dec;
const ch={},xf={},rb={A:0,B:0},cache=new Map(),icache=new Map(),rcache=new Map();
const HINT={
pink:'Pink noise is the best source for level and tonal comparison.',
sweep:'Log sweep, 20 Hz to 20 kHz over 10 s. Listen for resonances and roll-off.',
tone:'1 kHz tone on the left channel only. Bypass keeps the right ear silent. A faint right-ear signal confirms the crossfeed paths are mapped.',
file:'Your own audio file. It stays in this browser.'
};
root.innerHTML=`
<div class="cmp-box">
  <div class="cmp-console-header">
    <div class="cmp-console-title">
      <span class="badge-pill">Real-Time DSP Engine</span>
      <h3>Acoustic Chain A/B Comparison Console</h3>
    </div>
    <div class="cmp-console-meta">
      <span>Context: <b>48,000 Hz IEEE Float32</b></span>
      <span class="chip ok">Real-Time WebAudio</span>
    </div>
  </div>

  <div class="cmp-bar">
    <div class="seg" role="group" aria-label="Device">
      <button type="button" data-dev="iem" aria-pressed="true">IEM</button>
      <button type="button" data-dev="speaker" aria-pressed="false">Speaker</button>
    </div>

    <label class="fld">
      <span class="lbl">Test Source Signal</span>
      <select id="cmpSrc">
        <option value="pink">Pink noise (Tonal balance)</option>
        <option value="sweep">10s Log Sweep (20Hz-20kHz)</option>
        <option value="tone">1 kHz Left-Only (Crossfeed test)</option>
        <option value="file">Upload local audio file…</option>
      </select>
    </label>

    <input id="cmpFile" type="file" accept="audio/*" hidden>

    <button id="cmpPlayBtn" class="btn" type="button" style="min-height:var(--hit)">
      <svg class="i" aria-hidden="true" id="cmpPlayIco"><use href="#i-play"/></svg>
      <span id="cmpPlayTxt">Start Audition</span>
    </button>
  </div>

  <audio id="cmpAudio" loop preload="auto" hidden></audio>

  <div class="cmp-hint-bar">
    <span class="lbl">Signal Note:</span>
    <span id="cmpHint" class="lpair">Pink noise is the optimal source for level and spectral balance.</span>
  </div>

  <div class="cmp-chains" id="cmpChains"></div>

  <div class="cmp-ctl">
    <div class="cmp-ctl-left">
      <span class="lbl">Active Output:</span>
      <div class="seg" id="cmpAB" role="group" aria-label="Active chain">
        <button type="button" data-act="A" aria-pressed="true" class="btn-chain-a">Chain A</button>
        <button type="button" data-act="B" aria-pressed="false" class="btn-chain-b">Chain B</button>
      </div>
      <label class="chk">
        <input id="cmpLm" type="checkbox" checked>
        <span>Auto Loudness Match</span>
      </label>
    </div>

    <button class="btn ghost sm" id="cmpAbxBtn" type="button">
      <svg class="i" aria-hidden="true"><use href="#i-scale"/></svg>
      Blind A/B/X Audit Mode
    </button>
  </div>

  <div class="cmp-abx" id="cmpAbx" hidden>
    <p class="lpair" id="cmpAbxT"></p>
    <div class="cmp-abxb">
      <button class="btn ghost sm" type="button" data-play="A">Audition Chain A</button>
      <button class="btn ghost sm" type="button" data-play="B">Audition Chain B</button>
      <button class="btn ghost sm" type="button" data-play="X">Audition Unknown X</button>
    </div>
    <div class="cmp-abxb">
      <button class="btn sm" type="button" data-ans="A">X is Chain A</button>
      <button class="btn sm" type="button" data-ans="B">X is Chain B</button>
    </div>
  </div>

  <p class="lpair" id="cmpSt" aria-live="polite"></p>

  <div class="cmp-plot-wrapper">
    <div class="cmp-plot-header">
      <span class="lbl">Frequency Response Transfer Functions (dB vs Hz)</span>
      <div class="cmp-key">
        <span class="ka">Chain A (Reference)</span>
        <span class="kb">Chain B (Target)</span>
      </div>
    </div>
    <svg class="cmp-plot" id="cmpPlot" viewBox="0 0 640 240" role="img" aria-label="Predicted response of chain A and chain B"></svg>
  </div>

  <p class="x-warn"><b>Browser Preview Engine:</b> Simulated WebAudio convolution for instant browser auditioning. Hardware EEL VM execution and native ARM driver protection run exclusively inside RootlessJamesDSP on Android.</p>
</div>`;

const $=s=>root.querySelector(s),au=$('#cmpAudio'),playBtn=$('#cmpPlayBtn'),playTxt=$('#cmpPlayTxt');
const opts=(dev,type)=>[['Core',D.core[dev].filter(f=>f.type==type)],...D.sets.filter(s=>s.dev==dev).map(s=>[s.title,s.files.filter(f=>f.type==type)])].filter(g=>g[1].length);
const sel=(s,t)=>`<label class="fld"><span class="lbl">${t.toUpperCase()} FILTER</span><select data-s="${s}" data-t="${t}"><option value="">None (Bypass)</option>${opts(st.dev,t).map(([n,l])=>`<optgroup label="${esc(n)}">${l.map(f=>`<option value="${esc(f.path)}">${esc(f.name)}</option>`).join('')}</optgroup>`).join('')}</select></label>`;
const panels=()=>{
  $('#cmpChains').innerHTML=['A','B'].map(s=>`
    <div class="cmp-panel panel-${s.toLowerCase()}">
      <div class="cmp-panel-header">
        <h3><span class="tag tag-${s.toLowerCase()}">CHAIN ${s}</span>${s=='A'?'Reference / Direct':'Target Correction'}</h3>
        <span class="lpair-badge" id="cmpL${s}">Level 0.0 dB</span>
      </div>
      <div class="cmp-panel-body">
        ${sel(s,'vdc')}
        ${sel(s,'irs')}
      </div>
    </div>
  `).join('');
  for(const s of['A','B'])for(const t of['vdc','irs'])$(`[data-s=${s}][data-t=${t}]`).value=st[s][t];
};
const defaults=()=>{
  const c=D.core[st.dev],g=t=>(c.find(f=>f.type==t)||{}).path||'';
  st.A={vdc:'',irs:''};
  st.B={vdc:g('vdc'),irs:g('irs')};
};

const msg=(t,e)=>{
const n=$('#cmpSt');
n.textContent=t;
n.classList.toggle('lwarn',!!e);
};
const wav=([l,r])=>{
const n=l.length,b=new DataView(new ArrayBuffer(44+n*4)),w=(o,s)=>[...s].forEach((c,i)=>b.setUint8(o+i,c.charCodeAt(0)));
w(0,'RIFF');
b.setUint32(4,36+n*4,true);
w(8,'WAVEfmt ');
b.setUint32(16,16,true);
b.setUint16(20,1,true);
b.setUint16(22,2,true);
b.setUint32(24,SR,true);
b.setUint32(28,SR*4,true);
b.setUint16(32,4,true);
b.setUint16(34,16,true);
w(36,'data');
b.setUint32(40,n*4,true);
for(let i=0;i<n;i++){
b.setInt16(44+i*4,Math.max(-1,Math.min(1,l[i]))*32767,true);
b.setInt16(46+i*4,Math.max(-1,Math.min(1,r[i]))*32767,true);
}
return new Blob([b],{type:'audio/wav'});
};
const GEN={
pink:()=>{
const n=SR*12,o=new Float32Array(n);
let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
for(let i=0;i<n;i++){
const w=Math.random()*2-1;
b0=.99886*b0+w*.0555179;
b1=.99332*b1+w*.0750759;
b2=.969*b2+w*.153852;
b3=.8665*b3+w*.3104856;
b4=.55*b4+w*.5329522;
b5=-.7616*b5-w*.016898;
o[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.05;
b6=w*.115926;
}
return[o,o];
},
sweep:()=>{
const n=SR*10,T=n/SR,o=new Float32Array(n);
for(let i=0;i<n;i++)o[i]=.3*Math.sin(2*PI*20*T/Math.log(1e3)*(Math.exp(i/n*Math.log(1e3))-1));
return[o,o];
},
tone:()=>{
const n=SR*6,o=new Float32Array(n);
for(let i=0;i<n;i++)o[i]=.3*Math.sin(2*PI*1e3*i/SR);
return[o,new Float32Array(n)];
}
};
const setSrc=k=>{
st.src=k;
$('#cmpHint').textContent=HINT[k];
if(k=='file'){
$('#cmpFile').click();
return;
}
au.src=URL.createObjectURL(wav(GEN[k]()));
};
const load=p=>{
if(!cache.has(p))cache.set(p,(async()=>{
const r=await fetch(p);
if(!r.ok)throw Error(p+' → HTTP '+r.status);
if(p.endsWith('.vdc'))return await r.text();
dec=dec||new OfflineAudioContext(1,1,SR);
return await dec.decodeAudioData(await r.arrayBuffer());
})());
return cache.get(p);
};
const sec=t=>{
const m=/^SR_48000:(.+)$/m.exec(t),a=m?m[1].split(',').map(Number):[],s=[];
for(let i=0;i+4<a.length;i+=5)s.push(a.slice(i,i+5));
return s;
};
const hirs=async p=>{
if(icache.has(p))return icache.get(p);
const u=await load(p),a=u.getChannelData(0),b=u.numberOfChannels==4?u.getChannelData(2):null,n=u.length,o=[];
for(const f of F){
const w=2*PI*f/SR,wr=Math.cos(w),wi=-Math.sin(w);
let cr=1,ci=0,re=0,im=0;
for(let i=0;i<n;i++){
const h=b?a[i]+b[i]:a[i];
re+=h*cr;
im+=h*ci;
const t=cr*wr-ci*wi;
ci=cr*wi+ci*wr;
cr=t;
}
o.push([re,im]);
}
icache.set(p,o);
return o;
};
const hddc=(S,f)=>{
const w=2*PI*f/SR,c1=Math.cos(w),s1=-Math.sin(w),c2=Math.cos(2*w),s2=-Math.sin(2*w);
let hr=1,hi=0;
for(const[b0,b1,b2,a1,a2]of S){
const nr=b0+b1*c1+b2*c2,ni=b1*s1+b2*s2,dr=1-a1*c1-a2*c2,di=-a1*s1-a2*s2,q=dr*dr+di*di,tr=(nr*dr+ni*di)/q,ti=(ni*dr-nr*di)/q,t=hr*tr-hi*ti;
hi=hr*ti+hi*tr;
hr=t;
}
return[hr,hi];
};
const resp=async s=>{
const k=s.vdc+'|'+s.irs;
if(rcache.has(k))return rcache.get(k);
const S=s.vdc?sec(await load(s.vdc)):[],I=s.irs?await hirs(s.irs):null;
const o=F.map((f,i)=>{
let[r,m]=I?I[i]:[1,0];
if(S.length){
const[x,y]=hddc(S,f);
[r,m]=[r*x-m*y,r*y+m*x];
}
return Math.hypot(r,m);
});
rcache.set(k,o);
return o;
};
const lvl=m=>10*Math.log10(m.reduce((a,x)=>a+x*x,0)/m.length);
const gains=async()=>{
const[a,b]=await Promise.all([resp(st.A),resp(st.B)]),la=lvl(a),lb=lvl(b),m=Math.min(la,lb);
return st.lm?{A:m-la,B:m-lb}:{A:0,B:0};
};
const apply=async()=>{
const g=await gains();
$('#cmpLA').textContent=`Level ${g.A.toFixed(1)} dB`;
$('#cmpLB').textContent=`Level ${g.B.toFixed(1)} dB`;
$$('#cmpAB [data-act]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.act==st.act));
if(!ctx)return;
const t=ctx.currentTime;
for(const s of['A','B'])xf[s].gain.setTargetAtTime(s==st.act?10**(g[s]/20):0,t,.008);
};
const $$=s=>[...root.querySelectorAll(s)];
const rebuild=async s=>{
const v=++rb[s];
const[vt,ib]=await Promise.all([st[s].vdc?load(st[s].vdc):'',st[s].irs?load(st[s].irs):null]);
if(v!=rb[s]||!ctx)return;
if(ch[s]){
try{src.disconnect(ch[s][0]);}catch(e){}
ch[s].forEach(n=>{try{n.disconnect();}catch(e){}});
}
const n=[ctx.createGain()];
let last=n[0];
for(const[b0,b1,b2,a1,a2]of sec(vt)){
const f=ctx.createIIRFilter([b0,b1,b2],[1,-a1,-a2]);
last.connect(f);
last=f;
n.push(f);
}
if(ib){
const c=ctx.createConvolver();
c.normalize=false;
c.buffer=ib;
last.connect(c);
last=c;
n.push(c);
}
last.connect(xf[s]);
src.connect(n[0]);
ch[s]=n;
};
const init=async()=>{
if(ctx)return;
try{
ctx=new AC({sampleRate:SR,latencyHint:'playback'});
}catch(e){
ctx=new AC();
}
src=ctx.createMediaElementSource(au);
master=ctx.createGain();
master.gain.value=.5;
const cp=ctx.createDynamicsCompressor();
cp.threshold.value=-6;
cp.knee.value=0;
cp.ratio.value=20;
cp.attack.value=.002;
cp.release.value=.1;
master.connect(cp);
cp.connect(ctx.destination);
for(const s of['A','B']){
xf[s]=ctx.createGain();
xf[s].gain.value=0;
xf[s].connect(master);
}
};
const go=async()=>{
try{
await init();
await ctx.resume();
if(ctx.sampleRate!=SR)msg(`Audio context runs at ${ctx.sampleRate} Hz. IRS timing is shifted.`,1);
await Promise.all([rebuild('A'),rebuild('B')]);
await apply();
}catch(e){
msg(e.message,1);
}
};
const plot=async()=>{
const[a,b]=await Promise.all([resp(st.A),resp(st.B)]),W=640,H=240,L=38,T=10,B=22,pw=W-L-6,ph=H-T-B,db=m=>m.map(x=>20*Math.log10(Math.max(x,1e-6))),da=db(a),dd=db(b),all=[...da,...dd,0],hi=Math.ceil(Math.max(...all)/6)*6+6,lo=Math.max(-60,Math.min(Math.floor(Math.min(...all)/6)*6-6,hi-24)),X=f=>L+pw*Math.log(f/20)/Math.log(1e3),Y=v=>T+ph*(hi-Math.max(lo,v))/(hi-lo),ln=(d,c)=>`<polyline class="${c}" points="${F.map((f,i)=>X(f).toFixed(1)+','+Y(d[i]).toFixed(1)).join(' ')}"/>`;
let g='';
for(let v=lo;v<=hi;v+=6)g+=`<line class="gl" x1="${L}" x2="${W-6}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${L-6}" y="${(Y(v)+3).toFixed(1)}" text-anchor="end">${v}</text>`;
for(const f of[50,100,200,500,1e3,2e3,5e3,1e4])g+=`<line class="gl" x1="${X(f).toFixed(1)}" x2="${X(f).toFixed(1)}" y1="${T}" y2="${H-B}"/><text x="${X(f).toFixed(1)}" y="${H-6}" text-anchor="middle">${f>=1e3?f/1e3+'k':f}</text>`;
$('#cmpPlot').innerHTML=g+ln(da,'pa')+ln(dd,'pb');
};
const refresh=async()=>{
try{
await Promise.all([plot(),apply()]);
msg('');
}catch(e){
msg(e.message,1);
}
};
const pv=(k,n)=>{
let s=0;
for(let i=k;i<=n;i++){
let c=1;
for(let j=0;j<i;j++)c=c*(n-j)/(j+1);
s+=c;
}
return s/2**n;
};
const abxUi=()=>{
const a=st.abx,on=!!a;
$('#cmpAbx').hidden=!on;
$('#cmpAB').hidden=on;
$('#cmpAbxBtn').textContent=on?'Exit blind test':'Blind A/B/X';
if(!on)return;
const d=a.n>=TRIALS;
$('#cmpAbxT').textContent=d?`Result ${a.ok}/${TRIALS} correct · p = ${pv(a.ok,TRIALS).toFixed(3)}. A p value of 0.05 or lower suggests an audible difference.`:`Trial ${a.n+1}/${TRIALS} · ${a.ok} correct`;
$$('#cmpAbx [data-ans]').forEach(b=>b.disabled=d);
};
root.addEventListener('click',e=>{
const t=e.target.closest('button');
if(!t)return;
if(t.dataset.dev){
st.dev=t.dataset.dev;
$$('[data-dev]').forEach(b=>b.setAttribute('aria-pressed',b==t));
defaults();
panels();
Promise.all([rebuild('A'),rebuild('B')]).then(refresh,x=>msg(x.message,1));
}else if(t.dataset.act){
st.act=t.dataset.act;
apply();
}else if(t.id=='cmpAbxBtn'){
st.abx=st.abx?null:{n:0,ok:0,x:Math.random()<.5?'A':'B'};
st.act='A';
abxUi();
apply();
}else if(t.dataset.play){
st.act=t.dataset.play=='X'?st.abx.x:t.dataset.play;
apply();
}else if(t.dataset.ans){
const a=st.abx;
if(a.n>=TRIALS)return;
if(t.dataset.ans==a.x)a.ok++;
a.n++;
a.x=Math.random()<.5?'A':'B';
st.act='A';
abxUi();
apply();
}
});
root.addEventListener('change',e=>{
const s=e.target;
if(s.dataset.s){
st[s.dataset.s][s.dataset.t]=s.value;
rebuild(s.dataset.s).then(refresh,x=>msg(x.message,1));
}else if(s.id=='cmpSrc')setSrc(s.value);
else if(s.id=='cmpLm'){
st.lm=s.checked;
apply();
}else if(s.id=='cmpFile'&&s.files[0]){
au.src=URL.createObjectURL(s.files[0]);
}
});
if(playBtn){
  playBtn.addEventListener('click', () => {
    if (au.paused) {
      au.play().then(() => {
        if (playTxt) playTxt.textContent = 'Pause Audition';
        playBtn.classList.add('active');
      }).catch(e => msg(e.message, 1));
    } else {
      au.pause();
      if (playTxt) playTxt.textContent = 'Start Audition';
      playBtn.classList.remove('active');
    }
  });
}
au.addEventListener('play', () => {
  if (playTxt) playTxt.textContent = 'Pause Audition';
  if (playBtn) playBtn.classList.add('active');
  go();
});
au.addEventListener('pause', () => {
  if (playTxt) playTxt.textContent = 'Start Audition';
  if (playBtn) playBtn.classList.remove('active');
});
defaults();
panels();
setSrc('pink');
refresh();
})();
