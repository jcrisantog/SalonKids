# add-admin-assistant-chatbot

## Why
La duena necesita ayuda dentro del sistema cuando no recuerde como hacer una actividad administrativa. Hoy debe depender de memoria, capacitacion externa o prueba y error para acciones como crear eventos, revisar cuestionarios, configurar reglas, generar tareas, asignar responsables o imprimir reportes.

Un asistente conversacional integrado al panel administrativo puede reducir friccion, guiarla paso a paso y servir como soporte operativo en lenguaje natural. Tambien debe aceptar instrucciones por audio porque durante la operacion puede ser mas rapido hablar que escribir.

## What Changes
- Agregar un asistente flotante disponible en el panel administrativo.
- Permitir preguntas por texto y dictado por audio.
- Responder con pasos concretos basados en funciones reales del sistema.
- Incluir enlaces internos a pantallas del admin cuando aplique.
- Usar una base de conocimiento operativa controlada para evitar respuestas inventadas.
- Mantener el asistente como guia informativa en la primera version; no ejecuta cambios automaticos.

## Impact
- Nueva capacidad `admin-assistant-chatbot`.
- Ajuste de experiencia en el layout administrativo.
- Nueva ruta API para responder consultas del asistente.
- Posible configuracion de proveedor de IA/transcripcion mediante variables de entorno.
