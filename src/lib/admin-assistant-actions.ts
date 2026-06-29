import crypto from "node:crypto";

import { answerAdminAssistantQuestion } from "@/lib/admin-assistant-guide";
import { syncBaseEventTasks } from "@/lib/rule-engine";
import { normalizeStaffIds, replaceStaffRelations, validateStaffIds } from "@/lib/staff-assignments";
import { supabaseAdmin } from "@/lib/supabase-server";

export type AssistantActionType =
  | "create_event"
  | "update_event"
  | "delete_event"
  | "create_event_task"
  | "reassign_event_task"
  | "change_event_task_time"
  | "delete_event_task"
  | "create_staff"
  | "deactivate_staff"
  | "delete_staff";

export type AssistantActionPlan = {
  type: AssistantActionType;
  message: string;
  createdAt: string;
  expiresAt: string;
  requiresStrongConfirmation: boolean;
  summary: string;
  details: string[];
  action:
    | {
        type: "create_event_task";
        eventId: string;
        eventLabel: string;
        taskName: string;
        description: string | null;
        scheduledTime: string | null;
        staffIds: string[];
        staffLabels: string[];
        visibility: "interna" | "publica";
      }
    | {
        type: "reassign_event_task";
        eventId: string;
        eventLabel: string;
        taskId: string;
        taskName: string;
        staffIds: string[];
        staffLabels: string[];
      }
    | {
        type: "change_event_task_time";
        eventId: string;
        eventLabel: string;
        taskId: string;
        taskName: string;
        scheduledTime: string;
      }
    | {
        type: "delete_event_task";
        eventId: string;
        eventLabel: string;
        taskId: string;
        taskName: string;
      }
    | {
        type: "create_event";
        eventLabel: string;
        eventPayload: AssistantEventPayload;
      }
    | {
        type: "update_event";
        eventId: string;
        eventLabel: string;
        eventPayload: AssistantEventPayload;
      }
    | {
        type: "delete_event";
        eventId: string;
        eventLabel: string;
      }
    | {
        type: "create_staff";
        staffName: string;
      }
    | {
        type: "deactivate_staff" | "delete_staff";
        staffId: string;
        staffName: string;
        futureTaskCount?: number;
      };
};

export type AssistantActionPlanResponse =
  | {
      kind: "informational";
      answer: string;
      steps: string[];
      links: Array<{ label: string; href: string }>;
    }
  | {
      kind: "clarification_required";
      message: string;
      options: Array<{ label: string; value: string }>;
    }
  | {
      kind: "unsupported";
      message: string;
      steps: string[];
    }
  | {
      kind: "confirmation_required";
      planId: string;
      planToken: string;
      plan: AssistantActionPlan;
    };

export type AssistantActionExecuteResponse =
  | {
      kind: "executed";
      message: string;
      resultLabel: string;
    }
  | {
      kind: "rejected";
      message: string;
    };

type EventRecord = {
  id: string;
  client_id: string | null;
  celebratory_name: string;
  age: number | null;
  parents_names: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  status: EventStatus;
  clients?: ClientRelation | ClientRelation[] | null;
};

type ClientRelation = {
  full_name: string;
  phone: string | null;
  email: string | null;
};

type EventStatus = "pendiente" | "guardado" | "validado" | "finalizado";

type AssistantEventPayload = {
  celebratoryName: string;
  age: number | null;
  parentsNames: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  status: EventStatus;
  clientFullName: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
};

type StaffRecord = {
  id: string;
  name: string;
  primary_role: string | null;
  is_active: boolean;
};

type EventTaskRecord = {
  id: string;
  event_id: string;
  task_name: string;
  description: string | null;
  scheduled_time: string | null;
  staff_id: string | null;
  role_responsible: string | null;
  status: "pendiente" | "en_progreso" | "completada";
  visibility: "interna" | "publica";
  is_manual_override: boolean;
  event_task_staff?: Array<{ staff_id: string; sort_order: number | null }> | null;
};

const PLAN_TTL_MS = 10 * 60 * 1000;
const DEFAULT_STAFF_ROLE = "General";
const DEFAULT_EVENT_START_TIME = "13:00";
const DEFAULT_EVENT_END_TIME = "20:00";
const DEFAULT_EVENT_STATUS: EventStatus = "pendiente";
const eventSelect =
  "id, client_id, celebratory_name, age, parents_names, event_date, start_time, end_time, status, clients(full_name, phone, email)";
const eventTaskSelect =
  "id, event_id, task_name, description, scheduled_time, staff_id, role_responsible, status, visibility, is_manual_override, event_task_staff(staff_id, sort_order)";

export async function buildAssistantActionPlan({
  currentPath,
  message,
}: {
  currentPath: string;
  message: string;
}): Promise<AssistantActionPlanResponse> {
  const normalizedMessage = normalizeText(message);
  const actionType = detectActionType(normalizedMessage);

  if (!actionType) {
    return {
      kind: "informational",
      ...answerAdminAssistantQuestion(message, currentPath),
    };
  }

  if (actionType === "unsupported") {
    return {
      kind: "unsupported",
      message: "Esa accion todavia no esta soportada desde el asistente accionable.",
      steps: [
        "Puedo crear, modificar o eliminar eventos; crear tareas de evento; reasignar responsables; cambiar hora; eliminar tareas; crear staff; inactivar staff o eliminar staff.",
        "Para otras operaciones, usa la pantalla correspondiente del panel.",
      ],
    };
  }

  const planResult = await resolvePlanForAction({ actionType, currentPath, message, normalizedMessage });

  if ("kind" in planResult) {
    return planResult;
  }

  const planId = createPlanId(planResult);
  const planToken = signPlan(planResult);

  return {
    kind: "confirmation_required",
    planId,
    planToken,
    plan: planResult,
  };
}

