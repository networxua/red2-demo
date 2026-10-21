/* RED2 · Launch Control — motion & UI */
(()=>{
const d=document,H=d.documentElement,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOB=()=>innerWidth<=900;
const TOUCH=matchMedia('(hover:none)').matches;
const G=window.gsap,ST=window.ScrollTrigger;
const intro=$('.intro');
if(!G||!ST){H.classList.remove('js');intro&&intro.remove();initUI(null);return;}
G.registerPlugin(ST);ST.config({ignoreMobileResize:true});
let lenis=null;
if(!RM&&!TOUCH&&window.Lenis){lenis=new Lenis({lerp:.11,wheelMultiplier:1});lenis.on('scroll',ST.update);G.ticker.add(t=>lenis.raf(t*1000));G.ticker.lagSmoothing(0);}
const fmt=(n,dec=0)=>{const s=dec?n.toFixed(dec).replace('.',','):Math.round(n).toString();return dec?s:s.replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f');};

/* ---------- split words ---------- */
function split(el){
  const walk=node=>{[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){const parts=n.textContent.split(/(\s+)/);const f=d.createDocumentFragment();
      parts.forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.appendChild(d.createTextNode(' '));return;}const w=d.createElement('span');w.className='w';const i=d.createElement('span');i.textContent=p;w.appendChild(i);f.appendChild(w);});
      n.replaceWith(f);}
    else if(n.nodeType===1&&n.tagName!=='BR'&&!n.classList.contains('w'))walk(n);});};
  walk(el);return $$('.w>span',el);
}

/* ---------- videos ---------- */
const vids=$$('video');
function loadV(v){if(v.dataset.src&&!v.src){v.src=v.dataset.src;}}
function vidInit(){
  $$('.reel__p').forEach((p,i)=>{const v=$('video',p);if(!v)return;if(i>0&&MOB())return;loadV(v);v.play&&v.play().catch(()=>{});});
  const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){loadV(v);v.play().catch(()=>{});}else if(!v.closest('.reel__p'))v.pause();}),{rootMargin:'200px'});
  $$('video[data-inview]').forEach(v=>io.observe(v));
  if(RM)vids.forEach(v=>{v.removeAttribute('autoplay');v.pause&&v.pause();});
}

/* ---------- intro (launch lights) ---------- */
function runIntro(done){
  if(!intro){done();return;}
  const pt=H.classList.contains('pt-in');
  try{sessionStorage.removeItem('r2pt');sessionStorage.r2i=1;}catch(e){}
  if(H.classList.contains('no-intro')){intro.remove();done();return;}
  const rows=$$('.intro__row',intro),rt=$('.intro__rt',intro);
  const tl=G.timeline({onComplete:()=>intro.remove()});
  if(pt){
    tl.set($$('.bulb',intro),{className:'bulb go'}).to(intro,{clipPath:'inset(0 0 100% 0)',duration:.7,ease:'power3.inOut',delay:.12},0).add(done,.35);
    return;
  }
  const o={t:0};
  tl.to(o,{t:0.412,duration:1.1,ease:'none',onUpdate:()=>rt.textContent='R/T '+o.t.toFixed(3)},0);
  rows.slice(0,3).forEach((r,i)=>tl.add(()=>$$('.bulb',r).forEach(b=>b.classList.add('on')),.18+i*.24));
  tl.add(()=>{rows.slice(0,3).forEach(r=>$$('.bulb',r).forEach(b=>b.classList.remove('on')));$$('.bulb',rows[3]).forEach(b=>b.classList.add('go'));},.18+3*.24);
  tl.to(intro,{clipPath:'inset(0 0 100% 0)',duration:.9,ease:'expo.inOut'},1.15).add(done,1.3);
}

