// UI Rendering Engine & Interactive Components for AhorroIA
import { State, CATEGORIES } from './state.js';
import { Icons } from './icons.js';

export function renderAppShell(container) {
  container.innerHTML = `
    <!-- App Header -->
    <header class="app-header">
      <div class="brand-wrapper">
        <div class="brand-icon">
          ${Icons.sparkles()}
        </div>
        <div>
          <div class="brand-title">AhorroIA</div>
          <div class="brand-subtitle">Presupuesto Inteligente</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="icon-btn" id="btn-quick-income" title="Editar Ingreso Mensual">
          ${Icons.wallet()}
        </button>
        <button class="icon-btn" id="btn-quick-settings" title="Ajustes y API Key">
          ${Icons.settings()}
        </button>
      </div>
    </header>

    <!-- Main Dynamic Tab Container -->
    <main class="main-content" id="tab-container">
      <!-- Tabs render here dynamically -->
    </main>

    <!-- Floating Action Button (Add Expense) -->
    <button class="fab-btn" id="fab-add-expense" title="Añadir Nuevo Gasto">
      ${Icons.plus()}
    </button>

    <!-- Bottom Navigation Bar -->
    <nav class="bottom-nav">
      <button class="nav-tab active" data-tab="budget">
        ${Icons.wallet()}
        <span>Presupuesto</span>
      </button>
      <button class="nav-tab tab-ai" data-tab="ai">
        ${Icons.sparkles()}
        <span>Asesor IA</span>
      </button>
      <button class="nav-tab" data-tab="savings">
        ${Icons.trendingUp()}
        <span>Ahorro</span>
      </button>
      <button class="nav-tab" data-tab="settings">
        ${Icons.settings()}
        <span>Ajustes</span>
      </button>
    </nav>

    <!-- Toast Notification -->
    <div id="toast-notify" class="toast">
      <span id="toast-icon"></span>
      <span id="toast-text"></span>
    </div>

    <!-- Modals Container -->
    <div id="modals-root"></div>
  `;
}

