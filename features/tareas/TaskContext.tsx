'use client';
import {createContext,useContext,useEffect,useRef,useState,ReactNode} from 'react';
import {Task,Series,Role,Form,TYPES,CLIENTS,SELLERS,localDay,uid,blank,taskFrom,generate,transfer,allowedFor,actorFor,managers} from './model';
type Data={tasks:Task[];series:Series[];types:string[];retiredTypes?:string[];suggestedSubjects?:Record<string,string[]>;owners:Record<string,string>};
const KEY='epico-tareas-v3';
function seed():Data{const f=blank(SELLERS[0]);return {tasks:[{...taskFrom({...f,subject:'Enviar propuesta comercial',type:'Creación propuesta',due:`${localDay()}T09:00`,link:CLIENTS[0]},SELLERS[0]),id:'demo-1'},{...taskFrom({...f,subject:'Entregar material publicitario',type:'Entrega apoyo Trade Marketing',assigned:SELLERS[1],link:CLIENTS[1]},'Otra área autorizada'),id:'demo-2'}],series:[],types:TYPES,retiredTypes:[],suggestedSubjects:{},owners:Object.fromEntries(CLIENTS.map((c,i)=>[c.clientId,c.defaultOwner||SELLERS[0]]))};}
type Context={data:Data;ready:boolean;role:Role;setRole:(r:Role)=>void;seller:string;setSeller:(v:string)=>void;actor:string;simDay:string;setSimDay:(d:string)=>void;now:string;adminSeries:boolean;setAdminSeries:(v:boolean)=>void;commit:(fn:(d:Data)=>Data)=>void;create:(f:Form,creator?:string)=>void;changeOwner:(clientId:string,owner:string)=>void};
const C=createContext<Context|null>(null);
export const useTasks=()=>{const c=useContext(C);if(!c)throw Error('TaskProvider missing');return c;};
export function TaskProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<Data>({tasks:[],series:[],types:TYPES,owners:{}}),ref=useRef(data);const [ready,setReady]=useState(false);
 const [role,setRole]=useState<Role>('Asesor'),[seller,setSeller]=useState(SELLERS[0]),[simDay,setSimDay]=useState(localDay()),[adminSeries,setAdminSeries]=useState(false);
 const actor=actorFor(role,seller);const now=`${simDay}T${new Date().toTimeString().slice(0,5)}`;
 const commit=(fn:(d:Data)=>Data)=>{const next=fn(ref.current);localStorage.setItem(KEY,JSON.stringify(next));ref.current=next;setData(next);};
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);const next=raw?JSON.parse(raw):seed();ref.current=next;setData(next);}catch{const next=seed();ref.current=next;setData(next);}setReady(true);},[]);
 useEffect(()=>{if(!ready)return;try{const next=generate(ref.current.series,ref.current.tasks,simDay);if(next.length!==ref.current.tasks.length)commit(d=>({...d,tasks:next}));}catch{/* UI operations report storage errors. */}},[ready,simDay]);
 const create=(f:Form,creator=actor)=>{
  if(!navigator.onLine)throw Error('Sin conexión. Conservamos el borrador; envíalo manualmente al recuperar conexión.');
  // Contextual client/checkout actions operate as the seller; they do not inherit an admin simulator role.
  const choices=creator===actor?allowedFor(role,actor):[creator];if(!choices.includes(f.assigned))throw Error('Responsable fuera de tu alcance autorizado.');
  if(!ref.current.types.includes(f.type))throw Error('Este tipo ya no está disponible. Selecciona otro.');
  commit(d=>{if(d.tasks.some(t=>t.id===f.id)||d.series.some(s=>s.id===f.id))return d;
   if(f.repeat){const series=[...d.series,{id:f.id,creator,template:f,active:true,history:['Serie creada']}];return {...d,series,tasks:generate(series,d.tasks,simDay)};}
   return {...d,tasks:[taskFrom(f,creator),...d.tasks]};
  });
 };
 const changeOwner=(clientId:string,owner:string)=>{if(!managers(role))throw Error('Solo gerencia cambia la asignación de cartera en esta demostración.');if(!allowedFor(role,actor).includes(owner))throw Error('Asesor fuera de alcance.');commit(d=>({...d,owners:{...d.owners,[clientId]:owner},tasks:transfer(d.tasks,clientId,owner,actor),series:d.series.map(s=>s.template.link?.clientId===clientId?{...s,template:{...s.template,assigned:owner},history:[...s.history,'Responsable actualizado por cambio de cartera']}:s)}));};
 return <C.Provider value={{data,ready,role,setRole,seller,setSeller,actor,simDay,setSimDay,now,adminSeries,setAdminSeries,commit,create,changeOwner}}>{children}</C.Provider>;
}
