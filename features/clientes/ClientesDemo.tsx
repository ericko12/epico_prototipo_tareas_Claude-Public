"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {Alert,Box,Button,Card,CardContent,Chip,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Grid2 as Grid,Paper,Stack,Tab,Tabs,TextField,Typography,FormControl,InputLabel,Select,MenuItem,RadioGroup,FormControlLabel,Radio,Snackbar} from "@mui/material";
import {Add,ArrowBack,AssignmentOutlined,CalendarMonth,CheckCircle,LocationOn,Search,Visibility,PlayArrow,StopCircle,Phone,Email,Edit,Storefront,AttachMoney,AccountCircle,AccountBalance,Event,Inventory2,LocalOffer,Work} from "@mui/icons-material";
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
<Box sx={{mb:2,minHeight:145,p:2,border:"1px solid #e2e7ee",borderRadius:1}}><Button variant="outlined" sx={{width:280,minHeight:83,fontWeight:500}}>NUEVA CAJA　＋</Button></Box>
<Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{mb:0,borderBottom:1,borderColor:"divider","& .MuiTab-root":{fontWeight:600}}}><Tab label="INFORMACIÓN GENERAL"/><Tab label="RADIOGRAFÍA DEL CLIENTE"/></Tabs>
{tab===0?<>
<Box sx={{py:3,px:{xs:1,md:1.5},borderBottom:"1px solid #e2e7ee"}}>
<Stack direction={{xs:"column",md:"row"}} spacing={2} alignItems={{md:"start"}} justifyContent="space-between">
<Box sx={{minWidth:230,flex:"0 1 340px"}}>
<Typography fontSize={20} fontWeight={700}>ID {client.id}</Typography>
<Typography fontSize={21} fontWeight={700} sx={{mt:.4,mb:1.4}}>{client.name}</Typography>
<Stack direction="row" alignItems="center" spacing={1}><Typography fontSize={20}>CONTACTO:</Typography><Button variant="outlined" size="small" startIcon={<AccountCircle/>} sx={{color:"#172a4b",textTransform:"none",whiteSpace:"nowrap"}}>1 - {client.name} ▾</Button></Stack>
</Box>
<Box sx={{flex:1,minWidth:250}}>
<Stack direction={{xs:"column",sm:"row"}} spacing={1} justifyContent={{md:"flex-end"}} sx={{mb:1.5}}>
<Button variant="outlined" size="small" startIcon={<Phone/>} sx={{textTransform:"none",whiteSpace:"nowrap"}}>{client.phone}　⌄</Button>
<Button variant="outlined" size="small" startIcon={<Email/>} sx={{textTransform:"none"}}>{client.email}　⌄</Button>
</Stack>
<Stack direction="row" justifyContent={{md:"flex-end"}} flexWrap="wrap" gap={1}>
<Button size="small" endIcon={<Edit/>} sx={{color:"#161616",textTransform:"none"}}>Editar</Button>
<Button variant="contained" size="small" sx={{bgcolor:"#323c4e",textTransform:"none",whiteSpace:"nowrap"}}>Carga Masiva</Button>
<Button variant="contained" size="small" sx={{textTransform:"none",whiteSpace:"nowrap"}}>Búsqueda de producto</Button>
</Stack>
</Box>
</Stack>
<Stack direction={{xs:"column",sm:"row"}} spacing={1} justifyContent="center" alignItems="center" sx={{mt:1.5,py:.5}}>
<Button variant="outlined" startIcon={<AssignmentOutlined/>} onClick={()=>setTaskOpen(true)}>Crear tarea</Button>
{!activeVisit?<Button variant="contained" startIcon={<PlayArrow/>} onClick={()=>setVisitOpen(true)}>Iniciar visita</Button>:<Button variant="contained" color="warning" startIcon={<StopCircle/>} onClick={()=>setVisitOpen(true)}>Cerrar visita</Button>}
</Stack>
</Box>
<Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(2,minmax(0,1fr))",md:"repeat(5,minmax(0,1fr))"},gap:2,mt:3,mb:3}}>
{[["RFC",client.rfc,<AccountBalance key="rfc"/>],["FECHA DE ALTA","19 diciembre 2013",<CalendarMonth key="fecha"/>],["SUCURSAL ASIGNADA",client.branch,<Storefront key="suc"/>],["DIVISIÓN",client.division,<Storefront key="div"/>],["SEGMENTO",client.segment,<LocalOffer key="seg"/>],["ÚLTIMO PEDIDO","$166.18",<AttachMoney key="ped"/>],["PRONTO PAGO","10% Nota de Crédito",<AttachMoney key="pronto"/>],["VENDEDOR ASIGNADO",client.seller,<AccountCircle key="vend"/>],["REGIÓN",client.region,<LocationOn key="reg"/>],["LISTA DE PRECIOS","Distribuidor",<AttachMoney key="pre"/>],["LISTA P. PERSONALIZADA","No",<AttachMoney key="pers"/>],["LISTA NEGRA SMC","No",<AttachMoney key="neg"/>],["PORTAFOLIO","NO",<Work key="port"/>]].map(([k,v,ico])=><Paper key={String(k)} variant="outlined" sx={{px:1.8,py:1.3,minHeight:82,borderRadius:2,boxShadow:"0 2px 5px rgba(17,48,95,.08)",borderColor:"#d8e2f0"}}>
<Stack direction="row" spacing={1} alignItems="center"><Box sx={{"& svg":{fontSize:19},color:"#222"}}>{ico}</Box><Typography fontWeight={700} fontSize={14} noWrap>{k}</Typography></Stack>
<Typography sx={{mt:.7,fontSize:16}} noWrap title={String(v)}>{v}</Typography></Paper>)}
</Box>
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