// Estado da aplicação
const appState = {
    contractStartDate: null,
    contractEndDate: null,
    totalDays: 0,
    hasSpeedPeaks: null,
    speedPeaksData: [],
    bonus: 0,
    peakCountInput: 0
};

// Elemento principal da aplicação
const appElement = document.getElementById("app");

// --- Funções de Renderização ---

function clearApp() {
    appElement.innerHTML = "";
}

function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.id) element.id = options.id;
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.type) element.type = options.type;
    if (options.step) element.step = options.step;
    if (options.min) element.min = options.min;
    if (options.placeholder) element.placeholder = options.placeholder;
    if (options.htmlFor) element.htmlFor = options.htmlFor;
    if (options.innerHTML) element.innerHTML = options.innerHTML;
    return element;
}

function createDialog(title, content, onClose) {
    clearApp();

    const dialog = createElement("div");
    const titleBar = createElement("div", { className: "title-bar" });
    const titleBarText = createElement("div", { className: "title-bar-text", textContent: title });
    const titleBarControls = createElement("div", { className: "title-bar-controls" });
    const closeButton = createElement("button", { textContent: "X" });

    // Adiciona funcionalidade ao botão de fechar
    if (onClose) {
        closeButton.addEventListener("click", onClose);
    } else {
        closeButton.addEventListener("click", renderStartScreen); // Volta para o início por padrão
    }

    titleBarControls.appendChild(closeButton);
    titleBar.appendChild(titleBarText);
    titleBar.appendChild(titleBarControls);

    const windowContent = createElement("div", { className: "window-content" });
    windowContent.appendChild(content);

    dialog.appendChild(titleBar);
    dialog.appendChild(windowContent);
    appElement.appendChild(dialog);
}

function renderStartScreen() {
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h1", { textContent: "Calculadora de Bonificação G2L" }));
    container.appendChild(createElement("p", { textContent: "Ação Zero Picos" }));
    container.appendChild(createElement("p", { textContent: "Em caso de dúvidas, procure informação no Loop ou peça ajuda ao coleguinha do lado. Caso mesmo assim não se sinta seguro em continuar, peça ajuda à gestão." }));
    container.appendChild(createElement("p", { textContent: "Informe as  e horários do contrato:" }));

    const formContainer = createElement("div", { className: "form-group" });

    const startLabel = createElement("label", { htmlFor: "startDateTime", textContent: "Data e hora de início:" });
    const startInput = createElement("input", { type: "datetime-local", id: "startDateTime", step: "60" });
    formContainer.appendChild(startLabel);
    formContainer.appendChild(startInput);

    const endLabel = createElement("label", { htmlFor: "endDateTime", textContent: "Data e hora de fim:" });
    const endInput = createElement("input", { type: "datetime-local", id: "endDateTime", step: "60" });
    formContainer.appendChild(endLabel);
    formContainer.appendChild(endInput);

    container.appendChild(formContainer);

    const confirmButton = createElement("button", { textContent: "Confirmar" });
    confirmButton.addEventListener("click", handleDateInput);
    container.appendChild(confirmButton);

    createDialog("Calculadora de Bonificação", container, renderStartScreen); // Ao fechar, volta para esta tela
}

function renderError(message) {
    const errorContainer = createElement("div", { id: "error", className: "error-box text-center" });

    errorContainer.appendChild(createElement("h2", { textContent: "Erro de Sistema" }));
    errorContainer.appendChild(createElement("p", { textContent: message }));

    const backButton = createElement("button", { textContent: "Voltar" });
    backButton.addEventListener("click", renderStartScreen);
    errorContainer.appendChild(backButton);

    createDialog("ERRO", errorContainer, renderStartScreen);
}

function renderDaysDialog() {
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Verificar Dados" }));
    container.appendChild(createElement("h3", { textContent: `INÍCIO: ${formatDateTime(appState.contractStartDate)}` }));
    container.appendChild(createElement("h3", { textContent: `FIM: ${formatDateTime(appState.contractEndDate)}` }));
    const totalDaysP = createElement("p");
    totalDaysP.innerHTML = `TOTAL DE DIAS: <strong>${Math.ceil(appState.totalDays)}</strong>`;
    container.appendChild(totalDaysP);

    const confirmButton = createElement("button", { textContent: "Confirmar" });
    confirmButton.addEventListener("click", renderSpeedPeaksScreen);
    container.appendChild(confirmButton);

    const cancelButton = createElement("button", { textContent: "Cancelar" });
    cancelButton.addEventListener("click", renderStartScreen);
    container.appendChild(cancelButton);

    createDialog("Verificação", container, renderStartScreen);
}

