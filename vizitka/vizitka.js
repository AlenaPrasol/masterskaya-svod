// Визитка: лоза и дрозд. Прилетает, когда сцена на экране; садится на кончик ветки; ветка пружинит; по клику улетает и возвращается.
(function(){
  const SOOT='#201E1C', PAPER='#E4E3DE';
  const svg=document.getElementById('stage'); if(!svg) return;
  const VX=170, VY=312;
  const VINE=`<path d="M0 0C-30-40-40-90-30-140c-8-40 0-80 24-110" fill="none" stroke="${SOOT}" stroke-width="7" stroke-linecap="round"/>
    <path d="M-28-60c-26-2-46-16-56-40 18-2 36 6 48 20 8 8 10 14 8 20z"/><path d="M-30-120c6-26 24-42 48-46-4 22-18 40-38 48-6 2-10 0-10-2z"/>
    <g class="berry"><circle cx="-46" cy="-92" r="9"/><circle cx="-60" cy="-104" r="8"/><circle cx="-38" cy="-108" r="8"/><circle cx="-52" cy="-120" r="7"/><circle cx="-66" cy="-88" r="7"/></g>`;
  svg.innerHTML=`<defs>
    <g id="b-sit"><path d="M8 46L28 40C34 28 48 22 62 26C90 30 120 44 150 56L198 64L196 78L150 78C140 96 110 106 80 100C58 96 40 84 30 66L22 60Z"/>
      <circle cx="40" cy="40" r="3.6" fill="${PAPER}"/><path d="M80 100l-3 18M96 101l2 18" stroke="${SOOT}" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
    <path id="b-body" d="M2 56L20 50C28 40 40 35 54 37C86 40 118 46 150 52L206 42L198 60L208 80L150 76C122 86 92 88 66 84C46 80 32 72 22 62Z"/>
    <path id="b-wing" d="M-24 2C-14 -22 8 -50 38 -72C54 -84 66 -94 78 -104C76 -84 70 -66 62 -50C54 -34 48 -16 40 4Z"/>
    <path id="b-wingfar" d="M-18 2C-10 -18 6 -40 30 -58C44 -68 54 -76 64 -84C62 -68 58 -54 50 -40C44 -28 40 -12 34 3Z"/></defs>
    <path d="M40 ${VY}H400" stroke="#3C3C3E" stroke-width="1.5"/>
    <g class="vine" transform="translate(${VX} ${VY})"><g id="vBend"><g id="vInner" transform="scale(0.9) rotate(-6)">${VINE}</g></g></g>`;
  // слой птицы поверх всей страницы: полёт не режется шапкой и краем сцены
  const layer=document.createElementNS('http://www.w3.org/2000/svg','svg'); layer.setAttribute('class','bird-layer'); layer.setAttribute('aria-hidden','true');
  layer.innerHTML=`<g class="bird" id="bird"><g transform="translate(-104 -60)"><g id="bFly"><use href="#b-wingfar" transform="translate(98 46)"/><use href="#b-body"/><use href="#b-wing" transform="translate(90 50)"/><circle cx="36" cy="46" r="3.4" fill="${PAPER}"/></g><g id="bSit"><use href="#b-sit"/></g></g></g>`;
  document.body.appendChild(layer);
  const bird=document.getElementById('bird'), bFly=document.getElementById('bFly'), bSit=document.getElementById('bSit');
  const wingN=bFly.children[2], wingF=bFly.children[0], vBend=document.getElementById('vBend'), vInner=document.getElementById('vInner');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches, SC=0.46, f=v=>v.toFixed(1);
  const PERCH_L={x:-7,y:-248}, pt=svg.createSVGPoint();
  function perch(){ pt.x=PERCH_L.x; pt.y=PERCH_L.y; return pt.matrixTransform(svg.getScreenCTM().inverse().multiply(vInner.getScreenCTM())); }
  function toPage(x,y){ const m=svg.getScreenCTM(); return {x:m.a*x+m.c*y+m.e+scrollX, y:m.b*x+m.d*y+m.f+scrollY, k:m.a}; }
  const mk=d=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d',d); return p;};
  const arrive=()=>{const p=perch(); return mk(`M560 300C480 220 420 80 330 -20C270 -90 150 -110 90 -50C40 0 80 80 170 60C240 44 250 -10 200 -30C150 -50 ${p.x+120} ${p.y-60} ${f(p.x)} ${f(p.y)}`);};
  const away=()=>{const p=perch(); return mk(`M${f(p.x)} ${f(p.y)}C${p.x-40} ${p.y-70} 60 -40 200 -80C340 -120 480 -160 640 -220`);};
  const FLAP={arrive:[[0,.3,7],[.3,.5,0],[.5,.78,6],[.78,.92,0],[.92,1,10]], away:[[0,.75,8],[.75,1,0]]};
  const easeOut=t=>1-Math.pow(1-t,1.9);
  let st={phase:'wait',t:0,path:null,len:0,dur:0,flap:null,phi:0,sy:.6,face:1,ang:0,x:0,y:0,on:null,peckT:0,peck:0,turnT:0};
  const bend={a:0,v:0}; let clock=0, sitT=0, roundT=45, visible=true, last=null;
  function setFly(on){ bFly.style.display=on?'':'none'; bSit.style.display=on?'none':''; }
  function draw(){
    let a=st.ang,x=st.x,y=st.y,face=st.face;
    if(st.on==='vine'){ const p=perch(); x=p.x+6*face; y=p.y-27; a=bend.a*.8+st.peck; }
    const Pg=toPage(x,y);
    bird.setAttribute('transform',`translate(${f(Pg.x)} ${f(Pg.y)}) rotate(${f(a)}) scale(${(face*SC*Pg.k).toFixed(3)} ${(SC*Pg.k).toFixed(3)})`);
    wingN.setAttribute('transform',`translate(90 50) scale(1 ${st.sy.toFixed(3)})`); wingF.setAttribute('transform',`translate(98 46) rotate(8) scale(.9 ${(st.sy*.95).toFixed(3)})`);
    vBend.setAttribute('transform',`rotate(${f(bend.a)})`);
  }
  function start(phase,path,dur){ st.phase=phase; st.path=path; st.len=path.getTotalLength(); st.dur=dur; st.t=0; st.flap=FLAP[phase]; st.on=null; setFly(true); }
  function land(){ st.on='vine'; st.ang=0; st.phase='sit'; st.peckT=2.5+Math.random()*3; st.turnT=6+Math.random()*8; setFly(false); bend.v+=95; }
  function hzAt(s){ for(const [a,b,hz] of st.flap) if(s>=a&&s<=b) return hz; return 0; }
  function tick(dt){
    clock+=dt; const rest=1.1*Math.sin(clock*2*Math.PI/6.5);
    bend.v+=(-70*(bend.a-rest)-5.2*bend.v)*dt; bend.a+=bend.v*dt;
    if(st.phase==='arrive'||st.phase==='away'){
      st.t+=dt; const u=Math.min(1,st.t/st.dur), s=st.phase==='away'?(u*u*(3-2*u)*.6+u*.4):easeOut(u);
      const L=st.len,p=st.path.getPointAtLength(s*L),q=st.path.getPointAtLength(Math.min(L,s*L+28));
      const dx=q.x-p.x,dy=q.y-p.y,th=Math.atan2(dy,dx)*180/Math.PI; if(Math.abs(dx)>4) st.face=dx<0?1:-1;
      let ang=st.face===1?th-180:th; ang=((ang+540)%360)-180; ang=Math.max(-42,Math.min(42,ang)); st.ang+=(ang-st.ang)*Math.min(1,dt*10);
      const hz=hzAt(s);
      if(hz){ st.phi+=hz*dt*2*Math.PI; st.sy=0.08+0.92*Math.cos(st.phi); st.x=p.x; st.y=p.y-3*Math.sin(st.phi); } else { st.sy+=(0.55-st.sy)*Math.min(1,dt*6); st.x=p.x; st.y=p.y; }
      if(u>=1){ if(st.phase==='arrive') land(); else { bird.style.display='none'; st.phase='gone'; sitT=0; } }
    } else if(st.phase==='sit'){
      sitT+=dt; st.peckT-=dt; st.turnT-=dt;
      if(st.peckT<0){ st.peck=9; st.peckT=4+Math.random()*5; setTimeout(()=>{st.peck=0;},260); }
      if(st.turnT<0){ st.face=-st.face; st.turnT=9+Math.random()*10; }
      if(sitT>roundT&&visible){ roundT=80+Math.random()*40; shoo(); }
    } else if(st.phase==='gone'){ sitT+=dt; if(sitT>1.4){ bird.style.display=''; sitT=0; start('arrive',arrive(),4.6); } }
    draw();
  }
  function frame(now){ if(last==null) last=now; const dt=Math.min(.05,(now-last)/1000); last=now; tick(dt); if(!document.hidden) requestAnimationFrame(frame); else { last=null; setTimeout(()=>requestAnimationFrame(frame),300); } }
  function shoo(){ if(st.phase==='sit'){ sitT=0; start('away',away(),2.0); } }
  bird.addEventListener('click',shoo); svg.querySelector('.vine').addEventListener('click',shoo);
  setFly(false); bird.style.display='none'; draw();
  const probe=location.hash==='#probe';
  function begin(){
    if(reduce){ st.face=1; land(); bend.v=0; draw(); addEventListener('resize',draw); return; }
    bird.style.display=''; start('arrive',arrive(),4.6);
    if(!probe) requestAnimationFrame(frame);
  }
  let begun=false;
  if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ visible=es.some(e=>e.isIntersecting); if(!begun&&visible){begun=true;begin();} },{threshold:.15}); io.observe(svg); }
  else { begun=true; begin(); }
  window.__viz={advance:sec=>{for(let i=0;i<sec*60;i++)tick(1/60);}, begin:()=>{if(!begun){begun=true;begin();}}};
  const hd=document.querySelector('header'); addEventListener('scroll',()=>hd.classList.toggle('on',scrollY>10),{passive:true});
})();
