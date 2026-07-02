/* ============================================================
 * FinanceOS V6 — Personal Financial Operating System
 * Intelligence-powered. From age 17 onward.
 * ============================================================ */
const STORE='financeOS_v6';
const D=()=>JSON.parse(JSON.stringify(DEFAULTS));
const DEFAULTS={
  wage:16.50,fedTax:10,stateTax:0,fica:7.65,expectedReturn:10,monthlyInvest:300,
  schoolHours:17.5,summerHours:30,
  checking:0,emergencyFund:0,investmentBal:0,
  shifts:[],expenses:[],bills:[],goals:[
    {id:'g1',name:'Emergency Fund',target:1000,saved:0,icon:'🛡️'},
    {id:'g2',name:'Surface Laptop',target:300,saved:300,icon:'💻'},
    {id:'g3',name:'iPad Air',target:247,saved:0,icon:'📱'},
    {id:'g4',name:'Move Out Fund',target:10000,saved:0,icon:'🏠'},
    {id:'g5',name:'First Car',target:8000,saved:0,icon:'🚗'},
    {id:'g6',name:'FD RX-7',target:30000,saved:0,icon:'🏎️'},
    {id:'g7',name:'Retirement ($1M+)',target:1000000,saved:0,icon:'💰'},
  ],
  techItems:[
    {id:'t1',name:'Surface Laptop 4',cost:300,saved:300},
    {id:'t2',name:'iPad Air 5',cost:247,saved:0},
    {id:'t3',name:'Future PC Build',cost:1500,saved:0},
    {id:'t4',name:'FD RX-7',cost:30000,saved:0},
  ],
  holdings:[
    {ticker:'VOO',name:'S&P 500 ETF',alloc:50,type:'Index',yield:1.3},
    {ticker:'QQQM',name:'Nasdaq 100',alloc:30,type:'Growth',yield:0.5},
    {ticker:'TTWO',name:'Take-Two',alloc:10,type:'Stock',yield:0},
    {ticker:'Nuclear',name:'Nuclear ETF',alloc:10,type:'Thematic',yield:0.8},
  ],
  specPositions:[
    {id:'s1',ticker:'TTWO',thesis:'GTA VI release Q4 2025',entry:180,current:210,shares:2},
    {id:'s2',ticker:'CCJ',thesis:'Uranium demand + AI power',entry:45,current:52,shares:5},
    {id:'s3',ticker:'SMR',thesis:'Nuclear AI data center boom',entry:12,current:18,shares:10},
  ],
  assets:[
    {name:'Checking',value:0},{name:'Emergency Fund',value:0},{name:'Investments',value:0},
    {name:'Surface Laptop',value:300},{name:'iPad',value:247},{name:'Other',value:0},
  ],
  nospendDays:[],decisions:[],healthHistory:[],
  timeline:[
    {date:'2026-06-29',title:'Starbucks Start',desc:'First official day at Starbucks',status:'done'},
    {date:'2026-08-11',title:'First Day of School',desc:'Senior year begins - August 11, 2026',status:'future'},
    {date:'2026-10-01',title:'FAFSA Opens',desc:'File FAFSA ASAP — opens October 1, 2026',status:'future'},
    {date:'2026-11-26',title:'Senior Pictures Deadline',desc:'All senior portraits must be completed by Nov 26, 2026',status:'future'},
    {date:'2027-05-20',title:'Graduation',desc:'Walk the stage! May 2027',status:'future'},
  ],
  eduSavings:0,eduFafsa:0,eduBright:0,eduScholar:0,
  // V6 NEW DATA
  wastedMoney:[],
  futureMessages:[],
  sideHustles:[],
  xp:0,
  xpLog:[],
  trips:[],
  watchlist:['VOO','QQQM','TTWO','AAPL','TSLA'],
  stockPrices:{},
  autopilotRules:{needs:50,wants:30,save:20},
  pinCode:'',pinEnabled:false,
  theme:'dark',
  calMonth:new Date().getMonth(),calYear:new Date().getFullYear(),
  weeklyChallengeSeed:0,
  creditLimit:500,creditBalance:0,
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

// ===== NAVIGATION =====
function initNav(){
  document.querySelectorAll('.nav-item[data-s]').forEach(el=>{
    el.addEventListener('click',()=>goTo(el.dataset.s));
  });
}
function goTo(s){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.s===s));
  document.querySelectorAll('.section').forEach(sec=>sec.classList.toggle('active',sec.id==='sec-'+s));
}

// ===== THEME =====
function initTheme(){
  if(DATA.theme==='light')document.documentElement.setAttribute('data-theme','light');
  updateThemeBtn();
}
function toggleTheme(){
  DATA.theme=DATA.theme==='dark'?'light':'dark';
  if(DATA.theme==='light')document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
  updateThemeBtn();save();
}
function updateThemeBtn(){
  const btn=document.getElementById('themeToggle');
  if(btn)btn.textContent=DATA.theme==='dark'?'🌙':'☀️';
}

// ===== PIN LOCK =====
function checkPin(){
  if(!DATA.pinEnabled||!DATA.pinCode)return;
  document.getElementById('pinOverlay').style.display='flex';
  document.getElementById('appShell').style.display='none';
  buildPinPad();
}
let pinEntry='';
function buildPinPad(){
  const pad=document.getElementById('pinPad');
  pad.innerHTML='';
  for(let i=1;i<=9;i++){const b=document.createElement('button');b.textContent=i;b.onclick=()=>pinPress(i);pad.appendChild(b);}
  const bC=document.createElement('button');bC.textContent='C';bC.onclick=()=>{pinEntry='';updatePinDots();document.getElementById('pinError').textContent='';};pad.appendChild(bC);
  const b0=document.createElement('button');b0.textContent='0';b0.onclick=()=>pinPress(0);pad.appendChild(b0);
  const bD=document.createElement('button');bD.textContent='⌫';bD.onclick=()=>{pinEntry=pinEntry.slice(0,-1);updatePinDots();};pad.appendChild(bD);
}
function pinPress(n){
  if(pinEntry.length>=4)return;
  pinEntry+=n;
  updatePinDots();
  if(pinEntry.length===4){
    if(pinEntry===DATA.pinCode){
      document.getElementById('pinOverlay').style.display='none';
      document.getElementById('appShell').style.display='grid';
      pinEntry='';
    } else {
      document.getElementById('pinError').textContent='Wrong PIN. Try again.';
      pinEntry='';
      setTimeout(updatePinDots,300);
    }
  }
}
function updatePinDots(){
  const dots=document.querySelectorAll('#pinDots span');
  dots.forEach((d,i)=>d.classList.toggle('filled',i<pinEntry.length));
}

// ===== HEADER =====
function renderHeader(){
  const h=new Date().getHours();
  document.getElementById('greeting').textContent=h<12?'Good morning ☀️':h<17?'Good afternoon':' Good evening 🌙';
  document.getElementById('dateDisplay').textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);
  document.getElementById('nwPill').textContent=fK(nw);
  document.getElementById('healthPill').textContent=calcHealthScore().score+'/100';
  renderXPPill();
}

// ===== QUOTES =====
const QUOTES=[
  {t:"The best time to plant a tree was 20 years ago. The second best time is now.",a:"Chinese Proverb"},
  {t:"Do not save what is left after spending, but spend what is left after saving.",a:"Warren Buffett"},
  {t:"Compound interest is the eighth wonder of the world.",a:"Albert Einstein"},
  {t:"A budget is telling your money where to go instead of wondering where it went.",a:"Dave Ramsey"},
  {t:"It's not about how much money you make, but how much you keep.",a:"Robert Kiyosaki"},
  {t:"The stock market is a device for transferring money from the impatient to the patient.",a:"Warren Buffett"},
  {t:"Every dollar you spend is a vote for the life you want.",a:"Unknown"},
  {t:"You don't have to be great to start, but you have to start to be great.",a:"Zig Ziglar"},
  {t:"Financial freedom is available to those who learn about it and work for it.",a:"Robert Kiyosaki"},
  {t:"Rich people stay rich by living like they're broke. Broke people stay broke by living like they're rich.",a:"Unknown"},
];
function renderQuote(){
  const q=QUOTES[Math.floor(Math.random()*QUOTES.length)];
  const el=document.getElementById('dailyQuote');
  if(el)el.innerHTML=`<div class="quote-text">"${q.t}"</div><div class="quote-author">— ${q.a}</div>`;
}

// ===== AI SPENDING ALERTS =====
function renderAIAlerts(){
  const el=document.getElementById('aiAlerts');if(!el)return;
  const mo=mKey(today());
  const thisMonthExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense');
  const alerts=[];
  // Category analysis
  const catTotals={};
  thisMonthExp.forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount;});
  // Compare to last month
  const lastMo=new Date();lastMo.setMonth(lastMo.getMonth()-1);
  const lastKey=mKey(lastMo.toISOString().split('T')[0]);
  const lastMonthExp=DATA.expenses.filter(e=>mKey(e.date)===lastKey&&e.type==='expense');
  const lastCatTotals={};
  lastMonthExp.forEach(e=>{lastCatTotals[e.category]=(lastCatTotals[e.category]||0)+e.amount;});
  
  Object.entries(catTotals).forEach(([cat,amt])=>{
    const lastAmt=lastCatTotals[cat]||0;
    const CATS_MAP={food:'Food',gas:'Gas',clothes:'Clothes',games:'Games',subscriptions:'Subs',school:'School',phone:'Phone',personal:'Personal',gifts:'Gifts',tech:'Tech',travel:'Travel',other:'Other'};
    if(lastAmt>0&&amt>lastAmt*1.5){
      const mult=(amt/lastAmt).toFixed(1);
      alerts.push(`You spent ${fmt(amt)} on <b>${CATS_MAP[cat]||cat}</b> this month — ${mult}x your last month's ${fmt(lastAmt)}`);
    }
  });
  
  // Weekly food check
  const weekStart=new Date();weekStart.setDate(weekStart.getDate()-7);
  const weekFood=DATA.expenses.filter(e=>e.category==='food'&&e.type==='expense'&&new Date(e.date)>=weekStart).reduce((s,e)=>s+e.amount,0);
  if(weekFood>60)alerts.push(`You spent <b>${fmt(weekFood)}</b> on food this week. Consider meal prepping!`);
  
  if(alerts.length){
    el.innerHTML=alerts.map(a=>`<div class="alert-card"><div class="alert-icon">🧠</div><div class="alert-text">${a}</div></div>`).join('');
  } else {
    el.innerHTML='';
  }
  
  // Spending alert in budget section
  const alertCard=document.getElementById('spendingAlertCard');
  const alertContent=document.getElementById('spendingAlertContent');
  if(alertCard&&alerts.length>0){
    alertCard.style.display='block';
    alertContent.innerHTML=alerts.map(a=>`<p style="margin-bottom:6px;font-size:12px;">${a}</p>`).join('');
  } else if(alertCard){alertCard.style.display='none';}
}

// ===== BILL REMINDERS =====
function renderBillReminders(){
  const el=document.getElementById('billReminders');if(!el)return;
  const nowDay=new Date().getDate();
  const upcoming=DATA.bills.filter(b=>{
    const diff=b.dueDay-nowDay;
    return diff>=0&&diff<=7;
  }).sort((a,b)=>a.dueDay-b.dueDay);
  if(upcoming.length){
    el.innerHTML=upcoming.map(b=>{
      const daysLeft=b.dueDay-nowDay;
      const label=daysLeft===0?'DUE TODAY':daysLeft===1?'due tomorrow':`due in ${daysLeft} days`;
      return`<div class="bill-reminder-item">⚠️ <b>${b.name}</b> (${fmt(b.amount)}) — ${label}</div>`;
    }).join('');
  } else {el.innerHTML='';}
}

// ===== STARBUCKS PAY CENTER =====
function shiftHours(start,end,brk){
  const[sh,sm]=start.split(':').map(Number);
  const[eh,em]=end.split(':').map(Number);
  let m=(eh*60+em)-(sh*60+sm);if(m<0)m+=1440;
  return Math.max(0,(m-brk)/60);
}
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
  // Award XP
  addXP(15,'Logged a shift');
  save();renderStarbucks();
  // Show autopilot
  showAutopilot(gross,tips);
}

