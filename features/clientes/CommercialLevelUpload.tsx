"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {Alert,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Tooltip,Typography,TextField,FormControlLabel,Switch} from "@mui/material";
import {UploadFileOutlined} from "@mui/icons-material";

const storageKey = "epico:classification-levels:v2";
const title = "Cargar niveles del cliente";
const headersExpected = ["ClienteID","ClienteVendedorID","Nivel estratégico","Nivel comercial"];
const strategicLevels = ["7PlomoSC","7Plomo","6Bronce","5Plata","4Oro","3Platino","2Diamante","1Especial"];
const validPeriod = (period:string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(period);

type Version = {period:string; updatedAt:string; author:string; level?:string; strategic?:string};
type LevelRecord = Version & {history:Version[]};
type Levels = {accounts:Record<string,LevelRecord>; commercial:Record<string,LevelRecord>};

function readLevels(): Levels {
  const combined=localStorage.getItem(storageKey);
  return combined ? JSON.parse(combined) : {
    accounts:JSON.parse(localStorage.getItem("epico:account-classification:v1")??"{}"),
    commercial:JSON.parse(localStorage.getItem("epico:commercial-level:v1")??"{}"),
  };
}

type Relation = {clientId:string; relationId:string; seller:string};
type Row = {number:number; clientId:string; relationId:string; level:string; strategic:string; error:string; field:string; original:string[]};

export function commercialRelations(client:{id:string;seller:string}) {
  return [
    {clientId:client.id, relationId:`CV-${client.id}-01`, seller:client.seller},
    ...(client.id==="207" ? [{clientId:client.id, relationId:"CV-207-02", seller:"YURIDIA TORRES"}] : []),
  ];
}

export default function CommercialLevelUpload({relations,canUpload,setCanUpload}:{relations:Relation[];canUpload:boolean;setCanUpload:(value:boolean)=>void}) {
  const [slot,setSlot]=useState<HTMLElement|null>(null);
  const [period,setPeriod]=useState("2026-11");
  const [open,setOpen]=useState(false);
  const [filename,setFilename]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [result,setResult]=useState("");
  const [baseline,setBaseline]=useState<Levels|null>(null);
  const [changed,setChanged]=useState<string[]>([]);
  useEffect(()=>setSlot(document.getElementById("clients-toolbar-action")),[]);
  const valid=rows.filter(row=>!row.error);
  const rejected=rows.length-valid.length;

  async function validate(file:File) {
    setFilename(file.name);
    setRows([]);
    setResult("");
    setError("");
    setBusy(true);
    try {
      const {readSheet:read}=await import("read-excel-file/browser");
      const [headers,...values]=await read(file,"Clasificaciones");
      if (!headers || headers.length!==4 || headers.some((cell,i)=>String(cell).trim()!==headersExpected[i])) {
        setError("Usa los encabezados de la plantilla en el orden indicado.");
        return;
      }
      const counts=new Map<string,number>();
      const strategicByClient=new Map<string,Set<string>>();
      const records=values.flatMap((cells,i)=>{
        const original=[0,1,2,3].map(index=>String(cells[index]??""));
        const [clientId,relationId,strategic,level]=original.map(value=>value.trim());
        if (!clientId&&!relationId&&!strategic&&!level) return [];
        counts.set(relationId,(counts.get(relationId)??0)+1);
        if (clientId&&strategic) {
          const levels=strategicByClient.get(clientId)??new Set<string>();
          levels.add(strategic);
          strategicByClient.set(clientId,levels);
        }
        return [{number:i+2,clientId,relationId,strategic,level,original}];
      });
      setRows(records.map(row=>{
        let error="",field="";
        const missing=[row.clientId,row.relationId,row.strategic,row.level].findIndex(value=>!value);
        if ((strategicByClient.get(row.clientId)?.size??0)>1) {
          field="Nivel estratégico";
          error="Nivel estratégico contradictorio para el mismo cliente";
        } else if (missing>=0) {
          field=headersExpected[missing];
          error="Campo obligatorio";
        } else if (!relations.some(r=>r.clientId===row.clientId&&r.relationId===row.relationId)) {
          field="ClienteVendedorID";
          error="La relación no pertenece al cliente del prototipo.";
        } else if ((counts.get(row.relationId)??0)>1) {
          field="ClienteVendedorID";
          error="Identificador repetido en el archivo.";
        } else if (!strategicLevels.includes(row.strategic)) {
          field="Nivel estratégico";
          error="El valor no está en el catálogo de Nivel estratégico.";
        } else if (!["A","AA","AAA"].includes(row.level)) {
          field="Nivel comercial";
          error="Usa A, AA o AAA.";
        }
        return {...row,error,field};
      }));
      setBaseline(readLevels());
      setChanged([]);
      if (!records.length) setError("El archivo no contiene filas para cargar.");
    } catch {
      setError("No se pudo validar el archivo. Usa un .xlsx con la hoja Clasificaciones.");
    } finally {
      setBusy(false);
    }
  }

  function apply() {
    if (!canUpload||!validPeriod(period)||!baseline) return;
    try {
      const saved=readLevels();
      const conflicts=valid.flatMap(row=>{
        const account=saved.accounts[row.clientId];
        const commercial=saved.commercial[row.relationId];
        if (JSON.stringify(account)===JSON.stringify(baseline.accounts[row.clientId])&&
            JSON.stringify(commercial)===JSON.stringify(baseline.commercial[row.relationId])) return [];
        return [`Fila ${row.number}: Nivel estratégico vigente ${account?.strategic??"sin dato"} · Nivel comercial vigente ${commercial?.level??"sin dato"}`];
      });
      if (conflicts.length) {
        setBaseline(saved);
        setChanged(conflicts);
        return;
      }
      const updatedAt=new Date().toISOString();
      function saveLevel(records:Record<string,LevelRecord>,id:string,value:Pick<Version,"level"|"strategic">) {
        const previous=records[id];
        const history=previous?.history??[];
        const currentForPeriod=[...history].reverse().find(entry=>entry.period===period);
        if (currentForPeriod&&(value.strategic!==undefined
          ? currentForPeriod.strategic===value.strategic
          : currentForPeriod.level===value.level)) return false;
        const entry={...value,period,updatedAt,author:"Responsable Comercial · demo"};
        const current=previous?.period>period?previous:entry;
        records[id]={...current,history:[...history,entry]};
        return true;
      }
      let applied=0;
      for (const row of valid) {
        const accountChanged=saveLevel(saved.accounts,row.clientId,{strategic:row.strategic});
        const commercialChanged=saveLevel(saved.commercial,row.relationId,{level:row.level});
        if (accountChanged||commercialChanged) applied++;
      }
      localStorage.setItem(storageKey,JSON.stringify(saved));
      setChanged([]);
      setResult(`Se aplicaron ${applied} filas. ${valid.length-applied} sin cambios. ${rejected} rechazadas.`);
    } catch {
      setError("No se pudo guardar la carga en este navegador.");
    }
  }

  if (!slot) return null;
  return <>
    {createPortal(<Stack direction="row" alignItems="center">
      <FormControlLabel sx={{mr:0}} control={<Switch size="small" checked={canUpload} onChange={event=>setCanUpload(event.target.checked)}/>} label="Permiso de carga (demo)"/>
      {canUpload&&<Tooltip title={title}><IconButton aria-label={title} onClick={()=>{setRows([]);setFilename("");setError("");setResult("");setChanged([]);setBaseline(null);setOpen(true)}}><UploadFileOutlined sx={{color:"black"}}/></IconButton></Tooltip>}
    </Stack>,slot)}
    <Dialog open={open} onClose={()=>{if (!busy) setOpen(false)}} fullWidth maxWidth="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">Selecciona un Excel con {headersExpected.join(", ")}. Usa únicamente datos de demostración.</Typography>
          <TextField type="month" label="Periodo" value={period} onChange={event=>setPeriod(event.target.value)} slotProps={{inputLabel:{shrink:true}}} disabled={busy||!!result}/>
          <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
            <Button component="label" variant="outlined" disabled={busy}>Seleccionar Excel
              <input hidden type="file" accept=".xlsx" onChange={event=>{const file=event.target.files?.[0];if(file) void validate(file);event.target.value=""}}/>
            </Button>
            <Button href={(process.env.NEXT_PUBLIC_BASE_PATH||"")+"/niveles_cliente_demo.xlsx"} download>Descargar plantilla Excel</Button>
            <Typography variant="body2">{filename}</Typography>
          </Stack>
          {busy&&<Alert severity="info">Validando archivo…</Alert>}
          {error&&<Alert severity="error">{error}</Alert>}
          {result&&<Alert severity="success">{result}</Alert>}
          {changed.length>0&&<Alert severity="warning">
            Los niveles cambiaron después de la validación. Revisa los valores y confirma la carga.
            {changed.map(message=><Typography key={message} variant="body2">{message}</Typography>)}
          </Alert>}
          {rows.length>0&&<>
            <Alert severity={rejected?"warning":"success"}>{valid.length} filas válidas · {rejected} rechazadas</Alert>
            {rejected>0&&<Button sx={{alignSelf:"flex-start"}} onClick={async()=>{
              try {
                const {default:write}=await import("write-excel-file/browser");
                const report=[["Fila",...headersExpected,"Campo","Motivo"],...rows.filter(row=>row.error)
                  .map(row=>[row.number,...row.original,row.field,row.error])];
                await write(report.map(row=>row.map(value=>({value}))),{sheet:"Rechazos"}).toFile("rechazos_niveles_cliente.xlsx");
              } catch {
                setError("No se pudo generar el reporte de rechazos.");
              }
            }}>Descargar errores</Button>}
            <TableContainer sx={{maxHeight:300}}><Table size="small" stickyHeader>
              <TableHead><TableRow>{["Fila",...headersExpected,"Resultado"].map(label=><TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
              <TableBody>{rows.map(row=><TableRow key={row.number}><TableCell>{row.number}</TableCell><TableCell>{row.clientId}</TableCell><TableCell>{row.relationId}</TableCell><TableCell>{row.strategic}</TableCell><TableCell>{row.level}</TableCell><TableCell>{row.error||"Válida"}</TableCell></TableRow>)}</TableBody>
            </Table></TableContainer>
          </>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={()=>setOpen(false)}>{result?"Cerrar":"Cancelar"}</Button>
        <Button variant="contained" disabled={!canUpload||busy||!valid.length||!!result||!validPeriod(period)} onClick={apply}>{changed.length?"Confirmar carga":"Aplicar carga"}</Button>
      </DialogActions>
    </Dialog>
  </>;
}
