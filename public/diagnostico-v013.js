/* Shared desktop/mobile interaction layer for SPEC-F2-004 0.17.
 * Diagnosis drafts and revisions live only in memory. No sensitive draft storage.
 * All role, connection and service controls below are explicitly demo scenarios.
 */
(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  let profileStart = {}, commercialStart = {};
  let historyOpen=false;
  const mergeFields = (latest, baseline, submitted) => { const result=clone(latest); for(const k of Object.keys(submitted)) if(JSON.stringify(submitted[k]??'')!==JSON.stringify(baseline[k]??'')) result[k]=clone(submitted[k]); return result; };
  const mobile = !!document.getElementById('questions');
  const el = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = value => JSON.parse(JSON.stringify(value));
  const segment = () => mobile ? el('segment').value : clientSegment;
  const client = () => mobile ? activeCustomer.id : integrationParams.get('clientId') || '207';
  const role = () => el('role').value;
  const advisorChannel = () => el('advisorChannel')?.value || params.get('advisorSegment') || segment();
  const masterSegment = () => el('masterSegment')?.value || (params.get('segment')==='Moto part'?'Refa':params.get('segment')) || segment();
  const channelAllowed = () => role()!=='Asesor' || (!!advisorChannel() && (advisorChannel()==='Moto part' || (!!masterSegment() && advisorChannel()===masterSegment())));
  const hasScope = () => role()==='Administrador'
    ? !!el('supportPermission')?.checked
    : el('scopeScenario')?.value==='assigned';
  const canView = () => hasScope();
  const canCommercial = () => canView() && !['Consulta','KAM'].includes(role()) && channelAllowed() && scenario==='active';
  const profileData = () => mobile ? current() : values();
  const context = () => `${client()}:${segment()}:${segment() === 'empresas' && directionView ? el('direction').value : 'Cuenta'}`;
  const profileContext = () => `${client()}:${segment()}:${segment() === 'empresas' ? el('direction').value : 'Perfil'}`;
  const fieldHost = () => el(mobile ? 'questions' : 'fields');
  const profileButton = () => el(mobile ? 'editBtn' : 'edit');
  const buttonClass = mobile ? 'btn' : 'button';
  let directionView = false, scenario = 'active', commercialDraft = null, commercialBaseline = 0;
  let profileBaseline = 0, sessionExpired = false;
  let networkDemo = true, pendingDirection = false, conflictReview = false;
  const accessed = new Set();
  const demoDirections=[...el('direction').options].map(o=>({value:o.value,label:o.textContent}));
  function restrictDirections(){
    const all=role()==='Administrador'&&el('supportPermission')?.checked||['Gerente','KAM'].includes(role());
    const allowed=all?demoDirections:demoDirections.slice(0,1);
    const current=el('direction').value;
    el('direction').replaceChildren(...allowed.map(o=>new Option(o.label,o.value)));
    if(allowed.some(o=>o.value===current))el('direction').value=current;
  }
  const records = new Map(), revisions = new Map(), audit = [], profileHistory = new Map();
  const canEdit = () => canCommercial() && role()!=='Telemarketing';
  const canStatus = () => ['Asesor','Gerente','Telemarketing','Administrador'].includes(role());
  const canStrategy = () => role() === 'Administrador';
  const defaults = () => ({status:params.get('recent')==='1'?'Nuevo':'',situation:'',root:'',plan:'',service:'',reason:''});
  const saved = () => records.get(context()) || defaults();
  const revision = key => revisions.get(key) || 0;
  const dirty = () => editing || commercialDraft !== null;
  const approvedSituations = ['Competitividad de precios']; // existing approved demo option; no cross-segment additions
  const situations = () => ['Refa','empresas'].includes(segment()) ? approvedSituations : [];
  const services = ['Servicio ligero','Servicio pesado HD','Servicio mixto'];
  const now = () => new Date().toLocaleString('es-MX');
  function announce(message, error = false) {
    el('closureNotice').textContent = message;
    el('closureNotice').className = error ? 'notice warn closure-notice' : 'notice closure-notice';
    el('closureNotice').focus();
  }
  function allowedSave(commercial = false) {
    if (!(commercial ? canCommercial() : canEdit())) { announce('Este contexto es de consulta. No se guardaron cambios.', true); return false; }
    if (!navigator.onLine || !networkDemo) { announce('Sin conexión. Los cambios no se guardaron. Conservamos la captura mientras esta pantalla siga abierta. Reintenta al recuperar conexión.', true); return false; }
    if (sessionExpired) { announce('La sesión venció. Los cambios no se guardaron. Inicia sesión nuevamente para revalidar permisos y conflictos.', true); el('resumeSession').hidden = false; return false; }
    return true;
  }
  function confirmLeave() {
    if (!dirty()) return true;
    if (!confirm('Hay cambios sin guardar. ¿Salir y descartarlos? Cancela para seguir editando.')) return false;
    editing = false; commercialDraft = null; pendingDirection = false; return true;
  }
  function changedFields(before, after, names) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])]
      .filter(k => JSON.stringify(before[k] ?? '') !== JSON.stringify(after[k] ?? ''))
      .map(k => ({name:names[k] || k, before:before[k] ?? '', after:after[k] ?? ''}));
  }
  function recordChange(key, block, before, after, names = {}) {
    const changes = changedFields(before, after, names);
    if (!changes.length) return;
    revisions.set(key, revision(key) + 1);
    audit.unshift({context:context(), key, block, who:(el('realAdministrator')?.checked?'Administrador real → ':'')+role(), when:now(), changes});
  }
  function showValue(value) { return Array.isArray(value) ? value.join(', ') || 'Sin información disponible' : String(value || 'Sin información disponible'); }
  function renderAudit() {
    const host = el(mobile ? 'historyList' : 'history');
    host.hidden=!historyOpen;
    if(mobile&&el('changes'))el('changes').classList.toggle('hidden',!historyOpen);
    el('diagnosisHistoryToggle').textContent=historyOpen?'Ocultar historial':'Ver historial';
    el('diagnosisHistoryToggle').setAttribute('aria-expanded',String(historyOpen));
    if(!historyOpen)return;
    const entries = audit.filter(x => x.context === context());
    host.innerHTML = entries.length ? entries.map(h => `<div class="history-item"><b>${escape(h.block)} · ${escape(h.who)}</b><p>${escape(h.when)}</p>${h.changes.map(c=>`<p><b>${escape(c.name)}</b><br>Anterior: ${escape(showValue(c.before))}<br>Nuevo: ${escape(showValue(c.after))}</p>`).join('')}</div>`).join('') : '<p class="sub">Sin cambios registrados en este contexto durante esta sesión.</p>';
  }
  function completion() {
    if(segment()==='empresas'&&!directionView){el('closureCompletion').textContent='Cuestionario por Dirección · abre la Dirección autorizada para consultar su avance';return;}
    const questions = catalog[segment()];
    const values = profileData();
    let applicable = questions.map((q,i)=>i);
    const branches = questions.findIndex(q=>/otras sucursales/i.test(q.q));
    if (branches >= 0 && values[branches] !== 'Si') applicable = applicable.filter(i=>!/Cantidad de Sucursales/i.test(questions[i].q));
    const decisionIndex=questions.findIndex(q=>/Quién toma la decisión/i.test(q.q));
    applicable=applicable.filter(i=>i!==decisionIndex);
    let missing = applicable.filter(i=>Array.isArray(values[i]) ? !values[i].length : values[i] === '' || values[i] == null).length;
    const fallbackQuestion=!decisionContacts().length;
    if(fallbackQuestion&&!String(values.PERFIL_PUESTO_DECISOR||'').trim())missing++;
    const serviceQuestion=segment()==='empresas'&&directionView;
    if(serviceQuestion&&!saved().service)missing++;
    el('closureCompletion').textContent = `${missing ? 'Incompleto' : 'Completo'} · ${applicable.length+(fallbackQuestion?1:0)+(serviceQuestion?1:0)} preguntas · ${missing} sin responder`;
  }
  function decorateProfile() {
    const container = fieldHost();
    container.hidden = segment() === 'empresas' && !directionView;
    profileButton().hidden = (segment() === 'empresas' && !directionView) || scenario !== 'active';
    profileButton().disabled = !canEdit();
    if(!editing)profileButton().textContent=Object.values(profileData()).some(v=>Array.isArray(v)?v.length:String(v??'').trim())?'Modificar información':'Iniciar levantamiento';
    if(!channelAllowed()){ container.hidden=true; el('closureFields').hidden=true; el('closureNotice').textContent='Canal sin clasificación compatible: solo datos generales autorizados.'; }else el('closureFields').hidden=false;
    container.querySelectorAll('input[type="number"]').forEach(input => {
      const field = mobile ? input.closest('.field') : input.closest('[data-index]');
      const i = mobile ? Number(input.dataset.i) : Number(field.dataset.index);
      const question = catalog[segment()][i];
      input.min = /Cantidad de Sucursales/i.test(question.q) ? '1' : '0';
      input.step = '1';
      if (/Cantidad de Sucursales/i.test(question.q) && editing) {
        const branchIndex=catalog[segment()].findIndex(q=>/otras sucursales/i.test(q.q));
        const branchSelect=mobile?container.querySelector(`[data-i="${branchIndex}"]`):container.querySelector(`[data-index="${branchIndex}"] select`);
        const update=()=>{input.disabled=branchSelect?.value!=='Si';if(input.disabled)input.value='';};
        branchSelect?.addEventListener('change',update);update();
      }
    });
    container.querySelectorAll('select').forEach(input => {
      // Single-select catalogs also retain search without adding free values.
      if (!editing || input.previousElementSibling?.classList.contains('closure-search')) return;
      const search = document.createElement('input');
      search.type = 'search'; search.className = 'closure-search'; search.placeholder = 'Buscar opciones'; search.setAttribute('aria-label', 'Buscar opciones del catálogo');
      search.addEventListener('input',()=>{
        const normalize = x => x.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
        [...input.options].forEach(option=>option.hidden=!!option.value && !normalize(option.text).includes(normalize(search.value)));
      });
      input.before(search);
    });
    container.querySelectorAll('.field').forEach((field,index)=>{const control=field.querySelector('select,input[type=number],input[type=date]'),label=field.querySelector('label');if(control&&label){control.id='profile-control-'+index;label.htmlFor=control.id;}});
    decorateDecisors(container);
    if (!editing) container.querySelectorAll('input:disabled,select:disabled').forEach(input=>{
      const read = document.createElement('div'); read.className = 'field-read'; read.textContent = input.tagName === 'SELECT' ? input.selectedOptions[0]?.textContent || 'Sin información disponible' : input.value || 'Sin información disponible';
      if (!input.value) read.textContent = 'Sin información disponible'; input.replaceWith(read);
    });
    if (!canEdit()) container.querySelectorAll('button,input,select').forEach(control=>control.disabled=true);
    completion(); renderAudit();
  }
  function decisionContacts() {
    return el('decisorScenario')?.value==='multiple' ? [{name:'Contacto ficticio A',position:'Propietario'},{name:'Contacto ficticio B',position:'Responsable de compras'}] : [];
  }
  function decorateDecisors(container) {
    const contacts=decisionContacts();
    const i=catalog[segment()].findIndex(q=>/Quién toma la decisión/i.test(q.q));
    const field=mobile?container.querySelectorAll('.field')[i]:container.querySelector('[data-index="'+i+'"]');
    if(field)field.hidden=true;
    let panel=el('decisionPositionPanel');
    if(!panel){panel=document.createElement('section');panel.id='decisionPositionPanel';panel.className='field';container.after(panel);}
    panel.hidden=container.hidden||!canView();
    const value=profileData().PERFIL_PUESTO_DECISOR||'';
    panel.innerHTML=contacts.length?'<label>Decisores · origen Contactos</label>'+contacts.map(c=>'<p>'+escape(c.name)+' · '+escape(c.position)+'</p>').join('')+'<small>El puesto se obtiene de los contactos decisores y se actualiza en Contactos.</small>':'<label for="decisionPosition">Puesto del decisor</label>'+(editing&&canEdit()?'<input id="decisionPosition" type="text" value="'+escape(mobile?draft.PERFIL_PUESTO_DECISOR||'':value)+'" placeholder="Por ejemplo: Encargado de compras">':'<div class="field-read">'+escape(value||'Sin información disponible')+'</div>')+'<small>Origen: Capturado · cuenta para completar el diagnóstico.</small>';
  }
  function collectProfile() {
    if (mobile) {
      document.querySelectorAll('#questions [data-i]').forEach(input=>draft[input.dataset.i]=input.value);
      draft.PERFIL_PUESTO_DECISOR=el('decisionPosition')?.value??draft.PERFIL_PUESTO_DECISOR??'';
      return clone(draft);
    }
    const values = {};
    document.querySelectorAll('#fields .field').forEach(field=>{
      const i=field.dataset.index, question=catalog[segment()][i];
      values[i]=question.t==='multi' ? [...(multiSelected[i]||[])] : field.querySelector('input[type="number"],input[type="date"],select')?.value || '';
    });
    values.PERFIL_PUESTO_DECISOR=el('decisionPosition')?.value??profileData().PERFIL_PUESTO_DECISOR??'';
    return values;
  }
  function validateProfile(data) {
    if(fieldHost().querySelector('input[type="number"]:invalid')) return 'Corrige el dato numérico señalado: usa un entero no negativo.';
    const questions=catalog[segment()];
    const branchIndex=questions.findIndex(q=>/otras sucursales/i.test(q.q));
    for (let i=0;i<questions.length;i++) {
      const q=questions[i], value=data[i];
      if (/Cantidad de Sucursales/i.test(q.q) && data[branchIndex] !== 'Si') { data[i]=''; continue; }
      if (value==='' || value==null || (Array.isArray(value)&&!value.length)) continue;
      if (q.t==='number') {
        const money=false;
        const min=/Cantidad de Sucursales/i.test(q.q) ? 1 : 0;
        if (!Number.isFinite(Number(value)) || Number(value)<min || (!money&&!Number.isInteger(Number(value))) || (money&&!/^\d+(\.\d{1,2})?$/.test(String(value)))) return `${q.q}: usa ${money?'un importe no negativo con hasta dos decimales':`un entero mayor o igual a ${min}`}.`;
      }
      if (q.t==='single'&&!q.options.includes(value)) return `${q.q}: selecciona una opción válida.`;
    }
    return '';
  }
  const originalRender = mobile ? render : draw;
  function redraw() {
    restrictDirections(); originalRender(); decorateProfile(); renderCommercial();
    const visible=canView();
    const accessKey=context()+':'+role()+':'+el('scopeScenario').value;
    if(visible&&role()==='Administrador'&&!accessed.has(accessKey)){accessed.add(accessKey);audit.unshift({context:context(),key:accessKey,block:'Acceso de apoyo auditado · '+el('scopeScenario').selectedOptions[0].text,who:role(),when:now(),changes:[]});renderAudit();}
    for(const child of host.children)if(child!==closure)child.hidden=!visible;
    ['closureFields','closureContext','closureCompletion','directionAddress','openDirection','directionBack','fleetRegistration'].forEach(id=>{if(!visible)el(id).hidden=true;});
    if(visible){el('closureContext').hidden=false;el('closureCompletion').hidden=false;}
    if(el('decisionPositionPanel'))el('decisionPositionPanel').hidden=!visible||!channelAllowed()||(segment()==='empresas'&&!directionView);
    if(mobile)refreshMobileClassification();else refreshClassification();
    el('closureFields').hidden=!visible||!channelAllowed();
    el('commercialEdit').hidden=!visible||!!commercialDraft||!canCommercial();
    if(!visible)announce('Sin clientes autorizados en tu cartera o estructura actual. La función de apoyo permite acceso global solo al Administrador autorizado.',true);
    else if(role()==='KAM')announce('Puedes consultar esta información, pero no modificarla. Alcance: cartera de vendedores de tu estructura actual.');
    else if(role()==='Telemarketing')announce('Telemarketing: solo puedes cambiar Estatus con motivo en tu cartera; el resto es consulta.');
    else if(role()==='Administrador')announce('Edición de apoyo: acceso global con auditoría. Se conservan las restricciones de clientes inactivos y niveles importados.');
  }
  function beginProfile() {
    if (!canEdit()) return;
    profileBaseline=revision(profileContext()); profileStart=clone(profileData());
    editing=true; if(mobile) draft=clone(profileData()); redraw();
  }
  function saveProfile() {
    if (!allowedSave()) return;
    const key=profileContext(), submitted=collectProfile(), data=mergeFields(profileData(),profileStart,submitted), error=validateProfile(data);
    if(error){announce(error,true);return;}
    const before=clone(profileData());
    const decisionIndex=catalog[segment()].findIndex(q=>/Quién toma la decisión/i.test(q.q));
    if(decisionContacts().length&&decisionIndex>=0){if(before[decisionIndex]===undefined)delete data[decisionIndex];else data[decisionIndex]=before[decisionIndex];}
    if(decisionContacts().length){if(before.PERFIL_PUESTO_DECISOR===undefined)delete data.PERFIL_PUESTO_DECISOR;else data.PERFIL_PUESTO_DECISOR=before.PERFIL_PUESTO_DECISOR;}
    if(mobile) dataStore[currentKey()]=clone(data); else store[window.key()]=clone(data);
    recordChange(key,'Perfil',before,data,{...Object.fromEntries(catalog[segment()].map((q,i)=>[i,q.q])),PERFIL_PUESTO_DECISOR:'Puesto del decisor'});
    profileHistory.set(key,clone(data)); editing=false; el('confirmProfileConflict').hidden=true;
    redraw(); announce('Cambios guardados. '+el('closureCompletion').textContent+'. Puedes completar las respuestas después.');
  }
  function field(name,label,type='text',options=null,editable=canEdit()) {
    const value=(commercialDraft||saved())[name];
    if(!commercialDraft || !editable) return `<div class="field"><label>${label}</label><div class="field-read">${escape(showValue(value))}</div>${!editable?'<small>Solo consulta. '+(name==='status'?'Actualiza un usuario con permiso de Estatus.':'Puedes consultar esta información, pero no modificarla.')+'</small>':''}</div>`;
    const input=options ? `<select id="commercial-${name}" data-commercial="${name}"><option value="">Sin información disponible</option>${options.map(o=>`<option ${o===value?'selected':''}>${escape(o)}</option>`).join('')}</select>` : `<textarea id="commercial-${name}" data-commercial="${name}" maxlength="500" rows="3">${escape(value)}</textarea><small data-counter="${name}">${String(value).length}/500</small>`;
    return `<div class="field"><label for="commercial-${name}">${label}</label>${input}</div>`;
  }
  function renderCommercial() {
    completion();
    const isDirection=segment()==='empresas'&&directionView;
    el('closureContext').textContent = isDirection ? `Dirección · ${el('direction').selectedOptions[0]?.textContent}` : 'Cuenta · '+client();
    el('directionAddress').hidden=!isDirection;
    el('directionAddress').textContent=el('direction').selectedIndex===0?'Av. Demo Logística 529 · Tonalá, Jalisco · Dirección ficticia':'Av. Demo Administración 20 · Querétaro · Dirección ficticia';
    el('directionBack').hidden = !isDirection;
    el('openDirection').hidden = segment()!=='empresas'||isDirection;
    el('closureFields').innerHTML = field('status',isDirection?'Estatus comercial':'Estatus del cliente','text',['Nuevo','Activo','Sin compra','Perdido'],canStatus())+
      field('situation','Situación actual','text',situations())+field('root','Causa raíz')+field('plan','Plan de acción')+
      (isDirection ? field('service','¿Este cliente es? · cuenta para completar','text',services) : '') + field('reason','Motivo del cambio de estatus','text',null,canStatus());
    el('closureFields').querySelectorAll('[data-commercial]').forEach(input=>input.addEventListener('input',()=>{
      commercialDraft[input.dataset.commercial]=input.value;
      const counter=el('closureFields').querySelector(`[data-counter="${input.dataset.commercial}"]`);if(counter)counter.textContent=input.value.length+'/500';
    }));
    el('commercialEdit').hidden=!!commercialDraft||!canCommercial();
    el('commercialSave').hidden=!commercialDraft && !(isDirection && editing);
    el('commercialCancel').hidden=!commercialDraft && !(isDirection && editing);
    if(isDirection&&editing){if(mobile)el('saveRow').style.display='none';else profileButton().hidden=true;}
    el('strategyRequest').hidden=true;
    el('partialDemo').hidden=!isDirection;
    const typeIndex=catalog[segment()].findIndex(q=>q.q==='Tipo de dirección');
    const types=profileData()[typeIndex];
    el('fleetRegistration').hidden=!isDirection;
    el('fleetRegistration').textContent=Array.isArray(types)&&types.length?'Tipo de dirección: '+types.join(', '):'Tipo de dirección sin registrar. Parque vehicular no se interpreta como «No aplica».';
    el('missingSituation').hidden=situations().length>0;
    renderAudit();
  }
  function saveCommercial() {
    if(!allowedSave(true))return;
    if(segment()==='empresas'&&directionView&&editing){
      saveProfile();
      if(editing)return;
    }
    if(!commercialDraft)return;
    if(!canStatus())commercialDraft.status=saved().status;
    if(role()==='Telemarketing')for(const k of Object.keys(commercialDraft))if(!['status','reason'].includes(k))commercialDraft[k]=saved()[k];
    if(['root','plan','reason'].some(k=>String(commercialDraft[k]||'').length>500)){announce('Máximo 500 caracteres por campo.',true);return;}
    const statusChanged=commercialDraft.status!==commercialStart.status;
    if(statusChanged&&(!commercialDraft.status||!commercialDraft.reason.trim())){announce('Escribe el motivo del cambio de estatus.',true);return;}
    const key=context()+':Información adicional';
    commercialDraft=mergeFields(saved(),commercialStart,commercialDraft);
    if(segment()==='empresas'&&directionView&&el('failCommercial').checked){pendingDirection=true;announce('Información comercial no guardada (falla simulada). Se conserva su captura. Tipo de dirección y Ubicación conservan su resultado independiente. Reintentar procesa solo la parte pendiente.',true);return;}
    const before=clone(saved()); records.set(context(),clone(commercialDraft));
    recordChange(key,'Información adicional',before,commercialDraft,{status:'Estatus',situation:'Situación actual',root:'Causa raíz',plan:'Plan de acción',service:'¿Este cliente es?',reason:'Motivo del cambio de estatus'});
    commercialDraft=null;pendingDirection=false;conflictReview=false;renderCommercial();announce('Información adicional guardada en este contexto.');
    if(parent!==window && !directionView) parent.postMessage({type:'epico:diagnosis-saved',clientId:client(),values:clone(saved()),date:new Date().toLocaleDateString('es-MX')},location.origin);
  }
  const host=el(mobile?'profile':'diag');
  const closure=document.createElement('section');closure.className='card closure-card';
  closure.innerHTML=`<div class="row"><h2>Diagnóstico de cliente</h2><small>Versión 0.17 · 23 nov 2026 · datos ficticios</small></div>
    <div id="closureNotice" class="notice closure-notice" role="status" tabindex="-1">Guardado manual. Las respuestas opcionales pueden completarse después.</div>
    <p id="closureCompletion" class="pill"></p><h3 id="closureContext"></h3><p id="directionAddress" class="sub"></p>
    <div class="row"><button id="directionBack" class="${buttonClass} alt">Volver a Cuenta</button><button id="openDirection" class="${buttonClass} alt">Abrir Dirección seleccionada</button></div>
    <p id="fleetRegistration" class="sub"></p>
    <details class="closure-demo"><summary>Escenarios de prueba · simulación</summary><div class="row">
    <label>Clasificación única del maestro (demo)<select id="masterSegment"><option value="">Sin segmento confirmado</option>${['Refa','empresas','Talleres'].map(k=>'<option '+(k===(segment()==='Moto part'?'Refa':segment())?'selected':'')+'>'+escape(k)+'</option>').join('')}</select></label>
    <label>Alcance del usuario (demo)<select id="scopeScenario"><option value="assigned">En cartera / estructura actual</option><option value="outside">Fuera de cartera / estructura</option><option value="none">Sin cartera</option></select></label>
    <label><input id="supportPermission" type="checkbox" checked> Función de edición de apoyo (demo)</label>
    <label>CANAL del vendedor asignado (demo)<select id="advisorChannel"><option value="">Sin CANAL confirmado</option>${Object.keys(catalog).map(k=>'<option '+(k===(params.get('advisorSegment')||segment())?'selected':'')+'>'+escape(k)+'</option>').join('')}</select></label>
    <label><input id="realAdministrator" type="checkbox"> Administrador real operando con el rol seleccionado (demo, sin sumar permisos)</label>
    <label>Contactos decisores (demo)<select id="decisorScenario"><option value="none">Sin contactos decisores</option><option value="multiple">Dos contactos decisores ficticios</option></select></label>
    <label>Estado del cliente <select id="clientScenario"><option value="active">Activo</option><option value="inactive">Inactivo</option></select></label>
    <label><input type="checkbox" id="networkDemo" checked> Conexión disponible</label>
    <button id="expireSession" class="${buttonClass} alt">Simular sesión vencida</button><button id="resumeSession" class="${buttonClass} alt" hidden>Iniciar sesión de nuevo (demo)</button>
    <button id="profileConflict" class="${buttonClass} alt">Simular cambio de otro usuario en Perfil</button><button id="commercialConflict" class="${buttonClass} alt">Simular cambio en Información adicional</button>
    <label id="partialDemo"><input id="failCommercial" type="checkbox"> Simular falla del servicio comercial</label></div></details>
    <p id="clientState" role="status"></p>
    <h3>Información adicional</h3><p class="sub">Los valores de Cuenta y Dirección son independientes. Asesor y Supervisor editan Plan y Estatus con motivo. KAM solo consulta.</p>
    <div id="closureFields" class="fields group"></div><p id="missingSituation" class="sub">No se agregan opciones de Situación actual sin catálogo aprobado para este segmento.</p>
    <input id="strategyRequest" aria-label="Solicitud de Negocio para estrategia" placeholder="Referencia de solicitud de Negocio (demo)" hidden>
    <div class="row"><button id="commercialEdit" class="${buttonClass}">Modificar información adicional</button><button id="commercialSave" class="${buttonClass}">Guardar</button><button id="commercialCancel" class="${buttonClass} alt">Cancelar</button></div>
    <p class="sub">Si falta una opción, solicita su revisión al equipo de Desarrollo. Negocio valida y Desarrollo aplica.</p>
    <button id="confirmProfileConflict" class="${buttonClass} alt" hidden>Confirmar Perfil después de revisar diferencias</button>
    <button id="recoverProfile" class="${buttonClass} alt" hidden>Recuperar respuestas anteriores para revisión</button>`;
  host.prepend(closure);
  const historyHost=el(mobile?'historyList':'history');
  const historyToggle=document.createElement('button');historyToggle.id='diagnosisHistoryToggle';historyToggle.className=buttonClass+' alt';historyToggle.textContent='Ver historial';historyToggle.setAttribute('aria-expanded','false');closure.append(historyToggle);historyHost.hidden=true;
  historyToggle.onclick=()=>{historyOpen=!historyOpen;renderAudit();};
  el('realAdministrator').onchange=()=>{if(confirmLeave())redraw();};

  if(mobile){
    const demo=closure.querySelector('.closure-demo');
    const roleLabel=document.createElement('label');roleLabel.textContent='Rol de prueba ';roleLabel.append(el('role'));demo.append(roleLabel);
    demo.append(el('segmentPicker'));el('segmentPicker').hidden=true;
    const heading=host.querySelector(':scope > .row h2');if(heading)heading.textContent='Cuestionario del segmento';
  }
  const management=document.createElement('section');management.className='card';
  const currentDate=new Date();const tomorrow=new Date(currentDate);tomorrow.setDate(tomorrow.getDate()+1);
  management.innerHTML=`<h3>Historial de gestión · demostración</h3><p><b>Última actividad:</b> Visita realizada · ${escape(currentDate.toLocaleDateString('es-MX'))}</p><p>Solo las actividades realizadas actualizan esta fecha. Sin histórico de visitas o agenda de Salesforce.</p><div class="closure-activities"><p>Visita · ${escape(currentDate.toLocaleDateString('es-MX'))} · Realizada</p><p>Seguimiento · ${escape(tomorrow.toLocaleDateString('es-MX'))} · Programada</p><p>Visita · ${escape(currentDate.toLocaleDateString('es-MX'))} · Cancelada</p></div>`;
  host.append(management);
  const style=document.createElement('style');style.textContent='#fields[hidden],#questions[hidden]{display:none!important}.closure-card{margin-bottom:18px}.closure-card .fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}.closure-card textarea,.closure-card select,.closure-card input:not([type=checkbox]),.closure-search{width:100%;padding:11px;border:1px solid #bccbdd;border-radius:6px;font:inherit;background:white;box-sizing:border-box}.closure-card label{display:block;margin-bottom:6px}.closure-card small{display:block;color:#52617b}.closure-card .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.closure-demo{padding:12px;border:1px dashed #c2ccdb;margin:16px 0}.closure-demo summary{cursor:pointer}.closure-notice{padding:12px;border-radius:6px;background:#eaf4fc;margin:12px 0}.closure-notice.warn{background:#fff3d7}.closure-card [hidden]{display:none!important}.closure-card button{min-height:42px}.history-item{border-bottom:1px solid #dce4ef;padding:12px;overflow-wrap:anywhere}@media(max-width:600px){.closure-card .fields{grid-template-columns:1fr}.closure-card{padding:14px}.closure-card h2{font-size:20px}}';document.head.append(style);
  el('commercialEdit').onclick=()=>{if(!canCommercial())return;commercialDraft=clone(saved());commercialStart=clone(commercialDraft);commercialDraft.reason='';commercialBaseline=revision(context()+':Información adicional');conflictReview=false;renderCommercial();};
  el('decisorScenario').onchange=()=>{if(confirmLeave())redraw();};
  function switchChannel() {
    if(!confirmLeave())return;
    const previous=segment(), previousValues=clone(profileData()), next=advisorChannel()==='Moto part'?'Moto part':masterSegment();
    if(!catalog[next]){redraw();announce('Contexto comercial sin confirmar: solo datos generales autorizados.',true);return;}
    profileHistory.set(profileContext(),previousValues);
    if(mobile)el('segment').value=next;else clientSegment=next;
    const nextValues=clone(profileData());
    catalog[next].forEach((q,i)=>{
      // Demo identity requires identical approved prompt/type; option validity is checked separately.
      const j=catalog[previous].findIndex(old=>old.q===q.q&&old.t===q.t),value=previousValues[j];
      if(nextValues[i]!==undefined||j<0||value==null||value==='')return;
      if(q.t==='single'&&!q.options.includes(value))return;
      if(q.t==='multi'&&(!Array.isArray(value)||value.some(v=>!q.options.includes(v))))return;
      nextValues[i]=clone(value);
    });
    if(mobile)dataStore[currentKey()]=nextValues;else store[window.key()]=nextValues;
    directionView=false;redraw();announce('Formulario del canal del asesor. Respuestas compatibles precargadas; revisa antes de guardar.');
  }
  el('advisorChannel').onchange=switchChannel;
  el('masterSegment').onchange=switchChannel;
  ['scopeScenario','supportPermission'].forEach(id=>el(id).onchange=()=>{if(confirmLeave())redraw();});
  el('commercialSave').onclick=saveCommercial;
  el('commercialCancel').onclick=()=>{if(confirmLeave())redraw();};
  el('directionBack').onclick=()=>{if(confirmLeave()){directionView=false;redraw();}};
  el('openDirection').onclick=()=>{if(confirmLeave()){directionView=true;redraw();}};
  el('networkDemo').onchange=event=>{networkDemo=event.target.checked;announce(networkDemo?'Conexión disponible. Puedes reintentar el guardado.':'Sin conexión. La captura se conserva en esta pantalla, sin guardar.');};
  el('expireSession').onclick=()=>{sessionExpired=true;el('resumeSession').hidden=false;announce('Sesión vencida (simulación). La captura permanece temporalmente en memoria; vuelve a iniciar sesión.',true);};
  el('resumeSession').onclick=()=>{sessionExpired=false;el('resumeSession').hidden=true;announce(canEdit()?'Sesión recuperada. Permisos revalidados; al guardar se revisarán los conflictos.':'Sesión recuperada. Este contexto es de consulta y no permite guardar.');};
  el('clientScenario').onchange=event=>{
    const value=event.target.value;if(!confirmLeave()){event.target.value=scenario;return;}scenario=value;
    el('clientState').textContent=value==='inactive'?'Cliente inactivo · solo consulta. No equivale al Estatus comercial Perdido.':'';
    redraw();
  };
  el('profileConflict').onclick=()=>{
    const key=profileContext(),before=clone(profileData()),after=clone(before);const index=catalog[segment()].findIndex(q=>q.t==='single');
    if(index>=0)after[index]=catalog[segment()][index].options.find(x=>x!==before[index])||'';
    if(mobile)dataStore[currentKey()]=after;else store[window.key()]=after;
    recordChange(key,'Perfil · otro usuario (demo)',before,after,{...Object.fromEntries(catalog[segment()].map((q,i)=>[i,q.q])),PERFIL_PUESTO_DECISOR:'Puesto del decisor'});renderAudit();announce('Otro usuario guardó una revisión de Perfil en este contexto (demo). Información adicional no entra en conflicto.');
  };
  el('commercialConflict').onclick=()=>{const before=clone(saved()),after={...before,plan:'Propuesta actualizada por Supervisor (demo)'};records.set(context(),after);recordChange(context()+':Información adicional','Información adicional · otro usuario (demo)',before,after);renderAudit();announce('Otro usuario guardó Información adicional (demo). El Perfil sigue siendo independiente.');};
  el('confirmProfileConflict').onclick=saveProfile;
  el('recoverProfile').onclick=()=>{if(!canEdit())return;const previous=profileHistory.get(profileContext());if(!previous)return;beginProfile();if(mobile)draft=clone(previous);else store[window.key()]=clone(previous);redraw();announce('Respuestas recuperadas para revisión. Valida y pulsa Guardar; no se guardan automáticamente.');};
  let previousDirection=el('direction').value;
  el('direction').onchange=()=>{if(confirmLeave()){previousDirection=el('direction').value;directionView=true;redraw();}else el('direction').value=previousDirection;};
  let previousRole=role();el('role').onchange=()=>{const next=role();if(!confirmLeave()){el('role').value=previousRole;return;}previousRole=next;redraw();};
  ['KAM','Telemarketing'].forEach(value=>{if(![...el('role').options].some(o=>o.value===value))el('role').add(new Option(value,value));});
  if(mobile){
    render=()=>{originalRender();decorateProfile();renderCommercial();};
    toggleEdit=beginProfile;saveEdit=saveProfile;cancelEdit=()=>{if(confirmLeave())redraw();};
    const oldSegment=segment();let previousSegment=oldSegment;
    changeSegment=()=>{const next=segment();if(!confirmLeave()){el('segment').value=previousSegment;return;}previousSegment=next;directionView=false;redraw();el('recoverProfile').hidden=!profileHistory.has(profileContext());};
  }else{
    draw=()=>{originalRender();decorateProfile();renderCommercial();};
    toggleEdit=()=>editing?saveProfile():beginProfile();cancelEdit=()=>{if(confirmLeave())redraw();};
  }
  window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
  // Guard navigation before existing inline handlers, including mobile list/detail routes.
  document.addEventListener('click',event=>{
    const target=event.target.closest('[onclick],a');if(!target)return;
    if(/goSearch|showScreen|openClient|openDiagnosis|show\(|location|href/.test(target.getAttribute('onclick')||target.getAttribute('href')||'')){
      if(!confirmLeave()){event.preventDefault();event.stopImmediatePropagation();}
    }
  },true);
  window.addEventListener('offline',()=>announce('Sin conexión. Los cambios no se guardan; conservamos la captura mientras esta pantalla esté abierta.',true));
  window.addEventListener('online',()=>announce('Conexión recuperada. Puedes reintentar Guardar.'));
  if([...el('role').options].some(o=>o.value===params.get('role')))el('role').value=params.get('role');
  switchChannel();
})();
