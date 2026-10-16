"use client";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { CalendarMonth, ConstructionOutlined } from "@mui/icons-material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { useSetBreadcrumb } from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";
import { PATH_PAGE } from "@/routes/paths";
import ClientesDemo from "@/features/clientes/ClientesDemo";

export const ModulePlaceholder = ({ label, parent }: { label: string; parent: string }) => {
  useSetBreadcrumb(parent === label ? [label] : [parent, label]);
  const router = useRouter();
  if (label === "Listado de clientes" || label === "Clientes") return <ClientesDemo/>;
  return (
    <Box sx={{ minHeight: "calc(100vh - 140px)", display: "grid", placeItems: "center", p: 3, textAlign: "center" }}>
      <Box>
        <ConstructionOutlined sx={{ fontSize: 56, color: ColorsEpico.ColorPrimaryDisabled }} />
        <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>{label}</Typography>
        <Typography color={ColorsEpico.ColorBlack60} sx={{ mt: 0.5, maxWidth: 420 }}>
          Este módulo existe en Épico, pero no forma parte de la versión sintética. El prototipo solo incluye el shell y el módulo de Agenda.
        </Typography>
        <Button variant="contained" startIcon={<CalendarMonth />} sx={{ mt: 2 }} onClick={() => router.push(PATH_PAGE.agenda.root)}>Ir a Agenda</Button>
      </Box>
    </Box>
  );
};
