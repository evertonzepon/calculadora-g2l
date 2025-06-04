// Estado da aplicação
const appState = {
    contractStartDate: null,
    contractEndDate: null,
    totalDays: 0,
    hasSpeedPeaks: null,
    speedPeaksData: [], // Armazenará as datas dos picos
    bonus: 0,
    peakCountInput: 0 // Para guardar temporariamente a contagem de picos
};

// Elemento principal da aplicação
const appElement = document.getElementById("app");

// --- Funções de Renderização ---

function clearApp() {
    appElement.innerHTML = ""; // Limpa o conteúdo anterior
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
    return element;
}

function renderStartScreen() {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h1", { textContent: "Calculadora de Bonificação G2L" }));
    container.appendChild(createElement("h2", { textContent: "- Ação Zero Picos -" }));
    container.appendChild(createElement("p", { textContent: "Em caso de dúvidas, procure informação no Loop ou peça ajuda ao coleguinha do lado. Caso mesmo assim não se sinta seguro em continuar, peça ajuda à gestão." }));
    container.appendChild(createElement("h2", { textContent: "Informe as datas e horários do contrato:" }));

    const formContainer = createElement("div", { className: "form-group" });

    const startLabel = createElement("label", { htmlFor: "startDateTime", textContent: "Data e hora de início do contrato:" });
    const startInput = createElement("input", { type: "datetime-local", id: "startDateTime", step: "60" });
    formContainer.appendChild(startLabel);
    formContainer.appendChild(startInput);

    const endLabel = createElement("label", { htmlFor: "endDateTime", textContent: "Data e hora de fim do contrato:" });
    const endInput = createElement("input", { type: "datetime-local", id: "endDateTime", step: "60" });
    formContainer.appendChild(endLabel);
    formContainer.appendChild(endInput);

    container.appendChild(formContainer);

    const confirmButton = createElement("button", { textContent: "Confirmar", className: "button-confirm" });
    confirmButton.addEventListener("click", handleDateInput);
    container.appendChild(confirmButton);

    appElement.appendChild(container);
}

function renderError(message) {
    clearApp();
    const errorContainer = createElement("div", { id: "error", className: "error-box text-center" });

    errorContainer.appendChild(createElement("h2", { textContent: "Erro na Validação" }));
    errorContainer.appendChild(createElement("p", { textContent: message }));

    const backButton = createElement("button", { textContent: "Voltar", className: "button-cancel" });
    backButton.addEventListener("click", renderStartScreen);
    errorContainer.appendChild(backButton);

    appElement.appendChild(errorContainer);
}

function renderDaysDialog() {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Verifique os dados informados antes de prosseguir" }));
    container.appendChild(createElement("h3", { textContent: `Data e hora de início: ${formatDateTime(appState.contractStartDate)}` }));
    container.appendChild(createElement("h3", { textContent: `Data e hora de fim: ${formatDateTime(appState.contractEndDate)}` }));
    const totalDaysP = createElement("p");
    totalDaysP.innerHTML = `Total de dias: <strong>${appState.totalDays}</strong>`; // Usando innerHTML para o strong
    container.appendChild(totalDaysP);

    const confirmButton = createElement("button", { textContent: "Confirmar", className: "button-confirm" });
    confirmButton.addEventListener("click", renderSpeedPeaksScreen);
    container.appendChild(confirmButton);

    const cancelButton = createElement("button", { textContent: "Cancelar", className: "button-cancel" });
    cancelButton.addEventListener("click", renderStartScreen);
    container.appendChild(cancelButton);

    appElement.appendChild(container);
}

function renderSpeedPeaksScreen() {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Houveram picos de velocidade?" }));

    const yesButton = createElement("button", { textContent: "Sim", className: "button-confirm" });
    yesButton.addEventListener("click", () => handleSpeedPeaks(true));
    container.appendChild(yesButton);

    const noButton = createElement("button", { textContent: "Não", className: "button-confirm" }); // Usar confirm ou uma classe neutra?
    noButton.addEventListener("click", () => handleSpeedPeaks(false));
    container.appendChild(noButton);

    appElement.appendChild(container);
}

function renderSpeedPeaksInputScreen() {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Informe a quantidade de picos de velocidade:" }));

    const inputContainer = createElement("div", { className: "form-group" });
    const peakInput = createElement("input", { type: "number", id: "peakCount", min: "1", placeholder: "Digite a quantidade de picos" });
    inputContainer.appendChild(peakInput);
    container.appendChild(inputContainer);

    const confirmButton = createElement("button", { textContent: "Confirmar", className: "button-confirm" });
    confirmButton.addEventListener("click", handlePeakCount);
    container.appendChild(confirmButton);

    appElement.appendChild(container);
}

