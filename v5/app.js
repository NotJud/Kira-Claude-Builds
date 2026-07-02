/* ============================================================
 * FinanceOS V5 — Personal Financial Operating System
 * From age 17 onward. Everything you need in one dashboard.
 * ============================================================ */
const STORE='financeOS_v5';
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
    {date:'2026-08-11',title:'Senior Year Begins',desc:'First day of school',status:'future'},
    {date:'2026-10-01',title:'FAFSA Opens',desc:'File FAFSA ASAP — opens Oct 1',status:'future'},
    {date:'2026-10-15',title:'SAT Date',desc:'SAT test',status:'future'},
    {date:'2026-11-01',title:'College Apps Due',desc:'Early action deadlines',status:'future'},
    {date:'2026-11-26',title:'Senior Pictures Done',desc:'All portraits must be completed by this date',status:'future'},
    {date:'2027-03-01',title:'Spring Break',desc:'Possible trip or extra shifts',status:'future'},
    {date:'2027-05-20',title:'Graduation',desc:'Walk the stage!',status:'future'},
    {date:'2027-06-01',title:'Summer Grind',desc:'Full-time hours begin',status:'future'},
  ],
  eduSavings:0,eduFafsa:0,eduBright:0,eduScholar:0,
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

// ===== HEADER =====
function renderHeader(){
  const h=new Date().getHours();
  document.getElementById('greeting').textContent=h<12?'Good morning ☀️':h<17?'Good afternoon':' Good evening 🌙';
  document.getElementById('dateDisplay').textContent=new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);
  document.getElementById('nwPill').textContent=fK(nw);
  document.getElementById('healthPill').textContent=calcHealthScore().score+'/100';
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
  save();renderStarbucks();
}

function renderStarbucks(){
  // Period stats (14 days)
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

  // Planner table
  const planTbody=document.querySelector('#sb-planner-table tbody');
  if(planTbody){
    [15,17.5,20,25,30].forEach(h=>{
      const monthlyGross=DATA.wage*h*4.33;
      const monthlyNet=monthlyGross*(1-totalTaxRate());
      const yearlyNet=monthlyNet*11;
      const investLeft=Math.max(0,monthlyNet-DATA.monthlyInvest);
    });
    planTbody.innerHTML=[15,17.5,20,25,30].map(h=>{
      const mG=DATA.wage*h*4.33;const mN=mG*(1-totalTaxRate());const yN=mN*11;
      return`<tr><td>${h}</td><td>${fmt(mN)}</td><td>${fmt(yN)}</td><td>${fmt(Math.min(DATA.monthlyInvest,mN))}</td></tr>`;
    }).join('');
  }

  // Year projection
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

  // Shift log
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
  save();renderBudget();
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

  // Insights
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
  document.getElementById('goal-name').value='';document.getElementById('goal-target').value='';
  save();renderGoals();
}

