function renderImportedClassifications(clientId, relationId, role, panelId, buttonId) {
  function record(key, id) {
    try { return JSON.parse(localStorage.getItem(key) || "{}")[id]; }
    catch { return undefined; }
  }
  const account = record("epico:account-classification:v1", clientId);
  const commercial = relationId ? record("epico:commercial-level:v1", relationId) : undefined;
  const missing = "Sin información disponible";
  function dateText(entry) {
    return new Date(entry.updatedAt).toLocaleString("es-MX");
  }
  function show(id, value, entry) {
    document.getElementById(id).textContent = value ?? missing;
    document.getElementById(id + "Date").textContent = entry
      ? ["Excel", entry.period, dateText(entry)].filter(Boolean).join(" · ") : "";
  }
  show("strategicLevel", account?.strategic, account);
  show("commercialLevel", commercial?.level, commercial);
  show("gecLevel", account?.level, account);

  const allowed = role === "Asesor" || role === "Gerente";
  const panel = document.getElementById(panelId);
  const button = document.getElementById(buttonId);
  button.hidden = !allowed;
  panel.replaceChildren();
  if (!allowed) {
    panel.classList.add("hidden");
    button.setAttribute("aria-expanded", "false");
    return;
  }
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
      panel.append(line);
    }
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.textContent = missing;
      panel.append(empty);
    }
  }
  showHistory("Historial de Nivel comercial por vendedor", commercial?.history ?? [], entry => entry.level);
  showHistory("Historial de Nivel estratégico y GEC por Cuenta", account?.history ?? [], entry => entry.strategic + " / " + entry.level);
}
