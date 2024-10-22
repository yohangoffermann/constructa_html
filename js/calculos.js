function calcularFluxoAutoFinanciado(vgv, custo_construcao, prazo_meses, 
                                     percentual_inicio, percentual_meio, percentual_fim,
                                     percentual_lancamento, percentual_baloes, percentual_parcelas,
                                     prazo_parcelas) {
    const fluxo = [];
    
    const custos = new Array(prazo_meses).fill(0);
    const tercio_obra = Math.floor(prazo_meses / 3);
    for (let i = 0; i < tercio_obra; i++) {
        custos[i] = custo_construcao * percentual_inicio / 100 / tercio_obra;
    }
    for (let i = tercio_obra; i < 2 * tercio_obra; i++) {
        custos[i] = custo_construcao * percentual_meio / 100 / tercio_obra;
    }
    for (let i = 2 * tercio_obra; i < prazo_meses; i++) {
        custos[i] = custo_construcao * percentual_fim / 100 / (prazo_meses - 2 * tercio_obra);
    }
    
    const receitas = new Array(prazo_meses).fill(0);
    receitas[0] += vgv * percentual_lancamento / 100;
    
    const valor_baloes = vgv * percentual_baloes / 100;
    const num_baloes = 3;
    for (let i = 1; i <= num_baloes; i++) {
        const mes_balao = Math.floor(i * prazo_meses / (num_baloes + 1));
        receitas[mes_balao] += valor_baloes / num_baloes;
    }
    
    const valor_parcelas = vgv * percentual_parcelas / 100;
    const parcela_mensal = valor_parcelas / Math.min(prazo_parcelas, prazo_meses);
    for (let i = 0; i < Math.min(prazo_parcelas, prazo_meses); i++) {
        receitas[i] += parcela_mensal;
    }
    
    let saldo_acumulado = 0;
    for (let mes = 0; mes < prazo_meses; mes++) {
        const saldo_mensal = receitas[mes] - custos[mes];
        saldo_acumulado += saldo_mensal;
        fluxo.push({
            'Mês': mes + 1,
            'Receitas': receitas[mes],
            'Custos': custos[mes],
            'Saldo Mensal': saldo_mensal,
            'Saldo Acumulado': saldo_acumulado
        });
    }
    
    return fluxo;
}
