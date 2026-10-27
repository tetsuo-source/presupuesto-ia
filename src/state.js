// State management & LocalStorage persistence for Presupuesto IA

const STORAGE_KEY = 'presupuesto_ia_data_v1';

export const CATEGORIES = [
  { id: 'vivienda', label: 'Vivienda (Alquiler/Hipoteca)', icon: '🏠', color: '#3b82f6' },
  { id: 'alimentacion', label: 'Alimentación & Supermercado', icon: '🛒', color: '#10b981' },
  { id: 'servicios', label: 'Servicios Básicos (Luz, Agua, Gas, Net)', icon: '💡', color: '#f59e0b' },
  { id: 'transporte', label: 'Transporte & Gasolina', icon: '🚗', color: '#6366f1' },
  { id: 'salud', label: 'Salud & Medicamentos', icon: '💊', color: '#ef4444' },
  { id: 'ocio', label: 'Ocio, Restaurantes & Salidas', icon: '🎉', color: '#ec4899' },
  { id: 'suscripciones', label: 'Suscripciones & Streaming', icon: '📱', color: '#8b5cf6' },
  { id: 'compras', label: 'Ropa, Tecnología & Caprichos', icon: '🛍️', color: '#14b8a6' },
  { id: 'deudas', label: 'Préstamos & Tarjetas', icon: '💳', color: '#f43f5e' },
  { id: 'educacion', label: 'Educación & Cursos', icon: '📚', color: '#06b6d4' },
  { id: 'otros', label: 'Otros Gastos', icon: '📦', color: '#64748b' }
];

export const INITIAL_SAMPLE_DATA = {
  income: 2400,
  currency: '$',
  apiKey: '',
  selectedModel: 'gemini-2.0-flash',
  expenses: [
    {
      id: 'exp-1',
      name: 'Alquiler Departamento',
      amount: 750,
      category: 'vivienda',
      period: 'mensual',
      aiCategory: 'esencial',
      aiReason: 'Gasto obligatorio para vivienda; no puede posponerse.',
      isPostponed: false
    },
    {
      id: 'exp-2',
      name: 'Supermercado y Alimentos Básicos',
      amount: 380,
      category: 'alimentacion',
      period: 'mensual',
      aiCategory: 'esencial',
      aiReason: 'Nutrición básica esencial para el hogar.',
      isPostponed: false
    },
    {
      id: 'exp-3',
      name: 'Servicios (Luz, Agua, Gas)',
      amount: 95,
      category: 'servicios',
      period: 'mensual',
      aiCategory: 'esencial',
      aiReason: 'Servicios básicos obligatorios para evitar cortes.',
      isPostponed: false
    },
    {
      id: 'exp-4',
      name: 'Internet y Telefonía',
      amount: 50,
      category: 'servicios',
      period: 'mensual',
      aiCategory: 'esencial',
      aiReason: 'Necesario para trabajo y comunicación esencial.',
      isPostponed: false
    },
    {
      id: 'exp-5',
      name: 'Transporte y Combustible',
      amount: 110,
      category: 'transporte',
      period: 'mensual',
      aiCategory: 'esencial',
      aiReason: 'Movilidad diaria para actividades laborales.',
      isPostponed: false
    },
    {
      id: 'exp-6',
      name: 'Cenas en Restaurantes & Delivery',
      amount: 240,
      category: 'ocio',
      period: 'mensual',
      aiCategory: 'posponible',
      aiReason: 'Gasto secundario: se puede sustituir cocinando en casa o aplazar este mes.',
      isPostponed: false
    },
    {
      id: 'exp-7',
      name: 'Suscripciones (Netflix, Spotify, HBO)',
      amount: 45,
      category: 'suscripciones',
      period: 'mensual',
      aiCategory: 'posponible',
      aiReason: 'Gasto de entretenimiento que puede pausarse temporalmente.',
      isPostponed: false
    },
    {
      id: 'exp-8',
      name: 'Ropa de marca no urgente',
      amount: 160,
      category: 'compras',
      period: 'mensual',
      aiCategory: 'posponible',
      aiReason: 'Compra posponible para el siguiente trimestre sin impacto crítico.',
      isPostponed: false
    },
    {
      id: 'exp-9',
      name: 'Salidas nocturnas y copas',
      amount: 150,
      category: 'ocio',
      period: 'mensual',
      aiCategory: 'prescindible',
      aiReason: 'Gasto recreativo prescindible; ahorro inmediato de alto impacto.',
      isPostponed: false
    },
    {
      id: 'exp-10',
      name: 'Compras impulsivas en apps',
      amount: 70,
      category: 'compras',
      period: 'mensual',
      aiCategory: 'prescindible',
      aiReason: 'Gasto hormiga totalmente evitable este mes.',
      isPostponed: false
    }
  ],
  savingsGoals: [
    {
      id: 'goal-1',
      name: 'Fondo de Emergencia (3 meses)',
      targetAmount: 3000,
      currentAmount: 1100
    },
    {
      id: 'goal-2',
      name: 'Viaje / Vacaciones',
      targetAmount: 1200,
      currentAmount: 350
    }
  ],
  lastAiAnalysis: null
};

