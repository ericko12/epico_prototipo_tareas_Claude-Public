"use client";
// Basado en features/layoutMain/infrastructure/ui/sideMenu/MenuItems.tsx (+ MenuItems.styles.ts).
// Se conservan estilos, tooltip con sub-items en modo colapsado y Collapse en modo abierto.
// Se omiten permisos por rol, validación de token y rutas protegidas.
import { Fragment, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Chip, Collapse, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip, tooltipClasses } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontSizesEnum } from "@/features/common/domain/enums/FontSizes";
import { IMenuItem } from "@/features/layoutMain/domain/data/menuItems.data";

const tooltipSx = (hasSubItems: boolean) => ({
  [`&.${tooltipClasses.popper}[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]: {
    marginLeft: "-5px",
    backgroundColor: hasSubItems ? ColorsEpico.ColorWhite : undefined,
    color: hasSubItems ? ColorsEpico.ColorBlack : undefined,
    boxShadow: 5,
    borderRadius: "0.5rem",
    fontSize: FontSizesEnum.Epsilon,
  },
});
const listItemIconSx = (sel: boolean) => ({ height: "25px", placeContent: "center", color: sel ? ColorsEpico.ColorWhite : ColorsEpico.ColorMenuWhite });
const listItemTextSx = (sel: boolean) => ({ margin: "5px 0 0 0 !important", color: sel ? ColorsEpico.ColorWhite : ColorsEpico.ColorMenuWhite, height: "25px" });
const subItemSx = (sel: boolean) => ({
  backgroundColor: !sel ? ColorsEpico.ColorSubmenuBlue : ColorsEpico.ColorPrimary,
  borderColor: ColorsEpico.ColorSubmenuBlue,
  "&:hover": { backgroundColor: ColorsEpico.ColorBrightBlue5 },
});
const subItemTextSx = (sel: boolean) => ({ color: sel ? ColorsEpico.ColorWhite : ColorsEpico.ColorMenuWhite });
const newChip = <Chip label="Nuevo" size="small" sx={{ ml: 1, height: 18, fontSize: 10, fontWeight: 700, bgcolor: ColorsEpico.ColorSecondary, color: ColorsEpico.ColorWhite }} />;

export const MenuItems = ({ isDrawerOpen, items, onNavigate }: { isDrawerOpen: boolean; items: IMenuItem[]; onNavigate?: () => void }) => {
  const pathname = (usePathname() || "/").replace(/\/$/, "");
  const router = useRouter();
  const [openSubItems, setOpenSubItems] = useState<Record<string, boolean>>({ "6": true });
  const [tooltipFor, setTooltipFor] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSel = (route: string) => pathname === route;
  const go = (route: string) => { setTooltipFor(null); onNavigate?.(); router.push(route); };

  return (
    <>
      {items.map((item) => {
        const hasSub = !!item.subItems?.length;
        const selected = isSel(item.route) || !!item.subItems?.some((s) => isSel(s.route));
        const Icon = item.icon;
        return (
          <Fragment key={item.key}>
            <Tooltip
              disableFocusListener
              placement="right-start"
              slotProps={{ popper: { sx: tooltipSx(hasSub) } }}
              open={!isDrawerOpen && tooltipFor === item.label}
              title={!isDrawerOpen && (hasSub ? (
                <List disablePadding>
                  {item.subItems!.map((s) => (
                    <ListItem key={s.key} disablePadding>
                      <ListItemButton
                        selected={isSel(s.route)}
                        onClick={() => go(s.route)}
                        onMouseEnter={() => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } setTooltipFor(item.label); }}
                        onMouseLeave={() => setTooltipFor(null)}
                      >
                        <ListItemText primary={s.label} primaryTypographyProps={{ fontSize: FontSizesEnum.Delta }} />
                        {s.isNew && newChip}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              ) : item.label)}
            >
              <ListItem disablePadding>
                <ListItemButton
                  selected={selected}
                  onClick={() => {
                    if (hasSub && isDrawerOpen) setOpenSubItems((p) => ({ ...p, [item.key]: !p[item.key] }));
                    else if (!hasSub) go(item.route);
                    if (!isDrawerOpen) setTooltipFor(item.label);
                  }}
                  onMouseEnter={() => { if (timer.current) { clearTimeout(timer.current); timer.current = null; } if (!isDrawerOpen) setTooltipFor(item.label); }}
                  onMouseLeave={() => { if (!timer.current) timer.current = setTimeout(() => { setTooltipFor(null); timer.current = null; }, 100); }}
                >
                  <ListItemIcon sx={listItemIconSx(selected)}><Icon fontSize="small" /></ListItemIcon>
                  {isDrawerOpen && (
                    <>
                      <ListItemText primary={item.label} sx={listItemTextSx(selected)} />
                      {hasSub && (openSubItems[item.key] ? <ExpandLess /> : <ExpandMore />)}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
            {hasSub && isDrawerOpen && (
              <Collapse in={openSubItems[item.key]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.subItems!.map((s) => (
                    <ListItem key={s.key} disablePadding sx={subItemSx(isSel(s.route))}>
                      <ListItemButton selected={isSel(s.route)} onClick={() => go(s.route)} sx={{ pl: 8 }}>
                        <ListItemText primary={s.label} sx={subItemTextSx(isSel(s.route))} />
                        {s.isNew && newChip}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Fragment>
        );
      })}
    </>
  );
};
