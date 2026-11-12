/**
 * Dominio del prototipo de Parque vehicular.
 * Reglas tomadas de la spec SDD `2026-11-06-parque-vehicular` (alta y consulta) del repositorio epico-movil,
 * más «Modificar» con motivo. Las referencias «clar. N» apuntan a su registro de clarificaciones.
 * Catálogo: `catalog.json`, generado de la matriz de Salesforce (Matriz_Parque_Vehicular.xlsx).
 */
import catalog from './catalog.json';

export const SELLER_ID = '42';
export const OTRO = '__OTRO__';
export const OTRO_LABEL = 'Otro (no está en la lista)';
export const OTRO_MAX = 60;

export type Role = 'asesor' | 'gerente' | 'kam' | 'admin' | 'soporte';
export const ROLES: { id: Role; label: string; user: string }[] = [
  { id: 'asesor', label: 'Asesor asignado', user: 'Pedro (vendedor 42)' },
  { id: 'gerente', label: 'Gerente territorial', user: 'Laura (supervisa al vendedor 42)' },
  { id: 'kam', label: 'KAM', user: 'Jorge (KAM de la Cuenta 529)' },
  { id: 'admin', label: 'Administrador funcional', user: 'Carla' },
  { id: 'soporte', label: 'Soporte de datos', user: 'Soporte' },
];
const SUPERVISED_BY_MANAGER = [SELLER_ID];
const KAM_ACCOUNTS = ['529'];

export type Customer = { id: string; name: string; rfc: string; segment: string };
export type Address = { id: string; customerId: string; sellerId: string; label: string; street: string; shipping: string; qr: boolean };

export const OTRO_FIELDS = ['brand', 'model', 'body', 'bodyModel', 'motor'] as const;
export type OtroField = typeof OTRO_FIELDS[number];
export type FleetForm = {
  type: string; brand: string; brandText: string; model: string; modelText: string;
  body: string; bodyText: string; bodyModel: string; bodyModelText: string;
  motor: string; motorText: string; from: string; to: string; units: string;
};
export type Original = { field: OtroField; value: string; by: string; at: string };
export type Fleet = FleetForm & {
  id: string; addressId: string; justification: string; originals: Original[];
  createdBy: string; createdAt: string; updatedAt: string; lastSurvey: string; editReason: string;
};
export type Draft = FleetForm & { tempId: string; justification: string };

export const FIELD_LABEL: Record<keyof FleetForm, string> = {
  type: 'Tipo', brand: 'Marca / Armadora', brandText: 'Marca escrita', model: 'Modelo', modelText: 'Modelo escrito',
  body: 'Carrocería', bodyText: 'Carrocería escrita', bodyModel: 'Modelo de carrocería', bodyModelText: 'Modelo de carrocería escrito',
  motor: 'Motor', motorText: 'Motor escrito', from: 'Año inicial', to: 'Año final', units: 'Unidades',
};
const MISSING_TEXT: Record<OtroField, string> = {
  brand: 'Escribe la marca que falta.', model: 'Escribe el modelo que falta.', body: 'Escribe la carrocería que falta.',
  bodyModel: 'Escribe el modelo de carrocería que falta.', motor: 'Escribe el motor que falta.',
};

export const CUSTOMERS: Customer[] = [
  { id: '529', name: 'TRANSPORTES DEMO OCCIDENTE', rfc: 'TDO200101XXX', segment: 'Empresas' },
];
export const ADDRESSES: Address[] = [
  { id: '529-BASE', customerId: '529', sellerId: SELLER_ID, label: 'BASE OPERATIVA', street: 'Base operativa · Av. Demo Logística 529 · Tonalá, Jal. · DUMMY', shipping: 'Transporte Interno', qr: true },
  { id: '529-D1', customerId: '529', sellerId: SELLER_ID, label: 'DIRECCIÓN 1', street: 'Av. Demo Transporte 2455 · Guadalajara, Jal. · DUMMY', shipping: 'Flecha Amarilla', qr: false },
  { id: '529-MTY', customerId: '529', sellerId: '53', label: 'BASE MONTERREY', street: 'Av. Demo Norte 120 · Monterrey, N.L. · DUMMY', shipping: 'Transporte Interno', qr: true },
];

