"use client";
// Basado en navbar/NavBarContent.tsx + NavBarContent.styles.ts + UserNavBar.tsx (simplificado).
import { useState } from "react";
import { AppBar, Avatar, Box, Breadcrumbs, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Toolbar, Tooltip, Typography } from "@mui/material";
import { Logout, MenuOpenOutlined, MenuOutlined, Notifications } from "@mui/icons-material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useBreadcrumbs } from "./BreadcrumbContext";
import { DRAWER } from "./drawer";

export const DUMMY_USER = { name: "Luis Galvan", position: "Gestor de equipo · DUMMY", initials: "LG" };

export const NavBarContent = ({ isDrawerOpen, toggleDrawer, isMobile }: { isDrawerOpen: boolean; toggleDrawer: () => void; isMobile: boolean }) => {
  const crumbs = useBreadcrumbs();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <AppBar
      position="fixed"
      sx={{
        transition: "width 0.3s",
        backgroundColor: ColorsEpico.ColorWhite,
        boxShadow: "none",
        borderBottom: `1px ${ColorsEpico.ColorSkyBlue} solid`,
        width: { xs: "100%", md: `calc(100% - ${isDrawerOpen ? DRAWER.open : DRAWER.closed}px)` },
      }}
    >
      <Toolbar>
        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
          <Stack direction="row" alignItems="center" sx={{ overflow: "hidden", flex: 1 }}>
            <IconButton onClick={toggleDrawer} aria-label="Menú">
              {isDrawerOpen ? <MenuOpenOutlined sx={{ color: ColorsEpico.ColorPrimary }} /> : <MenuOutlined sx={{ color: ColorsEpico.ColorPrimary }} />}
            </IconButton>
            <Box sx={{ overflowX: "auto", flex: 1, minWidth: 0, scrollbarWidth: "none" }}>
              <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: "1rem", ml: "0.7rem", "& ol": { flexWrap: "nowrap" }, "& .MuiBreadcrumbs-separator": { color: ColorsEpico.ColorBlack60 } }}>
                {crumbs.map((c, i) => (
                  <Typography key={i} sx={{ fontSize: FontSizesEnum.Gamma, fontWeight: FontWeightEnum.Regular, whiteSpace: "nowrap", color: i === crumbs.length - 1 ? ColorsEpico.ColorPrimary : ColorsEpico.ColorBlack60 }}>{c}</Typography>
                ))}
              </Breadcrumbs>
            </Box>
          </Stack>
          {isMobile ? (
            <Tooltip title="Más opciones">
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5, minWidth: 44, minHeight: 44 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{DUMMY_USER.initials}</Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mr: "1.6rem", ml: "1.1rem" }}>
              <IconButton aria-label="Notificaciones"><Notifications sx={{ fontSize: 19, color: "black" }} /></IconButton>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: "pointer" }} onClick={(e) => setAnchor(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{DUMMY_USER.initials}</Avatar>
                <Box>
                  <Typography sx={{ color: ColorsEpico.ColorBlack, fontSize: FontSizesEnum.Delta, fontWeight: FontWeightEnum.Bold, lineHeight: 1.2 }}>{DUMMY_USER.name}</Typography>
                  <Typography sx={{ color: ColorsEpico.ColorBlack60, fontSize: FontSizesEnum.Epsilon, lineHeight: 1.2 }}>{DUMMY_USER.position}</Typography>
                </Box>
              </Stack>
            </Stack>
          )}
          <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} slotProps={{ paper: { sx: { minWidth: 240 } } }}>
            <Box sx={{ px: 2, py: 1 }}>
              <Typography fontWeight={FontWeightEnum.Bold} fontSize={FontSizesEnum.Delta}>{DUMMY_USER.name}</Typography>
              <Typography fontSize={FontSizesEnum.Epsilon} color={ColorsEpico.ColorBlack60}>{DUMMY_USER.position}</Typography>
            </Box>
            <Divider />
            <MenuItem disabled sx={{ minHeight: 44 }}>
              <ListItemIcon sx={{ minWidth: 36 }}><Logout sx={{ fontSize: 16 }} /></ListItemIcon>
              <ListItemText>Cerrar sesión (no aplica en prototipo)</ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
