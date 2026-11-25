"use client";
import {useEffect,useRef,useState} from "react";
import type {ClientListItem} from "./ClientList";
import {commercialRelations} from "./CommercialLevelUpload";
import {useAgenda} from "@/features/agenda/application/AgendaContext";
import {Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,Divider,FormControl,Grid2 as Grid,IconButton,InputLabel,MenuItem,Paper,Select,Stack,Tab,Tabs,TextField,Typography,Accordion,AccordionSummary,AccordionDetails,Snackbar} from "@mui/material";
import {ArrowBack,ArrowForward,Assessment,CalendarMonth,Close,Edit,ExpandMore,History,LocalOffer,Person,Phone,Email,Search,Storefront,TrendingUp,AccountBalance,Visibility,Save} from "@mui/icons-material";
const panel={p:2,border:"1px solid #dce5ef",borderRadius:2};
function Datum({label,value}:{label:string,value:string}){return <Box sx={{p:1.5,bgcolor:"#f1f8fe",borderRadius:1,minHeight:70}}><Typography fontSize={12} color="text.secondary">{label}</Typography><Typography fontSize={14} fontWeight={600}>{value}</Typography></Box>}
export default function DiagnosticoDemo({client,initialDiagnosis=false}:{client:ClientListItem;initialDiagnosis?:boolean}){
const {role:activeRole,profiles,hideDetail}=useAgenda();
const diagnosisFrame=useRef<HTMLIFrameElement>(null);
const [diagnosisHeight,setDiagnosisHeight]=useState(640);
const diagnosisRole=({advisor:"Asesor",manager:"Gerente",support:"Administrador",consult:"Consulta"} as const)[activeRole];
const diagnosisSegment=client.division.toLocaleLowerCase("es").includes("taller")?"Talleres":client.division.toLocaleLowerCase("es").includes("moto")?"Moto part":client.division.toLocaleLowerCase("es").includes("empresa")?"empresas":"Refa";
const relations=commercialRelations(client);
const [selectedRelation,setSelectedRelation]=useState("");
const advisorRelation=relations.find(item=>item.seller==="LUIS GALVÁN");
const relation=activeRole==="manager"
  ? relations.find(item=>item.relationId===selectedRelation)??relations[0]
  : activeRole==="advisor"?advisorRelation:undefined;
const activityProfiles=hideDetail?[]:activeRole==="advisor"?[profiles.luis]:Object.values(profiles);
const latestActivity=activityProfiles
  .flatMap(profile=>profile.events)
  .filter(event=>event.status==="Check-out realizado" && event.title.toLocaleLowerCase("es")===client.name.toLocaleLowerCase("es"))
  .map(event=>({event,at:event.checkOutEpochMs??Date.parse(event.date ? event.date+"T"+event.time : "")}))
  .filter(({at})=>Number.isFinite(at)&&at<=Date.now())
  .sort((a,b)=>b.at-a.at)[0];
const entryParams=new URLSearchParams({
  clientId:client.id,role:diagnosisRole,segment:diagnosisSegment,name:client.name,
  advisorSegment:client.diagnosisChannel??diagnosisSegment,
  responsible:client.seller,
  latestActivity:latestActivity?new Date(latestActivity.at).toLocaleString("es-MX",{dateStyle:"short",timeStyle:"short"}):"",
});
const base=process.env.NEXT_PUBLIC_BASE_PATH||"";
const mobileUrl=base+"/diagnostico-mobile.html?"+entryParams;
const diagnosisParams=new URLSearchParams(entryParams);
Object.entries({embedded:"1",version:"025",relationId:relation?.relationId??"",advisorRelationId:advisorRelation?.relationId??""})
  .forEach(([key,value])=>diagnosisParams.set(key,value));
useEffect(()=>{
 const onFrameMessage=(event:MessageEvent)=>{
  if(event.origin!==window.location.origin||event.source!==diagnosisFrame.current?.contentWindow)return;
  if(event.data?.type!=="epico:diagnosis-height")return;
  const height=event.data.height;
  if(typeof height==="number"&&Number.isFinite(height)&&height>0)setDiagnosisHeight(Math.ceil(height));
 };
 window.addEventListener("message",onFrameMessage);
 return()=>window.removeEventListener("message",onFrameMessage);
},[]);
const [screen,setScreen]=useState<"radiografia"|"diagnostico"|"credito">(initialDiagnosis?"diagnostico":"radiografia"),[contactOpen,setContactOpen]=useState(false),[selectedContact,setSelectedContact]=useState("1"),[contactName,setContactName]=useState(client.name),[contactPhone,setContactPhone]=useState(client.phone),[contactEmail,setContactEmail]=useState(client.email),[notice,setNotice]=useState(""),[creditSearch,setCreditSearch]=useState("");
const rows:[string,string,string][]=[["Buró","NO",""],["Plazo del crédito","45 días",""],["Límite del crédito","$70,000.00",""],["Crédito disponible","$33,144.47",""],["Saldo PxC sin vencer","$25,683.49",""],["Saldo PxC vencido","$11,172.04",""],["Cobranza","$49,053.24",""],["Garantías / Devoluciones","-$1,858.68",""],["Facturas pendientes de pago","32 Facturas",""],["Referencia de pago del cliente","8611082",""],["Fecha de aprobación del crédito","26/10/2016",""]];
const invoices=[["F-12481","03/10/2026","$4,521.00","Pendiente"],["F-12403","29/09/2026","$8,230.00","Pendiente"],["F-12387","18/09/2026","$3,951.00","Vencida"]];
const top=<><Stack direction={{xs:"column",sm:"row"}} justifyContent="space-between" gap={1} sx={{mb:2}}><Box><Typography fontWeight={700}>ID {client.id}</Typography><Typography fontSize={20} fontWeight={700}>{client.name}</Typography><Stack direction="row" alignItems="center" gap={1} sx={{mt:1}}><Person fontSize="small"/><Typography>CONTACTO:</Typography><Select size="small" value={selectedContact} onChange={e=>{setSelectedContact(e.target.value);setNotice("Contacto seleccionado (simulación).")}}><MenuItem value="1">1 - {contactName}</MenuItem><MenuItem value="2">2 - CONTACTO DEMO</MenuItem></Select></Stack></Box><Stack direction={{xs:"column",sm:"row"}} alignItems={{sm:"center"}} gap={1}><Button size="small" variant="outlined" startIcon={<Phone/>}>{contactPhone}</Button><Button size="small" variant="outlined" startIcon={<Email/>} sx={{textTransform:"none"}}>{contactEmail}</Button><Button size="small" startIcon={<Edit/>} onClick={()=>setContactOpen(true)}>Editar</Button></Stack></Stack><Divider sx={{mb:2}}/></>;
return <Box sx={{pb:4}}>
{screen!=="radiografia"&&<Button startIcon={<ArrowBack/>} onClick={()=>{setScreen("radiografia")}} sx={{my:1}}>Volver a Radiografía del cliente</Button>}
{top}
{screen==="radiografia"?<>
<Paper variant="outlined" sx={{...panel,mb:2}}>
  <Stack direction={{xs:"column",md:"row"}} justifyContent="space-between" alignItems={{md:"center"}} gap={1}>
    <Box>
      <Typography variant="h6" fontWeight={700} color="primary">
        <Assessment sx={{verticalAlign:"middle",mr:1}}/>Diagnóstico de Cliente
      </Typography>
      <Typography color="text.secondary">Sin información disponible</Typography>
    </Box>
    <Button variant="contained" endIcon={<ArrowForward/>} onClick={()=>setScreen("diagnostico")}>Ver / actualizar diagnóstico</Button>
  </Stack>
</Paper>
<Stack direction={{xs:"column",lg:"row"}} spacing={2} sx={{mb:2}}><Paper variant="outlined" sx={{...panel,flex:1}}><Typography fontWeight={700} sx={{mb:2}}>Generales</Typography><Grid container spacing={1}>{[["FECHA DE ALTA","19/12/2013"],["SUCURSAL",client.branch],["LISTA DE PRECIOS","Distribuidor Plus"],["DIVISIÓN",client.division],["SEGMENTO",client.segment]].map(([k,v])=><Grid size={{xs:12,sm:6,md:4}} key={k}><Box sx={{borderLeft:"1px solid #cbd7e9",p:1.5}}><Typography fontSize={12}>{k}</Typography><Typography color="primary">{v}</Typography></Box></Grid>)}</Grid></Paper><Paper variant="outlined" sx={{...panel,flex:1}}><Typography fontWeight={700} sx={{mb:2}}>Visitas</Typography><Grid container spacing={1}>{["ANTERIOR","ACTUAL"].map((x,i)=><Grid size={6} key={x}><Box sx={{bgcolor:i?"#204094":"#45209a",color:"white",borderRadius:1,p:2,minHeight:140}}><Typography fontSize={13}>{x}</Typography><Divider sx={{my:2,borderColor:"#ffffff55"}}/><Typography fontSize={13}>Visitas　{ i?"2":"4"}</Typography><Typography fontSize={13}>Horas　{ i?"3.0":"6.5"}</Typography></Box></Grid>)}</Grid></Paper></Stack>
<Paper variant="outlined" sx={{...panel,mb:2}}><Typography fontWeight={700} sx={{mb:2}}>Crédito</Typography><Grid container spacing={1}>{rows.map(([k,v])=><Grid size={{xs:12,sm:6,md:3}} key={k}><Datum label={k} value={v}/></Grid>)}</Grid><Button endIcon={<ArrowForward/>} sx={{mt:2}} onClick={()=>setScreen("credito")}>IR AL DESGLOSE DE CRÉDITO</Button></Paper>
<Paper variant="outlined" sx={panel}><Typography fontWeight={700} sx={{mb:2}}>PRODUCTOS DEJADOS DE COMPRAR</Typography><Box sx={{overflowX:"auto"}}><Box component="table" sx={{width:"100%",borderCollapse:"collapse",fontSize:13,"& td,& th":{p:1,borderBottom:"1px solid #e6ebf2",textAlign:"left"}}}><thead><tr>{["CÓDIGO","DESCRIPCIÓN","CANTIDAD","FECHA ÚLTIMA COMPRA","PEDIDO"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{[["3284312","REGULADOR VOLTAJE ALTERNADOR MITSUBISHI","1","03/01/2024","678114"],["6343130","LENTES DE SEGURIDAD DE POLICARBONATO","1","05/01/2024","678283"]].map((row,i)=><tr key={i}>{row.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></Box></Box><Typography fontSize={12} color="text.secondary" sx={{mt:1}}>Datos de demostración, no conectados a Épico.</Typography></Paper>
</>:screen==="credito"?<Paper variant="outlined" sx={panel}><Typography variant="h6" fontWeight={700}>Desglose de crédito</Typography><Typography color="text.secondary" fontSize={13}>Vista interactiva de referencia; filtros y facturas simulados.</Typography><TextField size="small" label="Buscar factura" value={creditSearch} onChange={e=>setCreditSearch(e.target.value)} sx={{my:2}}/><Box sx={{overflowX:"auto"}}><Box component="table" sx={{width:"100%",borderCollapse:"collapse","& td,& th":{p:1.5,borderBottom:"1px solid #e2e9f3",textAlign:"left"}}}><thead><tr>{["Factura","Fecha","Importe","Estado"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{invoices.filter(r=>r.join(" ").toLowerCase().includes(creditSearch.toLowerCase())).map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i}>{c}</td>)}</tr>)}</tbody></Box></Box></Paper>:null}
<Box sx={{display:screen==="diagnostico"?"block":"none"}}>
<Box sx={{minWidth:0}}><Stack direction={{xs:"column",sm:"row"}} gap={1} justifyContent="space-between" alignItems={{sm:"center"}} sx={{mb:2}}><Typography variant="h5" fontWeight={700}>Diagnóstico de Cliente</Typography><Button variant="outlined" size="small" component="a" href={mobileUrl} target="_blank" rel="noopener noreferrer">Ver versión móvil</Button></Stack>{activeRole==="manager"&&relations.length>1&&<TextField select size="small" label="Vendedor" value={relation?.relationId??""} onChange={event=>setSelectedRelation(event.target.value)} sx={{mb:2,minWidth:240}}>
{relations.map(item=><MenuItem key={item.relationId} value={item.relationId}>{item.seller}</MenuItem>)}
</TextField>}<Box component="iframe" ref={diagnosisFrame} key={client.id} title="Diagnóstico de Cliente" src={base+"/diagnostico-segmentos.html?"+diagnosisParams} sx={{display:"block",width:"100%",height:diagnosisHeight,border:0,background:"transparent"}}/></Box></Box>

<Dialog open={contactOpen} onClose={()=>setContactOpen(false)} fullWidth maxWidth="sm"><DialogTitle>Editar contacto</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}><TextField label="Nombre" value={contactName} onChange={e=>setContactName(e.target.value)}/><TextField label="Teléfono" value={contactPhone} onChange={e=>setContactPhone(e.target.value)}/><TextField label="Correo electrónico" value={contactEmail} onChange={e=>setContactEmail(e.target.value)}/><Typography variant="caption">Los cambios sólo afectan este simulador.</Typography></Stack></DialogContent><DialogActions><Button onClick={()=>setContactOpen(false)}>Cancelar</Button><Button variant="contained" onClick={()=>{setContactOpen(false);setNotice("Contacto actualizado en simulación.")}}>Guardar</Button></DialogActions></Dialog>
<Snackbar open={!!notice} autoHideDuration={4000} onClose={()=>setNotice("")} message={notice}/>
</Box>
}
