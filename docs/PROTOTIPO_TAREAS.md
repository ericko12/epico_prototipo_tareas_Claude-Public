# Prototipo Mis Tareas — SPEC-F2-003

## Objetivo
Simular exclusivamente **Tareas/Pendientes** dentro del shell de Épico. Sugerir ruta y Desviaciones del día quedan separados y no forman parte de esta pantalla.

## Navegación
Menú **Seguimiento comercial → Mis Tareas**, ruta `/Tareas`. Se conserva el resto del proyecto.

## Funciones simuladas
- Tabla en escritorio y tarjetas en móvil; buscar y filtrar por tipo, asignado, fecha y estado.
- Contadores de pendientes, vencidas y completadas.
- Crear tarea manual con asunto, tipo, responsable, vencimiento, detalle y cliente/registro opcional.
- Abrir detalle, completar tarea, registrar comentario y seleccionar nombre de archivo como evidencia.
- Reabrir tareas completadas (acción etiquetada como supervisor).
- Historial sencillo local; tareas automáticas **solo como ejemplos precargados**, sin motor automático.

## Reglas de demostración, NO confirmadas en negocio
- `Vencida` se deriva de fecha de vencimiento anterior al día y estado pendiente.
- `Enviar documentación` exige evidencia antes de completar.
- La opción reabrir se presenta sin autenticación real; NO valida jerarquía de supervisores.
- Tipos, nombres, clientes y números de tarea son datos ficticios.
- No hay cargas reales, notificaciones, persistencia, APIs, ni integraciones con Salesforce.
- El catálogo de tipos y los permisos permanecen sujetos a discovery.

## Validaciones necesarias
Columnas definitivas y su orden, filtros aprobados, catálogo real de tipos y restricciones por rol/área, campos obligatorios condicionales, permisos de supervisión, estados y reglas de reapertura, recordatorios, automatizaciones y notificaciones.

## Cómo ejecutar
`npm ci && npm run dev`, abrir `http://localhost:3000/Tareas`. Para compilación estática, `npm run build`.

## Nota
Pantalla de discovery para validar interacción con Key Users; **no implica aprobación funcional ni Ready for Dev**.
