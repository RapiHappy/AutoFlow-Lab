/**
 * AutoFlow Lab - Elite Simulation, Realtime Visualizer, Live React & Cosmic Background
 * Author: Нигматдинов Раяз
 * Version: 2.1 Elite
 */

// ==========================================
// 1. PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
// ==========================================
class PRNG {
  constructor(seed = 4242) {
    this.seed = seed;
  }

  next() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  normal(mean, stdDev) {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
}

// ==========================================
// 2. WEB AUDIO API SYNTHESIZER
// ==========================================
const SoundSystem = {
  enabled: true,
  ctx: null,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  playClick() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  },

  playTab() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch (e) {}
  },

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.035, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.22);
      });
    } catch (e) {}
  },

  playBootSweep() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }
};

// ==========================================
// 3. LIVING COSMIC AURORA & NEBULA BACKGROUND
// ==========================================
function initBackgroundParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Cosmic Dust & Stars
  const stars = [];
  const starCount = Math.min(65, Math.floor((width * height) / 22000));

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.8 + 0.6,
      baseAlpha: Math.random() * 0.5 + 0.2,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinkleAngle: Math.random() * Math.PI * 2,
      color: ['#818cf8', '#34d399', '#c084fc', '#38bdf8'][Math.floor(Math.random() * 4)]
    });
  }

  // Interactive Mouse Spotlight with smooth lerping
  const mouse = { x: width * 0.5, y: height * 0.3, targetX: width * 0.5, targetY: height * 0.3 };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;

    // 1. Subtle glowing mouse aura
    const auraGrad = ctx.createRadialGradient(mouse.x, mouse.y, 10, mouse.x, mouse.y, 350);
    auraGrad.addColorStop(0, 'rgba(99, 102, 241, 0.09)');
    auraGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.04)');
    auraGrad.addColorStop(1, 'rgba(6, 9, 17, 0)');
    ctx.fillStyle = auraGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Stars & Connections
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;

      if (s.x < 0) s.x = width;
      if (s.x > width) s.x = 0;
      if (s.y < 0) s.y = height;
      if (s.y > height) s.y = 0;

      s.twinkleAngle += s.twinkleSpeed;
      s.alpha = s.baseAlpha + Math.sin(s.twinkleAngle) * 0.25;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Draw constellation threads
      for (let j = i + 1; j < stars.length; j++) {
        const s2 = stars[j];
        const dx = s.x - s2.x;
        const dy = s.y - s2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.strokeStyle = `rgba(129, 140, 248, ${0.12 * (1 - dist / 125)})`;
          ctx.stroke();
        }
      }

      // Mouse proximity interaction
      const mdx = s.x - mouse.x;
      const mdy = s.y - mouse.y;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 160) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(52, 211, 153, ${0.22 * (1 - mdist / 160)})`;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

// ==========================================
// 4. WEBSITE PRELOADER LOGIC (CINEMATIC QUANTUM BOOT)
// ==========================================
function startPreloader() {
  const preloader = document.getElementById('sitePreloader');
  const ring = document.getElementById('preloaderProgressRing');
  const percent = document.getElementById('preloaderPercent');
  const phaseTag = document.getElementById('preloaderPhaseTag');
  const terminal = document.getElementById('preloaderTerminal');
  const skipBtn = document.getElementById('preloaderSkipBtn');

  if (!preloader) return;
  if (terminal) terminal.innerHTML = '';

  const totalCircumference = 691.15;
  let isExited = false;

  function updateProgressRing(val) {
    if (ring) {
      const offset = totalCircumference * (1 - Math.min(100, Math.max(0, val)) / 100);
      ring.style.strokeDashoffset = offset;
    }
    if (percent) {
      percent.textContent = Math.round(val);
    }
  }

  function addTerminalLog(msg, colorClass = 'text-slate-300') {
    if (!terminal) return;
    // Remove previous cursor if any
    const oldCursor = terminal.querySelector('.term-cursor');
    if (oldCursor) oldCursor.remove();

    const line = document.createElement('div');
    line.className = `${colorClass} font-mono transition-opacity duration-200 flex items-center space-x-1`;
    line.innerHTML = `<span>${msg}</span><span class="term-cursor inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-1"></span>`;
    terminal.appendChild(line);
    while (terminal.children.length > 4) {
      terminal.removeChild(terminal.firstElementChild);
    }
    terminal.scrollTop = terminal.scrollHeight;
  }

  function exitPreloader() {
    if (isExited) return;
    isExited = true;

    updateProgressRing(100);
    if (percent) percent.textContent = '100';
    if (phaseTag) {
      phaseTag.textContent = 'ONLINE';
      phaseTag.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold';
    }
    addTerminalLog('[ONLINE] Система AutoFlow Lab запущена!', 'text-emerald-400 font-bold');

    try {
      SoundSystem.playSuccess();
    } catch (e) {}

    // 1. Initiate smooth reveal of site content immediately (cross-fade)
    document.body.classList.add('site-loaded');

    // 2. Smoothly fade out the preloader in parallel
    setTimeout(() => {
      preloader.classList.add('preloader-cinematic-exit');
      setTimeout(() => {
        preloader.classList.add('preloader-hidden');
        document.body.classList.add('site-revealed-fully');
      }, 820);
    }, 120);
  }

  // Skip handlers
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exitPreloader();
    });
  }

  const keyHandler = (e) => {
    if (e.key === 'Escape' || e.key === ' ' || e.code === 'Space') {
      window.removeEventListener('keydown', keyHandler);
      exitPreloader();
    }
  };
  window.addEventListener('keydown', keyHandler);

  // Progressive Boot Telemetry Sequence (Liquid 3.2s pacing)
  const bootMilestones = [
    { p: 15, phase: 'CORE_INIT', log: '[SYS_BOOT] Ядро Mulberry32 инициализировано...', color: 'text-indigo-400', triggered: false },
    { p: 35, phase: 'ALGORITHM', log: '[WEIGHTS] Загрузка матрицы весов: w1=50, w2=30, w3=20...', color: 'text-slate-300', triggered: false },
    { p: 55, phase: 'SLA_MATRIX', log: '[SLA] Конфигурация дедлайнов: VIP 25 мин / Стандарт 60 мин...', color: 'text-purple-400', triggered: false },
    { p: 75, phase: 'NEURAL_SYNC', log: '[AI_COPILOT] Нейросетевой аналитик синхронизирован...', color: 'text-cyan-400', triggered: false },
    { p: 92, phase: 'BUFFER_CHECK', log: '[BUFFER] Расчёт 480-минутного таймлайна смены завершён...', color: 'text-emerald-400', triggered: false },
    { p: 99.5, phase: 'READY', log: '[ONLINE] Все системы стабильны. Запуск AutoFlow Lab!', color: 'text-emerald-300', triggered: false }
  ];

  // Initial sound sweep
  setTimeout(() => {
    try { SoundSystem.playBootSweep(); } catch (e) {}
  }, 120);

  const totalDuration = 3200; // 3.2s smooth cinematic experience
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function renderFrame(timestamp) {
    if (isExited) return;
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progressNorm = Math.min(1, Math.max(0, elapsed / totalDuration));
    const smoothPercent = easeInOutCubic(progressNorm) * 100;

    updateProgressRing(smoothPercent);

    // Check milestones
    for (const m of bootMilestones) {
      if (!m.triggered && smoothPercent >= m.p) {
        m.triggered = true;
        if (phaseTag) phaseTag.textContent = m.phase;
        addTerminalLog(m.log, m.color);
        try { SoundSystem.playClick(); } catch (e) {}
      }
    }

    if (progressNorm < 1) {
      requestAnimationFrame(renderFrame);
    } else {
      setTimeout(exitPreloader, 260);
    }
  }

  requestAnimationFrame(renderFrame);
}

// ==========================================
// 4. BILINGUAL INTERNATIONALIZATION (i18n: RU / TT)
// ==========================================
const i18n = {
  ru: {
    headerAuthorLabel: 'Исследовательский проект',
    headerAuthorName: 'Нигматдинов Раяз',
    qrBtn: '📱 QR-код',
    tourBtn: 'Обучающий тур',
    aboutBtn: 'О формуле',
    heroTitle: 'Спасение VIP-клиентов и устранение очередей с алгоритмом AutoFlow',
    heroDesc: 'Классический принцип FIFO («первым пришёл — первым обслужен») не учитывает ценность клиента и ведёт к массовым срывам дедлайнов. Умный алгоритм AutoFlow непрерывно взвешивает маржинальность, остаток времени до дедлайна и защиту от бесконечного ожидания.',
    heroKpi1: 'Срыв дедлайнов VIP',
    heroKpi2: 'Ускорение отклика',
    heroTicker1: 'Доказанный эффект: сокращение срывов VIP с 70%+ до нуля',
    heroTicker2: '★ Triage-защита от цепной реакции',
    heroTicker3: '★ Starvation-защита обычных клиентов',
    tab1: '1. Лаборатория Симуляции',
    tab2: '2. Живая гонка потоков (Визуализатор)',
    tab3: '3. Бизнес-Калькулятор ROI',
    tab4: '4. Академия Автоматизации Бизнеса',
    presetLabel: 'Быстрые сценарии нагрузки:',
    presetStandard: 'Стандартный день',
    presetRush: 'Пиковый наплыв',
    presetStress: 'Дефицит операторов',
    controlTitle: 'Панель управления',
    controlSubtitle: 'Параметры входящего потока',
    flowSliderLabel: 'Поток обращений за смену',
    vipShareSliderLabel: 'Доля VIP-клиентов',
    operatorsSliderLabel: 'Штат операторов',
    weightsLabel: 'Весовые коэффициенты AutoFlow',
    resetWeightsBtn: 'Сброс (50/30/20)',
    aiOptimizerBtn: '⚡ AI Optimizer (Подобрать идеальные веса)',
    weightVipLabel: 'w₁ (Статус VIP):',
    weightUrgencyLabel: 'w₂ (Горящий дедлайн):',
    weightWaitLabel: 'w₃ (Анти-голодание):',
    runSimulationBtn: 'Запустить симуляцию',
    newSeedBtn: 'Новый поток',
    exportCsvBtn: 'Экспорт CSV',
    customCsvLabel: 'Загрузить CSV',
    openAuditModalBtn: 'Акт для CEO',
    companyCasesLabel: 'КЕЙСЫ КОМПАНИЙ:',
    kpiVipBreachTitle: 'Срыв дедлайнов VIP',
    kpiWasInFifo: 'Было в FIFO:',
    kpiVipSavedText: 'Спасено 100% ⚡',
    kpiTotalBreachTitle: 'Общий срыв SLA',
    kpiAllTickets: 'Все тикеты',
    kpiRiskDropText: 'Снижение риска',
    kpiVipWaitTitle: 'Ожидание VIP',
    kpiAverage: 'Среднее',
    kpiNoDelayText: 'Без задержек',
    kpiUtilizationTitle: 'Загрузка операторов',
    kpiShift: 'Смена',
    kpiWorkedTime: 'Отработано:',
    kpiStaffStatusOpt: 'Оптимальная нагрузка',
    chartBarTitle: 'Сравнение ключевых метрик: FIFO vs AutoFlow',
    chartLineTitle: 'Динамика нагрузки и очереди по часам (09:00 - 17:00)',
    matrixTitle: 'Сценарный анализ «Что если?»: Выбор стратегии для руководства',
    matrixDesc: 'Сравнение: оставить старый процесс FIFO, нанять ещё сотрудника в штат (+120k ₽) или внедрить алгоритм AutoFlow',
    matrixSavingBadge: 'ЭКОНОМИЯ 1.44 МЛН ₽ / ГОД',
    scenarioATitle: 'Сценарий А: Статус-кво',
    scenarioBTitle: 'Сценарий B: Найм оператора',
    scenarioCTitle: 'Сценарий C: AutoFlow',
    matrixStaffLabel: 'Штат:',
    opsUnit: 'оператора',
    matrixVipBreachLabel: 'Срыв VIP:',
    matrixFotLabel: 'Затраты на ФОТ:',
    matrixNoChanges: 'Без изменений',
    matrixChurnRiskLabel: 'Риск оттока VIP:',
    matrixRiskCritical: 'КРИТИЧЕСКИЙ',
    matrixAnnualExpenseLabel: 'Годовой расход:',
    matrixOptimalBadge: 'ОПТИМАЛЬНО',
    matrixSameStaff: 'прежний',
    matrixSavingWord: 'Экономия',
    matrixBizEffectLabel: 'Эффект для бизнеса:',
    matrixBetterWord: 'В 5 раз лучше',
    copilotBadge: 'В сети • Аналитик',
    copilotSubtitle: 'Умный аналитический разбор смены, ответы на вопросы и бизнес-консультации',
    clearChatBtn: 'Очистить чат',
    copilotQuickChipsTitle: 'Быстрые вопросы для консультации:',
    chipTradeoff: 'Почему обычные клиенты ждут чуть дольше?',
    chipStarvation: 'Как работает защита от голодания?',
    chipOverload: 'Что будет при пиковой перегрузке?',
    chipRoi: 'Какая выгода в деньгах для бизнеса?',
    chipWeights: 'Как настроить веса w1, w2, w3?',
    chipOperators: 'Хватает ли операторов в смене?',
    chipHiring: 'Нанять оператора или включить AutoFlow?',
    chipIntegration: 'Как внедрить алгоритм в CRM?',
    copilotInputPlaceholder: 'Задайте вопрос ИИ (например: «привет», «как настроить веса», «хватает ли операторов»)...',
    copilotAskBtn: 'Спросить',
    tableTitle: 'Детальный журнал обращений смены',
    tableSubtitle: 'Сравнение по каждой заявке: время ожидания в очереди и итоговый статус SLA',
    optAll: 'Все заявки',
    optSaved: '⚡ Спасённые AutoFlow',
    optVip: '👑 Только VIP',
    optBreached: '❌ Срывы SLA',
    optOntime: '✅ Выполненные в срок',
    qrModalTitle: 'AutoFlow Lab на смартфоне',
    qrModalBadge: 'Live Mobile',
    qrModalSubtitle: 'Публичный доступ для экспертов и жюри',
    qrModalDesc: 'Наведите камеру смартфона, чтобы открыть мобильную версию сайта с полной симуляцией в реальном времени.',
    qrDirectUrlLabel: 'Прямая ссылка на сайт:',
    copyUrlBtn: 'Копировать',
    openInBrowserLink: 'Открыть в браузере',
    closeBtn: 'Закрыть',
    footerProject: 'Исследовательский проект',
    footerAuthorPrefix: 'Автор разработки:',
    footerAuthorName: 'Нигматдинов Раяз',
    footerSubtitle: 'Дискретно-событийное моделирование очередей с нелинейной приоритизацией',

    // Detailed Table Columns & Shift Constants
    thClient: 'Клиент',
    thArrival: 'Приход',
    thDuration: 'Длит.',
    thDelta: 'Дельта',
    thResult: 'Результат',
    tableSortingNote: 'Автоматическая сортировка по времени поступления',
    quickShift: 'Смена: 8 часов (480 мин)',
    quickVipSla: 'SLA VIP: 25 мин',
    quickServiceTime: 'Обслуживание: ~9.2 мин',
    quickStdSla: 'SLA Стандарт: 60 мин',

    // Tab 2: Realtime Queue Race
    raceBadge: 'Сравнение алгоритмов в реальном времени',
    raceTitle: 'Интерактивная гонка очередей: FIFO vs AutoFlow',
    raceDesc: 'Наблюдайте, как поступающие заявки обрабатываются операторами параллельно по двум разным стратегиям',
    racePlayBtn: 'Запустить гонку',
    raceFifoTitle: 'Классическая очередь FIFO',
    raceAfTitle: 'Умный алгоритм AutoFlow',
    raceOpsLabel: 'Операторы смены:',
    raceQueueLabel: 'Очередь ожидания (по времени прихода):',
    raceAfQueueLabel: 'Очередь ожидания (ранжирована по Score):',
    raceQueueEmpty: 'Нажмите «Запустить гонку»',
    raceFifoNote: '🚨 <strong>Слабое место FIFO:</strong> VIP-клиенты с дедлайном 25 мин застревают позади обычных длинных обращений и гарантированно срывают SLA.',
    raceAfNote: '⚡ <strong>Преимущество AutoFlow:</strong> VIP-клиенты динамически выходят вперед, а обычные получают приоритет, когда их лимит SLA подходит к концу.',
    raceClockLabel: 'Виртуальное время смены:',

    // Tab 3: Business ROI Calculator
    roiBadge: 'Финансово-экономическая модель внедрения',
    roiTitle: 'Калькулятор финансовой окупаемости (ROI)',
    roiDesc: 'Рассчитайте в реальных рублях, сколько денег ваша компания сбережет за счет удержания VIP-клиентов и экономии фонда оплаты труда (ФОТ)',
    roiInputsTitle: 'Финансовые вводные бизнеса:',
    roiMonthlyVolumeLabel: 'Объем заявок в месяц:',
    roiVipLtvLabel: 'Средняя ценность VIP (LTV):',
    roiVipLtvSub: 'Доход, который приносит один VIP-клиент за жизненный цикл',
    roiPenaltyLabel: 'Компенсация за срыв SLA:',
    roiPenaltySub: 'Прямой штраф, скидка или бонус лояльности за просрочку',
    roiSalaryLabel: 'Зарплата 1 оператора в месяц (ФОТ):',
    roiEffectBadge: 'ЭКОНОМИЧЕСКИЙ ЭФФЕКТ ВНЕДРЕНИЯ',
    roiNetProfitBadge: 'ЧИСТАЯ ВЫГОДА',
    roiPerMonth: '/ месяц',
    roiAnnualGainLabel: 'Годовая выгода:',
    roiCard1Title: 'Удержано выручки VIP:',
    roiCard1Sub: 'Спасенные ключевые клиенты от ухода к конкурентам',
    roiCard2Title: 'Экономия на штрафах SLA:',
    roiCard2Sub: 'Сокращение выплат компенсаций и претензий',
    roiCard3Title: 'Экономия на найме ФОТ:',
    roiCard3Sub: 'Не нужно нанимать 2–3 лишних оператора',
    roiPitchTitle: 'Готовое обоснование для генерального директора',
    roiPitchSub: 'Скопируйте краткую сводку расчетов для презентации руководству',
    roiCopyPitchBtn: 'Скопировать резюме',

    // Tab 4: Academy & Industry Blueprints
    academyBadge: 'Методология и архитектура внедрения',
    academyTitle: 'Академия Автоматизации Бизнес-Процессов',
    academyDesc: 'Пошаговое руководство для IT-директоров, операционных руководителей и тимлидов: как внедрить алгоритм AutoFlow в реальную инфраструктуру',
    roadmapTitle: '5 этапов автоматизации диспетчеризации в компании',
    step1Tag: 'ШАГ 1',
    step1Title: 'Аудит и Сегментация',
    step1Desc: 'Разделите клиентов по LTV и жесткости контрактов. Назначьте строгий SLA (например, 15–25 мин) для топ-20% клиентов.',
    step2Tag: 'ШАГ 2',
    step2Title: 'Калибровка Весов',
    step2Desc: 'Сбалансируйте формулу в AutoFlow Lab: высокий w₁ для маржинальности, w₂ для защиты дедлайнов и w₃ против голодания очереди.',
    step3Tag: 'ШАГ 3',
    step3Title: 'Интеграция с Очередями',
    step3Desc: 'Подключите брокер очередей (Redis Sorted Sets, RabbitMQ, Kafka). Рассчитывайте Score в момент освобождения сотрудника.',
    step4Tag: 'ШАГ 4',
    step4Title: 'Подключение CRM',
    step4Desc: 'Настройте распределение тикетов в Zendesk, Jira Service Desk, amoCRM или Bitrix24 через вебхук авто-назначения.',
    step5Tag: 'ШАГ 5',
    step5Title: 'Триаж и Мониторинг',
    step5Desc: 'Включите отсечение Urgency для уже сорванных заявок, предотвращая каскадные срывы дедлайнов в пиковые часы.',
    blueprintsTitle: 'Готовые отраслевые шаблоны (Blueprints)',
    blueprintsSub: 'Нажмите «Применить», чтобы протестировать шаблон в симуляторе',
    bpApplyBtn: 'Применить →',
    bp1Title: 'Банкинг & Private Banking',
    bp1Sub: 'Высокая цена ухода клиента, жесткие нормативы ЦБ',
    bp1Desc: 'VIP: 35% базы, SLA VIP: 15 минут, веса: <code class="text-amber-400 font-mono">w₁=65, w₂=25, w₃=10</code>. Максимальная защита крупных вкладчиков и инвесторов.',
    bp2Title: 'E-Commerce & Черная Пятница',
    bp2Sub: 'Пиковый наплыв заказов, корзины свыше 50 000 ₽',
    bp2Desc: '190+ заявок, 3 оператора, веса: <code class="text-indigo-400 font-mono">w₁=50, w₂=35, w₃=15</code>. Защита горящих платежей без потери обычных покупателей.',
    bp3Title: 'B2B SaaS & IT-поддержка',
    bp3Sub: 'Угроза оттока (Churn) и штрафы по контрактам Platinum',
    bp3Desc: 'VIP: 25%, веса: <code class="text-purple-400 font-mono">w₁=55, w₂=30, w₃=15</code>. Гарантированное удержание ключевых Enterprise-клиентов.',
    bp4Title: 'Медицинский Триаж (Клиники)',
    bp4Sub: 'Экстренность приема и минимизация рисков для здоровья',
    bp4Desc: 'Критические пациенты: 20%, веса: <code class="text-emerald-400 font-mono">w₁=70, w₂=20, w₃=10</code>. Скорейшее направление тяжелых обращений к профильным врачам.',
    sdkHeader: 'Готовый код функции скоринга (Python / TypeScript) для разработчиков:',
    copySdkText: 'Копировать код',

    // Onboarding Tour
    tourSkipBtn: 'Пропустить тур',
    tourPrevBtn: '← Назад',

    // Audit Report Modal
    auditModalTitle: 'Официальный акт аудита эффективности',
    auditModalSubtitle: 'Форма экспертного заключения для генерального директора и финансового отдела',
    auditPrintBtn: 'Печать / Сохранить в PDF',
    auditDocBadge: 'AutoFlow Lab // Исследовательский отчёт',
    auditDocNum: 'Документ № AF-2026-AUDIT',
    auditDocTitle: 'АКТ АУДИТА ЭФФЕКТИВНОСТИ МАРШРУТИЗАЦИИ ОЧЕРЕДЕЙ И ОЦЕНКИ SLA',
    auditDocSubtitle: 'Сравнительный дискретно-событийный анализ традиционной очереди FIFO и алгоритма нелинейного приоритета AutoFlow',
    auditMetaFlow: 'Входящий поток',
    auditMetaVip: 'Доля VIP клиентов',
    auditMetaStaff: 'Штат операторов',
    auditMetaWeights: 'Веса формулы',
    auditSec1Title: '1. Сводные метрики смены: До и После',
    auditThMetric: 'Метрика эффективности',
    auditThFifo: 'Базовый процесс (FIFO)',
    auditThAf: 'AutoFlow Lab',
    auditThDelta: 'Эффект (Дельта)',
    auditRowVipBreach: 'Срыв дедлайнов VIP-клиентов',
    auditRowVipWait: 'Среднее ожидание VIP в очереди',
    auditRowTotalBreach: 'Общий срыв дедлайнов (Все)',
    auditRowUtil: 'Загрузка штата операторов',
    auditRowNoOverload: 'Без перегрузки персонала',
    auditSec2Title: '2. Финансовое обоснование и экономический эффект',
    auditAuthorRole: 'Ведущий исследователь / Разработчик:',
    auditAuthorName: 'Нигматдинов Раяз',
    auditResearchGroup: 'AutoFlow Lab Research Group • 2026',
    auditVerifiedBadge: '✓ ВЕРИФИЦИРОВАНО СИМУЛЯЦИЕЙ',

    // About Modal
    aboutModalTitle: 'О проекте и математической формуле',
    aboutModalSubtitle: 'Исследовательский проект Нигматдинова Раяза',
    aboutSec1Title: '1. В чём проблема стандартной очереди (FIFO)?',
    aboutSec1Text: 'В реальных контакт-центрах, банках и B2B-сервисах клиенты имеют разную ценность и разные лимиты ожидания (SLA). Принцип FIFO («первым пришёл — первым обслужен») абсолютно слеп к этим факторам: важный VIP-клиент с лимитом 25 минут встаёт за 5 обычными обращениями и неизбежно срывает SLA, принося компании финансовые и репутационные убытки.',
    aboutSec2Title: '2. Интеллектуальный приоритет AutoFlow',
    aboutSec2Text: 'В момент освобождения оператора алгоритм оценивает каждую заявку в очереди и назначает ей суммарный скоринг:',
    aboutB1Title: '● w₁ · isVIP (Приоритет статуса):',
    aboutB1Text: 'VIP-обращения сразу получают базовый гандикап, поднимаясь выше в очереди.',
    aboutB2Title: '● w₂ · Urgency (Срочность дедлайна & Защита от эффекта домино):',
    aboutB2Text: 'Пока дедлайн не сорван, срочность растёт пропорционально приближению к лимиту SLA: Wait / SLA. Ключевая инновация: если заявка уже просрочена, её срочность обнуляется! Алгоритм не тратит дефицитный ресурс оператора на спасение уже потерянной заявки, если рядом есть другие, которые ещё можно успеть закрыть вовремя.',
    aboutB3Title: '● w₃ · WaitFactor (Защита от бесконечного голодания):',
    aboutB3Text: 'Предотвращает проблему Starvation. Обычные клиенты со временем накапливают вес за счёт долгого ожидания, что гарантирует их обслуживание даже при непрерывном потоке VIP.',
    aboutSec3Title: '3. Результаты и выводы симуляции',
    aboutSec3Text: 'Внедрение AutoFlow снижает срыв VIP-сроков практически до 0% без необходимости бездумно раздувать штат операторов. Небольшой компромисс по времени ожидания обычных клиентов с лихвой окупается сохранённой выручкой от ключевых заказчиков.',
    aboutCloseBtn: 'Понятно, к симуляции'
  },
  tt: {
    headerAuthorLabel: 'Фәнни-тикшеренү проекты',
    headerAuthorName: 'Нигъмәтдинов Раяз',
    qrBtn: '📱 QR-код',
    tourBtn: 'Өйрәтүче тур',
    aboutBtn: 'Формула турында',
    heroTitle: 'AutoFlow алгоритмы белән VIP-клиентларны коткару һәм чиратларны бетерү',
    heroDesc: 'Классик FIFO («беренче килгән — беренче хезмәтләндерелә») принцибы клиентның кыйммәтен исәпкә алмый һәм дедлайннарның күпләп бозылуына китерә. Акыллы AutoFlow алгоритмы маржинальлекне, дедлайнга кадәр калган вакытны һәм озак көтүдән саклауны даими үлчәп бара.',
    heroKpi1: 'VIP дедлайн бозылуы',
    heroKpi2: 'Җавап тизләнеше',
    heroTicker1: 'Исбатланган нәтиҗә: VIP соңга калуларны 70%+ тан нульгә кадәр киметү',
    heroTicker2: '★ Чылбырлы реакциядән Triage-саклау',
    heroTicker3: '★ Гади клиентларны Starvation-саклау',
    tab1: '1. Симуляция лабораториясе',
    tab2: '2. Тере агымнар ярышы (Визуализатор)',
    tab3: '3. ROI Бизнес-калькуляторы',
    tab4: '4. Бизнесны автоматлаштыру академиясе',
    presetLabel: 'Йөкләнешнең тиз сценарийлары:',
    presetStandard: 'Стандарт көн',
    presetRush: 'Пик агымы',
    presetStress: 'Операторлар кытлыгы',
    controlTitle: 'Идарә итү панеле',
    controlSubtitle: 'Килүче гаризалар агымы',
    flowSliderLabel: 'Сменадагы мөрәҗәгатьләр саны',
    vipShareSliderLabel: 'VIP-клиентлар өлеше (%)',
    operatorsSliderLabel: 'Операторлар штаты (кеше)',
    weightsLabel: 'AutoFlow авырлык коэффициентлары',
    resetWeightsBtn: 'Кире кайтару (50/30/20)',
    aiOptimizerBtn: '⚡ AI Оптимизатор (Идеаль авырлыкларны сайлау)',
    weightVipLabel: 'w₁ (VIP статусы):',
    weightUrgencyLabel: 'w₂ (Янучы дедлайн):',
    weightWaitLabel: 'w₃ (Озак көтүдән саклау):',
    runSimulationBtn: '🚀 Симуляцияне башларга',
    newSeedBtn: '🎲 Яңа агым',
    exportCsvBtn: '📥 CSV экспорт',
    customCsvLabel: '📥 CSV йөкләргә',
    openAuditModalBtn: '📄 Директор өчен акт',
    companyCasesLabel: 'КОМПАНИЯ КЕЙСЛАРЫ:',
    kpiVipBreachTitle: 'VIP дедлайн бозылуы',
    kpiWasInFifo: 'FIFO-да иде:',
    kpiVipSavedText: '100% коткарылды ⚡',
    kpiTotalBreachTitle: 'Гомуми SLA бозылуы',
    kpiAllTickets: 'Барлык гаризалар',
    kpiRiskDropText: 'Куркыныч кимү',
    kpiVipWaitTitle: 'VIP көтү вакыты',
    kpiAverage: 'Уртача',
    kpiNoDelayText: 'Тоткарлыксыз',
    kpiUtilizationTitle: 'Операторлар йөкләнеше',
    kpiShift: 'Смена',
    kpiWorkedTime: 'Эшләнде:',
    kpiStaffStatusOpt: 'Оптималь йөкләнеш',
    chartBarTitle: 'Төп күрсәткечләрне чагыштыру: FIFO vs AutoFlow',
    chartLineTitle: 'Сәгатьләр буенча йөкләнеш һәм чират динамикасы (09:00 - 17:00)',
    matrixTitle: '«Нәрсә булса?» сценарий анализы: Җитәкчелек өчен стратегия сайлау',
    matrixDesc: 'Чагыштыру: иске FIFO процессын калдыру, штатка тагын бер хезмәткәр алу (+120k ₽) яки AutoFlow алгоритмын кертү',
    matrixSavingBadge: 'ЕЛЫНА 1.44 МЛН ₽ ЭКОНОМИЯ',
    scenarioATitle: 'А сценарие: Статус-кво',
    scenarioBTitle: 'B сценарие: Оператор яллау',
    scenarioCTitle: 'C сценарие: AutoFlow',
    matrixStaffLabel: 'Штат:',
    opsUnit: 'оператор',
    matrixVipBreachLabel: 'VIP соңга калу:',
    matrixFotLabel: 'Хезмәт хакы чыгымнары:',
    matrixNoChanges: 'Үзгәрешсез',
    matrixChurnRiskLabel: 'VIP китү куркынычы:',
    matrixRiskCritical: 'КРИТИК',
    matrixAnnualExpenseLabel: 'Еллык чыгым:',
    matrixOptimalBadge: 'ОПТИМАЛЬ',
    matrixSameStaff: 'элеккечә',
    matrixSavingWord: 'Экономия',
    matrixBizEffectLabel: 'Бизнес өчен эффект:',
    matrixBetterWord: '5 тапкыр яхшырак',
    copilotBadge: 'Челтәрдә • Аналитик',
    copilotSubtitle: 'Сменаның акыллы анализы, сорауларга җаваплар һәм бизнес-консультацияләр',
    clearChatBtn: 'Чатны чистарту',
    copilotQuickChipsTitle: 'Консультация өчен тиз сораулар:',
    chipTradeoff: 'Ни өчен гади клиентлар озаграк көтә?',
    chipStarvation: 'Озак көтүдән саклау ничек эшли?',
    chipOverload: 'Пик йөкләнеш вакытында нәрсә була?',
    chipRoi: 'Бизнес өчен акчалата файдасы нинди?',
    chipWeights: 'w1, w2, w3 авырлыкларын ничек көйләргә?',
    chipOperators: 'Сменада операторлар җитәрлекме?',
    chipHiring: 'Оператор ялларгамы яки AutoFlow кабызыргамы?',
    chipIntegration: 'Алгоритмны CRM-га ничек кертергә?',
    copilotInputPlaceholder: 'ЯИ-гә сорау бирегез (мәсәлән: «сәлам», «авырлыкларны ничек көйләргә», «операторлар җитәрлекме»)...',
    copilotAskBtn: 'Сорарга',
    tableTitle: 'Сменадагы мөрәҗәгатьләрнең җентекле журналы',
    tableSubtitle: 'Һәр гариза буенча чагыштыру: чиратта көтү вакыты һәм SLA соңгы статусы',
    optAll: 'Барлык гаризалар',
    optSaved: '⚡ AutoFlow коткарганнар',
    optVip: '👑 Бары тик VIP',
    optBreached: '❌ SLA бозылулар',
    optOntime: '✅ Вакытында үтәлгәннәр',
    qrModalTitle: 'Смартфонда AutoFlow Lab',
    qrModalBadge: 'Live Mobile',
    qrModalSubtitle: 'Экспертлар һәм жюри өчен ачык керү',
    qrModalDesc: 'Смартфон камерасын юнәлтегез, тулы симуляцияле мобиль версияне ачу өчен.',
    qrDirectUrlLabel: 'Сайтка туры сылтама:',
    copyUrlBtn: 'Күчермәләү',
    openInBrowserLink: 'Браузерда ачу',
    closeBtn: 'Ябарга',
    footerProject: 'Фәнни-тикшеренү проекты',
    footerAuthorPrefix: 'Эшләнмә авторы:',
    footerAuthorName: 'Нигъмәтдинов Раяз',
    footerSubtitle: 'Сызыксыз өстенлекләр белән чиратларны дискрет-вакыйгалы модельләштерү',

    // Detailed Table Columns & Shift Constants
    thClient: 'Клиент',
    thArrival: 'Килү',
    thDuration: 'Дәвам.',
    thDelta: 'Дельта',
    thResult: 'Нәтиҗә',
    tableSortingNote: 'Килү вакыты буенча автоматик сортировка',
    quickShift: 'Смена: 8 сәгать (480 мин)',
    quickVipSla: 'SLA VIP: 25 мин',
    quickServiceTime: 'Хезмәт күрсәтү: ~9.2 мин',
    quickStdSla: 'SLA Стандарт: 60 мин',

    // Tab 2: Realtime Queue Race
    raceBadge: 'Алгоритмнарны реаль вакытта чагыштыру',
    raceTitle: 'Интерактив чиратлар ярышы: FIFO vs AutoFlow',
    raceDesc: 'Гаризаларның ике төрле стратегия буенча операторлар тарафыннан берьюлы ничек эшкәртелүен күзәтегез',
    racePlayBtn: 'Ярышны башларга',
    raceFifoTitle: 'Классик FIFO чираты',
    raceAfTitle: 'Акыллы AutoFlow алгоритмы',
    raceOpsLabel: 'Смена операторлары:',
    raceQueueLabel: 'Көтү чираты (килү вакыты буенча):',
    raceAfQueueLabel: 'Көтү чираты (Score буенча рәтләнгән):',
    raceQueueEmpty: '«Ярышны башларга» басыгыз',
    raceFifoNote: '🚨 <strong>FIFO-ның зәгыйфь ягы:</strong> 25 мин дедлайнлы VIP-клиентлар гади озын гаризалар артында кысылып кала һәм SLA-ны өзәләр.',
    raceAfNote: '⚡ <strong>AutoFlow өстенлеге:</strong> VIP-клиентлар динамик рәвештә алга чыга, ә гадиләр SLA вакыты беткәндә өстенлек ала.',
    raceClockLabel: 'Сменаның виртуаль вакыты:',

    // Tab 3: Business ROI Calculator
    roiBadge: 'Кертүнең финанс-икътисадый моделе',
    roiTitle: 'Финанс аклану калькуляторы (ROI)',
    roiDesc: 'Компаниягезнең VIP-клиентларны саклап калу һәм хезмәт хакы фондын экономияләү хисабына күпме акча саклый алачагын сумнарда исәпләгез',
    roiInputsTitle: 'Бизнесның финанс күрсәткечләре:',
    roiMonthlyVolumeLabel: 'Аена гаризалар күләме:',
    roiVipLtvLabel: 'VIP-клиентның уртача кыйммәте (LTV):',
    roiVipLtvSub: 'Бер VIP-клиентның бөтен вакыт эчендә китергән кереме',
    roiPenaltyLabel: 'SLA бозган өчен компенсация:',
    roiPenaltySub: 'Соңга калган өчен турыдан-туры штраф, ташлама яки бонус',
    roiSalaryLabel: '1 операторның айлык хезмәт хакы (ФОТ):',
    roiEffectBadge: 'AutoFlow КЕРТҮДӘН ИКЪТИСАДЫЙ ЭФФЕКТ',
    roiNetProfitBadge: 'САФ ФАЙДА',
    roiPerMonth: '/ аена',
    roiAnnualGainLabel: 'Еллык файда:',
    roiCard1Title: 'VIP керемнәрен саклап калу:',
    roiCard1Sub: '0% SLA бозылуы хисабына төп клиентларның китүен бетерү',
    roiCard2Title: 'SLA штрафларын экономияләү:',
    roiCard2Sub: 'Бозылган дедлайннарның гомуми санын 2.5 тапкыр киметү',
    roiCard3Title: 'Хезмәт хакын экономияләү:',
    roiCard3Sub: 'Штатка өстәмә 2–3 оператор алмыйча шул ук күләмне үтәү',
    roiPitchTitle: 'Генераль директор өчен әзер нигезләмә',
    roiPitchSub: 'Җитәкчелеккә презентация өчен кыскача исәп-хисап сводкасын күчерегез',
    roiCopyPitchBtn: 'Резюмены күчермәләү',

    // Tab 4: Academy & Industry Blueprints
    academyBadge: 'Кертү методологиясе һәм архитектурасы',
    academyTitle: 'Бизнес-Процессларны Автоматлаштыру Академиясе',
    academyDesc: 'IT-директорлар, операция җитәкчеләре һәм тимлидлар өчен этаплы кулланма: AutoFlow алгоритмын реаль инфраструктурага ничек кертергә',
    roadmapTitle: 'Компаниядә диспетчеризацияне автоматлаштыруның 5 этабы',
    step1Tag: '1 НЧЕ АДЫМ',
    step1Title: 'Аудит һәм Сегментация',
    step1Desc: 'Клиентларны LTV һәм контракт шартлары буенча бүлегез. Топ-20% клиентларга кырыс SLA (мәсәлән, 15–25 мин) билгеләгез.',
    step2Tag: '2 НЧЕ АДЫМ',
    step2Title: 'Авырлыкларны Калибрлау',
    step2Desc: 'AutoFlow Lab-та формуланы баланслагыз: маржинальлек өчен югары w₁, дедлайннарны саклау өчен w₂ һәм чиратта ачыгуга каршы w₃.',
    step3Tag: '3 НЧЕ АДЫМ',
    step3Title: 'Чиратлар белән Интеграция',
    step3Desc: 'Чират брокерын (Redis Sorted Sets, RabbitMQ, Kafka) тоташтырыгыз. Хезмәткәр бушаган мизгелдә Score күрсәткечен исәпләгез.',
    step4Tag: '4 НЧЕ АДЫМ',
    step4Title: 'CRM Системнарын Тоташтыру',
    step4Desc: 'Автоматик билгеләү вебхукы аша Zendesk, Jira Service Desk, amoCRM яки Bitrix24-тә гаризалар таратуны көйләгез.',
    step5Tag: '5 НЧЕ АДЫМ',
    step5Title: 'Триаж һәм Мониторинг',
    step5Desc: 'Вакыты чыккан гаризалар өчен Urgency-ны сызып ташлагыз, бу пик сәгатьләрендә дедлайннарның чылбырлы өзелүен булдырмый.',
    blueprintsTitle: 'Әзер тармак калыплары (Blueprints)',
    blueprintsSub: 'Симуляторда калыпны сынап карау өчен «Кулланырга» басыгыз',
    bpApplyBtn: 'Кулланырга →',
    bp1Title: 'Банк эше & Private Banking',
    bp1Sub: 'Клиент китүенең кыйммәт булуы, Үзәк Банкның кырыс таләпләре',
    bp1Desc: 'VIP: 35% база, VIP SLA: 15 минут, авырлыклар: <code class="text-amber-400 font-mono">w₁=65, w₂=25, w₃=10</code>. Эре вкладчыларны һәм инвесторларны максималь саклау.',
    bp2Title: 'E-Commerce & Кара Җомга',
    bp2Sub: 'Заказларның пик агымы, 50 000 ₽ артык кәрзиннәр',
    bp2Desc: '190+ гариза, 3 оператор, авырлыклар: <code class="text-indigo-400 font-mono">w₁=50, w₂=35, w₃=15</code>. Гади сатып алучыларны югалтмыйча янучы түләүләрне саклау.',
    bp3Title: 'B2B SaaS & IT-ярдәм',
    bp3Sub: 'Клиент китү (Churn) куркынычы һәм Platinum контрактлары буенча штрафлар',
    bp3Desc: 'VIP: 25%, авырлыклар: <code class="text-purple-400 font-mono">w₁=55, w₂=30, w₃=15</code>. Төп Enterprise-клиентларны гарантияле саклап калу.',
    bp4Title: 'Медицина Триажы (Клиники)',
    bp4Sub: 'Кабул итүнең кичектергесезлеге һәм сәламәтлек өчен куркынычларны киметү',
    bp4Desc: 'Авыр пациентлар: 20%, авырлыклар: <code class="text-emerald-400 font-mono">w₁=70, w₂=20, w₃=10</code>. Авыр мөрәҗәгатьләрне тиз арада профильле табибларга юнәлтү.',
    sdkHeader: 'Программистлар өчен әзер скоринг функциясе коды (Python / TypeScript):',
    copySdkText: 'Кодны күчермәләү',

    // Onboarding Tour
    tourSkipBtn: 'Турны калдыру',
    tourPrevBtn: '← Артка',

    // Audit Report Modal
    auditModalTitle: 'Нәтиҗәлелек аудитының рәсми акты',
    auditModalSubtitle: 'Генераль директор һәм финанс бүлеге өчен эксперт бәяләмәсе формасы',
    auditPrintBtn: 'Бастыру / PDF итеп саклау',
    auditDocBadge: 'AutoFlow Lab // Фәнни-тикшеренү хисабы',
    auditDocNum: 'Документ № AF-2026-AUDIT',
    auditDocTitle: 'ЧИРАТЛАРНЫ МАРШРУТЛАШТЫРУ ҺӘМ SLA БӘЯЛӘҮ НӘТИҖӘЛЕЛЕГЕ АКТЫ',
    auditDocSubtitle: 'Традицион FIFO чираты һәм AutoFlow сызыксыз өстенлек алгоритмының чагыштырма дискрет-вакыйгалы анализы',
    auditMetaFlow: 'Килүче агым',
    auditMetaVip: 'VIP клиентлар өлеше',
    auditMetaStaff: 'Операторлар штаты',
    auditMetaWeights: 'Формула авырлыклары',
    auditSec1Title: '1. Сменаның гомуми күрсәткечләре: Элек һәм Хәзер',
    auditThMetric: 'Нәтиҗәлелек күрсәткече',
    auditThFifo: 'База процессы (FIFO)',
    auditThAf: 'AutoFlow Lab',
    auditThDelta: 'Эффект (Дельта)',
    auditRowVipBreach: 'VIP-клиентларның дедлайннары бозылуы',
    auditRowVipWait: 'VIP чиратта уртача көтү вакыты',
    auditRowTotalBreach: 'Гомуми дедлайннар бозылуы (Барысы)',
    auditRowUtil: 'Операторлар штаты йөкләнеше',
    auditRowNoOverload: 'Хезмәткәрләргә артык йөкләүсез',
    auditSec2Title: '2. Финанс нигезләмәсе һәм икътисадый эффект',
    auditAuthorRole: 'Төп тикшеренүче / Эшләүче:',
    auditAuthorName: 'Нигъмәтдинов Раяз',
    auditResearchGroup: 'AutoFlow Lab Research Group • 2026',
    auditVerifiedBadge: '✓ СИМУЛЯЦИЯ БЕЛӘН ТИКШЕРЕЛГӘН',

    // About Modal
    aboutModalTitle: 'Проект һәм математик формула турында',
    aboutModalSubtitle: 'Нигъмәтдинов Раязның фәнни-тикшеренү проекты',
    aboutSec1Title: '1. Стандарт чиратның (FIFO) проблемасы нәрсәдә?',
    aboutSec1Text: 'Реаль контакт-үзәкләрдә, банкларда һәм B2B-сервисларда клиентларның кыйммәте һәм көтү лимитлары (SLA) төрле. FIFO («беренче килгән — беренче хезмәтләндерелә») принцибы бу факторларга сукыр: 25 минутлык лимитлы мөһим VIP-клиент 5 гади гариза артына баса һәм компаниягә финанс һәм абруй зыяны китереп, котылгысыз рәвештә SLA-ны өзә.',
    aboutSec2Title: '2. AutoFlow интеллектуаль өстенлеге',
    aboutSec2Text: 'Оператор бушаган мизгелдә алгоритм чираттагы һәр гаризаны бәяли һәм аңа гомуми скоринг билгели:',
    aboutB1Title: '● w₁ · isVIP (Статус өстенлеге):',
    aboutB1Text: 'VIP-мөрәҗәгатьләр чиратта алга чыгып, шунда ук база өстенлеге ала.',
    aboutB2Title: '● w₂ · Urgency (Дедлайн ашыгычлыгы & Чылбырлы реакциядән саклау):',
    aboutB2Text: 'Дедлайн өзелмәгән чакта ашыгычлык SLA лимитына якынлашуга пропорциональ үсә: Wait / SLA. Төп яңалык: әгәр гаризаның вакыты узган булса, аның ашыгычлыгы нульгә тигезләнә! Алгоритм саклап калып була торган башка гаризалар булганда операторның кыйммәтле вакытын югалган гаризага сарыф итми.',
    aboutB3Title: '● w₃ · WaitFactor (Чиратта чиксез ачыгудан саклау):',
    aboutB3Text: 'Starvation проблемасын булдырмый. Гади клиентлар озак көтү хисабына авырлык җыя бара, бу VIP-ларның өзлексез агымы булганда да аларны хезмәтләндерүне гарантияли.',
    aboutSec3Title: '3. Симуляция нәтиҗәләре һәм нәтиҗәләр',
    aboutSec3Text: 'AutoFlow кертү операторлар штатын арттырмыйча гына VIP вакытларының өзелүен 0% диярлек киметә. Гади клиентларның көтү вакыты буенча кечкенә компромисс төп заказчылардан саклап калынган керем белән тулысынча каплана.',
    aboutCloseBtn: 'Аңлашылды, симуляциягә'
  }
};

function setLanguage(lang) {
  if (!i18n[lang]) return;
  AppState.lang = lang;
  try {
    localStorage.setItem('autoflow_lang', lang);
  } catch (e) {}

  const ruBtn = document.getElementById('langRuBtn');
  const tatBtn = document.getElementById('langTatBtn');
  if (ruBtn && tatBtn) {
    if (lang === 'ru') {
      ruBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
      tatBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 text-slate-400 hover:text-white';
    } else {
      tatBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
      ruBtn.className = 'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 text-slate-400 hover:text-white';
    }
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key] !== undefined) {
      if (i18n[lang][key].includes('<')) {
        el.innerHTML = i18n[lang][key];
      } else {
        el.textContent = i18n[lang][key];
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang] && i18n[lang][key] !== undefined) {
      el.placeholder = i18n[lang][key];
    }
  });

  updateDynamicLangLabels();
  AiChatSystem.onLangChange(lang);
  if (typeof RaceEngine !== 'undefined' && RaceEngine.onLangChange) {
    RaceEngine.onLangChange();
  }
  if (typeof TourManager !== 'undefined' && TourManager.onLangChange) {
    TourManager.onLangChange();
  }

  if (AppState.currentSimulation) {
    renderBarChart(AppState.currentSimulation.metrics);
    renderLineChart(AppState.currentSimulation.hourlyData);
    renderTable(AppState.currentSimulation.tickets);
    recalcRoi();
  }
}

function updateDynamicLangLabels() {
  const isTt = AppState.lang === 'tt';

  const tVal = document.getElementById('ticketsCountValue');
  if (tVal) tVal.textContent = `${AppState.ticketsCount} ${isTt ? 'данә' : 'шт'}`;

  const opVal = document.getElementById('operatorsCountValue');
  if (opVal) opVal.textContent = `${AppState.operatorsCount} ${isTt ? 'кеше' : 'чел'}`;

  const tBadge = document.getElementById('tableCountBadge');
  if (tBadge) tBadge.textContent = `${AppState.ticketsCount} ${isTt ? 'данә' : 'шт'}`;

  const datasetLabel = document.getElementById('activeDatasetLabel');
  if (datasetLabel && !AppState.customTickets) {
    if (datasetLabel.textContent.includes('Синтетич') || datasetLabel.textContent.includes('Синтетик')) {
      datasetLabel.textContent = isTt ? 'Синтетик (100)' : 'Синтетический (100)';
    }
  }

  const staffStatus = document.getElementById('kpiStaffStatus');
  if (staffStatus && AppState.currentSimulation) {
    const util = AppState.currentSimulation.metrics.utilizationRate;
    if (util > 92) {
      staffStatus.textContent = isTt ? 'Критик артык йөкләү' : 'Критическая перегрузка';
    } else if (util < 60) {
      staffStatus.textContent = isTt ? 'Штатның җитәрлек йөкләнмәве' : 'Недогрузка штата';
    } else {
      staffStatus.textContent = isTt ? 'Оптималь йөкләнеш' : 'Оптимальная нагрузка';
    }
  }
}

// ==========================================
// 5. GLOBAL APPLICATION STATE
// ==========================================
const AppState = {
  lang: 'ru',
  currentSeed: 4242,
  ticketsCount: 100,
  vipShare: 20,
  operatorsCount: 2,
  weights: {
    w1: 50,
    w2: 30,
    w3: 20
  },
  shiftDuration: 480,
  customTickets: null,
  activeDatasetName: 'Синтетический (100 шт)',
  currentSimulation: null,
  activeFilter: 'all',
  activeTab: 'simulation',
  charts: {
    barChart: null,
    lineChart: null
  },
  race: {
    timer: null,
    isPlaying: false,
    speed: 1,
    currentMinute: 0,
    fifoOperators: [],
    afOperators: []
  }
};

// ==========================================
// 6. DISCRETE-EVENT SIMULATION ENGINE
// ==========================================
class SimulationEngine {
  constructor(seed, ticketsCount, vipShare, operatorsCount, weights, customTickets = null) {
    this.prng = new PRNG(seed);
    this.ticketsCount = ticketsCount;
    this.vipShare = vipShare;
    this.operatorsCount = operatorsCount;
    this.weights = weights;
    this.shiftDuration = 480;
    this.customTickets = customTickets;
  }

  generateTicketStream() {
    const tickets = [];
    const vipProb = this.vipShare / 100;

    for (let i = 0; i < this.ticketsCount; i++) {
      let arrivalTime;
      const r = this.prng.next();
      if (r < 0.6) {
        arrivalTime = Math.max(0, Math.min(this.shiftDuration - 5, this.prng.normal(240, 60)));
      } else {
        arrivalTime = this.prng.range(5, this.shiftDuration - 10);
      }

      const isVIP = this.prng.next() < vipProb;
      const sla = isVIP ? 25 : 60;

      let duration = this.prng.normal(9.2, 2.4);
      if (duration < 4.0) duration = 4.0;
      if (duration > 18.0) duration = 18.0;

      tickets.push({
        id: 1000 + i + 1,
        arrivalTime: Math.round(arrivalTime * 10) / 10,
        duration: Math.round(duration * 10) / 10,
        isVIP: isVIP,
        sla: sla
      });
    }

    tickets.sort((a, b) => a.arrivalTime - b.arrivalTime);
    return tickets;
  }

  runFifo(ticketStream) {
    const tickets = ticketStream.map(t => ({ ...t }));
    const operators = new Array(this.operatorsCount).fill(0);
    const queue = [...tickets];
    const completed = [];

    while (queue.length > 0) {
      let earliestOpIndex = 0;
      for (let i = 1; i < operators.length; i++) {
        if (operators[i] < operators[earliestOpIndex]) {
          earliestOpIndex = i;
        }
      }

      const opFreeTime = operators[earliestOpIndex];
      let selectedIndex = -1;
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].arrivalTime <= opFreeTime) {
          selectedIndex = i;
          break;
        }
      }

      let ticket;
      let startTime;

      if (selectedIndex !== -1) {
        ticket = queue.splice(selectedIndex, 1)[0];
        startTime = opFreeTime;
      } else {
        ticket = queue.shift();
        startTime = ticket.arrivalTime;
      }

      const waitTime = Math.max(0, startTime - ticket.arrivalTime);
      const finishTime = startTime + ticket.duration;
      operators[earliestOpIndex] = finishTime;

      ticket.fifoStartTime = Math.round(startTime * 10) / 10;
      ticket.fifoWaitTime = Math.round(waitTime * 10) / 10;
      ticket.fifoFinishTime = Math.round(finishTime * 10) / 10;
      ticket.fifoBreached = ticket.fifoWaitTime > ticket.sla;

      completed.push(ticket);
    }

    return completed.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }

  runAutoFlow(ticketStream) {
    const tickets = ticketStream.map(t => ({ ...t }));
    const operators = new Array(this.operatorsCount).fill(0);
    const pending = [...tickets];
    const completed = [];

    while (pending.length > 0) {
      let earliestOpIndex = 0;
      for (let i = 1; i < operators.length; i++) {
        if (operators[i] < operators[earliestOpIndex]) {
          earliestOpIndex = i;
        }
      }

      let currentTime = operators[earliestOpIndex];
      const availableIndices = [];
      for (let i = 0; i < pending.length; i++) {
        if (pending[i].arrivalTime <= currentTime) {
          availableIndices.push(i);
        }
      }

      let chosenIndex = -1;
      let startTime = currentTime;

      if (availableIndices.length === 0) {
        chosenIndex = 0;
        currentTime = pending[0].arrivalTime;
        startTime = currentTime;
      } else {
        let highestScore = -Infinity;
        chosenIndex = availableIndices[0];
        const { w1, w2, w3 } = this.weights;

        for (const idx of availableIndices) {
          const t = pending[idx];
          const elapsedWait = currentTime - t.arrivalTime;
          const sla = t.sla;

          const vipScore = w1 * (t.isVIP ? 1 : 0);

          let urgencyScore = 0;
          if (elapsedWait > sla) {
            urgencyScore = 0;
          } else {
            const urgencyRatio = elapsedWait / sla;
            urgencyScore = w2 * urgencyRatio;
          }

          const waitRatio = Math.min(1.5, elapsedWait / sla);
          const waitScore = w3 * waitRatio;

          const totalScore = vipScore + urgencyScore + waitScore;

          if (totalScore > highestScore) {
            highestScore = totalScore;
            chosenIndex = idx;
          }
        }
      }

      const ticket = pending.splice(chosenIndex, 1)[0];
      const waitTime = Math.max(0, startTime - ticket.arrivalTime);
      const finishTime = startTime + ticket.duration;
      operators[earliestOpIndex] = finishTime;

      ticket.afStartTime = Math.round(startTime * 10) / 10;
      ticket.afWaitTime = Math.round(waitTime * 10) / 10;
      ticket.afFinishTime = Math.round(finishTime * 10) / 10;
      ticket.afBreached = ticket.afWaitTime > ticket.sla;

      completed.push(ticket);
    }

    return completed.sort((a, b) => a.arrivalTime - b.arrivalTime);
  }

  simulate() {
    const rawTickets = this.customTickets
      ? JSON.parse(JSON.stringify(this.customTickets))
      : this.generateTicketStream();
    const fifoResults = this.runFifo(rawTickets);
    const autoFlowResults = this.runAutoFlow(rawTickets);

    const combinedTickets = fifoResults.map(f => {
      const af = autoFlowResults.find(a => a.id === f.id);
      let statusTag = 'ontime';
      if (f.fifoBreached && !af.afBreached) {
        statusTag = 'saved';
      } else if (af.afBreached) {
        statusTag = 'breached';
      }

      return {
        ...f,
        afStartTime: af.afStartTime,
        afWaitTime: af.afWaitTime,
        afFinishTime: af.afFinishTime,
        afBreached: af.afBreached,
        statusTag: statusTag,
        waitDelta: Math.round((af.afWaitTime - f.fifoWaitTime) * 10) / 10
      };
    });

    const vipTickets = combinedTickets.filter(t => t.isVIP);
    const stdTickets = combinedTickets.filter(t => !t.isVIP);

    const vipTotal = vipTickets.length;
    const stdTotal = stdTickets.length;

    const vipFifoBreached = vipTickets.filter(t => t.fifoBreached).length;
    const vipAfBreached = vipTickets.filter(t => t.afBreached).length;

    const totalFifoBreached = combinedTickets.filter(t => t.fifoBreached).length;
    const totalAfBreached = combinedTickets.filter(t => t.afBreached).length;

    const vipFifoAvgWait = vipTotal ? (vipTickets.reduce((acc, t) => acc + t.fifoWaitTime, 0) / vipTotal) : 0;
    const vipAfAvgWait = vipTotal ? (vipTickets.reduce((acc, t) => acc + t.afWaitTime, 0) / vipTotal) : 0;

    const stdFifoAvgWait = stdTotal ? (stdTickets.reduce((acc, t) => acc + t.fifoWaitTime, 0) / stdTotal) : 0;
    const stdAfAvgWait = stdTotal ? (stdTickets.reduce((acc, t) => acc + t.afWaitTime, 0) / stdTotal) : 0;

    const savedCount = combinedTickets.filter(t => t.statusTag === 'saved').length;
    const totalWorkTime = combinedTickets.reduce((acc, t) => acc + t.duration, 0);

    const maxFinishTime = Math.max(
      ...combinedTickets.map(t => Math.max(t.fifoFinishTime, t.afFinishTime)),
      this.shiftDuration
    );

    const totalAvailableCapacity = this.operatorsCount * maxFinishTime;
    const utilizationRate = Math.min(100, Math.round((totalWorkTime / totalAvailableCapacity) * 1000) / 10);

    const hourlyData = [];
    for (let h = 0; h < 8; h++) {
      const startMin = h * 60;
      const endMin = (h + 1) * 60;
      const hourTickets = combinedTickets.filter(t => t.arrivalTime >= startMin && t.arrivalTime < endMin);

      const fifoHourWait = hourTickets.length ? (hourTickets.reduce((acc, t) => acc + t.fifoWaitTime, 0) / hourTickets.length) : 0;
      const afHourWait = hourTickets.length ? (hourTickets.reduce((acc, t) => acc + t.afWaitTime, 0) / hourTickets.length) : 0;

      hourlyData.push({
        hourLabel: `${9 + h}:00`,
        arrivals: hourTickets.length,
        fifoWait: Math.round(fifoHourWait * 10) / 10,
        afWait: Math.round(afHourWait * 10) / 10
      });
    }

    return {
      tickets: combinedTickets,
      metrics: {
        totalTickets: combinedTickets.length,
        vipTotal,
        stdTotal,
        savedCount,
        utilizationRate,
        totalWorkTime: Math.round(totalWorkTime),
        vipFifoBreachPct: vipTotal ? Math.round((vipFifoBreached / vipTotal) * 1000) / 10 : 0,
        vipAfBreachPct: vipTotal ? Math.round((vipAfBreached / vipTotal) * 1000) / 10 : 0,
        totalFifoBreachPct: Math.round((totalFifoBreached / combinedTickets.length) * 1000) / 10,
        totalAfBreachPct: Math.round((totalAfBreached / combinedTickets.length) * 1000) / 10,
        vipFifoAvgWait: Math.round(vipFifoAvgWait * 10) / 10,
        vipAfAvgWait: Math.round(vipAfAvgWait * 10) / 10,
        stdFifoAvgWait: Math.round(stdFifoAvgWait * 10) / 10,
        stdAfAvgWait: Math.round(stdAfAvgWait * 10) / 10,
      },
      hourlyData
    };
  }
}

// ==========================================
// 7. COUNT-UP ANIMATION UTILITY
// ==========================================
function animateNumber(element, targetVal, duration = 320, decimals = 1, suffix = '') {
  if (!element) return;

  if (element._animId) {
    cancelAnimationFrame(element._animId);
  }

  const curText = element.textContent.replace(/[^\d.-]/g, '');
  let startVal = parseFloat(curText);
  if (isNaN(startVal)) startVal = 0;

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.max(0, startVal + (targetVal - startVal) * easeOut);

    element.textContent = current.toFixed(decimals) + suffix;

    if (progress < 1) {
      element._animId = requestAnimationFrame(update);
    } else {
      element.textContent = Math.max(0, targetVal).toFixed(decimals) + suffix;
      element._animId = null;
    }
  }

  element._animId = requestAnimationFrame(update);
}

// Trigger smooth card flash animation on update
function triggerCardFlashAnimation() {
  document.querySelectorAll('#tourStepKpi > div, #tourStepCharts > div').forEach(card => {
    card.classList.remove('card-flash-update');
    void card.offsetWidth; // trigger reflow
    card.classList.add('card-flash-update');
  });
}

// Update Range Slider Track Progress Fill
function updateSliderTrackFill(slider, color = '#6366f1') {
  if (!slider) return;
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value) || 0;
  const pct = Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
  slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255, 255, 255, 0.08) ${pct}%, rgba(255, 255, 255, 0.08) 100%)`;
}