class StateManager {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...INITIAL_SAMPLE_DATA, ...parsed };
      }
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  resetToDefaults() {
    this.data = JSON.parse(JSON.stringify(INITIAL_SAMPLE_DATA));
    this.save();
  }

  setIncome(amount) {
    this.data.income = Math.max(0, Number(amount) || 0);
    this.save();
  }

  setCurrency(curr) {
    this.data.currency = curr || '$';
    this.save();
  }

  setApiKey(key) {
    this.data.apiKey = (key || '').trim();
    this.save();
  }

  setModel(model) {
    this.data.selectedModel = model || 'gemini-2.0-flash';
    this.save();
  }

  addExpense(expense) {
    const newExp = {
      id: 'exp-' + Date.now(),
      name: expense.name.trim(),
      amount: Math.max(0, Number(expense.amount) || 0),
      category: expense.category || 'otros',
      period: expense.period || 'mensual',
      aiCategory: null,
      aiReason: null,
      isPostponed: false
    };
    this.data.expenses.push(newExp);
    this.save();
    return newExp;
  }

  updateExpense(id, updates) {
    const idx = this.data.expenses.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.data.expenses[idx] = { ...this.data.expenses[idx], ...updates };
      this.save();
    }
  }

  togglePostponeExpense(id) {
    const expense = this.data.expenses.find(e => e.id === id);
    if (expense) {
      expense.isPostponed = !expense.isPostponed;
      this.save();
    }
  }

  deleteExpense(id) {
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
  }

  addSavingsGoal(goal) {
    const newGoal = {
      id: 'goal-' + Date.now(),
      name: goal.name.trim(),
      targetAmount: Math.max(1, Number(goal.targetAmount) || 100),
      currentAmount: Math.max(0, Number(goal.currentAmount) || 0)
    };
    this.data.savingsGoals.push(newGoal);
    this.save();
  }

  updateSavingsGoal(id, updates) {
    const idx = this.data.savingsGoals.findIndex(g => g.id === id);
    if (idx !== -1) {
      this.data.savingsGoals[idx] = { ...this.data.savingsGoals[idx], ...updates };
      this.save();
    }
  }

  deleteSavingsGoal(id) {
    this.data.savingsGoals = this.data.savingsGoals.filter(g => g.id !== id);
    this.save();
  }

  setAiAnalysisResults(analysis) {
    this.data.lastAiAnalysis = {
      ...analysis,
      timestamp: new Date().toISOString()
    };
    // Update individual expenses with classifications
    if (Array.isArray(analysis.classifiedExpenses)) {
      analysis.classifiedExpenses.forEach(item => {
        const exp = this.data.expenses.find(e => e.id === item.id || e.name.toLowerCase() === item.name?.toLowerCase());
        if (exp) {
          exp.aiCategory = item.priority; // 'esencial' | 'posponible' | 'prescindible'
          exp.aiReason = item.reason;
        }
      });
    }
    this.save();
  }

  // Financial Computations
  getTotalIncome() {
    return this.data.income;
  }

  getTotalExpenses() {
    return this.data.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  getRemainingBalance() {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  // Amount saved by expenses currently marked as postponed by user
  getActivePostponedSavings() {
    return this.data.expenses
      .filter(e => e.isPostponed)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  // Potential savings if all posponible + prescindible expenses were postponed
  getPotentialAiSavings() {
    return this.data.expenses
      .filter(e => e.aiCategory === 'posponible' || e.aiCategory === 'prescindible')
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }

  getOptimizedBalance() {
    return this.getRemainingBalance() + this.getActivePostponedSavings();
  }

  getExpensesByCategory() {
    const map = {};
    CATEGORIES.forEach(c => { map[c.id] = 0; });
    this.data.expenses.forEach(e => {
      const cat = e.category || 'otros';
      map[cat] = (map[cat] || 0) + (Number(e.amount) || 0);
    });
    return map;
  }

  getExpensesByAiPriority() {
    return {
      esencial: this.data.expenses.filter(e => e.aiCategory === 'esencial'),
      posponible: this.data.expenses.filter(e => e.aiCategory === 'posponible'),
      prescindible: this.data.expenses.filter(e => e.aiCategory === 'prescindible'),
      sinAnalizar: this.data.expenses.filter(e => !e.aiCategory)
    };
  }

  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed.income === 'number' && Array.isArray(parsed.expenses)) {
        this.data = { ...INITIAL_SAMPLE_DATA, ...parsed };
        this.save();
        return { success: true };
      }
      return { success: false, error: 'Formato de datos no válido' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const State = new StateManager();
