/* ============================================================
 * FinanceOS V7 — Ultimate Personal Financial Operating System
 * Intelligence-powered. From age 17 onward.
 * ============================================================ */
const STORE='financeOS_v7';
const D=()=>JSON.parse(JSON.stringify(DEFAULTS));
const DEFAULTS={
  userName:'',wage:16.50,fedTax:10,stateTax:0,fica:7.65,expectedReturn:10,monthlyInvest:300,
  schoolHours:17.5,summerHours:30,onboarded:false,
  checking:0,emergencyFund:0,investmentBal:0,
  shifts:[],expenses:[],bills:[],
  goals:[
    {id:'g1',name:'Emergency Fund',target:1000,saved:0,icon:'🛡️',priority:1},
    {id:'g2',name:'Surface Laptop',target:300,saved:300,icon:'💻',priority:2},
    {id:'g3',name:'iPad Air',target:247,saved:0,icon:'📱',priority:3},
    {id:'g4',name:'Move Out Fund',target:10000,saved:0,icon:'🏠',priority:4},
    {id:'g5',name:'First Car',target:8000,saved:0,icon:'🚗',priority:5},
    {id:'g6',name:'FD RX-7',target:30000,saved:0,icon:'🏎️',priority:6},
    {id:'g7',name:'Retirement ($1M+)',target:1000000,saved:0,icon:'💰',priority:7},
  ],
  goalMilestones:{},
  techItems:[
    {id:'t1',name:'Surface Laptop 4',cost:300,saved:300},
    {id:'t2',name:'iPad Air 5',cost:247,saved:0},
    {id:'t3',name:'Future PC Build',cost:1500,saved:0},
    {id:'t4',name:'FD RX-7',cost:30000,saved:0},
  ],
  holdings:[
    {ticker:'VOO',name:'S&P 500 ETF',alloc:50,type:'Index',yield:1.3,targetAlloc:50},
    {ticker:'QQQM',name:'Nasdaq 100',alloc:30,type:'Growth',yield:0.5,targetAlloc:30},
    {ticker:'TTWO',name:'Take-Two',alloc:10,type:'Stock',yield:0,targetAlloc:10},
    {ticker:'Nuclear',name:'Nuclear ETF',alloc:10,type:'Thematic',yield:0.8,targetAlloc:10},
  ],
  specPositions:[
    {id:'s1',ticker:'TTWO',thesis:'GTA VI release Q4 2025',entry:180,current:210,shares:2},
    {id:'s2',ticker:'CCJ',thesis:'Uranium demand + AI power',entry:45,current:52,shares:5},
    {id:'s3',ticker:'SMR',thesis:'Nuclear AI data center boom',entry:12,current:18,shares:10},
  ],
  dcaPurchases:[],
  paychecks:[],
  assets:[
    {name:'Checking',value:0},{name:'Emergency Fund',value:0},{name:'Investments',value:0},
    {name:'Surface Laptop',value:300},{name:'iPad',value:247},{name:'Other',value:0},
  ],
  nospendDays:[],healthHistory:[],
  timeline:[
    {date:'2026-06-29',title:'Starbucks Start',desc:'First official day at Starbucks',status:'done'},
    {date:'2026-08-11',title:'First Day of School',desc:'Senior year begins',status:'future'},
    {date:'2026-10-01',title:'FAFSA Opens',desc:'File ASAP — opens October 1, 2026',status:'future'},
    {date:'2026-11-26',title:'Senior Pictures Deadline',desc:'Portraits completed by Nov 26',status:'future'},
    {date:'2027-05-20',title:'Graduation',desc:'Walk the stage! May 2027',status:'future'},
  ],
  eduSavings:0,eduFafsa:0,eduBright:0,eduScholar:0,
  wastedMoney:[],futureMessages:[],sideHustles:[],
  xp:0,xpLog:[],trips:[],
  watchlist:['VOO','QQQM','TTWO','AAPL','TSLA'],stockPrices:{},
  autopilotRules:{spend:50,invest:40,save:10},
  pinCode:'',pinEnabled:false,theme:'dark',
  calMonth:new Date().getMonth(),calYear:new Date().getFullYear(),
  envelopes:{food:150,gas:80,clothes:50,games:50,subscriptions:30,personal:40,other:50},
  quizStats:{correct:0,total:0},
  dailyQuestsCompleted:{},
  streakDays:0,lastStreakDate:'',
  savingsRateHistory:[],
};
let DATA=D();


// ===== PERSISTENCE & UTILS =====
function save(){localStorage.setItem(STORE,JSON.stringify(DATA));}
function load(){try{const s=JSON.parse(localStorage.getItem(STORE));if(s)DATA={...D(),...s};}catch(e){}}
function fmt(n){return'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fK(n){if(n>=1e6)return'$'+(n/1e6).toFixed(1)+'M';if(n>=1e3)return'$'+(n/1e3).toFixed(1)+'K';return'$'+(n||0).toFixed(0);}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function today(){return new Date().toISOString().split('T')[0];}
function mKey(d){return(d||'').slice(0,7);}
function totalTaxRate(){return(DATA.fedTax+DATA.stateTax+DATA.fica)/100;}
function weekNum(){const d=new Date();const start=new Date(d.getFullYear(),0,1);return Math.ceil(((d-start)/86400000+start.getDay()+1)/7);}
function dayOfWeek(d){return new Date(d+'T12:00').getDay();}

// ===== CONFETTI =====
function fireConfetti(){if(typeof confetti==='function'){confetti({particleCount:150,spread:70,origin:{y:0.6}});}}
function fireConfettiSide(){if(typeof confetti==='function'){confetti({particleCount:80,angle:60,spread:55,origin:{x:0}});confetti({particleCount:80,angle:120,spread:55,origin:{x:1}});}}

// ===== STREAK SYSTEM =====
function updateStreak(){
  const t=today();
  if(DATA.lastStreakDate===t)return;
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
  const yStr=yesterday.toISOString().split('T')[0];
  if(DATA.lastStreakDate===yStr){DATA.streakDays++;} else if(DATA.lastStreakDate!==t){DATA.streakDays=1;}
  DATA.lastStreakDate=t;
  if(DATA.streakDays===7||DATA.streakDays===14||DATA.streakDays===30){fireConfetti();addXP(DATA.streakDays*5,'Streak milestone: '+DATA.streakDays+' days');}
  save();
}
function getStreakMultiplier(){
  if(DATA.streakDays>=30)return 3;
  if(DATA.streakDays>=14)return 2.5;
  if(DATA.streakDays>=7)return 2;
  return 1;
}

// ===== NAVIGATION =====
function initNav(){document.querySelectorAll('.nav-item[data-s]').forEach(el=>{el.addEventListener('click',()=>goTo(el.dataset.s));});}
function goTo(s){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.s===s));
  document.querySelectorAll('.section').forEach(sec=>sec.classList.toggle('active',sec.id==='sec-'+s));
}

// ===== THEME =====
function initTheme(){if(DATA.theme==='light')document.documentElement.setAttribute('data-theme','light');updateThemeBtn();}
function toggleTheme(){DATA.theme=DATA.theme==='dark'?'light':'dark';if(DATA.theme==='light')document.documentElement.setAttribute('data-theme','light');else document.documentElement.removeAttribute('data-theme');updateThemeBtn();save();}
function updateThemeBtn(){const b=document.getElementById('themeToggle');if(b)b.textContent=DATA.theme==='dark'?'🌙':'☀️';}

// ===== ONBOARDING WIZARD =====
function checkOnboarding(){if(!DATA.onboarded){document.getElementById('wizardOverlay').style.display='flex';initWizardParticles();renderWizGoals();}}
function wizNext(step){
  document.querySelectorAll('.wizard-step').forEach(s=>s.classList.remove('active'));
  document.querySelector(`.wizard-step[data-step="${step}"]`).classList.add('active');
  document.getElementById('wizardProgressFill').style.width=(step/4*100)+'%';
  if(step===2){DATA.userName=document.getElementById('wiz-name').value.trim()||'Friend';}
}
function wizComplete(){
  DATA.userName=document.getElementById('wiz-name').value.trim()||'Friend';
  DATA.wage=+document.getElementById('wiz-wage').value||16.50;
  DATA.schoolHours=+document.getElementById('wiz-hours').value||17.5;
  DATA.summerHours=+document.getElementById('wiz-summer').value||30;
  DATA.monthlyInvest=+document.getElementById('wiz-invest').value||300;
  DATA.onboarded=true;
  document.getElementById('wizardOverlay').style.display='none';
  fireConfetti();save();renderAll();
}
function renderWizGoals(){
  const el=document.getElementById('wizGoals');if(!el)return;
  const goals=['Emergency Fund','First Car','iPad Air','Move Out','Investments','FD RX-7','PC Build','Travel'];
  el.innerHTML=goals.map(g=>`<div class="wizard-goal" onclick="this.classList.toggle('selected')">${g}</div>`).join('');
}
function initWizardParticles(){
  const c=document.getElementById('wizardParticles');if(!c||typeof THREE==='undefined')return;
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(75,c.clientWidth/c.clientHeight,0.1,1000);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setSize(c.clientWidth,c.clientHeight);c.appendChild(renderer.domElement);
  const geo=new THREE.BufferGeometry();const count=200;const pos=new Float32Array(count*3);
  for(let i=0;i<count*3;i++)pos[i]=(Math.random()-0.5)*20;
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({color:0x6366f1,size:0.05,transparent:true,opacity:0.6});
  const points=new THREE.Points(geo,mat);scene.add(points);camera.position.z=5;
  function animate(){requestAnimationFrame(animate);points.rotation.y+=0.001;points.rotation.x+=0.0005;renderer.render(scene,camera);}
  animate();
}


// ===== PIN LOCK =====
function checkPin(){if(!DATA.pinEnabled||!DATA.pinCode)return;document.getElementById('pinOverlay').style.display='flex';document.getElementById('appShell').style.display='none';buildPinPad();}
let pinEntry='';
function buildPinPad(){const pad=document.getElementById('pinPad');pad.innerHTML='';for(let i=1;i<=9;i++){const b=document.createElement('button');b.textContent=i;b.onclick=()=>pinPress(i);pad.appendChild(b);}const bC=document.createElement('button');bC.textContent='C';bC.onclick=()=>{pinEntry='';updatePinDots();document.getElementById('pinError').textContent='';};pad.appendChild(bC);const b0=document.createElement('button');b0.textContent='0';b0.onclick=()=>pinPress(0);pad.appendChild(b0);const bD=document.createElement('button');bD.textContent='⌫';bD.onclick=()=>{pinEntry=pinEntry.slice(0,-1);updatePinDots();};pad.appendChild(bD);}
function pinPress(n){if(pinEntry.length>=4)return;pinEntry+=n;updatePinDots();if(pinEntry.length===4){if(pinEntry===DATA.pinCode){document.getElementById('pinOverlay').style.display='none';document.getElementById('appShell').style.display='grid';pinEntry='';}else{document.getElementById('pinError').textContent='Wrong PIN.';pinEntry='';setTimeout(updatePinDots,300);}}}
function updatePinDots(){document.querySelectorAll('#pinDots span').forEach((d,i)=>d.classList.toggle('filled',i<pinEntry.length));}

// ===== COMMAND PALETTE =====
const CMD_ITEMS=[
  {icon:'🏠',label:'Home Dashboard',action:()=>goTo('home')},
  {icon:'☕',label:'Pay Center',action:()=>goTo('starbucks')},
  {icon:'📊',label:'Spending',action:()=>goTo('budget')},
  {icon:'✉️',label:'Envelopes',action:()=>goTo('envelopes')},
  {icon:'📅',label:'Bills',action:()=>goTo('bills')},
  {icon:'🎯',label:'Goals',action:()=>goTo('goals')},
  {icon:'💻',label:'Tech Tracker',action:()=>goTo('tech')},
  {icon:'📈',label:'Investments',action:()=>goTo('investments')},
  {icon:'💹',label:'DCA Tracker',action:()=>goTo('dca')},
  {icon:'🚀',label:'Speculative',action:()=>goTo('speculative')},
  {icon:'💰',label:'Compound Calculator',action:()=>goTo('compound')},
  {icon:'📆',label:'Calendar',action:()=>goTo('calendar')},
  {icon:'📋',label:'Weekly Planner',action:()=>goTo('planner')},
  {icon:'📄',label:'Monthly Report',action:()=>goTo('report')},
  {icon:'💼',label:'Career',action:()=>goTo('career')},
  {icon:'🔨',label:'Side Hustles',action:()=>goTo('sidehustle')},
  {icon:'⭐',label:'XP & Quests',action:()=>goTo('xp')},
  {icon:'🧠',label:'Finance Quiz',action:()=>goTo('quiz')},
  {icon:'🎓',label:'Education',action:()=>goTo('education')},
  {icon:'💎',label:'Net Worth',action:()=>goTo('networth')},
  {icon:'🔮',label:'Projections',action:()=>goTo('projections')},
  {icon:'⚡',label:'What If',action:()=>goTo('whatif')},
  {icon:'🏦',label:'Tax Estimator',action:()=>goTo('tax')},
  {icon:'💳',label:'Credit Score',action:()=>goTo('credit')},
  {icon:'📡',label:'Stocks',action:()=>goTo('stocks')},
  {icon:'🏠',label:'Move-Out Calculator',action:()=>goTo('moveout')},
  {icon:'🚗',label:'Car Calculator',action:()=>goTo('car')},
  {icon:'✈️',label:'Travel Fund',action:()=>goTo('travel')},
  {icon:'🎒',label:'Student Loans',action:()=>goTo('loans')},
  {icon:'📅',label:'Timeline',action:()=>goTo('timeline')},
  {icon:'❤️',label:'Health Score',action:()=>goTo('health')},
  {icon:'⚙️',label:'Settings',action:()=>goTo('settings')},
  {icon:'➕',label:'Add Shift',action:()=>{goTo('starbucks');document.getElementById('sh-date').focus();}},
  {icon:'➕',label:'Add Expense',action:()=>{goTo('budget');document.getElementById('exp-amt').focus();}},
  {icon:'🎯',label:'Check Net Worth',action:()=>goTo('networth')},
  {icon:'💰',label:'Check Goals',action:()=>goTo('goals')},
];
let cmdIdx=0;
function openCmd(){document.getElementById('cmdOverlay').style.display='flex';document.getElementById('cmdInput').value='';document.getElementById('cmdInput').focus();renderCmdResults('');}
function closeCmd(){document.getElementById('cmdOverlay').style.display='none';}
function renderCmdResults(q){
  const el=document.getElementById('cmdResults');
  const filtered=q?CMD_ITEMS.filter(i=>i.label.toLowerCase().includes(q.toLowerCase())):CMD_ITEMS.slice(0,10);
  cmdIdx=0;
  el.innerHTML=filtered.map((item,i)=>`<div class="cmd-result${i===0?' active':''}" data-idx="${i}"><span class="cmd-r-icon">${item.icon}</span><span class="cmd-r-label">${item.label}</span></div>`).join('');
  el.querySelectorAll('.cmd-result').forEach((r,i)=>{r.onclick=()=>{filtered[i].action();closeCmd();};});
}
function initCmdPalette(){
  document.getElementById('cmdOverlay').addEventListener('click',e=>{if(e.target.id==='cmdOverlay')closeCmd();});
  document.getElementById('cmdInput').addEventListener('input',e=>renderCmdResults(e.target.value));
  document.getElementById('cmdInput').addEventListener('keydown',e=>{
    const results=document.querySelectorAll('.cmd-result');
    if(e.key==='Escape')closeCmd();
    else if(e.key==='ArrowDown'){e.preventDefault();cmdIdx=Math.min(cmdIdx+1,results.length-1);results.forEach((r,i)=>r.classList.toggle('active',i===cmdIdx));}
    else if(e.key==='ArrowUp'){e.preventDefault();cmdIdx=Math.max(cmdIdx-1,0);results.forEach((r,i)=>r.classList.toggle('active',i===cmdIdx));}
    else if(e.key==='Enter'){e.preventDefault();if(results[cmdIdx])results[cmdIdx].click();}
  });
}