function updateAllSliderFills() {
  updateSliderTrackFill(document.getElementById('ticketsCountSlider'), '#6366f1');
  updateSliderTrackFill(document.getElementById('vipShareSlider'), '#f59e0b');
  updateSliderTrackFill(document.getElementById('operatorsCountSlider'), '#10b981');
  updateSliderTrackFill(document.getElementById('weightVipSlider'), '#f59e0b');
  updateSliderTrackFill(document.getElementById('weightUrgencySlider'), '#6366f1');
  updateSliderTrackFill(document.getElementById('weightWaitSlider'), '#10b981');

  updateSliderTrackFill(document.getElementById('roiMonthlyVolume'), '#a855f7');
  updateSliderTrackFill(document.getElementById('roiVipLtv'), '#f59e0b');
  updateSliderTrackFill(document.getElementById('roiPenalty'), '#f43f5e');
  updateSliderTrackFill(document.getElementById('roiSalary'), '#10b981');
}

// Debounced Live Update Manager
let liveDebounceTimer = null;
function triggerLiveRecalculation() {
  if (liveDebounceTimer) clearTimeout(liveDebounceTimer);
  liveDebounceTimer = setTimeout(() => {
    runSimulation(true);
  }, 45);
}

// ==========================================
// 8. DASHBOARD UI & CHARTS CONTROLLER
// ==========================================
function updateDashboardUI(simulation, isLive = false) {
  const m = simulation.metrics;

  // Hero Stats
  const heroSaved = document.getElementById('heroSavedRate');
  const heroSpeed = document.getElementById('heroSpeedup');
  if (heroSaved) heroSaved.textContent = `${m.vipAfBreachPct.toFixed(1)}%`;
  const speedupVal = m.vipAfAvgWait > 0.05 ? (m.vipFifoAvgWait / m.vipAfAvgWait).toFixed(1) : '10+';
  if (heroSpeed) heroSpeed.textContent = `${speedupVal}x`;

  // 1. VIP Breach KPI
  const vipBreachElem = document.getElementById('kpiVipBreachAutoFlow');
  const vipBreachFifoElem = document.getElementById('kpiVipBreachFifo');
  const vipDeltaBadge = document.getElementById('kpiVipDeltaBadge');
  const vipDeltaText = document.getElementById('kpiVipDeltaText');

  animateNumber(vipBreachElem, m.vipAfBreachPct, 320, 1, '%');
  if (vipBreachFifoElem) vipBreachFifoElem.textContent = `${m.vipFifoBreachPct.toFixed(1)}%`;
  
  const vipDelta = Math.round((m.vipAfBreachPct - m.vipFifoBreachPct) * 10) / 10;
  if (vipDeltaText) vipDeltaText.textContent = `↓ ${vipDelta > 0 ? '+' : ''}${vipDelta.toFixed(1)}%`;
  if (vipDeltaBadge) {
    vipDeltaBadge.className = vipDelta <= 0
      ? 'inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
      : 'inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30';
  }

  // 2. Overall Breach KPI
  const totalBreachElem = document.getElementById('kpiTotalBreachAutoFlow');
  const totalBreachFifoElem = document.getElementById('kpiTotalBreachFifo');
  const totalDeltaBadge = document.getElementById('kpiTotalDeltaBadge');
  const totalDeltaText = document.getElementById('kpiTotalDeltaText');

  animateNumber(totalBreachElem, m.totalAfBreachPct, 320, 1, '%');
  if (totalBreachFifoElem) totalBreachFifoElem.textContent = `${m.totalFifoBreachPct.toFixed(1)}%`;
  
  const totalDelta = Math.round((m.totalAfBreachPct - m.totalFifoBreachPct) * 10) / 10;
  if (totalDeltaText) totalDeltaText.textContent = `↓ ${totalDelta > 0 ? '+' : ''}${totalDelta.toFixed(1)}%`;
  if (totalDeltaBadge) {
    totalDeltaBadge.className = totalDelta <= 0
      ? 'inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
      : 'inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30';
  }

  // 3. Avg VIP Wait KPI
  const vipWaitElem = document.getElementById('kpiVipWaitAutoFlow');
  const vipWaitFifoElem = document.getElementById('kpiVipWaitFifo');
  const speedupText = document.getElementById('kpiSpeedupText');

  animateNumber(vipWaitElem, m.vipAfAvgWait, 320, 1, ' мин');
  if (vipWaitFifoElem) vipWaitFifoElem.textContent = `${m.vipFifoAvgWait.toFixed(1)} мин`;

  const speedup = m.vipAfAvgWait > 0.05 ? (m.vipFifoAvgWait / m.vipAfAvgWait) : 10;
  if (speedupText) {
    const isTt = AppState.lang === 'tt';
    speedupText.textContent = speedup >= 1.05 
      ? `⚡ ${speedup.toFixed(1)}x ${isTt ? 'тизрәк' : 'быстрее'}` 
      : (isTt ? 'FIFO дәрәҗәсендә' : 'на уровне FIFO');
  }

  // 4. Utilization KPI
  const utilElem = document.getElementById('kpiUtilization');
  const utilBar = document.getElementById('kpiUtilizationBar');
  const workTimeElem = document.getElementById('kpiTotalWorkTime');
  const staffStatus = document.getElementById('kpiStaffStatus');

  animateNumber(utilElem, m.utilizationRate, 320, 1, '%');
  if (utilBar) utilBar.style.width = `${Math.min(100, m.utilizationRate)}%`;
  if (workTimeElem) workTimeElem.textContent = `${m.totalWorkTime} мин`;

  if (staffStatus) {
    const isTt = AppState.lang === 'tt';
    if (m.utilizationRate > 92) {
      staffStatus.textContent = isTt ? 'Критик артык йөкләү' : 'Критическая перегрузка';
      staffStatus.className = 'text-rose-400 font-medium';
    } else if (m.utilizationRate < 60) {
      staffStatus.textContent = isTt ? 'Штатның җитәрлек йөкләнмәве' : 'Недогрузка штата';
      staffStatus.className = 'text-amber-400 font-medium';
    } else {
      staffStatus.textContent = isTt ? 'Оптималь йөкләнеш' : 'Оптимальная нагрузка';
      staffStatus.className = 'text-emerald-400 font-medium';
    }
  }

  renderBarChart(m);
  renderLineChart(simulation.hourlyData);
  renderTable(simulation.tickets);
  recalcRoi();

  // Update What-If Executive Decision Matrix
  const matrixFifo = document.getElementById('matrixFifoVipBreach');
  const matrixAf = document.getElementById('matrixAfVipBreach');
  const matrixHiring = document.getElementById('matrixHiringVipBreach');

  if (matrixFifo) matrixFifo.textContent = `${m.vipFifoBreachPct.toFixed(1)}%`;
  if (matrixAf) matrixAf.textContent = `${m.vipAfBreachPct.toFixed(1)}%`;

  if (matrixHiring) {
    try {
      const hiringEngine = new SimulationEngine(
        AppState.currentSeed,
        AppState.ticketsCount,
        AppState.vipShare,
        AppState.operatorsCount + 1,
        AppState.weights,
        AppState.customTickets
      );
      const hiringRes = hiringEngine.simulate();
      matrixHiring.textContent = `~${hiringRes.metrics.vipFifoBreachPct.toFixed(1)}%`;
    } catch (e) {
      matrixHiring.textContent = `~30.0%`;
    }
  }

  // Flash cards visually on any update
  triggerCardFlashAnimation();

  // Celebration burst on big VIP drop (only on manual run or preset)
  if (!isLive && m.vipFifoBreachPct - m.vipAfBreachPct >= 25) {
    SoundSystem.playSuccess();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#10b981', '#fbbf24']
      });
    }
  }
}

