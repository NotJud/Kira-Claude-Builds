/* ============================================================
 * FinanceOS V4 — Senior Year Personal Finance Operating System
 * ============================================================ */

const STORE_KEY = 'financeOS_v4';

// ===== DATA MODEL =====
const DEFAULT_DATA = {
  wage: 16.50,
  hoursPerWeek: 17.5,
  fedTax: 10,
  stateTax: 0,
  fica: 7.65,
  payFrequency: 'biweekly',
  schoolHours: 17.5,
  summerHours: 30,

  shifts: [],  // { id, date, start, end, breakMin, type, tips, hours, gross }
  expenses: [], // { id, date, type, category, amount, note }

  goals: [
    { name: 'Surface Laptop 4', target: 300, saved: 0, color: '#6366f1', icon: '💻' },
    { name: 'iPad Air 5', target: 247, saved: 0, color: '#3b82f6', icon: '📱' },
    { name: 'Emergency Fund', target: 500, saved: 0, color: '#eab308', icon: '🛡️' },
  ],

  holdings: [
    { ticker: 'VOO', name: 'S&P 500 ETF', allocation: 50, type: 'Index', divYield: 1.3 },
    { ticker: 'QQQM', name: 'Nasdaq 100 ETF', allocation: 30, type: 'Growth', divYield: 0.5 },
    { ticker: 'TTWO', name: 'Take-Two', allocation: 10, type: 'Stock', divYield: 0 },
    { ticker: 'Nuclear', name: 'Nuclear ETF', allocation: 10, type: 'Thematic', divYield: 0.8 },
  ],
  investmentBalance: 0,
  monthlyInvestment: 300,
  expectedReturn: 10,

  collegeFund: { goal: 2000, monthly: 100, current: 0 },

  paycheck1: { total: 798.09, items: [
    { name: 'Surface Laptop', amount: 300, color: '#6366f1' },
    { name: 'Investing', amount: 200, color: '#22c55e' },
    { name: 'Emergency Savings', amount: 150, color: '#eab308' },
    { name: 'Fun', amount: 148.09, color: '#a855f7' },
  ]},
  paycheck2: { total: 750, items: [
    { name: 'iPad Air', amount: 247, color: '#3b82f6' },
    { name: 'Investing', amount: 200, color: '#22c55e' },
    { name: 'Emergency Savings', amount: 150, color: '#eab308' },
    { name: 'Fun', amount: 153, color: '#a855f7' },
  ]},

  assets: [
    { name: 'Checking', value: 0 },
    { name: 'Emergency Fund', value: 0 },
    { name: 'Investments', value: 0 },
    { name: 'Surface Laptop', value: 300 },
    { name: 'iPad', value: 247 },
    { name: 'Other', value: 0 },
  ],

  decisions: [], // { id, date, item, price, happiness, need, wait, decision, investedValue }
};

let DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));


// ===== PERSISTENCE =====
function save() { localStorage.setItem(STORE_KEY, JSON.stringify(DATA)); }
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s) DATA = { ...JSON.parse(JSON.stringify(DEFAULT_DATA)), ...s };
  } catch(e) {}
}

// ===== UTILS =====
function fmt(n) { return '$' + Number(n||0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtK(n) { if (n >= 1e6) return '$'+(n/1e6).toFixed(1)+'M'; if (n >= 1e3) return '$'+(n/1e3).toFixed(1)+'K'; return '$'+n.toFixed(0); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function today() { return new Date().toISOString().split('T')[0]; }
function monthKey(d) { return d.slice(0,7); } // YYYY-MM

// ===== NAVIGATION =====
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchSection(btn.dataset.section));
  });
}
function switchSection(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.section === name));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'sec-' + name));
}

// ===== HEADER =====
function updateHeader() {
  const now = new Date();
  const h = now.getHours();
  let greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = greet;
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
  const nw = DATA.assets.reduce((s,a) => s + a.value, 0);
  document.getElementById('netWorthBadge').textContent = fmtK(nw);
  document.getElementById('netWorthPill').style.borderColor = nw > 0 ? 'var(--green)' : 'var(--border)';
}


// ===== SHIFT TRACKER =====
function calcShiftHours(start, end, breakMin) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let totalMin = (eh * 60 + em) - (sh * 60 + sm);
  if (totalMin < 0) totalMin += 24 * 60; // overnight
  return Math.max(0, (totalMin - breakMin) / 60);
}

function getPayMultiplier(type) {
  if (type === 'overtime') return 1.5;
  if (type === 'holiday') return 2.0;
  return 1.0;
}

function addShift() {
  const date = document.getElementById('shift-date').value || today();
  const type = document.getElementById('shift-type').value;
  const start = document.getElementById('shift-start').value;
  const end = document.getElementById('shift-end').value;
  const breakMin = parseFloat(document.getElementById('shift-break').value) || 0;
  const tips = parseFloat(document.getElementById('shift-tips').value) || 0;
  const hours = calcShiftHours(start, end, breakMin);
  const mult = getPayMultiplier(type);
  const gross = hours * DATA.wage * mult;

  DATA.shifts.push({ id: uid(), date, start, end, breakMin, type, tips, hours, gross });
  DATA.shifts.sort((a,b) => b.date.localeCompare(a.date));
  save();
  renderShifts();
}

function deleteShift(id) {
  DATA.shifts = DATA.shifts.filter(s => s.id !== id);
  save();
  renderShifts();
}