/* ---------- hero entrance + scroll ---------- */
function heroIn(){
  const lines=$$('[data-hero-title] .ln>span'),side=$('[data-hero-side]'),lanes=$('[data-hero-lanes]'),panels=$$('.reel__p, .ph__v');
  const tb=$$('.tree .bulb');
  if(RM){return;}
  const tl=G.timeline();
  tl.from(panels,{scale:1.18,duration:1.6,ease:'expo.out',stagger:.08},0)
    .from(lines,{yPercent:110,duration:1.1,ease:'expo.out',stagger:.09},.05);
  if(side)tl.from(side.children,{y:30,opacity:0,duration:.9,ease:'power3.out',stagger:.08},.35);
  if(lanes)tl.from(lanes.children,{yPercent:100,duration:.9,ease:'expo.out',stagger:.08},.45);
  tb.forEach((b,i)=>tl.add(()=>b.classList.add(i<3?'on':'go'),.3+i*.16));
  tl.add(()=>tb.slice(0,3).forEach(b=>{b.classList.remove('on');b.classList.add('go')}),.3+4*.16);
  $$('.ph [data-count]').forEach(el=>count(el,1.6,.5));
}
function heroScroll(){
  if(RM)return;
  const hero=$('.hero');
  if(hero){
    const tl=G.timeline({scrollTrigger:{trigger:hero,start:'top top',end:'+=70%',scrub:.6,pin:true,anticipatePin:1,refreshPriority:3}});
    if(MOB()){
      const p=$('.reel__p');
      tl.to(p,{clipPath:'inset(9% 6% 26% 6% round 18px)',ease:'none'},0)
        .to($('video',p),{scale:1.2,ease:'none'},0)
        .to('[data-hero-title]',{yPercent:-40,ease:'none'},0)
        .to('[data-hero-side]',{opacity:0,y:-30,ease:'none'},0)
        .to('.tree, .reel__tag',{opacity:0,ease:'none'},0);
    }else{
      const ps=$$('.reel__p');
      tl.to(ps[0],{yPercent:-10,ease:'none'},0).to(ps[1],{yPercent:8,ease:'none'},0).to(ps[2],{yPercent:-18,ease:'none'},0)
        .to('.reel',{gap:18,paddingInline:18,ease:'none'},0)
        .to('[data-hero-title]',{yPercent:-30,ease:'none'},0)
        .to('[data-hero-side]',{opacity:0,y:-40,ease:'none'},0);
    }
  }
  const ph=$('.ph');
  if(ph){
    G.to($('.ph__v video',ph),{scale:1.25,ease:'none',scrollTrigger:{trigger:ph,start:'top top',end:'bottom top',scrub:true}});
    G.to($('[data-hero-title]',ph),{yPercent:-25,ease:'none',scrollTrigger:{trigger:ph,start:'top top',end:'bottom top',scrub:true}});
  }
}

/* ---------- counters ---------- */
function count(el,dur=1.4,delay=0){
  const to=parseFloat(el.dataset.count),dec=+(el.dataset.dec||0),from=parseFloat(el.dataset.from||0);
  if(RM){el.textContent=fmt(to,dec);return;}
  const o={v:from};el.textContent=fmt(from,dec);
  G.to(o,{v:to,duration:dur,delay,ease:'power2.out',onUpdate:()=>el.textContent=fmt(o.v,dec)});
}