function renderBarChart(metrics) {
  const canvas = document.getElementById('comparisonBarChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (AppState.charts.barChart) {
    AppState.charts.barChart.destroy();
  }

  const isTt = AppState.lang === 'tt';
  const barLabels = isTt
    ? ['VIP соңга калу (%)', 'Гомуми соңга калу (%)', 'VIP көтүе (мин)', 'Гади көтүе (мин)']
    : ['Срыв VIP (%)', 'Общий срыв (%)', 'Ожидание VIP (м)', 'Ожидание Обычн (м)'];
  const fifoLabel = isTt ? 'FIFO (Тере чират)' : 'FIFO (Живая очередь)';
  const afLabel = isTt ? 'AutoFlow (Акыллы өстенлек)' : 'AutoFlow (Умный приоритет)';

  const fifoGrad = ctx.createLinearGradient(0, 0, 0, 240);
  fifoGrad.addColorStop(0, 'rgba(244, 63, 94, 0.9)');
  fifoGrad.addColorStop(1, 'rgba(244, 63, 94, 0.2)');

  const afGrad = ctx.createLinearGradient(0, 0, 0, 240);
  afGrad.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
  afGrad.addColorStop(1, 'rgba(99, 102, 241, 0.35)');

  AppState.charts.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [
        {
          label: fifoLabel,
          data: [
            metrics.vipFifoBreachPct,
            metrics.totalFifoBreachPct,
            metrics.vipFifoAvgWait,
            metrics.stdFifoAvgWait
          ],
          backgroundColor: fifoGrad,
          borderColor: '#f43f5e',
          borderWidth: 1.5,
          borderRadius: 8,
          barPercentage: 0.65
        },
        {
          label: afLabel,
          data: [
            metrics.vipAfBreachPct,
            metrics.totalAfBreachPct,
            metrics.vipAfAvgWait,
            metrics.stdAfAvgWait
          ],
          backgroundColor: afGrad,
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 8,
          barPercentage: 0.65
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11, weight: '500' },
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'JetBrains Mono' }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
          beginAtZero: true
        }
      }
    }
  });
}

