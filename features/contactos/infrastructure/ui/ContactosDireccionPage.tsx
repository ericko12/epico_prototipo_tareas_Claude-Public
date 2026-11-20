'use client';

import { useState } from 'react';
import { Alert, Box, Button, Chip, Collapse, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { Add, ArrowBack, CheckCircle, EditOutlined, ExpandLess, ExpandMore, LinkOff, LocationOn, MailOutline, PersonOutline, PhoneOutlined, PlaylistAdd } from '@mui/icons-material';
import { DECIDES_LABEL, MSG, activeFor, addressView, associate, createContact, inactivate, inactivateAddress, missing, reactivateAddress, updateContact } from '../../domain/contactos';
import type { Contact } from '../../domain/contactos';
import { contactsStorageAvailable, fmtDate, fmtDateTime, resetContacts, setContactsState, useContacts } from './contactsStore';
import ContactDialog from './ContactDialog';
import InactivateDialog from './InactivateDialog';

export type AddressRef = { id: string; label: string; street: string };
type Mode = 'edit' | 'read';
const sim = { p: 1.5, mb: 2, bgcolor: '#f6f2ff', borderColor: '#d9ccf5', borderStyle: 'dashed' } as const;

/** Tarjeta de un contacto: nombre, área, decisor, canales y dónde más está asociado. */
function ContactCard({ c, addresses, currentId, children }: { c: Contact; addresses: AddressRef[]; currentId: string; children?: React.ReactNode }) {
  const state = useContacts();
  const others = activeFor(state, c.id).filter(a => a.addressId !== currentId).map(a => addresses.find(x => x.id === a.addressId)?.label ?? a.addressId);
  const gaps = missing(c);
  return <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, minWidth: 0 }}>
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <PersonOutline fontSize="small" sx={{ mt: .3, color: 'text.secondary' }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{c.name}</Typography>
        <Stack direction="row" gap={.75} flexWrap="wrap" sx={{ mt: .75 }}>
          {c.area ? <Chip size="small" label={c.area} /> : <Chip size="small" variant="outlined" color="warning" label="Área: falta" />}
          {c.decides && <Chip size="small" color="primary" icon={<CheckCircle />} label={DECIDES_LABEL} />}
        </Stack>
      </Box>
    </Stack>
    <Stack spacing={.5} sx={{ mt: 1.25, pl: { sm: 3.5 } }}>
      {c.rows.map((r, i) => <Stack key={i} direction={{ xs: 'column', sm: 'row' }} columnGap={2} rowGap={.25} sx={{ minWidth: 0 }}>
        {r.number && <Typography variant="body2" component="a" href={`tel:${r.number}`} sx={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: .5, minHeight: 32 }}><PhoneOutlined sx={{ fontSize: 16 }} />{r.number}{r.ext && ` ext. ${r.ext}`}</Typography>}
        {r.email && <Typography variant="body2" component="a" href={`mailto:${r.email}`} sx={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: .5, minHeight: 32, overflowWrap: 'anywhere', minWidth: 0 }}><MailOutline sx={{ fontSize: 16, flexShrink: 0 }} />{r.email}</Typography>}
      </Stack>)}
      {gaps.includes('Correo') && <Typography variant="body2" color="warning.dark">Correo: falta</Typography>}
      {others.length > 0 && <Typography variant="body2" color="text.secondary">También en: {others.join(', ')}</Typography>}
    </Stack>
    {children && <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 1.25, pl: { sm: 3.5 } }}>{children}</Stack>}
  </Paper>;
}

/**
 * UX-VIEW-01 · Contactos de una Dirección. Contactos vigentes (decisores primero), contactos del
 * cliente sin dirección, otros contactos del cliente e histórico aparte (clar. 3, 8, 12, 14, 15).
 */
