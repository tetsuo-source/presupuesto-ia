# AhorroIA 💰🤖 - Presupuesto Inteligente & APK Base Android

**AhorroIA** es una aplicación móvil nativa para Android (desarrollada con **Capacitor**, **HTML5/CSS3/JavaScript moderno** y la **API de Google Gemini**) diseñada para ayudarte a crear presupuestos, evaluar tu salud financiera y tomar decisiones inteligentes sobre qué gastos priorizar y cuáles posponer o recortar para maximizar tu capacidad de ahorro.

---

## ✨ Características Principales

1. **Gestor de Presupuesto Integral**:
   - Configuración de ingresos mensuales.
   - Registro y categorización de gastos (Vivienda, Alimentación, Transporte, Servicios, Ocio, Suscripciones, Deudas, etc.).
   - Visualización del balance disponible con alertas de salud financiera.
   - Gráfica interactiva Donut en SVG con distribución porcentual por categoría.

2. **Asesor Financiero con Inteligencia Artificial (Google Gemini)**:
   - **Clasificación Automática de Gastos**:
     - 🛡️ **Primer Plano (Esenciales)**: Gastos vitales y obligatorios (vivienda, alimentación básica, salud, deudas legales). La IA los protege como intocables.
     - ⏳ **Segundo Plano (Posponibles)**: Gastos secundarios que aportan confort pero pueden aplazarse al próximo mes o trimestre (compras aplazables, renovaciones, cenas fuera).
     - ✂️ **Prescindibles (Recorte Inmediato)**: Suscripciones redundantes, compras impulsivas y gastos hormiga.
   - **Simulador Interactivo de Decisión**:
     - Switches interactivos en cada gasto para simular: *"¿Qué pasa si pospongo este gasto este mes?"*.
     - Contador en tiempo real del **Ahorro Activo Generado**.
   - **Diagnóstico y Plan de Acción**:
     - Puntuación de salud financiera (0 a 100) y calificación (Excelente, Buena, Ajustada, Crítica).
     - Justificación personalizada de por qué cada gasto fue categorizado de esa forma.
     - Plan de acción con recomendaciones prácticas paso a paso.

3. **Proyecciones y Metas de Ahorro**:
   - Estimación de ahorro acumulado a **3 meses, 6 meses y 1 año**.
   - Comparativa visual: *Presupuesto Sin Optimizar vs Presupuesto Optimizado con IA*.
   - Metas de ahorro personalizadas (Fondo de Emergencia, Vacaciones, Compras importantes) con barra de progreso y botón de aportes.

4. **Conexión Dual de IA**:
   - **Google Gemini API**: Compatible con `gemini-2.0-flash`, `gemini-1.5-flash` y `gemini-1.5-pro` ingresando tu clave en la pantalla de Ajustes.
   - **Motor Heurístico Local Offline**: Si estás sin internet o no tienes API Key al inicio, la app funciona al 100% con su motor financiero inteligente local de demostración.

5. **Persistencia y Portabilidad**:
   - Todo se almacena localmente en el dispositivo (`localStorage`).
   - Botón para **Exportar** e **Importar** presupuestos en formato JSON.
   - Botón para cargar datos de prueba realistas con 1 solo clic.

---

## 📱 Cómo abrir y generar el APK en Android Studio

La carpeta `android/` contiene el proyecto nativo completo de Android listo para ser abierto en **Android Studio**.

### Paso 1: Abrir el proyecto en Android Studio
1. Abre **Android Studio**.
2. Selecciona **Open** (Abrir proyecto existente).
3. Navega hasta la carpeta del proyecto y selecciona la subcarpeta:
   ```
   d:\Proyectos\Presupuestos apk\android
   ```
4. Espera a que Gradle sincronice las dependencias del proyecto (Gradle Sync).

### Paso 2: Compilar el APK
1. En el menú superior de Android Studio, haz clic en:
   ```
   Build > Build Bundle(s) / APK(s) > Build APK(s)
   ```
2. Una vez finalizada la compilación, aparecerá una notificación abajo a la derecha:
   `APK(s) generated successfully for 1 module`.
3. Haz clic en el enlace azul **locate** o navega en tu explorador de archivos a:
   ```
   d:\Proyectos\Presupuestos apk\android\app\build\outputs\apk\debug\app-debug.apk
   ```
4. ¡Ese archivo `app-debug.apk` es tu instalador directo para instalar en cualquier teléfono Android o emulador!

---

## 💻 Desarrollo y Pruebas en Navegador

Puedes probar y modificar la aplicación en tiempo real en tu navegador web antes de compilarla en Android:

```bash
# Iniciar servidor de desarrollo en vivo:
npm run dev
```
Abre en tu navegador: `http://localhost:5173`

### Sincronizar cambios a Android:
Si realizas modificaciones en la interfaz o la lógica en `src/`, actualiza el proyecto Android ejecutando:
```bash
npm run cap:sync
```
Este comando compila los assets web (`vite build`) y los copia directamente a `android/app/src/main/assets/public`.

---

## 🔑 Cómo obtener una API Key gratuita de Google Gemini

1. Ingresa a [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en el botón **"Create API Key"**.
4. Copia tu clave y pégala en la pestaña **Ajustes** dentro de la app.
5. Haz clic en **"Probar Conexión"** para verificar que esté funcionando.

---

## 📂 Estructura del Proyecto

```
d:/Proyectos/Presupuestos apk/
├── android/                   # Proyecto nativo Android Studio (Gradle, Manifest, Java)
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml   # Permisos de INTERNET y configuración nativa
│   │   │   ├── java/                 # MainActivity.java de Android
│   │   │   └── assets/public/        # Bundle web empaquetado dentro del APK
│   │   └── build.gradle
│   ├── build.gradle
│   └── gradlew.bat
├── src/                       # Código fuente de la aplicación
│   ├── style.css              # Sistema de diseño moderno (Dark Mode, Glassmorphism, Material You)
│   ├── state.js               # Estado global, cálculos financieros y persistencia local
│   ├── geminiApi.js           # Cliente de Google Gemini API y motor de IA local offline
│   ├── icons.js               # Iconos SVG nativos sin dependencias externas
│   ├── ui.js                  # Motor de renderizado dinámico de pestañas, gráficas y modales
│   └── main.js                # Controlador principal y eventos
├── index.html                 # HTML5 base optimizado con viewport móvil
├── capacitor.config.json      # Configuración de Capacitor para Android
└── package.json               # Dependencias y scripts de compilación
```
