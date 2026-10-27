// Main Application Controller & Event Coordinator for AhorroIA
import './style.css';
import { State } from './state.js';
import {
  renderAppShell,
  renderBudgetTab,
  renderAiAdvisorTab,
  renderSavingsTab,
  renderSettingsTab,
  renderAddExpenseModal,
  renderIncomeModal,
  renderAddGoalModal,
  renderContributeGoalModal,
  closeModal,
  showToast
} from './ui.js';
import { analyzeBudgetWithGemini, testGeminiConnection } from './geminiApi.js';

let currentTab = 'budget';

function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  renderAppShell(app);
  switchTab(currentTab);
  attachGlobalEventListeners();
}

function switchTab(tabName) {
  currentTab = tabName;
  const container = document.getElementById('tab-container');
  if (!container) return;

  // Update navigation tab highlights
  document.querySelectorAll('.nav-tab').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Render view
  if (tabName === 'budget') {
    renderBudgetTab(container);
  } else if (tabName === 'ai') {
    renderAiAdvisorTab(container);
  } else if (tabName === 'savings') {
    renderSavingsTab(container);
  } else if (tabName === 'settings') {
    renderSettingsTab(container);
  }
}

function attachGlobalEventListeners() {
  const app = document.getElementById('app');

  // Bottom Navigation Click
  app.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.nav-tab');
    if (tabBtn) {
      const tab = tabBtn.dataset.tab;
      if (tab) switchTab(tab);
      return;
    }

    // Quick Income Button in Header
    if (e.target.closest('#btn-quick-income')) {
      renderIncomeModal();
      return;
    }

    // Quick Settings Button in Header
    if (e.target.closest('#btn-quick-settings')) {
      switchTab('settings');
      return;
    }

    // Trigger AI Card
    if (e.target.closest('#card-trigger-ai')) {
      switchTab('ai');
      return;
    }

    // FAB Add Expense
    if (e.target.closest('#fab-add-expense') || e.target.closest('#btn-add-expense-text')) {
      renderAddExpenseModal();
      return;
    }

    // Load sample data button (empty state)
    if (e.target.closest('#btn-load-samples-empty') || e.target.closest('#btn-load-sample-data')) {
      State.resetToDefaults();
      showToast('Presupuesto de demostración cargado');
      switchTab(currentTab);
      return;
    }

    // Delete Expense
    const delBtn = e.target.closest('.btn-delete-expense');
    if (delBtn) {
      const id = delBtn.dataset.id;
      if (confirm('¿Deseas eliminar este gasto?')) {
        State.deleteExpense(id);
        showToast('Gasto eliminado');
        switchTab(currentTab);
      }
      return;
    }

    // Add Goal Button
    if (e.target.closest('#btn-add-goal')) {
      renderAddGoalModal();
      return;
    }

    // Delete Goal Button
    const delGoalBtn = e.target.closest('.btn-delete-goal');
    if (delGoalBtn) {
      const id = delGoalBtn.dataset.id;
      if (confirm('¿Eliminar esta meta de ahorro?')) {
        State.deleteSavingsGoal(id);
        showToast('Meta eliminada');
        switchTab(currentTab);
      }
      return;
    }

    // Contribute Goal Button
    const contributeBtn = e.target.closest('.btn-contribute-goal');
    if (contributeBtn) {
      const id = contributeBtn.dataset.id;
      renderContributeGoalModal(id);
      return;
    }

    // Modal Close Buttons
    if (
      e.target.closest('#btn-close-expense-modal') ||
      e.target.closest('#btn-close-income-modal') ||
      e.target.closest('#btn-close-goal-modal') ||
      e.target.closest('#btn-close-contribute-modal') ||
      e.target.classList.contains('modal-overlay')
    ) {
      closeModal();
      return;
    }

    // Link to go to settings from AI tab
    if (e.target.closest('#link-go-settings')) {
      e.preventDefault();
      switchTab('settings');
      return;
    }

    // Save API Key in Settings
    if (e.target.closest('#btn-save-api-key')) {
      const input = document.getElementById('input-api-key');
      const selectModel = document.getElementById('select-ai-model');
      if (input) State.setApiKey(input.value);
      if (selectModel) State.setModel(selectModel.value);
      showToast('Configuración de Gemini guardada');
      return;
    }

    // Test Gemini Connection Button
    if (e.target.closest('#btn-test-gemini')) {
      handleTestGemini();
      return;
    }

    // Save General Settings
    if (e.target.closest('#btn-save-general-settings')) {
      const currSelect = document.getElementById('select-currency');
      const incomeInput = document.getElementById('input-monthly-income');
      if (currSelect) State.setCurrency(currSelect.value);
      if (incomeInput) State.setIncome(incomeInput.value);
      showToast('Preferencias actualizadas');
      return;
    }

    // Export Data JSON
    if (e.target.closest('#btn-export-json')) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(State.exportData());
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `presupuesto_ia_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Archivo JSON descargado');
      return;
    }

    // Reset Data
    if (e.target.closest('#btn-reset-data')) {
      if (confirm('¿Estás seguro de que deseas borrar todos tus datos y reiniciar la app?')) {
        localStorage.clear();
        State.resetToDefaults();
        showToast('App restablecida de fábrica');
        switchTab('budget');
      }
      return;
    }

    // Run AI Analysis Button
    if (e.target.closest('#btn-run-ai-analysis')) {
      handleRunAiAnalysis();
      return;
    }
  });

  // Postpone Switch change (delegated)
  app.addEventListener('change', (e) => {
    if (e.target.classList.contains('toggle-postpone-expense')) {
      const id = e.target.dataset.id;
      State.togglePostponeExpense(id);
      const expense = State.data.expenses.find(x => x.id === id);
      if (expense) {
        showToast(
          expense.isPostponed 
            ? `¡Gasto pospuesto! Liberaste ${State.data.currency}${expense.amount}` 
            : `Gasto restaurado en presupuesto`
        );
      }
      // Re-render current tab without full reset
      switchTab(currentTab);
    }

    // Import JSON File
    if (e.target.id === 'input-import-json') {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = State.importData(evt.target.result);
          if (res.success) {
            showToast('Presupuesto importado con éxito');
            switchTab('budget');
          } else {
            showToast('Error al importar: ' + res.error, 'error');
          }
        };
        reader.readAsText(file);
      }
    }
  });

  // Form Submissions
  app.addEventListener('submit', (e) => {
    e.preventDefault();

    // Add Expense Form
    if (e.target.id === 'form-add-expense') {
      const name = document.getElementById('exp-name')?.value;
      const amount = document.getElementById('exp-amount')?.value;
      const category = document.getElementById('exp-category')?.value;
      const period = document.getElementById('exp-period')?.value;

      if (name && amount) {
        State.addExpense({ name, amount, category, period });
        closeModal();
        showToast(`Gasto "${name}" guardado`);
        switchTab(currentTab);
      }
      return;
    }

    // Edit Income Form
    if (e.target.id === 'form-edit-income') {
      const income = document.getElementById('income-amount')?.value;
      if (income !== undefined) {
        State.setIncome(income);
        closeModal();
        showToast('Ingreso mensual actualizado');
        switchTab(currentTab);
      }
      return;
    }

    // Add Goal Form
    if (e.target.id === 'form-add-goal') {
      const name = document.getElementById('goal-name')?.value;
      const targetAmount = document.getElementById('goal-target')?.value;
      const currentAmount = document.getElementById('goal-current')?.value;

      if (name && targetAmount) {
        State.addSavingsGoal({ name, targetAmount, currentAmount });
        closeModal();
        showToast(`Meta "${name}" creada`);
        switchTab('savings');
      }
      return;
    }

    // Contribute Goal Form
    if (e.target.id === 'form-contribute-goal') {
      const amount = document.getElementById('contribute-amount')?.value;
      const modal = document.getElementById('modal-contribute-overlay');
      const title = modal?.querySelector('.modal-title')?.textContent || '';
      // Extract goal name
      const goal = State.data.savingsGoals.find(g => title.includes(g.name));

      if (goal && amount) {
        const newTotal = (Number(goal.currentAmount) || 0) + Number(amount);
        State.updateSavingsGoal(goal.id, { currentAmount: newTotal });
        closeModal();
        showToast(`¡Aporte de ${State.data.currency}${amount} registrado!`);
        switchTab('savings');
      }
      return;
    }
  });
}

// AI Analysis Handler
async function handleRunAiAnalysis() {
  const btn = document.getElementById('btn-run-ai-analysis');
  if (!btn) return;

  const originalContent = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> <span>Consultando IA y clasificando gastos...</span>`;

  try {
    const analysis = await analyzeBudgetWithGemini(
      State.data.income,
      State.data.expenses,
      State.data.apiKey,
      State.data.selectedModel,
      State.data.currency
    );

    State.setAiAnalysisResults(analysis);
    showToast(`¡Análisis completado! Ahorro potencial: ${State.data.currency}${analysis.totalPotentialSavings}`);
    switchTab('ai');
  } catch (err) {
    showToast('Error en el análisis: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  }
}

// Test Gemini Connection Handler
async function handleTestGemini() {
  const input = document.getElementById('input-api-key');
  const select = document.getElementById('select-ai-model');
  const resultDiv = document.getElementById('api-test-result');
  const btn = document.getElementById('btn-test-gemini');

  const apiKey = input?.value || State.data.apiKey;
  const model = select?.value || State.data.selectedModel;

  if (resultDiv) {
    resultDiv.style.display = 'block';
    resultDiv.style.color = '#38bdf8';
    resultDiv.textContent = 'Verificando clave con Google Gemini...';
  }
  if (btn) btn.disabled = true;

  const res = await testGeminiConnection(apiKey, model);

  if (btn) btn.disabled = false;

  if (resultDiv) {
    if (res.ok) {
      resultDiv.style.color = '#34d399';
      resultDiv.textContent = `✓ ${res.message} (Modelo respondió: "${res.reply}")`;
      State.setApiKey(apiKey);
      State.setModel(model);
      showToast('API Key verificada y guardada correctamente');
    } else {
      resultDiv.style.color = '#fb7185';
      resultDiv.textContent = `✗ Error: ${res.error}`;
      showToast('Fallo en la prueba de API Key', 'error');
    }
  }
}

// Initialize on DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