// ---------- Catálogo (clar. 23 a 28, 39) ----------
export const TYPES: string[] = catalog.tipos;
export const TYPES_WITHOUT_CATALOG: string[] = catalog.sinCatalogo;
export const MOTORS: string[] = catalog.motores;
const marcas = catalog.marcas as Record<string, string[]>;
const carrocerias = catalog.carrocerias as Record<string, string[]>;
const modelos = catalog.modelos as Record<string, string[]>;
const modelosCarroceria = catalog.modelosCarroceria as Record<string, string[]>;
export const hasBody = (type: string) => type.startsWith('Autobús');
export const brandsFor = (type: string) => marcas[type] || [];
export const modelsFor = (type: string, brand: string) => brand === OTRO ? [] : modelos[`${type}|${brand}`] || [];
export const bodiesFor = (type: string) => hasBody(type) ? carrocerias[type] || [] : [];
export const bodyModelsFor = (type: string, body: string) => body === OTRO ? [] : modelosCarroceria[`${type}|${body}`] || [];
/** Opciones de un campo según lo ya elegido. `undefined` = campo deshabilitado. */
export function optionsFor(form: FleetForm, field: OtroField): string[] | undefined {
  if (field === 'brand') return form.type ? brandsFor(form.type) : undefined;
  if (field === 'model') return form.brand ? modelsFor(form.type, form.brand) : undefined;
  if (field === 'body') return hasBody(form.type) ? bodiesFor(form.type) : undefined;
  if (field === 'bodyModel') return hasBody(form.type) && form.body ? bodyModelsFor(form.type, form.body) : undefined;
  return MOTORS;
}

// ---------- Universo por rol (clar. 9, 14, 34, 43) ----------
export function universe(role: Role, customerId: string) {
  return ADDRESSES.filter(a => a.customerId === customerId && (
    role === 'admin' || role === 'soporte' ||
    (role === 'asesor' && a.sellerId === SELLER_ID) ||
    (role === 'gerente' && SUPERVISED_BY_MANAGER.includes(a.sellerId)) ||
    (role === 'kam' && KAM_ACCOUNTS.includes(a.customerId))));
}
export const assignedAddresses = (customerId: string, sellerId = SELLER_ID) => ADDRESSES.filter(a => a.customerId === customerId && a.sellerId === sellerId);
export const canAccessAddress = (addressId: string, role: Role = 'asesor', customerId = '529') => universe(role, customerId).some(a => a.id === addressId);
export const canRegister = (role: Role, address: Address) => role === 'asesor' && address.sellerId === SELLER_ID;
export const canEdit = (role: Role, address: Address) => canRegister(role, address) || role === 'admin';
export const canSeeReport = (role: Role) => role === 'admin';
export const userOf = (role: Role) => ROLES.find(r => r.id === role)!.user;

// ---------- Valores ----------
export const EMPTY_FORM: FleetForm = { type: '', brand: '', brandText: '', model: '', modelText: '', body: '', bodyText: '', bodyModel: '', bodyModelText: '', motor: '', motorText: '', from: '', to: '', units: '' };
export const textKey = (f: OtroField) => `${f}Text` as const;
/** Valor visible de un campo: el texto escrito cuando es «Otro». */
export const shown = (g: FleetForm, f: OtroField) => g[f] === OTRO ? g[textKey(f)] : g[f];
export const isOtro = (g: FleetForm, f: OtroField) => g[f] === OTRO;
export const hasOtro = (g: FleetForm) => OTRO_FIELDS.some(f => isOtro(g, f));
export const norm = (s: string) => s.trim().toLocaleLowerCase('es');
export const formOf = (g: FleetForm): FleetForm => Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, g[k as keyof FleetForm] ?? ''])) as FleetForm;

