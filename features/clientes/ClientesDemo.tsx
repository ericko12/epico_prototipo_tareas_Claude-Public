"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import DiagnosticoDemo from "./DiagnosticoDemo";
import {useAgenda} from "@/features/agenda/application/AgendaContext";
import {EventDetailDialog,EventFormDialog,CancelEventDialog} from "@/features/agenda/infrastructure/ui/AgendaDialogs";
import {Alert,Box,Button,Card,CardContent,Chip,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Grid2 as Grid,Paper,Stack,Tab,Tabs,TextField,Typography,FormControl,InputLabel,Select,MenuItem,RadioGroup,FormControlLabel,Radio,Snackbar} from "@mui/material";
import {Add,ArrowBack,AssignmentOutlined,CalendarMonth,CheckCircle,LocationOn,Search,Visibility,PlayArrow,StopCircle,Phone,Email,Edit,Storefront,AttachMoney,AccountCircle,AccountBalance,Event,Inventory2,LocalOffer,Work} from "@mui/icons-material";
import {useSetBreadcrumb} from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";
type Client={id:string;name:string;rfc:string;phone:string;email:string;branch:string;seller:string;region:string;division:string;segment:string;address:string};
const clients:Client[]=[
{id:"131",name:"ANDRADE AVIÑA JESUS",rfc:"AAAJ6109236C7",phone:"333314502303",email:"jesusandradejaa23@hotmail.com",branch:"Tesistan",seller:"ALEMAN PADILLA MIGUEL AN...",region:"Política Comercial 2022",division:"Refaccionaria",segment:"Menudeo",address:"Tesistán, Zapopan, Jalisco"},
{id:"207",name:"REFACCIONARIA DEL BAJÍO",rfc:"RBA090525XXX",phone:"4422221100",email:"contacto@ejemplo.com",branch:"Querétaro",seller:"LUIS GALVÁN",region:"Centro",division:"Refaccionaria",segment:"Mayoreo",address:"Av. Constituyentes, Querétaro"},
{id:"315",name:"TALLER SAN JOSÉ",rfc:"TSJ100201XXX",phone:"3331234567",email:"taller@ejemplo.com",branch:"Guadalajara",seller:"YURIDIA TORRES",region:"Occidente",division:"Taller",segment:"Menudeo",address:"Col. Centro, Guadalajara"},
{id:"CLI-1001",name:"Refaccionaria El Volante",rfc:"REV010101XXX",phone:"3330000000",email:"demo@ejemplo.com",branch:"Tonalá",seller:"LUIS GALVÁN",region:"Occidente",division:"Refaccionaria",segment:"Menudeo",address:"Av. Demo Río Nilo 2250 · Tonalá, Jal. · DUMMY"}];
export default function ClientesDemo(){
const router=useRouter();
const agenda=useAgenda();
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
const taskTypes=["Seguimiento comercial","Enviar documentación","Llamada a cliente","Validación de información","Actividad interna"];
const closeRules:Record<string,{comment:boolean;evidence:boolean}>={"Seguimiento comercial":{comment:true,evidence:false},"Enviar documentación":{comment:false,evidence:true},"Llamada a cliente":{comment:false,evidence:false},"Validación de información":{comment:true,evidence:true},"Actividad interna":{comment:false,evidence:false}};
const [detail,setDetail]=useState<Client|null>(null),[search,setSearch]=useState(""),[tab,setTab]=useState(0),[taskOpen,setTaskOpen]=useState(false),[taskSubject,setTaskSubject]=useState(""),[taskDue,setTaskDue]=useState(""),[notice,setNotice]=useState("");
useSetBreadcrumb(detail?["Clientes","Listado de clientes","Detalle"]:["Clientes","Listado de clientes"]);
const [taskType,setTaskType]=useState(taskTypes[0]),[taskDetail,setTaskDetail]=useState(""),[taskRelation,setTaskRelation]=useState("Cliente"),[taskRelatedId,setTaskRelatedId]=useState(""),[taskAssigned,setTaskAssigned]=useState("Luis Galván"),[taskRelationQuery,setTaskRelationQuery]=useState("");
const client=detail;
const openTask=()=>{setTaskSubject("");setTaskDue(new Date().toISOString().slice(0,10));setTaskType(taskTypes[0]);setTaskDetail("");setTaskRelation("Cliente");setTaskRelatedId(detail?.id||"");setTaskAssigned("Luis Galván");setTaskRelationQuery("");setTaskOpen(true)};
const createTask=()=>{if(!taskSubject.trim()||!taskType||!taskAssigned||!taskDue){setNotice("Completa asunto, tipo, responsable y vencimiento.");return}if(taskRelation!=="Sin relación"&&!taskRelatedId){setNotice("Selecciona un registro existente o elige Sin relación.");return}setTaskOpen(false);setNotice("Tarea creada en el simulador (no se guarda en backend).")};
const visits=client?agenda.profiles.luis.events.filter(e=>e.title.toLowerCase()===client.name.toLowerCase()&&e.activityType==="visit").map(e=>({id:String(e.id),label:`Visita · ${e.date??"Hoy"}, ${e.time}`})):[];
const currentVisit=client?agenda.profiles.luis.events.find(e=>e.title.toLowerCase()===client.name.toLowerCase()&&e.status==="Check-in activo"):undefined;
return <Box sx={{p:{xs:2,md:3},pb:11}}>
<Alert severity="info" sx={{mb:2}}><b>SIMULADOR DE CLIENTES.</b> Réplica visual de referencia, datos ficticios; no modifica Épico. Las visitas y tareas son escenarios para validar con negocio.</Alert>
{!client?<><Typography variant="h5" fontWeight={700} sx={{mb:2}}>Listado de clientes</Typography>
<Paper variant="outlined" sx={{p:2,mb:2}}><Stack direction={{xs:"column",sm:"row"}} spacing={2}>
<TextField fullWidth size="small" label="Buscar por ID, nombre, RFC, vendedor o dirección" value={search} onChange={e=>setSearch(e.target.value)} InputProps={{startAdornment:<Search sx={{mr:1}}/>}}/>
<Button variant="outlined" onClick={()=>setSearch("131")}>Buscar ID 131</Button></Stack></Paper>
<Stack spacing={1.5}>{clients.filter(c=>[c.id,c.name,c.rfc,c.branch,c.seller,c.address].join(" ").toLowerCase().includes(search.toLowerCase())).map(c=><Card key={c.id} variant="outlined"><CardContent><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" alignItems={{sm:"center"}} spacing={2}><Box><Typography color="primary" fontWeight={700}>ID {c.id} · {c.name}</Typography><Typography variant="body2" color="text.secondary">{c.branch} · {c.address}</Typography><Typography variant="body2">Vendedor: {c.seller}</Typography></Box><Button variant="contained" startIcon={<Visibility/>} onClick={()=>{setDetail(c);setTab(0);agenda.setDetail({event:null})}}>Ver detalle</Button></Stack></CardContent></Card>)}</Stack>
</>:<>
<Button startIcon={<ArrowBack/>} onClick={()=>{setDetail(null);agenda.setDetail({event:null});setTaskOpen(false)}} sx={{mb:2}}>Listado de clientes</Button>
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
<Button variant="outlined" startIcon={<AssignmentOutlined/>} onClick={openTask}>Crear tarea</Button>
{!currentVisit?<Button variant="contained" startIcon={<PlayArrow/>} onClick={openVisit}>Iniciar visita</Button>:<Button variant="contained" color="warning" startIcon={<StopCircle/>} onClick={openVisit}>Continuar visita</Button>}
</Stack>
</Box>
<Box sx={{display:"grid",gridTemplateColumns:{xs:"1fr",sm:"repeat(2,minmax(0,1fr))",md:"repeat(5,minmax(0,1fr))"},gap:2,mt:3,mb:3}}>
{[["RFC",client.rfc,<AccountBalance key="rfc"/>],["FECHA DE ALTA","19 diciembre 2013",<CalendarMonth key="fecha"/>],["SUCURSAL ASIGNADA",client.branch,<Storefront key="suc"/>],["DIVISIÓN",client.division,<Storefront key="div"/>],["SEGMENTO",client.segment,<LocalOffer key="seg"/>],["ÚLTIMO PEDIDO","$166.18",<AttachMoney key="ped"/>],["PRONTO PAGO","10% Nota de Crédito",<AttachMoney key="pronto"/>],["VENDEDOR ASIGNADO",client.seller,<AccountCircle key="vend"/>],["REGIÓN",client.region,<LocationOn key="reg"/>],["LISTA DE PRECIOS","Distribuidor",<AttachMoney key="pre"/>],["LISTA P. PERSONALIZADA","No",<AttachMoney key="pers"/>],["LISTA NEGRA SMC","No",<AttachMoney key="neg"/>],["PORTAFOLIO","NO",<Work key="port"/>]].map(([k,v,ico])=><Paper key={String(k)} variant="outlined" sx={{px:1.8,py:1.3,minHeight:82,borderRadius:2,boxShadow:"0 2px 5px rgba(17,48,95,.08)",borderColor:"#d8e2f0"}}>
<Stack direction="row" spacing={1} alignItems="center"><Box sx={{"& svg":{fontSize:19},color:"#222"}}>{ico}</Box><Typography fontWeight={700} fontSize={14} noWrap>{k}</Typography></Stack>
<Typography sx={{mt:.7,fontSize:16}} noWrap title={String(v)}>{v}</Typography></Paper>)}
</Box>
<Paper variant="outlined" sx={{p:2}}><Typography variant="h6" fontWeight={700}>Direcciones del cliente</Typography><Typography variant="body2" color="text.secondary" sx={{mb:1}}>Relación de dirección separada del cliente, conforme a Discovery.</Typography><Stack direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} justifyContent="space-between" gap={1}><Typography><LocationOn fontSize="small" sx={{verticalAlign:"middle"}}/> {client.address}</Typography><Button onClick={openTask}>Crear tarea desde dirección (simulación)</Button></Stack></Paper>
</>:<DiagnosticoDemo client={client}/>}
</>}
<Dialog open={taskOpen} onClose={()=>setTaskOpen(false)} fullWidth maxWidth="sm">
<DialogTitle>CREAR NUEVA TAREA</DialogTitle>
<DialogContent><Stack spacing={2} sx={{pt:1}}>
<TextField required label="Asunto" value={taskSubject} onChange={e=>setTaskSubject(e.target.value)}/>
<FormControl fullWidth><InputLabel>Tipo de tarea</InputLabel><Select label="Tipo de tarea" value={taskType} onChange={e=>setTaskType(e.target.value)}>{taskTypes.map(t=><MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl>
<TextField label="Asignado a" value={taskAssigned} disabled/>
<Alert severity="info">Cierre: {closeRules[taskType]?.comment?"Comentario obligatorio":"Comentario opcional"} y {closeRules[taskType]?.evidence?"evidencia obligatoria":"evidencia opcional"} (ejemplo para validar).</Alert>
<Typography variant="subtitle2">Relacionar con un registro existente (opcional)</Typography>
<FormControl fullWidth><InputLabel>Tipo de relación</InputLabel><Select label="Tipo de relación" value={taskRelation} onChange={e=>{setTaskRelation(e.target.value);setTaskRelatedId(e.target.value==="Cliente"?client?.id||"":"");setTaskRelationQuery("")}}>{["Sin relación","Cliente","Visita","Cotización","Pedido"].map(t=><MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl>
{taskRelation!=="Sin relación"&&<><TextField label={taskRelation==="Cliente"?"Buscar por nombre, ID o dirección":taskRelation==="Visita"?"Buscar visita por cliente, fecha o ID":"Buscar registro por ID o cliente"} value={taskRelationQuery} onChange={e=>{setTaskRelationQuery(e.target.value);setTaskRelatedId("")}}/><FormControl fullWidth><InputLabel>Seleccionar {taskRelation.toLowerCase()}</InputLabel><Select label={"Seleccionar "+taskRelation.toLowerCase()} value={taskRelatedId} onChange={e=>setTaskRelatedId(e.target.value)}>{([...(taskRelation==="Cliente"&&client?[{id:client.id,label:client.name}]:[]),...(taskRelation==="Visita"?visits.map(v=>({id:v.id,label:v.label})):[]),...(taskRelation==="Cotización"?[{id:"COT-854",label:"Cotización de ejemplo"}]:[]),...(taskRelation==="Pedido"?[{id:"PED-741",label:"Pedido de ejemplo"}]:[])]).filter(v=>[v.id,v.label].join(" ").toLowerCase().includes(taskRelationQuery.toLowerCase())).map(v=><MenuItem key={v.id} value={v.id}>{v.label} · {v.id}</MenuItem>)}</Select></FormControl>{taskRelatedId&&<Alert severity="success">{taskRelation==="Cliente"?client?.name:taskRelation==="Visita"?visits.find(v=>v.id===taskRelatedId)?.label:taskRelation==="Cotización"?"Cotización de ejemplo":"Pedido de ejemplo"} · {taskRelatedId}</Alert>}<Typography variant="caption" color="text.secondary">Registros de demostración; no hay conexión con la base de datos.</Typography></>}
<TextField required type="date" label="Fecha de vencimiento" InputLabelProps={{shrink:true}} value={taskDue} onChange={e=>setTaskDue(e.target.value)}/>
<TextField multiline minRows={3} label="Detalle / instrucciones" value={taskDetail} onChange={e=>setTaskDetail(e.target.value)}/>
</Stack></DialogContent><DialogActions><Button onClick={()=>setTaskOpen(false)}>Cancelar</Button><Button variant="contained" onClick={createTask}>Crear tarea</Button></DialogActions>
</Dialog>
<EventDetailDialog />
<EventFormDialog />
<CancelEventDialog />
<Snackbar open={!!notice} autoHideDuration={4500} onClose={()=>setNotice("")} message={notice}/>
</Box>;
}