console.log('Arquivo main.js carregado');

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
    console.log('Inicializando formulário');
    const form = document.getElementById('parametrosForm');
    for (const [key, value] of Object.entries(parametros)) {
        const label = document.createElement('label');
        label.htmlFor = key;
        label.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const input = document.createElement('input');
        input.type = 'number';
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
    console.log('Atualizando fluxo de caixa');
    const formData = new FormData(document.getElementById('parametrosForm'));
    for (const [key, value] of formData.entries()) {
        parametros[key] = Number(value);
    }

    const custo_construcao = parametros.vgv * parametros.custo_construcao_percentual / 100;
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

    mostrarGraficos(fluxo);
    atualizarTabelaFluxoCaixa(fluxo);
    atualizarAnalise(fluxo, parametros);
}

function atualizarTabelaFluxoCaixa(fluxo) {
    console.log('Atualizando tabela de fluxo de caixa');
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
                <td>${item.Mês}</td>
                <td>${formatarMoeda(item.Receitas)}</td>
                <td>${formatarMoeda(item.Custos)}</td>
                <td>${formatarMoeda(item['Saldo Mensal'])}</td>
                <td>${formatarMoeda(item['Saldo Acumulado'])}</td>
            </tr>
        `).join('')}
    `;
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado');
    inicializarFormulario();
    atualizarFluxoCaixa();

    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('data-section');
            document.querySelectorAll('main > section').forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });
        });
    });

    // Verifica se a função inicializarConsorcio existe e a chama
    if (typeof window.inicializarConsorcio === 'function') {
        console.log('Chamando inicializarConsorcio');
        window.inicializarConsorcio();
    } else {
        console.warn('A função inicializarConsorcio não foi encontrada. Verifique se o arquivo consorcio.js está sendo carregado corretamente.');
    }
});