/** Limpia lo que depende del campo cambiado (clar. 21, 25, 39): Tipo → todo lo demás del catálogo salvo Motor;
 *  Marca → Modelo (si la marca es «Otro», el modelo también); Carrocería → Modelo de carrocería. */
export function applyChange(form: FleetForm, field: keyof FleetForm, value: string): FleetForm {
  const next: FleetForm = { ...form, [field]: value };
  if (field === 'type') Object.assign(next, { brand: '', brandText: '', model: '', modelText: '', body: '', bodyText: '', bodyModel: '', bodyModelText: '' });
  if (field === 'brand') Object.assign(next, { model: value === OTRO ? OTRO : '', modelText: '' }, value === OTRO ? {} : { brandText: '' });
  if (field === 'body') Object.assign(next, { bodyModel: value === OTRO ? OTRO : '', bodyModelText: '' }, value === OTRO ? {} : { bodyText: '' });
  if ((field === 'model' || field === 'bodyModel' || field === 'motor') && value !== OTRO) next[textKey(field)] = '';
  return next;
}
/** Hay datos dependientes que se perderían al cambiar `field` (para pedir confirmación). */
export function wouldLose(form: FleetForm, field: keyof FleetForm) {
  if (field === 'type') return !!(form.brand || form.body);
  if (field === 'brand') return !!form.model && form.model !== OTRO;
  if (field === 'body') return !!form.bodyModel && form.bodyModel !== OTRO;
  return false;
}

// ---------- Validación (clar. 3, 7, 44) ----------
export type Errors = Partial<Record<keyof FleetForm, string>>;
export function validateFleet(form: FleetForm, today = new Date()): Errors {
  const e: Errors = {};
  const pick = (f: OtroField, options: string[] | undefined, required: boolean) => {
    const v = form[f];
    if (!v) { if (required) e[f] = `Selecciona ${FIELD_LABEL[f].toLocaleLowerCase('es')}.`; return; }
    if (v === OTRO) {
      const t = form[textKey(f)].trim();
      if (!t) e[textKey(f)] = MISSING_TEXT[f];
      else if (t.length > OTRO_MAX) e[textKey(f)] = `Máximo ${OTRO_MAX} caracteres.`;
      return;
    }
    if (!options?.includes(v)) e[f] = `Selecciona una opción de la lista para ${FIELD_LABEL[f].toLocaleLowerCase('es')}.`;
  };
  if (!TYPES.includes(form.type)) e.type = 'Selecciona el tipo.';
  pick('brand', optionsFor(form, 'brand'), true);
  pick('model', optionsFor(form, 'model'), true);
  if (hasBody(form.type)) { pick('body', optionsFor(form, 'body'), false); if (form.body) pick('bodyModel', optionsFor(form, 'bodyModel'), false); }
  pick('motor', MOTORS, false);
  const year = today.getFullYear();
  for (const k of ['from', 'to'] as const) {
    const v = form[k].trim();
    if (!v) continue;
    if (!/^\d{4}$/.test(v)) e[k] = 'Captura el año con cuatro dígitos.';
    else if (Number(v) > year) e[k] = `El año no puede ser posterior a ${year}.`;
  }
  if (!e.from && !e.to && form.from && form.to && Number(form.from) > Number(form.to)) { e.from = 'El año inicial debe ser igual o anterior al año final.'; e.to = 'El año inicial debe ser igual o anterior al año final.'; }
  if (!/^\d+$/.test(form.units.trim()) || Number(form.units) <= 0 || !Number.isSafeInteger(Number(form.units))) e.units = 'Captura un número entero mayor que cero.';
  return e;
}

