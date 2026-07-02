/* ============================================================
 * Senior Year Finance Dashboard — V3
 * Full personal finance tracker for senior year + first year post-grad
 * ============================================================ */

// ===== DATA MODEL =====
const DATA = {
  wage: 16.50,
  hoursPerWeek: 17.5,
  taxRate: 12,
  payFrequency: 'biweekly',
  schoolMonths: 10,
  summerMonths: 2,
  summerHours: 30,

  // Goals
  goals: [
    { name: 'Surface Laptop 4', target: 300, saved: 0, color: '#6366f1', icon: '💻' },
    { name: 'iPad Air 5', target: 247, saved: 0, color: '#3b82f6', icon: '📱' },
    { name: 'Emergency Fund', target: 500, saved: 0, color: '#f59e0b', icon: '🛡️' },
  ],
  monthlyInvestmentGoal: 300,

  // Investment holdings
  holdings: [
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', allocation: 50, type: 'Index ETF', divYield: 1.3 },
    { ticker: 'QQQM', name: 'Invesco Nasdaq 100 ETF', allocation: 30, type: 'Growth ETF', divYield: 0.5 },
    { ticker: 'TTWO', name: 'Take-Two Interactive', allocation: 10, type: 'Individual Stock', divYield: 0 },
    { ticker: 'Nuclear', name: 'Nuclear Energy Fund', allocation: 10, type: 'Thematic ETF', divYield: 0.8 },
  ],
  investmentBalance: 0,
  expectedReturn: 10,

  // Paycheck plans
  paycheck1: { total: 798.09, items: [
    { name: 'Surface Laptop', amount: 300, color: '#6366f1' },
    { name: 'Investing', amount: 200, color: '#10b981' },
    { name: 'Emergency Savings', amount: 150, color: '#f59e0b' },
    { name: 'Fun', amount: 148.09, color: '#8b5cf6' },
  ]},
  paycheck2: { total: 750, items: [
    { name: 'iPad Air', amount: 247, color: '#3b82f6' },
    { name: 'Investing', amount: 200, color: '#10b981' },
    { name: 'Emergency Savings', amount: 150, color: '#f59e0b' },
    { name: 'Fun', amount: 153, color: '#8b5cf6' },
  ]},

  // Monthly budget data (user fills this in over time)
  months: ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'],
  budget: {
    Jul: { income: 0, spent: 0, invested: 0, saved: 0 },
    Aug: { income: 0, spent: 0, invested: 0, saved: 0 },
    Sep: { income: 0, spent: 0, invested: 0, saved: 0 },
    Oct: { income: 0, spent: 0, invested: 0, saved: 0 },
    Nov: { income: 0, spent: 0, invested: 0, saved: 0 },
    Dec: { income: 0, spent: 0, invested: 0, saved: 0 },
    Jan: { income: 0, spent: 0, invested: 0, saved: 0 },
    Feb: { income: 0, spent: 0, invested: 0, saved: 0 },
    Mar: { income: 0, spent: 0, invested: 0, saved: 0 },
    Apr: { income: 0, spent: 0, invested: 0, saved: 0 },
    May: { income: 0, spent: 0, invested: 0, saved: 0 },
  },

  // Net worth assets
  assets: [
    { name: 'Checking', value: 0 },
    { name: 'Emergency Fund', value: 0 },
    { name: 'Investments', value: 0 },
    { name: 'Surface Laptop', value: 300 },
    { name: 'iPad', value: 247 },
    { name: 'Other', value: 0 },
  ],

  // College fund
  collegeFund: { goal: 2000, monthly: 100, current: 0 },
};


// ===== PERSISTENCE =====
function saveData() {
  localStorage.setItem('seniorFinanceDashV3', JSON.stringify(DATA));
}
function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem('seniorFinanceDashV3'));
    if (saved) Object.assign(DATA, saved);
  } catch(e) {}
}

// ===== UTILITY FUNCTIONS =====
function fmt(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(n) {
  if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + (n/1000).toFixed(1) + 'K';
  return '$' + n.toFixed(0);
}
function pct(n) { return (n * 100).toFixed(1) + '%'; }

// ===== NAVIGATION =====
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById('sec-' + btn.dataset.section).classList.add('active');
    });
  });
}

// ===== DATE DISPLAY =====
function updateDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', opts);
}