export async function executeAssistantActionPlan({
  confirmation,
  planToken,
  userId,
}: {
  confirmation?: string;
  planToken: string;
  userId: string;
}): Promise<AssistantActionExecuteResponse> {
  const plan = verifyPlan(planToken);

  if (!plan) {
    return { kind: "rejected", message: "El plan no existe, vencio o fue alterado. Vuelve a pedir la accion." };
  }

  if (plan.requiresStrongConfirmation && confirmation !== "strong_confirmed") {
    return { kind: "rejected", message: "Esta accion requiere confirmacion reforzada." };
  }

  if (!plan.requiresStrongConfirmation && confirmation !== "confirmed") {
    return { kind: "rejected", message: "Confirma la accion antes de ejecutarla." };
  }

  try {
    const resultLabel = await executePlan(plan);

    await auditAssistantAction({
      userId,
      plan,
      result: "success",
      errorMessage: null,
    });

    return {
      kind: "executed",
      message: "Accion completada.",
      resultLabel,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "No se pudo ejecutar la accion.";

    await auditAssistantAction({
      userId,
      plan,
      result: "error",
      errorMessage,
    });

    return { kind: "rejected", message: errorMessage };
  }
}

async function resolvePlanForAction({
  actionType,
  currentPath,
  message,
  normalizedMessage,
}: {
  actionType: Exclude<ReturnType<typeof detectActionType>, null | "unsupported">;
  currentPath: string;
  message: string;
  normalizedMessage: string;
}): Promise<AssistantActionPlan | Extract<AssistantActionPlanResponse, { kind: "clarification_required" | "unsupported" }>> {
  if (actionType === "create_event") {
    const eventPayload = buildEventPayloadFromMessage(message, normalizedMessage, null);

    if (!eventPayload.celebratoryName || !eventPayload.eventDate) {
      return {
        kind: "clarification_required",
        message: "Para crear el evento necesito al menos el nombre del festejado y la fecha.",
        options: [],
      };
    }

    return createPlan({
      type: "create_event",
      message,
      requiresStrongConfirmation: false,
      summary: `Crear evento: ${eventPayload.celebratoryName} - ${eventPayload.eventDate}`,
      details: buildEventPlanDetails(eventPayload),
      action: {
        type: "create_event",
        eventLabel: `${eventPayload.celebratoryName} - ${eventPayload.eventDate}`,
        eventPayload,
      },
    });
  }

  if (actionType === "update_event" || actionType === "delete_event") {
    const eventResolution = await resolveEvent({
      currentPath,
      message,
      normalizedMessage,
    });

    if (eventResolution.kind !== "resolved") {
      return eventResolution;
    }

    if (actionType === "delete_event") {
      return createPlan({
        type: "delete_event",
        message,
        requiresStrongConfirmation: true,
        summary: `Eliminar evento: ${eventResolution.eventLabel}`,
        details: [
          `Evento: ${eventResolution.eventLabel}`,
          "Esta accion eliminara el evento indicado junto con sus datos relacionados si la base de datos lo permite.",
        ],
        action: {
          type: "delete_event",
          eventId: eventResolution.event.id,
          eventLabel: eventResolution.eventLabel,
        },
      });
    }

    const eventPayload = buildEventPayloadFromMessage(message, normalizedMessage, eventResolution.event);

    if (!hasEventUpdate(message, normalizedMessage)) {
      return {
        kind: "clarification_required",
        message: "Dime que dato del evento quieres modificar: fecha, hora, festejado, edad, cliente o estatus.",
        options: [],
      };
    }

    return createPlan({
      type: "update_event",
      message,
      requiresStrongConfirmation: false,
      summary: `Modificar evento: ${eventResolution.eventLabel}`,
      details: buildEventPlanDetails(eventPayload),
      action: {
        type: "update_event",
        eventId: eventResolution.event.id,
        eventLabel: eventResolution.eventLabel,
        eventPayload,
      },
    });
  }

  if (actionType === "create_staff") {
    const staffName = extractStaffName(message, normalizedMessage);

    if (!staffName) {
      return {
        kind: "clarification_required",
        message: "Dime el nombre de la persona de staff que quieres crear.",
        options: [],
      };
    }

    return createPlan({
      type: "create_staff",
      message,
      requiresStrongConfirmation: false,
      summary: `Crear staff: ${staffName}`,
      details: [`Nombre: ${staffName}`, "Estado inicial: Activo"],
      action: { type: "create_staff", staffName },
    });
  }

  if (actionType === "deactivate_staff" || actionType === "delete_staff") {
    const staffResolution = await resolveStaff(extractStaffName(message, normalizedMessage) ?? message);

    if (staffResolution.kind !== "resolved") {
      return staffResolution;
    }

    const futureTaskCount =
      actionType === "deactivate_staff" ? await countFutureTasksForStaff(staffResolution.staff.id) : undefined;

    return createPlan({
      type: actionType,
      message,
      requiresStrongConfirmation: actionType === "delete_staff" || Boolean(futureTaskCount),
      summary: `${actionType === "delete_staff" ? "Eliminar" : "Inactivar"} staff: ${staffResolution.staff.name}`,
      details: [
        `Persona: ${staffResolution.staff.name}`,
        actionType === "delete_staff" ? "Se intentara eliminar el registro." : "Se marcara como inactivo.",
        futureTaskCount ? `Tiene ${futureTaskCount} tarea(s) futura(s) asignada(s).` : "No se detectaron tareas futuras asignadas.",
      ],
      action: {
        type: actionType,
        staffId: staffResolution.staff.id,
        staffName: staffResolution.staff.name,
        futureTaskCount,
      },
    });
  }

  const eventResolution = await resolveEvent({
    currentPath,
    message,
    normalizedMessage,
  });

  if (eventResolution.kind !== "resolved") {
    return eventResolution;
  }

  if (actionType === "create_event_task") {
    const taskName = extractTaskNameForCreate(message, normalizedMessage);
    const scheduledTime = extractTime(message);
    const staffNames = extractStaffNamesForAssignment(message);
    const staffResolution = staffNames.length ? await resolveStaffList(staffNames) : { kind: "resolved" as const, staff: [] };

    if (!taskName) {
      return {
        kind: "clarification_required",
        message: "Dime el nombre de la tarea que quieres agregar al evento.",
        options: [],
      };
    }

    if (staffResolution.kind !== "resolved") {
      return staffResolution;
    }

    return createPlan({
      type: "create_event_task",
      message,
      requiresStrongConfirmation: false,
      summary: `Crear tarea "${taskName}" en ${eventResolution.eventLabel}`,
      details: [
        `Evento: ${eventResolution.eventLabel}`,
        `Tarea: ${taskName}`,
        `Hora: ${scheduledTime ?? "Sin hora"}`,
        `Responsables: ${staffResolution.staff.map((staff) => staff.name).join(", ") || "Sin responsable"}`,
      ],
      action: {
        type: "create_event_task",
        eventId: eventResolution.event.id,
        eventLabel: eventResolution.eventLabel,
        taskName,
        description: null,
        scheduledTime,
        staffIds: staffResolution.staff.map((staff) => staff.id),
        staffLabels: staffResolution.staff.map((staff) => staff.name),
        visibility: "interna",
      },
    });
  }

  const taskResolution = await resolveEventTask({
    eventId: eventResolution.event.id,
    message,
    normalizedMessage,
  });

  if (taskResolution.kind !== "resolved") {
    return taskResolution;
  }

  if (actionType === "reassign_event_task") {
    const staffNames = extractStaffNamesForAssignment(message);
    const staffResolution = staffNames.length ? await resolveStaffList(staffNames) : await resolveStaff(message);

    if (staffResolution.kind !== "resolved") {
      return staffResolution;
    }

    const staff = Array.isArray(staffResolution.staff) ? staffResolution.staff : [staffResolution.staff];

    return createPlan({
      type: "reassign_event_task",
      message,
      requiresStrongConfirmation: false,
      summary: `Reasignar "${taskResolution.task.task_name}" en ${eventResolution.eventLabel}`,
      details: [
        `Evento: ${eventResolution.eventLabel}`,
        `Tarea: ${taskResolution.task.task_name}`,
        `Nuevos responsables: ${staff.map((member) => member.name).join(", ")}`,
      ],
      action: {
        type: "reassign_event_task",
        eventId: eventResolution.event.id,
        eventLabel: eventResolution.eventLabel,
        taskId: taskResolution.task.id,
        taskName: taskResolution.task.task_name,
        staffIds: staff.map((member) => member.id),
        staffLabels: staff.map((member) => member.name),
      },
    });
  }

  if (actionType === "change_event_task_time") {
    const scheduledTime = extractTime(message);

    if (!scheduledTime) {
      return {
        kind: "clarification_required",
        message: "Dime la nueva hora para la tarea.",
        options: [],
      };
    }

    return createPlan({
      type: "change_event_task_time",
      message,
      requiresStrongConfirmation: false,
      summary: `Cambiar hora de "${taskResolution.task.task_name}" a ${scheduledTime}`,
      details: [
        `Evento: ${eventResolution.eventLabel}`,
        `Tarea: ${taskResolution.task.task_name}`,
        `Nueva hora: ${scheduledTime}`,
      ],
      action: {
        type: "change_event_task_time",
        eventId: eventResolution.event.id,
        eventLabel: eventResolution.eventLabel,
        taskId: taskResolution.task.id,
        taskName: taskResolution.task.task_name,
        scheduledTime,
      },
    });
  }

  return createPlan({
    type: "delete_event_task",
    message,
    requiresStrongConfirmation: true,
    summary: `Eliminar tarea "${taskResolution.task.task_name}"`,
    details: [
      `Evento: ${eventResolution.eventLabel}`,
      `Tarea: ${taskResolution.task.task_name}`,
      "Esta accion eliminara la tarea indicada.",
    ],
    action: {
      type: "delete_event_task",
      eventId: eventResolution.event.id,
      eventLabel: eventResolution.eventLabel,
      taskId: taskResolution.task.id,
      taskName: taskResolution.task.task_name,
    },
  });
}

function detectActionType(normalizedMessage: string) {
  if (
    includesAny(normalizedMessage, [
      "crear regla",
      "crear tarea maestra",
      "crear grupo",
    ])
  ) {
    return "unsupported";
  }

  if (isCreateEventRequest(normalizedMessage)) {
    return "create_event";
  }

  if (isDeleteEventRequest(normalizedMessage)) {
    return "delete_event";
  }

  if (isUpdateEventRequest(normalizedMessage)) {
    return "update_event";
  }

  if (isCreateStaffRequest(normalizedMessage)) {
    return "create_staff";
  }

  if (
    includesAny(normalizedMessage, [
      "inactivar staff",
      "desactivar staff",
      "inactivar personal",
      "desactivar personal",
      "inactivar al staff",
      "desactivar al staff",
      "inactivar al personal",
      "desactivar al personal",
      "inactivar a la persona",
      "desactivar a la persona",
    ])
  ) {
    return "deactivate_staff";
  }

  if (
    includesAny(normalizedMessage, [
      "eliminar staff",
      "borrar staff",
      "eliminar personal",
      "borrar personal",
      "eliminar al staff",
      "borrar al staff",
      "eliminar al personal",
      "borrar al personal",
      "eliminar a la persona",
      "borrar a la persona",
    ])
  ) {
    return "delete_staff";
  }

  if (includesAny(normalizedMessage, ["eliminar tarea", "borrar tarea", "quita la tarea", "quitar tarea"])) {
    return "delete_event_task";
  }

  if (includesAny(normalizedMessage, ["reasigna", "reasignar", "asignale", "asignala", "asignalo", "asigna la tarea", "asignar la tarea"])) {
    return "reassign_event_task";
  }

  if (includesAny(normalizedMessage, ["cambia la hora", "cambiar hora", "mueve la tarea", "programa la tarea", "pon la tarea a"])) {
    return "change_event_task_time";
  }

  if (
    includesAny(normalizedMessage, [
      "crea tarea",
      "crea la tarea",
      "crear tarea",
      "crear la tarea",
      "agrega tarea",
      "agrega la tarea",
      "agregar tarea",
      "agregar la tarea",
      "nueva tarea",
    ]) &&
    includesAny(normalizedMessage, ["evento", "para el evento", "en el evento"])
  ) {
    return "create_event_task";
  }

  return null;
}

function isCreateEventRequest(normalizedMessage: string) {
  return includesAny(normalizedMessage, [
    "crear evento",
    "crear el evento",
    "crea un evento",
    "crea el evento",
    "crea evento",
    "nuevo evento",
    "agregar evento",
    "agregar el evento",
    "registrar evento",
    "registrar el evento",
  ]);
}

function isUpdateEventRequest(normalizedMessage: string) {
  if (normalizedMessage.includes("tarea")) {
    return false;
  }

  return (
    includesAny(normalizedMessage, [
      "modificar evento",
      "modificar el evento",
      "modifica evento",
      "modifica el evento",
      "editar evento",
      "editar el evento",
      "edita evento",
      "edita el evento",
      "actualizar evento",
      "actualizar el evento",
      "actualiza evento",
      "actualiza el evento",
      "cambiar evento",
      "cambiar el evento",
      "cambia evento",
      "cambia el evento",
    ]) ||
    (normalizedMessage.includes("evento") &&
      includesAny(normalizedMessage, [
        "cambia la fecha",
        "cambiar fecha",
        "cambia la hora",
        "cambiar hora",
        "cambia el horario",
        "cambiar horario",
        "cambia el estatus",
        "cambiar estatus",
        "cambia la edad",
        "cambiar edad",
        "cambia el cliente",
        "cambiar cliente",
      ]))
  );
}

function isDeleteEventRequest(normalizedMessage: string) {
  return includesAny(normalizedMessage, [
    "eliminar evento",
    "elimina evento",
    "borrar evento",
    "borra evento",
    "eliminar el evento",
    "elimina el evento",
    "borrar el evento",
    "borra el evento",
  ]);
}

function isCreateStaffRequest(normalizedMessage: string) {
  const mentionsStaffCatalog = includesAny(normalizedMessage, ["staff", "personal", "persona"]);
  const asksToCreate = includesAny(normalizedMessage, ["crea", "crear", "agrega", "agregar", "alta", "nuevo", "nueva"]);

  return mentionsStaffCatalog && asksToCreate;
}

async function resolveEvent({
  currentPath,
  message,
  normalizedMessage,
}: {
  currentPath: string;
  message: string;
  normalizedMessage: string;
}): Promise<
  | { kind: "resolved"; event: EventRecord; eventLabel: string }
  | Extract<AssistantActionPlanResponse, { kind: "clarification_required" }>
> {
  const idFromPath = currentPath.match(/\/admin\/events\/([^/]+)\/tasks/)?.[1];

  if (idFromPath) {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select(eventSelect)
      .eq("id", idFromPath)
      .single();

    if (!error && data) {
      const event = data as EventRecord;

      return { kind: "resolved", event, eventLabel: formatEventLabel(event) };
    }
  }

  const date = extractDate(message);
  const eventName = extractEventName(message, normalizedMessage);
  let query = supabaseAdmin
    .from("events")
    .select(eventSelect)
    .order("event_date", { ascending: false })
    .limit(30);

  if (date) {
    query = query.eq("event_date", date);
  }

  const { data, error } = await query;

  if (error) {
    return { kind: "clarification_required", message: "No pude cargar eventos para resolver la accion.", options: [] };
  }

  const candidates = ((data ?? []) as EventRecord[]).filter((event) => {
    if (!eventName) {
      return Boolean(date);
    }

    return normalizeText(event.celebratory_name).includes(eventName) || eventName.includes(normalizeText(event.celebratory_name));
  });

  if (candidates.length === 1) {
    return { kind: "resolved", event: candidates[0], eventLabel: formatEventLabel(candidates[0]) };
  }

  if (candidates.length > 1) {
    return {
      kind: "clarification_required",
      message: "Encontre mas de un evento posible. Elige el evento correcto y vuelve a pedir la accion mencionandolo.",
      options: candidates.slice(0, 5).map((event) => ({ label: formatEventLabel(event), value: event.id })),
    };
  }

  return {
    kind: "clarification_required",
    message: "No pude identificar el evento. Menciona el festejado y fecha, o abre las tareas del evento y vuelve a pedirlo.",
    options: [],
  };
}

async function resolveEventTask({
  eventId,
  message,
  normalizedMessage,
}: {
  eventId: string;
  message: string;
  normalizedMessage: string;
}): Promise<
  | { kind: "resolved"; task: EventTaskRecord }
  | Extract<AssistantActionPlanResponse, { kind: "clarification_required" }>
> {
  const taskNeedle = extractTaskNeedle(message, normalizedMessage);
  const { data, error } = await supabaseAdmin
    .from("event_tasks")
    .select(eventTaskSelect)
    .eq("event_id", eventId)
    .order("scheduled_time", { ascending: true });

  if (error) {
    return { kind: "clarification_required", message: "No pude cargar las tareas del evento.", options: [] };
  }

  const tasks = (data ?? []) as EventTaskRecord[];
  const matches = taskNeedle
    ? tasks.filter((task) => normalizeText(task.task_name).includes(taskNeedle) || taskNeedle.includes(normalizeText(task.task_name)))
    : [];

  if (matches.length === 1) {
    return { kind: "resolved", task: matches[0] };
  }

  if (matches.length > 1) {
    return {
      kind: "clarification_required",
      message: "Encontre mas de una tarea posible. Vuelve a pedirlo usando el nombre mas exacto de la tarea.",
      options: matches.slice(0, 5).map((task) => ({ label: task.task_name, value: task.id })),
    };
  }

  return {
    kind: "clarification_required",
    message: "No encontre esa tarea dentro del evento resuelto.",
    options: tasks.slice(0, 5).map((task) => ({ label: task.task_name, value: task.id })),
  };
}

async function resolveStaff(
  rawName: string,
): Promise<
  | { kind: "resolved"; staff: StaffRecord }
  | Extract<AssistantActionPlanResponse, { kind: "clarification_required" }>
> {
  const name = normalizeText(rawName);
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("id, name, primary_role, is_active")
    .order("name", { ascending: true });

  if (error) {
    return { kind: "clarification_required", message: "No pude cargar el personal.", options: [] };
  }

  const staff = (data ?? []) as StaffRecord[];
  const matches = staff.filter((member) => {
    const normalizedName = normalizeText(member.name);

    return normalizedName === name || normalizedName.includes(name) || name.includes(normalizedName);
  });

  if (matches.length === 1) {
    return { kind: "resolved", staff: matches[0] };
  }

  if (matches.length > 1) {
    return {
      kind: "clarification_required",
      message: "Encontre mas de una persona posible. Vuelve a pedirlo usando el nombre completo.",
      options: matches.slice(0, 5).map((member) => ({ label: member.name, value: member.id })),
    };
  }

  return {
    kind: "clarification_required",
    message: "No encontre a esa persona en Personal / Staff.",
    options: staff.slice(0, 5).map((member) => ({ label: member.name, value: member.id })),
  };
}

async function resolveStaffList(
  names: string[],
): Promise<
  | { kind: "resolved"; staff: StaffRecord[] }
  | Extract<AssistantActionPlanResponse, { kind: "clarification_required" }>
> {
  const resolved: StaffRecord[] = [];

  for (const name of names) {
    const resolution = await resolveStaff(name);

    if (resolution.kind !== "resolved") {
      return resolution;
    }

    resolved.push(resolution.staff);
  }

  return {
    kind: "resolved",
    staff: resolved.filter((member, index, all) => all.findIndex((item) => item.id === member.id) === index),
  };
}

async function executePlan(plan: AssistantActionPlan) {
  switch (plan.action.type) {
    case "create_event":
      return createEvent(plan.action.eventPayload);
    case "update_event":
      return updateEvent(plan.action.eventId, plan.action.eventPayload);
    case "delete_event":
      return deleteEvent(plan.action.eventId, plan.action.eventLabel);
    case "create_event_task":
      return createEventTask(plan.action);
    case "reassign_event_task":
      return updateEventTaskStaff(plan.action);
    case "change_event_task_time":
      return updateEventTaskTime(plan.action);
    case "delete_event_task":
      return deleteEventTask(plan.action);
    case "create_staff":
      return createStaff(plan.action.staffName);
    case "deactivate_staff":
      return updateStaffActive(plan.action.staffId, false);
    case "delete_staff":
      return deleteStaff(plan.action.staffId);
  }
}

async function createEvent(eventPayload: AssistantEventPayload) {
  const clientId = await saveAssistantEventClient(null, eventPayload);
  const { data: event, error } = await supabaseAdmin
    .from("events")
    .insert({
      client_id: clientId,
      celebratory_name: eventPayload.celebratoryName,
      age: eventPayload.age,
      parents_names: eventPayload.parentsNames,
      event_date: eventPayload.eventDate,
      start_time: toDatabaseTime(eventPayload.startTime),
      end_time: toDatabaseTime(eventPayload.endTime),
      status: eventPayload.status,
    })
    .select("id")
    .single();

  if (error || !event) {
    throw new Error("No se pudo crear el evento.");
  }

  const generatedTasks = await syncBaseEventTasks(supabaseAdmin, event.id as string, {
    start_time: toDatabaseTime(eventPayload.startTime) ?? `${DEFAULT_EVENT_START_TIME}:00`,
    end_time: toDatabaseTime(eventPayload.endTime) ?? `${DEFAULT_EVENT_END_TIME}:00`,
  });

  return `Evento creado: ${eventPayload.celebratoryName}. Tareas base sincronizadas: ${generatedTasks.length}.`;
}

async function updateEvent(eventId: string, eventPayload: AssistantEventPayload) {
  const clientId = await saveAssistantEventClient(eventId, eventPayload);
  const { error } = await supabaseAdmin
    .from("events")
    .update({
      client_id: clientId,
      celebratory_name: eventPayload.celebratoryName,
      age: eventPayload.age,
      parents_names: eventPayload.parentsNames,
      event_date: eventPayload.eventDate,
      start_time: toDatabaseTime(eventPayload.startTime),
      end_time: toDatabaseTime(eventPayload.endTime),
      status: eventPayload.status,
    })
    .eq("id", eventId);

  if (error) {
    throw new Error("No se pudo modificar el evento.");
  }

  const generatedTasks = await syncBaseEventTasks(supabaseAdmin, eventId, {
    start_time: toDatabaseTime(eventPayload.startTime) ?? `${DEFAULT_EVENT_START_TIME}:00`,
    end_time: toDatabaseTime(eventPayload.endTime) ?? `${DEFAULT_EVENT_END_TIME}:00`,
  });

  return `Evento actualizado: ${eventPayload.celebratoryName}. Tareas base sincronizadas: ${generatedTasks.length}.`;
}

async function deleteEvent(eventId: string, eventLabel: string) {
  const { error } = await supabaseAdmin.from("events").delete().eq("id", eventId);

  if (error) {
    throw new Error("No se pudo eliminar el evento. Puede tener datos relacionados que la base de datos impide borrar.");
  }

  return `Evento eliminado: ${eventLabel}`;
}

async function saveAssistantEventClient(eventId: string | null, eventPayload: AssistantEventPayload) {
  if (!eventPayload.clientFullName) {
    return null;
  }

  const clientData = {
    full_name: eventPayload.clientFullName,
    phone: eventPayload.clientPhone,
    email: eventPayload.clientEmail,
  };

  if (eventId) {
    const { data: currentEvent, error: currentEventError } = await supabaseAdmin
      .from("events")
      .select("client_id")
      .eq("id", eventId)
      .single();

    if (currentEventError) {
      throw new Error("No se pudo cargar el cliente actual del evento.");
    }

    if (currentEvent.client_id) {
      const { error } = await supabaseAdmin.from("clients").update(clientData).eq("id", currentEvent.client_id);

      if (error) {
        throw new Error("No se pudo actualizar el cliente del evento.");
      }

      return currentEvent.client_id as string;
    }
  }

  const { data, error } = await supabaseAdmin.from("clients").insert(clientData).select("id").single();

  if (error || !data) {
    throw new Error("No se pudo guardar el cliente del evento.");
  }

  return data.id as string;
}

async function createEventTask(action: Extract<AssistantActionPlan["action"], { type: "create_event_task" }>) {
  const staffError = await validateStaffIds(action.staffIds);

  if (staffError) {
    throw new Error(staffError);
  }

  const { data, error } = await supabaseAdmin
    .from("event_tasks")
    .insert({
      event_id: action.eventId,
      task_name: action.taskName,
      description: action.description,
      scheduled_time: toDatabaseTime(action.scheduledTime),
      staff_id: action.staffIds[0] ?? null,
      role_responsible: null,
      status: "pendiente",
      visibility: action.visibility,
      is_manual_override: true,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("No se pudo crear la tarea.");
  }

  const relationError = await replaceStaffRelations({
    table: "event_task_staff",
    ownerColumn: "event_task_id",
    ownerId: data.id,
    staffIds: action.staffIds,
  });

  if (relationError) {
    await supabaseAdmin.from("event_tasks").delete().eq("id", data.id);
    throw new Error("No se pudieron guardar los responsables.");
  }

  return `Tarea creada: ${action.taskName}`;
}

async function updateEventTaskStaff(action: Extract<AssistantActionPlan["action"], { type: "reassign_event_task" }>) {
  const current = await loadTaskForExecution(action.eventId, action.taskId);
  const staffIds = normalizeStaffIds(action.staffIds);
  const staffError = await validateStaffIds(staffIds);

  if (staffError) {
    throw new Error(staffError);
  }

  const { error } = await supabaseAdmin
    .from("event_tasks")
    .update({
      task_name: current.task_name,
      description: current.description,
      scheduled_time: current.scheduled_time,
      staff_id: staffIds[0] ?? null,
      role_responsible: current.role_responsible,
      status: current.status,
      visibility: current.visibility,
      is_manual_override: true,
    })
    .eq("id", action.taskId)
    .eq("event_id", action.eventId);

  if (error) {
    throw new Error("No se pudo reasignar la tarea.");
  }

  const relationError = await replaceStaffRelations({
    table: "event_task_staff",
    ownerColumn: "event_task_id",
    ownerId: action.taskId,
    staffIds,
  });

  if (relationError) {
    throw new Error("No se pudieron guardar los responsables.");
  }

  return `Responsables actualizados: ${action.staffLabels.join(", ")}`;
}

async function updateEventTaskTime(action: Extract<AssistantActionPlan["action"], { type: "change_event_task_time" }>) {
  const current = await loadTaskForExecution(action.eventId, action.taskId);
  const staffIds = getTaskStaffIds(current);

  const { error } = await supabaseAdmin
    .from("event_tasks")
    .update({
      task_name: current.task_name,
      description: current.description,
      scheduled_time: toDatabaseTime(action.scheduledTime),
      staff_id: staffIds[0] ?? current.staff_id,
      role_responsible: current.role_responsible,
      status: current.status,
      visibility: current.visibility,
      is_manual_override: true,
    })
    .eq("id", action.taskId)
    .eq("event_id", action.eventId);

  if (error) {
    throw new Error("No se pudo cambiar la hora de la tarea.");
  }

  return `Hora actualizada: ${action.scheduledTime}`;
}

async function deleteEventTask(action: Extract<AssistantActionPlan["action"], { type: "delete_event_task" }>) {
  const { error } = await supabaseAdmin
    .from("event_tasks")
    .delete()
    .eq("id", action.taskId)
    .eq("event_id", action.eventId);

  if (error) {
    throw new Error("No se pudo eliminar la tarea.");
  }

  return `Tarea eliminada: ${action.taskName}`;
}

async function createStaff(staffName: string) {
  const { error } = await supabaseAdmin.from("staff").insert({
    name: staffName,
    primary_role: DEFAULT_STAFF_ROLE,
    is_active: true,
  });

  if (error) {
    throw new Error("No se pudo crear el staff.");
  }

  return `Staff creado: ${staffName}`;
}

async function updateStaffActive(staffId: string, isActive: boolean) {
  const staff = await loadStaffForExecution(staffId);
  const { error } = await supabaseAdmin
    .from("staff")
    .update({
      name: staff.name,
      primary_role: staff.primary_role || DEFAULT_STAFF_ROLE,
      is_active: isActive,
    })
    .eq("id", staffId);

  if (error) {
    throw new Error("No se pudo actualizar el staff.");
  }

  return `Staff inactivado: ${staff.name}`;
}

async function deleteStaff(staffId: string) {
  const staff = await loadStaffForExecution(staffId);
  const { error } = await supabaseAdmin.from("staff").delete().eq("id", staffId);

  if (error) {
    throw new Error("No se pudo eliminar el staff. Puede tener relaciones activas en tareas.");
  }

  return `Staff eliminado: ${staff.name}`;
}

async function loadTaskForExecution(eventId: string, taskId: string) {
  const { data, error } = await supabaseAdmin
    .from("event_tasks")
    .select(eventTaskSelect)
    .eq("id", taskId)
    .eq("event_id", eventId)
    .single();

  if (error || !data) {
    throw new Error("La tarea ya no existe o no pertenece al evento.");
  }

  return data as EventTaskRecord;
}

async function loadStaffForExecution(staffId: string) {
  const { data, error } = await supabaseAdmin
    .from("staff")
    .select("id, name, primary_role, is_active")
    .eq("id", staffId)
    .single();

  if (error || !data) {
    throw new Error("La persona de staff ya no existe.");
  }

  return data as StaffRecord;
}

async function countFutureTasksForStaff(staffId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin
    .from("event_task_staff")
    .select("event_task_id, event_tasks!inner(id, events!inner(event_date))")
    .eq("staff_id", staffId)
    .gte("event_tasks.events.event_date", today);

  if (error) {
    return 0;
  }

  return data?.length ?? 0;
}

async function auditAssistantAction({
  errorMessage,
  plan,
  result,
  userId,
}: {
  userId: string;
  plan: AssistantActionPlan;
  result: "success" | "error";
  errorMessage: string | null;
}) {
  try {
    await supabaseAdmin.from("assistant_action_audit").insert({
      user_id: userId,
      original_message: plan.message,
      action_type: plan.type,
      entities: plan.action,
      result,
      error_message: errorMessage,
    });
  } catch {
    // La tabla puede no existir hasta aplicar Documentos/add-assistant-action-audit.sql.
  }
}

function createPlan(plan: Omit<AssistantActionPlan, "createdAt" | "expiresAt">): AssistantActionPlan {
  const createdAt = new Date();

  return {
    ...plan,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + PLAN_TTL_MS).toISOString(),
  };
}

function createPlanId(plan: AssistantActionPlan) {
  return crypto.createHash("sha256").update(signablePlanPayload(plan)).digest("hex").slice(0, 16);
}

function signPlan(plan: AssistantActionPlan) {
  const payload = Buffer.from(signablePlanPayload(plan), "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", getPlanSecret()).update(payload).digest("base64url");

  return `${payload}.${signature}`;
}

function verifyPlan(token: string) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac("sha256", getPlanSecret()).update(payload).digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const plan = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AssistantActionPlan;

    if (new Date(plan.expiresAt).getTime() < Date.now()) {
      return null;
    }

    return plan;
  } catch {
    return null;
  }
}