function renderShifts() {
  // Pay period stats (last 14 days)
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 14);
  const periodShifts = DATA.shifts.filter(s => new Date(s.date) >= cutoff);
  const totalHrs = periodShifts.reduce((s,sh) => s + sh.hours, 0);
  const otHrs = periodShifts.filter(s => s.type === 'overtime').reduce((s,sh) => s + sh.hours, 0);
  const estGross = periodShifts.reduce((s,sh) => s + sh.gross + sh.tips, 0);

  document.getElementById('sh-this-period').textContent = totalHrs.toFixed(1) + ' hrs';
  document.getElementById('sh-overtime').textContent = otHrs.toFixed(1) + ' hrs';
  document.getElementById('sh-est-gross').textContent = fmt(estGross);

  // This week for overview
  const weekCutoff = new Date(); weekCutoff.setDate(weekCutoff.getDate() - 7);
  const weekHrs = DATA.shifts.filter(s => new Date(s.date) >= weekCutoff).reduce((s,sh) => s + sh.hours, 0);
  const el = document.getElementById('ov-hours-week');
  if (el) el.textContent = weekHrs.toFixed(1) + ' hrs';

  // Pay summary
  const totalTaxRate = (DATA.fedTax + DATA.stateTax + DATA.fica) / 100;
  const net = estGross * (1 - totalTaxRate);
  const paySum = document.getElementById('shift-pay-summary');
  if (paySum) {
    paySum.innerHTML = `
      <div class="grid grid-3">
        <div class="mini-stat"><div class="mini-val green">${fmt(estGross)}</div><div class="mini-label">Gross (14d)</div></div>
        <div class="mini-stat"><div class="mini-val red">-${fmt(estGross * totalTaxRate)}</div><div class="mini-label">Est. Taxes</div></div>
        <div class="mini-stat"><div class="mini-val accent">${fmt(net)}</div><div class="mini-label">Est. Net</div></div>
      </div>
      <div class="small-text" style="margin-top:8px;">Total hours this period: <b>${totalHrs.toFixed(1)}</b> · Avg/week: <b>${(totalHrs/2).toFixed(1)}</b> · OT hours: <b>${otHrs.toFixed(1)}</b></div>
    `;
  }

  // Pay period info
  const ppInfo = document.getElementById('pay-period-info');
  if (ppInfo) {
    const weeksToPayday = 2 - (Math.floor((Date.now() / (7*24*60*60*1000)) % 2));
    ppInfo.innerHTML = `<div class="small-text">~${weeksToPayday} week(s) to next payday (estimated) · OT > 40 hrs/week = 1.5x · Holidays = 2x</div>`;
  }

  // Table
  const tbody = document.querySelector('#shift-table tbody');
  if (!tbody) return;
  if (DATA.shifts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">No shifts logged yet. Add your first shift above!</td></tr>';
    return;
  }
  tbody.innerHTML = DATA.shifts.slice(0, 50).map(s => {
    const typeTag = s.type === 'regular' ? '' : s.type === 'overtime' ? '<span class="tag tag-yellow">OT</span>' : s.type === 'holiday' ? '<span class="tag tag-purple">HOL</span>' : '<span class="tag tag-blue">TRN</span>';
    return `<tr>
      <td>${s.date}</td>
      <td>${s.start} - ${s.end}</td>
      <td>${s.hours.toFixed(1)}</td>
      <td>${typeTag || '<span class="tag tag-accent">REG</span>'}</td>
      <td>${fmt(DATA.wage * getPayMultiplier(s.type))}/hr</td>
      <td style="color:var(--green);">${fmt(s.gross)}</td>
      <td>${s.tips > 0 ? fmt(s.tips) : '—'}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="deleteShift('${s.id}')">×</button></td>
    </tr>`;
  }).join('');
}


// ===== PAYCHECK CALCULATOR =====
function calcPaycheck() {
  const wage = parseFloat(document.getElementById('pc-wage')?.value) || DATA.wage;
  const hours = parseFloat(document.getElementById('pc-hours')?.value) || DATA.hoursPerWeek;
  const fed = parseFloat(document.getElementById('pc-fed-tax')?.value) ?? DATA.fedTax;
  const state = parseFloat(document.getElementById('pc-state-tax')?.value) ?? DATA.stateTax;
  const fica = parseFloat(document.getElementById('pc-fica')?.value) ?? DATA.fica;
  const freq = document.getElementById('pc-freq')?.value || DATA.payFrequency;

  DATA.wage = wage; DATA.hoursPerWeek = hours; DATA.fedTax = fed; DATA.stateTax = state; DATA.fica = fica; DATA.payFrequency = freq;

  let weeks = 2;
  if (freq === 'weekly') weeks = 1;
  if (freq === 'monthly') weeks = 4.33;

  const gross = wage * hours * weeks;
  const fedAmt = gross * (fed / 100);
  const stateAmt = gross * (state / 100);
  const ficaAmt = gross * (fica / 100);
  const totalTax = fedAmt + stateAmt + ficaAmt;
  const net = gross - totalTax;

  document.getElementById('pc-gross').textContent = fmt(gross);
  document.getElementById('pc-taxes').textContent = '-' + fmt(totalTax);
  document.getElementById('pc-net').textContent = fmt(net);

  calcAnnualProjection();
  save();
}

