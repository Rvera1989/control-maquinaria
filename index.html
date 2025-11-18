<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Control de Maquinaria</title>
  <link rel="stylesheet" href="style.css">
  <link rel="manifest" href="manifest.json">
</head>
<body>

<!-- PANTALLA DE PIN -->
<div id="lockScreen" style="text-align:center; padding:40px;">
  <h2>Ingresar PIN</h2>
  <input id="pinInput" type="password" placeholder="Escribe el PIN" style="font-size:18px; padding:10px; margin-top:15px;">
  <br><br>
  <button id="unlockBtn" style="padding:12px 20px; font-size:16px;">Entrar</button>
  <br><br>
  <button id="clearDataBtn" style="padding:10px 20px; font-size:14px; background:#b30000; color:white;">Borrar Datos</button>
</div>

<!-- APP PRINCIPAL -->
<div id="app" class="hidden">

  <header style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
    <h1 style="margin:0">Control de Maquinaria</h1>
    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
      <button id="openHome">🏠 Inicio</button>
      <button id="openMachinesPage">⚙️ Maquinarias</button>
      <button id="addMachineBtn">➕ Agregar máquina</button>
      <button id="reportBtn">📊 Reporte semanal</button>
      <button id="exportBtn">⬇️ Exportar CSV</button>
    </div>
  </header>

  <main id="homePage">
    <section style="margin-top:12px;">
      <h2>Registrar trabajo</h2>
      <form id="registroForm">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
          <label>Fecha
            <input type="date" id="fecha" required />
          </label>

          <label>Maquinaria
            <select id="maquinaria"></select>
          </label>

          <label>Hora inicio (mañana)
            <input type="time" id="inicioM" />
          </label>

          <label>Hora inicio (tarde)
            <input type="time" id="inicioT" />
          </label>

          <label>Tipo de trabajo
            <input type="text" id="tipo" placeholder="Mantenimiento, Carga..." />
          </label>

          <label>Observaciones
            <input type="text" id="obs" placeholder="Detalles (opcional)" />
          </label>

          <label>Foto (opcional)
            <input type="file" id="foto" accept="image/*" />
          </label>

          <div style="align-self:end;">
            <b>Horas trabajadas: <span id="horasDisplay">0.00</span></b>
          </div>
        </div>

        <div style="margin-top:10px;">
          <button type="submit">Guardar registro</button>
          <button type="button" id="resetForm" class="secondary">Limpiar</button>
        </div>
      </form>
    </section>

    <section style="margin-top:18px;">
      <h2>Registros</h2>

      <!-- BUSCADOR REGISTROS: exacto y rango -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;">
        <div>
          <label>Fecha exacta:
            <input type="date" id="searchDateExact" />
          </label>
          <button id="searchExactBtn" class="secondary">Buscar</button>
        </div>

        <div>
          <label>Rango Desde:
            <input type="date" id="searchDateFrom" />
          </label>
        </div>

        <div>
          <label>Hasta:
            <input type="date" id="searchDateTo" />
          </label>
        </div>

        <div>
          <button id="searchRangeBtn" class="secondary">Buscar rango</button>
          <button id="clearSearchBtn" class="secondary">Mostrar todo</button>
        </div>
      </div>

      <table id="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Maquinaria</th>
            <th>Tipo</th>
            <th>Obs</th>
            <th>Horas</th>
            <th>Foto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </section>
  </main>

</div>

<!-- PÁGINA MAQUINARIAS -->
<div id="machinesPage" class="hidden pageBox">
  <h2>Maquinarias</h2>

  <input id="buscarMaquina" type="text" placeholder="Buscar por nombre..." style="padding:8px;width:100%;margin-bottom:10px;">

  <div id="listaMaquinas" style="display:flex;flex-direction:column;gap:8px;"></div>

  <div style="margin-top:12px;">
    <button id="addMachineFromPage">➕ Agregar nueva máquina</button>
    <button id="closeMachinesPage" class="secondary">Volver</button>
  </div>
</div>

<!-- MODAL AGREGAR MAQUINA -->
<div id="machineModal" class="hidden modal">
  <div class="modal-card" style="max-width:360px;padding:12px;">
    <h3>Agregar / Editar Maquinaria</h3>
    <input id="newMachineName" placeholder="Nombre de la maquinaria" style="width:100%;padding:8px;margin-top:8px;" />
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button id="saveMachineBtn">Guardar</button>
      <button id="closeMachineBtn" class="secondary">Cerrar</button>
    </div>
  </div>
</div>

<script defer src="script.js"></script>
</body>
</html>
