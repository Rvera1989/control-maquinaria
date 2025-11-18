// ======= Manejo de PIN / Lock screen (añadir esto AL PRINCIPIO) =======
const CORRECT_PIN = "7285";
const lockScreen = document.getElementById("lockScreen");
const pinInput = document.getElementById("pinInput");
const unlockBtn = document.getElementById("unlockBtn");
const clearDataBtn = document.getElementById("clearDataBtn");

// Si alguno de estos elementos no existe, evitamos errores al cargar
if (unlockBtn) {
  unlockBtn.addEventListener("click", () => {
    if (pinInput && pinInput.value === CORRECT_PIN) {
      if (lockScreen) lockScreen.classList.add("hidden");
      const appEl = document.getElementById("app");
      if (appEl) appEl.classList.remove("hidden");
    } else {
      alert("PIN incorrecto ❌");
      if (pinInput) pinInput.value = "";
    }
  });
}

if (clearDataBtn) {
  clearDataBtn.addEventListener("click", () => {
    if (confirm("¿Seguro que deseas borrar TODOS los registros?")) {
      localStorage.removeItem("registros");
      localStorage.removeItem("maquinas");
      alert("Datos eliminados");
      location.reload();
    }
  });
}
// Forzar que lockScreen esté visible al inicio si existe
if (lockScreen) lockScreen.classList.remove("hidden");

// ============================
// SCRIPT MEJORADO: EDITAR / ELIMINAR / BUSCAR
// ============================

// Seguridad: PIN ya está manejado por tu script original.
// Este archivo asume que ya se ocultó el lockScreen al entrar.

let registros = JSON.parse(localStorage.getItem("registros") || "[]");
let maquinas = JSON.parse(localStorage.getItem("maquinas") || "[]");

// Elementos DOM (IDs que ya tienes en tu HTML)
const registroForm = document.getElementById("registroForm");
const fechaEl = document.getElementById("fecha");
const maquinariaEl = document.getElementById("maquinaria");
const tipoEl = document.getElementById("tipo");
const obsEl = document.getElementById("obs");
const inicioMEl = document.getElementById("inicioM");
const inicioTEl = document.getElementById("inicioT");
const fotoEl = document.getElementById("foto");
const horasDisplay = document.getElementById("horasDisplay");
const tablaBody = document.querySelector("#tabla tbody");

const searchDateEl = document.getElementById("searchDate");
const searchBtn = document.getElementById("searchBtn");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const exportBtn = document.getElementById("exportBtn");

// Variable para edición
let editingId = null;

// Inicialización: poblar select de máquinas
function renderMachines() {
  maquinariaEl.innerHTML = "";
  if (!maquinas || maquinas.length === 0) {
    maquinas = ["Excavadora","Retroexcavadora","Volquete","Motoniveladora","Rodillo"];
    localStorage.setItem("maquinas", JSON.stringify(maquinas));
  }
  maquinas.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    maquinariaEl.appendChild(opt);
  });
}
renderMachines();

// Mostrar horas calculadas
function calcHorasValue(m, t) {
  if (!m || !t) return 0;
  const [mh, mm] = m.split(":").map(Number);
  const [th, tm] = t.split(":").map(Number);
  let diff = ((th*60 + tm) - (mh*60 + mm))/60 - 1;
  return diff > 0 ? +diff.toFixed(2) : 0;
}
function mostrarHoras() {
  horasDisplay.textContent = calcHorasValue(inicioMEl.value, inicioTEl.value).toFixed(2);
}
inicioMEl.addEventListener("change", mostrarHoras);
inicioTEl.addEventListener("change", mostrarHoras);

// Guardar / actualizar registro
registroForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const file = fotoEl.files[0];
  const reader = new FileReader();

  reader.onloadend = () => {
    const nuevo = {
      id: editingId ? editingId : Date.now(),
      fecha: fechaEl.value || new Date().toISOString().slice(0,10),
      maquinaria: maquinariaEl.value,
      tipo: tipoEl.value,
      obs: obsEl.value,
      inicioM: inicioMEl.value,
      inicioT: inicioTEl.value,
      horas: calcHorasValue(inicioMEl.value, inicioTEl.value),
      foto: file ? reader.result : ""
    };

    if (editingId) {
      registros = registros.map(r => r.id === editingId ? nuevo : r);
      editingId = null;
    } else {
      registros.push(nuevo);
    }

    localStorage.setItem("registros", JSON.stringify(registros));
    registroForm.reset();
    mostrarHoras();
    renderTabla(registros);
  };

  if (file) reader.readAsDataURL(file);
  else reader.onloadend();
});

// Render tabla con acciones
function renderTabla(list) {
  tablaBody.innerHTML = "";
  
  if (!list || list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="7" style="text-align:center;color:#666">No hay registros</td>
    `;
    tablaBody.appendChild(tr);
    return;
  }

  list.forEach(r => {
    const tr = document.createElement("tr");
    const imgHtml = r.foto ? `<img src="${r.foto}" class="thumb" />` : "-";
    
    tr.innerHTML = `
      <td>${r.fecha}</td>
      <td>${r.maquinaria}</td>
      <td>${r.tipo}</td>
      <td>${r.obs}</td>
      <td>${r.horas.toFixed(2)}</td>
      <td>${imgHtml}</td>
      <td>
        <button class="editBtn" data-id="${r.id}">Editar</button>
        <button class="deleteBtn" data-id="${r.id}">Eliminar</button>
      </td>
    `;

    tablaBody.appendChild(tr);
  });

  // Acciones
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      if (!confirm("¿Eliminar este registro?")) return;
      registros = registros.filter(x => x.id !== id);
      localStorage.setItem("registros", JSON.stringify(registros));
      renderTabla(registros);
    });
  });

  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const r = registros.find(x => x.id === id);
      if (!r) return alert("Registro no encontrado");

      editingId = r.id;
      fechaEl.value = r.fecha;
      maquinariaEl.value = r.maquinaria;
      tipoEl.value = r.tipo;
      obsEl.value = r.obs;
      inicioMEl.value = r.inicioM;
      inicioTEl.value = r.inicioT;
      mostrarHoras();

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// Inicial render
renderTabla(registros);

// BUSCAR POR FECHA
searchBtn.addEventListener("click", () => {
  const fecha = searchDateEl.value;
  if (!fecha) return renderTabla(registros);
  const filtered = registros.filter(r => r.fecha === fecha);
  renderTabla(filtered);
});

clearSearchBtn.addEventListener("click", () => {
  searchDateEl.value = "";
  renderTabla(registros);
});

// EXPORTAR CSV
exportBtn.addEventListener("click", () => {
  if (!registros.length) return alert("No hay registros para exportar.");
  let csv = "Fecha,Maquinaria,Tipo,Obs,Inicio Mañana,Inicio Tarde,Horas,Foto\n";
  
  registros.forEach(r => {
    csv += `${r.fecha},${r.maquinaria},${r.tipo},${r.obs},${r.inicioM},${r.inicioT},${r.horas},${r.foto ? "incluida" : ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte_maquinaria.csv";
  a.click();
});
