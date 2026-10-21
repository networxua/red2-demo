/* RED2 demo — NetWorX */
(function(){
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const DESK=()=>innerWidth>820;
const fmt=n=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'\u202f');
const ARR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const hasG=!!window.gsap;
if(RM||!hasG) document.documentElement.classList.add('reduced');
if(hasG) gsap.registerPlugin(ScrollTrigger);

/* ---------- Lenis ---------- */
let lenis=null;
if(!RM&&window.Lenis){
  lenis=new Lenis({duration:1.15,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true});
  window.__lenis=lenis;
  if(hasG){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
  else{const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);}
}
const scrollToEl=(el,off=0)=>{ if(!el) return; const y=el.getBoundingClientRect().top+scrollY+off; lenis?lenis.scrollTo(y,{duration:1.4}):scrollTo({top:y,behavior:'smooth'}); };
$$('a[href^="#"],a[href*=".html#"]').forEach(a=>a.addEventListener('click',e=>{
  const u=new URL(a.href,location.href); if(u.pathname!==location.pathname||!u.hash) return;
  const t=$(u.hash); if(!t) return; e.preventDefault(); document.body.classList.remove('menu-open'); scrollToEl(t,-(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr'))||70));
}));

/* ---------- curtain / transitions ---------- */
const bars=$$('.curtain i');
function reveal(){
  document.body.classList.remove('is-loading');
  if(!hasG||RM){bars.forEach(b=>b.style.transform='scaleY(0)');return;}
  gsap.set(bars,{scaleY:1,transformOrigin:'top'});
  gsap.to(bars,{scaleY:0,duration:.9,ease:'expo.inOut',stagger:{each:.06,from:'center'},delay:.1});
}
if(document.readyState==='complete') reveal(); else addEventListener('load',reveal);
setTimeout(()=>{ if(document.body.classList.contains('is-loading')) reveal(); },2500);
addEventListener('pageshow',e=>{ if(e.persisted&&hasG) gsap.set(bars,{scaleY:0}); });
$$('a[href$=".html"],a[href*=".html#"]').forEach(a=>{
  if(a.target==='_blank') return;
  a.addEventListener('click',e=>{
    const u=new URL(a.href,location.href); if(u.origin!==location.origin||u.pathname===location.pathname) return;
    if(e.metaKey||e.ctrlKey||!hasG||RM) return;
    e.preventDefault();
    gsap.set(bars,{transformOrigin:'bottom'});
    gsap.to(bars,{scaleY:1,duration:.6,ease:'expo.in',stagger:{each:.05,from:'edges'},onComplete:()=>location.href=a.href});
  });
});

/* ---------- header ---------- */
const hdr=$('#hdr'); let lastY=0;
function onScroll(y){
  hdr.classList.toggle('is-solid',y>30);
  const down=y>lastY&&y>400;
  if(!document.body.classList.contains('menu-open')) hdr.classList.toggle('is-hidden',down);
  document.documentElement.classList.toggle('hdr-on',!down);
  lastY=y;
  const f=$('#fab'); if(f) f.classList.toggle('is-on',y>500);
}
document.documentElement.classList.add('hdr-on');
lenis?lenis.on('scroll',({scroll})=>onScroll(scroll)):addEventListener('scroll',()=>onScroll(scrollY),{passive:true});
onScroll(scrollY);
$('#burger')?.addEventListener('click',()=>{document.body.classList.toggle('menu-open'); hdr.classList.remove('is-hidden'); if(lenis) document.body.classList.contains('menu-open')?lenis.stop():lenis.start();});
$$('.mnav a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');lenis&&lenis.start();}));
const tip=$('#langTip'); $$('.lang button[data-l]').forEach(b=>b.addEventListener('click',()=>{tip.classList.add('is-on');clearTimeout(tip._t);tip._t=setTimeout(()=>tip.classList.remove('is-on'),2200);}));

