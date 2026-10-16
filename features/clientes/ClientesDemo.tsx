"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Alert,Box,Button,Card,CardContent,Chip,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Grid2 as Grid,Paper,Stack,Tab,Tabs,TextField,Typography,FormControl,InputLabel,Select,MenuItem,RadioGroup,FormControlLabel,Radio,Snackbar} from "@mui/material";
import {Add,ArrowBack,AssignmentOutlined,CalendarMonth,CheckCircle,LocationOn,Search,Visibility,PlayArrow,StopCircle} from "@mui/icons-material";
import {useSetBreadcrumb} from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";
type Client={id:string;name:string;rfc:string;phone:string;email:string;branch:string;seller:string;region:string;division:string;segment:string;address:string};
const clients:Client[]=[
{id:"131",name:"ANDRADE AVIÑA JESUS",rfc:"AAAJ6109236C7",phone:"333314502303",email:"jesusandradejaa23@hotmail.com",branch:"Tesistan",seller:"ALEMAN PADILLA MIGUEL AN...",region:"Política Comercial 2022",division:"Refaccionaria",segment:"Menudeo",address:"Tesistán, Zapopan, Jalisco"},
{id:"207",name:"REFACCIONARIA DEL BAJÍO",rfc:"RBA090525XXX",phone:"4422221100",email:"contacto@ejemplo.com",branch:"Querétaro",seller:"LUIS GALVÁN",region:"Centro",division:"Refaccionaria",segment:"Mayoreo",address:"Av. Constituyentes, Querétaro"},
{id:"315",name:"TALLER SAN JOSÉ",rfc:"TSJ100201XXX",phone:"3331234567",email:"taller@ejemplo.com",branch:"Guadalajara",seller:"YURIDIA TORRES",region:"Occidente",division:"Taller",segment:"Menudeo",address:"Col. Centro, Guadalajara"}];
export default function ClientesDemo(){
const router=useRouter();
const [detail,setDetail]=useState<Client|null>(null),[search,setSearch]=useState(""),[tab,setTab]=useState(0),[visitOpen,setVisitOpen]=useState(false),[visitChoice,setVisitChoice]=useState("programada"),[activeVisit,setActiveVisit]=useState(false),[visitFinished,setVisitFinished]=useState(false),[taskOpen,setTaskOpen]=useState(false),[taskSubject,setTaskSubject]=useState(""),[taskDue,setTaskDue]=useState(""),[notice,setNotice]=useState("");
useSetBreadcrumb(detail?["Clientes","Listado de clientes","Detalle"]:["Clientes","Listado de clientes"]);
const client=detail;
const visits=client?[{id:"VIS-131-01",label:"Visita programada · Hoy, 11:00 a. m.",date:"Hoy"},{id:"VIS-131-02",label:"Visita programada · Mañana, 10:00 a. m.",date:"Mañana"}]:[];
return <Box sx={{p:{xs:2,md:3},pb:11}}>
<Alert severity="info" sx={{mb:2}}><b>SIMULADOR DE CLIENTES.</b> Réplica visual de referencia, datos ficticios; no modifica Épico. Las visitas y tareas son escenarios para validar con negocio.</Alert>
{!client?<><Typography variant="h5" fontWeight={700} sx={{mb:2}}>Listado de clientes</Typography>
<Paper variant="outlined" sx={{p:2,mb:2}}><Stack direction={{xs:"column",sm:"row"}} spacing={2}>
<TextField fullWidth size="small" label="Buscar por ID, nombre, RFC, vendedor o dirección" value={search} onChange={e=>setSearch(e.target.value)} InputProps={{startAdornment:<Search sx={{mr:1}}/>}}/>
<Button variant="outlined" onClick={()=>setSearch("131")}>Buscar ID 131</Button></Stack></Paper>
<Stack spacing={1.5}>{clients.filter(c=>[c.id,c.name,c.rfc,c.branch,c.seller,c.address].join(" ").toLowerCase().includes(search.toLowerCase())).map(c=><Card key={c.id} variant="outlined"><CardContent><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} spacing={2}><Box><Typography color="primary" fontWeight={700}>ID {c.id} · {c.name}</Typography><Typography variant="body2" color="text.secondary">{c.branch} · {c.address}</Typography><Typography variant="body2">Vendedor: {c.seller}</Typography></Box><Button variant="contained" startIcon={<Visibility/>} onClick={()=>{setDetail(c);setTab(0);setVisitFinished(false);setActiveVisit(false)}}>Ver detalle</Button></Stack></CardContent></Card>)}</Stack>
</>:<>
<Button startIcon={<ArrowBack/>} onClick={()=>{setDetail(null);setVisitOpen(false);setTaskOpen(false)}} sx={{mb:2}}>Listado de clientes</Button>
<Paper variant="outlined" sx={{mb:2,p:2,minHeight:100}}><Button variant="outlined" sx={{minWidth:220,minHeight:70}}>NUEVA CAJA　＋</Button></Paper>
<Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{mb:2,borderBottom:1,borderColor:"divider"}}><Tab label="INFORMACIÓN GENERAL"/><Tab label="RADIOGRAFÍA DEL CLIENTE"/></Tabs>
{tab===0?<><Paper variant="outlined" sx={{p:2,mb:2}}>
<Stack direction={{xs:"column",md:"row"}} spacing={2} alignItems={{md:"center"}} justifyContent="space-between">
<Box sx={{flex:1,minWidth:200}}><Typography fontWeight={700}>ID {client.id}</Typography><Typography variant="h6" fontWeight={700}>{client.name}</Typography><Typography variant="body2" color="text.secondary">CONTACTO: 1 - {client.name}</Typography></Box>
<Stack direction="row" spacing={1} sx={{flexWrap:"wrap"}}><Chip label={client.phone}/><Chip label={client.email}/></Stack>
</Stack>
<Divider sx={{my:2}}/>
<Box sx={{border:"2px dashed",borderColor:"primary.main",borderRadius:1,p:2,backgroundColor:"rgba(31,64,150,.03)"}}>
<Typography variant="caption" color="primary" fontWeight={700}>ACCIONES COMERCIALES · PROPUESTA UX EN ZONA INDICADA</Typography>
<Stack direction={{xs:"column",sm:"row"}} spacing={1} sx={{mt:1}}>
<Button variant="outlined" startIcon={<AssignmentOutlined/>} onClick={()=>setTaskOpen(true)}>Crear tarea</Button>
{!activeVisit?<Button variant="contained" startIcon={<PlayArrow/>} onClick={()=>setVisitOpen(true)}>Iniciar visita</Button>:<Button color="warning" variant="contained" startIcon={<StopCircle/>} onClick={()=>setVisitOpen(true)}>Cerrar visita</Button>}
<Button variant="text" startIcon={<CalendarMonth/>} onClick={()=>router.push("/Agenda")}>Ver Agenda</Button>
</Stack></Box>
</Paper>
<Grid container spacing={2} sx={{mb:2}}>{[["RFC",client.rfc],["FECHA DE ALTA","19 diciembre 2013"],["SUCURSAL ASIGNADA",client.branch],["DIVISIÓN",client.division],["SEGMENTO",client.segment],["ÚLTIMO PEDIDO","$166.18"],["PRONTO PAGO","10% Nota de Crédito"],["VENDEDOR ASIGNADO",client.seller],["REGIÓN",client.region],["LISTA DE PRECIOS","Distribuidor"],["LISTA P. PERSONALIZADA","No"],["LISTA NEGRA SMC","No"],["PORTAFOLIO","NO"]].map(([k,v])=><Grid key={k} size={{xs:12,sm:6,md:3}}><Paper variant="outlined" sx={{p:1.75,minHeight:84,borderRadius:2}}><Typography fontWeight={700} fontSize={13}>{k}</Typography><Typography variant="body2" sx={{mt:.8}}>{v}</Typography></Paper></Grid>)}</Grid>
<Paper variant="outlined" sx={{p:2}}><Typography variant="h6" fontWeight={700}>Direcciones del cliente</Typography><Typography variant="body2" color="text.secondary" sx={{mb:1}}>Relación de dirección separada del cliente, conforme a Discovery.</Typography><Stack direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} justifyContent="space-between" gap={1}><Typography><LocationOn fontSize="small" sx={{verticalAlign:"middle"}}/> {client.address}</Typography><Button onClick={()=>setTaskOpen(true)}>Crear tarea desde dirección (simulación)</Button></Stack></Paper>
</>:<Paper variant="outlined" sx={{p:3}}><Typography fontWeight={700}>Radiografía del cliente</Typography><Typography color="text.secondary">Vista de referencia. Los indicadores y expedientes reales no están conectados.</Typography></Paper>}
</>}
<Dialog open={taskOpen} onClose={()=>setTaskOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Crear tarea desde cliente</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}><Alert severity="info">Relación precargada: Cliente ID {client?.id} · {client?.name}. En este flujo permanece fija.</Alert><TextField label="Asunto" required value={taskSubject} onChange={e=>setTaskSubject(e.target.value)}/><TextField label="Vencimiento" type="date" InputLabelProps={{shrink:true}} value={taskDue} onChange={e=>setTaskDue(e.target.value)}/><TextField label="Asignado a" value="Asesor responsable (simulado)" disabled/><Typography variant="caption" color="text.secondary">La creación desde el cliente se representa aquí para evaluar el acceso; no guarda en backend ni en el módulo de Tareas.</Typography></Stack></DialogContent><DialogActions><Button onClick={()=>setTaskOpen(false)}>Cancelar</Button><Button variant="contained" onClick={()=>{if(!taskSubject.trim()||!taskDue){setNotice("Completa asunto y vencimiento.");return}setTaskOpen(false);setTaskSubject("");setTaskDue("");setNotice("Creación de tarea simulada; asociación al cliente precargada.")}}>Simular creación</Button></DialogActions></Dialog>
<Dialog open={visitOpen} onClose={()=>setVisitOpen(false)} fullWidth maxWidth="sm">
<DialogTitle>{activeVisit?"Cerrar visita":"Iniciar visita"}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
<Alert severity="info">{client?.name} · ID {client?.id}. Este flujo muestra alternativas funcionales y no registra una visita real.</Alert>
{!activeVisit?<><Typography fontWeight={700}>¿Cómo quieres iniciar esta visita?</Typography><RadioGroup value={visitChoice} onChange={e=>setVisitChoice(e.target.value)}><FormControlLabel value="programada" control={<Radio/>} label="Utilizar una visita programada"/><FormControlLabel value="espontanea" control={<Radio/>} label="Registrar visita espontánea"/></RadioGroup>
{visitChoice==="programada"&&<FormControl fullWidth><InputLabel>Visita programada</InputLabel><Select label="Visita programada" defaultValue="VIS-131-01">{visits.map(v=><MenuItem value={v.id} key={v.id}>{v.label}</MenuItem>)}</Select></FormControl>}
<Typography variant="caption" color="text.secondary">Pendiente con negocio/Arquitectura: identificar y vincular la visita programada correcta sin duplicar ejecución ni afectar métricas.</Typography></>:<><Typography>La visita permanece abierta hasta confirmar su cierre.</Typography><TextField label="Resultado / observaciones (simulación)" multiline minRows={3}/><Typography variant="caption" color="text.secondary">La generación de tareas por acuerdos queda pendiente de aprobación de alcance.</Typography></>}
</Stack></DialogContent><DialogActions><Button onClick={()=>setVisitOpen(false)}>Cancelar</Button><Button variant="contained" onClick={()=>{setActiveVisit(!activeVisit);setVisitFinished(activeVisit);setVisitOpen(false);setNotice(activeVisit?"Visita cerrada en el simulador.":"Visita iniciada en el simulador.")}}>{activeVisit?"Simular Check-out":"Simular Check-in"}</Button></DialogActions></Dialog>
<Snackbar open={!!notice} autoHideDuration={4500} onClose={()=>setNotice("")} message={notice}/>
</Box>;
}