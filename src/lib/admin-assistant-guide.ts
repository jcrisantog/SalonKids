export type AssistantLink = {
  label: string;
  href: string;
};

export type AssistantResponse = {
  answer: string;
  steps: string[];
  links: AssistantLink[];
};

type AssistantTopic = {
  id: string;
  title: string;
  keywords: string[];
  contexts: string[];
  answer: string;
  steps: string[];
  links: AssistantLink[];
};

const adminAssistantTopics: AssistantTopic[] = [
  {
    id: "createEventAction",
    title: "Crear eventos desde el asistente",
    keywords: [
      "crear evento",
      "crea un evento",
      "crea evento",
      "nuevo evento",
      "agregar evento",
      "alta evento",
      "registrar evento",
    ],
    contexts: ["/admin/events"],
    answer:
      "Puedo preparar un plan para crear un evento desde el asistente accionable. Antes de guardar, revisa la tarjeta de confirmacion con festejado, fecha, horario y datos del cliente.",
    steps: [
      "Escribe el festejado y la fecha del evento.",
      "Agrega edad, cliente, telefono, correo u horario si los conoces.",
      "Revisa la tarjeta de confirmacion antes de ejecutar.",
      "Si no indicas horario, se usara 13:00 a 20:00 en el plan.",
    ],
    links: [{ label: "Eventos", href: "/admin/events" }],
  },
  {
    id: "menuDashboard",
    title: "Dashboard",
    keywords: ["dashboard", "panel", "inicio", "resumen", "para que sirve dashboard"],
    contexts: ["/admin/dashboard"],
    answer:
      "Dashboard sirve para ver un resumen rapido de la operacion: eventos proximos, cuestionarios pendientes o completados y personal activo.",
    steps: [
      "Abre Dashboard cuando quieras una vista general del estado del sistema.",
      "Revisa los indicadores principales antes de entrar al detalle.",
      "Si necesitas actuar sobre un dato, ve a Eventos, Personal / Staff o la pantalla relacionada.",
    ],
    links: [
      { label: "Dashboard", href: "/admin/dashboard" },
      { label: "Eventos", href: "/admin/events" },
      { label: "Personal / Staff", href: "/admin/staff" },
    ],
  },
  {
    id: "menuEvents",
    title: "Eventos",
    keywords: ["eventos", "menu eventos", "para que sirve eventos", "pantalla eventos"],
    contexts: ["/admin/events"],
    answer:
      "Eventos sirve para administrar los eventos de los clientes, consultar fechas, horarios, estado del cuestionario y entrar a las tareas de cada evento.",
    steps: [
      "Abre Eventos para crear o revisar eventos.",
      "Busca el evento por cliente, festejado, fecha o estado.",
      "Desde cada evento puedes copiar el link del cuestionario o abrir sus tareas operativas.",
    ],
    links: [
      { label: "Eventos", href: "/admin/events" },
      { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
    ],
  },
  {
    id: "menuIntegrations",
    title: "Integraciones",
    keywords: ["integraciones", "integracion", "menu integraciones", "para que sirve integraciones"],
    contexts: ["/admin/integrations"],
    answer:
      "Integraciones sirve para preparar acciones de comunicacion conectadas con eventos, como notificaciones disponibles para clientes o responsables.",
    steps: [
      "Abre Integraciones cuando necesites usar una comunicacion conectada al sistema.",
      "Selecciona el evento correcto antes de enviar o preparar informacion.",
      "Confirma que los datos del evento esten actualizados en Eventos.",
    ],
    links: [
      { label: "Integraciones", href: "/admin/integrations" },
      { label: "Eventos", href: "/admin/events" },
    ],
  },
  {
    id: "menuStaff",
    title: "Personal / Staff",
    keywords: ["personal / staff", "personal staff", "menu staff", "menu personal", "para que sirve staff", "para que sirve personal"],
    contexts: ["/admin/staff"],
    answer:
      "Personal / Staff sirve para mantener los nombres y disponibilidad de las personas que pueden recibir tareas.",
    steps: [
      "Usa Personal / Staff para agregar, editar, activar o desactivar personas.",
      "Mantener el staff activo correcto ayuda a la asignacion automatica.",
      "Si alguien ya no participa, marcalo como inactivo en lugar de usarlo para nuevas tareas.",
    ],
    links: [
      { label: "Personal / Staff", href: "/admin/staff" },
      { label: "Historial Staff", href: "/admin/staff-task-history" },
    ],
  },
  {
    id: "menuStaffHistory",
    title: "Historial Staff",
    keywords: [
      "historial staff",
      "historial del staff",
      "historial del sataff",
      "historial de staff",
      "historial de sataff",
      "para que sirve historial staff",
      "para que sirve historial del sataff",
      "carga staff",
      "asignaciones staff",
    ],
    contexts: ["/admin/staff-task-history"],
    answer:
      "Historial Staff sirve para revisar la carga y el historial de asignaciones por persona. Ayuda a entender a quien se le han asignado tareas y dar seguimiento al reparto operativo.",
    steps: [
      "Abre Historial Staff para revisar asignaciones por integrante.",
      "Usa la informacion para balancear trabajo o revisar antecedentes.",
      "Si necesitas cambiar responsables de un evento, entra a las tareas del evento desde Eventos.",
    ],
    links: [
      { label: "Historial Staff", href: "/admin/staff-task-history" },
      { label: "Eventos", href: "/admin/events" },
    ],
  },
  {
    id: "menuTaskHistory",
    title: "Historial Tareas",
    keywords: [
      "historial tareas",
      "historial de tareas",
      "historial del tareas",
      "para que sirve historial tareas",
      "seguimiento tareas",
    ],
    contexts: ["/admin/task-history"],
    answer:
      "Historial Tareas sirve para consultar seguimiento general de tareas, cambios y actividad operativa relacionada con eventos.",
    steps: [
      "Abre Historial Tareas cuando necesites revisar actividad o seguimiento de tareas.",
      "Busca la tarea, evento o responsable que quieres revisar.",
      "Para modificar una tarea actual, entra a las tareas del evento desde Eventos.",
    ],
    links: [
      { label: "Historial Tareas", href: "/admin/task-history" },
      { label: "Eventos", href: "/admin/events" },
    ],
  },
  {
    id: "menuMasterTasks",
    title: "Tareas Maestras",
    keywords: ["tareas maestras", "menu tareas maestras", "para que sirve tareas maestras", "plantillas de tareas"],
    contexts: ["/admin/tasks"],
    answer:
      "Tareas Maestras sirve para administrar plantillas reutilizables de tareas. Esas plantillas pueden usarse en reglas del cuestionario y como base operativa para eventos.",
    steps: [
      "Usa Tareas Maestras para crear o editar plantillas de tareas.",
      "Define nombre, descripcion, responsables seleccionables, cantidad, visibilidad y grupo.",
      "Relaciona esas tareas desde Reglas Cuestionario cuando deban generarse automaticamente.",
    ],
    links: [
      { label: "Tareas Maestras", href: "/admin/tasks" },
      { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
      { label: "Grupos de Tareas", href: "/admin/task-groups" },
    ],
  },
  {
    id: "menuTaskGroups",
    title: "Grupos de Tareas",
    keywords: [
      "grupos de tareas",
      "grupo de tareas",
      "crear grupo de tareas",
      "crear un grupo de tareas",
      "agregar grupo de tareas",
      "como puedo crear un grupo de tareas",
      "menu grupos",
      "para que sirve grupo de tareas",
      "para que sirve grupos de tareas",
      "bloques operativos",
    ],
    contexts: ["/admin/task-groups"],
    answer:
      "Grupos de Tareas sirve para organizar tareas maestras por bloques operativos. Esto ayuda a ordenar la operacion y a balancear asignaciones.",
    steps: [
      "Abre Grupos de Tareas.",
      "Escribe el Nombre del grupo.",
      "Deja marcada la casilla Activo si el grupo debe usarse en tareas maestras.",
      "Captura una Descripcion si quieres explicar el uso operativo del grupo.",
      "Presiona Agregar para guardar.",
      "Despues puedes usar ese grupo al configurar Tareas Maestras.",
    ],
    links: [
      { label: "Grupos de Tareas", href: "/admin/task-groups" },
      { label: "Tareas Maestras", href: "/admin/tasks" },
    ],
  },
  {
    id: "menuQuestionnaireRules",
    title: "Reglas Cuestionario",
    keywords: [
      "reglas cuestionario",
      "reglas del cuestionario",
      "menu reglas cuestionario",
      "para que sirve reglas cuestionario",
      "automatizar tareas",
    ],
    contexts: ["/admin/questionnaire-rules"],
    answer:
      "Reglas Cuestionario sirve para convertir respuestas del cliente en tareas operativas. Ahi defines que respuesta dispara que tarea y de donde sale su horario.",
    steps: [
      "Usa Reglas Cuestionario para configurar tareas que se generan desde respuestas del cuestionario.",
      "Selecciona pregunta, operador, valor esperado y tarea asociada.",
      "Configura horario fijo o fuente de horario si aplica.",
      "Prueba el resultado sincronizando tareas desde un evento.",
    ],
    links: [
      { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
      { label: "Tareas Maestras", href: "/admin/tasks" },
      { label: "Eventos", href: "/admin/events" },
    ],
  },
  {
    id: "menuGuidelinesNotices",
    title: "Lineamientos y Avisos",
    keywords: [
      "lineamientos y avisos",
      "lineamientos",
      "avisos",
      "menu lineamientos",
      "para que sirve lineamientos",
      "para que sirve avisos",
    ],
    contexts: ["/admin/guidelines-notices"],
    answer:
      "Lineamientos y Avisos sirve para mantener textos o informacion que puede anexarse a reportes/PDFs operativos del evento.",
    steps: [
      "Abre Lineamientos y Avisos para revisar o actualizar el contenido informativo.",
      "Mantén ahi indicaciones generales que deban acompañar reportes.",
      "Al generar PDF desde tareas de evento, puedes anexar esos lineamientos si hay contenido guardado.",
    ],
    links: [
      { label: "Lineamientos y Avisos", href: "/admin/guidelines-notices" },
      { label: "Eventos", href: "/admin/events" },
    ],
  },
  {
    id: "events",
    title: "Crear y editar eventos",
    keywords: ["evento", "crear", "editar", "cumple", "fecha", "cliente"],
    contexts: ["/admin/events"],
    answer:
      "Para crear o ajustar un evento, usa la pantalla Eventos. El asistente solo te guia; los cambios se hacen manualmente desde el formulario.",
    steps: [
      "Abre Eventos.",
      "Captura los datos del cliente, festejado, fecha y horarios.",
      "Guarda el evento y revisa que aparezca en la tabla.",
      "Si necesitas corregir algo, usa editar en el evento correspondiente.",
    ],
    links: [{ label: "Abrir Eventos", href: "/admin/events" }],
  },
  {
    id: "questionnaire",
    title: "Cuestionario del cliente",
    keywords: ["cuestionario", "link", "enlace", "cliente", "respuestas", "estado"],
    contexts: ["/admin/events"],
    answer:
      "El cuestionario se maneja desde Eventos. Ahi puedes copiar el enlace del cliente y revisar si esta sin iniciar, en progreso o completado.",
    steps: [
      "Abre Eventos.",
      "Busca el evento por cliente, festejado o fecha.",
      "Copia el link del cuestionario y envialo al cliente.",
      "Revisa el estado del cuestionario en la fila del evento.",
    ],
    links: [{ label: "Abrir Eventos", href: "/admin/events" }],
  },
  {
    id: "eventTasks",
    title: "Tareas de evento",
    keywords: [
      "tarea",
      "tareas",
      "evento",
      "crear una tarea",
      "agregar tarea",
      "tarea para evento",
      "tarea para un evento",
      "tareas del evento",
      "sincronizar",
      "pdf",
      "reporte",
      "imprimir",
    ],
    contexts: ["/admin/events/"],
    answer:
      "Las tareas de un evento se gestionan desde la lista de tareas del evento. Desde ahi puedes crear, editar, sincronizar desde cuestionario y generar reportes.",
    steps: [
      "Abre Eventos y entra a Tareas del evento.",
      "Captura el campo Tarea.",
      "Captura la Hora si la tarea debe tener horario.",
      "Agrega una Descripcion si necesitas instrucciones para el staff.",
      "Selecciona Responsables si ya sabes quien debe hacerla.",
      "Elige Estado y Visibilidad.",
      "Deja marcado Proteger ajuste manual si no quieres que el motor de reglas sobrescriba ese cambio.",
      "Presiona Agregar tarea para guardarla en el evento.",
    ],
    links: [
      { label: "Abrir Eventos", href: "/admin/events" },
      { label: "Lineamientos y Avisos", href: "/admin/guidelines-notices" },
    ],
  },
  {
    id: "masterTasks",
    title: "Crear tareas maestras",
    keywords: [
      "tarea maestra",
      "tareas maestras",
      "crear tarea",
      "crear tareas",
      "maestra",
      "maestras",
      "catalogo de tareas",
    ],
    contexts: ["/admin/tasks"],
    answer:
      "Las tareas maestras se crean en Tareas Maestras. Sirven como base reutilizable para reglas del cuestionario y tareas operativas de eventos.",
    steps: [
      "Abre Tareas Maestras.",
      "Captura el Nombre de tarea.",
      "Captura la Descripcion estandar si necesitas instrucciones que se copien a los eventos.",
      "Selecciona Personal seleccionable solo si la tarea debe limitarse a personas especificas.",
      "Define la Cantidad de responsables que requiere la tarea.",
      "Elige si la tarea es interna o publica.",
      "Elige un Grupo de asignacion si quieres organizarla por bloque operativo.",
      "Presiona Agregar tarea para guardar.",
      "Despues puedes usarla desde Reglas Cuestionario si debe generarse automaticamente.",
    ],
    links: [
      { label: "Tareas Maestras", href: "/admin/tasks" },
      { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
      { label: "Grupos de Tareas", href: "/admin/task-groups" },
    ],
  },
  {
    id: "responsibles",
    title: "Asignar responsables automaticamente",
    keywords: ["responsable", "responsables", "asignar", "automaticamente", "completar", "reemplazar"],
    contexts: ["/admin/events/", "/tasks"],
    answer:
      "La asignacion automatica ayuda a repartir tareas entre personal activo. Completar conserva responsables existentes y llena huecos; Reemplazar recalcula responsables para las tareas seleccionadas.",
    steps: [
      "Abre Eventos y entra a Tareas del evento.",
      "Revisa que el personal activo exista en Personal / Staff.",
      "Elige asignacion automatica.",
      "Usa Completar si quieres conservar asignaciones manuales.",
      "Usa Reemplazar solo cuando quieras recalcular las asignaciones.",
    ],
    links: [
      { label: "Abrir Eventos", href: "/admin/events" },
      { label: "Personal / Staff", href: "/admin/staff" },
      { label: "Historial Staff", href: "/admin/staff-task-history" },
    ],
  },
  {
    id: "staffCatalog",
    title: "Catalogo de personal",
    keywords: [
      "catalogo de personal",
      "catalogo staff",
      "personal",
      "staff",
      "empleado",
      "empleados",
      "colaborador",
      "colaboradores",
      "crear personal",
      "agregar personal",
      "alta personal",
    ],
    contexts: ["/admin/staff"],
    answer:
      "El catalogo de Personal / Staff sirve para mantener nombres y disponibilidad de las personas que pueden recibir tareas.",
    steps: [
      "Abre Personal / Staff.",
      "Escribe el nombre de la persona en el campo Nombre.",
      "Deja marcada la casilla Activo si debe participar en asignaciones.",
      "Presiona Agregar para guardar el registro.",
      "Para modificar una persona existente, usa la accion de editar en su fila.",
      "Si despues asignas responsables automaticamente, el sistema tomara en cuenta al staff activo.",
    ],
    links: [
      { label: "Personal / Staff", href: "/admin/staff" },
      { label: "Eventos", href: "/admin/events" },
      { label: "Historial Staff", href: "/admin/staff-task-history" },
    ],
  },
  {
    id: "questionnaireRules",
    title: "Reglas del cuestionario",
    keywords: ["regla", "reglas", "pregunta", "operador", "horario", "schedule", "fuente", "cuestionario"],
    contexts: ["/admin/questionnaire-rules"],
    answer:
      "Las reglas del cuestionario convierten respuestas del cliente en tareas operativas. Configuralas con una pregunta, operador, valor esperado y tarea asociada.",
    steps: [
      "Abre Reglas Cuestionario.",
      "Selecciona la pregunta del cuestionario que dispara la regla.",
      "Elige operador y valor esperado.",
      "Asocia la tarea maestra o captura los datos de la tarea.",
      "Define horario fijo o fuente de horario si aplica.",
      "Guarda y prueba sincronizando tareas desde un evento.",
    ],
    links: [
      { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
      { label: "Tareas Maestras", href: "/admin/tasks" },
      { label: "Grupos de Tareas", href: "/admin/task-groups" },
    ],
  },
  {
    id: "catalogs",
    title: "Catalogos operativos",
    keywords: ["catalogo", "catalogos", "maestra", "maestras", "grupo", "grupos", "personal", "staff"],
    contexts: ["/admin/tasks", "/admin/task-groups", "/admin/staff"],
    answer:
      "Los catalogos mantienen la base operativa: personal activo, tareas maestras y grupos de tareas. Cuidarlos ayuda a que reglas y asignaciones funcionen mejor.",
    steps: [
      "Actualiza Personal / Staff cuando alguien entre, salga o cambie su disponibilidad.",
      "Usa Tareas Maestras para tareas reutilizables.",
      "Usa Grupos de Tareas para organizar bloques operativos.",
      "Despues ajusta reglas si una tarea nueva debe generarse desde cuestionario.",
    ],
    links: [
      { label: "Personal / Staff", href: "/admin/staff" },
      { label: "Tareas Maestras", href: "/admin/tasks" },
      { label: "Grupos de Tareas", href: "/admin/task-groups" },
    ],
  },
  {
    id: "history",
    title: "Historiales",
    keywords: ["historial", "historiales", "cambio", "cambios", "seguimiento", "staff"],
    contexts: ["/admin/staff-task-history", "/admin/task-history"],
    answer:
      "Los historiales sirven para revisar seguimiento operativo y cambios relacionados con tareas o personal.",
    steps: [
      "Abre Historial Staff para revisar asignaciones y carga por persona.",
      "Abre Historial Tareas para consultar seguimiento general de tareas.",
      "Usa filtros o busqueda de la pantalla cuando necesites ubicar un evento o responsable.",
    ],
    links: [
      { label: "Historial Staff", href: "/admin/staff-task-history" },
      { label: "Historial Tareas", href: "/admin/task-history" },
    ],
  },
  {
    id: "integrations",
    title: "Integraciones y avisos",
    keywords: ["integracion", "integraciones", "whatsapp", "avisos", "lineamientos", "notificar", "notificacion"],
    contexts: ["/admin/integrations", "/admin/guidelines-notices"],
    answer:
      "Integraciones y Lineamientos ayudan a comunicar informacion del evento. Revisa esas pantallas antes de enviar avisos o generar documentos.",
    steps: [
      "Abre Integraciones para preparar o enviar notificaciones disponibles.",
      "Abre Lineamientos y Avisos para mantener textos y documentos actualizados.",
      "Confirma el evento correcto antes de enviar o generar informacion para el cliente.",
    ],
    links: [
      { label: "Integraciones", href: "/admin/integrations" },
      { label: "Lineamientos y Avisos", href: "/admin/guidelines-notices" },
    ],
  },
];

const actionRequestKeywords = [
  "crear por mi",
  "borra",
  "borrar",
  "elimina",
  "eliminar",
  "edita",
  "editar por mi",
  "asigna",
  "asigname",
  "hazlo",
];

export function answerAdminAssistantQuestion(message: string, currentPath: string): AssistantResponse {
  const normalizedMessage = normalizeText(message);
  const normalizedPath = normalizeText(currentPath);
  const topic = findBestTopic(normalizedMessage, normalizedPath);

  if (!topic) {
    return {
      answer:
        "No tengo suficiente informacion en la guia interna para responder eso con seguridad. Puedo ayudarte mejor con eventos, cuestionarios, reglas, tareas, staff, asignaciones, historiales, integraciones o PDFs.",
      steps: [
        "Revisa si tu pregunta corresponde a una pantalla del panel administrativo.",
        "Si estas en una pantalla especifica, pregunta por la accion que quieres hacer ahi.",
        "Para dudas operativas generales, empieza por Eventos o Reglas Cuestionario segun el caso.",
      ],
      links: [
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Eventos", href: "/admin/events" },
        { label: "Reglas Cuestionario", href: "/admin/questionnaire-rules" },
      ],
    };
  }

  const safetyPrefix = topic.id !== "createEventAction" && asksForDirectAction(normalizedMessage)
    ? "No puedo modificar datos ni ejecutar acciones automaticamente desde esta version. "
    : "";

  return {
    answer: `${safetyPrefix}${topic.answer}`,
    steps: topic.steps,
    links: topic.links,
  };
}

function findBestTopic(normalizedMessage: string, normalizedPath: string) {
  const scoredTopics = adminAssistantTopics
    .map((topic) => {
      const keywordScore = topic.keywords.reduce(
        (score, keyword) => {
          const normalizedKeyword = normalizeText(keyword);

          if (!normalizedMessage.includes(normalizedKeyword)) {
            return score;
          }

          return score + (normalizedKeyword.includes(" ") ? 5 : 2);
        },
        0,
      );
      const contextScore = topic.contexts.some((context) =>
        normalizedPath.includes(normalizeText(context)),
      )
        ? 1
        : 0;

      return { topic, score: keywordScore + contextScore };
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score);

  return scoredTopics[0]?.topic ?? null;
}

function asksForDirectAction(normalizedMessage: string) {
  if (
    normalizedMessage.startsWith("como ") ||
    normalizedMessage.includes("como puedo") ||
    normalizedMessage.includes("como se") ||
    normalizedMessage.includes("que pasos")
  ) {
    return false;
  }

  return actionRequestKeywords.some((keyword) => normalizedMessage.includes(normalizeText(keyword)));
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
