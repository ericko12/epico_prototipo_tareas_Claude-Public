"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {Alert,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Tooltip,Typography,TextField,FormControlLabel,Switch} from "@mui/material";
import {UploadFileOutlined} from "@mui/icons-material";

const levelStorageKey = "epico:commercial-level:v1";

type Relation = {clientId:string; relationId:string; seller:string};
type Row = {number:number; clientId:string; relationId:string; level:string; strategic:string; error:string};

export function commercialRelations(client:{id:string;seller:string}) {
  return [
    {clientId:client.id, relationId:`CV-${client.id}-01`, seller:client.seller},
    ...(client.id==="207" ? [{clientId:client.id, relationId:"CV-207-02", seller:"YURIDIA TORRES"}] : []),
  ];
}

export default function CommercialLevelUpload({relations,canUpload,setCanUpload}:{relations:Relation[];canUpload:boolean;setCanUpload:(value:boolean)=>void}) {
  const [slot,setSlot]=useState<HTMLElement|null>(null);
  const [mode,setMode]=useState("commercial");
  const [period,setPeriod]=useState("2026-11");
  const commercial=mode==="commercial";
  const title=commercial?"Cargar nivel comercial":"Cargar nivel estratégico y GEC";
  const headersExpected=commercial?["ClienteID","ClienteVendedorID","Nivel comercial"]:["ClienteID","Nivel estratégico","GEC"];
  const [open,setOpen]=useState(false);
  const [filename,setFilename]=useState("");
  const [rows,setRows]=useState<Row[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [result,setResult]=useState("");
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
      const [headers,...values]=await read(file);
      if (!headers || headers.length!==3 || headers.some((cell,i)=>String(cell).trim()!==headersExpected[i])) {
        setError("Usa las tres columnas de la plantilla en el orden indicado.");
        return;
      }
      const counts=new Map<string,number>();
      const records=values.flatMap((cells,i)=>{
        const [clientId,relationId,level]=[0,1,2].map(index=>String(cells[index]??"").trim());
        if (!clientId&&!relationId&&!level) return [];
        const key=commercial?relationId:clientId;
        counts.set(key,(counts.get(key)??0)+1);
        return [{number:i+2,clientId,relationId:commercial?relationId:clientId,strategic:commercial?"":relationId,level}];
      });
      setRows(records.map(row=>{
        let error="";
        if (!relations.some(r=>r.clientId===row.clientId&&(!commercial||r.relationId===row.relationId))) error=commercial?"La relación no pertenece al cliente del prototipo.":"Cliente desconocido.";
        else if ((counts.get(row.relationId)??0)>1) error="Identificador repetido en el archivo.";
        else if (commercial&&!["A","AA","AAA"].includes(row.level)) error="Usa A, AA o AAA.";
        else if (!commercial&&(!row.strategic||!row.level)) error="Completa Nivel estratégico y GEC.";
        return {...row,error};
      }));
      if (!records.length) setError("El archivo no contiene filas para cargar.");
    } catch {
      setError("No se pudo leer el archivo. Selecciona un Excel .xlsx válido.");
    } finally {
      setBusy(false);
    }
  }

  function apply() {
    if (!canUpload||!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return;
    const storageKey=commercial?levelStorageKey:"epico:account-classification:v1";
    try {
      const saved=JSON.parse(localStorage.getItem(storageKey)??"{}");
      const updatedAt=new Date().toISOString();
      let applied=0;
      for (const row of valid) {
        const previous=saved[row.relationId];
        const history=previous?.history??[];
        const currentForPeriod=[...history].reverse().find((entry:{period?:string})=>entry.period===period);
        if (currentForPeriod?.level===row.level&&currentForPeriod?.strategic===row.strategic) continue;
        const entry={level:row.level,strategic:row.strategic,period,updatedAt,author:"Responsable Comercial · demo"};
        const current=previous?.period>period?previous:entry;
        saved[row.relationId]={...current,history:[...history,entry]};
        applied++;
      }
      localStorage.setItem(storageKey,JSON.stringify(saved));
      setResult(`Se aplicaron ${applied} filas. ${valid.length-applied} sin cambios. ${rejected} rechazadas.`);
    } catch {
      setError("No se pudo guardar la carga en este navegador.");
    }
  }

  if (!slot) return null;
  return <>
    {createPortal(<Stack direction="row" alignItems="center">
      <FormControlLabel sx={{mr:0}} control={<Switch size="small" checked={canUpload} onChange={event=>setCanUpload(event.target.checked)}/>} label="Permiso de carga (demo)"/>
      {canUpload&&<Tooltip title="Cargar nivel comercial"><IconButton aria-label="Cargar nivel comercial" onClick={()=>{setMode("commercial");setRows([]);setFilename("");setError("");setResult("");setOpen(true)}}><UploadFileOutlined sx={{color:"black"}}/></IconButton></Tooltip>}
      {canUpload&&<Button size="small" onClick={()=>{setMode("account");setRows([]);setFilename("");setError("");setResult("");setOpen(true)}}>Cargar nivel estratégico y GEC</Button>}
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
            <Button href={(process.env.NEXT_PUBLIC_BASE_PATH||"")+(commercial?"/nivel_comercial_demo.xlsx":"/nivel_estrategico_gec_demo.xlsx")} download>Descargar Excel de ejemplo</Button>
            <Typography variant="body2">{filename}</Typography>
          </Stack>
          {busy&&<Alert severity="info">Validando archivo…</Alert>}
          {error&&<Alert severity="error">{error}</Alert>}
          {result&&<Alert severity="success">{result}</Alert>}
          {rows.length>0&&<>
            <Alert severity={rejected?"warning":"success"}>{valid.length} filas válidas · {rejected} rechazadas</Alert>
            {rejected>0&&<Button sx={{alignSelf:"flex-start"}} onClick={()=>{
              const report=rows.filter(row=>row.error).map(row=>`${row.number},"${row.error}"`).join("\r\n");
              const url=URL.createObjectURL(new Blob(["\ufeffFila,Motivo\r\n",report],{type:"text/csv;charset=utf-8"}));
              const link=document.createElement("a");
              link.href=url;
              link.download="errores_nivel_comercial.csv";
              link.click();
              setTimeout(()=>URL.revokeObjectURL(url),1000);
            }}>Descargar errores</Button>}
            <TableContainer sx={{maxHeight:300}}><Table size="small" stickyHeader>
              <TableHead><TableRow>{["Fila",...headersExpected,"Resultado"].map(label=><TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
              <TableBody>{rows.map(row=><TableRow key={row.number}><TableCell>{row.number}</TableCell><TableCell>{row.clientId}</TableCell><TableCell>{commercial?row.relationId:row.strategic}</TableCell><TableCell>{row.level}</TableCell><TableCell>{row.error||"Válida"}</TableCell></TableRow>)}</TableBody>
            </Table></TableContainer>
          </>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={()=>setOpen(false)}>{result?"Cerrar":"Cancelar"}</Button>
        <Button variant="contained" disabled={!canUpload||busy||!valid.length||!!result||!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)} onClick={apply}>Aplicar carga</Button>
      </DialogActions>
    </Dialog>
  </>;
}