function showAutopilot(gross,tips){
  const net=(gross+tips)*(1-totalTaxRate());
  const card=document.getElementById('autopilotCard');
  const content=document.getElementById('autopilotSuggestion');
  if(!card||!content)return;
  const rules=DATA.autopilotRules||{needs:50,wants:30,save:20};
  const needs=net*rules.needs/100;
  const wants=net*rules.wants/100;
  const saveAmt=net*rules.save/100;
  card.style.display='block';
  content.innerHTML=`<div class="g g3"><div class="mstat"><div class="mstat-val c-blue">${fmt(needs)}</div><div class="mstat-lbl">Needs (${rules.needs}%)</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(wants)}</div><div class="mstat-lbl">Wants (${rules.wants}%)</div></div><div class="mstat"><div class="mstat-val c-green">${fmt(saveAmt)}</div><div class="mstat-lbl">Save/Invest (${rules.save}%)</div></div></div><p class="small" style="margin-top:10px;">Based on est. net pay of ${fmt(net)} from this shift. Adjust rules in Settings.</p>`;
}

function renderStarbucks(){
  const cut=new Date();cut.setDate(cut.getDate()-14);
  const period=DATA.shifts.filter(s=>new Date(s.date)>=cut);
  const totHrs=period.reduce((s,sh)=>s+sh.hours,0);
  const otHrs=period.filter(s=>s.type==='overtime').reduce((s,sh)=>s+sh.hours,0);
  const estGross=period.reduce((s,sh)=>s+sh.gross+sh.tips,0);
  const estNet=estGross*(1-totalTaxRate());
  document.getElementById('sb-period-hrs').textContent=totHrs.toFixed(1)+' hrs';
  document.getElementById('sb-ot-hrs').textContent=otHrs.toFixed(1)+' hrs';
  document.getElementById('sb-est-net').textContent=fmt(estNet);
  document.getElementById('sb-wage').textContent='$'+DATA.wage.toFixed(2)+'/hr';

  const planTbody=document.querySelector('#sb-planner-table tbody');
  if(planTbody){
    planTbody.innerHTML=[15,17.5,20,25,30].map(h=>{
      const mG=DATA.wage*h*4.33;const mN=mG*(1-totalTaxRate());const yN=mN*11;
      return`<tr><td>${h}</td><td>${fmt(mN)}</td><td>${fmt(yN)}</td><td>${fmt(Math.min(DATA.monthlyInvest,mN))}</td></tr>`;
    }).join('');
  }

  const yearTbody=document.querySelector('#sb-year-table tbody');
  if(yearTbody){
    const months=[
      {m:'Jul 2026',hrs:DATA.summerHours,wks:4.33},{m:'Aug 2026',hrs:DATA.summerHours,wks:4.33},
      {m:'Sep 2026',hrs:DATA.schoolHours,wks:4.33},{m:'Oct 2026',hrs:DATA.schoolHours,wks:4.33},
      {m:'Nov 2026',hrs:DATA.schoolHours,wks:4},{m:'Dec 2026',hrs:DATA.schoolHours,wks:3.5},
      {m:'Jan 2027',hrs:DATA.schoolHours,wks:4.33},{m:'Feb 2027',hrs:DATA.schoolHours,wks:4},
      {m:'Mar 2027',hrs:DATA.schoolHours,wks:4.33},{m:'Apr 2027',hrs:DATA.schoolHours,wks:4.33},
      {m:'May 2027',hrs:DATA.schoolHours,wks:4.33},
    ];
    let cum=0;
    yearTbody.innerHTML=months.map(r=>{
      const g=DATA.wage*r.hrs*r.wks;const f=g*(DATA.fedTax/100);const fi=g*(DATA.fica/100);
      const n=g-f-fi-(g*DATA.stateTax/100);cum+=n;
      return`<tr><td>${r.m}</td><td>${r.hrs}</td><td>${fmt(g)}</td><td class="c-red">-${fmt(f)}</td><td class="c-red">-${fmt(fi)}</td><td class="c-green">${fmt(n)}</td><td class="c-accent bold">${fmt(cum)}</td></tr>`;
    }).join('');
  }

  const sTbody=document.querySelector('#sb-shift-table tbody');
  if(sTbody){
    if(!DATA.shifts.length){sTbody.innerHTML='<tr><td colspan="8" class="center small">No shifts logged yet.</td></tr>';return;}
    sTbody.innerHTML=DATA.shifts.slice(0,60).map(s=>{
      const tag=s.type==='overtime'?'<span class="tag tag-yellow">OT</span>':s.type==='holiday'?'<span class="tag tag-purple">HOL</span>':s.type==='training'?'<span class="tag tag-blue">TRN</span>':'<span class="tag tag-accent">REG</span>';
      return`<tr><td>${s.date}</td><td>${s.start}-${s.end}</td><td>${s.hours.toFixed(1)}</td><td>${tag}</td><td>${fmt(DATA.wage*payMult(s.type))}</td><td class="c-green">${fmt(s.gross)}</td><td>${s.tips?fmt(s.tips):'—'}</td><td><button class="btn btn-sm btn-g" onclick="delShift('${s.id}')">×</button></td></tr>`;
    }).join('');
  }
}
function delShift(id){DATA.shifts=DATA.shifts.filter(s=>s.id!==id);save();renderStarbucks();}

// ===== BUDGET / EXPENSES =====
const CATS={food:{i:'🍔',l:'Food',c:'#ef4444'},gas:{i:'⛽',l:'Gas',c:'#f59e0b'},clothes:{i:'👕',l:'Clothes',c:'#a855f7'},games:{i:'🎮',l:'Games',c:'#6366f1'},subscriptions:{i:'📱',l:'Subs',c:'#3b82f6'},school:{i:'📚',l:'School',c:'#0ea5e9'},phone:{i:'📞',l:'Phone',c:'#14b8a6'},personal:{i:'✨',l:'Personal',c:'#ec4899'},gifts:{i:'🎁',l:'Gifts',c:'#f97316'},tech:{i:'💻',l:'Tech',c:'#8b5cf6'},savings:{i:'💰',l:'Savings',c:'#22c55e'},investing:{i:'📈',l:'Investing',c:'#10b981'},travel:{i:'✈️',l:'Travel',c:'#06b6d4'},other:{i:'📦',l:'Other',c:'#6b7280'}};

function addExpense(){
  const date=document.getElementById('exp-date').value||today();
  const type=document.getElementById('exp-type').value;
  const cat=document.getElementById('exp-cat').value;
  const amt=+document.getElementById('exp-amt').value||0;
  const note=document.getElementById('exp-note').value.trim();
  if(amt<=0)return;
  DATA.expenses.push({id:uid(),date,type,category:cat,amount:amt,note});
  DATA.expenses.sort((a,b)=>b.date.localeCompare(a.date));
  document.getElementById('exp-amt').value='';document.getElementById('exp-note').value='';
  if(type==='expense')addXP(5,'Tracked an expense');
  save();renderBudget();renderAIAlerts();
}
function delExp(id){DATA.expenses=DATA.expenses.filter(e=>e.id!==id);save();renderBudget();}

function renderBudget(){
  const mo=mKey(today());
  const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo);
  const inc=mExp.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
  const exp=mExp.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const dayNum=new Date().getDate();
  document.getElementById('bud-income').textContent=fmt(inc);
  document.getElementById('bud-expense').textContent=fmt(exp);
  document.getElementById('bud-net').textContent=fmt(inc-exp);
  document.getElementById('bud-avg').textContent=fmt(exp/Math.max(1,dayNum))+'/day';

  const tbody=document.querySelector('#exp-table tbody');
  if(tbody){
    const filter=document.getElementById('bud-filter')?.value||'all';
    const list=filter==='all'?DATA.expenses:DATA.expenses.filter(e=>mKey(e.date)===filter);
    tbody.innerHTML=list.length?list.slice(0,150).map(e=>{
      const c=CATS[e.category]||CATS.other;const isInc=e.type==='income';
      return`<tr><td>${e.date}</td><td>${c.i} ${c.l}</td><td class="small">${e.note||'—'}</td><td style="color:${isInc?'var(--green)':'var(--red)'}">${isInc?'+':'-'}${fmt(e.amount)}</td><td><button class="btn btn-sm btn-g" onclick="delExp('${e.id}')">×</button></td></tr>`;
    }).join(''):'<tr><td colspan="5" class="center small">No transactions yet.</td></tr>';
  }

  const insights=document.getElementById('spend-insights');
  if(insights&&mExp.length>0){
    const catTotals={};mExp.filter(e=>e.type==='expense').forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount;});
    const topCat=Object.entries(catTotals).sort((a,b)=>b[1]-a[1])[0];
    const avgPerDay=exp/Math.max(1,dayNum);
    const projMonth=avgPerDay*30;
    let html=`<div class="small">`;
    if(topCat)html+=`📊 Top category: <b>${(CATS[topCat[0]]||CATS.other).l}</b> (${fmt(topCat[1])})<br>`;
    html+=`📈 Projected monthly spend: <b>${fmt(projMonth)}</b><br>`;
    html+=`💡 Daily average: <b>${fmt(avgPerDay)}</b>`;
    html+=`</div>`;
    insights.innerHTML=html;
  }
}

