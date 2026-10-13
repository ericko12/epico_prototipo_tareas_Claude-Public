"use client";
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useAgenda } from "@/features/agenda/application/AgendaContext";
import { DetailVisibility, Role, Scope } from "@/features/agenda/domain/agenda.types";
import { GapMarker, Hint } from "./shared";

const field = { minWidth: { xs: "100%", sm: 190 }, flex: { xs: "1 1 100%", sm: "0 1 auto" } };

/** Bloque exclusivo del simulador: NO es parte del producto (permite probar roles, alcance y escenarios). */
export const SimulationControls = () => {
  const a = useAgenda();
  return (
    <GapMarker kind="sim" label="Solo simulación · no es parte del producto" sx={{ mt: 2, p: { xs: 1, md: 0 } }}>
      <Box sx={{ p: 1.5, borderRadius: "8px", border: `1px dashed ${ColorsEpico.ColorBlueView}`, bgcolor: "#FAF8FF" }}>
        <Typography sx={{ fontSize: FontSizesEnum.Omega, fontWeight: FontWeightEnum.Bold, color: ColorsEpico.ColorPurple, letterSpacing: ".04em", mb: 1.5, pr: { xs: 0, md: 30 } }}>
          CONTROL DE SIMULACIÓN · <Box component="span" sx={{ fontWeight: 500, fontStyle: "italic", letterSpacing: 0 }}>prueba rol, alcance, permisos y escenarios. El cambio de agenda se realiza en “Agenda visible”.</Box>
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
          <TextField select size="small" label="Rol simulado" value={a.role} onChange={(e) => a.setRole(e.target.value as Role)} sx={field}>
            <MenuItem value="manager">Gestor de equipo</MenuItem>
            <MenuItem value="advisor">Asesor</MenuItem>
            <MenuItem value="consult">Consulta ampliada</MenuItem>
            <MenuItem value="support">Administrador de Agenda</MenuItem>
          </TextField>
          {a.role !== "advisor" && (
            <TextField select size="small" label="Alcance simulado" value={a.scope} onChange={(e) => a.setScope(e.target.value as Scope)} sx={field}>
              <MenuItem value="own">Propio</MenuItem>
              <MenuItem value="team">Equipo / jerarquía</MenuItem>
              <MenuItem value="global">Global</MenuItem>
            </TextField>
          )}
          {a.role === "manager" && (
            <FormControlLabel control={<Checkbox size="small" checked={a.managerCanEdit} onChange={(e) => a.setManagerCanEdit(e.target.checked)} />} label={<Typography fontSize={FontSizesEnum.Delta}>Administrar eventos del equipo</Typography>} sx={{ m: 0, px: 1, border: `1px solid ${ColorsEpico.ColorGrayNeutral}`, borderRadius: "4px", height: 40 }} />
          )}
          {a.role !== "advisor" && (
            <TextField select size="small" label="Detalle de otras agendas" value={a.detailVisibility} onChange={(e) => a.setDetailVisibility(e.target.value as DetailVisibility)} sx={field}>
              <MenuItem value="full">Detalle completo</MenuItem>
              <MenuItem value="busy">Solo disponibilidad · “Ocupado”</MenuItem>
            </TextField>
          )}
          <Button variant="outlined" color="secondary" onClick={a.loadOpenVisitScenario} sx={{ borderRadius: "4px", fontWeight: FontWeightEnum.Medium, height: 40 }}>Cargar visita abierta</Button>
        </Stack>
        <Hint sx={{ mt: 1.2 }}>{a.roleExplanation}</Hint>
        {a.scenarioMsg && <Hint sx={{ mt: 0.5, color: ColorsEpico.ColorPurple }}>{a.scenarioMsg}</Hint>}
      </Box>
      {a.role === "support" && (
        <Alert severity="error" variant="outlined" sx={{ mt: 1.5, bgcolor: ColorsEpico.ColorPastelPink, "& .MuiAlert-message": { width: "100%" } }}>
          <Typography fontWeight={FontWeightEnum.Bold} fontSize={FontSizesEnum.Delta}>Control operativo de Agenda</Typography>
          <Hint>Vista simulada para soporte: permite localizar visitas abiertas y regularizarlas conservando trazabilidad.</Hint>
          {a.openVisits.length === 0 ? <Typography fontSize={FontSizesEnum.Epsilon} sx={{ mt: 1 }}>No hay visitas abiertas.</Typography> : a.openVisits.map((x) => (
            <Stack key={`${x.id}-${x.event.id}`} direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ py: 1, borderBottom: `1px solid ${ColorsEpico.ColorPink}`, "&:last-of-type": { borderBottom: 0 } }}>
              <Box>
                <Typography fontSize={FontSizesEnum.Epsilon} fontWeight={FontWeightEnum.Bold}>{x.owner} · {x.event.title}</Typography>
                <Typography fontSize={FontSizesEnum.Epsilon}>Check-in {x.event.time} · sin Check-out</Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => a.regularize(x.id, x.event.id)} sx={{ borderRadius: "4px", color: ColorsEpico.ColorDarkCharcoal, borderColor: ColorsEpico.ColorGrayNeutral, whiteSpace: "nowrap" }}>Regularizar cierre</Button>
            </Stack>
          ))}
        </Alert>
      )}
    </GapMarker>
  );
};
