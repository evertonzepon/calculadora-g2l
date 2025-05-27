document.getElementById('startDate').addEventListener('change', validateDates);
document.getElementById('endDate').addEventListener('change', validateDates);

let hasPeaks = false; // Variável para rastrear se há picos

function validateDates() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate < endDate) {
        // Exibir o diálogo para perguntar sobre os picos
        document.getElementById('dialog').style.display = 'flex';

        // Atualizar o total de dias
        updateTotalDays(startDate, endDate);
    } else {
        // Ocultar os campos relacionados aos picos e o diálogo
        document.getElementById('dialog').style.display = 'none';
        document.getElementById('peakSection').style.display = 'none';
        document.getElementById('peakCount').style.display = 'none';
        document.getElementById('peakDatesLabel').style.display = 'none';
        document.getElementById('peakDatesContainer').style.display = 'none';

        // Resetar o total de dias
        document.getElementById('totalDays').textContent = "Total de dias: 0";
    }
}

document.getElementById('yesButton').addEventListener('click', function () {
    hasPeaks = true;
    document.getElementById('dialog').style.display = 'none';
    document.getElementById('peakSection').style.display = 'block';
    document.getElementById('peakCount').style.display = 'block';
    document.getElementById('peakDatesLabel').style.display = 'block';
    document.getElementById('peakDatesContainer').style.display = 'block';
});

document.getElementById('noButton').addEventListener('click', function () {
    hasPeaks = false;
    document.getElementById('dialog').style.display = 'none';
    document.getElementById('peakSection').style.display = 'none';
    document.getElementById('peakCount').style.display = 'none';
    document.getElementById('peakDatesLabel').style.display = 'none';
    document.getElementById('peakDatesContainer').style.display = 'none';
});

document.getElementById('addPeakDate').addEventListener('click', function () {
    const peakDateInput = document.createElement('input');
    peakDateInput.type = 'date';
    peakDateInput.className = 'input small-input';
    peakDateInput.placeholder = 'Selecione a data do pico';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remover';
    removeButton.className = 'small-button';

    const listItem = document.createElement('li');
    listItem.appendChild(peakDateInput);
    listItem.appendChild(removeButton);

    document.getElementById('peakDatesList').appendChild(listItem);

    removeButton.addEventListener('click', function () {
        listItem.remove();
    });
});

function updateTotalDays(startDate, endDate) {
    const timeDiff = endDate - startDate;
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Inclui o dia inicial
    document.getElementById('totalDays').textContent = `Total de dias: ${totalDays}`;
}

document.getElementById('calculate').addEventListener('click', function () {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    // Validação das datas de início e fim
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
        document.getElementById('result').textContent = "Por favor, insira datas válidas.";
        return;
    }

    // Calcular a quantidade total de dias
    const timeDiff = endDate - startDate;
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1; // Inclui o dia inicial

    // Calcular o total de semanas proporcionalmente
    const totalWeeks = totalDays / 7; // Divisão exata para calcular semanas
    let totalBonus = Math.ceil(totalWeeks * 100); // Multiplicar por 100 e arredondar sempre para cima

    if (hasPeaks) {
        const peakCount = parseInt(document.getElementById('peakCount').value);
        const peakDateInputs = document.querySelectorAll('#peakDatesList input[type="date"]');
        const peakDates = Array.from(peakDateInputs).map(input => new Date(input.value));

        // Validação da quantidade de picos
        if (isNaN(peakCount) || peakCount < 0) {
            document.getElementById('result').textContent = "Por favor, insira uma quantidade válida de picos.";
            return;
        }

        // Validação da correspondência entre quantidade de picos e datas informadas
        if (peakCount !== peakDates.length) {
            document.getElementById('result').textContent = "A quantidade de picos não corresponde à quantidade de datas informadas.";
            return;
        }

        // Validação das datas dos picos
        if (peakDates.some(date => isNaN(date.getTime()) || date < startDate || date > endDate)) {
            document.getElementById('result').textContent = "Por favor, insira datas válidas para os picos de velocidade no intervalo selecionado.";
            return;
        }

        // Ordenar as datas dos picos para garantir consistência
        peakDates.sort((a, b) => a - b);

        // Aplicar desconto com base nas semanas afetadas pelos picos
        let discount = 0;
        const weeksWithPeaks = new Set(peakDates.map(date => {
            const dayDiff = Math.ceil((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
            return Math.ceil(dayDiff / 7); // Identificar a semana do pico
        }));
        discount = weeksWithPeaks.size * 100; // Cada semana com picos anula R$100

        totalBonus -= discount;
    }

    // Garantir que o valor seja R$0 se o desconto exceder o total
    if (totalBonus < 0) {
        totalBonus = 0;
    }

    document.getElementById('result').textContent = `Bonificação total: R$${totalBonus}`;
});