// ===== PAYCHECK CALCULATOR =====
function calcPaycheck() {
  const wage = parseFloat(document.getElementById('pc-wage').value) || DATA.wage;
  const hours = parseFloat(document.getElementById('pc-hours').value) || DATA.hoursPerWeek;
  const tax = parseFloat(document.getElementById('pc-tax').value) || DATA.taxRate;
  const freq = document.getElementById('pc-freq').value;

  let multiplier = 2; // biweekly = 2 weeks
  if (freq === 'weekly') multiplier = 1;
  if (freq === 'monthly') multiplier = 4.33;

  const gross = wage * hours * multiplier;
  const taxes = gross * (tax / 100);
  const net = gross - taxes;

  document.getElementById('pc-gross').textContent = fmt(gross);
  document.getElementById('pc-taxes').textContent = '-' + fmt(taxes);
  document.getElementById('pc-net').textContent = fmt(net);

  // Update main data
  DATA.wage = wage;
  DATA.hoursPerWeek = hours;
  DATA.taxRate = tax;
  DATA.payFrequency = freq;

  calcAnnualProjection();
  calcYearTable();
  saveData();
}

function calcAnnualProjection() {
  const wage = DATA.wage;
  const schoolHours = DATA.hoursPerWeek;
  const summerHours = parseFloat(document.getElementById('pc-summer-hours')?.value) || DATA.summerHours;
  const schoolMonths = parseFloat(document.getElementById('pc-school-months')?.value) || DATA.schoolMonths;
  const summerMonths = parseFloat(document.getElementById('pc-summer-months')?.value) || DATA.summerMonths;
  const tax = DATA.taxRate / 100;

  const schoolWeeks = schoolMonths * 4.33;
  const summerWeeks = summerMonths * 4.33;

  const schoolGross = wage * schoolHours * schoolWeeks;
  const summerGross = wage * summerHours * summerWeeks;
  const totalGross = schoolGross + summerGross;
  const totalNet = totalGross * (1 - tax);

  const monthlyNet = totalNet / (schoolMonths + summerMonths);

  const el = document.getElementById('pc-annual-projection');
  if (el) {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--green);">${fmt(schoolGross)}</div>
          <div class="stat-label">School Year Gross</div>
        </div>
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--blue);">${fmt(summerGross)}</div>
          <div class="stat-label">Summer Gross</div>
        </div>
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--accent);">${fmt(totalGross)}</div>
          <div class="stat-label">Total Annual Gross</div>
        </div>
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--green);">${fmt(totalNet)}</div>
          <div class="stat-label">Total Annual Net</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="stat" style="padding:8px;">
        <div class="stat-value" style="font-size:22px;color:var(--accent);">${fmt(monthlyNet)}</div>
        <div class="stat-label">Avg Monthly Take-Home</div>
      </div>
    `;
  }
}

function calcYearTable() {
  const wage = DATA.wage;
  const schoolHours = DATA.hoursPerWeek;
  const summerHours = DATA.summerHours;
  const tax = DATA.taxRate / 100;

  const monthData = [
    { month: 'July 2026', hours: summerHours, weeks: 4.33, summer: true },
    { month: 'August 2026', hours: summerHours, weeks: 4.33, summer: true },
    { month: 'September 2026', hours: schoolHours, weeks: 4.33, summer: false },
    { month: 'October 2026', hours: schoolHours, weeks: 4.33, summer: false },
    { month: 'November 2026', hours: schoolHours, weeks: 4, summer: false },
    { month: 'December 2026', hours: schoolHours, weeks: 3.5, summer: false },
    { month: 'January 2027', hours: schoolHours, weeks: 4.33, summer: false },
    { month: 'February 2027', hours: schoolHours, weeks: 4, summer: false },
    { month: 'March 2027', hours: schoolHours, weeks: 4.33, summer: false },
    { month: 'April 2027', hours: schoolHours, weeks: 4.33, summer: false },
    { month: 'May 2027', hours: schoolHours, weeks: 4.33, summer: false },
  ];

  let cumulative = 0;
  const tbody = document.querySelector('#pc-year-table tbody');
  if (!tbody) return;

  tbody.innerHTML = monthData.map(m => {
    const gross = wage * m.hours * m.weeks;
    const taxes = gross * tax;
    const net = gross - taxes;
    cumulative += net;
    return `<tr>
      <td style="color:${m.summer ? 'var(--yellow)' : 'var(--text)'};">${m.month} ${m.summer ? '☀️' : '📚'}</td>
      <td>${m.hours}</td>
      <td>${m.weeks.toFixed(1)}</td>
      <td>${fmt(gross)}</td>
      <td style="color:var(--red);">-${fmt(taxes)}</td>
      <td style="color:var(--green);">${fmt(net)}</td>
      <td style="color:var(--accent);font-weight:700;">${fmt(cumulative)}</td>
    </tr>`;
  }).join('');
}


// ===== GOALS & PROGRESS BARS =====
function renderGoals() {
  const container = document.getElementById('ov-goals-progress');
  const detailed = document.getElementById('goals-progress-detailed');
  if (!container) return;

  const html = DATA.goals.map(g => {
    const pctDone = Math.min(100, (g.saved / g.target) * 100);
    return `
      <div class="progress-wrap">
        <div class="progress-label">
          <span class="name">${g.icon} ${g.name}</span>
          <span class="amount">${fmt(g.saved)} / ${fmt(g.target)} (${pctDone.toFixed(0)}%)</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pctDone}%;background:${g.color};"></div>
        </div>
      </div>
    `;
  }).join('');

  // Monthly investment goal progress
  const invPct = Math.min(100, (DATA.investmentBalance / (DATA.monthlyInvestmentGoal * 12)) * 100);
  const invHtml = `
    <div class="progress-wrap">
      <div class="progress-label">
        <span class="name">📈 Monthly Investing ($${DATA.monthlyInvestmentGoal}/mo)</span>
        <span class="amount">${fmt(DATA.investmentBalance)} total</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${invPct}%;background:#10b981;"></div>
      </div>
    </div>
  `;

  container.innerHTML = html + invHtml;
  if (detailed) {
    // Detailed version with edit buttons
    detailed.innerHTML = DATA.goals.map((g, i) => {
      const pctDone = Math.min(100, (g.saved / g.target) * 100);
      const remaining = Math.max(0, g.target - g.saved);
      return `
        <div class="progress-wrap" style="margin-bottom:20px;">
          <div class="progress-label">
            <span class="name">${g.icon} ${g.name}</span>
            <span class="amount">
              ${pctDone >= 100 ? '<span class="tag tag-green">COMPLETE ✓</span>' : fmt(remaining) + ' remaining'}
            </span>
          </div>
          <div class="progress-bar" style="height:14px;">
            <div class="progress-fill" style="width:${pctDone}%;background:${g.color};"></div>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
            <input type="number" class="goal-input" data-idx="${i}" value="${g.saved}" min="0" max="${g.target}" step="10"
              style="width:100px;padding:4px 8px;background:var(--surface-2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:12px;" />
            <span style="color:var(--text-muted);font-size:12px;">saved of ${fmt(g.target)}</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind goal inputs
    detailed.querySelectorAll('.goal-input').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        DATA.goals[idx].saved = parseFloat(e.target.value) || 0;
        saveData();
        renderGoals();
        updateOverview();
      });
    });
  }
}

