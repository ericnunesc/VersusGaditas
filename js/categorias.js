// ==================== LÓGICA DE CATEGORIZAÇÃO ====================

function determinarCategoriaIdade(idade) {
    for (const cat of CATEGORIAS_IDADE) {
        if (idade >= cat.idadeMin && idade <= cat.idadeMax) {
            return cat;
        }
    }
    return CATEGORIAS_IDADE[CATEGORIAS_IDADE.length - 1];
}

function determinarCategoriaPeso(sexo, idade, peso, faixa) {
    let categoriasPeso;

    if (idade <= 17) {
        const catIdade = determinarCategoriaIdade(idade);
        categoriasPeso = getTabKids(catIdade.nome, sexo);
    } else {
        categoriasPeso = sexo === 'M' ? CATEGORIAS_PESO_MASC : CATEGORIAS_PESO_FEM;
    }

    for (const cat of categoriasPeso) {
        if (peso <= cat.pesoMax) {
            return cat;
        }
    }
    return categoriasPeso[categoriasPeso.length - 1];
}

function faixaPermitida(faixa, categoriaIdade) {
    const faixaMap = {
        'Branca': 'Branca', 'Azul': 'Azul', 'Roxa': 'Roxa',
        'Marrom': 'Marrom', 'Preta': 'Preta', 'Cinza': 'Cinza',
        'Amarela': 'Amarela', 'Laranja': 'Laranja', 'Verde': 'Verde'
    };
    
    const faixaNormalizada = faixaMap[faixa] || faixa;
    return categoriaIdade.faixas.includes(faixaNormalizada);
}

function carregarTabelasReferencia() {
    const tabelaIdades = document.getElementById('tabela-idades');
    if (tabelaIdades) {
        tabelaIdades.innerHTML = CATEGORIAS_IDADE.map(cat => `
            <tr>
                <td><strong>${cat.nome}</strong></td>
                <td>${cat.idadeMin} - ${cat.idadeMax} anos</td>
                <td>${cat.faixas.join(', ')}</td>
            </tr>
        `).join('');
    }
    
    const tabelaPesoMasc = document.getElementById('tabela-peso-masc');
    if (tabelaPesoMasc) {
        tabelaPesoMasc.innerHTML = CATEGORIAS_PESO_MASC.map(cat => `
            <tr>
                <td><strong>${cat.nome}</strong></td>
                <td>${cat.pesoMax === 999 ? 'Acima de 100.5 kg' : `Até ${cat.pesoMax} kg`}</td>
            </tr>
        `).join('');
    }
    
    const tabelaPesoFem = document.getElementById('tabela-peso-fem');
    if (tabelaPesoFem) {
        tabelaPesoFem.innerHTML = CATEGORIAS_PESO_FEM.map(cat => `
            <tr>
                <td><strong>${cat.nome}</strong></td>
                <td>${cat.pesoMax === 999 ? 'Acima de 79.3 kg' : `Até ${cat.pesoMax} kg`}</td>
            </tr>
        `).join('');
    }
}