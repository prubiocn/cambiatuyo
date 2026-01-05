
// === CambiaTuYo app.js (production fixed) ===
const BACKEND_URL = 'https://cambiatuyo-production.up.railway.app';
const ADMIN_EMAIL = 'admin@cambiatuyo.es';

console.log("CambiaTuYo iniciado");

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME",
  projectId: "REPLACE_ME",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

let currentUser = null;
let isAdmin = false;

window.showAuthModal = function () {
  if (document.getElementById("authModal")) return;

  const modal = document.createElement("div");
  modal.id = "authModal";
  modal.className = "fixed inset-0 bg-black/80 flex items-center justify-center z-50";
  modal.innerHTML = `
    <div class="bg-slate-900 p-6 rounded-xl w-full max-w-md">
      <h2 class="text-xl font-bold mb-4">Acceder</h2>
      <input id="authEmail" type="email" placeholder="Email"
        class="w-full mb-3 p-2 rounded bg-black/40 border border-purple-500/30"/>
      <input id="authPassword" type="password" placeholder="Contraseña"
        class="w-full mb-4 p-2 rounded bg-black/40 border border-purple-500/30"/>
      <button id="authSubmit"
        class="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded font-bold">
        Entrar
      </button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector("#authSubmit").onclick = handleLogin;
  modal.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
};

async function handleLogin() {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  if (!email || !password) return;
  await signInWithEmailAndPassword(auth, email, password);
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    isAdmin = user.email === ADMIN_EMAIL;
    document.getElementById("authModal")?.remove();
    document.getElementById("authButton")?.classList.add("hidden");
    document.getElementById("userMenuButton")?.classList.remove("hidden");
    document.getElementById("userName").textContent = isAdmin ? "admin" : user.email;
  } else {
    currentUser = null;
    isAdmin = false;
  }
});

const agents = [
  { id: "tarot", name: "Madame Arcana", icon: "🔮" },
  { id: "numerology", name: "Numerius Sage", icon: "🔢" },
  { id: "crystals", name: "Crystal Harmony", icon: "💎" },
  { id: "astrology", name: "Celestia Nova", icon: "⭐" },
  { id: "dreams", name: "Morpheus Dream", icon: "🌙" },
  { id: "angels", name: "Seraphiel", icon: "😇" },
  { id: "iching", name: "Sage Lao", icon: "🔥" },
  { id: "runes", name: "Völva Rúnhild", icon: "ᚱ" },
  { id: "fengshui", name: "Maestro Li Wei", icon: "🏯" },
  { id: "kabbalah", name: "Rabbi Elohim", icon: "📖" },
  { id: "guide", name: "Ananda", icon: "🕉️" },
  { id: "sacred_geometry", name: "Aurelia Mandala", icon: "🌀" }
];

function renderAgents() {
  const grid = document.getElementById("agentsGrid");
  if (!grid) return;
  grid.innerHTML = "";
  agents.forEach((a) => {
    const card = document.createElement("div");
    card.className = "bg-slate-800 p-4 rounded-xl text-center";
    card.innerHTML = `
      <div class="text-4xl mb-2">${a.icon}</div>
      <h3 class="font-bold">${a.name}</h3>
      <button class="mt-3 bg-purple-600 px-4 py-2 rounded"
        onclick="selectAgent('${a.id}')">Consultar</button>
    `;
    grid.appendChild(card);
  });
}

window.selectAgent = function (id) {
  if (!currentUser) {
    showAuthModal();
    return;
  }
  alert("Admin puede consultar sin límite. Agente: " + id);
};

document.addEventListener("DOMContentLoaded", renderAgents);
