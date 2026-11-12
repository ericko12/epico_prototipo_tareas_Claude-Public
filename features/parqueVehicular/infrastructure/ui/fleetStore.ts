'use client';

import { useEffect, useState } from 'react';
import { INITIAL_FLEETS, validStoredFleets } from '../../domain/fleet';
import type { Fleet } from '../../domain/fleet';

/** Clave propia de esta versión; la anterior (`-v1`) tenía otro formato y se ignora. */
export const STORAGE_KEY = 'epico-tareas-fleet-review-v2';

/** Grupos guardados del prototipo, compartidos entre la pantalla de Dirección y el reporte del administrador. */
export function useFleetStore() {
  const [groups, setGroups] = useState<Fleet[]>(INITIAL_FLEETS);
  const [loaded, setLoaded] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { const parsed = JSON.parse(raw); if (validStoredFleets(parsed)) setGroups(parsed); else setRestored(true); }
    } catch { setStorageAvailable(false); }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(groups)); } catch { setStorageAvailable(false); } } }, [groups, loaded]);
  const reset = () => setGroups(INITIAL_FLEETS);
  return { groups, setGroups, loaded, storageAvailable, restored, reset };
}

export const fmtDate = (value: string) => new Date(value).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtDateTime = (value: string) => new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
