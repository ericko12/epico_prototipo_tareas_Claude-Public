'use client';

import { useSyncExternalStore } from 'react';
import { INITIAL_STATE, validState } from '../../domain/contactos';
import type { ContactsState } from '../../domain/contactos';

/** Estado compartido entre la ficha del cliente y la pantalla de contactos de cada dirección. */
export const STORAGE_KEY = 'epico-tareas-contactos-v1';

let state: ContactsState = INITIAL_STATE;
let loaded = false;
let storageAvailable = true;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const parsed = JSON.parse(raw); if (validState(parsed)) state = parsed; }
  } catch { storageAvailable = false; }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { storageAvailable = false; }
}
function subscribe(fn: () => void) { load(); listeners.add(fn); return () => { listeners.delete(fn); }; }
const getSnapshot = () => state;
const getServerSnapshot = () => INITIAL_STATE;

export function setContactsState(next: ContactsState | ((s: ContactsState) => ContactsState)) {
  state = typeof next === 'function' ? next(state) : next;
  persist();
  listeners.forEach(l => l());
}
export const resetContacts = () => setContactsState(INITIAL_STATE);
export const contactsStorageAvailable = () => storageAvailable;

export function useContacts() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const fmtDate = (v: string) => new Date(v).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
export const fmtDateTime = (v: string) => new Date(v).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
