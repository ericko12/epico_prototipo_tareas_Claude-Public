/**
 * Contactos por dirección (SPEC-F2-006), prototipo.
 * Reglas tomadas del cambio SDD `2026-11-19-contactos-por-direccion` del repo epico-movil
 * (rama release/1.0.0-contactos-por-direccion). «clar. N» = fila N de su clarifications.md.
 */

export type Phone = { number: string; ext: string; email: string };
export type Contact = {
  id: string;
  customerId: string;
  name: string;
  /** Vacío en contactos registrados antes del cambio (heredados). */
  area: string;
  /** «Decide la compra»: del Contacto, no de cada Asociación (clar. 5). */
  decides: boolean;
  rows: Phone[];
  createdAt: string;
};
export type Association = {
  id: string;
  contactId: string;
  addressId: string;
  from: string;
  /** Vacío mientras está vigente. */
  to: string;
  reason: string;
  by: string;
  /** Asociación creada por la asociación inicial masiva (clar. 9). */
  bulk: boolean;
};
export type ContactsState = { contacts: Contact[]; associations: Association[]; inactiveAddresses: string[] };

/** Opciones vigentes; las mantiene Datos Maestros (clar. 22). */
export const AREAS = ['Administración', 'Compras', 'Contabilidad', 'Gerencia', 'Recepción'];
export const REASONS = ['Ya no trabaja ahí', 'Cambió de dirección', 'Dato capturado por error', 'Otro'];
export const SYSTEM_REASON = 'Dirección inactiva';
export const OTHER_REASON_MAX = 120;
export const USER = 'Luis Galván';

export const MSG = {
  added: 'Contacto agregado a la dirección.',
  associated: 'Contacto asociado a esta dirección.',
  emptyAddress: 'Esta dirección no tiene contactos vigentes.',
  pendingClient: 'Este cliente tiene contactos que aún no están asociados a ninguna dirección. Revísalos para asociarlos.',
  noAddress: 'Este contacto todavía no está asociado a una dirección.',
  required: 'Este dato es obligatorio. Complétalo para guardar los cambios.',
  areaMissing: 'Selecciona una opción de la lista. Si falta alguna, solícitala a Datos Maestros.',
  invalidAddress: 'No podemos agregar contactos porque la dirección no tiene una cuenta válida. Repórtalo a Datos Maestros para corregirla.',
  saveError: 'No pudimos guardar el vínculo. Conservamos tus datos; revisa el elemento señalado.',
};
export const DECIDES_LABEL = 'Decide la compra';

const d = (s: string) => new Date(s).toISOString();
export const INITIAL_STATE: ContactsState = {
  contacts: [
    { id: 'C1', customerId: '529', name: 'Laura Méndez Ortiz', area: 'Compras', decides: true, rows: [{ number: '3312345678', ext: '', email: 'compras@transportesdemo.mx' }, { number: '3336001234', ext: '105', email: '' }], createdAt: d('2025-03-10T10:00') },
    { id: 'C2', customerId: '529', name: 'Ricardo Salas', area: 'Recepción', decides: false, rows: [{ number: '3336001200', ext: '101', email: 'recepcion@transportesdemo.mx' }], createdAt: d('2025-06-02T12:00') },
    { id: 'C3', customerId: '529', name: 'Patricia Núñez', area: '', decides: false, rows: [{ number: '3398765432', ext: '', email: 'pnunez@transportesdemo.mx' }], createdAt: d('2022-08-15T09:00') },
    { id: 'C4', customerId: '529', name: 'COMPRAS', area: '', decides: false, rows: [{ number: '3336001000', ext: '', email: '' }], createdAt: d('2021-01-20T09:00') },
    { id: 'C5', customerId: '529', name: 'Jorge Treviño Garza', area: 'Gerencia', decides: true, rows: [{ number: '8187654321', ext: '', email: 'jtrevino@transportesdemo.mx' }], createdAt: d('2024-11-05T16:00') },
    { id: 'C6', customerId: '529', name: 'Ana Ruiz', area: 'Administración', decides: false, rows: [{ number: '3311112222', ext: '', email: 'aruiz@transportesdemo.mx' }], createdAt: d('2024-02-01T11:00') },
  ],
  associations: [
    { id: 'A1', contactId: 'C1', addressId: '529-BASE', from: d('2026-11-16T09:00'), to: '', reason: '', by: USER, bulk: false },
    { id: 'A2', contactId: 'C1', addressId: '529-D1', from: d('2026-11-16T09:05'), to: '', reason: '', by: USER, bulk: false },
    { id: 'A3', contactId: 'C2', addressId: '529-BASE', from: d('2026-11-16T09:10'), to: '', reason: '', by: USER, bulk: false },
    { id: 'A4', contactId: 'C5', addressId: '529-MTY', from: d('2026-11-16T09:15'), to: '', reason: '', by: 'Yuridia Torres', bulk: false },
    { id: 'A5', contactId: 'C6', addressId: '529-D1', from: d('2026-11-16T09:20'), to: d('2026-11-18T13:00'), reason: 'Ya no trabaja ahí', by: USER, bulk: false },
  ],
  inactiveAddresses: [],
};

export const isActive = (a: Association) => !a.to;
export const activeFor = (s: ContactsState, contactId: string) => s.associations.filter(a => a.contactId === contactId && isActive(a));
export const customerContacts = (s: ContactsState, customerId: string) => s.contacts.filter(c => c.customerId === customerId);