function getPlanSecret() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "salon-kids-dev-secret";
}

function signablePlanPayload(plan: AssistantActionPlan) {
  return JSON.stringify(plan);
}

function getTaskStaffIds(task: EventTaskRecord) {
  const relationIds = [...(task.event_task_staff ?? [])]
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((relation) => relation.staff_id)
    .filter(Boolean);

  return relationIds.length ? relationIds : task.staff_id ? [task.staff_id] : [];
}

function buildEventPayloadFromMessage(
  message: string,
  normalizedMessage: string,
  currentEvent: EventRecord | null,
): AssistantEventPayload {
  const currentClient = currentEvent ? getEventClient(currentEvent) : null;
  const eventTimes = extractEventTimes(message);

  return {
    celebratoryName: extractCelebratoryName(message, normalizedMessage) ?? currentEvent?.celebratory_name ?? "",
    age: extractAge(message) ?? currentEvent?.age ?? null,
    parentsNames: extractParentsNames(message) ?? currentEvent?.parents_names ?? null,
    eventDate: extractDate(message) ?? currentEvent?.event_date ?? "",
    startTime: eventTimes.startTime ?? currentEvent?.start_time?.slice(0, 5) ?? DEFAULT_EVENT_START_TIME,
    endTime: eventTimes.endTime ?? currentEvent?.end_time?.slice(0, 5) ?? DEFAULT_EVENT_END_TIME,
    status: extractEventStatus(normalizedMessage) ?? currentEvent?.status ?? DEFAULT_EVENT_STATUS,
    clientFullName: extractClientName(message) ?? currentClient?.full_name ?? null,
    clientPhone: extractPhone(message) ?? currentClient?.phone ?? null,
    clientEmail: extractEmail(message) ?? currentClient?.email ?? null,
  };
}