function renderSpeedPeaksScreen() {
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Houveram picos de velocidade?" }));

    const yesButton = createElement("button", { textContent: "Sim" });
    yesButton.addEventListener("click", () => handleSpeedPeaks(true));
    container.appendChild(yesButton);

    const noButton = createElement("button", { textContent: "Não" });
    noButton.addEventListener("click", () => handleSpeedPeaks(false));
    container.appendChild(noButton);

    createDialog("Picos de Velocidade", container, renderDaysDialog); // Voltar para a tela de verificação
}

function renderSpeedPeaksInputScreen() {
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Informe a quantidade de picos:" }));

    const inputContainer = createElement("div", { className: "form-group" });
    const peakInput = createElement("input", { type: "number", id: "peakCount", min: "1", placeholder: "Digite a quantidade" });
    inputContainer.appendChild(peakInput);
    container.appendChild(inputContainer);

    const confirmButton = createElement("button", { textContent: "Confirmar" });
    confirmButton.addEventListener("click", handlePeakCount);
    container.appendChild(confirmButton);

    createDialog("Quantidade de Picos", container, renderSpeedPeaksScreen); // Voltar para a tela anterior
}

function renderPeakDatesScreen(peakCount) {
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Informe as  dos picos:" }));

    const inputContainer = createElement("div", { className: "form-group" });
    appState.speedPeaksData = Array(peakCount).fill(null);

    for (let i = 0; i < peakCount; i++) {
        const label = createElement("label", { htmlFor: `peakDate${i}`, textContent: `PICO ${i + 1}:` });
        const input = createElement("input", { type: "date", id: `peakDate${i}` });
        inputContainer.appendChild(label);
        inputContainer.appendChild(input);
    }
    container.appendChild(inputContainer);

    const confirmButton = createElement("button", { textContent: "Confirmar " });
    confirmButton.addEventListener("click", () => handlePeakDatesInput(peakCount));
    container.appendChild(confirmButton);

    createDialog(" dos Picos", container, renderSpeedPeaksInputScreen); // Voltar para a tela de quantidade de picos
}

function renderPeakDatesConfirmationScreen(peakDates) {
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Confirme as datas dos picos:" }));

    const confirmationBox = createElement("div", { className: "confirmation-box" });
    peakDates.forEach((date, index) => {
        confirmationBox.appendChild(createElement("p", { textContent: `PICO ${index + 1}: ${formatDate(date)}` }));
    });
    container.appendChild(confirmationBox);

    const confirmButton = createElement("button", { textContent: "Confirmar e Calcular" });
    confirmButton.addEventListener("click", () => calculateBonusWithPeaks(peakDates));
    container.appendChild(confirmButton);

    const backButton = createElement("button", { textContent: "Voltar" });
    backButton.addEventListener("click", () => renderPeakDatesScreen(appState.peakCountInput));
    container.appendChild(backButton);

    createDialog("Confirmação", container, () => renderPeakDatesScreen(appState.peakCountInput)); // Botão "Voltar" na barra de título
}

function renderFinalScreen() {
    const container = createElement("div", { className: "container text-center" });

    const resultH1 = createElement("h1");
    resultH1.innerHTML = "<strong>BONIFICAÇÃO A SER PAGA:</strong>";
    container.appendChild(resultH1);

    const bonusH1 = createElement("h1");
    bonusH1.innerHTML = `<strong>R$${Math.ceil(appState.bonus)}</strong>`;
    container.appendChild(bonusH1);

    const restartButton = createElement("button", { textContent: "Reiniciar" });
    restartButton.addEventListener("click", renderStartScreen);
    container.appendChild(restartButton);

    createDialog("Resultado", container, renderStartScreen);
}

// --- Funções de Lógica e Manipulação de Dados ---

function handleDateInput() {
    const startDateInput = document.getElementById("startDateTime").value;
    const endDateInput = document.getElementById("endDateTime").value;

    if (validateDates(startDateInput, endDateInput)) {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const differenceMs = endDate - startDate;
        const totalDaysRaw = differenceMs / (1000 * 60 * 60 * 24);

        if (totalDaysRaw <= 7) {
            renderError("O período do contrato deve ser superior a 7 dias.");
        } else {
            calculateContractDays(startDateInput, endDateInput);
            renderDaysDialog();
        }
    } else {
        renderError("Você errou e foi moleque! As datas estão inválidas ou não foram preenchidas corretamente, seu/sua tanso(a)! Verifique também se a data de início é anterior à data de fim.");
    }
}

