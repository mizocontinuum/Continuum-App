// ---- Full-section twinkling dots for hero ----
(function(){
  var c = document.getElementById("heroStars");
  if (!c) return;
  var ctx = c.getContext("2d");
  var dots = [];
  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    c.width = c.clientWidth * dpr;
    c.height = c.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  for (var i = 0; i < 90; i++) {
    dots.push({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 0.6 + Math.random() * 1.6,
      p: Math.random() * 6.28
    });
  }
  window.addEventListener("resize", resize);
  resize();
  var t = 0;
  (function loop() {
    t += 0.025;
    var w = c.clientWidth, h = c.clientHeight;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.x = (d.x + d.vx + 1) % 1;
      d.y = (d.y + d.vy + 1) % 1;
      var a = 0.2 + 0.55 * (0.5 + 0.5 * Math.sin(t + d.p));
      ctx.fillStyle = "rgba(150, 220, 255, " + a.toFixed(2) + ")";
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
})();

// ---- scroll reveal + counters ----
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;e.target.classList.add('in');io.unobserve(e.target);
    var n=e.target.querySelector('[data-n]');
    if(n){var to=+n.dataset.n,s=null;(function step(ts){s=s||ts;var p=Math.min((ts-s)/1400,1);
      n.textContent=Math.round(to*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(step);})(performance.now());}
  });},{threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(el,i){el.style.transitionDelay=(i%4)*90+'ms';io.observe(el);});
})();

// ---- upgrades: progress, spotlight, tabs, faq, billing ----
(function(){
  var bar=document.getElementById('bar');
  addEventListener('scroll',function(){bar.style.width=(scrollY/(document.documentElement.scrollHeight-innerHeight)*100)+'%';});
  document.querySelectorAll('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});});
  var tabs=document.querySelectorAll('.tabs button');
  tabs.forEach(function(b){b.addEventListener('click',function(){
    tabs.forEach(function(x){x.classList.remove('on');});b.classList.add('on');
    document.querySelectorAll('#courses .card').forEach(function(c){c.classList.toggle('hide',b.dataset.f!=='all'&&c.dataset.cat!==b.dataset.f);});
  });});
  document.querySelectorAll('.q button').forEach(function(b){b.addEventListener('click',function(){b.parentElement.classList.toggle('open');});});
  var sw=document.getElementById('sw');
  sw.addEventListener('click',function(){sw.classList.toggle('on');var y=sw.classList.contains('on');
    document.querySelectorAll('[data-m]').forEach(function(p){p.firstChild.nodeValue=y?p.dataset.y:p.dataset.m;});});
  var go=document.getElementById('go');
  go.addEventListener('click',function(){go.textContent='You’re in! 🎉';});
})();

// ---- upgrades 2: theme, glow, typewriter, quiz, magnetic, confetti ----
(function(){
  var root=document.documentElement;
  document.getElementById('theme').addEventListener('click',function(){
    var dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme=dark?'light':'dark';
  });
  var glow=document.getElementById('glow');
  addEventListener('pointermove',function(e){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});
  var top=document.getElementById('top');
  addEventListener('scroll',function(){top.classList.toggle('show',scrollY>600);});
  top.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'});});
  // typewriter
  var txt='// Your first lesson\nconst name = "Learner";\nconsole.log("Hello, " + name + "!");\n\n// Output: Hello, Learner!',code=document.getElementById('code')||document.createElement('pre'),started=false;
  new IntersectionObserver(function(es,o){if(es[0].isIntersecting&&!started){started=true;var i=0;(function t(){code.textContent=txt.slice(0,++i);if(i<txt.length)setTimeout(t,45);})();o.disconnect();}},{threshold:.4}).observe(code);
  // quiz
  var fb=document.getElementById('fb');
  document.querySelectorAll('.opt').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('.opt').forEach(function(x){x.classList.remove('good','bad');});
    if(b.dataset.ok==='1'){b.classList.add('good');fb.textContent='🎉 Correct! +10 XP';confetti(18);}
    else{b.classList.add('bad');fb.textContent='Not quite, try again.';}
  });});
  // magnetic buttons (below the hero)
  document.querySelectorAll('section .btn').forEach(function(b){
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2)+'px,'+((e.clientY-r.top-r.height/2)*.3)+'px)';});
    b.addEventListener('pointerleave',function(){b.style.transform='';});
  });
  function confetti(n){var em=['🎉','✨','🎓','📚','⭐'];for(var i=0;i<n;i++){var s=document.createElement('span');s.className='conf';s.textContent=em[i%5];s.style.left=Math.random()*100+'vw';s.style.animationDelay=Math.random()*.5+'s';document.body.appendChild(s);setTimeout(function(x){x.remove();},3000,s);}}
  document.getElementById('go').addEventListener('click',function(){confetti(30);});
})();

// ---- upgrades 3: manifesto word reveal ----
(function(){
  var m=document.getElementById('mani');
  m.innerHTML=m.textContent.split(' ').map(function(w){return '<span>'+w+'</span>';}).join(' ');
  var s=m.querySelectorAll('span');
  function u(){var r=m.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.85-r.top)/(r.height+innerHeight*.25)));
    s.forEach(function(x,i){x.classList.toggle('on',i/s.length<p);});}
  addEventListener('scroll',u);u();
})();

// ---- banner tilt ----
(function(){var b=document.querySelector('.banner');if(!b)return;b.parentElement.style.perspective='1200px';
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;b.style.transform='rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg)';});
  b.addEventListener('pointerleave',function(){b.style.transform='';});})();