/* ---------- split text ---------- */
$$('[data-split]').forEach(el=>{
  const walk=n=>{[...n.childNodes].forEach(c=>{
    if(c.nodeType===3){ const parts=c.textContent.split(/(\s+)/); const fr=document.createDocumentFragment();
      parts.forEach(p=>{ if(!p) return; if(/^\s+$/.test(p)){fr.appendChild(document.createTextNode(' '));return;}
        const w=document.createElement('span');w.className='w';const i=document.createElement('span');i.textContent=p;w.appendChild(i);fr.appendChild(w);});
      c.replaceWith(fr);
    } else if(c.nodeType===1&&!c.classList.contains('w')) walk(c);
  });};
  walk(el);
});

if(hasG&&!RM){
  /* split reveal */
  $$('[data-split]').forEach(el=>{
    const inner=$$('.w>span',el);
    const inHero=el.closest('.hero,.phero');
    gsap.fromTo(inner,{yPercent:115,rotate:3},{yPercent:0,rotate:0,duration:1.25,ease:'expo.out',stagger:.06,delay:inHero?.55:0,
      scrollTrigger:inHero?null:{trigger:el,start:'top 88%'}});
  });
  /* rv fade */
  $$('.rv').forEach(el=>{
    const inHero=el.closest('.hero,.phero');
    gsap.to(el,{opacity:1,y:0,duration:1.1,ease:'expo.out',delay:inHero?.9:0,scrollTrigger:inHero?null:{trigger:el,start:'top 92%'}});
  });
  /* list items */
  $$('.rv-list').forEach(ul=>gsap.from(ul.children,{opacity:0,y:18,duration:.7,ease:'power3.out',stagger:.04,scrollTrigger:{trigger:ul,start:'top 85%'}}));
  /* clip reveals */
  $$('[data-clip]').forEach(el=>{
    gsap.fromTo(el,{clipPath:'inset(14% 10% 14% 10%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:el,start:'top 95%',end:'top 35%',scrub:.6}});
  });
  $$('[data-par]').forEach(img=>{
    const a=+img.dataset.par||10;
    gsap.fromTo(img,{yPercent:-a/2},{yPercent:a/2,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
  });
  /* inner hero */
  $$('[data-hero-img]').forEach(img=>{
    gsap.fromTo(img,{scale:1.25},{scale:1.08,duration:2.2,ease:'expo.out',delay:.2});
    gsap.to(img,{yPercent:12,ease:'none',scrollTrigger:{trigger:img.closest('.phero'),start:'top top',end:'bottom top',scrub:true}});
  });
  /* home hero */
  const hero=$('#hero');
  if(hero){
    const imgs=$$('.pane__img',hero);
    gsap.fromTo(imgs,{scale:1.35},{scale:1.08,duration:2.4,ease:'expo.out',stagger:.12});
    gsap.from($$('.pane__meta',hero),{y:40,opacity:0,duration:1.2,ease:'expo.out',delay:1,stagger:.12});
    if(DESK()){
      gsap.to('.hero__title',{yPercent:-40,opacity:0,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'60% top',scrub:true}});
      gsap.to(imgs,{yPercent:14,ease:'none',scrollTrigger:{trigger:hero,start:'top top',end:'bottom top',scrub:true}});
      hero.addEventListener('mousemove',e=>{
        const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;
        imgs.forEach((im,i)=>gsap.to(im,{x:x*-26,y:y*-18,duration:1.2,ease:'power3.out',overwrite:'auto'}));
      });
    } else {
      $$('.pane',hero).forEach(p=>gsap.fromTo($('.pane__img',p),{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:p,start:'top bottom',end:'bottom top',scrub:true}}));
    }
  }
  /* counters */
  $$('[data-odo]').forEach(el=>{
    const v=+el.dataset.odo, o={n:0}; el.textContent='0';
    gsap.to(o,{n:v,duration:v>20?2.2:1.4,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 90%'},onUpdate:()=>{el.textContent=fmt(Math.round(o.n));}});
  });
  /* horizontal directions */
  const track=$('[data-hscroll]');
  if(track){
    ScrollTrigger.matchMedia({
      '(min-width: 821px)':()=>{
        const dist=()=>track.scrollWidth-innerWidth;
        const tw=gsap.to(track,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:'#dirs',start:'top top',end:()=>'+='+dist(),pin:true,scrub:.8,invalidateOnRefresh:true,anticipatePin:1}});
        $$('.dir__img img',track).forEach(im=>gsap.fromTo(im,{xPercent:-8},{xPercent:8,ease:'none',scrollTrigger:{trigger:im.closest('.dir'),containerAnimation:tw,start:'left right',end:'right left',scrub:true}}));
        return ()=>{};
      },
      '(max-width: 820px)':()=>{
        $$('.dir',track).forEach(d=>gsap.from(d,{y:60,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:d,start:'top 90%'}}));
      }
    });
  }
  /* race word */
  const rw=$('[data-race]'); if(rw) gsap.fromTo(rw,{xPercent:0},{xPercent:-40,ease:'none',scrollTrigger:{trigger:'#racing',start:'top bottom',end:'bottom top',scrub:true}});
  $$('.race__bg img').forEach(im=>gsap.fromTo(im,{scale:1.25},{scale:1.02,ease:'none',scrollTrigger:{trigger:'#racing',start:'top bottom',end:'bottom bottom',scrub:true}}));
  /* footer letters */
  const fw=$$('.ftr__word span'); if(fw.length) gsap.from(fw,{yPercent:100,duration:1.3,ease:'expo.out',stagger:.07,scrollTrigger:{trigger:'.ftr',start:'top 80%'}});
  /* magnetic buttons */
  if(matchMedia('(hover:hover)').matches) $$('.btn,.pane__go,.rbtn').forEach(b=>{
    b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.3,duration:.5,ease:'power3.out'});});
    b.addEventListener('mouseleave',()=>gsap.to(b,{x:0,y:0,duration:.8,ease:'elastic.out(1,.4)'}));
  });
}

