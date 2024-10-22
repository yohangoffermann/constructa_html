console.log('Arquivo consorcio.js carregado');

(function() {
    let dropdowns = [];

    function inicializarConsorcio() {
        console.log('Função inicializarConsorcio chamada');
        document.getElementById('adicionarDropdown').addEventListener('click', adicionarDropdown);
        document.getElementById('calcularConsorcio').addEventListener('click', calcularConsorcio);
    }

    function adicionarDropdown() {
        const valor = parseFloat(document.getElementById('valorDropdown').value);
        const agio = parseFloat(document.getElementById('agioDropdown').value);
        const mes = parseInt(document.getElementById('mesDropdown').value);

        dropdowns.push({ valor, agio, mes });
        atualizarListaDropdowns();
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

        const fluxoBase = calcularFluxoConsorcioBase(valorCredito, taxaAdmin, incc, duracaoConsorcio);
        const fluxoComDropdowns = calcularFluxoConsorcioComDropdowns(valorCredito, taxaAdmin, incc, duracaoConsorcio, dropdowns);

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
            saldoDevedor -= parcela;
            fluxo.push({ mes, saldoDevedor: Math.max(saldoDevedor, 0) });
        }

        return fluxo;
    }

    function calcularFluxoConsorcioComDropdowns(valorCredito, taxaAdmin, incc, duracaoConsorcio, dropdowns) {
        let saldoDevedor = valorCredito;
        const fluxo = [];
        const parcela = calcularParcela(valorCredito, taxaAdmin, duracaoConsorcio);

        for (let mes = 1; mes <= duracaoConsorcio; mes++) {
            if (mes % 12 === 1 && mes > 1) {
                saldoDevedor *= (1 + incc / 100);
            }
            saldoDevedor -= parcela;

            const dropdown = dropdowns.find(d => d.mes === mes);
            if (dropdown) {
                const valorEfetivo = dropdown.valor * (1 + dropdown.agio / 100);
                saldoDevedor = Math.max(saldoDevedor - valorEfetivo, 0);
            }

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
            </tr>
            ${fluxoBase.map((item, index) => `
                <tr>
                    <td>${item.mes}</td>
                    <td>${formatarMoeda(item.saldoDevedor)}</td>
                    <td>${formatarMoeda(fluxoComDropdowns[index].saldoDevedor)}</td>
                </tr>
            `).join('')}
        `;
    }

    // Exponha a função inicializarConsorcio globalmente
    window.inicializarConsorcio = inicializarConsorcio;
})();
