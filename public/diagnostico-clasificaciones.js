function demoMigratedDiagnosis(clientId, segment) {
  return clientId === "207" && segment === "Refa" ? {0: "Av. Principal"} : {};
}

function demoDiagnosisOrigin(clientId, segment) {
  return clientId === "207" && segment === "Refa" ? "Diagnóstico inicial · Salesforce (demo)" : "";
}

function renderImportedClassifications(clientId, relationId, role, panelId, buttonId) {
  function record(key, id) {
    try { return JSON.parse(localStorage.getItem(key) || "{}")[id]; }
    catch { return undefined; }
  }
  const accounts = record("epico:classification-levels:v2", "accounts");
  const assignments = record("epico:classification-levels:v2", "commercial");
  const account = accounts ? accounts[clientId] : record("epico:account-classification:v1", clientId);
  const commercial = relationId
    ? (assignments ? assignments[relationId] : record("epico:commercial-level:v1", relationId))
    : undefined;
  const missing = "Sin información disponible";
  function dateText(entry) {
    return new Date(entry.updatedAt).toLocaleString("es-MX");
  }
  function show(id, value, entry) {
    document.getElementById(id).textContent = value ?? missing;
    document.getElementById(id + "Date").textContent = entry
      ? ["Origen: Excel", entry.period, dateText(entry)].filter(Boolean).join(" · ") : "";
  }
  show("strategicLevel", account?.strategic, account);
  show("commercialLevel", commercial?.level, commercial);

  const allowed = ["Asesor","Gerente","KAM","Telemarketing"].includes(role) || (role === "Administrador" && !!document.getElementById("supportPermission")?.checked);
  const panel = document.getElementById(panelId);
  const button = document.getElementById(buttonId);
  button.hidden = !allowed;
  panel.replaceChildren();
  if (!allowed) {
    panel.classList.add("hidden");
    button.setAttribute("aria-expanded", "false");
    return;
  }
  const filter = document.createElement("select");
  filter.setAttribute("aria-label", "Periodo del historial de niveles");
  filter.innerHTML = '<option value="recent">Últimos doce meses</option><option value="all">Todos los periodos conservados</option>';
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth()-11); cutoff.setDate(1);
  const firstPeriod = cutoff.toISOString().slice(0,7);
  const rows = [];
  panel.append(filter);
  filter.onchange = () => rows.forEach(({line,period})=>line.hidden=filter.value!=="all" && period<firstPeriod);
  function showHistory(title, entries, format) {
    const heading = document.createElement("b");
    heading.textContent = title;
    panel.append(heading);
    const currentPeriods = new Set();
    for (const entry of [...entries].reverse()) {
      const line = document.createElement("div");
      const version = currentPeriods.has(entry.period) ? "Versión anterior" : "Última versión del periodo";
      currentPeriods.add(entry.period);
      line.textContent = [entry.period, format(entry), version, dateText(entry), entry.author].filter(Boolean).join(" · ");
      line.hidden = entry.period < firstPeriod;
      rows.push({line,period:entry.period});
      panel.append(line);
    }
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.textContent = missing;
      panel.append(empty);
    }
  }
  showHistory("Historial de Nivel comercial por vendedor", commercial?.history ?? [], entry => entry.level);
  showHistory("Historial de Nivel estratégico por Cuenta", account?.history ?? [], entry => entry.strategic);
}
