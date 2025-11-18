/* ============================================================
   VARIABLES GLOBALES
============================================================ */
const PIN = "7285";
let maquinas = JSON.parse(localStorage.getItem("maquinas")) || [];
let registros = JSON.parse(localStorage.getItem("registros")) || [];
let editandoID = null;

/* ============================================================
   INICIO: PANTALLA DE PIN
============================================================ */
const lockScreen = document.getElementById("lockScreen");
const app = document.getElementById("app");

document.getElementById("unlockBtn").onclick = () => {
  const pin = document.getElementById("pinInput").value;
  if (pin === PIN) {
    lockScreen.classList.add("hidden");
    app.classList.remove("hidden");
    cargarMaquinasEnSelect();
    refrescarTablaRegistros();
  } else {
    alert("PIN incorrecto");
  }
};

document.getElementById("clearDataBtn").onclick = () => {
  if (confirm("¿Seguro que deseas borrar TODO?")) {
    localStorage.clear();
    location.reload();
  }
};

/* ============================================================
   MAQUINARIAS: ABRIR PÁGINA / CERRAR
============================================================ */
const machinesPage = document.getElementById("machinesPage");

document.getElementById("openMachinesPage").onclick = () => {
  app.classList.add("hidden");
  machinesPage.classList.remove("hidden");
  mostrarListaMaquinas();
};

document.getElementById("closeMachinesPage").onclick = () => {
  machinesPage.classList.add("hidden");
  app.classList.remove("hidden");
  cargarMaquinasEnSelect();
};

/* ============================================================
   MODAL AGREGAR MAQUINARIA
============================================================ */
const modal = document.getElementById("machineModal");
document.getElementById("addMachineBtn").onclick = () => abrirModal();
document.getElementById("addMachineFromPage").onclick = () => abrirModal();

function abrirModal() {
  document.getElementById("newMachineName").value = "";
  editandoID = null;
  modal.classList.remove("hidden");
}

document.getElementById("closeMachineBtn").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("saveMachineBtn").onclick = () => {
  const nombre = document.getElementById("newMachineName").value.trim();
  if (nombre === "") return alert("Escribe un nombre");

  if (editandoID !== null) {
    maquinas[editandoID] = nombre;
  } else {
    maquinas.push(nombre);
  }

  maquinas.sort(); // Orden A-Z

  localStorage.setItem("maquinas", JSON.stringify(maquinas));
  modal.classList.add("hidden");

  cargarMaquinasEnSelect();
  mostrarListaMaquinas();

  alert("Maquinaria guardada");
};

/* ============================================================
   LISTA DE MAQUINARIAS: MOSTRAR, EDITAR, ELIMINAR
============================================================ */
function mostrarListaMaquinas() {
  const cont = document.getElementById("listaMaquinas");
  cont.innerHTML = "";

  maquinas.forEach((m, index) => {
    const div = document.createElement("div");
    div.className = "machineRow";
    div.innerHTML = `
      <span>${m}</span>
      <button class="editM" data-id="${index}">Editar</button>
      <button class="delM" data-id="${index}">Eliminar</button>
    `;
    cont.appendChild(div);
  });

  // Editar maquinaria
  document.querySelectorAll(".editM").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      editandoID = id;
      document.getElementById("newMachineName").value = maquinas[id];
      modal.classList.remove("hidden");
    };
  });

  // Eliminar maquinaria
  document.querySelectorAll(".delM").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (confirm("¿Eliminar maquinaria?")) {
        maquinas.splice(id, 1);
        localStorage.setItem("maquinas", JSON.stringify(maquinas));
        mostrarListaMaquinas();
        cargarMaquinasEnSelect();
      }
    };
  });
}

/* ============================================================
   BUSCADOR DE MAQUINARIAS
============================================================ */
document.getElementById("buscarMaquina").addEventListener("input", filtrarMaquinas);

function filtrarMaquinas() {
  const txt = document.getElementById("buscarMaquina").value.toLowerCase();
  const filtradas = maquinas.filter(m => m.toLowerCase().includes(txt));

  actualizarListaFiltrada(filtradas);
}

function actualizarListaFiltrada(lista) {
  const cont = document.getElementById("listaMaquinas");
  cont.innerHTML = "";

  lista.forEach(m => {
    const idReal = maquinas.indexOf(m);
    const div = document.createElement("div");
    div.className = "machineRow";
    div.innerHTML = `
      <span>${m}</span>
      <button class="editM" data-id="${idReal}">Editar</button>
      <button class="delM" data-id="${idReal}">Eliminar</button>
    `;
    cont.appendChild(div);
  });

  // Mantener funcionamiento
  document.querySelectorAll(".editM").forEach(btn => {
    btn.onclick = () => {
      editandoID = btn.dataset.id;
      document.getElementById("newMachineName").value = maquinas[editandoID];
      modal.classList.remove("hidden");
    };
  });

  document.querySelectorAll(".delM").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      if (confirm("¿Eliminar maquinaria?")) {
        maquinas.splice(id, 1);
        localStorage.setItem("maquinas", JSON.stringify(maquinas));
        mostrarListaMaquinas();
        cargarMaquinasEnSelect();
      }
    };
  });
}

/* ============================================================
   CARGAR MAQUINAS EN SELECT PRINCIPAL
============================================================ */
function cargarMaquinasEnSelect() {
  const sel = document.getElementById("maquinaria");
  sel.innerHTML = "";

  maquinas.forEach(m => {
    const op = document.createElement("option");
    op.value = m;
    op.textContent = m;
    sel.appendChild(op);
  });
}

/* ============================================================
   REGISTRO DE TRABAJOS
============================================================ */
document.getElementById("registroForm").onsubmit = e => {
  e.preventDefault();

  const fecha = document.getElementById("fecha").value;
  const maq = document.getElementById("maquinaria").value;
  const inicioM = document.getElementById("inicioM").value;
  const inicioT = document.getElementById("inicioT").value;
  const tipo = document.getElementById("tipo").value;
  const obs = document.getElementById("obs").value;
  const foto = document.getElementById("foto").files[0];

  let horas = 0;

  if (inicioM) horas += 4; 
  if (inicioT) horas += 4;

  const registro = {
    fecha,
    maq,
    tipo,
    obs,
    horas,
    foto: foto ? URL.createObjectURL(foto) : null
  };

  registros.push(registro);
  localStorage.setItem("registros", JSON.stringify(registros));

  refrescarTablaRegistros();

  alert("Registro guardado");
};

function refrescarTablaRegistros() {
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";

  registros.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.fecha}</td>
      <td>${r.maq}</td>
      <td>${r.tipo}</td>
      <td>${r.obs}</td>
      <td>${r.horas}</td>
      <td>${r.foto ? "<img src='" + r.foto + "' width='50'>" : "-"}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ============================================================
   EXPORTAR CSV
============================================================ */
document.getElementById("exportBtn").onclick = () => {
  let csv = "Fecha,Maquinaria,Tipo,Obs,Horas\n";
  registros.forEach(r => {
    csv += `${r.fecha},${r.maq},${r.tipo},${r.obs},${r.horas}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "registros.csv";
  a.click();
};

/* ============================================================
   REPORTE SEMANAL
============================================================ */
document.getElementById("reportBtn").onclick = () => {
  let total = 0;
  registros.forEach(r => total += r.horas);
  alert("Total horas acumuladas: " + total);
};
