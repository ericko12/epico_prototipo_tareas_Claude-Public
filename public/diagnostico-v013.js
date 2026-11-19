/* Shared desktop/mobile interaction layer for SPEC-F2-004 0.13.
 * Diagnosis drafts and revisions live only in memory. No sensitive draft storage.
 * All role, connection and service controls below are explicitly demo scenarios.
 */
(() => {
  'use strict';
  const mobile = !!document.getElementById('questions');
  const el = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone = value => JSON.parse(JSON.stringify(value));
  const segment = () => mobile ? el('segment').value : clientSegment;
  const client = () => mobile ? activeCustomer.id : integrationParams.get('clientId') || '207';
  const role = () => el('role').value;
  const profileData = () => mobile ? current() : values();
  const context = () => `${client()}:${segment()}:${segment() === 'empresas' && directionView ? el('direction').value : 'Cuenta'}`;
  const profileContext = () => `${client()}:${segment()}:${segment() === 'empresas' ? el('direction').value : 'Perfil'}`;
  const fieldHost = () => el(mobile ? 'questions' : 'fields');
  const profileButton = () => el(mobile ? 'editBtn' : 'edit');
  const buttonClass = mobile ? 'btn' : 'button';
  let directionView = false, scenario = 'active', commercialDraft = null, commercialBaseline = 0;
  let profileBaseline = 0, sessionExpired = false;
  let networkDemo = true, pendingDirection = false, conflictReview = false;
  const records = new Map(), revisions = new Map(), audit = [], profileHistory = new Map();
  const canEdit = () => role() !== 'Consulta' && scenario === 'active';
  const canStatus = () => ['Gerente','KAM','Administrador'].includes(role());
  const canStrategy = () => role() === 'Administrador';
  const defaults = () => ({status:'',situation:'',root:'',plan:'',service:'',dmaic:'',focus:'',lever:'',gtm:''});
  const saved = () => records.get(context()) || defaults();
  const revision = key => revisions.get(key) || 0;
  const dirty = () => editing || commercialDraft !== null;
  const approvedSituations = ['Competitividad de precios']; // existing approved demo option; no cross-segment additions
  const situations = () => segment() === 'Refa' ? approvedSituations : [];
  const services = ['Servicio ligero','Servicio pesado HD','Servicio mixto'];
  const now = () => new Date().toLocaleString('es-MX');
  function announce(message, error = false) {
    el('closureNotice').textContent = message;
    el('closureNotice').className = error ? 'notice warn closure-notice' : 'notice closure-notice';
    el('closureNotice').focus();
  }
  function allowedSave() {
    if (!canEdit()) { announce('Este contexto es de consulta. No se guardaron cambios.', true); return false; }
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
    audit.unshift({context:context(), key, block, who:role(), when:now(), changes});
  }
  function showValue(value) { return Array.isArray(value) ? value.join(', ') || 'Sin información disponible' : String(value || 'Sin información disponible'); }
  function renderAudit() {
    const host = el(mobile ? 'historyList' : 'history');
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
    let missing = applicable.filter(i=>Array.isArray(values[i]) ? !values[i].length : values[i] === '' || values[i] == null).length;
    const serviceQuestion=segment()==='empresas'&&directionView;
    if(serviceQuestion&&!saved().service)missing++;
    el('closureCompletion').textContent = `${missing ? 'Incompleto' : 'Completo'} · ${applicable.length+(serviceQuestion?1:0)} preguntas · ${missing} sin responder`;
  }
  function decorateProfile() {
    const container = fieldHost();
    container.hidden = segment() === 'empresas' && !directionView;
    profileButton().hidden = (segment() === 'empresas' && !directionView) || scenario !== 'active';
    profileButton().disabled = !canEdit();
    container.querySelectorAll('input[type="number"]').forEach(input => {
      const field = mobile ? input.closest('.field') : input.closest('[data-index]');
      const i = mobile ? Number(input.dataset.i) : Number(field.dataset.index);
      const question = catalog[segment()][i];
      input.min = /Cantidad de Sucursales/i.test(question.q) ? '1' : '0';
      input.step = /compra mensual|importe|inventario|facturaci/i.test(question.q) ? '0.01' : '1';
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
    if (!editing) container.querySelectorAll('input:disabled,select:disabled').forEach(input=>{
      const read = document.createElement('div'); read.className = 'field-read'; read.textContent = input.tagName === 'SELECT' ? input.selectedOptions[0]?.textContent || 'Sin información disponible' : input.value || 'Sin información disponible';
      if (!input.value) read.textContent = 'Sin información disponible'; input.replaceWith(read);
    });
    if (!canEdit()) container.querySelectorAll('button,input,select').forEach(control=>control.disabled=true);
    completion(); renderAudit();
  }
  function collectProfile() {
    if (mobile) {
      document.querySelectorAll('#questions [data-i]').forEach(input=>draft[input.dataset.i]=input.value);
      return clone(draft);
    }
    const values = {};
    document.querySelectorAll('#fields .field').forEach(field=>{
      const i=field.dataset.index, question=catalog[segment()][i];
      values[i]=question.t==='multi' ? [...(multiSelected[i]||[])] : field.querySelector('input[type="number"],input[type="date"],select')?.value || '';
    });
    return values;
  }
  function validateProfile(data) {
    if(fieldHost().querySelector('input[type="number"]:invalid')) return 'Corrige el dato numérico señalado: usa un entero no negativo o un importe de hasta dos decimales según el campo.';
    const questions=catalog[segment()];
    const branchIndex=questions.findIndex(q=>/otras sucursales/i.test(q.q));
    for (let i=0;i<questions.length;i++) {
      const q=questions[i], value=data[i];
      if (/Cantidad de Sucursales/i.test(q.q) && data[branchIndex] !== 'Si') { data[i]=''; continue; }
      if (value==='' || value==null || (Array.isArray(value)&&!value.length)) continue;
      if (q.t==='number') {
        const money=/compra mensual|importe|inventario|facturaci/i.test(q.q);
        const min=/Cantidad de Sucursales/i.test(q.q) ? 1 : 0;
        if (!Number.isFinite(Number(value)) || Number(value)<min || (!money&&!Number.isInteger(Number(value))) || (money&&!/^\d+(\.\d{1,2})?$/.test(String(value)))) return `${q.q}: usa ${money?'un importe no negativo con hasta dos decimales':`un entero mayor o igual a ${min}`}.`;
      }
      if (q.t==='single'&&!q.options.includes(value)) return `${q.q}: selecciona una opción válida.`;
    }
    return '';
  }
  const originalRender = mobile ? render : draw;
  function redraw() { originalRender(); decorateProfile(); renderCommercial(); }
  function beginProfile() {
    if (!canEdit()) return;
    profileBaseline=revision(profileContext());
    editing=true; if(mobile) draft=clone(profileData()); redraw();
  }
  function saveProfile() {
    if (!allowedSave()) return;
    const key=profileContext(), data=collectProfile(), error=validateProfile(data);
    if(error){announce(error,true);return;}
    if(revision(key)!==profileBaseline){
      announce('Otro usuario modificó este mismo bloque. Tu captura se conserva. Revisa las diferencias del historial antes de confirmar.',true);
      profileBaseline=revision(key); renderAudit(); el('confirmProfileConflict').hidden=false; return;
    }
    const before=clone(profileData());
    if(mobile) dataStore[currentKey()]=clone(data); else store[window.key()]=clone(data);
    recordChange(key,'Perfil',before,data,Object.fromEntries(catalog[segment()].map((q,i)=>[i,q.q])));
    profileHistory.set(key,clone(data)); editing=false; el('confirmProfileConflict').hidden=true;
    redraw(); announce('Cambios guardados. '+el('closureCompletion').textContent+'. Puedes completar las respuestas después.');
  }
  function field(name,label,type='text',options=null,editable=true) {
    const value=(commercialDraft||saved())[name];
    if(!commercialDraft || !editable) return `<div class="field"><label>${label}</label><div class="field-read">${escape(showValue(value))}</div>${!editable?'<small>Solo consulta. '+(name==='status'?'Actualiza Supervisor autorizado.':'Actualiza Administrador autorizado a solicitud de Negocio.')+'</small>':''}</div>`;
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
      (isDirection ? field('service','¿Este cliente es? · opcional','text',services) : '')+
      ['dmaic','focus','lever','gtm'].map((k,i)=>field(k,['DMAIC','Foco','Palanca','Matriz GTM'][i],'text',null,canStrategy())).join('');
    el('closureFields').querySelectorAll('[data-commercial]').forEach(input=>input.addEventListener('input',()=>{
      commercialDraft[input.dataset.commercial]=input.value;
      const counter=el('closureFields').querySelector(`[data-counter="${input.dataset.commercial}"]`);if(counter)counter.textContent=input.value.length+'/500';
    }));
    el('commercialEdit').hidden=!!commercialDraft||!canEdit();
    el('commercialSave').hidden=!commercialDraft && !(isDirection && editing);
    el('commercialCancel').hidden=!commercialDraft && !(isDirection && editing);
    if(isDirection&&editing){if(mobile)el('saveRow').style.display='none';else profileButton().hidden=true;}
    el('strategyRequest').hidden=!commercialDraft||!canStrategy();
    el('partialDemo').hidden=!isDirection;
    const typeIndex=catalog[segment()].findIndex(q=>q.q==='Tipo de dirección');
    const types=profileData()[typeIndex];
    el('fleetRegistration').hidden=!isDirection;
    el('fleetRegistration').textContent=Array.isArray(types)&&types.length?'Tipo de dirección: '+types.join(', '):'Tipo de dirección sin registrar. Parque vehicular no se interpreta como «No aplica».';
    el('missingSituation').hidden=situations().length>0;
    renderAudit();
  }
  function saveCommercial() {
    if(!allowedSave())return;
    if(segment()==='empresas'&&directionView&&editing){
      saveProfile();
      if(editing)return;
    }
    if(!commercialDraft)return;
    if(!canStatus())commercialDraft.status=saved().status;
    if(!canStrategy())['dmaic','focus','lever','gtm'].forEach(k=>commercialDraft[k]=saved()[k]);
    if(['root','plan','dmaic','focus','lever','gtm'].some(k=>commercialDraft[k].length>500)){announce('Máximo 500 caracteres por campo. Corrige el dato; conservamos la captura.',true);return;}
    if(canStrategy()&&!el('strategyRequest').value.trim()&&['dmaic','focus','lever','gtm'].some(k=>commercialDraft[k]!==saved()[k])){announce('Indica la solicitud de Negocio que autoriza el cambio de estrategia (demo).',true);return;}
    const key=context()+':Información adicional';
    if(revision(key)!==commercialBaseline&&!conflictReview){
      conflictReview=true; commercialBaseline=revision(key); renderAudit(); announce('Cambió Información adicional en este contexto. Revisa anterior/nuevo en el historial. Conservamos tu captura; vuelve a Guardar para confirmar tras revisar.',true);return;
    }
    if(segment()==='empresas'&&directionView&&el('failCommercial').checked){pendingDirection=true;announce('Información comercial no guardada (falla simulada). Se conserva su captura. Tipo de dirección y Ubicación conservan su resultado independiente. Reintentar procesa solo la parte pendiente.',true);return;}
    const before=clone(saved()); records.set(context(),clone(commercialDraft));
    recordChange(key,'Información adicional',before,commercialDraft,{status:'Estatus',situation:'Situación actual',root:'Causa raíz',plan:'Plan de acción',service:'¿Este cliente es?',dmaic:'DMAIC',focus:'Foco',lever:'Palanca',gtm:'Matriz GTM'});
    commercialDraft=null;pendingDirection=false;conflictReview=false;renderCommercial();announce('Información adicional guardada en este contexto.');
    if(parent!==window && !directionView) parent.postMessage({type:'epico:diagnosis-saved',clientId:client(),values:clone(saved()),date:new Date().toLocaleDateString('es-MX')},location.origin);
  }
  const host=el(mobile?'profile':'diag');
  const closure=document.createElement('section');closure.className='card closure-card';
  closure.innerHTML=`<div class="row"><h2>Diagnóstico de cliente</h2><small>Versión 0.13 · datos ficticios</small></div>
    <div id="closureNotice" class="notice closure-notice" role="status" tabindex="-1">Guardado manual. Las respuestas opcionales pueden completarse después.</div>
    <p id="closureCompletion" class="pill"></p><h3 id="closureContext"></h3><p id="directionAddress" class="sub"></p>
    <div class="row"><button id="directionBack" class="${buttonClass} alt">Volver a Cuenta</button><button id="openDirection" class="${buttonClass} alt">Abrir Dirección seleccionada</button></div>
    <p id="fleetRegistration" class="sub"></p>
    <details class="closure-demo"><summary>Escenarios de prueba · simulación</summary><div class="row">
    <label>Estado del cliente <select id="clientScenario"><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="merged">Cuenta fusionada</option><option value="restricted">Fusionada sin permiso al destino</option></select></label>
    <label><input type="checkbox" id="networkDemo" checked> Conexión disponible</label>
    <button id="expireSession" class="${buttonClass} alt">Simular sesión vencida</button><button id="resumeSession" class="${buttonClass} alt" hidden>Iniciar sesión de nuevo (demo)</button>
    <button id="profileConflict" class="${buttonClass} alt">Simular cambio de otro usuario en Perfil</button><button id="commercialConflict" class="${buttonClass} alt">Simular cambio en Información adicional</button>
    <label id="partialDemo"><input id="failCommercial" type="checkbox"> Simular falla del servicio comercial</label></div></details>
    <p id="clientState" role="status"></p><button id="mergedDestination" class="${buttonClass} alt" hidden>Abrir Cuenta vigente 450 (demo)</button>
    <h3>Información adicional</h3><p class="sub">Los valores de Cuenta y Dirección son independientes. Asesor y Supervisor editan Plan de acción; Estatus solo Supervisor.</p>
    <div id="closureFields" class="fields group"></div><p id="missingSituation" class="sub">No se agregan opciones de Situación actual sin catálogo aprobado para este segmento.</p>
    <input id="strategyRequest" aria-label="Solicitud de Negocio para estrategia" placeholder="Referencia de solicitud de Negocio (demo)" hidden>
    <div class="row"><button id="commercialEdit" class="${buttonClass}">Modificar información adicional</button><button id="commercialSave" class="${buttonClass}">Guardar</button><button id="commercialCancel" class="${buttonClass} alt">Cancelar</button></div>
    <p class="sub">Si falta una opción, solicita su revisión al administrador. Negocio valida y el Administrador autorizado aplica.</p>
    <button id="confirmProfileConflict" class="${buttonClass} alt" hidden>Confirmar Perfil después de revisar diferencias</button>
    <button id="recoverProfile" class="${buttonClass} alt" hidden>Recuperar respuestas anteriores para revisión</button>`;
  host.prepend(closure);
  const management=document.createElement('section');management.className='card';
  const currentDate=new Date();const tomorrow=new Date(currentDate);tomorrow.setDate(tomorrow.getDate()+1);
  management.innerHTML=`<h3>Historial de gestión · demostración</h3><p><b>Última actividad:</b> Visita realizada · ${escape(currentDate.toLocaleDateString('es-MX'))}</p><p>Solo las actividades realizadas actualizan esta fecha. Sin histórico de visitas o agenda de Salesforce.</p><div class="closure-activities"><p>Visita · ${escape(currentDate.toLocaleDateString('es-MX'))} · Realizada</p><p>Seguimiento · ${escape(tomorrow.toLocaleDateString('es-MX'))} · Programada</p><p>Visita · ${escape(currentDate.toLocaleDateString('es-MX'))} · Cancelada</p></div>`;
  host.append(management);
  const style=document.createElement('style');style.textContent='#fields[hidden],#questions[hidden]{display:none!important}.closure-card{margin-bottom:18px}.closure-card .fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}.closure-card textarea,.closure-card select,.closure-card input:not([type=checkbox]),.closure-search{width:100%;padding:11px;border:1px solid #bccbdd;border-radius:6px;font:inherit;background:white;box-sizing:border-box}.closure-card label{display:block;margin-bottom:6px}.closure-card small{display:block;color:#52617b}.closure-card .row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.closure-demo{padding:12px;border:1px dashed #c2ccdb;margin:16px 0}.closure-demo summary{cursor:pointer}.closure-notice{padding:12px;border-radius:6px;background:#eaf4fc;margin:12px 0}.closure-notice.warn{background:#fff3d7}.closure-card [hidden]{display:none!important}.closure-card button{min-height:42px}.history-item{border-bottom:1px solid #dce4ef;padding:12px;overflow-wrap:anywhere}@media(max-width:600px){.closure-card .fields{grid-template-columns:1fr}.closure-card{padding:14px}.closure-card h2{font-size:20px}}';document.head.append(style);
  el('commercialEdit').onclick=()=>{if(!canEdit())return;commercialDraft=clone(saved());commercialBaseline=revision(context()+':Información adicional');conflictReview=false;renderCommercial();};
  el('commercialSave').onclick=saveCommercial;
  el('commercialCancel').onclick=()=>{if(confirmLeave())redraw();};
  el('directionBack').onclick=()=>{if(confirmLeave()){directionView=false;redraw();}};
  el('openDirection').onclick=()=>{if(confirmLeave()){directionView=true;redraw();}};
  el('networkDemo').onchange=event=>{networkDemo=event.target.checked;announce(networkDemo?'Conexión disponible. Puedes reintentar el guardado.':'Sin conexión. La captura se conserva en esta pantalla, sin guardar.');};
  el('expireSession').onclick=()=>{sessionExpired=true;el('resumeSession').hidden=false;announce('Sesión vencida (simulación). La captura permanece temporalmente en memoria; vuelve a iniciar sesión.',true);};
  el('resumeSession').onclick=()=>{sessionExpired=false;el('resumeSession').hidden=true;announce(canEdit()?'Sesión recuperada. Permisos revalidados; al guardar se revisarán los conflictos.':'Sesión recuperada. Este contexto es de consulta y no permite guardar.');};
  el('clientScenario').onchange=event=>{
    const value=event.target.value;if(!confirmLeave()){event.target.value=scenario;return;}scenario=value;
    el('clientState').textContent=value==='inactive'?'Cliente inactivo · solo consulta. No equivale al Estatus comercial Perdido.':value==='merged'?'Cuenta fusionada. Puedes abrir la Cuenta vigente autorizada.':value==='restricted'?'Cuenta fusionada. No tienes permiso para consultar la Cuenta vigente.':'';
    el('mergedDestination').hidden=value!=='merged';redraw();
  };
  el('mergedDestination').onclick=()=>{const url=new URL(location.href);url.searchParams.set('clientId','450');location.assign(url);};
  el('profileConflict').onclick=()=>{
    const key=profileContext(),before=clone(profileData()),after=clone(before);const index=catalog[segment()].findIndex(q=>q.t==='single');
    if(index>=0)after[index]=catalog[segment()][index].options.find(x=>x!==before[index])||'';
    if(mobile)dataStore[currentKey()]=after;else store[window.key()]=after;
    recordChange(key,'Perfil · otro usuario (demo)',before,after,Object.fromEntries(catalog[segment()].map((q,i)=>[i,q.q])));renderAudit();announce('Otro usuario guardó una revisión de Perfil en este contexto (demo). Información adicional no entra en conflicto.');
  };
  el('commercialConflict').onclick=()=>{const before=clone(saved()),after={...before,plan:'Propuesta actualizada por Supervisor (demo)'};records.set(context(),after);recordChange(context()+':Información adicional','Información adicional · otro usuario (demo)',before,after);renderAudit();announce('Otro usuario guardó Información adicional (demo). El Perfil sigue siendo independiente.');};
  el('confirmProfileConflict').onclick=saveProfile;
  el('recoverProfile').onclick=()=>{if(!canEdit())return;const previous=profileHistory.get(profileContext());if(!previous)return;beginProfile();if(mobile)draft=clone(previous);else store[window.key()]=clone(previous);redraw();announce('Respuestas recuperadas para revisión. Valida y pulsa Guardar; no se guardan automáticamente.');};
  let previousDirection=el('direction').value;
  el('direction').onchange=()=>{if(confirmLeave()){previousDirection=el('direction').value;directionView=true;redraw();}else el('direction').value=previousDirection;};
  let previousRole=role();el('role').onchange=()=>{const next=role();if(!confirmLeave()){el('role').value=previousRole;return;}previousRole=next;redraw();};
  ['KAM'].forEach(value=>{if(![...el('role').options].some(o=>o.value===value))el('role').add(new Option(value,value));});
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
  redraw();
})();
