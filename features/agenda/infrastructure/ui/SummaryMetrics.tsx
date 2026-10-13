"use client";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useAgenda } from "@/features/agenda/application/AgendaContext";
import { CalendarMonthOutlined, CheckCircleOutline, FlagOutlined, ScheduleOutlined } from "@mui/icons-material";
import { SummaryFilter } from "@/features/agenda/domain/agenda.types";
import { AGENDA_COLORS, Hint } from "./shared";

const METRICS: { key: Exclude<SummaryFilter, null>; label: string; color: string; icon: React.ReactNode }[] = [
  { key: "planned", label: "Planeadas", color: AGENDA_COLORS.planned.main, icon: <CalendarMonthOutlined /> },
  { key: "done", label: "Realizadas", color: AGENDA_COLORS.realized.main, icon: <CheckCircleOutline /> },
  { key: "pending", label: "Pendientes", color: AGENDA_COLORS.pending.main, icon: <ScheduleOutlined /> },
  { key: "late", label: "Con retraso", color: AGENDA_COLORS.late.main, icon: <FlagOutlined /> },
];

export const SummaryMetrics = () => {
  const { summary, summaryFilter, setSummaryFilter } = useAgenda();
  return (
    <Box sx={{ mt: 1.5 }}>
      <Hint>Selecciona un indicador para resaltar en el calendario los eventos relacionados.</Hint>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, mt: 0.75 }}>
        {METRICS.map((m) => {
          const active = summaryFilter === m.key;
          return (
            <ButtonBase
              key={m.key}
              onClick={() => setSummaryFilter(m.key)}
              aria-pressed={active}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", p: 1.5, minHeight: 96,
                borderRadius: "8px", border: `1px solid ${active ? m.color : ColorsEpico.ColorBlueView}`,
                bgcolor: active ? ColorsEpico.ColorLightBlueSelected : ColorsEpico.ColorWhite,
                boxShadow: active ? `0 0 0 1px ${m.color}` : "none", transition: "all .15s",
                "&:hover": { bgcolor: ColorsEpico.ColorNeutro },
              }}
            >
              <Box>
                <Typography sx={{ fontSize: FontSizesEnum.Lambda, fontWeight: FontWeightEnum.Bold, lineHeight: 1.1, color: ColorsEpico.ColorDarkCharcoal }}>{summary[m.key]}</Typography>
                <Typography sx={{ fontSize: FontSizesEnum.Delta, color: ColorsEpico.ColorBlack60, mt: 0.5 }}>{m.label}</Typography>
              </Box>
              <Box sx={{ color: m.color, opacity: 0.85, display: "flex", "& svg": { fontSize: 38 } }}>
                {m.icon}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};