function buildEventPlanDetails(eventPayload: AssistantEventPayload) {
  return [
    `Festejado: ${eventPayload.celebratoryName}`,
    `Edad: ${eventPayload.age ?? "Sin edad"}`,
    `Fecha: ${eventPayload.eventDate}`,
    `Horario: ${eventPayload.startTime} - ${eventPayload.endTime}`,
    `Estatus: ${eventPayload.status}`,
    `Cliente: ${eventPayload.clientFullName ?? "Sin cliente"}`,
    `Telefono: ${eventPayload.clientPhone ?? "Sin telefono"}`,
    `Email: ${eventPayload.clientEmail ?? "Sin email"}`,
    `Papas: ${eventPayload.parentsNames ?? "Sin nombres"}`,
  ];
}

function hasEventUpdate(message: string, normalizedMessage: string) {
  return Boolean(
    extractCelebratoryName(message, normalizedMessage) ||
      extractAge(message) !== null ||
      extractDate(message) ||
      extractEventTimes(message).startTime ||
      extractEventTimes(message).endTime ||
      extractEventStatus(normalizedMessage) ||
      extractClientName(message) ||
      extractPhone(message) ||
      extractEmail(message) ||
      extractParentsNames(message),
  );
}

function getEventClient(event: EventRecord) {
  if (Array.isArray(event.clients)) {
    return event.clients[0] ?? null;
  }

  return event.clients ?? null;
}

