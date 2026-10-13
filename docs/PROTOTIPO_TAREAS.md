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

## Corte funcional 13-10-2026 — SPEC-F2-003 v0.5
- Roles simulados: Asesor, Gerente regional, territorial y nacional, con jerarquía ficticia. No sustituye una autorización backend real.
- El asesor únicamente se autoasigna tareas. La gerencia asigna/reasigna dentro de su estructura.
- Solo el asignado puede completar. Reapertura con motivo únicamente por supervisor de su alcance.
- Se usan requisitos de cierre por tipo (comentario, archivo, ambos o ninguno) como **ejemplos no validados**.
- Cada nueva tarea conserva copia de las condiciones del tipo al crearla. Las tareas precargadas utilizan la configuración demostrativa predeterminada.
- Una tarea reabierta mantiene vencimiento original e historial. El motivo debe atenderse para un nuevo cierre.
- **Limitación del simulador:** elegir un archivo solo guarda el nombre, no los bytes; no hay validación real de archivos, permisos, persistencia ni API.
- **Pendientes Luis Galván:** catálogo y cierre por tipo reales; campos editables; excepciones de áreas transversales; jerarquía efectiva; columnas/filtros; automatizaciones; avisos/SLA; cancelación/reprogramación; evidencia corregida y migración histórica.
