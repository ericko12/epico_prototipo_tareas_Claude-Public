// Datos DUMMY portados 1:1 del Simulador de Agenda V8.2.
import { AgendaEvent, AgendaTask, Client, OwnerId, OwnerProfile } from "./agenda.types";

const luisClients: Client[] = [
  ["Refaccionaria El Volante", "Av. Demo Vallarta 1200 · Guadalajara, Jal. · DUMMY", 1, 2],
  ["Refaccionaria El Volante", "Av. Demo Río Nilo 2250 · Tonalá, Jal. · DUMMY", 4, 2],
  ["Autopartes del Bajío", "Av. Demo México 2450 · Guadalajara, Jal. · DUMMY", 2, 3],
  ["Frenos Lara", "Calz. Demo Independencia 1800 · Guadalajara, Jal. · DUMMY", 3, 2],
  ["Turbo Sur", "Av. Demo López Mateos Sur 5200 · Zapopan, Jal. · DUMMY", 2, 0],
  ["Rines MX", "Av. Demo Tonalá 800 · Tonalá, Jal. · DUMMY", 5, 2],
];
const luisTasks: AgendaTask[] = [
  { id: 1, subject: "Enviar cotización solicitada", detail: "Confirmar disponibilidad de balatas y discos.", client: "Refaccionaria El Volante", due: "2026-09-23", owner: "Luis Galvan", origin: "Visita", status: "Pendiente" },
  { id: 2, subject: "Confirmar inventario con Operaciones", detail: "Validar existencias antes de responder al cliente.", client: "Refaccionaria El Volante", due: "2026-09-24", owner: "Equipo Operaciones", origin: "Visita", status: "Pendiente" },
  { id: 3, subject: "Validar exhibidor POP", detail: "Registrar evidencia de implementación de material.", client: "Autopartes del Bajío", due: "2026-09-25", owner: "Luis Galvan", origin: "Manual", status: "Pendiente" },
];
const luisEvents: AgendaEvent[] = [
  { id: 1, title: "Refaccionaria El Volante", address: "Av. Demo Vallarta 1200 · Guadalajara, Jal. · DUMMY", time: "08:30", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
  { id: 2, title: "Refaccionaria El Volante", address: "Av. Demo Vallarta 1200 · Guadalajara, Jal. · DUMMY", time: "09:12", duration: 34, kind: "realized", status: "Check-out realizado", planned: "08:30", activityType: "visit" },
  { id: 3, title: "Autopartes del Bajío", address: "Av. Demo México 2450 · Guadalajara, Jal. · DUMMY", time: "10:00", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
  { id: 4, title: "Frenos Lara", address: "Calz. Demo Independencia 1800 · Guadalajara, Jal. · DUMMY", time: "11:30", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
  { id: 5, title: "Frenos Lara", address: "Calz. Demo Independencia 1800 · Guadalajara, Jal. · DUMMY", time: "12:05", duration: 25, kind: "realized", status: "Check-out realizado", planned: "11:30", activityType: "visit" },
  { id: 6, title: "Junta interna Guadalajara", address: "Sin cliente", time: "14:00", duration: 60, kind: "planned", status: "Programada", activityType: "internal" },
];

export const initialProfiles = (): Record<OwnerId, OwnerProfile> => ({
  luis: { label: "Luis Galvan", clients: luisClients, events: luisEvents, tasks: luisTasks },
  alicia: {
    label: "Alicia Cerna",
    clients: [
      ["Llantas Nova", "Av. Demo Patria 2100 · Zapopan, Jal. · DUMMY", 1, 4],
      ["Motores Central", "Av. Demo Américas 1400 · Guadalajara, Jal. · DUMMY", 2, 4],
      ["Servicio Atlas", "Av. Demo Federalismo 900 · Guadalajara, Jal. · DUMMY", 3, 3],
      ["Refacciones Minerva", "Av. Demo Vallarta 3100 · Guadalajara, Jal. · DUMMY", 1, 3],
    ],
    events: [
      { id: 101, title: "Llantas Nova", address: "Av. Demo Patria 2100 · Zapopan, Jal. · DUMMY", time: "09:00", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 102, title: "Llantas Nova", address: "Av. Demo Patria 2100 · Zapopan, Jal. · DUMMY", time: "09:18", duration: 28, kind: "realized", status: "Check-out realizado", planned: "09:00", activityType: "visit" },
      { id: 103, title: "Motores Central", address: "Av. Demo Américas 1400 · Guadalajara, Jal. · DUMMY", time: "11:00", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 104, title: "Servicio Atlas", address: "Av. Demo Federalismo 900 · Guadalajara, Jal. · DUMMY", time: "15:00", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 105, title: "Vacaciones autorizadas", address: "Todo el día", time: "08:00", duration: 720, kind: "planned", status: "Ausencia", absence: true },
    ],
    tasks: [
      { id: 101, subject: "Enviar ficha técnica", detail: "Compartir información solicitada.", client: "Llantas Nova", due: "2026-09-23", owner: "Alicia Cerna", origin: "Visita", status: "Pendiente" },
      { id: 102, subject: "Confirmar fecha de entrega", detail: "Validar con Operaciones.", client: "Motores Central", due: "2026-09-24", owner: "Alicia Cerna", origin: "Manual", status: "Pendiente" },
    ],
  },
  arturo: {
    label: "Arturo Hernández",
    clients: [
      ["Autocentro Sur", "Av. Demo Colón 4100 · Guadalajara, Jal. · DUMMY", 2, 0],
      ["Suspensiones GDL", "Av. Demo 8 de Julio 2600 · Guadalajara, Jal. · DUMMY", 3, 1],
      ["Partes Oriente", "Av. Demo Revolución 3300 · Guadalajara, Jal. · DUMMY", 4, 2],
      ["Ruedas Tapatías", "Av. Demo Río Nilo 1700 · Tonalá, Jal. · DUMMY", 5, 3],
    ],
    events: [
      { id: 201, title: "Autocentro Sur", address: "Av. Demo Colón 4100 · Guadalajara, Jal. · DUMMY", time: "08:00", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 202, title: "Suspensiones GDL", address: "Av. Demo 8 de Julio 2600 · Guadalajara, Jal. · DUMMY", time: "10:30", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 203, title: "Partes Oriente", address: "Av. Demo Revolución 3300 · Guadalajara, Jal. · DUMMY", time: "13:30", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 204, title: "Partes Oriente", address: "Av. Demo Revolución 3300 · Guadalajara, Jal. · DUMMY", time: "14:05", duration: 32, kind: "realized", status: "Check-out realizado", planned: "13:30", activityType: "visit" },
      { id: 205, title: "Ruedas Tapatías", address: "Av. Demo Río Nilo 1700 · Tonalá, Jal. · DUMMY", time: "16:20", duration: 30, kind: "realized", status: "Check-in activo", planned: "16:00", openSince: "16:20", activityType: "visit" },
    ],
    tasks: [
      { id: 201, subject: "Validar devolución", detail: "Revisar folio con cliente.", client: "Autocentro Sur", due: "2026-09-22", owner: "Arturo Hernández", origin: "Visita", status: "Pendiente" },
      { id: 202, subject: "Enviar nueva propuesta", detail: "Ajustar cantidades solicitadas.", client: "Partes Oriente", due: "2026-09-25", owner: "Arturo Hernández", origin: "Visita", status: "Pendiente" },
    ],
  },
  yuridia: {
    label: "Yuridia Maribel Torres",
    clients: [
      ["Distribuidora Oriente", "Av. Demo Revolución 2100 · Guadalajara, Jal. · DUMMY", 4, 2],
      ["Servicio Miravalle", "Av. Demo Gobernador Curiel 3200 · Guadalajara, Jal. · DUMMY", 2, 1],
      ["Autopartes Tlaquepaque", "Av. Demo Niños Héroes 1500 · Tlaquepaque, Jal. · DUMMY", 3, 1],
      ["Motores del Centro", "Av. Demo Alcalde 1850 · Guadalajara, Jal. · DUMMY", 2, 4],
    ],
    events: [
      { id: 301, title: "Distribuidora Oriente", address: "Av. Demo Revolución 2100 · Guadalajara, Jal. · DUMMY", time: "08:30", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 302, title: "Servicio Miravalle", address: "Av. Demo Gobernador Curiel 3200 · Guadalajara, Jal. · DUMMY", time: "10:30", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 303, title: "Autopartes Tlaquepaque", address: "Av. Demo Niños Héroes 1500 · Tlaquepaque, Jal. · DUMMY", time: "13:00", duration: 30, kind: "planned", status: "Programada", activityType: "visit" },
      { id: 304, title: "Distribuidora Oriente", address: "Av. Demo Revolución 2100 · Guadalajara, Jal. · DUMMY", time: "08:48", duration: 31, kind: "realized", status: "Check-out realizado", planned: "08:30", activityType: "visit" },
    ],
    tasks: [
      { id: 301, subject: "Confirmar cotización", detail: "Revisar precios con Comercial.", client: "Distribuidora Oriente", due: "2026-09-23", owner: "Yuridia Maribel Torres", origin: "Visita", status: "Pendiente" },
      { id: 302, subject: "Dar seguimiento a devolución", detail: "Confirmar resolución del caso.", client: "Servicio Miravalle", due: "2026-09-24", owner: "Yuridia Maribel Torres", origin: "Manual", status: "Pendiente" },
    ],
  },
});

export const clientIds: Record<string, string> = {
  "Refaccionaria El Volante": "CLI-1001", "Autopartes del Bajío": "CLI-1002", "Frenos Lara": "CLI-1003", "Turbo Sur": "CLI-1004", "Rines MX": "CLI-1005",
  "Llantas Nova": "CLI-2001", "Motores Central": "CLI-2002", "Servicio Atlas": "CLI-2003", "Refacciones Minerva": "CLI-2004",
  "Autocentro Sur": "CLI-3001", "Suspensiones GDL": "CLI-3002", "Partes Oriente": "CLI-3003", "Ruedas Tapatías": "CLI-3004",
  "Distribuidora Oriente": "CLI-4001", "Servicio Miravalle": "CLI-4002", "Autopartes Tlaquepaque": "CLI-4003", "Motores del Centro": "CLI-4004",
};

export const FORM_CLIENTS = ["Refaccionaria El Volante", "Autopartes del Bajío", "Frenos Lara", "Turbo Sur"];
export const FORM_ADDRESSES = [
  "Av. Demo Vallarta 1200 · Guadalajara, Jal. · DUMMY",
  "Av. Demo México 2450 · Guadalajara, Jal. · DUMMY",
  "Calz. Demo Independencia 1800 · Guadalajara, Jal. · DUMMY",
  "Av. Demo López Mateos Sur 5200 · Zapopan, Jal. · DUMMY",
  "Av. Demo Tonalá 800 · Tonalá, Jal. · DUMMY",
];

export const ROLE_EXPLANATION: Record<string, string> = {
  advisor: "Asesor: administra su propia Agenda y ejecuta sus visitas.",
  managerEdit: "Gestor de equipo: consulta y administra eventos dentro de su jerarquía; puede cubrir rutas de su equipo.",
  managerRead: "Gestor de equipo en modo consulta.",
  consult: "Consulta ampliada: puede revisar agendas según alcance, sin modificar la operación.",
  support: "Administrador de Agenda: soporte operativo, configuración y regularización con trazabilidad.",
};

export const DAY_START = 8 * 60; // 08:00
export const DAY_HOURS = 13;     // 08:00 a 20:00
export const PX_PER_MIN = 1;

export const mins = (t: string) => { const [a, b] = t.split(":").map(Number); return a * 60 + b; };
export const endMin = (e: { time: string; duration: number }) => mins(e.time) + e.duration;
export const hhmm = (total: number) => `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
export const clientKey = (c: Client) => `${c[0]}|${c[1]}`;
export const clientId = (c: Client) => clientIds[c[0]] || "CLI-DUMMY";
export const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const nowMx = () => new Date().toLocaleString("es-MX");
