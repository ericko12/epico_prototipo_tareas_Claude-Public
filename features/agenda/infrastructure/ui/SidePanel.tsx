"use client";
import { Alert, Box, Button, InputAdornment, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { DragIndicator, Search } from "@mui/icons-material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useAgenda } from "@/features/agenda/application/AgendaContext";
import { clientId, clientKey, normalize } from "@/features/agenda/domain/agenda.data";
import { GapMarker, Hint, SectionTitle } from "./shared";

const outlinedBtn = {
  borderRadius: "4px",
  fontWeight: FontWeightEnum.Medium,
  color: ColorsEpico.ColorDarkCharcoal,
  borderColor: ColorsEpico.ColorGrayNeutral,
};

const Portfolio = () => {
  const a = useAgenda();
  const q = normalize(a.search);
  const list = a.visiblePortfolio.filter((c) => (q.length === 0 || q.length >= 3) && normalize(`${clientId(c)} ${c[0]} ${c[1]}`).includes(q));

  return (
    <GapMarker label="Arrastrar cliente al calendario: no existe en Épico (patrón nuevo)">
      <Box sx={{ mt: 1, pt: { xs: 0, md: a.showGaps ? 5 : 0 } }}>
        {list.length === 0 && (
          <Hint>
            {q.length > 0 && q.length < 3
              ? "Escribe al menos 3 caracteres."
              : "No se encontraron clientes con ese criterio."}
          </Hint>
        )}
        {list.map((c) => (
          <Box
            key={clientKey(c) + (c[4] ?? "")}
            draggable={a.canEdit}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/json", JSON.stringify({ name: c[0], address: c[1] }));
              e.dataTransfer.effectAllowed = "copy";
            }}
            onClick={() => a.canEdit && a.openForm({ client: c[0], address: c[1], creationMode: "event" })}
            sx={{
              display: "flex",
              gap: 0.5,
              alignItems: "flex-start",
              p: 1,
              mb: 0.75,
              borderRadius: "8px",
              border: `1px solid ${ColorsEpico.ColorLightBlueishGray}`,
              cursor: a.canEdit ? "grab" : "default",
              opacity: a.canEdit ? 1 : 0.5,
              "&:hover": a.canEdit ? { bgcolor: ColorsEpico.ColorNeutro, borderColor: ColorsEpico.ColorGrayNeutral } : {},
            }}
          >
            <DragIndicator sx={{ fontSize: 16, color: ColorsEpico.ColorNeutral, mt: 0.2 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography fontSize={FontSizesEnum.Delta} fontWeight={FontWeightEnum.Bold}>{c[0]}</Typography>
              <Typography fontSize={FontSizesEnum.Omega} color={ColorsEpico.ColorBlack60}>
                {clientId(c)} · {c[1]}{c[4] ? ` · Responsable original: ${c[4]}` : ""}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </GapMarker>
  );
};

export const SidePanel = () => {
  const a = useAgenda();

  return (
    <Box sx={{ p: 2 }}>
      <SectionTitle>Clientes para agenda</SectionTitle>
      <Hint>Busca un cliente y arrástralo al calendario o haz clic para agendar.</Hint>

      <TextField
        fullWidth
        size="small"
        label="Buscar cliente"
        placeholder="Cliente ID, nombre fiscal o dirección"
        value={a.search}
        onChange={(e) => a.setSearch(e.target.value)}
        helperText={a.search.trim().length > 0 && a.search.trim().length < 3 ? "Escribe al menos 3 caracteres." : " "}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        sx={{ mt: 1.5 }}
      />

      <TextField
        select
        fullWidth
        size="small"
        label="Alcance"
        value={a.role === "advisor" ? "own" : a.portfolioScope}
        disabled={a.role === "advisor"}
        onChange={(e) => a.setPortfolioScope(e.target.value as "own" | "team")}
        sx={{ mt: 0.5 }}
      >
        <MenuItem value="own">Mi cartera</MenuItem>
        <MenuItem value="team">Clientes del equipo / jerarquía</MenuItem>
      </TextField>

      <Portfolio />

      <Hint sx={{ mt: 2 }}>
        Los horarios se muestran como hora local del asesor en esta simulación. El manejo definitivo de zona horaria sigue pendiente de validación técnica.
      </Hint>

      <Box sx={{ mt: 2, p: 1.5, border: `1px solid ${ColorsEpico.ColorLightBlueishGray}`, borderRadius: "8px" }}>
        <SectionTitle sx={{ fontSize: FontSizesEnum.Delta }}>Reglas de ejecución</SectionTitle>
        {[
          "Toda visita debe tener un evento de Agenda antes del Check-in. Si surge durante la jornada, primero se crea el evento y después se inicia la visita.",
          "No se permite un nuevo Check-in mientras exista una visita abierta.",
          "Si existe un Check-in abierto al intentar iniciar la siguiente visita, el asesor debe recibir la advertencia y cerrar primero la visita anterior.",
          "Si la última visita del día queda abierta, el proceso diario de las 22:00 hora Ciudad de México la cierra automáticamente, registra 10 minutos de duración y la identifica como cierre automático.",
        ].map((r) => (
          <Typography key={r} fontSize={FontSizesEnum.Epsilon} color={ColorsEpico.ColorBlack60} sx={{ mt: 0.75 }}>
            • {r}
          </Typography>
        ))}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          onClick={a.simulateDayClose}
          sx={{ ...outlinedBtn, mt: 1.5 }}
        >
          Simular cierre automático · 22:00 CDMX
        </Button>
        {a.closeResult && (
          a.closeResult.type === "ok"
            ? <Alert severity="success" variant="outlined" sx={{ mt: 1, fontSize: FontSizesEnum.Epsilon }}><b>Visita regularizada.</b> {a.closeResult.text}</Alert>
            : <Hint sx={{ mt: 1 }}>{a.closeResult.text}</Hint>
        )}
      </Box>
    </Box>
  );
};
