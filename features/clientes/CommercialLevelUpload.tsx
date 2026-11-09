"use client";

import {useEffect,useState} from "react";
import {createPortal} from "react-dom";
import {Alert,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Tooltip,Typography} from "@mui/material";
import {UploadFileOutlined} from "@mui/icons-material";

const levelStorageKey = "epico:commercial-level:v1";

type Relation = {clientId:string; relationId:string; seller:string};
type Row = {number:number; clientId:string; relationId:string; level:string; error:string};

export function commercialRelations(client:{id:string;seller:string}) {
  return [
    {clientId:client.id, relationId:`CV-${client.id}-01`, seller:client.seller},
    ...(client.id==="207" ? [{clientId:client.id, relationId:"CV-207-02", seller:"YURIDIA TORRES"}] : []),
  ];
}

export default function CommercialLevelUpload({relations}:{relations:Relation[]}) {
  const [slot,setSlot]=useState<HTMLElement|null>(null);
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
      if (!headers || headers.length!==3 || headers.some((cell,i)=>String(cell).trim()!==["ClienteID","ClienteVendedorID","Nivel comercial"][i])) {
        setError("Usa las tres columnas de la plantilla en el orden indicado.");
        return;
      }
      const counts=new Map<string,number>();
      const records=values.flatMap((cells,i)=>{
        const [clientId,relationId,level]=[0,1,2].map(index=>String(cells[index]??"").trim());
        if (!clientId&&!relationId&&!level) return [];
        counts.set(relationId,(counts.get(relationId)??0)+1);
        return [{number:i+2,clientId,relationId,level}];
      });
      setRows(records.map(row=>{
        let error="";
        if (!relations.some(r=>r.clientId===row.clientId&&r.relationId===row.relationId)) error="La relación no pertenece al cliente del prototipo.";
        else if ((counts.get(row.relationId)??0)>1) error="Relación repetida en el archivo.";
        else if (!["A","AA","AAA"].includes(row.level)) error="Usa A, AA o AAA.";
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
    try {
      const saved=JSON.parse(localStorage.getItem(levelStorageKey)??"{}");
      const updatedAt=new Date().toISOString();
      for (const row of valid) {
        saved[row.relationId]={level:row.level,updatedAt,history:[...(saved[row.relationId]?.history??[]),{level:row.level,updatedAt}]};
      }
      localStorage.setItem(levelStorageKey,JSON.stringify(saved));
      setResult(`Se aplicaron ${valid.length} filas. ${rejected} rechazadas.`);
    } catch {
      setError("No se pudo guardar la carga en este navegador.");
    }
  }

  if (!slot) return null;
  return <>
    {createPortal(<Tooltip title="Cargar nivel comercial"><IconButton aria-label="Cargar nivel comercial" onClick={()=>{setRows([]);setFilename("");setError("");setResult("");setOpen(true)}}><UploadFileOutlined sx={{color:"black"}}/></IconButton></Tooltip>,slot)}
    <Dialog open={open} onClose={()=>{if (!busy) setOpen(false)}} fullWidth maxWidth="md">
      <DialogTitle>Cargar nivel comercial</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2">Selecciona un Excel con ClienteID, ClienteVendedorID y Nivel comercial. Usa únicamente datos de demostración.</Typography>
          <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
            <Button component="label" variant="outlined" disabled={busy}>Seleccionar Excel
              <input hidden type="file" accept=".xlsx" onChange={event=>{const file=event.target.files?.[0];if(file) void validate(file);event.target.value=""}}/>
            </Button>
            <Button href={(process.env.NEXT_PUBLIC_BASE_PATH||"")+"/nivel_comercial_demo.xlsx"} download>Descargar Excel de ejemplo</Button>
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
              <TableHead><TableRow>{["Fila","ClienteID","ClienteVendedorID","Nivel comercial","Resultado"].map(label=><TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
              <TableBody>{rows.map(row=><TableRow key={row.number}><TableCell>{row.number}</TableCell><TableCell>{row.clientId}</TableCell><TableCell>{row.relationId}</TableCell><TableCell>{row.level}</TableCell><TableCell>{row.error||"Válida"}</TableCell></TableRow>)}</TableBody>
            </Table></TableContainer>
          </>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={()=>setOpen(false)}>{result?"Cerrar":"Cancelar"}</Button>
        <Button variant="contained" disabled={busy||!valid.length||!!result} onClick={apply}>Aplicar carga</Button>
      </DialogActions>
    </Dialog>
  </>;
}
