'use client';

import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Snackbar, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Add, CheckCircle, DeleteOutline, EditOutlined } from '@mui/icons-material';
import { DECIDES_LABEL, activeFor, canDelete, createContact, customerContacts, deleteContact, missing, sortContacts, updateContact } from '../../domain/contactos';
import type { Contact } from '../../domain/contactos';
import { setContactsState, useContacts } from './contactsStore';
import ContactDialog from './ContactDialog';
import type { AddressRef } from './ContactosDireccionPage';

/** Contactos del cliente desde la ficha (CONTACTO ▾): el alta de aquí queda sin dirección (clar. 10). */
export default function ContactosClienteDialog({ open, customerId, customerName, addresses, onClose }: {
  open: boolean; customerId: string; customerName: string; addresses: AddressRef[]; onClose: () => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const state = useContacts();
  const [dialog, setDialog] = useState<{ contact?: Contact } | null>(null);
  const [notice, setNotice] = useState('');
  const [toDelete, setToDelete] = useState<Contact | null>(null);
  const list = sortContacts(customerContacts(state, customerId));
  const where = (c: Contact) => activeFor(state, c.id).map(a => addresses.find(x => x.id === a.addressId)?.label ?? a.addressId);

  return <>
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md" fullWidth aria-labelledby="client-contacts-title">
      <DialogTitle id="client-contacts-title" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Contactos del cliente</DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} sx={{ mb: 2 }}>
          <Box sx={{ minWidth: 0 }}><Typography variant="body2" color="text.secondary" fontWeight={600}>CLIENTE</Typography><Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{customerName}</Typography></Box>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setDialog({})} sx={{ minHeight: 44, alignSelf: { sm: 'center' } }}>Nuevo contacto</Button>
        </Stack>
        <Stack spacing={1.25}>{list.map((c, i) => {
          const at = where(c);
          return <Paper key={c.id} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="space-between">
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{i + 1} - {c.name}</Typography>
                <Stack direction="row" gap={.75} flexWrap="wrap" sx={{ mt: .5 }}>
                  {c.area ? <Chip size="small" label={c.area} /> : <Chip size="small" variant="outlined" color="warning" label="Área: falta" />}
                  {c.decides && <Chip size="small" color="primary" icon={<CheckCircle />} label={DECIDES_LABEL} />}
                  {c.principal && <Chip size="small" variant="outlined" label="Principal" />}
                  {missing(c).includes('Correo') && <Chip size="small" variant="outlined" color="warning" label="Correo: falta" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: .75 }}>{at.length ? `Direcciones: ${at.join(', ')}` : 'Sin dirección asociada'}</Typography>
              </Box>
              <Stack direction="row" gap={1} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}>
                <Button size="small" variant="outlined" startIcon={<EditOutlined />} onClick={() => setDialog({ contact: c })} sx={{ minHeight: 40 }}>Editar</Button>
                {canDelete(c) && <Button size="small" color="error" startIcon={<DeleteOutline />} onClick={() => setToDelete(c)} sx={{ minHeight: 40 }} aria-label={`Eliminar a ${c.name}`}>Eliminar</Button>}
              </Stack>
            </Stack>
          </Paper>;
        })}</Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}><Button variant="outlined" onClick={onClose} sx={{ minHeight: 44 }}>Cerrar</Button></DialogActions>
    </Dialog>
    {dialog && <ContactDialog key={dialog.contact?.id ?? 'new'} open customerName={customerName} contact={dialog.contact}
      onClose={() => setDialog(null)}
      onSave={form => { setContactsState(s => dialog.contact ? updateContact(s, dialog.contact.id, form) : createContact(s, customerId, form)); setNotice(dialog.contact ? 'Contacto actualizado.' : 'Contacto agregado al cliente, sin dirección asociada.'); setDialog(null); }} />}
    <Dialog open={!!toDelete} onClose={() => setToDelete(null)} maxWidth="xs" fullWidth aria-labelledby="delete-contact-title">
      <DialogTitle id="delete-contact-title" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Eliminar contacto</DialogTitle>
      <DialogContent dividers>
        <Typography><b>{toDelete?.name}</b> dejará de aparecer en el cliente{toDelete && where(toDelete).length ? ` y en ${where(toDelete).join(', ')}` : ''}.</Typography>
        {toDelete && where(toDelete).length > 0 && <Typography color="text.secondary" sx={{ mt: 1 }}>Sus vínculos quedan en el histórico de cada dirección con el motivo «Contacto eliminado».</Typography>}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" onClick={() => setToDelete(null)} sx={{ minHeight: 44 }}>Cancelar</Button>
        <Button variant="contained" color="error" onClick={() => { setContactsState(s => deleteContact(s, toDelete!.id)); setNotice('Contacto eliminado.'); setToDelete(null); }} sx={{ minHeight: 44 }}>Eliminar</Button>
      </DialogActions>
    </Dialog>
    <Snackbar open={!!notice} autoHideDuration={4000} onClose={() => setNotice('')} message={notice} />
  </>;
}
