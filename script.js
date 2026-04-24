let veiculos = [];
const usinas = ["Mandu", "São José", "Vertente", "Cruz Alta", "Tanabi"];

// ===== NORMALIZAÇÃO DE STRINGS =====
function normalizarString(str) {
    return String(str)
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function encontrarUsinaCorrespondente(usinaInput) {
    const usinaNormalizada = normalizarString(usinaInput);
    for (let usina of usinas) {
        const usinaNormalizadaRef = normalizarString(usina);
        if (usinaNormalizada === usinaNormalizadaRef) {
            return usina;
        }
    }
    return null;
}

// ===== ARMAZENAMENTO LOCAL =====
function salvarDados() {
    const dados = {
        veiculos: veiculos,
        dataInicio: document.getElementById('dataInicio').value,
        dataFim: document.getElementById('dataFim').value
    };
    localStorage.setItem('hubDados', JSON.stringify(dados));
}

function carregarDados() {
    const dadosSalvos = localStorage.getItem('hubDados');
    if (dadosSalvos) {
        try {
            const dados = JSON.parse(dadosSalvos);
            veiculos = dados.veiculos || [];
            
            if (dados.dataInicio) {
                document.getElementById('dataInicio').value = dados.dataInicio;
            }
            if (dados.dataFim) {
                document.getElementById('dataFim').value = dados.dataFim;
            }
            return true;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return false;
        }
    }
    return false;
}

// ===== INICIALIZAÇÃO DE DATAS =====
function inicializarDatas() {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    if (!document.getElementById('dataInicio').value) {
        document.getElementById('dataInicio').valueAsDate = primeiroDia;
    }
    if (!document.getElementById('dataFim').value) {
        document.getElementById('dataFim').valueAsDate = hoje;
    }
}

// ===== ALERTAS =====
function mostrarAlerta(mensagem, tipo) {
    const container = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${tipo}`;
    alert.innerText = mensagem;
    
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// ===== CRIAR CAIXAS DE USINAS =====
function criarCaixasUsinas() {
    const container = document.getElementById('usinasContainer');
    container.innerHTML = '';

    usinas.forEach(usina => {
        const box = document.createElement('div');
        box.className = 'usina-box';
        box.id = `usina-${usina}`;

        const header = document.createElement('div');
        header.className = 'usina-header';

        const nomeUsina = document.createElement('span');
        nomeUsina.innerText = usina;

        const stats = document.createElement('div');
        stats.className = 'usina-stats';
        stats.id = `stats-${usina}`;

        header.appendChild(nomeUsina);
        header.appendChild(stats);

        const content = document.createElement('div');
        content.className = 'usina-content';
        content.id = `conteudo-${usina}`;

        box.appendChild(header);
        box.appendChild(content);
        container.appendChild(box);
    });
}

// ===== ATUALIZAR CONTADORES DAS USINAS =====
function atualizarContadoresUsinas() {
    usinas.forEach(usina => {
        const statsDiv = document.getElementById(`stats-${usina}`);
        const veiculosDaUsina = veiculos.filter(v => v.usina === usina);
        const feitos = veiculosDaUsina.filter(v => v.status === 'FEITO').length;
        const naoFeitos = veiculosDaUsina.filter(v => v.status === 'NÃO FEITO').length;

        statsDiv.innerHTML = `
            <div class="stat-item">
                <span class="stat-feito">✓ ${feitos}</span>
            </div>
            <div class="stat-item">
                <span class="stat-nao-feito">✗ ${naoFeitos}</span>
            </div>
        `;
    });
}

// ===== RENDERIZAR VEÍCULOS =====
function renderizarVeiculos() {
    usinas.forEach(usina => {
        const conteudo = document.getElementById(`conteudo-${usina}`);
        conteudo.innerHTML = '';

        const veiculosDaUsina = veiculos.filter(v => v.usina === usina);

        if (veiculosDaUsina.length === 0) {
            conteudo.innerHTML = '<div class="empty-message">Nenhum veículo</div>';
            atualizarContadoresUsinas();
            return;
        }

        veiculosDaUsina.forEach(veiculo => {
            const item = document.createElement('div');
            item.className = 'veiculo-item';

            const placa = document.createElement('span');
            placa.className = 'veiculo-placa';
            placa.innerText = veiculo.placa;

            const statusBtn = document.createElement('button');
            statusBtn.className = `status-btn status-${veiculo.status === 'FEITO' ? 'feito' : 'nao-feito'}`;
            statusBtn.innerText = veiculo.status;
            statusBtn.onclick = () => {
                const novoStatus = veiculo.status === 'FEITO' ? 'NÃO FEITO' : 'FEITO';
                alterarStatus(veiculo.id, novoStatus);
            };

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerText = '🗑️';
            deleteBtn.onclick = () => removerVeiculo(veiculo.id);

            item.appendChild(placa);
            item.appendChild(statusBtn);
            item.appendChild(deleteBtn);
            conteudo.appendChild(item);
        });
    });
    atualizarContadoresUsinas();
}

// ===== ADICIONAR VEÍCULO =====
function adicionarVeiculo() {
    const placa = document.getElementById('placaInput').value.trim().toUpperCase();
    const usinaSelecionada = document.getElementById('usinaInput').value;

    if (!placa) {
        mostrarAlerta('Insira uma placa.', 'error');
        return;
    }

    if (!usinaSelecionada) {
        mostrarAlerta('Selecione uma usina.', 'error');
        return;
    }

    const novoVeiculo = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        placa: placa,
        usina: usinaSelecionada,
        status: 'NÃO FEITO'
    };

    veiculos.push(novoVeiculo);
    document.getElementById('placaInput').value = '';
    document.getElementById('usinaInput').value = '';
    
    renderizarVeiculos();
    atualizarCards();
    salvarDados();
    mostrarAlerta(`✓ ${placa} adicionado!`, 'success');
}

// ===== ALTERAR STATUS =====
function alterarStatus(id, novoStatus) {
    const veiculo = veiculos.find(v => v.id === id);
    if (veiculo) {
        veiculo.status = novoStatus;
        renderizarVeiculos();
        atualizarCards();
        salvarDados();
    }
}

// ===== REMOVER VEÍCULO =====
function removerVeiculo(id) {
    const veiculo = veiculos.find(v => v.id === id);
    if (veiculo && confirm(`Tem certeza que deseja remover o veículo ${veiculo.placa}?`)) {
        veiculos = veiculos.filter(v => v.id !== id);
        renderizarVeiculos();
        atualizarCards();
        salvarDados();
        mostrarAlerta(`✓ ${veiculo.placa} removido!`, 'success');
    }
}

// ===== ATUALIZAR CARDS E PROGRESSO =====
function atualizarCards() {
    const total = veiculos.length;
    const feito = veiculos.filter(v => v.status === 'FEITO').length;
    const naoFeito = veiculos.filter(v => v.status === 'NÃO FEITO').length;

    document.getElementById('totalVeiculos').innerText = total;
    document.getElementById('totalFeito').innerText = feito;
    document.getElementById('totalNaoFeito').innerText = naoFeito;
    
    atualizarProgressoCircular(total, feito, naoFeito);
    atualizarContadoresUsinas();
}

function atualizarProgressoCircular(total, feito, naoFeito) {
    const porcentagemFeito = total === 0 ? 0 : (feito / total) * 100;
    const porcentagemNaoFeito = 100 - porcentagemFeito;
    
    const circunferencia = 283; // 2 * PI * 45 ≈ 283
    const progressoFeito = (porcentagemFeito / 100) * circunferencia;
    const progressoNaoFeito = (porcentagemNaoFeito / 100) * circunferencia;

    const progressFeito = document.getElementById('progressFeito');
    const progressNaoFeito = document.getElementById('progressNaoFeito');
    const progressText = document.getElementById('progressPercent');

    if (progressFeito) {
        progressFeito.style.strokeDasharray = `${progressoFeito} ${circunferencia}`;
        progressFeito.style.strokeDashoffset = '0';
    }
    
    if (progressNaoFeito) {
        progressNaoFeito.style.strokeDasharray = `${progressoNaoFeito} ${circunferencia}`;
        progressNaoFeito.style.strokeDashoffset = `-${progressoFeito}`;
    }
    
    if (progressText) {
        progressText.textContent = `${Math.round(porcentagemFeito)}%`;
    }
    
    console.log(`Progresso: ${Math.round(porcentagemFeito)}% (${feito}/${total}`);
}

// ===== IMPORTAR EXCEL =====
function importarExcel() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        mostrarAlerta('Selecione um arquivo Excel.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            let veiculosAdicionados = 0;
            let erros = [];

            jsonData.forEach((row, index) => {
                let placa = null;
                let usina = null;
                let status = 'NÃO FEITO';

                const colunas = Object.keys(row);
                
                for (let coluna of colunas) {
                    const colunaLower = String(coluna).toLowerCase().trim();
                    
                    if (colunaLower.includes('placa')) {
                        placa = row[coluna];
                    }
                    if (colunaLower.includes('unidade') || colunaLower.includes('usina')) {
                        usina = row[coluna];
                    }
                    if (colunaLower.includes('status')) {
                        const statusValor = String(row[coluna]).trim().toUpperCase();
                        // Verificar se contém "NÃO FEITO" ou "NAO FEITO" primeiro
                        if (statusValor.includes('NÃO') || statusValor.includes('NAO')) {
                            status = 'NÃO FEITO';
                        } else if (statusValor.includes('FEITO')) {
                            status = 'FEITO';
                        }
                    }
                }

                if (!placa || !usina) {
                    const colunasValidas = colunas.filter(c => row[c] && String(row[c]).trim());
                    if (colunasValidas.length >= 2) {
                        placa = row[colunasValidas[0]];
                        usina = row[colunasValidas[colunasValidas.length - 1]];
                    }
                }

                if (!placa || !usina) {
                    erros.push(`Linha ${index + 2}: Dados incompletos`);
                    return;
                }

                placa = String(placa).trim().toUpperCase();
                usina = String(usina).trim();

                if (!placa || !usina) {
                    erros.push(`Linha ${index + 2}: Valores vazios`);
                    return;
                }

                const usinaValida = encontrarUsinaCorrespondente(usina);
                if (!usinaValida) {
                    erros.push(`Linha ${index + 2}: Usina "${usina}" não reconhecida`);
                    return;
                }

                const veiculoExistente = veiculos.find(v => v.placa === placa && v.usina === usinaValida);
                if (veiculoExistente) {
                    erros.push(`Linha ${index + 2}: ${placa} já existe`);
                    return;
                }

                const novoVeiculo = {
                    id: Date.now() + Math.random(),
                    placa: placa,
                    usina: usinaValida,
                    status: status
                };

                veiculos.push(novoVeiculo);
                veiculosAdicionados++;
            });

            renderizarVeiculos();
            atualizarCards();
            salvarDados();

            if (veiculosAdicionados > 0) {
                mostrarAlerta(`✓ ${veiculosAdicionados} veículo(s) importado(s)!`, 'success');
            }
            if (erros.length > 0) {
                console.warn('Erros na importação:', erros);
                mostrarAlerta(`⚠ ${erros.length} linha(s) com erro`, 'error');
            }

            fileInput.value = '';
        } catch (error) {
            console.error('Erro ao importar:', error);
            mostrarAlerta(`Erro ao importar: ${error.message}`, 'error');
        }
    };

    reader.readAsArrayBuffer(file);
}

// ===== EXPORTAR EXCEL =====
function formatarData(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function exportarExcel() {
    if (veiculos.length === 0) {
        mostrarAlerta('Nenhum veículo para exportar.', 'error');
        return;
    }

    try {
        let dataInicio = document.getElementById('dataInicio').value;
        let dataFim = document.getElementById('dataFim').value;
        
        if (!dataInicio || !dataFim) {
            mostrarAlerta('Defina as datas de início e fim.', 'error');
            return;
        }
        
        const dataInicioFormatada = formatarData(dataInicio);
        const dataFimFormatada = formatarData(dataFim);

        const dadosExportacao = veiculos.map(v => ({
            'Placa': v.placa,
            'Unidade': v.usina,
            'Status': v.status
        }));

        const worksheet = XLSX.utils.json_to_sheet(dadosExportacao);
        worksheet['!cols'] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 12 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Veículos');

        const nomeArquivo = `HUB Manutenção ${dataInicioFormatada} a ${dataFimFormatada}.xlsx`;
        XLSX.writeFile(workbook, nomeArquivo);
        mostrarAlerta(`✓ ${veiculos.length} veículo(s) exportado(s)!`, 'success');
    } catch (error) {
        console.error('Erro ao exportar:', error);
        mostrarAlerta(`Erro ao exportar: ${error.message}`, 'error');
    }
}

// ===== LIMPAR TUDO =====
function limparTodos() {
    if (confirm('Remover todos os veículos?')) {
        veiculos = [];
        renderizarVeiculos();
        atualizarCards();
        salvarDados();
        mostrarAlerta('✓ Todos removidos!', 'success');
    }
}

// ===== TEMA DARK/LIGHT =====
function alternarTema() {
    const body = document.body;
    const botao = document.querySelector('.theme-toggle');
    
    if (body.classList.contains('dark-mode')) {
        body.classList.remove('dark-mode');
        botao.innerText = '🌙';
        localStorage.setItem('tema', 'light');
    } else {
        body.classList.add('dark-mode');
        botao.innerText = '☀️';
        localStorage.setItem('tema', 'dark');
    }
}

function carregarTema() {
    const temaSalvo = localStorage.getItem('tema');
    const botao = document.querySelector('.theme-toggle');
    
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
        botao.innerText = '☀️';
    } else {
        botao.innerText = '🌙';
    }
}

// ===== INICIALIZAR RODAPÉ =====
function inicializarRodape() {
    const anoAtual = new Date().getFullYear();
    document.getElementById('anoAtual').innerText = anoAtual;
}

// ===== INICIALIZAÇÃO GERAL =====
window.addEventListener('DOMContentLoaded', function() {
    carregarTema();
    const temDadosSalvos = carregarDados();
    
    inicializarDatas();
    criarCaixasUsinas();
    renderizarVeiculos();
    atualizarCards();
    inicializarRodape();
    
    const dataInicioInput = document.getElementById('dataInicio');
    const dataFimInput = document.getElementById('dataFim');
    
    if (dataInicioInput) {
        dataInicioInput.addEventListener('change', salvarDados);
    }
    if (dataFimInput) {
        dataFimInput.addEventListener('change', salvarDados);
    }
});
