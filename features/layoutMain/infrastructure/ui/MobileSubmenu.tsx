"use client";
// Basado en mobileSubmenu/MobileSubmenu.tsx (+ styles). Se priorizan Agenda y Tareas en los cinco accesos; Cajas continúa en el menú lateral.
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { Assignment, CalendarMonth, Inventory, LocalShipping, Scanner } from "@mui/icons-material";
import { usePathname, useRouter } from "next/navigation";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { PATH_PAGE } from "@/routes/paths";

export const MobileSubmenu = () => {
  const router = useRouter();
  const pathname = (usePathname() || "/").replace(/\/$/, "");
  return (
    <Paper elevation={3} sx={{ display: { xs: "block", md: "none" }, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1000, borderTop: `1px solid ${ColorsEpico.ColorSkyBlue}`, backgroundColor: ColorsEpico.ColorWhite, boxShadow: "0px -2px 8px rgba(0, 0, 0, 0.1)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <BottomNavigation
        value={pathname}
        onChange={(_, v) => router.push(v)}
        showLabels
        sx={{
          padding: "0 4px", backgroundColor: "transparent",
          "& .MuiBottomNavigationAction-root": {
            color: ColorsEpico.ColorSecondaryDisabled, minWidth: 0, px: "2px",
            "&.Mui-selected": { color: ColorsEpico.ColorBlack },
            "& .MuiBottomNavigationAction-label": { fontSize: "0.75rem", fontWeight: 500, opacity: 1 },
          },
        }}
      >
        <BottomNavigationAction label="Catálogo" value={PATH_PAGE.modulo("catalogo")} icon={<Inventory />} />
        <BottomNavigationAction label="Pedido" value={PATH_PAGE.modulo("monitoreo-pedidos")} icon={<LocalShipping />} />
        <BottomNavigationAction label="Agenda" value={PATH_PAGE.agenda.root} icon={<CalendarMonth />} />
        <BottomNavigationAction label="Tareas" value="/Tareas" icon={<Assignment />} />
        <BottomNavigationAction label="Digitalizar" value={PATH_PAGE.modulo("digitalizar")} icon={<Scanner />} />
      </BottomNavigation>
    </Paper>
  );
};
