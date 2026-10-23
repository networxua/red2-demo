/* RED2 Concierge — demo assistant. Client-side intent matcher (RU + EN/ES keywords). No data leaves the page. */
(()=>{
const d=document,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,G=window.gsap;
const CARS=window.CARS||[];const PAGE=d.body.dataset.page||'home';
const WA='https://wa.me/34681997777',WA_S='https://wa.me/34699589358';
const eur=n=>Math.round(n).toLocaleString('ru-RU').replace(/\s/g,'\u202f')+' €';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const carEl=$('[data-car]');const HERE=carEl?CARS.find(c=>c.id==carEl.dataset.car):null;

/* ---------- UI ---------- */
const L=d.createElement('button');L.className='bt-l';L.type='button';L.setAttribute('aria-label','Открыть чат с консьержем RED2');
L.innerHTML='<span class="bt-l__tree"><i></i><i></i><i></i><i class="g"></i></span><span class="bt-l__t">Спросить RED2</span>';
const P=d.createElement('div');P.className='bt';P.setAttribute('role','dialog');P.setAttribute('aria-label','Консьерж RED2');P.setAttribute('aria-hidden','true');
P.innerHTML=`<div class="bt__h"><span class="bt__av">R2</span><div class="bt__ti"><b>Консьерж RED2</b><small><i></i>отвечает сразу · RU · EN · ES</small></div><button class="bt__rs" type="button" aria-label="Начать заново" title="Начать заново">↺</button><button class="bt__x" type="button" aria-label="Закрыть">×</button></div>
<div class="bt__log" data-lenis-prevent aria-live="polite"></div>
<div class="bt__chips" data-lenis-prevent></div>
<form class="bt__f" autocomplete="off"><textarea rows="1" placeholder="Напишите вопрос…" aria-label="Сообщение" enterkeyhint="send"></textarea><button type="submit" aria-label="Отправить">↑</button></form>
<p class="bt__dis">Демо: сценарный ассистент в браузере. В рабочей версии — ИИ, подключённый к стоку Dealcar, записи и WhatsApp.</p>`;
d.body.appendChild(L);d.body.appendChild(P);
const log=$('.bt__log',P),chipsEl=$('.bt__chips',P),form=$('.bt__f',P),ta=$('textarea',P);
let opened=false,started=false;
const H=d.documentElement;
function vv(){const v=window.visualViewport;if(!v)return;P.style.setProperty('--vvh',v.height+'px');P.style.setProperty('--vvt',v.offsetTop+'px');}
if(window.visualViewport){visualViewport.addEventListener('resize',vv);visualViewport.addEventListener('scroll',vv);}
function open(msg){
  if(!opened){opened=true;P.classList.add('open');P.setAttribute('aria-hidden','false');H.classList.add('bt-on');L.classList.add('hide');vv();
    if(innerWidth<=900)d.body.style.overflow='hidden';
    if(G&&!RM)G.fromTo(P,{y:innerWidth<=900?60:30,opacity:0,scale:innerWidth<=900?1:.96},{y:0,opacity:1,scale:1,duration:.55,ease:'expo.out'});}
  const first=!started;if(!started){started=true;greet();}
  if(msg)setTimeout(()=>user(msg),first?1500:200);
  else if(innerWidth>900)setTimeout(()=>ta.focus(),300);
}
function close(){opened=false;P.classList.remove('open');P.setAttribute('aria-hidden','true');H.classList.remove('bt-on');L.classList.remove('hide');d.body.style.overflow='';ta.blur();}
L.addEventListener('click',()=>open());$('.bt__x',P).addEventListener('click',close);
$('.bt__rs',P).addEventListener('click',()=>{log.innerHTML='';ctx=fresh();greet();});
d.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened)close();});
form.addEventListener('submit',e=>{e.preventDefault();const t=ta.value.trim();if(!t)return;ta.value='';fit();user(t);});
ta.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
const fit=()=>{ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,110)+'px';};ta.addEventListener('input',fit);
/* nudge launcher after a while */
setTimeout(()=>{if(!opened&&!RM){L.classList.add('nudge');setTimeout(()=>L.classList.remove('nudge'),5200);}},9000);

function scroll(){requestAnimationFrame(()=>log.scrollTo({top:log.scrollHeight,behavior:RM?'auto':'smooth'}));}
function add(html,who){const m=d.createElement('div');m.className='bm bm--'+who;m.innerHTML=html;log.appendChild(m);
  if(G&&!RM)G.from(m,{y:14,opacity:0,duration:.4,ease:'power3.out'});scroll();return m;}
function chips(list){chipsEl.innerHTML=(list||[]).map(c=>`<button type="button" class="bc${/^Отмена|^Не сейчас/.test(c)?' bc--x':''}">${esc(c)}</button>`).join('');
  $$('.bc',chipsEl).forEach(b=>b.addEventListener('click',()=>user(b.textContent)));chipsEl.scrollLeft=0;}
let busy=0;
function bot(parts,ch){busy++;const typ=add('<span class="dots"><i></i><i></i><i></i></span>','bot typing');
  const delay=RM?60:Math.min(1100,420+(parts[0]||'').length*4);
  setTimeout(()=>{typ.remove();parts.forEach((p,i)=>setTimeout(()=>add(p,'bot'),i*(RM?0:260)));setTimeout(()=>{chips(ch);busy--;},parts.length*(RM?0:260));},delay);}
function user(t){add(esc(t),'me');chips([]);const r=answer(t);bot(r[0],r[1]);}

