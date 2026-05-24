// ==================== SISTEMA DE RECALCULO DE HORÁRIOS ====================

// Configurações padrão
let horarioInicioCompeticao = localStorage.getItem('gaditas_horario_inicio') || "09:00";
let duracaoPorFaixa = {
    "Branca": 5, "Azul": 6, "Roxa": 7, "Marrom": 8, "Preta": 10
};
// Duração por categoria de idade (infantil) — chave = nome da categoria
let duracaoPorCategoriaIdade = {
    "Pré-Mirim": 2, "Mirim 1": 2, "Mirim 2": 2,
    "Infantil 1": 3, "Infantil 2": 3,
    "Infanto-Juvenil": 4, "Juvenil": 4
};

// Carregar durações salvas
function carregarDuracaoFaixas() {
    const mapFaixa = { Branca: 'branca', Azul: 'azul', Roxa: 'roxa', Marrom: 'marrom', Preta: 'preta' };
    for (const [faixa, key] of Object.entries(mapFaixa)) {
        const salvo = localStorage.getItem('gaditas_duracao_' + key);
        if (salvo) duracaoPorFaixa[faixa] = parseInt(salvo);
    }
    const mapIdade = {
        'Pré-Mirim': 'pre-mirim', 'Mirim 1': 'mirim1', 'Mirim 2': 'mirim2',
        'Infantil 1': 'infantil1', 'Infantil 2': 'infantil2',
        'Infanto-Juvenil': 'infanto-juvenil', 'Juvenil': 'juvenil'
    };
    for (const [cat, key] of Object.entries(mapIdade)) {
        const salvo = localStorage.getItem('gaditas_duracao_' + key);
        if (salvo) duracaoPorCategoriaIdade[cat] = parseInt(salvo);
    }
}

// Obter duração real de uma luta (usar o tempo real se disponível, senão a estimativa)
function getDuracaoRealLuta(luta) {
    if (luta.duracaoReal) return luta.duracaoReal;
    if (!luta || !luta.atletaA) return duracaoPorFaixa["Branca"];

    // Para categorias infantis, usa duração por categoria de idade
    // A categoria fica na chave da luta/categoria ou pode ser calculada pela idade
    const catNome = luta.categoriaIdade || '';
    if (catNome && duracaoPorCategoriaIdade[catNome] !== undefined) {
        return duracaoPorCategoriaIdade[catNome];
    }

    // Tenta detectar pela faixa: faixas infantis (Cinza, Amarela, Laranja, Verde)
    const faixasInfantis = ["Cinza", "Amarela", "Laranja", "Verde"];
    const faixaA = luta.atletaA.faixa || "Branca";
    const faixaB = luta.atletaB?.faixa || "Branca";

    if (faixasInfantis.includes(faixaA) || faixasInfantis.includes(faixaB)) {
        // Calcula pela idade do atleta A para determinar a categoria
        if (luta.atletaA.dataNascimento && typeof calcularIdade === 'function') {
            const idade = calcularIdade(luta.atletaA.dataNascimento);
            if (idade <= 5)  return duracaoPorCategoriaIdade["Pré-Mirim"] || 2;
            if (idade <= 7)  return duracaoPorCategoriaIdade["Mirim 1"]   || 2;
            if (idade <= 9)  return duracaoPorCategoriaIdade["Mirim 2"]   || 2;
            if (idade <= 11) return duracaoPorCategoriaIdade["Infantil 1"]|| 3;
            if (idade <= 13) return duracaoPorCategoriaIdade["Infantil 2"]|| 3;
            if (idade <= 15) return duracaoPorCategoriaIdade["Infanto-Juvenil"] || 4;
            if (idade <= 17) return duracaoPorCategoriaIdade["Juvenil"]   || 4;
        }
        return 3; // fallback infantil
    }

    // Adulto: usa duração por faixa
    const duracaoA = duracaoPorFaixa[faixaA] || 5;
    const duracaoB = duracaoPorFaixa[faixaB] || 5;
    return Math.max(duracaoA, duracaoB);
}

// Registrar duração real de uma luta (chamado quando a luta termina)
function registrarDuracaoReal(luta, duracaoMinutos) {
    luta.duracaoReal = duracaoMinutos;
    // Salvar no localStorage para persistência
    const torneioSalvo = localStorage.getItem('gaditas_torneio_atual');
    if (torneioSalvo) {
        try {
            const estado = JSON.parse(torneioSalvo);
            for (const cat of estado.categorias) {
                for (const l of cat.lutas) {
                    if (l.id === luta.id && cat.chave === luta.chave) {
                        l.duracaoReal = duracaoMinutos;
                        break;
                    }
                }
            }
            localStorage.setItem('gaditas_torneio_atual', JSON.stringify(estado));
        } catch (e) {}
    }
}