function calcAnnualProjection() {
  const wage = DATA.wage;
  const schoolHrs = parseFloat(document.getElementById('pc-school-hours')?.value) || DATA.schoolHours;
  const summerHrs = parseFloat(document.getElementById('pc-summer-hours')?.value) || DATA.summerHours;
  DATA.schoolHours = schoolHrs; DATA.summerHours = summerHrs;

  const totalTaxRate = (DATA.fedTax + DATA.stateTax + DATA.fica) / 100;

  const monthData = [
    { m: 'Jul 2026', hrs: summerHrs, wks: 4.33, summer: true },
    { m: 'Aug 2026', hrs: summerHrs, wks: 4.33, summer: true },
    { m: 'Sep 2026', hrs: schoolHrs, wks: 4.33, summer: false },
    { m: 'Oct 2026', hrs: schoolHrs, wks: 4.33, summer: false },
    { m: 'Nov 2026', hrs: schoolHrs, wks: 4, summer: false },
    { m: 'Dec 2026', hrs: schoolHrs, wks: 3.5, summer: false },
    { m: 'Jan 2027', hrs: schoolHrs, wks: 4.33, summer: false },
    { m: 'Feb 2027', hrs: schoolHrs, wks: 4, summer: false },
    { m: 'Mar 2027', hrs: schoolHrs, wks: 4.33, summer: false },
    { m: 'Apr 2027', hrs: schoolHrs, wks: 4.33, summer: false },
    { m: 'May 2027', hrs: schoolHrs, wks: 4.33, summer: false },
  ];

  let cum = 0, totalGross = 0, totalNet = 0;
  const tbody = document.querySelector('#pc-year-table tbody');
  if (tbody) {
    tbody.innerHTML = monthData.map(r => {
      const gross = wage * r.hrs * r.wks;
      const fedT = gross * (DATA.fedTax / 100);
      const ficaT = gross * (DATA.fica / 100);
      const net = gross - fedT - ficaT - (gross * DATA.stateTax / 100);
      cum += net; totalGross += gross; totalNet += net;
      return `<tr>
        <td style="color:${r.summer ? 'var(--yellow)' : 'var(--text)'};">${r.m} ${r.summer ? '☀️' : '📚'}</td>
        <td>${r.hrs}</td><td>${r.wks}</td>
        <td>${fmt(gross)}</td><td style="color:var(--red);">-${fmt(fedT)}</td><td style="color:var(--red);">-${fmt(ficaT)}</td>
        <td style="color:var(--green);">${fmt(net)}</td><td style="color:var(--accent);font-weight:700;">${fmt(cum)}</td>
      </tr>`;
    }).join('');
  }

  const sumEl = document.getElementById('pc-annual-summary');
  if (sumEl) {
    const monthlyAvg = totalNet / 11;
    sumEl.innerHTML = `
      <div class="grid grid-2">
        <div class="mini-stat"><div class="mini-val green">${fmt(totalGross)}</div><div class="mini-label">Annual Gross</div></div>
        <div class="mini-stat"><div class="mini-val accent">${fmt(totalNet)}</div><div class="mini-label">Annual Net</div></div>
        <div class="mini-stat"><div class="mini-val blue">${fmt(monthlyAvg)}</div><div class="mini-label">Avg Monthly Net</div></div>
        <div class="mini-stat"><div class="mini-val purple">${fmt(totalGross - totalNet)}</div><div class="mini-label">Total Taxes</div></div>
      </div>
    `;
  }
  // Update overview
  const ovIncome = document.getElementById('ov-monthly-income');
  if (ovIncome) ovIncome.textContent = fmt(DATA.wage * DATA.hoursPerWeek * 4.33 * (1 - (DATA.fedTax + DATA.stateTax + DATA.fica) / 100));
}


// ===== BUDGET / EXPENSES =====
const CATEGORIES = {
  food: { icon: '🍔', label: 'Food & Drinks', color: '#ef4444' },
  gas: { icon: '⛽', label: 'Gas & Transport', color: '#f59e0b' },
  clothes: { icon: '👕', label: 'Clothes', color: '#a855f7' },
  games: { icon: '🎮', label: 'Games & Ent.', color: '#6366f1' },
  subscriptions: { icon: '📱', label: 'Subscriptions', color: '#3b82f6' },
  school: { icon: '📚', label: 'School', color: '#0ea5e9' },
  phone: { icon: '📞', label: 'Phone Bill', color: '#14b8a6' },
  personal: { icon: '✨', label: 'Personal Care', color: '#ec4899' },
  gifts: { icon: '🎁', label: 'Gifts', color: '#f97316' },
  savings: { icon: '💰', label: 'Savings', color: '#22c55e' },
  investing: { icon: '📈', label: 'Investing', color: '#10b981' },
  other: { icon: '📦', label: 'Other', color: '#6b7280' },
};

function addExpense() {
  const date = document.getElementById('exp-date').value || today();
  const type = document.getElementById('exp-type').value;
  const category = document.getElementById('exp-category').value;
  const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
  const note = document.getElementById('exp-note').value.trim();
  if (amount <= 0) return;

  DATA.expenses.push({ id: uid(), date, type, category, amount, note });
  DATA.expenses.sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById('exp-amount').value = '';
  document.getElementById('exp-note').value = '';
  save();
  renderBudget();
}

function deleteExpense(id) {
  DATA.expenses = DATA.expenses.filter(e => e.id !== id);
  save();
  renderBudget();
}

