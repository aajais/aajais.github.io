// Feature flags (toggle to true to show hidden sections)
const FEATURE_FLAGS = {
  trustedBy: false,
  educationLogos: false,
};

document.querySelectorAll('[data-feature]').forEach((el) => {
  const key = el.getAttribute('data-feature');
  if (FEATURE_FLAGS[key] === false) el.style.display = 'none';
});

// Keep the complete tagline in the HTML and accessibility tree while typing a visual overlay.
(function(){
  const el=document.querySelector('.hero-eyebrow');
  if(!el) return;
  const text=el.textContent.trim();
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const source=document.createElement('span');
  source.textContent=text;
  const visual=document.createElement('span');
  visual.className='typing-overlay';
  visual.setAttribute('aria-hidden','true');
  el.replaceChildren(source,visual);
  let timer=null,index=0,deleting=false;
  function tick(){
    index+=deleting?-1:1;
    visual.textContent=text.slice(0,index);
    let delay=deleting?35:70+Math.random()*60;
    if(index===text.length){deleting=true;delay=2200;}
    if(index===0){deleting=false;delay=600;}
    timer=setTimeout(tick,delay);
  }
  function sync(){
    clearTimeout(timer);
    const active=!motion.matches&&!document.hidden;
    el.classList.toggle('is-typing',active);
    if(active){index=0;deleting=false;visual.textContent='';tick();}
  }
  motion.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
  sync();
})();

// Navigation state stays synchronized for mouse, touch, and keyboard users.
const menuButton=document.querySelector('.nav-toggle');
const menu=document.querySelector('.nav-links');
function setMenu(open){
  menu.classList.toggle('open',open);
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');
}
menuButton.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('click',e=>{if(!e.target.closest('nav')) setMenu(false);});
matchMedia('(min-width:769px)').addEventListener('change',()=>setMenu(false));
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  if(menu.classList.contains('open')){setMenu(false);menuButton.focus();}
  if(document.getElementById('chatPanel').classList.contains('open')) toggleChat();
});

// Crossfade only while the gallery is visible, the tab is active, and motion is allowed.
(function(){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.talk-gallery').forEach(gallery=>{
    const slides=[...gallery.querySelectorAll(':scope > a')];
    if(slides.length<2) return;
    gallery.setAttribute('aria-roledescription','carousel');
    gallery.setAttribute('aria-description','Photos advance automatically. Focus a photo to pause; use left and right arrow keys to browse.');
    const controls=document.createElement('div');controls.className='slideshow-controls';
    const count=document.createElement('span');count.className='slideshow-count';
    controls.append(count);gallery.append(controls);gallery.classList.add('is-ready');
    let index=0,timer=null,visible=false,hovered=false,generation=0;
    function render(){
      slides.forEach((slide,i)=>{
        const active=i===index;slide.classList.toggle('is-active',active);
        slide.setAttribute('aria-hidden',String(!active));slide.tabIndex=active?0:-1;
      });
      count.textContent=`${index+1} / ${slides.length}`;
    }
    async function show(n,manual=false){
      const target=(n+slides.length)%slides.length,token=++generation;
      const img=slides[target].querySelector('img');img.loading='eager';
      try{await img.decode();}catch{return;}
      if(token!==generation || (!manual&&!canPlay())) return;
      index=target;render();
      if(manual) slides[index].focus({preventScroll:true});
    }
    function canPlay(){return visible&&!document.hidden&&!motion.matches&&!hovered&&!gallery.contains(document.activeElement);}
    function sync(){
      generation++;clearInterval(timer);timer=null;
      if(canPlay()) timer=setInterval(()=>show(index+1),4500);
    }
    gallery.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowLeft'?-1:1),true);}
    });
    gallery.addEventListener('focusin',sync);
    gallery.addEventListener('focusout',()=>queueMicrotask(sync));
    gallery.addEventListener('mouseenter',()=>{hovered=true;sync();});
    gallery.addEventListener('mouseleave',()=>{hovered=false;sync();});
    new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      if(visible){slides[index].querySelector('img').loading='eager';slides[(index+1)%slides.length].querySelector('img').loading='eager';}
      sync();
    },{threshold:.1}).observe(gallery);
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
    render();
  });
})();

window.addEventListener('scroll',()=>{
  const range=document.documentElement.scrollHeight-innerHeight;
  document.getElementById('scroll-progress').style.width=(range>0?scrollY/range*100:0)+'%';
  document.getElementById('backToTop').classList.toggle('visible',scrollY>600);
},{passive:true});

// Preset FAQ reads its facts from the visible page instead of duplicating a biography.
function toggleChat(){
  const panel=document.getElementById('chatPanel'),button=document.querySelector('.chat-toggle');
  const open=panel.classList.toggle('open');
  button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close profile FAQ':'Open profile FAQ');
  if(open) document.getElementById('chatInput').focus();else button.focus();
}
function addMsg(text,type){
  const d=document.createElement('div');d.className='chat-msg '+type;d.textContent=text;
  const m=document.getElementById('chatMessages');m.append(d);m.scrollTop=m.scrollHeight;
}
function sendChip(t){addMsg(t,'user');respond(t);}
function sendChat(){const i=document.getElementById('chatInput');const t=i.value.trim();if(!t)return;addMsg(t,'user');respond(t);i.value='';}
function respond(q){
  const l=q.toLowerCase();let a;
  const text=selector=>document.querySelector(selector)?.innerText.replace(/\s+/g,' ').trim()||'';
  if(/talk|workshop|webinar|speaking/.test(l)) a=[...document.querySelectorAll('.talk-card')].map(c=>c.querySelector('h3').textContent+' — '+c.querySelector('time').textContent).join('\n');
  else if(/resume|cv|download/.test(l)) a='The Resume section links to the current one-page PDF. '+text('.resume-date');
  else if(/contact|email|reach/.test(l)) a='Email: '+text('.contact-item a[href^="mailto:"]')+'. LinkedIn and GitHub links are in Contact.';
  else if(/trell|recommend/.test(l)) a=text('.project-card:nth-child(2) .project-impact');
  else if(/research|paper|publication|citation|diffusion/.test(l)) a=text('#papers')+' See Research & Publications for the reports and published papers.';
  else if(/skill|tech|stack/.test(l)) a=text('#skills').slice(0,700);
  else if(/education|degree|university/.test(l)) a=text('#education');
  else if(/beyond|hobby|guitar|photo/.test(l)) a=text('#beyond');
  else if(/project|agent|security/.test(l)) a=[...document.querySelectorAll('.project-card h3')].map(e=>e.textContent).join('; ')+'. Each case study links to its evidence.';
  else if(/coreweave|current|role|work|wandb|weights/.test(l)) a=text('.journey-item:first-child')+' '+text('.journey-item:nth-child(2)');
  else a='This FAQ covers work, projects, research, skills, talks, education, and the resume. For other questions, use the email in Contact.';
  addMsg(a,'bot');
}