function renderPeakDatesScreen(peakCount) {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Informe as datas dos picos de velocidade:" }));

    const inputContainer = createElement("div", { className: "form-group" });
    appState.speedPeaksData = Array(peakCount).fill(null); // Reinicia/inicializa array

    for (let i = 0; i < peakCount; i++) {
        const label = createElement("label", { htmlFor: `peakDate${i}`, textContent: `Data do pico ${i + 1}:` });
        const input = createElement("input", { type: "date", id: `peakDate${i}` });
        inputContainer.appendChild(label);
        inputContainer.appendChild(input);
    }
    container.appendChild(inputContainer);

    const confirmButton = createElement("button", { textContent: "Confirmar Datas", className: "button-confirm" });
    confirmButton.addEventListener("click", () => handlePeakDatesInput(peakCount));
    container.appendChild(confirmButton);

    appElement.appendChild(container);
}

function renderPeakDatesConfirmationScreen(peakDates) {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    container.appendChild(createElement("h2", { textContent: "Confirme as datas dos picos informadas:" }));

    const confirmationBox = createElement("div", { className: "confirmation-box" });
    peakDates.forEach((date, index) => {
        confirmationBox.appendChild(createElement("p", { textContent: `Data do Pico ${index + 1}: ${formatDate(date)}` }));
    });
    container.appendChild(confirmationBox);

    const confirmButton = createElement("button", { textContent: "Confirmar e Calcular", className: "button-confirm" });
    // Passa as datas já validadas diretamente para a função de cálculo
    confirmButton.addEventListener("click", () => calculateBonusWithPeaks(peakDates)); 
    container.appendChild(confirmButton);

    const backButton = createElement("button", { textContent: "Voltar", className: "button-cancel" });
    // Guarda a contagem para poder voltar para a tela anterior
    backButton.addEventListener("click", () => renderPeakDatesScreen(appState.peakCountInput)); 
    container.appendChild(backButton);

    appElement.appendChild(container);
}

function renderFinalScreen() {
    clearApp();
    const container = createElement("div", { className: "container text-center" });

    const resultH1 = createElement("h1");
    resultH1.innerHTML = "<strong>Bonificação a ser paga:</strong>";
    container.appendChild(resultH1);

    const bonusH1 = createElement("h1");
    // Exibe o valor final já calculado e arredondado
    bonusH1.innerHTML = `<strong>-- R$${appState.bonus} --</strong>`; 
    container.appendChild(bonusH1);

    const restartButton = createElement("button", { textContent: "Reiniciar", className: "button-confirm" });
    restartButton.addEventListener("click", renderStartScreen);
    container.appendChild(restartButton);

    appElement.appendChild(container);
}

// --- Funções de Lógica e Manipulação de Dados ---

function handleDateInput() {
    const startDateInput = document.getElementById("startDateTime").value;
    const endDateInput = document.getElementById("endDateTime").value;

    if (validateDates(startDateInput, endDateInput)) {
        const startDate = new Date(startDateInput);
        const endDate = new Date(endDateInput);
        const differenceMs = endDate - startDate;
        const totalDaysRaw = differenceMs / (1000 * 60 * 60 * 24); // Dias brutos

        // Regra: Mínimo de 7 dias completos (ou mais de 7 dias brutos)
        if (totalDaysRaw <= 7) {
            renderError("Erro: O período do contrato deve ser superior a 7 dias.");
        } else {
            calculateContractDays(startDateInput, endDateInput);
            renderDaysDialog();
        }
    } else {
        renderError("Erro: Datas inválidas. Verifique se a data de início é anterior à data de fim e se ambas foram preenchidas.");
    }
}

function handleSpeedPeaks(answer) {
    appState.hasSpeedPeaks = answer;
    if (appState.hasSpeedPeaks) {
        renderSpeedPeaksInputScreen();
    } else {
        // Chama a função correta para cálculo sem picos
        calculateBonusWithoutPeaks(); 
        renderFinalScreen();
    }
}

function handlePeakCount() {
    const peakCountInput = document.getElementById("peakCount");
    const peakCount = parseInt(peakCountInput.value);

    if (!isNaN(peakCount) && peakCount > 0) {
        appState.peakCountInput = peakCount; // Guarda a contagem
        renderPeakDatesScreen(peakCount);
    } else {
        renderError("Erro: Por favor, insira um número válido (maior que zero) para a quantidade de picos.");
    }
}

