import {initialProfiles,clientIds} from '@/features/agenda/domain/agenda.data';
export const TYPES = [
'Actualizacion de Datos de Contacto','Actualizacion de informacion','Actualizacion de Nivel Comercial','Análisis de cliente','Aprendizaje coacheo','Cotización','Creación de Contactos','Creación propuesta','Descarga información digital','Entrega apoyo Trade Marketing','Entrega de beneficio','Envío correo electrónico','Extraordinaria MDG','Inventario de consigna','Lanzamiento campaña','Levantamiento punto de venta','Llamada a cliente','Llamada a prospecto','Llamada a UdeN','MDG','Mercancía a bordo','NC con acción correctiva','NC con acción correctiva inmediata','Preparación de cobranza','Programar reunión','Programar visita','Proyecto MDG','Reactivación mensual','Recolección de garantía','Revisión parque vehicular','Revision y Validacion de Datos de Contacto','Validacion y Actualizacion Nivel Comercial','NC Mayor','NC Menor','Riesgo Alto','Riesgo Bajo','Riesgo Medio','NC-Google','NC Mystery Shopper','Extintores'];
export type Role = 'Asesor'|'Gerente regional'|'Gerente territorial'|'Gerente nacional'|'Otra área autorizada'|'Administrador';
export const ROLES:Role[]=['Asesor','Gerente regional','Gerente territorial','Gerente nacional','Otra área autorizada','Administrador'];
export const SELLERS=['Luis Galván','Yuridia Torres','Asesor comercial','Alicia Cerna','Arturo Hernández'];
export const sellerName=(name:string)=>name==='Luis Galvan'?'Luis Galván':name==='Yuridia Maribel Torres'?'Yuridia Torres':name;
export const localDay=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
export type Link={clientId:string;client:string;address:string;addressId?:string;visitId?:string;eventId?:string;visitStatus?:string;defaultOwner?:string};
const BASE_CLIENTS:Link[]=[
{clientId:'207',client:'REFACCIONARIA DEL BAJÍO',address:'Av. Constituyentes, Querétaro'},
{clientId:'315',client:'TALLER SAN JOSÉ',address:'Col. Centro, Guadalajara'},
{clientId:'131',client:'ANDRADE AVIÑA JESUS',address:'Tesistán, Zapopan, Jalisco'},
{clientId:'CLI-1001',client:'Refaccionaria El Volante',address:'Río Nilo 2250, Tonalá'},
{clientId:'418',client:'MOTO REFACCIONES DEL CENTRO',address:'Guadalajara'},
{clientId:'529',client:'TRANSPORTES DEMO OCCIDENTE',address:'Tonalá'}];
export const CLIENTS:Link[]=Array.from(new Map([...Object.values(initialProfiles()).flatMap(p=>p.clients.map(c=>({clientId:clientIds[c[0]]||'CLIENTE-'+c[0],client:c[0],address:c[1],defaultOwner:sellerName(p.label)}))),...BASE_CLIENTS.map(c=>({...c,defaultOwner:c.clientId==='315'?'Yuridia Torres':'Luis Galván'}))].map(c=>[c.clientId,c])).values());
export const VISITS:Link[]=['Programada','En curso','Realizada','Cancelada'].map((visitStatus,i)=>({...CLIENTS[i%2],visitId:`VIS-${410+i}`,visitStatus}));
export type Attachment={id:string;name:string;size:number;mime:string;uploadedAt?:string;uploadedBy?:string};
export type ClosureCycle={closedAt:string;closedBy:string;comment:string;attachments:Attachment[];reopenedAt?:string;reopenReason?:string};
export type Task={id:string;subject:string;type:string;assigned:string;due:string;detail:string;comment:string;attachments:Attachment[];link?:Link;status:'Pendiente'|'Completada'|'Cancelada';history:string[];reason?:string;creator:string;seriesId?:string;source:'Manual'|'Recurrente';evidenceRequired?:boolean;cycles?:ClosureCycle[];creatorArea?:string;pendingReassignment?:boolean;reassignmentSupervisor?:string;reassignmentReason?:string};
export type Repeat={every:number;unit:'días'|'semanas'|'meses'|'años';weekdays?:number[];monthDay?:number;annualMonth?:number;annualDay?:number;end:'fecha'|'cantidad';until:string;count:number;zone:string};
export type Form={subject:string;type:string;assigned:string;due:string;detail:string;comment:string;attachments:Attachment[];link?:Link;repeat?:Repeat;id:string;evidenceRequired?:boolean;creatorArea?:string};
export type Series={id:string;creator:string;template:Form;active:boolean;history:string[];suspendedReason?:string};
export const blank=(actor:string):Form=>({id:uid(),subject:'',type:TYPES[0],assigned:actor,due:`${localDay()}T17:00`,detail:'',comment:'',attachments:[]});
export const isOpen=(t:Task)=>t.status==='Pendiente';
export const overdue=(t:Task,now:string)=>isOpen(t)&&t.due<now;
export const managers=(r:Role)=>r.startsWith('Gerente');
export function actorFor(role:Role,seller:string){return role==='Asesor'?seller:role;}
export function allowedFor(role:Role,actor:string){return role==='Administrador'?SELLERS:role==='Asesor'?[actor]:managers(role)?[actor,...SELLERS,...(role==='Gerente nacional'?['Gerente regional','Gerente territorial']:role==='Gerente territorial'?['Gerente regional']:[])]:role==='Otra área autorizada'?SELLERS:[];}
export const canSee=(t:Task,actor:string,role:Role)=>t.assigned===actor||t.creator===actor||managers(role)&&(allowedFor(role,actor).includes(t.assigned)||t.pendingReassignment&&t.reassignmentSupervisor===actor);
export const canManage=(t:Task,actor:string,role:Role)=>managers(role)&&allowedFor(role,actor).includes(t.assigned);
export function fileError(file:{name:string;size:number},count:number){
 const ext=file.name.split('.').pop()?.toLowerCase()||'';
 if(!['jpg','jpeg','png','pdf','docx','xlsx'].includes(ext))return 'Formato no permitido. Usa JPG, JPEG, PNG, PDF, DOCX o XLSX.';
 const max=['jpg','jpeg','png'].includes(ext)?10:20;
 if(file.size>max*1024*1024)return `El archivo supera ${max} MB. Selecciona uno más ligero.`;
 if(count>=10)return 'Puedes agregar hasta 10 archivos por tarea.';
 return '';
}
// Advance from the original day, so Jan 31 -> Feb 28 -> Mar 31.
export function occurrence(start:string,repeat:Repeat,index:number){
 const [date,time]=start.split('T');const [y,m,d]=date.split('-').map(Number);let target:Date;
 if(repeat.unit==='semanas'&&repeat.weekdays?.length){
  // La primera ocurrencia es la primera fecha seleccionada en o después del inicio.
  const days=[...new Set(repeat.weekdays)].sort((a,b)=>a-b);
  const first=new Date(Date.UTC(y,m-1,d));const monday=(first.getUTCDay()+6)%7;
  const offsets:number[]=[];
  for(let week=0;week<500;week+=repeat.every){for(const day of days){const offset=week*7+day-monday;if(offset>=0)offsets.push(offset);if(offsets.length>index)break;}if(offsets.length>index)break;}
  target=new Date(Date.UTC(y,m-1,d+ (offsets[index]??index*repeat.every*7)));
 }else if(repeat.unit==='meses'||repeat.unit==='años'){
  const month=repeat.unit==='años'?(repeat.annualMonth||m)-1:m-1;
  const shift=repeat.unit==='años'?index*repeat.every*12:index*repeat.every;
  const base=new Date(Date.UTC(y,month+shift,1));
  const last=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth()+1,0)).getUTCDate();
  const day=repeat.unit==='años'?(repeat.annualDay||d):(repeat.monthDay||d);
  target=new Date(Date.UTC(base.getUTCFullYear(),base.getUTCMonth(),Math.min(day,last)));
  if(repeat.unit==='años'&&target<new Date(Date.UTC(y,m-1,d)))target=new Date(Date.UTC(y+repeat.every*(index+1),month,Math.min(day,new Date(Date.UTC(y+repeat.every*(index+1),month+1,0)).getUTCDate())));
 }else target=new Date(Date.UTC(y,m-1,d+index*repeat.every*(repeat.unit==='semanas'?7:1)));
 return `${target.toISOString().slice(0,10)}T${time}`;
}
export function validateForm(f:Form){
 if(!f.subject.trim()||!f.type||!f.assigned||!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(f.due))return 'Completa asunto, tipo, responsable y vencimiento.';
 if(f.subject.length>255)return 'El asunto no puede superar los 255 caracteres.';
 if(f.detail.length>4000)return 'El detalle no puede superar los 4000 caracteres.';
 if(f.comment.length>4000)return 'El comentario no puede superar los 4000 caracteres.';
 if(f.due<`${localDay()}T${new Date().toTimeString().slice(0,5)}`)return 'Selecciona una fecha y hora de vencimiento posterior a la actual.';
 if(f.repeat){const r=f.repeat;if(r.unit==='semanas'&&r.weekdays&&(!r.weekdays.length||r.weekdays.some(d=>d<0||d>6)))return 'Selecciona al menos un día válido de la semana.';if(!Number.isInteger(r.every)||r.every<1)return 'El intervalo debe ser un entero mayor a cero.';if(r.end==='cantidad'&&(!Number.isInteger(r.count)||r.count<1||r.count>500))return 'Usa de 1 a 500 repeticiones en este simulador.';if(r.end==='fecha'&&(!r.until||r.until<f.due.slice(0,10)))return 'La fecha final debe ser igual o posterior al inicio.';}
 return '';
}
export function taskFrom(f:Form,creator:string,evidenceRequired=false):Task{return {id:f.id,subject:f.subject.trim(),type:f.type,assigned:f.assigned,due:f.due,detail:f.detail,comment:f.comment,attachments:f.attachments,link:f.link,status:'Pendiente',history:[`Creada por ${creator} · ${new Date().toLocaleString('es-MX')}`],creator,source:'Manual',evidenceRequired,cycles:[],creatorArea:f.creatorArea};}
export function generate(series:Series[],existing:Task[],through:string){
 const result=[...existing];const ids=new Set(result.map(t=>t.id));
 for(const s of series){if(!s.active||!s.template.repeat)continue;const r=s.template.repeat;
  for(let i=0;i<(r.end==='cantidad'?r.count:500);i++){
   const due=occurrence(s.template.due,r,i);if(r.end==='fecha'&&due.slice(0,10)>r.until)break;if(due.slice(0,10)>through)break;
   const id=`${s.id}:${i}`;if(ids.has(id))continue;
   result.push({...taskFrom({...s.template,id,due,comment:'',attachments:[]},s.creator,!!s.template.evidenceRequired),seriesId:s.id,source:'Recurrente',history:[`Repetición ${i+1} · serie de ${s.creator} · zona ${r.zone}`]});ids.add(id);
  }
 }
 return result;
}
export function transfer(tasks:Task[],clientId:string,newOwner:string,actor:string){return tasks.map(t=>isOpen(t)&&t.link?.clientId===clientId?{...t,assigned:newOwner,history:[...t.history,`Cambio de asesor del cliente: ${t.assigned} → ${newOwner} · ${actor}`]}:t);}