/** Primero quien decide la compra y después por nombre; sin buscador ni paginación (clar. 12). */
export const sortContacts = (list: Contact[]) => [...list].sort((a, b) => Number(b.decides) - Number(a.decides) || a.name.localeCompare(b.name, 'es'));

export function addressView(s: ContactsState, customerId: string, addressId: string) {
  const all = customerContacts(s, customerId);
  const here = sortContacts(all.filter(c => activeFor(s, c.id).some(a => a.addressId === addressId)));
  const withoutAddress = sortContacts(all.filter(c => activeFor(s, c.id).length === 0));
  const elsewhere = sortContacts(all.filter(c => !here.includes(c) && !withoutAddress.includes(c)));
  const history = s.associations.filter(a => a.addressId === addressId && !isActive(a)).sort((a, b) => b.to.localeCompare(a.to));
  return { here, withoutAddress, elsewhere, history };
}

/** Faltantes de un contacto heredado: se señalan al consultar y se exigen al editar (clar. 6, 11). */
export function missing(c: Contact): string[] {
  const m: string[] = [];
  if (!c.area) m.push('Área de contacto');
  if (!c.rows.some(r => r.email.trim())) m.push('Correo');
  return m;
}

export type FormErrors = { name?: string; area?: string; rows?: { number?: string; ext?: string; email?: string }[] };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Mismos obligatorios que hoy (Nombre, Teléfono y Correo) más el área (clar. 6, 11, 16). */
export function validate(form: Pick<Contact, 'name' | 'area' | 'rows'>): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim()) e.name = MSG.required;
  if (!form.area) e.area = MSG.areaMissing;
  const rows = form.rows.map((r, i) => {
    const re: { number?: string; ext?: string; email?: string } = {};
    const digits = r.number.replace(/\D/g, '');
    if (i === 0 && !digits) re.number = MSG.required;
    else if (digits && digits.length !== 10) re.number = 'El teléfono debe tener 10 dígitos.';
    if (r.ext && !/^\d{1,5}$/.test(r.ext)) re.ext = 'Máx. 5 dígitos.';
    if (i === 0 && !r.email.trim()) re.email = MSG.required;
    else if (r.email.trim() && !EMAIL.test(r.email.trim())) re.email = 'Revisa el formato del correo.';
    return re;
  });
  if (rows.some(r => Object.keys(r).length)) e.rows = rows;
  return e;
}
export const hasErrors = (e: FormErrors) => !!(e.name || e.area || e.rows);

let seq = 0;
const id = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/** Alta: desde la Dirección queda asociada; desde el Cliente queda «Sin dirección asociada» (clar. 10). */
export function createContact(s: ContactsState, customerId: string, form: Pick<Contact, 'name' | 'area' | 'decides' | 'rows'>, addressId?: string): ContactsState {
  const now = new Date().toISOString();
  const contact: Contact = { id: id('C'), customerId, ...form, name: form.name.trim(), rows: form.rows.filter((r, i) => i === 0 || r.number || r.email), createdAt: now };
  const associations = addressId ? [...s.associations, { id: id('A'), contactId: contact.id, addressId, from: now, to: '', reason: '', by: USER, bulk: false }] : s.associations;
  return { ...s, contacts: [...s.contacts, contact], associations };
}

export function updateContact(s: ContactsState, contactId: string, form: Pick<Contact, 'name' | 'area' | 'decides' | 'rows'>): ContactsState {
  return { ...s, contacts: s.contacts.map(c => c.id === contactId ? { ...c, ...form, name: form.name.trim(), rows: form.rows.filter((r, i) => i === 0 || r.number || r.email) } : c) };
}

/** Asociar sin confirmación; si ya está vigente en esa Dirección no se duplica (clar. 15). */
export function associate(s: ContactsState, contactId: string, addressId: string): ContactsState {
  if (s.associations.some(a => a.contactId === contactId && a.addressId === addressId && isActive(a))) return s;
  return { ...s, associations: [...s.associations, { id: id('A'), contactId, addressId, from: new Date().toISOString(), to: '', reason: '', by: USER, bulk: false }] };
}

/** Inactivar con motivo de la lista; «Otro» exige texto. Nunca se reactiva: se vuelve a asociar (clar. 13, 14). */
export function inactivate(s: ContactsState, associationId: string, reason: string, by = USER): ContactsState {
  const now = new Date().toISOString();
  return { ...s, associations: s.associations.map(a => a.id === associationId && isActive(a) ? { ...a, to: now, reason, by } : a) };
}

/** Logística inactiva la Dirección: sus Asociaciones pasan al histórico con motivo del sistema (clar. 8). */
export function inactivateAddress(s: ContactsState, addressId: string): ContactsState {
  const now = new Date().toISOString();
  return {
    inactiveAddresses: [...new Set([...s.inactiveAddresses, addressId])],
    contacts: s.contacts,
    associations: s.associations.map(a => a.addressId === addressId && isActive(a) ? { ...a, to: now, reason: SYSTEM_REASON, by: 'Sistema' } : a),
  };
}
export const reactivateAddress = (s: ContactsState, addressId: string): ContactsState => ({ ...s, inactiveAddresses: s.inactiveAddresses.filter(a => a !== addressId) });

export function validState(v: unknown): v is ContactsState {
  const s = v as ContactsState;
  return !!s && Array.isArray(s.contacts) && Array.isArray(s.associations) && Array.isArray(s.inactiveAddresses)
    && s.contacts.every(c => typeof c.id === 'string' && typeof c.name === 'string' && Array.isArray(c.rows))
    && s.associations.every(a => typeof a.id === 'string' && typeof a.addressId === 'string');
}