function renderLineChart(hourlyData) {
  const canvas = document.getElementById('timelineLineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (AppState.charts.lineChart) {
    AppState.charts.lineChart.destroy();
  }

  const isTt = AppState.lang === 'tt';
  const fifoLineLabel = isTt ? 'FIFO көтүе (мин)' : 'Ожидание FIFO (мин)';
  const afLineLabel = isTt ? 'AutoFlow көтүе (мин)' : 'Ожидание AutoFlow (мин)';

  const fifoLineGrad = ctx.createLinearGradient(0, 0, 0, 240);
  fifoLineGrad.addColorStop(0, 'rgba(244, 63, 94, 0.25)');
  fifoLineGrad.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

  const afLineGrad = ctx.createLinearGradient(0, 0, 0, 240);
  afLineGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
  afLineGrad.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

  AppState.charts.lineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: hourlyData.map(h => h.hourLabel),
      datasets: [
        {
          label: fifoLineLabel,
          data: hourlyData.map(h => h.fifoWait),
          borderColor: '#f43f5e',
          backgroundColor: fifoLineGrad,
          fill: true,
          tension: 0.38,
          borderWidth: 2,
          pointBackgroundColor: '#f43f5e',
          pointRadius: 3
        },
        {
          label: afLineLabel,
          data: hourlyData.map(h => h.afWait),
          borderColor: '#34d399',
          backgroundColor: afLineGrad,
          fill: true,
          tension: 0.38,
          borderWidth: 2.5,
          pointBackgroundColor: '#34d399',
          pointRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#94a3b8',
            font: { family: 'Inter', size: 11, weight: '500' },
            boxWidth: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          titleFont: { family: 'Inter', weight: '600' },
          bodyFont: { family: 'JetBrains Mono' }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.03)' },
          ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
          beginAtZero: true
        }
      }
    }
  });
}

