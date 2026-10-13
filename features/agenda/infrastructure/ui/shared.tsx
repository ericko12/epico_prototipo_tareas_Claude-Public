"use client";
import { Box, Chip, SxProps, Typography } from "@mui/material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useAgenda } from "@/features/agenda/application/AgendaContext";

/** Paleta de estados de Agenda, tomada de los "Status Orders" / labels de ColorsEpico. */
export const AGENDA_COLORS = {
  planned: { main: ColorsEpico.ColorSecondary, bg: ColorsEpico.ColorInfo },
  realized: { main: ColorsEpico.ColorForestGreen, bg: ColorsEpico.ColorMintGreen },
  pending: { main: ColorsEpico.ColorVibrantYellow, bg: ColorsEpico.ColorSoftBeige },
  late: { main: ColorsEpico.ColorDeepCrimson, bg: ColorsEpico.ColorPastelPink },
  absence: { main: ColorsEpico.ColorPurple, bg: "#F3EEFB" },
  task: { main: ColorsEpico.ColorPurple },
};

/** Réplica de features/common/infrastructure/ui/label/Label.tsx (variantes success/warning/error/info/eta). */
const LABEL_VARIANTS = {
  success: { color: ColorsEpico.ColorForestGreen, border: `1px solid ${ColorsEpico.ColorForestGreen}`, backgroundColor: ColorsEpico.ColorMintGreen },
  warning: { color: ColorsEpico.ColorVibrantYellow, border: `1px solid ${ColorsEpico.ColorVibrantYellow}`, backgroundColor: ColorsEpico.ColorSoftBeige },
  error: { color: ColorsEpico.ColorDeepCrimson, border: `1px solid ${ColorsEpico.ColorDeepCrimson}`, backgroundColor: ColorsEpico.ColorPastelPink },
  info: { color: ColorsEpico.ColorSecondary, border: `1px solid ${ColorsEpico.ColorSecondary}`, backgroundColor: ColorsEpico.ColorInfo },
  eta: { color: ColorsEpico.ColorPrimary, border: `1px solid ${ColorsEpico.ColorPrimary}`, backgroundColor: "#E8EFF5" },
};
export const EpicoLabel = ({ variant = "info", children, sx }: { variant?: keyof typeof LABEL_VARIANTS; children: React.ReactNode; sx?: SxProps }) => (
  <Box sx={{ ...LABEL_VARIANTS[variant], borderRadius: "3px", py: 0.1, px: 1.5, display: "inline-block", lineHeight: "normal", ...sx } as SxProps}>
    <Typography variant="body2" component="span" sx={{ fontWeight: FontWeightEnum.Medium, fontSize: FontSizesEnum.Epsilon }}>{children}</Typography>
  </Box>
);

export const statusVariant = (status: string): keyof typeof LABEL_VARIANTS =>
  status === "Check-out realizado" ? "success" : status === "Check-in activo" ? "warning" : status === "Cancelada" ? "error" : status.startsWith("Cierre") ? "eta" : "info";

/** Texto auxiliar en itálica, como las notas del simulador. */
export const Hint = ({ children, sx }: { children: React.ReactNode; sx?: SxProps }) => (
  <Typography sx={{ fontSize: FontSizesEnum.Omega, fontStyle: "italic", color: ColorsEpico.ColorBlack60, ...sx } as SxProps}>{children}</Typography>
);

export const SectionTitle = ({ children, sx }: { children: React.ReactNode; sx?: SxProps }) => (
  <Typography sx={{ fontSize: FontSizesEnum.Gamma, fontWeight: FontWeightEnum.Bold, color: ColorsEpico.ColorDarkCharcoal, ...sx } as SxProps}>{children}</Typography>
);

/**
 * Marca visual de "hueco": componente que NO existe hoy en Épico (ni en MUI core).
 * Se activa/desactiva con el interruptor flotante de la página.
 */
export const GapMarker = ({ label, children, sx, kind = "gap", placement = "top" }: { label: string; children: React.ReactNode; sx?: SxProps; kind?: "gap" | "sim"; placement?: "top" | "bottom" }) => {
  const { showGaps } = useAgenda();
  const color = kind === "gap" ? ColorsEpico.ColorBrightOrange : ColorsEpico.ColorPurple;
  return (
    <Box sx={{ position: "relative", ...(showGaps && { outline: `2px dashed ${color}`, outlineOffset: kind === "gap" ? "-2px" : "2px", borderRadius: "4px" }), ...sx } as SxProps}>
      {showGaps && (
        <Chip
          size="small"
          label={label}
          sx={{
            position: { xs: "static", md: "absolute" }, display: { xs: "flex", md: "inline-flex" }, width: { xs: "fit-content", md: "auto" }, mb: { xs: 1, md: 0 },
            ...(placement === "top" ? { top: 6 } : { bottom: 6 }), right: 6, zIndex: 3, maxWidth: { xs: "100%", md: "calc(100% - 12px)" }, height: "auto", py: 0.4,
            bgcolor: color, color: ColorsEpico.ColorWhite, fontWeight: FontWeightEnum.Medium, fontSize: FontSizesEnum.Omega, pointerEvents: "none", "& .MuiChip-label": { whiteSpace: "normal", lineHeight: 1.3 },
          }}
        />
      )}
      {children}
    </Box>
  );
};