export default function ContactosDireccionPage({ customerId, customerName, address, addresses, onBack }: {
  customerId: string; customerName: string; address: AddressRef; addresses: AddressRef[]; onBack: () => void;
}) {
  const state = useContacts();
  const [mode, setMode] = useState<Mode>('edit');
  const [dialog, setDialog] = useState<{ contact?: Contact } | null>(null);
  const [toInactivate, setToInactivate] = useState<{ contact: Contact; associationId: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [notice, setNotice] = useState('');
  const { here, withoutAddress, elsewhere, history } = addressView(state, customerId, address.id);
  const inactive = state.inactiveAddresses.includes(address.id);
  const canEdit = mode === 'edit' && !inactive;
  const label = (id: string) => addresses.find(a => a.id === id)?.label ?? id;
  const nameOf = (id: string) => state.contacts.find(c => c.id === id)?.name ?? id;
  const doAssociate = (c: Contact) => { setContactsState(s => associate(s, c.id, address.id)); setNotice(MSG.associated); };

  return <Box sx={{ mt: 3 }}>
    <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2, minHeight: 44 }}>Direcciones</Button>

    <Paper variant="outlined" sx={sim}>
      <Typography variant="caption" fontWeight={700} color="#5b3fa8">SIMULACIÓN · no es parte del producto</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} alignItems={{ md: 'center' }} sx={{ mt: 1 }}>
        <TextField select size="small" label="Permiso simulado" value={mode} onChange={e => setMode(e.target.value as Mode)} sx={{ minWidth: 240 }}>
          <MenuItem value="edit">Puede editar contactos (clar. 7)</MenuItem>
          <MenuItem value="read">Solo consulta</MenuItem>
        </TextField>
        <Button variant="outlined" size="small" sx={{ minHeight: 40 }} onClick={() => { setContactsState(s => inactive ? reactivateAddress(s, address.id) : inactivateAddress(s, address.id)); setNotice(inactive ? 'Dirección reactivada (simulación).' : 'Logística inactivó la dirección: sus vínculos pasaron al histórico.'); }}>{inactive ? 'Reactivar dirección' : 'Logística inactiva esta dirección'}</Button>
        <Button size="small" sx={{ minHeight: 40 }} onClick={() => { resetContacts(); setNotice('Ejemplos restaurados.'); }}>Restaurar ejemplos</Button>
      </Stack>
      {!contactsStorageAvailable() && <Typography variant="caption" color="text.secondary">El navegador no permite guardar: los cambios se pierden al recargar.</Typography>}
    </Paper>

    <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{customerName} › {address.label} › Contactos</Typography>
    <Paper variant="outlined" sx={{ p: 1.5, mt: 1, mb: 2, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="space-between" alignItems={{ sm: 'center' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">{customerName}</Typography>
          <Stack direction="row" spacing={1} alignItems="center"><LocationOn fontSize="small" /><Typography fontWeight={700}>{address.label}</Typography>
            <Chip size="small" label={inactive ? 'Inactiva' : 'Activa'} color={inactive ? 'default' : 'success'} variant="outlined" /></Stack>
          <Typography variant="body2" sx={{ mt: .5, overflowWrap: 'anywhere' }}>{address.street}</Typography>
        </Box>
        {canEdit && <Button variant="contained" startIcon={<Add />} onClick={() => setDialog({})} sx={{ minHeight: 44, flexShrink: 0 }}>Agregar contacto</Button>}
      </Stack>
    </Paper>

    {inactive && <Alert severity="warning" sx={{ mb: 2 }}>Esta dirección está inactiva: no se pueden agregar, asociar ni editar contactos. Consulta sus contactos anteriores en el histórico.</Alert>}

    <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>CONTACTOS DE ESTA DIRECCIÓN ({here.length})</Typography>
    {here.length ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))' }, gap: 1.5, mb: 3 }}>
      {here.map(c => <ContactCard key={c.id} c={c} addresses={addresses} currentId={address.id}>
        {canEdit && <><Button size="small" variant="outlined" startIcon={<EditOutlined />} sx={{ minHeight: 40 }} onClick={() => setDialog({ contact: c })}>Editar</Button>
          <Button size="small" color="error" startIcon={<LinkOff />} sx={{ minHeight: 40 }} onClick={() => setToInactivate({ contact: c, associationId: activeFor(state, c.id).find(a => a.addressId === address.id)!.id })}>Inactivar vínculo</Button></>}
      </ContactCard>)}
    </Box> : <Alert severity="info" sx={{ mb: 3 }}>{!inactive && withoutAddress.length ? MSG.pendingClient : MSG.emptyAddress}</Alert>}

    {!inactive && <>
      <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: .5 }}>SIN DIRECCIÓN ASOCIADA ({withoutAddress.length})</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Contactos del cliente que todavía no se asocian a ninguna dirección. Son del cliente, no de esta dirección.</Typography>
      {withoutAddress.length ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))' }, gap: 1.5, mb: 3 }}>
        {withoutAddress.map(c => <ContactCard key={c.id} c={c} addresses={addresses} currentId={address.id}>
          <Chip size="small" variant="outlined" label="Sin dirección asociada" />
          {canEdit && <Button size="small" variant="outlined" startIcon={<PlaylistAdd />} sx={{ minHeight: 40 }} onClick={() => doAssociate(c)}>Asociar a esta dirección</Button>}
        </ContactCard>)}
      </Box> : <Typography variant="body2" sx={{ mb: 3 }}>Todos los contactos del cliente tienen al menos una dirección.</Typography>}

      {elsewhere.length > 0 && <>
        <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: .5 }}>EN OTRAS DIRECCIONES DEL CLIENTE ({elsewhere.length})</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Un contacto puede estar en varias direcciones; sus datos son los mismos en todas (clar. 3 y 5).</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0,1fr))' }, gap: 1.5, mb: 3 }}>
          {elsewhere.map(c => <ContactCard key={c.id} c={c} addresses={addresses} currentId={address.id}>
            {canEdit && <Button size="small" variant="outlined" startIcon={<PlaylistAdd />} sx={{ minHeight: 40 }} onClick={() => doAssociate(c)}>Asociar a esta dirección</Button>}
          </ContactCard>)}
        </Box>
      </>}
    </>}

    <Button onClick={() => setShowHistory(v => !v)} endIcon={showHistory ? <ExpandLess /> : <ExpandMore />} sx={{ minHeight: 44 }} aria-expanded={showHistory}>Histórico ({history.length})</Button>
    <Collapse in={showHistory}>
      {history.length ? <Stack spacing={1} sx={{ mt: 1 }}>{history.map(h => <Paper key={h.id} variant="outlined" sx={{ p: 1.5, bgcolor: '#fafafa' }}>
        <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{nameOf(h.contactId)}</Typography>
        <Typography variant="body2" color="text.secondary">Del {fmtDate(h.from)} al {fmtDateTime(h.to)} · Motivo: {h.reason} · {h.by}</Typography>
      </Paper>)}</Stack> : <Typography variant="body2" sx={{ mt: 1 }}>Esta dirección no tiene vínculos inactivos.</Typography>}
    </Collapse>

    {dialog && <ContactDialog key={dialog.contact?.id ?? 'new'} open customerName={customerName} addressLabel={dialog.contact ? undefined : address.label} contact={dialog.contact}
      onClose={() => setDialog(null)}
      onSave={form => { setContactsState(s => dialog.contact ? updateContact(s, dialog.contact.id, form) : createContact(s, customerId, form, address.id)); setNotice(dialog.contact ? 'Contacto actualizado.' : MSG.added); setDialog(null); }} />}
    {toInactivate && <InactivateDialog key={toInactivate.associationId} open contactName={toInactivate.contact.name} addressLabel={address.label}
      otherAddresses={activeFor(state, toInactivate.contact.id).filter(a => a.addressId !== address.id).map(a => label(a.addressId))}
      onClose={() => setToInactivate(null)}
      onConfirm={reason => { setContactsState(s => inactivate(s, toInactivate.associationId, reason)); setNotice('Vínculo inactivado. Quedó en el histórico.'); setToInactivate(null); }} />}
    <Snackbar open={!!notice} autoHideDuration={4000} onClose={() => setNotice('')} message={notice} />
  </Box>;
}