function renderBudget() {
  const now = new Date();
  const thisMonth = monthKey(today());

  // Monthly totals
  const monthExpenses = DATA.expenses.filter(e => monthKey(e.date) === thisMonth);
  const income = monthExpenses.filter(e => e.type === 'income').reduce((s,e) => s + e.amount, 0);
  const expenses = monthExpenses.filter(e => e.type === 'expense').reduce((s,e) => s + e.amount, 0);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const avgDaily = expenses / Math.max(1, now.getDate());

  document.getElementById('bud-income').textContent = fmt(income);
  document.getElementById('bud-expenses').textContent = fmt(expenses);
  document.getElementById('bud-net').textContent = fmt(income - expenses);
  document.getElementById('bud-avg').textContent = fmt(avgDaily) + '/day';

  // Transaction table
  const tbody = document.querySelector('#expense-table tbody');
  if (tbody) {
    const filter = document.getElementById('bud-filter-month')?.value || 'all';
    const filtered = filter === 'all' ? DATA.expenses : DATA.expenses.filter(e => monthKey(e.date) === filter);
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No transactions yet.</td></tr>';
    } else {
      tbody.innerHTML = filtered.slice(0, 100).map(e => {
        const cat = CATEGORIES[e.category] || CATEGORIES.other;
        const isIncome = e.type === 'income';
        return `<tr>
          <td>${e.date}</td>
          <td>${cat.icon} ${cat.label}</td>
          <td style="color:var(--text-muted);">${e.note || '—'}</td>
          <td style="color:${isIncome ? 'var(--green)' : 'var(--red)'};">${isIncome ? '+' : '-'}${fmt(e.amount)}</td>
          <td><button class="btn btn-ghost btn-sm" onclick="deleteExpense('${e.id}')">×</button></td>
        </tr>`;
      }).join('');
    }
  }

  // Populate month filter
  const filterEl = document.getElementById('bud-filter-month');
  if (filterEl && filterEl.options.length <= 1) {
    const months = [...new Set(DATA.expenses.map(e => monthKey(e.date)))].sort().reverse();
    months.forEach(m => { const opt = document.createElement('option'); opt.value = m; opt.textContent = m; filterEl.appendChild(opt); });
  }

  renderBudgetCharts();
}


// ===== GOALS =====
function renderGoals() {
  const container = document.getElementById('ov-goals');
  const detailed = document.getElementById('goals-detailed');

  const html = DATA.goals.map(g => {
    const pct = Math.min(100, (g.saved / g.target) * 100);
    return `<div class="progress-wrap">
      <div class="progress-label"><span class="name">${g.icon} ${g.name}</span><span class="amount">${fmt(g.saved)} / ${fmt(g.target)}</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;color:${g.color};background:${g.color};"></div></div>
    </div>`;
  }).join('');

  if (container) container.innerHTML = html;
  if (detailed) {
    detailed.innerHTML = DATA.goals.map((g, i) => {
      const pct = Math.min(100, (g.saved / g.target) * 100);
      return `<div class="progress-wrap" style="margin-bottom:18px;">
        <div class="progress-label"><span class="name">${g.icon} ${g.name}</span><span class="amount">${pct >= 100 ? '<span class="tag tag-green">DONE ✓</span>' : fmt(g.target - g.saved) + ' left'}</span></div>
        <div class="progress-bar" style="height:12px;"><div class="progress-fill" style="width:${pct}%;color:${g.color};background:${g.color};"></div></div>
        <div style="display:flex;gap:8px;margin-top:6px;align-items:center;">
          <input type="number" class="goal-input" data-idx="${i}" value="${g.saved}" min="0" max="${g.target}" step="10" style="width:90px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;" />
          <span class="small-text">of ${fmt(g.target)}</span>
        </div>
      </div>`;
    }).join('');
    detailed.querySelectorAll('.goal-input').forEach(inp => {
      inp.addEventListener('change', e => {
        DATA.goals[+e.target.dataset.idx].saved = parseFloat(e.target.value) || 0;
        save(); renderGoals(); updateOverview();
      });
    });
  }

  // Emergency fund for overview
  const ef = DATA.goals.find(g => g.name.includes('Emergency'));
  if (ef) document.getElementById('ov-emergency').textContent = fmt(ef.saved);

  // College fund
  renderCollegeFund();
  renderPaycheckPlans();
}

function renderCollegeFund() {
  const goal = parseFloat(document.getElementById('goal-college-target')?.value) || DATA.collegeFund.goal;
  const monthly = parseFloat(document.getElementById('goal-college-monthly')?.value) || DATA.collegeFund.monthly;
  DATA.collegeFund.goal = goal; DATA.collegeFund.monthly = monthly;
  const current = DATA.collegeFund.current;
  const pct = Math.min(100, (current / goal) * 100);
  const monthsLeft = monthly > 0 ? Math.ceil(Math.max(0, goal - current) / monthly) : Infinity;

  const el = document.getElementById('college-progress');
  if (el) el.innerHTML = `<div class="progress-wrap"><div class="progress-label"><span class="name">🎓 Progress</span><span class="amount">${fmt(current)} / ${fmt(goal)} (${pct.toFixed(0)}%)</span></div><div class="progress-bar" style="height:12px;"><div class="progress-fill" style="width:${pct}%;color:var(--blue);background:var(--blue);"></div></div></div>`;
  const ml = document.getElementById('college-months-left');
  if (ml) ml.textContent = monthsLeft === Infinity ? '∞' : monthsLeft + ' months';
  save();
}

function renderPaycheckPlans() {
  const render = (plan) => plan.items.map(item => {
    const p = ((item.amount / plan.total) * 100).toFixed(0);
    return `<div class="progress-wrap"><div class="progress-label"><span class="name">${item.name}</span><span class="amount">${fmt(item.amount)} (${p}%)</span></div><div class="progress-bar" style="height:7px;"><div class="progress-fill" style="width:${p}%;color:${item.color};background:${item.color};"></div></div></div>`;
  }).join('');
  const p1 = document.getElementById('plan1-breakdown');
  const p2 = document.getElementById('plan2-breakdown');
  if (p1) p1.innerHTML = render(DATA.paycheck1);
  if (p2) p2.innerHTML = render(DATA.paycheck2);
}