function renderPaycheckPlans() {
  const plan1 = document.getElementById('ov-paycheck1-plan');
  if (!plan1) return;

  const renderPlan = (plan) => {
    return plan.items.map(item => {
      const pct = ((item.amount / plan.total) * 100).toFixed(0);
      return `
        <div class="progress-wrap">
          <div class="progress-label">
            <span class="name">${item.name}</span>
            <span class="amount">${fmt(item.amount)} (${pct}%)</span>
          </div>
          <div class="progress-bar" style="height:8px;">
            <div class="progress-fill" style="width:${pct}%;background:${item.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  };

  plan1.innerHTML = renderPlan(DATA.paycheck1);

  const p1el = document.getElementById('plan1-breakdown');
  const p2el = document.getElementById('plan2-breakdown');
  if (p1el) p1el.innerHTML = renderPlan(DATA.paycheck1);
  if (p2el) p2el.innerHTML = renderPlan(DATA.paycheck2);
}


// ===== INVESTMENT PROJECTIONS =====
function calcProjection(startBalance, monthlyContrib, annualReturn, years) {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  let balance = startBalance;
  const history = [balance];

  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) + monthlyContrib;
    history.push(balance);
  }
  const totalContrib = startBalance + (monthlyContrib * months);
  const gains = balance - totalContrib;
  return { finalBalance: balance, totalContrib, gains, history };
}

function renderInvestments() {
  const balance = DATA.investmentBalance;
  const monthly = DATA.monthlyInvestmentGoal;
  const returnRate = DATA.expectedReturn;

  // Projections
  const p1 = calcProjection(balance, monthly, returnRate, 1);
  const p5 = calcProjection(balance, monthly, returnRate, 5);
  const p10 = calcProjection(balance, monthly, returnRate, 10);

  document.getElementById('inv-total').textContent = fmt(balance);
  document.getElementById('inv-monthly').textContent = fmt(monthly) + '/mo';

  // Calculate dividends
  let totalDivYield = 0;
  DATA.holdings.forEach(h => {
    totalDivYield += (h.allocation / 100) * (h.divYield / 100);
  });
  const annualDivs = balance * totalDivYield;
  document.getElementById('inv-dividends').textContent = fmt(annualDivs) + '/yr';

  const totalReturn = balance > 0 ? ((balance - (monthly * 3)) / (monthly * 3) * 100) : 0;
  document.getElementById('inv-gain').textContent = totalReturn.toFixed(1) + '%';

  // Projection stats
  document.getElementById('proj-1yr').textContent = fmt(p1.finalBalance);
  document.getElementById('proj-1yr-gain').textContent = '+' + fmt(p1.gains) + ' gains';
  document.getElementById('proj-5yr').textContent = fmt(p5.finalBalance);
  document.getElementById('proj-5yr-gain').textContent = '+' + fmt(p5.gains) + ' gains';
  document.getElementById('proj-10yr').textContent = fmt(p10.finalBalance);
  document.getElementById('proj-10yr-gain').textContent = '+' + fmt(p10.gains) + ' gains';

  // Holdings table
  const holdingsBody = document.querySelector('#inv-holdings-table tbody');
  if (holdingsBody) {
    holdingsBody.innerHTML = DATA.holdings.map(h => {
      const amount = balance * (h.allocation / 100);
      return `<tr>
        <td style="font-weight:700;color:var(--accent);">${h.ticker}</td>
        <td>${h.allocation}%</td>
        <td>${fmt(amount)}</td>
        <td><span class="tag tag-blue">${h.type}</span></td>
        <td>${h.divYield}%</td>
      </tr>`;
    }).join('');
  }

  // Dividend summary
  const divEl = document.getElementById('dividend-summary');
  if (divEl) {
    divEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--green);">${fmt(annualDivs)}</div>
          <div class="stat-label">Annual Dividends</div>
        </div>
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--accent);">${fmt(annualDivs / 12)}</div>
          <div class="stat-label">Monthly Dividends</div>
        </div>
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--yellow);">${(totalDivYield * 100).toFixed(2)}%</div>
          <div class="stat-label">Blended Yield</div>
        </div>
        <div class="stat" style="padding:8px;">
          <div class="stat-value" style="font-size:18px;color:var(--purple);">${fmt(annualDivs / 4)}</div>
          <div class="stat-label">Quarterly Dividends</div>
        </div>
      </div>
    `;
  }
}


// ===== BUDGET TRACKER =====
function renderBudget() {
  const tbody = document.querySelector('#budget-table tbody');
  if (!tbody) return;

  let totIncome = 0, totSpent = 0, totInvested = 0, totSaved = 0;

  tbody.innerHTML = DATA.months.map(m => {
    const b = DATA.budget[m];
    const net = b.income - b.spent - b.invested - b.saved;
    totIncome += b.income;
    totSpent += b.spent;
    totInvested += b.invested;
    totSaved += b.saved;
    const netColor = net >= 0 ? 'var(--green)' : 'var(--red)';
    return `<tr>
      <td style="font-weight:600;">${m}</td>
      <td>
        <input type="number" class="budget-input" data-month="${m}" data-field="income" value="${b.income}" min="0" step="50"
          style="width:80px;padding:3px 6px;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;color:var(--green);font-family:var(--mono);font-size:11px;" />
      </td>
      <td>
        <input type="number" class="budget-input" data-month="${m}" data-field="spent" value="${b.spent}" min="0" step="25"
          style="width:80px;padding:3px 6px;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;color:var(--red);font-family:var(--mono);font-size:11px;" />
      </td>
      <td>
        <input type="number" class="budget-input" data-month="${m}" data-field="invested" value="${b.invested}" min="0" step="25"
          style="width:80px;padding:3px 6px;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;color:var(--accent);font-family:var(--mono);font-size:11px;" />
      </td>
      <td>
        <input type="number" class="budget-input" data-month="${m}" data-field="saved" value="${b.saved}" min="0" step="25"
          style="width:80px;padding:3px 6px;background:var(--surface-2);border:1px solid var(--border);border-radius:4px;color:var(--yellow);font-family:var(--mono);font-size:11px;" />
      </td>
      <td style="color:${netColor};font-weight:700;">${fmt(net)}</td>
    </tr>`;
  }).join('');

  // Bind budget inputs
  tbody.querySelectorAll('.budget-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const month = e.target.dataset.month;
      const field = e.target.dataset.field;
      DATA.budget[month][field] = parseFloat(e.target.value) || 0;
      saveData();
      renderBudget();
      updateOverview();
      renderCharts();
    });
  });

  // Annual summary
  document.getElementById('ann-income').textContent = fmt(totIncome);
  document.getElementById('ann-spent').textContent = fmt(totSpent);
  document.getElementById('ann-invested').textContent = fmt(totInvested);
  document.getElementById('ann-saved').textContent = fmt(totSaved);
}

