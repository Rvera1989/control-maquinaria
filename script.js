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

    if
