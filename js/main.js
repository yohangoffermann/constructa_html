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
    console.log("Inicializando formulário");
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
    console.log("Atualizando fluxo de caixa");
    const formData = new FormData(document.getElementById('parametrosForm'));
    for (const [key, value] of formData.entries()) {
        parametros[key] = Number(value);
    }

    const custo_construcao = parametros.vgv * parametros.custo_construcao_percentual / 100;
    const fluxo = calcularFluxoAutoFinanciado(
        parametros.v