// ---------- Coincidencias (clar. 2, 16, 35, 41) ----------
const key = (g: FleetForm, f: OtroField) => g[f] === OTRO ? `otro:${norm(g[textKey(f)])}` : g[f];
const same = (a: FleetForm, b: FleetForm, f: OtroField) => key(a, f) === key(b, f);
const sameOrEmpty = (a: FleetForm, b: FleetForm, f: OtroField) => !a[f] || !b[f] || same(a, b, f);
/** Igual tipo, marca y modelo; motor y (en autobús) carrocería iguales o vacíos; años que se cruzan o vacíos. Rangos seguidos no coinciden. */
export function coincide(a: FleetForm, b: FleetForm) {
  if (a.type !== b.type || !same(a, b, 'brand') || !same(a, b, 'model') || !sameOrEmpty(a, b, 'motor')) return false;
  if (hasBody(a.type) && (!sameOrEmpty(a, b, 'body') || !sameOrEmpty(a, b, 'bodyModel'))) return false;
  if ((!a.from && !a.to) || (!b.from && !b.to)) return true;
  const af = Number(a.from || a.to), at = Number(a.to || a.from), bf = Number(b.from || b.to), bt = Number(b.to || b.from);
  return af <= bt && bf <= at;
}
export type Conflict = { draft: Draft; saved: Fleet[]; session: Draft[] };
/** Para cada grupo de la sesión: con qué grupo guardado o anterior de la misma sesión coincide. */
export function reviewConflicts(drafts: Draft[], saved: Fleet[]): Conflict[] {
  return drafts.map((d, i) => ({ draft: d, saved: saved.filter(g => coincide(d, g)), session: drafts.slice(0, i).filter(o => coincide(d, o)) }));
}
export const needsResolution = (c: Conflict) => (c.saved.length > 0 || c.session.length > 0) && !c.draft.justification.trim();

// ---------- Guardado y folio (clar. 1, 8, 15, 41) ----------
export const nextFolio = (groups: Fleet[]) => String(Math.max(124, ...groups.map(g => Number(g.id) || 0)) + 1).padStart(5, '0');
export type SaveResult = { draft: Draft; ok: true; group: Fleet } | { draft: Draft; ok: false; reason: string };
export function saveDrafts(drafts: Draft[], groups: Fleet[], addressId: string, by: string, now = new Date()): { results: SaveResult[]; groups: Fleet[] } {
  let all = [...groups];
  const results: SaveResult[] = drafts.map(d => {
    const first = Object.values(validateFleet(d, now))[0];
    if (first) return { draft: d, ok: false, reason: first };
    const stamp = now.toISOString();
    const group: Fleet = { ...formOf(d), id: nextFolio(all), addressId, justification: d.justification.trim(), originals: [], createdBy: by, createdAt: stamp, updatedAt: stamp, lastSurvey: stamp, editReason: '' };
    all = [...all, group];
    return { draft: d, ok: true, group };
  });
  return { results, groups: all };
}
/** «Modificar» con motivo; solo el asesor renueva el último levantamiento al cambiar datos (clar. 17, 37). */
export function editGroup(group: Fleet, form: FleetForm, reason: string, role: Role, now = new Date()): Fleet {
  const stamp = now.toISOString();
  const changed = JSON.stringify(formOf(group)) !== JSON.stringify(formOf(form));
  return { ...group, ...formOf(form), editReason: reason.trim(), updatedAt: stamp, lastSurvey: role === 'asesor' && changed ? stamp : group.lastSurvey };
}

// ---------- Reporte de «Otro» y reasignación (clar. 31, 42, 44, 45) ----------
export type OtroRow = { field: OtroField; type: string; text: string; count: number; ids: string[] };
export function otroReport(groups: Fleet[]): OtroRow[] {
  const rows = new Map<string, OtroRow>();
  for (const g of groups) for (const f of OTRO_FIELDS) if (isOtro(g, f)) {
    const k = `${f}|${g.type}|${norm(g[textKey(f)])}`;
    const row = rows.get(k) || { field: f, type: g.type, text: g[textKey(f)].trim(), count: 0, ids: [] };
    row.count++; row.ids.push(g.id); rows.set(k, row);
  }
  return [...rows.values()].sort((a, b) => b.count - a.count || a.text.localeCompare(b.text, 'es'));
}
export function monthStats(groups: Fleet[], month = new Date()) {
  const inMonth = groups.filter(g => { const d = new Date(g.createdAt); return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth(); });
  const withOtro = inMonth.filter(hasOtro).length;
  return { total: inMonth.length, withOtro, percent: inMonth.length ? Math.round(withOtro * 100 / inMonth.length) : 0 };
}
/** Opciones del catálogo a las que se puede reasignar un valor del reporte (solo las de su tipo). */
export function reassignOptions(row: OtroRow): string[] {
  if (row.field === 'brand') return brandsFor(row.type);
  if (row.field === 'body') return bodiesFor(row.type);
  if (row.field === 'motor') return MOTORS;
  return [];
}
export function reassign(groups: Fleet[], row: OtroRow, value: string, by: string, now = new Date()): Fleet[] {
  const at = now.toISOString();
  return groups.map(g => row.ids.includes(g.id) ? {
    ...g, [row.field]: value, [textKey(row.field)]: '',
    originals: [...g.originals, { field: row.field, value: `Otro · ${g[textKey(row.field)].trim()}`, by, at }],
    updatedAt: at,
  } : g);
}

