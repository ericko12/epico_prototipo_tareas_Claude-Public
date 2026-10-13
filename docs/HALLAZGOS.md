# Hallazgos · Integración de Agenda V8.2 en Épico Móvil (9-oct-2026)

## 1. Stack real de Épico Móvil
- Next.js 15.5.6 + React 19.2 + MUI 6 (Emotion). Clases `css-xxxx` generadas en runtime → **no se puede copiar el CSS**; hay que usar el tema (`config/theme/muiTheme.ts`) y los componentes MUI.
- También en dependencias: `@mui/x-date-pickers`, `@mui/x-data-grid`, `@vis.gl/react-google-maps` (mapas), `react-draggable`, Redux Toolkit, Formik.
- Breakpoint de experiencia móvil: `md` = 900 px. Drawer permanente 88 px (cerrado) / 300 px (abierto) en escritorio; Drawer temporal + BottomNavigation en móvil.

## 2. Tokens de diseño (fuente: `ColorsEpico.ts`, `FontWeight.ts`, `FontSizes.ts`)
| Token | Valor |
|---|---|
| Primario | `#1B3892` (menú lateral, botones contained, breadcrumb activo) |
| Secundario | `#1E88E5` (focus de inputs, info) |
| Azul botones en Clientes | `#1677FF` (`ColorDodgerBlue`, override local — **no** es el primario) |
| Texto oscuro | `#1A202C` · texto secundario `#00000099` |
| Bordes | `#E2E8F0`, `#CBD5E0` · AppBar borde `#EDF2F7` |
| Estados | success `#43A047/#E8F5E9` · warning `#FF8F00/#FFF8E1` · error `#E53935/#FFEBEE` · info `#1E88E5/#E3F2FD` |
| Tipografía | Quicksand 300–700; pesos 500 regular, 600 medium, 700 bold |
| Diálogos | radio 8 px, título en MAYÚSCULAS, botón cerrar outlined + acción contained (`ModalGeneric`) |

## 3. Correcciones a la primera revisión (hecha solo sobre la vista móvil)
- El primario es `#1B3892`, no `#1677FF`.
- El **menú lateral (rail) del simulador NO es un hueco**: Épico ya lo tiene en escritorio, mismo ancho (88 px) y mismo azul.
- El **mapa no es un hueco**: Épico ya usa Google Maps. Lo que falta es el motor de rutas.

## 4. Huecos reales (componentes que no existen en Épico)
| Hueco | Comentario | Decide |
|---|---|---|
| Calendario Día/Semana/Mes | No existe en Épico ni en MUI core. Opciones: librería (FullCalendar, MUI X Scheduler) o desarrollo propio. | Arquitectura |
| Arrastrar cliente al calendario | Patrón nuevo. Épico ya trae `react-draggable` (hoy solo para modales). | Arquitectura / UX |
| Ruta sugerida | Falta motor de optimización de rutas; el mapa sí existe. | Arquitectura + negocio (costo API) |

Todo lo demás de la Agenda ya existe en Épico: Tabs, Menu, Accordion, Dialog, Alert, Snackbar, Card, Checkbox, Select/TextField, Chip, Label.

## 5. Cómo quedó integrado
- Ruta `/Agenda` (ya existía `PATH_PAGE.agenda.root`). Menú: **Rutas + Agenda → Agenda** (etiqueta "Nuevo") y acceso en la barra inferior móvil.
- Código en `features/agenda/{domain,application,infrastructure/ui}` siguiendo la arquitectura de Épico.
- Estado en React Context (en Épico real iría en Redux Toolkit).
- Diferencias vs. el HTML V8.2: `prompt()`/`alert()` → diálogo con motivo obligatorio + Snackbar; ausencias como franja de fondo; no se portó la sincronización con la app móvil por `localStorage`.

## 6. Avisos
- **Seguridad:** `next@15.5.6` (la versión del repo de Épico) tiene una vulnerabilidad publicada (CVE-2025-66478). No afecta este prototipo (sitio estático), pero el equipo de Épico debería actualizar.
- **Confidencialidad:** el ZIP original de Épico trae archivos `.env` (`enviroments/`); no se copiaron aquí. Este proyecto incluye copia del tema, enums de color y logo de Apymsa: valorar si el repo debe ser privado.
- La versión sintética no tiene login, permisos, backend ni datos reales; todo es DUMMY.
