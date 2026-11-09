(() => {
  const storageKey = 'epico-mobile-fleet-v1';
  const types = {
    'Servicio pesado': { FREIGHTLINER: ['COLUMBIA', 'CASCADIA'], KENWORTH: ['T680', 'T800'] },
    'Autobús – Transporte público o de personal': { VOLVO: ['9800'], MERCEDES: ['OF 1721'] },
    'Servicio ligero – Utilitario operativo': { NISSAN: ['NP300'], FORD: ['TRANSIT'] },
    'REMOLQUE - PLATAFORMA PLANA': { FRUEHAUF: ['Plataforma'] },
  };
  const fields = {
    type: 'Tipo', brand: 'Marca / Armadora', model: 'Modelo', motor: 'Motor',
    body: 'Carrocería', bodyModel: 'Modelo de carrocería',
    from: 'Año inicial', to: 'Año final', units: 'Unidades',
  };
  const motors = ['Detroit DD13', 'Cummins X15', 'D13', 'D11'];
  const required = ['type', 'brand', 'model', 'units'];
  const addressOptions = Array.from($('direction').options);
  const addresses = addressOptions.map((option, index) => ({
    id: index === 0 ? '305-A' : '305-B',
    label: option.text,
  }));
  const blank = Object.fromEntries(Object.keys(fields).map(key => [key, '']));
  const examples = [
    { ...blank, id: 'PV-001', addressId: '305-A', type: 'Servicio pesado', brand: 'FREIGHTLINER', model: 'COLUMBIA', motor: 'Detroit DD13', from: '2010', to: '2018', units: '25' },
    { ...blank, id: 'PV-002', addressId: '305-A', type: 'Servicio pesado', brand: 'KENWORTH', model: 'T680', from: '2019', to: '2022', units: '10' },
  ];
  const stage = $('fleetStage');
  let address;
  let groups = readGroups();

  function readGroups() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(stored) && stored.every(row => row && addresses.some(item => item.id === row.addressId)
        && typeof row.id === 'string' && Object.keys(fields).every(key => typeof row[key] === 'string'))) {
        return stored;
      }
    } catch {
      // The demo can still run in memory if storage is unavailable.
    }
    return examples;
  }

  function renderAddressList() {
    const host = $('fleetAddresses');
    host.classList.toggle('hidden', activeCustomer.id !== '305');
    host.replaceChildren();
    if (activeCustomer.id !== '305') return;
    host.innerHTML = '<h3 class="epico-section-heading">Direcciones</h3>';
    for (const item of addresses) {
      const card = document.createElement('article');
      card.className = 'card group';
      card.innerHTML = '<strong>' + esc(item.label) + '</strong>'
        + '<button type="button" class="btn alt full">Parque vehicular</button>';
      const button = card.querySelector('button');
      button.setAttribute('aria-label', 'Parque vehicular de ' + item.label);
      button.onclick = () => {
        address = item;
        showScreen('fleet');
        renderList();
      };
      host.append(card);
    }
  }

  function show(title, backLabel, back, content) {
    stage.innerHTML = '<button type="button" class="btn text" data-back>'
      + '<span class="mi" aria-hidden="true">arrow_back</span> ' + esc(backLabel) + '</button>'
      + '<div class="card"><h2 tabindex="-1">' + esc(title) + '</h2><div class="sub">'
      + esc(activeCustomer.name) + ' · ' + esc(activeCustomer.id) + '</div><strong>'
      + esc(address.label) + '</strong></div>' + content;
    stage.querySelector('[data-back]').onclick = back;
    stage.querySelector('h2').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function renderList() {
    const rows = groups.filter(row => row.addressId === address.id);
    const total = rows.reduce((sum, row) => sum + Number(row.units), 0);
    show('Parque vehicular', 'Volver a Direcciones', () => {
      openClient();
      $('fleetAddresses').scrollIntoView({ block: 'start' });
    }, '<div class="row"><span class="tag">Grupos: ' + rows.length + '</span>'
      + '<span class="tag">Unidades: ' + total + '</span></div>'
      + '<button class="btn full" data-new>Registrar parque vehicular</button>'
      + (rows.length ? rows.map((row, index) => '<article class="card group"><strong>'
        + esc(row.brand) + ' / ' + esc(row.model) + '</strong><div class="sub">'
        + esc(row.id) + ' · ' + esc(row.type) + '</div><div class="sub">'
        + esc(yearRange(row)) + ' · ' + esc(row.units) + ' unidades</div>'
        + '<button type="button" class="btn alt full" data-group="' + index + '">Ver detalle</button></article>').join('')
        : '<div class="notice">Esta dirección aún no tiene grupos registrados.</div>'));
    stage.querySelector('[data-new]').onclick = () => renderForm();
    stage.querySelectorAll('[data-group]').forEach(button => {
      button.onclick = () => renderDetail(rows[Number(button.dataset.group)]);
    });
  }

  function yearRange(row) {
    if (row.from && row.to) return row.from + ' – ' + row.to;
    return row.from || row.to || 'Años sin capturar';
  }

  function renderDetail(row) {
    show(row.id, 'Volver al parque vehicular', renderList,
      '<div class="card group">' + Object.entries(fields)
        .filter(([key]) => row[key] || required.includes(key))
        .map(([key, label]) => '<div class="field"><strong>' + esc(label) + '</strong>'
          + '<span class="field-read">' + esc(row[key]) + '</span></div>').join('')
        + '</div><button class="btn full" data-edit>Modificar</button>');
    stage.querySelector('[data-edit]').onclick = () => renderForm(row);
  }

  function renderForm(original) {
    show(original ? 'Modificar parque vehicular' : 'Registrar parque vehicular',
      'Volver al parque vehicular', renderList,
      '<form class="group card" novalidate>' + Object.entries(fields).map(([key, label]) => {
        const numeric = ['from', 'to', 'units'].includes(key);
        return '<div class="field" data-field="' + key + '"><label for="fleet-' + key + '">'
          + esc(label) + (required.includes(key) ? ' *' : '') + '</label>'
          + (numeric ? '<input inputmode="numeric" id="fleet-' + key + '" name="' + key + '">'
            : '<select id="fleet-' + key + '" name="' + key + '"></select>') + '</div>';
      }).join('')
      + '<div class="notice hidden" role="alert" data-error></div>'
      + '<button class="btn full" type="submit">Guardar</button>'
      + (original ? '' : '<button class="btn alt full" type="submit" value="another">Guardar y agregar otro</button>')
      + '<button class="btn text full" type="button" data-cancel>Cancelar</button></form>');

    const form = stage.querySelector('form');
    const controls = form.elements;
    const initial = original || blank;
    function options(key, values, selected) {
      const control = controls[key];
      control.replaceChildren(new Option('Seleccionar', ''), ...values.map(value => new Option(value, value)));
      control.value = values.includes(selected) ? selected : '';
    }

    function updateModels(selected = '') {
      const models = types[controls.type.value]?.[controls.brand.value] || [];
      options('model', models, selected);
      controls.model.disabled = !models.length;
    }

    function updateBody(body = '', model = '') {
      const visible = controls.type.value.startsWith('Autobús');
      const brands = visible && controls.brand.value ? [controls.brand.value] : [];
      const models = visible && controls.model.value
        ? [controls.model.value === '9800' ? '9800 DD' : controls.model.value] : [];
      options('body', brands, body);
      options('bodyModel', models, model);
      for (const key of ['body', 'bodyModel']) {
        form.querySelector('[data-field="' + key + '"]').classList.toggle('hidden', !visible);
        controls[key].disabled = !visible;
      }
    }

    function updateBrands(selected = '') {
      const brands = Object.keys(types[controls.type.value] || {});
      options('brand', brands, selected);
      controls.brand.disabled = !brands.length;
    }

    options('type', Object.keys(types), initial.type);
    options('motor', motors, initial.motor);
    updateBrands(initial.brand);
    updateModels(initial.model);
    updateBody(initial.body, initial.bodyModel);
    for (const key of ['from', 'to', 'units']) controls[key].value = initial[key];
    controls.type.onchange = () => { updateBrands(); updateModels(); updateBody(); };
    controls.brand.onchange = () => { updateModels(); updateBody(); };
    controls.model.onchange = () => updateBody();
    form.querySelector('[data-cancel]').onclick = renderList;
    form.onsubmit = event => {
      event.preventDefault();
      const value = Object.fromEntries(Object.keys(fields).map(key => [key, controls[key].value.trim()]));
      const error = validate(value, original);
      const message = form.querySelector('[data-error]');
      message.textContent = error;
      message.classList.toggle('hidden', !error);
      if (error) {
        message.scrollIntoView({ block: 'nearest' });
        return;
      }
      const nextId = Math.max(0, ...groups.map(row => Number(row.id.split('-').pop()) || 0)) + 1;
      const row = { ...value, id: original?.id || 'PV-' + String(nextId).padStart(3, '0'), addressId: address.id };
      groups = original ? groups.map(item => item.id === original.id ? row : item) : [...groups, row];
      let saved = true;
      try { localStorage.setItem(storageKey, JSON.stringify(groups)); } catch { saved = false; }
      notify(saved ? 'Grupo guardado.' : 'Grupo guardado durante esta sesión.');
      if (event.submitter?.value === 'another') renderForm();
      else renderList();
    };
  }

  function validate(value, original) {
    if (!types[value.type]?.[value.brand]?.includes(value.model)) return 'Selecciona tipo, marca y modelo compatibles.';
    if (!/^\d+$/.test(value.units) || Number(value.units) < 1 || !Number.isSafeInteger(Number(value.units))) {
      return 'Ingresa una cantidad entera de unidades mayor que cero.';
    }
    if ([value.from, value.to].some(year => year && !/^[1-9]\d{3}$/.test(year))) return 'Ingresa los años con cuatro dígitos.';
    if (value.from && value.to && Number(value.from) > Number(value.to)) return 'El año inicial no puede ser mayor que el final.';
    const configuration = Object.keys(fields).filter(key => key !== 'units');
    if (groups.some(row => row.addressId === address.id && row.id !== original?.id
      && configuration.every(key => row[key] === value[key]))) {
      return 'Ya existe un grupo con la misma configuración en esta dirección.';
    }
    return '';
  }

  window.renderFleetAddresses = renderAddressList;
})();