// ===== COLLEGE FUND =====
function renderCollegeFund() {
  const goal = parseFloat(document.getElementById('goal-college')?.value) || DATA.collegeFund.goal;
  const monthly = parseFloat(document.getElementById('goal-college-monthly')?.value) || DATA.collegeFund.monthly;
  const current = parseFloat(document.getElementById('goal-college-current')?.value) || DATA.collegeFund.current;

  DATA.collegeFund = { goal, monthly, current };

  const pctDone = Math.min(100, (current / goal) * 100);
  const remaining = Math.max(0, goal - current);
  const monthsLeft = monthly > 0 ? Math.ceil(remaining / monthly) : Infinity;

  const el = document.getElementById('college-progress');
  if (el) {
    el.innerHTML = `
      <div class="progress-wrap">
        <div class="progress-label">
          <span class="name">🎓 College/Trade School Fund</span>
          <span class="amount">${fmt(current)} / ${fmt(goal)} (${pctDone.toFixed(0)}%)</span>
        </div>
        <div class="progress-bar" style="height:14px;">
          <div class="progress-fill" style="width:${pctDone}%;background:var(--blue);"></div>
        </div>
      </div>
    `;
  }

  const monthsEl = document.getElementById('college-months-left');
  if (monthsEl) {
    monthsEl.textContent = monthsLeft === Infinity ? '∞' : monthsLeft + ' months';
  }

  saveData();
}