// Calcular horário de uma luta baseado nas lutas anteriores da mesma área
function recalcularHorariosPorArea(area, categorias, lutasPorArea) {
    console.log(`🔄 Recalculando horários para área: ${area}`);
    
    // Encontrar todas as lutas desta área em ordem
    const lutasDaArea = [];
    for (const cat of categorias) {
        if (cat.area === area) {
            for (let i = 0; i < cat.lutas.length; i++) {
                const luta = cat.lutas[i];
                if (!luta.finalizada) {
                    lutasDaArea.push({
                        categoria: cat,
                        luta: luta,
                        index: i
                    });
                }
            }
        }
    }
    
    // Recalcular horários baseado nas durações reais das lutas finalizadas
    let minutosAcumulados = 0;
    const [horaInicio, minutoInicio] = horarioInicioCompeticao.split(':').map(Number);
    minutosAcumulados = horaInicio * 60 + minutoInicio;
    
    // Primeiro, somar as durações das lutas finalizadas
    for (const item of lutasDaArea) {
        const luta = item.luta;
        const lutaFinalizada = luta.finalizada;
        
        if (lutaFinalizada) {
            minutosAcumulados += getDuracaoRealLuta(luta);
        } else {
            break; // Parar na primeira luta não finalizada
        }
    }
    
    // Agora atribuir novos horários para as lutas pendentes
    for (const item of lutasDaArea) {
        const luta = item.luta;
        if (!luta.finalizada) {
            const novaHora = Math.floor(minutosAcumulados / 60);
            const novoMinuto = minutosAcumulados % 60;
            luta.horarioRecalculado = `${novaHora.toString().padStart(2, '0')}:${novoMinuto.toString().padStart(2, '0')}`;
            luta.horarioOriginal = luta.horarioOriginal || luta.horarioRecalculado;
            
            console.log(`📅 Luta ${luta.id} - Novo horário: ${luta.horarioRecalculado}`);
            
            minutosAcumulados += getDuracaoRealLuta(luta);
        }
    }
    
    // Salvar estado atualizado
    localStorage.setItem('gaditas_torneio_atual', JSON.stringify({ categorias: categorias, competicaoAtiva: true, nomeCompeticao: localStorage.getItem('gaditas_competicao_nome') }));
    
    // Disparar evento para atualizar a agenda
    localStorage.setItem('gaditas_horarios_atualizados', Date.now().toString());
}

// Função para obter o horário atualizado de uma luta
function getHorarioLuta(luta) {
    return luta.horarioRecalculado || luta.horarioOriginal || null;
}

// Configurar horário de início
function configurarHorarioInicio() {
    const novoHorario = prompt('Horário de início da primeira luta (formato HH:MM):', horarioInicioCompeticao);
    if (novoHorario && /^\d{2}:\d{2}$/.test(novoHorario)) {
        horarioInicioCompeticao = novoHorario;
        localStorage.setItem('gaditas_horario_inicio', horarioInicioCompeticao);
        mostrarToast(`✅ Horário definido: ${horarioInicioCompeticao}`, 'sucesso');
        
        // Recalcular todos os horários
        const torneioSalvo = localStorage.getItem('gaditas_torneio_atual');
        if (torneioSalvo) {
            try {
                const estado = JSON.parse(torneioSalvo);
                const areasUnicas = [...new Set(estado.categorias.map(c => c.area))];
                for (const area of areasUnicas) {
                    recalcularHorariosPorArea(area, estado.categorias, null);
                }
            } catch (e) {}
        }
    }
}

// Exportar funções
window.carregarDuracaoFaixas = carregarDuracaoFaixas;
window.getDuracaoRealLuta = getDuracaoRealLuta;
window.registrarDuracaoReal = registrarDuracaoReal;
window.recalcularHorariosPorArea = recalcularHorariosPorArea;
window.getHorarioLuta = getHorarioLuta;
window.configurarHorarioInicio = configurarHorarioInicio;

carregarDuracaoFaixas();
// ==================== CONFIGURAÇÃO DE ÁREAS ====================
function configurarAreas() {
    const num = parseInt(prompt('Número de áreas (tatames):', areasLuta.length));
    if (num && num > 0) {
        areasLuta = [];
        for (let i = 1; i <= num; i++) areasLuta.push(`Tatame ${i}`);
        window.areasLuta = areasLuta;
        localStorage.setItem('gaditas_areas_luta', JSON.stringify(areasLuta));
        const listaAreas = document.getElementById('lista-areas');
        if (listaAreas) listaAreas.innerHTML = `<div>📋 Áreas: ${areasLuta.join(' | ')}</div>`;
        mostrarToast(`✅ ${num} áreas configuradas: ${areasLuta.join(', ')}`, 'sucesso');
    }
}

function configurarDuracao() {
    const duracao = prompt('Duração padrão por luta (minutos):', '10');
    if (duracao && !isNaN(parseInt(duracao))) {
        localStorage.setItem('gaditas_duracao', parseInt(duracao));
        mostrarToast(`✅ Duração definida: ${duracao} minutos`, 'sucesso');
    }
}

window.configurarAreas = configurarAreas;
window.configurarDuracao = configurarDuracao;
