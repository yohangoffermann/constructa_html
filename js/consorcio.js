console.log('Arquivo consorcio.js carregado', new Date().toISOString());

(function() {
    let dropdowns = [];

    function inicializarConsorcio() {
        console.log('Função inicializarConsorcio chamada');
        document.getElementById('adicionarDropdown').addEventListener('click', adicionarDropdown);
        document.getElementById('calcularConsorcio').addEventListener('click', calcularConsorcio);
        document.getElementById('limparDropdowns').addEventListener('click', limparDropdowns);
    }

    function adicionarDropdown() {
        const valor = parseFloat(document.getElementById('valorDropdown').value);
        const agio = parseFloat(document.getElementById('agioDropdown').value);
        const mes = parseInt(document.getElementById('mesDropdown').value);

        if (isNaN(valor) || isNaN(agio) || isNaN(mes)) {
            alert('Por favor, preencha todos os campos do dropdown com valores válidos.');
            return;
        }

        dropdowns.push({ valor, agio, mes });
        console.log('Dropdown adicionado:', { valor, agio, mes });
        console.log('Lista atual de dropdowns:', dropdowns);
        atualizarListaDropdowns();
        calcularConsorcio(); // Recalcula o consórcio após adicionar um dropdown
    }

    function atualizarListaDropdowns() {
        const lista = document.getElementById('listaDropdowns');
        lista.innerHTML = dropdowns.map((dropdown, index) => 
            `<div>Dropdown ${index + 1}: Valor: ${formatarMoeda(dropdown.valor)}, Ágio: ${dropdown.agio}%, Mês: ${dropdown.mes}</div>`
        ).join('');
    }

    function calcularConsorcio() {
        const valorCredito = parseFloat(document.getElementById('valorCredito').value);
        const taxaAdmin = parseFloat(document.getElementById('taxaAdmin').value);
        const incc = parseFloat(document.getElementById('incc').value);
        const duracaoConsorcio = parseInt(document.getElementById('duracaoConsorcio').value);

        if (isNaN(valorCredito) || isNaN(taxaAdmin) || isNaN(incc) || isNaN(duracaoConsorcio)) {
            alert('Por favor, preencha todos os campos do consórcio com valores válidos.');
            return;
        }

        console.log('Calculando consórcio com os seguintes parâmetros:', { valorCredito, taxaAdmin, incc, duracaoConsorcio });
        console.log('Dropdowns a serem aplicados:', dropdowns);

        const fluxoBase = calcularFluxoConsorcioBase(valorCredito, taxaAdmin, incc, duracaoConsorcio);
        const fluxoComDropdowns = calcularFluxoConsorcioComDropdowns(valorCredito, taxaAdmin, incc, duracaoConsorcio, dropdowns);

        console.log('Primeiros 5 meses do Fluxo Base:', fluxoBase.slice(0, 5));
        console.log('Primeiros 5 meses do Fluxo com Dropdowns:', fluxoComDropdowns.slice(0, 5));

        mostrarGraficoConsorcio(fluxoBase, fluxoComDropdowns);
        atualizarTabelaConsorcio(fluxoBase, fluxoComDropdowns);
    }

    function calcularFluxoConsorcioBase(valorCredito, taxaAdmin, incc, duracaoConsorcio) {
        let saldoDevedor = valorCredito;
        const fluxo = [];
        const parcela = calcularParcela(valorCredito, taxaAdmin, duracaoConsorcio);

        for (let mes = 1; mes <= duracaoConsorcio; mes++) {
            if (mes % 12 === 1 && mes > 1) {
                saldoDevedor *= (1 + incc / 100);
            }
            saldoDevedor = Math.max(saldoDevedor - parcela, 0);
            fluxo.push({ mes, saldoDevedor });
        }

        return fluxo;
    }

    function calcularFluxoConsorcioComDropdowns(valorCredito, taxaAdmin, incc, duracaoConsorcio, dropdowns) {
        console.log('Calculando fluxo com dropdowns:', dropdowns);
        let saldoDevedor = valorCredito;
        const fluxo = [];
        const parcela = calcularParcela(valorCredito, taxaAdmin, duracaoConsorcio);

        for (let mes = 1; mes <= duracaoConsorcio; mes++) {
            if (mes % 12 === 1 && mes > 1) {
                saldoDevedor *= (1 + incc / 100);
            }
            
            const dropdown = dropdowns.find(d => d.mes === mes);
            if (dropdown) {
                console.log(`Aplicando dropdown no mês ${mes}:`, dropdown);
                const valorEfetivo = dropdown.valor * (1 + dropdown.agio / 100);
                saldoDevedor = Math.max(saldoDevedor - valorEfetivo, 0);
                console.log(`Saldo devedor após aplicar dropdown: ${saldoDevedor}`);
            }

            saldoDevedor = Math.max(saldoDevedor - parcela, 0);
            fluxo.push({ mes, saldoDevedor });
        }

        return fluxo;
    }

    function calcularParcela(valorCredito, taxaAdmin, duracaoConsorcio) {
        return (valorCredito * (1 + taxaAdmin / 100)) / duracaoConsorcio;
    }

    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    }

    function atualizarTabelaConsorcio(fluxoBase, fluxoComDropdowns) {
        const tabela = document.getElementById('consorcioTable');
        tabela.innerHTML = `
            <tr>
                <th>Mês</th>
                <th>Saldo Devedor Base</th>
                <th>Saldo Devedor com Dropdowns</th>
                <th>Diferença</th>
            </tr>
            ${fluxoBase.map((item, index) => {
                const diferenca = fluxoComDropdowns[index].saldoDevedor - item.saldoDevedor;
                const highlightClass = Math.abs(diferenca) > 0.01 ? 'highlight' : '';
                return `
                    <tr class="${highlightClass}">
                        <td>${item.mes}</td>
                        <td>${formatarMoeda(item.saldoDevedor)}</td>
                        <td>${formatarMoeda(fluxoComDropdowns[index].saldoDevedor)}</td>
                        <td>${formatarMoeda(diferenca)}</td>
                    </tr>
                `;
            }).join('')}
        `;
    }

    function mostrarGraficoConsorcio(fluxoBase, fluxoComDropdowns) {
        const ctx = document.getElementById('consorcioChart').getContext('2d');
        
        if (window.consorcioChart instanceof Chart) {
            window.consorcioChart.destroy();
        }

        window.consorcioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fluxoBase.map(item => `Mês ${item.mes}`),
                datasets: [
                    {
                        label: 'Saldo Devedor Base',
                        data: fluxoBase.map(item => item.saldoDevedor),
                        borderColor: '#0068c9',
                        backgroundColor: 'rgba(0, 104, 201, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Saldo Devedor com Dropdowns',
                        data: fluxoComDropdowns.map(item => item.saldoDevedor),
                        borderColor: '#29b09d',
                        backgroundColor: 'rgba(41, 176, 157, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Mês'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Saldo Devedor (R$)'
                        },
                        ticks: {
                            callback: function(value) {
                                return formatarMoeda(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += formatarMoeda(context.parsed.y);
                                return label;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    function limparDropdowns() {
        dropdowns = [];
        atualizarListaDropdowns();
        console.log('Dropdowns limpos');
        calcularConsorcio(); // Recalcula o consórcio após limpar os dropdowns
    }

    // Expor funções globalmente
    window.inicializarConsorcio = inicializarConsorcio;
    window.calcularConsorcio = calcularConsorcio;
    window.mostrarGraficoConsorcio = mostrarGraficoConsorcio;
})();