function extractCelebratoryName(message: string, normalizedMessage: string) {
  const patterns = [
    /(?:evento|cumple(?:a(?:n|ñ)os)?)\s+(?:para|de)\s+(.+?)(?:\s+de\s+\d{1,2}\s+a(?:n|ñ)os|\s+(?:para|el|del)\s+\d{1,2}\s+de|\s+el\s+\d{1,2}\s+de|\s+con\s+cliente|\s+cliente|\s+papas|\s+a\s+las|\s+de\s+las|,|$)/i,
    /(?:crea|crear|agrega|agregar|registra|registrar)\s+(?:un\s+)?evento\s+(?:para|de)\s+(.+?)(?:\s+de\s+\d{1,2}\s+a(?:n|ñ)os|\s+(?:para|el|del)\s+\d{1,2}\s+de|\s+el\s+\d{1,2}\s+de|\s+con\s+cliente|\s+cliente|\s+papas|\s+a\s+las|\s+de\s+las|,|$)/i,
    /(?:festejad[oa]|nombre del festejad[oa])\s+(.+?)(?:\s+de\s+\d{1,2}\s+a(?:n|ñ)os|\s+fecha|\s+cliente|\s+papas|,|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern)?.[1]?.trim();

    if (match) {
      return cleanLabel(match);
    }
  }

  if (normalizedMessage.includes("evento")) {
    return null;
  }

  return null;
}