// ===== INVESTMENTS =====
function calcProjection(start, monthly, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  const months = years * 12;
  let bal = start;
  const hist = [bal];
  for (let i = 0; i < months; i++) { bal = bal * (1 + r) + monthly; hist.push(bal); }
  const contrib = start + monthly * months;
  return { final: bal, contrib, gains: bal - contrib, hist };
}

function renderInvestments() {
  const bal = DATA.investmentBalance;
  const mo = DATA.monthlyInvestment;
  const ret = DATA.expectedReturn;

  const p1 = calcProjection(bal, mo, ret, 1);
  const p5 = calcProjection(bal, mo, ret, 5);
  const p10 = calcProjection(bal, mo, ret, 10);

  document.getElementById('inv-total').textContent = fmt(bal);
  document.getElementById('inv-monthly').textContent = fmt(mo) + '/mo';

  let divYield = 0;
  DATA.holdings.forEach(h => { divYield += (h.allocation / 100) * (h.divYield / 100); });
  const annDiv = bal * divYield;
  document.getElementById('inv-dividends').textContent = fmt(annDiv) + '/yr';
  document.getElementById('inv-return').textContent = (bal > 0 ? ((bal - mo * 3) / Math.max(1, mo * 3) * 100).toFixed(1) : '0') + '%';

  document.getElementById('inv-1yr').textContent = fmtK(p1.final);
  document.getElementById('inv-5yr').textContent = fmtK(p5.final);
  document.getElementById('inv-10yr').textContent = fmtK(p10.final);

  // Holdings table
  const tbody = document.querySelector('#holdings-table tbody');
  if (tbody) {
    tbody.innerHTML = DATA.holdings.map(h => `<tr>
      <td style="font-weight:700;color:var(--accent);">${h.ticker}</td>
      <td>${h.allocation}%</td>
      <td>${fmt(bal * h.allocation / 100)}</td>
      <td><span class="tag tag-blue">${h.type}</span></td>
      <td>${h.divYield}%</td>
    </tr>`).join('');
  }

  // Dividend summary
  const ds = document.getElementById('div-summary');
  if (ds) {
    ds.innerHTML = `<div class="grid grid-2">
      <div class="mini-stat"><div class="mini-val green">${fmt(annDiv)}</div><div class="mini-label">Annual</div></div>
      <div class="mini-stat"><div class="mini-val accent">${fmt(annDiv/4)}</div><div class="mini-label">Quarterly</div></div>
    </div>`;
  }
}

// ===== RETIREMENT CALCULATOR =====
function renderRetirement() {
  const monthly = parseFloat(document.getElementById('ret-monthly')?.value) || 300;
  const age = parseFloat(document.getElementById('ret-age')?.value) || 17;
  const retireAge = parseFloat(document.getElementById('ret-retire-age')?.value) || 60;
  const ret = parseFloat(document.getElementById('ret-return')?.value) || 10;
  const years = retireAge - age;

  const p = calcProjection(0, monthly, ret, years);
  const monthlyIncome = p.final * 0.04 / 12; // 4% rule

  document.getElementById('ret-total').textContent = fmtK(p.final);
  document.getElementById('ret-contributed').textContent = fmtK(p.contrib);
  document.getElementById('ret-gains').textContent = fmtK(p.gains);
  document.getElementById('ret-monthly-income').textContent = fmtK(monthlyIncome) + '/mo';

  // Comparison: starting at 17 vs 22 vs 30
  const comp = document.getElementById('ret-comparison');
  if (comp) {
    const ages = [17, 22, 30];
    comp.innerHTML = ages.map(a => {
      const yrs = retireAge - a;
      const proj = calcProjection(0, monthly, ret, Math.max(0, yrs));
      const diff = proj.final - p.final;
      return `<div class="comparison-card">
        <div class="cc-age">Start at ${a}</div>
        <div class="cc-val" style="color:${a === 17 ? 'var(--green)' : a === 22 ? 'var(--yellow)' : 'var(--red)'};">${fmtK(proj.final)}</div>
        <div class="cc-sub">${a === 17 ? 'YOU (starting now!)' : (diff < 0 ? 'Loses ' + fmtK(Math.abs(diff)) + ' vs starting at 17' : '')}</div>
      </div>`;
    }).join('');
  }

  renderRetirementChart();
}


