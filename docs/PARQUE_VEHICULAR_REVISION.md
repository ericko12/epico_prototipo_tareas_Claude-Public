# Parque vehicular: prototipo para revisión

Repositorio y publicación: `epico_prototipo_tareas_Claude-Public` → https://ericko12.github.io/epico_prototipo_tareas_Claude-Public/Modulo/clientes/

**Versión del 23-nov-2026** (cartera por Cliente y decisiones C-1 a C-6, clar. 49 a 55), alineada con la spec SDD aprobada por el BA (SPEC-F2-005, cambio `2026-11-06-parque-vehicular`, «alta y consulta») del repositorio `epico/epico-movil`, rama `spec-f2-5/parque-vehicular`. Incluye además «Modificar» con motivo. Las referencias «clar. N» son las clarificaciones de esa spec.

## Recorrido

Clientes → buscar **529** → TRANSPORTES DEMO OCCIDENTE → Información general → Direcciones → «Parque vehicular» de una dirección.

Arriba de las Direcciones está **«Ver el prototipo como»** para cambiar de rol:

| Rol | Ve | Puede |
|---|---|---|
| Asesor (vendedor 42, tiene al Cliente 529 en su cartera) | Las tres Direcciones del Cliente | Registrar y modificar en cualquiera |
| Gerente territorial | Los Clientes de la cartera de los asesores que supervisa: las tres | Solo consultar |
| KAM | Las tres Direcciones de la Cuenta 529 | Solo consultar |
| Administrador funcional | Las tres | Modificar y usar el reporte «Valores "Otro"» |
| Soporte de datos | Las tres | Solo consultar |

**La cartera es por Cliente** (clar. 49): en Epico la Dirección no tiene vendedor. El Cliente 529 está en la cartera de Pedro (42) y de Ana (53); por eso los dos registran en las tres Direcciones, incluida BASE MONTERREY, donde Ana dejó los grupos 00126 a 00128.

La versión móvil (`diagnostico-mobile.html`, cliente 305) aplica las mismas reglas con su propio selector de rol.

## Qué cubre

- **Catálogo de Salesforce** (`features/parqueVehicular/domain/catalog.json`, copia en `public/parque-vehicular-catalog.json`), generado de la matriz del 10-nov-2026: 27 tipos con su etiqueta exacta, marcas por tipo, 14 carrocerías de autobús, 110 motores, modelos de VOLVO y MARCOPOLO. Diez tipos no tienen catálogo verificado: solo admiten «Otro». La separación de modelos VOLVO entre autobús y servicio pesado es una muestra de la regla tipo + marca (clar. 24).
- **Dos ramas:** Tipo → Marca → Modelo; en autobuses, Tipo → Carrocería → Modelo de carrocería. El motor no se filtra. Cambiar la marca no borra la carrocería (clar. 21, 25, 27).
- **«Otro (no está en la lista)»** con texto obligatorio, máximo 60, en marca, modelo, carrocería, modelo de carrocería y motor; marca «Otro» lleva modelo «Otro»; distintivo «No catalogado» (clar. 5, 28, 39, 44).
- **Obligatorios:** tipo, marca, modelo y unidades, con «Este dato es obligatorio.». Años de cuatro dígitos («Captura el año con cuatro dígitos.») y no futuros («El año no puede ser posterior a 2026.») (clar. 3, 7, 50, 51).
- **Un solo año:** el grupo se muestra con ese año, 2019 y no 2019–2019 (clar. 55).
- **Límites:** justificación de hasta 300 caracteres con contador; hasta 100 grupos por sesión, y al llegar «Guarda estos grupos antes de capturar más.» (clar. 54).
- **Valor que salió del catálogo:** el grupo queda «No guardado: Modelo «T680» ya no está disponible en el catálogo.» con el campo y el valor de que se trate (clar. 53).
- **Sesión de captura:** los grupos quedan «Sin guardar» hasta «Revisar y guardar». Ahí se señalan las coincidencias (misma configuración con años que se cruzan, o con años, motor o carrocería vacíos; «Otro» sin distinguir mayúsculas). «Guardar» se habilita al justificar o quitar cada una. El resultado se informa grupo por grupo (clar. 1, 8, 16, 35, 40, 41).
- **Detalle:** justificación de coincidencia y valor original de un campo reasignado (clar. 42).
- **Reporte del administrador:** valores «Otro» agrupados, porcentaje del mes contra la meta de 10 % y reasignación al catálogo (clar. 31, 44, 45).
- **Búsqueda al escribir** en Marca, Modelo y Motor, con «Otro» siempre visible; Tipo sin búsqueda. **Orden de los 27 tipos** por familia, con MC VI antes que MC VII. **Reporte** paginado de 25 en 25 con «Exportar a Excel» (clar. 46 a 48, pedidas en la revisión de Producto del 12-nov-2026).
- **Modificar** con motivo obligatorio; solo una modificación del asesor renueva el último levantamiento (clar. 17, 37).

**Segunda entrega, no incluida:** mover de Dirección, desactivar, reactivar, eliminar, vigencia de 12 meses, historial y migración desde Salesforce (cambio `2026-11-12-parque-vehicular-mantenimiento`).

Los datos se guardan en el navegador (`epico-tareas-fleet-review-v2` y `epico-mobile-fleet-v2`). «Notas para revisión» → «Restaurar ejemplos» vuelve a los datos iniciales.

## Verificación

- `node scripts/test-fleet.cjs`: catálogo, roles, validación, limpieza por rama, coincidencias, guardado parcial, reporte y modificación.
- `node tests/model.test.cjs`: regresión del modelo de Tareas.
- `npx tsc --noEmit` y `NEXT_PUBLIC_BASE_PATH=/epico_prototipo_tareas_Claude-Public npm run build`.