// ===== MONEY WASTED TRACKER =====
function addWaste(){
  const item=document.getElementById('waste-item').value.trim();
  const amt=+document.getElementById('waste-amt').value||0;
  const regret=+document.getElementById('waste-regret').value||5;
  if(!item||amt<=0)return;
  DATA.wastedMoney.push({id:uid(),date:today(),item,amount:amt,regret});
  document.getElementById('waste-item').value='';document.getElementById('waste-amt').value='';
  save();renderWaste();
}
function renderWaste(){
  const el=document.getElementById('wasteList');
  const stats=document.getElementById('wasteStats');
  if(!el)return;
  const total=DATA.wastedMoney.reduce((s,w)=>s+w.amount,0);
  const avgRegret=DATA.wastedMoney.length?DATA.wastedMoney.reduce((s,w)=>s+w.regret,0)/DATA.wastedMoney.length:0;
  if(stats)stats.innerHTML=`<div class="mstat"><div class="mstat-val c-red">${fmt(total)}</div><div class="mstat-lbl">Total Wasted</div></div><div class="mstat"><div class="mstat-val c-orange">${avgRegret.toFixed(1)}/10</div><div class="mstat-lbl">Avg Regret</div></div>`;
  el.innerHTML=DATA.wastedMoney.slice(-10).reverse().map(w=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;"><span>${w.date} — ${w.item}</span><span class="c-red">${fmt(w.amount)} (regret: ${w.regret}/10)</span></div>`).join('')||'<p class="small center">No regret purchases logged yet.</p>';
}

// ===== BILLS =====
function addBill(){
  const name=document.getElementById('bill-name').value.trim();
  const amt=+document.getElementById('bill-amt').value||0;
  const day=+document.getElementById('bill-day').value||1;
  const cat=document.getElementById('bill-cat').value;
  if(!name||amt<=0)return;
  DATA.bills.push({id:uid(),name,amount:amt,dueDay:day,icon:cat});
  document.getElementById('bill-name').value='';document.getElementById('bill-amt').value='';
  save();renderBills();
}
function delBill(id){DATA.bills=DATA.bills.filter(b=>b.id!==id);save();renderBills();}

function renderBills(){
  const total=DATA.bills.reduce((s,b)=>s+b.amount,0);
  const nowDay=new Date().getDate();
  const dueSoon=DATA.bills.filter(b=>b.dueDay>=nowDay&&b.dueDay<=nowDay+7).length;
  document.getElementById('bills-total').textContent=fmt(total);
  document.getElementById('bills-due-soon').textContent=dueSoon;

  const upcoming=document.getElementById('bills-upcoming');
  if(upcoming){
    const sorted=[...DATA.bills].sort((a,b)=>a.dueDay-b.dueDay);
    upcoming.innerHTML=sorted.slice(0,5).map(b=>`<div class="bill-item"><div class="bill-icon">${b.icon}</div><div class="bill-info"><div class="bill-name">${b.name}</div><div class="bill-due">Due: ${b.dueDay}th</div></div><div class="bill-amt">${fmt(b.amount)}</div></div>`).join('')||'<div class="small center">No bills added.</div>';
  }

  const list=document.getElementById('bills-list');
  if(list){
    list.innerHTML=DATA.bills.map(b=>`<div class="bill-item"><div class="bill-icon">${b.icon}</div><div class="bill-info"><div class="bill-name">${b.name}</div><div class="bill-due">Due: ${b.dueDay}th · Monthly</div></div><div class="bill-amt">${fmt(b.amount)}</div><button class="btn btn-sm btn-g" onclick="delBill('${b.id}')">×</button></div>`).join('')||'<div class="small center">No recurring bills.</div>';
  }
}

// ===== GOALS =====
function addGoal(){
  const name=document.getElementById('goal-name').value.trim();
  const target=+document.getElementById('goal-target').value||0;
  const saved=+document.getElementById('goal-saved').value||0;
  const icon=document.getElementById('goal-icon').value;
  if(!name||target<=0)return;
  DATA.goals.push({id:uid(),name,target,saved,icon});
  document.getElementById('goal-name').value='';document.getElementById('goal-target').value='';document.getElementById('goal-saved').value='0';
  save();renderGoals();
}
function delGoal(id){if(!confirm('Delete this goal?'))return;DATA.goals=DATA.goals.filter(g=>g.id!==id);save();renderGoals();}
function updateGoalSaved(id,val){const g=DATA.goals.find(x=>x.id===id);if(g){g.saved=+val||0;save();renderGoals();}}
function editGoal(id){
  const g=DATA.goals.find(x=>x.id===id);if(!g)return;
  const row=document.getElementById('goal-edit-'+id);
  if(row){
    // Save edits
    const nameInput=row.querySelector('.ge-name');
    const targetInput=row.querySelector('.ge-target');
    const iconInput=row.querySelector('.ge-icon');
    if(nameInput)g.name=nameInput.value||g.name;
    if(targetInput)g.target=+targetInput.value||g.target;
    if(iconInput)g.icon=iconInput.value||g.icon;
    save();renderGoals();
  }
}
function toggleEditGoal(id){
  const el=document.getElementById('goal-edit-'+id);
  if(el)el.style.display=el.style.display==='none'?'flex':'none';
}

function renderGoals(){
  const list=document.getElementById('goals-list');
  if(list){
    list.innerHTML=DATA.goals.map(g=>{
      const pct=Math.min(100,(g.saved/g.target)*100);
      return`<div class="pbar-wrap" style="margin-bottom:14px;">
        <div class="pbar-top"><span class="pbar-name">${g.icon} ${g.name}</span><span class="pbar-amt">${fK(g.saved)} / ${fK(g.target)} (${pct.toFixed(0)}%)</span></div>
        <div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:${pct>=100?'var(--green)':'var(--accent)'};"></div></div>
        <div style="display:flex;gap:6px;align-items:center;margin-top:6px;">
          <input type="number" value="${g.saved}" min="0" max="${g.target}" step="10" onchange="updateGoalSaved('${g.id}',this.value)" style="width:90px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;"/>
          <span class="small">saved</span>
          <button class="btn btn-sm btn-g" onclick="toggleEditGoal('${g.id}')">✏️ Edit</button>
          <button class="btn btn-sm btn-danger" onclick="delGoal('${g.id}')">🗑️ Delete</button>
        </div>
        <div id="goal-edit-${g.id}" style="display:none;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap;">
          <input class="ge-name" type="text" value="${g.name}" placeholder="Name" style="flex:1;min-width:120px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:11px;"/>
          <input class="ge-target" type="number" value="${g.target}" min="0" placeholder="Target" style="width:90px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;"/>
          <input class="ge-icon" type="text" value="${g.icon}" style="width:50px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:11px;text-align:center;"/>
          <button class="btn btn-sm btn-p" onclick="editGoal('${g.id}')">Save</button>
        </div>
      </div>`;
    }).join('');
  }
  // Home quick goals
  const hg=document.getElementById('h-goals-list');
  if(hg){hg.innerHTML=DATA.goals.slice(0,5).map(g=>{
    const p=Math.min(100,(g.saved/g.target)*100);
    return`<div class="pbar-wrap"><div class="pbar-top"><span class="pbar-name">${g.icon} ${g.name}</span><span class="pbar-amt">${p.toFixed(0)}%</span></div><div class="pbar"><div class="pbar-fill" style="width:${p}%;background:var(--green);"></div></div></div>`;
  }).join('');}
  const totalPct=DATA.goals.length?DATA.goals.reduce((s,g)=>s+Math.min(100,(g.saved/g.target)*100),0)/DATA.goals.length:0;
  const hp=document.getElementById('h-goals-progress');if(hp)hp.textContent=totalPct.toFixed(0)+'%';

  // Streaks
  const streak=DATA.nospendDays.length;
  const el1=document.getElementById('streak-count');if(el1)el1.textContent=streak;
  const el2=document.getElementById('h-streak');if(el2)el2.textContent=streak+' days';
  const thisMonthNS=DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length;
  const el3=document.getElementById('nospend-count');if(el3)el3.textContent=thisMonthNS;
  const el4=document.getElementById('challenge-saved');if(el4)el4.textContent=fK(thisMonthNS*15);
  
  renderLeaderboard();
  renderFutureMessages();
}
function markNoSpend(){
  const t=today();
  if(!DATA.nospendDays.includes(t)){DATA.nospendDays.push(t);addXP(20,'No-spend day');save();renderGoals();}
}

// ===== FUTURE SELF MESSAGES =====
function addFutureMessage(){
  const msg=document.getElementById('future-msg').value.trim();
  const date=document.getElementById('future-date').value;
  if(!msg||!date)return;
  DATA.futureMessages.push({id:uid(),message:msg,unlockDate:date,createdDate:today()});
  document.getElementById('future-msg').value='';document.getElementById('future-date').value='';
  save();renderFutureMessages();
}
function renderFutureMessages(){
  const el=document.getElementById('futureMessages');if(!el)return;
  const now=today();
  el.innerHTML=DATA.futureMessages.map(m=>{
    const unlocked=m.unlockDate<=now;
    return`<div class="future-msg ${unlocked?'':'locked'}"><div class="msg-date">${unlocked?'Unlocked':'🔒 Unlocks'}: ${m.unlockDate}</div>${unlocked?`<div class="msg-content">${m.message}</div>`:`<div class="msg-locked">This message is locked until ${m.unlockDate}</div>`}</div>`;
  }).join('')||'';
}

// ===== LEADERBOARD VS YOURSELF =====
function renderLeaderboard(){
  const el=document.getElementById('leaderboardSelf');if(!el)return;
  const mo=mKey(today());
  const lastMo=new Date();lastMo.setMonth(lastMo.getMonth()-1);
  const lastKey=mKey(lastMo.toISOString().split('T')[0]);
  
  const thisInc=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const lastInc=DATA.expenses.filter(e=>mKey(e.date)===lastKey&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const thisExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const lastExp=DATA.expenses.filter(e=>mKey(e.date)===lastKey&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const thisShifts=DATA.shifts.filter(s=>mKey(s.date)===mo).length;
  const lastShifts=DATA.shifts.filter(s=>mKey(s.date)===lastKey).length;
  const thisNS=DATA.nospendDays.filter(d=>mKey(d)===mo).length;
  const lastNS=DATA.nospendDays.filter(d=>mKey(d)===lastKey).length;
  
  const rows=[
    {label:'Income',thisVal:fmt(thisInc),lastVal:fmt(lastInc),diff:thisInc-lastInc,good:true},
    {label:'Spending',thisVal:fmt(thisExp),lastVal:fmt(lastExp),diff:thisExp-lastExp,good:false},
    {label:'Shifts Worked',thisVal:thisShifts,lastVal:lastShifts,diff:thisShifts-lastShifts,good:true},
    {label:'No-Spend Days',thisVal:thisNS,lastVal:lastNS,diff:thisNS-lastNS,good:true},
  ];
  el.innerHTML=rows.map(r=>{
    const better=(r.good&&r.diff>0)||(!r.good&&r.diff<0);
    const col=better?'var(--green)':'var(--red)';
    const arrow=r.diff>0?'↑':r.diff<0?'↓':'=';
    return`<div class="lb-row"><span class="lb-label">${r.label}</span><div class="lb-values"><span class="lb-this">${r.thisVal}</span><span class="lb-last">${r.lastVal}</span><span class="lb-diff" style="color:${col}">${arrow}</span></div></div>`;
  }).join('');
}

// ===== TECH TRACKER =====
function addTech(){
  const name=document.getElementById('tech-name').value.trim();
  const cost=+document.getElementById('tech-cost').value||0;
  const saved=+document.getElementById('tech-saved').value||0;
  if(!name||cost<=0)return;
  DATA.techItems.push({id:uid(),name,cost,saved});
  document.getElementById('tech-name').value='';save();renderTech();
}
function renderTech(){
  const tbody=document.querySelector('#tech-table tbody');
  if(!tbody)return;
  tbody.innerHTML=DATA.techItems.map(t=>{
    const rem=Math.max(0,t.cost-t.saved);const pct=Math.min(100,(t.saved/t.cost)*100);
    const status=pct>=100?'<span class="tag tag-green">OWNED</span>':pct>0?'<span class="tag tag-yellow">SAVING</span>':'<span class="tag tag-accent">PLANNED</span>';
    return`<tr><td class="bold">${t.name}</td><td>${fmt(t.cost)}</td><td class="c-green">${fmt(t.saved)}</td><td class="c-red">${fmt(rem)}</td><td><div class="pbar" style="height:6px;width:80px;display:inline-block;"><div class="pbar-fill" style="width:${pct}%;background:var(--green);"></div></div> ${pct.toFixed(0)}%</td><td>${status}</td></tr>`;
  }).join('');
}

// ===== INVESTMENTS =====
function compound(start,monthly,rate,years){
  const r=rate/100/12;const m=years*12;let b=start;const h=[b];
  for(let i=0;i<m;i++){b=b*(1+r)+monthly;h.push(b);}
  return{final:b,contrib:start+monthly*m,gains:b-(start+monthly*m),hist:h};
}

function renderInvestments(){
  const b=DATA.investmentBal;const mo=DATA.monthlyInvest;const ret=DATA.expectedReturn;
  const p1=compound(b,mo,ret,1),p5=compound(b,mo,ret,5),p10=compound(b,mo,ret,10);
  document.getElementById('inv-total').textContent=fmt(b);
  document.getElementById('inv-monthly').textContent=fmt(mo)+'/mo';
  let dy=0;DATA.holdings.forEach(h=>{dy+=(h.alloc/100)*(h.yield/100);});
  document.getElementById('inv-divs').textContent=fmt(b*dy)+'/yr';
  document.getElementById('inv-return').textContent=ret+'%';
  document.getElementById('inv-1yr').textContent=fK(p1.final);
  document.getElementById('inv-5yr').textContent=fK(p5.final);
  document.getElementById('inv-10yr').textContent=fK(p10.final);

  const tb=document.querySelector('#inv-table tbody');
  if(tb)tb.innerHTML=DATA.holdings.map(h=>`<tr><td class="bold c-accent">${h.ticker}</td><td>${h.alloc}%</td><td>${fmt(b*h.alloc/100)}</td><td><span class="tag tag-blue">${h.type}</span></td><td>${h.yield}%</td></tr>`).join('');

  const ds=document.getElementById('div-summary');
  if(ds)ds.innerHTML=`<div class="g g2"><div class="mstat"><div class="mstat-val c-green">${fmt(b*dy)}</div><div class="mstat-lbl">Annual</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(b*dy/4)}</div><div class="mstat-lbl">Quarterly</div></div></div>`;
}

// ===== SPECULATIVE =====
function addSpec(){
  const ticker=document.getElementById('spec-ticker').value.trim().toUpperCase();
  const entry=+document.getElementById('spec-entry').value||0;
  const current=+document.getElementById('spec-current').value||0;
  const shares=+document.getElementById('spec-shares').value||1;
  const thesis=document.getElementById('spec-thesis').value.trim();
  if(!ticker)return;
  DATA.specPositions.push({id:uid(),ticker,thesis,entry,current,shares});
  document.getElementById('spec-ticker').value='';save();renderSpec();
}
function renderSpec(){
  const tb=document.querySelector('#spec-table tbody');
  if(!tb)return;
  tb.innerHTML=DATA.specPositions.map(p=>{
    const gl=(p.current-p.entry)*p.shares;const pct=p.entry>0?((p.current-p.entry)/p.entry*100):0;
    return`<tr><td class="bold c-accent">${p.ticker}</td><td class="small">${p.thesis}</td><td>${fmt(p.entry)}</td><td>${fmt(p.current)}</td><td>${p.shares}</td><td style="color:${gl>=0?'var(--green)':'var(--red)'}">${gl>=0?'+':''}${fmt(gl)} (${pct>=0?'+':''}${pct.toFixed(1)}%)</td></tr>`;
  }).join('');
}

// ===== COMPOUND INTEREST =====
function renderCompound(){
  const mo=+document.getElementById('ci-monthly')?.value||300;
  const start=+document.getElementById('ci-start')?.value||17;
  const end=+document.getElementById('ci-end')?.value||60;
  const ret=+document.getElementById('ci-return')?.value||10;
  const yrs=end-start;
  const p=compound(0,mo,ret,yrs);
  const income=p.final*0.04/12;
  document.getElementById('ci-total').textContent=fK(p.final);
  document.getElementById('ci-contrib').textContent=fK(p.contrib);
  document.getElementById('ci-gains').textContent=fK(p.gains);
  document.getElementById('ci-income').textContent=fK(income)+'/mo';

  const tb=document.querySelector('#ci-milestones tbody');
  if(tb){
    const ages=[18,20,22,25,30,35,40,45,50,55,60];
    tb.innerHTML=ages.filter(a=>a<=end).map(a=>{
      const y=a-start;if(y<0)return'';
      const pp=compound(0,mo,ret,y);
      return`<tr><td class="bold">${a}</td><td class="c-green">${fK(pp.final)}</td><td>${fK(pp.contrib)}</td><td class="c-purple">+${fK(pp.gains)}</td></tr>`;
    }).join('');
  }

  const comp=document.getElementById('ci-comparison');
  if(comp){
    comp.innerHTML=[17,22,30].map(age=>{
      const y=end-age;const pp=compound(0,mo,ret,Math.max(0,y));
      const diff=pp.final-p.final;
      const col=age===17?'var(--green)':age===22?'var(--yellow)':'var(--red)';
      return`<div class="card" style="text-align:center;"><div class="small">Start at ${age}</div><div class="mstat-val" style="color:${col};font-size:18px;">${fK(pp.final)}</div><div class="small">${age===17?'YOU! (starting now)':diff<0?'Loses '+fK(Math.abs(diff)):''}</div></div>`;
    }).join('');
  }

  renderCompoundChart();
}

// ===== INFLATION CALCULATOR =====
function calcInflation(){
  const price=+document.getElementById('infl-price').value||100;
  const years=+document.getElementById('infl-years').value||5;
  const rate=+document.getElementById('infl-rate').value||3.5;
  const futurePrice=price*Math.pow(1+rate/100,years);
  const increase=futurePrice-price;
  const el=document.getElementById('inflResult');
  if(el)el.innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val c-red">${fmt(futurePrice)}</div><div class="mstat-lbl">Price in ${years} yrs</div></div><div class="mstat"><div class="mstat-val c-orange">+${fmt(increase)}</div><div class="mstat-lbl">Increase</div></div><div class="mstat"><div class="mstat-val c-purple">+${((futurePrice/price-1)*100).toFixed(1)}%</div><div class="mstat-lbl">Total Inflation</div></div></div><p class="small" style="margin-top:10px;">A ${fmt(price)} item today will cost ${fmt(futurePrice)} in ${years} years at ${rate}% inflation.</p></div>`;
}

// ===== EDUCATION PLANNER =====
function renderEducation(){
  const opts=document.getElementById('edu-options');
  if(opts){
    const schools=[
      {name:'OTC (Community)',cost:'$3,000/yr',detail:'2-year associate, then transfer',color:'var(--green)'},
      {name:'Valencia College',cost:'$3,500/yr',detail:'DirectConnect to UCF',color:'var(--blue)'},
      {name:'UCF',cost:'$6,400/yr',detail:'4-year university (in-state)',color:'var(--yellow)'},
      {name:'Trade School',cost:'$5,000-15,000',detail:'HVAC, welding, electrical, etc.',color:'var(--orange)'},
      {name:'Semiconductor Path',cost:'$8,000-20,000',detail:'EE degree or technician cert',color:'var(--purple)'},
    ];
    opts.innerHTML=schools.map(s=>`<div class="edu-card"><div class="name">${s.name}</div><div class="cost" style="color:${s.color};">${s.cost}</div><div class="detail">${s.detail}</div></div>`).join('');
  }
  document.getElementById('edu-savings').textContent=fmt(DATA.eduSavings);
  document.getElementById('edu-fafsa').textContent=fmt(DATA.eduFafsa);
  document.getElementById('edu-bright').textContent=fmt(DATA.eduBright);
  document.getElementById('edu-scholar').textContent=fmt(DATA.eduScholar);
}

// ===== NET WORTH =====
function renderNetWorth(){
  const total=DATA.assets.reduce((s,a)=>s+a.value,0);
  document.getElementById('nw-total').textContent=fmt(total);
  document.getElementById('nwPill').textContent=fK(total);
  document.getElementById('h-networth').textContent=fK(total);
  document.getElementById('h-checking').textContent=fmt(DATA.checking);
  document.getElementById('h-emergency').textContent=fmt(DATA.emergencyFund);
  document.getElementById('h-investments').textContent=fmt(DATA.investmentBal);

  const tb=document.querySelector('#nw-table tbody');
  if(tb)tb.innerHTML=DATA.assets.map(a=>{
    const p=total>0?((a.value/total)*100).toFixed(1):'0';
    return`<tr><td class="bold">${a.name}</td><td class="c-green">${fmt(a.value)}</td><td>${p}%</td></tr>`;
  }).join('');

  const inputs=document.getElementById('nw-inputs');
  if(inputs)inputs.innerHTML=`<div class="g g3">${DATA.assets.map((a,i)=>`<div class="fg"><label>${a.name}</label><input type="number" class="nw-inp" data-idx="${i}" value="${a.value}" min="0"/></div>`).join('')}</div>`;
}

// ===== TIMELINE =====
function renderTimeline(){
  const el=document.getElementById('timeline-list');
  if(!el)return;
  el.innerHTML=DATA.timeline.map(t=>`<div class="tl-item"><div class="tl-dot ${t.status}"></div><div class="tl-date">${t.date}</div><div class="tl-title">${t.title}</div><div class="tl-desc">${t.desc}</div></div>`).join('');
}

// ===== PROJECTIONS =====
function renderProjections(){
  const tb=document.querySelector('#proj-table tbody');
  if(!tb)return;
  const monthlyNet=DATA.wage*DATA.schoolHours*4.33*(1-totalTaxRate());
  const savingsRate=0.3;const investRate=DATA.monthlyInvest;
  let savings=DATA.checking+DATA.emergencyFund;let inv=DATA.investmentBal;
  const rows=[];
  for(let age=17;age<=25;age++){
    const year=2026+(age-17);
    savings+=monthlyNet*12*savingsRate;
    inv=inv*(1+DATA.expectedReturn/100)+investRate*12;
    const nw=savings+inv;
    rows.push(`<tr><td class="bold">${age}</td><td>${year}</td><td>${fK(savings)}</td><td class="c-green">${fK(inv)}</td><td class="c-accent bold">${fK(nw)}</td></tr>`);
  }
  tb.innerHTML=rows.join('');
}

// ===== WHAT-IF SIMULATOR =====
function runWhatIf(){
  const scenario=document.getElementById('wi-scenario').value;
  const val=+document.getElementById('wi-value').value||0;
  const res=document.getElementById('wi-result');
  if(!res)return;
  let html='';
  const base=compound(DATA.investmentBal,DATA.monthlyInvest,DATA.expectedReturn,10);

  if(scenario==='hours'){
    const monthlyNet=DATA.wage*val*4.33*(1-totalTaxRate());
    const yearly=monthlyNet*11;
    const investable=Math.min(DATA.monthlyInvest,monthlyNet);
    html=`<div class="sim-result"><h4>Working ${val} hrs/week:</h4><div class="g g3"><div class="mstat"><div class="mstat-val c-green">${fmt(monthlyNet)}</div><div class="mstat-lbl">Monthly Net</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(yearly)}</div><div class="mstat-lbl">Yearly Net</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(investable)}</div><div class="mstat-lbl">Can Invest/Mo</div></div></div></div>`;
  } else if(scenario==='invest'){
    const p=compound(DATA.investmentBal,val,DATA.expectedReturn,10);
    const diff=p.final-base.final;
    html=`<div class="sim-result"><h4>Investing $${val}/month for 10 years:</h4><div class="sim-comparison"><div class="sim-col"><h4>Current Plan ($${DATA.monthlyInvest}/mo)</h4><div class="val c-accent">${fK(base.final)}</div></div><div class="sim-col"><h4>New Plan ($${val}/mo)</h4><div class="val c-green">${fK(p.final)}</div></div></div><div class="small" style="margin-top:8px;">Difference: <b class="c-green">+${fK(diff)}</b> more in 10 years</div></div>`;
  } else if(scenario==='buy'){
    const cost=val;const invested=compound(cost,0,DATA.expectedReturn,10);
    html=`<div class="sim-result"><h4>If you buy something for $${val} today:</h4><div class="g g2"><div class="mstat"><div class="mstat-val c-red">-${fmt(cost)}</div><div class="mstat-lbl">Cost Now</div></div><div class="mstat"><div class="mstat-val c-green">${fK(invested.final)}</div><div class="mstat-lbl">Invested Value (10yr)</div></div></div><div class="small" style="margin-top:8px;">Opportunity cost: <b class="c-purple">${fK(invested.gains)}</b> in missed compound gains</div></div>`;
  } else if(scenario==='ttwo'){
    const currentVal=DATA.specPositions.find(p=>p.ticker==='TTWO');
    const shares=currentVal?currentVal.shares:2;const entry=currentVal?currentVal.entry:180;
    const doubled=entry*2*shares;const gain=doubled-entry*shares;
    html=`<div class="sim-result"><h4>If TTWO doubles after GTA VI:</h4><div class="g g2"><div class="mstat"><div class="mstat-val c-green">+${fmt(gain)}</div><div class="mstat-lbl">Profit (${shares} shares)</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(doubled)}</div><div class="mstat-lbl">Position Value</div></div></div></div>`;
  } else if(scenario==='rx7'){
    const goal=30000;const monthly=val||500;const months=Math.ceil(goal/monthly);
    html=`<div class="sim-result"><h4>Saving for an RX-7 ($30,000):</h4><div class="g g3"><div class="mstat"><div class="mstat-val c-accent">${fmt(monthly)}</div><div class="mstat-lbl">/Month Needed</div></div><div class="mstat"><div class="mstat-val c-yellow">${months} months</div><div class="mstat-lbl">Time to Goal</div></div><div class="mstat"><div class="mstat-val c-purple">${(months/12).toFixed(1)} years</div><div class="mstat-lbl">That's...</div></div></div></div>`;
  } else if(scenario==='engineer'){
    const salary=val||75000;const monthly=salary/12*(1-0.25);const invest=monthly*0.2;
    const p10=compound(DATA.investmentBal,invest,DATA.expectedReturn,10);
    html=`<div class="sim-result"><h4>Electrical Engineer ($${(salary/1000).toFixed(0)}K/yr):</h4><div class="g g3"><div class="mstat"><div class="mstat-val c-green">${fmt(monthly)}</div><div class="mstat-lbl">Monthly Net</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(invest)}</div><div class="mstat-lbl">20% Invest</div></div><div class="mstat"><div class="mstat-val c-purple">${fK(p10.final)}</div><div class="mstat-lbl">Portfolio (10yr)</div></div></div></div>`;
  } else {
    html=`<div class="sim-result"><div class="small">Enter a custom value and select a scenario above.</div></div>`;
  }
  res.innerHTML=html;
}

function runBvS(){
  const item=document.getElementById('bvs-item').value.trim()||'this item';
  const price=+document.getElementById('bvs-price').value||0;
  const happy=+document.getElementById('bvs-happy').value||5;
  if(price<=0)return;
  const hoursNeeded=price/(DATA.wage*(1-totalTaxRate()));
  const invested=compound(price,0,DATA.expectedReturn,10);
  const score=Math.max(1,Math.min(10,11-happy));
  const verdict=score>=7?'SAVE':score>=4?'THINK ABOUT IT':'BUY (if budgeted)';
  const col=score>=7?'var(--green)':score>=4?'var(--yellow)':'var(--accent)';
  const res=document.getElementById('bvs-result');
  if(res)res.innerHTML=`<div class="sim-result" style="border-color:${col};"><div class="center mb"><div style="font-size:22px;font-weight:800;color:${col};">${verdict}</div></div><div class="g g3"><div class="mstat"><div class="mstat-val c-yellow">${hoursNeeded.toFixed(1)} hrs</div><div class="mstat-lbl">Work to Earn</div></div><div class="mstat"><div class="mstat-val c-green">${fK(invested.final)}</div><div class="mstat-lbl">If Invested (10yr)</div></div><div class="mstat"><div class="mstat-val c-purple">${fK(invested.gains)}</div><div class="mstat-lbl">Missed Gains</div></div></div></div>`;
}

// ===== TAX REFUND ESTIMATOR =====
function calcTax(){
  const ytd=+document.getElementById('tax-ytd').value||0;
  const withheld=+document.getElementById('tax-withheld').value||0;
  const status=document.getElementById('tax-status').value;
  // Standard deduction 2024: $14,600 single, dependent gets $1,300 + earned income
  const stdDed=status==='single'?14600:Math.min(14600,Math.max(1300,ytd+450));
  const taxableIncome=Math.max(0,ytd-stdDed);
  // 2024 brackets (simplified)
  let taxOwed=0;
  if(taxableIncome<=11600)taxOwed=taxableIncome*0.10;
  else if(taxableIncome<=47150)taxOwed=1160+(taxableIncome-11600)*0.12;
  else taxOwed=1160+4266+(taxableIncome-47150)*0.22;
  const refund=withheld-taxOwed;
  const el=document.getElementById('taxResult');
  if(el)el.innerHTML=`<div class="sim-result"><div class="g g4"><div class="mstat"><div class="mstat-val">${fmt(ytd)}</div><div class="mstat-lbl">YTD Gross</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(taxableIncome)}</div><div class="mstat-lbl">Taxable Income</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(taxOwed)}</div><div class="mstat-lbl">Tax Owed</div></div><div class="mstat"><div class="mstat-val ${refund>=0?'c-green':'c-red'}">${refund>=0?'+':''}${fmt(refund)}</div><div class="mstat-lbl">${refund>=0?'Estimated Refund':'You Owe'}</div></div></div><p class="small" style="margin-top:10px;">Standard deduction: ${fmt(stdDed)}. This is an estimate — actual may vary.</p></div>`;
}

// ===== CREDIT SCORE EDUCATION =====
function calcCredit(){
  const limit=+document.getElementById('credit-limit').value||500;
  const balance=+document.getElementById('credit-balance').value||0;
  const util=limit>0?(balance/limit*100):0;
  const el=document.getElementById('creditResult');
  const rating=util<=10?'Excellent':util<=30?'Good':util<=50?'Fair':'Poor';
  const col=util<=10?'var(--green)':util<=30?'var(--blue)':util<=50?'var(--yellow)':'var(--red)';
  if(el)el.innerHTML=`<div class="sim-result"><div class="g g3"><div class="mstat"><div class="mstat-val" style="color:${col}">${util.toFixed(1)}%</div><div class="mstat-lbl">Utilization</div></div><div class="mstat"><div class="mstat-val" style="color:${col}">${rating}</div><div class="mstat-lbl">Rating</div></div><div class="mstat"><div class="mstat-val">${fmt(limit-balance)}</div><div class="mstat-lbl">Available Credit</div></div></div><p class="small" style="margin-top:8px;">Keep utilization under 30% (ideally under 10%) for the best credit score impact.</p></div>`;
}
function renderCreditTips(){
  const el=document.getElementById('creditTips');
  if(!el)return;
  const tips=[
    {icon:'💳',tip:'Pay your full balance every month — never carry a balance'},
    {icon:'📅',tip:'Set up autopay so you never miss a payment'},
    {icon:'📊',tip:'Keep credit utilization under 30% (under 10% is ideal)'},
    {icon:'🔒',tip:'Don\'t close old cards — account age helps your score'},
    {icon:'⚠️',tip:'Only apply for credit you need — hard inquiries drop your score temporarily'},
    {icon:'📱',tip:'Check your credit report free at annualcreditreport.com'},
  ];
  el.innerHTML=tips.map(t=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;font-size:12px;"><span style="font-size:16px;">${t.icon}</span><span>${t.tip}</span></div>`).join('');
}
function renderCreditCards(){
  const el=document.getElementById('creditCards');
  if(!el)return;
  const cards=[
    {name:'Discover it Student',apr:'20.99%-29.99%',reward:'5% rotating categories',best:'Best for: cashback beginners'},
    {name:'Capital One Quicksilver Student',apr:'19.99%-29.99%',reward:'1.5% on everything',best:'Best for: simplicity'},
    {name:'Apple Card',apr:'19.24%-29.49%',reward:'2% Apple Pay, 1% other',best:'Best for: iPhone users'},
  ];
  el.innerHTML=cards.map(c=>`<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:8px;"><div style="font-weight:700;font-size:13px;">${c.name}</div><div class="small">APR: ${c.apr} | ${c.reward}</div><div class="small c-accent">${c.best}</div></div>`).join('');
}

// ===== REAL-TIME STOCK PRICES =====
function renderStocks(){
  const el=document.getElementById('stockCards');if(!el)return;
  if(!DATA.watchlist||!DATA.watchlist.length){el.innerHTML='<p class="small">No tickers in watchlist.</p>';return;}
  el.innerHTML=DATA.watchlist.map(t=>{
    const data=DATA.stockPrices[t];
    if(!data)return`<div class="stock-card"><div class="ticker">${t}</div><div class="price">—</div><div class="change small">Click Refresh</div></div>`;
    const changeCol=data.change>=0?'var(--green)':'var(--red)';
    return`<div class="stock-card"><div class="ticker">${t}</div><div class="price" style="color:${changeCol}">${fmt(data.price)}</div><div class="change" style="color:${changeCol}">${data.change>=0?'+':''}${data.changePercent.toFixed(2)}%</div></div>`;
  }).join('');
}
function addStockTicker(){
  const input=document.getElementById('stock-ticker-input');
  const ticker=input.value.trim().toUpperCase();
  if(!ticker)return;
  if(!DATA.watchlist.includes(ticker))DATA.watchlist.push(ticker);
  input.value='';save();renderStocks();
}
async function refreshStocks(){
  // Using a free proxy/simulation since direct Yahoo Finance requires CORS
  // We'll simulate realistic prices based on known values
  const knownPrices={VOO:520,QQQM:210,TTWO:210,AAPL:195,TSLA:250,CCJ:52,SMR:18,MSFT:420,GOOGL:175,AMZN:185,NVDA:130,META:500};
  DATA.watchlist.forEach(t=>{
    const base=knownPrices[t]||100+Math.random()*200;
    const change=(Math.random()-0.48)*5;
    const price=base+change;
    DATA.stockPrices[t]={price,change,changePercent:(change/base)*100,updated:new Date().toLocaleTimeString()};
  });
  save();renderStocks();
}

// ===== MOVE-OUT CALCULATOR =====
function calcMoveOut(){
  const rent=+document.getElementById('mo-rent').value||0;
  const deposit=+document.getElementById('mo-deposit').value||0;
  const firstLast=+document.getElementById('mo-firstlast').value||2;
  const furniture=+document.getElementById('mo-furniture').value||0;
  const utilities=+document.getElementById('mo-utilities').value||0;
  const groceries=+document.getElementById('mo-groceries').value||0;
  const upfront=rent*firstLast+deposit+furniture;
  const monthly=rent+utilities+groceries;
  const yearly=monthly*12;
  const hoursToEarn=upfront/(DATA.wage*(1-totalTaxRate()));
  const el=document.getElementById('moveoutResult');
  if(el)el.innerHTML=`<div class="sim-result"><div class="g g4"><div class="mstat"><div class="mstat-val c-red">${fmt(upfront)}</div><div class="mstat-lbl">Upfront Cost</div></div><div class="mstat"><div class="mstat-val c-orange">${fmt(monthly)}</div><div class="mstat-lbl">Monthly Cost</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(yearly)}</div><div class="mstat-lbl">Yearly Cost</div></div><div class="mstat"><div class="mstat-val c-yellow">${hoursToEarn.toFixed(0)} hrs</div><div class="mstat-lbl">Work for Upfront</div></div></div><div class="divider"></div><p class="small"><b>Breakdown:</b> Rent×${firstLast} (${fmt(rent*firstLast)}) + Deposit (${fmt(deposit)}) + Furniture (${fmt(furniture)}) = ${fmt(upfront)} upfront</p><p class="small">Monthly: Rent (${fmt(rent)}) + Utilities (${fmt(utilities)}) + Groceries (${fmt(groceries)}) = ${fmt(monthly)}/mo</p></div>`;
}

// ===== CAR BUYING CALCULATOR =====
function calcCar(){
  const price=+document.getElementById('car-price').value||0;
  const down=+document.getElementById('car-down').value||0;
  const rate=+document.getElementById('car-rate').value||7;
  const term=+document.getElementById('car-term').value||60;
  const insurance=+document.getElementById('car-insurance').value||0;
  const gas=+document.getElementById('car-gas').value||0;
  const loan=price-down;
  const monthlyRate=rate/100/12;
  const payment=monthlyRate>0?loan*(monthlyRate*Math.pow(1+monthlyRate,term))/(Math.pow(1+monthlyRate,term)-1):loan/term;
  const totalPaid=payment*term+down;
  const interestPaid=totalPaid-price;
  const trueMonthlyCost=payment+insurance+gas+50; // +50 maintenance
  const el=document.getElementById('carResult');
  if(el)el.innerHTML=`<div class="sim-result"><div class="g g4"><div class="mstat"><div class="mstat-val c-accent">${fmt(payment)}</div><div class="mstat-lbl">Loan Payment/Mo</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(trueMonthlyCost)}</div><div class="mstat-lbl">True Monthly Cost</div></div><div class="mstat"><div class="mstat-val c-orange">${fmt(interestPaid)}</div><div class="mstat-lbl">Interest Paid</div></div><div class="mstat"><div class="mstat-val c-purple">${fmt(totalPaid)}</div><div class="mstat-lbl">Total Cost (${term}mo)</div></div></div><div class="divider"></div><p class="small"><b>True monthly cost includes:</b> Loan (${fmt(payment)}) + Insurance (${fmt(insurance)}) + Gas (${fmt(gas)}) + Maintenance (~$50) = <b>${fmt(trueMonthlyCost)}/mo</b></p><p class="small">That's <b>${(trueMonthlyCost/(DATA.wage*(1-totalTaxRate()))).toFixed(1)} hours/week</b> of work just for the car.</p></div>`;
}

// ===== TRAVEL FUND =====
function addTrip(){
  const dest=document.getElementById('trip-dest').value.trim();
  const cost=+document.getElementById('trip-cost').value||0;
  const date=document.getElementById('trip-date').value;
  if(!dest||cost<=0)return;
  DATA.trips.push({id:uid(),destination:dest,cost,targetDate:date,saved:0});
  document.getElementById('trip-dest').value='';document.getElementById('trip-cost').value='';
  save();renderTrips();
}
function renderTrips(){
  const el=document.getElementById('tripsList');if(!el)return;
  if(!DATA.trips||!DATA.trips.length){el.innerHTML='<p class="small center">No trips planned yet.</p>';return;}
  el.innerHTML=DATA.trips.map(t=>{
    const pct=Math.min(100,(t.saved/t.cost)*100);
    const daysLeft=t.targetDate?Math.max(0,Math.ceil((new Date(t.targetDate)-new Date())/(86400000))):0;
    const perDay=daysLeft>0?(t.cost-t.saved)/daysLeft:0;
    return`<div class="card" style="margin-bottom:10px;"><div class="pbar-top"><span class="pbar-name">✈️ ${t.destination}</span><span class="pbar-amt">${fmt(t.saved)} / ${fmt(t.cost)}</span></div><div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:var(--cyan);"></div></div><div class="small" style="margin-top:4px;">${t.targetDate?`${daysLeft} days left · Save ${fmt(perDay)}/day`:'No target date'}</div><div style="display:flex;gap:6px;margin-top:6px;"><input type="number" value="${t.saved}" min="0" step="10" onchange="updateTripSaved('${t.id}',this.value)" style="width:80px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;"/><button class="btn btn-sm btn-danger" onclick="delTrip('${t.id}')">×</button></div></div>`;
  }).join('');
}
function updateTripSaved(id,val){const t=DATA.trips.find(x=>x.id===id);if(t){t.saved=+val||0;save();renderTrips();}}
function delTrip(id){DATA.trips=DATA.trips.filter(t=>t.id!==id);save();renderTrips();}

// ===== CALENDAR VIEW =====
function renderCalendar(){
  const grid=document.getElementById('calendarGrid');
  const label=document.getElementById('cal-month-label');
  if(!grid||!label)return;
  const year=DATA.calYear;const month=DATA.calMonth;
  label.textContent=new Date(year,month).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayDate=new Date();const todayStr=today();
  
  let html='';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{html+=`<div class="cal-header">${d}</div>`;});
  for(let i=0;i<firstDay;i++)html+=`<div class="cal-day empty"></div>`;
  
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday=dateStr===todayStr;
    const events=getCalEvents(dateStr);
    html+=`<div class="cal-day${isToday?' today':''}" onclick="showCalDay('${dateStr}')"><div class="day-num">${d}</div><div class="cal-events">${events.map(e=>`<div class="cal-event ${e.type}">${e.label}</div>`).join('')}</div></div>`;
  }
  grid.innerHTML=html;
}
function getCalEvents(dateStr){
  const events=[];
  const day=new Date(dateStr).getDate();
  // Shifts
  const shifts=DATA.shifts.filter(s=>s.date===dateStr);
  if(shifts.length)events.push({type:'shift',label:`☕ ${shifts.reduce((s,sh)=>s+sh.hours,0).toFixed(1)}h`});
  // Bills
  DATA.bills.forEach(b=>{if(b.dueDay===day)events.push({type:'bill',label:`${b.icon} ${b.name}`});});
  // Paydays (biweekly Fridays)
  const d=new Date(dateStr);if(d.getDay()===5){
    const weeksSinceStart=Math.floor((d-new Date('2026-06-29'))/(7*86400000));
    if(weeksSinceStart>=0&&weeksSinceStart%2===0)events.push({type:'payday',label:'💰 Payday'});
  }
  // Timeline events
  DATA.timeline.forEach(t=>{if(t.date===dateStr)events.push({type:'school',label:`📌 ${t.title}`});});
  return events;
}
function showCalDay(dateStr){
  const el=document.getElementById('calDayDetails');if(!el)return;
  const events=getCalEvents(dateStr);
  const shifts=DATA.shifts.filter(s=>s.date===dateStr);
  const expenses=DATA.expenses.filter(e=>e.date===dateStr);
  let html=`<h4 style="margin-bottom:8px;">${new Date(dateStr+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h4>`;
  if(shifts.length)html+=`<p class="small"><b>Shifts:</b> ${shifts.map(s=>`${s.start}-${s.end} (${s.hours.toFixed(1)}h, ${fmt(s.gross)})`).join(', ')}</p>`;
  if(expenses.length)html+=`<p class="small"><b>Transactions:</b> ${expenses.map(e=>`${e.note||e.category} ${e.type==='income'?'+':'-'}${fmt(e.amount)}`).join(', ')}</p>`;
  if(events.length)html+=`<p class="small"><b>Events:</b> ${events.map(e=>e.label).join(', ')}</p>`;
  if(!shifts.length&&!expenses.length&&!events.length)html+=`<p class="small">No activity on this day.</p>`;
  el.innerHTML=html;
}
function calPrev(){DATA.calMonth--;if(DATA.calMonth<0){DATA.calMonth=11;DATA.calYear--;}renderCalendar();}
function calNext(){DATA.calMonth++;if(DATA.calMonth>11){DATA.calMonth=0;DATA.calYear++;}renderCalendar();}

// ===== WEEKLY PLANNER =====
function renderWeeklyPlanner(){
  const el=document.getElementById('weeklyPlannerContent');if(!el)return;
  const now=new Date();
  const startOfWeek=new Date(now);startOfWeek.setDate(now.getDate()-now.getDay());
  
  let totalShiftHrs=0,totalEstPay=0,totalBills=0,noSpendCount=0;
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let dayRows='';
  
  for(let i=0;i<7;i++){
    const d=new Date(startOfWeek);d.setDate(startOfWeek.getDate()+i);
    const dateStr=d.toISOString().split('T')[0];
    const shifts=DATA.shifts.filter(s=>s.date===dateStr);
    const shiftHrs=shifts.reduce((s,sh)=>s+sh.hours,0);
    totalShiftHrs+=shiftHrs;
    totalEstPay+=shifts.reduce((s,sh)=>s+sh.gross,0);
    const bills=DATA.bills.filter(b=>b.dueDay===d.getDate());
    const billTotal=bills.reduce((s,b)=>s+b.amount,0);
    totalBills+=billTotal;
    const isNS=DATA.nospendDays.includes(dateStr);
    if(isNS)noSpendCount++;
    const isToday=dateStr===today();
    
    let evts=[];
    if(shiftHrs>0)evts.push(`☕ ${shiftHrs.toFixed(1)}h shift`);
    if(billTotal>0)evts.push(`📅 ${fmt(billTotal)} bills due`);
    if(isNS)evts.push('✅ No-spend day');
    
    dayRows+=`<div class="planner-day" style="${isToday?'border-color:var(--accent);':''}"><span class="day-name">${days[i]}</span><span style="font-size:10px;color:var(--text-muted);min-width:70px;">${d.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><span class="day-events">${evts.join(' · ')||'Free day'}</span></div>`;
  }
  
  const estNet=totalEstPay*(1-totalTaxRate());
  el.innerHTML=`<div class="g g4 mb"><div class="mstat"><div class="mstat-val c-green">${totalShiftHrs.toFixed(1)}h</div><div class="mstat-lbl">Shifts</div></div><div class="mstat"><div class="mstat-val c-accent">${fmt(estNet)}</div><div class="mstat-lbl">Est. Earnings</div></div><div class="mstat"><div class="mstat-val c-red">${fmt(totalBills)}</div><div class="mstat-lbl">Bills Due</div></div><div class="mstat"><div class="mstat-val c-orange">${noSpendCount}</div><div class="mstat-lbl">No-Spend Days</div></div></div>${dayRows}`;
}

// ===== MONTHLY REPORT =====
function renderMonthlyReport(){
  const el=document.getElementById('monthlyReportContent');if(!el)return;
  const mo=mKey(today());
  const monthName=new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo);
  const inc=mExp.filter(e=>e.type==='income').reduce((s,e)=>s+e.amount,0);
  const exp=mExp.filter(e=>e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const mShifts=DATA.shifts.filter(s=>mKey(s.date)===mo);
  const shiftHrs=mShifts.reduce((s,sh)=>s+sh.hours,0);
  const shiftPay=mShifts.reduce((s,sh)=>s+sh.gross,0);
  const nsDays=DATA.nospendDays.filter(d=>mKey(d)===mo).length;
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);
  
  const catTotals={};
  mExp.filter(e=>e.type==='expense').forEach(e=>{catTotals[e.category]=(catTotals[e.category]||0)+e.amount;});
  const topCats=Object.entries(catTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  
  el.innerHTML=`<h3 style="margin-bottom:12px;">📄 ${monthName} Summary</h3>
    <div class="g g4 mb">
      <div class="mstat"><div class="mstat-val c-green">${fmt(inc)}</div><div class="mstat-lbl">Income</div></div>
      <div class="mstat"><div class="mstat-val c-red">${fmt(exp)}</div><div class="mstat-lbl">Spent</div></div>
      <div class="mstat"><div class="mstat-val c-accent">${fmt(inc-exp)}</div><div class="mstat-lbl">Net</div></div>
      <div class="mstat"><div class="mstat-val c-purple">${fK(nw)}</div><div class="mstat-lbl">Net Worth</div></div>
    </div>
    <div class="divider"></div>
    <h4 style="font-size:12px;margin-bottom:8px;">Work</h4>
    <p class="small">${mShifts.length} shifts · ${shiftHrs.toFixed(1)} hours · ${fmt(shiftPay)} gross</p>
    <div class="divider"></div>
    <h4 style="font-size:12px;margin-bottom:8px;">Top Spending Categories</h4>
    ${topCats.map(([cat,amt])=>`<p class="small">${(CATS[cat]||CATS.other).i} ${(CATS[cat]||CATS.other).l}: ${fmt(amt)}</p>`).join('')}
    <div class="divider"></div>
    <h4 style="font-size:12px;margin-bottom:8px;">Discipline</h4>
    <p class="small">No-spend days: ${nsDays} · Savings rate: ${inc>0?((inc-exp)/inc*100).toFixed(0):0}%</p>
    <div class="divider"></div>
    <h4 style="font-size:12px;margin-bottom:8px;">XP Earned: ${DATA.xp}</h4>
  `;
}
function exportReport(){
  const el=document.getElementById('monthlyReportContent');if(!el)return;
  const text=el.innerText;
  const blob=new Blob([text],{type:'text/plain'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='monthly-report-'+mKey(today())+'.txt';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}

// ===== CAREER PATH PROJECTIONS =====
function renderCareer(){
  renderCareerChart();
}
function calcRaise(){
  const raise=+document.getElementById('raise-amt').value||0.50;
  const hrs=+document.getElementById('raise-hrs').value||20;
  const weeklyExtra=raise*hrs;
  const monthlyExtra=weeklyExtra*4.33;
  const yearlyExtra=monthlyExtra*12;
  const yearlyNet=yearlyExtra*(1-totalTaxRate());
  const invested10=compound(0,monthlyExtra*(1-totalTaxRate())*0.5,DATA.expectedReturn,10);
  const el=document.getElementById('raiseResult');
  if(el)el.innerHTML=`<div class="sim-result"><div class="g g4"><div class="mstat"><div class="mstat-val c-green">+${fmt(weeklyExtra)}</div><div class="mstat-lbl">/Week Extra</div></div><div class="mstat"><div class="mstat-val c-accent">+${fmt(monthlyExtra)}</div><div class="mstat-lbl">/Month Extra</div></div><div class="mstat"><div class="mstat-val c-purple">+${fmt(yearlyNet)}</div><div class="mstat-lbl">/Year Net</div></div><div class="mstat"><div class="mstat-val c-orange">${fK(invested10.final)}</div><div class="mstat-lbl">If 50% Invested (10yr)</div></div></div></div>`;
}

// ===== SIDE HUSTLE TRACKER =====
function addHustle(){
  const name=document.getElementById('sh-name').value.trim();
  const earn=+document.getElementById('sh-earn').value||0;
  const hours=+document.getElementById('sh-hours').value||0;
  const date=document.getElementById('sh-hustle-date').value||today();
  if(!name||earn<=0)return;
  DATA.sideHustles.push({id:uid(),name,earnings:earn,hours,date});
  document.getElementById('sh-name').value='';document.getElementById('sh-earn').value='';document.getElementById('sh-hours').value='';
  addXP(10,'Logged side hustle income');
  save();renderHustles();
}
function renderHustles(){
  const tb=document.querySelector('#hustle-table tbody');if(!tb)return;
  // Aggregate by name
  const agg={};
  (DATA.sideHustles||[]).forEach(h=>{
    if(!agg[h.name])agg[h.name]={earn:0,hrs:0,count:0};
    agg[h.name].earn+=h.earnings;
    agg[h.name].hrs+=h.hours;
    agg[h.name].count++;
  });
  const rows=Object.entries(agg).sort((a,b)=>b[1].earn-a[1].earn);
  tb.innerHTML=rows.length?rows.map(([name,d])=>{
    const perHr=d.hrs>0?(d.earn/d.hrs):0;
    return`<tr><td class="bold">${name}</td><td class="c-green">${fmt(d.earn)}</td><td>${d.hrs.toFixed(1)}</td><td class="c-accent">${fmt(perHr)}/hr</td><td>${d.count}</td></tr>`;
  }).join(''):'<tr><td colspan="5" class="center small">No hustles logged yet.</td></tr>';
}

// ===== XP SYSTEM & LEVELS =====
const XP_LEVELS=[
  {name:'Rookie',min:0,icon:'🌱'},
  {name:'Saver',min:100,icon:'💪'},
  {name:'Investor',min:500,icon:'📈'},
  {name:'Wealth Builder',min:1500,icon:'🏗️'},
  {name:'Millionaire Mindset',min:5000,icon:'💎'},
];
function getLevel(xp){
  let lvl=XP_LEVELS[0];
  for(let i=XP_LEVELS.length-1;i>=0;i--){
    if(xp>=XP_LEVELS[i].min){lvl=XP_LEVELS[i];break;}
  }
  return lvl;
}
function getNextLevel(xp){
  for(let i=0;i<XP_LEVELS.length;i++){
    if(xp<XP_LEVELS[i].min)return XP_LEVELS[i];
  }
  return null;
}
function addXP(amount,reason){
  DATA.xp=(DATA.xp||0)+amount;
  if(!DATA.xpLog)DATA.xpLog=[];
  DATA.xpLog.push({date:today(),amount,reason});
  if(DATA.xpLog.length>50)DATA.xpLog=DATA.xpLog.slice(-50);
  save();
}
function renderXPPill(){
  const xp=DATA.xp||0;
  const lvl=getLevel(xp);
  const next=getNextLevel(xp);
  const pill=document.getElementById('xpPill');
  const fill=document.getElementById('xpFillMini');
  if(pill){
    const lvlIdx=XP_LEVELS.indexOf(lvl)+1;
    pill.querySelector('.xp-level').textContent=`Lv${lvlIdx}`;
  }
  if(fill&&next){
    const progress=((xp-lvl.min)/(next.min-lvl.min))*100;
    fill.style.width=Math.min(100,progress)+'%';
  } else if(fill){fill.style.width='100%';}
}
function renderXP(){
  const xp=DATA.xp||0;
  const lvl=getLevel(xp);
  const next=getNextLevel(xp);
  const big=document.getElementById('xpLevelBig');
  const fill=document.getElementById('xpProgressFill');
  const stats=document.getElementById('xpStats');
  if(big)big.textContent=`${lvl.icon} ${lvl.name}`;
  if(fill&&next){
    const progress=((xp-lvl.min)/(next.min-lvl.min))*100;
    fill.style.width=Math.min(100,progress)+'%';
  } else if(fill){fill.style.width='100%';}
  if(stats)stats.textContent=next?`${xp} XP · ${next.min-xp} XP to ${next.name}`:`${xp} XP · MAX LEVEL!`;
  
  // History
  const hist=document.getElementById('xpHistory');
  if(hist){
    const log=(DATA.xpLog||[]).slice(-15).reverse();
    hist.innerHTML=log.map(l=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px;"><span>${l.date} — ${l.reason}</span><span class="c-purple">+${l.amount} XP</span></div>`).join('')||'<p class="small">No XP earned yet. Log shifts, track expenses, and hit no-spend days!</p>';
  }
  renderWeeklyChallenges();
}

// ===== WEEKLY CHALLENGES =====
const CHALLENGES=[
  {title:'No-Spend Streak',desc:'Go 3 days without spending anything',reward:50,check:()=>DATA.nospendDays.length>=3},
  {title:'Shift Machine',desc:'Log 3+ shifts this week',reward:40,check:()=>{const w=new Date();w.setDate(w.getDate()-7);return DATA.shifts.filter(s=>new Date(s.date)>=w).length>=3;}},
  {title:'Budget Detective',desc:'Track 10 transactions this month',reward:30,check:()=>DATA.expenses.filter(e=>mKey(e.date)===mKey(today())).length>=10},
  {title:'Goal Crusher',desc:'Add $50 to any savings goal',reward:45,check:()=>DATA.goals.some(g=>g.saved>=50)},
  {title:'Side Income',desc:'Earn money from a side hustle',reward:35,check:()=>(DATA.sideHustles||[]).length>0},
  {title:'Research Day',desc:'Check your investment growth',reward:20,check:()=>true},
  {title:'Zero Waste Week',desc:'No regret purchases for 7 days',reward:60,check:()=>{const w=new Date();w.setDate(w.getDate()-7);return!DATA.wastedMoney.some(x=>new Date(x.date)>=w);}},
  {title:'Early Bird',desc:'Log a morning shift (before 7am start)',reward:25,check:()=>DATA.shifts.some(s=>{const h=parseInt(s.start);return h<7;})},
];
function getWeeklyChallenge(){
  const seed=weekNum()+new Date().getFullYear();
  const idx=seed%CHALLENGES.length;
  return CHALLENGES[idx];
}
function renderWeeklyChallenges(){
  const challenge=getWeeklyChallenge();
  const home=document.getElementById('weeklyChallenge');
  const full=document.getElementById('weeklyChallengesFull');
  const completed=challenge.check();
  const html=`<div style="display:flex;align-items:center;gap:12px;"><div style="font-size:28px;">${completed?'✅':'🎯'}</div><div style="flex:1;"><div style="font-weight:700;font-size:13px;">${challenge.title}</div><div class="small">${challenge.desc}</div></div><div class="tag ${completed?'tag-green':'tag-accent'}">${completed?'DONE':'+'+challenge.reward+' XP'}</div></div>`;
  if(home)home.innerHTML=html;
  if(full){
    full.innerHTML=`<div style="margin-bottom:14px;">${html}</div><div class="divider"></div><h4 style="font-size:11px;color:var(--text-muted);margin-bottom:8px;">ALL CHALLENGES</h4>`;
    full.innerHTML+=CHALLENGES.map(c=>{
      const done=c.check();
      return`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);"><span>${done?'✅':'⬜'}</span><span style="flex:1;font-size:12px;">${c.title} — ${c.desc}</span><span class="tag ${done?'tag-green':'tag-purple'}" style="font-size:9px;">${done?'Done':'+'+c.reward}</span></div>`;
    }).join('');
  }
}

// ===== HEALTH SCORE =====
function calcHealthScore(){
  let score=0;const breakdown=[];
  const efPct=Math.min(100,(DATA.emergencyFund/1000)*100);
  const efScore=Math.round(efPct/5);score+=efScore;
  breakdown.push({name:'Emergency Fund',score:efScore,max:20,desc:`${efPct.toFixed(0)}% of $1K goal`});
  const investScore=DATA.investmentBal>0?Math.min(25,Math.round(DATA.investmentBal/200)):0;score+=investScore;
  breakdown.push({name:'Investing',score:investScore,max:25,desc:`$${DATA.investmentBal} invested`});
  const monthExp=DATA.expenses.filter(e=>mKey(e.date)===mKey(today())&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const monthInc=DATA.expenses.filter(e=>mKey(e.date)===mKey(today())&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const savRate=monthInc>0?Math.max(0,(monthInc-monthExp)/monthInc*100):50;
  const savScore=Math.min(20,Math.round(savRate/5));score+=savScore;
  breakdown.push({name:'Savings Rate',score:savScore,max:20,desc:`${savRate.toFixed(0)}% this month`});
  const nsThisMonth=DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length;
  const nsScore=Math.min(15,nsThisMonth*2);score+=nsScore;
  breakdown.push({name:'No-Spend Days',score:nsScore,max:15,desc:`${nsThisMonth} days this month`});
  const goalPct=DATA.goals.length?DATA.goals.reduce((s,g)=>s+Math.min(100,(g.saved/g.target)*100),0)/DATA.goals.length:0;
  const goalScore=Math.min(20,Math.round(goalPct/5));score+=goalScore;
  breakdown.push({name:'Goals Progress',score:goalScore,max:20,desc:`${goalPct.toFixed(0)}% average`});
  return{score:Math.min(100,score),breakdown};
}

function renderHealth(){
  const{score,breakdown}=calcHealthScore();
  document.getElementById('health-score').textContent=score;
  document.getElementById('healthPill').textContent=score+'/100';
  const ring=document.getElementById('health-ring');
  if(ring){
    const offset=314-(314*score/100);
    ring.style.strokeDashoffset=offset;
    ring.style.stroke=score>=70?'var(--green)':score>=40?'var(--yellow)':'var(--red)';
  }
  const bd=document.getElementById('health-breakdown');
  if(bd)bd.innerHTML=breakdown.map(b=>`<div style="margin-bottom:8px;"><div class="pbar-top"><span class="small bold">${b.name}</span><span class="small">${b.score}/${b.max}</span></div><div class="pbar" style="height:5px;"><div class="pbar-fill" style="width:${(b.score/b.max)*100}%;background:var(--accent);"></div></div><div class="small" style="color:var(--text-muted);">${b.desc}</div></div>`).join('');

  const ach=document.getElementById('achievements-list');
  const ha=document.getElementById('h-achievements');
  const achievements=[
    {name:'First Dollar Invested',desc:'Made your first investment',unlocked:DATA.investmentBal>0},
    {name:'Emergency Starter',desc:'$100+ in emergency fund',unlocked:DATA.emergencyFund>=100},
    {name:'Triple Digit Club',desc:'Net worth over $1,000',unlocked:DATA.assets.reduce((s,a)=>s+a.value,0)>=1000},
    {name:'Shift Machine',desc:'Logged 10+ shifts',unlocked:DATA.shifts.length>=10},
    {name:'Budget Boss',desc:'Tracked 20+ transactions',unlocked:DATA.expenses.length>=20},
    {name:'No-Spend Champion',desc:'5+ no-spend days in a month',unlocked:DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length>=5},
    {name:'Side Hustler',desc:'Earned from a side hustle',unlocked:(DATA.sideHustles||[]).length>0},
    {name:'Level Up',desc:'Reached Saver level (100 XP)',unlocked:(DATA.xp||0)>=100},
    {name:'Wealth Builder',desc:'Reached 1500 XP',unlocked:(DATA.xp||0)>=1500},
  ];
  const achHtml=achievements.map(a=>`<div class="achievement ${a.unlocked?'unlocked':''}"><div class="ach-icon">${a.unlocked?'🏆':'🔒'}</div><div class="ach-text"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div></div>`).join('');
  if(ach)ach.innerHTML=achHtml;
  if(ha)ha.innerHTML=achievements.filter(a=>a.unlocked).slice(0,3).map(a=>`<div class="achievement unlocked"><div class="ach-icon">🏆</div><div class="ach-text"><div class="ach-name">${a.name}</div></div></div>`).join('')||'<div class="small center">Keep going — achievements unlock as you build wealth!</div>';
}

// ===== CHARTS =====
let charts={};
function dc(id){if(charts[id]){charts[id].destroy();charts[id]=null;}}
const CL={green:'#22c55e',red:'#ef4444',blue:'#3b82f6',purple:'#a855f7',yellow:'#eab308',accent:'#6366f1',muted:'#5a6a7a',orange:'#f97316',cyan:'#06b6d4'};
const chartOpts=(o={})=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:DATA.theme==='light'?'#1a1f2e':'#eaf0f8',font:{size:10}}},...(o.plugins||{})},scales:{...(o.scales||{})}});
const axisStyle=()=>({ticks:{color:DATA.theme==='light'?'#8895a7':'#5a6a7a'},grid:{color:DATA.theme==='light'?'#e5e8ec':'#1e2a38'}});

function renderAllCharts(){
  renderHomeCharts();renderCompoundChart();renderInvGrowthChart();renderNWCharts();renderProjChart();renderCareerChart();
}

function renderHomeCharts(){
  const ctx1=document.getElementById('chart-home-spending');if(!ctx1)return;dc('homeSpend');
  const mo=mKey(today());const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense');
  const catT={};mExp.forEach(e=>{catT[e.category]=(catT[e.category]||0)+e.amount;});
  const cats=Object.keys(catT);
  const labelEl=document.getElementById('h-month-label');
  if(labelEl)labelEl.textContent=new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});
  if(!cats.length){charts['homeSpend']=new Chart(ctx1,{type:'doughnut',data:{labels:['No data'],datasets:[{data:[1],backgroundColor:['#1e2a38'],borderWidth:0}]},options:chartOpts()});return;}
  charts['homeSpend']=new Chart(ctx1,{type:'doughnut',data:{labels:cats.map(c=>(CATS[c]||CATS.other).l),datasets:[{data:cats.map(c=>catT[c]),backgroundColor:cats.map(c=>(CATS[c]||CATS.other).c),borderWidth:0}]},options:{...chartOpts(),cutout:'60%'}});

  const ctx2=document.getElementById('chart-home-alloc');if(!ctx2)return;dc('homeAlloc');
  charts['homeAlloc']=new Chart(ctx2,{type:'doughnut',data:{labels:DATA.holdings.map(h=>h.ticker),datasets:[{data:DATA.holdings.map(h=>h.alloc),backgroundColor:[CL.accent,CL.blue,CL.yellow,CL.green],borderWidth:0}]},options:{...chartOpts(),cutout:'65%'}});
}

