"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import DiagnosticoDemo from "./DiagnosticoDemo";
import ClientList,{type ClientListItem} from "./ClientList";
import {useAgenda} from "@/features/agenda/application/AgendaContext";
import {EventDetailDialog,EventFormDialog,CancelEventDialog} from "@/features/agenda/infrastructure/ui/AgendaDialogs";
import {Alert,Box,Button,Card,CardContent,Chip,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Grid2 as Grid,Paper,Stack,Tab,Tabs,TextField,Typography,FormControl,InputLabel,Select,MenuItem,RadioGroup,FormControlLabel,Radio,Snackbar} from "@mui/material";
import {Add,ArrowBack,AssignmentOutlined,CalendarMonth,CheckCircle,LocationOn,Search,Visibility,PlayArrow,StopCircle,Phone,Email,Edit,Storefront,AttachMoney,AccountCircle,AccountBalance,Event,Inventory2,LocalOffer,Work} from "@mui/icons-material";
import {useSetBreadcrumb} from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";
import {TaskComposer} from "@/features/tareas/TaskComposer";
import {useTasks} from "@/features/tareas/TaskContext";
type Client=ClientListItem;
const clients:Client[]=[
{id:"131",name:"ANDRADE AVIÑA JESUS",rfc:"AAAJ6109236C7",phone:"3314502303",email:"jesusandradejaa23@hotmail.com",branch:"Tesistan",seller:"ALEMAN PADILLA MIGUEL AN...",region:"Política Comercial 2022",division:"Refaccionaria",segment:"Menudeo",address:"Tesistán, Zapopan, Jalisco",bankReference:"8611082",sellerId:"35",registeredAt:"2013-12-19",subClassification:"Taller Institucional",scenario:"Cliente de referencia"},
{id:"207",name:"REFACCIONARIA DEL BAJÍO",rfc:"RBA090525XXX",phone:"4422221100",email:"contacto@ejemplo.com",branch:"Querétaro",seller:"LUIS GALVÁN",region:"Centro",division:"Refaccionaria",segment:"Mayoreo",address:"Av. Constituyentes, Querétaro",bankReference:"207001",sellerId:"42",registeredAt:"2020-05-25",subClassification:"Mayoreo",scenario:"Refaccionaria"},
{id:"315",name:"TALLER SAN JOSÉ",rfc:"TSJ100201XXX",phone:"3331234567",email:"taller@ejemplo.com",branch:"Guadalajara",seller:"YURIDIA TORRES",region:"Occidente",division:"Taller",segment:"Menudeo",address:"Col. Centro, Guadalajara",bankReference:"315001",sellerId:"53",registeredAt:"2021-02-01",subClassification:"Taller general",scenario:"Taller"},
{id:"CLI-1001",name:"Refaccionaria El Volante",rfc:"REV010101XXX",phone:"3330000000",email:"demo@ejemplo.com",branch:"Tonalá",seller:"LUIS GALVÁN",region:"Occidente",division:"Refaccionaria",segment:"Menudeo",address:"Av. Demo Río Nilo 2250 · Tonalá, Jal. · DUMMY",bankReference:"1001001",sellerId:"42",registeredAt:"2022-01-10",subClassification:"Menudeo",scenario:"Visitas y tareas"},
{id:"418",name:"MOTO REFACCIONES DEL CENTRO",rfc:"MRC200101XXX",phone:"3330000418",email:"moto@ejemplo.com",branch:"Guadalajara",seller:"LUIS GALVÁN",region:"Occidente",division:"Moto partes",segment:"Menudeo",address:"Av. Demo Motociclistas 418 · Guadalajara, Jal. · DUMMY",bankReference:"418001",sellerId:"42",registeredAt:"2023-03-15",subClassification:"Moto partes",scenario:"Moto partes"},
{id:"529",name:"TRANSPORTES DEMO OCCIDENTE",rfc:"TDO200101XXX",phone:"3330000529",email:"empresa@ejemplo.com",branch:"Tonalá",seller:"LUIS GALVÁN",region:"Occidente",division:"Empresas",segment:"Flotilla",address:"Base operativa · Av. Demo Logística 529 · Tonalá, Jal. · DUMMY",bankReference:"529001",sellerId:"42",registeredAt:"2024-06-20",subClassification:"Flotilla",scenario:"Empresa · diagnóstico por Dirección"}];
export default function ClientesDemo(){
const router=useRouter();
const agenda=useAgenda();
const tasksContext=useTasks();
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const openVisit=()=>{
 if(!detail)return;
 // La ficha de cliente opera como asesor, único rol autorizado para ejecutar Check-in.
 if(agenda.role!=="advisor")agenda.setRole("advisor");
 const relevant=agenda.profiles.luis.events.filter(e=>e.title.toLocaleLowerCase("es").trim()===detail.name.toLocaleLowerCase("es").trim() && (e.date??today())===today() && e.activityType==="visit");
 const active=relevant.find(e=>e.status==="Check-in activo");
 const scheduled=relevant.find(e=>e.kind==="planned"&&e.status==="Programada");
 if(active||scheduled){agenda.setDetail({event:active??scheduled!});return;}
 const now=new Date();
 const time=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
 agenda.openForm({client:detail.name,address:detail.address,date:today(),time,creationMode:"unplanned",startAfterCreate:true});
};
const [detail,setDetail]=useState<Client|null>(null),[tab,setTab]=useState(0),[taskOpen,setTaskOpen]=useState(false),[taskSubject,setTaskSubject]=useState(""),[taskDue,setTaskDue]=useState(""),[notice,setNotice]=useState("");
useSetBreadcrumb(detail?["Clientes","Listado de clientes","Detalle"]:["Clientes","Listado de clientes"]);
const client=detail;
const openTask=()=>setTaskOpen(true);
const visits=client?agenda.profiles.luis.events.filter(e=>e.title.toLowerCase()===client.name.toLowerCase()&&e.activityType==="visit").map(e=>({id:String(e.id),label:`Visita · ${e.date??"Hoy"}, ${e.time}`})):[];
const currentVisit=client?agenda.profiles.luis.events.find(e=>e.title.toLowerCase()===client.name.toLowerCase()&&e.status==="Check-in activo"):undefined;
return <Box sx={{p:{xs:2,md:3},pb:11}}>
<Box sx={{display:client?"none":"block"}}><ClientList clients={clients} onOpen={selected=>{setDetail(selected);setTab(0);agenda.setDetail({event:null})}}/></Box>
{client&&<>
<Button startIcon={<ArrowBack/>} onClick={()=>{setDetail(null);agenda.setDetail({event:null});setTaskOpen(false)}} sx={{mb:2}}>Listado de clientes</Button>
<Box sx={{mb:3}}><Button variant="outlined" onClick={()=>{setDetail(null);agenda.setDetail({event:null});setTaskOpen(false)}} sx={{width:220,minHeight:64,fontWeight:500,boxShadow:"0 2px 5px rgba(17,48,95,.10)"}}>NUEVA CAJA　＋</Button></Box>
<Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{mb:0,borderBottom:1,borderColor:"divider","& .MuiTab-root":{fontWeight:600}}}><Tab label="INFORMACIÓN GENERAL"/><Tab label="RADIOGRAFÍA DEL CLIENTE"/></Tabs>
{tab===0?<>
<Box sx={{py:3,px:{xs:1,md:1.5},borderBottom:"1px solid #e2e7ee"}}>
<Stack direction={{xs:"column",md:"row"}} spacing={2} alignItems={{md:"flex-start"}} justifyContent="space-between">
<Box sx={{minWidth:0,flex:"1 1 300px"}}>
<Typography fontSize={20} fontWeight={700}>ID {client.id}</Typography>
<Typography fontSize={21} fontWeight={700} sx={{mt:.4,mb:1.4}}>{client.name}</Typography>
<Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap><Typography fontSize={20}>CONTACTO:</Typography><Button variant="outlined" size="small" startIcon={<AccountCircle/>} sx={{color:"#172a4b",textTransform:"none",maxWidth:"100%"}}>1 - {client.name} ▾</Button></Stack>
</Box>
<Stack direction={{xs:"column",sm:"row"}} spacing={1} alignItems={{sm:"center"}} flexWrap="wrap" useFlexGap justifyContent={{md:"flex-end"}} sx={{minWidth:0,flex:"1 1 350px"}}>
<Button variant="outlined" size="small" startIcon={<Phone/>} sx={{textTransform:"none",maxWidth:"100%",overflowWrap:"anywhere"}}>{client.phone}　⌄</Button>
<Button variant="outlined" size="small" startIcon={<Email/>} sx={{textTransform:"none",maxWidth:"100%",overflowWrap:"anywhere"}}>{client.email}　⌄</Button>
<Button size="small" endIcon={<Edit/>} sx={{color:"#161616",textTransform:"none",whiteSpace:"nowrap"}}>Editar</Button>
</Stack>
</Stack>
<Box sx={{mt:2,pt:2,borderTop:"1px solid #e2e7ee",display:{xs:"none",md:"flex"},justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:2}}>
<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
<Button variant="contained" size="small" sx={{bgcolor:"#323c4e",textTransform:"none",whiteSpace:"nowrap"}}>Carga Masiva</Button>
<Button variant="contained" size="small" sx={{textTransform:"none",whiteSpace:"nowrap"}}>Búsqueda de producto</Button>
</Stack>
<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ml:"auto"}}>
<Button variant="outlined" startIcon={<AssignmentOutlined/>} onClick={openTask}>Crear tarea</Button>
{!currentVisit?<Button variant="contained" startIcon={<PlayArrow/>} onClick={openVisit}>Iniciar visita</Button>:<Button variant="contained" color="warning" startIcon={<StopCircle/>} onClick={openVisit}>Continuar visita</Button>}
</Stack>
</Box>
<Stack direction={{xs:"column",sm:"row"}} spacing={1} justifyContent="center" alignItems="center" sx={{display:{xs:"flex",md:"none"},mt:1.5,py:.5}}>
<Button variant="outlined" startIcon={<AssignmentOutlined/>} onClick={openTask}>Crear tarea</Button>
{!currentVisit?<Button variant="contained" startIcon={<PlayArrow/>} onClick={openVisit}>Iniciar visita</Button>:<Button variant="contained" color="warning" startIcon={<StopCircle/>} onClick={openVisit}>Continuar visita</Button>}
</Stack>
<Stack direction="row" justifyContent="center" flexWrap="wrap" gap={1} sx={{display:{xs:"flex",md:"none"},mt:1}}>
<Button variant="contained" size="small" sx={{bgcolor:"#323c4e",textTransform:"none"}}>Carga Masiva</Button>
<Button variant="contained" size="small" sx={{textTransform:"none"}}>Búsqueda de producto</Button>
</Stack>
</Box>
<Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(2,minmax(0,1fr))",md:"repeat(5,minmax(0,1fr))"},gap:2,mt:3,mb:3}}>
{[["RFC",client.rfc,<AccountBalance key="rfc"/>],["FECHA DE ALTA",new Date(client.registeredAt+"T12:00:00").toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"}),<CalendarMonth key="fecha"/>],["SUCURSAL ASIGNADA",client.branch,<Storefront key="suc"/>],["DIVISIÓN",client.division,<Storefront key="div"/>],["SEGMENTO",client.segment,<LocalOffer key="seg"/>],["ÚLTIMO PEDIDO","$166.18",<AttachMoney key="ped"/>],["PRONTO PAGO","10% Nota de Crédito",<AttachMoney key="pronto"/>],["VENDEDOR ASIGNADO",client.seller,<AccountCircle key="vend"/>],["REGIÓN",client.region,<LocationOn key="reg"/>],["LISTA DE PRECIOS","Distribuidor",<AttachMoney key="pre"/>],["LISTA P. PERSONALIZADA","No",<AttachMoney key="pers"/>],["LISTA NEGRA SMC","No",<AttachMoney key="neg"/>],["PORTAFOLIO","NO",<Work key="port"/>]].map(([k,v,ico])=><Paper key={String(k)} variant="outlined" sx={{px:1.8,py:1.3,minHeight:82,borderRadius:2,boxShadow:"0 2px 5px rgba(17,48,95,.08)",borderColor:"#d8e2f0"}}>
<Stack direction="row" spacing={1} alignItems="center"><Box sx={{"& svg":{fontSize:19},color:"#222"}}>{ico}</Box><Typography fontWeight={700} fontSize={14} noWrap>{k}</Typography></Stack>
<Typography sx={{mt:.7,fontSize:16}} noWrap title={String(v)}>{v}</Typography></Paper>)}
</Box>
<Paper variant="outlined" sx={{p:2}}><Typography variant="h6" fontWeight={700}>Direcciones del cliente</Typography><Typography variant="body2" color="text.secondary" sx={{mb:1}}>Relación de dirección separada del cliente, conforme a Discovery.</Typography><Stack direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} justifyContent="space-between" gap={1}><Typography><LocationOn fontSize="small" sx={{verticalAlign:"middle"}}/> {client.address}</Typography><Button onClick={openTask}>Crear tarea desde dirección (simulación)</Button></Stack></Paper>
</>:<DiagnosticoDemo client={client}/>}
</>}
<TaskComposer open={taskOpen} onClose={()=>setTaskOpen(false)} creator={client?tasksContext.data.owners[client.id]||"Luis Galván":"Luis Galván"} link={client?{clientId:client.id,client:client.name,address:client.address}:undefined} onCreated={()=>setNotice("Tarea guardada. Consúltala en Mis Tareas.")}/>
<EventDetailDialog />
<EventFormDialog />
<CancelEventDialog />
<Snackbar open={!!notice} autoHideDuration={4500} onClose={()=>setNotice("")} message={notice}/>
</Box>;
}