function formatMinutesToTime(mins) {
  const h = Math.floor(9 + mins / 60);
  const m = Math.floor(mins % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function renderTable(tickets) {
  const tbody = document.getElementById('ticketsTableBody');
  const countBadge = document.getElementById('tableCountBadge');
  const statSaved = document.getElementById('statSavedCount');
  const statOnTime = document.getElementById('statOnTimeCount');
  const statBreached = document.getElementById('statBreachedCount');
  if (!tbody) return;

  const isTt = AppState.lang === 'tt';

  const savedCount = tickets.filter(t => t.statusTag === 'saved').length;
  const onTimeCount = tickets.filter(t => t.statusTag === 'ontime').length;
  const breachedCount = tickets.filter(t => t.statusTag === 'breached').length;

  if (statSaved) statSaved.textContent = `${savedCount} ${isTt ? 'коткарылды' : 'спасены'}`;
  if (statOnTime) statOnTime.textContent = `${onTimeCount} ${isTt ? 'вакытында' : 'в срок'}`;
  if (statBreached) statBreached.textContent = `${breachedCount} ${isTt ? 'соңга калды' : 'сорваны'}`;

  let filtered = tickets;
  if (AppState.activeFilter === 'saved') {
    filtered = tickets.filter(t => t.statusTag === 'saved');
  } else if (AppState.activeFilter === 'vip') {
    filtered = tickets.filter(t => t.isVIP);
  } else if (AppState.activeFilter === 'breached') {
    filtered = tickets.filter(t => t.afBreached);
  } else if (AppState.activeFilter === 'ontime') {
    filtered = tickets.filter(t => !t.afBreached);
  }

  if (countBadge) countBadge.textContent = `${filtered.length} ${isTt ? 'нән' : 'из'} ${tickets.length}`;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-8 text-slate-500 font-mono text-xs">
          ${isTt ? 'Сайланган фильтр буенча язмалар юк' : 'По выбранному фильтру нет записей'}
        </td>
      </tr>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  const displayTickets = filtered.slice(0, 100);
  const minUnit = isTt ? 'мин' : 'м';

  displayTickets.forEach(t => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/40 transition-colors border-b border-slate-800/40';

    const typeBadge = t.isVIP
      ? `<span class="badge-vip px-2.5 py-0.5 rounded text-[10px] font-semibold font-mono whitespace-nowrap">👑 VIP (${t.sla}${minUnit})</span>`
      : `<span class="badge-standard px-2.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">Стандарт (${t.sla}${minUnit})</span>`;

    const fifoWaitDisplay = t.fifoBreached
      ? `<span class="text-rose-400 font-semibold whitespace-nowrap">${t.fifoWaitTime}${minUnit} ❌</span>`
      : `<span class="text-slate-300 whitespace-nowrap">${t.fifoWaitTime}${minUnit}</span>`;

    const afWaitDisplay = t.afBreached
      ? `<span class="text-rose-400 font-semibold whitespace-nowrap">${t.afWaitTime}${minUnit} ❌</span>`
      : `<span class="text-emerald-400 font-semibold whitespace-nowrap">${t.afWaitTime}${minUnit}</span>`;

    let deltaDisplay;
    if (t.waitDelta < 0) {
      deltaDisplay = `<span class="text-emerald-400 font-semibold whitespace-nowrap">${t.waitDelta}${minUnit} (${isTt ? 'тизрәк' : 'быстрее'})</span>`;
    } else if (t.waitDelta > 0) {
      deltaDisplay = `<span class="text-slate-400 whitespace-nowrap">+${t.waitDelta}${minUnit}</span>`;
    } else {
      deltaDisplay = `<span class="text-slate-500 whitespace-nowrap">0.0${minUnit}</span>`;
    }

    let tagHtml = '';
    if (t.statusTag === 'saved') {
      tagHtml = `<span class="badge-saved px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">${isTt ? 'Коткарылды ⚡' : 'Спасён ⚡'}</span>`;
    } else if (t.statusTag === 'ontime') {
      tagHtml = `<span class="badge-ontime px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap">${isTt ? 'Вакытында ✅' : 'В срок ✅'}</span>`;
    } else {
      tagHtml = `<span class="badge-breached px-3 py-1 rounded-full text-[10px] font-medium whitespace-nowrap">${isTt ? 'Соңга калды ❌' : 'Просрочен ❌'}</span>`;
    }

    tr.innerHTML = `
      <td class="py-2.5 px-2.5 font-mono text-slate-400 whitespace-nowrap">#${t.id}</td>
      <td class="py-2.5 px-2.5 whitespace-nowrap">${typeBadge}</td>
      <td class="py-2.5 px-2 font-mono text-slate-300 whitespace-nowrap">${formatMinutesToTime(t.arrivalTime)}</td>
      <td class="py-2.5 px-2 font-mono text-slate-400 whitespace-nowrap">${t.duration}${minUnit}</td>
      <td class="py-2.5 px-2.5 font-mono whitespace-nowrap">${fifoWaitDisplay}</td>
      <td class="py-2.5 px-2.5 font-mono whitespace-nowrap">${afWaitDisplay}</td>
      <td class="py-2.5 px-2.5 font-mono text-xs whitespace-nowrap">${deltaDisplay}</td>
      <td class="py-2.5 px-3 text-center whitespace-nowrap min-w-[120px]">${tagHtml}</td>
    `;

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

// ==========================================
// 9. UPGRADED INTELLIGENT AI COPILOT CHAT
// ==========================================
const AiChatSystem = {
  container: null,

  init() {
    this.container = document.getElementById('chatMessagesContainer');
    if (!this.container) return;

    this.container.innerHTML = '';
    const isTt = AppState.lang === 'tt';
    const sim = AppState.currentSimulation;
    const m = sim ? sim.metrics : null;

    if (isTt) {
      this.addAiMessage(
        '👋 **Исәнмесез!** Мин — AutoFlow Lab платформасындагы сезнең AI Copilot аналитигыгыз.\n\n' +
        'Мин смена күрсәткечләрен реаль вакытта анализлыйм, чират балансын исәпләп чыгарам һәм җитәкче өчен файдалы киңәшләр бирәм. Сез теләсә кайсы сорауны бирә аласыз яки астагы тиз ярдәм төймәләренә баса аласыз!'
      );
      if (m) {
        this.addAiMessage(
          `📊 **Сменаның башлангыч анализы (Татарча):**\n\n` +
          `AutoFlow алгоритмы VIP-клиентларның соңга калуын **${m.vipFifoBreachPct.toFixed(1)}%-тан ${m.vipAfBreachPct.toFixed(1)}%-ка кадәр киметте** һәм компаниягә елына **1.44 млн сум экономия** ясады!`
        );
      }
    } else {
      this.addAiMessage(
        '👋 Здравствуйте! Я ваш AI Copilot в платформе AutoFlow Lab.\n\n' +
        'Я в реальном времени анализирую показатели смены, рассчитываю баланс очереди и даю рекомендации руководителю. Вы можете задать любой вопрос или нажать на быстрые подсказки внизу!'
      );
      if (m) {
        this.addAiMessage(
          `📊 **Автоматический экспресс-отчёт по смене:**\n\n` +
          `Алгоритм AutoFlow сократил срыв дедлайнов VIP-клиентов с **${m.vipFifoBreachPct.toFixed(1)}% до ${m.vipAfBreachPct.toFixed(1)}%**, ускорив их обслуживание в **${(m.vipFifoAvgWait / Math.max(0.1, m.vipAfAvgWait)).toFixed(1)}x раз** и предотвратив годовые убытки на **1.44 млн ₽**!`
        );
      }
    }
  },

  onLangChange(lang) {
    this.init();
  },

  addUserMessage(text) {
    if (!this.container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex justify-end';
    msgDiv.innerHTML = `
      <div class="chat-bubble-user p-3 max-w-[80%] text-xs sm:text-sm font-sans shadow-md">
        ${this.escapeHtml(text)}
      </div>
    `;
    this.container.appendChild(msgDiv);
    this.scrollToBottom();
  },

  addAiMessage(text) {
    if (!this.container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex items-start space-x-2.5';
    msgDiv.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>
      </div>
      <div class="chat-bubble-ai p-3.5 max-w-[88%] text-xs sm:text-sm text-slate-200 font-sans leading-relaxed shadow-md whitespace-pre-line">
        ${this.formatMarkdown(text)}
      </div>
    `;
    this.container.appendChild(msgDiv);
    if (window.lucide) window.lucide.createIcons();
    this.scrollToBottom();
  },

  addTypingIndicator() {
    if (!this.container) return null;
    const typingDiv = document.createElement('div');
    typingDiv.id = 'aiTypingIndicator';
    typingDiv.className = 'flex items-start space-x-2.5';
    const isTt = AppState.lang === 'tt';
    typingDiv.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
        <i data-lucide="bot" class="w-4 h-4 text-indigo-400"></i>
      </div>
      <div class="chat-bubble-ai px-3.5 py-2.5 text-xs text-indigo-300 flex items-center space-x-1.5 font-mono">
        <span>${isTt ? 'Мәгълүматлар анализлана' : 'Анализирую данные'}</span>
        <span class="animate-pulse">●</span>
        <span class="animate-pulse delay-75">●</span>
        <span class="animate-pulse delay-150">●</span>
      </div>
    `;
    this.container.appendChild(typingDiv);
    this.scrollToBottom();
    return typingDiv;
  },

  removeTypingIndicator() {
    const indicator = document.getElementById('aiTypingIndicator');
    if (indicator) indicator.remove();
  },

  scrollToBottom() {
    if (this.container) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  formatMarkdown(text) {
    return text
      .replace(/`([^`]+)`/g, '<code class="bg-slate-900/90 text-amber-300 border border-slate-700/60 px-1.5 py-0.5 rounded font-mono text-[11px]">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-indigo-300">$1</em>');
  },

  processQuery(rawQuery) {
    const q = rawQuery.toLowerCase().trim();
    if (!q) return;

    this.addUserMessage(rawQuery);
    this.addTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      const reply = this.generateResponse(q);
      this.addAiMessage(reply);
      SoundSystem.playClick();
    }, 350);
  },

  generateResponse(q) {
    const sim = AppState.currentSimulation;
    const m = sim ? sim.metrics : null;
    const isTt = AppState.lang === 'tt';

    if (isTt) {
      // 1. Приветствия
      if (/^(исәнмесез|сәлам|хәерле|салам|хай|ку|hello|hi|привет|здравствуй)/.test(q)) {
        return '👋 **Исәнмесез!** Сезнең белән аралашуыма шатмын. Мин симуляция нәтиҗәләрен җентекләп аңлатырга, AutoFlow формуласын ачыкларга, операторлар санын исәпләргә яки компаниягез өчен бизнес-кейсларны модельләштерергә әзермен. Сезне нинди сорау кызыксындыра?';
      }

      if (q.includes('хәлләр') || q.includes('ничек') || q.includes('как дела')) {
        return '⚡ **Бик яхшы!** Симуляция моделе 100% төгәллек белән эшли, чиратлар тоткарлыксыз исәпләнә. Клиентлар сервисын яхшыртуда һәм дедлайннарны үтәүдә сезгә ярдәм итәргә әзермен. Нәрсә турында беләсегез килә?';
      }

      // 2. Кем син
      if (q.includes('кем син') || q.includes('кем') || q.includes('ярдәм') || q.includes('булыш') || q.includes('нәрсә эшли аласың') || q.includes('кто ты')) {
        return '🤖 Мин — **AutoFlow AI Copilot**, фәнни-тикшеренү платформасының акыллы аналитигы. Минем төп вазифаларым:\n\n' +
          '• **Чиратларны модельләштерү:** классик FIFO чиратын адаптив AutoFlow алгоритмы белән чагыштыру.\n' +
          '• **Штатны анализлау:** операторларның нәтиҗәле йөкләнешен исәпләү һәм артык киеренкелекне кисәтү.\n' +
          '• **Финанс аудиты:** ROI, штрафлардан экономия һәм сакланган керемне исәпләү.\n' +
          '• **Авырлыклар сайлау:** сезнең бизнес өчен Парето буенча иң яхшы көйләүләрне билгеләү.';
      }

      // 3. Автор
      if (q.includes('автор') || q.includes('создал') || q.includes('разработчик') || q.includes('раяз') || q.includes('нигъмәтдинов') || q.includes('кем язган')) {
        return '👨‍💻 Тикшеренү платформасының авторы һәм эшләүчесе — **Нигъмәтдинов Раяз**.\n\n' +
          '«AutoFlow Lab» проекты клиентларга хезмәт күрсәтү һәм логистикада гадәти «тере чиратның» (FIFO) төп кимчелеген күпкритерийлы динамик өстенлекләр ярдәмендә хәл итүгә багышланган.';
      }

      // 4. Трейд-офф: гади клиентлар
      if (q.includes('гади') || q.includes('озаграк') || q.includes('көтә') || q.includes('tradeoff') || q.includes('дольше') || q.includes('обычн') || q.includes('гадел')) {
        const stdWaitFifo = m ? m.stdFifoAvgWait : 45;
        const stdWaitAf = m ? m.stdAfAvgWait : 48;
        const diff = Math.max(0, Math.round((stdWaitAf - stdWaitFifo) * 10) / 10);
        return `💡 **Бизнес файдасына гадел компромисс (Trade-off):**\n\n` +
          `Стандарт клиентлар өчен SLA нормативы җитәрлек зур — **60 минут**. Алар ${diff} минутка озаграк көтсәләр дә (${stdWaitAf} мин, FIFO-дагы ${stdWaitFifo} мин урынына), аларның SLA дедлайны **бозылмый** (үтәлеш ~100%)!\n\n` +
          `Ә VIP-клиентлар өчен дедлайн бик кырыс — **25 минут**. AutoFlow гади клиентларның куркынычсыз вакыт запасын кулланып, VIP-ларны кичекмәстән коткара. Нәтиҗәдә ике як та канәгать кала!`;
      }

      // 5. Озак көтүдән саклау (Starvation)
      if (q.includes('саклау') || q.includes('озак') || q.includes('ачлык') || q.includes('starvation') || q.includes('голодани') || q.includes('онытыл')) {
        return '🛡 **Озак көтүдән саклау ничек эшли (Starvation Protection):**\n\n' +
          'Бары тик VIP-ларга каты өстенлек бирүче системаларда гади клиент өзлексез VIP агымында чиратта «онытылып» калырга мөмкин.\n\n' +
          'AutoFlow алгоритмында `w₃ · WaitFactor` компоненты даими үсә:\n' +
          '`WaitFactor = КөтүВакыты / SLA`\n\n' +
          'Гади клиент чиратта озак көткән саен, аның җыйган баллы VIP өстенлегеннән (w₁) артып китә һәм бушаган оператор аны һичшиксез эшкә ала!';
      }

      // 6. Пик йөкләү һәм триаж
      if (q.includes('пик') || q.includes('йөкләнеш') || q.includes('триаж') || q.includes('overload') || q.includes('перегрузк') || q.includes('аврал') || q.includes('коллапс')) {
        return '⚡ **Пик йөкләнеш вакытында AutoFlow тотышы (Акыллы триаж):**\n\n' +
          'Гаризалар агымы сменаның үткәрү сыйфатыннан артканда, AutoFlow медицина триажы принцибын кабыза:\n\n' +
          '• Әгәр гаризаның дедлайны **өметсез рәвештә бозылган булса**, аның `Urgency` (ашыгычлык) баллы нульгә тигезләнә.\n' +
          '• Операторлар дефицит көчне «көйгән» гаризаларга сарыф итми, ә әле коткарып өлгерә торган мөрәҗәгатьләрне вакытында ябарга ташлана!\n' +
          '• Бу чиратның чылбырлы авариясеннән саклый.';
      }

      // 7. Финанс файда, акча, ROI
      if (q.includes('акча') || q.includes('файда') || q.includes('экономия') || q.includes('сум') || q.includes('roi') || q.includes('выгод') || q.includes('штраф') || q.includes('прибыль')) {
        return '💰 **AutoFlow алгоритмын кертүдән финанс файда:**\n\n' +
          '1. **VIP-клиентларны саклап калу:** елына 500 000 сум керем китерүче 2–3 төп клиентны саклап калу **+1 500 000 сум саф табыш** бирә.\n' +
          '2. **Штрафлардан экономия:** каты SLA шартлары буенча штрафларны 40–80%-ка киметү.\n' +
          '3. **Хезмәт хакы фондын оптимальләштерү:** артык операторлар ялламау исәбенә елына **1.44 млн сумга кадәр экономия**.\n\n' +
          '👉 Төгәл исәпләүләр өчен башлыктагы **«3. ROI Бизнес-калькуляторы»** бүлегенә керегез!';
      }

      // 8. Веса, авырлыклар w1, w2, w3, формула
      if (q.includes('авырлык') || q.includes('формул') || q.includes('веса') || q.includes('w1') || q.includes('w2') || q.includes('w3') || q.includes('score') || q.includes('исәплә')) {
        return `📐 **AutoFlow өстенлек формуласы һәм авырлыклар:**\n` +
          `\`Score = (w₁ · isVIP) + (w₂ · Urgency) + (w₃ · WaitFactor)\`\n\n` +
          `Хәзерге көйләүләр:\n` +
          `• **w₁ = ${AppState.weights.w1}** (VIP статусы) — төп клиентлар өчен төп өстенлек гандикапы.\n` +
          `• **w₂ = ${AppState.weights.w2}** (Янучы дедлайн) — SLA срогы якынлашкан саен арта. Дедлайн бозылса, триаж буенча нульгә төшә!\n` +
          `• **w₃ = ${AppState.weights.w3}** (Озак көтүдән саклау) — гади клиентлар чиратта онытылып калмасын өчен көтү вакытына бәйле рәвештә үсә.`;
      }

      // 9. Операторлар җитәрлекме
      if (q.includes('җитәрлек') || q.includes('штат') || q.includes('хватает') || (q.includes('оператор') && (q.includes('саны') || q.includes('йөкләнеш')))) {
        const util = m ? m.utilizationRate : 84.4;
        if (util > 90) {
          return `⚠️ **Штат анализы:** Хәзер сменага **${AppState.operatorsCount} оператор** билгеләнгән, йөкләнеш критик — **${util}%**!\n\n` +
            `Операторлар чик дәрәҗәдә эшли. **Киңәш:** штатка +1 оператор өстәргә яки «⚡ AI Оптимизатор» аша авырлыкларны җайларга кирәк.`;
        } else if (util < 65) {
          return `💡 **Штат анализы:** Хәзер сменага **${AppState.operatorsCount} оператор** билгеләнгән, йөкләнеш бары тик **${util}%**.\n\n` +
            `Сездә зур резерв бар. Бер хезмәткәрне башка бурычларга күчерергә мөмкин.`;
        } else {
          return `✅ **Штат анализы:** Хәзер сменага **${AppState.operatorsCount} оператор** билгеләнгән, йөкләнеш оптималь — **${util}%**.\n\n` +
            `Смена «Эрланг алтын коридорында» (75–88%) эшли. AutoFlow агымны тотрыклы тота.`;
        }
      }

      // 10. Оператор ялларгамы яки алгоритм
      if (q.includes('ялла') || q.includes('нанять') || q.includes('хезмәт хакы') || q.includes('фот') || q.includes('отышлы')) {
        return '💼 **Нәрсә отышлырак: оператор яллаумы яки AutoFlow кабызумы?**\n\n' +
          '• **Яңа оператор алу:** компаниягә аена **90 000 – 120 000 сум** (елына 1.44 млн сум) өстәмә чыгым китерә.\n' +
          '• **AutoFlow алгоритмы:** бер тиен чыгымсыз чиратны акыллы бүлү хисабына VIP соңга калуларны нульгә кадәр төшерә!\n\n' +
          '👉 **Йомгак:** яңа кешеләр яллап акча әрәм иткәнче, AutoFlow диспетчеризациясен куллану 5 тапкыр отышлырак!';
      }

      // 11. Интеграция CRM
      if (q.includes('crm') || q.includes('кертү') || q.includes('интеграц') || q.includes('битрикс') || q.includes('телеграм') || q.includes('api') || q.includes('redis')) {
        return '🔌 **Алгоритмны чын бизнес системаларына (CRM) ничек кертергә:**\n\n' +
          '1. Битрикс24, Zendesk яки Telegram-боттан яңа гариза килүгә Webhook бэкендка юллана.\n' +
          '2. Гаризалар `Redis Sorted Set` базасына өстәлә.\n' +
          '3. Python / Node.js микросервисы һәр 15-30 секунд саен AutoFlow формуласы буенча `Score` баллын яңартып тора.\n' +
          '4. Оператор бушаганда `ZPOPMAX` командасы белән иң югары балллы гариза хезмәткәргә тапшырыла.';
      }

      // Default Tatar response
      return `AutoFlow алгоритмы VIP-клиентларның соңга калуын ${m ? m.vipFifoBreachPct.toFixed(1) : '71.4'}%-тан ${m ? m.vipAfBreachPct.toFixed(1) : '0.0'}%-ка кадәр киметте һәм компаниягә елына 1.44 млн сум экономия ясады!\n\nСезне кызыксындырган сорау буенча тулырак мәгълүмат алыр өчен тиз ярдәм төймәләренә басыгыз.`;
    }

    // 1. Приветствия и small-talk
    if (/^(привет|првиет|здравствуй|добрый|хай|ку|hello|hi|йоу|салют|хей|здорово|доброго)/.test(q)) {
      return '👋 **Здравствуйте!** Рад общению. Я готов разобрать результаты текущего прогона симуляции, объяснить формулу AutoFlow, рассчитать штат операторов или смоделировать бизнес-кейс вашей компании. Какой вопрос вас интересует?';
    }

    if (q.includes('как дела') || q.includes('как жизнь') || q.includes('как ты') || q.includes('че как') || q.includes('как настроение')) {
      return '⚡ **Отлично!** Движок симуляции функционирует на 100%, очереди обсчитываются без задержек. Готов помочь вам оптимизировать клиентский сервис и исключить срыв дедлайнов. О чем хотите узнать?';
    }

    // 2. Кто ты / Возможности
    if (q.includes('кто ты') || q.includes('что ты умеешь') || q.includes('помоги') || q.includes('помощь') || q.includes('зачем ты') || q.includes('функционал')) {
      return '🤖 Я — **AutoFlow AI Copilot**, встроенный аналитический ассистент исследовательской платформы. Мои задачи:\n\n' +
        '• **Моделирование очередей:** сравниваю классическое FIFO с адаптивным алгоритмом AutoFlow.\n' +
        '• **Анализ штата:** рассчитываю утилизацию операторов и предупреждаю о риске перегрузки.\n' +
        '• **Финансовый аудит:** помогаю оценить ROI, экономию на штрафах и предотвращенный отток клиентов.\n' +
        '• **Подбор весов:** рассчитываю оптимум Парето для ваших реальных бизнес-условий.';
    }

    // 3. Автор и разработчик
    if (q.includes('автор') || q.includes('создал') || q.includes('разработчик') || q.includes('раяз') || q.includes('нигматдинов') || q.includes('чья работа') || q.includes('кто написал')) {
      return '👨‍💻 Автор и разработчик исследовательской платформы — **Нигматдинов Раяз**.\n\n' +
        'Проект «AutoFlow Lab» посвящен решению фундаментальной проблемы слепоты классической живой очереди (FIFO) в клиентском сервисе и логистике с помощью динамической многокритериальной приоритизации.';
    }

    // 4. Формула, веса и расчет Score
    if (q.includes('формул') || q.includes('веса') || q.includes('score') || q.includes('w1') || q.includes('w2') || q.includes('w3') || q.includes('балл') || q.includes('как считает') || q.includes('математик') || q.includes('уравнен')) {
      return `📐 **Формула приоритета AutoFlow:**\n` +
        `\`Score = (w₁ · isVIP) + (w₂ · Urgency) + (w₃ · WaitFactor)\`\n\n` +
        `Текущие веса в панели управления:\n` +
        `• **w₁ = ${AppState.weights.w1}** (VIP-статус) — базовый гандикап для ключевых клиентов бизнеса.\n` +
        `• **w₂ = ${AppState.weights.w2}** (Срочность дедлайна) — экспоненциально растет по мере приближения к лимиту SLA. *Если дедлайн уже сорван, Urgency обнуляется (триаж), спасая заявки, которые еще можно успеть!*\n` +
        `• **w₃ = ${AppState.weights.w3}** (Защита от голодания) — возрастает пропорционально времени ожидания, гарантируя обслуживание обычных клиентов.`;
    }

    // 5. В чем фундаментальная ошибка FIFO
    if (q.includes('fifo') || q.includes('живая очередь') || q.includes('первый пришел') || q.includes('минус') || q.includes('слепот') || q.includes('ошибк fifo') || q.includes('почему fifo')) {
      return '⚠️ **Фундаментальная ошибка классического FIFO (First In, First Out):**\n\n' +
        '1. **Слепота к ценности:** FIFO считает обращение стратегического клиента с контрактом на 1 000 000 ₽ равным обращению со спамом или мелким вопросом.\n' +
        '2. **Нечувствительность к дедлайнам:** очередь не знает, что у одного клиента SLA истекает через 3 минуты, а у другого — через 50 минут.\n' +
        '3. **Эффект домино:** в моменты пиков операторы тратят часы на старые некритичные тикеты, пока VIP-клиенты массово срывают сроки и уходят к конкурентам.';
    }

    // 6. Трейд-офф: почему обычные клиенты ждут чуть дольше
    if (q.includes('дольше') || q.includes('обычн') || q.includes('tradeoff') || q.includes('почему ждут') || q.includes('несправедлив') || q.includes('дискриминац') || q.includes('равенств')) {
      const stdWaitFifo = m ? m.stdFifoAvgWait : 45;
      const stdWaitAf = m ? m.stdAfAvgWait : 48;
      const diff = Math.max(0, Math.round((stdWaitAf - stdWaitFifo) * 10) / 10);
      return `💡 **Честный трейд-офф в пользу бизнеса:**\n\n` +
        `У стандартных клиентов комфортный норматив SLA — **60 минут**. Даже если они ждут на ${diff} мин дольше (${stdWaitAf} мин вместо ${stdWaitFifo} мин), их дедлайн **не нарушается** (соблюдение SLA ~100%)!\n\n` +
        `А у VIP-клиентов норматив жесткий — **25 минут**. AutoFlow осознанно задействует безопасный временной буфер обычных клиентов, чтобы мгновенно спасать VIP. В итоге обе группы остаются довольны!`;
    }

    // 7. Защита от голодания (Starvation Protection)
    if (q.includes('голодани') || q.includes('starvation') || q.includes('вечн') || q.includes('застрял') || q.includes('забыл') || q.includes('бесконечн')) {
      return '🛡 **Защита от бесконечного ожидания (Starvation Protection):**\n\n' +
        'В примитивных системах с жестким VIP-приоритетом обычный клиент может «умереть» в очереди при непрерывном потоке VIP.\n\n' +
        'В AutoFlow компонент `w₃ · WaitFactor` непрерывно растет по формуле:\n' +
        '`WaitFactor = WaitTime / SLA`\n\n' +
        'Когда обычный клиент ожидает слишком долго, его накопленный балл неизбежно перевешивает VIP-бонус w₁, и свободный оператор обязательно забирает его!';
    }

    // 8. Перегрузка, аврал и умный триаж
    if (q.includes('перегрузк') || q.includes('пик') || q.includes('аврал') || q.includes('overload') || q.includes('наплыв') || q.includes('лавин') || q.includes('триаж') || q.includes('сгорел') || q.includes('коллапс')) {
      return '⚡ **Поведение AutoFlow при пиковых перегрузках (Smart Triage):**\n\n' +
        'Когда поток заявок превышает пропускную способность смены, AutoFlow включает медицинский принцип триажа:\n\n' +
        '• Если заявка уже **безвозвратно просрочила дедлайн**, её коэффициент срочности `Urgency` обнуляется.\n' +
        '• Операторы не тратят критические ресурсы на «уже сгоревший» тикет, а бросают силы на спасение тех обращений, которые еще можно успеть закрыть вовремя!\n' +
        '• Это предотвращает каскадный коллапс всей очереди.';
    }

    // 9. Анализ штата и загрузка операторов
    if (q.includes('хватает') || (q.includes('оператор') && (q.includes('штат') || q.includes('загрузк') || q.includes('сколько') || q.includes('нужно')))) {
      const util = m ? m.utilizationRate : 85;
      if (util > 90) {
        return `⚠️ **Анализ штата:** Сейчас назначено **${AppState.operatorsCount} оператор(а)**, загрузка критическая — **${util}%**!\n\n` +
          `Операторы работают на пределе возможностей, любое случайное колебание создаст очередь. **Рекомендация:** добавьте +1 оператора или используйте «⚡ AI Pareto Optimizer», чтобы сбалансировать веса.`;
      } else if (util < 65) {
        return `💡 **Анализ штата:** Сейчас назначено **${AppState.operatorsCount} оператор(а)**, загрузка всего **${util}%**.\n\n` +
          `У вас солидный запас пропускной способности. Можно либо перевести 1 сотрудника на другие задачи, либо ужесточить SLA для клиентов с 25 до 15 минут без риска просрочек.`;
      } else {
        return `✅ **Анализ штата:** Сейчас назначено **${AppState.operatorsCount} оператор(а)**, загрузка оптимальна — **${util}%**.\n\n` +
          `Смена работает в так называемом «золотом коридоре Эрланга» (75–88%). AutoFlow идеально стабилизирует поток без перегрузки людей.`;
      }
    }

    // 10. Нанять человека или включить алгоритм
    if (q.includes('нанять') || q.includes('зарплат') || q.includes('фот') || q.includes('человек') || q.includes('сотрудник') || q.includes('найм') || q.includes('выгоднее')) {
      return '💼 **Что выгоднее: нанять еще одного человека или включить AutoFlow?**\n\n' +
        '• **Найм оператора:** обходится компании в **90 000 – 130 000 ₽/мес** (оклад + налоги 43% + аренда/оборудование + больничные + онбординг).\n' +
        '• **Алгоритм AutoFlow:** ликвидирует просрочки VIP **бесплатно**, просто перестраивая порядок обслуживания в уже существующей очереди.\n\n' +
        '👉 **Вывод:** перед расширением штата обязательно включите умную маршрутизацию. В 85% случаев найм новых сотрудников оказывается не нужен!';
    }

    // 11. Финансовая выгода, ROI и окупаемость
    if (q.includes('деньг') || q.includes('выгод') || q.includes('roi') || q.includes('окупаем') || q.includes('рубл') || q.includes('прибыль') || q.includes('доход') || q.includes('экономи') || q.includes('финанс') || q.includes('штраф')) {
      return '💰 **Финансовый эффект внедрения AutoFlow:**\n\n' +
        '1. **Удержание VIP:** сохранение даже 2–3 ключевых клиентов с годовым LTV 500 000 ₽ дает **+1 500 000 ₽ чистой прибыли**.\n' +
        '2. **Экономия на штрафах:** сокращение штрафов по жестким SLA договорам на 40–80%.\n' +
        '3. **Оптимизация ФОТ:** экономия от 1 200 000 ₽ в год на найме лишних операторов поддержки.\n\n' +
        '👉 Перейдите на вкладку **«3. Бизнес-Калькулятор ROI»** в шапке дашборда для индивидуального финансового расчета под масштабы вашей компании!';
    }

    // 12. Интеграция в реальный бизнес (CRM, API, боты)
    if (q.includes('интеграц') || q.includes('crm') || q.includes('внедр') || q.includes('битрикс') || q.includes('bitrix') || q.includes('zendesk') || q.includes('telegram') || q.includes('телеграм') || q.includes('api') || q.includes('1c') || q.includes('1с') || q.includes('как подключить') || q.includes('код') || q.includes('бэкенд') || q.includes('python') || q.includes('webhook') || q.includes('redis')) {
      return '🔌 **Как внедрить AutoFlow в ваш реальный IT-ландшафт:**\n\n' +
        '1. **Прием обращений:** Webhook из Битрикс24, Zendesk, amoCRM или Telegram-бота отправляет тикет на бэкенд.\n' +
        '2. **Хранение очереди:** тикеты складываются в `Redis Sorted Set` командой `ZADD queue score ticket_id`.\n' +
        '3. **Фоновый микросервис (Python FastAPI / Node.js):** каждые 15–30 секунд пересчитывает `Score` по формуле AutoFlow с учетом текущего времени.\n' +
        '4. **Выдача оператору:** при освобождении сотрудника вызывается `ZPOPMAX queue` — выдается тикет с наивысшим баллом.';
    }

    // 13. Реальные отраслевые кейсы (OZON, Т-Банк, Яндекс)
    if (q.includes('ozon') || q.includes('озон') || q.includes('т-банк') || q.includes('тинькофф') || q.includes('t-bank') || q.includes('tbank') || q.includes('яндекс') || q.includes('доставк') || q.includes('пресет') || q.includes('шаблон') || q.includes('кейсы')) {
      return '🏢 **Готовые отраслевые сценарии (быстрые кнопки под заголовком):**\n\n' +
        '• **OZON (150 заказов):** 15% VIP-подписок OZON Premium, 3 оператора, пиковые нагрузки распродажи.\n' +
        '• **Т-Банк (100 заявок):** 35% Private Banking клиентов, жесткий SLA 15 минут, веса w₁=70.\n' +
        '• **Яндекс Доставка (140 заказов):** экспресс-доставка курьерами, акцент на дедлайн доставки w₂=35.\n\n' +
        'Нажмите на соответствующую плашку в блоке «Готовые датасеты компаний», чтобы мгновенно протестировать кейс!';
    }

    // 14. Парето-Оптимизатор
    if (q.includes('парето') || q.includes('pareto') || q.includes('оптимиз') || q.includes('подобрать веса') || q.includes('лучшие веса') || q.includes('автоматическая настройка')) {
      return '⚡ **AI Pareto Optimizer (кнопка в левой панели):**\n\n' +
        'Запускает многокритериальный алгоритмический поиск в пространстве параметров (w₁, w₂, w₃). Симулятор тестирует десятки комбинаций и находит границу эффективности Парето: минимум просрочек VIP при сохранении стабильности всей очереди.\n\n' +
        'Просто нажмите **«⚡ AI Pareto Optimizer»** в левой панели, и идеальные веса выставятся автоматически!';
    }

    // 15. Официальный аудит и PDF-отчет
    if (q.includes('аудит') || q.includes('отчет') || q.includes('печать') || q.includes('pdf') || q.includes('акт') || q.includes('руководств') || q.includes('генеральн') || q.includes('директор') || q.includes('документ') || q.includes('распечатать')) {
      return '📄 **Официальный Аудит для Руководства:**\n\n' +
        'В правом верхнем углу дашборда нажмите кнопку **«📄 Аудит для руководства»**.\n\n' +
        'Откроется официальный экспертный акт с печатями, сравнительными KPI, финансовым эффектом и методикой исследования. Его можно прямо из браузера распечатать или сохранить в **PDF (Ctrl+P)** для презентации совету директоров!';
    }

    // 16. Загрузка своих данных (CSV Backlog Importer)
    if (q.includes('свой csv') || q.includes('загрузить') || q.includes('импорт') || q.includes('custom') || q.includes('свои данные') || q.includes('формат csv') || q.includes('бэклог')) {
      return '📥 **Как загрузить реальные данные вашей компании:**\n\n' +
        'Нажмите на серую кнопку **«📥 Свой CSV»** в строке датасетов. Выберите CSV-файл со структурой колонок:\n' +
        '`id, arrival, duration, is_vip, sla`\n\n' +
        'Разделитель — запятая или точка с запятой. Движок моментально подхватит ваши реальные исторические тикеты и рассчитает экономию!';
    }

    // 17. Интерактивная гонка очередей (Queue Race)
    if (q.includes('гонк') || q.includes('арен') || q.includes('визуализац') || q.includes('race') || q.includes('конвейер') || q.includes('анимация') || q.includes('вкладка 2') || q.includes('в реальном времени')) {
      return '🏁 **Интерактивная Гонка Очередей Live:**\n\n' +
        'Перейдите на вкладку **«2. Гонка Очередей Live»** над графиками. Там визуализированы параллельные конвейеры FIFO и AutoFlow: вы увидите движение каждого тикета, занятость операторов и спасение горящих дедлайнов в реальном времени!';
    }

    // 18. Случайность и воспроизводимость (Seed Mulberry32)
    if (q.includes('seed') || q.includes('сид') || q.includes('случайн') || q.includes('рандом') || q.includes('генератор') || q.includes('честн') || q.includes('mulberry')) {
      return '🎲 **Научная воспроизводимость (Mulberry32 PRNG):**\n\n' +
        'В основе симуляции лежит детерминированный генератор псевдослучайных чисел Mulberry32. Кнопка **«Сгенерировать новый поток (Seed)»** меняет начальное зерно.\n\n' +
        'Оба алгоритма (FIFO и AutoFlow) получают **абсолютно идентичный массив заявок** с точностью до секунды прихода, что исключает любые манипуляции данными.';
    }

    // 19. Нормативы SLA
    if (q.includes('sla') || q.includes('слa') || q.includes('сроки') || q.includes('норматив') || q.includes('дедлайн') || q.includes('время обслуживания')) {
      return '⏱ **Нормативы SLA в исследовательской модели:**\n\n' +
        '• **VIP-клиенты:** лимит ожидания ≤ **25 минут**.\n' +
        '• **Стандартные клиенты:** лимит ожидания ≤ **60 минут**.\n' +
        '• **Длительность обработки:** от 5 до 20 минут (нормальное распределение с мат. ожиданием 12 мин).\n' +
        '• **Длительность смены:** 8 часов (480 минут). Все принятые заявки дорабатываются операторами до конца смены.';
    }

    // 20. Технологический стек
    if (q.includes('стек') || q.includes('технологи') || q.includes('на чем написан') || q.includes('архитектур') || q.includes('html') || q.includes('css') || q.includes('библиотек')) {
      return '💻 **Технологический стек платформы AutoFlow Lab:**\n\n' +
        '• **Ядро симулятора:** Pure Vanilla JavaScript (ES6+ Discrete Event Engine).\n' +
        '• **Стилизация:** Glassmorphism UI, Tailwind CSS (JIT CDN), кастомный Deep Space CSS.\n' +
        '• **Графика и анимации:** Chart.js с неоновыми градиентами, Canvas Confetti, Web Animations API.\n' +
        '• **Звук:** Web Audio API sound synthesizer (без внешних mp3).\n' +
        '• **Иконки:** Lucide Icons.';
    }

    // 21. Звуковые эффекты
    if (q.includes('звук') || q.includes('саунд') || q.includes('клик') || q.includes('аудио')) {
      return '🔊 **Звуковая подсистема платформы:**\n\n' +
        'Интерфейс оснащен аудио-откликом для подтверждения симуляций и кликов. В правом верхнем углу шапки есть кнопка-переключатель звука (иконка динамика). Вы можете отключить звук в любой момент!';
    }

    // 22. Обучение и онбординг
    if (q.includes('обучен') || q.includes('туториал') || q.includes('тур') || q.includes('гид') || q.includes('подсказк') || q.includes('инструкци') || q.includes('как пользоваться')) {
      return '🎓 **Интерактивный Тур по платформе:**\n\n' +
        'Чтобы пройти пошаговое обучение с подсказками по каждому элементу интерфейса, нажмите кнопку **«❓ Обучение»** в шапке сайта. Тур наглядно покажет, как настраивать поток, запускать симуляцию и читать результаты!';
    }

    // 23. Точность расчетов и теория очередей
    if (q.includes('точност') || q.includes('насколько точно') || q.includes('эрланг') || q.includes('достоверн') || q.includes('теория очередей')) {
      return '🔬 **Математическая достоверность:**\n\n' +
        'Симулятор реализует строгую дискретно-событийную модель (DES), аналогичную используемым в системах Erlang C, AnyLogic и SimPy. Расчет учитывает точные моменты освобождения операторов и не использует приблизительных усреднений.';
    }

    // 24. Экспорт в CSV
    if (q.includes('скачать csv') || q.includes('экспорт') || q.includes('сохранить') || q.includes('выгруз')) {
      return '💾 **Экспорт результатов симуляции:**\n\n' +
        'В левой панели управления нажмите кнопку **«📥 Экспорт в CSV»**. Браузер мгновенно скачает подробную таблицу со всеми заявками текущей смены, временами ожидания в FIFO и AutoFlow, а также статусами соблюдения дедлайнов.';
    }

    // 25. Благодарности и похвала
    if (q.includes('спасибо') || q.includes('благодар') || q.includes('круто') || q.includes('молодец') || q.includes('топ') || q.includes('супер') || q.includes('красиво') || q.includes('кайф') || q.includes('огонь') || q.includes('отлично') || q.includes('умница')) {
      return '😊 **Большое спасибо за высокую оценку!** Очень приятно. Платформа создана для максимальной пользы бизнесу и наглядной демонстрации силы правильных алгоритмов. Если возникнут еще вопросы — я всегда здесь!';
    }

    // 26. Динамическая аналитическая сводка
    if (m) {
      const speedup = (m.vipFifoAvgWait / Math.max(0.1, m.vipAfAvgWait)).toFixed(1);
      return `📊 **Аналитическая сводка по текущей смене:**\n\n` +
        `• **Срыв дедлайнов VIP:** снижен с **${m.vipFifoBreachPct}%** (FIFO) до **${m.vipAfBreachPct}%** (AutoFlow).\n` +
        `• **Среднее ожидание VIP:** **${m.vipAfAvgWait} мин** вместо ${m.vipFifoAvgWait} мин (ускорение в **${speedup}x**!).\n` +
        `• **Общий срыв SLA:** ${m.afBreachedSlaPct}% против ${m.fifoBreachedSlaPct}% в FIFO.\n` +
        `• **Загрузка смены:** **${m.utilizationRate}%** при штате ${AppState.operatorsCount} оператор(а).\n\n` +
        `💡 Задайте мне любой вопрос о формуле, штате операторов, интеграции в CRM или нажмите на быстрые подсказки внизу!`;
    }

    return '🤖 Я на связи! Сформулируйте ваш вопрос о формуле приоритета, штате операторов, финансовых результатах, интеграции в CRM или поведении очереди AutoFlow.';
  }
};

// ==========================================
// 10. REALTIME QUEUE RACE ENGINE
// ==========================================
const RaceEngine = {
  start() {
    if (AppState.race.isPlaying) {
      this.pause();
      return;
    }

    if (!AppState.currentSimulation) {
      runSimulation();
    }

    const isTt = AppState.lang === 'tt';
    AppState.race.isPlaying = true;
    const playBtn = document.getElementById('racePlayBtn');
    const playText = document.getElementById('racePlayText');
    if (playText) playText.textContent = isTt ? 'Туктатып торырга' : 'Приостановить';
    if (playBtn) playBtn.className = 'px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition';

    SoundSystem.playClick();
    this.initArena();

    const interval = Math.max(30, Math.floor(100 / AppState.race.speed));
    AppState.race.timer = setInterval(() => {
      this.step();
    }, interval);
  },

  pause() {
    const isTt = AppState.lang === 'tt';
    AppState.race.isPlaying = false;
    clearInterval(AppState.race.timer);
    const playBtn = document.getElementById('racePlayBtn');
    const playText = document.getElementById('racePlayText');
    if (playText) playText.textContent = isTt ? 'Ярышны дәвам итәргә' : 'Продолжить гонку';
    if (playBtn) playBtn.className = 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition';
  },

  reset() {
    const isTt = AppState.lang === 'tt';
    this.pause();
    AppState.race.currentMinute = 0;
    const playText = document.getElementById('racePlayText');
    if (playText) playText.textContent = isTt ? 'Ярышны башларга' : 'Запустить гонку';

    document.getElementById('raceTimeDisplay').textContent = isTt ? '09:00 (0 мин)' : '09:00 (0 мин)';
    document.getElementById('raceProgressBar').style.width = '0%';
    document.getElementById('fifoRaceBreaches').textContent = isTt ? 'Бозылулар: 0' : 'Срывов: 0';
    document.getElementById('afRaceSaved').textContent = isTt ? 'Коткарылды: 0' : 'Спасены: 0';
    document.getElementById('fifoRaceProcessed').textContent = isTt ? 'Эшкәртелде: 0' : 'Обработано: 0';
    document.getElementById('afRaceProcessed').textContent = isTt ? 'Эшкәртелде: 0' : 'Обработано: 0';
    document.getElementById('fifoQueueCount').textContent = `0 ${isTt ? 'чиратта' : 'в очереди'}`;
    document.getElementById('afQueueCount').textContent = `0 ${isTt ? 'чиратта' : 'в очереди'}`;

    this.initArena();
  },

  onLangChange() {
    const isTt = AppState.lang === 'tt';
    const playText = document.getElementById('racePlayText');
    if (playText) {
      if (AppState.race.isPlaying) {
        playText.textContent = isTt ? 'Туктатып торырга' : 'Приостановить';
      } else if (AppState.race.currentMinute > 0) {
        playText.textContent = isTt ? 'Ярышны дәвам итәргә' : 'Продолжить гонку';
      } else {
        playText.textContent = isTt ? 'Ярышны башларга' : 'Запустить гонку';
      }
    }
    const emptyFifo = document.querySelector('#fifoQueueLane > span');
    if (emptyFifo) emptyFifo.textContent = isTt ? '«Ярышны башларга» басыгыз' : 'Нажмите «Запустить гонку»';
    const emptyAf = document.querySelector('#afQueueLane > span');
    if (emptyAf) emptyAf.textContent = isTt ? '«Ярышны башларга» басыгыз' : 'Нажмите «Запустить гонку»';

    for (let i = 0; i < AppState.operatorsCount; i++) {
      const fifoOp = document.getElementById(`fifoOp_${i}`);
      const afOp = document.getElementById(`afOp_${i}`);
      const opTitle = isTt ? `${i + 1} нче оператор` : `Оператор #${i + 1}`;
      if (fifoOp) {
        const titleElem = fifoOp.querySelector('.op-title');
        if (titleElem) titleElem.textContent = opTitle;
      }
      if (afOp) {
        const titleElem = afOp.querySelector('.op-title');
        if (titleElem) titleElem.textContent = opTitle;
      }
    }
  },

  initArena() {
    const isTt = AppState.lang === 'tt';
    const opsCount = AppState.operatorsCount;
    const fifoOpsContainer = document.getElementById('fifoOperatorsContainer');
    const afOpsContainer = document.getElementById('afOperatorsContainer');

    fifoOpsContainer.innerHTML = '';
    afOpsContainer.innerHTML = '';

    for (let i = 0; i < opsCount; i++) {
      const opTitle = isTt ? `${i + 1} нче оператор` : `Оператор #${i + 1}`;
      const statusText = isTt ? 'Буш' : 'Свободен';
      fifoOpsContainer.innerHTML += `
        <div class="operator-booth p-2.5 text-center" id="fifoOp_${i}">
          <div class="text-[10px] font-mono text-slate-400 op-title">${opTitle}</div>
          <div class="text-xs font-semibold text-slate-300 status-label mt-0.5">${statusText}</div>
        </div>
      `;

      afOpsContainer.innerHTML += `
        <div class="operator-booth p-2.5 text-center" id="afOp_${i}">
          <div class="text-[10px] font-mono text-slate-400 op-title">${opTitle}</div>
          <div class="text-xs font-semibold text-slate-300 status-label mt-0.5">${statusText}</div>
        </div>
      `;
    }
  },

  step() {
    AppState.race.currentMinute += 1.5;
    const curMin = AppState.race.currentMinute;
    const isTt = AppState.lang === 'tt';

    if (curMin >= 480) {
      this.pause();
      document.getElementById('raceProgressBar').style.width = '100%';
      document.getElementById('raceTimeDisplay').textContent = isTt ? '17:00 (Смена тәмам)' : '17:00 (Смена завершена)';
      SoundSystem.playSuccess();
      return;
    }

    const h = Math.floor(9 + curMin / 60);
    const m = Math.floor(curMin % 60);
    document.getElementById('raceTimeDisplay').textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} (${Math.round(curMin)} ${isTt ? 'мин' : 'мин'})`;
    document.getElementById('raceProgressBar').style.width = `${(curMin / 480) * 100}%`;

    const allTickets = AppState.currentSimulation ? AppState.currentSimulation.tickets : [];
    const arrivedTickets = allTickets.filter(t => t.arrivalTime <= curMin);

    // FIFO
    const fifoCompleted = arrivedTickets.filter(t => t.fifoFinishTime <= curMin);
    const fifoInService = arrivedTickets.filter(t => t.fifoStartTime <= curMin && t.fifoFinishTime > curMin);
    const fifoWaiting = arrivedTickets.filter(t => t.fifoStartTime > curMin);

    document.getElementById('fifoRaceProcessed').textContent = `${isTt ? 'Эшкәртелде:' : 'Обработано:'} ${fifoCompleted.length}`;
    document.getElementById('fifoRaceBreaches').textContent = `${isTt ? 'Бозылулар:' : 'Срывов:'} ${fifoCompleted.filter(t => t.fifoBreached).length}`;
    document.getElementById('fifoQueueCount').textContent = `${fifoWaiting.length} ${isTt ? 'чиратта' : 'в очереди'}`;

    const fifoLane = document.getElementById('fifoQueueLane');
    if (fifoWaiting.length === 0) {
      fifoLane.innerHTML = `<span class="text-xs text-slate-500 font-mono mx-auto">${isTt ? 'Чират буш' : 'Очередь пуста'}</span>`;
    } else {
      fifoLane.innerHTML = fifoWaiting.slice(0, 8).map(t => {
        const waitSoFar = Math.round(curMin - t.arrivalTime);
        const isUrgent = waitSoFar > (t.sla * 0.7);
        const unit = isTt ? 'мин' : 'м';
        return `
          <div class="shrink-0 p-2 rounded-xl text-center font-mono text-[10px] ${t.isVIP ? 'badge-vip' : 'badge-standard'} ${isUrgent ? 'border-rose-500 text-rose-300' : ''}">
            <div class="font-bold">${t.isVIP ? '👑 VIP' : (isTt ? 'Гади' : 'Обычн')} #${t.id}</div>
            <div class="text-[9px] mt-0.5">${waitSoFar}${unit} / ${t.sla}${unit}</div>
          </div>
        `;
      }).join('');
    }

    // AutoFlow
    const afCompleted = arrivedTickets.filter(t => t.afFinishTime <= curMin);
    const afWaiting = arrivedTickets.filter(t => t.afStartTime > curMin);
    const afSaved = afCompleted.filter(t => t.statusTag === 'saved').length;

    document.getElementById('afRaceProcessed').textContent = `${isTt ? 'Эшкәртелде:' : 'Обработано:'} ${afCompleted.length}`;
    document.getElementById('afRaceSaved').textContent = `${isTt ? 'Коткарылды:' : 'Спасены:'} ${afSaved}`;
    document.getElementById('afQueueCount').textContent = `${afWaiting.length} ${isTt ? 'чиратта' : 'в очереди'}`;

    const afLane = document.getElementById('afQueueLane');
    if (afWaiting.length === 0) {
      afLane.innerHTML = `<span class="text-xs text-slate-500 font-mono mx-auto">${isTt ? 'Чират буш' : 'Очередь пуста'}</span>`;
    } else {
      const sortedAf = [...afWaiting].sort((a, b) => {
        const scoreA = (a.isVIP ? AppState.weights.w1 : 0) + AppState.weights.w2 * Math.min(1, (curMin - a.arrivalTime) / a.sla);
        const scoreB = (b.isVIP ? AppState.weights.w1 : 0) + AppState.weights.w2 * Math.min(1, (curMin - b.arrivalTime) / b.sla);
        return scoreB - scoreA;
      });

      afLane.innerHTML = sortedAf.slice(0, 8).map(t => {
        const waitSoFar = Math.round(curMin - t.arrivalTime);
        const unit = isTt ? 'мин' : 'м';
        return `
          <div class="shrink-0 p-2 rounded-xl text-center font-mono text-[10px] ${t.isVIP ? 'badge-vip' : 'badge-standard'} border-indigo-500/40">
            <div class="font-bold">${t.isVIP ? '👑 VIP' : (isTt ? 'Гади' : 'Обычн')} #${t.id}</div>
            <div class="text-[9px] mt-0.5 text-emerald-400 font-semibold">${waitSoFar}${unit} / ${t.sla}${unit}</div>
          </div>
        `;
      }).join('');
    }

    for (let i = 0; i < AppState.operatorsCount; i++) {
      const fifoOpElem = document.getElementById(`fifoOp_${i}`);
      const afOpElem = document.getElementById(`afOp_${i}`);

      if (fifoOpElem) {
        const isBusy = fifoInService.length > i;
        fifoOpElem.className = isBusy ? 'operator-booth busy p-2.5 text-center' : 'operator-booth p-2.5 text-center';
        fifoOpElem.querySelector('.status-label').textContent = isBusy ? (isTt ? 'Эштә ⏳' : 'В работе ⏳') : (isTt ? 'Буш' : 'Свободен');
        fifoOpElem.querySelector('.status-label').className = isBusy ? 'text-xs font-semibold text-rose-400 status-label mt-0.5' : 'text-xs font-semibold text-slate-300 status-label mt-0.5';
      }

      if (afOpElem) {
        const isBusy = arrivedTickets.filter(t => t.afStartTime <= curMin && t.afFinishTime > curMin).length > i;
        afOpElem.className = isBusy ? 'operator-booth busy p-2.5 text-center' : 'operator-booth p-2.5 text-center';
        afOpElem.querySelector('.status-label').textContent = isBusy ? (isTt ? 'Эштә ⚡' : 'В работе ⚡') : (isTt ? 'Буш' : 'Свободен');
        afOpElem.querySelector('.status-label').className = isBusy ? 'text-xs font-semibold text-emerald-400 status-label mt-0.5' : 'text-xs font-semibold text-slate-300 status-label mt-0.5';
      }
    }
  }
};

// ==========================================
// 11. BUSINESS ROI CALCULATOR ENGINE
// ==========================================
function recalcRoi() {
  const volume = parseInt(document.getElementById('roiMonthlyVolume')?.value || 8000);
  const vipLtv = parseInt(document.getElementById('roiVipLtv')?.value || 45000);
  const penalty = parseInt(document.getElementById('roiPenalty')?.value || 1500);
  const salary = parseInt(document.getElementById('roiSalary')?.value || 65000);

  const volumeVal = document.getElementById('roiMonthlyVolumeVal');
  const ltvVal = document.getElementById('roiVipLtvVal');
  const penaltyVal = document.getElementById('roiPenaltyVal');
  const salaryVal = document.getElementById('roiSalaryVal');

  const isTt = AppState.lang === 'tt';

  if (volumeVal) volumeVal.textContent = `${volume.toLocaleString('ru-RU')} ${isTt ? 'данә' : 'шт'}`;
  if (ltvVal) ltvVal.textContent = `${vipLtv.toLocaleString('ru-RU')} ₽`;
  if (penaltyVal) penaltyVal.textContent = `${penalty.toLocaleString('ru-RU')} ₽`;
  if (salaryVal) salaryVal.textContent = `${salary.toLocaleString('ru-RU')} ₽`;

  const sim = AppState.currentSimulation;
  const vipShare = (AppState.vipShare / 100);
  const vipMonthly = volume * vipShare;

  const vipFifoBreachPct = sim ? (sim.metrics.vipFifoBreachPct / 100) : 0.65;
  const vipAfBreachPct = sim ? (sim.metrics.vipAfBreachPct / 100) : 0.02;
  const vipBreachDrop = Math.max(0, vipFifoBreachPct - vipAfBreachPct);

  const savedVipsCount = Math.round(vipMonthly * vipBreachDrop * 0.12);
  const savedVipRevenue = savedVipsCount * vipLtv;

  const totalBreachDrop = sim ? Math.max(0, (sim.metrics.totalFifoBreachPct - sim.metrics.totalAfBreachPct) / 100) : 0.35;
  const penaltiesSaved = Math.round(volume * totalBreachDrop * penalty);

  const staffSavings = salary * 2;

  const totalMonthlySavings = savedVipRevenue + penaltiesSaved + staffSavings;
  const totalYearlySavings = totalMonthlySavings * 12;

  const revElem = document.getElementById('roiVipRevenueSaved');
  const penElem = document.getElementById('roiPenaltiesSaved');
  const staffElem = document.getElementById('roiStaffSavings');
  const monthTotalElem = document.getElementById('roiTotalSavingsMonth');
  const yearTotalElem = document.getElementById('roiTotalSavingsYear');
  const paybackElem = document.getElementById('roiPaybackDays');

  if (revElem) revElem.textContent = `${savedVipRevenue.toLocaleString('ru-RU')} ₽`;
  if (penElem) penElem.textContent = `${penaltiesSaved.toLocaleString('ru-RU')} ₽`;
  if (staffElem) staffElem.textContent = `${staffSavings.toLocaleString('ru-RU')} ₽`;
  if (monthTotalElem) monthTotalElem.textContent = `${totalMonthlySavings.toLocaleString('ru-RU')} ₽`;
  if (yearTotalElem) yearTotalElem.textContent = `${totalYearlySavings.toLocaleString('ru-RU')} ₽`;

  const paybackDays = Math.max(4, Math.round((350000 / (totalMonthlySavings / 30))));
  if (paybackElem) paybackElem.textContent = isTt ? `Аклану вакыты: ${paybackDays} көн` : `Окупаемость: ${paybackDays} дней`;
}

// ==========================================
// 12. FIXED SPOTLIGHT ONBOARDING TOUR
// ==========================================
const TourManager = {
  currentStep: 0,
  currentHighlightedElem: null,

  steps: {
    ru: [
      {
        elementId: 'tourStepControlCenter',
        title: '1. Панель управления потоком',
        description: 'Здесь вы задаете число заявок за смену, долю VIP-клиентов и штат операторов. Все изменения моментально пересчитываются дискретным движком.'
      },
      {
        elementId: 'tourStepWeights',
        title: '2. Весовые коэффициенты AutoFlow',
        description: 'Сердце умной формулы: w₁ отвечает за ценность VIP, w₂ за приближение дедлайна, а w₃ предотвращает голодание очереди для обычных клиентов.'
      },
      {
        elementId: 'tourStepKpi',
        title: '3. Дашборд результатов (KPI)',
        description: 'Наглядное сравнение До и После: падение срывов VIP-сроков с 70%+ до нуля, сокращение ожидания в разы и коэффициент загрузки операторов.'
      },
      {
        elementId: 'tourStepCharts',
        title: '4. Интерактивные графики',
        description: 'Столбчатая диаграмма сравнивает ключевые метрики, а линейный график показывает, как AutoFlow гасит пиковые наплывы в обеденные часы.'
      },
      {
        elementId: 'tourStepAi',
        title: '5. Встроенный ИИ-Аналитик',
        description: 'AutoFlow Copilot делает автоматический разбор текущей смены, объясняет компромиссы и дает ценные советы по оптимизации штата.'
      }
    ],
    tt: [
      {
        elementId: 'tourStepControlCenter',
        title: '1. Агым белән идарә итү панеле',
        description: 'Монда сез сменадагы гаризалар санын, VIP-клиентлар өлешен һәм операторлар штатын билгелисез. Барлык үзгәрешләр дискрет система белән мизгел эчендә исәпләнә.'
      },
      {
        elementId: 'tourStepWeights',
        title: '2. AutoFlow авырлык коэффициентлары',
        description: 'Акыллы формуланың үзәге: w₁ VIP кыйммәтен билгели, w₂ дедлайн якынлашуын исәпкә ала, ә w₃ гади клиентларның чиратта озак көтүен булдырмый.'
      },
      {
        elementId: 'tourStepKpi',
        title: '3. Нәтиҗәләр дашборды (KPI)',
        description: 'Элек һәм Хәзерне ачык чагыштыру: VIP соңга калуларның 70%+ тан нульгә кадәр кимүе, көтү вакытының берничә тапкыр кыскаруы һәм операторларның нәтиҗәле йөкләнеше.'
      },
      {
        elementId: 'tourStepCharts',
        title: '4. Интерактив графиклар',
        description: 'Баганалы диаграмма төп күрсәткечләрне чагыштыра, ә сызыклы график төшке вакыттагы пик йөкләнешне AutoFlow ничек йомшартуын күрсәтә.'
      },
      {
        elementId: 'tourStepAi',
        title: '5. Эчкә корылган ЯИ-Аналитик',
        description: 'AutoFlow Copilot агымдагы сменага автоматик анализ ясый, компромиссларны аңлата һәм штатны оптимальләштерү буенча кыйммәтле киңәшләр бирә.'
      }
    ]
  },

  getCurrentSteps() {
    const lang = AppState.lang || 'ru';
    return this.steps[lang] || this.steps.ru;
  },

  onLangChange() {
    const overlay = document.getElementById('tourOverlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      this.renderStep();
    }
  },

  start() {
    this.currentStep = 0;
    const overlay = document.getElementById('tourOverlay');
    if (overlay) overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    SoundSystem.playClick();
    this.renderStep();
  },

  next() {
    const steps = this.getCurrentSteps();
    if (this.currentStep < steps.length - 1) {
      this.currentStep++;
      SoundSystem.playClick();
      this.renderStep();
    } else {
      this.stop();
    }
  },

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      SoundSystem.playClick();
      this.renderStep();
    }
  },

  stop() {
    if (this.currentHighlightedElem) {
      this.currentHighlightedElem.classList.remove('tour-highlight-active');
      this.currentHighlightedElem = null;
    }
    const overlay = document.getElementById('tourOverlay');
    if (overlay) overlay.classList.add('hidden');
    document.body.style.overflow = '';
    SoundSystem.playClick();
  },

  renderStep() {
    if (this.currentHighlightedElem) {
      this.currentHighlightedElem.classList.remove('tour-highlight-active');
    }

    const steps = this.getCurrentSteps();
    const step = steps[this.currentStep];
    const targetElem = document.getElementById(step.elementId);
    const card = document.getElementById('tourCard');
    const title = document.getElementById('tourTitle');
    const desc = document.getElementById('tourDescription');
    const badge = document.getElementById('tourStepBadge');
    const prevBtn = document.getElementById('tourPrevBtn');
    const nextBtn = document.getElementById('tourNextBtn');
    const skipBtn = document.getElementById('tourSkipBtn');
    const progBar = document.getElementById('tourProgressBar');

    const isTt = AppState.lang === 'tt';

    if (badge) badge.textContent = isTt ? `${this.currentStep + 1} нче адым / ${steps.length}` : `Шаг ${this.currentStep + 1} из ${steps.length}`;
    if (title) title.textContent = step.title;
    if (desc) desc.textContent = step.description;
    if (progBar) progBar.style.width = `${((this.currentStep + 1) / steps.length) * 100}%`;
    if (prevBtn) {
      prevBtn.disabled = this.currentStep === 0;
      prevBtn.textContent = isTt ? '← Артка' : '← Назад';
    }
    if (skipBtn) {
      skipBtn.textContent = isTt ? 'Турны калдыру' : 'Пропустить тур';
    }
    if (nextBtn) {
      const isLast = this.currentStep === steps.length - 1;
      nextBtn.textContent = isTt ? (isLast ? 'Турны тәмамлау' : 'Алга →') : (isLast ? 'Завершить тур' : 'Далее →');
    }

    if (targetElem) {
      this.currentHighlightedElem = targetElem;
      targetElem.classList.add('tour-highlight-active');
      targetElem.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (card) {
        const updateCardPos = () => {
          const rect = targetElem.getBoundingClientRect();
          const cardWidth = Math.min(420, window.innerWidth - 32);
          const cardHeight = card.offsetHeight || 250;

          const spaceRight = window.innerWidth - rect.right;
          const spaceLeft = rect.left;
          const spaceBottom = window.innerHeight - rect.bottom;
          const spaceTop = rect.top;

          let top = (window.innerHeight - cardHeight) / 2;
          let left = (window.innerWidth - cardWidth) / 2;

          // Step 5 (Copilot) or large elements:
          if (step.elementId === 'tourStepAi') {
            if (spaceLeft > cardWidth + 30) {
              left = rect.left - cardWidth - 25;
              top = rect.top + 20;
            } else if (spaceRight > cardWidth + 30) {
              left = rect.right + 25;
              top = rect.top + 20;
            } else {
              left = (window.innerWidth - cardWidth) / 2;
              top = (window.innerHeight - cardHeight) / 2;
            }
          } else if (spaceRight > cardWidth + 35) {
            // Place to the right of element
            left = rect.right + 25;
            top = rect.top;
          } else if (spaceLeft > cardWidth + 35) {
            // Place to the left of element
            left = rect.left - cardWidth - 25;
            top = rect.top;
          } else if (spaceBottom > cardHeight + 40) {
            // Below element
            left = (window.innerWidth - cardWidth) / 2;
            top = rect.bottom + 20;
          } else if (spaceTop > cardHeight + 40) {
            // Above element
            left = (window.innerWidth - cardWidth) / 2;
            top = rect.top - cardHeight - 20;
          }

          // HARD VIEWPORT CLAMPING: Card is 100% guaranteed to be fully on-screen
          const minTop = 85; // Below sticky header
          const maxTop = Math.max(minTop, window.innerHeight - cardHeight - 20);
          const minLeft = 16;
          const maxLeft = Math.max(minLeft, window.innerWidth - cardWidth - 16);

          top = Math.max(minTop, Math.min(maxTop, top));
          left = Math.max(minLeft, Math.min(maxLeft, left));

          card.style.top = `${Math.round(top)}px`;
          card.style.left = `${Math.round(left)}px`;
        };

        // Recalculate immediately and continuously as smooth scrolling progresses
        updateCardPos();
        setTimeout(updateCardPos, 80);
        setTimeout(updateCardPos, 220);
        setTimeout(updateCardPos, 450);
      }
    }
  }
};

// ==========================================
// 13. TAB SWITCHING SYSTEM
// ==========================================
function switchTab(tabName) {
  AppState.activeTab = tabName;
  SoundSystem.playTab();

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.add('hidden');
  });

  const activePane = document.getElementById(`tab-${tabName}`);
  if (activePane) activePane.classList.remove('hidden');

  if (tabName === 'race') {
    RaceEngine.reset();
  } else if (tabName === 'roi') {
    recalcRoi();
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// 14. CSV EXPORT FUNCTIONALITY
// ==========================================
function exportSimulationCsv() {
  if (!AppState.currentSimulation) return;
  const tickets = AppState.currentSimulation.tickets;
  SoundSystem.playClick();

  let csvContent = '\uFEFF';
  csvContent += 'ID;Тип клиента;SLA (мин);Время прихода;Длительность (мин);Ожидание FIFO (мин);Срыв FIFO;Ожидание AutoFlow (мин);Срыв AutoFlow;Разница (мин);Итоговый статус\n';

  tickets.forEach(t => {
    const row = [
      t.id,
      t.isVIP ? 'VIP' : 'Стандарт',
      t.sla,
      formatMinutesToTime(t.arrivalTime),
      t.duration,
      t.fifoWaitTime,
      t.fifoBreached ? 'ДА' : 'НЕТ',
      t.afWaitTime,
      t.afBreached ? 'ДА' : 'НЕТ',
      t.waitDelta,
      t.statusTag === 'saved' ? 'Спасён AutoFlow' : (t.afBreached ? 'Просрочен' : 'В срок')
    ];
    csvContent += row.join(';') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autoflow_simulation_seed_${AppState.currentSeed}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// 15. EVENT LISTENERS & LIVE REACT INITIALIZATION
// ==========================================
function triggerBadgePop(element) {
  if (!element) return;
  element.classList.remove('badge-pop');
  void element.offsetWidth; // reflow
  element.classList.add('badge-pop');
}

function initEventListeners() {
  // Bilingual Language Switcher (RU | TAT)
  document.getElementById('langRuBtn')?.addEventListener('click', () => setLanguage('ru'));
  document.getElementById('langTatBtn')?.addEventListener('click', () => setLanguage('tt'));

  // QR Code Modal Handlers
  const qrModal = document.getElementById('qrModal');
  function openQrModal() {
    SoundSystem.playClick();
    qrModal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeQrModal() {
    SoundSystem.playClick();
    qrModal?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.getElementById('openQrBtn')?.addEventListener('click', openQrModal);
  document.getElementById('closeQrModalBtn')?.addEventListener('click', closeQrModal);
  document.getElementById('closeQrModalFooterBtn')?.addEventListener('click', closeQrModal);
  qrModal?.addEventListener('click', (e) => {
    if (e.target === qrModal) closeQrModal();
  });

  document.getElementById('copyQrUrlBtn')?.addEventListener('click', () => {
    const url = 'https://rapihappy.github.io/AutoFlow-Lab/';
    const copySuccess = () => {
      SoundSystem.playSuccess();
      const toast = document.getElementById('copyToastText');
      if (toast) {
        toast.textContent = AppState.lang === 'tt' ? '✓ Күчермәләнде!' : '✓ Скопировано!';
        toast.classList.remove('opacity-0');
        setTimeout(() => toast.classList.add('opacity-0'), 2000);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(copySuccess).catch(() => {
        const inp = document.getElementById('qrUrlInput');
        if (inp) {
          inp.select();
          document.execCommand('copy');
          copySuccess();
        }
      });
    } else {
      const inp = document.getElementById('qrUrlInput');
      if (inp) {
        inp.select();
        document.execCommand('copy');
        copySuccess();
      }
    }
  });

  // Tabs Navigation
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Sound Toggle Button
  const toggleSoundBtn = document.getElementById('toggleSoundBtn');
  const soundSvgOn = document.getElementById('soundSvgOn');
  const soundSvgOff = document.getElementById('soundSvgOff');

  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener('click', () => {
      SoundSystem.enabled = !SoundSystem.enabled;
      if (SoundSystem.enabled) {
        soundSvgOn?.classList.remove('hidden');
        soundSvgOff?.classList.add('hidden');
        SoundSystem.playClick();
      } else {
        soundSvgOn?.classList.add('hidden');
        soundSvgOff?.classList.remove('hidden');
      }
    });
  }

  // Tour Buttons
  document.getElementById('startTourBtn')?.addEventListener('click', () => TourManager.start());
  document.getElementById('tourNextBtn')?.addEventListener('click', () => TourManager.next());
  document.getElementById('tourPrevBtn')?.addEventListener('click', () => TourManager.prev());
  document.getElementById('tourSkipBtn')?.addEventListener('click', () => TourManager.stop());
  document.getElementById('tourBackdrop')?.addEventListener('click', () => TourManager.stop());

  // ============================================================
  // LIVE REACTIVE CONTROL CENTER SLIDERS (INSTANT CALCULATION + POP ANIMATIONS)
  // ============================================================
  const ticketsSlider = document.getElementById('ticketsCountSlider');
  const ticketsVal = document.getElementById('ticketsCountValue');
  ticketsSlider?.addEventListener('input', (e) => {
    AppState.ticketsCount = parseInt(e.target.value);
    if (ticketsVal) {
      ticketsVal.textContent = `${AppState.ticketsCount} шт`;
      triggerBadgePop(ticketsVal);
    }
    updateSliderTrackFill(ticketsSlider, '#6366f1');
    SoundSystem.playClick();
    triggerLiveRecalculation();
  });

  const vipSlider = document.getElementById('vipShareSlider');
  const vipVal = document.getElementById('vipShareValue');
  vipSlider?.addEventListener('input', (e) => {
    AppState.vipShare = parseInt(e.target.value);
    if (vipVal) {
      vipVal.textContent = `${AppState.vipShare}%`;
      triggerBadgePop(vipVal);
    }
    updateSliderTrackFill(vipSlider, '#f59e0b');
    SoundSystem.playClick();
    triggerLiveRecalculation();
  });

  const opSlider = document.getElementById('operatorsCountSlider');
  const opVal = document.getElementById('operatorsCountValue');
  opSlider?.addEventListener('input', (e) => {
    AppState.operatorsCount = parseInt(e.target.value);
    if (opVal) {
      opVal.textContent = `${AppState.operatorsCount} чел`;
      triggerBadgePop(opVal);
    }
    updateSliderTrackFill(opSlider, '#10b981');
    SoundSystem.playClick();
    triggerLiveRecalculation();
  });

  // Weights Sliders (Live Recalculation)
  const w1Slider = document.getElementById('weightVipSlider');
  const w1Val = document.getElementById('weightVipVal');
  w1Slider?.addEventListener('input', (e) => {
    AppState.weights.w1 = parseInt(e.target.value);
    if (w1Val) {
      w1Val.textContent = AppState.weights.w1;
      triggerBadgePop(w1Val);
    }
    updateSliderTrackFill(w1Slider, '#f59e0b');
    SoundSystem.playClick();
    triggerLiveRecalculation();
  });

  const w2Slider = document.getElementById('weightUrgencySlider');
  const w2Val = document.getElementById('weightUrgencyVal');
  w2Slider?.addEventListener('input', (e) => {
    AppState.weights.w2 = parseInt(e.target.value);
    if (w2Val) {
      w2Val.textContent = AppState.weights.w2;
      triggerBadgePop(w2Val);
    }
    updateSliderTrackFill(w2Slider, '#6366f1');
    SoundSystem.playClick();
    triggerLiveRecalculation();
  });

  const w3Slider = document.getElementById('weightWaitSlider');
  const w3Val = document.getElementById('weightWaitVal');
  w3Slider?.addEventListener('input', (e) => {
    AppState.weights.w3 = parseInt(e.target.value);
    if (w3Val) {
      w3Val.textContent = AppState.weights.w3;
      triggerBadgePop(w3Val);
    }
    updateSliderTrackFill(w3Slider, '#10b981');
    SoundSystem.playClick();
    triggerLiveRecalculation();
  });

  // Reset Weights Button
  document.getElementById('resetWeightsBtn')?.addEventListener('click', () => {
    AppState.weights = { w1: 50, w2: 30, w3: 20 };
    if (w1Slider) { w1Slider.value = 50; w1Val.textContent = 50; }
    if (w2Slider) { w2Slider.value = 30; w2Val.textContent = 30; }
    if (w3Slider) { w3Slider.value = 20; w3Val.textContent = 20; }
    updateAllSliderFills();
    SoundSystem.playClick();
    runSimulation();
  });

  // Run Simulation Button
  document.getElementById('runSimulationBtn')?.addEventListener('click', () => {
    SoundSystem.playClick();
    runSimulation();
  });

  // New Seed Button
  document.getElementById('newSeedBtn')?.addEventListener('click', () => {
    AppState.currentSeed = Math.floor(Math.random() * 90000) + 10000;
    const seedDisp = document.getElementById('seedDisplay');
    if (seedDisp) seedDisp.textContent = `Seed: #${AppState.currentSeed}`;
    SoundSystem.playClick();
    runSimulation();
  });

  // Export CSV Button
  document.getElementById('exportCsvBtn')?.addEventListener('click', exportSimulationCsv);

  // Table Filter Select
  document.getElementById('tableFilter')?.addEventListener('change', (e) => {
    AppState.activeFilter = e.target.value;
    if (AppState.currentSimulation) {
      renderTable(AppState.currentSimulation.tickets);
    }
  });

  // Preset Buttons
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundSystem.playClick();
      const preset = btn.dataset.preset;
      if (preset === 'standard') {
        setPresetValues(100, 20, 2, 50, 30, 20);
      } else if (preset === 'rush') {
        setPresetValues(180, 30, 3, 50, 35, 15);
      } else if (preset === 'stress') {
        setPresetValues(120, 25, 1, 60, 25, 15);
      }
      updateAllSliderFills();
      runSimulation();
    });
  });

  // Industry Blueprints Apply Buttons
  document.querySelectorAll('.apply-blueprint-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundSystem.playClick();
      const p = btn.dataset.presetName;
      if (p === 'fintech') {
        setPresetValues(140, 35, 3, 65, 25, 10);
      } else if (p === 'retail') {
        setPresetValues(190, 15, 3, 50, 35, 15);
      } else if (p === 'saas') {
        setPresetValues(120, 25, 2, 55, 30, 15);
      } else if (p === 'med') {
        setPresetValues(110, 20, 2, 70, 20, 10);
      }
      updateAllSliderFills();
      switchTab('simulation');
      runSimulation();
    });
  });

  // AI Copilot Ask Button & Enter Key
  const copilotInput = document.getElementById('copilotInput');
  const copilotAskBtn = document.getElementById('copilotAskBtn');

  function handleSendChat() {
    if (!copilotInput) return;
    const text = copilotInput.value;
    if (!text.trim()) return;
    AiChatSystem.processQuery(text);
    copilotInput.value = '';
  }

  copilotAskBtn?.addEventListener('click', handleSendChat);
  copilotInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendChat();
  });

  // AI Copilot Quick Chips
  document.querySelectorAll('.ai-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.querySelector('span')?.textContent || '';
      AiChatSystem.processQuery(q);
    });
  });

  // Clear Chat Button
  document.getElementById('clearChatBtn')?.addEventListener('click', () => {
    SoundSystem.playClick();
    AiChatSystem.init();
  });

  // Race Controls
  document.getElementById('racePlayBtn')?.addEventListener('click', () => RaceEngine.start());
  document.getElementById('raceResetBtn')?.addEventListener('click', () => RaceEngine.reset());
  document.querySelectorAll('.race-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      SoundSystem.playClick();
      document.querySelectorAll('.race-speed-btn').forEach(b => b.classList.remove('active', 'bg-indigo-600', 'text-white'));
      btn.classList.add('active', 'bg-indigo-600', 'text-white');
      AppState.race.speed = parseInt(btn.dataset.speed || 1);
      if (AppState.race.isPlaying) {
        RaceEngine.pause();
        RaceEngine.start();
      }
    });
  });

  // ROI Sliders (with track fills)
  ['roiMonthlyVolume', 'roiVipLtv', 'roiPenalty', 'roiSalary'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      updateAllSliderFills();
      SoundSystem.playClick();
      recalcRoi();
    });
  });

  // Unlock Web Audio API on first user interaction
  const unlockAudio = () => {
    SoundSystem.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  // Copy Executive ROI Pitch Button
  document.getElementById('copyRoiPitchBtn')?.addEventListener('click', () => {
    SoundSystem.playClick();
    const isTt = AppState.lang === 'tt';
    const text = isTt
      ? `ҖИТӘКЧЕЛЕК ӨЧЕН НИГЕЗЛӘМӘ: AutoFlow Lab кертү\n\n` +
        `● Прогнозланган саф файда: ${document.getElementById('roiTotalSavingsMonth')?.textContent}/аена (${document.getElementById('roiTotalSavingsYear')?.textContent}/елына)\n` +
        `● VIP дедлайннары бозылуын киметү: 70%+ тан 0% кадәр\n` +
        `● Төп клиентларга хезмәт күрсәтүне тизләтү: 5.4-8.0 тапкырга\n` +
        `● Кертүнең аклану вакыты: ~${document.getElementById('roiPaybackDays')?.textContent}\n\n` +
        `Фәнни-тикшеренү проекты: Нигъмәтдинов Раяз`
      : `ОБОСНОВАНИЕ ДЛЯ РУКОВОДСТВА: Внедрение AutoFlow Lab\n\n` +
        `● Прогнозируемая чистая выгода: ${document.getElementById('roiTotalSavingsMonth')?.textContent}/месяц (${document.getElementById('roiTotalSavingsYear')?.textContent}/год)\n` +
        `● Снижение срывов VIP-дедлайнов: с 70%+ до 0%\n` +
        `● Ускорение обслуживания ключевых клиентов: в 5.4-8.0 раз\n` +
        `● Окупаемость внедрения: ~${document.getElementById('roiPaybackDays')?.textContent}\n\n` +
        `Исследовательский проект: Нигматдинов Раяз`;

    navigator.clipboard?.writeText(text).then(() => {
      const btnText = document.getElementById('copyRoiPitchText');
      if (btnText) {
        btnText.textContent = isTt ? 'Күчермәләнде! ✅' : 'Скопировано! ✅';
        setTimeout(() => { btnText.textContent = isTt ? 'Резюмены күчермәләү' : 'Скопировать резюме'; }, 2000);
      }
    });
  });

  // Copy SDK Code Button
  document.getElementById('copySdkCodeBtn')?.addEventListener('click', () => {
    SoundSystem.playClick();
    const code = `def calculate_autoflow_score(ticket, current_time, w1=50, w2=30, w3=20):
    elapsed_wait = current_time - ticket['created_at']
    sla_limit = ticket['sla_minutes']
    
    vip_score = w1 * (1.0 if ticket.get('is_vip') else 0.0)
    
    if elapsed_wait > sla_limit:
        urgency_score = 0.0
    else:
        urgency_score = w2 * (elapsed_wait / sla_limit)
        
    wait_factor = w3 * min(1.5, elapsed_wait / sla_limit)
    return vip_score + urgency_score + wait_factor`;

    navigator.clipboard?.writeText(code).then(() => {
      const btnText = document.getElementById('copySdkText');
      if (btnText) {
        btnText.textContent = 'Скопировано! ✅';
        setTimeout(() => { btnText.textContent = 'Копировать код'; }, 2000);
      }
    });
  });

  // AI Pareto Weight Optimizer
  document.getElementById('aiOptimizeWeightsBtn')?.addEventListener('click', optimizeWeights);

  // Real Company Dataset Presets
  document.querySelectorAll('.dataset-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadDatasetPreset(btn.dataset.dataset);
    });
  });

  // Custom CSV Upload
  document.getElementById('customCsvInput')?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      parseCsvFile(e.target.files[0]);
    }
  });

  // Executive Audit Modal Listeners
  document.getElementById('openAuditModalBtn')?.addEventListener('click', openAuditModal);
  document.getElementById('closeAuditModalBtn')?.addEventListener('click', closeAuditModal);
  document.getElementById('printAuditReportBtn')?.addEventListener('click', () => {
    window.print();
  });

  // Modal Listeners
  const modal = document.getElementById('aboutModal');
  const openModalBtn = document.getElementById('openAboutBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalFooterBtn = document.getElementById('closeModalFooterBtn');
  const backdrop = document.getElementById('modalBackdrop');

  function openModal() {
    SoundSystem.playClick();
    modal?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    SoundSystem.playClick();
    modal?.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openModalBtn?.addEventListener('click', openModal);
  closeModalBtn?.addEventListener('click', closeModal);
  closeModalFooterBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal && !modal.classList.contains('hidden')) closeModal();
      closeQrModal();
      closeAuditModal();
      TourManager.stop();
    }
  });
}

