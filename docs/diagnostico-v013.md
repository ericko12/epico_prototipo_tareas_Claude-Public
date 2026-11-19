# Diagnóstico de cliente — alineación 0.13

Fecha: 2026-11-19. Referencia: SPEC-F2-004 y UX-SPEC-F2-004 0.13, RN-C01 a RN-C16.

Escritorio: `/Modulo/clientes/` y su cuestionario compartido `/diagnostico-segmentos.html`.
Móvil: `/diagnostico-mobile.html`.

Se conservan el shell y los controles existentes. `public/diagnostico-v013.js` comparte los comportamientos de ambos cuestionarios: marca de completitud, validación, permisos de Plan/Estatus/estrategia, captura por Cuenta y Dirección, historial con diferencias, conexión, sesión y conflictos por bloque. Los borradores y revisiones de diagnóstico viven solo en memoria. Los niveles importados conservan la persistencia de demostración ya existente.

Las opciones de Situación actual no se inventan ni se trasladan entre segmentos. La referencia existente de Refaccionarias se conserva; donde falta una lista operativa aprobada se informa la ausencia. Los datos del decisor permanecen en los reactivos existentes; no se agregan atributos personales. GEC no se muestra como indicador.

## Recorrido de revisión

1. Abrir un cliente y entrar en Radiografía > Ver / actualizar diagnóstico.
2. Como Asesor, editar Plan de acción; Estatus y estrategia se consultan. Gerente/KAM puede editar Estatus. Administrador simula la actualización de estrategia con referencia a solicitud de Negocio.
3. Guardar preguntas opcionales faltantes: mostrar Incompleto y conteo; cantidades inválidas bloquean el bloque conservando captura. Causa raíz y Plan tienen contador y máximo 500 caracteres.
4. En Empresas, abrir una Dirección. Su información comercial no se propaga a Cuenta ni a otra Dirección. «¿Este cliente es?» es opcional y único. Si Tipo de dirección falta, no inferir «No aplica» para Parque vehicular.
5. En «Escenarios de prueba · simulación», probar conexión ausente, sesión vencida, cliente inactivo/fusionado, cambios concurrentes del mismo u otro bloque y falla comercial de Dirección. Ningún control de simulación equivale a autenticación o conexión productiva.
6. Si se editan Perfil de Dirección e información comercial, el Guardar de Dirección reúne los resultados; ante fallo comercial conserva esa parte para reintento sin volver a enviar el Perfil guardado.
7. Abrir Historial: fecha, rol de demostración y valores anterior/nuevo, limitado al contexto. No se ofrece exportación de diagnóstico o historial.
8. En el rol de soporte/Administrador del shell, el ícono superior de Clientes abre «Importar niveles de cliente». Mes actual o anterior aceptado, futuros rechazados. El permiso de carga es efectivo solo bajo ese perfil en esta demo.

## Verificación

- Build estático de Next.js con el mismo base path de GitHub Pages y revisión TypeScript.
- Pruebas de interacción DOM en las dos páginas: permisos, validación numérica, incompletitud, historial, conexión y sesión, concurrencia entre bloques y dentro del mismo bloque, aislamiento Cuenta/Dirección y reintento parcial.
- Los escenarios visuales son datos ficticios. Servicios, permisos, auditoría e identidad productivos requieren los contratos y verificaciones que permanecen asignados en las specs.
