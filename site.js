// Feature flags (toggle to true to show hidden sections)
const FEATURE_FLAGS = {
  trustedBy: false,
  educationLogos: false,
};

document.querySelectorAll('[data-feature]').forEach((el) => {
  const key = el.getAttribute('data-feature');
  if (FEATURE_FLAGS[key] === false) el.style.display = 'none';
});

// Particle canvas (interactive)
(function(){
  const canvas=document.getElementById('particle-canvas');
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=null,visible=false;
  let w,h,particles=[];
  const mouse={x:-9999,y:-9999,active:false};

  const isMobile = window.innerWidth < 768;
  const density = isMobile ? 0.000088 : 0.00012; // ~20% fewer particles
  const minParticles = isMobile ? 56 : 96;
  const maxParticles = isMobile ? 136 : 224;
  const connectDist = isMobile ? 130 : 170; // spread network links out a bit more
  const mouseInfluenceDist = isMobile ? 175 : 235;
  const mouseLineDist = isMobile ? 200 : 270;

  function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
  function targetCount(){return clamp(Math.floor(w*h*density),minParticles,maxParticles);}

  function resize(){
    w=canvas.width=window.innerWidth;
    h=canvas.height=document.getElementById('hero').clientHeight;
  }

  function seedParticles(count){
    particles=[];
    for(let i=0;i<count;i++){
      particles.push({
        x:Math.random()*w,
        y:Math.random()*h,
        vx:(Math.random()-.5)*0.72,
        vy:(Math.random()-.5)*0.72,
        r:Math.random()*1.9+0.8
      });
    }
  }

  resize();
  seedParticles(targetCount());
  window.addEventListener('resize',()=>{ resize(); seedParticles(targetCount()); });

  window.addEventListener('mousemove',(e)=>{mouse.x=e.clientX;mouse.y=e.clientY;mouse.active=true;});
  window.addEventListener('mouseleave',()=>{mouse.active=false;mouse.x=-9999;mouse.y=-9999;});

  function draw(){
    frame=null;
    if(motion.matches||document.hidden||!visible) return;
    ctx.clearRect(0,0,w,h);

    const N=particles.length;
    for(let i=0;i<N;i++){
      const p=particles[i];

      if(mouse.active){
        const mdx=mouse.x-p.x, mdy=mouse.y-p.y;
        const md=Math.hypot(mdx,mdy);
        if(md<mouseInfluenceDist){
          const force=(mouseInfluenceDist-md)/mouseInfluenceDist;
          p.vx -= (mdx/(md||1))*force*0.055;
          p.vy -= (mdy/(md||1))*force*0.055;
        }
      }

      p.x+=p.vx; p.y+=p.vy;
      p.vx*=0.993; p.vy*=0.993;
      if(p.x<0||p.x>w)p.vx*=-1;
      if(p.y<0||p.y>h)p.vy*=-1;

      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,136,0,0.72)';ctx.fill();

      for(let j=i+1;j<N;j++){
        const q=particles[j];
        const dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
        if(d<connectDist){
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);
          ctx.strokeStyle='rgba(255,136,0,'+(1-d/connectDist)*0.28+')';
          ctx.stroke();
        }
      }

      if(mouse.active){
        const dmx=p.x-mouse.x, dmy=p.y-mouse.y, md=Math.hypot(dmx,dmy);
        if(md<mouseLineDist){
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);
          ctx.strokeStyle='rgba(61,255,145,'+(1-md/mouseLineDist)*0.24+')';
          ctx.stroke();
        }
      }
    }

    frame=requestAnimationFrame(draw);
  }
  function sync(){
    if(frame!==null){cancelAnimationFrame(frame);frame=null;}
    if(!motion.matches&&!document.hidden&&visible) frame=requestAnimationFrame(draw);
  }
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(document.getElementById('hero'));
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
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
