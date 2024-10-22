const parametros = {
    vgv: 35.0,
    custo_construcao_percentual: 70,
    prazo_meses: 48,
    percentual_inicio: 30,
    percentual_meio: 40,
    percentual_fim: 30,
    percentual_lancamento: 20,
    percentual_baloes: 30,
    percentual_parcelas: 50,
    prazo_parcelas: 48
};

function inicializarFormulario() {
    console.log("inicializarFormulario chamada");
    const form = document.getElementById('parametrosForm');
    for (const [key, value] of Object.entries(parametros)) {
        const label = document.createElement('label');
        label.htmlFor = key;
        label.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = key;
        input.name = key;
        input.value = value;
        input.step = key.includes('percentual') ? '1' : '0.1';
        input.min = '0';
        input.addEventListener('change', atualizarFluxoCaixa);

        const div = document.createElement('div');
        div.appendChild(label);
        div.appendChild(input);
        form.appendChild(div);
    }
}

function atualizarFluxoCaixa() {
    console.log("atualizarFluxoCaixa chamada");
    const formData = new FormData(document.getElementById('parametrosForm'));
    for (const [key, value] of formData.entries()) {
        parametros[key] = Number(value);
    }

    const custo_construcao = parametros.vgv * parametros.custo_construcao_percentual / 100;
    console.log("Chamando calcularFluxoAutoFinanciado com:", parametros);
    const fluxo = calcularFluxoAutoFinanciado(
        parametros.vgv,
        custo_construcao,
        parametros.prazo_meses,
        parametros.percentual_inicio,
        parametros.percentual_meio,
        parametros.percentual_fim,
        parametros.percentual_lancamento,
        parametros.percentual_baloes,
        parametros.percentual_parcelas,
        parametros.prazo_parcelas
    );

    console.log("Fluxo calculado:", fluxo);
    mostrarGraficos(fluxo);
    atualizarTabelaFluxoCaixa(fluxo);
    atualizarAnalise(fluxo, parametros);
}

function atualizarTabelaFluxoCaixa(fluxo) {
    console.log("atualizarTabelaFluxoCaixa chamada com:", fluxo);
    const tabela = document.getElementById('fluxoCaixaTable');
    tabela.innerHTML = `
        <tr>
            <th>Mês</th>
            <th>Receitas</th>
            <th>Custos</th>
            <th>Saldo Mensal</th>
            <th>Saldo Acumulado</th>
        </tr>
        ${fluxo.map(item => `
            <tr>
                <td>${item.Mês
