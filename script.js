/* ============================================================
  script.js - Control de Maquinarias y Registros (mejorado)
  Ahora incluye: Totales por máquina para resultados mostrados,
  y asegura que búsqueda, edición y eliminación funcionen en filtrados.
============================================================ */

(() => {
  // ---- Keys localStorage
  const KEY_M = "maquinas";
  const KEY_R = "registros";
  const PIN = "7285";

  // ---- State
  let maquinas = JSON.parse(localStorage.getItem(KEY_M) || "[]");
  let registros = JSON.parse(localStorage.getItem(KEY_R) || "[]");
  let editingRegistroId = null; // id para editar registro (timestamp)
  let editingMachineIndex = null; // index para editar máquina

  // ---- Helper to get elements safely
  const $ = id => document.getElementById(id);
  const qs = sel => document.querySelector(sel);

  // ---- Elements
  const lockScreen = $("lockScreen");
  const pinInput = $("pinInput");
  const unlockBtn = $("unlockBtn");
  const clearDataBtn = $("clearDataBtn");
  const app = $("app");

  const maquinaSelect = $("maquinaria");
  const registroForm = $("registroForm");
  const fechaEl = $("fecha");
  const inicioMEl = $("inicioM");
  const inicioTEl = $("inicioT");
  const tipoEl = $("tipo");
  const obsEl = $("obs");
  const fotoEl = $("foto");
  const horasDisplay = $("horasDisplay");
  const resetFormBtn = $("resetForm");

  const tablaBody = qs("#tabla tbody");
  const tablaEl = $("tabla");

  // Search elements (records)
  const searchDateExact = $("searchDateExact");
  const searchExactBtn = $("searchExactBtn");
  const searchDateFrom = $("searchDateFrom");
  const searchDateTo = $("searchDateTo");
  const searchRangeBtn = $("searchRangeBtn");
  const clearSearchBtn = $("clearSearchBtn");

  // Machines page elements
  const openMachinesPage = $("openMachinesPage");
  const machinesPage = $("machinesPage");
  const closeMachinesPage = $("closeMachinesPage");
  const addMachineBtn = $("addMachineBtn");
  const addMachineFromPage = $("addMachineFromPage");
  const buscarMaquina = $("buscarMaquina");
  const listaMaquinas = $("listaMaquinas");
  const machineModal = $("machineModal");
  const newMachineName = $("newMachineName");
  const saveMachineBtn = $("saveMachineBtn");
  const closeMachineBtn = $("closeMachineBtn");

  // Export / report
  const exportBtn = $("exportBtn");
  const reportBtn = $("reportBtn");

  // Ensure default machines
  function ensureDefaultMachines() {
    if (!maquinas || maquinas.length === 0) {
      maquinas = ["Excavadora","Retroexcavadora","Volquete","Motoniveladora","Rodillo"];
      maquinas.sort((a,b)=> a.localeCompare(b,'es',{sensitivity:'base'}));
      localStorage.setItem(KEY_M, JSON.stringify(maquinas));
    }
  }
  ensureDefaultMachines();

  // Save helpers
  function saveMachines() { localStorage.setItem(KEY_M, JSON.stringify(maquinas)); }
  function saveRegistros() { localStorage.setItem(KEY_R, JSON.stringify(registros)); }

  // Ensure totals container exists (will be placed after table)
  function ensureTotalsContainer() {
    if (!tablaEl) return null;
    let c = $("totalsContainer");
    if (!c) {
      c = document.createElement("div");
      c.id = "totalsContainer";
      c.style = "margin-top:10px;padding:8px;background:#f7f7f7;border-radius:6px;color:#222";
      tablaEl.parentNode.insertBefore(c, tablaEl.nextSibling);
    }
    return c;
  }

  // ---------- PIN handling
  if (unlockBtn && pinInput && lockScreen && app) {
    unlockBtn.addEventListener("click", () => {
      const val = (pinInput.value || "").trim();
      if (val === PIN) {
        lockScreen.classList.add("hidden");
        app.classList.remove("hidden");
        populateMachineSelect();
        renderRegistros(registros);
      } else {
        alert("PIN incorrecto");
        pinInput.value = "";
      }
    });
  }
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", () => {
      if (!confirm("¿Seguro que deseas borrar TODOS los datos?")) return;
      localStorage.removeItem(KEY_M);
      localStorage.removeItem(KEY_R);
      maquinas = [];
      registros = [];
      ensureDefaultMachines();
      populateMachineSelect();
      renderMachineList();
      renderRegistros(registros);
      alert("Datos borrados");
    });
  }

  // ---------- UI helpers
  function populateMachineSelect() {
    if (!maquinaSelect) return;
    maquinaSelect.innerHTML = "";
    maquinas.slice().sort((a,b)=> a.localeCompare(b,'es',{sensitivity:'base'})).forEach(m => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      maquinaSelect.appendChild(opt);
    });
  }

  // Renders registros list into table and updates totalsContainer
  function renderRegistros(list) {
    if (!tablaBody) return;
    tablaBody.innerHTML = "";
    const arr = Array.isArray(list) ? list : registros;
    if (!arr || arr.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="7" style="text-align:center;color:#666">No hay registros</td>`;
      tablaBody.appendChild(tr);
      updateTotalsDisplay([]); // clear totals
      return;
    }

    arr.forEach(r => {
      const tr = document.createElement("tr");
      const fotoHtml = r.foto ? `<img src="${r.foto}" style="width:60px;height:40px;object-fit:cover;border-radius:4px">` : "-";
      tr.innerHTML = `
        <td>${r.fecha || ""}</td>
        <td>${r.maquina || ""}</td>
        <td>${r.tipo || ""}</td>
        <td>${r.obs || ""}</td>
        <td>${(typeof r.horas === "number") ? r.horas.toFixed(2) : r.horas}</td>
        <td>${fotoHtml}</td>
        <td>
          <button class="editRecord" data-id="${r.id}">Editar</button>
          <button class="deleteRecord" data-id="${r.id}">Eliminar</button>
        </td>
      `;
      tablaBody.appendChild(tr);
    });

    // attach actions (works for filtered lists too)
    tablaBody.querySelectorAll(".editRecord").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        editarRegistro(id);
      });
    });
    tablaBody.querySelectorAll(".deleteRecord").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        eliminarRegistro(id);
      });
    });

    // update totals for displayed arr
    updateTotalsDisplay(arr);
  }

  // ---------- Totals by machine (for displayed records)
  function updateTotalsDisplay(arr) {
    const container = ensureTotalsContainer();
    if (!container) return;
    if (!arr || arr.length === 0) {
      container.innerHTML = "<strong>Totales:</strong> no hay registros seleccionados.";
      return;
    }
    // sum hours per machine
    const totals = {};
    let grand = 0;
    arr.forEach(r => {
      const m = r.maquina || "Sin máquina";
      const h = Number(r.horas) || 0;
      totals[m] = (totals[m] || 0) + h;
      grand += h;
    });

    // build HTML
    let html = `<strong>Totales por máquina (resultados mostrados):</strong><br><ul style="margin:6px 0 0 18px;">`;
    Object.keys(totals).sort((a,b)=> a.localeCompare(b,'es',{sensitivity:'base'})).forEach(k => {
      html += `<li>${k}: ${totals[k].toFixed(2)} h</li>`;
    });
    html += `</ul><div style="margin-top:6px;"><strong>Total general:</strong> ${grand.toFixed(2)} h</div>`;
    container.innerHTML = html;
  }

  // ---------- Add / Edit registro
  function calcularHoras(inM, inT) {
    if (!inM || !inT) return 0;
    const [mh,mm] = inM.split(":").map(Number);
    const [th,tm] = inT.split(":").map(Number);
    let diff = ((th*60+tm)-(mh*60+mm))/60 - 1;
    return diff > 0 ? +diff.toFixed(2) : 0;
  }

  function mostrarHoras() {
    if (!horasDisplay) return;
    horasDisplay.textContent = calcularHoras(inicioMEl.value, inicioTEl.value).toFixed(2);
  }
  if (inicioMEl) inicioMEl.addEventListener("change", mostrarHoras);
  if (inicioTEl) inicioTEl.addEventListener("change", mostrarHoras);

  // Submit registro
  if (registroForm) {
    registroForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fecha = (fechaEl && fechaEl.value) || new Date().toISOString().slice(0,10);
      const maquina = (maquinaSelect && maquinaSelect.value) || (maquinas[0] || "");
      const inicioM = (inicioMEl && inicioMEl.value) || "";
      const inicioT = (inicioTEl && inicioTEl.value) || "";
      const tipo = (tipoEl && tipoEl.value) || "";
      const obs = (obsEl && obsEl.value) || "";
      const horas = calcularHoras(inicioM,inicioT);

      const file = (fotoEl && fotoEl.files && fotoEl.files[0]) ? fotoEl.files[0] : null;

      const guardarRegistro = (fotoBase64) => {
        if (editingRegistroId) {
          // replace existing
          registros = registros.map(r => {
            if (String(r.id) === String(editingRegistroId)) {
              return { id: r.id, fecha, maquina, inicioM, inicioT, tipo, obs, horas, foto: fotoBase64 !== undefined ? fotoBase64 : r.foto };
            }
            return r;
          });
          editingRegistroId = null;
        } else {
          const nuevo = { id: Date.now(), fecha, maquina, inicioM, inicioT, tipo, obs, horas, foto: fotoBase64 || "" };
          registros.push(nuevo);
        }
        saveRegistros();
        renderRegistros(registros);
        registroForm.reset();
        if (horasDisplay) horasDisplay.textContent = "0.00";
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => guardarRegistro(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        // if editing and no new file selected, preserve previous foto (handled in guardarRegistro above)
        guardarRegistro(undefined);
      }
    });
  }

  // Edit / Delete registro
  function editarRegistro(id) {
    const r = registros.find(x => String(x.id) === String(id));
    if (!r) return alert("Registro no encontrado");
    editingRegistroId = r.id;
    if (fechaEl) fechaEl.value = r.fecha;
    if (maquinaSelect) maquinaSelect.value = r.maquina;
    if (inicioMEl) inicioMEl.value = r.inicioM || "";
    if (inicioTEl) inicioTEl.value = r.inicioT || "";
    if (tipoEl) tipoEl.value = r.tipo || "";
    if (obsEl) obsEl.value = r.obs || "";
    // cannot pre-fill file input for security; inform user
    alert("Se cargaron datos para edición. Si desea mantener la foto actual, deje el campo Foto vacío al guardar.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    mostrarHoras();
  }

  function eliminarRegistro(id) {
    if (!confirm("¿Eliminar este registro?")) return;
    registros = registros.filter(r => String(r.id) !== String(id));
    saveRegistros();
    renderRegistros(registros);
  }

  // ---------- Search records: exact date and range
  if (searchExactBtn) searchExactBtn.addEventListener("click", () => {
    const f = (searchDateExact && searchDateExact.value) || "";
    if (!f) return renderRegistros(registros);
    const filtered = registros.filter(r => r.fecha === f);
    renderRegistros(filtered);
  });

  if (searchRangeBtn) searchRangeBtn.addEventListener("click", () => {
    const from = (searchDateFrom && searchDateFrom.value) || "";
    const to = (searchDateTo && searchDateTo.value) || "";
    if (!from || !to) return alert("Selecciona ambas fechas para el rango");
    const fromD = new Date(from);
    const toD = new Date(to);
    if (isNaN(fromD) || isNaN(toD)) return alert("Fechas inválidas");
    const filtered = registros.filter(r => {
      const d = new Date(r.fecha);
      return d >= fromD && d <= toD;
    });
    renderRegistros(filtered);
  });

  if (clearSearchBtn) clearSearchBtn.addEventListener("click", () => {
    if (searchDateExact) searchDateExact.value = "";
    if (searchDateFrom) searchDateFrom.value = "";
    if (searchDateTo) searchDateTo.value = "";
    renderRegistros(registros);
  });

  // ---------- Machines page: render, search, add, edit, delete
  function renderMachineList(list) {
    if (!listaMaquinas) return;
    listaMaquinas.innerHTML = "";
    const arr = Array.isArray(list) ? list : maquinas.slice().sort((a,b)=> a.localeCompare(b,'es',{sensitivity:'base'}));
    if (arr.length === 0) {
      listaMaquinas.innerHTML = "<div style='color:#666'>No hay maquinarias</div>";
      return;
    }
    arr.forEach(name => {
      const idx = maquinas.indexOf(name);
      const row = document.createElement("div");
      row.className = "machineRow";
      row.style = "display:flex;justify-content:space-between;align-items:center;padding:8px;background:#f5f5f5;border-radius:6px";
      row.innerHTML = `<span>${name}</span>
        <div style="display:flex;gap:6px">
          <button class="editM" data-id="${idx}">Editar</button>
          <button class="delM" data-id="${idx}">Eliminar</button>
        </div>`;
      listaMaquinas.appendChild(row);
    });

    // attach events
    listaMaquinas.querySelectorAll(".editM").forEach(b => {
      b.onclick = () => {
        editingMachineIndex = Number(b.dataset.id);
        if (newMachineName) newMachineName.value = maquinas[editingMachineIndex];
        if (machineModal) machineModal.classList.remove("hidden");
      };
    });

    listaMaquinas.querySelectorAll(".delM").forEach(b => {
      b.onclick = () => {
        const id = Number(b.dataset.id);
        if (!confirm("Eliminar esta maquinaria?")) return;
        maquinas.splice(id,1);
        saveMachines();
We need to finish assistant message: continue code—user pasted truncated script ends at saveMachines(); need to complete rest. Provide rest of code to end IIFE finishing render machine list deletion and other handlers. Continue using prior pattern from earlier full scripts. Must ensure functions saveMachines defined earlier? We didn't define saveMachines earlier in this script; earlier we had saveMachines and saveRegistros at top. But in current code we have saveMachines? At top we defined saveMachines? Yes we earlier had saveMachines function defined? Checking above: we had saveMachines declared near top? I see earlier "function saveMachines() { localStorage.setItem(KEY_M, JSON.stringify(maquinas)); }" — yes included earlier in previous version; in this user's pasted code near beginning they had saveMachines definition earlier? In user's provided script at top they had function saveMachines() earlier? Yes I see in user's original they had function saveMachines() earlier after modal save/close; but in this pasted version saveMachines and saveRegistros defined twice? In our updated script we defined saveMachines at top? At top we defined saveMachines earlier: after ensureDefaultMachines, we defined saveMachines and saveRegistros. Looking back: at start we had functions "function saveMachines() { localStorage.setItem(KEY_M, JSON.stringify(maquinas)); } function saveRegistros() { localStorage.setItem(KEY_R, JSON.stringify(registros)); }" — yes.

So continue code: after deletion saveMachines(); populateMachineSelect(); renderMachineList(); }); then closing renderMachineList function. Then remaining code: search machines handler, open/close machines page handlers, modal openers, modal save/close, populateMachineSelect probably already defined? We have populateMachineSelect earlier yes. Continue with modal openers: addMachineBtn etc. Then modal save/close: saveMachineBtn addEventListener uses newMachineName and editingMachineIndex to push change and then saveMachines(); populateMachineSelect(); renderMachineList(); close modal.

Then export/report event listeners already present earlier in user's pasted code? In this paste, exportBtn and reportBtn handlers exist later; but since we truncated earlier, need to finish: after renderMachineList ends, continue with buscarMaquina listener, open/close page, modal openers and save etc, and ensure initial calls: ensureDefaultMachines(); populateMachineSelect(); renderRegistros(registros); renderMachineList(); close IIFE.

We must ensure not duplicating definitions. Let's craft the rest of script carefully building on what was pasted until the cut. The last visible line is "saveMachines();" then truncated. We'll produce full remainder.

Also mention to user to replace script.js with full updated version (we provided earlier improved one). But they already pasted version. We'll respond by giving the completed script (full) — but we should merge our earlier improved script with their pasted portion. Simpler: deliver a complete, corrected script.js entirely (not a patch) and instruct to replace file. We already earlier provided a full improved script in previous assistant messages; that can be used. So respond: give final complete script.js and instructions. Keep concise.

Let's produce final code — reuse earlier "improved" script from previous assistant message that included totals and robust handlers. Provide steps to replace and test, mention to clear cache. Also provide debugging tips.

I'll deliver final code and steps.