function handleSpeedPeaks(answer) {
    appState.hasSpeedPeaks = answer;
    if (appState.hasSpeedPeaks) {
        renderSpeedPeaksInputScreen();
    } else {
        calculateBonusWithoutPeaks();
        renderFinalScreen();
    }
}

function handlePeakCount() {
    const peakCountInput = document.getElementById("peakCount");
    const peakCount = parseInt(peakCountInput.value);

    if (!isNaN(peakCount) && peakCount > 0) {
        appState.peakCountInput = peakCount;
        renderPeakDatesScreen(peakCount);
    } else {
        renderError("Por favor, insira um número válido (maior que zero) para a quantidade de picos.");
    }
}

function handlePeakDatesInput(peakCount) {
    const peakDates = [];
    let allDatesFilled = true;
    for (let i = 0; i < peakCount; i++) {
        const dateInput = document.getElementById(`peakDate${i}`);
        const dateValue = dateInput.value;
        if (dateValue) {
            const peakDate = new Date(dateValue + "T00:00:00");
            const contractStart = new Date(appState.contractStartDate);
            const contractEnd = new Date(appState.contractEndDate);

            contractStart.setHours(0, 0, 0, 0);
            contractEnd.setHours(23, 59, 59, 999);

            if (peakDate >= contractStart && peakDate <= contractEnd) {
                peakDates.push(dateValue);
            } else {
                renderError(`A data do pico ${i + 1} (${formatDate(dateValue)}) está fora do período do contrato.`);
                allDatesFilled = false;
                break;
            }
        } else {
            renderError(`Por favor, preencha a data do pico ${i + 1}.`);
            allDatesFilled = false;
            break;
        }
    }

    if (allDatesFilled) {
        appState.speedPeaksData = peakDates;
        renderPeakDatesConfirmationScreen(peakDates);
    }
}

// --- Funções Auxiliares e de Cálculo ---

function validateDates(startDateInput, endDateInput) {
    if (!startDateInput || !endDateInput) {
        return false;
    }
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate < endDate;
}

function calculateContractDays(startDateInput, endDateInput) {
    appState.contractStartDate = startDateInput;
    appState.contractEndDate = endDateInput;

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    const differenceMs = endDate - startDate;
    const totalHours = differenceMs / (1000 * 60 * 60);
    appState.totalDays = Math.ceil(totalHours / 24);
}

function calculateBonusWithoutPeaks() {
    let bonusRaw = (appState.totalDays / 7) * 100;
    appState.bonus = bonusRaw;
}

function calculateBonusWithPeaks(peakDates) {
    const bonusRawBase = (appState.totalDays / 7) * 100;

    const contractStart = new Date(appState.contractStartDate);
    contractStart.setHours(0, 0, 0, 0);
    const weeksWithPeaks = new Set();

    peakDates.forEach(dateString => {
        const peakDate = new Date(dateString + "T00:00:00");
        peakDate.setHours(0, 0, 0, 0);

        const diffTime = peakDate - contractStart;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const weekNumber = Math.floor(diffDays / 7);
        weeksWithPeaks.add(weekNumber);
    });

    const deduction = weeksWithPeaks.size * 100;

    let finalBonusRaw = bonusRawBase - deduction;

    appState.bonus = finalBonusRaw;

    renderFinalScreen();
}

function formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("pt-BR");
    const formattedTime = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${formattedDate} ${formattedTime}`;
}

// --- Funções de Tema ---

function applyThemeClass(theme) {
    // Remove theme classes
    document.body.classList.remove('theme-matrix');
    if (theme === 'matrix') {
        document.body.classList.add('theme-matrix');
    }
    // Atualiza estilo do botão ativo
    document.querySelectorAll('.theme-button').forEach(btn => btn.classList.remove('theme-active-button'));
    const map = {
        'default': 'btn-current',
        'matrix': 'btn-xp'
    };
    const id = map[theme] || 'btn-current';
    const activeBtn = document.getElementById(id);
    if (activeBtn) activeBtn.classList.add('theme-active-button');
    // Start/stop animations depending on theme
    if (theme === 'matrix' && matrixAnimationEnabled) startMatrix(); else stopMatrix();
}

function setTheme(theme) {
    if (!theme || theme === 'default') {
        localStorage.removeItem('siteTheme');
        applyThemeClass('default');
        return;
    }
    localStorage.setItem('siteTheme', theme);
    applyThemeClass(theme);
}

function initThemeControls() {
    const btnCurrent = document.getElementById('btn-current');
    const btnXp = document.getElementById('btn-xp');
    const btnMatrixToggle = document.getElementById('btn-matrix-toggle');

    if (btnCurrent) btnCurrent.addEventListener('click', () => setTheme('default'));
    if (btnXp) btnXp.addEventListener('click', () => setTheme('matrix'));

    if (btnMatrixToggle) {
        btnMatrixToggle.addEventListener('click', () => {
            toggleMatrixAnimation();
        });
    }
}

// Matrix animation toggle state (persisted)
let matrixAnimationEnabled = true;
function updateMatrixToggleButton() {
    const btn = document.getElementById('btn-matrix-toggle');
    if (!btn) return;
    // Use play/pause icons. When enabled -> show pause icon; when disabled -> show play icon
    if (matrixAnimationEnabled) {
        btn.innerHTML = '⏸';
        btn.setAttribute('title', 'Pausar animação Matrix');
        btn.classList.remove('theme-active-button');
        btn.setAttribute('aria-pressed', 'true');
    } else {
        btn.innerHTML = '▶';
        btn.setAttribute('title', 'Reproduzir animação Matrix');
        btn.classList.add('theme-active-button');
        btn.setAttribute('aria-pressed', 'false');
    }
}

function toggleMatrixAnimation() {
    matrixAnimationEnabled = !matrixAnimationEnabled;
    try { localStorage.setItem('matrixEnabled', matrixAnimationEnabled ? '1' : '0'); } catch (e) {}
    updateMatrixToggleButton();
    // If currently on matrix theme, start/stop immediately
    const isMatrixActive = document.body.classList.contains('theme-matrix');
    if (isMatrixActive) {
        if (matrixAnimationEnabled) startMatrix(); else stopMatrix();
    }
}

function initTheme() {
    const saved = localStorage.getItem('siteTheme');
    initThemeControls();
    // load matrix enabled state
    try {
        const m = localStorage.getItem('matrixEnabled');
        if (m === '0') matrixAnimationEnabled = false; else matrixAnimationEnabled = true;
    } catch (e) { matrixAnimationEnabled = true; }
    updateMatrixToggleButton();
    if (saved) {
        applyThemeClass(saved);
    } else {
        applyThemeClass('default');
    }
}

// --- Inicialização ---

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    renderStartScreen();
});

// --- Matrix rain effect (canvas) ---
let _matrix = null;
function createMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    let width = 0;
    let height = 0;
    const letters = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()*&^%';
    let fontSize = 16;
    let columns = 0;
    let drops = [];

    function setupSizes() {
        dpr = Math.max(1, window.devicePixelRatio || 1);
        width = Math.floor(window.innerWidth);
        height = Math.floor(window.innerHeight);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // adapt font size slightly to width
        fontSize = Math.max(12, Math.floor(Math.min(20, width / 80)));
        columns = Math.floor(width / fontSize) + 1;
        drops = new Array(columns).fill(1);
    }

    setupSizes();
    window.addEventListener('resize', () => { setupSizes(); });

    let rafId = null;
    let running = false;

    function draw() {
        // translucent black to create trail effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // head bright
            ctx.fillStyle = 'rgba(200,255,200,0.95)';
            ctx.fillText(text, x, y);

            // slightly dimmer char slightly above to create small tail
            ctx.fillStyle = 'rgba(0,255,102,0.6)';
            ctx.fillText(text, x, y - Math.floor(fontSize / 2));

            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        rafId = requestAnimationFrame(draw);
    }

    // Draw a single frame (static) without scheduling next frame
    function drawFrame() {
        // fill with translucent black to create the trail look once
        ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            const x = i * fontSize;
            const y = drops[i] * fontSize;
            ctx.fillStyle = 'rgba(200,255,200,0.95)';
            ctx.fillText(text, x, y);
            ctx.fillStyle = 'rgba(0,255,102,0.6)';
            ctx.fillText(text, x, y - Math.floor(fontSize / 2));
            // advance drops slightly so repeated static frames vary a bit
            if (y > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    return {
        start() {
            if (!running) {
                running = true;
                ctx.clearRect(0, 0, width, height);
                draw();
            }
        },
        stop() {
            if (running) {
                running = false;
                if (rafId) cancelAnimationFrame(rafId);
                // draw a final static frame and keep it visible (pause effect)
                drawFrame();
            } else {
                // if not running, still render a frame so toggling off shows static
                drawFrame();
            }
        }
    };
}

function startMatrix() {
    if (!_matrix) _matrix = createMatrixRain();
    if (_matrix) _matrix.start();
}

function stopMatrix() {
    if (_matrix) _matrix.stop();
}

// Ensure matrix stops when navigating away
window.addEventListener('pagehide', () => { if (_matrix) _matrix.stop(); });
