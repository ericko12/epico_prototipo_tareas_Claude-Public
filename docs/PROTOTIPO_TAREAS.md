# Prototipo de Tareas — acuerdos del 27 de octubre de 2026

La ruta `/Tareas/` conserva el shell y componentes MUI de Épico. Los datos son ficticios y se conservan únicamente en el navegador; no hay autenticación, backend ni integración con Salesforce.

## Flujos disponibles

- Catálogo inicial con los 40 nombres entregados por el BA. Administrador puede agregar, editar y retirar tipos; las tareas existentes conservan su denominación histórica.
- Todos los tipos usan campos comunes. Comentario y evidencia visibles y opcionales; completar nunca exige esos campos, tampoco después de una reapertura.
- Crear desde Mis Tareas, desde la ficha de cliente o durante el checkout. Los tres accesos comparten la misma bandeja y persistencia. Checkout conserva cliente y visita; un fallo de tarea no impide cerrar la visita.
- Vínculos exclusivamente a cliente y visita. Se ofrecen visitas de todas las situaciones autorizadas, incluidas realizadas y canceladas, sin alterar sus estados. No se vinculan cotizaciones ni pedidos (aunque sean nombres de tipos de tarea).
- Tabla en web y móvil con asunto persistente y columnas Estado, Vencimiento, Cliente, Tipo, Responsable y Registro relacionado. Filtros de estado, tipo, responsable, cliente y vencimiento Desde/Hasta; búsqueda por tarea, cliente, ID o dirección. Vencidas antes de próximas. Sin prioridad manual, avisos, recordatorios o indicador comercial.
- Asesor autoasigna y completa solo tareas propias; edita asunto/detalle. Gerencia edita también vencimiento/responsable dentro de su estructura ficticia. Asignado y gerencia cancelan con motivo. Gerencia reabre con motivo general e historial.
- Otra área autorizada asigna nacionalmente al asesor de contacto con el cliente, sin consulta global ni cierre ajeno. Administrar tipos no concede permisos de gestión de series ni de cierre.
- Escenario de cambio de asesor del cliente: desde un rol de gerencia, seleccionar cliente y sucesor. Transfiere automáticamente tareas abiertas y responsable de futuras repeticiones; completadas/canceladas e historial se conservan.
- Recurrencia por intervalos en días, semanas o meses; termina por fecha o cantidad. Cada periodo produce una tarea independiente aunque otra esté pendiente. Vence el mismo día a hora configurada, conserva zona, usa último día del mes cuando el día no exista y vuelve al día original en los siguientes meses. No desplaza fines de semana/feriados.
- Series gestionadas por creador, gerencia en su alcance y administrador con permiso específico. Editar futuras conserva tareas generadas; detener no cancela las existentes. Cancelar una repetición no detiene la serie.
- Borrador recuperable por usuario/contexto mediante localStorage; archivos en IndexedDB. Salir/volver conserva el borrador. El envío es manual y exige conexión; no existe sincronización automática.
- Adjuntos: hasta 10 por tarea, JPG/JPEG/PNG (10 MB), PDF/DOCX/XLSX (20 MB). Validación de extensión, peso y cantidad; descarga local, eliminación, estados y errores por archivo. Completadas/canceladas son de consulta; reapertura vuelve a habilitar correcciones.

## Límites de la demostración

La generación recurrente ocurre al abrir la aplicación o avanzar el día simulado, con máximo de 500 repeticiones por serie. No existe un servicio en segundo plano. Permisos, fechas y cambios de cartera son simulados; la aplicación no implementa autorización backend, resolución de cambios entre múltiples dispositivos, migración real ni conversión productiva de DST. Los bytes de los archivos se guardan solo en el navegador y no se suben a un servidor. Borrar los datos del navegador elimina esta demostración.

La migración productiva incluye solo abiertas, según SPEC. Ausencia sin cambio de cartera, falta de sucesor y tareas sin relación quedan como excepciones de negocio documentadas.

## Validación

`npm ci`, `node tests/model.test.cjs`, `npx tsc --noEmit`, `npm run build`.

Se verifican catálogo, fechas mensuales y años bisiestos, idempotencia, límite por cantidad de repeticiones, serie detenida, formatos/pesos/cantidad, transferencia solo de abiertas y permisos básicos. La verificación visual se realiza sobre GitHub Pages después de publicar.
