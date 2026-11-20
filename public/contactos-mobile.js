/* Contactos por dirección · versión móvil del prototipo (cliente 305).
 * Mismas reglas que la versión de escritorio (features/contactos/domain/contactos.ts), tomadas de la spec SDD
 * «2026-11-19-contactos-por-direccion» de epico-movil. «clar. N» = fila N de su clarifications.md. */
(() => {
  const storageKey = 'epico-mobile-contactos-v1';
  const CUSTOMER = '305';
  const AREAS = ['Administración', 'Compras', 'Contabilidad', 'Gerencia', 'Recepción'];
  const REASONS = ['Ya no trabaja ahí', 'Cambió de dirección', 'Dato capturado por error', 'Otro'];
  const SYSTEM_REASON = 'Dirección inactiva';
  const DECIDES = 'Decide la compra';
  const USER = 'Asesor (demo)';
  const MSG = {
    added: 'Contacto agregado a la dirección.', associated: 'Contacto asociado a esta dirección.',
    empty: 'Esta dirección no tiene contactos vigentes.',
    pending: 'Este cliente tiene contactos que aún no están asociados a ninguna dirección. Revísalos para asociarlos.',
    required: 'Este dato es obligatorio. Complétalo para guardar los cambios.',
    area: 'Selecciona una opción de la lista. Si falta alguna, solicítala a Datos Maestros.',
    saveError: 'No pudimos guardar el vínculo. Conservamos tus datos; revisa el elemento señalado.',
  };
  // Las mismas dos Direcciones que usa Parque vehicular en el 305.
  const addresses = Array.from($('direction').options).map((option, index) => ({ id: index === 0 ? '305-A' : '305-B', label: option.text }));
  const at = s => new Date(s).toISOString();
  const examples = () => ({
    contacts: [
      { id: 'M1', name: 'Laura Méndez Ortiz', area: 'Compras', decides: true, rows: [{ number: '3312345678', ext: '', email: 'compras@demo305.mx' }, { number: '3336001234', ext: '105', email: '' }] },
      { id: 'M2', name: 'Ricardo Salas', area: 'Recepción', decides: false, rows: [{ number: '3336001200', ext: '101', email: 'recepcion@demo305.mx' }] },
      { id: 'M3', name: 'Patricia Núñez', area: '', decides: false, rows: [{ number: '3398765432', ext: '', email: 'pnunez@demo305.mx' }] },
      { id: 'M4', name: 'COMPRAS', area: '', decides: false, rows: [{ number: '3336001000', ext: '', email: '' }] },
      { id: 'M5', name: 'Jorge Treviño Garza', area: 'Gerencia', decides: true, rows: [{ number: '8187654321', ext: '', email: 'jtrevino@demo305.mx' }] },
      { id: 'M6', name: 'Ana Ruiz', area: 'Administración', decides: false, rows: [{ number: '3311112222', ext: '', email: 'aruiz@demo305.mx' }] },
    ],
    associations: [
      { id: 'N1', contactId: 'M1', addressId: '305-A', from: at('2026-11-16T09:00'), to: '', reason: '', by: USER },
      { id: 'N2', contactId: 'M1', addressId: '305-B', from: at('2026-11-16T09:05'), to: '', reason: '', by: USER },
      { id: 'N3', contactId: 'M2', addressId: '305-A', from: at('2026-11-16T09:10'), to: '', reason: '', by: USER },
      { id: 'N4', contactId: 'M5', addressId: '305-B', from: at('2026-11-16T09:15'), to: '', reason: '', by: USER },
      { id: 'N5', contactId: 'M6', addressId: '305-B', from: at('2026-11-16T09:20'), to: at('2026-11-18T13:00'), reason: 'Ya no trabaja ahí', by: USER },
    ],
    inactive: [],
  });
  let state = read();
  let address = null;
  let readOnly = false;
  let simOpen = false;
  let seq = 0;
  const stage = $('fleetStage');

  function read() {
    try {
      const s = JSON.parse(localStorage.getItem(storageKey));
      if (s && Array.isArray(s.contacts) && Array.isArray(s.associations) && Array.isArray(s.inactive)) return s;
    } catch { /* sin almacenamiento: se usa la memoria */ }
    return examples();
  }
  function persist() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* solo memoria */ } }
  const newId = p => p + Date.now().toString(36) + (seq++);
  const label = id => addresses.find(a => a.id === id)?.label ?? id;

  // ---------- Reglas (iguales a la versión de escritorio) ----------
  const activeFor = cid => state.associations.filter(a => a.contactId === cid && !a.to);
  const sort = list => [...list].sort((a, b) => Number(b.decides) - Number(a.decides) || a.name.localeCompare(b.name, 'es'));
  const missing = c => [...(c.area ? [] : ['Área de contacto']), ...(c.rows.some(r => r.email.trim()) ? [] : ['Correo'])];
  function view(addressId) {
    const here = sort(state.contacts.filter(c => activeFor(c.id).some(a => a.addressId === addressId)));
    const without = sort(state.contacts.filter(c => activeFor(c.id).length === 0));
    const elsewhere = sort(state.contacts.filter(c => !here.includes(c) && !without.includes(c)));
    const history = state.associations.filter(a => a.addressId === addressId && a.to).sort((a, b) => b.to.localeCompare(a.to));
    return { here, without, elsewhere, history };
  }
  function validate(f) {
    const e = {};
    if (!f.name.trim()) e.name = MSG.required;
    if (!f.area) e.area = MSG.area;
    f.rows.forEach((r, i) => {
      if (i === 0 && !r.number) e['number' + i] = MSG.required;
      else if (r.number && r.number.length !== 10) e['number' + i] = 'El teléfono debe tener 10 dígitos.';
      if (r.ext && !/^\d{1,5}$/.test(r.ext)) e['ext' + i] = 'Máx. 5 dígitos.';
      if (i === 0 && !r.email.trim()) e['email' + i] = MSG.required;
      else if (r.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email.trim())) e['email' + i] = 'Revisa el formato del correo.';
    });
    return e;
  }
  const associate = (cid, aid) => {
    if (state.associations.some(a => a.contactId === cid && a.addressId === aid && !a.to)) return;
    state.associations.push({ id: newId('N'), contactId: cid, addressId: aid, from: new Date().toISOString(), to: '', reason: '', by: USER });
  };
  const fmt = s => new Date(s).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

  // ---------- Estilos propios ----------
  const css = document.createElement('style');
  css.textContent = '.ct-card{display:grid;gap:8px}.ct-name{font-weight:700;color:var(--ep-black);overflow-wrap:anywhere}'
    + '.ct-tags{display:flex;flex-wrap:wrap;gap:4px}.ct-tag-warn{background:#FFF3DB;color:#8a5a00}.ct-tag-decide{background:var(--ep-primary);color:#fff}'
    + '.ct-line{display:flex;align-items:center;gap:6px;min-height:32px;color:var(--ep-text);font-size:14px;overflow-wrap:anywhere;min-width:0}.ct-line a{color:inherit}'
    + '.ct-actions{display:flex;flex-wrap:wrap;gap:8px}.ct-actions .btn{padding-left:14px}.ct-h{font-size:15px;font-weight:700;margin:18px 0 6px;color:var(--ep-black)}'
    + '.ct-sim{border:1px dashed #d9ccf5;background:#f6f2ff;border-radius:8px;padding:12px;display:grid;gap:8px}.ct-sim b{font-size:12px;color:#5b3fa8}'
    + '.ct-row{display:grid;grid-template-columns:minmax(0,1fr) 88px;gap:8px;padding-top:10px;border-top:1px dashed #d6deea}.ct-row:first-child{border-top:0;padding-top:0}'
    + '.ct-row .ct-mail{grid-column:1/-1}.ct-err{color:#D32F2F;font-size:12px}.ct-field{display:grid;gap:6px;min-width:0}.ct-field label{font-weight:600;font-size:13px}'
    + '.ct-field input,.ct-field select{width:100%;min-height:44px;border:1px solid var(--ep-neutral);border-radius:5px;background:#fff;padding:10px;font:inherit;color:var(--ep-black)}'
    + '.ct-field input:disabled{background:var(--ep-light)}.ct-invalid{border-color:#D32F2F!important}.req{color:#D32F2F}'
    + '.ct-check{display:flex;align-items:center;gap:10px;min-height:44px}.ct-check input{width:20px;height:20px;accent-color:var(--ep-secondary)}'
    + '.dlg-foot{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--ep-line)}.dlg-foot .btn{padding-left:14px}';
  document.head.append(css);

  // ---------- Pantalla de la Dirección ----------
  function card(c, actions) {
    const others = activeFor(c.id).filter(a => a.addressId !== address?.id).map(a => label(a.addressId));
    const gaps = missing(c);
    return '<article class="card ct-card"><div class="ct-name">' + esc(c.name) + '</div><div class="ct-tags">'
      + (c.area ? '<span class="tag">' + esc(c.area) + '</span>' : '<span class="tag ct-tag-warn">Área: falta</span>')
      + (c.decides ? '<span class="tag ct-tag-decide">✓ ' + DECIDES + '</span>' : '') + '</div>'
      + c.rows.map(r => (r.number ? '<div class="ct-line"><span class="mi" aria-hidden="true" style="font-size:17px">call</span><a href="tel:' + esc(r.number) + '">' + esc(r.number) + (r.ext ? ' ext. ' + esc(r.ext) : '') + '</a></div>' : '')
        + (r.email ? '<div class="ct-line"><span class="mi" aria-hidden="true" style="font-size:17px">mail</span><a href="mailto:' + esc(r.email) + '">' + esc(r.email) + '</a></div>' : '')).join('')
      + (gaps.includes('Correo') ? '<div class="sub" style="color:#8a5a00">Correo: falta</div>' : '')
      + (others.length ? '<div class="sub">También en: ' + esc(others.join(', ')) + '</div>' : '')
      + (actions ? '<div class="ct-actions">' + actions + '</div>' : '') + '</article>';
  }

  function render(notice) {
    const inactive = state.inactive.includes(address.id);
    const canEdit = !readOnly && !inactive;
    const v = view(address.id);
    const btn = (attr, text, cls = 'btn alt') => '<button type="button" class="' + cls + '" ' + attr + '>' + text + '</button>';
    stage.innerHTML = '<button type="button" class="btn text" data-back><span class="mi" aria-hidden="true">arrow_back</span> Volver a Direcciones</button>'
      + '<details class="ct-sim"' + (simOpen ? ' open' : '') + '><summary style="cursor:pointer;min-height:32px"><b>SIMULACIÓN · no es parte del producto</b></summary><div class="group" style="margin-top:8px">'
      + '<label class="ct-field"><span>Permiso simulado</span><select data-perm><option value="edit"' + (readOnly ? '' : ' selected') + '>Puede editar contactos (clar. 7)</option><option value="read"' + (readOnly ? ' selected' : '') + '>Solo consulta</option></select></label>'
      + btn('data-inactive', inactive ? 'Reactivar dirección' : 'Logística inactiva esta dirección') + btn('data-reset', 'Restaurar ejemplos', 'btn text') + '</div></details>'
      + '<div class="card" style="margin-top:12px"><h2 tabindex="-1" style="margin:0 0 4px">Contactos</h2><div class="sub">' + esc(activeCustomer.name) + ' › ' + esc(address.label) + ' › Contactos</div>'
      + '<div style="margin-top:6px"><span class="tag" style="' + (inactive ? 'background:#eee;color:#555' : 'background:#e7f6ec;color:#1e7a3c') + '">' + (inactive ? 'Inactiva' : 'Activa') + '</span></div>'
      + (canEdit ? '<button type="button" class="btn full" style="margin-top:10px;justify-content:center" data-add><span class="mi" aria-hidden="true">add</span> Agregar contacto</button>' : '') + '</div>'
      + (inactive ? '<div class="notice" style="margin-top:12px">Esta dirección está inactiva: no se pueden agregar, asociar ni editar contactos. Consulta sus contactos anteriores en el histórico.</div>' : '')
      + '<h3 class="ct-h">CONTACTOS DE ESTA DIRECCIÓN (' + v.here.length + ')</h3>'
      + (v.here.length ? '<div class="group">' + v.here.map(c => card(c, canEdit ? btn('data-edit="' + c.id + '"', '<span class="mi" style="font-size:17px">edit</span> Editar') + btn('data-off="' + c.id + '"', '<span class="mi" style="font-size:17px">link_off</span> Inactivar vínculo', 'btn text') : '')).join('') + '</div>'
        : '<div class="notice">' + (!inactive && v.without.length ? MSG.pending : MSG.empty) + '</div>')
      + (inactive ? '' : '<h3 class="ct-h">SIN DIRECCIÓN ASOCIADA (' + v.without.length + ')</h3><div class="sub" style="margin-bottom:8px">Contactos del cliente que todavía no se asocian a ninguna dirección. Son del cliente, no de esta dirección.</div>'
        + (v.without.length ? '<div class="group">' + v.without.map(c => card(c, '<span class="tag">Sin dirección asociada</span>' + (canEdit ? btn('data-assoc="' + c.id + '"', '<span class="mi" style="font-size:17px">playlist_add</span> Asociar a esta dirección') : ''))).join('') + '</div>'
          : '<div class="sub">Todos los contactos del cliente tienen al menos una dirección.</div>')
        + (v.elsewhere.length ? '<h3 class="ct-h">EN OTRAS DIRECCIONES DEL CLIENTE (' + v.elsewhere.length + ')</h3><div class="group">'
          + v.elsewhere.map(c => card(c, canEdit ? btn('data-assoc="' + c.id + '"', '<span class="mi" style="font-size:17px">playlist_add</span> Asociar a esta dirección') : '')).join('') + '</div>' : ''))
      + '<details style="margin-top:16px"><summary class="ct-h" style="cursor:pointer;min-height:44px;display:flex;align-items:center">Histórico (' + v.history.length + ')</summary>'
      + (v.history.length ? '<div class="group">' + v.history.map(h => '<div class="card"><strong>' + esc(state.contacts.find(c => c.id === h.contactId)?.name ?? '') + '</strong><div class="sub">Del ' + fmt(h.from) + ' al ' + fmt(h.to) + ' · Motivo: ' + esc(h.reason) + ' · ' + esc(h.by) + '</div></div>').join('') + '</div>'
        : '<div class="sub">Esta dirección no tiene vínculos inactivos.</div>') + '</details>';
    stage.querySelector('[data-back]').onclick = () => { openClient(); $('fleetAddresses').scrollIntoView({ block: 'start' }); };
    stage.querySelector('.ct-sim').ontoggle = e => { simOpen = e.target.open; };
    stage.querySelector('[data-perm]').onchange = e => { readOnly = e.target.value === 'read'; render(); };
    stage.querySelector('[data-inactive]').onclick = () => {
      if (inactive) state.inactive = state.inactive.filter(a => a !== address.id);
      else {
        state.inactive.push(address.id);
        const now = new Date().toISOString();
        state.associations.forEach(a => { if (a.addressId === address.id && !a.to) Object.assign(a, { to: now, reason: SYSTEM_REASON, by: 'Sistema' }); });
      }
      persist(); render(); notify(inactive ? 'Dirección reactivada (simulación).' : 'Logística inactivó la dirección: sus vínculos pasaron al histórico.');
    };
    stage.querySelector('[data-reset]').onclick = () => { state = examples(); persist(); render(); notify('Ejemplos restaurados.'); };
    stage.querySelector('[data-add]')?.addEventListener('click', () => openForm(null, address));
    stage.querySelectorAll('[data-edit]').forEach(b => { b.onclick = () => openForm(state.contacts.find(c => c.id === b.dataset.edit)); });
    stage.querySelectorAll('[data-assoc]').forEach(b => { b.onclick = () => { associate(b.dataset.assoc, address.id); persist(); render(); notify(MSG.associated); }; });
    stage.querySelectorAll('[data-off]').forEach(b => { b.onclick = () => openInactivate(state.contacts.find(c => c.id === b.dataset.off)); });
    if (notice) notify(notice);
  }

  function open(item) {
    address = item;
    showScreen('fleet');
    $('breadcrumb').innerHTML = 'Clientes / Detalle / <b>Contactos</b>';
    render();
    stage.querySelector('h2').focus({ preventScroll: true });
  }

  // ---------- Formulario (basado en el de Épico) ----------
  const dlg = document.createElement('dialog');
  dlg.setAttribute('aria-labelledby', 'ctFormTitle');
  document.body.append(dlg);
  function openForm(contact, fromAddress) {
    let f = contact ? JSON.parse(JSON.stringify({ name: contact.name, area: contact.area, decides: contact.decides, rows: contact.rows }))
      : { name: '', area: '', decides: false, rows: [{ number: '', ext: '', email: '' }] };
    const initial = JSON.stringify(f);
    let errors = {};
    const gaps = contact ? missing(contact) : [];
    const field = (key, lbl, req, input) => '<div class="ct-field' + (key.startsWith('email') ? ' ct-mail' : '') + '"><label for="ct-' + key + '">' + (req ? '<span class="req">*</span> ' : '') + lbl + '</label>' + input + (errors[key] ? '<span class="ct-err" id="ct-' + key + '-err">' + esc(errors[key]) + '</span>' : '') + '</div>';
    const attrs = key => ' id="ct-' + key + '"' + (errors[key] ? ' class="ct-invalid" aria-invalid="true" aria-describedby="ct-' + key + '-err"' : '');
    function draw() {
      dlg.innerHTML = '<div class="dlg-head"><h3 id="ctFormTitle">' + (contact ? 'Editar contacto' : 'Nuevo contacto') + '</h3><button class="btn text" data-x aria-label="Cerrar">✕</button></div><div class="dlg-body"><div class="group">'
        + '<div><div class="sub"><b>CLIENTE</b></div><div class="ct-name">' + esc(activeCustomer.name) + '</div></div>'
        + (fromAddress ? '<div><div class="sub"><b>DIRECCIÓN</b></div><div class="ct-name">' + esc(fromAddress.label) + '</div><div class="sub">Este contacto quedará asociado a esta dirección y seguirá disponible para el cliente.</div></div>'
          : contact ? '' : '<div class="notice">Desde el cliente, el contacto queda «Sin dirección asociada». Asócialo después desde la dirección que corresponda.</div>')
        + (gaps.length ? '<div class="notice" style="border-left-color:#c77700;background:#FFF3DB">Este contacto se registró antes de esta versión y le falta: ' + gaps.join(' y ') + '. Complétalo para guardar los cambios.</div>' : '')
        + field('name', 'NOMBRE', true, '<input' + attrs('name') + ' maxlength="100" value="' + esc(f.name) + '">')
        + f.rows.map((r, i) => '<div class="ct-row" role="group" aria-label="Teléfono y correo ' + (i + 1) + ' de ' + f.rows.length + '">'
          + field('number' + i, 'TELÉFONO', i === 0, '<input' + attrs('number' + i) + ' inputmode="tel" maxlength="10" value="' + esc(r.number) + '">')
          + field('ext' + i, 'EXT.', false, '<input' + attrs('ext' + i) + ' inputmode="numeric" maxlength="5" value="' + esc(r.ext) + '"' + (r.number.length === 10 ? '' : ' disabled') + '>')
          + field('email' + i, 'CORREO', i === 0, '<input' + attrs('email' + i) + ' type="email" value="' + esc(r.email) + '">')
          + (i ? '<button type="button" class="btn text ct-mail" data-del="' + i + '" aria-label="Quitar teléfono y correo ' + (i + 1) + '"><span class="mi">delete</span> Quitar</button>' : '') + '</div>').join('')
        + '<button type="button" class="btn alt" data-row style="padding-left:14px"><span class="mi" aria-hidden="true">add</span> Agregar teléfono o correo</button>'
        + '<div class="sub">La extensión se habilita cuando el teléfono tiene 10 dígitos, como hoy.</div>'
        + field('area', 'ÁREA DE CONTACTO', true, '<select' + attrs('area') + '><option value="">Selecciona una opción</option>' + AREAS.map(a => '<option' + (a === f.area ? ' selected' : '') + '>' + a + '</option>').join('') + '</select>')
        + (errors.area ? '' : '<div class="sub">Sirve para que otras áreas, como Crédito, sepan a quién dirigirse. Si falta una opción, solicítala a Datos Maestros.</div>')
        + '<label class="ct-check"><input type="checkbox" id="ct-decides"' + (f.decides ? ' checked' : '') + '> ' + DECIDES + '</label>'
        + '<div class="sub" style="margin-top:-8px">Márcalo solo si esta persona decide qué se compra. No se deduce del área.</div>'
        + (Object.keys(errors).length ? '<div class="notice" style="border-left-color:#D32F2F;background:#fdecea" role="alert">' + MSG.saveError + '</div>' : '')
        + '</div></div><div class="dlg-foot"><button type="button" class="btn alt" data-x>Cerrar</button><button type="button" class="btn" data-save>Guardar</button></div>';
      const bind = (key, apply) => { const el = dlg.querySelector('#ct-' + key); if (el) el.oninput = el.onchange = () => { apply(el); if (errors[key]) { delete errors[key]; el.classList.remove('ct-invalid'); el.removeAttribute('aria-invalid'); dlg.querySelector('#ct-' + key + '-err')?.remove(); } }; };
      bind('name', el => { f.name = el.value; });
      bind('area', el => { f.area = el.value; });
      dlg.querySelector('#ct-decides').onchange = e => { f.decides = e.target.checked; };
      f.rows.forEach((r, i) => {
        bind('number' + i, el => { el.value = el.value.replace(/\D/g, '').slice(0, 10); r.number = el.value; const ext = dlg.querySelector('#ct-ext' + i); ext.disabled = r.number.length !== 10; if (ext.disabled) { ext.value = ''; r.ext = ''; } });
        bind('ext' + i, el => { el.value = el.value.replace(/\D/g, '').slice(0, 5); r.ext = el.value; });
        bind('email' + i, el => { r.email = el.value; });
      });
      dlg.querySelectorAll('[data-del]').forEach(b => { b.onclick = () => { f.rows.splice(Number(b.dataset.del), 1); errors = {}; draw(); }; });
      dlg.querySelector('[data-row]').onclick = () => { f.rows.push({ number: '', ext: '', email: '' }); draw(); dlg.querySelector('#ct-number' + (f.rows.length - 1)).focus(); };
      dlg.querySelectorAll('[data-x]').forEach(b => { b.onclick = close; });
      dlg.querySelector('[data-save]').onclick = save;
    }
    function close() {
      // Como en Épico: cerrar con cambios pide confirmación («Cerrar creación / edición»).
      if (JSON.stringify(f) !== initial && !confirm((contact ? 'Cerrar edición' : 'Cerrar creación') + ': si cierras ahora, se pierde lo que capturaste.')) return;
      dlg.close();
    }
    function save() {
      errors = validate(f);
      if (Object.keys(errors).length) { draw(); dlg.querySelector('[aria-invalid="true"]')?.focus(); return; }
      const rows = f.rows.filter((r, i) => i === 0 || r.number || r.email);
      if (contact) Object.assign(contact, { ...f, name: f.name.trim(), rows });
      else {
        const c = { id: newId('M'), ...f, name: f.name.trim(), rows };
        state.contacts.push(c);
        if (fromAddress) associate(c.id, fromAddress.id);
      }
      persist(); dlg.close();
      const msg = contact ? 'Contacto actualizado.' : fromAddress ? MSG.added : 'Contacto agregado al cliente, sin dirección asociada.';
      if (address && !$('fleetStage').classList.contains('hidden')) render(msg); else { renderClientList(); notify(msg); }
    }
    dlg.oncancel = e => { e.preventDefault(); close(); };
    draw();
    if (dlg.open) dlg.close();
    dlg.showModal();
    dlg.querySelector('#ct-name').focus();
  }

  // ---------- Inactivar vínculo ----------
  const off = document.createElement('dialog');
  off.setAttribute('aria-labelledby', 'ctOffTitle');
  document.body.append(off);
  function openInactivate(c) {
    const assoc = activeFor(c.id).find(a => a.addressId === address.id);
    const others = activeFor(c.id).filter(a => a.addressId !== address.id).map(a => label(a.addressId));
    off.innerHTML = '<div class="dlg-head"><h3 id="ctOffTitle">Inactivar vínculo</h3><button class="btn text" data-x aria-label="Cerrar">✕</button></div><div class="dlg-body"><div class="group">'
      + '<div class="sub"><b>' + esc(c.name) + '</b> dejará de aparecer entre los contactos vigentes de <b>' + esc(address.label) + '</b>.</div>'
      + '<div class="sub">El contacto sigue en el cliente' + (others.length ? ' y en ' + esc(others.join(', ')) : '') + '. El vínculo queda en el histórico de esta dirección con la fecha, el motivo y tu usuario.</div>'
      + '<div class="ct-field"><label for="ct-reason"><span class="req">*</span> Motivo</label><select id="ct-reason"><option value="">Selecciona el motivo</option>' + REASONS.map(r => '<option>' + r + '</option>').join('') + '</select></div>'
      + '<div class="ct-field" id="ct-other-box" hidden><label for="ct-other"><span class="req">*</span> Escribe el motivo</label><input id="ct-other" maxlength="120"></div>'
      + '<span class="ct-err" id="ct-off-err" role="alert"></span></div></div>'
      + '<div class="dlg-foot"><button type="button" class="btn alt" data-x>Cancelar</button><button type="button" class="btn" style="background:#D32F2F;border-color:#D32F2F" data-ok>Inactivar vínculo</button></div>';
    const reason = off.querySelector('#ct-reason'), other = off.querySelector('#ct-other'), err = off.querySelector('#ct-off-err');
    reason.onchange = () => { off.querySelector('#ct-other-box').hidden = reason.value !== 'Otro'; err.textContent = ''; };
    off.querySelectorAll('[data-x]').forEach(b => { b.onclick = () => off.close(); });
    off.querySelector('[data-ok]').onclick = () => {
      if (!reason.value) { err.textContent = 'Selecciona el motivo.'; reason.focus(); return; }
      if (reason.value === 'Otro' && !other.value.trim()) { err.textContent = 'Escribe el motivo.'; other.focus(); return; }
      Object.assign(assoc, { to: new Date().toISOString(), reason: reason.value === 'Otro' ? 'Otro: ' + other.value.trim() : reason.value, by: USER });
      persist(); off.close(); render('Vínculo inactivado. Quedó en el histórico.');
    };
    off.showModal();
    reason.focus();
  }

  // ---------- Contactos del cliente (botón «Editar» del encabezado) ----------
  const list = document.createElement('dialog');
  list.setAttribute('aria-labelledby', 'ctListTitle');
  document.body.append(list);
  function renderClientList() {
    if (!list.open) return;
    const all = sort(state.contacts);
    list.querySelector('[data-items]').innerHTML = all.map((c, i) => {
      const where = activeFor(c.id).map(a => label(a.addressId));
      return '<article class="card ct-card"><div class="ct-name">' + (i + 1) + ' - ' + esc(c.name) + '</div><div class="ct-tags">'
        + (c.area ? '<span class="tag">' + esc(c.area) + '</span>' : '<span class="tag ct-tag-warn">Área: falta</span>')
        + (c.decides ? '<span class="tag ct-tag-decide">✓ ' + DECIDES + '</span>' : '') + (missing(c).includes('Correo') ? '<span class="tag ct-tag-warn">Correo: falta</span>' : '') + '</div>'
        + '<div class="sub">' + (where.length ? 'Direcciones: ' + esc(where.join(', ')) : 'Sin dirección asociada') + '</div>'
        + '<div class="ct-actions"><button type="button" class="btn alt" data-edit="' + c.id + '"><span class="mi" style="font-size:17px">edit</span> Editar</button></div></article>';
    }).join('');
    list.querySelectorAll('[data-edit]').forEach(b => { b.onclick = () => openForm(state.contacts.find(c => c.id === b.dataset.edit)); });
  }
  function openClientContacts() {
    list.innerHTML = '<div class="dlg-head"><h3 id="ctListTitle">Contactos del cliente</h3><button class="btn text" data-x aria-label="Cerrar">✕</button></div>'
      + '<div class="dlg-body"><div class="sub"><b>CLIENTE</b></div><div class="ct-name" style="margin-bottom:10px">' + esc(activeCustomer.name) + '</div>'
      + '<button type="button" class="btn alt full" style="justify-content:center;margin-bottom:12px" data-new><span class="mi" aria-hidden="true">add</span> Nuevo contacto</button>'
      + '<div class="group" data-items></div></div><div class="dlg-foot"><button type="button" class="btn alt" data-x>Cerrar</button></div>';
    list.querySelectorAll('[data-x]').forEach(b => { b.onclick = () => list.close(); });
    list.querySelector('[data-new]').onclick = () => openForm(null, null);
    list.showModal();
    renderClientList();
  }

  // ---------- Enganches con la ficha del cliente ----------
  const baseAddresses = window.renderFleetAddresses;
  window.renderFleetAddresses = function () {
    baseAddresses();
    if (activeCustomer.id !== CUSTOMER) return;
    $('fleetAddresses').querySelectorAll('article.card').forEach((article, index) => {
      const item = addresses[index];
      if (!item) return;
      const n = view(item.id).here.length;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn alt full';
      b.innerHTML = '<span class="mi" aria-hidden="true">contact_phone</span> Contactos (' + n + ')';
      b.setAttribute('aria-label', 'Contactos de ' + item.label + ': ' + n);
      b.onclick = () => open(item);
      article.append(b);
    });
  };
  const baseContactDialog = window.openContactDialog;
  window.openContactDialog = function () {
    if (activeCustomer.id === CUSTOMER) openClientContacts(); else baseContactDialog();
  };
})();