// ===== BUY VS SAVE =====
function analyzeDecision() {
  const item = document.getElementById('bvs-item').value.trim();
  const price = parseFloat(document.getElementById('bvs-price').value) || 0;
  const happiness = parseInt(document.getElementById('bvs-happiness').value) || 5;
  const need = document.getElementById('bvs-need').value;
  const wait = document.getElementById('bvs-wait').value;

  if (!item || price <= 0) return;

  // Score: higher = save, lower = buy
  let score = 0;
  if (need === 'impulse') score += 3;
  else if (need === 'want') score += 2;
  if (wait === 'yes') score += 2;
  if (happiness <= 3) score += 2;
  else if (happiness <= 6) score += 1;
  if (price > 100) score += 1;
  if (price > 300) score += 1;

  // Hours of work to earn this
  const hoursNeeded = price / (DATA.wage * (1 - (DATA.fedTax + DATA.stateTax + DATA.fica) / 100));
  // 10yr invested value
  const p10 = calcProjection(price, 0, DATA.expectedReturn, 10);
  const investedVal = p10.final;

  const shouldSave = score >= 5;
  const verdict = shouldSave ? 'SAVE' : score >= 3 ? 'THINK ABOUT IT' : 'BUY (if budgeted)';
  const verdictColor = shouldSave ? 'var(--green)' : score >= 3 ? 'var(--yellow)' : 'var(--accent)';

  const result = document.getElementById('bvs-result');
  if (result) {
    result.innerHTML = `
      <div class="card" style="background:var(--surface-2);border-color:${verdictColor};">
        <div style="text-align:center;margin-bottom:12px;">
          <div style="font-size:24px;font-weight:800;color:${verdictColor};">${verdict}</div>
          <div class="small-text">Score: ${score}/10 (higher = save)</div>
        </div>
        <div class="grid grid-3">
          <div class="mini-stat"><div class="mini-val yellow">${hoursNeeded.toFixed(1)} hrs</div><div class="mini-label">Work Hours Needed</div></div>
          <div class="mini-stat"><div class="mini-val green">${fmtK(investedVal)}</div><div class="mini-label">If Invested (10yr)</div></div>
          <div class="mini-stat"><div class="mini-val purple">${fmtK(investedVal - price)}</div><div class="mini-label">Missed Gains</div></div>
        </div>
        <div class="divider"></div>
        <div class="grid grid-2" style="gap:8px;">
          <button class="btn btn-primary" onclick="logDecision('${item.replace(/'/g,"\\'")}', ${price}, ${happiness}, '${need}', '${wait}', 'saved', ${investedVal})">I'll SAVE Instead</button>
          <button class="btn btn-ghost" onclick="logDecision('${item.replace(/'/g,"\\'")}', ${price}, ${happiness}, '${need}', '${wait}', 'bought', ${investedVal})">I Bought It</button>
        </div>
      </div>
    `;
  }
}

function logDecision(item, price, happiness, need, wait, decision, investedVal) {
  DATA.decisions.push({ id: uid(), date: today(), item, price, happiness, need, wait, decision, investedVal });
  save();
  renderDecisions();
  document.getElementById('bvs-item').value = '';
  document.getElementById('bvs-price').value = '';
  document.getElementById('bvs-result').innerHTML = '<div class="small-text" style="text-align:center;padding:12px;">✓ Decision logged!</div>';
}

function renderDecisions() {
  const saved = DATA.decisions.filter(d => d.decision === 'saved');
  const bought = DATA.decisions.filter(d => d.decision === 'bought');
  const totalSaved = saved.reduce((s,d) => s + d.price, 0);
  const totalInvested = saved.reduce((s,d) => s + d.investedVal, 0);

  document.getElementById('bvs-saved-count').textContent = saved.length + ' saved';
  document.getElementById('bvs-bought-count').textContent = bought.length + ' bought';
  document.getElementById('bvs-total-saved').textContent = fmt(totalSaved);
  document.getElementById('bvs-invested-value').textContent = fmtK(totalInvested);

  const tbody = document.querySelector('#decisions-table tbody');
  if (tbody) {
    if (DATA.decisions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No decisions yet. Use the calculator above!</td></tr>';
    } else {
      tbody.innerHTML = DATA.decisions.slice().reverse().map(d => `<tr>
        <td>${d.date}</td>
        <td>${d.item}</td>
        <td>${fmt(d.price)}</td>
        <td>${d.happiness}/10</td>
        <td><span class="tag ${d.decision === 'saved' ? 'tag-green' : 'tag-red'}">${d.decision.toUpperCase()}</span></td>
        <td style="color:var(--green);">${fmtK(d.investedVal)}</td>
      </tr>`).join('');
    }
  }
}


// ===== NET WORTH =====
function renderNetWorth() {
  const total = DATA.assets.reduce((s,a) => s + a.value, 0);
  document.getElementById('nw-total').textContent = fmt(total);
  document.getElementById('netWorthBadge').textContent = fmtK(total);

  const tbody = document.querySelector('#nw-table tbody');
  if (tbody) {
    tbody.innerHTML = DATA.assets.map(a => {
      const p = total > 0 ? ((a.value / total) * 100).toFixed(1) : '0';
      return `<tr><td style="font-weight:600;">${a.name}</td><td style="color:var(--green);">${fmt(a.value)}</td><td>${p}%</td></tr>`;
    }).join('');
  }
}

function updateOverview() {
  renderGoals();
  renderNetWorth();
  const ovInv = document.getElementById('ov-invested');
  if (ovInv) ovInv.textContent = fmt(DATA.investmentBalance);
}

// ===== CHARTS =====
let charts = {};
function destroyChart(id) { if (charts[id]) { charts[id].destroy(); charts[id] = null; } }
const CC = { green:'#22c55e', red:'#ef4444', blue:'#3b82f6', purple:'#a855f7', yellow:'#eab308', accent:'#6366f1', muted:'#6b7a8d' };

function renderAllCharts() {
  renderAllocationChart();
  renderSpendingCatChart();
  renderBudgetCharts();
  renderPortfolioChart();
  renderDividendChart();
  renderGrowthChart();
  renderRetirementChart();
  renderNWCharts();
}

function renderAllocationChart() {
  const ctx = document.getElementById('chart-allocation'); if (!ctx) return;
  destroyChart('alloc');
  charts['alloc'] = new Chart(ctx, { type:'doughnut', data: { labels: DATA.holdings.map(h=>h.ticker), datasets:[{ data: DATA.holdings.map(h=>h.allocation), backgroundColor:['#6366f1','#3b82f6','#eab308','#22c55e'], borderWidth:0 }] }, options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ color:'#e8ecf4', font:{size:10} } } }, cutout:'65%' } });
}

