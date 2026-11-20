# Contactos por dirección: prototipo para revisión

Repositorio y publicación: `epico_prototipo_tareas_Claude-Public` → https://ericko12.github.io/epico_prototipo_tareas_Claude-Public/Modulo/clientes/

**Versión del 20-nov-2026**, alineada con la spec SDD del cambio `2026-11-19-contactos-por-direccion` (SPEC-F2-006) del repositorio `epico/epico-movil`, rama `release/1.0.0-contactos-por-direccion`. Las referencias «clar. N» son las filas de su `clarifications.md`. La spec todavía no tiene gate P.

## Recorrido

1. Clientes → buscar **529** → TRANSPORTES DEMO OCCIDENTE → Información general → Direcciones → «Contactos (n)» de una dirección.
2. En la ficha del cliente, el botón **CONTACTO: 1 - TRANSPORTES DEMO OCCIDENTE ▾** abre los contactos del cliente (alta desde el cliente).

**Versión móvil:** https://ericko12.github.io/epico_prototipo_tareas_Claude-Public/diagnostico-mobile.html?clientId=305 → cliente **305** → Información general → Direcciones → «Contactos (n)». El botón «Editar» del encabezado CONTACTO abre los contactos del cliente. Usa las mismas reglas en `public/contactos-mobile.js` y guarda en `epico-mobile-contactos-v1`.

El panel morado **«SIMULACIÓN · no es parte del producto»** permite cambiar entre «Puede editar contactos» y «Solo consulta», simular que Logística inactiva la dirección y restaurar los ejemplos.

## Qué cubre

- **Contactos de la dirección:** primero quien «Decide la compra» y después por nombre, sin buscador, filtros ni paginación (clar. 12). Cada tarjeta muestra área, teléfonos con extensión, correos y «También en» las otras direcciones.
- **Sin dirección asociada:** los contactos del cliente que no tienen ninguna dirección, aparte y sin presentarlos como error. Desde ahí se asocian a la dirección, sin confirmación (clar. 15).
- **En otras direcciones del cliente:** un contacto puede estar en varias direcciones, y su área, decisor, teléfonos y correos son los mismos en todas (clar. 3 y 5).
- **Alta desde la dirección:** formulario basado en el de Épico (CLIENTE fijo, NOMBRE, filas TELÉFONO / EXT. / CORREO con «Agregar teléfono o correo», Cerrar y Guardar), con la DIRECCIÓN como contexto y dos campos nuevos: **Área de contacto** (lista, obligatoria) y **Decide la compra** (clar. 2, 11, 18).
- **Alta desde el cliente:** mismo formulario; el contacto queda «Sin dirección asociada» (clar. 10).
- **Validación como hoy:** Nombre, Teléfono y Correo obligatorios en la primera fila, 10 dígitos por teléfono y extensión opcional de hasta 5 dígitos, habilitada al tener 10 (clar. 6 y 16). Cerrar con cambios pide confirmación, como «Cerrar creación» en Épico.
- **Contactos heredados:** se consultan con el faltante señalado («Área: falta», «Correo: falta») y lo piden al editar (clar. 6, 11). El registro «COMPRAS» muestra el caso de un contacto que es un área (clar. 19).
- **Inactivar vínculo:** motivo de la lista («Ya no trabaja ahí», «Cambió de dirección», «Dato capturado por error», «Otro» con texto). El contacto sigue en el cliente y en sus otras direcciones. Volver a asociarlo crea otro periodo en el histórico (clar. 13 y 14).
- **Dirección inactiva:** sus vínculos pasan al histórico con el motivo «Dirección inactiva» y no se puede agregar ni asociar. Quien no tenía otra dirección queda «Sin dirección asociada» (clar. 8).

## No incluido

- Búsqueda de coincidencias, contacto compartido entre clientes, alcance local/central, entrega a Crédito y campañas, migración de Salesforce: cambio `2026-11-20-contactos-persona-y-migracion`.
- Asociación masiva al arranque (clar. 9): el cliente 529 tiene tres direcciones, así que no aplica. Las reglas están en el dominio, no en pantalla.
- El alcance por cartera (clar. 17) no se simula: la lista de direcciones sigue el selector de rol de Parque vehicular.

Los datos se guardan en el navegador (`epico-tareas-contactos-v1`). «Restaurar ejemplos» vuelve a los datos iniciales.

## Verificación

- `node tests/contactos.test.cjs`: 16 verificaciones de las reglas (vista por dirección, faltantes, obligatorios, alta, asociación sin duplicar, varias direcciones, inactivación, nuevo periodo y dirección inactiva).
- `npx tsc --noEmit` y `next build` sin errores.
- Recorrido en el navegador: escritorio y 320 px, sin desborde horizontal de la página y sin errores en consola.
- Versión móvil (cliente 305) recorrida a 320 px: asociar, alta con validación, inactivar con «Otro», dirección inactiva, contactos desde el encabezado y alta desde el cliente. Los demás clientes conservan su diálogo de contacto y Parque vehicular sigue igual.