/* ---------- NLU ---------- */
const norm=t=>' '+t.toLowerCase().replace(/ё/g,'е').replace(/[!?.,;:()«»"“”]/g,' ').replace(/\s+/g,' ')+' ';
const I={
 greet:/(?:^|\s)(привет|здравств|добрый|доброе|hello|hi|hey|hola|buenas|салют)/,
 thanks:/(спасиб|благодар|thank|gracias|супер|отлично|класс)/,
 who:/(ты кто|кто ты|ты бот|вы бот|ты ии|нейросет|\sии\s|\bai\b|robot|робот|chatgpt|человек ли)/,
 human:/(менеджер|человек|оператор|позвон|телефон|номер|whatsapp|ватсап|вотсап|воцап|связаться|contact|llamar|hablar|call me|перезвон)/,
 hours:/(часы|график|работаете|открыт|время работы|до скольки|во сколько|выходн|суббот|воскрес|horario|abierto|opening|hours|open on)/,
 addr:/(адрес|где вы|где наход|как добрат|как проехать|локаци|карт[аеуы]|direcci|ubicaci|where|location|address|map\b|google maps)/,
 lang:/(язык|english|ingles|inglés|español|испанск|английск|по-русски|по русски|speak|hablan)/,
 racing:/(драг|чемпион|трек|гонк|racing|виталий|бойко|almeria|альмери|race|carrera|диностенд|dyno)/,
 storage:/(хранени|хранить|парковк|storage|guardar|garaje)/,
 rent:/(аренд|прокат|rent|alquil)/,
 warranty:/(гаранти|warrant|garant)/,
 finance:/(кредит|финанс|рассроч|лизинг|ежемесяч|в месяц|платеж|взнос|financ|loan|cuota|leasing|monthly)/,
 tradein:/(трейд|trade|обмен|обменя|в зачет|зачесть|parte de pago|swap)/,
 sell:/(продать|продаж[уи] (свою|мою|моей)|выкуп|оцен|сдать (машин|авто)|vender|tasaci|sell my|valuat|продам)/,
 europe:/(европ|германи|итали|франци|привез|под заказ|заказать машин|пригнать|подбор из|import|traer|europe|alemania|order a car)/,
 testdrive:/(тест-драйв|тест драйв|тестдрайв|прокатиться|посмотреть вживую|приехать посмотреть|test drive|prueba|probar)/,
 stock:/(в наличии|еще есть|ещё есть|продан|available|disponible|reserved|резерв)/,
 car:/(машин|авто(?=\s)|автомоб|купить|подобрать|подбор|выбрать|сток|\sзал[еа]?(?=\s)|coche|comprar|car\b|cars\b|buy|vehic|модел)/,
 book:/(запис|записать|свободн|окошк|когда можно|приехать|cita|reserv|book|appointment|slot)/,
 price:/(цен[аыу]|стоит|стоимост|сколько|прайс|почем|precio|cuanto|cuánto|price|cost|how much|€|евро)/,
 s_diag:/(ошибк|чек|check|горит|лампочк|диагност|не заводит|глохнет|троит|diagn|error|warning|indicador|aver[ií]a|падает мощ|не тянет|разряжа|ток утеч)/,
 s_to:/(\sто\s|техобслуж|обслуживан|масл|фильтр|регламент|грм|ремень|цепь|свеч|mantenim|aceite|oil|service interval|inspection|revisi)/,
 s_tune:/(чип|тюнинг|stage|стейдж|прошив|мощност|выхлоп|akrapovic|акрапович|capristo|глушител|громче|звук|tuning|reprogram|potencia|escape|exhaust|remap|power)/,
 s_align:/(развал|сход|шин|резин|колес|баланс|диск|шиномонт|тянет в сторону|руль крив|вибрац|neum[aá]tic|alineaci|tyre|tire|wheel|alignment|ruedas|llanta)/,
 s_body:/(кузов|покрас|царап|вмятин|дтп|авари|бампер|скол|ржав|chapa|pintura|golpe|ara[ñn]azo|scratch|dent|paint|bodywork|accident|страхов)/,
 s_ppf:/(пленк|ppf|оклей|керамик|полиров|детейл|винил|антихром|хим[ч ]|мойк|detail|ceramic|wrap|vinilo|pulido|protecci)/,
 s_el:/(электри|проводк|аккумул|акб|батаре|генератор|стартер|adas|carplay|андроид|мультимед|фар|оптик|датчик|сигнализ|el[eé]ctric|wiring|battery|bater[ií]a|sensor)/,
 s_susp:/(подвеск|амортиз|пневм|стук|скрип|тормоз|колодк|крен|suspens|frenos|brake|shock|amortig)/,
 s_itv:/(itv|техосмотр|tuv|tüv|проверк[аиу] перед|осмотр перед|проверить машину|inspecci|pre-purchase|перед покупкой)/,
 s_ev:/(гибрид|электромоб|электрокар|\bev\b|tesla|тесла|hybrid|h[ií]brido|el[eé]ctrico|plug-in)/,
 svc:/(сервис|ремонт|мастер|почин|сломал|taller|repair|reparar|workshop|техцентр|стук)/,
 cancel:/^ ?(отмена|отменить|не надо|нет|стоп|cancel|no|не сейчас|назад) ?$/,
 yes:/^ ?(да|ок|окей|хорошо|давай|давайте|yes|si|sí|ok|конечно|ага|угу) ?$/,
 cheap:/(дешев|недорог|бюджетн|cheap|barato|самая доступ|подешевле)/,
 power:/(мощн|быстр|power|potente|fast|rapid|самая злая|заряжен)/,
 newest:/(нов[аы][яе] (машин|авто)|свеж|newest|recent|самая новая|последн[ий]+ год)/
};
const BR=[['Porsche',/(porsche|порш|911|panamera|панамер|cayenne|кайен|taycan)/],['Lamborghini',/(lambo|ламбо|ламбор|urus|урус)/],['Mercedes',/(mercedes|мерс|мерин|benz|бенц|amg|амг|maybach|майбах|gls|gle|cle|sl ?63|s ?680|e ?53|гелик|g-class)/],['BMW',/(bmw|бмв|бэха|беха|m4|м4|m8|м8|m850|м850)/],['Ferrari',/(ferrari|феррари)/],['Bentley',/(bentley|бентли)/],['Audi',/(audi|ауди|r8|rs6)/],['Rolls',/(rolls|роллс)/]];
const BODY=[['Внедорожник',/(внедорож|кроссов|джип|suv|4x4|todoterreno|паркетник|семейн)/],['Купе',/(купе|coupe|coupé|cupé)/],['Кабриолет',/(кабрио|кабриолет|родстер|открыт|cabrio|convertible|descapotable|roadster|targa|тарга)/],['Седан',/(седан|sedan|berlina|лифтбек|gran coupe|бизнес-класс|представит)/]];
const FUEL=[['Плагин-гибрид',/(плагин|подзаряж|розетк|plug-in|phev|enchufable)/],['Гибрид',/(гибрид|hybrid|h[ií]brido)/],['Бензин',/(бензин|gasolin|petrol|gas\b)/]];
function budget(t,loose){
  const all=[...t.matchAll(/(до|не дороже|максимум|макс|under|up to|hasta|max|менее|меньше|в пределах|около|примерно|about|around|от|from|desde|больше|дороже|over)?\s*(\d+(?:[.,]\d+)?)\s*(k|к(?=\s)|тыс[а-я]*|т(?=\s)|mil\b|млн|million|m\b|000|\s000)?\s*(€|евро|eur\w*)?/g)];
  for(const a of all){let n=parseFloat(a[2].replace(',','.'));const u=a[3]||'';const cur=!!a[4];
    if(n>=1990&&n<=2027&&!u&&!cur)continue; /* year */
    if(/млн|million|^m$/.test(u.trim()))n*=1e6;else if(u)n*=1000;else if(n<1000){if(n>=10&&(a[1]||cur||loose))n*=1000;else continue;}
    if(n<5000)continue;
    const w=(a[1]||'');const min=/^(от|from|desde|больше|дороже|over)$/.test(w);
    return min?{min:n}:{max:/(около|примерно|about|around)/.test(w)?n*1.15:n};}
  if(/(до|under|hasta)\s*(ста|сотни)\b/.test(t))return{max:100000};
  return null;}
function year(t){const m=t.match(/\b(20[12]\d)\b/);return m?+m[1]:null;}
function ents(t){const e={};for(const[b,r]of BR)if(r.test(t)){e.brand=b;break;}for(const[b,r]of BODY)if(r.test(t)){e.body=b;break;}for(const[b,r]of FUEL)if(r.test(t)){e.fuel=b;break;}
  const bu=budget(t,ctx.await==='budget');if(bu)Object.assign(e,bu);const y=year(t);if(y)e.year=y;return e;}
const brandOf=c=>c.b;

/* ---------- knowledge ---------- */
const S={
 s_diag:{t:'Диагностика',a:'Ошибку на панели лучше не откладывать. Подключаем OEM-софт (ODIS, PIWIS, ISTA), проверяем CAN-шины и блоки управления. Ищем причину, а не гасим ошибку. На выходе вы получаете письменный отчёт.',p:'Цену диагностики назовёт мастер, смета фиксируется до начала работ.',img:'img/ph/ferrari-bay-m.webp'},
 s_to:{t:'ТО и механика',a:'ТО делаем по регламенту производителя: масла ДВС и коробок (DSG, PDK, АКПП), фильтры, свечи, ГРМ. Мы независимый сервис, поэтому обслуживание у нас не влияет на заводскую гарантию.',p:'Стоимость зависит от модели и регламента. Смета фиксируется письменно до начала работ.',img:'img/ph/lift-812-m.webp'},
 s_tune:{t:'Тюнинг и выхлоп',a:'Чип-тюнинг ECU и TCU, Stage 1–3, апгрейд турбин и топливной системы, выхлоп на заказ (Akrapovič, Capristo), клапанные системы. Машины для трека и драга мы готовим и для себя: команда владельца выступает на чемпионате Испании.',p:'Стоимость зависит от машины и стейджа, ориентир даёт мастер. Диностенд для замеров «до/после» скоро появится.',img:'img/ph/812-rear-detail.webp'},
 s_align:{t:'Развал и шины',a:'Развал-схождение 3D занимает 40–90 минут. Бережно монтируем премиальные шины и диски, делаем высокоскоростную балансировку и настраиваем развал под трек или драг.',p:'Развал 3D стоит от 90 € с IVA.',img:'img/ph/r8-lift-s.webp'},
 s_body:{t:'Кузов и покраска',a:'Восстанавливаем после ДТП и делаем локальный ремонт. У нас своя покрасочная камера (глянец, мат, сатин), работаем с алюминием и карбоном, есть smart repair. Работаем со страховыми.',p:'Цену называем после осмотра, смета письменно.',img:'img/ph/m4-studio.webp'},
 s_ppf:{t:'PPF и детейлинг',a:'PPF у нас приоритетное направление: солнце и солёный воздух Коста-дель-Соль быстро съедают лак. Клеим полностью или только зоны риска, делаем цветные и матовые плёнки, полировку, керамику, химчистку.',p:'Цена зависит от машины и площади оклейки, мастер посчитает по фото.',img:'media/ppf.webp'},
 s_el:{t:'Электрика',a:'Проводка, блоки управления, генераторы и стартеры, LED-оптика, калибровка радаров и ADAS, CarPlay и Android Auto. Плавающие ошибки и утечки тока ищем осциллографом.',p:'Цену называем после диагностики.',img:'img/ph/taillight.webp'},
 s_susp:{t:'Подвеска и тормоза',a:'Работаем с адаптивной и пневмоподвеской, ставим KW и Öhlins. Обслуживаем карбон-керамические тормоза, Brembo и AP Racing, чиним ABS и ESP.',p:'Цену называем после осмотра на подъёмнике и тест-драйва.',img:'img/ph/r8-studio.webp'},
 s_itv:{t:'ITV и проверка',a:'Готовим машину к ITV и проводим её через инспекцию. Делаем осмотр перед покупкой, проверку истории и экспертизу после ДТП.',p:'Цену уточнит менеджер.',img:'img/ph/bentley-studio.webp'},
 s_ev:{t:'Гибриды и EV',a:'У мастеров есть допуск к высоковольтным системам (HV). Обслуживаем охлаждение, ПО и инверторы гибридов и электромобилей.',p:'Цену называем после диагностики.',img:'img/ph/ferrari-bay-m.webp'}
};
const SVC_CHIPS=['Записаться','Сколько стоит?','Позвать мастера в WhatsApp'];
const fresh=()=>({topic:PAGE==='svc'?'svc':(PAGE==='auto'||PAGE==='car')?'car':null,svc:null,f:{},await:null,lead:{},car:HERE,shown:[]});
let ctx=fresh();

function greet(){
  const g={home:['Здравствуйте! Я консьерж RED2. Подберу машину из зала, запишу в сервис или отвечу на вопрос. Пишите своими словами.',['Подобрать авто','Записаться в сервис','Сколько стоит развал?','Кредит и трейд-ин','Где вы находитесь?']],
   auto:['Здравствуйте! Помогу выбрать из 46 машин в зале. Напишите бюджет, марку или тип кузова, например «кабриолет до 150 тысяч».',['Внедорожник до 150 тыс','Что есть из Porsche?','Самая мощная','Кредит','Продать свою машину','Привезти из Европы']],
   svc:['Здравствуйте! Опишите, что происходит с машиной, а я подскажу, какая нужна работа и как записаться.',['Горит Check Engine','Пора на ТО','Чип-тюнинг','Оклейка PPF','Развал — цена?','Записаться']],
   car:[HERE?`Здравствуйте! Подскажу всё про ${esc(HERE.brand+' '+HERE.model)} ${HERE.year}: наличие, кредит, тест-драйв, трейд-ин.`:'Здравствуйте!',['Ещё в наличии?','Кредит на эту машину','Тест-драйв','Трейд-ин моей машины','Похожие машины']]}[PAGE]||[];
  bot([g[0]],g[1]);
}
/* ---------- car search ---------- */
function search(f,mode){
  let r=CARS.filter(c=>(!f.brand||brandOf(c)===f.brand)&&(!f.body||c.bodyg===f.body)&&(!f.fuel||c.fuel===f.fuel||(f.fuel==='Гибрид'&&/гибрид/i.test(c.fuel)))&&(!f.max||c.price<=f.max)&&(!f.min||c.price>=f.min)&&(!f.year||c.year>=f.year));
  if(mode==='cheap')r.sort((a,b)=>a.price-b.price);else if(mode==='power')r.sort((a,b)=>b.cv-a.cv);else if(mode==='newest')r.sort((a,b)=>b.year-a.year||a.km-b.km);else if(f.max)r.sort((a,b)=>b.price-a.price);
  return r;}
function cardsHTML(list){return '<div class="bcars">'+list.map(c=>`<a class="bcar" href="${c.href}"><img src="${(c.gal[0]||c.img[0]).replace('.webp','_s.webp').replace('_s_s','_s')}" alt="" loading="lazy" onerror="this.src='${c.img[0]}'"><span><small>${esc(c.brand)} · ${c.year}</small><b>${esc(c.model)}</b><em>${eur(c.price)} · ${c.km.toLocaleString('ru-RU')} км · ${c.cv} л.с.</em></span><i>→</i></a>`).join('')+'</div>';}
function catLink(f){const q=new URLSearchParams();if(f.brand)q.set('b',f.brand==='Mercedes'?'Mercedes':f.brand);if(f.body)q.set('body',f.body);if(f.fuel)q.set('fuel',f.fuel);if(f.max)q.set('max',Math.round(f.max));return 'autosalon.html'+(q.toString()?'?'+q:'')+'#grid';}
function descF(f){const a=[];if(f.body)a.push(f.body.toLowerCase());if(f.brand)a.push(f.brand);if(f.fuel)a.push(f.fuel.toLowerCase());if(f.max)a.push('до '+eur(f.max));if(f.min)a.push('от '+eur(f.min));if(f.year)a.push('от '+f.year+' г.');return a.join(', ');}
function carReply(f,mode){
  const r=search(f,mode);const lbl=descF(f);
  if(!r.length){
    const relax=search({body:f.body,brand:f.brand}).length?{body:f.body,brand:f.brand}:(f.body?{body:f.body}:{});const alt=search(relax).slice(0,2);
    return[[`По запросу «${esc(lbl)}» сейчас в зале ничего нет. Это 12 машин из 46, которые есть в демо, в полной версии поиск идёт по всему стоку.`+(alt.length?' Вот ближайшие варианты:':''),...(alt.length?[cardsHTML(alt)]:[]),'Ещё можем найти и привезти машину из Германии или другой страны ЕС под ваш запрос. <span class="flag flag--ink">условия подтвердить</span>'],['Подбор из Европы','Изменить бюджет','Показать все машины','Оставить контакт']];}
  ctx.shown=r.slice(0,3);ctx.car=r[0];
  const head=mode==='power'?'Самые мощные в зале:':mode==='cheap'?'Самые доступные сейчас:':mode==='newest'?'Самые свежие по году:':`Нашёл ${r.length} ${pl(r.length,'машину','машины','машин')}`+(lbl?` (${esc(lbl)})`:'')+':';
  const more=r.length>3?`<a class="u" href="${catLink(f)}">Показать все ${r.length} в каталоге →</a>`:'';
  return[[head,cardsHTML(r.slice(0,3))+more,'Расскажу подробнее про любую, рассчитаю кредит или запишу на тест-драйв.'],['Кредит на '+short(r[0]),'Тест-драйв','Трейд-ин моей машины','Другой бюджет']];
}
const short=c=>c.model.split(' ').slice(0,2).join(' ');
const pl=(n,a,b,c)=>{n=Math.abs(n)%100;const m=n%10;if(n>10&&n<20)return c;if(m>1&&m<5)return b;if(m==1)return a;return c;};
function findNamed(t){for(const c of CARS){const k=c.model.toLowerCase().split(' ')[0];if(k.length>=2&&t.includes(' '+k.toLowerCase()))return c;}
  const al=[[/урус|urus/,2],[/майбах|maybach|s ?680/,15],[/таргу|тарга|targa|911/,6],[/sl ?63/,18],[/gls/,3],[/gle/,16],[/m4|м4/,7],[/m8|м8/,4],[/панамер|panamera/,12],[/m850|м850/,11],[/e ?53|е ?53/,5],[/cle/,10]];
  for(const[r,id]of al)if(r.test(t))return CARS.find(c=>c.id===id);return null;}
function monthly(P,dp=30,m=48,rate=7.5){const L=P*(1-dp/100),r=rate/1200;return L*r/(1-Math.pow(1+r,-m));}
function waBtn(num,txt,label){return `<a class="btn btn--red btn--wa bbtn" href="${num}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${label}<b><svg class="ic-ar" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 9L9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></b></a>`;}

/* ---------- lead capture ---------- */
function leadStart(kind,detail){ctx.await='lead_name';ctx.lead={kind,detail};
  return[[`Оставьте контакт, и менеджер ${kind==='svc'?'сервиса':'салона'} напишет вам в WhatsApp. Как к вам обращаться?`],['Отмена']];}
function leadStep(t,raw){
  if(I.cancel.test(t)||/(отмен|не надо|cancel|не хочу)/.test(t)){ctx.await=null;return[['Хорошо, отменил. Если что, я тут.'],baseChips()];}
  if(ctx.await==='lead_name'){const nm=raw.trim().replace(/^(меня зовут|я|my name is|me llamo)\s+/i,'').slice(0,40);if(nm.length<2)return[['Подскажите имя, пожалуйста.'],['Отмена']];
    ctx.lead.name=nm.charAt(0).toUpperCase()+nm.slice(1);ctx.await='lead_phone';return[[`Приятно познакомиться, ${esc(ctx.lead.name)}! Номер телефона или WhatsApp?`],['Отмена']];}
  if(ctx.await==='lead_phone'){const ph=raw.replace(/[^\d+]/g,'');if(ph.replace(/\D/g,'').length<9)return[['Похоже, в номере не хватает цифр. Напишите номер с кодом страны, например +34 600 000 000.'],['Отмена']];
    ctx.lead.phone=ph;ctx.await='lead_ok';const L=ctx.lead;
    return[[`Проверьте заявку:<div class="bsum"><span>Имя</span><b>${esc(L.name)}</b><span>Связь</span><b>${esc(L.phone)}</b><span>Запрос</span><b>${esc(L.detail||'консультация')}</b></div>Отправляю?`],['Да, отправить','Исправить','Отмена']];}
  if(ctx.await==='lead_ok'){
    if(/исправ|измен|edit/.test(t)){ctx.await='lead_name';return[['Хорошо, давайте заново. Как вас зовут?'],['Отмена']];}
    if(I.yes.test(t)||/(отправ|send|да)/.test(t)){const L=ctx.lead;ctx.await=null;const no='R2-'+String(Date.now()).slice(-4);
      const num=L.kind==='svc'?WA:WA_S;const txt=`Здравствуйте! Заявка ${no} с сайта: ${L.detail||'консультация'}. ${L.name}, ${L.phone}`;
      return[[`Готово, заявка <b>${no}</b> принята. Менеджер напишет вам в WhatsApp в рабочее время (Пн–Пт 9–19, Сб 10–14).<br><small class="muted">Демо: в рабочей версии заявка уходит в CRM и WhatsApp RED2.</small>`,waBtn(num,txt,'Написать самому сейчас')],baseChips()];}
    return[['Отправляю заявку?'],['Да, отправить','Исправить','Отмена']];}
}
function baseChips(){return ctx.topic==='svc'?['Записаться','Другая услуга','Часы работы','Адрес']:ctx.topic==='car'?['Подобрать авто','Кредит','Трейд-ин','Тест-драйв']:['Подобрать авто','Записаться в сервис','Где вы находитесь?'];}

/* ---------- answer ---------- */
function answer(raw){
  const t=norm(raw);
  if(ctx.await&&ctx.await.startsWith('lead'))return leadStep(t,raw);
  const has=k=>I[k].test(t);
  const e=ents(t);const named=findNamed(t);
  const svcHit=Object.keys(S).filter(k=>has(k));
  /* chip shortcuts */
  if(/^ ?(подобрать авто|помогите подобрать машину|показать все машины) ?$/.test(t)){ctx.topic='car';ctx.f={};
    if(/показать все/.test(t))return carReply({},'');
    return[['С удовольствием. Что важнее всего: бюджет, тип кузова или марка? Можно всё сразу, например «внедорожник до 150 тысяч».'],['До 80 тыс','80–150 тыс','От 150 тыс','Внедорожник','Кабриолет','Купе','Porsche','Mercedes','BMW']];}
  if(/^ ?80–150 тыс ?$/.test(t)){ctx.topic='car';ctx.f={min:80000,max:150000};return carReply(ctx.f);}
  if(/^ ?от 150 тыс ?$/.test(t)){ctx.topic='car';ctx.f={min:150000};return carReply(ctx.f);}
  if(/^ ?(другой бюджет|изменить бюджет) ?$/.test(t)){ctx.await='budget';return[['Какой бюджет рассматриваете?'],['До 80 тыс','80–150 тыс','От 150 тыс']];}
  if(/^ ?(другая услуга|записаться в сервис) ?$/.test(t)&&!/запис/.test(t)){ctx.topic='svc';return[['Что нужно машине?'],['Диагностика','ТО','Развал и шины','PPF','Тюнинг','Кузов']];}
  if(/^ ?(позвать мастера в whatsapp) ?$/.test(t)){const s=ctx.svc?S[ctx.svc].t:'сервис';return[['Передаю мастеру. Нажмите кнопку, и сообщение уже будет заполнено:',waBtn(WA,`Здравствуйте! Вопрос по услуге «${s}».`,'Открыть WhatsApp сервиса')],baseChips()];}
  if(/^ ?(опишу проблему своими словами|у меня вопрос по сервису) ?$/.test(t)){ctx.topic='svc';return[['Конечно, опишите, что происходит: что слышно или видно, когда началось, какая машина.'],['Горит Check Engine','Стук в подвеске','Тянет в сторону','Царапина на кузове']];}
  if(/^ ?оставить контакт ?$/.test(t))return leadStart(ctx.topic==='svc'?'svc':'car',ctx.topic==='svc'?(ctx.svc?S[ctx.svc].t:'сервис'):(ctx.car?`${ctx.car.brand} ${ctx.car.model}`:'подбор авто'));
  /* awaiting budget */
  if(ctx.await==='budget'&&(e.max||e.min)){ctx.await=null;ctx.topic='car';Object.assign(ctx.f,{max:e.max,min:e.min});if(!e.min)delete ctx.f.min;if(!e.max)delete ctx.f.max;return carReply(ctx.f);}
  if(/^ ?до 80 тыс ?$/.test(t)){ctx.topic='car';ctx.f={max:80000};return carReply(ctx.f);}

  if(has('who'))return[['Я демо-консьерж RED2: понимаю вопросы на русском и ключевые слова на английском и испанском, ищу по реальному стоку и записываю в сервис. В рабочей версии здесь будет ИИ-ассистент, подключённый к стоку Dealcar, записи и WhatsApp, на трёх языках.'],baseChips()];
  if(has('greet')&&t.trim().split(' ').length<=3)return[['Здравствуйте! Чем помочь: подобрать машину или записаться в сервис?'],['Подобрать авто','Записаться в сервис','Часы работы']];
  if(has('thanks')&&t.trim().split(' ').length<=4)return[['Всегда рад помочь. Если появятся вопросы, пишите.'],baseChips()];

  /* car-page context */
  const C=named||ctx.car||HERE;
  if(has('testdrive')){const c=C;ctx.topic='car';
    const txt=c?`Здравствуйте! Хочу на тест-драйв: ${c.brand} ${c.model} ${c.year}.`:'Здравствуйте! Хочу на тест-драйв.';
    return[[`Тест-драйв${c?' '+esc(c.brand+' '+c.model):''} проходит в шоуруме на Calle Fragua 20 (Пн–Пт 9–19, Сб 10–14). Нужны водительские права. Удобнее договориться в WhatsApp или оставить контакт здесь.`,waBtn(WA_S,txt,'Записаться в WhatsApp')],['Оставить контакт','Кредит','Где шоурум?']];}
  if(has('finance')){ctx.topic='car';const c=C;
    if(c)return[[`Ориентир по ${esc(c.brand+' '+c.model)} (${eur(c.price)}): при взносе 30% и сроке 48 мес. платёж около <b>${eur(monthly(c.price))}/мес</b>. Ставка 7,5% взята для примера <span class="flag flag--ink">ориентир</span>`,'Реальную ставку и одобрение даёт банк-партнёр RED2. Можно зачесть вашу машину как первый взнос.'+(PAGE==='car'?' Калькулятор есть на странице ниже.':''),waBtn(WA_S,`Здравствуйте! Хочу расчёт кредита на ${c.brand} ${c.model} ${c.year}.`,'Запросить точный расчёт')],['Трейд-ин моей машины','Оставить контакт','Подобрать авто']];
    return[['Да, у нас есть финансирование под ваш запрос, плюс можно зачесть вашу машину в трейд-ин. Выберите машину, и я покажу примерный платёж.'],['Подобрать авто','Трейд-ин моей машины']];}
  if(has('tradein')||has('sell')){ctx.topic='car';const isSell=has('sell')&&!has('tradein');
    return[[isSell?'Выкупаем машины в любом состоянии, с любым пробегом. Оценка бесплатная и ни к чему не обязывает.':'Зачтём вашу машину в стоимость любой из зала. Оценка бесплатная и ни к чему не обязывает.','Напишите марку, модель, год и пробег или отправьте фото в WhatsApp. Менеджер вернётся с предложением.',waBtn(WA_S,isSell?'Здравствуйте! Хочу продать машину: ':'Здравствуйте! Хочу трейд-ин. Моя машина: ','Оценить в WhatsApp')],['Оставить контакт','Подобрать авто']];}
  if(has('europe')){ctx.topic='car';return[['Если нужной машины нет в зале, найдём её в Германии или другой стране ЕС, проверим, растаможим и поставим на учёт в Испании. <span class="flag flag--ink">условия подтвердить</span>','Напишите модель, год, бюджет и пожелания по цвету и опциям.',waBtn(WA_S,'Здравствуйте! Хочу подбор авто из Европы: ','Описать запрос в WhatsApp')],['Оставить контакт','Что есть в зале?']];}
  if(has('warranty')&&!svcHit.length&&ctx.topic!=='svc')return[['На все машины из шоурума даём гарантию 12 месяцев по условиям RED2 Auto Gallery. На ремонт в сервисе тоже есть гарантия, срок <span class="flag flag--ink">подтвердить</span>'],baseChips()];
  if(has('stock')&&C){return[[`${esc(C.brand+' '+C.model)} ${C.year} есть в каталоге на 21.10.2026. Наличие меняется быстро, поэтому лучше уточнить у менеджера: он ответит за пару минут.`,waBtn(WA_S,`Здравствуйте! ${C.brand} ${C.model} ${C.year} ещё в наличии?`,'Уточнить наличие')],['Кредит на эту машину','Тест-драйв','Похожие машины']];}
  if(/похож/.test(t)&&C){const sim=CARS.filter(x=>x.id!==C.id).sort((a,b)=>(a.bodyg!==C.bodyg)-(b.bodyg!==C.bodyg)||Math.abs(a.price-C.price)-Math.abs(b.price-C.price)).slice(0,3);ctx.shown=sim;
    return[['Похожие по классу и цене:',cardsHTML(sim)],['Кредит','Тест-драйв','Подобрать авто']];}
  if(named&&!has('svc')&&!svcHit.length){ctx.topic='car';ctx.car=named;const c=named;
    if(has('price'))return[[`${esc(c.brand+' '+c.model)} ${c.year}: <b>${eur(c.price)}</b>, пробег ${c.km.toLocaleString('ru-RU')} км, ${c.cv} л.с.`,cardsHTML([c])],['Кредит на '+short(c),'Тест-драйв','Похожие машины']];
    return[[`Да, ${esc(c.brand+' '+c.model)} есть в каталоге:`,cardsHTML([c]),(c.hl&&c.hl.length?'Из главного: '+c.hl.slice(0,3).map(esc).join(', ')+'.':'')],['Кредит на '+short(c),'Тест-драйв','Похожие машины']];}

  /* car search */
  const carHint=e.brand||e.body||e.fuel||((e.max||e.min)&&ctx.topic!=='svc')||has('car')||has('cheap')||(has('power')&&!has('s_tune'))||has('newest');
  if(carHint&&!svcHit.length&&!has('book')){
    ctx.topic='car';
    const f=Object.assign({},ctx.f);['brand','body','fuel','max','min','year'].forEach(k=>{if(e[k])f[k]=e[k];});
    if(e.max&&!e.min)delete f.min;if(e.min&&!e.max)delete f.max;
    ctx.f=f;
    const mode=has('cheap')?'cheap':has('power')?'power':has('newest')?'newest':'';
    if(!f.brand&&!f.body&&!f.fuel&&!f.max&&!f.min&&!mode){ctx.await='budget';return[['Подберём. На какой бюджет ориентируетесь? Если есть пожелания по кузову или марке, напишите сразу.'],['До 80 тыс','80–150 тыс','От 150 тыс','Внедорожник','Кабриолет','Porsche']];}
    return carReply(f,mode);
  }

  /* service */
  if(svcHit.length){ctx.topic='svc';const k=svcHit.includes('s_itv')?'s_itv':svcHit[0];ctx.svc=k;const s=S[k];
    const parts=[`<b>${s.t}</b>. ${s.a}`];if(has('price'))parts.push(s.p+(k==='s_align'?'':' <span class="flag flag--ink">ориентир подтвердить</span>'));
    if(has('book'))return bookReply(s.t,parts);
    return[parts,['Записаться','Сколько стоит?','Позвать мастера в WhatsApp']];}
  if(has('book')){ctx.topic='svc';return bookReply(ctx.svc?S[ctx.svc].t:null,[]);}
  if(has('price')){
    if(ctx.topic==='svc'&&ctx.svc){const s=S[ctx.svc];return[[s.p+(ctx.svc==='s_align'?'':' <span class="flag flag--ink">ориентир подтвердить</span>')],SVC_CHIPS];}
    if(ctx.topic==='car'&&C)return[[`${esc(C.brand+' '+C.model)}: <b>${eur(C.price)}</b> (цена при оплате наличными).`],['Кредит на '+short(C),'Тест-драйв']];
    return[['Подскажите, о чём речь: машина из зала или услуга сервиса? Из фиксированного могу сразу назвать развал 3D: от 90 € с IVA.'],['Цены на машины','Развал — цена?','ТО — цена?']];}
  if(has('s_ev'))return[[S.s_ev.a],SVC_CHIPS];
  if(has('svc')){ctx.topic='svc';return[['Что происходит с машиной? Опишите своими словами или выберите:'],['Диагностика','ТО','Развал и шины','Подвеска и тормоза','Кузов','Электрика','PPF','Тюнинг']];}
  if(has('hours'))return[['Работаем <b>Пн–Пт 9:00–19:00, Сб 10:00–14:00</b>, воскресенье выходной. Сервис и шоурум работают по одному графику.'],baseChips()];
  if(has('addr')||/где шоурум/.test(t))return[['Мы в Сан-Педро-де-Алькантара (Марбелья), две локации рядом:<div class="bsum"><span>Шоурум</span><b><a class="u" href="https://maps.google.com/?q=Calle+Fragua+20+Marbella+29603" target="_blank" rel="noopener">Calle Fragua 20, угол C. Granito <svg class="ic-ar" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 9L9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a></b><span>Сервис</span><b><a class="u" href="https://maps.google.com/?q=Calle+Platino+1+Marbella+29603" target="_blank" rel="noopener">C. Platino 1, 29603 <svg class="ic-ar" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 9L9 3M4 3h5v5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></a></b></div>'],['Часы работы','Записаться в сервис','Тест-драйв']];
  if(has('lang'))return[['Говорим на испанском, английском и русском. Сайт в полной версии тоже будет на трёх языках.'],baseChips()];
  if(has('racing'))return[['Владелец RED2 Виталий Бойко — двукратный чемпион Испании по драг-рейсингу. Для клиентов проводим трек-дни в Альмерии, готовим машины к драгу, скоро запустим диностенд <span class="flag flag--ink">скоро</span>'],['Тюнинг','Подготовка к треку','Подобрать авто']];
  if(has('storage'))return[['Есть закрытая охраняемая парковка и хранение автомобилей, в том числе суперкаров. Условия уточнит менеджер.',waBtn(WA,'Здравствуйте! Интересует хранение автомобиля.','Спросить в WhatsApp')],baseChips()];
  if(has('rent'))return[['Про аренду лучше уточнить у менеджера: условия и машины меняются. <span class="flag flag--ink">направление подтвердить</span>',waBtn(WA_S,'Здравствуйте! Интересует аренда авто.','Спросить в WhatsApp')],baseChips()];
  if(has('warranty'))return[['На ремонт в сервисе даём гарантию на все работы, срок <span class="flag flag--ink">подтвердить</span>. На машины из шоурума гарантия 12 месяцев.'],baseChips()];
  if(has('human'))return[['Соединяю с живым менеджером. Выберите, куда написать:',waBtn(WA_S,'Здравствуйте! Вопрос по автосалону.','Автосалон · WhatsApp'),waBtn(WA,'Здравствуйте! Вопрос по сервису.','Сервис · WhatsApp'),'Или позвоните: салон <a class="u" href="tel:+34699589358">+34 699 589 358</a>, сервис <a class="u" href="tel:+34681997777">+34 681 99 77 77</a>.'],['Оставить контакт']];
  if(I.yes.test(t)){return ctx.topic==='car'?[['Отлично. Оставите контакт, чтобы менеджер связался с вами?'],['Оставить контакт','Подобрать авто']]:[['Чем ещё помочь?'],baseChips()];}
  if(I.cancel.test(t))return[['Понял. Если что, я рядом.'],baseChips()];
  /* fallback */
  return[['Не уверен, что понял правильно. Я помогаю с машинами из зала (подбор, кредит, трейд-ин) и сервисом (ремонт, ТО, тюнинг, запись). Попробуйте сформулировать иначе или передам вопрос менеджеру.'],['Подобрать авто','Записаться в сервис','Позвать менеджера']];
}
function bookReply(svcName,pre){
  const parts=pre.slice();
  if(PAGE==='svc'){parts.push(`Запишу${svcName?' на «'+esc(svcName)+'»':''}. Форма ниже уже заполнена: выберите день и время. Обычно запись в течение 24 часов. Могу и здесь принять контакт, менеджер подтвердит в WhatsApp.`,'<button type="button" class="btn btn--red bbtn js-bk" data-s="'+esc(svcName||'')+'">Открыть форму записи<b>↓</b></button>');}
  else parts.push(`Запись в сервис обычно в течение 24 часов. Оставьте контакт здесь или откройте страницу записи${svcName?' на «'+esc(svcName)+'»':''}.`,'<a class="btn btn--red bbtn" href="servis.html#book">Страница записи<b>→</b></a>');
  ctx.lead.detail=svcName||'запись в сервис';
  return[parts,['Оставить контакт','Часы работы','Адрес']];
}
log.addEventListener('click',e=>{const b=e.target.closest('.js-bk');if(!b)return;const f=$('[data-form]');if(f&&b.dataset.s){[...f.svc.options].forEach(o=>{if(o.text===b.dataset.s)f.svc.value=o.text;});}
  close();const t=$('#book');t&&t.scrollIntoView({behavior:RM?'auto':'smooth'});});
/* chip aliases → rewrite to natural phrases handled above */
const _ans=answer;
answer=function(raw){
  const map={'Записаться':'хочу записаться','Сколько стоит?':'сколько стоит','Часы работы':'часы работы','Адрес':'адрес','Где вы находитесь?':'где вы находитесь','Кредит':'кредит','Трейд-ин':'трейд-ин','Тест-драйв':'тест-драйв','Кредит и трейд-ин':'кредит','Позвать менеджера':'менеджер','Цены на машины':'подобрать авто','ТО — цена?':'сколько стоит то','Развал — цена?':'сколько стоит развал','Ещё в наличии?':'еще в наличии','Кредит на эту машину':'кредит','Трейд-ин моей машины':'трейд-ин','Похожие машины':'похожие','Что есть в зале?':'показать все машины','Подбор из Европы':'подбор из европы','Да, отправить':'да','Исправить':'исправить','Отмена':'отмена','Подготовка к треку':'тюнинг для трека','Привезти из Европы':'привезти из европы','Продать свою машину':'продать свою машину','Внедорожник':'внедорожник','Кабриолет':'кабриолет','Купе':'купе'};
  if(/^Кредит на /.test(raw)){const nm=raw.replace('Кредит на ','');const c=CARS.find(x=>short(x)===nm);if(c)ctx.car=c;return _ans('кредит');}
  return _ans(map[raw]||raw);
};
window.R2BOT={open,close,_answer:t=>answer(t)};
})();
