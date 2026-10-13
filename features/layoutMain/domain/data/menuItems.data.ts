// Basado en features/layoutMain/domain/data/menuItems.data.ts de Épico Móvil.
// Mismas etiquetas, iconos y orden. En la versión sintética:
//  - no hay permisos por rol (se muestran todos los módulos de escritorio);
//  - "Rutas + Agenda" incorpora el sub-item "Agenda" (módulo integrado);
//  - el resto de las rutas apunta a una pantalla "no incluida en el prototipo".
import type { SvgIconComponent } from "@mui/icons-material";
import GroupIcon from "@mui/icons-material/Group";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import NearMeIcon from "@mui/icons-material/NearMe";
import PaidIcon from "@mui/icons-material/Paid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import SettingsIcon from "@mui/icons-material/Settings";
import ScannerIcon from "@mui/icons-material/Scanner";
import PieChartIcon from "@mui/icons-material/PieChart";
import { PATH_PAGE } from "@/routes/paths";

export interface IMenuSubItem { key: string; label: string; route: string; isNew?: boolean }
export interface IMenuItem { key: string; label: string; icon: SvgIconComponent; route: string; subItems?: IMenuSubItem[] }

const m = PATH_PAGE.modulo;

export const menuItems: IMenuItem[] = [
  { key: "1", label: "Clientes", icon: GroupIcon, route: m("clientes"), subItems: [
    { key: "1-1", label: "Listado de clientes", route: m("clientes") },
    { key: "1-2", label: "Parque vehicular", route: m("parque-vehicular") },
    { key: "1-36", label: "Alta de clientes", route: m("alta-clientes") },
    { key: "1-46", label: "Alta Premia Expertos", route: m("premia-expertos") },
  ]},
  { key: "2", label: "Prospectos", icon: AccountCircleIcon, route: m("prospectos"), subItems: [
    { key: "2-3", label: "Listado de prospectos", route: m("prospectos") },
    { key: "2-4", label: "Nuevo prospecto", route: m("nuevo-prospecto") },
  ]},
  { key: "4", label: "Catálogo", icon: InventoryIcon, route: m("catalogo"), subItems: [
    { key: "4-29", label: "Catálogo", route: m("catalogo") },
    { key: "4-7", label: "Promociones", route: m("promociones") },
  ]},
  { key: "5", label: "Pedidos + cotizaciones", icon: LocalShippingIcon, route: m("pedidos"), subItems: [
    { key: "5-8", label: "Listado de pedidos", route: m("pedidos") },
    { key: "5-9", label: "Nuevo pedido", route: m("nuevo-pedido") },
    { key: "5-10", label: "Listado de cotizaciones", route: m("cotizaciones") },
    { key: "5-34", label: "Monitoreo de pedidos", route: m("monitoreo-pedidos") },
  ]},
  { key: "6", label: "Rutas + Agenda", icon: NearMeIcon, route: PATH_PAGE.agenda.root, subItems: [
    { key: "6-99", label: "Agenda", route: PATH_PAGE.agenda.root, isNew: true },
    { key: "6-11", label: "Listado de rutas", route: PATH_PAGE.agenda.listadoRuta },
    { key: "6-12", label: "Nueva ruta", route: PATH_PAGE.agenda.nuevaRuta },
  ]},
  { key: "7", label: "Historial de pagos", icon: PaidIcon, route: m("pagos"), subItems: [
    { key: "7-13", label: "Listado de pagos", route: m("pagos") },
  ]},
  { key: "8", label: "Crédito", icon: AccountBalanceWalletIcon, route: m("credito"), subItems: [
    { key: "8-14", label: "Listado de solicitudes", route: m("credito") },
    { key: "8-17", label: "Nueva solicitud de crédito", route: m("nueva-solicitud-credito") },
  ]},
  { key: "9", label: "Quejas y sugerencias", icon: MarkunreadMailboxIcon, route: m("quejas"), subItems: [
    { key: "9-21", label: "Listado de quejas/sugerencias", route: m("quejas") },
  ]},
  { key: "17", label: "Digitalizar entrega", icon: ScannerIcon, route: m("digitalizar"), subItems: [
    { key: "17-41", label: "Digitalizar entrega", route: m("digitalizar") },
  ]},
  { key: "10", label: "Búsqueda rápida", icon: ManageSearchIcon, route: m("busqueda"), subItems: [
    { key: "10-23", label: "Búsqueda rápida personal", route: m("busqueda") },
  ]},
  { key: "11", label: "Soporte", icon: SupportAgentIcon, route: m("soporte") },
  { key: "12", label: "Directorio", icon: ContactPageIcon, route: m("directorio") },
  { key: "16", label: "Mi desempeño", icon: PieChartIcon, route: m("desempeno"), subItems: [
    { key: "16-40", label: "Mi desempeño", route: m("desempeno") },
  ]},
  { key: "13", label: "Configuración", icon: SettingsIcon, route: m("configuracion"), subItems: [
    { key: "13-26", label: "Roles", route: m("roles") },
    { key: "13-27", label: "Usuarios", route: m("usuarios") },
  ]},
];

/** Rutas /Modulo/<clave> que se generan como páginas estáticas. */
export const moduleSlugs: { slug: string; label: string; parent: string }[] = menuItems.flatMap((item) => {
  const own = item.route.startsWith("/Modulo/") ? [{ slug: item.route.split("/")[2], label: item.label, parent: item.label }] : [];
  const subs = (item.subItems ?? []).filter((s) => s.route.startsWith("/Modulo/")).map((s) => ({ slug: s.route.split("/")[2], label: s.label, parent: item.label }));
  return [...subs, ...own];
}).filter((v, i, arr) => arr.findIndex((x) => x.slug === v.slug) === i);