// ---- section 2: feature showcase ----
(function(){
  var it=document.querySelectorAll('.fi'),sc=document.querySelectorAll('.scr'),dev=document.getElementById('dev'),cur=0,t;
  function go(i){cur=i;
    it.forEach(function(b){b.classList.remove('on');});sc.forEach(function(s){s.classList.remove('on');});
    void dev.offsetWidth;
    it[i].classList.add('on');sc[i].classList.add('on');}
  function loop(){clearTimeout(t);t=setTimeout(function(){go((cur+1)%it.length);loop();},5000);}
  it.forEach(function(b,k){b.addEventListener('click',function(){go(k);loop();});});
  var st=document.querySelector('.stage3');
  st.addEventListener('pointermove',function(e){var r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    dev.style.transform='rotateY('+(-14+x*18)+'deg) rotateX('+(6-y*14)+'deg)';});
  st.addEventListener('pointerleave',function(){dev.style.transform='';});
  go(0);loop();
})();

// ---- watch & learn player ----
(function(){
  var D={
    Marketing:{h:230,l:[['Know your audience',500,['Build a simple customer profile','Speak your audience’s language']],['Craft an offer people want',665,['Turn features into benefits','Write a clear, simple promise']],['Content that gets noticed',580,['Hooks that stop the scroll','Repurpose one idea everywhere']],['Measure what matters',435,['Pick three numbers to track','Improve a little every week']]]},
    Mindset:{h:38,l:[['Build a growth mindset',390,['See challenges as practice','Turn setbacks into progress']],['Make habits stick',550,['Start tiny and stay consistent','Design your day for focus']],['Learn faster, remember more',620,['Use active recall','Teach it to lock it in']]]},
    Sales:{h:200,l:[['Start better conversations',470,['Ask questions that open people up','Listen first, then offer']],['Handle objections calmly',530,['Understand the real concern','Respond with confidence']],['Follow up the right way',410,['Stay helpful, not pushy','Build trust over time']]]},
    Leadership:{h:262,l:[['Lead with clarity',480,['Set goals everyone understands','Communicate with purpose']],['Give feedback that helps',520,['Be specific and kind','Turn feedback into action']],['Grow your team',600,['Delegate with trust','Celebrate small wins']]]}
  };
  var cat='Marketing',idx=0,pos=0,playing=true,SIM=14000,done={};
  var $=function(id){return document.getElementById(id);};
  var vs=$('vs'),vtitle=$('vtitle'),vcat=$('vcat'),vdur=$('vdur'),vtime=$('vtime'),vprog=$('vprog'),vpts=$('vpoints'),lessons=$('lessons'),vplay=$('vplay'),vtrack=$('vtrack');
  if(!vs)return;
  function fmt(s){var m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+(x<10?'0':'')+x;}
  function list(){lessons.innerHTML=D[cat].l.map(function(l,i){
    return '<button class="lsn'+(i===idx?' on':'')+(done[cat+i]?' done':'')+'" data-i="'+i+'"><div class="no">'+(done[cat+i]?'✓':i+1)+'</div><div><b>'+l[0]+'</b><small>'+fmt(l[1])+' min</small></div></button>';}).join('');}
  function load(i){idx=i;pos=0;var l=D[cat].l[i];
    vtitle.style.animation='none';void vtitle.offsetWidth;vtitle.style.animation='';
    vtitle.textContent=l[0];vcat.textContent=cat.toUpperCase();vs.style.setProperty('--vh',D[cat].h);vdur.textContent=fmt(l[1]);
    vpts.innerHTML=l[2].map(function(p,k){return '<li style="animation-delay:'+(k*.25+.2)+'s">'+p+'</li>';}).join('');list();}
  lessons.addEventListener('click',function(e){var b=e.target.closest('.lsn');if(b){load(+b.dataset.i);playing=true;vplay.textContent='⏸';}});
  document.querySelectorAll('#chips button').forEach(function(b){b.addEventListener('click',function(){
    document.querySelectorAll('#chips button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');cat=b.textContent;load(0);});});
  vplay.addEventListener('click',function(){playing=!playing;vplay.textContent=playing?'⏸':'▶';});
  vtrack.addEventListener('click',function(e){var r=vtrack.getBoundingClientRect();pos=Math.min(.98,Math.max(0,(e.clientX-r.left)/r.width));});
  setInterval(function(){
    if(!playing)return;
    pos+=100/SIM;
    if(pos>=1){done[cat+idx]=1;load((idx+1)%D[cat].l.length);}
    vprog.style.width=(pos*100)+'%';vtime.textContent=fmt(pos*D[cat].l[idx][1]);
  },100);
  load(0);
})();

// ---- section 3: flip cards + banner shine ----
(function(){
  document.querySelectorAll('.flip').forEach(function(c){
    function t(){c.classList.toggle('flipped');}
    c.addEventListener('click',t);
    c.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t();}});
  });
  var bn=document.getElementById('bn');
  if(bn)bn.addEventListener('pointermove',function(e){var r=bn.getBoundingClientRect();bn.style.setProperty('--mx',(e.clientX-r.left)+'px');bn.style.setProperty('--my',(e.clientY-r.top)+'px');});
})();

// ---- section 3: expanding panels ----
(function(){
  var ps=document.querySelectorAll('.pn');
  function act(p){ps.forEach(function(x){x.classList.toggle('active',x===p);});}
  ps.forEach(function(p){
    p.addEventListener('mouseenter',function(){if(matchMedia('(hover:hover)').matches)act(p);});
    p.addEventListener('click',function(){act(p);});
    p.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();act(p);}});
  });
})();

// ---- 3D tilt cards ----
document.querySelectorAll('.card').forEach(function(c){
  c.addEventListener('pointermove',function(e){
    var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    c.style.transform='rotateY('+(x*14)+'deg) rotateX('+(-y*14)+'deg) translateY(-4px)';
  });
  c.addEventListener('pointerleave',function(){c.style.transform='';});
});