/* ---------- reveals ---------- */
function reveals(){
  $$('[data-split]').forEach(el=>{
    const ws=split(el);if(RM)return;
    G.from(ws,{yPercent:115,rotate:4,duration:1,ease:'expo.out',stagger:.035,scrollTrigger:{trigger:el,start:'top 88%'}});
  });
  if(RM)return;
  $$('[data-clip]').forEach(el=>{
    if(el.closest('.ph'))return;
    const inner=el.querySelector(':scope > img, :scope > video, :scope > .media, :scope > div > video, :scope img');
    const st={trigger:el,start:'top 98%',end:'top 35%',scrub:.5};
    G.fromTo(el,{clipPath:'inset(16% 9% 16% 9%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:st});
    if(inner)G.fromTo(inner,{scale:1.35},{scale:1,ease:'none',scrollTrigger:st});
  });
  $$('[data-par]').forEach(el=>{const v=+el.dataset.par||10;
    G.fromTo(el,{yPercent:-v},{yPercent:v,ease:'none',scrollTrigger:{trigger:el.closest('[data-clip]')||el,start:'top bottom',end:'bottom top',scrub:true}});});
  G.set('[data-fade]',{y:36});
  ST.batch('[data-fade]',{start:'top 90%',onEnter:b=>G.to(b,{opacity:1,y:0,duration:.9,ease:'power3.out',stagger:.1,overwrite:true})});
  $$('[data-count]').forEach(el=>{if(el.closest('.ph')||el.closest('[data-champ]'))return;el.textContent=fmt(+el.dataset.from||0,+(el.dataset.dec||0));ST.create({trigger:el,start:'top 92%',once:true,onEnter:()=>count(el)});});
}
if(RM){ /* show everything */ }

/* ---------- marquee ---------- */
function marquees(){
  $$('[data-mq]').forEach(m=>{
    const t=$('.mq__t',m);t.innerHTML+=t.innerHTML;
    if(RM)return;
    const dir=+(m.dataset.dir||1);
    const tw=G.fromTo(t,{xPercent:dir>0?0:-50},{xPercent:dir>0?-50:0,duration:MOB()?16:28,ease:'none',repeat:-1});
    let cur=1;
    ST.create({trigger:m,start:'top bottom',end:'bottom top',onUpdate:s=>{const v=s.getVelocity();const k=G.utils.clamp(-6,6,v/300);const target=(s.direction>0?1:-1)*(1+Math.abs(k));
      if(Math.sign(target)!==Math.sign(cur)||Math.abs(target)>1.2){cur=target;G.to(tw,{timeScale:target,duration:.3,overwrite:true});G.to(tw,{timeScale:Math.sign(target),duration:1.2,delay:.3});}}});
  });
}

/* ---------- rail ---------- */
function rails(){
  const r=$('[data-rail]');if(!r)return;
  const bar=$('.railbar i'),rc=$('.js-rc'),n=r.children.length;
  if(!MOB()&&!RM){
    const dist=()=>r.scrollWidth-innerWidth;
    const pinEl=r.closest('.rail-sec');
    G.to(r,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:pinEl,start:'top top',end:()=>'+='+dist(),scrub:.6,pin:true,anticipatePin:1,invalidateOnRefresh:true,refreshPriority:2,onUpdate:s=>bar&&G.set(bar,{scaleX:s.progress})}});
  }else{
    const upd=()=>{const m=r.scrollWidth-r.clientWidth;const p=m>0?r.scrollLeft/m:0;bar&&G.set(bar,{scaleX:Math.max(.04,p)});if(rc){const i=Math.min(n,Math.round(p*(n-1))+1);rc.textContent=String(i).padStart(2,'0')+' / '+String(n).padStart(2,'0');}};
    r.addEventListener('scroll',upd,{passive:true});upd();
    if(!RM){
      G.from(r.children,{x:120,opacity:0,duration:1,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:r,start:'top 85%'}});
      r.scrollLeft=0;
      ST.create({trigger:r,start:'top 60%',once:true,onEnter:()=>{if(r.scrollLeft>4)return;G.to(r.children,{x:-70,duration:.55,ease:'power2.inOut',delay:1.7,yoyo:true,repeat:1,stagger:.02});}});
    }
  }
}

/* ---------- champion ---------- */
function champ(){
  const c=$('[data-champ]');if(!c)return;
  const img=$('[data-champ-img]',c),slip=$('[data-slip]',c),big=$('.champ__big',c);
  const counts=$$('[data-count]',slip||c);
  let fired=false;const fire=()=>{if(fired)return;fired=true;counts.forEach((e,i)=>count(e,1.6,i*.12));const b=$('.champ__big [data-count]',c);b&&count(b,1.2);};
  $$('[data-count]',c).forEach(e=>e.textContent=fmt(+e.dataset.from||0,0));
  if(RM){$$('[data-count]',c).forEach(e=>e.textContent=fmt(+e.dataset.count,0));return;}
  if(!MOB()){
    const tl=G.timeline({scrollTrigger:{trigger:c,start:'top top',end:'+=110%',scrub:.6,pin:$('.champ__pin',c),anticipatePin:1,refreshPriority:1,onEnter:fire}});
    tl.fromTo(img,{scale:1.3},{scale:1,ease:'none'},0)
      .from(big,{xPercent:-12,opacity:.2,ease:'none'},0)
      .fromTo(slip,{clipPath:'inset(0 0 100% 0)',y:60},{clipPath:'inset(0 0 0% 0)',y:0,ease:'none'},.1)
      .from($$('.slip__r',slip),{x:-30,opacity:0,stagger:.05,ease:'none'},.2);
  }else{
    G.fromTo(img,{scale:1.35},{scale:1,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'top top',scrub:true}});
    G.fromTo(big,{scale:.55,opacity:0,transformOrigin:'0% 100%'},{scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:big,start:'top 95%',end:'top 50%',scrub:.5}});
    G.fromTo(slip,{clipPath:'inset(0 0 100% 0)',rotate:-6},{clipPath:'inset(0 0 0% 0)',rotate:-1.4,ease:'none',scrollTrigger:{trigger:slip,start:'top 92%',end:'top 35%',scrub:.5}});
    ST.create({trigger:big,start:'top 80%',once:true,onEnter:fire});
  }
}

