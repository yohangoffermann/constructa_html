export function mostrarGraficos(fluxo) {
    const ctx = document.getElementById('fluxoCaixaChart').getContext('2d');
    
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fluxo.map(item => `Mês ${item['Mês']}`),
            datasets: [
                {
                    label: 'Receitas',
                    data: fluxo.map(item => item['Receitas']),
                    borderColor: '#0068c9',
                    backgroundColor: 'rgba(0, 104, 201, 0.1)',
                    fill: true
                },
                {
                    label: 'Custos',
                    data: fluxo.map(item => item['Custos']),
                    borderColor: '#ff2b2b',
                    backgroundColor: 'rgba(255, 43, 43, 0.1)',
                    fill: true
                },
                {
                    label: 'Saldo Acumulado',
                    data: fluxo.map(item => item['Saldo Acumulado']),
                    borderColor: '#29b09d',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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
                        text: 'Valor (R$)'
                    },
                    ticks: {
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
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
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}
