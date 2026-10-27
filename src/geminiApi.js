// Google Gemini API Client & Local Intelligent Financial Engine Fallback

export async function testGeminiConnection(apiKey, model = 'gemini-2.0-flash') {
  if (!apiKey || apiKey.trim() === '') {
    return { ok: false, error: 'Por favor ingresa una API Key válida.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Responde únicamente con la palabra "OK" si estás activo.' }] }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.error?.message || `Error HTTP ${response.status}: ${response.statusText}`;
      return { ok: false, error: msg };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { ok: true, message: '¡Conexión exitosa con Gemini AI!', reply: text.trim() };
  } catch (err) {
    return { ok: false, error: err.message || 'Error de red o conexión.' };
  }
}

export async function analyzeBudgetWithGemini(income, expenses, apiKey, model = 'gemini-2.0-flash', currency = '$') {
  // If API key is not configured, automatically use the intelligent local heuristic engine
  if (!apiKey || apiKey.trim() === '') {
    return runIntelligentLocalAnalysis(income, expenses, currency, 'Modo Demo / Sin API Key (Motor Heurístico Local)');
  }

  try {
    const simplifiedExpenses = expenses.map(e => ({
      id: e.id,
      name: e.name,
      amount: e.amount,
      category: e.category,
      period: e.period
    }));

    const prompt = `
Eres un asesor financiero personal experto e implacable en optimizar presupuestos.
Analiza la siguiente información de presupuesto mensual:

Ingreso Mensual Total: ${currency}${income}
Lista de Gastos:
${JSON.stringify(simplifiedExpenses, null, 2)}

Tu tarea:
1. Evaluar la salud financiera del usuario (score de 0 a 100, estado: "Excelente", "Buena", "Ajustada", o "Crítica").
2. Clasificar CADA gasto de la lista en una de estas 3 categorías de prioridad:
   - "esencial": Gastos de subsistencia vital, vivienda indispensable, alimentación básica, salud o deudas legales obligatorias. NO se pueden aplazar.
   - "posponible": Gastos secundarios que son útiles pero no urgentes este mes (ropa no esencial, gadgets, suscripciones duplicadas, cenas fuera, mejoras en casa aplazables). Se pueden posponer al próximo mes/trimestre para generar ahorro inmediato.
   - "prescindible": Gastos superfluos, compras impulsivas o gastos hormiga que se pueden recortar o eliminar sin afectar la calidad de vida básica.
3. Calcular la suma total del ahorro mensual potencial si se posponen los gastos "posponible" y se eliminan los "prescindible".
4. Elaborar un plan de acción con 3 o 4 pasos prácticos recomendados.
5. Dar un consejo sobre la proyección de ahorro anual si se mantiene este ajuste.

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "financialHealth": "Ajustada",
  "healthScore": 65,
  "summary": "Resumen ejecutivo del estado del presupuesto...",
  "totalPotentialSavings": 450,
  "classifiedExpenses": [
    {
      "id": "exp-id",
      "name": "Nombre exacto del gasto",
      "priority": "esencial" | "posponible" | "prescindible",
      "reason": "Explicación clara de por qué se considera esencial, posponible o prescindible",
      "recommendation": "Acción concreta sugerida (ej. 'Posponer para el próximo mes y ahorrar $X')"
    }
  ],
  "actionPlan": [
    "Consejo o paso de acción 1",
    "Consejo o paso de acción 2",
    "Consejo o paso de acción 3"
  ],
  "yearlyProjectionAdvice": "Explicación de cuánto se acumularía en 12 meses y qué hacer con ese fondo."
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API call failed with status', response.status, 'Falling back to local AI.');
      return runIntelligentLocalAnalysis(
        income,
        expenses,
        currency,
        `Gemini API devolvió error ${response.status}. Se aplicó Motor IA Local.`
      );
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No se recibió texto de respuesta de Gemini');
    }

    const parsed = JSON.parse(candidateText);
    parsed.source = `Google Gemini (${model})`;
    return parsed;

  } catch (error) {
    console.error('Error invoking Gemini, using local engine fallback:', error);
    return runIntelligentLocalAnalysis(
      income,
      expenses,
      currency,
      `Modo IA Local (Motivo: ${error.message})`
    );
  }
}

// Local intelligent heuristic engine for offline or zero-configuration use
function runIntelligentLocalAnalysis(income, expenses, currency, sourceLabel) {
  const totalExp = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const balance = income - totalExp;
  const ratio = income > 0 ? (totalExp / income) : 1;

  let healthScore = 70;
  let financialHealth = 'Buena';

  if (ratio > 1) {
    healthScore = 30;
    financialHealth = 'Crítica';
  } else if (ratio > 0.85) {
    healthScore = 50;
    financialHealth = 'Ajustada';
  } else if (ratio <= 0.65) {
    healthScore = 90;
    financialHealth = 'Excelente';
  }

  // Essential patterns
  const essentialPatterns = [
    'alquiler', 'renta', 'hipoteca', 'super', 'comida', 'mercado', 'alimento',
    'luz', 'agua', 'gas', 'electricidad', 'seguro', 'medicina', 'salud', 'medico',
    'deuda', 'tarjeta', 'prestamo', 'transporte', 'gasolina', 'colectivo', 'metro', 'internet'
  ];

  // Postponable patterns
  const postponablePatterns = [
    'ropa', 'cena', 'restaurante', 'salida', 'viaje', 'hotel', 'mueble',
    'tecnologia', 'celular', 'reloj', 'gadget', 'decoracion', 'fiesta', 'delivery'
  ];

  // Dispensable patterns
  const dispensablePatterns = [
    'bar', 'copas', 'juego', 'videojuego', 'apuesta', 'capricho', 'suscripcion',
    'netflix', 'spotify', 'hbo', 'disney', 'prime', 'streaming', 'cigarrillo', 'vicio', 'delivery nocturno'
  ];

  let potentialSavings = 0;
  const classifiedExpenses = expenses.map(e => {
    const text = (e.name + ' ' + (e.category || '')).toLowerCase();
    const amount = Number(e.amount) || 0;
    let priority = 'posponible';
    let reason = '';
    let recommendation = '';

    // Check dispensable first
    if (dispensablePatterns.some(p => text.includes(p)) || e.category === 'suscripciones') {
      priority = 'prescindible';
      reason = 'Gasto no esencial ni crítico. Reducible o eliminable de inmediato para generar liquidez.';
      recommendation = `Eliminar o pausar temporalmente para ahorrar ${currency}${amount}.`;
      potentialSavings += amount;
    }
    // Check essential
    else if (
      essentialPatterns.some(p => text.includes(p)) ||
      ['vivienda', 'servicios', 'salud', 'deudas'].includes(e.category)
    ) {
      priority = 'esencial';
      reason = 'Gasto obligatorio o de subsistencia vital. Debe protegerse y pagarse en primer plano.';
      recommendation = 'Mantener cubierto puntualmente en el presupuesto prioritario.';
    }
    // Check postponable
    else if (
      postponablePatterns.some(p => text.includes(p)) ||
      ['ocio', 'compras'].includes(e.category)
    ) {
      priority = 'posponible';
      reason = 'Gasto secundario que aporta confort pero puede aplazarse al siguiente mes o trimestre.';
      recommendation = `Posponer al próximo ciclo para acumular ${currency}${amount} de ahorro.`;
      potentialSavings += amount;
    } else {
      // Default heuristic by category
      if (['alimentacion', 'transporte', 'educacion'].includes(e.category)) {
        priority = 'esencial';
        reason = 'Inversión importante en bienestar básico, desarrollo o movilidad obligatoria.';
        recommendation = 'Mantener como prioridad.';
      } else {
        priority = 'posponible';
        reason = 'Gasto opcional que puede pasar a segundo plano si buscas maximizar tu ahorro.';
        recommendation = `Considerar aplazarlo para liberar ${currency}${amount}.`;
        potentialSavings += amount;
      }
    }

    return {
      id: e.id,
      name: e.name,
      priority,
      reason,
      recommendation
    };
  });

  const actionPlan = [
    `Pospón los gastos clasificados en "Segundo Plano" para liberar de inmediato ${currency}${potentialSavings} este mes.`,
    `Revisa suscripciones recurrentes y servicios de ocio para conservar solo aquellos que uses a diario.`,
    balance < 0
      ? `Urgente: Tu gasto actual supera tus ingresos por ${currency}${Math.abs(balance)}. Al posponer los gastos no prioritarios lograrás un balance positivo de ${currency}${balance + potentialSavings}.`
      : `Destina al menos el 50% de lo ahorrado (${currency}${Math.round(potentialSavings * 0.5)}) a tu Fondo de Emergencia o metas personales.`
  ];

  return {
    source: sourceLabel,
    financialHealth,
    healthScore,
    summary: `Actualmente gastas ${currency}${totalExp} de un ingreso de ${currency}${income} (${Math.round(ratio * 100)}%). Al posponer gastos secundarios identificados puedes ahorrar hasta ${currency}${potentialSavings} mensuales.`,
    totalPotentialSavings: potentialSavings,
    classifiedExpenses,
    actionPlan,
    yearlyProjectionAdvice: `Si mantienes esta optimización durante 12 meses, acumularás un ahorro proyectado de ${currency}${potentialSavings * 12}.`
  };
}
