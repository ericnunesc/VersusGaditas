// arquivo: shared-state.js
(function(global) {
  const KEY = "GDT_STATE_V1";
  const CHANNEL = "GDT_CHANNEL_V1";
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel(CHANNEL) : null;
  
  function base() {
    return {
      competicoes: [],
      competicaoAtivaId: null,
      atletas: [],
      chaveamentos: {}, // { [compId]: { lutas: [] } }
      placares: {}, // { [lutaId]: { a1:0, a2:0, vencedorId:null } }
      updatedAt: Date.now()
    };
  }
  
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return base();
      return { ...base(), ...JSON.parse(raw) };
    } catch {
      return base();
    }
  }
  
  function write(next) {
    const state = { ...base(), ...next, updatedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(state));
    if (bc) bc.postMessage({ type: "state:updated", at: state.updatedAt });
    return state;
  }
  
  function update(mutator) {
    const current = read();
    const draft = JSON.parse(JSON.stringify(current));
    mutator(draft);
    return write(draft);
  }
  
  function uid(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
  
  function getAtiva(state = read()) {
    return state.competicoes.find(c => c.id === state.competicaoAtivaId) || null;
  }
  
  function subscribe(cb) {
    const handlerStorage = (e) => {
      if (e.key === KEY) cb(read());
    };
    window.addEventListener("storage", handlerStorage);
    
    let handlerBC = null;
    if (bc) {
      handlerBC = () => cb(read());
      bc.addEventListener("message", handlerBC);
    }
    
    return () => {
      window.removeEventListener("storage", handlerStorage);
      if (bc && handlerBC) bc.removeEventListener("message", handlerBC);
    };
  }
  
  global.GDTState = {
    KEY,
    read,
    write,
    update,
    uid,
    getAtiva,
    subscribe
  };
})(window);