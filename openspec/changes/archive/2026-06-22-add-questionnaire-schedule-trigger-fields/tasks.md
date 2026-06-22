## 1. Preparación y modelo del cuestionario

- [x] 1.1 Leer las guías locales relevantes de Next.js 16 para componentes cliente y route handlers antes de editar código de la aplicación.
- [x] 1.2 Agregar `characterTime`, `danceBlockTime`, `externalFoodProviderArrivalTime` y `foodEndTime` a `QuestionnaireData` y a los valores vacíos compatibles.
- [x] 1.3 Implementar la derivación canónica de `foodEndTime` en `normalizeQuestionnaire`, sumando 60 minutos a horas válidas, limpiando valores obsoletos y manejando el cruce de medianoche.

## 2. Metadata y experiencia del cuestionario

- [x] 2.1 Agregar "Hora de llegada del proveedor de comida" en la sección 8, condicionada a `externalMenu`.
- [x] 2.2 Agregar "Hora del personaje" y "Bloque de baile" en la sección 15, condicionados a `characterShow` y `djDanceMusic` respectivamente.
- [x] 2.3 Mover la metadata de `photoSessionTime` de la sección 4 a la sección 15 sin cambiar su llave y conservar la dependencia con `photoSession`.
- [x] 2.4 Incorporar metadata interna para "Hora Fin Comida" y asegurar que no se renderice ni cuente para el progreso del cuestionario público.

## 3. Integración con reglas de tareas

- [x] 3.1 Exponer los cinco campos de hora en el catálogo administrativo de reglas con sección, etiqueta, tipo y llave estables.
- [x] 3.2 Verificar que las reglas con operador `answered` evalúen los nuevos horarios y que el motor use el campo disparador como `scheduled_time` cuando no exista un override o fuente distinta.
- [x] 3.3 Confirmar que `foodEndTime` se evalúe después de normalizar el payload y no acepte un valor derivado desfasado enviado por el cliente.

## 4. Seeds y documentación operativa

- [x] 4.1 Actualizar `Documentos/seed-questionnaire-task-rules.sql` para registrar las nuevas llaves o fuentes de horario aplicables sin crear reglas operativas no solicitadas.
- [x] 4.2 Actualizar `Documentos/matriz-operativa-tareas-reglas.md` con la ubicación, condición y disponibilidad como disparador de los nuevos horarios.

## 5. Verificación

- [x] 5.1 Verificar manualmente las condiciones de las secciones 8 y 15, la reubicación de "Hora de fotos" y que "Hora Fin Comida" permanezca oculto.
- [x] 5.2 Verificar normalización con payload anterior, inicio vacío o inválido, recálculo al editar y cruce de medianoche.
- [x] 5.3 Verificar desde Reglas Cuestionario que todos los horarios sean seleccionables como disparador y fuente de programación.
- [x] 5.4 Ejecutar `pnpm lint` y `pnpm build`, y reportar cualquier limitación de verificación local.
