'use client';

import { useState } from 'react';
import { Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { LocalShippingOutlined, QrCode2, Search } from '@mui/icons-material';
import { useSetBreadcrumb } from '@/features/layoutMain/infrastructure/ui/BreadcrumbContext';
import { assignedAddresses } from '../../domain/fleet';
import ParqueVehicularPage from './ParqueVehicularPage';

/** Access is embedded in the existing general-information tab, never a new client list. */
export default function ParqueVehicularAccess({ clientId, onCreateTask }: { clientId: string; onCreateTask: () => void }) {
  const [addressId, setAddressId] = useState('');
  const [query, setQuery] = useState('');
  const addresses = assignedAddresses(clientId);
  const current = addresses.find(a => a.id === addressId);
  useSetBreadcrumb(['Clientes', 'Listado de clientes', 'Detalle', ...(current ? [current.label, 'Parque vehicular'] : [])]);
  if (current) return <ParqueVehicularPage key={current.id} customerId={clientId} addressId={current.id} onBack={() => setAddressId('')} />;
  const filtered = addresses.filter(a => `${a.label} ${a.street}`.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  return <Box sx={{ mt: 3 }}>
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
    {!filtered.length && <Typography sx={{ py: 3 }}>No se encontraron direcciones.</Typography>}
  </Box>;
}
