// Particle canvas (interactive)
(function(){
  const canvas=document.getElementById('particle-canvas');
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=null;
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
    h=canvas.height=window.innerHeight;
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
    if(motion.matches||document.hidden) return;
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
    if(!motion.matches&&!document.hidden) frame=requestAnimationFrame(draw);
  }
  sync();
  document.addEventListener('visibilitychange',sync);
  motion.addEventListener('change',sync);
})();


