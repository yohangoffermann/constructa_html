
export function atualizarAnalise(fluxo, parametros) {
    const lucro_total = fluxo.reduce((sum, item) => sum + item['Saldo Mensal'], 0);
    const margem = (lucro_total / parametros.vgv) * 100;
    const exposicao_maxima = -Math.min(...fluxo.map(item => item['Saldo Acumulado']));
    
    const mes_payback = fluxo.findIndex(item => item['Saldo Acumulado'] > 0) + 1;
    const valor_payback = mes_payback ? fluxo[mes_payback - 1]['Saldo Acumulado'] : null;

    const metricas = document.getElementById('metricas');
    metricas.innerHTML = `
        <h3>Métricas do Projeto</h3>
        <p>VGV: ${formatarMoeda(parametros.vgv)}</p>
        <p>Custo de Construção: ${formatarMoeda(parametros.vgv * parametros.custo_construcao_percentual / 100)}</p>
        <p>Lucro Total: ${formatarMoeda(lucro_total)}</p>
        <p>Margem: ${margem.toFixed(2)}%</p>
        <p>Exposição Máxima de Caixa: ${formatarMoeda(exposicao_maxima)}</p>
        <p>Mês de Payback: ${mes_payback ? `${mes_payback} (${formatarMoeda(valor_payback)})` : 'Não atingido'}</p>
    `;

    const analiseDetalhada = document.getElementById('analiseDetalhada');
    analiseDetalhada.innerHTML = `
        <h3>Análise Detalhada</h3>
        <p>No modelo auto financiado:</p>
        <ul>
            <li>O incorporador recebe ${formatarMoeda(parametros.vgv * parametros.percentual_lancamento / 100)} no lançamento.</li>
            <li>${formatarMoeda(parametros.vgv * parametros.percentual_baloes / 100)} são recebidos em 3 balões ao longo do projeto.</li>
            <li>${formatarMoeda(parametros.vgv * parametros.percentual_parcelas / 100)} são recebidos em ${parametros.prazo_parcelas} parcelas mensais.</li>
            <li>Os custos de construção são distribuídos da seguinte forma:
                <ul>
                    <li>${parametros.percentual_inicio}% no início da obra</li>
                    <li>${parametros.percentual_meio}% no meio da obra</li>
                    <li>${parametros.percentual_fim}% no final da obra</li>
                </ul>
            </li>
            <li>A exposição máxima de caixa é de ${formatarMoeda(exposicao_maxima)}, o que representa o momento de maior necessidade de capital no projeto.</li>
            <li>O projeto atinge o ponto de equilíbrio (payback) ${mes_payback ? `no mês ${mes_payback}, com um saldo positivo de ${formatarMoeda(valor_payback)}` : 'não é atingido durante o período analisado'}.</li>
            <li>A margem final do projeto é de ${margem.toFixed(2)}%.</li>
        </ul>
    `;
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}
