"use client";
import { useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Add, AssignmentTurnedIn, CheckCircleOutline, EditOutlined, Replay, Search, VisibilityOutlined } from "@mui/icons-material";
import { useSetBreadcrumb } from "@/features/layoutMain/infrastructure/ui/BreadcrumbContext";

type Status = "Pendiente" | "Completada";
type Task = {id:number; subject:string; type:string; assigned:string; related:string; due:string; status:Status; detail:string; evidence:string; source:"Manual"|"Automática"; history:string[]; closure?:{comment:boolean;evidence:boolean};reopenReason?:string };
const USERS=["Luis Galván","Yuridia Torres","Asesor comercial","Gerente regional"];
const TYPES=["Seguimiento comercial","Enviar documentación","Llamada a cliente","Validación de información","Actividad interna"];
const CLOSE_RULES:Record<string,{comment:boolean;evidence:boolean}>={"Seguimiento comercial":{comment:true,evidence:false},"Enviar documentación":{comment:false,evidence:true},"Llamada a cliente":{comment:false,evidence:false},"Validación de información":{comment:true,evidence:true},"Actividad interna":{comment:false,evidence:false}};
type Role="Asesor"|"Gerente regional"|"Gerente territorial"|"Gerente nacional";
const HIERARCHY:Record<Role,string[]>={"Asesor":["Luis Galván"],"Gerente regional":["Gerente regional","Luis Galván","Yuridia Torres","Asesor comercial"],"Gerente territorial":["Gerente territorial","Gerente regional","Luis Galván","Yuridia Torres","Asesor comercial"],"Gerente nacional":["Gerente nacional","Gerente territorial","Gerente regional","Luis Galván","Yuridia Torres","Asesor comercial"]};
const today=new Date().toISOString().slice(0,10);
const days=(d:number)=>{const t=new Date();t.setDate(t.getDate()+d);return t.toISOString().slice(0,10)};
const sample:Task[]=[
{id:1001,subject:"Enviar cotización actualizada",type:"Seguimiento comercial",assigned:"Luis Galván",related:"Refaccionaria del Bajío",due:days(-2),status:"Pendiente",detail:"Contactar al cliente y confirmar recepción.",evidence:"",source:"Manual",history:["Creada manualmente · demostración"]},
{id:1002,subject:"Solicitar evidencia de entrega",type:"Enviar documentación",assigned:"Yuridia Torres",related:"Taller San José",due:today,status:"Pendiente",detail:"Adjuntar comprobante recibido.",evidence:"",source:"Automática",history:["Generada por proceso simulado"]},
{id:1003,subject:"Contactar cliente por seguimiento",type:"Llamada a cliente",assigned:"Luis Galván",related:"Distribuidora Norte",due:days(2),status:"Pendiente",detail:"Dar seguimiento a la solicitud comercial.",evidence:"",source:"Manual",history:["Creada manualmente · demostración"]},
{id:1004,subject:"Revisar cartera semanal",type:"Actividad interna",assigned:"Luis Galván",related:"",due:days(-1),status:"Completada",detail:"Consolidar pendientes de la semana.",evidence:"Reporte semanal (simulado)",source:"Manual",history:["Creada manualmente","Completada · demostración"]}
];
const blank={subject:"",type:TYPES[0],assigned:USERS[0],related:"",due:today,detail:""};
export default function TareasPage(){
  useSetBreadcrumb(["Seguimiento comercial","Mis Tareas"]);
  const theme=useTheme(),mobile=useMediaQuery(theme.breakpoints.down("sm"));
  const [tasks,setTasks]=useState<Task[]>(sample);
  const [role,setRole]=useState<Role>("Asesor"),[reopenReason,setReopenReason]=useState(""),[reassignTo,setReassignTo]=useState("");
  const actor=role==="Asesor"?"Luis Galván":role, isManager=role!=="Asesor", allowed=HIERARCHY[role];
  const isOwner=(t:Task)=>t.assigned===actor;
  const canSee=(t:Task)=>isOwner(t)||(isManager&&allowed.includes(t.assigned));
  const closeRule=(t:Task)=>t.closure||CLOSE_RULES[t.type]||{comment:false,evidence:false};
  const [tab,setTab]=useState("Todas"),[query,setQuery]=useState(""),[typeFilter,setTypeFilter]=useState("Todos"),[userFilter,setUserFilter]=useState("Todos"),[dateFilter,setDateFilter]=useState("Todas");
  const [form,setForm]=useState(blank),[createOpen,setCreateOpen]=useState(false),[selected,setSelected]=useState<number|null>(null),[comment,setComment]=useState(""),[evidence,setEvidence]=useState(""),[notice,setNotice]=useState("");
  const selectedTask=tasks.find(t=>t.id===selected);
  const isOverdue=(t:Task)=>t.status==="Pendiente"&&t.due<today;
  const visible=useMemo(()=>tasks.filter(t=>{
    const matchState=tab==="Todas"||(tab==="Pendientes"&&t.status==="Pendiente"&&!isOverdue(t))||(tab==="Vencidas"&&isOverdue(t))||(tab==="Completadas"&&t.status==="Completada");
    const q=query.toLowerCase().trim();
    return canSee(t)&&matchState&&(typeFilter==="Todos"||t.type===typeFilter)&&(userFilter==="Todos"||t.assigned===userFilter)&&(dateFilter==="Todas"||(dateFilter==="Hoy"&&t.due===today)||(dateFilter==="Próximas"&&t.due>=today&&t.status==="Pendiente"))&&(!q||[t.subject,t.type,t.assigned,t.related,String(t.id)].join(" ").toLowerCase().includes(q));
  }).sort((a,b)=>a.due.localeCompare(b.due)),[tasks,tab,query,typeFilter,userFilter,dateFilter,role]);
  const counts={pending:tasks.filter(t=>canSee(t)&&t.status==="Pendiente"&&!isOverdue(t)).length,overdue:tasks.filter(t=>canSee(t)&&isOverdue(t)).length,done:tasks.filter(t=>canSee(t)&&t.status==="Completada").length};
  const change=(patch:Partial<Task>)=>setTasks(old=>old.map(t=>t.id===selected?{...t,...patch}:t));
  const create=()=>{
    if(!form.subject.trim()||!form.assigned||!form.type||!form.due){setNotice("Completa asunto, tipo, responsable y vencimiento.");return}
    setTasks(old=>[{...form,assigned:isManager?form.assigned:actor,closure:{...CLOSE_RULES[form.type]},id:Math.max(...old.map(t=>t.id),1000)+1,status:"Pendiente",evidence:"",source:"Manual",history:["Creada manualmente · simulador"]},...old]);
    setCreateOpen(false);setForm(blank);setTab("Todas");setNotice("Tarea creada en el simulador.");
  };
  const complete=()=>{
    if(!selectedTask)return;
    if(!isOwner(selectedTask)){setNotice("Solo el asignado puede completar.");return}
    if(closeRule(selectedTask).comment&&!comment.trim()){setNotice("Falta comentario obligatorio.");return}
    if(closeRule(selectedTask).evidence&&!evidence.trim()){setNotice("Falta evidencia obligatoria.");return}
    if(selectedTask.reopenReason&&!comment.trim()){setNotice("Explica cómo corregiste la observación.");return}
    change({status:"Completada",evidence:evidence.trim()||selectedTask.evidence,reopenReason:undefined,history:[...selectedTask.history,"Completada por "+actor+" · "+(comment.trim()||"Sin comentario")+" · simulador"]});
    setNotice("Tarea completada.");setSelected(null);
  };
  const reopen=()=>{
    if(!selectedTask)return;
    if(!isManager||isOwner(selectedTask)||!canSee(selectedTask)){setNotice("Reapertura solo por gerente autorizado.");return}
    if(!reopenReason.trim()){setNotice("Es obligatorio indicar motivo.");return}
    change({status:"Pendiente",reopenReason:reopenReason.trim(),history:[...selectedTask.history,"Reabierta por "+actor+": "+reopenReason.trim()]});setReopenReason("");setSelected(null);setNotice("Tarea reabierta.");
  };
  const openDetail=(id:number)=>{const t=tasks.find(x=>x.id===id);setSelected(id);setComment("");setEvidence(t?.evidence||"");setReassignTo(t?.assigned||"");setReopenReason("")};
  const stateChip=(t:Task)=><Chip size="small" label={t.status==="Completada"?"Completada":isOverdue(t)?"Vencida":"Pendiente"} color={t.status==="Completada"?"success":isOverdue(t)?"error":"warning"} variant="outlined"/>;
  return <Box sx={{p:{xs:2,md:3},pb:12}}>
    <Alert severity="info" sx={{mb:3}}><b>SIMULADOR · SPEC-F2-003.</b> Datos ficticios; sin conexión con Salesforce ni con Épico. Estados, tipos, evidencia y permisos sujetos a validación de negocio.</Alert>
    <Paper variant="outlined" sx={{p:2,mb:2}}><Stack direction={{xs:"column",sm:"row"}} spacing={2} alignItems={{sm:"center"}}><Typography fontWeight={700}>Simular permisos:</Typography><FormControl size="small" sx={{minWidth:185}}><InputLabel>Rol</InputLabel><Select label="Rol" value={role} onChange={e=>{setRole(e.target.value as Role);setSelected(null)}}>{(Object.keys(HIERARCHY) as Role[]).map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl><Typography variant="body2" color="text.secondary">Usuario: {actor} · jerarquía ficticia</Typography></Stack></Paper>
    <Stack direction={{xs:"column",sm:"row"}} alignItems={{xs:"stretch",sm:"center"}} justifyContent="space-between" spacing={2} sx={{mb:3}}>
      <Box><Typography variant="h5" fontWeight={700}>Mis Tareas</Typography><Typography variant="body2" color="text.secondary">Seguimiento comercial y pendientes asignados</Typography></Box>
      <Button variant="contained" startIcon={<Add/>} onClick={()=>{setForm({...blank,assigned:actor});setCreateOpen(true)}}>Crear tarea</Button>
    </Stack>
    <Stack direction={{xs:"column",sm:"row"}} spacing={2} sx={{mb:3}}>
      {[["Pendientes",counts.pending],["Vencidas",counts.overdue],["Completadas",counts.done]].map(([label,n])=><Paper key={label} variant="outlined" sx={{flex:1,p:2,cursor:"pointer"}} onClick={()=>setTab(String(label))}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="h4" fontWeight={700}>{n}</Typography></Paper>)}
    </Stack>
    <Paper variant="outlined" sx={{p:2}}>
      <Tabs value={tab} onChange={(_,v)=>setTab(v)} variant="scrollable" scrollButtons="auto" sx={{mb:2}}>
        {["Todas","Pendientes","Vencidas","Completadas"].map(t=><Tab key={t} value={t} label={t}/>)}
      </Tabs>
      <Stack direction={{xs:"column",md:"row"}} spacing={1.5} sx={{mb:2}}>
        <TextField size="small" label="Buscar tarea o cliente" value={query} onChange={e=>setQuery(e.target.value)} InputProps={{startAdornment:<Search sx={{mr:1,color:"text.secondary"}}/>}} sx={{flex:2}}/>
        <FormControl size="small" sx={{flex:1,minWidth:145}}><InputLabel>Tipo</InputLabel><Select label="Tipo" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>{["Todos",...TYPES].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{flex:1,minWidth:145}}><InputLabel>Asignado</InputLabel><Select label="Asignado" value={userFilter} onChange={e=>setUserFilter(e.target.value)}>{["Todos",...USERS].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" sx={{flex:1,minWidth:130}}><InputLabel>Fecha</InputLabel><Select label="Fecha" value={dateFilter} onChange={e=>setDateFilter(e.target.value)}>{["Todas","Hoy","Próximas"].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl>
      </Stack>
      {mobile?<Stack spacing={1}>{visible.map(t=><Paper key={t.id} variant="outlined" sx={{p:2}}><Stack direction="row" justifyContent="space-between" alignItems="center">{stateChip(t)}<Typography variant="caption">#{t.id}</Typography></Stack><Typography fontWeight={700} sx={{mt:1}}>{t.subject}</Typography><Typography variant="body2" color="text.secondary">{t.assigned} · {t.due}</Typography><Typography variant="body2">{t.related||"Sin registro relacionado"}</Typography><Button onClick={()=>openDetail(t.id)}>Ver detalle</Button></Paper>)}</Stack>:
      <TableContainer><Table size="small"><TableHead><TableRow>{["Asunto","Tipo","Asignado","Cliente / registro","Vence","Estado","Origen","Acción"].map(x=><TableCell key={x} sx={{fontWeight:700,whiteSpace:"nowrap"}}>{x}</TableCell>)}</TableRow></TableHead><TableBody>{visible.map(t=><TableRow hover key={t.id}><TableCell>{t.subject}</TableCell><TableCell>{t.type}</TableCell><TableCell>{t.assigned}</TableCell><TableCell>{t.related||"Sin relación"}</TableCell><TableCell sx={{whiteSpace:"nowrap"}}>{t.due}</TableCell><TableCell>{stateChip(t)}</TableCell><TableCell>{t.source}</TableCell><TableCell><Button size="small" startIcon={<VisibilityOutlined/>} onClick={()=>openDetail(t.id)}>Ver</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>}
      {visible.length===0&&<Typography color="text.secondary" align="center" sx={{py:5}}>No hay tareas con estos filtros.</Typography>}
    </Paper>
    <Dialog open={createOpen} onClose={()=>setCreateOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>CREAR NUEVA TAREA</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
        <TextField required label="Asunto" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/>
        <FormControl fullWidth><InputLabel>Tipo de tarea</InputLabel><Select label="Tipo de tarea" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{TYPES.map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl>
        {isManager?<FormControl fullWidth><InputLabel>Asignado a</InputLabel><Select label="Asignado a" value={form.assigned} onChange={e=>setForm({...form,assigned:e.target.value})}>{allowed.map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl>:<TextField label="Asignado a" value={actor} disabled/>}
        <Alert severity="info">Cierre: {CLOSE_RULES[form.type]?.comment?"Comentario obligatorio":"Comentario opcional"} y {CLOSE_RULES[form.type]?.evidence?"evidencia obligatoria":"evidencia opcional"} (ejemplo para validar).</Alert>
        <TextField label="Cliente / registro relacionado (opcional)" value={form.related} onChange={e=>setForm({...form,related:e.target.value})}/>
        <TextField required type="date" label="Fecha de vencimiento" InputLabelProps={{shrink:true}} value={form.due} onChange={e=>setForm({...form,due:e.target.value})}/>
        <TextField multiline minRows={3} label="Detalle / instrucciones" value={form.detail} onChange={e=>setForm({...form,detail:e.target.value})}/>
      </Stack></DialogContent><DialogActions><Button onClick={()=>setCreateOpen(false)}>Cancelar</Button><Button variant="contained" onClick={create}>Crear tarea</Button></DialogActions>
    </Dialog>
    <Dialog open={!!selectedTask} onClose={()=>setSelected(null)} maxWidth="sm" fullWidth>
      {selectedTask&&<><DialogTitle>DETALLE DE TAREA #{selectedTask.id}</DialogTitle><DialogContent>
        <Stack spacing={1.5}><Typography variant="h6">{selectedTask.subject}</Typography>{stateChip(selectedTask)}
          <Typography><b>Tipo:</b> {selectedTask.type}</Typography><Typography><b>Asignado:</b> {selectedTask.assigned}</Typography><Typography><b>Vencimiento:</b> {selectedTask.due}</Typography><Typography><b>Relacionado:</b> {selectedTask.related||"Sin registro relacionado"}</Typography><Typography><b>Origen:</b> {selectedTask.source}</Typography>
          <Typography><b>Instrucciones:</b> {selectedTask.detail||"Sin instrucciones adicionales"}</Typography>
          <Divider/><Typography fontWeight={700}>Historial de simulación</Typography>{selectedTask.history.map((h,i)=><Typography key={i} variant="body2" color="text.secondary">• {h}</Typography>)}
          <Divider/><TextField label="Comentario de ejecución (opcional)" multiline minRows={2} value={comment} onChange={e=>setComment(e.target.value)} disabled={selectedTask.status==="Completada"||!isOwner(selectedTask)}/>
          <Button component="label" variant="outlined" disabled={selectedTask.status==="Completada"||!isOwner(selectedTask)} startIcon={<EditOutlined/>>Adjuntar archivo (simulación)<input type="file" hidden onChange={e=>setEvidence(e.target.files?.[0]?.name||"")}/></Button>
          {evidence&&<Typography variant="caption">Archivo seleccionado: {evidence} (no se carga a ningún servidor)</Typography>}
          <Alert severity="info">Condiciones originales: {closeRule(selectedTask).comment?"Comentario requerido":"Comentario opcional"} y {closeRule(selectedTask).evidence?"archivo requerido":"archivo opcional"}.</Alert>
          {selectedTask.reopenReason&&<Alert severity="warning">Observación: {selectedTask.reopenReason}. Vencimiento original conservado.</Alert>}
          {selectedTask.status==="Completada"&&isManager&&!isOwner(selectedTask)&&<TextField label="Motivo obligatorio de reapertura" multiline value={reopenReason} onChange={e=>setReopenReason(e.target.value)}/>}
          {selectedTask.status==="Pendiente"&&isManager&&!isOwner(selectedTask)&&<Stack spacing={1}><FormControl size="small"><InputLabel>Nuevo asignado</InputLabel><Select label="Nuevo asignado" value={reassignTo} onChange={e=>setReassignTo(e.target.value)}>{allowed.map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</Select></FormControl><Button onClick={()=>{if(!reassignTo||reassignTo===selectedTask.assigned)return;change({assigned:reassignTo,history:[...selectedTask.history,"Reasignada por "+actor+" a "+reassignTo]});setNotice("Reasignación simulada")}}>Reasignar</Button></Stack>
        </Stack>
      </DialogContent><DialogActions><Button onClick={()=>setSelected(null)}>Cerrar</Button>
        {selectedTask.status==="Completada"?(isManager&&!isOwner(selectedTask)&&<Button color="warning" startIcon={<Replay/>} onClick={reopen}>Reabrir (supervisor)</Button>):(isOwner(selectedTask)&&<Button variant="contained" startIcon={<CheckCircleOutline/>} onClick={complete}>Completar tarea</Button>)}
      </DialogActions></>}
    </Dialog>
    <Snackbar open={!!notice} autoHideDuration={4500} onClose={()=>setNotice("")} message={notice}/>
  </Box>;
}