// ===== KEYBOARD SHORTCUTS =====
function initKeyboard(){
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openCmd();return;}
    if(e.key==='n'||e.key==='N'){goTo('budget');setTimeout(()=>document.getElementById('exp-amt')?.focus(),100);}
    if(e.key==='s'&&!e.ctrlKey){goTo('starbucks');}
    if(e.key==='g'||e.key==='G'){goTo('goals');}
  });
  document.getElementById('cmdBtn')?.addEventListener('click',openCmd);
}

// ===== HEADER =====
function renderHeader(){
  const h=new Date().getHours();const name=DATA.userName||'';
  document.getElementById('greeting').textContent=(h<12?'Good morning':'Good evening')+' '+(name||'')+(h<12?' ☀️':' 🌙');
  document.getElementById('dateDisplay').textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);
  document.getElementById('nwPill').textContent=fK(nw);
  document.getElementById('healthPill').textContent=calcHealthScore().score+'/100';
  const sp=document.getElementById('streakPill');
  if(sp&&DATA.streakDays>0){sp.style.display='flex';document.getElementById('streakNum').textContent=DATA.streakDays;}
  renderXPPill();
}

// ===== QUOTES =====
const QUOTES=[
  {t:"The best time to plant a tree was 20 years ago. The second best time is now.",a:"Chinese Proverb"},
  {t:"Do not save what is left after spending, but spend what is left after saving.",a:"Warren Buffett"},
  {t:"Compound interest is the eighth wonder of the world.",a:"Albert Einstein"},
  {t:"Every dollar you spend is a vote for the life you want.",a:"Unknown"},
  {t:"Rich people stay rich by living like they're broke.",a:"Unknown"},
  {t:"The stock market transfers money from the impatient to the patient.",a:"Warren Buffett"},
  {t:"Financial freedom is available to those who learn about it and work for it.",a:"Robert Kiyosaki"},
  {t:"You don't have to be great to start, but you have to start to be great.",a:"Zig Ziglar"},
];
function renderQuote(){const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];const el=document.getElementById('dailyQuote');if(el)el.innerHTML=`<div class="quote-text">"${q.t}"</div><div class="quote-author">— ${q.a}</div>`;}


// ===== MONEY LEFT DAILY COUNTER =====
function renderMoneyLeft(){
  const mo=mKey(today());const dayNum=new Date().getDate();const daysInMonth=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
  const monthlyIncome=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const billsTotal=DATA.bills.reduce((s,b)=>s+b.amount,0);
  const investCommit=DATA.monthlyInvest;
  const alreadySpent=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const available=monthlyIncome-billsTotal-investCommit-alreadySpent;
  const daysLeft=daysInMonth-dayNum+1;
  const perDay=Math.max(0,available/Math.max(1,daysLeft));
  const el=document.getElementById('moneyLeftAmount');if(el)el.textContent=fmt(perDay);
}

// ===== WEEKLY AI SUMMARY =====
function renderAISummary(){
  const el=document.getElementById('aiSummaryContent');const card=document.getElementById('aiWeeklySummary');if(!el||!card)return;
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-7);const ws=weekStart.toISOString().split('T')[0];
  const weekShifts=DATA.shifts.filter(s=>s.date>=ws);
  const weekExp=DATA.expenses.filter(e=>e.date>=ws);
  const earned=weekShifts.reduce((s,sh)=>s+sh.gross+sh.tips,0)*(1-totalTaxRate());
  const spent=weekExp.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const saved=earned-spent;
  if(earned>0||spent>0){
    card.style.display='block';
    const topCat={};weekExp.filter(e=>e.type==='expense').forEach(e=>{topCat[e.category]=(topCat[e.category]||0)+e.amount;});
    const top=Object.entries(topCat).sort((a,b)=>b[1]-a[1])[0];
    const topLabel=top?CATS[top[0]]?.l||top[0]:'nothing';
    let goalMsg='';const activeGoal=DATA.goals.find(g=>g.saved<g.target);
    if(activeGoal)goalMsg=` You're ${((activeGoal.saved/activeGoal.target)*100).toFixed(0)}% toward your ${activeGoal.name} goal.`;
    el.innerHTML=`<p style="font-size:13px;line-height:1.6;">This week you earned <b class="c-green">${fmt(earned)}</b>, spent <b class="c-red">${fmt(spent)}</b>, and saved <b class="c-accent">${fmt(saved)}</b>. Top category: <b>${topLabel}</b>.${goalMsg}</p>`;
  }else{card.style.display='none';}
}

// ===== PATTERN DETECTION =====
function renderPatterns(){
  const card=document.getElementById('patternCard');const el=document.getElementById('patternContent');if(!card||!el)return;
  const patterns=[];
  const weekendExp=DATA.expenses.filter(e=>e.type==='expense'&&[0,6].includes(dayOfWeek(e.date)));
  const weekdayExp=DATA.expenses.filter(e=>e.type==='expense'&&![0,6].includes(dayOfWeek(e.date)));
  if(weekendExp.length>5&&weekdayExp.length>5){
    const wkndAvg=weekendExp.reduce((s,e)=>s+e.amount,0)/weekendExp.length;
    const wkdayAvg=weekdayExp.reduce((s,e)=>s+e.amount,0)/weekdayExp.length;
    if(wkndAvg>wkdayAvg*1.5)patterns.push('📊 You spend '+((wkndAvg/wkdayAvg).toFixed(1))+'x more on weekends than weekdays');
  }
  const dayTotals=[0,0,0,0,0,0,0];const dayCounts=[0,0,0,0,0,0,0];
  DATA.expenses.filter(e=>e.type==='expense').forEach(e=>{const d=dayOfWeek(e.date);dayTotals[d]+=e.amount;dayCounts[d]++;});
  const bestDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let minDay=0;for(let i=1;i<7;i++){if(dayCounts[i]>0&&dayTotals[i]/dayCounts[i]<dayTotals[minDay]/Math.max(1,dayCounts[minDay]))minDay=i;}
  if(DATA.expenses.length>10)patterns.push(`💡 Your best saving day is typically ${bestDay[minDay]}s`);
  if(patterns.length){card.style.display='block';el.innerHTML=patterns.map(p=>`<p style="font-size:12px;margin-bottom:6px;">${p}</p>`).join('');}
}

// ===== SPENDING VELOCITY =====
function renderVelocity(){
  const card=document.getElementById('velocityCard');const el=document.getElementById('velocityContent');if(!card||!el)return;
  const mo=mKey(today());const dayNum=new Date().getDate();
  const alerts=[];
  Object.entries(DATA.envelopes||{}).forEach(([cat,limit])=>{
    if(limit<=0)return;
    const spent=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense'&&e.category===cat).reduce((s,e)=>s+e.amount,0);
    if(spent>0&&dayNum>0){
      const rate=spent/dayNum;const daysInMonth=new Date(new Date().getFullYear(),new Date().getMonth()+1,0).getDate();
      const projected=rate*daysInMonth;
      if(projected>limit){
        const blowDay=Math.ceil(limit/rate);
        const catName=(CATS[cat]||{l:cat}).l;
        alerts.push(`At this rate, you'll blow your <b>${catName}</b> budget by the <b>${blowDay}${blowDay===1?'st':blowDay===2?'nd':blowDay===3?'rd':'th'}</b>`);
      }
    }
  });
  if(alerts.length){card.style.display='block';el.innerHTML=alerts.map(a=>`<p style="font-size:12px;margin-bottom:6px;color:var(--orange);">⚡ ${a}</p>`).join('');}else{card.style.display='none';}
}

// ===== SPENDING HEATMAP =====
function renderHeatmap(){
  const el=document.getElementById('spendingHeatmap');if(!el)return;
  const now=new Date();let html='';
  for(let i=27;i>=0;i--){
    const d=new Date(now);d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];
    const spent=DATA.expenses.filter(e=>e.date===ds&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
    const saved=DATA.expenses.filter(e=>e.date===ds&&e.type==='income').reduce((s,e)=>s+e.amount,0)-spent;
    let color;
    if(saved>50)color='rgba(34,197,94,0.8)';
    else if(saved>0)color='rgba(34,197,94,0.4)';
    else if(spent===0)color='var(--surface-3)';
    else if(spent<20)color='rgba(239,68,68,0.3)';
    else if(spent<50)color='rgba(239,68,68,0.5)';
    else color='rgba(239,68,68,0.8)';
    html+=`<div class="heatmap-cell" style="background:${color}"><div class="heatmap-tooltip">${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}: ${spent>0?'-'+fmt(spent):'$0'}</div></div>`;
  }
  el.innerHTML=html;
}

// ===== SAVINGS RATE TREND =====
function renderSavingsRateChart(){
  const ctx=document.getElementById('chart-savings-rate');if(!ctx)return;dc('savingsRate');
  const months=[];const rates=[];
  for(let i=5;i>=0;i--){
    const d=new Date();d.setMonth(d.getMonth()-i);const mk=mKey(d.toISOString().split('T')[0]);
    const inc=DATA.expenses.filter(e=>mKey(e.date)===mk&&e.type==='income').reduce((s,e)=>s+e.amount,0);
    const exp=DATA.expenses.filter(e=>mKey(e.date)===mk&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
    months.push(d.toLocaleDateString('en-US',{month:'short'}));
    rates.push(inc>0?Math.max(0,((inc-exp)/inc)*100):0);
  }
  charts['savingsRate']=new Chart(ctx,{type:'line',data:{labels:months,datasets:[{label:'Savings Rate %',data:rates,borderColor:CL.green,backgroundColor:CL.green+'20',fill:true,tension:0.4,pointRadius:4}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),min:0,max:100}}})});
}


// ===== 3D ELEMENTS (THREE.JS) =====
let threeScene=null;
function init3DHero(){
  const c=document.getElementById('hero3d');if(!c||typeof THREE==='undefined')return;
  c.innerHTML='';
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(60,c.clientWidth/c.clientHeight,0.1,100);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setSize(c.clientWidth,c.clientHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));c.appendChild(renderer.domElement);
  // Create rotating coin
  const coinGeo=new THREE.CylinderGeometry(1,1,0.15,32);
  const coinMat=new THREE.MeshPhongMaterial({color:0xf5c518,specular:0xffffff,shininess:80});
  const coin=new THREE.Mesh(coinGeo,coinMat);coin.rotation.x=Math.PI/2;scene.add(coin);
  // Add $ text plane
  const canvas2=document.createElement('canvas');canvas2.width=64;canvas2.height=64;
  const ctx2=canvas2.getContext('2d');ctx2.fillStyle='#000';ctx2.font='bold 40px Arial';ctx2.textAlign='center';ctx2.textBaseline='middle';ctx2.fillText('$',32,32);
  const tex=new THREE.CanvasTexture(canvas2);const planeMat=new THREE.MeshBasicMaterial({map:tex,transparent:true});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.8),planeMat);plane.position.z=0.08;coin.add(plane);
  // Lights
  const light=new THREE.DirectionalLight(0xffffff,1.5);light.position.set(2,2,3);scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040,0.8));
  // Particle field
  const pGeo=new THREE.BufferGeometry();const pCount=100;const pPos=new Float32Array(pCount*3);
  for(let i=0;i<pCount*3;i++)pPos[i]=(Math.random()-0.5)*10;
  pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));
  const pMat=new THREE.PointsMaterial({color:0x6366f1,size:0.03,transparent:true,opacity:0.5});
  scene.add(new THREE.Points(pGeo,pMat));
  camera.position.z=3;
  function animate(){requestAnimationFrame(animate);coin.rotation.y+=0.01;coin.rotation.x=Math.sin(Date.now()*0.001)*0.1+Math.PI/2;renderer.render(scene,camera);}
  animate();threeScene={scene,camera,renderer,container:c};
}

function init3DNetWorth(){
  const c=document.getElementById('nwThreeContainer');if(!c||typeof THREE==='undefined')return;
  c.innerHTML='';
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(50,c.clientWidth/c.clientHeight,0.1,100);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
  renderer.setSize(c.clientWidth,c.clientHeight);c.appendChild(renderer.domElement);
  const total=Math.max(1,DATA.assets.reduce((s,a)=>s+a.value,0));
  const colors=[0x22c55e,0xeab308,0x6366f1,0x3b82f6,0xa855f7,0xef4444];
  DATA.assets.forEach((a,i)=>{
    const h=Math.max(0.1,(a.value/total)*5);
    const geo=new THREE.BoxGeometry(0.6,h,0.6);
    const mat=new THREE.MeshPhongMaterial({color:colors[i%colors.length]});
    const mesh=new THREE.Mesh(geo,mat);
    mesh.position.x=(i-DATA.assets.length/2)*0.9;mesh.position.y=h/2;
    scene.add(mesh);
  });
  scene.add(new THREE.DirectionalLight(0xffffff,1.2));scene.add(new THREE.AmbientLight(0x404040));
  camera.position.set(0,3,6);camera.lookAt(0,1,0);
  let t=0;function animate(){requestAnimationFrame(animate);t+=0.005;camera.position.x=Math.sin(t)*2;camera.lookAt(0,1,0);renderer.render(scene,camera);}
  animate();
}

// ===== AI ALERTS =====
function renderAIAlerts(){
  const el=document.getElementById('aiAlerts');if(!el)return;
  const mo=mKey(today());const thisMonthExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense');
  const alerts=[];
  const catTotals={};thisMonthExp.forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount;});
  const lastMo=new Date();lastMo.setMonth(lastMo.getMonth()-1);const lastKey=mKey(lastMo.toISOString().split('T')[0]);
  const lastMonthExp=DATA.expenses.filter(e=>mKey(e.date)===lastKey&&e.type==='expense');
  const lastCatTotals={};lastMonthExp.forEach(e=>{lastCatTotals[e.category]=(lastCatTotals[e.category]||0)+e.amount;});
  Object.entries(catTotals).forEach(([cat,amt])=>{
    const lastAmt=lastCatTotals[cat]||0;
    if(lastAmt>0&&amt>lastAmt*1.5){alerts.push(`You spent ${fmt(amt)} on <b>${(CATS[cat]||{l:cat}).l}</b> — ${(amt/lastAmt).toFixed(1)}x last month's ${fmt(lastAmt)}`);}
  });
  if(alerts.length){el.innerHTML=alerts.map(a=>`<div class="alert-card"><div class="alert-icon">🧠</div><div class="alert-text">${a}</div></div>`).join('');}else{el.innerHTML='';}
}

