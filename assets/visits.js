(() => {
  const choiceKey="forma.analytics.choice";
  const visitKey="forma.analytics.visit";
  const preference=()=>{try{return localStorage.getItem(choiceKey);}catch{return null;}};
  const blocked=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==="1";
  let allowed=!blocked() && preference()==="yes";
  let visit=null;
  let seenSections=new Set();
  let viewed=false;
  function source(){
    if(!document.referrer)return "direct";
    try{
      const ref=new URL(document.referrer), host=ref.hostname;
      if(ref.origin===location.origin)return "internal";
      if(/(^|\.)(ya\.ru|yandex\.[a-z.]+|google\.[a-z.]+|bing\.com|duckduckgo\.com)$/.test(host))return "search";
      if(/(^|\.)(t\.me|telegram\.org)$/.test(host))return "telegram";
      if(/(^|\.)(vk\.com|ok\.ru|youtube\.com|instagram\.com)$/.test(host))return "social";
    } catch {}
    return "external";
  }
  function context(kind){
    if(!allowed||blocked())return null;
    const day=new Date().toISOString().slice(0,10);
    if(!visit||visit.day!==day){
      try{visit=JSON.parse(sessionStorage.getItem(visitKey)||"null");}catch{}
      if(!visit || visit.day!==day || typeof visit.id!=="string"){
        visit={day,id:crypto.randomUUID(),source:source()};
        try{sessionStorage.setItem(visitKey,JSON.stringify(visit));}catch{}
      }
    }
    const page=location.pathname.replace(/index\.html$/,"").replace(/\/?$/,"/");
    const device=matchMedia("(max-width: 600px)").matches?"mobile":matchMedia("(max-width: 1000px)").matches?"tablet":"desktop";
    return {kind,page,device,source:visit.source,visit:visit.id};
  }
  function record(kind){
    const event=context(kind);if(!event)return;
    fetch("https://api.forma-egor.dynv6.net/events",{method:"POST",credentials:"omit",referrerPolicy:"no-referrer",headers:{"Content-Type":"application/json"},body:JSON.stringify(event),keepalive:true}).catch(()=>{});
  }
  window.formaReceiptContext=()=>context("form_success");
  const sections={studio:"services",services:"services",projects:"portfolio",contact:"contacts"};
  function section(id){
    const kind=sections[id];
    if(!allowed || !kind || seenSections.has(kind))return;
    seenSections.add(kind);record(kind);
  }
  function initial(){
    if(!allowed||viewed)return;
    viewed=true;record("view");
    if(location.pathname==="/portfolio/")section("projects");
    for(const id of Object.keys(sections)){
      const rect=document.getElementById(id)?.getBoundingClientRect();
      if(rect && rect.top<innerHeight*.8 && rect.bottom>innerHeight*.2)section(id);
    }
  }
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting)section(entry.target.id);
    },{rootMargin:"-10% 0px -20% 0px"});
    Object.keys(sections).forEach(id=>{const element=document.getElementById(id);if(element)observer.observe(element);});
  }
  document.addEventListener("click",e=>{
    const link=e.target.closest("a[href]");if(!link||!allowed)return;
    const u=new URL(link.href,location.href);
    if(u.origin!==location.origin){record("external");if(["t.me","telegram.me"].includes(u.hostname)||["mailto:","tel:"].includes(u.protocol))record("contact_click");}
    else if(u.hash==="#contact"){record("contact_click");section("contact");}
    else if(u.hash)section(u.hash.slice(1));
  });
  document.querySelector("[data-inquiry]")?.addEventListener("input",()=>{
    if(allowed&&!seenSections.has("form_start")){seenSections.add("form_start");record("form_start");}
  });
  const panel=document.createElement("aside");
  panel.className="privacy-panel";panel.setAttribute("aria-label","Настройки аналитики");panel.hidden=true;
  const title=document.createElement("strong");title.textContent="Анонимная статистика";
  const info=document.createElement("p");
  info.textContent="С вашего согласия считаем просмотры, разделы, вид устройства и общую категорию источника. Случайный номер визита действует в этой вкладке до конца суток UTC. Сводки хранятся 90 дней. География, рекламные cookies и данные полей формы в статистику не входят.";
  const addBtn=(text,fn)=>{const b=document.createElement("button");b.type="button";b.textContent=text;b.addEventListener("click",fn);return b;};
  const controls=document.createElement("div");
  const note=document.createElement("p");note.setAttribute("role","status");
  function choose(value){
    try{localStorage.setItem(choiceKey,value);}catch{}
    allowed=value==="yes"&&!blocked();
    if(!allowed){try{sessionStorage.removeItem(visitKey);}catch{}visit=null;viewed=false;seenSections=new Set();}
    initial();panel.hidden=true;toggle.focus({preventScroll:true});
  }
  controls.append(addBtn("Отказаться",()=>choose("no")),addBtn("Разрешить",()=>choose("yes")));
  panel.append(title,info,controls,note);document.body.append(panel);
  const toggle=addBtn("Настройки приватности",()=>{panel.hidden=!panel.hidden;if(!panel.hidden){note.textContent=blocked()?"Браузер передаёт сигнал отказа. Аналитика отключена.":allowed?"Аналитика включена.":"Аналитика отключена.";controls.firstElementChild.focus();}});
  toggle.className="privacy-toggle";(document.querySelector("footer")||document.body).append(toggle);
  if(!preference()&&!blocked())panel.hidden=false;
  initial();
})();
