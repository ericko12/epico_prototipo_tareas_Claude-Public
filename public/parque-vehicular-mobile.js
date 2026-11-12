/* Parque vehicular · versión móvil del prototipo.
 * Mismas reglas que la versión de escritorio (features/parqueVehicular/domain/fleet.ts), tomadas de la spec SDD
 * «2026-11-06-parque-vehicular» (alta y consulta) más «Modificar» con motivo.
 * Catálogo: parque-vehicular-catalog.json, generado de la matriz de Salesforce. */
(() => {
  const storageKey = 'epico-mobile-fleet-v2';
  const OTRO = '__OTRO__';
  const OTRO_LABEL = 'Otro (no está en la lista)';
  const OTRO_MAX = 60;
  const OTRO_FIELDS = ['brand', 'model', 'body', 'bodyModel', 'motor'];
  const labels = {
    type: 'Tipo', brand: 'Marca / Armadora', model: 'Modelo', body: 'Carrocería', bodyModel: 'Modelo de carrocería',
    motor: 'Motor', from: 'Año inicial', to: 'Año final', units: 'Unidades',
  };
  const missing = {
    brand: 'Escribe la marca que falta.', model: 'Escribe el modelo que falta.', body: 'Escribe la carrocería que falta.',
    bodyModel: 'Escribe el modelo de carrocería que falta.', motor: 'Escribe el motor que falta.',
  };
  const COINCIDENCE = 'Encontramos un grupo con una configuración o rango relacionado. Revísalo antes de continuar.';
  const blank = { type: '', brand: '', brandText: '', model: '', modelText: '', body: '', bodyText: '', bodyModel: '', bodyModelText: '', motor: '', motorText: '', from: '', to: '', units: '' };
  const addresses = Array.from($('direction').options).map((option, index) => ({ id: index === 0 ? '305-A' : '305-B', label: option.text }));
  const stamp = '2026-10-20T12:00:00.000Z';
  const sample = (f, extra) => ({ ...blank, ...f, justification: '', createdBy: 'Asesor (demo)', createdAt: stamp, updatedAt: stamp, lastSurvey: stamp, editReason: '', ...extra });
  const examples = [
    sample({ type: 'Servicio pesado', brand: 'FREIGHTLINER', model: OTRO, modelText: 'COLUMBIA', motor: 'Detroit DD13', from: '2010', to: '2018', units: '25' }, { id: '00123', addressId: '305-A' }),
    sample({ type: 'Servicio pesado', brand: 'VOLVO', model: 'VNL 670', motor: 'D13', from: '2019', to: '2022', units: '10' }, { id: '00124', addressId: '305-A' }),
  ];
  const stage = $('fleetStage');
  let catalog = null;
  let address;
  let groups = readGroups();
  let drafts = [];
  let seq = 0;

  fetch('./parque-vehicular-catalog.json').then(r => r.json()).then(data => { catalog = data; }).catch(() => { catalog = null; });

  function readGroups() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(stored) && stored.every(row => row && typeof row.id === 'string' && addresses.some(a => a.id === row.addressId)
        && Object.keys(blank).every(key => typeof row[key] === 'string'))) return stored;
    } catch { /* sin almacenamiento: se usa la memoria */ }
    return examples;
  }
  function persist() { try { localStorage.setItem(storageKey, JSON.stringify(groups)); return true; } catch { return false; } }

  // ---------- Catálogo y reglas ----------
  const hasBody = type => type.startsWith('Autobús');
  function optionsFor(v, field) {
    if (!catalog) return [];
    if (field === 'brand') return v.type ? catalog.marcas[v.type] || [] : undefined;
    if (field === 'model') return v.brand ? (v.brand === OTRO ? [] : catalog.modelos[v.type + '|' + v.brand] || []) : undefined;
    if (field === 'body') return hasBody(v.type) ? catalog.carrocerias[v.type] || [] : undefined;
    if (field === 'bodyModel') return hasBody(v.type) && v.body ? (v.body === OTRO ? [] : catalog.modelosCarroceria[v.type + '|' + v.body] || []) : undefined;
    return catalog.motores;
  }
  const shown = (g, f) => g[f] === OTRO ? g[f + 'Text'] : g[f];
  const norm = s => String(s).trim().toLocaleLowerCase('es');
  const valueHtml = (g, f) => esc(shown(g, f) || '—') + (g[f] === OTRO ? ' <span class="tag">No catalogado</span>' : '');
  const years = g => g.from || g.to ? (g.from || g.to) + '–' + (g.to || g.from) : 'Años sin capturar';
  const role = () => $('role').value;
  const mayRegister = () => role() === 'Asesor';
  const mayEdit = () => role() === 'Asesor' || role() === 'Administrador';

  function validate(v) {
    const e = {};
    const pick = (f, required) => {
      const val = v[f];
      if (!val) { if (required) e[f] = 'Selecciona ' + labels[f].toLocaleLowerCase('es') + '.'; return; }
      if (val === OTRO) {
        const t = v[f + 'Text'].trim();
        if (!t) e[f] = missing[f]; else if (t.length > OTRO_MAX) e[f] = 'Máximo ' + OTRO_MAX + ' caracteres.';
        return;
      }
      if (!(optionsFor(v, f) || []).includes(val)) e[f] = 'Selecciona una opción de la lista.';
    };
    if (!catalog?.tipos.includes(v.type)) e.type = 'Selecciona el tipo.';
    pick('brand', true); pick('model', true);
    if (hasBody(v.type)) { pick('body', false); if (v.body) pick('bodyModel', false); }
    pick('motor', false);
    const year = new Date().getFullYear();
    for (const k of ['from', 'to']) {
      if (!v[k]) continue;
      if (!/^\d{4}$/.test(v[k])) e[k] = 'Captura el año con cuatro dígitos.';
      else if (Number(v[k]) > year) e[k] = 'El año no puede ser posterior a ' + year + '.';
    }
    if (!e.from && !e.to && v.from && v.to && Number(v.from) > Number(v.to)) e.from = e.to = 'El año inicial debe ser igual o anterior al año final.';
    if (!/^\d+$/.test(v.units) || Number(v.units) < 1 || !Number.isSafeInteger(Number(v.units))) e.units = 'Captura un número entero mayor que cero.';
    return e;
  }
  const key = (g, f) => g[f] === OTRO ? 'otro:' + norm(g[f + 'Text']) : g[f];
  const same = (a, b, f) => key(a, f) === key(b, f);
  const sameOrEmpty = (a, b, f) => !a[f] || !b[f] || same(a, b, f);
  function coincide(a, b) {
    if (a.type !== b.type || !same(a, b, 'brand') || !same(a, b, 'model') || !sameOrEmpty(a, b, 'motor')) return false;
    if (hasBody(a.type) && (!sameOrEmpty(a, b, 'body') || !sameOrEmpty(a, b, 'bodyModel'))) return false;
    if ((!a.from && !a.to) || (!b.from && !b.to)) return true;
    const af = Number(a.from || a.to), at = Number(a.to || a.from), bf = Number(b.from || b.to), bt = Number(b.to || b.from);
    return af <= bt && bf <= at;
  }
  const nextFolio = () => String(Math.max(124, ...groups.map(g => Number(g.id) || 0)) + 1).padStart(5, '0');
  const addressGroups = () => groups.filter(g => g.addressId === address.id)
    .sort((a, b) => a.type.localeCompare(b.type, 'es') || shown(a, 'brand').localeCompare(shown(b, 'brand'), 'es') || a.id.localeCompare(b.id));

  // ---------- Pantallas ----------
  function renderAddressList() {
    const host = $('fleetAddresses');
    host.classList.toggle('hidden', activeCustomer.id !== '305');
    host.replaceChildren();
    if (activeCustomer.id !== '305') return;
    host.innerHTML = '<h3 class="epico-section-heading">Direcciones</h3>';
    for (const item of addresses) {
      const card = document.createElement('article');
      card.className = 'card group';
      card.innerHTML = '<strong>' + esc(item.label) + '</strong><button type="button" class="btn alt full">Parque vehicular</button>';
      const button = card.querySelector('button');
      button.setAttribute('aria-label', 'Parque vehicular de ' + item.label);
      button.onclick = () => { address = item; drafts = []; showScreen('fleet'); renderList(); };
      host.append(card);
    }
  }

  function show(title, backLabel, back, content) {
    stage.innerHTML = '<button type="button" class="btn text" data-back><span class="mi" aria-hidden="true">arrow_back</span> ' + esc(backLabel) + '</button>'
      + '<div class="card"><h2 tabindex="-1">' + esc(title) + '</h2><div class="sub">' + esc(activeCustomer.name) + ' · ' + esc(activeCustomer.id)
      + '</div><strong>' + esc(address.label) + '</strong><div class="sub">Rol de prueba: ' + esc(role()) + '</div></div>' + content;
    stage.querySelector('[data-back]').onclick = back;
    stage.querySelector('h2').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  const sessionHtml = () => drafts.length ? '<div class="card group"><strong>Sesión de captura · ' + drafts.length + ' sin guardar</strong>'
    + drafts.map(d => '<div class="sub"><span class="tag">Sin guardar</span> ' + valueHtml(d, 'brand') + ' / ' + valueHtml(d, 'model') + ' · ' + esc(years(d)) + ' · ' + esc(d.units) + ' u.</div>').join('') + '</div>' : '';

  function renderList() {
    const rows = addressGroups();
    const total = rows.reduce((sum, row) => sum + Number(row.units), 0);
    show('Parque vehicular', 'Volver a Direcciones', () => { openClient(); $('fleetAddresses').scrollIntoView({ block: 'start' }); },
      (drafts.length ? '<div class="notice">Tienes ' + drafts.length + ' grupo(s) sin guardar.</div><button class="btn alt full" data-review>Revisar y guardar</button>' : '')
      + sessionHtml()
      + '<div class="row"><span class="tag">Grupos: ' + rows.length + '</span><span class="tag">Unidades: ' + total + '</span></div>'
      + (mayRegister() ? '<button class="btn full" data-new>Registrar parque vehicular</button>' : '<div class="notice">Solo el asesor que tiene asignada esta Dirección registra parque vehicular.</div>')
      + (rows.length ? rows.map((row, index) => '<article class="card group"><strong>' + valueHtml(row, 'brand') + ' / ' + valueHtml(row, 'model') + '</strong>'
        + '<div class="sub">' + esc(row.id) + ' · ' + esc(row.type) + '</div><div class="sub">' + esc(years(row)) + ' · ' + esc(row.units) + ' unidades</div>'
        + '<div class="sub">Último levantamiento: ' + esc(new Date(row.lastSurvey).toLocaleDateString('es-MX')) + '</div>'
        + '<button type="button" class="btn alt full" data-group="' + index + '">Ver detalle</button></article>').join('')
        : '<div class="notice">Esta dirección aún no tiene parque vehicular registrado.</div>'));
    stage.querySelector('[data-new]')?.addEventListener('click', () => renderForm());
    stage.querySelector('[data-review]')?.addEventListener('click', renderReview);
    stage.querySelectorAll('[data-group]').forEach(button => { button.onclick = () => renderDetail(rows[Number(button.dataset.group)]); });
  }

  function renderDetail(row) {
    const fields = ['type', 'brand', 'model', ...(hasBody(row.type) ? ['body', 'bodyModel'] : []), 'motor'];
    show('Grupo ' + row.id, 'Volver al parque vehicular', renderList, '<div class="card group">'
      + fields.map(f => '<div class="field"><strong>' + esc(labels[f]) + '</strong><span class="field-read">' + (f === 'type' ? esc(row.type) : shown(row, f) ? valueHtml(row, f) : 'Sin registrar') + '</span></div>').join('')
      + '<div class="field"><strong>Años</strong><span class="field-read">' + esc(years(row)) + '</span></div>'
      + '<div class="field"><strong>Unidades</strong><span class="field-read">' + esc(row.units) + '</span></div>'
      + '<div class="field"><strong>Último levantamiento</strong><span class="field-read">' + esc(new Date(row.lastSurvey).toLocaleDateString('es-MX')) + '</span></div>'
      + '<div class="field"><strong>Creado por</strong><span class="field-read">' + esc(row.createdBy) + '</span></div>'
      + (row.justification ? '<div class="notice">Justificación de coincidencia: ' + esc(row.justification) + '</div>' : '')
      + (row.editReason ? '<div class="sub">Última modificación: ' + esc(row.editReason) + '</div>' : '')
      + '</div>' + (mayEdit() ? '<button class="btn full" data-edit>Modificar</button>' : ''));
    stage.querySelector('[data-edit]')?.addEventListener('click', () => renderForm(row));
  }

  /** Captura (alta a la sesión), corrección de un grupo de la sesión o «Modificar» de un grupo guardado. */
  function renderForm(original, draft) {
    if (!catalog) { notify('Cargando el catálogo, intenta de nuevo.'); return; }
    const editing = !!original;
    let v = { ...blank, ...(original || draft || {}) };
    const others = () => addressGroups().filter(g => g.id !== original?.id && coincide(v, g));
    show(editing ? 'Modificar grupo ' + original.id : draft ? 'Corregir grupo de la sesión' : 'Registrar parque vehicular',
      editing ? 'Volver al grupo' : 'Volver al parque vehicular', () => editing ? renderDetail(original) : cancel(),
      (editing ? '' : sessionHtml()) + '<form class="group card" novalidate><div data-fields class="group"></div>'
      + (editing ? '<div class="field"><label for="fleet-reason">Motivo del cambio *</label><input id="fleet-reason"><small data-err="reason" class="hidden"></small></div>'
        + '<div class="field hidden" data-justify><div class="notice">' + COINCIDENCE + '</div><label for="fleet-just">Justificación *</label><input id="fleet-just"></div>' : '')
      + '<div class="notice hidden" role="alert" data-error></div>'
      + (editing ? '<button class="btn full" type="submit">Guardar cambios</button>'
        : '<button class="btn full" type="submit">' + (draft ? 'Actualizar y volver a revisar' : 'Revisar y guardar') + '</button>'
          + (draft ? '' : '<button class="btn alt full" type="button" data-another>Agregar otro</button>'))
      + '<button class="btn text full" type="button" data-cancel>Cancelar</button>'
      + '<small class="sub">* Obligatorios. Nada se guarda hasta elegir «Guardar» en la revisión.</small></form>');
    const form = stage.querySelector('form');
    const host = form.querySelector('[data-fields]');

    function draw(errors = {}) {
      const select = (f, required) => {
        const options = optionsFor(v, f);
        const forced = (f === 'model' && v.brand === OTRO) || (f === 'bodyModel' && v.body === OTRO);
        const disabled = options === undefined || forced;
        const empty = !disabled && options.length === 0;
        const hint = forced ? 'Se escribe a mano porque la opción anterior es «Otro».' : empty ? 'No hay opciones disponibles para esta combinación. Solicita la revisión del catálogo.'
          : options === undefined ? (f === 'body' || (f === 'bodyModel' && !hasBody(v.type)) ? 'Solo para autobuses.' : 'Selecciona primero la opción anterior.') : '';
        // Marca, Modelo y Motor: campo para filtrar la lista al escribir (clar. 46).
        const searchable = ['brand', 'model', 'motor'].includes(f) && !disabled && options.length > 0;
        return '<div class="field"><label for="fleet-' + f + '">' + esc(labels[f]) + (required ? ' *' : '') + '</label>'
          + (searchable ? '<input type="search" data-q="' + f + '" placeholder="Escribe para buscar" aria-label="Buscar ' + esc(labels[f].toLocaleLowerCase('es')) + '">' : '')
          + '<select id="fleet-' + f + '" data-f="' + f + '"' + (disabled ? ' disabled' : '') + '><option value="">Seleccionar</option>'
          + (options || []).map(o => '<option' + (v[f] === o ? ' selected' : '') + '>' + esc(o) + '</option>').join('')
          + '<option value="' + OTRO + '"' + (v[f] === OTRO ? ' selected' : '') + '>' + OTRO_LABEL + '</option></select>'
          + (v[f] === OTRO ? '<input data-t="' + f + '" maxlength="' + OTRO_MAX + '" aria-label="' + esc(labels[f]) + ' escrito" placeholder="Escribe el valor que falta" value="' + esc(v[f + 'Text']) + '">' : '')
          + (errors[f] ? '<small style="color:#c62828">' + esc(errors[f]) + '</small>' : hint ? '<small class="sub">' + esc(hint) + '</small>' : '') + '</div>';
      };
      const input = (f, required) => '<div class="field"><label for="fleet-' + f + '">' + esc(labels[f]) + (required ? ' *' : '') + '</label><input inputmode="numeric" id="fleet-' + f + '" data-n="' + f + '" value="' + esc(v[f]) + '">'
        + (errors[f] ? '<small style="color:#c62828">' + esc(errors[f]) + '</small>' : '') + '</div>';
      host.innerHTML = '<div class="field"><label for="fleet-type">Tipo *</label><select id="fleet-type" data-f="type"><option value="">Seleccionar</option>'
        + catalog.tipos.map(t => '<option' + (v.type === t ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select>' + (errors.type ? '<small style="color:#c62828">' + esc(errors.type) + '</small>' : '') + '</div>'
        + select('brand', true) + select('model', true) + select('motor', false) + select('body', false) + select('bodyModel', false)
        + input('from') + input('to') + input('units', true)
        + (hasBody(v.type) ? '<div class="notice">Marca y Modelo describen el chasis (p. ej. VOLVO B11R); Carrocería y Modelo de carrocería, la carrocería montada encima (p. ej. MARCOPOLO PARADISO G8 1200).</div>' : '');
      host.querySelectorAll('[data-f]').forEach(el => { el.onchange = () => change(el.dataset.f, el.value); });
      host.querySelectorAll('[data-q]').forEach(el => {
        el.oninput = () => {
          const f = el.dataset.q, q = el.value.trim().toLocaleLowerCase('es');
          const control = host.querySelector('[data-f="' + f + '"]');
          const hits = (optionsFor(v, f) || []).filter(o => o.toLocaleLowerCase('es').includes(q));
          const keep = v[f] && v[f] !== OTRO && !hits.includes(v[f]) ? [v[f]] : [];
          control.replaceChildren(new Option('Seleccionar', ''), ...[...keep, ...hits].map(o => new Option(o, o, false, v[f] === o)),
            ...(q && !hits.length ? [Object.assign(new Option('No hay opciones con «' + el.value.trim() + '»', ''), { disabled: true })] : []),
            new Option(OTRO_LABEL, OTRO, false, v[f] === OTRO));
        };
      });
      host.querySelectorAll('[data-t]').forEach(el => { el.oninput = () => { v[el.dataset.t + 'Text'] = el.value; }; });
      host.querySelectorAll('[data-n]').forEach(el => { el.oninput = () => { v[el.dataset.n] = el.value.trim(); }; });
      if (editing) form.querySelector('[data-justify]').classList.toggle('hidden', !others().length);
    }
    function change(f, value) {
      const loses = (f === 'type' && (v.brand || v.body)) || (f === 'brand' && v.model && v.model !== OTRO) || (f === 'body' && v.bodyModel && v.bodyModel !== OTRO);
      if (loses && !confirm(f === 'type' ? 'Se quitarán marca, modelo, carrocería y modelo de carrocería. ¿Cambiar?' : f === 'brand' ? 'Se quitará el modelo. La carrocería y el motor se conservan. ¿Cambiar?' : 'Se quitará el modelo de carrocería. ¿Cambiar?')) { draw(); return; }
      v[f] = value;
      if (f === 'type') Object.assign(v, { brand: '', brandText: '', model: '', modelText: '', body: '', bodyText: '', bodyModel: '', bodyModelText: '' });
      if (f === 'brand') Object.assign(v, { model: value === OTRO ? OTRO : '', modelText: '' }, value === OTRO ? {} : { brandText: '' });
      if (f === 'body') Object.assign(v, { bodyModel: value === OTRO ? OTRO : '', bodyModelText: '' }, value === OTRO ? {} : { bodyText: '' });
      if (['model', 'bodyModel', 'motor'].includes(f) && value !== OTRO) v[f + 'Text'] = '';
      draw();
    }
    function check() {
      if (!hasBody(v.type)) Object.assign(v, { body: '', bodyText: '', bodyModel: '', bodyModelText: '' });
      const errors = validate(v);
      const message = form.querySelector('[data-error]');
      const first = Object.values(errors)[0];
      message.textContent = first || ''; message.classList.toggle('hidden', !first);
      draw(errors);
      if (first) form.querySelector('[data-error]').scrollIntoView({ block: 'nearest' });
      return !first;
    }
    function addToSession() {
      if (!check()) return false;
      const clean = Object.fromEntries(Object.keys(blank).map(k => [k, v[k]]));
      if (draft) drafts = drafts.map(d => d.tempId === draft.tempId ? { ...d, ...clean } : d);
      else drafts = [...drafts, { ...clean, tempId: 'S' + (++seq), justification: '' }];
      return true;
    }
    function cancel() {
      if (drafts.length && !confirm('Los grupos que aún no guardas se descartarán.')) return;
      drafts = []; renderList();
    }
    draw();
    form.querySelector('[data-cancel]').onclick = () => editing ? renderDetail(original) : cancel();
    form.querySelector('[data-another]')?.addEventListener('click', () => { if (addToSession()) { notify('Grupo agregado a la sesión.'); renderForm(); } });
    form.onsubmit = event => {
      event.preventDefault();
      if (!editing) { if (addToSession()) renderReview(); return; }
      if (!check()) return;
      const reason = form.querySelector('#fleet-reason').value.trim();
      const just = form.querySelector('#fleet-just').value.trim();
      const err = form.querySelector('[data-error]');
      if (!reason || (others().length && !just)) { err.textContent = !reason ? 'Escribe el motivo del cambio.' : 'Escribe la justificación de la coincidencia.'; err.classList.remove('hidden'); return; }
      const now = new Date().toISOString();
      const changed = Object.keys(blank).some(k => original[k] !== v[k]);
      const updated = { ...original, ...Object.fromEntries(Object.keys(blank).map(k => [k, v[k]])), editReason: reason, updatedAt: now,
        lastSurvey: role() === 'Asesor' && changed ? now : original.lastSurvey, justification: others().length ? just : original.justification };
      groups = groups.map(g => g.id === original.id ? updated : g);
      notify(persist() ? 'Grupo actualizado.' : 'Grupo actualizado durante esta sesión.');
      renderDetail(updated);
    };
  }

  function renderReview() {
    const saved = addressGroups();
    const items = drafts.map((d, i) => {
      const related = [...saved.filter(g => coincide(d, g)), ...drafts.slice(0, i).filter(o => coincide(d, o))];
      return { d, related, pending: related.length > 0 && !d.justification.trim() };
    });
    const unresolved = items.filter(x => x.pending).length;
    show('Revisar y guardar', 'Volver a la captura', () => renderForm(),
      (items.length ? items.map(({ d, related, pending }) => '<article class="card group"><strong>' + valueHtml(d, 'brand') + ' / ' + valueHtml(d, 'model') + '</strong>'
        + '<div class="sub">' + esc(d.type) + ' · ' + esc(years(d)) + ' · ' + esc(d.units) + ' u.</div>'
        + (related.length ? '<div class="notice">' + (pending ? COINCIDENCE + ' Coincide con ' + esc(related[0].id ? 'el grupo ' + related[0].id : 'otro grupo de la sesión') + '.' : 'Justificación: ' + esc(d.justification)) + '</div>'
          + '<button class="btn alt full" data-justify="' + d.tempId + '">' + (d.justification ? 'Cambiar justificación' : 'Justificar') + '</button>' : '')
        + '<button class="btn alt full" data-fix="' + d.tempId + '">Editar</button><button class="btn text full" data-remove="' + d.tempId + '">Quitar de la sesión</button></article>').join('')
        : '<div class="notice">No hay grupos en la sesión.</div>')
      + (unresolved ? '<div class="notice">Resuelve ' + unresolved + ' coincidencia(s) para habilitar «Guardar».</div>' : '')
      + '<button class="btn full" data-save' + (!items.length || unresolved ? ' disabled' : '') + '>Guardar ' + items.length + ' grupo(s)</button>'
      + '<button class="btn alt full" data-more>Agregar otro</button>');
    stage.querySelectorAll('[data-remove]').forEach(b => { b.onclick = () => { drafts = drafts.filter(d => d.tempId !== b.dataset.remove); renderReview(); }; });
    stage.querySelectorAll('[data-fix]').forEach(b => { b.onclick = () => renderForm(undefined, drafts.find(d => d.tempId === b.dataset.fix)); });
    stage.querySelectorAll('[data-justify]').forEach(b => { b.onclick = () => {
      const d = drafts.find(x => x.tempId === b.dataset.justify);
      const text = prompt('Explica por qué este grupo es distinto del que ya existe:', d.justification || '');
      if (text !== null && text.trim()) { d.justification = text.trim(); renderReview(); }
    }; });
    stage.querySelector('[data-more]').onclick = () => renderForm();
    stage.querySelector('[data-save]').onclick = save;
  }

  function save() {
    const now = new Date().toISOString();
    const results = drafts.map(d => {
      const first = Object.values(validate(d))[0];
      if (first) return { d, ok: false, reason: first };
      const row = { ...Object.fromEntries(Object.keys(blank).map(k => [k, d[k]])), id: nextFolio(), addressId: address.id, justification: d.justification,
        createdBy: role() + ' (demo)', createdAt: now, updatedAt: now, lastSurvey: now, editReason: '' };
      groups = [...groups, row];
      return { d, ok: true, row };
    });
    drafts = results.filter(r => !r.ok).map(r => r.d);
    const stored = persist();
    show('Resultado del guardado', 'Volver al parque vehicular', renderList,
      '<div class="notice">' + (results.every(r => r.ok) ? 'El parque vehicular quedó actualizado.' : 'No pudimos guardar todos los grupos. Los que no se guardaron siguen en tu sesión.')
      + (stored ? '' : ' Los datos se conservan solo mientras esta pantalla siga abierta.') + '</div>'
      + results.map(r => '<div class="card group"><strong>' + valueHtml(r.d, 'brand') + ' / ' + valueHtml(r.d, 'model') + '</strong><div class="sub">'
        + (r.ok ? 'Guardado · folio ' + esc(r.row.id) : 'No guardado: ' + esc(r.reason)) + '</div></div>').join('')
      + '<button class="btn full" data-list>Ver parque vehicular</button>');
    stage.querySelector('[data-list]').onclick = renderList;
  }

  window.renderFleetAddresses = renderAddressList;
})();