function extractAge(message: string) {
  const match = message.match(/\b(\d{1,2})\s*a(?:n|ñ)os?\b/i);

  if (!match) {
    return null;
  }

  const age = Number(match[1]);

  return age > 0 && age < 100 ? age : null;
}

function extractParentsNames(message: string) {
  const match = message.match(/(?:papas|papás|padres)\s+(.+?)(?:\s+cliente|\s+telefono|\s+tel(?:e|é)fono|\s+correo|,|$)/i)?.[1]?.trim();

  return match ? cleanLabel(match) : null;
}

function extractClientName(message: string) {
  const match = message.match(/(?:cliente|anfitri[oó]n|anfitriona)\s+(.+?)(?:\s+telefono|\s+tel(?:e|é)fono|\s+correo|\s+email|,|$)/i)?.[1]?.trim();

  return match ? cleanLabel(match) : null;
}

function extractPhone(message: string) {
  const match = message.match(/(?:telefono|tel(?:e|é)fono|celular)\s+([+()\d\s-]{7,})/i)?.[1]?.trim();

  return match ? cleanLabel(match) : null;
}

function extractEmail(message: string) {
  return message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
}

function extractEventStatus(normalizedMessage: string): EventStatus | null {
  if (normalizedMessage.includes("finalizado")) {
    return "finalizado";
  }

  if (normalizedMessage.includes("validado")) {
    return "validado";
  }

  if (normalizedMessage.includes("guardado")) {
    return "guardado";
  }

  if (normalizedMessage.includes("pendiente")) {
    return "pendiente";
  }

  return null;
}

