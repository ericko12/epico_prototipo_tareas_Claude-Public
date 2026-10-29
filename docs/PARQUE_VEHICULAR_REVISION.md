# Parque vehicular: integración para revisión con Luis Galván

Repositorio y publicación correctos: `epico_prototipo_tareas_Claude-Public`.

## Acceso acordado

Listado de clientes existente → buscar 529 → TRANSPORTES DEMO OCCIDENTE → Información general → Direcciones → botón Parque vehicular de una dirección → listado de grupos → Registrar parque vehicular.

No se reemplazan el listado, el detalle general, Radiografía/Diagnóstico, Crear tarea ni Iniciar visita. Se reutilizan shell, tema y componentes MUI del repositorio. El acceso está en cada tarjeta de dirección, de acuerdo con el wireflow.

## Escenarios

- BASE OPERATIVA: domicilio que ya tenía el cliente 529, inicialmente sin grupos.
- DIRECCIÓN 1: dirección ficticia adicional, inicialmente con dos grupos de servicio pesado y 35 unidades.
- BASE MONTERREY: asignada a otro vendedor, excluida de consulta y captura en el demo del vendedorID 42.
- Crear, consultar, modificar y guardar otro grupo conservando la dirección.
- Años invertidos, unidades inválidas y cambio de Tipo/Marca con datos dependientes.

El buscador de clientes mantiene su comportamiento. Para entrar, escribir 529 y pulsar Buscar, o usar el escenario de Empresas existente y después abrir la fila resultante.

## Decisiones pendientes

Notas para revisión enumera la aplicabilidad de Carrocería/Modelo de carrocería (sólo autobús en el ejemplo), obligatoriedad de motor/años, catálogo canónico, duplicados/solapamientos, matriz completa de permisos y estrategia de guardado. Las reglas del demo son hipótesis para comentar, no acuerdos nuevos de SPEC.

Los grupos se guardan en localStorage bajo una clave propia de este prototipo. No hay backend ni comentarios compartidos. No se copia la base de clientes ficticios que se había agregado al repositorio de Agenda: se utiliza el cliente 529 existente.

## Verificación

- `node scripts/test-fleet.cjs`: contexto, cartera, persistencia compatible, catálogos, años y unidades.
- `node tests/model.test.cjs`: regresión del modelo de Tareas existente.
- `NEXT_PUBLIC_BASE_PATH=/epico_prototipo_tareas_Claude-Public npm run build`: tipos y exportación para la ruta publicada.
