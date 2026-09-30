// Свод из камней: рисуем в SVG, собираем, когда чертёж виден; птица прилетает, садится на замок, перелетает на лозу.
(function(){
  const INK='#3C3C3E', SOOT='#201E1C', PAPER='#E4E3DE';
  const svg=document.getElementById('svod');
  if(!svg) return;
  const SERVICES=JSON.parse(document.getElementById('svod-data').textContent); // [{id,label},...] 6 штук + замок
  const cx=330, cy=330, r1=170, r2=248, n=7, step=Math.PI/n;
  const P=(r,a)=>[cx+r*Math.cos(a), cy-r*Math.sin(a)];
  const f=v=>v.toFixed(1);
  let out='', delay=0.05;
  // силуэты птицы: сидит (как на обложке) и летит (тело + два крыла, машут масштабом по оси Y от плеча)
  out+=`<defs>
    <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
    <filter id="blur6" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
    <g id="b-sit"><path d="M8 46L28 40C34 28 48 22 62 26C90 30 120 44 150 56L198 64L196 78L150 78C140 96 110 106 80 100C58 96 40 84 30 66L22 60Z"/>
      <circle cx="40" cy="40" r="3.6" fill="${PAPER}"/><path d="M80 100l-3 18M96 101l2 18" stroke="${SOOT}" stroke-width="3.5" stroke-linecap="round" fill="none"/></g>
    <path id="b-body" d="M2 56L20 50C28 40 40 35 54 37C86 40 118 46 150 52L206 42L198 60L208 80L150 76C122 86 92 88 66 84C46 80 32 72 22 62Z"/>
    <path id="b-wing" d="M-24 2C-14 -22 8 -50 38 -72C54 -84 66 -94 78 -104C76 -84 70 -66 62 -50C54 -34 48 -16 40 4Z"/>
    <path id="b-wingfar" d="M-18 2C-10 -18 6 -40 30 -58C44 -68 54 -76 64 -84C62 -68 58 -54 50 -40C44 -28 40 -12 34 3Z"/>
  </defs>`;
  // опоры и пяты
  out+=`<path class="ground" d="M${cx-r2-40} ${cy+126}H${cx+r2+40}" stroke="${INK}" stroke-width="2" fill="none"/>`;
  let h='';for(let x=cx-r2-40;x<cx+r2+40;x+=16)h+=`M${x} ${cy+126}l-10 14`;
  out+=`<path class="ground" d="${h}" stroke="${INK}" stroke-width="1" fill="none"/>`;
  const G=cy+126;
  out+=`<path class="shade" filter="url(#blur6)" d="M${cx-r2} ${G}V${cy}A${r2} ${r2} 0 0 1 ${cx+r2} ${cy}V${G}H${cx+r1}V${cy}A${r1} ${r1} 0 0 0 ${cx-r1} ${cy}V${G}Z"/>`;
  out+=`<rect class="pier" style="animation-delay:${delay}s" x="${cx-r2}" y="${cy+6}" width="${r2-r1}" height="120" fill="#D8D7D2" stroke="${INK}" stroke-width="2"/>`;
  out+=`<rect class="pier" style="animation-delay:${delay+0.08}s" x="${cx+r1}" y="${cy+6}" width="${r2-r1}" height="120" fill="#D8D7D2" stroke="${INK}" stroke-width="2"/>`;
  out+=`<rect class="imp" style="animation-delay:${delay+0.22}s" x="${cx-r2-8}" y="${cy-6}" width="${r2-r1+16}" height="12" fill="${INK}"/>`;
  out+=`<rect class="imp" style="animation-delay:${delay+0.3}s" x="${cx+r1-8}" y="${cy-6}" width="${r2-r1+16}" height="12" fill="${INK}"/>`;
  // камни: снизу вверх попарно, замок последним
  const order=[0,6,1,5,2,4,3]; let t=delay+0.4;
  const pos={}; order.forEach((i,k)=>{pos[i]=t; t+= (i===3?0.2:0.13);});
  const items=SERVICES.filter(s=>s.id!=='key'); // 6 услуг
  const map={0:items[0],1:items[1],2:items[2],3:{id:'key',label:'Приход'},4:items[3],5:items[4],6:items[5]};
  let labels='';
  for(let i=0;i<n;i++){
    const a=Math.PI-i*step, b=Math.PI-(i+1)*step, am=(a+b)/2, key=i===3, s=map[i];
    const [x1,y1]=P(r1,a),[x2,y2]=P(r2,a),[x3,y3]=P(r2,b),[x4,y4]=P(r1,b);
    out+=`<path class="stone${key?' key':''}" data-id="${s.id}" style="animation-delay:${pos[i]}s" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r2} ${r2} 0 0 1 ${f(x3)} ${f(y3)}L${f(x4)} ${f(y4)}A${r1} ${r1} 0 0 0 ${f(x1)} ${f(y1)}Z"><title>${s.label}</title></path>`;
    if(key){const [kx,ky]=P((r1+r2)/2,am);labels+=`<text class="lbl keylbl" x="${f(kx)}" y="${f(ky+6)}" text-anchor="middle" font-family="PT Sans" font-size="15" fill="${PAPER}" style="pointer-events:none">Приход</text>`;continue;}
    const [lx1,ly1]=P(r2+4,am),[lx2,ly2]=P(r2+22,am),[tx,ty]=P(r2+34,am);
    const left=am>Math.PI/2, ls=s.label.split('|');
    labels+=`<path class="leader" d="M${f(lx1)} ${f(ly1)}L${f(lx2)} ${f(ly2)}"/>`;
    labels+=`<text class="lbl" data-id="${s.id}" x="${f(tx)}" y="${f(ty+(ls.length>1?-4:5))}" text-anchor="${left?'end':'start'}">${ls.map((l,k)=>`<tspan x="${f(tx)}" dy="${k?20:0}">${l}</tspan>`).join('')}</text>`;
  }
  out+=labels;
  out+=`<path class="dimline" d="M${cx-r2} ${cy+166}H${cx+r2}M${cx-r2} ${cy+160}v12M${cx+r2} ${cy+160}v12" stroke="${INK}" stroke-width="1" fill="none"/>`;
  out+=`<text class="dim" x="${cx}" y="${cy+188}" text-anchor="middle">пролёт — шесть работ, замок — приход</text>`;
  // лоза растёт из земли слева от опоры, не касаясь свода; гнётся под птицей (пружина в движке ниже)
  const VX=cx-r2-64, VY=cy+126;
  const VINE=`<path d="M0 0C-30-40-40-90-30-140c-8-40 0-80 24-110" fill="none" stroke="${SOOT}" stroke-width="7" stroke-linecap="round"/>
    <path d="M-28-60c-26-2-46-16-56-40 18-2 36 6 48 20 8 8 10 14 8 20z"/><path d="M-30-120c6-26 24-42 48-46-4 22-18 40-38 48-6 2-10 0-10-2z"/>
    <g class="berry"><circle cx="-46" cy="-92" r="9"/><circle cx="-60" cy="-104" r="8"/><circle cx="-38" cy="-108" r="8"/><circle cx="-52" cy="-120" r="7"/><circle cx="-66" cy="-88" r="7"/></g>`;
  out+=`<g class="vine" transform="translate(${VX} ${VY})"><g id="vBend"><g id="vInner" transform="scale(0.46) rotate(-6)">${VINE}</g></g></g>`;
  svg.innerHTML=out;
  // слой птицы: отдельный svg на всю страницу поверх шапки и текста, чтобы полёт нигде не резался
  const layer=document.createElementNS('http://www.w3.org/2000/svg','svg'); layer.setAttribute('class','bird-layer'); layer.setAttribute('aria-hidden','true');
  layer.innerHTML=`<g class="bird" id="bird"><g transform="translate(-104 -60)"><g id="bFly"><use href="#b-wingfar" transform="translate(98 46)"/><use href="#b-body"/><use href="#b-wing" transform="translate(90 50)"/><circle cx="36" cy="46" r="3.4" fill="${PAPER}"/></g><g id="bSit"><use href="#b-sit"/></g></g></g>`;
  document.body.appendChild(layer);

  // ---- птица: движок полёта ----
  const bird=document.getElementById('bird'), bFly=document.getElementById('bFly'), bSit=document.getElementById('bSit');
  const wingN=bFly.children[2], wingF=bFly.children[0];
  const vBend=document.getElementById('vBend'), vInner=document.getElementById('vInner');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PERCH_L={x:-7,y:-248};                        // кончик ветки                       // точка на ветке (в координатах лозы)
  const KEY={x:cx,y:cy-r2};                            // верх замкового камня
  const pt=svg.createSVGPoint();
  function perchWorld(){ pt.x=PERCH_L.x; pt.y=PERCH_L.y; return pt.matrixTransform(svg.getScreenCTM().inverse().multiply(vInner.getScreenCTM())); }
  // координаты чертежа → координаты страницы (слой птицы лежит в пикселях страницы)
  function toPage(x,y){ const m=svg.getScreenCTM(); return {x:m.a*x+m.c*y+m.e+scrollX, y:m.b*x+m.d*y+m.f+scrollY, k:m.a}; }
  const mkPath=d=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d',d); return p;};
  // траектории: прилёт с подъёмом над сводом, перелёт с замка на ветку, отлёт (по клику)
  const arrive=()=>mkPath(`M900 470C760 380 640 170 560 -10C520 -120 400 -240 260 -236C120 -232 50 -120 120 -50C180 8 320 -90 400 -70C470 -54 440 10 400 40C378 58 350 74 ${KEY.x} ${KEY.y}`);
  const hop=()=>{const p=perchWorld(); return mkPath(`M${KEY.x} ${KEY.y}C300 120 240 170 190 230C150 280 ${p.x+70} ${p.y-30} ${f(p.x)} ${f(p.y)}`);};
  const away=()=>{const p=perchWorld(); return mkPath(`M${f(p.x)} ${f(p.y)}C${p.x-60} ${p.y-60} 40 60 180 -20C360 -120 620 -200 960 -330`);};
  // машущие участки по ходу траектории: [от, до, герц]
  const FLAP={arrive:[[0,.34,7],[.34,.55,0],[.55,.8,6],[.8,.93,0],[.93,1,10]], hop:[[0,.25,0],[.25,.7,7],[.7,1,10]], away:[[0,.75,8],[.75,1,0]]};
  const easeOut=t=>1-Math.pow(1-t,1.9), easeInOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  let st={phase:'wait', t:0, path:null, len:0, dur:0, ease:easeOut, flap:null, phi:0, sy:.6, face:1, ang:0, x:0, y:0, on:null, next:null, peckT:0, peck:0, turnT:0};
  const bend={a:0, v:0};                                // прогиб ветки: угол и скорость (пружина)
  function setFly(on){ bFly.style.display=on?'':'none'; bSit.style.display=on?'none':''; }
  function draw(){
    let a=st.ang, x=st.x, y=st.y, face=st.face;
    if(st.on==='vine'){ const p=perchWorld(); x=p.x+6*face; y=p.y-29; a=bend.a*.8+st.peck; }
    else if(st.on==='key'){ x=KEY.x+6*face; y=KEY.y-29; a=st.peck; }
    const Pg=toPage(x,y);
    bird.setAttribute('transform',`translate(${f(Pg.x)} ${f(Pg.y)}) rotate(${f(a)}) scale(${(face*0.5*Pg.k).toFixed(3)} ${(0.5*Pg.k).toFixed(3)})`);
    const sy=st.sy; wingN.setAttribute('transform',`translate(90 50) scale(1 ${sy.toFixed(3)})`); wingF.setAttribute('transform',`translate(98 46) rotate(8) scale(.9 ${(sy*.95).toFixed(3)})`);
    vBend.setAttribute('transform',`rotate(${f(bend.a)})`);
  }
  function start(phase, path, dur, after){
    st.phase=phase; st.path=path; st.len=path.getTotalLength(); st.dur=dur; st.t=0; st.flap=FLAP[phase]; st.on=null; st.next=after;
    st.ease=phase==='away'?(t=>t*t*(3-2*t)*.6+t*.4):easeOut; setFly(true);
  }
  function land(where){ st.on=where; st.ang=0; st.phase='sit'; st.peckT=2.5+Math.random()*3; st.turnT=6+Math.random()*8; setFly(false); if(where==='vine'){ bend.v+=95; } }
  function hzAt(s){ for(const [a,b,hz] of st.flap) if(s>=a&&s<=b) return hz; return 0; }
  let last=null, clock=0, sitT=0, roundT=38, visible=true;
  function frame(now){
    if(last==null) last=now; let dt=Math.min(.05,(now-last)/1000); last=now;
    tick(dt);
    if(!document.hidden) requestAnimationFrame(frame); else { last=null; setTimeout(()=>requestAnimationFrame(frame),300); }
  }
  function tick(dt){
    clock+=dt;
    // ветка: пружина + едва заметное дыхание ветра
    const rest=1.1*Math.sin(clock*2*Math.PI/6.5);
    bend.v+=(-70*(bend.a-rest)-5.2*bend.v)*dt; bend.a+=bend.v*dt;
    if(st.phase==='arrive'||st.phase==='hop'||st.phase==='away'){
      st.t+=dt; const u=Math.min(1,st.t/st.dur), s=st.ease(u);
      const L=st.len, p=st.path.getPointAtLength(s*L), q=st.path.getPointAtLength(Math.min(L,s*L+28));
      const dx=q.x-p.x, dy=q.y-p.y, th=Math.atan2(dy,dx)*180/Math.PI;
      if(Math.abs(dx)>4) st.face= dx<0?1:-1;
      let ang= st.face===1? th-180: th; ang=((ang+540)%360)-180; ang=Math.max(-42,Math.min(42,ang));
      st.ang+= (ang-st.ang)*Math.min(1,dt*10);
      const hz=hzAt(s);
      if(hz){ st.phi+=hz*dt*2*Math.PI; st.sy=0.08+0.92*Math.cos(st.phi); st.x=p.x; st.y=p.y-3*Math.sin(st.phi); }
      else { st.sy+= (0.55-st.sy)*Math.min(1,dt*6); st.x=p.x; st.y=p.y; }
      if(u>=1){ if(st.phase==='arrive') land('key'); else if(st.phase==='hop') land('vine'); else { bird.style.display='none'; st.phase='gone'; sitT=0; } }
    } else if(st.phase==='sit'){
      sitT+=dt; st.peckT-=dt; st.turnT-=dt;
      if(st.on==='key' && sitT>2.1){ sitT=0; start('hop',hop(),1.8); }
      else { if(st.peckT<0){ st.peck=9; st.peckT=4+Math.random()*5; setTimeout(()=>{st.peck=0;},260); }
             if(st.on==='vine' && st.turnT<0){ st.face=-st.face; st.turnT=9+Math.random()*10; }
             if(st.on==='vine' && sitT>roundT && visible){ roundT=80+Math.random()*40; shoo(); } }
    } else if(st.phase==='gone'){ sitT+=dt; if(sitT>1.4){ bird.style.display=''; sitT=0; start('arrive',arrive(),5.4); } }
    draw();
  }
  const probe=location.hash==='#probe';   // проверка кадров: window.__svod.advance(сек) двигает время руками
  function begin(){
    if(reduce){ svg.classList.add('anim'); st.face=1; land('vine'); bend.v=0; draw(); addEventListener('resize',draw); return; }
    svg.classList.add('anim'); bird.style.display='none';
    if(probe){ bird.style.display=''; start('arrive',arrive(),5.4); return; }
    setTimeout(()=>{ bird.style.display=''; start('arrive',arrive(),5.4); }, 600);
    requestAnimationFrame(frame);
  }
  // птицу можно спугнуть: улетит и вернётся тем же путём
  function shoo(){ if(st.phase==='sit'&&st.on==='vine'){ sitT=0; start('away',away(),2.0); } }
  bird.addEventListener('click',shoo); document.querySelector('.vine').addEventListener('click',shoo);
  setFly(false); bird.style.display='none'; draw();
  // собираем свод, когда чертёж на экране (на телефоне он ниже текста)
  const draw_=svg.closest('.draw')||svg; let begun=false;
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>{ visible=es.some(e=>e.isIntersecting); if(!begun && visible){ begun=true; begin(); } },{threshold:.15});
    io.observe(draw_);
  } else { begun=true; begin(); }
  // для проверки: window.__svod.seek(t) перематывает время
  window.__svod={st,bend,begin:()=>{if(!begun){begun=true;begin();}},advance:sec=>{for(let i=0;i<sec*60;i++)tick(1/60);}};

  // связь камень ↔ строка таблицы
  const rows=[...document.querySelectorAll('.spec tr[data-id]')];
  function on(id,state){
    svg.querySelectorAll(`[data-id="${id}"]`).forEach(e=>e.classList.toggle('on',state));
    rows.forEach(r=>r.classList.toggle('on',state&&r.dataset.id===id));
  }
  svg.querySelectorAll('.stone:not(.key),.lbl[data-id]').forEach(e=>{
    e.addEventListener('mouseenter',()=>on(e.dataset.id,true));
    e.addEventListener('mouseleave',()=>on(e.dataset.id,false));
    e.addEventListener('click',()=>{const r=document.querySelector(`.spec tr[data-id="${e.dataset.id}"]`); if(r){r.scrollIntoView({behavior:'smooth',block:'center'}); on(e.dataset.id,true); setTimeout(()=>on(e.dataset.id,false),1800);}});
  });
  rows.forEach(r=>{r.addEventListener('mouseenter',()=>on(r.dataset.id,true));r.addEventListener('mouseleave',()=>on(r.dataset.id,false));});
  // шапка
  const hd=document.querySelector('header');
  addEventListener('scroll',()=>hd.classList.toggle('on',scrollY>10),{passive:true});
})();