// ===== NET WORTH =====
function renderNetWorth() {
  const total = DATA.assets.reduce((s, a) => s + a.value, 0);

  document.getElementById('nw-total').textContent = fmt(total);
  document.getElementById('netWorthBadge').textContent = fmtShort(total);
  document.getElementById('ov-net-worth').textContent = fmt(total);

  const tbody = document.querySelector('#nw-table tbody');
  if (tbody) {
    tbody.innerHTML = DATA.assets.map(a => {
      const p = total > 0 ? ((a.value / total) * 100).toFixed(1) : '0.0';
      return `<tr>
        <td style="font-weight:600;">${a.name}</td>
        <td style="color:var(--green);">${fmt(a.value)}</td>
        <td>${p}%</td>
      </tr>`;
    }).join('');
  }
}


// ===== CHARTS =====
let charts = {};

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); charts[id] = null; }
}

const chartColors = {
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  yellow: '#f59e0b',
  accent: '#6366f1',
  muted: '#7a8a9a',
};

function renderCharts() {
  renderAllocationChart();
  renderCashflowChart();
  renderPortfolioChart();
  renderDividendChart();
  renderGrowthChart();
  renderBudgetPieChart();
  renderBudgetBarsChart();
  renderProjectionChart();
  renderEarningsChart();
  renderNWProjectionChart();
  renderNWPieChart();
  renderNWHistoryChart();
}

function renderAllocationChart() {
  const ctx = document.getElementById('chart-allocation');
  if (!ctx) return;
  destroyChart('allocation');
  charts['allocation'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: DATA.holdings.map(h => h.ticker),
      datasets: [{
        data: DATA.holdings.map(h => h.allocation),
        backgroundColor: ['#6366f1', '#3b82f6', '#f59e0b', '#10b981'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 11 } } },
      },
      cutout: '65%',
    }
  });
}

