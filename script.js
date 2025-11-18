/* script.js
   Control de Maquinaria - almacenamiento en localStorage
   - Claves usadas:
     cm_machines  -> array [{id, name}]
     cm_records   -> array [{id, fecha, machineId, tipo, obs, horas, fotoDataUrl, meta...}]
     cm_pin       -> string "1030" (fijo para todos los dispositivos)
*/

(() => {
  // ---------- Helpers ----------
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

  // localStorage helpers
  const load = (k, fallback) => {
    try {
      const v = localStorage.getItem(k);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // Keys
  const KEY_M = 'cm_machines';
  const KEY_R = 'cm_records';
  const KEY_PIN = 'cm_pin';

  // Initialize defaults
  if (!localStorage.getItem(KEY_M)) save(KEY_M, []);
  if (!localStorage.getItem(KEY_R)) save(KEY_R, []);

  // 🔒 PIN FIJO: siempre forzar a 1030 en todos los dispositivos
  save(KEY_PIN, '1030');

  // ---------- Elements ----------
  const lockScreen = qs('#lockScreen');
  const app = qs('#app');
  const unlockBtn = qs('#unlockBtn');
  const pinInput = qs('#pinInput');
  const clearDataBtn = qs('#clearDataBtn');

  // Nav buttons
  const openHome = qs('#openHome');
  const openMachinesPage = qs('#openMachinesPage');
  const addMachineBtn = qs('#addMachineBtn');
  const reportBtn = qs('#reportBtn');
  const exportBtn = qs('#exportBtn');

  // Form elements
  const registroForm = qs('#registroForm');
  const fechaEl = qs('#fecha');
  const maquinariaSel = qs('#maquinaria');
  const inicioM = qs('#inicioM'); const finM = qs('#finM');
  const inicioT = qs('#inicioT'); const finT = qs('#finT');
  const tipoEl = qs('#tipo'); const obsEl = qs('#obs');
  const fotoEl = qs('#foto');
  const horasDisplay = qs('#horasDisplay');
  const resetFormBtn = qs('#resetForm');
  const exportSingleCSV = qs('#exportSingleCSV');

  // Table
  const tablaBody = qs('#tabla tbody');
  const noRecords = qs('#noRecords');

  // Search
  const searchDateExact = qs('#searchDateExact');
  const searchExactBtn = qs('#searchExactBtn');
  const searchFrom = qs('#searchDateFrom');
  const searchTo = qs('#searchDateTo');
  const searchRangeBtn = qs('#searchRangeBtn');
  const clearSearchBtn = qs('#clearSearchBtn');

  // Machines page
  const machinesPage = qs('#machinesPage');
  const listaMaquinas = qs('#listaMaquinas');
  const buscarMaquina = qs('#buscarMaquina');
  const addMachineFromPage = qs('#addMachineFromPage');
  const closeMachinesPage = qs('#closeMachinesPage');

  // Modal
  const machineModal = qs('#machineModal');
  const newMachineName = qs('#newMachineName');
  const saveMachineBtn = qs('#saveMachineBtn');
  const closeMachineBtn = qs('#closeMachineBtn');
  const machineModalTitle = qs('#machineModalTitle');

  // State
  let machines = load(KEY_M, []);
  let records = load(KEY_R, []);
  let editingMachineId = null;
  let editingRecordId = null;

  // ---------- UI Helpers ----------
  const show = el => el.classList.remove('hidden');
  const hide = el => el.classList.add('hidden');

  const showApp = () => { hide(lockScreen); show(app); };
  const showLock = () => { show(lockScreen); hide(app); };

  // ---------- PIN LOGIN ----------
  unlockBtn.addEventListener('click', () => {
    const pin = localStorage.getItem(KEY_PIN); // siempre 1030
    if (pinInput.value === pin) {
      pinInput.value = '';
      showApp();
      renderAll();
    } else {
      alert('PIN incorrecto');
    }
  });

  clearDataBtn.addEventListener('click', () => {
    if (!confirm('¿Seguro que deseas borrar TODOS los datos? Esto no se puede deshacer.')) return;
    localStorage.removeItem(KEY_M);
    localStorage.removeItem(KEY_R);
    machines = []; records = [];
    save(KEY_M, machines); 
    save(KEY_R, records);
    alert('Datos borrados.');
    renderAll();
  });

  // ---------- Navigation ----------
  openHome.addEventListener('click', () => {
    hide(machinesPage);
    show(qs('#homePage'));
  });

  openMachinesPage.addEventListener('click', () => {
    show(machinesPage);
    hide(qs('#homePage'));
    renderMachinesList();
  });

  addMachineBtn.addEventListener('click', () => openAddMachineModal());
  addMachineFromPage.addEventListener('click', () => openAddMachineModal());
  closeMachinesPage.addEventListener('click', () => {
    hide(machinesPage);
    show(qs('#homePage'));
  });

  exportBtn.addEventListener('click', () => {
    exportCSV(records, 'registros_control_maquinaria.csv');
  });

  exportSingleCSV.addEventListener('click', () => {
    exportCSV(records, 'registros_control_maquinaria.csv');
  });

  // ---------- Machines CRUD ----------
  function openAddMachineModal(name = '', id = null) {
    editingMachineId = id;
    newMachineName.value = name;
    machineModalTitle.textContent = id ? 'Editar Maquinaria' : 'Agregar Maquinaria';
    show(machineModal);
    newMachineName.focus();
  }

  closeMachineBtn.addEventListener('click', () => {
    hide(machineModal);
    editingMachineId = null;
  });

  saveMachineBtn.addEventListener('click', () => {
    const name = newMachineName.value.trim();
    if (!name) { alert('Ingrese un nombre válido'); return; }

    if (editingMachineId) {
      machines = machines.map(m => m.id === editingMachineId ? {...m, name} : m);
    } else {
      machines.push({ id: uid(), name });
    }

    save(KEY_M, machines);
    hide(machineModal);
    renderMachinesList();
    populateMachinesSelect();
  });

  function renderMachinesList(filter = '') {
    listaMaquinas.innerHTML = '';
    const list = machines.filter(m => m.name.toLowerCase().includes(filter.toLowerCase()));

    if (list.length === 0) {
      listaMaquinas.innerHTML = '<div class="muted small">No hay maquinarias. Agrega una.</div>';
      return;
    }

    list.forEach(m => {
      const div = document.createElement('div');
      div.className = 'machine-item';
      div.innerHTML = `
        <div><strong>${escapeHtml(m.name)}</strong></div>
        <div class="row gap">
          <button class="btn" data-edit="${m.id}">Editar</button>
          <button class="btn danger" data-delete="${m.id}">Eliminar</button>
        </div>
      `;
      listaMaquinas.appendChild(div);
    });

    qsa('button[data-edit]', listaMaquinas).forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-edit');
        const mach = machines.find(x => x.id === id);
        if (mach) openAddMachineModal(mach.name, mach.id);
      });
    });

    qsa('button[data-delete]', listaMaquinas).forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-delete');
        if (!confirm('Eliminar maquinaria y sus registros relacionados?')) return;

        machines = machines.filter(x => x.id !== id);
        records = records.filter(r => r.machineId !== id);

        save(KEY_M, machines);
        save(KEY_R, records);
        renderMachinesList();
        populateMachinesSelect();
        renderRecordsTable(records);
      });
    });
  }

  buscarMaquina.addEventListener('input', () => {
    renderMachinesList(buscarMaquina.value.trim());
  });

  function populateMachinesSelect() {
    maquinariaSel.innerHTML = '<option value="">-- Seleccionar --</option>';
    machines.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      maquinariaSel.appendChild(opt);
    });
  }

  // ---------- Records (Registros) ----------
  function timeToMinutes(t) {
    if (!t) return null;
    const [hh, mm] = t.split(':').map(Number);
    return hh * 60 + mm;
  }

  function calcHoras() {
    const a = timeToMinutes(inicioM.value);
    const b = timeToMinutes(finM.value);
    const c = timeToMinutes(inicioT.value);
    const d = timeToMinutes(finT.value);
    let total = 0;

    if (a !== null && b !== null && b > a) total += (b - a);
    if (c !== null && d !== null && d > c) total += (d - c);

    const hours = +(total / 60).toFixed(2);
    horasDisplay.textContent = hours.toFixed(2);
    return hours;
  }

  [inicioM, finM, inicioT, finT].forEach(i => i.addEventListener('change', calcHoras));

  function imageFileToDataUrl(file, maxWidth = 1200, maxHeight = 1200) {
    return new Promise((res) => {
      if (!file) return res(null);
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          const ratio = Math.min(1, maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio); h = Math.round(h * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          res(dataUrl);
        };
        img.onerror = () => res(null);
        img.src = e.target.result;
      };
      reader.onerror = () => res(null);
      reader.readAsDataURL(file);
    });
  }

  registroForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fecha = fechaEl.value;
    const machineId = maquinariaSel.value;

    if (!fecha || !machineId) {
      alert('Seleccione fecha y maquinaria');
      return;
    }

    const tipo = tipoEl.value.trim();
    const obs = obsEl.value.trim();
    const horas = calcHoras();
    const fotoFile = fotoEl.files && fotoEl.files[0] ? fotoEl.files[0] : null;
    const fotoDataUrl = await imageFileToDataUrl(fotoFile);

    if (editingRecordId) {
      records = records.map(r => r.id === editingRecordId ? {
        ...r, fecha, machineId, tipo, obs, horas, fotoDataUrl, updatedAt: new Date().toISOString()
      } : r);
      editingRecordId = null;
    } else {
      records.push({
        id: uid(),
        fecha,
        machineId,
        tipo,
        obs,
        horas,
        fotoDataUrl,
        createdAt: new Date().toISOString()
      });
    }

    save(KEY_R, records);
    registroForm.reset();
    horasDisplay.textContent = '0.00';
    populateMachinesSelect();
    renderRecordsTable(records);

    alert('Registro guardado');
  });

  resetFormBtn.addEventListener('click', () => {
    registroForm.reset();
    horasDisplay.textContent = '0.00';
    editingRecordId = null;
  });

  // ---------- Render Records ----------
  function renderRecordsTable(list) {
    tablaBody.innerHTML = '';

    if (!list || list.length === 0) {
      show(noRecords);
      return;
    }

    hide(noRecords);

    const sorted = [...list].sort((a,b) =>
      (b.fecha || '').localeCompare(a.fecha || '') ||
      (b.createdAt||'').localeCompare(a.createdAt||'')
    );

    sorted.forEach(r => {
      const tr = document.createElement('tr');
      const m = machines.find(mm => mm.id === r.machineId);

      tr.innerHTML = `
        <td>${escapeHtml(r.fecha)}</td>
        <td>${escapeHtml(m ? m.name : '—')}</td>
        <td>${escapeHtml(r.tipo || '')}</td>
        <td>${escapeHtml(r.obs || '')}</td>
        <td>${r.horas?.toFixed(2) ?? '0.00'}</td>
        <td>${r.fotoDataUrl ? `<img class="thumb" src="${r.fotoDataUrl}" />` : ''}</td>
        <td>
          <button class="btn" data-edit="${r.id}">Editar</button>
          <button class="btn danger" data-delete="${r.id}">Eliminar</button>
        </td>
      `;

      tablaBody.appendChild(tr);
    });

    qsa('button[data-edit]', tablaBody).forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-edit');
        const rec = records.find(x => x.id === id);
        if (!rec) return;
        editingRecordId = id;

        fechaEl.value = rec.fecha;
        maquinariaSel.value = rec.machineId;
        tipoEl.value = rec.tipo || '';
        obsEl.value = rec.obs || '';
        horasDisplay.textContent = rec.horas?.toFixed(2) ?? '0.00';
        inicioM.value = ''; finM.value = ''; inicioT.value = ''; finT.value = '';
        scrollTo(0,0);
      });
    });

    qsa('button[data-delete]', tablaBody).forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-delete');
        if (!confirm('Eliminar registro?')) return;
        records = records.filter(x => x.id !== id);
        save(KEY_R, records);
        renderRecordsTable(records);
      });
    });
  }

  // ---------- Search ----------
  searchExactBtn.addEventListener('click', () => {
    const d = searchDateExact.value;
    if (!d) { alert('Selecciona una fecha'); return; }
    renderRecordsTable(records.filter(r => r.fecha === d));
  });

  searchRangeBtn.addEventListener('click', () => {
    const from = searchFrom.value; 
    const to = searchTo.value;

    if (!from || !to) {
      alert('Selecciona rango (desde y hasta)');
      return;
    }

    if (from > to) {
      alert('Rango inválido');
      return;
    }

    renderRecordsTable(records.filter(r => r.fecha >= from && r.fecha <= to));
  });

  clearSearchBtn.addEventListener('click', () => {
    searchDateExact.value = '';
    searchFrom.value = '';
    searchTo.value = '';
    renderRecordsTable(records);
  });

  // ---------- CSV export ----------
  function exportCSV(list, filename = 'export.csv') {
    if (!list || list.length === 0) {
      alert('No hay registros para exportar');
      return;
    }

    const header = ['Fecha','Maquinaria','Tipo','Observaciones','Horas','FotoDataUrl','Creado'];

    const rows = list.map(r => {
      const m = machines.find(mm => mm.id === r.machineId);
      return [
        r.fecha || '',
        m ? m.name : '',
        r.tipo || '',
        r.obs || '',
        r.horas?.toFixed(2) ?? '',
        r.fotoDataUrl ?? '',
        r.createdAt ?? ''
      ].map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- Utilities ----------
  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, ch => (
      {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[ch]
    ));
  }

  // ---------- Initial Render ----------
  function renderAll() {
    machines = load(KEY_M, []);
    records = load(KEY_R, []);
    populateMachinesSelect();
    renderRecordsTable(records);
    renderMachinesList();
  }

  showLock();
  populateMachinesSelect();
})();