/* ---------- ticker ---------- */
const tk=$('[data-ticker]');
if(tk){ let x=0,v=1; const half=()=>tk.scrollWidth/2;
  if(lenis) lenis.on('scroll',({velocity})=>{v=1+Math.min(Math.abs(velocity)*.4,8);});
  const step=()=>{ if(!RM){x-=.6*v; v+= (1-v)*.06; if(-x>=half()) x+=half(); tk.style.transform=`translate3d(${x}px,0,0)`;} requestAnimationFrame(step);}; step(); }

/* ---------- car cards ---------- */
const CARS=window.CARS||[];
const card=(c,i)=>`<button class="car" data-car="${c.id}" aria-label="${c.brand} ${c.model}">
  <div class="car__ph"><img src="${c.img[0]}" alt="${c.brand} ${c.model}" loading="lazy"><img src="${c.img[2]}" alt="" loading="lazy" aria-hidden="true">${c.km<15000?'<span class="car__badge">почти новый</span>':''}</div>
  <div class="car__b"><div class="car__mk">${c.brand}</div><div class="car__md">${c.model}</div><div class="car__tr">${c.trim}</div>
  <div class="car__specs"><span>${c.year}</span><span>${fmt(c.km)} км</span><span>${c.cv} л.с.</span><span>${c.fuel}</span></div>
  <div class="car__ft"><div class="car__pr">${fmt(c.price)} €<small>цена при оплате сразу</small></div><span class="car__go">${ARR}</span></div></div></button>`;

/* rail (home) */
const rail=$('#rail');
if(rail&&CARS.length){
  rail.innerHTML=CARS.slice(0,8).map(card).join('');
  const bar=$('#railBar');
  const upd=()=>{const m=rail.scrollWidth-rail.clientWidth;const p=m>0?rail.scrollLeft/m:0;bar.style.width=(rail.clientWidth/rail.scrollWidth*100)+'%';bar.style.left=(p*(100-rail.clientWidth/rail.scrollWidth*100))+'%';};
  rail.addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd); upd();
  $$('[data-rail]').forEach(b=>b.addEventListener('click',()=>rail.scrollBy({left:(+b.dataset.rail)*rail.clientWidth*.8,behavior:'smooth'})));
  let down=false,sx=0,sl=0,moved=false;
  rail.addEventListener('pointerdown',e=>{ if(e.pointerType!=='mouse') return; down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft;});
  addEventListener('pointermove',e=>{ if(!down) return; const dx=e.clientX-sx; if(Math.abs(dx)>4){moved=true;rail.classList.add('is-drag');} rail.scrollLeft=sl-dx;});
  addEventListener('pointerup',()=>{down=false;setTimeout(()=>rail.classList.remove('is-drag'),0);});
  rail.addEventListener('click',e=>{ if(moved){e.preventDefault();e.stopPropagation();moved=false;return;} const c=e.target.closest('[data-car]'); if(c) location.href='autosalon.html#car-'+c.dataset.car; },true);
  if(hasG&&!RM) gsap.from(rail.children,{x:120,opacity:0,duration:1.3,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:rail,start:'top 85%'}});
}

