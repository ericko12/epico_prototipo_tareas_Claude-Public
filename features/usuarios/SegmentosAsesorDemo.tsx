"use client";

import { useState, type FormEvent } from "react";
import {
  Alert, Box, Button, List, ListItem, ListItemText,
  MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

const segments = ["Refaccionarias", "Moto Partes", "Empresas", "Talleres"] as const;
type Segment = (typeof segments)[number];

const advisors: { id: string; name: string; segment: Segment | "" }[] = [
  { id: "ASE-01", name: "Ana Torres", segment: "Moto Partes" },
  { id: "ASE-02", name: "Diego Vargas", segment: "" },
  { id: "ASE-03", name: "Sofía Cruz", segment: "Empresas" },
];

const supervisors: Record<string, { id: string; name: string; level: string }[]> = {
  "ASE-01": [
    { id: "SUP-01", name: "Supervisor de prueba 01", level: "Regional" },
    { id: "SUP-02", name: "Supervisor de prueba 02", level: "Territorial" },
    { id: "SUP-03", name: "Supervisor de prueba 03", level: "Divisional" },
  ],
  "ASE-03": [{ id: "SUP-02", name: "Supervisor de prueba 02", level: "Territorial" }],
};

type Change = {
  advisorId: string;
  before: Segment | "";
  after: Segment;
  at: string;
  requestedBy: string;
};

const administrator = "Administrador de segmentos (demo)";
const clock = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

export default function SegmentosAsesorDemo() {
  const [profile, setProfile] = useState("admin");
  const authorized = profile === "admin";
  const [advisorId, setAdvisorId] = useState(advisors[0].id);
  const advisor = advisors.find((entry) => entry.id === advisorId) ?? advisors[0];
  const [changes, setChanges] = useState<Change[]>([]);
  const history = changes.filter((change) => change.advisorId === advisor.id);
  const currentSegment = history[0]?.after ?? advisor.segment;
  const [nextSegment, setNextSegment] = useState<Segment | "">("");
  const [supervisorId, setSupervisorId] = useState("");
  const eligibleSupervisors = supervisors[advisor.id] ?? [];
  const supervisor = eligibleSupervisors.find((entry) => entry.id === supervisorId);
  const [confirmation, setConfirmation] = useState("");
  const canSave = authorized && nextSegment !== "" && nextSegment !== currentSegment && !!supervisor;

  function resetForm() {
    setNextSegment("");
    setSupervisorId("");
    setConfirmation("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave || !supervisor || !segments.includes(nextSegment)) return;
    const entry = {
      advisorId: advisor.id,
      before: currentSegment,
      after: nextSegment,
      at: new Date().toISOString(),
      requestedBy: supervisor.name + " · " + supervisor.level,
    };
    setChanges((previous) => [entry, ...previous]);
    resetForm();
    setConfirmation(`Se guardó ${entry.after} como segmento de ${advisor.name}.`);
  }

  return (
    <Stack spacing={2} sx={{ mx: "auto", maxWidth: 760, p: { xs: 2, md: 3 } }}>
      <Box>
        <Typography variant="h5" component="h1" fontWeight={700}>Segmentos de asesores</Typography>
        <Typography color="text.secondary">
          Datos de demostración. Los cambios se conservan mientras esta vista está abierta.
        </Typography>
      </Box>
      <TextField
        id="advisor-segment-test-profile"
        select size="small" label="Perfil de prueba" value={profile}
        onChange={(event) => { setProfile(event.target.value); resetForm(); }}
      >
        <MenuItem value="admin">Administrador autorizado</MenuItem>
        <MenuItem value="admin-no-permission">Administrador sin permiso</MenuItem>
        <MenuItem value="supervisor">Supervisor</MenuItem>
        <MenuItem value="advisor">Asesor</MenuItem>
      </TextField>

      {authorized ? (
        <>
          <Paper component="form" variant="outlined" onSubmit={save} sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack spacing={2}>
              <TextField
                id="advisor-for-segment"
                select label="Asesor" value={advisorId}
                onChange={(event) => { setAdvisorId(event.target.value); resetForm(); }}
              >
                {advisors.map((entry) => (
                  <MenuItem key={entry.id} value={entry.id}>{entry.name} · {entry.id}</MenuItem>
                ))}
              </TextField>
              <Box>
                <Typography color="text.secondary" variant="body2">Segmento actual</Typography>
                <Typography fontWeight={700}>{currentSegment || "Sin segmento asignado"}</Typography>
              </Box>
              <TextField
                id="new-advisor-segment"
                select label="Nuevo segmento" value={nextSegment}
                onChange={(event) => { setNextSegment(event.target.value as Segment | ""); setConfirmation(""); }}
              >
                {segments.map((segment) => (
                  <MenuItem key={segment} value={segment} disabled={segment === currentSegment}>{segment}</MenuItem>
                ))}
              </TextField>
              <TextField
                id="requesting-supervisor"
                select
                label="Supervisor que solicita el cambio"
                value={supervisorId}
                disabled={!eligibleSupervisors.length}
                helperText={eligibleSupervisors.length ? "Elige al supervisor que solicita el cambio." : "Este asesor no tiene un supervisor elegible para registrar el cambio."}
                onChange={(event) => { setSupervisorId(event.target.value); setConfirmation(""); }}
              >
                <MenuItem value="" disabled>Selecciona un supervisor</MenuItem>
                {eligibleSupervisors.map((entry) => (
                  <MenuItem key={entry.id} value={entry.id}>{entry.name} · {entry.level}</MenuItem>
                ))}
              </TextField>
              <Stack direction={{ xs: "column", sm: "row" }} gap={1} justifyContent="flex-end">
                <Button variant="outlined" onClick={resetForm} disabled={!nextSegment && !supervisorId}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={!canSave}>Guardar</Button>
              </Stack>
              {confirmation && <Alert severity="success" role="status">{confirmation}</Alert>}
            </Stack>
          </Paper>
          <Paper component="section" variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" component="h2">Historial de cambios</Typography>
            {history.length === 0 ? (
              <Typography color="text.secondary">Este asesor aún no tiene cambios registrados.</Typography>
            ) : (
              <List disablePadding>
                {history.map((entry, index) => (
                  <ListItem key={`${entry.at}-${history.length - index}`} disableGutters divider>
                    <ListItemText
                      primary={`${entry.before || "Sin segmento asignado"} → ${entry.after}`}
                      secondary={`${clock.format(new Date(entry.at))} · ${administrator} · Solicitó: ${entry.requestedBy}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </>
      ) : (
        <Alert severity="info">El mantenimiento de segmentos requiere un Administrador autorizado.</Alert>
      )}
    </Stack>
  );
}
