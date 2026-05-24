// ==================== ÁREAS DE LUTA ====================
let areasLuta = ["Tatame 1", "Tatame 2", "Tatame 3"];

function abrirConfigAreas() {
  const numAreas = parseInt(prompt('Quantas áreas (tatames) terão as lutas?', areasLuta.length));
  if (numAreas && numAreas > 0) {
    areasLuta = [];
    for (let i = 1; i <= numAreas; i++) {
      areasLuta.push(`Tatame ${i}`);
    }
    localStorage.setItem('gaditas_areas_luta', JSON.stringify(areasLuta));
    mostrarToast(`✅ ${numAreas} áreas configuradas: ${areasLuta.join(', ')}`, 'sucesso');
  }
}

function abrirConfigHorario() {
  const inicio = prompt('Horário de início (HH:MM):', '09:00');
  if (inicio) {
    localStorage.setItem('gaditas_horario_inicio', inicio);
    mostrarToast(`✅ Horário definido: ${inicio}`, 'sucesso');
  }
}

carregarConfiguracoes();

function carregarConfiguracoes() {
  const areasSalvas = localStorage.getItem('gaditas_areas_luta');
  if (areasSalvas) areasLuta = JSON.parse(areasSalvas);
}

window.areasLuta = areasLuta;
window.abrirConfigAreas = abrirConfigAreas;
window.abrirConfigHorario = abrirConfigHorario;