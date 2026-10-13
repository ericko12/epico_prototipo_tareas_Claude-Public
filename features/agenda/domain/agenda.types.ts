export type EventKind = "planned" | "realized";
export type ActivityType = "visit" | "promo" | "internal";
export type Role = "manager" | "advisor" | "consult" | "support";
export type Scope = "own" | "team" | "global";
export type DetailVisibility = "full" | "busy";
export type View = "day" | "week" | "month";
export type SummaryFilter = "planned" | "done" | "pending" | "late" | null;
export type RouteStart = "current" | "branch" | "first";

export interface AgendaEvent {
  id: string | number;
  title: string;
  address: string;
  time: string;
  duration: number;
  kind: EventKind;
  status: string;
  planned?: string;
  absence?: boolean;
  openSince?: string;
  scenario?: boolean;
  date?: string;
  quote?: string;
  description?: string;
  activityType?: ActivityType;
  requiresEvidence?: boolean;
  createdBy?: string;
  createdAt?: string;
  modifiedBy?: string | null;
  modifiedAt?: string | null;
  cancelReason?: string;
  regularizedBy?: string;
  routeSuggested?: boolean;
  checkInAt?: string;
  checkOutAt?: string;
  checkInEpochMs?: number;
  checkOutEpochMs?: number;
  objective?: string;
  result?: string;
  findings?: string;
  locationStatus?: "En rango" | "Fuera de rango" | "Sin ubicación válida";
  automaticClose?: boolean;
}

export interface AgendaTask {
  id: number;
  subject: string;
  detail: string;
  client: string;
  due: string;
  owner: string;
  origin: string;
  status: string;
  requiresEvidence?: boolean;
}

/** [razón social, dirección, x, y, responsable original?] — coordenadas ilustrativas para la ruta. */
export type Client = [string, string, number, number, string?];

export interface OwnerProfile { label: string; clients: Client[]; events: AgendaEvent[]; tasks: AgendaTask[] }
export type OwnerId = "luis" | "alicia" | "arturo" | "yuridia";
