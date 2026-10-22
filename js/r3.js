/* RED2 v3 — catalog, car page, service funnel, booking */
(()=>{
const d=document,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const G=window.gsap,ST=window.ScrollTrigger,RM=matchMedia('(prefers-reduced-motion: reduce)').matches,TOUCH=matchMedia('(hover:none)').matches;
const MOB=()=>innerWidth<=900;
const CARS=window.CARS||[];
const eur=n=>Math.round(n).toLocaleString('ru-RU').replace(/\s/g,'\u202f')+' €';
const WA_S='https://wa.me/34699589358',WA='https://wa.me/34681997777';
const openWA=(num,txt)=>window.open(num+'?text='+encodeURIComponent(txt),'_blank','noopener');
const refresh=()=>ST&&ST.refresh();

/* ---------- car cards: swipe gallery ---------- */
function cardInit(card){
  if(card._ok)return;card._ok=1;
  const tr=$('.car__track',card);if(!tr)return;
  const segs=$$('.car__segs i',card),cn=$('.car__cnt',card),n=segs.length;
  const upd=()=>{const i=Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));segs.forEach((s,k)=>s.classList.toggle('on',k===i));cn&&(cn.textContent=(i+1)+' / '+n);};
  tr.addEventListener('scroll',upd,{passive:true});
  $$('.car__zones span',card).forEach((z,i)=>z.addEventListener('mouseenter',()=>{tr.scrollTo({left:i*tr.clientWidth,behavior:'instant'});upd();}));
  card.addEventListener('mouseleave',()=>{tr.scrollTo({left:0,behavior:'instant'});upd();});
}
$$('.car').forEach(cardInit);

