'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, ArrowBack, CheckCircle, EditOutlined, ErrorOutline, InfoOutlined, LocalShippingOutlined, VisibilityOutlined } from '@mui/icons-material';
import { useSetBreadcrumb } from '@/features/layoutMain/infrastructure/ui/BreadcrumbContext';
import { ADDRESSES, CUSTOMERS, EMPTY_FORM, FIELD_LABEL, ROLES, canAccessAddress, canEdit, canRegister, coincide, editGroup, formOf, hasBody, isOtro, needsResolution, reviewConflicts, saveDrafts, shown, sortGroups, userOf, validateFleet } from '../../domain/fleet';
import type { Draft, Errors, Fleet, FleetForm, OtroField, Role, SaveResult } from '../../domain/fleet';
import FleetFields from './FleetFields';
import { fmtDate, fmtDateTime, useFleetStore } from './fleetStore';

type Screen = 'list' | 'capture' | 'review' | 'result' | 'detail' | 'edit';
const NO_CAT = <Chip component="span" size="small" label="No catalogado" color="warning" variant="outlined" sx={{ ml: .75, height: 20 }} />;
const COINCIDENCE = 'Encontramos un grupo con una configuración o rango relacionado. Revísalo antes de continuar.';
let tempSeq = 0;

/** Valor de un campo de catálogo con su distintivo «No catalogado». */
function Val({ g, f }: { g: FleetForm; f: OtroField }) {
  const v = shown(g, f);
  return <>{v || '—'}{isOtro(g, f) && NO_CAT}</>;
}
const years = (g: FleetForm) => g.from || g.to ? `${g.from || g.to}–${g.to || g.from}` : '—';
const summary = (g: FleetForm) => <><Val g={g} f="brand" /> / <Val g={g} f="model" /></>;