/* catalog */
const grid=$('#grid');
if(grid&&CARS.length){
  let brand='all',sort='rec';
  const makes={}; CARS.forEach(c=>makes[c.make]=(makes[c.make]||0)+1);
  const chips=$('#chips');
  chips.innerHTML=`<button class="chip is-on" data-b="all">Все<sup>${CARS.length}</sup></button>`+Object.entries(makes).sort((a,b)=>b[1]-a[1]).map(([m,n])=>`<button class="chip" data-b="${m}">${m}<sup>${n}</sup></button>`).join('');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -6% 0px'});
  const render=()=>{
    let list=CARS.filter(c=>brand==='all'||c.make===brand);
    if(sort==='pa') list.sort((a,b)=>a.price-b.price); if(sort==='pd') list.sort((a,b)=>b.price-a.price);
    if(sort==='y') list.sort((a,b)=>b.year-a.year); if(sort==='km') list.sort((a,b)=>a.km-b.km);
    grid.innerHTML=list.map(card).join('');
    $('#count').textContent=list.length+' из 46 · демо';
    $$('.car',grid).forEach((el,i)=>{ el.style.transitionDelay=(i%3)*80+'ms'; RM?el.classList.add('is-in'):io.observe(el); });
    if(hasG) ScrollTrigger.refresh();
  };
  chips.addEventListener('click',e=>{const b=e.target.closest('.chip');if(!b)return;$$('.chip',chips).forEach(x=>x.classList.toggle('is-on',x===b));brand=b.dataset.b;render();});
  $('#sort').addEventListener('change',e=>{sort=e.target.value;render();});
  render();
  /* drawer */
  const dr=$('#drawer'),sc=$('#drSc'); let gi=0,gn=0;
  const open=id=>{
    const c=CARS.find(x=>x.id==id); if(!c) return;
    const imgs=[c.big[0],c.img[1],c.big[1],c.img[3]];
    const wa='https://wa.me/34699589358?text='+encodeURIComponent(`Здравствуйте! Интересует ${c.brand} ${c.model} ${c.year}, ${fmt(c.price)} €. Он ещё в наличии?`);
    sc.innerHTML=`<div class="gal" id="gal"><div class="gal__t">${imgs.map(s=>`<img src="${s}" alt="${c.brand} ${c.model}">`).join('')}</div>
      <button class="gal__arr l" data-g="-1" aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button><button class="gal__arr r" data-g="1" aria-label="Вперёд"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>
      <div class="gal__nav">${imgs.map((_,i)=>`<button data-gi="${i}" class="${i?'':'is-on'}" aria-label="Фото ${i+1}"></button>`).join('')}</div></div>
      <div class="dr__b"><div class="car__mk">${c.brand}</div><div class="dr__md">${c.model}</div><div class="car__tr">${c.trim}</div>
      <div class="dr__pr">${fmt(c.price)} €</div><div class="mono" style="font-size:12px;color:#6b6f76">цена при оплате сразу · гарантия 12 мес.</div>
      <div class="spec"><div><span>Год</span><b>${c.year}</b></div><div><span>Пробег</span><b>${fmt(c.km)} км</b></div><div><span>Мощность</span><b>${c.cv} л.с.</b></div><div><span>Топливо</span><b>${c.fuel}</b></div><div><span>Кузов</span><b>${c.body}</b></div><div><span>Цвет</span><b>${c.color}</b></div></div>
      <div class="dr__cta"><a class="btn btn--red" href="${wa}" target="_blank" rel="noopener">Спросить в WhatsApp</a><a class="btn btn--line" href="tel:+34699589358">Позвонить</a><a class="btn btn--line" href="${wa.replace('Он ещё в наличии%3F','Хочу записаться на осмотр и тест-драйв.')}" target="_blank" rel="noopener">Тест-драйв</a></div>
      <a class="dr__src" href="${c.url}" target="_blank" rel="noopener">Объявление на red2.es ↗</a></div>`;
    gi=0;gn=imgs.length; dr.classList.add('is-open'); dr.setAttribute('aria-hidden','false'); lenis&&lenis.stop(); document.body.style.overflow='hidden';
    history.replaceState(null,'','#car-'+c.id);
    const t=$('.gal__t',sc); const go=i=>{gi=(i+gn)%gn;t.style.transform=`translateX(${-gi*100}%)`;$$('.gal__nav button',sc).forEach((b,k)=>b.classList.toggle('is-on',k===gi));};
    sc.addEventListener('click',e=>{const g=e.target.closest('[data-g]');if(g)go(gi+ +g.dataset.g);const n=e.target.closest('[data-gi]');if(n)go(+n.dataset.gi);});
    let tx=null; t.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true}); t.addEventListener('touchend',e=>{if(tx==null)return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40)go(gi+(dx<0?1:-1));tx=null;});
  };
  const close=()=>{dr.classList.remove('is-open');dr.setAttribute('aria-hidden','true');lenis&&lenis.start();document.body.style.overflow='';history.replaceState(null,'',location.pathname);};
  grid.addEventListener('click',e=>{const c=e.target.closest('[data-car]');if(c)open(c.dataset.car);});
  dr.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&dr.classList.contains('is-open'))close();});
  window.R2open=open; window.R2close=close;
  const m=location.hash.match(/car-(\d+)/); if(m) setTimeout(()=>open(m[1]),700);
}