/* ---------- header / progress / distance / dock ---------- */
function chrome(){
  const hdr=$('.hdr'),dist=$('.hdr__dist span'),prog=$('.prog'),dock=$('.dock');
  let last=0;
  const first=$('main > section');
  const onS=()=>{const y=scrollY;const hh=first?first.offsetHeight*(first.classList.contains('hero')?1.6:1)-80:300;
    hdr.classList.toggle('is-solid',y>hh);
    const hide=y>last&&y>400&&!H.classList.contains('menu-open');hdr.classList.toggle('is-hidden',hide);H.classList.toggle('hdr-on',!hide);last=y;
    dock&&dock.classList.toggle('on',y>innerHeight*.7&&y<d.body.scrollHeight-innerHeight*1.4);};
  addEventListener('scroll',onS,{passive:true});onS();
  if(!RM)G.to(prog,{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});
  let curL='START';
  const setL=t=>{if(t===curL||!dist)return;curL=t;if(RM){dist.textContent=t;return;}G.to(dist,{yPercent:-120,duration:.18,ease:'power2.in',onComplete:()=>{dist.textContent=t;G.fromTo(dist,{yPercent:120},{yPercent:0,duration:.3,ease:'power3.out'});}});};
  $$('[data-dist]').forEach(s=>ST.create({trigger:s,start:'top 50%',end:'bottom 50%',onToggle:e=>e.isActive&&setL(s.dataset.dist)}));
}

/* ---------- mobile menu ---------- */
function menu(){
  const b=$('.burger'),m=$('.mnav');if(!b)return;let open=false;
  const set=o=>{open=o;H.classList.toggle('menu-open',o);lenis&&(o?lenis.stop():lenis.start());
    if(o){G.set(m,{visibility:'visible'});G.to(m,{clipPath:'inset(0 0 0% 0)',duration:RM?0:.7,ease:'expo.inOut'});G.fromTo($$('a.big',m),{yPercent:60,opacity:0},{yPercent:0,opacity:1,stagger:.06,duration:RM?0:.8,ease:'expo.out',delay:.2});d.body.style.overflow='hidden';}
    else{G.to(m,{clipPath:'inset(0 0 100% 0)',duration:RM?0:.5,ease:'expo.inOut',onComplete:()=>G.set(m,{visibility:'hidden'})});d.body.style.overflow='';}};
  b.addEventListener('click',()=>set(!open));
  $$('a',m).forEach(a=>a.addEventListener('click',()=>set(false)));
}

/* ---------- service index float ---------- */
function idx(){
  const fl=$('.float');if(!fl||TOUCH||RM)return;const im=$('img',fl);
  const qx=G.quickTo(fl,'x',{duration:.5,ease:'power3'}),qy=G.quickTo(fl,'y',{duration:.5,ease:'power3'});
  addEventListener('mousemove',e=>{qx(e.clientX);qy(e.clientY);});
  $$('[data-img]').forEach(r=>{r.addEventListener('mouseenter',()=>{im.src=r.dataset.img;G.to(fl,{opacity:1,scale:1,rotate:-4,duration:.5,ease:'expo.out'});});
    r.addEventListener('mouseleave',()=>G.to(fl,{opacity:0,scale:.6,rotate:0,duration:.4}));});
}

/* ---------- page transitions ---------- */
function transitions(){
  $$('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!h||h.startsWith('#')||a.target==='_blank'||/^(https?:|tel:|mailto:)/.test(h)||h.includes('#'))return;
    a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||RM)return;e.preventDefault();
      try{sessionStorage.r2pt=1}catch(_){}
      const o=d.createElement('div');o.className='intro';o.innerHTML='<div class="intro__tree"><div class="intro__row"><i class="bulb"></i><i class="bulb"></i></div><div class="intro__row"><i class="bulb"></i><i class="bulb"></i></div><div class="intro__row"><i class="bulb"></i><i class="bulb"></i></div><div class="intro__row"><i class="bulb"></i><i class="bulb"></i></div></div>';d.body.appendChild(o);
      const rows=$$('.intro__row',o);
      G.timeline({onComplete:()=>location.href=h}).fromTo(o,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:.55,ease:'expo.inOut'})
       .add(()=>rows.slice(0,3).forEach(r=>$$('.bulb',r).forEach(b=>b.classList.add('on'))),'-=.1').add(()=>$$('.bulb',rows[3]).forEach(b=>b.classList.add('go')),'+=.12');});});
  addEventListener('pageshow',e=>{if(e.persisted){$$('body > .intro').forEach(x=>x.remove());}});
}
function anchors(){
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();lenis?lenis.scrollTo(t,{offset:-70}):t.scrollIntoView({behavior:RM?'auto':'smooth'});}));
}