function handlePeakDatesInput(peakCount) {
    const peakDates = [];
    let allDatesFilled = true;
    for (let i = 0; i < peakCount; i++) {
        const dateInput = document.getElementById(`peakDate${i}`);
        const dateValue = dateInput.value;
        if (dateValue) {
            // Validação adicional: A data do pico está dentro do período do contrato?
            const peakDate = new Date(dateValue + "T00:00:00"); // Adiciona hora para evitar problemas de fuso
            const contractStart = new Date(appState.contractStartDate);
            const contractEnd = new Date(appState.contractEndDate);
            
            // Ajusta as datas do contrato para início e fim do dia para comparação segura
            contractStart.setHours(0, 0, 0, 0);
            contractEnd.setHours(23, 59, 59, 999);

            if (peakDate >= contractStart && peakDate <= contractEnd) {
                peakDates.push(dateValue);
            } else {
                renderError(`Erro: A data do pico ${i + 1} (${formatDate(dateValue)}) está fora do período do contrato.`);
                allDatesFilled = false;
                break; // Interrompe a validação
            }
        } else {
            renderError(`Erro: Por favor, preencha a data do pico ${i + 1}.`);
            allDatesFilled = false;
            break; // Interrompe a validação
        }
    }

    if (allDatesFilled) {
        appState.speedPeaksData = peakDates; // Armazena as datas validadas no estado
        renderPeakDatesConfirmationScreen(peakDates);
    }
}

// --- Funções Auxiliares e de Cálculo ---

function validateDates(startDateInput, endDateInput) {
    if (!startDateInput || !endDateInput) {
        return false; // Campos não preenchidos
    }
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);
    // Verifica se as datas são válidas e se início < fim
    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate < endDate;
}

function calculateContractDays(startDateInput, endDateInput) {
    // Armazena as strings originais para exibição
    appState.contractStartDate = startDateInput;
    appState.contractEndDate = endDateInput;

    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    // Cálculo de dias: Considera-se um dia completo por cada período de 24h, arredondado para cima.
    // Ex: 7 dias e 1 hora = 8 dias para cálculo.
    const differenceMs = endDate - startDate;
    // Para o cálculo do bônus, usamos a diferença exata em dias, sem arredondar aqui.
    const totalHours = differenceMs / (1000 * 60 * 60); // Total de horas
    appState.totalDays = totalHours / 24; // Total de dias (pode ter decimal)
    // O arredondamento para exibição na tela de confirmação pode ser feito lá, se necessário,
    // mas para o cálculo do bônus, usamos o valor preciso.
    // Para manter a exibição anterior, podemos arredondar para cima apenas para exibição:
    // appState.totalDaysDisplay = Math.ceil(appState.totalDays);
}


// Calcula o bônus final SEM picos (NOVA LÓGICA)
function calculateBonusWithoutPeaks() {
    // Bônus = (total dias / 7) * 100
    let bonusRaw = (appState.totalDays / 7) * 100;

    // Garante que o bônus não seja menor que o mínimo (100) ANTES de arredondar
    if (bonusRaw < 100) {
        bonusRaw = 100;
    }

    // Arredonda o valor final para cima
    appState.bonus = Math.ceil(bonusRaw);
}

// Calcula o bônus final COM picos (NOVA LÓGICA)
function calculateBonusWithPeaks(peakDates) {
    // 1. Calcula o bônus base bruto (sem arredondar)
    // Usa appState.totalDays que agora pode ter decimais
    const bonusRawBase = (appState.totalDays / 7) * 100;

    // 2. Calcula as semanas únicas com picos
    const contractStart = new Date(appState.contractStartDate);
    contractStart.setHours(0, 0, 0, 0); // Normaliza para início do dia
    const weeksWithPeaks = new Set();

    peakDates.forEach(dateString => {
        const peakDate = new Date(dateString + "T00:00:00"); // Adiciona hora para evitar problemas de fuso
        peakDate.setHours(0, 0, 0, 0); // Normaliza para início do dia

        // Calcula a diferença em dias desde o início do contrato
        const diffTime = peakDate - contractStart;
        // Usamos Math.floor para garantir que a contagem de dias seja inteira para determinar a semana
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 

        // Calcula o número da semana (base 0)
        const weekNumber = Math.floor(diffDays / 7);
        weeksWithPeaks.add(weekNumber);
    });

    // 3. Calcula a dedução
    const deduction = weeksWithPeaks.size * 100;

    // 4. Calcula o bônus final bruto (antes de arredondar e aplicar mínimo)
    let finalBonusRaw = bonusRawBase - deduction;

    // 5. Garante que o bônus não seja menor que o mínimo (100)
    if (finalBonusRaw < 100) {
        finalBonusRaw = 100;
    }

    // 6. Arredonda o valor final para cima
    appState.bonus = Math.ceil(finalBonusRaw);

    // 7. Renderiza a tela final
    renderFinalScreen();
}


// Formata data de YYYY-MM-DD para DD/MM/YYYY
function formatDate(dateString) {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

// Formata data e hora de string ISO para DD/MM/YYYY HH:MM
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("pt-BR");
    const formattedTime = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${formattedDate} ${formattedTime}`;
}

// --- Inicialização ---

// Garante que o DOM está pronto antes de renderizar
document.addEventListener("DOMContentLoaded", renderStartScreen);