function renderCashflowChart() {
  const ctx = document.getElementById('chart-cashflow');
  if (!ctx) return;
  destroyChart('cashflow');

  const income = DATA.months.map(m => DATA.budget[m].income);
  const spent = DATA.months.map(m => DATA.budget[m].spent);

  charts['cashflow'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.months,
      datasets: [
        { label: 'Income', data: income, backgroundColor: chartColors.green + '99', borderRadius: 4 },
        { label: 'Spent', data: spent, backgroundColor: chartColors.red + '99', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a' }, grid: { color: '#1f2d3d' } },
        y: { ticks: { color: '#7a8a9a', callback: v => '$' + v }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}

function renderPortfolioChart() {
  const ctx = document.getElementById('chart-portfolio');
  if (!ctx) return;
  destroyChart('portfolio');
  charts['portfolio'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: DATA.holdings.map(h => `${h.ticker} (${h.allocation}%)`),
      datasets: [{
        data: DATA.holdings.map(h => h.allocation),
        backgroundColor: ['#6366f1', '#3b82f6', '#f59e0b', '#10b981'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 11 } } } },
      cutout: '60%',
    }
  });
}

function renderDividendChart() {
  const ctx = document.getElementById('chart-dividends');
  if (!ctx) return;
  destroyChart('dividends');

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  let totalDivYield = 0;
  DATA.holdings.forEach(h => { totalDivYield += (h.allocation / 100) * (h.divYield / 100); });
  const annualDiv = DATA.investmentBalance * totalDivYield;
  const qDiv = annualDiv / 4;

  // Project dividends growing over 4 quarters as investment grows
  const qData = quarters.map((_, i) => {
    const projBal = DATA.investmentBalance + (DATA.monthlyInvestmentGoal * 3 * (i + 1));
    return projBal * totalDivYield / 4;
  });

  charts['dividends'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: quarters,
      datasets: [{
        label: 'Est. Quarterly Dividends',
        data: qData,
        backgroundColor: chartColors.green + '99',
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a' }, grid: { color: '#1f2d3d' } },
        y: { ticks: { color: '#7a8a9a', callback: v => '$' + v.toFixed(2) }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}


function renderGrowthChart() {
  const ctx = document.getElementById('chart-growth');
  if (!ctx) return;
  destroyChart('growth');

  const p10 = calcProjection(DATA.investmentBalance, DATA.monthlyInvestmentGoal, DATA.expectedReturn, 10);
  // Show yearly data points
  const labels = [];
  const balances = [];
  const contributions = [];
  for (let y = 0; y <= 10; y++) {
    labels.push('Year ' + y);
    balances.push(p10.history[y * 12]);
    contributions.push(DATA.investmentBalance + (DATA.monthlyInvestmentGoal * 12 * y));
  }

  charts['growth'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: balances,
          borderColor: chartColors.accent,
          backgroundColor: chartColors.accent + '20',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
        {
          label: 'Total Contributions',
          data: contributions,
          borderColor: chartColors.muted,
          borderDash: [5, 5],
          fill: false,
          tension: 0,
          pointRadius: 3,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a' }, grid: { color: '#1f2d3d' } },
        y: { ticks: { color: '#7a8a9a', callback: v => fmtShort(v) }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}

function renderBudgetPieChart() {
  const ctx = document.getElementById('chart-budget-pie');
  if (!ctx) return;
  destroyChart('budgetPie');

  // Average monthly breakdown
  const monthlyIncome = 1100;
  const categories = [
    { name: 'Investing', amount: 300, color: chartColors.green },
    { name: 'Savings', amount: 150, color: chartColors.yellow },
    { name: 'Needs (est.)', amount: 350, color: chartColors.blue },
    { name: 'Fun/Discretionary', amount: 300, color: chartColors.purple },
  ];

  charts['budgetPie'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.amount),
        backgroundColor: categories.map(c => c.color + 'cc'),
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 11 } } },
        title: { display: true, text: 'Monthly Budget Split ($1,100/mo)', color: '#e2e8f0', font: { size: 12 } },
      },
      cutout: '55%',
    }
  });
}

function renderBudgetBarsChart() {
  const ctx = document.getElementById('chart-budget-bars');
  if (!ctx) return;
  destroyChart('budgetBars');

  charts['budgetBars'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.months,
      datasets: [
        { label: 'Spent', data: DATA.months.map(m => DATA.budget[m].spent), backgroundColor: chartColors.red + '99', borderRadius: 4 },
        { label: 'Invested', data: DATA.months.map(m => DATA.budget[m].invested), backgroundColor: chartColors.green + '99', borderRadius: 4 },
        { label: 'Saved', data: DATA.months.map(m => DATA.budget[m].saved), backgroundColor: chartColors.yellow + '99', borderRadius: 4 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { stacked: true, ticks: { color: '#7a8a9a' }, grid: { color: '#1f2d3d' } },
        y: { stacked: true, ticks: { color: '#7a8a9a', callback: v => '$' + v }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}

function renderProjectionChart() {
  const ctx = document.getElementById('chart-projection');
  if (!ctx) return;
  destroyChart('projection');

  const start = parseFloat(document.getElementById('proj-start')?.value) || 0;
  const monthly = parseFloat(document.getElementById('proj-monthly')?.value) || 300;
  const rate = parseFloat(document.getElementById('proj-return')?.value) || 10;

  const p1 = calcProjection(start, monthly, rate, 1);
  const p5 = calcProjection(start, monthly, rate, 5);
  const p10 = calcProjection(start, monthly, rate, 10);

  // Update projection cards
  document.getElementById('proj2-1yr').textContent = fmt(p1.finalBalance);
  document.getElementById('proj2-1yr-sub').textContent = `Contributed: ${fmt(p1.totalContrib)} · Gains: +${fmt(p1.gains)}`;
  document.getElementById('proj2-5yr').textContent = fmt(p5.finalBalance);
  document.getElementById('proj2-5yr-sub').textContent = `Contributed: ${fmt(p5.totalContrib)} · Gains: +${fmt(p5.gains)}`;
  document.getElementById('proj2-10yr').textContent = fmt(p10.finalBalance);
  document.getElementById('proj2-10yr-sub').textContent = `Contributed: ${fmt(p10.totalContrib)} · Gains: +${fmt(p10.gains)}`;

  // Monthly data for 10 years
  const labels = [];
  const values = [];
  const contribs = [];
  for (let m = 0; m <= 120; m += 6) {
    const yr = (m / 12).toFixed(1);
    labels.push(m <= 12 ? `${m}mo` : `${yr}yr`);
    values.push(p10.history[m]);
    contribs.push(start + monthly * m);
  }

  charts['projection'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: values,
          borderColor: chartColors.accent,
          backgroundColor: chartColors.accent + '15',
          fill: true,
          tension: 0.3,
          pointRadius: 2,
        },
        {
          label: 'Total Contributed',
          data: contribs,
          borderColor: chartColors.muted,
          borderDash: [4, 4],
          fill: false,
          tension: 0,
          pointRadius: 2,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a', maxTicksLimit: 12 }, grid: { color: '#1f2d3d' } },
        y: { ticks: { color: '#7a8a9a', callback: v => fmtShort(v) }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}


function renderEarningsChart() {
  const ctx = document.getElementById('chart-earnings');
  if (!ctx) return;
  destroyChart('earnings');

  const wage = DATA.wage;
  const schoolHrs = DATA.hoursPerWeek;
  const summerHrs = DATA.summerHours;
  const tax = DATA.taxRate / 100;

  const monthHrs = [summerHrs, summerHrs, schoolHrs, schoolHrs, schoolHrs, schoolHrs, schoolHrs, schoolHrs, schoolHrs, schoolHrs, schoolHrs];
  const monthLabels = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const grossData = monthHrs.map(h => wage * h * 4.33);
  const netData = grossData.map(g => g * (1 - tax));
  let cumulative = 0;
  const cumData = netData.map(n => { cumulative += n; return cumulative; });

  charts['earnings'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [
        { label: 'Monthly Net', data: netData, borderColor: chartColors.green, backgroundColor: chartColors.green + '20', fill: true, tension: 0.3, yAxisID: 'y' },
        { label: 'Cumulative Net', data: cumData, borderColor: chartColors.accent, borderDash: [4, 4], fill: false, tension: 0.3, yAxisID: 'y1' },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a' }, grid: { color: '#1f2d3d' } },
        y: { position: 'left', ticks: { color: '#7a8a9a', callback: v => '$' + v.toFixed(0) }, grid: { color: '#1f2d3d' } },
        y1: { position: 'right', ticks: { color: '#7a8a9a', callback: v => fmtShort(v) }, grid: { display: false } },
      }
    }
  });
}

function renderNWProjectionChart() {
  const ctx = document.getElementById('chart-nw-projection');
  if (!ctx) return;
  destroyChart('nwProjection');

  const currentNW = DATA.assets.reduce((s, a) => s + a.value, 0);
  const monthlyGrowth = DATA.monthlyInvestmentGoal;
  const rate = DATA.expectedReturn / 100 / 12;

  const labels = [];
  const values = [];
  let nw = currentNW;

  for (let m = 0; m <= 24; m++) {
    labels.push(m === 0 ? 'Now' : `+${m}mo`);
    values.push(nw);
    nw = nw * (1 + rate * 0.6) + monthlyGrowth; // Simplified growth
  }

  charts['nwProjection'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Projected Net Worth',
        data: values,
        borderColor: chartColors.purple,
        backgroundColor: chartColors.purple + '15',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a', maxTicksLimit: 8 }, grid: { color: '#1f2d3d' } },
        y: { ticks: { color: '#7a8a9a', callback: v => fmtShort(v) }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}

function renderNWPieChart() {
  const ctx = document.getElementById('chart-networth-pie');
  if (!ctx) return;
  destroyChart('nwPie');

  const colors = ['#10b981', '#f59e0b', '#6366f1', '#3b82f6', '#8b5cf6', '#ef4444'];
  charts['nwPie'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: DATA.assets.map(a => a.name),
      datasets: [{
        data: DATA.assets.map(a => a.value),
        backgroundColor: colors.map(c => c + 'cc'),
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 11 } } } },
      cutout: '60%',
    }
  });
}

function renderNWHistoryChart() {
  const ctx = document.getElementById('chart-nw-history');
  if (!ctx) return;
  destroyChart('nwHistory');

  // Simulate NW history based on budget data
  const currentNW = DATA.assets.reduce((s, a) => s + a.value, 0);
  let runningNW = 0;
  const nwData = DATA.months.map(m => {
    const b = DATA.budget[m];
    runningNW += (b.income - b.spent);
    return runningNW;
  });
  // If no budget data, show projection
  const hasData = nwData.some(v => v !== 0);

  const labels = DATA.months;
  const values = hasData ? nwData : DATA.months.map((_, i) => currentNW + (DATA.monthlyInvestmentGoal * (i + 1)));

  charts['nwHistory'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: hasData ? 'Net Worth (from budget)' : 'Projected Net Worth',
        data: values,
        borderColor: chartColors.green,
        backgroundColor: chartColors.green + '15',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: chartColors.green,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#7a8a9a' }, grid: { color: '#1f2d3d' } },
        y: { ticks: { color: '#7a8a9a', callback: v => fmtShort(v) }, grid: { color: '#1f2d3d' } },
      }
    }
  });
}