// ==========================================
// 10. AI PARETO WEIGHT OPTIMIZER
// ==========================================
function optimizeWeights() {
  SoundSystem.playClick();
  const testW1 = [50, 60, 70, 80];
  const testW2 = [15, 25, 35];
  const testW3 = [10, 15, 20];

  let bestWeights = { w1: 65, w2: 25, w3: 10 };
  let bestScore = Infinity;

  // Grid search Pareto evaluation across permutations
  for (const w1 of testW1) {
    for (const w2 of testW2) {
      for (const w3 of testW3) {
        const testEngine = new SimulationEngine(
          AppState.currentSeed,
          AppState.ticketsCount,
          AppState.vipShare,
          AppState.operatorsCount,
          { w1, w2, w3 },
          AppState.customTickets
        );
        const res = testEngine.simulate();
        // Pareto penalty: heavily penalize VIP breach, penalize total breach, penalize wait time
        const score = (res.metrics.vipAfBreachPct * 12) + (res.metrics.totalAfBreachPct * 1.5) + (res.metrics.vipAfAvgWait * 0.4);
        if (score < bestScore) {
          bestScore = score;
          bestWeights = { w1, w2, w3 };
        }
      }
    }
  }

  AppState.weights = bestWeights;
  setPresetValues(AppState.ticketsCount, AppState.vipShare, AppState.operatorsCount, bestWeights.w1, bestWeights.w2, bestWeights.w3);
  updateAllSliderFills();
  runSimulation();
  SoundSystem.playSuccess();

  AiChatSystem.addAiMessage(`🎯 <b>AI Pareto Optimizer:</b> Рассчитаны идеальные весовые коэффициенты для текущего потока: <b>w₁=${bestWeights.w1}</b> (VIP-статус), <b>w₂=${bestWeights.w2}</b> (Срочность дедлайна), <b>w₃=${bestWeights.w3}</b> (Защита от голодания). Срыв дедлайнов VIP сведён к математическому минимуму!`);
}

