VersusGaditas — Gaditas Torneios BJJ
Sistema completo de gestão de torneios e ligas de Jiu-Jitsu Brasileiro, seguindo regras CBJJ/IBJJF.
Stack
Frontend: HTML5 + CSS3 + Vanilla JavaScript ES6 (sem frameworks, sem npm)
Banco de dados: Firebase Firestore (real-time) — Projeto: `campeonatobjj`
Auth: Firebase Auth (email/password)
Offline: Service Worker (`sw.js`) + cache-first
Sync multi-aba: BroadcastChannel API
PWA: `manifest.json` + ícones
Sem servidor backend. Sem `package.json`. Dependências via CDN (Firebase SDK v10.12.0).
Como rodar
```bash
python3 -m http.server 8000
# ou
npx http-server
```
Abrir `http://localhost:8000`. Páginas públicas não precisam de login. Admin usa Firebase Auth.
Estrutura de arquivos
```
/
├── index.html           # Landing page pública (lista de torneios)
├── home.html            # Página home do domínio
├── style.css            # CSS global (cores: ouro #C9A03D, azul escuro #1A2C3E)
├── sw.js                # Service Worker
├── manifest.json        # PWA manifest
│
├── js/
│   ├── config.js        # Categorias de idade/peso CBJJ, versão (3.3.0)
│   ├── firebase.js      # Init Firebase + todas as operações CRUD
│   ├── auth.js          # Wrapper de autenticação
│   ├── utils.js         # Helpers (toast, calc idade, salvar/carregar dados)
│   ├── app.js           # UI de abas e ranking
│   ├── shared-state.js  # Estado cross-tab
│   ├── sincronizacao.js # Sync real-time via BroadcastChannel
│   ├── atletas.js       # Cadastro e gestão de atletas
│   ├── categorias.js    # Lógica de categorias (idade/peso/faixa)
│   ├── chaveamento.js   # Geração de chaves (eliminação simples)
│   ├── lutas.js         # Pontuação e controle de lutas
│   ├── horarios.js      # Agendamento
│   ├── torneio.js       # Estado do torneio
│   └── configuracoes.js # Configurações
│
├── Torneio (páginas públicas):
│   ├── inscricao.html         # Inscrição de atleta
│   ├── atletas-publico.html   # Lista pública de atletas
│   ├── cronograma-lutas.html  # Cronograma público
│   ├── placar-publico.html    # Placar ao vivo (leitura)
│   └── tv-chaveamento.html    # Chave para TV/display
│
├── Torneio (páginas admin):
│   ├── painel-admin.html      # Dashboard principal admin
│   ├── adm-inscricoes.html    # Gerenciar inscrições
│   ├── adm-chaveamento.html   # Gerar e gerenciar chaves
│   ├── admin-equipes.html     # Gerenciar equipes
│   ├── placar-adm.html        # Pontuação ao vivo (admin)
│   ├── agenda-lutas.html      # Agendar lutas
│   ├── sequencia-lutas.html   # Ordem das lutas por área
│   └── imprimir-chave.html    # Imprimir chave
│
└── Liga (competição por equipes):
    ├── liga-inscricao.html        # Inscrição de equipe
    ├── liga-portal.html           # Portal privado da equipe
    ├── liga-adm.html              # Admin da liga
    ├── liga-placar-adm.html       # Pontuação ao vivo da liga
    ├── liga-placar-publico.html   # Placar público da liga
    ├── liga-cronograma.html       # Cronograma da liga
    └── liga-tv.html               # Liga para TV/display
```
Firestore — estrutura do banco
```
campeonatos/{campeonatoId}/
  ├── (campos) nome, data, status, local, tipo, emoji, cartaz, descricao, criadoEm
  ├── atletas/{atletaId}
  ├── inscricoes/{inscricaoId}
  ├── equipes/{equipeId}
  ├── config/principal
  ├── liga-equipes/{equipeId}
  ├── liga-atletas/{atletaId}
  ├── liga-confrontos/{confrontoId}
  ├── liga-config/
  └── liga-historico/
```
Regras de negócio importantes
Pontuação CBJJ
Derrubada: 2 pts | Passagem de guarda: 3 pts | Montada/Costas: 4 pts
Vantagem: 1 pt | Punição: -1 pt adversário
Submissão = vitória imediata
Categorias de idade (14 categorias)
Pré-Mirim (4-5) → Mirim → Infantil → Infanto-Juvenil → Juvenil → Adulto (18-29) → Master 1-6 (30+)
Pesos adulto masculino (9 categorias)
Pluma 57.5kg → Leve → Médio → Meio-Pesado → Pesado → Super-Pesado → Pesadíssimo → Absoluto 100.5kg+
Chaveamento
Eliminação simples com byes para potências de 2
Suporte a rodada preliminar quando necessário
Shuffle aleatório dos atletas
Estados de luta
`pendente` → `em_andamento` → `pausada` → `finalizada`
Branch de desenvolvimento
Branch ativa: `master`
```bash
git checkout master
git pull origin master
```
Commits recentes
Commit	Funcionalidade
8005921	home.html como landing page do domínio
5c3e404	Sync de placar ao vivo para página pública da liga
19a0838	Toast + flash para auto-efeitos de punição (liga-placar-adm)
0540a0a	Regras corretas de pontuação BJJ e auto-efeitos de punição
d5e365b	UI completa de pontuação por luta (timer + pts + van + pun)
4e079d4	Fix alerta INP + upload de logo de equipe nos cards
6b9a034	Logo da equipe e foto do atleta na classificação
78a807b	Logo da equipe na inscrição + foto do atleta no portal (base64)
6d302b5	Sistema completo de inscrição de equipes + portal privado
Padrões de código
Português (pt-BR) em toda a interface e mensagens
`toast(mensagem, tipo)` para feedback ao usuário (`'sucesso'`, `'erro'`, `'aviso'`)
`salvarDados()` / `carregarDados()` em `utils.js` para localStorage
Firebase listeners com `onSnapshot` para atualizações em tempo real
IDs de torneio passados via URL param: `?id=campeonatoId`
Autenticação verificada via `verificarAuth()` em `auth.js`
Notas para retomada de sessão
Este arquivo existe para retomar o desenvolvimento após interrupções. Se você é Claude Code em uma nova sessão:
Leia este arquivo para entender o contexto
Rode `git log --oneline -5` para ver os commits mais recentes
Pergunte ao usuário o que estava sendo desenvolvido antes da interrupção
O branch de trabalho é `master`
