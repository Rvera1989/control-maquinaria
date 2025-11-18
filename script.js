/* ===================================================
   1. BLOQUE DE SEGURIDAD (PANTALLA DE PIN)
   =================================================== */

const CORRECT_PIN = "7285";
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
    pinInput.value = "";
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

/* ===================================================
   2. DATOS LOCALES
   =================================================== */

let registros = JSON.parse(localStorage.getItem("registros") || "[]");
let maquinas = JSON.parse(localStorage.getItem("maquinas") || "[]");

const maquinariaSelect = document.getElementById("maquinaria");
const tabla = document.querySelector("#tabla tbody");

/* ===================================================
   3. LISTA DE MAQUINARIA + EDICIÓN / ELIMINAR
   =================================================== */

function actualizarListaMaquinaria() {
  maquinariaSelect.innerHTML = "";

  maquinas.forEach((m, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = m;
    maquinariaSelect.appendChild(opt);
  });

  actualizarTablaMaquinas();
}

/* ===== Tabla donde se puede editar o eliminar máquinas ===== */

function actualizarTablaMaquinas() {
  const cont = document.querySelector("#listaMaquinas");
  if (!cont) return;

  cont.innerHTML = "";

  maquinas.forEach((m, index) => {
    const div = document.createElement("div");
    div.className = "machineRow";
    div.innerHTML = `
      <span>${m}</span>
      <button class="editM" data-id="${index}">✏️</button>
      <button class="delM" data-id="${index}">🗑️</button>
    `;
    cont.appendChild(div);
  });

  document.querySelectorAll(".editM").forEach(btn => {
    btn.addEventListener("click", () => editarMaquina(btn.dataset.id));
  });

  document.querySelectorAll(".delM").forEach(btn => {
    btn.addEventListener("click", () => eliminarMaquina(btn.dataset.id));
  });
}

function editarMaquina(id) {
  const nuevo = prompt("Nuevo nombre de la maquinaria:", maquinas[id]);
  if (!nuevo) return;

  maquinas[id] = nuevo.trim();
  localStorage.setItem("maquinas", JSON.stringify(maquinas));
  actualizarListaMaquinaria();
}

function eliminarMaquina(id) {
  if (!confirm("¿Eliminar esta maquinaria?")) return;

  maquinas.splice(id, 1);
  localStorage.setItem("maquinas", JSON.stringify(maquinas));
  actualizarListaMaquinaria();
}

actualizarListaMaquinaria();

/* ===================================================
   4. CÁLCULO DE HORAS
   =================================================== */

function calcularHoras() {
  const inicioM = document.getElementById("inicioM").value;
  const inicioT = document.getElementById("inicioT").value;

  if (!inicioM || !inicioT) return 0;

  const hM = parseFloat(inicioM.replace(":", ".")) || 0;
  const hT = parseFloat(inicioT.replace(":", ".")) || 0;

  let horas = (hT - hM) - 1;
  return horas > 0 ? horas : 0;
}

function mostrarHoras() {
  document.getElementById("horasDisplay").innerText = calcularHoras().toFixed(2);
}

document.getElementById("inicioM").addEventListener("change", mostrarHoras);
document.getElementById("inicioT").addEventListener("change", mostrarHoras);

/* ===================================================
   5. GUARDAR REGISTRO + FOTO
   =================================================== */

document.getElementById("registroForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const reader = new FileReader();
  const file = document.getElementById("foto").files[0];

  reader.onloadend = () => {
    const nuevo = {
      fecha: document.getElementById("fecha").value,
      maquina: maquinas[maquinariaSelect.value],
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

/* ===================================================
   6. TABLA DE REGISTROS
   =================================================== */

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
      <td>${r.foto ? `<img src="${r.foto}" width="50">` : "-"}</td>
    `;
    tabla.appendChild(tr);
  });
}
cargarTabla();

/* ===================================================
   7. MODAL AGREGAR MAQUINA
   =================================================== */

const addMachineBtn = document.getElementById("addMachineBtn");
const machineModal = document.getElementById("machineModal");
const saveMachineBtn = document.getElementById("saveMachineBtn");
const closeMachineBtn = document.getElementById("closeMachineBtn");

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
  } else {
    alert("Ingresa un nombre válido.");
  }
});

/* ===================================================
   8. REPORTES
   =================================================== */

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