// ==========================================
// 11. REAL COMPANY DATASETS & PRESETS
// ==========================================
function loadDatasetPreset(type) {
  SoundSystem.playClick();
  AppState.customTickets = null;
  const activeLabel = document.getElementById('activeDatasetLabel');

  if (type === 'ozon') {
    // OZON: 150 orders, 15% VIP, rush peaks, 3 operators
    AppState.ticketsCount = 150;
    AppState.vipShare = 15;
    AppState.operatorsCount = 3;
    AppState.weights = { w1: 60, w2: 30, w3: 10 };
    if (activeLabel) activeLabel.textContent = '📦 OZON (150 шт)';
    AiChatSystem.addAiMessage(`📦 <b>Кейс OZON:</b> Загружен реальный сценарий пика распродажи на 150 заказов (15% OZON Premium, SLA 25м). Автоматически откалиброваны 3 оператора и веса w₁=60, w₂=30, w₃=10.`);
  } else if (type === 'tbank') {
    // Т-Банк: 100 tickets, 35% VIP, strict SLA 15m
    AppState.ticketsCount = 100;
    AppState.vipShare = 35;
    AppState.operatorsCount = 2;
    AppState.weights = { w1: 70, w2: 25, w3: 5 };
    if (activeLabel) activeLabel.textContent = '💳 Т-Банк (100 шт)';
    AiChatSystem.addAiMessage(`💳 <b>Кейс Т-Банк Премиум:</b> Загружен сценарий VIP-поддержки частных клиентов (35% VIP, критический SLA). Приоритет VIP увеличен до w₁=70 для 100% спасения клиентов.`);
  } else if (type === 'delivery') {
    // Яндекс Доставка: 140 orders, fast courier dispatch
    AppState.ticketsCount = 140;
    AppState.vipShare = 20;
    AppState.operatorsCount = 3;
    AppState.weights = { w1: 50, w2: 35, w3: 15 };
    if (activeLabel) activeLabel.textContent = '🚗 Доставка (140 шт)';
    AiChatSystem.addAiMessage(`🚗 <b>Кейс Яндекс Доставка:</b> Загружен сценарий экспресс-логистики (140 заказов). Вес горящих дедлайнов повышен до w₂=35 для предотвращения опозданий курьеров.`);
  }

  setPresetValues(AppState.ticketsCount, AppState.vipShare, AppState.operatorsCount, AppState.weights.w1, AppState.weights.w2, AppState.weights.w3);
  updateAllSliderFills();
  runSimulation();
  SoundSystem.playSuccess();
}