function renderSpendingCatChart() {
  const ctx = document.getElementById('chart-spending-cat'); if (!ctx) return;
  destroyChart('spendCat');
  const thisMonth = monthKey(today());
  const monthExp = DATA.expenses.filter(e => monthKey(e.date) === thisMonth && e.type === 'expense');
  const catTotals = {};
  monthExp.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const cats = Object.keys(catTotals);
  if (cats.length === 0) { charts['spendCat'] = new Chart(ctx, { type:'doughnut', data:{labels:['No data'],datasets:[{data:[1],backgroundColor:['#252f3f'],borderWidth:0}]}, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#6b7a8d'}}},cutout:'60%'} }); return; }
  charts['spendCat'] = new Chart(ctx, { type:'doughnut', data: { labels: cats.map(c => (CATEGORIES[c]||CATEGORIES.other).label), datasets:[{ data: cats.map(c => catTotals[c]), backgroundColor: cats.map(c => (CATEGORIES[c]||CATEGORIES.other).color), borderWidth:0 }] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#e8ecf4',font:{size:10}}}},cutout:'60%'} });
}

function renderBudgetCharts() {
  // Category breakdown for budget section
  const ctx = document.getElementById('chart-budget-cat'); if (!ctx) return;
  destroyChart('budCat');
  const thisMonth = monthKey(today());
  const monthExp = DATA.expenses.filter(e => monthKey(e.date) === thisMonth && e.type === 'expense');
  const catTotals = {};
  monthExp.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const cats = Object.keys(catTotals);
  if (cats.length === 0) { charts['budCat'] = new Chart(ctx, { type:'bar', data:{labels:['No expenses yet'],datasets:[{data:[0],backgroundColor:['#252f3f']}]}, options:{responsive:true,maintainAspectRatio:false,scales:{x:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}},y:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}}}} }); return; }
  charts['budCat'] = new Chart(ctx, { type:'bar', data:{ labels:cats.map(c=>(CATEGORIES[c]||CATEGORIES.other).icon+' '+((CATEGORIES[c]||CATEGORIES.other).label)), datasets:[{data:cats.map(c=>catTotals[c]),backgroundColor:cats.map(c=>(CATEGORIES[c]||CATEGORIES.other).color+'cc'),borderRadius:6}] }, options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#6b7a8d',callback:v=>'$'+v},grid:{color:'#1e2738'}},y:{ticks:{color:'#e8ecf4',font:{size:10}},grid:{display:false}}}} });

  // Spending trends
  const tCtx = document.getElementById('chart-spending-trends'); if (!tCtx) return;
  destroyChart('spendTrend');
  const months = [...new Set(DATA.expenses.map(e => monthKey(e.date)))].sort().slice(-6);
  if (months.length === 0) { charts['spendTrend'] = new Chart(tCtx, { type:'line', data:{labels:['No data'],datasets:[{data:[0]}]}, options:{responsive:true,maintainAspectRatio:false} }); return; }
  const incData = months.map(m => DATA.expenses.filter(e=>monthKey(e.date)===m && e.type==='income').reduce((s,e)=>s+e.amount,0));
  const expData = months.map(m => DATA.expenses.filter(e=>monthKey(e.date)===m && e.type==='expense').reduce((s,e)=>s+e.amount,0));
  charts['spendTrend'] = new Chart(tCtx, { type:'line', data:{ labels:months, datasets:[ {label:'Income',data:incData,borderColor:CC.green,backgroundColor:CC.green+'20',fill:true,tension:0.3}, {label:'Expenses',data:expData,borderColor:CC.red,backgroundColor:CC.red+'20',fill:true,tension:0.3} ] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#e8ecf4',font:{size:10}}}},scales:{x:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}},y:{ticks:{color:'#6b7a8d',callback:v=>'$'+v},grid:{color:'#1e2738'}}}} });
}


function renderPortfolioChart() {
  const ctx = document.getElementById('chart-portfolio'); if (!ctx) return;
  destroyChart('portfolio');
  charts['portfolio'] = new Chart(ctx, { type:'doughnut', data:{ labels:DATA.holdings.map(h=>`${h.ticker} (${h.allocation}%)`), datasets:[{data:DATA.holdings.map(h=>h.allocation),backgroundColor:['#6366f1','#3b82f6','#eab308','#22c55e'],borderWidth:0}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#e8ecf4',font:{size:10}}}},cutout:'60%'} });
}

function renderDividendChart() {
  const ctx = document.getElementById('chart-dividends'); if (!ctx) return;
  destroyChart('divs');
  let divYield = 0;
  DATA.holdings.forEach(h => { divYield += (h.allocation/100)*(h.divYield/100); });
  const quarters = ['Q1','Q2','Q3','Q4'];
  const qData = quarters.map((_,i) => (DATA.investmentBalance + DATA.monthlyInvestment*3*(i+1)) * divYield / 4);
  charts['divs'] = new Chart(ctx, { type:'bar', data:{ labels:quarters, datasets:[{label:'Est. Dividends',data:qData,backgroundColor:CC.green+'99',borderRadius:6}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#e8ecf4',font:{size:10}}}},scales:{x:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}},y:{ticks:{color:'#6b7a8d',callback:v=>'$'+v.toFixed(2)},grid:{color:'#1e2738'}}}} });
}

function renderGrowthChart() {
  const ctx = document.getElementById('chart-growth'); if (!ctx) return;
  destroyChart('growth');
  const p10 = calcProjection(DATA.investmentBalance, DATA.monthlyInvestment, DATA.expectedReturn, 10);
  const labels=[],vals=[],contribs=[];
  for(let y=0;y<=10;y++){labels.push('Yr '+y);vals.push(p10.hist[y*12]);contribs.push(DATA.investmentBalance+DATA.monthlyInvestment*12*y);}
  charts['growth'] = new Chart(ctx, { type:'line', data:{ labels, datasets:[ {label:'Portfolio',data:vals,borderColor:CC.accent,backgroundColor:CC.accent+'15',fill:true,tension:0.4,pointRadius:3}, {label:'Contributions',data:contribs,borderColor:CC.muted,borderDash:[5,5],fill:false,tension:0,pointRadius:2} ] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#e8ecf4',font:{size:10}}}},scales:{x:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}},y:{ticks:{color:'#6b7a8d',callback:v=>fmtK(v)},grid:{color:'#1e2738'}}}} });
}

function renderRetirementChart() {
  const ctx = document.getElementById('chart-retirement'); if (!ctx) return;
  destroyChart('retire');
  const monthly = parseFloat(document.getElementById('ret-monthly')?.value) || 300;
  const age = parseFloat(document.getElementById('ret-age')?.value) || 17;
  const retireAge = parseFloat(document.getElementById('ret-retire-age')?.value) || 60;
  const ret = parseFloat(document.getElementById('ret-return')?.value) || 10;
  const years = retireAge - age;

  const p = calcProjection(0, monthly, ret, years);
  const labels=[],vals=[],contribs=[];
  const step = Math.max(1, Math.floor(years/20));
  for(let y=0;y<=years;y+=step){labels.push('Age '+(age+y));vals.push(p.hist[y*12]||0);contribs.push(monthly*12*y);}
  charts['retire'] = new Chart(ctx, { type:'line', data:{ labels, datasets:[ {label:'Portfolio Value',data:vals,borderColor:CC.green,backgroundColor:CC.green+'15',fill:true,tension:0.3,pointRadius:2}, {label:'Total Invested',data:contribs,borderColor:CC.muted,borderDash:[4,4],fill:false,tension:0,pointRadius:2} ] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#e8ecf4',font:{size:10}}}},scales:{x:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}},y:{ticks:{color:'#6b7a8d',callback:v=>fmtK(v)},grid:{color:'#1e2738'}}}} });
}

function renderNWCharts() {
  // Pie
  const ctx1 = document.getElementById('chart-nw-pie'); if (!ctx1) return;
  destroyChart('nwPie');
  const colors = ['#22c55e','#eab308','#6366f1','#3b82f6','#a855f7','#ef4444'];
  charts['nwPie'] = new Chart(ctx1, { type:'doughnut', data:{ labels:DATA.assets.map(a=>a.name), datasets:[{data:DATA.assets.map(a=>a.value),backgroundColor:colors.map(c=>c+'cc'),borderWidth:0}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{color:'#e8ecf4',font:{size:10}}}},cutout:'60%'} });

  // History (projected)
  const ctx2 = document.getElementById('chart-nw-history'); if (!ctx2) return;
  destroyChart('nwHist');
  const nw = DATA.assets.reduce((s,a)=>s+a.value,0);
  const labels=[],vals=[];
  for(let m=0;m<=12;m++){labels.push(m===0?'Now':`+${m}mo`);vals.push(nw + DATA.monthlyInvestment*m*1.005);}
  charts['nwHist'] = new Chart(ctx2, { type:'line', data:{ labels, datasets:[{label:'Projected Net Worth',data:vals,borderColor:CC.green,backgroundColor:CC.green+'12',fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:CC.green}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#e8ecf4',font:{size:10}}}},scales:{x:{ticks:{color:'#6b7a8d'},grid:{color:'#1e2738'}},y:{ticks:{color:'#6b7a8d',callback:v=>fmtK(v)},grid:{color:'#1e2738'}}}} });
}


// ===== EVENT BINDINGS =====
function bindEvents() {
  // Shifts
  document.getElementById('btn-add-shift')?.addEventListener('click', addShift);
  document.getElementById('btn-clear-shifts')?.addEventListener('click', () => { if(confirm('Clear all shifts?')){DATA.shifts=[];save();renderShifts();} });
  document.getElementById('shift-date').value = today();

  // Paycheck
  ['pc-wage','pc-hours','pc-fed-tax','pc-state-tax','pc-fica','pc-freq','pc-school-hours','pc-summer-hours'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', calcPaycheck);
  });

  // Budget
  document.getElementById('btn-add-expense')?.addEventListener('click', addExpense);
  document.getElementById('exp-date').value = today();
  document.getElementById('bud-filter-month')?.addEventListener('change', renderBudget);

  // Goals
  ['goal-college-target','goal-college-monthly'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderCollegeFund);
  });

  // Retirement
  ['ret-monthly','ret-age','ret-retire-age','ret-return'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderRetirement);
  });

  // Buy vs Save
  document.getElementById('btn-add-decision')?.addEventListener('click', analyzeDecision);
}

// ===== INIT =====
function init() {
  load();
  initNav();
  updateHeader();
  bindEvents();

  // Render everything
  calcPaycheck();
  renderShifts();
  renderGoals();
  renderInvestments();
  renderBudget();
  renderDecisions();
  renderNetWorth();
  renderRetirement();
  updateOverview();

  // Charts
  const startCharts = () => {
    Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
    renderAllCharts();
  };
  if (typeof Chart !== 'undefined') startCharts();
  else { const i = setInterval(()=>{if(typeof Chart!=='undefined'){clearInterval(i);startCharts();}},100); }
}

document.addEventListener('DOMContentLoaded', init);