/* ---------- catalog ---------- */
const grid=$('[data-grid]');
if(grid){
  const cards=$$('.car',grid),orig=cards.slice(),cnt=$('.js-cnt'),tags=$('.js-tags'),empty=$('.js-empty'),fn=$('.js-fn');
  const F={b:new Set(),body:new Set(),fuel:new Set(),p:new Set(),y:new Set()};
  const LBL={b:'',body:'',fuel:'',p:'',y:''};
  const match=c=>{const ds=c.dataset;
    if(F.b.size&&!F.b.has(ds.brand))return false;
    if(F.body.size&&!F.body.has(ds.body))return false;
    if(F.fuel.size&&!F.fuel.has(ds.fuel))return false;
    if(F.p.size&&![...F.p].some(r=>{const[a,b]=r.split('-').map(Number);return +ds.price>=a&&+ds.price<b;}))return false;
    if(F.y.size&&+ds.year<Math.max(...[...F.y].map(Number)))return false;return true;};
  const count=()=>cards.filter(match).length;
  const syncUI=()=>{
    $$('.fdr .fg').forEach(g=>{const k=g.dataset.g;$$('.chip',g).forEach(ch=>ch.classList.toggle('on',F[k].has(ch.dataset.v)));});
    $$('.js-qchips .chip').forEach(ch=>{const v=ch.dataset.q;ch.classList.toggle('on',v==='*'?F.b.size===0:(F.b.size===1&&F.b.has(v)));});
    const all=[];Object.keys(F).forEach(k=>F[k].forEach(v=>{const ch=$(`.fdr .fg[data-g="${k}"] .chip[data-v="${CSS.escape(v)}"]`);all.push([k,v,ch?ch.childNodes[0].textContent:v]);}));
    tags.innerHTML=all.map(([k,v,t])=>`<button type="button" class="tag" data-k="${k}" data-v="${v}">${t}<i>×</i></button>`).join('')+(all.length?'<button type="button" class="tag tag--clr js-reset">Сбросить всё</button>':'');
    tags.classList.toggle('on',all.length>0);
    fn&&(fn.textContent=all.length?all.length:'');
    $$('.js-fshow').forEach(b=>b.firstChild.textContent='Показать '+count()+' ');
    $$('.js-reset',tags).forEach(b=>b.addEventListener('click',reset));
    $$('.tag[data-k]',tags).forEach(b=>b.addEventListener('click',()=>{F[b.dataset.k].delete(b.dataset.v);apply();}));
  };
  let first=true;
  const apply=()=>{
    const vis=[];cards.forEach(c=>{const m=match(c);c.classList.toggle('hide',!m);if(m)vis.push(c);});
    cards.forEach(c=>c.classList.remove('xl'));vis.forEach((c,i)=>{if(vis.length>4&&(i===0||i===7))c.classList.add('xl');});
    cnt&&(cnt.textContent=vis.length+' авто');empty.hidden=vis.length>0;
    syncUI();
    if(!first&&G&&!RM)G.fromTo(vis,{y:40,opacity:0},{y:0,opacity:1,duration:.6,stagger:.04,ease:'power3.out',clearProps:'transform,opacity'});
    first=false;refresh();
  };
  function reset(){Object.values(F).forEach(s=>s.clear());apply();}
  $$('.js-reset').forEach(b=>b.addEventListener('click',reset));
  $$('.js-qchips .chip').forEach(ch=>ch.addEventListener('click',()=>{const v=ch.dataset.q;F.b.clear();if(v!=='*')F.b.add(v);apply();}));
  $$('.fdr .fg').forEach(g=>{const k=g.dataset.g;$$('.chip',g).forEach(ch=>ch.addEventListener('click',()=>{const v=ch.dataset.v;if(k==='y'){const h=F.y.has(v);F.y.clear();if(!h)F.y.add(v);}else F[k].has(v)?F[k].delete(v):F[k].add(v);apply();}));});
  $('.sort').addEventListener('change',e=>{const v=e.target.value;let a=orig.slice();const n=(c,k)=>+c.dataset[k];
    if(v==='pd')a.sort((x,y)=>n(y,'price')-n(x,'price'));if(v==='pa')a.sort((x,y)=>n(x,'price')-n(y,'price'));if(v==='y')a.sort((x,y)=>n(y,'year')-n(x,'year'));if(v==='km')a.sort((x,y)=>n(x,'km')-n(y,'km'));if(v==='cv')a.sort((x,y)=>n(y,'cv')-n(x,'cv'));
    a.forEach(c=>grid.appendChild(c));cards.splice(0,cards.length,...a);apply();});
  /* drawer */
  const fdr=$('.fdr');let lenisStop=false;
  const setF=o=>{fdr.classList.toggle('open',o);fdr.setAttribute('aria-hidden',!o);d.documentElement.classList.toggle('fdr-on',o);d.body.style.overflow=o?'hidden':'';
    if(o&&G&&!RM)G.fromTo($$('.fg',fdr),{y:24,opacity:0},{y:0,opacity:1,stagger:.05,duration:.6,ease:'power3.out',delay:.15});};
  $$('.js-fopen').forEach(b=>b.addEventListener('click',()=>setF(true)));
  $$('.js-fclose').forEach(b=>b.addEventListener('click',()=>{setF(false);if(b.classList.contains('js-fshow'))$('#grid').scrollIntoView({behavior:RM?'auto':'smooth'});}));
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&fdr.classList.contains('open'))setF(false);});
  /* allow ?brand=Porsche&body=..&max=.. from bot */
  const q=new URLSearchParams(location.search);
  if(q.get('b'))F.b.add(q.get('b'));if(q.get('body'))F.body.add(q.get('body'));if(q.get('fuel'))F.fuel.add(q.get('fuel'));
  if(q.get('max')){const mx=+q.get('max');$$('.fdr .fg[data-g="p"] .chip').forEach(ch=>{const[a]=ch.dataset.v.split('-').map(Number);if(a<mx)F.p.add(ch.dataset.v);});}
  apply();
}

/* sell form (autosalon) */
const sell=$('[data-sell]');
if(sell){$$('.slot',sell).forEach(s=>s.addEventListener('click',()=>$$('.slot',sell).forEach(x=>x.classList.toggle('on',x===s))));
  sell.addEventListener('submit',e=>{e.preventDefault();const m=sell.m.value.trim();sell.m.closest('.fl').classList.toggle('err',m.length<2);if(m.length<2)return;
    openWA(WA_S,`Здравствуйте! ${$('.slot.on',sell).dataset.v}. Моя машина: ${m}${sell.y.value?', '+sell.y.value+' г.':''}${sell.k.value?', '+sell.k.value+' км':''}. Оцените, пожалуйста.`);});}

