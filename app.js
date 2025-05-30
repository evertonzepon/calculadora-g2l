// Variáveis globdata e hora de fimais
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
        <div style="text-align: center; width: 95%; margin: 0 auto;">
            <h1>Calculadora de Bonificação G2L</h1>
            <h2>- Ação Zero Picos -</h2>
            <p>Em caso de dúvidas, procure informação no Loop ou peça ajuda ao coleguinha do lado. Caso mesmo assim não se sinta seguro em continuar, peça ajuda à gestão.</p>  
            <h2>Informe as datas e horários do contrato:</h2>
            <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
                <label>Data e hora de início do contrato:<br>
                <input type="datetime-local" id="startDateTime" step="60"></label>
                <label>Data e hora de fim do contrato:<br>
                <input type="datetime-local" id="endDateTime" step="60"></label>
            </div>
            <button onclick="handleDateInput()">Confirmar</button>
        </div>
    `
}

function renderError(message) {
    app.innerHTML = `
        <div id="error" style="text-align: center; padding: 20px; background: rgba(255, 0, 0, 0.2); border: 2px solid #FF0000; border-radius: 8px; color: white; box-shadow: 0 0 10px #FF0000, 0 0 40px #FF0000;">
            <h2>Tu errou e foi muleque. Reveja seus conceitos.</h2>
            <p>${message}</p>
            <button class="cancel" onclick="renderStartScreen()">Voltar</button>
        </div>
    `;
}

function handleDateInput() {
    const startDateInput = document.getElementById('startDateTime').value;
    const endDateInput = document.getElementById('endDateTime').value;

    if (validateDates(startDateInput, endDateInput)) {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const diferencaMs = endDate - startDate;
        const totalDays = diferencaMs / (1000 * 60 * 60 * 24); // Converte para dias

        if (totalDays <= 7) {
            renderError('A quantidade mínima de dias permitida deve ser maior que 7.');
        } else {
            calculateDays(startDateInput, endDateInput);
            renderDaysDialog();
        }
    } else {
        renderError('Por favor, insira datas válidas.');
    }
}

function renderDaysDialog() {
    app.innerHTML = `
        <div style="text-align: center; width: 85%; margin: 0 auto;">
            <h2>Verifique os dados informados antes de prosseguir</h2>
            <h3>Data e hora de início do contrato:<br> ${formatDateTime(contractStartDate)}</h3>
            <h3>Data e hora de fim do contrato:<br> ${formatDateTime(contractEndDate)}</h3>
            <p>Total de dias: <strong>${totalDays}</strong></p>
            <button class="confirm" onclick="renderSpeedPeaksScreen()">Confirmar</button>
            <button class="cancel" onclick="renderStartScreen()">Cancelar</button>
        </div>
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
        <button onclick="handlePeakCount()">Confirmar</button>
    `;
}

function handlePeakCount() {
    const peakCount = parseInt(document.getElementById('peakCount').value);
    if (!isNaN(peakCount) && peakCount > 0) {
        renderPeakDatesScreen(peakCount);
    } else {
        renderError('Por favor, insira um número válido para a quantidade de picos.');
    }
}

function renderPeakDatesScreen(peakCount) {
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
            <button onclick="confirmPeakDates(${peakCount})">Confirmar</button>
        `;
    } else {
        renderError('Por favor, insira um número válido.');
    }
}

function confirmPeakDates(peakCount) {
    const peakDates = [];
    for (let i = 0; i < peakCount; i++) {
        const date = document.getElementById(`peakDate${i}`).value;
        if (date) {
            peakDates.push(date);
        } else {
            renderError(`Por favor, preencha todas as datas dos picos.`);
            return;
        }
    }

    const confirmationMessage = peakDates
        .map((date, index) => `<p>Data do Pico ${index + 1}: ${formatDate(date)}</p>`)
        .join('');

    app.innerHTML = `
        <h2>Confirme os dados informados:</h2>
        <div style="text-align: left; padding: 20px; background: rgba(0, 0, 255, 0.1); border: 2px solid rgb(13, 80, 60); border-radius: 8px; color: white; box-shadow: 0 0 10px rgb(21, 124, 38), 0 0 40px rgb(27, 102, 77);">
            ${confirmationMessage}
            <button class="confirm" onclick="calculateBonusWithPeaks(${peakCount})">Confirmar</button>
            <button class="cancel" onclick="renderPeakDatesScreen(${peakCount})">Voltar</button>
        </div>
    `;
}

function renderFinalScreen() {
    app.innerHTML = `
        <h1><strong>Bonificação à ser paga:</strong></h1>
        <h1><strong>-- R$${bonus} --</strong></h1>
        <button onclick="renderStartScreen()">Reiniciar</button>
    `;
}

// Funções auxiliares
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
    const totalHours = diferencaMs / (1000 * 60 * 60); // Converte para horas
    totalDays = Math.ceil(totalHours / 24); // Converte para dias, arredonda para cima
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

function formatDate(dateString) {
    return dateString.split('-').reverse().join('/');
}

function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;
}

// Inicializa a aplicação
renderStartScreen();