// ===== OVERVIEW UPDATE =====
function updateOverview() {
  // Monthly income
  const monthlyNet = DATA.wage * DATA.hoursPerWeek * 4.33 * (1 - DATA.taxRate / 100);
  document.getElementById('ov-monthly-income').textContent = fmt(monthlyNet);

  // Total invested (from budget data)
  let totalInvested = 0;
  DATA.months.forEach(m => { totalInvested += DATA.budget[m].invested; });
  document.getElementById('ov-invested').textContent = fmt(totalInvested || DATA.investmentBalance);

  // Emergency fund (from goals)
  const ef = DATA.goals.find(g => g.name === 'Emergency Fund');
  document.getElementById('ov-saved').textContent = fmt(ef ? ef.saved : 0);

  renderNetWorth();
}

// ===== EVENT LISTENERS =====
function bindInputs() {
  // Paycheck calculator inputs
  ['pc-wage', 'pc-hours', 'pc-tax', 'pc-freq'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', calcPaycheck);
  });

  ['pc-school-months', 'pc-summer-months', 'pc-summer-hours'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => {
      DATA.schoolMonths = parseFloat(document.getElementById('pc-school-months').value) || 10;
      DATA.summerMonths = parseFloat(document.getElementById('pc-summer-months').value) || 2;
      DATA.summerHours = parseFloat(document.getElementById('pc-summer-hours').value) || 30;
      calcAnnualProjection();
      calcYearTable();
      saveData();
    });
  });

  // College fund inputs
  ['goal-college', 'goal-college-monthly', 'goal-college-current'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderCollegeFund);
  });

  // Projection inputs
  ['proj-start', 'proj-monthly', 'proj-return'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderProjectionChart);
  });
}

// ===== INITIALIZATION =====
function init() {
  loadData();
  initNav();
  updateDate();
  bindInputs();

  // Initial renders
  calcPaycheck();
  renderGoals();
  renderPaycheckPlans();
  renderInvestments();
  renderBudget();
  renderCollegeFund();
  renderNetWorth();
  updateOverview();

  // Charts need Chart.js to be loaded
  if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
    renderCharts();
  } else {
    // Wait for Chart.js
    const wait = setInterval(() => {
      if (typeof Chart !== 'undefined') {
        clearInterval(wait);
        Chart.defaults.font.family = "'Inter', -apple-system, sans-serif";
        renderCharts();
      }
    }, 100);
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