/* ---------- booking ---------- */
const slots=$('#slots');
if(slots){
  const days=['Вс','Пн','Вт','Ср','Чт','Пт','Сб']; const out=[]; const d=new Date(); let n=0;
  while(out.length<4){ d.setDate(d.getDate()+1); if(d.getDay()===0) continue; const lab=n===0?'Завтра':days[d.getDay()]+' '+d.getDate(); n++;
    (d.getDay()===6?['10:00','12:00']:['9:30','12:00','16:00']).slice(0,2).forEach(t=>out.push(`${lab}, ${t}`)); }
  slots.innerHTML=out.slice(0,6).map((s,i)=>`<button type="button" class="${i?'':'is-on'}">${s}</button>`).join('');
  slots.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;$$('button',slots).forEach(x=>x.classList.toggle('is-on',x===b));});
  const f=$('#bookForm');
  f.addEventListener('submit',e=>{e.preventDefault();
    const tel=$('#f-tel').value.replace(/\D/g,''), name=$('#f-name').value.trim();
    const ok=$('#bookOk');
    if(tel.length<9){ok.textContent='Проверьте телефон: нужно минимум 9 цифр.';f.classList.add('is-sent');$('#f-tel').focus();return;}
    const slot=$('.is-on',slots)?.textContent||'';
    ok.innerHTML=`<b>${name||'Готово'}, заявка принята.</b> ${$('#f-svc').value}, ${slot}${$('#f-plate').value?' · '+$('#f-plate').value.toUpperCase():''}. Менеджер подтвердит в WhatsApp. <span class="mono" style="opacity:.6">(демо, данные никуда не ушли)</span>`;
    f.classList.add('is-sent');
  });
}
/* services nav active */
const sn=$('#svcNav');
if(sn&&hasG){ $$('.grp').forEach(g=>ScrollTrigger.create({trigger:g,start:'top 45%',end:'bottom 45%',onToggle:s=>{ if(!s.isActive) return; const a=$(`a[href="#${g.id}"]`,sn); $$('a',sn).forEach(x=>x.classList.toggle('is-on',x===a)); if(a) sn.scrollTo({left:a.offsetLeft-20,behavior:'smooth'}); }})); }

addEventListener('load',()=>hasG&&ScrollTrigger.refresh());
})();