function delGoal(id){DATA.goals=DATA.goals.filter(g=>g.id!==id);save();renderGoals();}
function updateGoalSaved(id,val){const g=DATA.goals.find(x=>x.id===id);if(g){g.saved=+val||0;save();renderGoals();}}
function editGoal(id){
  const g=DATA.goals.find(x=>x.id===id);if(!g)return;
  const newName=prompt('Goal name:',g.name);if(newName===null)return;
  const newTarget=prompt('Target amount ($):',g.target);if(newTarget===null)return;
  const newIcon=prompt('Icon emoji:',g.icon);if(newIcon===null)return;
  g.name=newName||g.name;g.target=+newTarget||g.target;g.icon=newIcon||g.icon;
  save();renderGoals();
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
          <button class="btn btn-sm btn-g" onclick="editGoal('${g.id}')">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="if(confirm('Delete this goal?'))delGoal('${g.id}')">×</button>
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
  // Stats
  const totalPct=DATA.goals.length?DATA.goals.reduce((s,g)=>s+Math.min(100,(g.saved/g.target)*100),0)/DATA.goals.length:0;
  const hp=document.getElementById('h-goals-progress');if(hp)hp.textContent=totalPct.toFixed(0)+'%';

  // Streaks
  const streak=DATA.nospendDays.length;
  document.getElementById('streak-count').textContent=streak;
  document.getElementById('h-streak').textContent=streak+' days';
  const thisMonthNS=DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length;
  document.getElementById('nospend-count').textContent=thisMonthNS;
  document.getElementById('challenge-saved').textContent=fK(thisMonthNS*15); // ~$15/day saved
}
function markNoSpend(){
  const t=today();
  if(!DATA.nospendDays.includes(t)){DATA.nospendDays.push(t);save();renderGoals();}
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

  // Milestones table
  const tb=document.querySelector('#ci-milestones tbody');
  if(tb){
    const ages=[18,20,22,25,30,35,40,45,50,55,60];
    tb.innerHTML=ages.filter(a=>a<=end).map(a=>{
      const y=a-start;if(y<0)return'';
      const pp=compound(0,mo,ret,y);
      return`<tr><td class="bold">${a}</td><td class="c-green">${fK(pp.final)}</td><td>${fK(pp.contrib)}</td><td class="c-purple">+${fK(pp.gains)}</td></tr>`;
    }).join('');
  }

  // Cost of waiting comparison
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

  // Editable inputs
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

// ===== BUY VS SAVE =====
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


// ===== HEALTH SCORE =====
function calcHealthScore(){
  let score=0;const breakdown=[];
  // Emergency fund (0-20)
  const efPct=Math.min(100,(DATA.emergencyFund/1000)*100);
  const efScore=Math.round(efPct/5);score+=efScore;
  breakdown.push({name:'Emergency Fund',score:efScore,max:20,desc:`${efPct.toFixed(0)}% of $1K goal`});
  // Investing consistency (0-25)
  const investScore=DATA.investmentBal>0?Math.min(25,Math.round(DATA.investmentBal/200)):0;score+=investScore;
  breakdown.push({name:'Investing',score:investScore,max:25,desc:`$${DATA.investmentBal} invested`});
  // Savings rate (0-20)
  const monthExp=DATA.expenses.filter(e=>mKey(e.date)===mKey(today())&&e.type==='expense').reduce((s,e)=>s+e.amount,0);
  const monthInc=DATA.expenses.filter(e=>mKey(e.date)===mKey(today())&&e.type==='income').reduce((s,e)=>s+e.amount,0);
  const savRate=monthInc>0?Math.max(0,(monthInc-monthExp)/monthInc*100):50;
  const savScore=Math.min(20,Math.round(savRate/5));score+=savScore;
  breakdown.push({name:'Savings Rate',score:savScore,max:20,desc:`${savRate.toFixed(0)}% this month`});
  // No-spend discipline (0-15)
  const nsThisMonth=DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length;
  const nsScore=Math.min(15,nsThisMonth*2);score+=nsScore;
  breakdown.push({name:'No-Spend Days',score:nsScore,max:15,desc:`${nsThisMonth} days this month`});
  // Goals progress (0-20)
  const goalPct=DATA.goals.length?DATA.goals.reduce((s,g)=>s+Math.min(100,(g.saved/g.target)*100),0)/DATA.goals.length:0;
  const goalScore=Math.min(20,Math.round(goalPct/5));score+=goalScore;
  breakdown.push({name:'Goals Progress',score:goalScore,max:20,desc:`${goalPct.toFixed(0)}% average`});

  return{score:Math.min(100,score),breakdown};
}

function renderHealth(){
  const{score,breakdown}=calcHealthScore();
  document.getElementById('health-score').textContent=score;
  document.getElementById('healthPill').textContent=score+'/100';
  // Ring animation
  const ring=document.getElementById('health-ring');
  if(ring){
    const offset=314-(314*score/100);
    ring.style.strokeDashoffset=offset;
    ring.style.stroke=score>=70?'var(--green)':score>=40?'var(--yellow)':'var(--red)';
  }
  // Breakdown
  const bd=document.getElementById('health-breakdown');
  if(bd)bd.innerHTML=breakdown.map(b=>`<div style="margin-bottom:8px;"><div class="pbar-top"><span class="small bold">${b.name}</span><span class="small">${b.score}/${b.max}</span></div><div class="pbar" style="height:5px;"><div class="pbar-fill" style="width:${(b.score/b.max)*100}%;background:var(--accent);"></div></div><div class="small" style="color:var(--text-muted);">${b.desc}</div></div>`).join('');

  // Achievements
  const ach=document.getElementById('achievements-list');
  const ha=document.getElementById('h-achievements');
  const achievements=[
    {name:'First Dollar Invested',desc:'Made your first investment',unlocked:DATA.investmentBal>0},
    {name:'Emergency Starter',desc:'$100+ in emergency fund',unlocked:DATA.emergencyFund>=100},
    {name:'Triple Digit Club',desc:'Net worth over $1,000',unlocked:DATA.assets.reduce((s,a)=>s+a.value,0)>=1000},
    {name:'Shift Machine',desc:'Logged 10+ shifts',unlocked:DATA.shifts.length>=10},
    {name:'Budget Boss',desc:'Tracked 20+ transactions',unlocked:DATA.expenses.length>=20},
    {name:'No-Spend Champion',desc:'5+ no-spend days in a month',unlocked:DATA.nospendDays.filter(d=>mKey(d)===mKey(today())).length>=5},
  ];
  const achHtml=achievements.map(a=>`<div class="achievement ${a.unlocked?'unlocked':''}"><div class="ach-icon">${a.unlocked?'🏆':'🔒'}</div><div class="ach-text"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div></div>`).join('');
  if(ach)ach.innerHTML=achHtml;
  if(ha)ha.innerHTML=achievements.filter(a=>a.unlocked).slice(0,3).map(a=>`<div class="achievement unlocked"><div class="ach-icon">🏆</div><div class="ach-text"><div class="ach-name">${a.name}</div></div></div>`).join('')||'<div class="small center">Keep going — achievements unlock as you build wealth!</div>';
}


// ===== CHARTS =====
let charts={};
function dc(id){if(charts[id]){charts[id].destroy();charts[id]=null;}}
const CL={green:'#22c55e',red:'#ef4444',blue:'#3b82f6',purple:'#a855f7',yellow:'#eab308',accent:'#6366f1',muted:'#5a6a7a',orange:'#f97316',cyan:'#06b6d4'};
const chartOpts=(o={})=>({responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#eaf0f8',font:{size:10}}},...(o.plugins||{})},scales:{...(o.scales||{})}});
const axisStyle={ticks:{color:'#5a6a7a'},grid:{color:'#1e2a38'}};

function renderAllCharts(){
  renderHomeCharts();renderCompoundChart();renderInvGrowthChart();renderNWCharts();renderProjChart();
}

function renderHomeCharts(){
  // Spending pie
  const ctx1=document.getElementById('chart-home-spending');if(!ctx1)return;dc('homeSpend');
  const mo=mKey(today());const mExp=DATA.expenses.filter(e=>mKey(e.date)===mo&&e.type==='expense');
  const catT={};mExp.forEach(e=>{catT[e.category]=(catT[e.category]||0)+e.amount;});
  const cats=Object.keys(catT);
  document.getElementById('h-month-label').textContent=new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'});
  if(!cats.length){charts['homeSpend']=new Chart(ctx1,{type:'doughnut',data:{labels:['No data'],datasets:[{data:[1],backgroundColor:['#1e2a38'],borderWidth:0}]},options:chartOpts()});return;}
  charts['homeSpend']=new Chart(ctx1,{type:'doughnut',data:{labels:cats.map(c=>(CATS[c]||CATS.other).l),datasets:[{data:cats.map(c=>catT[c]),backgroundColor:cats.map(c=>(CATS[c]||CATS.other).c),borderWidth:0}]},options:{...chartOpts(),cutout:'60%'}});

  // Allocation pie
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
  charts['compound']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Portfolio',data:vals,borderColor:CL.green,backgroundColor:CL.green+'15',fill:true,tension:0.3,pointRadius:2},{label:'Contributed',data:contribs,borderColor:CL.muted,borderDash:[4,4],fill:false,tension:0,pointRadius:2}]},options:chartOpts({scales:{x:axisStyle,y:{...axisStyle,ticks:{...axisStyle.ticks,callback:v=>fK(v)}}}})});
}

function renderInvGrowthChart(){
  const ctx=document.getElementById('chart-inv-growth');if(!ctx)return;dc('invGrowth');
  const p10=compound(DATA.investmentBal,DATA.monthlyInvest,DATA.expectedReturn,10);
  const labels=[],vals=[],contribs=[];
  for(let y=0;y<=10;y++){labels.push('Yr '+y);vals.push(p10.hist[y*12]);contribs.push(DATA.investmentBal+DATA.monthlyInvest*12*y);}
  charts['invGrowth']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Portfolio',data:vals,borderColor:CL.accent,backgroundColor:CL.accent+'15',fill:true,tension:0.4,pointRadius:3},{label:'Contributions',data:contribs,borderColor:CL.muted,borderDash:[5,5],fill:false,tension:0,pointRadius:2}]},options:chartOpts({scales:{x:axisStyle,y:{...axisStyle,ticks:{...axisStyle.ticks,callback:v=>fK(v)}}}})});
}

function renderNWCharts(){
  const ctx1=document.getElementById('chart-nw-pie');if(!ctx1)return;dc('nwPie');
  charts['nwPie']=new Chart(ctx1,{type:'doughnut',data:{labels:DATA.assets.map(a=>a.name),datasets:[{data:DATA.assets.map(a=>a.value),backgroundColor:[CL.green,CL.yellow,CL.accent,CL.blue,CL.purple,CL.red],borderWidth:0}]},options:{...chartOpts(),cutout:'60%'}});
  const ctx2=document.getElementById('chart-nw-history');if(!ctx2)return;dc('nwHist');
  const nw=DATA.assets.reduce((s,a)=>s+a.value,0);
  const labels=[],vals=[];for(let m=0;m<=12;m++){labels.push(m===0?'Now':`+${m}mo`);vals.push(nw+DATA.monthlyInvest*m*1.008);}
  charts['nwHist']=new Chart(ctx2,{type:'line',data:{labels,datasets:[{label:'Net Worth',data:vals,borderColor:CL.green,backgroundColor:CL.green+'12',fill:true,tension:0.4,pointRadius:3}]},options:chartOpts({scales:{x:axisStyle,y:{...axisStyle,ticks:{...axisStyle.ticks,callback:v=>fK(v)}}}})});
}

function renderProjChart(){
  const ctx=document.getElementById('chart-proj');if(!ctx)return;dc('proj');
  const monthlyNet=DATA.wage*DATA.schoolHours*4.33*(1-totalTaxRate());
  let nw=DATA.assets.reduce((s,a)=>s+a.value,0);const labels=[],vals=[];
  for(let age=17;age<=25;age++){labels.push('Age '+age);vals.push(nw);nw+=monthlyNet*12*0.3+DATA.monthlyInvest*12*(1+DATA.expectedReturn/100);}
  charts['proj']=new Chart(ctx,{type:'line',data:{labels,datasets:[{label:'Projected Net Worth',data:vals,borderColor:CL.purple,backgroundColor:CL.purple+'12',fill:true,tension:0.4,pointRadius:4}]},options:chartOpts({scales:{x:axisStyle,y:{...axisStyle,ticks:{...axisStyle.ticks,callback:v=>fK(v)}}}})});
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
function exportData(){
  const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download='financeos_backup_'+today()+'.json';
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
}

// ===== RENDER ALL =====
function renderAll(){
  renderHeader();renderQuote();renderStarbucks();renderBudget();renderBills();
  renderGoals();renderTech();renderInvestments();renderSpec();renderCompound();
  renderEducation();renderNetWorth();renderTimeline();renderProjections();renderHealth();
  if(typeof Chart!=='undefined')renderAllCharts();
}

// ===== INIT =====
function init(){
  load();initNav();bind();renderAll();
  // Populate settings inputs
  document.getElementById('set-wage').value=DATA.wage;
  document.getElementById('set-fed').value=DATA.fedTax;
  document.getElementById('set-fica').value=DATA.fica;
  document.getElementById('set-state').value=DATA.stateTax;
  document.getElementById('set-return').value=DATA.expectedReturn;
  document.getElementById('set-invest').value=DATA.monthlyInvest;
  // Next payday estimate
  const now=new Date();const nextFri=new Date(now);
  nextFri.setDate(now.getDate()+(12-now.getDay())%7+7);
  document.getElementById('h-nextpay').textContent=nextFri.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

document.addEventListener('DOMContentLoaded',init);
