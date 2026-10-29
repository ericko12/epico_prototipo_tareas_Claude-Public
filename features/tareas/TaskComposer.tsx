'use client';
import {useEffect,useRef,useState} from 'react';
import {Alert,Autocomplete,Button,Checkbox,Dialog,DialogActions,DialogContent,DialogTitle,FormControlLabel,MenuItem,Stack,TextField,Typography} from '@mui/material';
import {Attachment,blank,CLIENTS,fileError,Form,Link,Repeat,validateForm,VISITS,allowedFor,localDay,sellerName} from './model';
import {saveFile,downloadFile} from './storage';
import {useTasks} from './TaskContext';
import {useAgenda} from '@/features/agenda/application/AgendaContext';
import {clientIds} from '@/features/agenda/domain/agenda.data';
export function Attachments({value,onChange,disabled=false,onBusy}:{value:Attachment[];onChange:(a:Attachment[])=>void;disabled?:boolean;onBusy?:(b:boolean)=>void}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);const current=useRef(value);current.current=value;const locked=useRef(disabled);locked.current=disabled;
 const upload=async(files:File[])=>{setBusy(true);onBusy?.(true);const errors:string[]=[];let next=[...current.current];try{for(const f of files){const problem=fileError(f,next.length);if(problem){errors.push(`${f.name}: ${problem}`);continue;}try{const meta=await saveFile(f);if(locked.current){errors.push('La tarea ya no admite cambios. El archivo no se asoció.');break;}next=[...next,meta];onChange(next);}catch{errors.push(`${f.name}: no pudimos guardar el archivo. Reintenta.`);}}}finally{setBusy(false);onBusy?.(false);setError(errors.join(' '));}};
 return <Stack spacing={1}><Typography fontWeight={700}>Evidencia (opcional)</Typography><Typography variant="caption">Hasta 10 archivos · JPG/JPEG/PNG: 10 MB · PDF/DOCX/XLSX: 20 MB. Guardados solo en este navegador.</Typography>
 {!disabled&&<Button component="label" variant="outlined" disabled={busy}>Adjuntar archivos<input aria-label="Adjuntar archivos" hidden multiple type="file" accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx" onChange={e=>{void upload(Array.from(e.target.files||[]));e.target.value='';}}/></Button>}
 {busy&&<Alert severity="info">Guardando archivos…</Alert>}{error&&<Alert severity="error">{error}</Alert>}
 {value.map(a=><Stack key={a.id} direction="row" alignItems="center" spacing={1}><Button sx={{overflowWrap:'anywhere',textAlign:'left'}} onClick={()=>void downloadFile(a).catch(e=>setError(e.message))}>{a.name}</Button><Typography variant="caption">{(a.size/1024/1024).toFixed(2)} MB · asociado</Typography>{!disabled&&<Button aria-label={`Eliminar ${a.name}`} disabled={busy} color="error" onClick={()=>onChange(value.filter(x=>x.id!==a.id))}>Eliminar</Button>}</Stack>)}
 </Stack>;
}
export type ComposerProps={open:boolean;onClose:()=>void;link?:Link;creator?:string;onCreated?:()=>void;checkout?:boolean};
export function TaskComposer(props:ComposerProps){return props.open?<Editor {...props}/>:null;}
function Editor({onClose,link,creator,onCreated,checkout}:ComposerProps){
 const {actor,role,data,create}=useTasks();const agenda=useAgenda();const user=creator||actor;const key=`epico-task-draft-v3:${user}:${checkout?'checkout:'+link?.visitId:link?.clientId||'general'}`;
 const [form,setForm]=useState<Form|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[saving,setSaving]=useState(false);
 const suppressed=useRef(false);const choices=creator?[creator]:allowedFor(role,actor);
 useEffect(()=>{try{const raw=localStorage.getItem(key);setForm(raw?JSON.parse(raw):{...blank(user),link});}catch{setForm({...blank(user),link});setError('No se pudo recuperar el borrador anterior.');}},[key]);
 useEffect(()=>{if(form&&!suppressed.current){try{localStorage.setItem(key,JSON.stringify(form));}catch{setError('No se pudo conservar el borrador: almacenamiento lleno o no disponible.');}}},[form,key]);
 if(!form)return null;
 const patch=(p:Partial<Form>)=>setForm(old=>old?{...old,...p}:old);
 const repeatPatch=(p:Partial<Repeat>)=>patch({repeat:{...form.repeat!,...p}});
 const save=()=>{const message=validateForm(form);if(message){setError(message);return;}setSaving(true);try{create(form,user);suppressed.current=true;localStorage.removeItem(key);onCreated?.();onClose();}catch(e){setError((e as Error).message);}finally{setSaving(false);}};
 const permitted=(r:Link)=>role==='Otra área autorizada'||choices.includes(r.defaultOwner||data.owners[r.clientId]||user);
 const liveVisits:Link[]=Object.entries(agenda.profiles).filter(([,p])=>choices.includes(sellerName(p.label))).flatMap(([id,p])=>p.events.filter(e=>e.activityType==='visit').map(e=>({clientId:CLIENTS.find(c=>c.client.toLowerCase()===e.title.toLowerCase())?.clientId||clientIds[e.title]||'CLIENTE-'+e.title,client:e.title,address:e.address,visitId:id+':'+e.id,visitStatus:e.status})));
 const options=[...CLIENTS,...VISITS,...liveVisits].filter(permitted);
 return <Dialog open onClose={onClose} fullWidth maxWidth="sm"><DialogTitle>{checkout?'COMPROMISO DE LA VISITA':'CREAR TAREA'}</DialogTitle><DialogContent><Stack spacing={2} sx={{pt:1}}>
 <Alert severity="info">Detalle y evidencia opcionales. El comentario de resultado se captura al completar, no como conversación. Borrador recuperable en este navegador.</Alert>
 {checkout&&<Alert severity="success">Cliente y visita de origen precargados. Puedes volver y finalizar la visita aunque no guardes la tarea.</Alert>}
 <TextField required label="Asunto" inputProps={{maxLength:255}} helperText="Puedes escribir un asunto libremente. Asuntos sugeridos: pendiente de catálogo administrable." value={form.subject} onChange={e=>patch({subject:e.target.value})}/>
 <Autocomplete options={data.types} value={form.type} onChange={(_,v)=>patch({type:v||''})} renderInput={params=><TextField {...params} required label="Tipo de tarea"/>}/>
 <TextField select required label="Asignado a" disabled={choices.length<2} value={form.assigned} onChange={e=>patch({assigned:e.target.value})}>{choices.map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField>
 {link?<Alert severity="info">{link.client} · ID {link.clientId}{link.visitId?` · Visita ${link.visitId}`:''} · {link.address}</Alert>:<Autocomplete options={options} value={form.link||null} isOptionEqualToValue={(a,b)=>a.clientId===b.clientId&&a.visitId===b.visitId} getOptionLabel={r=>`${r.visitId?'Visita '+r.visitId+' · '+r.visitStatus:'Cliente '+r.clientId} · ${r.client} · ${r.address}`} onChange={(_,v)=>patch({link:v||undefined,...(role==='Otra área autorizada'&&v?{assigned:data.owners[v.clientId]||form.assigned}:{})})} renderInput={params=><TextField {...params} label="Cliente o visita (opcional)" helperText="Incluye visitas futuras, en curso, realizadas y canceladas del alcance autorizado."/>}/>}
 <TextField required type="datetime-local" label={form.repeat?'Primera repetición / vencimiento':'Vencimiento'} InputLabelProps={{shrink:true}} inputProps={{min:`${localDay()}T${new Date().toTimeString().slice(0,5)}`}} value={form.due} onChange={e=>patch({due:e.target.value})}/>
 <TextField multiline minRows={2} label="Detalle / instrucciones (opcional)" inputProps={{maxLength:4000}} value={form.detail} onChange={e=>patch({detail:e.target.value})}/>
 
 <Attachments value={form.attachments} onChange={attachments=>patch({attachments})} onBusy={setBusy}/>
 <FormControlLabel control={<Checkbox checked={!!form.repeat} onChange={(_,checked)=>patch({repeat:checked?{every:1,unit:'semanas',end:'cantidad',count:4,until:localDay(),zone:Intl.DateTimeFormat().resolvedOptions().timeZone}:undefined})}/>} label="Repetir tarea"/>
 {form.repeat&&<Stack spacing={2}><Stack direction="row" spacing={1}><TextField label="Cada" type="number" inputProps={{min:1,step:1}} value={form.repeat.every} onChange={e=>repeatPatch({every:Number(e.target.value)})}/><TextField select label="Unidad" value={form.repeat.unit} onChange={e=>repeatPatch({unit:e.target.value as Repeat['unit']})}>{['días','semanas','meses'].map(x=><MenuItem key={x} value={x}>{x}</MenuItem>)}</TextField></Stack>
 <TextField select label="Termina por" value={form.repeat.end} onChange={e=>repeatPatch({end:e.target.value as Repeat['end']})}><MenuItem value="cantidad">Cantidad de repeticiones</MenuItem><MenuItem value="fecha">Fecha final</MenuItem></TextField>
 {form.repeat.end==='cantidad'?<TextField label="Número de repeticiones" type="number" inputProps={{min:1,max:500}} value={form.repeat.count} onChange={e=>repeatPatch({count:Number(e.target.value)})}/>:<TextField type="date" label="Fecha final" InputLabelProps={{shrink:true}} value={form.repeat.until} onChange={e=>repeatPatch({until:e.target.value})}/>}
 <Typography variant="caption">Zona: {form.repeat.zone}. Vence el mismo día a la hora indicada. Día mensual inexistente: último día del mes; fines de semana y feriados sin desplazamiento. Cada repetición conserva su propio estado. El simulador genera hasta 500 repeticiones; se materializan al abrir o avanzar el día simulado.</Typography>
 <Alert severity="info">Las repeticiones nuevas comienzan sin comentario ni archivos; podrás agregarlos opcionalmente en cada tarea.</Alert></Stack>}
 {error&&<Alert severity="error">{error}</Alert>}
 </Stack></DialogContent><DialogActions sx={{flexWrap:'wrap'}}><Button onClick={()=>{suppressed.current=true;localStorage.removeItem(key);onClose();}}>Descartar borrador</Button><Button onClick={onClose}>Volver y conservar</Button><Button variant="contained" disabled={busy||saving} onClick={save}>Crear tarea</Button></DialogActions></Dialog>;
}