export default function ParqueVehicularPage({ customerId, addressId, role, onBack }: { customerId: string; addressId: string; role: Role; onBack: () => void }) {
  const { groups, setGroups, loaded, storageAvailable, restored, reset } = useFleetStore();
  const [screen, setScreen] = useState<Screen>('list');
  const [form, setForm] = useState<FleetForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Errors>({});
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editingDraft, setEditingDraft] = useState('');
  const [results, setResults] = useState<SaveResult[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [reason, setReason] = useState('');
  const [editJustification, setEditJustification] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [justifyFor, setJustifyFor] = useState('');
  const [justifyText, setJustifyText] = useState('');
  const [peek, setPeek] = useState<Fleet | Draft | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [notes, setNotes] = useState(false);
  const [notice, setNotice] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  const customer = CUSTOMERS.find(c => c.id === customerId);
  const address = ADDRESSES.find(a => a.id === addressId && a.customerId === customerId && canAccessAddress(a.id, role, customerId));
  const mayRegister = !!address && canRegister(role, address);
  const mayEdit = !!address && canEdit(role, address);
  const addressGroups = sortGroups(groups.filter(g => g.addressId === addressId));
  const selected = addressGroups.find(g => g.id === selectedId);
  const conflicts = reviewConflicts(drafts, addressGroups);
  const unresolved = conflicts.filter(needsResolution).length;
  useSetBreadcrumb(['Clientes', 'Listado de clientes', 'Detalle', address?.label || 'Dirección', 'Parque vehicular',
    ...({ capture: ['Registrar'], review: ['Revisar y guardar'], result: ['Resultado'], detail: [selectedId], edit: [selectedId, 'Modificar'], list: [] } as Record<Screen, string[]>)[screen]]);
  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); headingRef.current?.scrollIntoView({ block: 'center' }); }, [screen]);
  useEffect(() => {
    if (!drafts.length && screen !== 'capture' && screen !== 'edit') return;
    const leave = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [drafts.length, screen]);

  if (!loaded) return <Box sx={{ p: 4 }}><CircularProgress aria-label="Cargando parque vehicular" /></Box>;
  if (!address || !customer) return <Alert severity="warning" sx={{ mt: 2 }}>Este grupo no existe o no está disponible para ti. <Button onClick={onBack}>Volver a Direcciones</Button></Alert>;

  const focusError = () => setTimeout(() => document.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus(), 0);
  function startCapture() { setForm({ ...EMPTY_FORM }); setErrors({}); setEditingDraft(''); setScreen('capture'); }
  /** Agrega (o actualiza) el grupo de la sesión. Devuelve false si hay errores. */
  function addToSession(): boolean {
    const e = validateFleet(form); setErrors(e);
    if (Object.keys(e).length) { focusError(); return false; }
    const clean = formOf({ ...form, ...(hasBody(form.type) ? {} : { body: '', bodyText: '', bodyModel: '', bodyModelText: '' }) });
    if (editingDraft) setDrafts(ds => ds.map(d => d.tempId === editingDraft ? { ...d, ...clean } : d));
    else setDrafts(ds => [...ds, { ...clean, tempId: `S${++tempSeq}`, justification: '' }]);
    setEditingDraft(''); setForm({ ...EMPTY_FORM }); setErrors({});
    return true;
  }
  function addAndContinue() { if (addToSession()) setNotice('Grupo agregado a la sesión. Captura el siguiente.'); }
  function addAndReview() {
    const formIsEmpty = JSON.stringify(form) === JSON.stringify(EMPTY_FORM);
    if (formIsEmpty && drafts.length && !editingDraft) { setScreen('review'); return; }
    if (addToSession()) setScreen('review');
  }
  function save() {
    const { results: r, groups: next } = saveDrafts(drafts, groups, address!.id, userOf(role));
    setGroups(next); setResults(r);
    setDrafts(r.filter(x => !x.ok).map(x => x.draft));
    setScreen('result');
  }
  function openEdit(g: Fleet) { setSelectedId(g.id); setForm(formOf(g)); setReason(''); setEditJustification(''); setReasonError(''); setErrors({}); setScreen('edit'); }
  function saveEdit() {
    const e = validateFleet(form); setErrors(e);
    const others = addressGroups.filter(g => g.id !== selected!.id && coincide(form, g));
    const missingReason = !reason.trim(); setReasonError(missingReason ? 'Escribe el motivo del cambio.' : '');
    if (Object.keys(e).length) { focusError(); return; }
    if (missingReason || (others.length && !editJustification.trim())) return;
    setGroups(groups.map(g => g.id === selected!.id ? { ...editGroup(g, form, reason, role), justification: others.length ? editJustification.trim() : g.justification } : g));
    setNotice('Grupo actualizado.'); setScreen('detail');
  }
  const cancelSession = () => { if (drafts.length || JSON.stringify(form) !== JSON.stringify(EMPTY_FORM)) setConfirmCancel(true); else setScreen('list'); };

  const context = <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#fafcff', borderColor: '#dce4ef' }}><Stack direction="row" spacing={1.5} alignItems="flex-start"><LocalShippingOutlined color="primary" /><Box sx={{ minWidth: 0 }}><Typography fontWeight={700}>{address.label}</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{address.street}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{customer.name} · Cuenta {customer.id}</Typography></Box></Stack></Paper>;
  const title = ({ list: 'Parque vehicular', capture: editingDraft ? 'Corregir grupo de la sesión' : 'Registrar parque vehicular', review: 'Revisar y guardar', result: 'Resultado del guardado', detail: `Grupo ${selectedId}`, edit: `Modificar grupo ${selectedId}` } as Record<Screen, string>)[screen];
  const back = () => ({ list: onBack, capture: cancelSession, review: () => setScreen('capture'), result: () => setScreen('list'), detail: () => setScreen('list'), edit: () => setScreen('detail') } as Record<Screen, () => void>)[screen]();
  const sessionList = drafts.length > 0 && <Paper variant="outlined" sx={{ p: 2, mb: 3, borderStyle: 'dashed' }}>
    <Typography fontWeight={700} sx={{ mb: 1 }}>Sesión de captura · {drafts.length} grupo(s) sin guardar</Typography>
    <Stack spacing={.75}>{drafts.map(d => <Stack key={d.tempId} direction="row" spacing={1} alignItems="center" flexWrap="wrap"><Chip size="small" label="Sin guardar" /><Typography variant="body2">{d.type} · {summary(d)} · {years(d)} · {d.units} u.</Typography></Stack>)}</Stack>
  </Paper>;

  return <Box sx={{ pt: 2, pb: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">Prototipo de revisión · Datos de ejemplo · {ROLES.find(r => r.id === role)!.label}: {userOf(role)}</Typography>
      <Button size="small" startIcon={<InfoOutlined />} onClick={() => setNotes(true)}>Notas para revisión</Button>
    </Stack>
    {!storageAvailable && <Alert severity="info" sx={{ mb: 2 }}>Los cambios se conservarán mientras esta pantalla siga abierta. El navegador no permite guardarlos para otra sesión.</Alert>}
    {restored && <Alert severity="info" sx={{ mb: 2 }}>Se cargaron los ejemplos nuevos porque los datos guardados eran de una versión anterior del prototipo.</Alert>}
    <Button startIcon={<ArrowBack />} onClick={back} sx={{ mb: 1 }}>{screen === 'list' ? 'Volver a Direcciones' : screen === 'review' ? 'Volver a la captura' : screen === 'edit' ? 'Volver al grupo' : 'Volver al parque vehicular'}</Button>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
      <Typography component="h1" variant="h5" fontWeight={700} tabIndex={-1} ref={headingRef} sx={{ outline: 'none' }}>{title}</Typography>
      {screen === 'list' && mayRegister && <Button variant="contained" startIcon={<Add />} onClick={startCapture}>Registrar parque vehicular</Button>}
      {screen === 'detail' && selected && mayEdit && <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => openEdit(selected)}>Modificar</Button>}
    </Stack>
    {context}

    {screen === 'list' && <>
      {drafts.length > 0 && <Alert severity="warning" sx={{ mb: 2 }} action={<Stack direction="row" spacing={1}><Button color="inherit" size="small" onClick={() => setScreen('capture')}>Continuar captura</Button><Button color="inherit" size="small" onClick={() => setScreen('review')}>Revisar y guardar</Button></Stack>}>Tienes {drafts.length} grupo(s) sin guardar en esta sesión.</Alert>}
      {sessionList}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}><Chip variant="outlined" label={`Grupos registrados: ${addressGroups.length}`} /><Chip variant="outlined" label={`Total de unidades: ${addressGroups.reduce((n, g) => n + Number(g.units), 0)}`} /></Stack>
      {!addressGroups.length ? <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}><LocalShippingOutlined sx={{ fontSize: 44, color: 'primary.main' }} /><Typography variant="h6" sx={{ mt: 1 }}>Esta dirección aún no tiene parque vehicular registrado.</Typography>{mayRegister && <Button variant="contained" startIcon={<Add />} onClick={startCapture} sx={{ mt: 2 }}>Registrar parque vehicular</Button>}</Paper> : <>
        <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: 'none', md: 'block' } }}><Table><TableHead><TableRow>{['Folio', 'Tipo', 'Marca / Modelo', 'Años', 'Unidades', 'Último levantamiento', ''].map(h => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead><TableBody>{addressGroups.map(g => <TableRow key={g.id} hover><TableCell><Button onClick={() => { setSelectedId(g.id); setScreen('detail'); }}>{g.id}</Button></TableCell><TableCell>{g.type}</TableCell><TableCell>{summary(g)}</TableCell><TableCell>{years(g)}</TableCell><TableCell>{g.units}</TableCell><TableCell>{fmtDate(g.lastSurvey)}</TableCell><TableCell><Button startIcon={<VisibilityOutlined />} onClick={() => { setSelectedId(g.id); setScreen('detail'); }}>Ver detalle</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>
        <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' } }}>{addressGroups.map(g => <Card key={g.id} variant="outlined"><CardContent><Typography fontWeight={700}>{summary(g)}</Typography><Typography variant="body2">{g.type}</Typography><Typography sx={{ my: 1 }}>{years(g)} · {g.units} unidades · Último levantamiento: {fmtDate(g.lastSurvey)}</Typography><Button onClick={() => { setSelectedId(g.id); setScreen('detail'); }}>Ver detalle · {g.id}</Button></CardContent></Card>)}</Stack>
      </>}
      {!mayRegister && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Solo el asesor que tiene asignada esta Dirección registra parque vehicular.</Typography>}
    </>}

    {screen === 'capture' && <Box component="form" noValidate onSubmit={e => { e.preventDefault(); addAndReview(); }}>
      {sessionList}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}><FleetFields form={form} errors={errors} onChange={setForm} /><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* Campos obligatorios. Nada se guarda hasta elegir «Guardar» en la revisión.</Typography></Paper>
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, pb: 2 }}>
        <Button variant="outlined" onClick={cancelSession}>Cancelar</Button>
        {!editingDraft && <Button variant="outlined" onClick={addAndContinue}>Agregar otro</Button>}
        <Button type="submit" variant="contained">{editingDraft ? 'Actualizar y volver a revisar' : 'Revisar y guardar'}</Button>
      </Stack>
    </Box>}

    {screen === 'review' && <>
      {!drafts.length ? <Alert severity="info" sx={{ mb: 2 }}>No hay grupos en la sesión. Agrega uno o cancela.</Alert> :
        <Stack spacing={2}>{conflicts.map(c => { const d = c.draft; const pending = needsResolution(c); const related = [...c.saved, ...c.session];
          return <Paper key={d.tempId} variant="outlined" sx={{ p: 2, borderColor: pending ? 'warning.main' : undefined }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
              <Box><Typography fontWeight={700}>{summary(d)}</Typography><Typography variant="body2">{d.type}{hasBody(d.type) && d.body ? <> · Carrocería <Val g={d} f="body" /> {d.bodyModel && <Val g={d} f="bodyModel" />}</> : null}{d.motor ? <> · Motor <Val g={d} f="motor" /></> : null}</Typography><Typography variant="body2">{years(d)} · {d.units} unidades</Typography></Box>
              <Stack direction="row" spacing={1} alignItems="flex-start"><Button size="small" onClick={() => { setForm(formOf(d)); setEditingDraft(d.tempId); setErrors({}); setScreen('capture'); }}>Editar</Button><Button size="small" color="error" onClick={() => setDrafts(ds => ds.filter(x => x.tempId !== d.tempId))}>Quitar</Button></Stack>
            </Stack>
            {related.length > 0 && <Alert severity={pending ? 'warning' : 'success'} sx={{ mt: 1.5 }} action={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button color="inherit" size="small" onClick={() => setPeek(related[0])}>Ver {('id' in related[0]) ? `grupo ${related[0].id}` : 'el de la sesión'}</Button>
              <Button color="inherit" size="small" onClick={() => { setJustifyFor(d.tempId); setJustifyText(d.justification); }}>{d.justification ? 'Cambiar justificación' : 'Justificar'}</Button>
              <Button color="inherit" size="small" onClick={() => setDrafts(ds => ds.filter(x => x.tempId !== d.tempId))}>Quitar de la sesión</Button>
            </Stack>}>{pending ? COINCIDENCE : <>Justificación: {d.justification}</>}</Alert>}
          </Paper>; })}</Stack>}
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mt: 3, pb: 2 }}>
        {unresolved > 0 && <Typography variant="body2" color="warning.main" sx={{ mr: 'auto' }}>Resuelve {unresolved} coincidencia(s) para habilitar «Guardar».</Typography>}
        <Button variant="outlined" onClick={cancelSession}>Cancelar</Button>
        <Button variant="outlined" onClick={() => { setForm({ ...EMPTY_FORM }); setEditingDraft(''); setScreen('capture'); }}>Agregar otro</Button>
        <Button variant="contained" disabled={!drafts.length || unresolved > 0} onClick={save}>Guardar {drafts.length} grupo(s)</Button>
      </Stack>
    </>}

    {screen === 'result' && <>
      {results.every(r => r.ok) ? <Alert severity="success" sx={{ mb: 2 }}>El parque vehicular quedó actualizado.</Alert> : <Alert severity="warning" sx={{ mb: 2 }}>No pudimos guardar todos los grupos. Corrige los que no se guardaron; siguen en tu sesión.</Alert>}
      <Stack spacing={1}>{results.map(r => <Paper key={r.draft.tempId} variant="outlined" sx={{ p: 1.5 }}><Stack direction="row" spacing={1} alignItems="center">{r.ok ? <CheckCircle color="success" /> : <ErrorOutline color="warning" />}<Typography>{summary(r.draft)} · {r.draft.units} u. — {r.ok ? <strong>Guardado · folio {r.group.id}</strong> : <strong>No guardado: {r.reason}</strong>}</Typography></Stack></Paper>)}</Stack>
      <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3 }}>{drafts.length > 0 && <Button variant="outlined" onClick={() => setScreen('review')}>Corregir los no guardados</Button>}<Button variant="contained" onClick={() => setScreen('list')}>Ver parque vehicular</Button></Stack>
    </>}

    {screen === 'detail' && selected && <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
        {([['Folio', selected.id], ['Razón social', customer.name], ['Dirección', address.label], ['Tipo', selected.type]] as const).map(([l, v]) => <Box key={l}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography fontWeight={600}>{v}</Typography></Box>)}
        {(['brand', 'model', ...(hasBody(selected.type) ? ['body', 'bodyModel'] : []), 'motor'] as OtroField[]).map(f => <Box key={f}><Typography variant="body2" color="text.secondary">{FIELD_LABEL[f]}</Typography><Typography fontWeight={600}>{shown(selected, f) ? <Val g={selected} f={f} /> : 'Sin registrar'}</Typography></Box>)}
        {([['Años', years(selected)], ['Unidades', selected.units], ['Último levantamiento', fmtDate(selected.lastSurvey)], ['Creado por', `${selected.createdBy} · ${fmtDateTime(selected.createdAt)}`]] as const).map(([l, v]) => <Box key={l}><Typography variant="body2" color="text.secondary">{l}</Typography><Typography fontWeight={600}>{v}</Typography></Box>)}
        {selected.editReason && <Box><Typography variant="body2" color="text.secondary">Última modificación</Typography><Typography fontWeight={600}>{fmtDateTime(selected.updatedAt)} · {selected.editReason}</Typography></Box>}
      </Box>
      {selected.justification && <Alert severity="info" sx={{ mt: 3 }}>Justificación de coincidencia: {selected.justification}</Alert>}
      {selected.originals.map((o, i) => <Alert key={i} severity="info" variant="outlined" sx={{ mt: 1.5 }}>{FIELD_LABEL[o.field]} · Valor original: {o.value} · reasignado por {o.by} el {fmtDate(o.at)}</Alert>)}
    </Paper>}

    {screen === 'edit' && selected && <Box component="form" noValidate onSubmit={e => { e.preventDefault(); saveEdit(); }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <FleetFields form={form} errors={errors} onChange={setForm} />
        {(() => { const others = addressGroups.filter(g => g.id !== selected.id && coincide(form, g)); return others.length > 0 && <Alert severity="warning" sx={{ mt: 2 }}>{COINCIDENCE} Coincide con el grupo {others.map(g => g.id).join(', ')}.<TextField fullWidth size="small" label="Justificación" required value={editJustification} onChange={e => setEditJustification(e.target.value)} sx={{ mt: 1.5, bgcolor: 'background.paper' }} /></Alert>; })()}
        <TextField fullWidth size="small" label="Motivo del cambio" required value={reason} onChange={e => setReason(e.target.value)} error={!!reasonError} helperText={reasonError || 'Obligatorio en toda modificación.'} sx={{ mt: 3 }} />
      </Paper>
      <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, pb: 2 }}><Button variant="outlined" onClick={() => setScreen('detail')}>Cancelar</Button><Button type="submit" variant="contained">Guardar cambios</Button></Stack>
    </Box>}

    <Dialog open={!!justifyFor} onClose={() => setJustifyFor('')} fullWidth maxWidth="sm"><DialogTitle>Justificar el grupo</DialogTitle><DialogContent><Typography variant="body2" sx={{ mb: 2 }}>Explica por qué este grupo es distinto del que ya existe. La justificación se verá en el detalle del grupo.</Typography><TextField autoFocus fullWidth multiline minRows={2} label="Justificación" value={justifyText} onChange={e => setJustifyText(e.target.value)} /></DialogContent><DialogActions><Button onClick={() => setJustifyFor('')}>Cancelar</Button><Button variant="contained" disabled={!justifyText.trim()} onClick={() => { setDrafts(ds => ds.map(d => d.tempId === justifyFor ? { ...d, justification: justifyText.trim() } : d)); setJustifyFor(''); }}>Guardar justificación</Button></DialogActions></Dialog>
    <Dialog open={!!peek} onClose={() => setPeek(null)} fullWidth maxWidth="xs"><DialogTitle>{peek && 'id' in peek ? `Grupo ${peek.id}` : 'Grupo de la sesión'}</DialogTitle><DialogContent>{peek && <Stack spacing={.5}><Typography>{peek.type}</Typography><Typography>{summary(peek)}</Typography>{peek.motor && <Typography>Motor: <Val g={peek} f="motor" /></Typography>}<Typography>Años: {years(peek)} · {peek.units} unidades</Typography></Stack>}</DialogContent><DialogActions><Button variant="contained" onClick={() => setPeek(null)}>Cerrar</Button></DialogActions></Dialog>
    <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}><DialogTitle>¿Cancelar la captura?</DialogTitle><DialogContent>Los grupos que aún no guardas se descartarán.</DialogContent><DialogActions><Button onClick={() => setConfirmCancel(false)}>Seguir capturando</Button><Button variant="contained" onClick={() => { setDrafts([]); setForm({ ...EMPTY_FORM }); setEditingDraft(''); setConfirmCancel(false); setScreen('list'); }}>Descartar</Button></DialogActions></Dialog>
    <Dialog open={notes} onClose={() => setNotes(false)} fullWidth maxWidth="md"><DialogTitle>Notas para revisión · Parque vehicular</DialogTitle><DialogContent>
      <Alert severity="info" sx={{ mb: 2 }}>Prototipo navegable con datos de ejemplo. Los cambios quedan solo en este navegador. Reglas tomadas de la spec SDD aprobada por el BA (SPEC-F2-005, cambio «alta y consulta») el 12-nov-2026.</Alert>
      <Typography fontWeight={700}>Qué muestra esta versión</Typography>
      <Box component="ul" sx={{ pl: 3, mt: .5, '& li': { mb: .75 } }}>
        <li>Catálogo de Salesforce (matriz del 10-nov-2026): 27 tipos, marcas por tipo, 110 motores. Modelos solo de VOLVO y MARCOPOLO; para el resto se usa «Otro». La separación de modelos VOLVO entre autobús y servicio pesado es una muestra de la regla tipo + marca.</li>
        <li>Dos ramas: Tipo → Marca → Modelo, y en autobuses Tipo → Carrocería → Modelo de carrocería. El motor no se filtra. Cambiar la marca no borra la carrocería.</li>
        <li>«Otro (no está en la lista)» con texto obligatorio (máx. 60) en marca, modelo, carrocería, modelo de carrocería y motor. Se marca «No catalogado».</li>
        <li>Obligatorios: tipo, marca, modelo y unidades. Años de cuatro dígitos, no futuros.</li>
        <li>Sesión de captura: los grupos quedan «Sin guardar» hasta «Revisar y guardar». Una coincidencia (misma configuración con años que se cruzan, o con años, motor o carrocería vacíos) bloquea «Guardar» hasta justificarla o quitar el grupo.</li>
        <li>Roles («Ver el prototipo como»): el asesor registra y modifica en sus Direcciones; gerente, KAM y soporte solo consultan; el administrador funcional modifica, ve todas las Direcciones y el reporte de valores «Otro», donde los reasigna al catálogo.</li>
        <li>«Modificar» pide motivo. Solo una modificación del asesor renueva el último levantamiento.</li>
      </Box>
      <Typography fontWeight={700} sx={{ mt: 1 }}>Segunda entrega (no está en esta versión)</Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>Mover de Dirección, desactivar, reactivar, eliminar, vigencia de 12 meses («Desactualizado»), historial y migración desde Salesforce.</Typography>
      <Typography fontWeight={700}>Abierto para comentar</Typography>
      <Typography variant="body2">Longitud máxima de la justificación y de grupos por visita; año inicial sin año final; búsqueda en listas largas (motores) y orden de los 27 tipos; catálogo real de Empresas y Merca.</Typography>
    </DialogContent><DialogActions><Button onClick={() => { reset(); setDrafts([]); setScreen('list'); setNotes(false); setNotice('Se restauraron los datos de ejemplo.'); }}>Restaurar ejemplos</Button><Button onClick={() => setNotes(false)} variant="contained">Entendido</Button></DialogActions></Dialog>
    <Snackbar open={!!notice} autoHideDuration={5000} onClose={() => setNotice('')} message={notice} action={<Button color="inherit" size="small" onClick={() => setNotice('')}>Cerrar</Button>} />
  </Box>;
}
