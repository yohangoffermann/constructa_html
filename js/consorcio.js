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
                            label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
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