function extractEventTimes(message: string) {
  const range = message.match(
    /(?:de|desde)\s+(?:las\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)\s+(?:a|hasta)\s+(?:las\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i,
  );

  if (range) {
    return {
      startTime: parseTimeCandidate(range[1]),
      endTime: parseTimeCandidate(range[2]),
    };
  }

  const startTime = message.match(
    /(?:hora inicio|inicio|empieza|comienza|inicia)\s+(?:a\s+)?(?:las\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i,
  )?.[1];
  const endTime = message.match(
    /(?:hora fin|fin|termina|acaba|cierre)\s+(?:a\s+)?(?:las\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i,
  )?.[1];
  const genericTime = message.match(
    /(?:cambia(?:r)?\s+(?:la\s+)?hora|hora\s+del\s+evento|horario\s+del\s+evento)\s+(?:a\s+)?(?:las\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i,
  )?.[1];

  return {
    startTime: parseTimeCandidate(startTime ?? genericTime),
    endTime: parseTimeCandidate(endTime),
  };
}

function parseTimeCandidate(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const suffix = match[3]?.toLowerCase();

  if (suffix?.startsWith("p") && hours < 12) {
    hours += 12;
  }

  if (suffix?.startsWith("a") && hours === 12) {
    hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function extractEventName(message: string, normalizedMessage: string) {
  const patterns = [
    /evento\s+(?:de\s+)?([a-záéíóúñ0-9 ]+?)(?:\s+(?:del|de|para|con|a las|a la|y|,)|$)/i,
    /para\s+(?:el\s+)?evento\s+(?:de\s+)?([a-záéíóúñ0-9 ]+?)(?:\s+(?:del|de|con|a las|a la|y|,)|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern)?.[1]?.trim();

    if (match) {
      return normalizeText(match);
    }
  }

  if (normalizedMessage.includes("evento")) {
    return null;
  }

  return null;
}

function extractTaskNameForCreate(message: string, normalizedMessage: string) {
  const patterns = [
    /(?:crea|crear|agrega|agregar)\s+(?:la\s+)?tarea\s+(?:para|en)\s+(?:el\s+)?evento\s+(?:de\s+)?[a-zÃ¡Ã©Ã­Ã³ÃºÃ±0-9 ]+?\s+de\s+(.+?)(?:\s+(?:la\s+)?tarea\s+(?:sera|será)|\s+a\s+las|\s+a\s+la|,|$)/i,
    /(?:crea|crear|agrega|agregar|nueva)\s+(?:la\s+)?tarea\s+(.+?)(?:\s+(?:para|en)\s+(?:el\s+)?evento|\s+y\s+asigna|\s+asignad?a|\s+a\s+las|\s+a\s+la|,|$)/i,
    /tarea\s+(.+?)(?:\s+(?:para|en)\s+(?:el\s+)?evento|\s+y\s+asigna|\s+asignad?a|\s+a\s+las|\s+a\s+la|,|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern)?.[1]?.trim();

    if (match) {
      return cleanLabel(match);
    }
  }

  return normalizedMessage.includes("tarea") ? null : cleanLabel(message);
}

function extractTaskNeedle(message: string, normalizedMessage: string) {
  const patterns = [
    /tarea\s+(?:de\s+)?(.+?)(?:\s+(?:a|para|en)\s+(?:el\s+)?evento|\s+a\s+[a-záéíóúñ]+|\s+con\s+[a-záéíóúñ]+|\s+a\s+las|\s+a\s+la|,|$)/i,
    /(?:eliminar|borrar|reasignar|reasigna|cambiar hora|cambia la hora)\s+(?:la\s+)?tarea\s+(.+?)(?:\s+(?:a|para|en)\s+(?:el\s+)?evento|\s+a\s+[a-záéíóúñ]+|\s+con\s+[a-záéíóúñ]+|\s+a\s+las|\s+a\s+la|,|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern)?.[1]?.trim();

    if (match) {
      return normalizeText(cleanLabel(match));
    }
  }

  return normalizedMessage.includes("tarea") ? null : normalizeText(message);
}

function extractStaffName(message: string, normalizedMessage: string) {
  const patterns = [
    /(?:agrega|agregar|crea|crear)\s+a\s+(.+?)(?:\s+como\s+(?:nuevo\s+|nueva\s+)?(?:staff|personal|persona)|$)/i,
    /(?:crea|crear|agrega|agregar)\s+(?:staff|personal|persona)\s+(?:nuevo|nueva)?\s*(?:con\s+el\s+nombre\s+de|llamad[oa])\s+(.+?)$/i,
    /(?:staff|personal|persona)\s+(?:a\s+)?([a-záéíóúñ ]+?)(?:\s+(?:como|del|de|en|,)|$)/i,
    /(?:crear|agregar|inactivar|desactivar|eliminar|borrar)\s+([a-záéíóúñ ]+?)(?:\s+(?:al|del|de|como)\s+(?:staff|personal)|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern)?.[1]?.trim();

    if (match) {
      return cleanLabel(match);
    }
  }

  return normalizedMessage.replace(/crear|agregar|inactivar|desactivar|eliminar|borrar|staff|personal/g, "").trim();
}

function extractStaffNamesForAssignment(message: string) {
  const patterns = [
    /(?:asignasela|asignaselo|asignala|asignalo|asignale|asigna|reasigna|responsable(?:s)?)(?:\s+a)?\s+([a-záéíóúñ ,y]+?)(?:\s+(?:en|para)\s+(?:el\s+)?evento|\s+a\s+las|\s+a\s+la|,|$)/i,
    /(?:con|a)\s+([a-záéíóúñ ]+?)(?:\s+a\s+las|\s+a\s+la|,|$)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern)?.[1]?.trim();

    if (match) {
      return match
        .split(/\s+y\s+|,/i)
        .map(cleanLabel)
        .filter(Boolean);
    }
  }

  return [];
}

function extractDate(message: string) {
  const iso = message.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})\b/);

  if (iso) {
    return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  }

  const numeric = message.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](20\d{2}))?\b/);

  if (numeric) {
    const year = numeric[3] ?? String(new Date().getFullYear());

    return `${year}-${numeric[2].padStart(2, "0")}-${numeric[1].padStart(2, "0")}`;
  }

  const monthNames: Record<string, string> = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    setiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };
  const normalizedMessage = normalizeText(message);
  const textDate = normalizedMessage.match(
    /\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+(?:de|del)\s+(20\d{2}))?\b/,
  );

  if (textDate) {
    const year = textDate[3] ?? String(new Date().getFullYear());

    return `${year}-${monthNames[textDate[2]]}-${textDate[1].padStart(2, "0")}`;
  }

  return null;
}

function extractTime(message: string) {
  const match = message.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\b/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? "0");
  const suffix = match[3]?.toLowerCase();

  if (suffix?.startsWith("p") && hours < 12) {
    hours += 12;
  }

  if (suffix?.startsWith("a") && hours === 12) {
    hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function toDatabaseTime(value: string | null) {
  if (!value) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

function formatEventLabel(event: EventRecord) {
  return `${event.celebratory_name} - ${event.event_date}`;
}

function includesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

function cleanLabel(value: string) {
  return value.trim().replace(/\s+/g, " ").replace(/[.,;:]$/g, "");
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