/* ---------- start ---------- */
vidInit();
initUI(lenis);
heroScroll();reveals();marquees();rails();champ();chrome();menu();idx();transitions();anchors();ST.sort&&ST.sort();ST.refresh();
runIntro(()=>{heroIn();ST.refresh();});
addEventListener('load',()=>ST.refresh());
})();

/* ================= UI (works without GSAP) ================= */
function initUI(lenis){
const d=document,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const G=window.gsap,RM=matchMedia('(prefers-reduced-motion: reduce)').matches,TOUCH=matchMedia('(hover:none)').matches;
const CARS=window.CARS||[];const byId=id=>CARS.find(c=>c.id==id);
const eur=n=>n.toLocaleString('ru-RU').replace(/\s/g,'\u202f')+' €';
/* card galleries */
$$('.car').forEach(card=>{
  const imgs=$$('.car__m img',card),segs=$$('.car__segs i',card);let cur=0;
  const show=i=>{cur=(i+imgs.length)%imgs.length;imgs.forEach((im,k)=>im.classList.toggle('on',k===cur));segs.forEach((s,k)=>s.classList.toggle('on',k===cur));};
  $$('.car__zones span',card).forEach((z,i)=>z.addEventListener('mouseenter',()=>show(i)));
  card.addEventListener('mouseleave',()=>show(0));
  $('.car__m',card).addEventListener('click',e=>{if(TOUCH||innerWidth<=900){e.stopPropagation();show(cur+1);}});
  card.addEventListener('click',()=>openSheet(card.dataset.id));
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openSheet(card.dataset.id);}});
});
/* sheet */
const sh=$('.sheet');let lastFocus=null;
function openSheet(id){
  const c=byId(id);if(!c||!sh)return;lastFocus=d.activeElement;
  const pics=[...(c.big||[]),...c.img.filter((_,i)=>i!==0&&i!==2)];
  $('.sheet__track',sh).innerHTML=pics.map((u,i)=>`<img src="${u}" alt="${c.brand} ${c.model} — фото ${i+1}" ${i?'loading="lazy"':''}>`).join('');
  $('.sheet__dots',sh).innerHTML=pics.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('');
  $('h3 small',sh).textContent=c.brand;$('h3 .t',sh).textContent=c.model+(c.trim?' · '+c.trim:'');
  $('.sheet__price',sh).textContent=eur(c.price);
  const sp=[['Год',c.year],['Пробег',c.km.toLocaleString('ru-RU')+' км'],['Мощность',c.cv+' л.с.'],['Топливо',c.fuel],['Кузов',c.body],['Цвет',c.color]];
  $('.specs',sh).innerHTML=sp.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('');
  $('.js-wa',sh).href='https://wa.me/34699589358?text='+encodeURIComponent(`Здравствуйте! Интересует ${c.brand} ${c.model} ${c.year}, ${eur(c.price)}. Он ещё в наличии?`);
  $('.js-src',sh).href=c.url;
  sh.classList.add('open');sh.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';lenis&&lenis.stop();
  $('.sheet__track',sh).scrollLeft=0;setTimeout(()=>$('.sheet__x',sh).focus(),50);
  if(G&&!RM)G.from($$('.specs div, .sheet__i h3, .sheet__price',sh),{y:24,opacity:0,stagger:.04,duration:.7,ease:'power3.out',delay:.25});
}
function closeSheet(){if(!sh)return;sh.classList.remove('open');sh.setAttribute('aria-hidden','true');d.body.style.overflow='';lenis&&lenis.start();lastFocus&&lastFocus.focus&&lastFocus.focus();}
if(sh){
  $('.sheet__x',sh).addEventListener('click',closeSheet);$('.sheet__bg',sh).addEventListener('click',closeSheet);
  d.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();});
  const tr=$('.sheet__track',sh);
  tr.addEventListener('scroll',()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);$$('.sheet__dots i',sh).forEach((x,k)=>x.classList.toggle('on',k===i));},{passive:true});
  $$('.sheet__nav button',sh).forEach(b=>b.addEventListener('click',()=>tr.scrollBy({left:tr.clientWidth*+b.dataset.d,behavior:'smooth'})));
}
/* catalog filter/sort */
const grid=$('[data-grid]');
if(grid){
  const cards=$$('.car',grid),cnt=$('.js-cnt');let f='*';
  const relayout=()=>{const vis=cards.filter(c=>!c.classList.contains('hide'));cards.forEach(c=>c.classList.remove('xl'));vis.forEach((c,i)=>{if(vis.length>3&&(i===0||i===7))c.classList.add('xl');});
    cnt&&(cnt.textContent=vis.length+' авто');
    if(G&&!RM)G.fromTo(vis,{y:40,opacity:0},{y:0,opacity:1,duration:.7,stagger:.05,ease:'power3.out',clearProps:'transform,opacity'});
    window.ScrollTrigger&&ScrollTrigger.refresh();};
  $$('.chip').forEach(ch=>ch.addEventListener('click',()=>{$$('.chip').forEach(x=>x.classList.toggle('on',x===ch));f=ch.dataset.f;cards.forEach(c=>c.classList.toggle('hide',f!=='*'&&c.dataset.brand!==f));relayout();}));
  const orig=cards.slice();
  $('.sort').addEventListener('change',e=>{const v=e.target.value;let a=orig.slice();
    if(v==='pd')a.sort((x,y)=>y.dataset.price-x.dataset.price);if(v==='pa')a.sort((x,y)=>x.dataset.price-y.dataset.price);if(v==='y')a.sort((x,y)=>y.dataset.year-x.dataset.year);if(v==='cv')a.sort((x,y)=>y.dataset.cv-x.dataset.cv);
    a.forEach(c=>grid.appendChild(c));relayout();});
}
/* accordion */
$$('[data-acc] .acc__i').forEach(it=>{const h=$('.acc__h',it),b=$('.acc__b',it);
  const set=o=>{it.classList.toggle('open',o);h.setAttribute('aria-expanded',o);if(G&&!RM){G.to(b,{height:o?'auto':0,duration:.6,ease:'expo.inOut',onComplete:()=>window.ScrollTrigger&&ScrollTrigger.refresh()});if(o)G.from($$('li',b),{x:-20,opacity:0,stagger:.03,duration:.5,delay:.15,ease:'power3.out'});}else b.style.height=o?'auto':'0';};
  h.addEventListener('click',()=>set(!it.classList.contains('open')));it._set=set;});
