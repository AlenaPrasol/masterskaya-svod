// Свод из камней: рисуем в SVG, оживляем один раз, связываем с таблицей услуг.
(function(){
  const INK='#3C3C3E', RED='#B4452C';
  const svg=document.getElementById('svod');
  if(!svg) return;
  const SERVICES=JSON.parse(document.getElementById('svod-data').textContent); // [{id,label},...] 6 штук + замок
  const cx=330, cy=330, r1=170, r2=248, n=7, step=Math.PI/n;
  const P=(r,a)=>[cx+r*Math.cos(a), cy-r*Math.sin(a)];
  const f=v=>v.toFixed(1);
  let out='', delay=0.15;
  // опоры и пяты
  out+=`<path class="ground" d="M${cx-r2-40} ${cy+126}H${cx+r2+40}" stroke="${INK}" stroke-width="2" fill="none"/>`;
  let h='';for(let x=cx-r2-40;x<cx+r2+40;x+=16)h+=`M${x} ${cy+126}l-10 14`;
  out+=`<path class="ground" d="${h}" stroke="${INK}" stroke-width="1" fill="none"/>`;
  out+=`<rect class="pier" style="animation-delay:${delay}s" x="${cx-r2}" y="${cy+6}" width="${r2-r1}" height="120" fill="#D8D7D2" stroke="${INK}" stroke-width="2"/>`;
  out+=`<rect class="pier" style="animation-delay:${delay+0.1}s" x="${cx+r1}" y="${cy+6}" width="${r2-r1}" height="120" fill="#D8D7D2" stroke="${INK}" stroke-width="2"/>`;
  out+=`<rect class="imp" style="animation-delay:${delay+0.35}s" x="${cx-r2-8}" y="${cy-6}" width="${r2-r1+16}" height="12" fill="${INK}"/>`;
  out+=`<rect class="imp" style="animation-delay:${delay+0.45}s" x="${cx+r1-8}" y="${cy-6}" width="${r2-r1+16}" height="12" fill="${INK}"/>`;
  // камни: снизу вверх попарно, замок последним
  const order=[0,6,1,5,2,4,3]; let t=delay+0.6;
  const pos={}; order.forEach((i,k)=>{pos[i]=t; t+= (i===3?0.35:0.22);});
  const items=SERVICES.filter(s=>s.id!=='key'); // 6 услуг
  const map={0:items[0],1:items[1],2:items[2],3:{id:'key',label:'Приход'},4:items[3],5:items[4],6:items[5]};
  let labels='';
  for(let i=0;i<n;i++){
    const a=Math.PI-i*step, b=Math.PI-(i+1)*step, am=(a+b)/2, key=i===3, s=map[i];
    const [x1,y1]=P(r1,a),[x2,y2]=P(r2,a),[x3,y3]=P(r2,b),[x4,y4]=P(r1,b);
    out+=`<path class="stone${key?' key':''}" data-id="${s.id}" style="animation-delay:${pos[i]}s" d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r2} ${r2} 0 0 1 ${f(x3)} ${f(y3)}L${f(x4)} ${f(y4)}A${r1} ${r1} 0 0 0 ${f(x1)} ${f(y1)}Z"><title>${s.label}</title></path>`;
    if(key){const [kx,ky]=P((r1+r2)/2,am);labels+=`<text class="lbl keylbl" x="${f(kx)}" y="${f(ky+6)}" text-anchor="middle" font-family="PT Sans" font-size="15" fill="#E4E3DE" style="pointer-events:none">Приход</text>`;continue;}
    const [lx1,ly1]=P(r2+4,am),[lx2,ly2]=P(r2+22,am),[tx,ty]=P(r2+34,am);
    const left=am>Math.PI/2, ls=s.label.split('|');
    labels+=`<path class="leader" d="M${f(lx1)} ${f(ly1)}L${f(lx2)} ${f(ly2)}"/>`;
    labels+=`<text class="lbl" data-id="${s.id}" x="${f(tx)}" y="${f(ty+(ls.length>1?-4:5))}" text-anchor="${left?'end':'start'}">${ls.map((l,k)=>`<tspan x="${f(tx)}" dy="${k?20:0}">${l}</tspan>`).join('')}</text>`;
  }
  out+=labels;
  out+=`<path class="dimline" d="M${cx-r2} ${cy+166}H${cx+r2}M${cx-r2} ${cy+160}v12M${cx+r2} ${cy+160}v12" stroke="${INK}" stroke-width="1" fill="none"/>`;
  out+=`<text class="dim" x="${cx}" y="${cy+188}" text-anchor="middle">пролёт — шесть работ, замок — приход</text>`;
  // лоза растёт из левой опоры; птица садится на левую пяту (замок остаётся чистым)
  const px=cx-r2, py=cy+6;
  out+=`<g class="vine" transform="translate(${px-6} ${py+112}) scale(0.62) rotate(-6)">
    <path d="M0 0C-30-40-40-90-30-140c-8-40 0-80 24-110" fill="none" stroke="#201E1C" stroke-width="7" stroke-linecap="round"/>
    <path d="M-28-60c-26-2-46-16-56-40 18-2 36 6 48 20 8 8 10 14 8 20z"/><path d="M-30-120c6-26 24-42 48-46-4 22-18 40-38 48-6 2-10 0-10-2z"/><path d="M-10-190c-24 4-44-4-58-22 20-6 42-2 56 10 4 4 4 8 2 12z"/>
    <g class="berry"><circle cx="-46" cy="-92" r="9"/><circle cx="-60" cy="-104" r="8"/><circle cx="-38" cy="-108" r="8"/><circle cx="-52" cy="-120" r="7"/><circle cx="-66" cy="-88" r="7"/></g></g>`;
  const bx=px-26, by=py+24;
  out+=`<g class="bird" id="bird"><g transform="translate(${bx-50} ${by-62}) scale(0.5)">
    <path d="M8 46L28 40C34 28 48 22 62 26C90 30 120 44 150 56L198 64L196 78L150 78C140 96 110 106 80 100C58 96 40 84 30 66L22 60Z"/>
    <circle cx="40" cy="40" r="3.6" fill="#E4E3DE"/>
    <path d="M80 100l-3 18M96 101l2 18" stroke="#201E1C" stroke-width="3.5" stroke-linecap="round" fill="none"/></g></g>`;
  svg.innerHTML=out;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce){ svg.classList.add('anim'); }
  const bird=document.getElementById('bird');
  bird.addEventListener('animationend',()=>{bird.classList.add('landed'); setInterval(()=>{if(document.hidden)return; bird.classList.remove('peck'); void bird.offsetWidth; bird.classList.add('peck');}, 7000+Math.random()*4000);},{once:true});
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
