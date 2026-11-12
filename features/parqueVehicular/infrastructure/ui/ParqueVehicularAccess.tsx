'use client';

import { useState } from 'react';
import { Alert, Box, Button, InputAdornment, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { Assessment, LocalShippingOutlined, QrCode2, Search } from '@mui/icons-material';
import { useSetBreadcrumb } from '@/features/layoutMain/infrastructure/ui/BreadcrumbContext';
import { ROLES, canSeeReport, universe } from '../../domain/fleet';
import type { Role } from '../../domain/fleet';
import ParqueVehicularPage from './ParqueVehicularPage';
import OtroReport from './OtroReport';

/** Entrada desde la pestaña de información general del cliente: Direcciones → Parque vehicular. */
export default function ParqueVehicularAccess({ clientId, onCreateTask }: { clientId: string; onCreateTask: () => void }) {
  const [addressId, setAddressId] = useState('');
  const [report, setReport] = useState(false);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<Role>('asesor');
  const addresses = universe(role, clientId);
  const current = addresses.find(a => a.id === addressId);
  useSetBreadcrumb(['Clientes', 'Listado de clientes', 'Detalle', ...(current ? [current.label, 'Parque vehicular'] : report ? ['Valores «Otro»'] : [])]);
  if (current) return <ParqueVehicularPage key={current.id + role} customerId={clientId} addressId={current.id} role={role} onBack={() => setAddressId('')} />;
  if (report) return <OtroReport onBack={() => setReport(false)} />;
  const filtered = addresses.filter(a => `${a.label} ${a.street}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  return <Box sx={{ mt: 3 }}>
    <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#fafcff', borderColor: '#dce4ef' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <TextField select size="small" label="Ver el prototipo como" value={role} onChange={e => { setRole(e.target.value as Role); setAddressId(''); }} sx={{ minWidth: 240 }}>
          {ROLES.map(r => <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>)}
        </TextField>
        <Typography variant="body2" color="text.secondary">{ROLES.find(r => r.id === role)!.user} · Simulación de permisos para revisar Parque vehicular.</Typography>
        {canSeeReport(role) && <Button size="small" variant="outlined" startIcon={<Assessment />} onClick={() => setReport(true)} sx={{ ml: { sm: 'auto' }, flexShrink: 0 }}>Valores «Otro»</Button>}
      </Stack>
    </Paper>
    <Typography component="h2" variant="subtitle1" sx={{ mb: 2 }}>DIRECCIONES</Typography>
    <TextField size="small" placeholder="Buscar dirección..." inputProps={{ 'aria-label': 'Buscar dirección del parque vehicular' }} value={query} onChange={e => setQuery(e.target.value)} sx={{ width: { xs: '100%', sm: 350 }, mb: 2 }} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} />
    <Stack spacing={2}>{filtered.map(a => <Box key={a.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 220px 160px' }, gap: 2 }}>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction="row" spacing={1}><LocalShippingOutlined fontSize="small" /><Typography fontWeight={600}>{a.label}</Typography></Stack>
        <Typography sx={{ mt: .5, overflowWrap: 'anywhere' }}>{a.street}</Typography>
        <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
          <Button variant="outlined" size="small" startIcon={<LocalShippingOutlined />} onClick={() => setAddressId(a.id)} aria-label={`Parque vehicular de ${a.label}`}>Parque vehicular</Button>
          {a.id === '529-BASE' && <Button size="small" onClick={onCreateTask}>Crear tarea desde dirección (simulación)</Button>}
        </Stack>
      </Paper>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}><Typography variant="body2">FORMA DE ENVÍO</Typography><Typography sx={{ mt: .5 }}>{a.shipping}</Typography></Paper>
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}><Stack direction="row" spacing={1}><QrCode2 fontSize="small" /><Typography>QR</Typography></Stack><Typography color={a.qr ? 'success.main' : 'error.main'}>{a.qr ? 'Activado' : 'Desactivado'}</Typography></Paper>
    </Box>)}</Stack>
    {!filtered.length && (addresses.length ? <Typography sx={{ py: 3 }}>No se encontraron direcciones.</Typography> : <Alert severity="info" sx={{ mt: 2 }}>Este rol no tiene Direcciones de este cliente en su universo de trabajo.</Alert>)}
  </Box>;
}
