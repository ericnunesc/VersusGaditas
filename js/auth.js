const _AUTH_KEY = 'gaditas_logado';
const _PASS_KEY = 'gaditas_senha_adm';

function verificarAuth() {
    if (sessionStorage.getItem(_AUTH_KEY) !== '1') {
        window.location.replace('login.html');
    }
}

function fazerLogin(usuario, senha) {
    const senhaCorreta = localStorage.getItem(_PASS_KEY) || 'admin';
    if (usuario === 'admin' && senha === senhaCorreta) {
        sessionStorage.setItem(_AUTH_KEY, '1');
        return true;
    }
    return false;
}

function fazerLogout() {
    sessionStorage.removeItem(_AUTH_KEY);
    window.location.replace('login.html');
}

function alterarSenha(senhaAtual, novaSenha) {
    const senhaCorreta = localStorage.getItem(_PASS_KEY) || 'admin';
    if (senhaAtual !== senhaCorreta) return false;
    localStorage.setItem(_PASS_KEY, novaSenha);
    return true;
}
