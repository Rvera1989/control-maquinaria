// ============================
// CONFIGURACIÓN DE SEGURIDAD
// ============================

const CORRECT_PIN = "7285";

// Elementos DOM
const lockScreen = document.getElementById("lockScreen");
const pinInput = document.getElementById("pinInput");
const unlockBtn = document.getElementById("unlockBtn");
const clearDataBtn = document.getElementById("clearDataBtn");

unlockBtn.addEventListener("click", () => {
  if (pinInput.value === CORRECT_PIN) {
    lockScreen.classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  } else {
    alert("PIN incorrecto ❌");
  }
});

clearDataBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que deseas borrar TODOS los registros?")) {
    localStorage.removeItem("registros");
    localStorage.removeItem("maquinas");
    alert("Datos eliminados");
    location.reload();
  }
});

// ============================================
// VARIABLES Y CARGA DE DATOS EN LOCALSTORAGE
// ============================================

let registros = JSON.parse(localStorage.getItem("registros") || "[]");
let maquinas = JSON.parse(localStorage.getItem("maquinas") || "[]");

const maquinariaSelect = document.getElementById("maquinaria");
const tabla = document.querySelector("#tabla tbody");

// ============================
// POBLAR SELECT DE MAQUINARIA
// ============================

function actualizarListaMaquinaria() {
  maquinariaSelect.innerHTML = "";
  maquinas.forEach(m => {
    const opt = document.createElement("option");
    opt.textContent = m;
    maquinariaSelect.appendChild(opt);
  });
}
actualizarListaMaquinaria();

// ============================
// CALCULO AUTOMÁTICO HORAS
// ============================

function calcularHoras() {
  const inicioM = document.getElementById("inicioM").value;
  const inicioT = document.getElementById("inicioT").value;

  if (!inicioM || !inicioT) return 0;

  const hM = parseFloat(inicioM.replace(":", ".")) || 0;
  const hT = parseFloat(inicioT.replace(":", ".")) || 0;

  // Hora total = (tarde - mañana) - 1h almuerzo
  let horas = (hT - hM) - 1;

  return horas > 0 ? horas : 0;
}

function mostrarHoras() {
  document.getElementById("horasDisplay").innerText = calcularHoras().toFixed(2);
}

document.getElementById("inicioM").addEventListener("change", mostrarHoras);
document.getElementById("inicioT").addEventListener("change", mostrarHoras);

// ============================
// GUARDAR REGISTRO + FOTO
// ============================

document.getElementById("registroForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const reader = new FileReader();
  const file = document.getElementById("foto").files[0];

  reader.onloadend = () => {
    const nuevo = {
      fecha: document.getElementById("fecha").value,
      maquina: maquinariaSelect.value,
      tipo: document.getElementById("tipo").value,
      obs: document.getElementById("obs").value,
      horas: calcularHoras(),
      foto: file ? reader.result : ""
    };

    registros.push(nuevo);
    localStorage.setItem("registros", JSON.stringify(registros));
    cargarTabla();
    e.target.reset();
    document.getElementById("horasDisplay").innerText = "0.00";
  };

  if (file) reader.readAsDataURL(file);
  else reader.onloadend();
});

// ============================
// MOSTRAR TABLA
// ============================

function cargarTabla() {
  tabla.innerHTML = "";
  registros.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.fecha}</td>
      <td>${r.maquina}</td>
      <td>${r.tipo}</td>
      <td>${r.obs}</td>
      <td>${r.horas.toFixed(2)}</td>
      <td>${r.foto ? `<img src="${r.foto}" width="50" />` : "-"}</td>
    `;
    tabla.appendChild(tr);
  });
}
cargarTabla();

// ============================
// AGREGAR NUEVA MAQUINA
// ============================

const addMachineBtn = document.getElementById("addMachineBtn");
const machineModal = document.getElementById("machineModal");
const saveMachineBtn = document.getElementById("saveMachineBtn");
const closeMachineBtn = document.getElementById("closeMachineBtn");

// Garantizar que el modal SIEMPRE inicie oculto
machineModal.classList.add("hidden");

addMachineBtn.addEventListener("click", () => {
  machineModal.classList.remove("hidden");
});

closeMachineBtn.addEventListener("click", () => {
  machineModal.classList.add("hidden");
});

saveMachineBtn.addEventListener("click", () => {
  const input = document.getElementById("newMachineName");
  if (input.value.trim()) {
    maquinas.push(input.value.trim());
    localStorage.setItem("maquinas", JSON.stringify(maquinas));
    actualizarListaMaquinaria();
    input.value = "";
    machineModal.classList.add("hidden");
  }
});

// ============================
// EXPORTAR A CSV COMPATIBLE
// ============================

document.getElementById("exportBtn").addEventListener("click", () => {
  let csv = "Fecha,Maquina,Tipo,Obs,Horas\n";
  registros.forEach(r => {
    csv += `${r.fecha},${r.maquina},${r.tipo},${r.obs},${r.horas.toFixed(2)}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte_maquinaria.csv";
  a.click();
});

// ============================
// REPORTE SEMANAL POR MAQUINA
// ============================

document.getElementById("reportBtn").addEventListener("click", () => {
  let msg = "Horas semanales por máquina:\n\n";
  let mapa = {};

  registros.forEach(r => {
    mapa[r.maquina] = (mapa[r.maquina] || 0) + r.horas;
  });

  Object.entries(mapa).forEach(([maq, hrs]) => {
    msg += `${maq}: ${hrs.toFixed(2)} hrs\n`;
  });

  alert(msg);
});
#lockScreen {
  z-index: 9999;
}

#machineModal {
  z-index: 9998;
}
