'use client';

import { useState } from 'react';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { FIELD_LABEL, monthStats, otroReport, reassign, reassignOptions, userOf } from '../../domain/fleet';
import type { OtroRow } from '../../domain/fleet';
import { useFleetStore } from './fleetStore';

/** Reporte de valores capturados con «Otro» y reasignación al catálogo. Solo administrador funcional (clar. 31, 44, 45). */
export default function OtroReport({ onBack }: { onBack: () => void }) {
  const { groups, setGroups, loaded } = useFleetStore();
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  if (!loaded) return <Box sx={{ p: 4 }}><CircularProgress aria-label="Cargando reporte" /></Box>;
  const rows = otroReport(groups);
  const stats = monthStats(groups);
  const rowKey = (r: OtroRow) => `${r.field}|${r.type}|${r.text}`;
  const apply = (r: OtroRow) => {
    const value = choice[rowKey(r)];
    if (!value) return;
    setGroups(reassign(groups, r, value, userOf('admin')));
    setNotice(`${r.count} grupo(s) reasignados a ${value}.`);
  };
  return <Box sx={{ pt: 2, pb: 3 }}>
    <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 1 }}>Volver a Direcciones</Button>
    <Typography component="h1" variant="h5" fontWeight={700} sx={{ mb: 1 }}>Valores capturados con «Otro»</Typography>
    <Typography color="text.secondary" sx={{ mb: 2 }}>Valores que los asesores escribieron porque no estaban en el catálogo. Se agrupan sin distinguir mayúsculas ni espacios. Al agregar el valor al catálogo, reasigna los grupos aquí; su detalle conservará el valor original.</Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      <Chip variant="outlined" label={`Grupos registrados este mes: ${stats.total}`} />
      <Chip variant="outlined" color={stats.percent < 10 ? 'success' : 'warning'} label={`Con algún «Otro»: ${stats.withOtro} (${stats.percent} %) · meta < 10 %`} />
    </Stack>
    {!rows.length ? <Alert severity="success">No hay valores fuera del catálogo.</Alert> :
      <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow>
        {['Campo', 'Tipo', 'Valor escrito', 'Grupos', 'Asignar a una opción del catálogo'].map(h => <TableCell key={h}>{h}</TableCell>)}
      </TableRow></TableHead><TableBody>{rows.map(r => {
        const options = reassignOptions(r);
        return <TableRow key={rowKey(r)}>
          <TableCell>{FIELD_LABEL[r.field]}</TableCell>
          <TableCell sx={{ minWidth: 180 }}>{r.type}</TableCell>
          <TableCell><strong>{r.text}</strong></TableCell>
          <TableCell>{r.count} <Typography component="span" variant="caption" color="text.secondary">({r.ids.join(', ')})</Typography></TableCell>
          <TableCell sx={{ minWidth: 300 }}>{options.length ? <Stack direction="row" spacing={1}>
            <TextField select size="small" fullWidth label="Opción" value={choice[rowKey(r)] || ''} onChange={e => setChoice({ ...choice, [rowKey(r)]: e.target.value })}>
              {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
            </TextField>
            <Button variant="contained" disabled={!choice[rowKey(r)]} onClick={() => apply(r)}>Asignar</Button>
          </Stack> : <Typography variant="body2" color="text.secondary">El catálogo aún no tiene opciones para este campo y tipo.</Typography>}</TableCell>
        </TableRow>;
      })}</TableBody></Table></TableContainer>}
    <Snackbar open={!!notice} autoHideDuration={5000} onClose={() => setNotice('')} message={notice} />
  </Box>;
}