function renderCompoundChart(){
  const ctx=document.getElementById('chart-compound');if(!ctx)return;dc('compound');
  const mo=+document.getElementById('ci-monthly')?.value||300;
  const start=+document.getElementById('ci-start')?.value||17;
  const end=+document.getElementById('ci-end')?.value||60;
  const ret=+document.getElementById('ci-return')?.value||10;
  const yrs=end-start;const p=compound(0,mo,ret,yrs);
  const labels=[],vals=[],contribs=[];
  const step=Math.max(1,Math.floor(yrs/20));
  for(let y=0;y<=yrs;y+=step){labels.push('Age '+(start+y));vals.push(p.hist[y*12]||0);contribs.push(mo*12*y);}
  charts['compound']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Portfolio',data:vals,borderColor:CL.green,backgroundColor:CL.green+'15',fill:true,tension:0.3,pointRadius:2},{label:'Contributed',data:contribs,borderColor:CL.muted,borderDash:[4,4],fill:false,tension:0,pointRadius:2}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderInvGrowthChart(){
  const ctx=document.getElementById('chart-inv-growth');if(!ctx)return;dc('invGrowth');
  const p10=compound(DATA.investmentBal,DATA.monthlyInvest,DATA.expectedReturn,10);
  const labels=[],vals=[],contribs=[];
  for(let y=0;y<=10;y++){labels.push('Yr '+y);vals.push(p10.hist[y*12]);contribs.push(DATA.investmentBal+DATA.monthlyInvest*12*y);}
  charts['invGrowth']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Portfolio',data:vals,borderColor:CL.accent,backgroundColor:CL.accent+'15',fill:true,tension:0.4,pointRadius:3},{label:'Contributions',data:contribs,borderColor:CL.muted,borderDash:[5,5],fill:false,tension:0,pointRadius:2}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderNWCharts(){
  const ctx1=document.getElementById('chart-nw-pie');if(!ctx1)return;dc('nwPie');
  charts['nwPie']=new Chart(ctx1,{type:'doughnut',data:{labels:DATA.assets.map(a=>a.name),datasets:[{data:DATA.assets.map(a=>a.value),backgroundColor:[CL.green,CL.yellow,CL.accent,CL.blue,CL.purple,CL.red],borderWidth:0}]},options:{...chartOpts(),cutout:'60%'}});
  const ctx2=document.getElementById('chart-nw-history');if(!ctx2)return;dc('nwHist');
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);
  const labels=[],vals=[];for(let m=0;m<=12;m++){labels.push(m===0?'Now':`+${m}mo`);vals.push(nw+DATA.monthlyInvest*m*1.008);}
  charts['nwHist']=new Chart(ctx2,{type:'line',data:{labels,datasets:[{label:'Net Worth',data:vals,borderColor:CL.green,backgroundColor:CL.green+'12',fill:true,tension:0.4,pointRadius:3}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderProjChart(){
  const ctx=document.getElementById('chart-proj');if(!ctx)return;dc('proj');
  const monthlyNet=DATA.wage*DATA.schoolHours*4.33*(1-totalTaxRate());
  let nw=DATA.assets.reduce((s,a)=>s+a.value,0);const labels=[],vals=[];
  for(let age=17;age<=25;age++){labels.push('Age '+age);vals.push(nw);nw+=monthlyNet*12*0.3+DATA.monthlyInvest*12*(1+DATA.expectedReturn/100);}
  charts['proj']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Projected Net Worth',data:vals,borderColor:CL.purple,backgroundColor:CL.purple+'12',fill:true,tension:0.4,pointRadius:4}]},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

function renderCareerChart(){
  const ctx=document.getElementById('chart-career');if(!ctx)return;dc('career');
  const careers=[
    {name:'Electrical Engineer',salaries:[55000,65000,80000,100000,120000,135000,150000]},
    {name:'HVAC Technician',salaries:[35000,45000,55000,65000,72000,78000,82000]},
    {name:'Software Developer',salaries:[70000,90000,115000,140000,160000,175000,190000]},
    {name:'Starbucks Manager',salaries:[32000,38000,45000,52000,58000,62000,65000]},
  ];
  const yearLabels=['Year 1','Year 5','Year 10','Year 15','Year 20','Year 30','Year 40'];
  const colors=[CL.accent,CL.orange,CL.green,CL.purple];
  charts['career']=new Chart(ctx,{type:'line',data:{labels:yearLabels,datasets:careers.map((c,i)=>({label:c.name,data:c.salaries,borderColor:colors[i],backgroundColor:colors[i]+'15',fill:false,tension:0.3,pointRadius:4}))},options:chartOpts({scales:{x:axisStyle(),y:{...axisStyle(),ticks:{...axisStyle().ticks,callback:v=>fK(v)}}}})});
}

// ===== SETTINGS =====
function saveSettings(){
  DATA.wage=+document.getElementById('set-wage').value||16.50;
  DATA.fedTax=+document.getElementById('set-fed').value||10;
  DATA.fica=+document.getElementById('set-fica').value||7.65;
  DATA.stateTax=+document.getElementById('set-state').value||0;
  DATA.expectedReturn=+document.getElementById('set-return').value||10;
  DATA.monthlyInvest=+document.getElementById('set-invest').value||300;
  save();renderAll();
}
function saveAutopilot(){
  DATA.autopilotRules={
    needs:+document.getElementById('set-needs').value||50,
    wants:+document.getElementById('set-wants').value||30,
    save:+document.getElementById('set-saveinvest').value||20,
  };
  save();
}
function savePin(){
  const pin=document.getElementById('set-pin').value;
  const enabled=document.getElementById('set-pin-enabled').value==='on';
  if(enabled&&pin.length!==4){alert('PIN must be exactly 4 digits');return;}
  DATA.pinCode=pin;DATA.pinEnabled=enabled;
  save();alert(enabled?'PIN lock enabled!':'PIN lock disabled.');
}
function exportData(){
  const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download='financeos_v6_backup_'+today()+'.json';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
function importData(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{try{DATA=JSON.parse(ev.target.result);save();renderAll();alert('Data imported!');}catch(err){alert('Invalid file.');}};
  reader.readAsText(file);
}
function resetData(){
  if(!confirm('Reset ALL data? This cannot be undone.'))return;
  DATA=D();save();renderAll();
}

// ===== BIND EVENTS =====
function bind(){
  document.getElementById('btn-add-shift')?.addEventListener('click',addShift);
  document.getElementById('btn-clear-shifts')?.addEventListener('click',()=>{if(confirm('Clear all shifts?')){DATA.shifts=[];save();renderStarbucks();}});
  document.getElementById('sh-date').value=today();
  document.getElementById('btn-add-exp')?.addEventListener('click',addExpense);
  document.getElementById('exp-date').value=today();
  document.getElementById('btn-add-bill')?.addEventListener('click',addBill);
  document.getElementById('btn-add-goal')?.addEventListener('click',addGoal);
  document.getElementById('btn-nospend')?.addEventListener('click',markNoSpend);
  document.getElementById('btn-add-tech')?.addEventListener('click',addTech);
  document.getElementById('btn-add-spec')?.addEventListener('click',addSpec);
  document.getElementById('btn-whatif')?.addEventListener('click',runWhatIf);
  document.getElementById('btn-bvs')?.addEventListener('click',runBvS);
  document.getElementById('btn-save-settings')?.addEventListener('click',saveSettings);
  document.getElementById('btn-export')?.addEventListener('click',exportData);
  document.getElementById('btn-import-trigger')?.addEventListener('click',()=>document.getElementById('btn-import').click());
  document.getElementById('btn-import')?.addEventListener('change',importData);
  document.getElementById('btn-reset')?.addEventListener('click',resetData);
  document.getElementById('btn-save-nw')?.addEventListener('click',()=>{
    document.querySelectorAll('.nw-inp').forEach(inp=>{DATA.assets[+inp.dataset.idx].value=+inp.value||0;});
    DATA.checking=DATA.assets[0].value;DATA.emergencyFund=DATA.assets[1].value;DATA.investmentBal=DATA.assets[2].value;
    save();renderAll();
  });
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click',toggleTheme);
  // Compound inputs
  ['ci-monthly','ci-start','ci-end','ci-return'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',renderCompound);
  });
  // Education inputs
  ['edu-sav-input','edu-fafsa-input','edu-bright-input','edu-scholar-input'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',()=>{
      DATA.eduSavings=+document.getElementById('edu-sav-input').value||0;
      DATA.eduFafsa=+document.getElementById('edu-fafsa-input').value||0;
      DATA.eduBright=+document.getElementById('edu-bright-input').value||0;
      DATA.eduScholar=+document.getElementById('edu-scholar-input').value||0;
      save();renderEducation();
    });
  });
  // V6 new bindings
  document.getElementById('btn-add-waste')?.addEventListener('click',addWaste);
  document.getElementById('btn-add-future')?.addEventListener('click',addFutureMessage);
  document.getElementById('btn-add-hustle')?.addEventListener('click',addHustle);
  document.getElementById('sh-hustle-date').value=today();
  document.getElementById('btn-inflation')?.addEventListener('click',calcInflation);
  document.getElementById('btn-calc-tax')?.addEventListener('click',calcTax);
  document.getElementById('btn-calc-credit')?.addEventListener('click',calcCredit);
  document.getElementById('btn-refresh-stocks')?.addEventListener('click',refreshStocks);
  document.getElementById('btn-add-stock')?.addEventListener('click',addStockTicker);
  document.getElementById('btn-calc-moveout')?.addEventListener('click',calcMoveOut);
  document.getElementById('btn-calc-car')?.addEventListener('click',calcCar);
  document.getElementById('btn-add-trip')?.addEventListener('click',addTrip);
  document.getElementById('btn-raise')?.addEventListener('click',calcRaise);
  document.getElementById('cal-prev')?.addEventListener('click',calPrev);
  document.getElementById('cal-next')?.addEventListener('click',calNext);
  document.getElementById('btn-export-report')?.addEventListener('click',exportReport);
  document.getElementById('btn-save-autopilot')?.addEventListener('click',saveAutopilot);
  document.getElementById('btn-save-pin')?.addEventListener('click',savePin);
}

// ===== RENDER ALL =====
function renderAll(){
  renderHeader();renderQuote();renderStarbucks();renderBudget();renderBills();
  renderGoals();renderTech();renderInvestments();renderSpec();renderCompound();
  renderEducation();renderNetWorth();renderTimeline();renderProjections();renderHealth();
  renderAIAlerts();renderBillReminders();renderWaste();renderCalendar();
  renderWeeklyPlanner();renderMonthlyReport();renderCareer();renderHustles();
  renderXP();renderStocks();renderTrips();renderCreditTips();renderCreditCards();
  if(typeof Chart!=='undefined')renderAllCharts();
}

// ===== INIT =====
function init(){
  load();initTheme();checkPin();initNav();bind();renderAll();
  // Populate settings inputs
  document.getElementById('set-wage').value=DATA.wage;
  document.getElementById('set-fed').value=DATA.fedTax;
  document.getElementById('set-fica').value=DATA.fica;
  document.getElementById('set-state').value=DATA.stateTax;
  document.getElementById('set-return').value=DATA.expectedReturn;
  document.getElementById('set-invest').value=DATA.monthlyInvest;
  if(DATA.autopilotRules){
    document.getElementById('set-needs').value=DATA.autopilotRules.needs||50;
    document.getElementById('set-wants').value=DATA.autopilotRules.wants||30;
    document.getElementById('set-saveinvest').value=DATA.autopilotRules.save||20;
  }
  if(DATA.pinEnabled)document.getElementById('set-pin-enabled').value='on';
  if(DATA.pinCode)document.getElementById('set-pin').value=DATA.pinCode;
  // Next payday estimate
  const now=new Date();const nextFri=new Date(now);
  nextFri.setDate(now.getDate()+(12-now.getDay())%7+7);
  document.getElementById('h-nextpay').textContent=nextFri.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

document.addEventListener('DOMContentLoaded',init);