/* ---------- car page ---------- */
const cg=$('[data-cg]');
if(cg){
  const tr=$('.cg__track',cg),n=$$('.cg__s',cg).length,cn=$('.js-cgn'),bar=$('.cg__bar i',cg),th=$$('.cg__t',cg);
  const idx=()=>Math.round(tr.scrollLeft/Math.max(1,tr.clientWidth));
  const upd=()=>{const i=idx();cn.textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');bar.style.transform=`scaleX(${(i+1)/n})`;th.forEach((t,k)=>t.classList.toggle('on',k===i));const a=th[i];a&&a.parentNode.scrollTo({left:a.offsetLeft-a.parentNode.clientWidth/2+a.clientWidth/2,behavior:'smooth'});};
  tr.addEventListener('scroll',()=>{clearTimeout(tr._t);tr._t=setTimeout(upd,60);},{passive:true});upd();
  const go=i=>tr.scrollTo({left:((i+n)%n)*tr.clientWidth,behavior:RM?'auto':'smooth'});
  $$('.cg__nav button',cg).forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();go(idx()+ +b.dataset.d);}));
  th.forEach(t=>t.addEventListener('click',()=>go(+t.dataset.i)));
  d.addEventListener('keydown',e=>{if(lb.classList.contains('open'))return;if(e.key==='ArrowRight')go(idx()+1);if(e.key==='ArrowLeft')go(idx()-1);});
  /* lightbox */
  const lb=$('.lb'),lt=$('.lb__track',lb),ln=$('.lb__n',lb);
  lt.innerHTML=$$('.cg__s img',cg).map(im=>`<figure><img src="${im.getAttribute('src')}" alt="${im.alt}" loading="lazy"></figure>`).join('');
  const lupd=()=>{const i=Math.round(lt.scrollLeft/Math.max(1,lt.clientWidth));ln.textContent=(i+1)+' / '+n;};
  lt.addEventListener('scroll',lupd,{passive:true});
  const openLB=i=>{lb.classList.add('open');lb.setAttribute('aria-hidden','false');d.body.style.overflow='hidden';requestAnimationFrame(()=>{lt.scrollTo({left:i*lt.clientWidth,behavior:'instant'});lupd();});};
  const closeLB=()=>{lb.classList.remove('open');lb.setAttribute('aria-hidden','true');d.body.style.overflow='';};
  $$('.cg__s',cg).forEach((s,i)=>s.addEventListener('click',()=>openLB(i)));$('.cg__full',cg).addEventListener('click',()=>openLB(idx()));
  $('.lb__x',lb).addEventListener('click',closeLB);d.addEventListener('keydown',e=>{if(!lb.classList.contains('open'))return;if(e.key==='Escape')closeLB();if(e.key==='ArrowRight')lt.scrollBy({left:lt.clientWidth,behavior:'smooth'});if(e.key==='ArrowLeft')lt.scrollBy({left:-lt.clientWidth,behavior:'smooth'});});
  if(G&&!RM){G.from('.cg',{clipPath:'inset(6% 6% 6% 6% round 14px)',duration:1.3,ease:'expo.out',delay:.15});G.from('.cg__s:first-child img',{scale:1.2,duration:1.6,ease:'expo.out',delay:.15});
    G.from($$('.cd__pan > *').filter(x=>!x.matches('[data-hero-title]')),{y:26,opacity:0,stagger:.07,duration:.9,ease:'power3.out',delay:.35});
    G.from('.ss__r',{x:-24,opacity:0,stagger:.05,duration:.6,ease:'power3.out',scrollTrigger:{trigger:'.ss',start:'top 85%'}});
    G.fromTo('.ss',{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0% 0)',ease:'none',scrollTrigger:{trigger:'.ss',start:'top 92%',end:'top 40%',scrub:.5}});}
}
/* finance calculator */
const calc=$('[data-calc]');
if(calc){
  const P=+calc.dataset.price,dp=$('[name=dp]',calc),rt=$('[name=rt]',calc);let m=48;
  const mo=$('.js-mo',calc),wab=$('.js-finwa',calc);let shown=0;
  const run=()=>{const down=P*dp.value/100,L=P-down,r=rt.value/1200;const pm=r?L*r/(1-Math.pow(1+r,-m)):L/m;
    $('.js-dp',calc).textContent=dp.value+'% · '+eur(down);$('.js-rt',calc).textContent=(+rt.value).toFixed(2).replace('.',',');
    $('.js-loan',calc).textContent=eur(L);$('.js-over',calc).textContent=eur(pm*m-L);
    if(G&&!RM){const o={v:shown};G.to(o,{v:pm,duration:.5,ease:'power2.out',onUpdate:()=>mo.textContent=Math.round(o.v).toLocaleString('ru-RU').replace(/\s/g,'\u202f')});}else mo.textContent=Math.round(pm).toLocaleString('ru-RU');shown=pm;
    wab.href=WA_S+'?text='+encodeURIComponent(`Здравствуйте! Хочу расчёт кредита: ${wab.dataset.name}. Взнос ${dp.value}%, срок ${m} мес.`);
    [dp,rt].forEach(x=>x.style.setProperty('--p',((x.value-x.min)/(x.max-x.min)*100)+'%'));};
  [dp,rt].forEach(x=>x.addEventListener('input',run));
  $$('.js-term button',calc).forEach(b=>b.addEventListener('click',()=>{m=+b.dataset.m;$$('.js-term button',calc).forEach(x=>x.classList.toggle('on',x===b));run();}));run();
}
const ti=$('[data-ti]');
if(ti)ti.addEventListener('submit',e=>{e.preventDefault();const m=ti.m.value.trim();ti.m.classList.toggle('err',m.length<2);if(m.length<2)return;
  openWA(WA_S,`Здравствуйте! Интересует ${ti.dataset.name}. Хочу сдать в трейд-ин: ${m}${ti.y.value?', '+ti.y.value+' г.':''}${ti.k.value?', '+ti.k.value+' км':''}.`);});

/* ---------- service: symptom picker ---------- */
const SVC=window.SVC||{};
const rec=$('.js-rec');
function bookFor(name){const f=$('[data-form]');if(!f)return;const s=f.svc;[...s.options].forEach(o=>{if(o.text===name)s.value=o.text;});
  const t=$('#book');t&&t.scrollIntoView({behavior:RM?'auto':'smooth'});f.classList.add('flash');setTimeout(()=>f.classList.remove('flash'),1400);}
if(rec){
  $$('.sym[data-k]').forEach(b=>b.addEventListener('click',()=>{const s=SVC[b.dataset.k];if(!s)return;
    $$('.sym').forEach(x=>x.classList.toggle('on',x===b));
    rec.innerHTML=`<div class="rec__c"><div class="rec__m"><img src="${s.im}" alt=""></div><div class="rec__b"><span class="kicker" style="color:var(--red)"><i></i>Рекомендуем</span><h3 class="disp h-s">${s.t}</h3><p>${s.o}</p><ul>${s.L.map(x=>`<li>${x}</li>`).join('')}</ul><div class="sc__f"><div><span>Срок</span><b>${s.tm}</b></div><div><span>Цена</span><b>${s.pr}</b></div></div><div class="rec__a"><button class="btn btn--red js-recb" type="button">Записаться на это<b>→</b></button><a class="btn btn--ghost" href="#s-${b.dataset.k}">Подробнее<b>↓</b></a></div></div></div>`;
    $('.js-recb',rec).addEventListener('click',()=>bookFor(s.t));
    $$('a[href^="#"]',rec).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$(a.getAttribute('href')).scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});}));
    if(G&&!RM){G.fromTo($('.rec__m img',rec),{scale:1.25,clipPath:'inset(0 100% 0 0)'},{scale:1,clipPath:'inset(0 0% 0 0)',duration:.9,ease:'expo.out'});G.from($$('.rec__b > *',rec),{y:20,opacity:0,stagger:.05,duration:.6,ease:'power3.out'});}
    if(MOB())rec.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
  }));
}
$$('.js-bookit').forEach(b=>b.addEventListener('click',()=>bookFor(b.dataset.svc)));
/* pit steps line */
const pit=$('[data-pit]');
if(pit&&G&&ST&&!RM){
  G.fromTo($('.pit__line i',pit),{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:pit,start:'top 80%',end:'bottom 45%',scrub:.4}});
  $$('.pit__s',pit).forEach((s,i)=>G.fromTo(s,{opacity:.15,y:30},{opacity:1,y:0,ease:'power2.out',scrollTrigger:{trigger:pit,start:`top ${80-i*7}%`,end:`top ${62-i*7}%`,scrub:.4}}));
}
/* gstrip: horizontal drift */
const gs=$('[data-gstrip]');
if(gs&&G&&ST&&!RM)G.fromTo(gs,{xPercent:MOB()?0:4},{xPercent:MOB()?-38:-6,ease:'none',scrollTrigger:{trigger:gs,start:'top bottom',end:'bottom top',scrub:true}});
/* cases rail: on mobile reveal stagger */
const cs=$('[data-rail2]');
if(cs&&G&&!RM)G.from($$('.cs__c',cs),{x:80,opacity:0,stagger:.1,duration:1,ease:'expo.out',scrollTrigger:{trigger:cs,start:'top 85%'}});
/* faq */
$$('.fq').forEach(f=>{const p=$('p',f);f.addEventListener('toggle',()=>{if(f.open&&G&&!RM)G.from(p,{y:-8,opacity:0,duration:.45,ease:'power2.out'});refresh();});});