// ===== BILL REMINDERS =====
function renderBillReminders(){
  const el=document.getElementById('billReminders');if(!el)return;
  const nowDay=new Date().getDate();
  const upcoming=DATA.bills.filter(b=>{const diff=b.dueDay-nowDay;return diff>=0&&diff<=7;}).sort((a,b)=>a.dueDay-b.dueDay);
  if(upcoming.length){el.innerHTML=upcoming.map(b=>{const d=b.dueDay-nowDay;return`<div class="bill-reminder-item">⚠️ <b>${b.name}</b> (${fmt(b.amount)}) — ${d===0?'DUE TODAY':d===1?'due tomorrow':`due in ${d} days`}</div>`;}).join('');}else{el.innerHTML='';}
}

// ===== STARBUCKS PAY CENTER =====
function shiftHours(start,end,brk){const[sh,sm]=start.split(':').map(Number);const[eh,em]=end.split(':').map(Number);let m=(eh*60+em)-(sh*60+sm);if(m<0)m+=1440;return Math.max(0,(m-brk)/60);}
function payMult(t){return t==='overtime'?1.5:t==='holiday'?2:1;}
function addShift(){
  const date=document.getElementById('sh-date').value||today();
  const type=document.getElementById('sh-type').value;
  const start=document.getElementById('sh-start').value;
  const end=document.getElementById('sh-end').value;
  const brk=+document.getElementById('sh-break').value||0;
  const tips=+document.getElementById('sh-tips').value||0;
  const hrs=shiftHours(start,end,brk);
  const gross=hrs*DATA.wage*payMult(type);
  DATA.shifts.push({id:uid(),date,start,end,breakMin:brk,type,tips,hours:hrs,gross});
  DATA.shifts.sort((a,b)=>b.date.localeCompare(a.date));
  addXP(15,'Logged a shift');updateStreak();save();renderStarbucks();
  showAutopilot(gross,tips);
}
function showAutopilot(gross,tips){
  const net=(gross+tips)*(1-totalTaxRate());const card=document.getElementById('autopilotCard');const content=document.getElementById('autopilotSuggestion');if(!card)return;
  const r=DATA.autopilotRules;card.style.display='block';
  content.innerHTML=`<div class="g g3"><div class="mstat"><div class="mstat-val c-blue">${fmt(net*r.spend/100)}</div><div class="mstat-lbl">Spend (${r.spend}%)</div></div><div class="mstat"><div class="mstat-val c-green">${fmt(net*r.invest/100)}</div><div class="mstat-lbl">Invest (${r.invest}%)</div></div><div class="mstat"><div class="mstat-val c-yellow">${fmt(net*r.save/100)}</div><div class="mstat-lbl">Save (${r.save}%)</div></div></div>`;
}
function renderStarbucks(){
  const cut=new Date();cut.setDate(cut.getDate()-14);
  const period=DATA.shifts.filter(s=>new Date(s.date)>=cut);
  const totHrs=period.reduce((s,sh)=>s+sh.hours,0);
  const otHrs=period.filter(s=>s.type==='overtime').reduce((s,sh)=>s+sh.hours,0);
  const estGross=period.reduce((s,sh)=>s+sh.gross+sh.tips,0);
  document.getElementById('sb-period-hrs').textContent=totHrs.toFixed(1)+' hrs';
  document.getElementById('sb-ot-hrs').textContent=otHrs.toFixed(1)+' hrs';
  document.getElementById('sb-est-net').textContent=fmt(estGross*(1-totalTaxRate()));
  // Year table
  const yearTbody=document.querySelector('#sb-year-table tbody');
  if(yearTbody){
    const months=[{m:'Jul 2026',hrs:DATA.summerHours},{m:'Aug 2026',hrs:DATA.summerHours},{m:'Sep 2026',hrs:DATA.schoolHours},{m:'Oct 2026',hrs:DATA.schoolHours},{m:'Nov 2026',hrs:DATA.schoolHours},{m:'Dec 2026',hrs:DATA.schoolHours},{m:'Jan 2027',hrs:DATA.schoolHours},{m:'Feb 2027',hrs:DATA.schoolHours},{m:'Mar 2027',hrs:DATA.schoolHours},{m:'Apr 2027',hrs:DATA.schoolHours},{m:'May 2027',hrs:DATA.schoolHours}];
    let cum=0;yearTbody.innerHTML=months.map(r=>{const g=DATA.wage*r.hrs*4.33;const f=g*DATA.fedTax/100;const fi=g*DATA.fica/100;const n=g-f-fi;cum+=n;return`<tr><td>${r.m}</td><td>${r.hrs}</td><td>${fmt(g)}</td><td class="c-red">-${fmt(f)}</td><td class="c-red">-${fmt(fi)}</td><td class="c-green">${fmt(n)}</td><td class="c-accent bold">${fmt(cum)}</td></tr>`;}).join('');
  }
  // Shift table
  const sTbody=document.querySelector('#sb-shift-table tbody');
  if(sTbody){
    if(!DATA.shifts.length){sTbody.innerHTML='<tr><td colspan="8" class="center small">No shifts logged.</td></tr>';return;}
    sTbody.innerHTML=DATA.shifts.slice(0,60).map(s=>{const tag=s.type==='overtime'?'<span class="tag tag-yellow">OT</span>':s.type==='holiday'?'<span class="tag tag-purple">HOL</span>':'<span class="tag tag-accent">REG</span>';return`<tr><td>${s.date}</td><td>${s.start}-${s.end}</td><td>${s.hours.toFixed(1)}</td><td>${tag}</td><td>${fmt(DATA.wage*payMult(s.type))}</td><td class="c-green">${fmt(s.gross)}</td><td>${s.tips?fmt(s.tips):'—'}</td><td><button class="btn btn-sm btn-g" onclick="delShift('${s.id}')">×</button></td></tr>`;}).join('');
  }
  renderTipChart();renderPaycheckHistory();
}
function delShift(id){DATA.shifts=DATA.shifts.filter(s=>s.id!==id);save();renderStarbucks();}

// ===== TIP ANALYTICS =====
function renderTipChart(){
  const ctx=document.getElementById('chart-tips');if(!ctx)return;dc('tips');
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const tipsByDay=[0,0,0,0,0,0,0];const countByDay=[0,0,0,0,0,0,0];
  DATA.shifts.forEach(s=>{if(s.tips>0){const d=dayOfWeek(s.date);tipsByDay[d]+=s.tips;countByDay[d]++;}});
  const avgTips=tipsByDay.map((t,i)=>countByDay[i]>0?t/countByDay[i]:0);
  charts['tips']=new Chart(ctx,{type:'bar',data:{labels:days,datasets:[{label:'Avg Tips ($)',data:avgTips,backgroundColor:CL.green+'80',borderColor:CL.green,borderWidth:1}]},options:chartOpts({scales:{x:axisStyle(),y:axisStyle()}})});
}

// ===== PAYCHECK HISTORY =====
function addPaycheck(){
  const date=document.getElementById('pc-date').value||today();
  const gross=+document.getElementById('pc-gross').value||0;
  const net=+document.getElementById('pc-net').value||0;
  if(gross<=0)return;
  if(!DATA.paychecks)DATA.paychecks=[];
  DATA.paychecks.push({id:uid(),date,gross,net});
  document.getElementById('pc-gross').value='';document.getElementById('pc-net').value='';
  save();renderPaycheckHistory();
}
function renderPaycheckHistory(){
  const el=document.getElementById('paycheckHistory');if(!el)return;
  const pcs=(DATA.paychecks||[]).slice(-5).reverse();
  el.innerHTML=pcs.length?pcs.map(p=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;"><span>${p.date}</span><span>Gross: ${fmt(p.gross)} · Net: <b class="c-green">${fmt(p.net)}</b></span></div>`).join(''):'<p class="small center">No paychecks logged yet.</p>';
}


// ===== BUDGET / EXPENSES =====
const CATS={food:{i:'🍔',l:'Food',c:'#ef4444'},gas:{i:'⛽',l:'Gas',c:'#f59e0b'},clothes:{i:'👕',l:'Clothes',c:'#a855f7'},games:{i:'🎮',l:'Games',c:'#6366f1'},subscriptions:{i:'📱',l:'Subs',c:'#3b82f6'},school:{i:'📚',l:'School',c:'#0ea5e9'},phone:{i:'📞',l:'Phone',c:'#14b8a6'},personal:{i:'✨',l:'Personal',c:'#ec4899'},gifts:{i:'🎁',l:'Gifts',c:'#f97316'},tech:{i:'💻',l:'Tech',c:'#8b5cf6'},savings:{i:'💰',l:'Savings',c:'#22c55e'},investing:{i:'📈',l:'Investing',c:'#10b981'},travel:{i:'✈️',l:'Travel',c:'#06b6d4'},other:{i:'📦',l:'Other',c:'#6b7280'}};
function addExpense(){
  const date=document.getElementById('exp-date').value||today();const type=document.getElementById('exp-type').value;
  const cat=document.getElementById('exp-cat').value;const amt=+document.getElementById('exp-amt').value||0;
  const note=document.getElementById('exp-note').value.trim();if(amt<=0)return;
  DATA.expenses.push({id:uid(),date,type,category:cat,amount:amt,note});
  DATA.expenses.sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('exp-amt').value='';document.getElementById('exp-note').value='';
  if(type==='expense')addXP(5,'Tracked expense');updateStreak();save();renderBudget();renderAIAlerts();renderVelocity();
}
function delExp(id){DATA.expenses=DATA.expenses.filter(e=>e.id!==id);save();renderBudget();}
function renderBudget(){
  const mo=mKey(today());const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo);
  const inc=mExp.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
  const exp=mExp.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const dayNum=new Date().getDate();
  document.getElementById('bud-income').textContent=fmt(inc);
  document.getElementById('bud-expense').textContent=fmt(exp);
  document.getElementById('bud-net').textContent=fmt(inc-exp);
  document.getElementById('bud-avg').textContent=fmt(exp/Math.max(1,dayNum))+'/day';
  const tbody=document.querySelector('#exp-table tbody');
  if(tbody){
    const list=DATA.expenses.slice(0,100);
    tbody.innerHTML=list.length?list.map(e=>{const c=CATS[e.category]||CATS.other;const isInc=e.type==='income';return`<tr><td>${e.date}</td><td>${c.i} ${c.l}</td><td class="small">${e.note||'—'}</td><td style="color:${isInc?'var(--green)':'var(--red)'}">${isInc?'+':'-'}${fmt(e.amount)}</td><td><button class="btn btn-sm btn-g" onclick="delExp('${e.id}')">×</button></td></tr>`;}).join(''):'<tr><td colspan="5" class="center small">No transactions.</td></tr>';
  }
  const insights=document.getElementById('spend-insights');
  if(insights&&mExp.length>0){
    const catTotals={};mExp.filter(e=>e.type==='expense').forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount;});
    const topCat=Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];
    const projMonth=(exp/Math.max(1,dayNum))*30;
    let html=`<div class="small">`;
    if(topCat)html+=`📊 Top: <b>${(CATS[topCat[0]]||CATS.other).l}</b> (${fmt(topCat[1])})<br>`;
    html+=`📈 Projected: <b>${fmt(projMonth)}</b>/mo · Daily avg: <b>${fmt(exp/Math.max(1,dayNum))}</b></div>`;
    insights.innerHTML=html;
  }
  renderVelocity();renderPatterns();
}

// ===== COST PER USE =====
function calcCPU(){
  const item=document.getElementById('cpu-item').value.trim()||'Item';
  const price=+document.getElementById('cpu-price').value||0;
  const days=+document.getElementById('cpu-days').value||365;
  if(price<=0)return;
  const cpu=price/days;
  const el=document.getElementById('cpuResult');
  if(el)el.innerHTML=`<div class="sim-result"><p style="font-size:14px;"><b>${item}</b>: ${fmt(price)} ÷ ${days} days = <b class="c-green">${fmt(cpu)}/day</b></p><p class="small" style="margin-top:6px;">${cpu<1?'Great value! Under $1/day.':cpu<5?'Decent value.':'Consider if there is a cheaper option.'}</p></div>`;
}

