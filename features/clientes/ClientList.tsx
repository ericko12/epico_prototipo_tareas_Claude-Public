"use client";

import {useState} from "react";
import {Box,Button,Chip,FormControl,InputLabel,MenuItem,Paper,Select,Stack,Table,TableBody,TableCell,TableContainer,TableHead,TablePagination,TableRow,TextField,Tooltip,Typography} from "@mui/material";
import {Download,PersonSearch,Search} from "@mui/icons-material";

export type ClientListItem={
  id:string;name:string;rfc:string;phone:string;email:string;branch:string;seller:string;
  region:string;division:string;segment:string;address:string;
  bankReference:string;sellerId:string;registeredAt:string;subClassification:string;scenario:string;
};
const columns=["ID","Nombre empresa","Teléfono","Alta","Ref Bancaria","RFC","Clasificación","Sub-Clasificación","Sucursal","ID Vendedor","Vendedor"];
const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es").trim();
const displayDate=(date:string)=>date.split("-").reverse().join("/");

export default function ClientList({clients,onOpen}:{clients:ClientListItem[];onOpen:(client:ClientListItem)=>void}){
  const [query,setQuery]=useState("");
  const [submittedQuery,setSubmittedQuery]=useState<string|null>(null);
  const [branch,setBranch]=useState("");
  const [classification,setClassification]=useState("");
  const [registeredAt,setRegisteredAt]=useState("");
  const [page,setPage]=useState(0);
  const [rowsPerPage,setRowsPerPage]=useState(10);
  const rows=submittedQuery===null?[]:clients.filter(client=>
    normalize([client.id,client.name,client.seller,client.rfc,client.bankReference,client.phone,client.address].join(" ")).includes(normalize(submittedQuery))&&
    (!branch||client.branch===branch)&&(!classification||client.division===classification)&&
    (!registeredAt||client.registeredAt===registeredAt));
  const runSearch=(value=query)=>{setSubmittedQuery(value);setPage(0)};
  const selectScenario=(client:ClientListItem)=>{
    setQuery(client.id);setBranch("");setClassification("");setRegisteredAt("");runSearch(client.id);
  };
  return <>
    <Stack direction={{xs:"column",md:"row"}} justifyContent="space-between" alignItems={{md:"center"}} gap={1.5} sx={{mt:2,mb:1}}>
      <Box component="form" onSubmit={event=>{event.preventDefault();runSearch()}} sx={{display:"flex",gap:1,width:{xs:"100%",md:"min(670px,75%)"}}}>
        <TextField size="small" fullWidth placeholder="Buscar por id, nombre, vendedor, rfc, ref. bancaria o teléfono (10 dígitos)" inputProps={{"aria-label":"Buscar clientes"}} value={query} onChange={event=>setQuery(event.target.value)} InputProps={{startAdornment:<Search sx={{fontSize:18,color:"text.secondary",mr:.75}}/>}}/>
        <Button type="submit" variant="contained" sx={{minWidth:86,boxShadow:"none",bgcolor:"#1685f8",textTransform:"none"}}>Buscar</Button>
      </Box>
      <Tooltip title="La descarga de Excel no está habilitada en este prototipo."><span><Button disabled size="small" endIcon={<Download/>} sx={{textTransform:"none",whiteSpace:"nowrap"}}>Descargar xlsx</Button></span></Tooltip>
    </Stack>
    <Stack direction="row" gap={1} flexWrap="wrap" sx={{mb:1.5}}>
      <FormControl size="small" sx={{width:{xs:"calc(50% - 4px)",sm:175}}}>
        <InputLabel id="client-branch-label">Sucursal</InputLabel>
        <Select labelId="client-branch-label" label="Sucursal" value={branch} onChange={event=>{setBranch(event.target.value);setPage(0)}}>
          <MenuItem value="">Todas</MenuItem>{Array.from(new Set(clients.map(client=>client.branch))).map(value=><MenuItem key={value} value={value}>{value}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{width:{xs:"calc(50% - 4px)",sm:175}}}>
        <InputLabel id="client-classification-label">Clasificación</InputLabel>
        <Select labelId="client-classification-label" label="Clasificación" value={classification} onChange={event=>{setClassification(event.target.value);setPage(0)}}>
          <MenuItem value="">Todas</MenuItem>{Array.from(new Set(clients.map(client=>client.division))).map(value=><MenuItem key={value} value={value}>{value}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField size="small" type="date" label="Fecha de alta" InputLabelProps={{shrink:true}} value={registeredAt} onChange={event=>{setRegisteredAt(event.target.value);setPage(0)}} sx={{width:{xs:"100%",sm:175}}}/>
      {(branch||classification||registeredAt)&&<Button size="small" onClick={()=>{setBranch("");setClassification("");setRegisteredAt("");setPage(0)}} sx={{textTransform:"none"}}>Limpiar filtros</Button>}
    </Stack>
    <Paper variant="outlined" sx={{borderRadius:0,borderColor:"#edf0f3",overflow:"hidden"}}>
      <TableContainer sx={{height:{xs:390,md:460}}}>
        <Table size="small" stickyHeader aria-label="Listado de clientes" sx={{minWidth:1210,"& th":{bgcolor:"#f7f9fa",fontWeight:700,fontSize:12,whiteSpace:"nowrap",py:1.8,borderColor:"#edf0f3"},"& td":{fontSize:12,whiteSpace:"nowrap",borderColor:"#edf0f3",py:1.4}}}>
          <TableHead><TableRow>{columns.map(column=><TableCell key={column}>{column}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {rows.slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage).map(client=><TableRow hover key={client.id} tabIndex={0} aria-label={`Abrir cliente ${client.id}: ${client.name}`} onClick={()=>onOpen(client)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();onOpen(client)}}} sx={{cursor:"pointer","&:focus-visible":{outline:"2px solid #1685f8",outlineOffset:-2},"&:nth-of-type(even)":{bgcolor:"#fafbfc"}}}>
              {[client.id,client.name,client.phone,displayDate(client.registeredAt),client.bankReference,client.rfc,client.division,client.subClassification,client.branch,client.sellerId,client.seller].map((value,index)=><TableCell key={index}><Box component="span" sx={{display:"block",maxWidth:index===1?205:index===10?175:150,overflow:"hidden",textOverflow:"ellipsis"}} title={value}>{value}</Box></TableCell>)}
            </TableRow>)}
            {rows.length===0&&<TableRow><TableCell colSpan={columns.length} sx={{height:{xs:325,md:395},p:0,position:"relative"}}>
              <Stack alignItems="center" justifyContent="center" spacing={.6} sx={{position:"sticky",left:0,width:"min(100%, calc(100vw - 150px))",minWidth:230,height:"100%",textAlign:"center",whiteSpace:"normal",px:2}}>
                <PersonSearch sx={{fontSize:56,color:"#a8a8a8",mb:.5}}/>
                <Typography fontWeight={700} fontSize={13}>{submittedQuery===null?"NO HAY CLIENTES SELECCIONADOS":"NO SE ENCONTRARON CLIENTES"}</Typography>
                <Typography fontSize={12} color="text.secondary">{submittedQuery===null?"Realiza una búsqueda de clientes para abrir una caja":"Modifica la búsqueda o los filtros e inténtalo de nuevo."}</Typography>
              </Stack>
            </TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination component="div" count={rows.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_,value)=>setPage(value)} onRowsPerPageChange={event=>{setRowsPerPage(Number(event.target.value));setPage(0)}} rowsPerPageOptions={[5,10,25]} labelRowsPerPage="Filas por página:" labelDisplayedRows={({from,to,count})=>`${from}-${to} de ${count}`} getItemAriaLabel={type=>type==="next"?"Página siguiente":type==="previous"?"Página anterior":type==="first"?"Primera página":"Última página"} showFirstButton showLastButton sx={{borderTop:"1px solid #edf0f3","& .MuiTablePagination-toolbar":{flexWrap:"wrap",minHeight:50},"& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":{fontSize:12}}}/>
    </Paper>
    <Box sx={{mt:2,px:1,py:1.5}}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{mb:1}}>
        <Typography fontSize={12} fontWeight={700} color="text.secondary">Escenarios del prototipo</Typography>
        <Button size="small" onClick={()=>{setQuery("");setBranch("");setClassification("");setRegisteredAt("");runSearch("")}} sx={{textTransform:"none",fontSize:12}}>Ver todos los clientes de ejemplo</Button>
      </Stack>
      <Stack direction="row" gap={1} flexWrap="wrap">{clients.map(client=><Chip key={client.id} label={`${client.id} · ${client.scenario}`} variant="outlined" size="small" onClick={()=>selectScenario(client)} sx={{fontSize:12}}/>)}</Stack>
      <Typography fontSize={11} color="text.secondary" sx={{mt:1}}>Datos de demostración para validar escenarios. Selecciona una fila para abrir el detalle del cliente.</Typography>
    </Box>
  </>;
}
