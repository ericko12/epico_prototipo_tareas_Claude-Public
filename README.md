# Épico Móvil · versión sintética + módulo Agenda V8.2

Prototipo navegable que reproduce el **shell real de Épico Móvil** (tema MUI, menú lateral, AppBar con breadcrumbs, navegación inferior en móvil) con **datos dummy**, sin login ni backend, e integra el **Simulador de Agenda V8.2** portado a componentes MUI.

## Cómo verlo
- **GitHub Pages automático:** al hacer push a `main`, `.github/workflows/deploy.yml` compila y publica. Solo activa *Settings → Pages → Source: GitHub Actions*.
- Hallazgos completos y decisiones pendientes: [`docs/HALLAZGOS.md`](docs/HALLAZGOS.md).
- **Compilar a mano:** `npm install && npm run build` genera `out/` (sitio estático; se ve con `npx serve out`).
  - Si lo publicas en un subdirectorio (p. ej. `usuario.github.io/epico-sintetico`), compila con `NEXT_PUBLIC_BASE_PATH=/epico-sintetico npm run build`.
- **Desarrollo:** `npm install` → `npm run dev` → http://localhost:3000/Agenda

## Qué se tomó del código real de Épico (zip `epico-movil-release-migracion-salesforce`)
| Pieza | Origen |
|---|---|
| Tema MUI (paleta, Quicksand, overrides de Tabs/Button/Inputs/Dialog/Breadcrumbs, breakpoints) | `config/theme/muiTheme.ts` (copia; fuente local en vez de `next/font`) |
| Colores, pesos y tamaños de fuente | `features/common/domain/enums/{ColorsEpico,FontWeight,FontSizes}.ts` (copia literal) |
| Drawer 88/300 px, AppBar, layout responsivo (md = 900 px) | `app/(epico)/layout.tsx`, `navbar/NavBarContent*` |
| Menú lateral (tooltips en modo colapsado, Collapse en abierto) | `sideMenu/MenuItems.tsx` + `menuItems.data.ts` |
| Navegación inferior móvil | `mobileSubmenu/MobileSubmenu.tsx` (+ acceso a Agenda) |
| Estructura de diálogos (título en mayúsculas, cerrar outlined, acción contained) | `dialog/ModalGeneric.tsx` |
| Etiquetas de estado | `label/Label.tsx` |
| Logo / ícono Apymsa | `public/img/logoApymsa.webp`, `public/Icons/ApymsaIcon.tsx` |

## Dónde vive la Agenda
`features/agenda/` siguiendo la arquitectura de Épico (`domain` / `application` / `infrastructure/ui`).
Ruta: `/Agenda` (ya existía `PATH_PAGE.agenda.root` en Épico). Menú: **Rutas + Agenda → Agenda**.

## Huecos marcados en pantalla (interruptor "Marcar huecos")
- 🟧 **Calendario Día/Semana/Mes** — no existe en Épico ni en MUI core. Decisión de Arquitectura: librería o desarrollo propio.
- 🟧 **Arrastrar cliente al calendario** — patrón nuevo en Épico.
- 🟧 **Ruta sugerida** — no existe motor de rutas. El mapa sí existe (Épico ya usa Google Maps vía `@vis.gl/react-google-maps`).
- 🟪 **Control de simulación** — solo para probar roles/escenarios; no es parte del producto.

Todo lo demás (Tabs, Menu, Accordion, Dialog, Alert, Snackbar, Card, Checkbox, Select, Chip) ya se usa en Épico.

## Diferencias con el simulador HTML
- `prompt()` y `alert()` se reemplazaron por diálogo con motivo obligatorio y Snackbar.
- Las ausencias (vacaciones) se pintan como franja de fondo en el día.
- La sincronización con la app móvil vía `localStorage` (epicoDiscoveryVisitState) no se portó.
- Estado en React Context; en Épico real iría en Redux Toolkit.
