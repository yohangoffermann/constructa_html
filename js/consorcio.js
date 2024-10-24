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
        calcularConsorcio();
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
        const taxaLivreRisco = parseFloat(document.getElementById('taxaLivreRisco').value) / 100;

        if (isNaN(valorCredito) || isNaN(taxaAdmin) || isNaN(incc) || isNaN(duracaoConsorcio) || isNaN(taxaLivreRisco)) {
            alert('Por favor, preencha todos os campos do consórcio com valores válidos.');
            return;
        }

        console.log('Calculando consórcio com os seguintes parâmetros:', { valorCredito, taxaAdmin, incc, duracaoConsorcio, taxaLivreRisco });
        console.log('Dropdowns a serem aplicados:', dropdowns);

        const fluxoBase = calcularFluxoConsorcioBase(valorCredito, taxaAdmin, incc, duracaoConsorcio);
        const fluxoComDropdowns = calcularFluxoConsorcioComDropdowns(valorCredito, taxaAdmin, incc, duracaoConsorcio, dropdowns);

        console.log('Fluxo Base:', fluxoBase);
        console.log('Fluxo com Dropdowns:', fluxoComDropdowns);

        if (fluxoBase.length === 0 || fluxoComDropdowns.length === 0) {
            alert('Erro ao calcular os fluxos do consórcio. Por favor, verifique os parâmetros.');
            return;
        }

        const analiseConsorcio = analisarConsorcio(fluxoBase, fluxoComDropdowns, taxaLivreRisco);
        console.log('Análise do Consórcio:', analiseConsorcio);

        mostrarGraficoConsorcio(fluxoBase, fluxoComDropdowns);
        atualizarTabelaConsorcio(fluxoBase, fluxoComDropdowns);
        exibirAnaliseConsorcio(analiseConsorcio);

        const analiseDinheiroBarato = analiseTeseDinheiroBarato(fluxoBase, fluxoComDropdowns, valorCredito, taxaAdmin, incc, duracaoConsorcio, taxaLivreRisco, dropdowns);
        exibirAnaliseTeseDinheiroBarato(analiseDinheiroBarato);
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

    function analisarConsorcio(fluxoBase, fluxoComDropdowns, taxaLivreRisco) {
        if (!Array.isArray(fluxoBase) || !Array.isArray(fluxoComDropdowns) || fluxoBase.length === 0 || fluxoComDropdowns.length === 0) {
            console.error('Dados de fluxo inválidos');
            return {
                parcelasPagas: 0,
                valorGanhoAgio: 0,
                tempoAplicado: 0,
                valorAplicado: 0,
                rendimentoAplicacao: 0
            };
        }

        const indexFinal = fluxoComDropdowns.findIndex(item => item && item.saldoDevedor <= 0);
        const parcelasPagas = indexFinal !== -1 ? indexFinal + 1 : fluxoComDropdowns.length;
        
        const valorGanhoAgio = calcularValorGanhoAgio(fluxoBase, fluxoComDropdowns, parcelasPagas);
        const tempoAplicado = Math.max(0, fluxoComDropdowns.length - parcelasPagas);
        const valorAplicado = indexFinal !== -1 && indexFinal < fluxoBase.length ? fluxoBase[indexFinal].saldoDevedor : 0;
        const rendimentoAplicacao = calcularRendimento(valorAplicado, tempoAplicado, taxaLivreRisco);

        return {
            parcelasPagas,
            valorGanhoAgio,
            tempoAplicado,
            valorAplicado,
            rendimentoAplicacao
        };
    }

    function calcularValorGanhoAgio(fluxoBase, fluxoComDropdowns, parcelasPagas) {
        if (parcelasPagas <= 0 || parcelasPagas > fluxoBase.length || parcelasPagas > fluxoComDropdowns.length) {
            return 0;
        }
        const saldoBase = fluxoBase[parcelasPagas - 1] ? fluxoBase[parcelasPagas - 1].saldoDevedor : 0;
        const saldoComDropdowns = fluxoComDropdowns[parcelasPagas - 1] ? fluxoComDropdowns[parcelasPagas - 1].saldoDevedor : 0;
        return Math.max(0, saldoBase - saldoComDropdowns);
    }

    function calcularRendimento(valor, meses, taxaMensal) {
        if (meses <= 0 || valor <= 0 || taxaMensal <= 0) {
            return 0;
        }
        return valor * (Math.pow(1 + taxaMensal, meses) - 1);
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
                const diferenca = fluxoComDropdowns[index] ? fluxoComDropdowns[index].saldoDevedor - item.saldoDevedor : 0;
                const highlightClass = Math.abs(diferenca) > 0.01 ? 'highlight' : '';
                return `
                    <tr class="${highlightClass}">
                        <td>${item.mes}</td>
                        <td>${formatarMoeda(item.saldoDevedor)}</td>
                        <td>${fluxoComDropdowns[index] ? formatarMoeda(fluxoComDropdowns[index].saldoDevedor) : '-'}</td>
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

    function exibirAnaliseConsorcio(analise) {
        const divAnalise = document.getElementById('analiseConsorcio');
        if (!divAnalise) {
            console.error('Elemento de análise do consórcio não encontrado');
            return;
        }
        divAnalise.innerHTML = `
            <h3>Análise do Consórcio</h3>
            <p>Parcelas pagas: ${analise.parcelasPagas}</p>
            <p>Valor ganho com ágio: ${formatarMoeda(analise.valorGanhoAgio)}</p>
            <p>Tempo com saldo aplicado: ${analise.tempoAplicado} meses</p>
            <p>Valor aplicado: ${formatarMoeda(analise.valorAplicado)}</p>
            <p>Rendimento estimado: ${formatarMoeda(analise.rendimentoAplicacao)}</p>
        `;
    }

    function limparDropdowns() {
        dropdowns = [];
        atualizarListaDropdowns();
        console.log('Dropdowns limpos');
        calcularConsorcio();
    }

    function analiseTeseDinheiroBarato(fluxoBase, fluxoComDropdowns, valorCredito, taxaAdmin, incc, duracaoConsorcio, taxaLivreRisco, dropdowns) {
        const parcela = calcularParcela(valorCredito, taxaAdmin, duracaoConsorcio);
        let totalParcelas = 0;
        let ganhoAplicacoes = 0;
        let ganhoAgio = 0;
        let saldoAplicado = valorCredito;

        const analiseDetalhada = fluxoComDropdowns.map((item, index) => {
            const parcelaMes = item.saldoDevedor > 0 ? parcela : 0;
            totalParcelas += parcelaMes;

            const rendimentoMes = saldoAplicado * taxaLivreRisco;
            ganhoAplicacoes += rendimentoMes;

            const dropdown = dropdowns.find(d => d.mes === item.mes);
            if (dropdown) {
                ganhoAgio += dropdown.valor * (dropdown.agio / 100);
                saldoAplicado -= dropdown.valor;
            }

            return {
                mes: item.mes,
                saldoDevedor: item.saldoDevedor,
                parcela: parcelaMes,
                rendimento: rendimentoMes,
                fluxoCaixa: rendimentoMes - parcelaMes,
                saldoAplicado: saldoAplicado
            };
        });

        const resultadoLiquido = ganhoAplicacoes + ganhoAgio - totalParcelas;
        const percentualLucro = (resultadoLiquido / valorCredito) * 100;

        return {
            analiseDetalhada,
            resumo: {
                totalCaptado: valorCredito,
                totalPago: totalParcelas,
                ganhoAplicacoes,
                ganhoAgio,
                resultadoLiquido,
                percentualLucro
            }
        };
    }

    function exibirAnaliseTeseDinheiroBarato(analise) {
        console.log("Análise Detalhada da Tese 'Dinheiro Barato':");
        console.log("Resumo:");
        console.log(`Total Captado: ${formatarMoeda(analise.resumo.totalCaptado)}`);
        console.log(`Total Pago: ${formatarMoeda(analise.resumo.totalPago)}`);
        console.log(`Ganho com Aplicações: ${formatarMoeda(analise.resumo.ganhoAplicacoes)}`);
        console.log(`Ganho com Ágio: ${formatarMoeda(analise.resumo.ganhoAgio)}`);
        console.log(`Resultado Líquido: ${formatarMoeda(analise.resumo.resultadoLiquido)}`);
        console.log(`Percentual de Lucro: ${analise.resumo.percentualLucro.toFixed(2)}%`);
        
        const divAnaliseDinheiroBarato = document.getElementById('analiseDinheiroBarato');
        if (divAnaliseDinheiroBarato) {
            divAnaliseDinheiroBarato.innerHTML = `
                <h3>Análise da Tese "Dinheiro Barato"</h3>
                <p>Total Captado: ${formatarMoeda(analise.resumo.totalCaptado)}</p>
                <p>Total Pago: ${formatarMoeda(analise.resumo.totalPago)}</p>
                <p>Ganho com Aplicações: ${formatarMoeda(analise.resumo.ganhoAplicacoes)}</p>
                <p>Ganho com Ágio: ${formatarMoeda(analise.resumo.ganhoAgio)}</p>
                <p>Resultado Líquido: ${formatarMoeda(analise.resumo.resultadoLiquido)}</p>
                <p>Percentual de Lucro: ${analise.resumo.percentualLucro.toFixed(2)}%</p>
            `;
        }
    }

    // Expor funções globalmente
    window.inicializarConsorcio = inicializarConsorcio;
    window.calcularConsorcio = calcularConsorcio;
    window.mostrarGraficoConsorcio = mostrarGraficoConsorcio;
})();
