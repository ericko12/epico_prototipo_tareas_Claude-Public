"use client";
// Basado en app/(epico)/layout.tsx de Épico Móvil: Drawer permanente (88/300 px) en md+,
// Drawer temporal + BottomNavigation debajo de md. Sin login, permisos, notificaciones ni Freshchat.
import { useState } from "react";
import { Avatar, Box, Drawer, IconButton, List, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Close } from "@mui/icons-material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { menuItems } from "@/features/layoutMain/domain/data/menuItems.data";
import { MenuItems } from "@/features/layoutMain/infrastructure/ui/MenuItems";
import { DUMMY_USER, NavBarContent } from "@/features/layoutMain/infrastructure/ui/NavBarContent";
import { MobileSubmenu } from "@/features/layoutMain/infrastructure/ui/MobileSubmenu";
import { BreadcrumbProvider } from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";
import { DRAWER } from "@/features/layoutMain/infrastructure/ui/drawer";
import ApymsaIcon from "@/features/layoutMain/infrastructure/ui/ApymsaIcon";
import { AgendaProvider } from "@/features/agenda/application/AgendaContext";

import { TaskProvider } from "@/features/tareas/TaskContext";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <BreadcrumbProvider>
      <AgendaProvider><TaskProvider>
      <Box sx={{ display: "flex" }}>
        <NavBarContent isDrawerOpen={open} toggleDrawer={() => setOpen((p) => !p)} isMobile={isMobile} />
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? open : true}
          onClose={isMobile ? close : undefined}
          sx={{
            width: { xs: 0, md: open ? DRAWER.open : DRAWER.closed },
            flexShrink: 0,
            overflow: "hidden",
            "& .MuiDrawer-paper": {
              width: { xs: DRAWER.open, md: open ? DRAWER.open : DRAWER.closed },
              boxSizing: "border-box",
              backgroundColor: ColorsEpico.ColorPrimary,
              color: ColorsEpico.ColorMenuWhite,
              transition: "width 0.3s",
              overflowX: "hidden",
            },
          }}
        >
          {isMobile ? (
            <>
              <Box sx={{ position: "absolute", top: 0, right: 0, p: 1, zIndex: 1 }}>
                <IconButton onClick={close} sx={{ color: ColorsEpico.ColorMenuWhite, "&:hover": { backgroundColor: ColorsEpico.ColorMenuClose } }}><Close /></IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", p: 2, mt: 4 }}>
                <Avatar sx={{ width: 60, height: 60, mr: 2, border: `2px solid ${ColorsEpico.ColorMenuWhite}` }}>{DUMMY_USER.initials}</Avatar>
                <Box>
                  <Typography fontWeight={FontWeightEnum.Bold} fontSize={FontSizesEnum.Delta} color={ColorsEpico.ColorMenuWhite}>{DUMMY_USER.name}</Typography>
                  <Typography fontWeight={FontWeightEnum.Regular} fontSize={FontSizesEnum.Epsilon} color={ColorsEpico.ColorMenuWhite}>{DUMMY_USER.position}</Typography>
                </Box>
              </Box>
            </>
          ) : open ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`${base}/logoApymsa.webp`} alt="logotipo Apymsa" style={{ width: "65%", margin: "20px 0", alignSelf: "center" }} />
          ) : (
            <ApymsaIcon style={{ margin: "20px 0", alignSelf: "center" }} />
          )}
          <Box sx={{ overflowY: "auto", overflowX: "hidden" }}>
            <List sx={{ height: "auto", overflow: "hidden" }}>
              <MenuItems isDrawerOpen={isMobile ? true : open} items={menuItems} onNavigate={isMobile ? close : undefined} />
            </List>
          </Box>
        </Drawer>
        <Box
          sx={{
            minWidth: 0,
            position: { xs: "relative", md: "absolute" },
            top: { xs: "60px", md: "70px" },
            left: { xs: 0, md: `${open ? DRAWER.open : DRAWER.closed}px` },
            width: { xs: "100%", md: `calc(100% - ${open ? DRAWER.open : DRAWER.closed}px)` },
            transition: "left 0.3s, width 0.3s",
          }}
        >
          <Box component="main" sx={{ position: "relative", backgroundColor: ColorsEpico.ColorWhite, paddingBottom: { xs: "calc(70px + env(safe-area-inset-bottom))", md: 0 } }}>
            {children}
          </Box>
        </Box>
      </Box>
      <MobileSubmenu />
      </TaskProvider></AgendaProvider>
    </BreadcrumbProvider>
  );
}
