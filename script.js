// Variáveis globais
const app = document.getElementById('app');
let contractStartDate = null;
let contractEndDate = null;
let totalDays = 0;
let hasSpeedPeaks = null;
let speedPeaks = [];
let bonus = 0;

// Funções principais
function renderStartScreen() {
    app.innerHTML = `
        <h1>Calculadora de Bonificação G2L</h1>
        <h2>- Ação Zero Picos -</h2>
        <p>Em caso de dúvidas, procure informação no Loop ou peça ajuda ao coleguinha do lado. Caso mesmo assim não se sinta seguro em continuar, peça ajuda à gestão.</p>  
        <h2>Informe as datas do contrato:</h2>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <label>Data de início: <input type="date" id="startDate"></label>
            <label>Data de fim: <input type="date" id="endDate"></label>
        </div>
        <button onclick="handleDateInput()">Confirmar</button>
    `
}

function renderError(message) {
    app.innerHTML = `
        <div id="error" style="text-align: center; padding: 20px; background: rgba(255, 0, 0, 0.2); border: 2px solid #FF0000; border-radius: 8px; color: white; box-shadow: 0 0 10px #FF0000, 0 0 40px #FF0000;">
            <h2>Erro</h2>
            <p>${message}</p>
            <button class="cancel" onclick="renderStartScreen()">Voltar</button>
        </div>
    `;
}

function handleDateInput() {
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;

    if (validateDates(startDateInput, endDateInput)) {
        calculateDays(startDateInput, endDateInput);
        renderDaysDialog();
    } else {
        renderError('Por favor, insira datas válidas.');
    }
}

function validateDates(startDateInput, endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    return startDateInput && endDateInput && startDate < endDate;
}

function calculateDays(startDateInput, endDateInput) {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    contractStartDate = startDateInput; // Salvar como string para exibição
    contractEndDate = endDateInput;    // Salvar como string para exibição

    const diferencaMs = endDate - startDate;
    totalDays = diferencaMs / (1000 * 60 * 60 * 24); // Converte para dias
}

function renderDaysDialog() {
    app.innerHTML = `
        <h2>Verifique os dados informados antes de prosseguir</h2>
        <p>Data de início do contrato: ${formatDate(contractStartDate)}</p>
        <p>Data de fim do contrato: ${formatDate(contractEndDate)}</p>
        <p>Total de dias: ${totalDays}</p>
        <button class="confirm" onclick="renderSpeedPeaksScreen()">Confirmar</button>
        <button class="cancel" onclick="renderStartScreen()">Cancelar</button>
    `;
}

function renderSpeedPeaksScreen() {
    app.innerHTML = `
        <h2>Houveram picos de velocidade?</h2>
        <button onclick="handleSpeedPeaks(true)">Sim</button>
        <button onclick="handleSpeedPeaks(false)">Não</button>
    `;
}

function handleSpeedPeaks(answer) {
    hasSpeedPeaks = answer;
    if (hasSpeedPeaks) {
        renderSpeedPeaksInputScreen();
    } else {
        calculateBonus();
        renderFinalScreen();
    }
}

function renderSpeedPeaksInputScreen() {
    app.innerHTML = `
        <h2>Informe a quantidade de picos de velocidade:</h2>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <input type="number" id="peakCount" min="1" placeholder="Digite a quantidade de picos">
        </div>
        <button onclick="renderPeakDatesScreen()">Confirmar</button>
    `;
}

function renderPeakDatesScreen() {
    const peakCount = parseInt(document.getElementById('peakCount').value);
    if (peakCount > 0) {
        speedPeaks = Array(peakCount).fill(null);
        let inputs = '';
        for (let i = 0; i < peakCount; i++) {
            inputs += `<label>Data do pico ${i + 1}: <input type="date" id="peakDate${i}"></label>`;
        }
        app.innerHTML = `
            <h2>Informe as datas dos picos de velocidade:</h2>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${inputs}
            </div>
            <button onclick="calculateBonusWithPeaks(${peakCount})">Confirmar</button>
        `;
    } else {
        renderError('Por favor, insira um número válido.');
    }
}

function calculateBonus() {
    bonus = Math.ceil((totalDays / 7) * 100);
    if (bonus < 100) bonus = 100;
}

function calculateBonusWithPeaks(peakCount) {
    calculateBonus();
    const peakDates = [];
    for (let i = 0; i < peakCount; i++) {
        const date = new Date(document.getElementById(`peakDate${i}`).value);
        if (date) peakDates.push(date.toLocaleDateString('pt-BR'));
    }

    const weeksWithPeaks = new Set();
    peakDates.forEach(date => {
        const weekNumber = Math.floor((new Date(date) - new Date(contractStartDate)) / (1000 * 60 * 60 * 24 * 7));
        weeksWithPeaks.add(weekNumber);
    });

    bonus -= weeksWithPeaks.size * 100;
    if (bonus < 100) bonus = 100;

    renderFinalScreen();
}

function renderFinalScreen() {
    app.innerHTML = `
        <h2>Bonificação à ser paga:</h2>
        <p>R$${bonus}</p>
        <button onclick="renderStartScreen()">Reiniciar</button>
    `;
}

// Funções auxiliares
function formatDate(dateString) {
    return dateString.split('-').reverse().join('/');
}

// Inicializa a aplicação
renderStartScreen();