// ===== MONEY WASTED =====
function addWaste(){
  const item=document.getElementById('waste-item').value.trim();const amt=+document.getElementById('waste-amt').value||0;
  const regret=+document.getElementById('waste-regret').value||5;if(!item||amt<=0)return;
  DATA.wastedMoney.push({id:uid(),date:today(),item,amount:amt,regret});
  document.getElementById('waste-item').value='';document.getElementById('waste-amt').value='';save();renderWaste();
}
function renderWaste(){
  const el=document.getElementById('wasteList');const stats=document.getElementById('wasteStats');if(!el)return;
  const total=DATA.wastedMoney.reduce((s,w)=>s+w.amount,0);
  const avgR=DATA.wastedMoney.length?DATA.wastedMoney.reduce((s,w)=>s+w.regret,0)/DATA.wastedMoney.length:0;
  if(stats)stats.innerHTML=`<div class="mstat"><div class="mstat-val c-red">${fmt(total)}</div><div class="mstat-lbl">Total Wasted</div></div><div class="mstat"><div class="mstat-val c-orange">${avgR.toFixed(1)}/10</div><div class="mstat-lbl">Avg Regret</div></div>`;
  el.innerHTML=DATA.wastedMoney.slice(-10).reverse().map(w=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;"><span>${w.date} — ${w.item}</span><span class="c-red">${fmt(w.amount)}</span></div>`).join('')||'<p class="small center">No regrets logged.</p>';
}

// ===== ENVELOPE BUDGETING =====
function renderEnvelopes(){
  const el=document.getElementById('envelopeList');const inputs=document.getElementById('envelopeInputs');if(!el)return;
  const mo=mKey(today());
  const envelopeCats=['food','gas','clothes','games','subscriptions','personal','other'];
  el.innerHTML=envelopeCats.map(cat=>{
    const limit=DATA.envelopes[cat]||0;if(limit<=0)return'';
    const spent=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense'&&e.category===cat).reduce((s,e)=>s+e.amount,0);
    const remaining=limit-spent;const pct=Math.min(100,(spent/limit)*100);
    const over=remaining<0;
    const c=CATS[cat]||CATS.other;
    return`<div class="envelope-item${over?' overspent':''}"><div class="envelope-header"><span class="envelope-name">${c.i} ${c.l}</span><span class="envelope-amounts">${fmt(spent)} / ${fmt(limit)} · <b style="color:${over?'var(--red)':'var(--green)'}">${over?'-':''}${fmt(Math.abs(remaining))} ${over?'over':'left'}</b></span></div><div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:${over?'var(--red)':pct>80?'var(--yellow)':'var(--green)'}"></div></div></div>`;
  }).join('');
  if(inputs)inputs.innerHTML=envelopeCats.map(cat=>{const c=CATS[cat]||CATS.other;return`<div class="fg"><label>${c.i} ${c.l}</label><input type="number" class="env-inp" data-cat="${cat}" value="${DATA.envelopes[cat]||0}" min="0" step="10"/></div>`;}).join('');
  renderPredictiveBudget();
}
function saveEnvelopes(){
  document.querySelectorAll('.env-inp').forEach(inp=>{DATA.envelopes[inp.dataset.cat]=+inp.value||0;});
  save();renderEnvelopes();
}

// ===== PREDICTIVE BUDGETING =====
function renderPredictiveBudget(){
  const el=document.getElementById('predictiveBudget');if(!el)return;
  const cats=['food','gas','clothes','games','subscriptions','personal','other'];
  let html='<div class="g g2">';
  cats.forEach(cat=>{
    const c=CATS[cat]||CATS.other;let total=0;let count=0;
    for(let i=1;i<=3;i++){const d=new Date();d.setMonth(d.getMonth()-i);const mk=mKey(d.toISOString().split('T')[0]);
      const s=DATA.expenses.filter(e=>mKey(e.date)===mk&&e.type==='expense'&&e.category===cat).reduce((sum,e)=>sum+e.amount,0);
      if(s>0){total+=s;count++;}
    }
    const avg=count>0?total/count:0;
    if(avg>0)html+=`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:11px;"><span>${c.i} ${c.l}</span><span class="c-accent">${fmt(avg)}</span></div>`;
  });
  html+='</div>';el.innerHTML=html;
}


// ===== BILLS =====
function addBill(){const name=document.getElementById('bill-name').value.trim();const amt=+document.getElementById('bill-amt').value||0;const day=+document.getElementById('bill-day').value||1;const cat=document.getElementById('bill-cat').value;if(!name||amt<=0)return;DATA.bills.push({id:uid(),name,amount:amt,dueDay:day,icon:cat});document.getElementById('bill-name').value='';document.getElementById('bill-amt').value='';save();renderBills();}
function delBill(id){DATA.bills=DATA.bills.filter(b=>b.id!==id);save();renderBills();}
function renderBills(){
  const total=DATA.bills.reduce((s,b)=>s+b.amount,0);const nowDay=new Date().getDate();
  const dueSoon=DATA.bills.filter(b=>b.dueDay>=nowDay&&b.dueDay<=nowDay+7).length;
  document.getElementById('bills-total').textContent=fmt(total);document.getElementById('bills-due-soon').textContent=dueSoon;
  const upcoming=document.getElementById('bills-upcoming');
  if(upcoming)upcoming.innerHTML=[...DATA.bills].sort((a,b)=>a.dueDay-b.dueDay).slice(0,5).map(b=>`<div class="bill-item"><div class="bill-icon">${b.icon}</div><div class="bill-info"><div class="bill-name">${b.name}</div><div class="bill-due">Due: ${b.dueDay}th</div></div><div class="bill-amt">${fmt(b.amount)}</div></div>`).join('')||'<p class="small center">No bills.</p>';
  const list=document.getElementById('bills-list');
  if(list)list.innerHTML=DATA.bills.map(b=>`<div class="bill-item"><div class="bill-icon">${b.icon}</div><div class="bill-info"><div class="bill-name">${b.name}</div><div class="bill-due">Due: ${b.dueDay}th</div></div><div class="bill-amt">${fmt(b.amount)}</div><button class="btn btn-sm btn-g" onclick="delBill('${b.id}')">×</button></div>`).join('');
}

// ===== GOALS =====
function addGoal(){const name=document.getElementById('goal-name').value.trim();const target=+document.getElementById('goal-target').value||0;const saved=+document.getElementById('goal-saved').value||0;const icon=document.getElementById('goal-icon').value;if(!name||target<=0)return;DATA.goals.push({id:uid(),name,target,saved,icon,priority:DATA.goals.length+1});document.getElementById('goal-name').value='';document.getElementById('goal-target').value='';document.getElementById('goal-saved').value='0';save();renderGoals();}
function delGoal(id){if(!confirm('Delete this goal?'))return;DATA.goals=DATA.goals.filter(g=>g.id!==id);save();renderGoals();}
function updateGoalSaved(id,val){
  const g=DATA.goals.find(x=>x.id===id);if(!g)return;
  const oldPct=Math.floor((g.saved/g.target)*4);g.saved=+val||0;const newPct=Math.floor((g.saved/g.target)*4);
  if(newPct>oldPct&&g.saved<=g.target){fireConfetti();addXP(25,'Goal milestone reached!');}
  if(g.saved>=g.target){fireConfettiSide();addXP(100,'Goal completed: '+g.name);}
  save();renderGoals();
}
function editGoal(id){const g=DATA.goals.find(x=>x.id===id);if(!g)return;const row=document.getElementById('goal-edit-'+id);if(row){const n=row.querySelector('.ge-name');const t=row.querySelector('.ge-target');const i=row.querySelector('.ge-icon');if(n)g.name=n.value||g.name;if(t)g.target=+t.value||g.target;if(i)g.icon=i.value||g.icon;save();renderGoals();}}
function toggleEditGoal(id){const el=document.getElementById('goal-edit-'+id);if(el)el.style.display=el.style.display==='none'?'flex':'none';}
function moveGoal(id,dir){const idx=DATA.goals.findIndex(g=>g.id===id);if(idx<0)return;const newIdx=idx+dir;if(newIdx<0||newIdx>=DATA.goals.length)return;[DATA.goals[idx],DATA.goals[newIdx]]=[DATA.goals[newIdx],DATA.goals[idx]];save();renderGoals();}

function renderGoals(){
  const list=document.getElementById('goals-list');
  if(list){list.innerHTML=DATA.goals.map((g,idx)=>{
    const pct=Math.min(100,(g.saved/g.target)*100);
    return`<div class="pbar-wrap" style="margin-bottom:14px;"><div class="pbar-top"><span class="pbar-name"><span style="color:var(--text-muted);font-size:10px;margin-right:4px;">#${idx+1}</span>${g.icon} ${g.name}</span><span class="pbar-amt">${fK(g.saved)} / ${fK(g.target)} (${pct.toFixed(0)}%)</span></div><div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:${pct>=100?'var(--green)':'var(--accent)'}"></div></div><div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap;"><input type="number" value="${g.saved}" min="0" step="10" onchange="updateGoalSaved('${g.id}',this.value)" style="width:90px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;"/><span class="small">saved</span><button class="btn btn-sm btn-g" onclick="moveGoal('${g.id}',-1)">↑</button><button class="btn btn-sm btn-g" onclick="moveGoal('${g.id}',1)">↓</button><button class="btn btn-sm btn-g" onclick="toggleEditGoal('${g.id}')">✏️</button><button class="btn btn-sm btn-danger" onclick="delGoal('${g.id}')">🗑️</button></div><div id="goal-edit-${g.id}" style="display:none;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap;"><input class="ge-name" type="text" value="${g.name}" style="flex:1;min-width:100px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:11px;"/><input class="ge-target" type="number" value="${g.target}" style="width:80px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;"/><input class="ge-icon" type="text" value="${g.icon}" style="width:40px;padding:4px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;text-align:center;"/><button class="btn btn-sm btn-p" onclick="editGoal('${g.id}')">Save</button></div></div>`;
  }).join('');}
  // Home quick goals
  const hg=document.getElementById('h-goals-list');
  if(hg)hg.innerHTML=DATA.goals.slice(0,5).map(g=>{const p=Math.min(100,(g.saved/g.target)*100);return`<div class="pbar-wrap"><div class="pbar-top"><span class="pbar-name">${g.icon} ${g.name}</span><span class="pbar-amt">${p.toFixed(0)}%</span></div><div class="pbar"><div class="pbar-fill" style="width:${p}%;background:var(--green)"></div></div></div>`;}).join('');
  const totalPct=DATA.goals.length?DATA.goals.reduce((s,g)=>s+Math.min(100,(g.saved/g.target)*100),0)/DATA.goals.length:0;
  const hp=document.getElementById('h-goals-progress');if(hp)hp.textContent=totalPct.toFixed(0)+'%';
  const streak=DATA.nospendDays.length;
  document.getElementById('streak-count')&&(document.getElementById('streak-count').textContent=streak);
  document.getElementById('h-streak')&&(document.getElementById('h-streak').textContent=DATA.streakDays+' days');
  const thisMonthNS=DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length;
  document.getElementById('nospend-count')&&(document.getElementById('nospend-count').textContent=thisMonthNS);
  document.getElementById('challenge-saved')&&(document.getElementById('challenge-saved').textContent=fK(thisMonthNS*15));
  renderGoalSuggestions();renderLeaderboard();renderFutureMessages();
}
function markNoSpend(){const t=today();if(!DATA.nospendDays.includes(t)){DATA.nospendDays.push(t);addXP(20,'No-spend day');updateStreak();save();renderGoals();}}

// ===== SMART GOAL SUGGESTIONS =====
function renderGoalSuggestions(){
  const el=document.getElementById('goalSuggestions');if(!el)return;
  const monthlyNet=DATA.wage*DATA.schoolHours*4.33*(1-totalTaxRate());
  const saveable=monthlyNet*0.3;
  const active=DATA.goals.filter(g=>g.saved<g.target).slice(0,3);
  el.innerHTML=active.map(g=>{const remaining=g.target-g.saved;const months=Math.ceil(remaining/Math.max(1,saveable/active.length));return`<p style="font-size:11px;margin-bottom:4px;">💡 <b>${g.name}</b>: Save ${fmt(saveable/active.length)}/mo → done in ~${months} months</p>`;}).join('')||'<p class="small">All goals complete!</p>';
}

// ===== FUTURE MESSAGES =====
function addFutureMessage(){const msg=document.getElementById('future-msg').value.trim();const date=document.getElementById('future-date').value;if(!msg||!date)return;DATA.futureMessages.push({id:uid(),message:msg,unlockDate:date,createdDate:today()});document.getElementById('future-msg').value='';save();renderFutureMessages();}
function renderFutureMessages(){const el=document.getElementById('futureMessages');if(!el)return;const now=today();el.innerHTML=DATA.futureMessages.map(m=>{const unlocked=m.unlockDate<=now;return`<div class="future-msg ${unlocked?'':'locked'}"><div style="font-size:10px;color:var(--text-muted);">${unlocked?'Unlocked':'🔒 Unlocks'}: ${m.unlockDate}</div>${unlocked?`<div style="font-size:12px;margin-top:4px;">${m.message}</div>`:`<div style="font-size:11px;color:var(--yellow);font-style:italic;">Locked until ${m.unlockDate}</div>`}</div>`;}).join('');}

// ===== LEADERBOARD =====
function renderLeaderboard(){
  const el=document.getElementById('leaderboardSelf');if(!el)return;
  const mo=mKey(today());const lastMo=new Date();lastMo.setMonth(lastMo.getMonth()-1);const lk=mKey(lastMo.toISOString().split('T')[0]);
  const thisInc=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const lastInc=DATA.expenses.filter(e=>mKey(e.date)===lk&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const thisExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const lastExp=DATA.expenses.filter(e=>mKey(e.date)===lk&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const rows=[{l:'Income',t:fmt(thisInc),la:fmt(lastInc),d:thisInc-lastInc,g:true},{l:'Spending',t:fmt(thisExp),la:fmt(lastExp),d:thisExp-lastExp,g:false}];
  el.innerHTML=rows.map(r=>{const better=(r.g&&r.d>0)||(!r.g&&r.d<0);return`<div class="lb-row"><span style="font-size:12px;font-weight:600;">${r.l}</span><div style="display:flex;gap:12px;font-size:11px;font-family:var(--mono);"><span class="c-green">${r.t}</span><span style="color:var(--text-muted)">${r.la}</span><span style="color:${better?'var(--green)':'var(--red)'}">${r.d>0?'↑':'↓'}</span></div></div>`;}).join('');
}


// ===== TECH TRACKER =====
function addTech(){const name=document.getElementById('tech-name').value.trim();const cost=+document.getElementById('tech-cost').value||0;const saved=+document.getElementById('tech-saved').value||0;if(!name||cost<=0)return;DATA.techItems.push({id:uid(),name,cost,saved});document.getElementById('tech-name').value='';save();renderTech();}
function renderTech(){const tbody=document.querySelector('#tech-table tbody');if(!tbody)return;tbody.innerHTML=DATA.techItems.map(t=>{const rem=Math.max(0,t.cost-t.saved);const pct=Math.min(100,(t.saved/t.cost)*100);const status=pct>=100?'<span class="tag tag-green">OWNED</span>':pct>0?'<span class="tag tag-yellow">SAVING</span>':'<span class="tag tag-accent">PLANNED</span>';return`<tr><td class="bold">${t.name}</td><td>${fmt(t.cost)}</td><td class="c-green">${fmt(t.saved)}</td><td class="c-red">${fmt(rem)}</td><td><div class="pbar" style="height:6px;width:80px;display:inline-block;"><div class="pbar-fill" style="width:${pct}%;background:var(--green)"></div></div> ${pct.toFixed(0)}%</td><td>${status}</td></tr>`;}).join('');}

// ===== INVESTMENTS =====
function compound(start,monthly,rate,years){const r=rate/100/12;const m=years*12;let b=start;const h=[b];for(let i=0;i<m;i++){b=b*(1+r)+monthly;h.push(b);}return{final:b,contrib:start+monthly*m,gains:b-(start+monthly*m),hist:h};}
function renderInvestments(){
  const b=DATA.investmentBal;const mo=DATA.monthlyInvest;const ret=DATA.expectedReturn;
  const p1=compound(b,mo,ret,1),p5=compound(b,mo,ret,5),p10=compound(b,mo,ret,10);
  document.getElementById('inv-total').textContent=fmt(b);document.getElementById('inv-monthly').textContent=fmt(mo)+'/mo';
  let dy=0;DATA.holdings.forEach(h=>{dy+=(h.alloc/100)*(h.yield/100);});
  document.getElementById('inv-divs').textContent=fmt(b*dy)+'/yr';document.getElementById('inv-return').textContent=ret+'%';
  document.getElementById('inv-1yr').textContent=fK(p1.final);document.getElementById('inv-5yr').textContent=fK(p5.final);document.getElementById('inv-10yr').textContent=fK(p10.final);
  const tb=document.querySelector('#inv-table tbody');if(tb)tb.innerHTML=DATA.holdings.map(h=>`<tr><td class="bold c-accent">${h.ticker}</td><td>${h.alloc}%</td><td>${fmt(b*h.alloc/100)}</td><td><span class="tag tag-blue">${h.type}</span></td><td>${h.yield}%</td></tr>`).join('');
  const ds=document.getElementById('div-summary');if(ds)ds.innerHTML=`<div class="g g2"><div class="mstat"><div class="mstat-val c-green">${fmt(b*dy)}</div><div class="mstat-lbl">Annual</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(b*dy/4)}</div><div class="mstat-lbl">Quarterly</div></div></div>`;
  renderRebalanceAlerts();
}

// ===== REBALANCING ALERTS =====
function renderRebalanceAlerts(){
  const el=document.getElementById('rebalanceAlerts');if(!el)return;
  const totalVal=DATA.investmentBal;if(totalVal<=0){el.innerHTML='<p class="small">Add investment balance to see alerts.</p>';return;}
  const alerts=DATA.holdings.filter(h=>{const target=h.targetAlloc||h.alloc;return Math.abs(h.alloc-target)>=5;}).map(h=>`<div style="padding:6px 0;font-size:12px;border-bottom:1px solid var(--border);"><b class="c-accent">${h.ticker}</b> is ${h.alloc}% — target is ${h.targetAlloc||h.alloc}%. <span class="c-orange">Consider rebalancing.</span></div>`);
  el.innerHTML=alerts.join('')||'<p class="small c-green">Portfolio is balanced ✓</p>';
}

// ===== DCA TRACKER =====
function addDCA(){
  const ticker=document.getElementById('dca-ticker').value.trim().toUpperCase();
  const amount=+document.getElementById('dca-amount').value||0;
  const price=+document.getElementById('dca-price').value||0;
  const date=document.getElementById('dca-date').value||today();
  if(!ticker||amount<=0||price<=0)return;
  if(!DATA.dcaPurchases)DATA.dcaPurchases=[];
  DATA.dcaPurchases.push({id:uid(),ticker,amount,price,shares:amount/price,date});
  document.getElementById('dca-ticker').value='';document.getElementById('dca-amount').value='';document.getElementById('dca-price').value='';
  save();renderDCA();
}
function renderDCA(){
  const el=document.getElementById('dcaSummary');if(!el)return;
  const purchases=DATA.dcaPurchases||[];
  const grouped={};purchases.forEach(p=>{if(!grouped[p.ticker])grouped[p.ticker]={totalCost:0,totalShares:0,count:0};grouped[p.ticker].totalCost+=p.amount;grouped[p.ticker].totalShares+=p.shares;grouped[p.ticker].count++;});
  el.innerHTML=Object.entries(grouped).map(([ticker,d])=>{const avgCost=d.totalCost/d.totalShares;return`<div style="display:flex;justify-content:space-between;padding:10px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;"><div><div style="font-weight:700;color:var(--accent);">${ticker}</div><div class="small">${d.count} purchases · ${d.totalShares.toFixed(4)} shares</div></div><div style="text-align:right;"><div style="font-weight:700;">${fmt(avgCost)}</div><div class="small">avg cost basis</div></div></div>`;}).join('')||'<p class="small center">No DCA purchases logged.</p>';
}

// ===== SPECULATIVE =====
function addSpec(){const ticker=document.getElementById('spec-ticker').value.trim().toUpperCase();const entry=+document.getElementById('spec-entry').value||0;const current=+document.getElementById('spec-current').value||0;const shares=+document.getElementById('spec-shares').value||1;const thesis=document.getElementById('spec-thesis').value.trim();if(!ticker)return;DATA.specPositions.push({id:uid(),ticker,thesis,entry,current,shares});document.getElementById('spec-ticker').value='';save();renderSpec();}
function renderSpec(){const tb=document.querySelector('#spec-table tbody');if(!tb)return;tb.innerHTML=DATA.specPositions.map(p=>{const gl=(p.current-p.entry)*p.shares;const pct=p.entry>0?((p.current-p.entry)/p.entry*100):0;return`<tr><td class="bold c-accent">${p.ticker}</td><td class="small">${p.thesis}</td><td>${fmt(p.entry)}</td><td>${fmt(p.current)}</td><td>${p.shares}</td><td style="color:${gl>=0?'var(--green)':'var(--red)'}">${gl>=0?'+':''}${fmt(gl)} (${pct>=0?'+':''}${pct.toFixed(1)}%)</td></tr>`;}).join('');}

// ===== COMPOUND INTEREST =====
function renderCompound(){
  const mo=+document.getElementById('ci-monthly')?.value||300;const start=+document.getElementById('ci-start')?.value||17;
  const end=+document.getElementById('ci-end')?.value||60;const ret=+document.getElementById('ci-return')?.value||10;
  const yrs=end-start;const p=compound(0,mo,ret,yrs);
  document.getElementById('ci-total').textContent=fK(p.final);document.getElementById('ci-contrib').textContent=fK(p.contrib);
  document.getElementById('ci-gains').textContent=fK(p.gains);document.getElementById('ci-income').textContent=fK(p.final*0.04/12)+'/mo';
  const tb=document.querySelector('#ci-milestones tbody');
  if(tb){const ages=[18,20,22,25,30,35,40,50,60];tb.innerHTML=ages.filter(a=>a<=end).map(a=>{const y=a-start;if(y<0)return'';const pp=compound(0,mo,ret,y);return`<tr><td class="bold">${a}</td><td class="c-green">${fK(pp.final)}</td><td>${fK(pp.contrib)}</td><td class="c-purple">+${fK(pp.gains)}</td></tr>`;}).join('');}
  const comp=document.getElementById('ci-comparison');
  if(comp)comp.innerHTML=[17,22,30].map(age=>{const y=end-age;const pp=compound(0,mo,ret,Math.max(0,y));const col=age===17?'var(--green)':age===22?'var(--yellow)':'var(--red)';return`<div class="card" style="text-align:center;"><div class="small">Start at ${age}</div><div class="mstat-val" style="color:${col};font-size:18px;">${fK(pp.final)}</div></div>`;}).join('');
  renderCompoundChart();
}


// ===== EDUCATION =====
function renderEducation(){
  const opts=document.getElementById('edu-options');
  if(opts){const schools=[{name:'OTC',cost:'$3,000/yr',detail:'2-year associate',color:'var(--green)'},{name:'Valencia',cost:'$3,500/yr',detail:'DirectConnect to UCF',color:'var(--blue)'},{name:'UCF',cost:'$6,400/yr',detail:'4-year university',color:'var(--yellow)'},{name:'Trade School',cost:'$5K-15K',detail:'HVAC, welding, electrical',color:'var(--orange)'},{name:'Semiconductor',cost:'$8K-20K',detail:'EE or technician cert',color:'var(--purple)'}];opts.innerHTML=schools.map(s=>`<div class="edu-card"><div class="name">${s.name}</div><div class="cost" style="color:${s.color};">${s.cost}</div><div class="detail">${s.detail}</div></div>`).join('');}
  document.getElementById('edu-savings').textContent=fmt(DATA.eduSavings);document.getElementById('edu-fafsa').textContent=fmt(DATA.eduFafsa);document.getElementById('edu-bright').textContent=fmt(DATA.eduBright);document.getElementById('edu-scholar').textContent=fmt(DATA.eduScholar);
}

// ===== NET WORTH =====
function renderNetWorth(){
  const total=DATA.assets.reduce((s,a)=>s+a.value,0);
  document.getElementById('nw-total').textContent=fmt(total);document.getElementById('nwPill').textContent=fK(total);document.getElementById('h-networth').textContent=fK(total);
  document.getElementById('h-checking').textContent=fmt(DATA.checking);document.getElementById('h-emergency').textContent=fmt(DATA.emergencyFund);document.getElementById('h-investments').textContent=fmt(DATA.investmentBal);
  const tb=document.querySelector('#nw-table tbody');if(tb)tb.innerHTML=DATA.assets.map(a=>{const p=total>0?((a.value/total)*100).toFixed(1):'0';return`<tr><td class="bold">${a.name}</td><td class="c-green">${fmt(a.value)}</td><td>${p}%</td></tr>`;}).join('');
  const inputs=document.getElementById('nw-inputs');if(inputs)inputs.innerHTML=`<div class="g g3">${DATA.assets.map((a,i)=>`<div class="fg"><label>${a.name}</label><input type="number" class="nw-inp" data-idx="${i}" value="${a.value}" min="0"/></div>`).join('')}</div>`;
}

// ===== TIMELINE =====
function renderTimeline(){const el=document.getElementById('timeline-list');if(!el)return;el.innerHTML=DATA.timeline.map(t=>`<div class="tl-item"><div class="tl-dot ${t.status}"></div><div class="tl-date">${t.date}</div><div class="tl-title">${t.title}</div><div class="tl-desc">${t.desc}</div></div>`).join('');}

// ===== PROJECTIONS =====
function renderProjections(){
  const tb=document.querySelector('#proj-table tbody');if(!tb)return;
  const monthlyNet=DATA.wage*DATA.schoolHours*4.33*(1-totalTaxRate());
  let savings=DATA.checking+DATA.emergencyFund;let inv=DATA.investmentBal;const rows=[];
  for(let age=17;age<=25;age++){savings+=monthlyNet*12*0.3;inv=inv*(1+DATA.expectedReturn/100)+DATA.monthlyInvest*12;rows.push(`<tr><td class="bold">${age}</td><td>${2026+(age-17)}</td><td>${fK(savings)}</td><td class="c-green">${fK(inv)}</td><td class="c-accent bold">${fK(savings+inv)}</td></tr>`);}
  tb.innerHTML=rows.join('');
}

// ===== WHAT-IF =====
function runWhatIf(){
  const scenario=document.getElementById('wi-scenario').value;const val=+document.getElementById('wi-value').value||0;const res=document.getElementById('wi-result');if(!res)return;
  const base=compound(DATA.investmentBal,DATA.monthlyInvest,DATA.expectedReturn,10);let html='';
  if(scenario==='hours'){const mn=DATA.wage*val*4.33*(1-totalTaxRate());html=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-green">${fmt(mn)}</div><div class="mstat-lbl">Monthly Net</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(mn*11)}</div><div class="mstat-lbl">Yearly</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(Math.min(DATA.monthlyInvest,mn))}</div><div class="mstat-lbl">Can Invest</div></div></div></div>`;}
  else if(scenario==='invest'){const p=compound(DATA.investmentBal,val,DATA.expectedReturn,10);html=`<div class="sim-result"><div class="g g2"><div class="mstat"><div class="mstat-val c-accent">${fK(base.final)}</div><div class="mstat-lbl">Current ($${DATA.monthlyInvest}/mo)</div></div><div class="mstat"><div class="mstat-val c-green">${fK(p.final)}</div><div class="mstat-lbl">New ($${val}/mo)</div></div></div><p class="small mt">Difference: <b class="c-green">+${fK(p.final-base.final)}</b></p></div>`;}
  else if(scenario==='buy'){const inv=compound(val,0,DATA.expectedReturn,10);html=`<div class="sim-result"><div class="g g2"><div class="mstat"><div class="mstat-val c-red">-${fmt(val)}</div><div class="mstat-lbl">Cost Now</div></div><div class="mstat"><div class="mstat-val c-green">${fK(inv.final)}</div><div class="mstat-lbl">If Invested (10yr)</div></div></div></div>`;}
  else if(scenario==='ttwo'){const pos=DATA.specPositions.find(p=>p.ticker==='TTWO');const shares=pos?pos.shares:2;const entry=pos?pos.entry:180;html=`<div class="sim-result"><div class="g g2"><div class="mstat"><div class="mstat-val c-green">+${fmt((entry*2-entry)*shares)}</div><div class="mstat-lbl">Profit</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(entry*2*shares)}</div><div class="mstat-lbl">Position Value</div></div></div></div>`;}
  else if(scenario==='rx7'){const monthly=val||500;const months=Math.ceil(30000/monthly);html=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-accent">${fmt(monthly)}</div><div class="mstat-lbl">/Month</div></div><div class="mstat"><div class="mstat-val c-yellow">${months} mo</div><div class="mstat-lbl">Time</div></div><div class="mstat"><div class="mstat-val c-purple">${(months/12).toFixed(1)} yrs</div><div class="mstat-lbl">That's...</div></div></div></div>`;}
  else if(scenario==='engineer'){const sal=val||75000;const mn=sal/12*0.75;const inv10=compound(0,mn*0.2,DATA.expectedReturn,10);html=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-green">${fmt(mn)}</div><div class="mstat-lbl">Monthly Net</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(mn*0.2)}</div><div class="mstat-lbl">20% Invest</div></div><div class="mstat"><div class="mstat-val c-purple">${fK(inv10.final)}</div><div class="mstat-lbl">10yr Portfolio</div></div></div></div>`;}
  else{html=`<div class="sim-result"><p class="small">Select a scenario and enter a value.</p></div>`;}
  res.innerHTML=html;
}
function runBvS(){
  const item=document.getElementById('bvs-item').value.trim()||'this item';const price=+document.getElementById('bvs-price').value||0;const happy=+document.getElementById('bvs-happy').value||5;if(price<=0)return;
  const hoursNeeded=price/(DATA.wage*(1-totalTaxRate()));const invested=compound(price,0,DATA.expectedReturn,10);
  const score=Math.max(1,Math.min(10,11-happy));const verdict=score>=7?'SAVE':score>=4?'THINK':'BUY (if budgeted)';const col=score>=7?'var(--green)':score>=4?'var(--yellow)':'var(--accent)';
  document.getElementById('bvs-result').innerHTML=`<div class="sim-result" style="border-color:${col}"><div class="center mb"><div style="font-size:22px;font-weight:800;color:${col}">${verdict}</div></div><div class="g g3"><div class="mstat"><div class="mstat-val c-yellow">${hoursNeeded.toFixed(1)} hrs</div><div class="mstat-lbl">Work to Earn</div></div><div class="mstat"><div class="mstat-val c-green">${fK(invested.final)}</div><div class="mstat-lbl">If Invested</div></div><div class="mstat"><div class="mstat-val c-purple">${fK(invested.gains)}</div><div class="mstat-lbl">Missed Gains</div></div></div></div>`;
}

// ===== TAX, CREDIT, STOCKS, MOVEOUT, CAR, TRAVEL =====
function calcTax(){const ytd=+document.getElementById('tax-ytd').value||0;const withheld=+document.getElementById('tax-withheld').value||0;const status=document.getElementById('tax-status').value;const stdDed=status==='single'?14600:Math.min(14600,Math.max(1300,ytd+450));const taxable=Math.max(0,ytd-stdDed);let taxOwed=taxable<=11600?taxable*0.10:1160+(taxable-11600)*0.12;const refund=withheld-taxOwed;document.getElementById('taxResult').innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-accent">${fmt(taxable)}</div><div class="mstat-lbl">Taxable</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(taxOwed)}</div><div class="mstat-lbl">Tax Owed</div></div><div class="mstat"><div class="mstat-val ${refund>=0?'c-green':'c-red'}">${refund>=0?'+':''}${fmt(refund)}</div><div class="mstat-lbl">${refund>=0?'Refund':'You Owe'}</div></div></div></div>`;}
function calcCredit(){const limit=+document.getElementById('credit-limit').value||500;const balance=+document.getElementById('credit-balance').value||0;const util=limit>0?(balance/limit*100):0;const rating=util<=10?'Excellent':util<=30?'Good':util<=50?'Fair':'Poor';const col=util<=10?'var(--green)':util<=30?'var(--blue)':util<=50?'var(--yellow)':'var(--red)';document.getElementById('creditResult').innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val" style="color:${col}">${util.toFixed(1)}%</div><div class="mstat-lbl">Utilization</div></div><div class="mstat"><div class="mstat-val" style="color:${col}">${rating}</div><div class="mstat-lbl">Rating</div></div><div class="mstat"><div class="mstat-val">${fmt(limit-balance)}</div><div class="mstat-lbl">Available</div></div></div></div>`;}
function renderCreditTips(){const el=document.getElementById('creditTips');if(!el)return;el.innerHTML=['💳 Pay full balance monthly','📅 Set up autopay','📊 Keep under 30% utilization','🔒 Don\'t close old cards','📱 Check report at annualcreditreport.com'].map(t=>`<p style="font-size:12px;margin-bottom:4px;">${t}</p>`).join('');}
function renderStocks(){const el=document.getElementById('stockCards');if(!el)return;el.innerHTML=(DATA.watchlist||[]).map(t=>{const d=DATA.stockPrices[t];if(!d)return`<div class="stock-card"><div class="ticker">${t}</div><div class="price">—</div><div class="small">Refresh</div></div>`;const col=d.change>=0?'var(--green)':'var(--red)';return`<div class="stock-card"><div class="ticker">${t}</div><div class="price" style="color:${col}">${fmt(d.price)}</div><div style="font-size:11px;color:${col}">${d.change>=0?'+':''}${d.changePercent.toFixed(2)}%</div></div>`;}).join('');}
function addStockTicker(){const t=document.getElementById('stock-ticker-input').value.trim().toUpperCase();if(!t)return;if(!DATA.watchlist.includes(t))DATA.watchlist.push(t);document.getElementById('stock-ticker-input').value='';save();renderStocks();}
function refreshStocks(){const known={VOO:520,QQQM:210,TTWO:210,AAPL:195,TSLA:250,CCJ:52,SMR:18,MSFT:420,GOOGL:175,NVDA:130};DATA.watchlist.forEach(t=>{const base=known[t]||100+Math.random()*200;const change=(Math.random()-0.48)*5;DATA.stockPrices[t]={price:base+change,change,changePercent:(change/base)*100};});save();renderStocks();}
function calcMoveOut(){const rent=+document.getElementById('mo-rent').value||0;const deposit=+document.getElementById('mo-deposit').value||0;const fl=+document.getElementById('mo-firstlast').value||2;const furn=+document.getElementById('mo-furniture').value||0;const util=+document.getElementById('mo-utilities').value||0;const groc=+document.getElementById('mo-groceries').value||0;const upfront=rent*fl+deposit+furn;const monthly=rent+util+groc;document.getElementById('moveoutResult').innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-red">${fmt(upfront)}</div><div class="mstat-lbl">Upfront</div></div><div class="mstat"><div class="mstat-val c-orange">${fmt(monthly)}</div><div class="mstat-lbl">Monthly</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(monthly*12)}</div><div class="mstat-lbl">Yearly</div></div></div></div>`;}
function calcCar(){const price=+document.getElementById('car-price').value||0;const down=+document.getElementById('car-down').value||0;const rate=+document.getElementById('car-rate').value||7;const term=+document.getElementById('car-term').value||60;const ins=+document.getElementById('car-insurance').value||0;const gas=+document.getElementById('car-gas').value||0;const loan=price-down;const mr=rate/100/12;const pmt=mr>0?loan*(mr*Math.pow(1+mr,term))/(Math.pow(1+mr,term)-1):loan/term;const trueCost=pmt+ins+gas+50;document.getElementById('carResult').innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-accent">${fmt(pmt)}</div><div class="mstat-lbl">Loan/Mo</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(trueCost)}</div><div class="mstat-lbl">True Cost/Mo</div></div><div class="mstat"><div class="mstat-val c-purple">${(trueCost/(DATA.wage*(1-totalTaxRate()))).toFixed(1)} hrs/wk</div><div class="mstat-lbl">Work for Car</div></div></div></div>`;}
function addTrip(){const dest=document.getElementById('trip-dest').value.trim();const cost=+document.getElementById('trip-cost').value||0;const date=document.getElementById('trip-date').value;if(!dest||cost<=0)return;DATA.trips.push({id:uid(),destination:dest,cost,targetDate:date,saved:0});document.getElementById('trip-dest').value='';save();renderTrips();}
function renderTrips(){const el=document.getElementById('tripsList');if(!el)return;el.innerHTML=(DATA.trips||[]).map(t=>{const pct=Math.min(100,(t.saved/t.cost)*100);return`<div class="card" style="margin-bottom:10px;"><div class="pbar-top"><span class="pbar-name">✈️ ${t.destination}</span><span class="pbar-amt">${fmt(t.saved)}/${fmt(t.cost)}</span></div><div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:var(--cyan)"></div></div><div style="display:flex;gap:6px;margin-top:6px;"><input type="number" value="${t.saved}" min="0" step="10" onchange="updateTripSaved('${t.id}',this.value)" style="width:80px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;"/><button class="btn btn-sm btn-danger" onclick="delTrip('${t.id}')">×</button></div></div>`;}).join('')||'<p class="small center">No trips planned.</p>';}
function updateTripSaved(id,val){const t=DATA.trips.find(x=>x.id===id);if(t){t.saved=+val||0;save();renderTrips();}}
function delTrip(id){DATA.trips=DATA.trips.filter(t=>t.id!==id);save();renderTrips();}


// ===== STUDENT LOAN SIMULATOR =====
function calcLoan(){const amt=+document.getElementById('loan-amount').value||0;const rate=+document.getElementById('loan-rate').value||5.5;const years=+document.getElementById('loan-term').value||10;const mr=rate/100/12;const n=years*12;const pmt=mr>0?amt*(mr*Math.pow(1+mr,n))/(Math.pow(1+mr,n)-1):amt/n;const totalPaid=pmt*n;const interest=totalPaid-amt;document.getElementById('loanResult').innerHTML=`<div class="sim-result"><div class="g g4"><div class="mstat"><div class="mstat-val c-accent">${fmt(pmt)}</div><div class="mstat-lbl">Monthly Payment</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(interest)}</div><div class="mstat-lbl">Total Interest</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(totalPaid)}</div><div class="mstat-lbl">Total Cost</div></div><div class="mstat"><div class="mstat-val c-orange">${((totalPaid/amt-1)*100).toFixed(0)}%</div><div class="mstat-lbl">Extra Paid</div></div></div><p class="small mt">A ${fmt(amt)} loan costs ${fmt(interest)} in interest over ${years} years.</p></div>`;}

// ===== CALENDAR =====
function renderCalendar(){const grid=document.getElementById('calendarGrid');const label=document.getElementById('cal-month-label');if(!grid||!label)return;const year=DATA.calYear;const month=DATA.calMonth;label.textContent=new Date(year,month).toLocaleDateString('en-US',{month:'long',year:'numeric'});const firstDay=new Date(year,month,1).getDay();const daysInMonth=new Date(year,month+1,0).getDate();const todayStr=today();let html='';['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{html+=`<div class="cal-header">${d}</div>`;});for(let i=0;i<firstDay;i++)html+=`<div class="cal-day empty"></div>`;for(let d=1;d<=daysInMonth;d++){const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const isToday=ds===todayStr;const events=getCalEvents(ds);html+=`<div class="cal-day${isToday?' today':''}" onclick="showCalDay('${ds}')"><div class="day-num">${d}</div><div class="cal-events">${events.slice(0,2).map(e=>`<div class="cal-event ${e.type}">${e.label}</div>`).join('')}</div></div>`;}grid.innerHTML=html;}
function getCalEvents(ds){const events=[];const day=new Date(ds).getDate();DATA.shifts.filter(s=>s.date===ds).length&&events.push({type:'shift',label:'☕ Work'});DATA.bills.forEach(b=>{if(b.dueDay===day)events.push({type:'bill',label:b.name});});DATA.timeline.forEach(t=>{if(t.date===ds)events.push({type:'payday',label:t.title});});return events;}
function showCalDay(ds){const el=document.getElementById('calDayDetails');if(!el)return;const shifts=DATA.shifts.filter(s=>s.date===ds);const exps=DATA.expenses.filter(e=>e.date===ds);let html=`<h4 style="margin-bottom:8px;">${new Date(ds+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</h4>`;if(shifts.length)html+=`<p class="small"><b>Shifts:</b> ${shifts.map(s=>`${s.hours.toFixed(1)}h (${fmt(s.gross)})`).join(', ')}</p>`;if(exps.length)html+=`<p class="small"><b>Transactions:</b> ${exps.map(e=>`${e.note||e.category} ${e.type==='income'?'+':'-'}${fmt(e.amount)}`).join(', ')}</p>`;if(!shifts.length&&!exps.length)html+=`<p class="small">No activity.</p>`;el.innerHTML=html;}
function calPrev(){DATA.calMonth--;if(DATA.calMonth<0){DATA.calMonth=11;DATA.calYear--;}renderCalendar();}
function calNext(){DATA.calMonth++;if(DATA.calMonth>11){DATA.calMonth=0;DATA.calYear++;}renderCalendar();}

// ===== WEEKLY PLANNER =====
function renderWeeklyPlanner(){const el=document.getElementById('weeklyPlannerContent');if(!el)return;const now=new Date();const startOfWeek=new Date(now);startOfWeek.setDate(now.getDate()-now.getDay());const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];let html='';for(let i=0;i<7;i++){const d=new Date(startOfWeek);d.setDate(startOfWeek.getDate()+i);const ds=d.toISOString().split('T')[0];const shifts=DATA.shifts.filter(s=>s.date===ds);const isToday=ds===today();let evts=[];if(shifts.length)evts.push('☕ '+shifts.reduce((s,sh)=>s+sh.hours,0).toFixed(1)+'h');const bills=DATA.bills.filter(b=>b.dueDay===d.getDate());if(bills.length)evts.push('📅 '+fmt(bills.reduce((s,b)=>s+b.amount,0)));html+=`<div class="planner-day" style="${isToday?'border-color:var(--accent)':''}"><span class="day-name">${days[i]}</span><span style="font-size:10px;color:var(--text-muted);min-width:70px;">${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><span style="flex:1;font-size:11px;">${evts.join(' · ')||'Free'}</span></div>`;}el.innerHTML=html;}

// ===== MONTHLY REPORT =====
function renderMonthlyReport(){const el=document.getElementById('monthlyReportContent');if(!el)return;const mo=mKey(today());const monthName=new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'});const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo);const inc=mExp.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);const exp=mExp.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);const mShifts=DATA.shifts.filter(s=>mKey(s.date)===mo);const nw=DATA.assets.reduce((s,a)=>s+a.value,0);el.innerHTML=`<h3 style="margin-bottom:12px;">📄 ${monthName}</h3><div class="g g4 mb"><div class="mstat"><div class="mstat-val c-green">${fmt(inc)}</div><div class="mstat-lbl">Income</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(exp)}</div><div class="mstat-lbl">Spent</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(inc-exp)}</div><div class="mstat-lbl">Net</div></div><div class="mstat"><div class="mstat-val c-purple">${fK(nw)}</div><div class="mstat-lbl">Net Worth</div></div></div><div class="divider"></div><p class="small">${mShifts.length} shifts · ${mShifts.reduce((s,sh)=>s+sh.hours,0).toFixed(1)} hrs · Savings rate: ${inc>0?((inc-exp)/inc*100).toFixed(0):0}%</p>`;}
function exportReport(){const el=document.getElementById('monthlyReportContent');if(!el)return;const blob=new Blob([el.innerText],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='report-'+mKey(today())+'.txt';document.body.appendChild(a);a.click();document.body.removeChild(a);}

// ===== CAREER & RAISE =====
function renderCareer(){renderCareerChart();}
function calcRaise(){const raise=+document.getElementById('raise-amt').value||0.5;const hrs=+document.getElementById('raise-hrs').value||20;const weekly=raise*hrs;const monthly=weekly*4.33;const yearly=monthly*12*(1-totalTaxRate());document.getElementById('raiseResult').innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-green">+${fmt(weekly)}</div><div class="mstat-lbl">/Week</div></div><div class="mstat"><div class="mstat-val c-accent">+${fmt(monthly)}</div><div class="mstat-lbl">/Month</div></div><div class="mstat"><div class="mstat-val c-purple">+${fmt(yearly)}</div><div class="mstat-lbl">/Year Net</div></div></div></div>`;}

// ===== SIDE HUSTLES =====
function addHustle(){const name=document.getElementById('sh-name').value.trim();const earn=+document.getElementById('sh-earn').value||0;const hours=+document.getElementById('sh-hours').value||0;const date=document.getElementById('sh-hustle-date').value||today();if(!name||earn<=0)return;DATA.sideHustles.push({id:uid(),name,earnings:earn,hours,date});document.getElementById('sh-name').value='';document.getElementById('sh-earn').value='';addXP(10,'Side hustle');save();renderHustles();}
function renderHustles(){const tb=document.querySelector('#hustle-table tbody');if(!tb)return;const agg={};(DATA.sideHustles||[]).forEach(h=>{if(!agg[h.name])agg[h.name]={earn:0,hrs:0,count:0};agg[h.name].earn+=h.earnings;agg[h.name].hrs+=h.hours;agg[h.name].count++;});const rows=Object.entries(agg).sort((a,b)=>b[1].earn-a[1].earn);tb.innerHTML=rows.length?rows.map(([name,d])=>`<tr><td class="bold">${name}</td><td class="c-green">${fmt(d.earn)}</td><td>${d.hrs.toFixed(1)}</td><td class="c-accent">${d.hrs>0?fmt(d.earn/d.hrs)+'/hr':'—'}</td><td>${d.count}</td></tr>`).join(''):'<tr><td colspan="5" class="center small">No hustles.</td></tr>';}


// ===== XP SYSTEM =====
const XP_LEVELS=[{name:'Rookie',min:0,icon:'🌱'},{name:'Saver',min:100,icon:'💪'},{name:'Investor',min:500,icon:'📈'},{name:'Wealth Builder',min:1500,icon:'🏗️'},{name:'Millionaire Mindset',min:5000,icon:'💎'},{name:'Financial Legend',min:10000,icon:'👑'}];
function getLevel(xp){let lvl=XP_LEVELS[0];for(let i=XP_LEVELS.length-1;i>=0;i--){if(xp>=XP_LEVELS[i].min){lvl=XP_LEVELS[i];break;}}return lvl;}
function getNextLevel(xp){for(let i=0;i<XP_LEVELS.length;i++){if(xp<XP_LEVELS[i].min)return XP_LEVELS[i];}return null;}
function addXP(amount,reason){
  const mult=getStreakMultiplier();const actual=Math.round(amount*mult);
  const oldLvl=getLevel(DATA.xp||0);
  DATA.xp=(DATA.xp||0)+actual;
  const newLvl=getLevel(DATA.xp);
  if(newLvl.min>oldLvl.min){fireConfetti();} // Level up!
  if(!DATA.xpLog)DATA.xpLog=[];DATA.xpLog.push({date:today(),amount:actual,reason});
  if(DATA.xpLog.length>50)DATA.xpLog=DATA.xpLog.slice(-50);
}
function renderXPPill(){const xp=DATA.xp||0;const lvl=getLevel(xp);const next=getNextLevel(xp);const fill=document.getElementById('xpFillMini');const pill=document.getElementById('xpPill');if(pill)pill.querySelector('.xp-level').textContent='Lv'+(XP_LEVELS.indexOf(lvl)+1);if(fill&&next){fill.style.width=Math.min(100,((xp-lvl.min)/(next.min-lvl.min))*100)+'%';}else if(fill){fill.style.width='100%';}}
function renderXP(){
  const xp=DATA.xp||0;const lvl=getLevel(xp);const next=getNextLevel(xp);
  const big=document.getElementById('xpLevelBig');if(big)big.textContent=`${lvl.icon} ${lvl.name}`;
  const fill=document.getElementById('xpProgressFill');if(fill&&next)fill.style.width=Math.min(100,((xp-lvl.min)/(next.min-lvl.min))*100)+'%';else if(fill)fill.style.width='100%';
  const stats=document.getElementById('xpStats');if(stats)stats.textContent=next?`${xp} XP · ${next.min-xp} to ${next.name}`:`${xp} XP · MAX LEVEL!`;
  const mult=document.getElementById('streakMultiplier');if(mult&&DATA.streakDays>=7)mult.textContent=`🔥 ${DATA.streakDays}-day streak = ${getStreakMultiplier()}x XP multiplier!`;
  const hist=document.getElementById('xpHistory');if(hist)hist.innerHTML=(DATA.xpLog||[]).slice(-15).reverse().map(l=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px;"><span>${l.date} — ${l.reason}</span><span class="c-purple">+${l.amount}</span></div>`).join('')||'<p class="small">No XP yet.</p>';
  renderBadges();renderDailyQuests();renderWeeklyChallenges();
}

// ===== BADGES WITH RARITY =====
function renderBadges(){
  const el=document.getElementById('badgesGrid');if(!el)return;
  const badges=[
    {name:'First Step',icon:'👣',rarity:'common',check:()=>DATA.shifts.length>=1},
    {name:'Tracker',icon:'📝',rarity:'common',check:()=>DATA.expenses.length>=5},
    {name:'Saver',icon:'💰',rarity:'common',check:()=>DATA.emergencyFund>=100},
    {name:'Worker',icon:'☕',rarity:'rare',check:()=>DATA.shifts.length>=10},
    {name:'Investor',icon:'📈',rarity:'rare',check:()=>DATA.investmentBal>0},
    {name:'Budget Pro',icon:'📊',rarity:'rare',check:()=>DATA.expenses.length>=50},
    {name:'Goal Crusher',icon:'🎯',rarity:'epic',check:()=>DATA.goals.some(g=>g.saved>=g.target)},
    {name:'$1K Club',icon:'💎',rarity:'epic',check:()=>DATA.assets.reduce((s,a)=>s+a.value,0)>=1000},
    {name:'Streak King',icon:'🔥',rarity:'epic',check:()=>DATA.streakDays>=14},
    {name:'Legend',icon:'👑',rarity:'legendary',check:()=>(DATA.xp||0)>=5000},
    {name:'Millionaire Mind',icon:'🧠',rarity:'legendary',check:()=>DATA.assets.reduce((s,a)=>s+a.value,0)>=10000},
  ];
  el.innerHTML=badges.map(b=>{const unlocked=b.check();return`<div class="badge-item ${unlocked?b.rarity:'locked'}"><div class="badge-icon">${unlocked?b.icon:'🔒'}</div><div class="badge-name">${b.name}</div></div>`;}).join('');
}

// ===== DAILY QUESTS =====
function getDailyQuests(){
  const t=today();
  return[
    {id:'log-tx',title:'Log a transaction',check:()=>DATA.expenses.some(e=>e.date===t),xp:10},
    {id:'check-goals',title:'Review your goals',check:()=>(DATA.dailyQuestsCompleted[t]||[]).includes('check-goals'),xp:5},
    {id:'log-shift',title:'Log a shift or hustle',check:()=>DATA.shifts.some(s=>s.date===t)||(DATA.sideHustles||[]).some(h=>h.date===t),xp:15},
  ];
}
function completeDailyQuest(id){
  const t=today();if(!DATA.dailyQuestsCompleted)DATA.dailyQuestsCompleted={};
  if(!DATA.dailyQuestsCompleted[t])DATA.dailyQuestsCompleted[t]=[];
  if(!DATA.dailyQuestsCompleted[t].includes(id)){DATA.dailyQuestsCompleted[t].push(id);addXP(5,'Daily quest');save();}
  renderDailyQuests();
}
function renderDailyQuests(){
  const quests=getDailyQuests();
  const el=document.getElementById('dailyQuests');const full=document.getElementById('dailyQuestsFull');
  const html=quests.map(q=>{const done=q.check();return`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;"><span>${done?'✅':'⬜'}</span><span style="flex:1;">${q.title}</span><span class="tag ${done?'tag-green':'tag-purple'}">${done?'Done':'+'+q.xp}</span>${!done&&q.id==='check-goals'?`<button class="btn btn-sm btn-g" onclick="completeDailyQuest('${q.id}')">✓</button>`:''}</div>`;}).join('');
  if(el)el.innerHTML=html;if(full)full.innerHTML=html;
}

// ===== WEEKLY CHALLENGES =====
const CHALLENGES=[
  {title:'No-Spend Streak',desc:'3 days without spending',reward:50,check:()=>DATA.nospendDays.length>=3},
  {title:'Shift Machine',desc:'Log 3+ shifts this week',reward:40,check:()=>{const w=new Date();w.setDate(w.getDate()-7);return DATA.shifts.filter(s=>new Date(s.date)>=w).length>=3;}},
  {title:'Budget Detective',desc:'Track 10 transactions',reward:30,check:()=>DATA.expenses.filter(e=>mKey(e.date)===mKey(today())).length>=10},
  {title:'Goal Crusher',desc:'Add $50 to any goal',reward:45,check:()=>DATA.goals.some(g=>g.saved>=50)},
  {title:'Side Income',desc:'Earn from a side hustle',reward:35,check:()=>(DATA.sideHustles||[]).length>0},
  {title:'Zero Waste',desc:'No regret purchases (7 days)',reward:60,check:()=>{const w=new Date();w.setDate(w.getDate()-7);return!DATA.wastedMoney.some(x=>new Date(x.date)>=w);}},
];
function renderWeeklyChallenges(){
  const home=document.getElementById('weeklyChallenge');const full=document.getElementById('weeklyChallengesFull');
  const challenge=CHALLENGES[weekNum()%CHALLENGES.length];const done=challenge.check();
  const html=`<div style="display:flex;align-items:center;gap:12px;"><span style="font-size:28px;">${done?'✅':'🎯'}</span><div style="flex:1;"><div style="font-weight:700;font-size:13px;">${challenge.title}</div><div class="small">${challenge.desc}</div></div><span class="tag ${done?'tag-green':'tag-accent'}">${done?'DONE':'+'+challenge.reward+' XP'}</span></div>`;
  if(home)home.innerHTML=html;
  if(full)full.innerHTML=CHALLENGES.map(c=>{const d=c.check();return`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;"><span>${d?'✅':'⬜'}</span><span style="flex:1;">${c.title} — ${c.desc}</span><span class="tag ${d?'tag-green':'tag-purple'}">${d?'Done':'+'+c.reward}</span></div>`;}).join('');
}

// ===== FINANCIAL IQ QUIZ =====
const QUIZ_QUESTIONS=[
  {q:'What does "compound interest" mean?',options:['Interest on principal only','Interest on principal + accumulated interest','A type of bank fee','Government tax'],correct:1},
  {q:'What is the S&P 500?',options:['A car model','A savings account','An index of 500 large US companies','A credit score range'],correct:2},
  {q:'What credit utilization is ideal?',options:['Under 10%','Under 50%','Over 80%','Exactly 100%'],correct:0},
  {q:'What is dollar-cost averaging?',options:['Buying everything at once','Investing fixed amounts at regular intervals','Only buying when stocks drop','Timing the market'],correct:1},
  {q:'What does FICA stand for?',options:['Federal Insurance Contributions Act','Financial Investment Credit Account','Federal Income Calculation Act','First Investment Capital Account'],correct:0},
  {q:'What is a Roth IRA?',options:['A checking account','A retirement account with tax-free growth','A type of loan','A credit card'],correct:1},
  {q:'What is an emergency fund?',options:['Money for vacation','3-6 months expenses saved for unexpected costs','A retirement account','A type of investment'],correct:1},
  {q:'At 10% annual return, how long to double your money?',options:['~3 years','~5 years','~7 years','~15 years'],correct:2},
];
let currentQuiz=null;
function newQuiz(){
  const idx=Math.floor(Math.random()*QUIZ_QUESTIONS.length);currentQuiz=QUIZ_QUESTIONS[idx];
  const el=document.getElementById('quizContent');if(!el)return;
  el.innerHTML=`<p style="font-size:14px;font-weight:600;margin-bottom:12px;">${currentQuiz.q}</p>${currentQuiz.options.map((o,i)=>`<div class="quiz-option" onclick="answerQuiz(${i})" id="qo-${i}">${o}</div>`).join('')}`;
}
function answerQuiz(idx){
  if(!currentQuiz)return;if(!DATA.quizStats)DATA.quizStats={correct:0,total:0};
  DATA.quizStats.total++;
  document.querySelectorAll('.quiz-option').forEach((el,i)=>{el.onclick=null;if(i===currentQuiz.correct)el.classList.add('correct');else if(i===idx)el.classList.add('wrong');});
  if(idx===currentQuiz.correct){DATA.quizStats.correct++;addXP(20,'Quiz correct!');}
  save();renderQuizStats();
}
function renderQuizStats(){
  const el=document.getElementById('quizStats');if(!el)return;const s=DATA.quizStats||{correct:0,total:0};
  const pct=s.total>0?(s.correct/s.total*100).toFixed(0):0;
  el.innerHTML=`<div class="mstat"><div class="mstat-val c-green">${s.correct}</div><div class="mstat-lbl">Correct</div></div><div class="mstat"><div class="mstat-val c-accent">${s.total}</div><div class="mstat-lbl">Total</div></div><div class="mstat"><div class="mstat-val c-purple">${pct}%</div><div class="mstat-lbl">Accuracy</div></div>`;
}

// ===== SHAREABLE PROGRESS CARD =====
function generateShareCard(){
  const el=document.getElementById('shareableCard');if(!el)return;
  const mo=mKey(today());const inc=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const saved=inc-DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);const health=calcHealthScore().score;
  el.innerHTML=`<div class="share-card"><h3>FinanceOS V7 — ${new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h3><div class="share-stats"><div><div style="font-size:18px;font-weight:800;color:var(--green);">${fmt(inc)}</div><div style="font-size:9px;opacity:0.7;">EARNED</div></div><div><div style="font-size:18px;font-weight:800;color:var(--accent);">${fmt(Math.max(0,saved))}</div><div style="font-size:9px;opacity:0.7;">SAVED</div></div><div><div style="font-size:18px;font-weight:800;color:var(--purple);">${fK(nw)}</div><div style="font-size:9px;opacity:0.7;">NET WORTH</div></div></div><div style="margin-top:12px;font-size:11px;opacity:0.6;">Health: ${health}/100 · Streak: ${DATA.streakDays} days · Level: ${getLevel(DATA.xp||0).name}</div></div>`;
}

// ===== ANONYMOUS BENCHMARKS =====
function renderBenchmarks(){
  const el=document.getElementById('benchmarkContent');if(!el)return;
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);const savingsRate=25;// simulated
  const invested=DATA.investmentBal>0;
  el.innerHTML=`<div style="font-size:12px;line-height:1.8;"><p>📊 You ${nw>500?'have more savings':'are building savings compared to'} ${nw>500?'80':'50'}% of 17-year-olds</p><p>📈 ${invested?'You invest — only 10% of teens do!':'Start investing to join the top 10% of teens'}</p><p>💰 Average teen saves $0-50/month. You aim for ${fmt(DATA.monthlyInvest)}/month!</p><p>🎓 Starting at 17 puts you <b>5 years ahead</b> of most people</p></div>`;
}


// ===== HEALTH SCORE =====
function calcHealthScore(){
  let score=0;const breakdown=[];
  const efPct=Math.min(100,(DATA.emergencyFund/1000)*100);const efScore=Math.round(efPct/5);score+=efScore;
  breakdown.push({name:'Emergency Fund',score:efScore,max:20,desc:`${efPct.toFixed(0)}% of $1K`});
  const investScore=DATA.investmentBal>0?Math.min(25,Math.round(DATA.investmentBal/200)):0;score+=investScore;
  breakdown.push({name:'Investing',score:investScore,max:25,desc:`$${DATA.investmentBal} invested`});
  const mo=mKey(today());const monthInc=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const monthExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const savRate=monthInc>0?Math.max(0,(monthInc-monthExp)/monthInc*100):50;
  const savScore=Math.min(20,Math.round(savRate/5));score+=savScore;
  breakdown.push({name:'Savings Rate',score:savScore,max:20,desc:`${savRate.toFixed(0)}%`});
  const nsScore=Math.min(15,DATA.nospendDays.filter(d=>mKey(d)===mo).length*2);score+=nsScore;
  breakdown.push({name:'No-Spend Days',score:nsScore,max:15});
  const goalPct=DATA.goals.length?DATA.goals.reduce((s,g)=>s+Math.min(100,(g.saved/g.target)*100),0)/DATA.goals.length:0;
  const goalScore=Math.min(20,Math.round(goalPct/5));score+=goalScore;
  breakdown.push({name:'Goals',score:goalScore,max:20,desc:`${goalPct.toFixed(0)}% avg`});
  return{score:Math.min(100,score),breakdown};
}
function renderHealth(){
  const{score,breakdown}=calcHealthScore();
  document.getElementById('health-score').textContent=score;document.getElementById('healthPill').textContent=score+'/100';
  const ring=document.getElementById('health-ring');if(ring){ring.style.strokeDashoffset=314-(314*score/100);ring.style.stroke=score>=70?'var(--green)':score>=40?'var(--yellow)':'var(--red)';}
  const bd=document.getElementById('health-breakdown');if(bd)bd.innerHTML=breakdown.map(b=>`<div style="margin-bottom:8px;"><div class="pbar-top"><span class="small bold">${b.name}</span><span class="small">${b.score}/${b.max}</span></div><div class="pbar" style="height:5px;"><div class="pbar-fill" style="width:${(b.score/b.max)*100}%;background:var(--accent)"></div></div></div>`).join('');
  // Achievements
  const achievements=[
    {name:'First Dollar Invested',desc:'Made first investment',unlocked:DATA.investmentBal>0},
    {name:'Emergency Starter',desc:'$100+ emergency fund',unlocked:DATA.emergencyFund>=100},
    {name:'Triple Digit Club',desc:'Net worth over $1,000',unlocked:DATA.assets.reduce((s,a)=>s+a.value,0)>=1000},
    {name:'Shift Machine',desc:'10+ shifts logged',unlocked:DATA.shifts.length>=10},
    {name:'Budget Boss',desc:'20+ transactions tracked',unlocked:DATA.expenses.length>=20},
    {name:'Streak Champion',desc:'7-day streak',unlocked:DATA.streakDays>=7},
    {name:'Level Up',desc:'Reached Saver (100 XP)',unlocked:(DATA.xp||0)>=100},
  ];
  const ach=document.getElementById('achievements-list');const ha=document.getElementById('h-achievements');
  const achHtml=achievements.map(a=>`<div class="achievement ${a.unlocked?'unlocked':''}"><div style="font-size:20px;">${a.unlocked?'🏆':'🔒'}</div><div style="flex:1;"><div style="font-size:12px;font-weight:600;">${a.name}</div><div style="font-size:10px;color:var(--text-muted);">${a.desc}</div></div></div>`).join('');
  if(ach)ach.innerHTML=achHtml;
  if(ha)ha.innerHTML=achievements.filter(a=>a.unlocked).slice(0,3).map(a=>`<div class="achievement unlocked"><div style="font-size:20px;">🏆</div><div style="flex:1;font-size:12px;font-weight:600;">${a.name}</div></div>`).join('')||'<p class="small center">Keep building!</p>';
}

// ===== CHARTS =====
let charts={};
function dc(id){if(charts[id]){charts[id].destroy();charts[id]=null;}}
const CL={green:'#22c55e',red:'#ef4444',blue:'#3b82f6',purple:'#a855f7',yellow:'#eab308',accent:'#6366f1',muted:'#5a6a7a',orange:'#f97316',cyan:'#06b6d4'};
const chartOpts=(o={})=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:DATA.theme==='light'?'#1a1f2e':'#eaf0f8',font:{size:10}}},...(o.plugins||{})},scales:{...(o.scales||{})}});
const axisStyle=()=>({ticks:{color:DATA.theme==='light'?'#8895a7':'#5a6a7a'},grid:{color:DATA.theme==='light'?'#e5e8ec':'#1e2a38'}});

function renderAllCharts(){renderHomeCharts();renderCompoundChart();renderInvGrowthChart();renderNWCharts();renderProjChart();renderCareerChart();renderSavingsRateChart();}

function renderHomeCharts(){
  const ctx1=document.getElementById('chart-home-spending');if(!ctx1)return;dc('homeSpend');
  const mo=mKey(today());const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense');
  const catT={};mExp.forEach(e=>{catT[e.category]=(catT[e.category]||0)+e.amount;});
  const cats=Object.keys(catT);const labelEl=document.getElementById('h-month-label');
  if(labelEl)labelEl.textContent=new Date().toLocaleDateString('en-US',{month:'short'});
  if(!cats.length){charts['homeSpend']=new Chart(ctx1,{type:'doughnut',data:{labels:['No data'],datasets:[{data:[1],backgroundColor:['#1e2a38'],borderWidth:0}]},options:chartOpts()});return;}
  charts['homeSpend']=new Chart(ctx1,{type:'doughnut',data:{labels:cats.map(c=>(CATS[c]||CATS.other).l),datasets:[{data:cats.map(c=>catT[c]),backgroundColor:cats.map(c=>(CATS[c]||CATS.other).c),borderWidth:0}]},options:{...chartOpts(),cutout:'60%'}});
  const ctx2=document.getElementById('chart-home-alloc');if(!ctx2)return;dc('homeAlloc');
  charts['homeAlloc']=new Chart(ctx2,{type:'doughnut',data:{labels:DATA.holdings.map(h=>h.ticker),datasets:[{data:DATA.holdings.map(h=>h.alloc),backgroundColor:[CL.accent,CL.blue,CL.yellow,CL.green],borderWidth:0}]},options:{...chartOpts(),cutout:'65%'}});
}

function renderCompoundChart(){
  const ctx=document.getElementById('chart-compound');if(!ctx)return;dc('compound');
  const mo=+document.getElementById('ci-monthly')?.value||300;const start=+document.getElementById('ci-start')?.value||17;
  const end=+document.getElementById('ci-end')?.value||60;const ret=+document.getElementById('ci-return')?.value||10;
  const yrs=end-start;const p=compound(0,mo,ret,yrs);
  const labels=[],vals=[],contribs=[];const step=Math.max(1,Math.floor(yrs/20));
  for(let y=0;y<=yrs;y+=step){labels.push('Age '+(start+y));vals.push(p.hist[y*12]||0);contribs.push(mo*12*y);}
  charts['compound']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Portfolio',data:vals,borderColor:CL.green,backgroundColor:CL.green+'15',fill:true,tension:0.3,pointRadius:2},{label:'Contributed',data:contribs,borderColor:CL.muted,borderDash:[4,4],fill:false,tension:0,pointRadius:2}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderInvGrowthChart(){
  const ctx=document.getElementById('chart-inv-growth');if(!ctx)return;dc('invGrowth');
  const p10=compound(DATA.investmentBal,DATA.monthlyInvest,DATA.expectedReturn,10);
  const labels=[],vals=[],contribs=[];for(let y=0;y<=10;y++){labels.push('Yr '+y);vals.push(p10.hist[y*12]);contribs.push(DATA.investmentBal+DATA.monthlyInvest*12*y);}
  charts['invGrowth']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Portfolio',data:vals,borderColor:CL.accent,backgroundColor:CL.accent+'15',fill:true,tension:0.4,pointRadius:3},{label:'Contributions',data:contribs,borderColor:CL.muted,borderDash:[5,5],fill:false,tension:0,pointRadius:2}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderNWCharts(){
  const ctx1=document.getElementById('chart-nw-pie');if(!ctx1)return;dc('nwPie');
  charts['nwPie']=new Chart(ctx1,{type:'doughnut',data:{labels:DATA.assets.map(a=>a.name),datasets:[{data:DATA.assets.map(a=>a.value),backgroundColor:[CL.green,CL.yellow,CL.accent,CL.blue,CL.purple,CL.red],borderWidth:0}]},options:{...chartOpts(),cutout:'60%'}});
  const ctx2=document.getElementById('chart-nw-history');if(!ctx2)return;dc('nwHist');
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);const labels=[],vals=[];for(let m=0;m<=12;m++){labels.push(m===0?'Now':`+${m}mo`);vals.push(nw+DATA.monthlyInvest*m*1.008);}
  charts['nwHist']=new Chart(ctx2,{type:'line',data:{labels,datasets:[{label:'Net Worth',data:vals,borderColor:CL.green,backgroundColor:CL.green+'12',fill:true,tension:0.4,pointRadius:3}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderProjChart(){
  const ctx=document.getElementById('chart-proj');if(!ctx)return;dc('proj');
  const monthlyNet=DATA.wage*DATA.schoolHours*4.33*(1-totalTaxRate());
  let nw=DATA.assets.reduce((s,a)=>s+a.value,0);const labels=[],vals=[];
  for(let age=17;age<=25;age++){labels.push('Age '+age);vals.push(nw);nw+=monthlyNet*12*0.3+DATA.monthlyInvest*12*(1+DATA.expectedReturn/100);}
  charts['proj']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Net Worth',data:vals,borderColor:CL.purple,backgroundColor:CL.purple+'12',fill:true,tension:0.4,pointRadius:4}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderCareerChart(){
  const ctx=document.getElementById('chart-career');if(!ctx)return;dc('career');
  const careers=[{name:'Electrical Engineer',s:[55000,65000,80000,100000,120000,150000]},{name:'Software Dev',s:[70000,90000,115000,140000,175000,190000]},{name:'HVAC Tech',s:[35000,45000,55000,65000,72000,82000]},{name:'Starbucks Mgr',s:[32000,38000,45000,52000,58000,65000]}];
  const labels=['Yr 1','Yr 5','Yr 10','Yr 15','Yr 20','Yr 30'];const colors=[CL.accent,CL.green,CL.orange,CL.purple];
  charts['career']=new Chart(ctx,{type:'line',data:{labels,datasets:careers.map((c,i)=>({label:c.name,data:c.s,borderColor:colors[i],fill:false,tension:0.3,pointRadius:4}))},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}


// ===== SETTINGS =====
function saveSettings(){
  DATA.userName=document.getElementById('set-name').value.trim();DATA.wage=+document.getElementById('set-wage').value||16.50;
  DATA.fedTax=+document.getElementById('set-fed').value||10;DATA.fica=+document.getElementById('set-fica').value||7.65;
  DATA.stateTax=+document.getElementById('set-state').value||0;DATA.expectedReturn=+document.getElementById('set-return').value||10;
  DATA.monthlyInvest=+document.getElementById('set-invest').value||300;DATA.schoolHours=+document.getElementById('set-school-hrs').value||17.5;
  DATA.summerHours=+document.getElementById('set-summer-hrs').value||30;save();renderAll();
}
function saveAutopilot(){DATA.autopilotRules={spend:+document.getElementById('set-needs').value||50,invest:+document.getElementById('set-wants').value||40,save:+document.getElementById('set-saveinvest').value||10};save();}
function savePin(){const pin=document.getElementById('set-pin').value;const enabled=document.getElementById('set-pin-enabled').value==='on';if(enabled&&pin.length!==4){alert('PIN must be 4 digits');return;}DATA.pinCode=pin;DATA.pinEnabled=enabled;save();alert(enabled?'PIN enabled!':'PIN disabled.');}
function exportData(){const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='financeos_v7_'+today()+'.json';document.body.appendChild(a);a.click();document.body.removeChild(a);}
function importData(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{DATA=JSON.parse(ev.target.result);save();renderAll();alert('Imported!');}catch(err){alert('Invalid file.');}};reader.readAsText(file);}
function resetData(){if(!confirm('Reset ALL data? Cannot be undone.'))return;DATA=D();save();renderAll();}

// ===== BIND EVENTS =====
function bind(){
  document.getElementById('btn-add-shift')?.addEventListener('click',addShift);
  document.getElementById('btn-clear-shifts')?.addEventListener('click',()=>{if(confirm('Clear all shifts?')){DATA.shifts=[];save();renderStarbucks();}});
  document.getElementById('sh-date').value=today();
  document.getElementById('btn-add-paycheck')?.addEventListener('click',addPaycheck);
  document.getElementById('pc-date')&&(document.getElementById('pc-date').value=today());
  document.getElementById('btn-add-exp')?.addEventListener('click',addExpense);
  document.getElementById('exp-date').value=today();
  document.getElementById('btn-add-bill')?.addEventListener('click',addBill);
  document.getElementById('btn-add-goal')?.addEventListener('click',addGoal);
  document.getElementById('btn-nospend')?.addEventListener('click',markNoSpend);
  document.getElementById('btn-add-tech')?.addEventListener('click',addTech);
  document.getElementById('btn-add-spec')?.addEventListener('click',addSpec);
  document.getElementById('btn-add-dca')?.addEventListener('click',addDCA);
  document.getElementById('dca-date')&&(document.getElementById('dca-date').value=today());
  document.getElementById('btn-whatif')?.addEventListener('click',runWhatIf);
  document.getElementById('btn-bvs')?.addEventListener('click',runBvS);
  document.getElementById('btn-save-settings')?.addEventListener('click',saveSettings);
  document.getElementById('btn-export')?.addEventListener('click',exportData);
  document.getElementById('btn-import-trigger')?.addEventListener('click',()=>document.getElementById('btn-import').click());
  document.getElementById('btn-import')?.addEventListener('change',importData);
  document.getElementById('btn-reset')?.addEventListener('click',resetData);
  document.getElementById('btn-save-nw')?.addEventListener('click',()=>{document.querySelectorAll('.nw-inp').forEach(inp=>{DATA.assets[+inp.dataset.idx].value=+inp.value||0;});DATA.checking=DATA.assets[0].value;DATA.emergencyFund=DATA.assets[1].value;DATA.investmentBal=DATA.assets[2].value;save();renderAll();});
  document.getElementById('themeToggle')?.addEventListener('click',toggleTheme);
  ['ci-monthly','ci-start','ci-end','ci-return'].forEach(id=>{document.getElementById(id)?.addEventListener('change',renderCompound);});
  ['edu-sav-input','edu-fafsa-input','edu-bright-input','edu-scholar-input'].forEach(id=>{document.getElementById(id)?.addEventListener('change',()=>{DATA.eduSavings=+document.getElementById('edu-sav-input').value||0;DATA.eduFafsa=+document.getElementById('edu-fafsa-input').value||0;DATA.eduBright=+document.getElementById('edu-bright-input').value||0;DATA.eduScholar=+document.getElementById('edu-scholar-input').value||0;save();renderEducation();});});
  document.getElementById('btn-add-waste')?.addEventListener('click',addWaste);
  document.getElementById('btn-add-future')?.addEventListener('click',addFutureMessage);
  document.getElementById('btn-add-hustle')?.addEventListener('click',addHustle);
  document.getElementById('sh-hustle-date')&&(document.getElementById('sh-hustle-date').value=today());
  document.getElementById('btn-calc-tax')?.addEventListener('click',calcTax);
  document.getElementById('btn-calc-credit')?.addEventListener('click',calcCredit);
  document.getElementById('btn-refresh-stocks')?.addEventListener('click',refreshStocks);
  document.getElementById('btn-add-stock')?.addEventListener('click',addStockTicker);
  document.getElementById('btn-calc-moveout')?.addEventListener('click',calcMoveOut);
  document.getElementById('btn-calc-car')?.addEventListener('click',calcCar);
  document.getElementById('btn-add-trip')?.addEventListener('click',addTrip);
  document.getElementById('btn-raise')?.addEventListener('click',calcRaise);
  document.getElementById('btn-calc-loan')?.addEventListener('click',calcLoan);
  document.getElementById('btn-calc-cpu')?.addEventListener('click',calcCPU);
  document.getElementById('cal-prev')?.addEventListener('click',calPrev);
  document.getElementById('cal-next')?.addEventListener('click',calNext);
  document.getElementById('btn-export-report')?.addEventListener('click',exportReport);
  document.getElementById('btn-save-autopilot')?.addEventListener('click',saveAutopilot);
  document.getElementById('btn-save-pin')?.addEventListener('click',savePin);
  document.getElementById('btn-save-envelopes')?.addEventListener('click',saveEnvelopes);
  document.getElementById('btn-new-quiz')?.addEventListener('click',newQuiz);
  document.getElementById('btn-gen-share')?.addEventListener('click',generateShareCard);
}

// ===== RENDER ALL =====
function renderAll(){
  renderHeader();renderQuote();renderMoneyLeft();renderAISummary();renderAIAlerts();renderBillReminders();
  renderStarbucks();renderBudget();renderBills();renderGoals();renderTech();
  renderInvestments();renderDCA();renderSpec();renderCompound();renderEducation();
  renderNetWorth();renderTimeline();renderProjections();renderHealth();
  renderWaste();renderCalendar();renderWeeklyPlanner();renderMonthlyReport();
  renderCareer();renderHustles();renderXP();renderStocks();renderTrips();
  renderCreditTips();renderEnvelopes();renderHeatmap();renderBenchmarks();
  renderPatterns();newQuiz();renderQuizStats();renderDailyQuests();
  if(typeof Chart!=='undefined')renderAllCharts();
}

// ===== INIT =====
function init(){
  load();initTheme();checkPin();checkOnboarding();initNav();initCmdPalette();initKeyboard();bind();renderAll();
  // Populate settings
  document.getElementById('set-name').value=DATA.userName||'';
  document.getElementById('set-wage').value=DATA.wage;document.getElementById('set-fed').value=DATA.fedTax;
  document.getElementById('set-fica').value=DATA.fica;document.getElementById('set-state').value=DATA.stateTax;
  document.getElementById('set-return').value=DATA.expectedReturn;document.getElementById('set-invest').value=DATA.monthlyInvest;
  document.getElementById('set-school-hrs').value=DATA.schoolHours;document.getElementById('set-summer-hrs').value=DATA.summerHours;
  if(DATA.autopilotRules){document.getElementById('set-needs').value=DATA.autopilotRules.spend;document.getElementById('set-wants').value=DATA.autopilotRules.invest;document.getElementById('set-saveinvest').value=DATA.autopilotRules.save;}
  if(DATA.pinEnabled)document.getElementById('set-pin-enabled').value='on';
  if(DATA.pinCode)document.getElementById('set-pin').value=DATA.pinCode;
  // Next payday
  const now=new Date();const nextFri=new Date(now);nextFri.setDate(now.getDate()+(12-now.getDay())%7+7);
  document.getElementById('h-nextpay').textContent=nextFri.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  // Init 3D after a short delay to let CDNs load
  setTimeout(()=>{init3DHero();init3DNetWorth();},1000);
  // Update streak on load
  updateStreak();
}

document.addEventListener('DOMContentLoaded',init);