const hs=location.hash&&$(location.hash);if(hs&&hs._set){hs._set(true);}
else{const f0=$('[data-acc] .acc__i');f0&&f0._set&&f0._set(true);}
/* booking */
const form=$('[data-form]');
if(form){
  const box=$('.js-slots',form),days=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];let t=new Date(),out=[];
  for(let i=1;out.length<6&&i<14;i++){const dt=new Date(t.getTime()+i*864e5);if(dt.getDay()===0)continue;const lbl=(i===1?'Завтра':days[dt.getDay()]+' '+dt.getDate());const times=dt.getDay()===6?['10:30','12:00']:['9:30','15:00'];times.forEach(tm=>out.length<6&&out.push(lbl+', '+tm));}
  box.innerHTML=out.map((s,i)=>`<button type="button" class="slot${i?'':' on'}">${s}</button>`).join('');
  $$('.slot',box).forEach(s=>s.addEventListener('click',()=>$$('.slot',box).forEach(x=>x.classList.toggle('on',x===s))));
  form.addEventListener('submit',e=>{e.preventDefault();const P=form.plate,N=form.name,T=form.tel;let ok=true;
    [[P,P.value.replace(/\s/g,'').length>=4],[N,N.value.trim().length>=2],[T,T.value.replace(/\D/g,'').length>=9]].forEach(([el,v])=>{el.closest('.fl').classList.toggle('err',!v);if(!v)ok=false;});
    if(!ok)return;const no='R2-'+String(Date.now()).slice(-4);$('.js-ticket',form).textContent='№ '+no;
    $('.form__ok',form).textContent=`${N.value.trim()}, заявка ${no} принята: ${form.svc.value}, ${$('.slot.on',box).textContent}. Менеджер подтвердит в WhatsApp.`;form.classList.add('done');});
}
}