// ---------- Datos de ejemplo y persistencia ----------
const stamp = '2026-10-20T12:00:00.000Z';
const sample = (f: Partial<FleetForm>, extra: Partial<Fleet>): Fleet => ({ ...EMPTY_FORM, ...f, id: '', addressId: '', justification: '', originals: [], createdBy: 'Pedro (vendedor 42)', createdAt: stamp, updatedAt: stamp, lastSurvey: stamp, editReason: '', ...extra });
export const INITIAL_FLEETS: Fleet[] = [
  sample({ type: 'Servicio pesado', brand: 'FREIGHTLINER', model: OTRO, modelText: 'COLUMBIA', motor: 'Detroit DD13', from: '2010', to: '2018', units: '25' }, { id: '00123', addressId: '529-D1' }),
  sample({ type: 'Servicio pesado', brand: 'VOLVO', model: 'VNL 670', motor: 'D13', from: '2019', to: '2022', units: '10' }, { id: '00124', addressId: '529-D1' }),
  // El asesor escribió «Hyundai» porque en la lista de Salesforce aparece como «Hyndai»: caso para reasignar desde el reporte.
  sample({ type: 'REMOLQUE - CAJA SECA', brand: OTRO, brandText: 'Hyundai', model: OTRO, modelText: 'Caja seca 53 pies', units: '6' }, { id: '00125', addressId: '529-D1' }),
  sample({ type: 'Autobús- Transporte foráneo o de turismo', brand: 'VOLVO', model: 'B11R', body: 'MARCOPOLO', bodyModel: 'PARADISO G8 1200', motor: 'D11', from: '2020', to: '2023', units: '8' }, { id: '00126', addressId: '529-MTY', createdBy: 'Ana (vendedora 53)' }),
  sample({ type: 'REMOLQUE - CAJA SECA', brand: OTRO, brandText: 'hyundai ', model: OTRO, modelText: 'Caja seca', units: '4' }, { id: '00127', addressId: '529-MTY', createdBy: 'Ana (vendedora 53)' }),
  sample({ type: 'REMOLQUE - JAULA', brand: OTRO, brandText: 'Fruehauf', model: OTRO, modelText: 'Jaula ganadera', units: '3' }, { id: '00128', addressId: '529-MTY', createdBy: 'Ana (vendedora 53)' }),
];
export function validStoredFleets(value: unknown): value is Fleet[] {
  return Array.isArray(value) && value.every(row => row && typeof row === 'object'
    && ['id', 'addressId', 'createdAt', 'updatedAt', 'lastSurvey', ...Object.keys(EMPTY_FORM)].every(k => typeof (row as Record<string, unknown>)[k] === 'string')
    && Array.isArray((row as Fleet).originals) && ADDRESSES.some(a => a.id === (row as Fleet).addressId));
}
export const sortGroups = (gs: Fleet[]) => [...gs].sort((a, b) => a.type.localeCompare(b.type, 'es') || shown(a, 'brand').localeCompare(shown(b, 'brand'), 'es') || a.id.localeCompare(b.id));
