"use client";
import { Alert, Box, Snackbar } from "@mui/material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useAgenda } from "@/features/agenda/application/AgendaContext";
import { useSetBreadcrumb } from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";
import { AgendaHeader } from "./AgendaHeader";
import { SimulationControls } from "./SimulationControls";
import { SummaryMetrics } from "./SummaryMetrics";
import { AgendaVisibleFilter } from "./AgendaVisibleFilter";
import { CalendarPanel } from "./CalendarPanel";
import { SidePanel } from "./SidePanel";
import { CancelEventDialog, EventDetailDialog, EventFormDialog } from "./AgendaDialogs";

const AgendaSnackbar = () => {
  const { snack, setSnack } = useAgenda();
  return (
    <Snackbar open={!!snack} autoHideDuration={5000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      {snack ? <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(null)}>{snack.msg}</Alert> : undefined}
    </Snackbar>
  );
};

const AgendaContent = () => {
  useSetBreadcrumb(["Rutas + Agenda", "Agenda"]);
  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pb: { xs: 10, md: 10 } }}>
      <Alert severity="warning" variant="outlined" sx={{ fontSize: FontSizesEnum.Epsilon, bgcolor: ColorsEpico.ColorSoftBeige }}>
        <b>Simulador funcional de Discovery · V8.2 integrado en Épico (versión sintética).</b> Incluye propuesta de ruta, comparación planeado/real, detalle flotante de actividades y reglas de visitas abiertas.
        Mapa real, tráfico real y navegación quedan fuera de esta simulación; su viabilidad/costo debe revisarse con Arquitectura y negocio.
      </Alert>
      <SimulationControls />

      <Box sx={{ mt: 3 }}>
        <AgendaHeader />
        <AgendaVisibleFilter />
        <SummaryMetrics />
      </Box>
      <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1fr) 340px" }, border: `1px solid ${ColorsEpico.ColorLightBlueishGray}`, borderRadius: "8px", overflow: "hidden", bgcolor: ColorsEpico.ColorWhite }}>
        <Box sx={{ minWidth: 0 }}><CalendarPanel /></Box>
        <Box sx={{ borderLeft: { lg: `1px solid ${ColorsEpico.ColorLightBlueishGray}` }, borderTop: { xs: `1px solid ${ColorsEpico.ColorLightBlueishGray}`, lg: 0 }, maxHeight: { lg: 1000 }, overflowY: { lg: "auto" } }}>
          <SidePanel />
        </Box>
      </Box>
      <EventDetailDialog />
      <EventFormDialog />
      <CancelEventDialog />
      <AgendaSnackbar />
    </Box>
  );
};

export const AgendaPage = () => <AgendaContent />;
