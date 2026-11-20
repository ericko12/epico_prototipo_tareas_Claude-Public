'use client';

import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from '@mui/material';
import { OTHER_REASON_MAX, REASONS } from '../../domain/contactos';

/** Confirmación de «Inactivar vínculo» (UX-VIEW-05): qué termina, qué permanece y motivo de la lista (clar. 13). */
export default function InactivateDialog({ open, contactName, addressLabel, otherAddresses, onClose, onConfirm }: {
  open: boolean; contactName: string; addressLabel: string; otherAddresses: string[];
  onClose: () => void; onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [error, setError] = useState('');
  const confirm = () => {
    if (!reason) return setError('Selecciona el motivo.');
    if (reason === 'Otro' && !other.trim()) return setError('Escribe el motivo.');
    onConfirm(reason === 'Otro' ? `Otro: ${other.trim()}` : reason);
  };
  return <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="inactivate-title">
    <DialogTitle id="inactivate-title" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Inactivar vínculo</DialogTitle>
    <DialogContent dividers>
      <Typography sx={{ mb: 1 }}><b>{contactName}</b> dejará de aparecer entre los contactos vigentes de <b>{addressLabel}</b>.</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        El contacto sigue en el cliente{otherAddresses.length ? ` y en ${otherAddresses.join(', ')}` : ''}. El vínculo queda en el histórico de esta dirección con la fecha, el motivo y tu usuario.
      </Typography>
      <TextField select fullWidth size="small" label="Motivo" required value={reason} onChange={e => { setReason(e.target.value); setError(''); }} error={!!error && !reason}>
        {REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
      {reason === 'Otro' && <TextField fullWidth size="small" label="Escribe el motivo" required value={other} onChange={e => { setOther(e.target.value); setError(''); }} inputProps={{ maxLength: OTHER_REASON_MAX }} helperText={`${other.length}/${OTHER_REASON_MAX}`} sx={{ mt: 2 }} error={!!error && reason === 'Otro'} />}
      {error && <Typography role="alert" color="error" variant="body2" sx={{ mt: 1 }}>{error}</Typography>}
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
      <Button variant="outlined" onClick={onClose} sx={{ minHeight: 44 }}>Cancelar</Button>
      <Button variant="contained" color="error" onClick={confirm} sx={{ minHeight: 44 }}>Inactivar vínculo</Button>
    </DialogActions>
  </Dialog>;
}