// Toast notification helper
export function showToast(message, type = 'success') {
  const toast = document.getElementById('toast-notify');
  const icon = document.getElementById('toast-icon');
  const text = document.getElementById('toast-text');

  if (!toast) return;

  toast.className = `toast show ${type}`;
  icon.innerHTML = type === 'success' ? Icons.checkCircle() : Icons.alertCircle();
  text.textContent = message;

  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// -------------------------------------------------------------------
// TAB 1: PRESUPUESTO & GASTOS
// -------------------------------------------------------------------
export function renderBudgetTab(container) {
  const curr = State.data.currency;
  const income = State.getTotalIncome();
  const totalExp = State.getTotalExpenses();
  const balance = State.getRemainingBalance();
  const postponedSavings = State.getActivePostponedSavings();
  const actualBalance = State.getOptimizedBalance();
  const expenses = State.data.expenses;

  const categoryTotals = State.getExpensesByCategory();

  container.innerHTML = `
    <!-- Balance Hero Card -->
    <div class="card balance-hero">
      <div class="balance-label">Balance Disponible</div>
      <div class="balance-amount ${actualBalance >= 0 ? 'positive' : 'negative'}">
        ${curr}${actualBalance.toLocaleString()}
      </div>

      ${postponedSavings > 0 ? `
        <div style="font-size:0.8rem; color:#34d399; margin-bottom:12px; display:flex; align-items:center; gap:6px;">
          ${Icons.checkCircle('icon')}
          <span>¡Ahorrando <strong>${curr}${postponedSavings}</strong> por gastos pospuestos!</span>
        </div>
      ` : ''}

      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-label">Ingreso Mensual</span>
          <span class="metric-value income">${curr}${income.toLocaleString()}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">Total Gastos</span>
          <span class="metric-value expense">${curr}${totalExp.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- AI Suggestion Banner -->
    <div class="card card-ai-glow" style="cursor: pointer;" id="card-trigger-ai">
      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:38px; height:38px; border-radius:10px; background:var(--gradient-ai); display:flex; align-items:center; justify-content:center;">
            ${Icons.sparkles()}
          </div>
          <div>
            <div style="font-weight:700; font-size:0.95rem; color:#fff;">Optimizar con IA</div>
            <div style="font-size:0.75rem; color:#c7d2fe;">Detecta qué gastos posponer y cuánto ahorras</div>
          </div>
        </div>
        <button class="btn-secondary" style="font-size:0.8rem; padding:6px 12px;">Ver Análisis</button>
      </div>
    </div>

    <!-- Category Breakdown Chart Card -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">${Icons.piggyBank()} Distribución de Gastos</span>
        <span style="font-size:0.8rem; color:var(--text-muted);">${expenses.length} gastos</span>
      </div>
      
      <div class="chart-container">
        ${renderDonutSvg(categoryTotals, totalExp)}
        <div class="chart-legend">
          ${CATEGORIES.map(c => {
            const amount = categoryTotals[c.id] || 0;
            if (amount === 0) return '';
            const percent = totalExp > 0 ? Math.round((amount / totalExp) * 100) : 0;
            return `
              <div class="legend-item">
                <div class="legend-color-label">
                  <div class="legend-dot" style="background-color: ${c.color}"></div>
                  <span style="color:var(--text-secondary);">${c.icon} ${c.label.split(' ')[0]}</span>
                </div>
                <span style="font-weight:600; color:var(--text-primary);">${percent}% (${curr}${amount})</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Expense List Header & Action -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin: 20px 0 10px 0;">
      <h3 style="font-family:var(--font-display); font-size:1.05rem; font-weight:700;">
        Registro de Gastos
      </h3>
      <button class="btn-secondary" id="btn-add-expense-text" style="font-size:0.8rem; padding:6px 12px;">
        ${Icons.plus()} Nuevo Gasto
      </button>
    </div>

    <!-- Expenses Items -->
    <div id="expense-list">
      ${expenses.length === 0 ? `
        <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
          <div style="margin-bottom:8px; font-size:1.8rem;">📝</div>
          <p>No tienes gastos registrados aún.</p>
          <button class="btn-primary" id="btn-load-samples-empty" style="margin-top:14px; font-size:0.85rem;">
            Cargar presupuesto de ejemplo
          </button>
        </div>
      ` : expenses.map(e => renderExpenseItem(e, curr)).join('')}
    </div>
  `;
}

function renderExpenseItem(e, curr) {
  const cat = CATEGORIES.find(c => c.id === e.category) || { icon: '📦', label: 'Otros' };

  let priorityBadge = '';
  if (e.aiCategory === 'esencial') {
    priorityBadge = `<span class="badge badge-essential">${Icons.lock('icon')} Esencial</span>`;
  } else if (e.aiCategory === 'posponible') {
    priorityBadge = `<span class="badge badge-postponable">${Icons.clock('icon')} Posponible</span>`;
  } else if (e.aiCategory === 'prescindible') {
    priorityBadge = `<span class="badge badge-dispensable">${Icons.scissors('icon')} Prescindible</span>`;
  } else {
    priorityBadge = `<span class="badge badge-untested">Sin clasificar</span>`;
  }

  return `
    <div class="expense-item ${e.isPostponed ? 'postponed' : ''}" data-id="${e.id}">
      <div class="expense-left">
        <div class="expense-icon-badge">${cat.icon}</div>
        <div class="expense-info">
          <div class="expense-name">${escapeHtml(e.name)}</div>
          <div class="expense-meta">
            ${priorityBadge}
            ${e.isPostponed ? '<span style="font-size:0.7rem; color:#34d399; font-weight:700;">(Pospuesto este mes)</span>' : ''}
          </div>
        </div>
      </div>
      <div class="expense-right">
        <div class="expense-amount">${curr}${Number(e.amount).toLocaleString()}</div>
        <button class="btn-icon-del btn-delete-expense" data-id="${e.id}" title="Eliminar gasto">
          ${Icons.trash()}
        </button>
      </div>
    </div>
  `;
}

// Donut Chart SVG Generator
function renderDonutSvg(categoryTotals, total) {
  if (total <= 0) {
    return `
      <svg class="chart-svg" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.1)" stroke-width="6"></circle>
      </svg>
    `;
  }

  let accumulatedPercent = 0;
  const segments = [];

  CATEGORIES.forEach(c => {
    const amount = categoryTotals[c.id] || 0;
    if (amount > 0) {
      const percent = (amount / total) * 100;
      const strokeDasharray = `${percent} ${100 - percent}`;
      const strokeDashoffset = 100 - accumulatedPercent + 25;
      segments.push(`
        <circle cx="21" cy="21" r="15.91549430918954"
          fill="transparent"
          stroke="${c.color}"
          stroke-width="5"
          stroke-dasharray="${strokeDasharray}"
          stroke-dashoffset="${strokeDashoffset}">
        </circle>
      `);
      accumulatedPercent += percent;
    }
  });

  return `
    <svg class="chart-svg" viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="5"></circle>
      ${segments.join('')}
    </svg>
  `;
}

// -------------------------------------------------------------------
// TAB 2: ASESOR IA & DECISIÓN DE GASTOS
// -------------------------------------------------------------------
export function renderAiAdvisorTab(container) {
  const curr = State.data.currency;
  const analysis = State.data.lastAiAnalysis;
  const expenses = State.data.expenses;
  const activePostponed = State.getActivePostponedSavings();
  const potentialSavings = State.getPotentialAiSavings();

  const byPriority = State.getExpensesByAiPriority();

  container.innerHTML = `
    <!-- Top Action Card to Trigger AI Analysis -->
    <div class="card card-ai-glow">
      <div class="card-header">
        <span class="card-title">${Icons.sparkles()} Inteligencia Artificial Financiera</span>
        <span style="font-size:0.75rem; color:#a78bfa;">${State.data.apiKey ? 'Gemini Activo' : 'Modo Demo'}</span>
      </div>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:14px;">
        La IA examina cada gasto para decidir cuáles son <strong>vitales (primer plano)</strong> y cuáles pueden <strong>posponerse o recortarse (segundo plano)</strong> para maximizar tu ahorro inmediato.
      </p>
      <button class="btn-ai-scan" id="btn-run-ai-analysis">
        ${Icons.sparkles()}
        <span>${analysis ? 'Re-analizar Presupuesto con IA' : 'Analizar y Optimizar Presupuesto'}</span>
      </button>
      ${!State.data.apiKey ? `
        <div style="font-size:0.75rem; color:#94a3b8; text-align:center;">
          💡 ¿Tienes tu API Key de Gemini? Ingrésala en <a href="#" id="link-go-settings" style="color:#a78bfa; text-decoration:underline;">Ajustes</a> para análisis personalizado ilimitado.
        </div>
      ` : ''}
    </div>

    <!-- Active Real-time Decision Simulator Counter -->
    <div class="simulator-box">
      <div class="simulator-header">
        <div>
          <div style="font-weight:700; font-size:0.95rem;">Simulador de Decisión Activa</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Activa qué gastos decides posponer este mes:</div>
        </div>
        <div class="realtime-savings">
          ${Icons.checkCircle('icon')}
          <span>+${curr}${activePostponed} Ahorrados</span>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.05); border-radius:8px; height:8px; overflow:hidden; margin-top:8px;">
        <div style="height:100%; width:${potentialSavings > 0 ? Math.min(100, Math.round((activePostponed / potentialSavings) * 100)) : 0}%; background:var(--accent-emerald); transition:width 0.3s ease;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.7rem; color:var(--text-muted); margin-top:4px;">
        <span>Ahorro aplicado: ${curr}${activePostponed}</span>
        <span>Meta sugerida por IA: ${curr}${potentialSavings}</span>
      </div>
    </div>

    ${analysis ? `
      <!-- AI Diagnosis & Health Score -->
      <div class="ai-diagnosis-card">
        <div class="diagnosis-header">
          <div>
            <div style="font-size:0.75rem; color:#c7d2fe; text-transform:uppercase; letter-spacing:0.05em;">Diagnóstico IA</div>
            <div style="font-family:var(--font-display); font-size:1.4rem; font-weight:800;">
              Salud Financiera
            </div>
          </div>
          <div class="health-pill ${analysis.financialHealth}">
            ${analysis.financialHealth} (${analysis.healthScore}/100)
          </div>
        </div>

        <p style="font-size:0.88rem; color:var(--text-primary); line-height:1.5;">
          ${escapeHtml(analysis.summary)}
        </p>

        <div class="savings-banner">
          <div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Ahorro Mensual Sugerido</div>
            <div class="savings-banner-val">${curr}${analysis.totalPotentialSavings.toLocaleString()}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.75rem; color:var(--text-muted);">Ahorro Proyectado 1 Año</div>
            <div style="font-family:var(--font-display); font-size:1.15rem; font-weight:700; color:#38bdf8;">
              ${curr}${(analysis.totalPotentialSavings * 12).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <!-- Action Plan -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">${Icons.target()} Plan de Acción Recomendado</span>
        </div>
        <ul class="action-plan-list">
          ${(analysis.actionPlan || []).map((step, i) => `
            <li class="action-plan-item">
              <span style="font-weight:700; color:var(--accent-purple);">${i + 1}.</span>
              <span>${escapeHtml(step)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : ''}

    <!-- SECTION: Gastos Posponibles / En Segundo Plano -->
    <div style="margin: 24px 0 12px 0;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.2rem;">⏳</span>
        <h3 style="font-family:var(--font-display); font-size:1.05rem; font-weight:700; color:#fbbf24;">
          Gastos en Segundo Plano (Posponibles)
        </h3>
      </div>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
        Gastos que puedes aplazar para el próximo mes sin comprometer necesidades básicas.
      </p>
    </div>

    ${byPriority.posponible.length === 0 ? `
      <div class="card" style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.85rem;">
        No hay gastos marcados como posponibles actualmente.
      </div>
    ` : byPriority.posponible.map(e => renderDecisionItem(e, curr)).join('')}

    <!-- SECTION: Gastos Prescindibles / Recorte Inmediato -->
    <div style="margin: 24px 0 12px 0;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.2rem;">✂️</span>
        <h3 style="font-family:var(--font-display); font-size:1.05rem; font-weight:700; color:#fb7185;">
          Gastos Prescindibles (Ahorro Inmediato)
        </h3>
      </div>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
        Gastos no críticos o suscripciones superfluas que conviene eliminar.
      </p>
    </div>

    ${byPriority.prescindible.length === 0 ? `
      <div class="card" style="text-align:center; padding:18px; color:var(--text-muted); font-size:0.85rem;">
        No hay gastos prescindibles detectados.
      </div>
    ` : byPriority.prescindible.map(e => renderDecisionItem(e, curr)).join('')}

    <!-- SECTION: Gastos Esenciales / Primer Plano -->
    <div style="margin: 24px 0 12px 0;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.2rem;">🛡️</span>
        <h3 style="font-family:var(--font-display); font-size:1.05rem; font-weight:700; color:#34d399;">
          Gastos en Primer Plano (Esenciales / Intocables)
        </h3>
      </div>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
        Gastos prioritarios protegidos: vivienda, alimentación básica, salud y deudas legales.
      </p>
    </div>

    ${byPriority.esencial.map(e => `
      <div class="decision-card" style="border-left: 3px solid #10b981;">
        <div class="decision-top">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:#10b981;">${Icons.lock('icon')}</span>
            <span style="font-weight:700; font-size:0.95rem;">${escapeHtml(e.name)}</span>
          </div>
          <span style="font-weight:700; font-family:var(--font-display); font-size:1rem;">
            ${curr}${Number(e.amount).toLocaleString()}
          </span>
        </div>
        <div class="decision-reason">
          ${escapeHtml(e.aiReason || 'Gasto vital imprescindible para subsistencia o cumplimiento contractual.')}
        </div>
        <div style="font-size:0.72rem; color:#34d399; font-weight:600;">
          ✓ Prioridad protegida: no se recomienda recortar.
        </div>
      </div>
    `).join('')}
  `;
}

function renderDecisionItem(e, curr) {
  return `
    <div class="decision-card ${e.isPostponed ? 'active-cut' : ''}" data-id="${e.id}">
      <div class="decision-top">
        <div>
          <span style="font-weight:700; font-size:0.95rem;">${escapeHtml(e.name)}</span>
          <div style="font-size:0.75rem; color:var(--text-muted);">${e.category}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-weight:700; font-family:var(--font-display); font-size:1.05rem; ${e.isPostponed ? 'color:#34d399; text-decoration:line-through;' : ''}">
            ${curr}${Number(e.amount).toLocaleString()}
          </span>
          <label class="toggle-switch" title="Posponer este gasto para ahorrar">
            <input type="checkbox" class="toggle-postpone-expense" data-id="${e.id}" ${e.isPostponed ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <div class="decision-reason">
        ${escapeHtml(e.aiReason || 'Gasto secundario: aplazarlo te otorga margen financiero inmediato.')}
      </div>

      <div class="decision-rec">
        ${e.isPostponed ? `
          <span style="color:#34d399; font-weight:700;">
            ✓ Gasto pospuesto: ¡Liberaste ${curr}${e.amount} para ahorro!
          </span>
        ` : `
          <span>👉 Toca el switch para posponer este gasto y sumarlo a tu ahorro</span>
        `}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------
// TAB 3: PROYECCIÓN & METAS DE AHORRO
// -------------------------------------------------------------------
export function renderSavingsTab(container) {
  const curr = State.data.currency;
  const postponed = State.getActivePostponedSavings();
  const potential = State.getPotentialAiSavings();
  const baseBalance = Math.max(0, State.getRemainingBalance());
  const effectiveMonthlySaving = baseBalance + postponed;
  const goals = State.data.savingsGoals || [];

  container.innerHTML = `
    <!-- Savings Projections Card -->
    <div class="card balance-hero">
      <div class="balance-label">Ahorro Mensual Activo</div>
      <div class="balance-amount positive">
        ${curr}${effectiveMonthlySaving.toLocaleString()}
      </div>
      <div style="font-size:0.8rem; color:#c7d2fe; margin-bottom:14px;">
        Basado en tu balance disponible y gastos pospuestos con IA.
      </div>

      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-label">En 3 Meses</span>
          <span class="metric-value savings">${curr}${(effectiveMonthlySaving * 3).toLocaleString()}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">En 6 Meses</span>
          <span class="metric-value savings">${curr}${(effectiveMonthlySaving * 6).toLocaleString()}</span>
        </div>
        <div class="metric-item" style="grid-column: span 2; margin-top:8px;">
          <span class="metric-label">En 1 Año (12 Meses)</span>
          <span class="metric-value savings" style="font-size:1.4rem;">${curr}${(effectiveMonthlySaving * 12).toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Comparison Card: Current vs Optimized -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">${Icons.trendingUp()} Comparativa de Presupuesto</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>Presupuesto Actual (Sin optimizar)</span>
            <span style="font-weight:700;">${curr}${State.getTotalExpenses()} gastos</span>
          </div>
          <div style="background:rgba(244,63,94,0.15); height:10px; border-radius:5px; overflow:hidden;">
            <div style="height:100%; width:100%; background:#f43f5e;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span style="color:#34d399;">Presupuesto Optimizado (Con IA)</span>
            <span style="font-weight:700; color:#34d399;">
              ${curr}${Math.max(0, State.getTotalExpenses() - postponed)} gastos
            </span>
          </div>
          <div style="background:rgba(16,185,129,0.15); height:10px; border-radius:5px; overflow:hidden;">
            <div style="height:100%; width:${State.getTotalExpenses() > 0 ? Math.max(10, Math.round(((State.getTotalExpenses() - postponed) / State.getTotalExpenses()) * 100)) : 0}%; background:#10b981;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Savings Goals Section -->
    <div style="display:flex; align-items:center; justify-content:space-between; margin: 24px 0 12px 0;">
      <h3 style="font-family:var(--font-display); font-size:1.05rem; font-weight:700;">
        Metas de Ahorro
      </h3>
      <button class="btn-secondary" id="btn-add-goal" style="font-size:0.8rem; padding:6px 12px;">
        ${Icons.plus()} Nueva Meta
      </button>
    </div>

    <div id="goals-list">
      ${goals.length === 0 ? `
        <div class="card" style="text-align:center; padding:20px; color:var(--text-muted); font-size:0.85rem;">
          Añade tus metas (Fondo de emergencia, viaje, comprar algo) para ver cómo el dinero pospuesto te ayuda a alcanzarlas.
        </div>
      ` : goals.map(g => renderGoalCard(g, curr, effectiveMonthlySaving)).join('')}
    </div>
  `;
}

function renderGoalCard(goal, curr, monthlySaving) {
  const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const monthsNeeded = monthlySaving > 0 ? Math.ceil(remaining / monthlySaving) : 0;

  return `
    <div class="card" style="margin-bottom:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
        <span style="font-weight:700; font-size:1rem;">${escapeHtml(goal.name)}</span>
        <button class="btn-icon-del btn-delete-goal" data-id="${goal.id}" title="Eliminar meta">
          ${Icons.trash()}
        </button>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:0.82rem; color:var(--text-secondary); margin-bottom:6px;">
        <span>Progreso: ${curr}${goal.currentAmount.toLocaleString()} de ${curr}${goal.targetAmount.toLocaleString()}</span>
        <span style="font-weight:700; color:#38bdf8;">${percent}%</span>
      </div>

      <div style="background:rgba(255,255,255,0.08); height:8px; border-radius:4px; overflow:hidden; margin-bottom:8px;">
        <div style="height:100%; width:${percent}%; background:linear-gradient(90deg, #6366f1, #38bdf8);"></div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--text-muted);">
        <span>
          ${monthlySaving > 0 
            ? `⏱️ Se alcanzará en aprox. <strong>${monthsNeeded} meses</strong> con tu ahorro actual.` 
            : '💡 Posponiendo gastos secundarios acelerarás esta meta.'}
        </span>
        <button class="btn-secondary btn-contribute-goal" data-id="${goal.id}" style="font-size:0.72rem; padding:4px 8px;">
          + Aportar
        </button>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------------
// TAB 4: AJUSTES & CONFIGURACIÓN DE IA
// -------------------------------------------------------------------
export function renderSettingsTab(container) {
  const curr = State.data.currency;
  const apiKey = State.data.apiKey;
  const selectedModel = State.data.selectedModel;

  container.innerHTML = `
    <!-- Gemini AI Configuration -->
    <div class="card card-ai-glow">
      <div class="card-header">
        <span class="card-title">${Icons.sparkles()} Configuración de Google Gemini API</span>
      </div>
      <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:14px;">
        Ingresa tu API Key de Google Gemini para habilitar el análisis avanzado, justificaciones en vivo y asesoría profunda. Si la dejas en blanco, la app operará con el motor inteligente local offline.
      </p>

      <div class="form-group">
        <label class="form-label">Google Gemini API Key</label>
        <input type="password" id="input-api-key" class="form-input" placeholder="AIzaSy..." value="${escapeHtml(apiKey)}">
      </div>

      <div class="form-group">
        <label class="form-label">Modelo de Gemini</label>
        <select id="select-ai-model" class="form-select">
          <option value="gemini-2.0-flash" ${selectedModel === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash (Recomendado - Ultrarrápido y Preciso)</option>
          <option value="gemini-1.5-flash" ${selectedModel === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash</option>
          <option value="gemini-1.5-pro" ${selectedModel === 'gemini-1.5-pro' ? 'selected' : ''}>Gemini 1.5 Pro</option>
        </select>
      </div>

      <div style="display:flex; gap:10px; margin-top:10px;">
        <button class="btn-primary" id="btn-save-api-key" style="flex:1;">
          Guardar Clave
        </button>
        <button class="btn-secondary" id="btn-test-gemini" style="flex:1;">
          Probar Conexión
        </button>
      </div>

      <div id="api-test-result" style="margin-top:12px; font-size:0.8rem; display:none;"></div>

      <div style="margin-top:14px; padding:10px; background:rgba(255,255,255,0.03); border-radius:8px; font-size:0.75rem; color:var(--text-muted);">
        📌 <strong>¿Cómo conseguir una API Key gratis?</strong>
        <br>1. Ve a <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:#a78bfa; text-decoration:underline;">Google AI Studio</a>.
        <br>2. Inicia sesión con tu cuenta de Google.
        <br>3. Haz clic en "Create API Key" y pégala aquí.
      </div>
    </div>

    <!-- General Settings -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">${Icons.settings()} Preferencias Generales</span>
      </div>

      <div class="form-group">
        <label class="form-label">Moneda</label>
        <select id="select-currency" class="form-select">
          <option value="$" ${curr === '$' ? 'selected' : ''}>$ (Dólar / Peso)</option>
          <option value="€" ${curr === '€' ? 'selected' : ''}>€ (Euro)</option>
          <option value="S/." ${curr === 'S/.' ? 'selected' : ''}>S/. (Sol Peruano)</option>
          <option value="Bs" ${curr === 'Bs' ? 'selected' : ''}>Bs (Boliviano)</option>
          <option value="R$" ${curr === 'R$' ? 'selected' : ''}>R$ (Real Brasileño)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Ingreso Mensual Base</label>
        <input type="number" id="input-monthly-income" class="form-input" value="${State.data.income}">
      </div>

      <button class="btn-secondary" id="btn-save-general-settings" style="width:100%;">
        Guardar Preferencias
      </button>
    </div>

    <!-- Data Management & Backups -->
    <div class="card">
      <div class="card-header">
        <span class="card-title">${Icons.download()} Gestión de Datos</span>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px;">
        <button class="btn-secondary" id="btn-load-sample-data">
          ${Icons.refresh()} Cargar Datos de Ejemplo (Demostración)
        </button>

        <button class="btn-secondary" id="btn-export-json">
          ${Icons.download()} Exportar Presupuesto (JSON)
        </button>

        <label class="btn-secondary" style="cursor:pointer; text-align:center;">
          ${Icons.upload()} Importar Presupuesto
          <input type="file" id="input-import-json" accept=".json" style="display:none;">
        </label>

        <button class="btn-danger" id="btn-reset-data" style="margin-top:6px;">
          ${Icons.trash()} Borrar Todo y Restablecer
        </button>
      </div>
    </div>

    <!-- APK Android Info -->
    <div class="card" style="border-left: 3px solid #38bdf8;">
      <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">Compilación para Android APK</div>
      <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4;">
        Este proyecto incluye el entorno nativo de Android en la carpeta <code>android/</code> mediante Capacitor.
        Para compilar tu APK:
      </p>
      <ol style="font-size:0.75rem; color:var(--text-muted); padding-left:18px; margin-top:6px; line-height:1.5;">
        <li>Ejecuta <code>npm run cap:sync</code> para sincronizar cambios.</li>
        <li>Abre la carpeta <code>android</code> en <strong>Android Studio</strong>.</li>
        <li>Haz clic en <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
      </ol>
    </div>
  `;
}

// -------------------------------------------------------------------
// MODAL SHEETS (Add Expense, Edit Income, Add Goal)
// -------------------------------------------------------------------
export function renderAddExpenseModal() {
  const root = document.getElementById('modals-root');
  root.innerHTML = `
    <div class="modal-overlay open" id="modal-expense-overlay">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <span class="modal-title">Añadir Nuevo Gasto</span>
          <button class="icon-btn" id="btn-close-expense-modal">
            ${Icons.x()}
          </button>
        </div>

        <form id="form-add-expense">
          <div class="form-group">
            <label class="form-label">Nombre del Concepto o Gasto *</label>
            <input type="text" id="exp-name" class="form-input" placeholder="Ej. Alquiler, Cenas fin de semana, Netflix..." required autofocus>
          </div>

          <div class="form-group">
            <label class="form-label">Monto (${State.data.currency}) *</label>
            <input type="number" id="exp-amount" class="form-input" placeholder="0.00" step="0.01" min="0.01" required>
          </div>

          <div class="form-group">
            <label class="form-label">Categoría</label>
            <select id="exp-category" class="form-select">
              ${CATEGORIES.map(c => `
                <option value="${c.id}">${c.icon} ${c.label}</option>
              `).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Frecuencia</label>
            <select id="exp-period" class="form-select">
              <option value="mensual">Mensual (Frecuente)</option>
              <option value="quincenal">Quincenal</option>
              <option value="ocasional">Ocasional / Único</option>
            </select>
          </div>

          <button type="submit" class="btn-primary" style="width:100%; margin-top:10px; padding:14px;">
            Guardar Gasto
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderIncomeModal() {
  const root = document.getElementById('modals-root');
  root.innerHTML = `
    <div class="modal-overlay open" id="modal-income-overlay">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <span class="modal-title">Actualizar Ingreso Mensual</span>
          <button class="icon-btn" id="btn-close-income-modal">
            ${Icons.x()}
          </button>
        </div>

        <form id="form-edit-income">
          <div class="form-group">
            <label class="form-label">Ingreso Total (${State.data.currency})</label>
            <input type="number" id="income-amount" class="form-input" value="${State.data.income}" min="0" step="1" required autofocus>
            <span style="font-size:0.75rem; color:var(--text-muted); margin-top:4px; display:block;">
              Incluye salario neto, honorarios y cualquier ingreso fijo disponible cada mes.
            </span>
          </div>

          <button type="submit" class="btn-primary" style="width:100%; margin-top:10px; padding:14px;">
            Actualizar Ingreso
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderAddGoalModal() {
  const root = document.getElementById('modals-root');
  root.innerHTML = `
    <div class="modal-overlay open" id="modal-goal-overlay">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <span class="modal-title">Nueva Meta de Ahorro</span>
          <button class="icon-btn" id="btn-close-goal-modal">
            ${Icons.x()}
          </button>
        </div>

        <form id="form-add-goal">
          <div class="form-group">
            <label class="form-label">Nombre de la Meta *</label>
            <input type="text" id="goal-name" class="form-input" placeholder="Ej. Fondo de Emergencia, Vacaciones, Celular..." required autofocus>
          </div>

          <div class="form-group">
            <label class="form-label">Monto Objetivo (${State.data.currency}) *</label>
            <input type="number" id="goal-target" class="form-input" placeholder="1000" min="1" step="1" required>
          </div>

          <div class="form-group">
            <label class="form-label">Monto Inicial Ahorrado (${State.data.currency})</label>
            <input type="number" id="goal-current" class="form-input" value="0" min="0" step="1">
          </div>

          <button type="submit" class="btn-primary" style="width:100%; margin-top:10px; padding:14px;">
            Crear Meta
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderContributeGoalModal(goalId) {
  const goal = State.data.savingsGoals.find(g => g.id === goalId);
  if (!goal) return;

  const root = document.getElementById('modals-root');
  root.innerHTML = `
    <div class="modal-overlay open" id="modal-contribute-overlay">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <span class="modal-title">Aportar a "${escapeHtml(goal.name)}"</span>
          <button class="icon-btn" id="btn-close-contribute-modal">
            ${Icons.x()}
          </button>
        </div>

        <form id="form-contribute-goal">
          <div class="form-group">
            <label class="form-label">Monto a Sumar (${State.data.currency}) *</label>
            <input type="number" id="contribute-amount" class="form-input" placeholder="50" min="1" step="1" required autofocus>
          </div>

          <button type="submit" class="btn-primary" style="width:100%; margin-top:10px; padding:14px;">
            Registrar Aporte
          </button>
        </form>
      </div>
    </div>
  `;
}

export function closeModal() {
  const root = document.getElementById('modals-root');
  if (root) root.innerHTML = '';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
