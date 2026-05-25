// Firebase SDK (compat)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0HOHKPd9gCpJx0pnFWaKdLU-1WJks-gA",
  authDomain: "campeonatobjj.firebaseapp.com",
  projectId: "campeonatobjj",
  storageBucket: "campeonatobjj.firebasestorage.app",
  messagingSenderId: "399016509024",
  appId: "1:399016509024:web:2963122de02b7ff3bc0d05"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// ── Campeonatos ──────────────────────────────────────────────
export async function criarCampeonato(dados) {
  return await addDoc(collection(db, "campeonatos"), {
    ...dados,
    criadoEm: serverTimestamp(),
    status: "ativo"
  });
}

export async function listarCampeonatos() {
  const snap = await getDocs(query(collection(db, "campeonatos"), orderBy("criadoEm", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function buscarCampeonato(id) {
  const snap = await getDoc(doc(db, "campeonatos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function atualizarCampeonato(id, dados) {
  await updateDoc(doc(db, "campeonatos", id), dados);
}

export async function deletarCampeonato(id) {
  await deleteDoc(doc(db, "campeonatos", id));
}

// ── Atletas ──────────────────────────────────────────────────
export async function salvarAtleta(campeonatoId, atleta) {
  return await addDoc(collection(db, "campeonatos", campeonatoId, "atletas"), {
    ...atleta,
    criadoEm: serverTimestamp()
  });
}

export async function listarAtletas(campeonatoId) {
  const snap = await getDocs(collection(db, "campeonatos", campeonatoId, "atletas"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function atualizarAtleta(campeonatoId, atletaId, dados) {
  await updateDoc(doc(db, "campeonatos", campeonatoId, "atletas", atletaId), dados);
}

export async function deletarAtleta(campeonatoId, atletaId) {
  await deleteDoc(doc(db, "campeonatos", campeonatoId, "atletas", atletaId));
}

// ── Equipes ──────────────────────────────────────────────────
export async function salvarEquipe(campeonatoId, equipe) {
  return await addDoc(collection(db, "campeonatos", campeonatoId, "equipes"), {
    ...equipe,
    criadoEm: serverTimestamp()
  });
}

export async function listarEquipes(campeonatoId) {
  const snap = await getDocs(collection(db, "campeonatos", campeonatoId, "equipes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b) => (a.nome||'').localeCompare(b.nome||'','pt-BR'));
}

export async function atualizarEquipe(campeonatoId, equipeId, dados) {
  await updateDoc(doc(db, "campeonatos", campeonatoId, "equipes", equipeId), dados);
}

export async function deletarEquipe(campeonatoId, equipeId) {
  await deleteDoc(doc(db, "campeonatos", campeonatoId, "equipes", equipeId));
}

// ── Inscrições ───────────────────────────────────────────────
export async function salvarInscricao(campeonatoId, inscricao) {
  return await addDoc(collection(db, "campeonatos", campeonatoId, "inscricoes"), {
    ...inscricao,
    status: "pendente",
    criadoEm: serverTimestamp()
  });
}

export async function listarInscricoes(campeonatoId) {
  const snap = await getDocs(collection(db, "campeonatos", campeonatoId, "inscricoes"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function atualizarInscricao(campeonatoId, inscricaoId, dados) {
  await updateDoc(doc(db, "campeonatos", campeonatoId, "inscricoes", inscricaoId), dados);
}

// ── Configurações ────────────────────────────────────────────
export async function salvarConfig(campeonatoId, cfg) {
  await setDoc(doc(db, "campeonatos", campeonatoId, "config", "principal"), cfg);
}

export async function buscarConfig(campeonatoId) {
  const snap = await getDoc(doc(db, "campeonatos", campeonatoId, "config", "principal"));
  return snap.exists() ? snap.data() : {};
}

// ── Auth ─────────────────────────────────────────────────────
export async function login(email, senha) {
  return await signInWithEmailAndPassword(auth, email, senha);
}

export async function logout() {
  await signOut(auth);
}

export function onLogin(callback) {
  return onAuthStateChanged(auth, callback);
}

export { db, auth, onSnapshot, collection, doc, query, where, orderBy };