/* ---------- booking ---------- */
const form=$('[data-form]');
if(form){
  const days=$('.js-days',form),box=$('.js-slots',form),DN=['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],MN=['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
  const now=new Date();const list=[];for(let i=1;list.length<8&&i<16;i++){const dt=new Date(now.getTime()+i*864e5);if(dt.getDay()===0)continue;list.push(dt);}
  days.innerHTML=list.map((dt,i)=>`<button type="button" class="day${i?'':' on'}" data-w="${dt.getDay()}" data-l="${i===0?'Завтра':DN[dt.getDay()]} ${dt.getDate()} ${MN[dt.getMonth()]}"><small>${i===0?'Завтра':DN[dt.getDay()]}</small><b>${dt.getDate()}</b><small>${MN[dt.getMonth()]}</small></button>`).join('');
  const fill=w=>{const t=w==6?['10:00','11:00','12:30']:['9:30','11:00','13:00','15:30','17:00'];box.innerHTML=t.map((s,i)=>`<button type="button" class="slot${i?'':' on'}">${s}</button>`).join('');$$('.slot',box).forEach(s=>s.addEventListener('click',()=>$$('.slot',box).forEach(x=>x.classList.toggle('on',x===s))));};
  $$('.day',days).forEach(b=>b.addEventListener('click',()=>{$$('.day',days).forEach(x=>x.classList.toggle('on',x===b));fill(b.dataset.w);}));fill(list[0].getDay());
  form.addEventListener('submit',e=>{e.preventDefault();const N=form.name,T=form.tel;let ok=true;
    [[N,N.value.trim().length>=2],[T,T.value.replace(/\D/g,'').length>=9]].forEach(([el,v])=>{el.closest('.fl').classList.toggle('err',!v);if(!v)ok=false;});
    if(!ok)return;const no='R2-'+String(Date.now()).slice(-4);$('.js-ticket',form).textContent='№ '+no;
    const when=$('.day.on',days).dataset.l+', '+$('.slot.on',box).textContent;
    const txt=`Здравствуйте! Заявка ${no}: ${form.svc.value}, ${when}.${form.plate.value?' Авто '+form.plate.value.toUpperCase()+'.':''}${form.cm.value?' '+form.cm.value:''} — ${N.value.trim()}, ${T.value}`;
    const ok2=$('.form__ok',form);ok2.innerHTML=`<b>${N.value.trim()}, заявка ${no} принята.</b><br>${form.svc.value} · ${when}. Менеджер подтвердит в WhatsApp.<a class="btn btn--wa btn--red" href="${WA}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">Продублировать в WhatsApp<b>↗</b></a>`;form.classList.add('done');
    if(G&&!RM)G.from(ok2,{y:20,opacity:0,duration:.6,ease:'power3.out'});});
}

/* ---------- open bot from buttons ---------- */
d.addEventListener('click',e=>{const b=e.target.closest('[data-bot]');if(!b)return;e.preventDefault();window.R2BOT&&window.R2BOT.open(b.dataset.bot);});
addEventListener('load',refresh);
})();
