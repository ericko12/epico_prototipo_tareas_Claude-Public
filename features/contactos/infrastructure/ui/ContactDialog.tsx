'use client';

import { useState } from 'react';
import { Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, FormHelperText, IconButton, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AddOutlined, DeleteOutline } from '@mui/icons-material';
import { AREAS, DECIDES_LABEL, MSG, hasErrors, missing, validate } from '../../domain/contactos';
import type { Contact, FormErrors, Phone } from '../../domain/contactos';

type Form = Pick<Contact, 'name' | 'area' | 'decides' | 'rows'>;
const EMPTY: Form = { name: '', area: '', decides: false, rows: [{ number: '', ext: '', email: '' }] };
const label = { fontSize: 13, fontWeight: 500, mb: .75, display: 'flex', alignItems: 'center', gap: .5 } as const;
const Req = () => <Box component="span" sx={{ color: 'error.main' }}>*</Box>;

/**
 * Captura y edición del contacto. Parte del formulario vigente de Épico (CLIENTE fijo, NOMBRE,
 * filas TELÉFONO / EXT. / CORREO con «+», Cerrar y Guardar) y suma solo lo decidido:
 * la Dirección como contexto, el área de contacto y «Decide la compra».
 */
export default function ContactDialog({ open, customerName, addressLabel, contact, onClose, onSave }: {
  open: boolean; customerName: string; addressLabel?: string; contact?: Contact;
  onClose: () => void; onSave: (form: Form) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState<Form>(contact ? { name: contact.name, area: contact.area, decides: contact.decides, rows: contact.rows.map(r => ({ ...r })) } : EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [confirmClose, setConfirmClose] = useState(false);
  const initial = JSON.stringify(contact ? { name: contact.name, area: contact.area, decides: contact.decides, rows: contact.rows } : EMPTY);
  // Como en Épico: cerrar con cambios pide confirmación («Cerrar creación / edición»).
  const requestClose = () => JSON.stringify(form) === initial ? onClose() : setConfirmClose(true);
  const legacy = contact ? missing(contact) : [];
  const setRow = (i: number, patch: Partial<Phone>) => {
    setForm(f => ({ ...f, rows: f.rows.map((r, j) => j === i ? { ...r, ...patch } : r) }));
    // Al corregir un campo de la fila se quita su error, igual que con NOMBRE y ÁREA.
    setErrors(x => x.rows ? { ...x, rows: x.rows.map((r, j) => j === i ? Object.fromEntries(Object.entries(r).filter(([k]) => !(k in patch))) : r) } : x);
  };
  const rowError = (i: number) => errors.rows?.[i] ?? {};
  const save = () => {
    const e = validate(form);
    setErrors(e);
    if (hasErrors(e)) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-contact-dialog] [aria-invalid="true"]')?.focus());
      return;
    }
    onSave(form);
  };

  return <><Dialog open={open} onClose={(_, reason) => { if (reason !== 'backdropClick') requestClose(); }} fullScreen={fullScreen} maxWidth="md" fullWidth PaperProps={{ 'data-contact-dialog': true } as object} aria-labelledby="contact-dialog-title">
    <DialogTitle id="contact-dialog-title" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>{contact ? 'Editar contacto' : 'Nuevo contacto'}</DialogTitle>
    <DialogContent dividers>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1.5, sm: 4 }} sx={{ mb: 2 }}>
        <Box sx={{ minWidth: 0 }}><Typography variant="body2" color="text.secondary" fontWeight={600}>CLIENTE</Typography><Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{customerName}</Typography></Box>
        {addressLabel && <Box sx={{ minWidth: 0 }}><Typography variant="body2" color="text.secondary" fontWeight={600}>DIRECCIÓN</Typography><Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{addressLabel}</Typography><Typography variant="caption" color="text.secondary">Este contacto quedará asociado a esta dirección y seguirá disponible para el cliente.</Typography></Box>}
      </Stack>
      {!addressLabel && !contact && <Alert severity="info" sx={{ mb: 2 }}>Desde el cliente, el contacto queda «Sin dirección asociada». Asócialo después desde la dirección que corresponda.</Alert>}
      {legacy.length > 0 && <Alert severity="warning" sx={{ mb: 2 }}>Este contacto se registró antes de esta versión y le falta: {legacy.join(' y ')}. Complétalo para guardar los cambios.</Alert>}

      <Box sx={{ p: { xs: 1.5, sm: 2 }, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#fbfcfe' }}>
        <Typography component="label" htmlFor="contact-name" sx={label}><Req />NOMBRE</Typography>
        <TextField id="contact-name" size="small" fullWidth value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(x => ({ ...x, name: undefined })); }} error={!!errors.name} helperText={errors.name} inputProps={{ maxLength: 100 }} />

        <Stack spacing={2} sx={{ mt: 2 }}>
          {form.rows.map((r, i) => {
            const re = rowError(i);
            const extEnabled = r.number.replace(/\D/g, '').length === 10;
            return <Box key={i} role="group" aria-label={`Teléfono y correo ${i + 1} de ${form.rows.length}`} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 96px', md: 'minmax(0,4fr) minmax(0,2fr) minmax(0,7fr) 44px' }, gap: 1.5, alignItems: 'start', pt: i ? 2 : 0, borderTop: i ? '1px dashed #d6deea' : 0 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography component="label" htmlFor={`phone-${i}`} sx={label}>{i === 0 && <Req />}TELÉFONO</Typography>
                <TextField id={`phone-${i}`} size="small" fullWidth value={r.number} inputMode="tel" onChange={e => setRow(i, { number: e.target.value.replace(/[^\d]/g, '').slice(0, 10), ...(e.target.value.replace(/\D/g, '').length < 10 ? { ext: '' } : {}) })} error={!!re.number} helperText={re.number} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography component="label" htmlFor={`ext-${i}`} sx={label}>EXT.</Typography>
                <TextField id={`ext-${i}`} size="small" fullWidth value={r.ext} disabled={!extEnabled} onChange={e => setRow(i, { ext: e.target.value.replace(/\D/g, '').slice(0, 5) })} error={!!re.ext} helperText={re.ext} />
              </Box>
              <Box sx={{ minWidth: 0, gridColumn: { xs: '1 / -1', md: 'auto' } }}>
                <Typography component="label" htmlFor={`email-${i}`} sx={label}>{i === 0 && <Req />}CORREO</Typography>
                <TextField id={`email-${i}`} size="small" fullWidth type="email" value={r.email} onChange={e => setRow(i, { email: e.target.value })} error={!!re.email} helperText={re.email} />
              </Box>
              {i > 0 ? <IconButton aria-label={`Quitar teléfono y correo ${i + 1}`} onClick={() => setForm(f => ({ ...f, rows: f.rows.filter((_, j) => j !== i) }))} sx={{ mt: { md: 3.25 }, width: 44, height: 44, gridColumn: { xs: '1 / -1', md: 'auto' }, justifySelf: { xs: 'end', md: 'auto' } }}><DeleteOutline /></IconButton> : <Box sx={{ display: { xs: 'none', md: 'block' } }} />}
            </Box>;
          })}
        </Stack>
        <Button variant="contained" startIcon={<AddOutlined />} sx={{ mt: 2, minHeight: 44 }} onClick={() => { setForm(f => ({ ...f, rows: [...f.rows, { number: '', ext: '', email: '' }] })); requestAnimationFrame(() => document.getElementById(`phone-${form.rows.length}`)?.focus()); }}>Agregar teléfono o correo</Button>
        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: .5 }}>La extensión se habilita cuando el teléfono tiene 10 dígitos, como hoy.</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,1fr) minmax(0,1fr)' }, gap: 2, mt: 3, alignItems: 'start' }}>
          <Box>
            <Typography component="label" htmlFor="contact-area" sx={label}><Req />ÁREA DE CONTACTO</Typography>
            <TextField id="contact-area" select size="small" fullWidth value={form.area} onChange={e => { setForm(f => ({ ...f, area: e.target.value })); setErrors(x => ({ ...x, area: undefined })); }} error={!!errors.area} SelectProps={{ displayEmpty: true }}>
              <MenuItem value="" disabled>Selecciona una opción</MenuItem>
              {AREAS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </TextField>
            <FormHelperText error={!!errors.area}>{errors.area ?? 'Sirve para que otras áreas, como Crédito, sepan a quién dirigirse. Si falta una opción, solicítala a Datos Maestros.'}</FormHelperText>
          </Box>
          <Box sx={{ pt: { md: 3 } }}>
            <FormControlLabel control={<Checkbox checked={form.decides} onChange={e => setForm(f => ({ ...f, decides: e.target.checked }))} />} label={DECIDES_LABEL} />
            <FormHelperText sx={{ mt: 0 }}>Márcalo solo si esta persona decide qué se compra. No se deduce del área.</FormHelperText>
          </Box>
        </Box>
      </Box>
      {hasErrors(errors) && <Alert severity="error" sx={{ mt: 2 }}>{MSG.saveError}</Alert>}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
      <Button variant="outlined" onClick={requestClose} sx={{ minHeight: 44, minWidth: 110 }}>Cerrar</Button>
      <Button variant="contained" onClick={save} sx={{ minHeight: 44, minWidth: 110 }}>Guardar</Button>
    </DialogActions>
  </Dialog>
  <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} maxWidth="xs" fullWidth aria-labelledby="confirm-close-title">
    <DialogTitle id="confirm-close-title" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>{contact ? 'Cerrar edición' : 'Cerrar creación'}</DialogTitle>
    <DialogContent><Typography>Si cierras ahora, se pierde lo que capturaste.</Typography></DialogContent>
    <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
      <Button variant="outlined" onClick={() => setConfirmClose(false)} sx={{ minHeight: 44 }}>Seguir capturando</Button>
      <Button variant="contained" onClick={() => { setConfirmClose(false); onClose(); }} sx={{ minHeight: 44 }}>Cerrar sin guardar</Button>
    </DialogActions>
  </Dialog></>;
}
