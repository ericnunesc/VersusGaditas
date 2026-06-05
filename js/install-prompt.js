/**
 * install-prompt.js — Prompt de instalação PWA automático
 * Suporta Android/Chrome (beforeinstallprompt) e iOS Safari (instruções manuais)
 */
(function () {
  'use strict';

  var STORAGE_KEY   = 'gdt_install_dismissed';
  var DIAS_ESPERA   = 7;   // não mostrar de novo por X dias após dispensar
  var DELAY_MS      = 800; // pequeno delay só para a página terminar de renderizar

  // ── Detectar plataforma ─────────────────────────────────
  var ua      = navigator.userAgent || '';
  var isIOS   = /iPhone|iPad|iPod/i.test(ua) && !window.MSStream;
  var isSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS/i.test(ua);
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches
                  || window.navigator.standalone === true;

  if (isStandalone) return; // já está instalado, não mostrar

  // ── Verificar se foi dispensado recentemente ────────────
  function foiDispensado() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (!v) return false;
      return (Date.now() - parseInt(v, 10)) < DIAS_ESPERA * 86400000;
    } catch (e) { return false; }
  }

  function marcarDispensado() {
    try { localStorage.setItem(STORAGE_KEY, Date.now().toString()); } catch (e) {}
  }

  // ── Criar banner ────────────────────────────────────────
  function criarBanner(onInstalar, onDispensado) {
    var banner = document.createElement('div');
    banner.id  = 'gdt-install-banner';
    banner.innerHTML = [
      '<div id="gdt-ib-inner">',
      '  <img id="gdt-ib-logo" src="images/logo_favicon.png" alt="BudoFlow">',
      '  <div id="gdt-ib-texto">',
      '    <strong>Instalar BudoFlow</strong>',
      '    <span>Acesse rápido, funciona offline</span>',
      '  </div>',
      '  <button id="gdt-ib-instalar">Instalar</button>',
      '  <button id="gdt-ib-fechar" title="Dispensar">✕</button>',
      '</div>',
    ].join('');

    var style = document.createElement('style');
    style.textContent = [
      '#gdt-install-banner {',
      '  position:fixed; bottom:0; left:0; right:0; z-index:99999;',
      '  background:#1A2C3E; border-top:2px solid #C9A03D;',
      '  box-shadow:0 -4px 24px rgba(0,0,0,0.4);',
      '  transform:translateY(110%); transition:transform .4s cubic-bezier(.22,1,.36,1);',
      '  font-family:"Barlow","Inter",sans-serif;',
      '}',
      '#gdt-install-banner.visivel { transform:translateY(0); }',
      '#gdt-ib-inner {',
      '  display:flex; align-items:center; gap:12px;',
      '  max-width:600px; margin:0 auto; padding:14px 16px;',
      '}',
      '#gdt-ib-logo { width:44px; height:44px; border-radius:10px; flex-shrink:0; object-fit:cover; }',
      '#gdt-ib-texto { flex:1; min-width:0; }',
      '#gdt-ib-texto strong { display:block; font-size:.92rem; font-weight:700; color:#E8E8F0; }',
      '#gdt-ib-texto span   { display:block; font-size:.72rem; color:#8A9CB0; margin-top:2px; }',
      '#gdt-ib-instalar {',
      '  background:#C9A03D; color:#0A0A0A; border:none;',
      '  padding:9px 18px; border-radius:40px;',
      '  font-size:.82rem; font-weight:700; cursor:pointer;',
      '  white-space:nowrap; flex-shrink:0;',
      '  font-family:inherit;',
      '}',
      '#gdt-ib-instalar:hover { background:#B8902D; }',
      '#gdt-ib-fechar {',
      '  background:transparent; border:none; color:#5A5A7A;',
      '  font-size:1.1rem; cursor:pointer; padding:4px 6px; flex-shrink:0;',
      '}',
      '#gdt-ib-fechar:hover { color:#E8E8F0; }',
      /* iOS modal */
      '#gdt-ios-modal {',
      '  position:fixed; inset:0; z-index:100000;',
      '  background:rgba(0,0,0,.55); display:flex; align-items:flex-end;',
      '}',
      '#gdt-ios-box {',
      '  background:#1A2C3E; border-radius:20px 20px 0 0;',
      '  border-top:2px solid #C9A03D; padding:24px 22px 36px;',
      '  width:100%; max-width:480px; margin:0 auto;',
      '  font-family:"Barlow","Inter",sans-serif; color:#E8E8F0;',
      '}',
      '#gdt-ios-box h4 { font-size:1rem; font-weight:700; margin-bottom:6px; color:#C9A03D; }',
      '#gdt-ios-box p  { font-size:.82rem; color:#8A9CB0; margin-bottom:16px; line-height:1.6; }',
      '#gdt-ios-steps { list-style:none; padding:0; margin:0 0 20px; }',
      '#gdt-ios-steps li { display:flex; align-items:center; gap:10px; padding:8px 0;',
      '  border-bottom:1px solid rgba(255,255,255,.06); font-size:.85rem; }',
      '#gdt-ios-steps li:last-child { border-bottom:none; }',
      '#gdt-ios-steps .step-n { background:rgba(201,160,61,.15); color:#C9A03D;',
      '  width:26px; height:26px; border-radius:50%; display:flex; align-items:center;',
      '  justify-content:center; font-size:.78rem; font-weight:700; flex-shrink:0; }',
      '#gdt-ios-fechar { width:100%; background:#C9A03D; color:#0A0A0A; border:none;',
      '  padding:12px; border-radius:40px; font-size:.88rem; font-weight:700; cursor:pointer;',
      '  font-family:inherit; }',
    ].join('\n');

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Animar entrada
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('visivel');
      });
    });

    function fechar() {
      banner.classList.remove('visivel');
      setTimeout(function () { banner.remove(); }, 450);
      marcarDispensado();
      if (onDispensado) onDispensado();
    }

    document.getElementById('gdt-ib-fechar').addEventListener('click', fechar);
    document.getElementById('gdt-ib-instalar').addEventListener('click', function () {
      fechar();
      if (onInstalar) onInstalar();
    });

    return banner;
  }

  // ── Modal iOS ────────────────────────────────────────────
  function mostrarModalIOS() {
    var modal = document.createElement('div');
    modal.id  = 'gdt-ios-modal';
    modal.innerHTML = [
      '<div id="gdt-ios-box">',
      '  <h4>📲 Instalar BudoFlow</h4>',
      '  <p>Adicione o app à tela inicial do seu iPhone para acesso rápido, mesmo sem internet.</p>',
      '  <ul id="gdt-ios-steps">',
      '    <li><span class="step-n">1</span> Toque no botão <strong>Compartilhar</strong> (⬆️) na barra do Safari</li>',
      '    <li><span class="step-n">2</span> Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></li>',
      '    <li><span class="step-n">3</span> Confirme tocando em <strong>Adicionar</strong></li>',
      '  </ul>',
      '  <button id="gdt-ios-fechar">Entendi</button>',
      '</div>',
    ].join('');

    document.body.appendChild(modal);

    function fecharModal() {
      modal.remove();
      marcarDispensado();
    }

    document.getElementById('gdt-ios-fechar').addEventListener('click', fecharModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) fecharModal();
    });
  }

  // ── Registrar Service Worker ────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  // ── Fluxo principal ─────────────────────────────────────
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;

    if (foiDispensado()) return;

    setTimeout(function () {
      criarBanner(
        function onInstalar() {
          if (!deferredPrompt) return;
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (choice) {
            if (choice.outcome === 'accepted') {
              marcarDispensado(); // não perguntar de novo
            }
            deferredPrompt = null;
          });
        },
        null // dispensado já é tratado dentro do banner
      );
    }, DELAY_MS);
  });

  // iOS Safari: não tem beforeinstallprompt — mostrar instruções diretamente no banner
  if (isSafari && !foiDispensado()) {
    window.addEventListener('load', function () {
      setTimeout(mostrarBannerIOS, DELAY_MS);
    });
  }

  function mostrarBannerIOS() {
    if (foiDispensado()) return;

    var banner = document.createElement('div');
    banner.id  = 'gdt-install-banner';
    banner.innerHTML = [
      '<div id="gdt-ib-inner" style="flex-direction:column;align-items:stretch;gap:10px;padding:16px 16px 20px">',
      '  <div style="display:flex;align-items:center;gap:10px">',
      '    <img id="gdt-ib-logo" src="images/logo_favicon.png" alt="BudoFlow">',
      '    <div id="gdt-ib-texto" style="flex:1">',
      '      <strong>Instalar BudoFlow no iPhone</strong>',
      '      <span>Siga os passos abaixo</span>',
      '    </div>',
      '    <button id="gdt-ib-fechar" title="Dispensar">✕</button>',
      '  </div>',
      '  <div style="display:flex;gap:8px;align-items:center;background:rgba(255,255,255,0.05);border-radius:10px;padding:10px 12px">',
      '    <span style="font-size:1.4rem;flex-shrink:0">1️⃣</span>',
      '    <span style="font-size:.8rem;color:#C8D8E8">Toque em <strong style="color:#fff">Compartilhar</strong> <span style="font-size:1rem">⬆️</span> na barra do Safari</span>',
      '  </div>',
      '  <div style="display:flex;gap:8px;align-items:center;background:rgba(255,255,255,0.05);border-radius:10px;padding:10px 12px">',
      '    <span style="font-size:1.4rem;flex-shrink:0">2️⃣</span>',
      '    <span style="font-size:.8rem;color:#C8D8E8">Toque em <strong style="color:#fff">"Adicionar à Tela de Início"</strong> e confirme</span>',
      '  </div>',
      '  <div id="gdt-ios-seta" style="text-align:center;font-size:1.8rem;animation:gdt-bounce .8s infinite alternate">⬇️</div>',
      '</div>',
    ].join('');

    var style = document.createElement('style');
    style.textContent = [
      '#gdt-install-banner {',
      '  position:fixed; bottom:0; left:0; right:0; z-index:99999;',
      '  background:#1A2C3E; border-top:2px solid #C9A03D;',
      '  box-shadow:0 -4px 24px rgba(0,0,0,0.5);',
      '  transform:translateY(110%); transition:transform .4s cubic-bezier(.22,1,.36,1);',
      '  font-family:"Barlow","Inter",sans-serif;',
      '}',
      '#gdt-install-banner.visivel { transform:translateY(0); }',
      '#gdt-ib-logo { width:44px; height:44px; border-radius:10px; flex-shrink:0; object-fit:cover; }',
      '#gdt-ib-texto strong { display:block; font-size:.92rem; font-weight:700; color:#E8E8F0; }',
      '#gdt-ib-texto span   { display:block; font-size:.72rem; color:#8A9CB0; margin-top:2px; }',
      '#gdt-ib-fechar { background:transparent; border:none; color:#5A5A7A; font-size:1.1rem; cursor:pointer; padding:4px 6px; }',
      '#gdt-ib-fechar:hover { color:#E8E8F0; }',
      '@keyframes gdt-bounce { from { transform:translateY(0) } to { transform:translateY(6px) } }',
    ].join('\n');

    document.head.appendChild(style);
    document.body.appendChild(banner);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { banner.classList.add('visivel'); });
    });

    document.getElementById('gdt-ib-fechar').addEventListener('click', function () {
      banner.classList.remove('visivel');
      setTimeout(function () { banner.remove(); }, 450);
      marcarDispensado();
    });
  }

})();