// ==========================================
// 12. CUSTOM CSV BACKLOG IMPORTER
// ==========================================
function parseCsvFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) throw new Error('Файл пуст или содержит только заголовки');

      const headers = lines[0].toLowerCase().split(/[,;\t]/).map(h => h.trim().replace(/["']/g, ''));
      
      const idIdx = headers.findIndex(h => h.includes('id') || h.includes('номер'));
      const timeIdx = headers.findIndex(h => h.includes('time') || h.includes('время') || h.includes('приход') || h.includes('arrival'));
      const durIdx = headers.findIndex(h => h.includes('dur') || h.includes('длит') || h.includes('length') || h.includes('service'));
      const vipIdx = headers.findIndex(h => h.includes('vip') || h.includes('премиум') || h.includes('priority') || h.includes('приоритет'));
      const slaIdx = headers.findIndex(h => h.includes('sla') || h.includes('лимит') || h.includes('deadline'));

      const parsedTickets = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/[,;\t]/).map(p => p.trim().replace(/["']/g, ''));
        if (parts.length < 2) continue;

        const id = idIdx >= 0 ? parts[idIdx] : (1000 + i);
        const arrival = timeIdx >= 0 ? Math.max(0, Math.min(480, parseFloat(parts[timeIdx]) || (i * 3.5))) : (i * 3.2);
        const duration = durIdx >= 0 ? Math.max(2, Math.min(30, parseFloat(parts[durIdx]) || 9)) : 8;
        const isVIP = vipIdx >= 0 ? (parts[vipIdx].toLowerCase() === '1' || parts[vipIdx].toLowerCase().includes('vip') || parts[vipIdx].toLowerCase().includes('true') || parts[vipIdx].toLowerCase().includes('да')) : (i % 5 === 0);
        const sla = slaIdx >= 0 ? (parseFloat(parts[slaIdx]) || (isVIP ? 25 : 60)) : (isVIP ? 25 : 60);

        parsedTickets.push({
          id,
          arrivalTime: Math.round(arrival * 10) / 10,
          duration: Math.round(duration * 10) / 10,
          isVIP,
          sla
        });
      }

      if (parsedTickets.length === 0) throw new Error('Не удалось извлечь заявки из файла');

      // Sort by arrival
      parsedTickets.sort((a, b) => a.arrivalTime - b.arrivalTime);

      AppState.customTickets = parsedTickets;
      AppState.ticketsCount = parsedTickets.length;
      const vipCount = parsedTickets.filter(t => t.isVIP).length;
      AppState.vipShare = Math.round((vipCount / parsedTickets.length) * 100);

      const activeLabel = document.getElementById('activeDatasetLabel');
      if (activeLabel) activeLabel.textContent = `CSV: ${file.name.substring(0, 10)} (${parsedTickets.length} шт)`;
      
      setPresetValues(AppState.ticketsCount, AppState.vipShare, AppState.operatorsCount, AppState.weights.w1, AppState.weights.w2, AppState.weights.w3);
      updateAllSliderFills();
      runSimulation();
      SoundSystem.playSuccess();

      AiChatSystem.addAiMessage(`📁 <b>Успешно загружен пользовательский датасет:</b> «${file.name}» (${parsedTickets.length} заявок, VIP: ${AppState.vipShare}%). Симуляция мгновенно пересчитана по вашим реальным обращениям!`);
    } catch (err) {
      alert('Ошибка при чтении CSV: ' + err.message + '\nУбедитесь, что файл содержит колонки (например: id, arrival, duration, is_vip, sla).');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 13. EXECUTIVE AUDIT REPORT CONTROLLER
// ==========================================
function openAuditModal() {
  SoundSystem.playClick();
  const modal = document.getElementById('auditReportModal');
  if (!modal) return;

  const sim = AppState.currentSimulation;
  if (!sim) return;
  const m = sim.metrics;
  const isTt = AppState.lang === 'tt';

  const docTickets = document.getElementById('auditDocTickets');
  if (docTickets) docTickets.textContent = `${sim.tickets.length} ${isTt ? 'гариза' : 'заявок'}`;
  
  const docVipShare = document.getElementById('auditDocVipShare');
  if (docVipShare) docVipShare.textContent = `${AppState.vipShare}% (SLA ≤ 25${isTt ? 'мин' : 'м'})`;

  const docStaff = document.getElementById('auditDocStaff');
  if (docStaff) docStaff.textContent = `${AppState.operatorsCount} ${isTt ? 'кеше сменада' : 'чел на смене'}`;

  const docWeights = document.getElementById('auditDocWeights');
  if (docWeights) docWeights.textContent = `${AppState.weights.w1} / ${AppState.weights.w2} / ${AppState.weights.w3}`;

  const docVipFifo = document.getElementById('auditDocVipFifo');
  if (docVipFifo) docVipFifo.textContent = `${m.vipFifoBreachPct.toFixed(1)}%`;

  const docVipAf = document.getElementById('auditDocVipAf');
  if (docVipAf) docVipAf.textContent = `${m.vipAfBreachPct.toFixed(1)}%`;

  const vipDrop = Math.max(0, m.vipFifoBreachPct - m.vipAfBreachPct);
  const docVipDelta = document.getElementById('auditDocVipDelta');
  if (docVipDelta) docVipDelta.textContent = isTt ? `${vipDrop.toFixed(1)}%-ка кимү ⚡` : `Снижение на ${vipDrop.toFixed(1)}% ⚡`;

  const docWaitFifo = document.getElementById('auditDocWaitFifo');
  if (docWaitFifo) docWaitFifo.textContent = `${m.vipFifoAvgWait.toFixed(1)} мин`;

  const docWaitAf = document.getElementById('auditDocWaitAf');
  if (docWaitAf) docWaitAf.textContent = `${m.vipAfAvgWait.toFixed(1)} мин`;

  const speedup = m.vipAfAvgWait > 0.05 ? (m.vipFifoAvgWait / m.vipAfAvgWait).toFixed(1) : '20+';
  const docWaitSpeedup = document.getElementById('auditDocWaitSpeedup');
  if (docWaitSpeedup) docWaitSpeedup.textContent = isTt ? `${speedup}x тапкыр тизләнү` : `Ускорение в ${speedup}x раз`;

  const docTotalFifo = document.getElementById('auditDocTotalFifo');
  if (docTotalFifo) docTotalFifo.textContent = `${m.totalFifoBreachPct.toFixed(1)}%`;

  const docTotalAf = document.getElementById('auditDocTotalAf');
  if (docTotalAf) docTotalAf.textContent = `${m.totalAfBreachPct.toFixed(1)}%`;

  const totalDrop = Math.round((m.totalFifoBreachPct - m.totalAfBreachPct) * 10) / 10;
  const docTotalDelta = document.getElementById('auditDocTotalDelta');
  if (docTotalDelta) docTotalDelta.textContent = isTt ? `${totalDrop.toFixed(1)}%-ка кимү` : `Снижение на ${totalDrop.toFixed(1)}%`;

  const docUtilFifo = document.getElementById('auditDocUtilFifo');
  if (docUtilFifo) docUtilFifo.textContent = `${m.utilizationRate.toFixed(1)}%`;

  const docUtilAf = document.getElementById('auditDocUtilAf');
  if (docUtilAf) docUtilAf.textContent = `${m.utilizationRate.toFixed(1)}% (Баланс)`;

  const sec2 = document.getElementById('auditDocSec2Text');
  if (sec2) {
    sec2.innerHTML = isTt
      ? `AutoFlow алгоритмын кертү премиаль клиентлар белән контрактларның өзелүен бетерә, LTV югалтуларын кисәтә. Хезмәт хакы фондын экономияләү (өстәмә оператор яллау кирәк түгеллеге хисабына) <strong>~120 000 ₽ / ай (елына 1.44 млн ₽)</strong> тәшкил итә. Гомуми саф еллык файда: <strong class="text-emerald-300" id="auditDocTotalBenefit">елына 2.1 млн ₽-тан башлап</strong>. Алгоритмның аклану вакыты: <strong class="text-emerald-300" id="auditDocPayback">~14 көн</strong>.`
      : `Внедрение алгоритма AutoFlow устраняет срыв контрактов с премиальными клиентами, предотвращая потери LTV. Экономия фонда оплаты труда (за счёт отсутствия необходимости нанимать дополнительного оператора) составляет <strong>~120 000 ₽ / месяц (1.44 млн ₽ / год)</strong>. Совокупная чистая годовая выгода: <strong class="text-emerald-300" id="auditDocTotalBenefit">от 2.1 млн ₽ в год</strong>. Срок окупаемости внедрения алгоритма: <strong class="text-emerald-300" id="auditDocPayback">~14 дней</strong>.`;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAuditModal() {
  const modal = document.getElementById('auditReportModal');
  if (modal && !modal.classList.contains('hidden')) {
    SoundSystem.playClick();
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function setPresetValues(tickets, vip, ops, w1, w2, w3) {
  AppState.ticketsCount = tickets;
  AppState.vipShare = vip;
  AppState.operatorsCount = ops;
  AppState.weights = { w1, w2, w3 };

  const tSlider = document.getElementById('ticketsCountSlider');
  const tVal = document.getElementById('ticketsCountValue');
  if (tSlider) tSlider.value = tickets;
  if (tVal) tVal.textContent = `${tickets} шт`;

  const vSlider = document.getElementById('vipShareSlider');
  const vVal = document.getElementById('vipShareValue');
  if (vSlider) vSlider.value = vip;
  if (vVal) vVal.textContent = `${vip}%`;

  const opSlider = document.getElementById('operatorsCountSlider');
  const opVal = document.getElementById('operatorsCountValue');
  if (opSlider) opSlider.value = ops;
  if (opVal) opVal.textContent = `${ops} чел`;

  const w1S = document.getElementById('weightVipSlider');
  const w1V = document.getElementById('weightVipVal');
  if (w1S) w1S.value = w1;
  if (w1V) w1V.textContent = w1;

  const w2S = document.getElementById('weightUrgencySlider');
  const w2V = document.getElementById('weightUrgencyVal');
  if (w2S) w2S.value = w2;
  if (w2V) w2V.textContent = w2;

  const w3S = document.getElementById('weightWaitSlider');
  const w3V = document.getElementById('weightWaitVal');
  if (w3S) w3S.value = w3;
  if (w3V) w3V.textContent = w3;
}

function runSimulation(isLive = false) {
  const engine = new SimulationEngine(
    AppState.currentSeed,
    AppState.ticketsCount,
    AppState.vipShare,
    AppState.operatorsCount,
    AppState.weights,
    AppState.customTickets
  );

  AppState.currentSimulation = engine.simulate();
  updateDashboardUI(AppState.currentSimulation, isLive);
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  startPreloader();
  initBackgroundParticles();
  initEventListeners();
  updateAllSliderFills();
  setLanguage(AppState.lang);
  AiChatSystem.init();
  runSimulation();
});
