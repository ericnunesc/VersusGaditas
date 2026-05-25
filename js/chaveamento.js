// ==================== SISTEMA DE CHAVEAMENTO ====================

window.torneioAtual = {
    id: null,
    nome: "",
    data: new Date().toISOString().split('T')[0],
    competicaoAtiva: false,
    nomeCompeticao: "",
    categorias: [],
    pontuacaoEquipes: new Map(),
    rodadaAtual: 1
};

function toast(msg, tipo = 'info') {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
    else console.log(`[${tipo}] ${msg}`);
}

function embaralharArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function ehPotenciaDe2(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

function maiorPotenciaDe2AbaixoOuIgual(n) {
    return 2 ** Math.floor(Math.log2(n));
}

// ==================== GERAR CHAVEAMENTO ====================

function gerarChaveamentoCategoria(nomeCategoria, atletas, tipoChaveamento = 'eliminatoria') {
    if (!atletas || atletas.length === 0) {
        toast('Nenhum atleta nesta categoria!', 'erro');
        return null;
    }

    atletas = atletas.map((a, idx) => ({
        ...a,
        id: a.id ? Number(a.id) : (Date.now() + idx)
    }));

    const chave = `${nomeCategoria}_${Date.now()}`;
    const atletasEmbaralhados = embaralharArray(atletas);

    let lutas = [];
    let diretosProximaRodada = [];
    let temPreliminar = false;

    if (tipoChaveamento === 'eliminatoria') {
        const estrutura = gerarEliminatoria(atletasEmbaralhados, 1);
        lutas = estrutura.lutas;
        diretosProximaRodada = estrutura.diretosProximaRodada;
        temPreliminar = estrutura.temPreliminar;
    } else {
        lutas = gerarRoundRobin(atletasEmbaralhados, 1);
    }

    return {
        chave,
        nome: nomeCategoria,
        atletas: atletasEmbaralhados,
        lutas,
        rodadaAtual: 1,
        rodadaTotal: calcularRodadas(atletasEmbaralhados.length),
        campeao: null,
        area: (window.areasLuta && window.areasLuta[0]) ? window.areasLuta[0] : "Tatame 1",
        status: "em_andamento",
        diretosProximaRodada,
        temPreliminar
    };
}

// ==================== ELIMINATÓRIA COM PRELIMINAR ====================
// 5 -> 1 preliminar + 3 diretos
// 17 -> 1 preliminar + 15 diretos
function gerarEliminatoria(atletas, startId = 1) {
    const lutas = [];
    let lutaId = startId;
    const n = atletas.length;

    if (n <= 1) {
        return { lutas: [], diretosProximaRodada: [], temPreliminar: false };
    }

    if (ehPotenciaDe2(n)) {
        for (let i = 0; i < n; i += 2) {
            lutas.push({
                id: lutaId++,
                atletaA: atletas[i],
                atletaB: atletas[i + 1],
                vencedor: null,
                rodada: 1,
                status: 'pendente',
                finalizada: false,
                pontos: { A: 0, B: 0 },
                motivo: null,
                temBye: false,
                horaInicio: null,
                horaFim: null,
                duracaoReal: null,
                horarioOriginal: null,
                horarioRecalculado: null
            });
        }
        return { lutas, diretosProximaRodada: [], temPreliminar: false };
    }

    const base = maiorPotenciaDe2AbaixoOuIgual(n);
    const extras = n - base;
    const qtdPreliminar = extras * 2;

    const grupoPreliminar = atletas.slice(0, qtdPreliminar);
    const diretos = atletas.slice(qtdPreliminar);

    for (let i = 0; i < grupoPreliminar.length; i += 2) {
        lutas.push({
            id: lutaId++,
            atletaA: grupoPreliminar[i],
            atletaB: grupoPreliminar[i + 1],
            vencedor: null,
            rodada: 1,
            status: 'pendente',
            finalizada: false,
            pontos: { A: 0, B: 0 },
            motivo: null,
            temBye: false,
            horaInicio: null,
            horaFim: null,
            duracaoReal: null,
            horarioOriginal: null,
            horarioRecalculado: null
        });
    }

    return {
        lutas,
        diretosProximaRodada: diretos,
        temPreliminar: true
    };
}

function gerarRoundRobin(atletas, startId = 1) {
    const lutas = [];
    let lutaId = startId;

    for (let i = 0; i < atletas.length; i++) {
        for (let j = i + 1; j < atletas.length; j++) {
            lutas.push({
                id: lutaId++,
                atletaA: atletas[i],
                atletaB: atletas[j],
                vencedor: null,
                rodada: 1,
                status: 'pendente',
                finalizada: false,
                pontos: { A: 0, B: 0 },
                motivo: null,
                temBye: false,
                horaInicio: null,
                horaFim: null,
                duracaoReal: null,
                horarioOriginal: null,
                horarioRecalculado: null
            });
        }
    }
    return lutas;
}

function calcularRodadas(numAtletas) {
    if (numAtletas <= 1) return 1;
    return Math.ceil(Math.log2(numAtletas));
}

// ==================== RESULTADO E PLACAR ====================

function registrarResultadoLuta(chaveCategoria, lutaId, vencedorId, pontoA = 0, pontoB = 0) {
    const categoria = window.torneioAtual.categorias.find(c => c.chave === chaveCategoria);
    if (!categoria) return toast('Categoria não encontrada!', 'erro'), false;

    const luta = categoria.lutas.find(l => Number(l.id) === Number(lutaId));
    if (!luta) return toast('Luta não encontrada!', 'erro'), false;

    let vencedor = null;
    if (Number(luta.atletaA.id) === Number(vencedorId)) vencedor = luta.atletaA;
    else if (luta.atletaB && Number(luta.atletaB.id) === Number(vencedorId)) vencedor = luta.atletaB;

    if (!vencedor) return toast('Vencedor inválido!', 'erro'), false;
    if (Number(vencedor.id) < 0) return toast('BYE não pode vencer!', 'erro'), false;

    if (!confirm(`Confirmar vitória de ${vencedor.nome}?`)) return false;

    luta.vencedor = vencedor;
    luta.status = 'finalizada';
    luta.finalizada = true;
    luta.pontos.A = Number(pontoA) || 0;
    luta.pontos.B = Number(pontoB) || 0;
    luta.horaFim = new Date().toISOString();

    if (vencedor.academia && vencedor.academia !== '---') {
        const atual = window.torneioAtual.pontuacaoEquipes.get(vencedor.academia) || 0;
        window.torneioAtual.pontuacaoEquipes.set(vencedor.academia, atual + 1);
    }

    salvarEstadoTorneio();
    if (typeof sincronizarLutaFinalizada === 'function') sincronizarLutaFinalizada(chaveCategoria, lutaId, vencedorId);

    toast(`✅ ${vencedor.nome} venceu!`, 'sucesso');
    renderizarChaveamento();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    return true;
}

function abrirModalPlacar(chaveCategoria, lutaId) {
    const categoria = window.torneioAtual.categorias.find(c => c.chave === chaveCategoria);
    if (!categoria) return toast('Categoria não encontrada!', 'erro');

    const luta = categoria.lutas.find(l => Number(l.id) === Number(lutaId));
    if (!luta) return toast('Luta não encontrada!', 'erro');
    if (luta.finalizada) return toast('Luta já finalizada.', 'erro');

    const pA = Number(prompt(`Pontos de ${luta.atletaA.nome}:`, String(luta.pontos?.A ?? 0)));
    if (Number.isNaN(pA) || pA < 0) return toast('Pontos inválidos para atleta A.', 'erro');

    const pB = Number(prompt(`Pontos de ${luta.atletaB.nome}:`, String(luta.pontos?.B ?? 0)));
    if (Number.isNaN(pB) || pB < 0) return toast('Pontos inválidos para atleta B.', 'erro');

    if (pA === pB) return toast('Empate não permitido.', 'erro');

    const vencedorId = pA > pB ? luta.atletaA.id : luta.atletaB.id;
    registrarResultadoLuta(chaveCategoria, lutaId, vencedorId, pA, pB);
}

// ==================== AVANÇAR RODADA ====================

function avancarRodadaCategoria(chaveCategoria) {
    const categoria = window.torneioAtual.categorias.find(c => c.chave === chaveCategoria);
    if (!categoria) return toast('Categoria não encontrada!', 'erro');

    const lutasRodadaAtual = categoria.lutas.filter(l => Number(l.rodada) === Number(categoria.rodadaAtual));
    const faltantes = lutasRodadaAtual.filter(l => !l.finalizada);
    if (faltantes.length > 0) {
        return toast(`Ainda faltam ${faltantes.length} luta(s) para finalizar!`, 'erro');
    }

    let classificados = lutasRodadaAtual
        .map(l => l.vencedor)
        .filter(v => v && Number(v.id) > 0);

    if (Array.isArray(categoria.diretosProximaRodada) && categoria.diretosProximaRodada.length > 0) {
        classificados = classificados.concat(categoria.diretosProximaRodada);
        categoria.diretosProximaRodada = [];
    }

    if (classificados.length === 0) return toast('Nenhum vencedor válido encontrado!', 'erro');

    if (classificados.length === 1) {
        categoria.campeao = classificados[0];

        // Vice-campeão: perdedor da final
        const lutaFinal = lutasRodadaAtual.find(l => l.finalizada && l.vencedor && l.fase !== '3º Lugar');
        if (lutaFinal) {
            const perdedor = Number(lutaFinal.atletaA?.id) === Number(lutaFinal.vencedor?.id)
                ? lutaFinal.atletaB : lutaFinal.atletaA;
            if (perdedor) categoria.vice = perdedor;
        }
        const totalAtletas = categoria.atletas?.length || 0;
        categoria.campeaoWO = totalAtletas <= 1;

        // Se a luta do 3º lugar já está na mesma rodada e finalizada → finaliza direto
        if (categoria.disputaTerceiro) {
            const lutaTerceiro = lutasRodadaAtual.find(l => l.fase === '3º Lugar');
            if (lutaTerceiro && lutaTerceiro.finalizada) {
                const terceiro = lutaTerceiro.vencedor;
                const quarto = Number(lutaTerceiro.atletaA?.id) === Number(terceiro?.id)
                    ? lutaTerceiro.atletaB : lutaTerceiro.atletaA;
                categoria.terceiros = terceiro ? [terceiro] : [];
                categoria.quartos   = quarto   ? [quarto]   : [];
                categoria.status = 'finalizada';
                salvarEstadoTorneio();
                toast(`🏆 ${categoria.campeao.nome} campeão! 🥉 ${terceiro?.nome} em 3º lugar!`, 'sucesso');
                renderizarChaveamento();
                if (typeof atualizarDashboard === 'function') atualizarDashboard();
                return;
            }
            // Luta do 3º ainda pendente — mostra card de disputa
            categoria.status = 'disputa_terceiro';
            salvarEstadoTorneio();
            toast(`🏆 ${categoria.campeao.nome} é campeão! Aguardando disputa do 3º lugar...`, 'sucesso');
            renderizarChaveamento();
            return;
        }

        // Verificar se há perdedores de semifinal (caso não tenha sido gerado antes)
        const perdedoresSemi = _getPerdedoresSemi(categoria);
        const formatoTerceiro = localStorage.getItem('gaditas_formato_terceiro') || 'dois';

        if (perdedoresSemi.length === 2 && formatoTerceiro === 'dois') {
            categoria.terceiros = perdedoresSemi;
        } else if (perdedoresSemi.length === 1) {
            categoria.terceiros = perdedoresSemi;
        }

        categoria.status = 'finalizada';
        salvarEstadoTorneio();
        toast(`🏆 ${categoria.campeao.nome} é o campeão de ${categoria.nome}!`, 'sucesso');
        renderizarChaveamento();
        if (typeof atualizarDashboard === 'function') atualizarDashboard();
        return;
    }

    // Se número ímpar, aplica lógica de preliminar
    if (classificados.length % 2 !== 0) {
        const estrutura = gerarEliminatoria(classificados, Math.max(...categoria.lutas.map(l => Number(l.id))) + 1);
        const novaRodada = Number(categoria.rodadaAtual) + 1;
        for (const l of estrutura.lutas) { l.rodada = novaRodada; categoria.lutas.push(l); }
        categoria.diretosProximaRodada = estrutura.diretosProximaRodada;
        categoria.temPreliminar = estrutura.temPreliminar;
        categoria.rodadaAtual = novaRodada;
        salvarEstadoTorneio();
        toast(`➡️ Rodada ${novaRodada} iniciada com ${classificados.length} atletas!`, 'sucesso');
        renderizarChaveamento();
        return;
    }

    const novaRodada = Number(categoria.rodadaAtual) + 1;
    let novaLutaId = Math.max(...categoria.lutas.map(l => Number(l.id))) + 1;

    for (let i = 0; i < classificados.length; i += 2) {
        categoria.lutas.push({
            id: novaLutaId++,
            atletaA: classificados[i],
            atletaB: classificados[i + 1],
            vencedor: null,
            rodada: novaRodada,
            status: 'pendente',
            finalizada: false,
            pontos: { A: 0, B: 0 },
            motivo: null,
            temBye: false,
            horaInicio: null,
            horaFim: null,
            duracaoReal: null,
            horarioOriginal: null,
            horarioRecalculado: null
        });
    }

    // Se for a rodada das semis (2 lutas → 2 finalistas) e formato = 'um',
    // gerar a luta de 3º lugar na mesma rodada
    const formatoTerceiro = localStorage.getItem('gaditas_formato_terceiro') || 'dois';
    if (classificados.length === 2 && formatoTerceiro === 'um') {
        // Perdedores desta rodada (semis)
        const perdedoresSemis = lutasRodadaAtual
            .map(l => Number(l.atletaA?.id) === Number(l.vencedor?.id) ? l.atletaB : l.atletaA)
            .filter(p => p && Number(p.id) > 0);

        if (perdedoresSemis.length === 2) {
            categoria.lutas.push({
                id: novaLutaId++,
                atletaA: perdedoresSemis[0],
                atletaB: perdedoresSemis[1],
                vencedor: null,
                rodada: novaRodada,
                status: 'pendente',
                finalizada: false,
                pontos: { A: 0, B: 0 },
                motivo: null,
                temBye: false,
                horaInicio: null,
                horaFim: null,
                duracaoReal: null,
                fase: '3º Lugar'
            });
            categoria.disputaTerceiro = true;
            toast(`🥉 Luta pelo 3º lugar gerada: ${perdedoresSemis[0].nome} vs ${perdedoresSemis[1].nome}!`, 'sucesso');
        }
    }

    categoria.rodadaAtual = novaRodada;
    salvarEstadoTorneio();
    if (typeof sincronizarRodadaAvancada === 'function') sincronizarRodadaAvancada(chaveCategoria);

    toast(`➡️ Rodada ${novaRodada} iniciada com ${classificados.length} atletas!`, 'sucesso');
    renderizarChaveamento();
}

// ==================== CICLO COMPETIÇÃO ====================

function iniciarNovaCompeticao(nomeCompeticao, atletasPorCategoria) {
    Object.assign(window.torneioAtual, {
        id: Date.now(),
        nome: nomeCompeticao,
        data: new Date().toISOString().split('T')[0],
        competicaoAtiva: true,
        nomeCompeticao,
        categorias: [],
        pontuacaoEquipes: new Map(),
        rodadaAtual: 1
    });

    for (const [nomeCategoria, atletas] of Object.entries(atletasPorCategoria || {})) {
        if (!atletas || atletas.length === 0) continue;
        const categoria = gerarChaveamentoCategoria(nomeCategoria, atletas, 'eliminatoria');
        if (categoria) window.torneioAtual.categorias.push(categoria);
    }

    salvarEstadoTorneio();
    if (typeof sincronizarCompeticaoIniciada === 'function') sincronizarCompeticaoIniciada(nomeCompeticao);
    toast(`🏆 "${nomeCompeticao}" iniciada com ${window.torneioAtual.categorias.length} categorias!`, 'sucesso');
    return window.torneioAtual;
}

// ==================== AUXILIAR: PERDEDORES DE SEMIFINAL ====================

function _getPerdedoresSemi(categoria) {
    // Semifinais = lutas da rodada anterior à final (penúltima rodada com lutas reais)
    // A final é a rodada onde só havia 2 classificados → rodadaAtual no momento em que o campeão foi definido
    // Ou seja: rodadaDaFinal = rodadaAtual (que acabou de terminar com 1 vencedor)
    // Semifinais = rodadaDaFinal - 1

    const todasRodadas = [...new Set(
        categoria.lutas
            .filter(l => l.finalizada && !l.temBye && l.fase !== '3º Lugar')
            .map(l => Number(l.rodada))
    )].sort((a, b) => a - b);

    if (todasRodadas.length < 2) return []; // precisa de pelo menos 2 rodadas

    const rodadaFinal = todasRodadas[todasRodadas.length - 1];
    const rodadaSemi  = todasRodadas[todasRodadas.length - 2];

    // Verificar se a rodada final tinha exatamente 1 luta (é realmente a final)
    const lutasFinal = categoria.lutas.filter(l =>
        Number(l.rodada) === rodadaFinal && l.finalizada && l.fase !== '3º Lugar'
    );
    if (lutasFinal.length !== 1) return []; // não é uma final limpa

    // Pegar perdedores das semifinais
    const lutasSemi = categoria.lutas.filter(l =>
        Number(l.rodada) === rodadaSemi && l.finalizada && l.vencedor && l.fase !== '3º Lugar'
    );

    const perdedores = [];
    for (const semi of lutasSemi) {
        const perdedor = Number(semi.atletaA?.id) === Number(semi.vencedor?.id)
            ? semi.atletaB : semi.atletaA;
        if (perdedor && Number(perdedor.id) > 0 &&
            !perdedores.find(p => Number(p.id) === Number(perdedor.id)))
            perdedores.push(perdedor);
    }
    return perdedores;
}

// ==================== FINALIZAR COMPETIÇÃO ====================

function finalizarCompeticao() {
    const torneio = window.torneioAtual;
    if (!torneio.competicaoAtiva) return toast('Nenhuma competição ativa!', 'erro');
    if (!confirm(`Finalizar "${torneio.nomeCompeticao}"?`)) return;

    // Pontuação por categoria (decide campeã da etapa)
    const PTS = [5, 3, 1, 1]; // 1º, 2º, 3º, 4º+
    const PTS_WO_EQUIPE = 3;

    // Pontuação anual de equipes por colocação na etapa
    const PTS_ANUAL_EQUIPE = [100, 70, 50, 35, 25, 15, 10, 8, 6, 4];

    const ptsPorEquipe = new Map();
    const ptsPorAtleta = new Map();
    const resultadosCategorias = [];

    function addPtsEquipe(academia, pts) {
        if (!academia || academia === '---') return;
        ptsPorEquipe.set(academia, (ptsPorEquipe.get(academia) || 0) + pts);
    }
    function addPtsAtleta(atleta, pts) {
        if (!atleta) return;
        const atual = ptsPorAtleta.get(String(atleta.id)) || { nome: atleta.nome, academia: atleta.academia, pontos: 0 };
        atual.pontos += pts;
        ptsPorAtleta.set(String(atleta.id), atual);
    }

    for (const cat of torneio.categorias) {
        if (!cat.campeao) continue;
        const classificacao = [];
        classificacao.push({ atleta: cat.campeao, pos: 1, wo: !!cat.campeaoWO });
        if (cat.vice) classificacao.push({ atleta: cat.vice, pos: 2, wo: false });
        if (cat.terceiros && cat.terceiros.length > 0)
            for (const t of cat.terceiros) classificacao.push({ atleta: t, pos: 3, wo: false });
        if (cat.quartos && cat.quartos.length > 0)
            for (const q of cat.quartos) classificacao.push({ atleta: q, pos: 4, wo: false });

        const resultCat = { nome: cat.nome, classificacao: [] };
        for (const { atleta, pos, wo } of classificacao) {
            const idx = pos - 1;
            const ptsAtl = PTS[idx] || 0;
            const ptsEq  = wo ? PTS_WO_EQUIPE : (PTS[idx] || 0);
            addPtsAtleta(atleta, ptsAtl);
            addPtsEquipe(atleta.academia, ptsEq);
            resultCat.classificacao.push({ pos, nome: atleta.nome, academia: atleta.academia, ptsAtleta: ptsAtl, ptsEquipe: ptsEq, wo });
        }
        resultadosCategorias.push(resultCat);
    }

    const rankingEquipes = Array.from(ptsPorEquipe.entries())
        .map(([nome, pontos]) => ({ nome, pontos }))
        .sort((a, b) => b.pontos - a.pontos);

    const rankingAtletas = Array.from(ptsPorAtleta.entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.pontos - a.pontos);

    if (!appState.competicoesFinalizadas) appState.competicoesFinalizadas = [];
    appState.competicoesFinalizadas.push({
        id: torneio.id,
        nome: torneio.nomeCompeticao,
        data: torneio.data,
        rankingEquipes,
        rankingAtletas,
        categorias: resultadosCategorias
    });

    // Ranking anual: cada equipe ganha pontos pela sua colocação na etapa
    rankingEquipes.forEach((eq, idx) => {
        const ptsAnual = PTS_ANUAL_EQUIPE[idx] || 0;
        if (ptsAnual > 0)
            appState.rankingAnual.set(eq.nome, (appState.rankingAnual.get(eq.nome) || 0) + ptsAnual);
    });

    if (!appState.rankingAnualAtletas) appState.rankingAnualAtletas = new Map();
    for (const [id, v] of ptsPorAtleta.entries()) {
        const atual = appState.rankingAnualAtletas.get(id) || { nome: v.nome, academia: v.academia, pontos: 0 };
        atual.pontos += v.pontos;
        appState.rankingAnualAtletas.set(id, atual);
    }

    torneio.competicaoAtiva = false;
    salvarEstadoTorneio();
    if (typeof salvarDados === 'function') salvarDados();
    if (typeof sincronizarCompeticaoFinalizada === 'function') sincronizarCompeticaoFinalizada();
    if (typeof mostrarResultadoEtapa === 'function') mostrarResultadoEtapa(rankingEquipes, torneio.nomeCompeticao);

    const campeaEtapa = rankingEquipes[0];
    toast(`✅ Competição finalizada! ${campeaEtapa ? `🏆 ${campeaEtapa.nome} é campeã da etapa!` : ''}`, 'sucesso');
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    if (typeof atualizarRankingFull === 'function') atualizarRankingFull();
    renderizarChaveamento();
}


// ==================== PERSISTÊNCIA ====================

function salvarEstadoTorneio() {
    const t = window.torneioAtual;
    const estado = {
        id: t.id,
        nome: t.nome,
        data: t.data,
        competicaoAtiva: t.competicaoAtiva,
        nomeCompeticao: t.nomeCompeticao,
        categorias: t.categorias,
        pontuacaoEquipes: Array.from(t.pontuacaoEquipes.entries()),
        rodadaAtual: t.rodadaAtual
    };
    localStorage.setItem('gaditas_torneio_atual', JSON.stringify(estado));
}

function carregarEstadoSalvo() {
    const raw = localStorage.getItem('gaditas_torneio_atual');
    if (!raw) return;

    const estado = JSON.parse(raw);
    Object.assign(window.torneioAtual, {
        id: estado.id || null,
        nome: estado.nome || "",
        data: estado.data || new Date().toISOString().split('T')[0],
        competicaoAtiva: !!estado.competicaoAtiva,
        nomeCompeticao: estado.nomeCompeticao || "",
        categorias: estado.categorias || [],
        pontuacaoEquipes: new Map(estado.pontuacaoEquipes || []),
        rodadaAtual: estado.rodadaAtual || 1
    });

    for (const cat of window.torneioAtual.categorias) {
        cat.diretosProximaRodada = Array.isArray(cat.diretosProximaRodada) ? cat.diretosProximaRodada : [];
        cat.temPreliminar = !!cat.temPreliminar;

        for (const l of (cat.lutas || [])) {
            l.id = Number(l.id);
            if (l.atletaA) l.atletaA.id = Number(l.atletaA.id);
            if (l.atletaB) l.atletaB.id = Number(l.atletaB.id);
            if (l.vencedor) l.vencedor.id = Number(l.vencedor.id);
        }
    }
}

// ==================== NOME DA FASE ====================

function getNomeFase(numLutas, cat) {
    if (cat) {
        const rodAtual = Number(cat.rodadaAtual || 1);
        const lutasRod = (cat.lutas || []).filter(l => Number(l.rodada) === rodAtual);
        const temTerceiro = lutasRod.some(l => l.fase === '3º Lugar');
        const lutasNormais = lutasRod.filter(l => l.fase !== '3º Lugar');

        if (temTerceiro && lutasNormais.length === 0) return 'Disputa do 3º Lugar';

        // Detectar preliminar/repescagem: há rodadas posteriores com lutas normais >= lutas atuais
        const nAtual = lutasNormais.length;
        const todasRodadas = [...new Set((cat.lutas||[]).filter(l=>l.fase!=='3º Lugar').map(l=>Number(l.rodada)))].sort((a,b)=>a-b);
        const idxAtual = todasRodadas.indexOf(rodAtual);
        if (idxAtual >= 0 && idxAtual < todasRodadas.length - 1) {
            // Há rodadas posteriores — verificar se a próxima tem >= lutas (indica que é prelim)
            const proxRodada = todasRodadas[idxAtual + 1];
            const lutasProx = (cat.lutas||[]).filter(l=>Number(l.rodada)===proxRodada && l.fase!=='3º Lugar').length;
            if (lutasProx >= nAtual) return 'Repescagem';
        }
        // diretosProximaRodada ainda pendentes (rodada 1 não iniciada ainda)
        if (rodAtual === 1 && Array.isArray(cat.diretosProximaRodada) && cat.diretosProximaRodada.length > 0) {
            return 'Repescagem';
        }

        if (lutasNormais.length === 1) return 'Final';
        numLutas = lutasNormais.length;
    }

    if (numLutas >= 16) return 'Dezesseis Avos';
    if (numLutas >= 8)  return 'Oitavas de Final';
    if (numLutas >= 4)  return 'Quartas de Final';
    if (numLutas >= 2)  return 'Semifinal';
    return 'Final';
}

// ==================== RENDER ====================

function renderizarChaveamento() {
    const container = document.getElementById('chaveamento-container');
    if (!container) return;

    const torneio = window.torneioAtual;

    if (!torneio.competicaoAtiva) {
        container.innerHTML = `
            <div class="empty-state">
                <p style="margin-bottom:16px">Nenhuma competição ativa</p>
                <button onclick="abrirModalNovaCompeticao()" class="btn-primary">➕ Iniciar Competição</button>
            </div>
        `;
        return;
    }

    if (!torneio.categorias || torneio.categorias.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma categoria gerada</div>';
        return;
    }

    let html = `<h3 style="margin-bottom:16px">🏆 ${torneio.nomeCompeticao}</h3>`;

    for (const cat of torneio.categorias) {
        const safeId = cat.chave.replace(/[^a-zA-Z0-9]/g, '_');

        // Categoria em disputa de 3º lugar — final pode estar pendente ou finalizada
        if (cat.campeao && cat.status === 'disputa_terceiro') {
            const lutaTerceiro = cat.lutas.find(l => l.fase === '3º Lugar' && Number(l.rodada) === Number(cat.rodadaAtual));
            const woTag = cat.campeaoWO ? ' <span style="font-size:0.65rem;color:#F59E0B;background:#FEF3C7;padding:1px 6px;border-radius:8px">W.O.</span>' : '';
            const podeAvancar = lutaTerceiro && lutaTerceiro.finalizada;
            html += `
                <div class="categoria-chave" id="cat-${safeId}">
                    <div class="categoria-header">
                        <h4>🏅 ${cat.nome}</h4>
                        <span class="area-badge" style="background:#FEF3C7;color:#92400E">🥉 DISPUTA 3º LUGAR</span>
                    </div>
                    <div class="categoria-finalizada" style="margin-bottom:12px">
                        <div class="campeao-info" style="font-size:0.9rem">🥇 ${cat.campeao.nome}${woTag}</div>
                        <p style="color:#8A9CB0;font-size:0.75rem">${cat.campeao.academia||''}</p>
                        ${cat.vice ? `<div style="margin-top:6px;font-size:0.82rem;color:#C9A03D">🥈 ${cat.vice.nome} <span style="color:#8A9CB0;font-size:0.72rem">${cat.vice.academia||''}</span></div>` : ''}
                    </div>
                    ${lutaTerceiro ? `
                    <div style="padding:8px 0;border-top:1px solid #E2E8F0">
                        <p style="font-size:0.75rem;color:#8A9CB0;margin-bottom:8px;text-align:center">⚔️ Luta pelo 3º Lugar</p>
                        <div class="lutas-container">${renderLuta(lutaTerceiro, cat.chave)}</div>
                    </div>` : ''}
                </div>
            `;
            continue;
        }

        // Categoria totalmente finalizada
        if (cat.campeao && cat.status === 'finalizada') {
            const terceirosHtml = cat.terceiros && cat.terceiros.length > 0
                ? cat.terceiros.map(t => `<div style="margin-top:6px;font-size:0.82rem;color:#8A9CB0">🥉 ${t.nome} <span style="font-size:0.72rem">${t.academia||''}</span></div>`).join('')
                : '';
            const quartoHtml = cat.quartos && cat.quartos.length > 0
                ? cat.quartos.map(q => `<div style="margin-top:4px;font-size:0.78rem;color:#8A9CB0">4º ${q.nome} <span style="font-size:0.7rem">${q.academia||''}</span></div>`).join('')
                : '';
            const woTag = cat.campeaoWO ? ' <span style="font-size:0.65rem;color:#F59E0B;background:#FEF3C7;padding:1px 6px;border-radius:8px">W.O.</span>' : '';
            html += `
                <div class="categoria-chave" id="cat-${safeId}">
                    <div class="categoria-header">
                        <h4>🏅 ${cat.nome}</h4>
                        <span class="area-badge">✅ FINALIZADA</span>
                    </div>
                    <div class="categoria-finalizada">
                        <div class="campeao-info">🥇 ${cat.campeao.nome}${woTag}</div>
                        <p style="color:#8A9CB0;font-size:0.8rem">${cat.campeao.academia||''}</p>
                        ${cat.vice ? `<div style="margin-top:8px;font-size:0.85rem;color:#C9A03D">🥈 ${cat.vice.nome} <span style="color:#8A9CB0;font-size:0.75rem">${cat.vice.academia||''}</span></div>` : ''}
                        ${terceirosHtml}
                        ${quartoHtml}
                    </div>
                </div>
            `;
            continue;
        }

        // Fallback: categoria com campeão mas sem status definido (compatibilidade)
        if (cat.campeao) {
            const terceirosHtml = cat.terceiros && cat.terceiros.length > 0
                ? cat.terceiros.map(t => `<div style="margin-top:6px;font-size:0.82rem;color:#8A9CB0">🥉 ${t.nome} <span style="font-size:0.72rem">${t.academia||''}</span></div>`).join('')
                : '';
            const woTag = cat.campeaoWO ? ' <span style="font-size:0.65rem;color:#F59E0B;background:#FEF3C7;padding:1px 6px;border-radius:8px">W.O.</span>' : '';
            html += `
                <div class="categoria-chave" id="cat-${safeId}">
                    <div class="categoria-header"><h4>🏅 ${cat.nome}</h4><span class="area-badge">✅ FINALIZADA</span></div>
                    <div class="categoria-finalizada">
                        <div class="campeao-info">🥇 ${cat.campeao.nome}${woTag}</div>
                        <p style="color:#8A9CB0;font-size:0.8rem">${cat.campeao.academia||''}</p>
                        ${cat.vice ? `<div style="margin-top:8px;font-size:0.85rem;color:#C9A03D">🥈 ${cat.vice.nome} <span style="color:#8A9CB0;font-size:0.75rem">${cat.vice.academia||''}</span></div>` : ''}
                        ${terceirosHtml}
                    </div>
                </div>`;
            continue;
        }

        const lutasRodada = cat.lutas.filter(l => Number(l.rodada) === Number(cat.rodadaAtual));
        const lutasNormais = lutasRodada.filter(l => l.fase !== '3º Lugar');
        const lutaTerceiroPendente = lutasRodada.find(l => l.fase === '3º Lugar');
        const finalizadas = lutasRodada.filter(l => l.finalizada).length;
        const total = lutasRodada.length;
        const podeAvancar = total > 0 && finalizadas === total;
        const nomeFase = getNomeFase(lutasNormais.length, cat);

        html += `
            <div class="categoria-chave" id="cat-${safeId}">
                <div class="categoria-header">
                    <h4>🏅 ${cat.nome}</h4>
                    <span class="area-badge">📍 ${cat.area || 'Tatame 1'}</span>
                    <span style="font-size:0.75rem;color:#C9A03D;font-weight:600">${nomeFase}</span>
                    <span style="font-size:0.75rem;color:#8A9CB0">👥 ${cat.atletas?.length || 0} atletas</span>
                    <span style="font-size:0.75rem;color:${podeAvancar ? '#10B981' : '#8A9CB0'}">✅ ${finalizadas}/${total}</span>
                </div>
                <div class="lutas-container" id="lutas-${safeId}">
                    ${lutaTerceiroPendente ? `
                        <div style="margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #E2E8F0">
                            <p style="font-size:0.75rem;color:#8A9CB0;margin-bottom:6px;text-align:center">⚔️ Disputa pelo 3º Lugar</p>
                            ${renderLuta(lutaTerceiroPendente, cat.chave)}
                        </div>` : ''}
                    ${lutasNormais.map(l => renderLuta(l, cat.chave)).join('')}
                </div>
                <div style="padding:8px 12px;font-size:0.75rem;color:#8A9CB0;text-align:center">
                    📱 Gerencie as lutas pelo ADM Placar · ✏️ Corrija resultados pelo ADM Chaveamento
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function renderLuta(luta, chaveCategoria) {
    const statusClass = luta.finalizada ? 'status-finalizada' : 'status-pendente';
    const statusText = luta.finalizada ? '✅ Finalizada' : '⏳ Pendente';

    const atletaAVenceu = luta.vencedor && Number(luta.vencedor.id) === Number(luta.atletaA?.id);
    const atletaBVenceu = luta.vencedor && Number(luta.vencedor.id) === Number(luta.atletaB?.id);

    // Index só exibe — não declara vencedor nem inicia luta
    const infoBtn = !luta.finalizada
        ? `<div style="font-size:0.72rem;color:#8A9CB0;margin-top:6px;text-align:center">📱 Use o ADM Placar para pontuar</div>`
        : '';

    return `
        <div class="luta-card" data-luta-id="${luta.id}">
            <div class="luta-header">
                <span class="luta-status ${statusClass}">${statusText}</span>
                <span style="font-size:0.7rem;color:#8A9CB0">Rodada ${luta.rodada}${luta.fase === '3º Lugar' ? ' · 3º Lugar' : ''}</span>
            </div>
            <div class="luta-atletas">
                <div class="luta-atleta ${atletaAVenceu ? 'vencedor' : ''}">
                    <div class="atleta-nome">${luta.atletaA?.nome || '??'}</div>
                    <div class="atleta-academia">${luta.atletaA?.academia || ''}</div>
                </div>
                <div class="luta-vs">VS</div>
                <div class="luta-atleta ${atletaBVenceu ? 'vencedor' : ''}">
                    <div class="atleta-nome">${luta.atletaB?.nome || '??'}</div>
                    <div class="atleta-academia">${luta.atletaB?.academia || ''}</div>
                </div>
            </div>
            ${infoBtn}
        </div>
    `;
}

// ==================== GERAR CHAVEAMENTO ====================

function gerarChaveamento() {
    const torneio = window.torneioAtual;
    if (!torneio.competicaoAtiva) {
        toast('Inicie uma competição primeiro!', 'erro');
        return;
    }

    const atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    if (atletas.length < 2) {
        toast('Cadastre pelo menos 2 atletas!', 'erro');
        return;
    }

    // Agrupar por categoria (sexo + idade + faixa + peso)
    const grupos = new Map();
    for (const atleta of atletas) {
        if (typeof calcularIdade !== 'function') continue;
        const idade = calcularIdade(atleta.dataNascimento);
        const catIdade = determinarCategoriaIdade(idade);
        const catPeso = determinarCategoriaPeso(atleta.sexo, idade, atleta.peso, atleta.faixa);
        if (typeof faixaPermitida === 'function' && !faixaPermitida(atleta.faixa, catIdade)) continue;
        const chave = `${atleta.sexo}_${catIdade.nome}_${atleta.faixa}_${catPeso.nome}`;
        const nome = `${atleta.sexo === 'M' ? 'Masculino' : 'Feminino'} | ${catIdade.nome} | ${atleta.faixa} | ${catPeso.nome}`;
        if (!grupos.has(chave)) grupos.set(chave, { atletas: [], nome, chave });
        grupos.get(chave).atletas.push(atleta);
    }

    if (grupos.size === 0) { toast('Nenhuma categoria válida encontrada!', 'erro'); return; }

    // Reinicia categorias mantendo a competição ativa
    torneio.categorias = [];
    const areas = window.areasLuta || ['Tatame 1', 'Tatame 2', 'Tatame 3'];
    let areaIdx = 0;

    // --- Categorias normais ---
    const atletasPorCategoria = {};
    grupos.forEach((grupo) => { atletasPorCategoria[grupo.nome] = grupo.atletas; });

    for (const [nomeCategoria, atletasCat] of Object.entries(atletasPorCategoria)) {
        if (!atletasCat || atletasCat.length === 0) continue;
        const categoria = gerarChaveamentoCategoria(nomeCategoria, atletasCat, 'eliminatoria');
        if (categoria) {
            categoria.area = areas[areaIdx % areas.length];
            areaIdx++;
            torneio.categorias.push(categoria);
        }
    }

    // --- Categorias Absoluto (agrupadas por Sexo + Faixa, ignorando peso) ---
    const gruposAbs = new Map();
    for (const atleta of atletas) {
        if (!atleta.absoluto) continue;
        const chaveAbs = `ABS_${atleta.sexo}_${atleta.faixa}`;
        const nomeAbs  = `🏆 ABSOLUTO | ${atleta.sexo === 'M' ? 'Masculino' : 'Feminino'} | ${atleta.faixa}`;
        if (!gruposAbs.has(chaveAbs)) gruposAbs.set(chaveAbs, { atletas: [], nome: nomeAbs });
        gruposAbs.get(chaveAbs).atletas.push(atleta);
    }
    let absGerados = 0;
    gruposAbs.forEach((grupo) => {
        if (grupo.atletas.length < 2) return;
        const cat = gerarChaveamentoCategoria(grupo.nome, grupo.atletas, 'eliminatoria');
        if (cat) {
            cat.area = areas[areaIdx % areas.length];
            cat.isAbsoluto = true;
            areaIdx++;
            torneio.categorias.push(cat);
            absGerados++;
        }
    });

    salvarEstadoTorneio();
    renderizarChaveamento();
    const msgAbs = absGerados > 0 ? ` + ${absGerados} absoluto(s)` : '';
    toast(`✅ Chaveamento gerado: ${torneio.categorias.length - absGerados} categoria(s)${msgAbs}!`, 'sucesso');
}

// ==================== GERAR SÓ O ABSOLUTO (após competição iniciada) ====================

function gerarAbsoluto() {
    const torneio = window.torneioAtual;
    if (!torneio.competicaoAtiva) { toast('Inicie uma competição primeiro!', 'erro'); return; }

    const atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    const areas   = window.areasLuta || ['Tatame 1', 'Tatame 2', 'Tatame 3'];

    // Remove absolutos anteriores para re-gerar sem duplicar
    torneio.categorias = torneio.categorias.filter(c => !c.isAbsoluto);
    let areaIdx = torneio.categorias.length;

    const gruposAbs = new Map();
    for (const atleta of atletas) {
        if (!atleta.absoluto) continue;
        const chave = `ABS_${atleta.sexo}_${atleta.faixa}`;
        const nome  = `🏆 ABSOLUTO | ${atleta.sexo === 'M' ? 'Masculino' : 'Feminino'} | ${atleta.faixa}`;
        if (!gruposAbs.has(chave)) gruposAbs.set(chave, { atletas: [], nome });
        gruposAbs.get(chave).atletas.push(atleta);
    }

    if (gruposAbs.size === 0) { toast('Nenhum atleta inscrito no Absoluto!', 'erro'); return; }

    let gerados = 0;
    let ignorados = 0;
    gruposAbs.forEach((grupo) => {
        if (grupo.atletas.length < 2) { ignorados++; return; }
        const cat = gerarChaveamentoCategoria(grupo.nome, grupo.atletas, 'eliminatoria');
        if (cat) {
            cat.area = areas[areaIdx % areas.length];
            cat.isAbsoluto = true;
            areaIdx++;
            torneio.categorias.push(cat);
            gerados++;
        }
    });

    salvarEstadoTorneio();
    renderizarChaveamento();
    if (gerados === 0) {
        toast(`⚠️ Nenhum Absoluto gerado — é preciso mínimo 2 atletas por faixa/sexo.`, 'aviso');
    } else {
        const aviso = ignorados > 0 ? ` (${ignorados} grupo(s) com < 2 atletas ignorado(s))` : '';
        toast(`🏆 ${gerados} chave(s) do Absoluto gerada(s)!${aviso}`, 'sucesso');
    }
}
window.gerarAbsoluto = gerarAbsoluto;

// ==================== EXPORTAR ====================

window.gerarChaveamento = gerarChaveamento;
window.gerarChaveamentoCategoria = gerarChaveamentoCategoria;
window.registrarResultadoLuta = registrarResultadoLuta;
window.abrirModalPlacar = abrirModalPlacar;
window.avancarRodadaCategoria = avancarRodadaCategoria;
window.iniciarNovaCompeticao = iniciarNovaCompeticao;
window.finalizarCompeticao = finalizarCompeticao;
window.salvarEstadoTorneio = salvarEstadoTorneio;
window.carregarEstadoSalvo = carregarEstadoSalvo;
window.renderizarChaveamento = renderizarChaveamento;
window.renderLuta = renderLuta;

console.log('✅ chaveamento.js carregado (preliminar + placar)');