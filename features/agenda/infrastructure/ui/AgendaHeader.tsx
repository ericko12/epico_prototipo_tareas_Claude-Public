"use client";
import { useState } from "react";
import { Box, Button, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { Add, ArrowDropDown, BoltOutlined, EventOutlined } from "@mui/icons-material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { useAgenda } from "@/features/agenda/application/AgendaContext";

export const AgendaHeader = () => {
  const { canEdit, openForm, selectedGridSlot } = useAgenda();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);
  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontSize: { xs: FontSizesEnum.Alpha, md: FontSizesEnum.Lambda }, fontWeight: FontWeightEnum.Bold, color: ColorsEpico.ColorDarkCharcoal }}>Agenda</Typography>
          <Typography sx={{ color: ColorsEpico.ColorBlack60, fontSize: FontSizesEnum.Delta }}>Planeación y seguimiento de visitas</Typography>
        </Box>
        {canEdit && (
          <>
            <Button variant="contained" startIcon={<Add />} endIcon={<ArrowDropDown />} onClick={(e) => setAnchor(e.currentTarget)} sx={{ fontWeight: FontWeightEnum.Medium, borderRadius: "4px", minHeight: 38 }}>
              Crear
            </Button>
            <Menu anchorEl={anchor} open={!!anchor} onClose={close} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} slotProps={{ paper: { sx: { minWidth: 220 } } }}>
              <MenuItem onClick={() => { close(); openForm({ ...(selectedGridSlot ? { date: selectedGridSlot.date, time: selectedGridSlot.time } : {}), creationMode: "event" }); }}><ListItemIcon><EventOutlined fontSize="small" /></ListItemIcon><ListItemText>Evento</ListItemText></MenuItem>
              <MenuItem onClick={() => { close(); openForm({ ...(selectedGridSlot ? { date: selectedGridSlot.date, time: selectedGridSlot.time } : {}), creationMode: "unplanned", startAfterCreate: true, title: "Crear visita no planeada" }); }}><ListItemIcon><BoltOutlined fontSize="small" /></ListItemIcon><ListItemText>Visita no planeada</ListItemText></MenuItem>
            </Menu>
          </>
        )}
      </Stack>
    </>
  );
};
