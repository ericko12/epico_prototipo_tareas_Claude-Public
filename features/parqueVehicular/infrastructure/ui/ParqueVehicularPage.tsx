'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, InputAdornment, MenuItem, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, ArrowBack, EditOutlined, InfoOutlined, LocalShippingOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useSetBreadcrumb } from '@/features/layoutMain/infrastructure/ui/BreadcrumbContext';
import { ADDRESSES, CATALOG, CUSTOMERS, EMPTY_FORM, INITIAL_FLEETS, MOTORS, SELLER_ID, canAccessAddress, hasBody, sameConfiguration, validStoredFleets, validateFleet, visibleCustomers } from '../../domain/fleet';
import type { Fleet, FleetForm } from '../../domain/fleet';

type Screen = 'fleet' | 'form' | 'detail';
const STORAGE_KEY = 'epico-tareas-fleet-review-v1';
const date = (value: string) => new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export default function ParqueVehicularPage({ customerId, addressId, onBack }: { customerId: string; addressId: string; onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('fleet');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<FleetForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof FleetForm, string>>>({});
  const [groups, setGroups] = useState<Fleet[]>(INITIAL_FLEETS);
  const [loaded, setLoaded] = useState(false);
  const [notes, setNotes] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [dependent, setDependent] = useState<{ field: 'type' | 'brand'; value: string } | null>(null);
  const [duplicate, setDuplicate] = useState<Fleet | null>(null);
  const [notice, setNotice] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const initialForm = useRef<FleetForm>({ ...EMPTY_FORM });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const customer = CUSTOMERS.find(c => c.id === customerId);
  const address = ADDRESSES.find(a => a.id === addressId && a.customerId === customerId && a.sellerId === SELLER_ID);
  const selected = groups.find(g => g.id === selectedId && g.addressId === address?.id);
  const addressGroups = address ? groups.filter(g => g.addressId === address.id) : [];
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm.current);
  useSetBreadcrumb(['Clientes', 'Listado de clientes', 'Detalle', address?.label || 'Dirección', 'Parque vehicular', ...(screen === 'form' ? [selectedId ? 'Modificar' : 'Nuevo'] : [])]);

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const parsed = JSON.parse(raw); if (validStoredFleets(parsed)) setGroups(parsed); else setNotice('Se restauraron los ejemplos porque los datos guardados no eran compatibles.'); } }
    catch { setStorageAvailable(false); }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)); } catch { setStorageAvailable(false); } } }, [groups, loaded]);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); headingRef.current?.scrollIntoView({ block: 'center' }); }, [screen, customerId, addressId]);
  useEffect(() => {
    if (screen !== 'form' || !dirty) return;
    const leave = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [screen, dirty]);

  function editGroup(group?: Fleet) {
    if (!address || !canAccessAddress(address.id)) return;
    if (group && group.addressId !== address.id) return;
    const next = group ? { ...EMPTY_FORM, ...group } : { ...EMPTY_FORM };
    // Store only form fields so dirty comparison is independent of metadata.
    const clean = Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, next[k as keyof FleetForm]])) as FleetForm;
    setSelectedId(group?.id || ''); setForm(clean); initialForm.current = clean; setErrors({}); setScreen('form');
  }
  function fieldChange(field: keyof FleetForm, value: string) {
    if ((field === 'type' && form.brand) || (field === 'brand' && form.model)) { setDependent({ field: field as 'type' | 'brand', value }); return; }
    applyChange(field, value);
  }
  function applyChange(field: keyof FleetForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value, ...(field === 'type' ? { brand: '', model: '', body: '', bodyModel: '' } : field === 'brand' ? { model: '', body: '', bodyModel: '' } : {}) }));
    setErrors({}); setDependent(null);
  }
  function save(again: boolean) {
    if (!address || !canAccessAddress(address.id)) { setNotice('La dirección ya no está disponible.'); return; }
    const clean = { ...form, units: form.units.trim(), from: form.from.trim(), to: form.to.trim(), ...(!hasBody(form.type) ? { body: '', bodyModel: '' } : {}) };
    const nextErrors = validateFleet(clean); setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setTimeout(() => document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(), 0); return; }
    const found = addressGroups.find(g => g.id !== selectedId && sameConfiguration(g, clean));
    if (found) { setDuplicate(found); return; }
    const now = new Date().toISOString();
    const id = selectedId || `PV-${String(Math.max(0, ...groups.map(g => Number(g.id.replace('PV-', '')) || 0)) + 1).padStart(3, '0')}`;
    const row: Fleet = { ...clean, id, addressId: address.id, createdAt: selected?.createdAt || now, updatedAt: now };
    setGroups(prev => selectedId ? prev.map(g => g.id === selectedId && g.addressId === address.id ? row : g) : [...prev, row]);
    setNotice(selectedId ? 'Grupo actualizado.' : 'Grupo registrado.');
    setSelectedId(''); setErrors({});
    if (again) { setForm({ ...EMPTY_FORM }); initialForm.current = { ...EMPTY_FORM }; }
    else setScreen('fleet');
  }
  function cancelForm() { if (dirty) setDiscard(true); else setScreen('fleet'); }
  function view(group: Fleet) { setSelectedId(group.id); setScreen('detail'); }
  const context = address && customer ? <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fafcff', borderColor: '#dce4ef' }}><Stack direction="row" spacing={1.5} alignItems="flex-start"><LocalShippingOutlined color="primary" /><Box sx={{ minWidth: 0 }}><Typography fontWeight={700}>{address.label}</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{address.street}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{customer.name} · {customer.id}</Typography></Box></Stack></Paper> : null;
  const title = screen === 'form' ? (selectedId ? 'Modificar parque vehicular' : 'Registrar parque vehicular') : screen === 'detail' ? `Parque vehicular · ${selected?.id || ''}` : 'Parque vehicular';
  const back = () => { if (screen === 'form') cancelForm(); else if (screen === 'detail') setScreen('fleet'); else onBack(); };
  const field = (name: keyof FleetForm, label: string, options?: string[], required = false, disabled = false) => <TextField key={name} id={`fleet-${name}`} name={name} label={label} fullWidth size="small" required={required} select={!!options} value={form[name]} disabled={disabled} onChange={e => fieldChange(name, e.target.value)} error={!!errors[name]} helperText={errors[name]} inputProps={!options ? { inputMode: ['from', 'to', 'units'].includes(name) ? 'numeric' : 'text' } : undefined}>
    {options && <MenuItem value="">Seleccionar</MenuItem>}{options?.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
  </TextField>;

  if (!loaded) return <Box sx={{ p: 4 }}><CircularProgress aria-label="Cargando parque vehicular" /></Box>;
  return <Box sx={{ pt: 2, pb: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">Prototipo de revisión · Datos de ejemplo · Asesor {SELLER_ID}</Typography>
      <Button size="small" startIcon={<InfoOutlined />} onClick={() => setNotes(true)}>Notas para revisión</Button>
    </Stack>
    {!storageAvailable && <Alert severity="info" sx={{ mb: 2 }}>Los cambios se conservarán mientras esta pantalla siga abierta. El navegador no permite guardarlos para otra sesión.</Alert>}
    {<Button startIcon={<ArrowBack />} onClick={back} sx={{ mb: 1 }}>{screen === 'fleet' ? 'Volver a Direcciones' : 'Volver al parque vehicular'}</Button>}
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
      <Typography component="h1" variant="h5" fontWeight={700} tabIndex={-1} ref={headingRef} sx={{ outline: 'none' }}>{title}</Typography>
      {screen === 'fleet' && <Button variant="contained" startIcon={<Add />} onClick={() => editGroup()}>Registrar parque vehicular</Button>}
      {screen === 'detail' && selected && <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => editGroup(selected)}>Modificar</Button>}
    </Stack>

    {['fleet', 'form', 'detail'].includes(screen) && context}
    {screen === 'fleet' && address && <>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}><Chip variant="outlined" label={`Grupos registrados: ${addressGroups.length}`} /><Chip variant="outlined" label={`Total de unidades: ${addressGroups.reduce((n, g) => n + Number(g.units), 0)}`} /></Stack>
      {!addressGroups.length ? <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}><LocalShippingOutlined sx={{ fontSize: 44, color: 'primary.main' }} /><Typography variant="h6" sx={{ mt: 1 }}>Sin parque vehicular registrado</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Registra el primer grupo de vehículos de esta dirección.</Typography><Button variant="contained" startIcon={<Add />} onClick={() => editGroup()}>Registrar primer grupo</Button></Paper> : <>
        <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}><Table><TableHead><TableRow>{['Folio', 'Tipo', 'Marca / Modelo', 'Años', 'Unidades', 'Acción'].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{addressGroups.map(g => <TableRow key={g.id} hover><TableCell><Button onClick={() => view(g)}>{g.id}</Button></TableCell><TableCell>{g.type}</TableCell><TableCell>{g.brand} / {g.model}</TableCell><TableCell>{g.from || '—'} – {g.to || '—'}</TableCell><TableCell>{g.units}</TableCell><TableCell><Button startIcon={<VisibilityOutlined />} onClick={() => view(g)}>Ver detalle</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>{addressGroups.map(g => <Card key={g.id} variant="outlined"><CardContent><Typography fontWeight={700}>{g.brand} / {g.model}</Typography><Typography variant="body2">{g.type}</Typography><Typography sx={{ my: 1 }}>{g.from || '—'} – {g.to || '—'} · {g.units} unidades</Typography><Button onClick={() => view(g)}>Ver detalle · {g.id}</Button></CardContent></Card>)}</Stack>
      </>}
    </>}

    {screen === 'form' && address && <Box component="form" noValidate onSubmit={e => { e.preventDefault(); save(false); }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {field('type', 'Tipo', Object.keys(CATALOG), true)}
        {field('brand', 'Marca / Armadora', Object.keys(CATALOG[form.type] || {}), true, !form.type)}
        {field('model', 'Modelo', CATALOG[form.type]?.[form.brand] || [], true, !form.brand)}
        {field('motor', 'Motor', MOTORS)}
        {hasBody(form.type) && field('body', 'Carrocería', form.brand === 'VOLVO' ? ['VOLVO'] : ['MERCEDES'])}
        {hasBody(form.type) && field('bodyModel', 'Modelo de carrocería', form.brand === 'VOLVO' ? ['9800 DD'] : ['OF 1721'])}
        {field('from', 'Año inicial')}{field('to', 'Año final')}{field('units', 'Unidades', undefined, true)}
      </Box><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* Campos obligatorios</Typography></Paper>
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, pb: 2 }}><Button variant="outlined" onClick={cancelForm}>Cancelar</Button>{!selectedId && <Button variant="outlined" onClick={() => save(true)}>Guardar y agregar otro</Button>}<Button type="submit" variant="contained">{selectedId ? 'Guardar cambios' : 'Guardar'}</Button></Stack>
    </Box>}

    {screen === 'detail' && selected && <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>{[['Folio', selected.id], ['Tipo', selected.type], ['Marca / Armadora', selected.brand], ['Modelo', selected.model], ...(hasBody(selected.type) ? [['Carrocería', selected.body], ['Modelo de carrocería', selected.bodyModel]] : []), ['Motor', selected.motor], ['Año inicial', selected.from], ['Año final', selected.to], ['Unidades', selected.units], ['Creación', date(selected.createdAt)], ['Última actualización', date(selected.updatedAt)]].map(([label, value]) => <Box key={label}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography fontWeight={600}>{value || 'Sin registrar'}</Typography></Box>)}</Box></Paper>}

    <Dialog open={notes} onClose={() => setNotes(false)} fullWidth maxWidth="sm"><DialogTitle>Revisión con Luis Galván</DialogTitle><DialogContent><Alert severity="info" sx={{ mb: 2 }}>Propuesta navegable para comentar. Los datos y catálogos son de ejemplo; los cambios quedan sólo en este navegador.</Alert><Typography paragraph>Recorrido: Clientes → detalle → Información general → Dirección asignada → Parque vehicular → registrar o consultar un grupo.</Typography><Typography fontWeight={700}>Decisiones que necesitamos validar</Typography><Box component="ul" sx={{ pl: 3, '& li': { mb: 1 } }}><li>Carrocería y Modelo de carrocería se muestran para autobús en esta demostración. Su aplicabilidad definitiva sigue pendiente.</li><li>Motor y años se dejan opcionales para revisión; falta confirmar obligatoriedad y límites.</li><li>Guardar y agregar otro guarda cada grupo de inmediato en este navegador. No representa un acuerdo sobre la transacción productiva.</li><li>Una coincidencia exacta permite volver al grupo existente; faltan política de duplicados y tratamiento de rangos solapados.</li><li>No se habilita baja ni captura «Otro» hasta acordar su tratamiento. El ejemplo permite modificar los grupos de las direcciones asignadas; la matriz completa de permisos sigue pendiente.</li><li>La cartera se simula con vendedorID {SELLER_ID}. En producción la autorización debe validarse también en servidor por Cliente + Dirección + vendedorID.</li></Box><Typography variant="body2" color="text.secondary">Esta versión no acredita levantamiento completo, no aplica caducidad y no implementa reportería, migración ni integraciones.</Typography></DialogContent><DialogActions><Button onClick={() => setNotes(false)} variant="contained">Entendido</Button></DialogActions></Dialog>
    <Dialog open={discard} onClose={() => setDiscard(false)}><DialogTitle>¿Descartar la captura?</DialogTitle><DialogContent>Los cambios sin guardar se perderán. Los grupos que ya guardaste se conservan.</DialogContent><DialogActions><Button onClick={() => setDiscard(false)}>Seguir capturando</Button><Button variant="contained" onClick={() => { setDiscard(false); setScreen('fleet'); }}>Descartar</Button></DialogActions></Dialog>
    <Dialog open={!!dependent} onClose={() => setDependent(null)}><DialogTitle>¿Cambiar la selección?</DialogTitle><DialogContent>Se limpiarán los datos dependientes de {dependent?.field === 'type' ? 'Tipo' : 'Marca / Armadora'}. El motor, los años y las unidades se conservarán.</DialogContent><DialogActions><Button onClick={() => setDependent(null)}>Conservar</Button><Button variant="contained" onClick={() => { if (dependent) applyChange(dependent.field, dependent.value); }}>Cambiar</Button></DialogActions></Dialog>
    <Dialog open={!!duplicate} onClose={() => setDuplicate(null)}><DialogTitle>Ya existe un grupo con esa configuración</DialogTitle><DialogContent>El grupo {duplicate?.id} tiene los mismos datos y rango de años. Puedes revisarlo antes de continuar.</DialogContent><DialogActions><Button onClick={() => setDuplicate(null)}>Seguir capturando</Button><Button variant="contained" onClick={() => { if (duplicate) view(duplicate); setDuplicate(null); }}>Ver grupo existente</Button></DialogActions></Dialog>
    <Snackbar open={!!notice} autoHideDuration={5500} onClose={() => setNotice('')} message={notice} action={<Button color="inherit" size="small" onClick={() => setNotice('')}>Cerrar</Button>} />
  </Box>;
}
