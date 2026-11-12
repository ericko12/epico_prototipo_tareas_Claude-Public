'use client';

import { useState } from 'react';
import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material';
import { FIELD_LABEL, OTRO, OTRO_LABEL, OTRO_MAX, TYPES, applyChange, hasBody, optionsFor, textKey, wouldLose } from '../../domain/fleet';
import type { Errors, FleetForm, OtroField } from '../../domain/fleet';

const NO_OPTIONS = 'No hay opciones disponibles para esta combinación. Solicita la revisión del catálogo.';
const NONE = '__NONE__';

/** Campos de captura de un grupo con las dos ramas de catálogo, «Otro» con texto y confirmación al limpiar dependientes. */
export default function FleetFields({ form, errors, onChange }: { form: FleetForm; errors: Errors; onChange: (next: FleetForm) => void }) {
  const [pending, setPending] = useState<{ field: keyof FleetForm; value: string } | null>(null);
  const bus = hasBody(form.type);
  const change = (field: keyof FleetForm, value: string) => {
    if (wouldLose(form, field) && value !== form[field]) setPending({ field, value });
    else onChange(applyChange(form, field, value));
  };

  const select = (field: OtroField, required: boolean, hint?: string) => {
    const options = optionsFor(form, field);
    const disabled = options === undefined;
    const forcedOtro = (field === 'model' && form.brand === OTRO) || (field === 'bodyModel' && form.body === OTRO);
    const empty = !disabled && !forcedOtro && options.length === 0;
    const helper = errors[field] || (forcedOtro ? 'Se escribe a mano porque la opción anterior es «Otro».' : empty ? NO_OPTIONS : disabled ? hint : undefined);
    // Marca, Modelo y Motor se filtran al escribir; «Otro» siempre visible (clar. 46).
    const searchable = field === 'brand' || field === 'model' || field === 'motor';
    return <Box key={field} sx={{ display: 'grid', gap: 1.5, alignContent: 'start' }}>
      {searchable ? <Autocomplete<string>
        id={`fleet-${field}`} size="small" fullWidth disabled={disabled || forcedOtro}
        options={[...(options || []), OTRO]} value={form[field] || null}
        onChange={(_, v) => change(field, v && v !== NONE ? v : '')}
        getOptionLabel={o => o === OTRO ? OTRO_LABEL : o}
        getOptionDisabled={o => o === NONE}
        filterOptions={(opts, { inputValue }) => {
          const q = inputValue.trim().toLocaleLowerCase('es');
          const hits = opts.filter(o => o !== OTRO && o.toLocaleLowerCase('es').includes(q));
          return q && !hits.length ? [NONE, OTRO] : [...hits, OTRO];
        }}
        renderOption={(props, o, state) => { const { key, ...rest } = props as typeof props & { key: string };
          return <li key={key} {...rest}>{o === NONE ? `No hay opciones con «${state.inputValue.trim()}»` : o === OTRO ? <em>{OTRO_LABEL}</em> : o}</li>; }}
        ListboxProps={{ style: { maxHeight: 320 } }}
        renderInput={params => <TextField {...params} label={FIELD_LABEL[field]} required={required} placeholder="Escribe para buscar" error={!!errors[field]} helperText={helper} />}
      /> : <TextField select fullWidth size="small" id={`fleet-${field}`} label={FIELD_LABEL[field]} required={required}
        value={form[field]} disabled={disabled || forcedOtro} onChange={e => change(field, e.target.value)}
        error={!!errors[field]} helperText={helper}
        SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 360 } } } }}>
        <MenuItem value="">Seleccionar</MenuItem>
        {(options || []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        <MenuItem value={OTRO}>{OTRO_LABEL}</MenuItem>
      </TextField>}
      {form[field] === OTRO && <TextField fullWidth size="small" id={`fleet-${field}Text`} label={`${FIELD_LABEL[field]} (escrito)`} required
        value={form[textKey(field)]} onChange={e => onChange({ ...form, [textKey(field)]: e.target.value.slice(0, OTRO_MAX) })}
        inputProps={{ maxLength: OTRO_MAX }} error={!!errors[textKey(field)]}
        helperText={errors[textKey(field)] || `Escribe el valor que falta. Lo revisaremos para agregarlo al catálogo. ${form[textKey(field)].length}/${OTRO_MAX}`} />}
    </Box>;
  };
  const text = (field: 'from' | 'to' | 'units', required = false) => <TextField key={field} fullWidth size="small" id={`fleet-${field}`} label={FIELD_LABEL[field]} required={required}
    value={form[field]} onChange={e => onChange({ ...form, [field]: e.target.value })} error={!!errors[field]} helperText={errors[field]}
    inputProps={{ inputMode: 'numeric', maxLength: field === 'units' ? 6 : 4 }} />;

  return <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
      <TextField select fullWidth size="small" id="fleet-type" label={FIELD_LABEL.type} required value={form.type} onChange={e => change('type', e.target.value)}
        error={!!errors.type} helperText={errors.type} SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 360 } } } }}>
        <MenuItem value="">Seleccionar</MenuItem>
        {TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>
      {select('brand', true, 'Selecciona primero el tipo para consultar las marcas disponibles.')}
      {select('model', true, 'Selecciona primero la marca.')}
      {select('motor', false)}
      {select('body', false, 'Solo para autobuses.')}
      {select('bodyModel', false, bus ? 'Selecciona primero la carrocería.' : 'Solo para autobuses.')}
      {text('from')}{text('to')}{text('units', true)}
    </Box>
    {bus && <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>En autobuses se capturan dos fabricantes: Marca y Modelo describen el chasis (por ejemplo VOLVO B11R); Carrocería y Modelo de carrocería, la carrocería montada encima (por ejemplo MARCOPOLO PARADISO G8 1200).</Alert>}
    <Dialog open={!!pending} onClose={() => setPending(null)}>
      <DialogTitle>¿Cambiar la selección?</DialogTitle>
      <DialogContent>{pending?.field === 'type' ? 'Se quitarán marca, modelo, carrocería y modelo de carrocería.' : pending?.field === 'brand' ? 'Se quitará el modelo. La carrocería y el motor se conservan.' : 'Se quitará el modelo de carrocería.'} Los años y las unidades se conservan.</DialogContent>
      <DialogActions>
        <Button onClick={() => setPending(null)}>Conservar</Button>
        <Button variant="contained" onClick={() => { if (pending) onChange(applyChange(form, pending.field, pending.value)); setPending(null); }}>Cambiar</Button>
      </DialogActions>
    </Dialog>
  </>;
}
