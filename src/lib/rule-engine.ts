import type { SupabaseClient } from "@supabase/supabase-js";

import {
  replaceStaffRelations,
  type StaffAssignmentMember,
} from "@/lib/staff-assignments";

export type QuestionnaireData = {
  [key: string]: string | number | boolean | string[] | undefined;
  celebratoryFullName?: string;
  eventDateText?: string;
  motherName?: string;
  fatherName?: string;
  contactPhone?: string;
  hostNames?: string;
  emergencyContact?: string;
  guestCount?: number;
  arrivalTime?: string;
  decorationTheme?: string;
  mainColors?: string;

  cake?: boolean;
  cakeFlavor?: string;
  cakeProvider?: string;
  cakeDeliveryTime?: string;
  cakeNames?: string;
  cakeMentionMother?: string;
  cakeMentionFather?: string;
  cakeMentionSiblings?: string;
  cakeMentionGrandparents?: string;
  cakeMentionGodparents?: string;
  cakeMentionOther?: string;
  cakeSpeechOption?: string;
  cakeSpecificSpeechPerson?: string;
  emotionalBox?: boolean;
  cakeCallSong?: string;
  cakeDedicatedSong?: string;
  cakeTime?: string;
  cakeBatucada?: boolean;
  cakeSouvenirs?: boolean;
  cakeSparklers?: boolean;
  cakeSparklerDetails?: string;
  cakeHandSparklerRecipients?: string;
  birthdayBand?: boolean;
  cakeBazookas?: boolean;
  cakeBazookaQuantity?: number;
  cakeCandlesOption?: string;
  cakeCandlesPlacement?: string;

  specialSong?: string;
  celebratoryMusic?: string;
  motherMusic?: string;
  fatherMusic?: string;
  grandparentsMusic?: string;
  djDanceMusic?: boolean;
  danceMusicNotes?: string;
  inviteGuestsToDance?: boolean;
  staffDanceParticipation?: boolean;
  blockedGenres?: string;
  celebratoryDance?: boolean;
  celebratoryDanceSong?: string;
  onlyKidsMusic?: boolean;
  kidsMusicDuration?: string;
  birthdaySongVersion?: string;
  microphoneNeeded?: boolean;
  projectorNeeded?: boolean;
  playlistNotes?: string;

  presentation?: boolean;
  mentionGod?: boolean;
  presentationFocusOption?: string;
  birthStory?: string;
  characterShow?: boolean;
  characterName?: string;
  photoSession?: boolean;
  photoSessionTime?: string;
  photographerName?: string;
  surpriseGift?: boolean;
  surpriseGiftNotes?: string;

  pinata?: boolean;
  pinataCount?: number;
  pinataType?: string;
  pinataStaffDynamic?: boolean;
  pinataDistribution?: string;
  pinataAdultsAllowed?: boolean;
  pinataLineOrder?: string;
  pinataHitCount?: string;
  pinataCandyProvided?: boolean;
  pinataCellophaneBags?: boolean;
  pinataStickProvided?: boolean;
  pinataSafeOpening?: boolean;
  pinataTime?: string;

  reservedTables?: boolean;
  reservedTablesNotes?: string;
  mainTable?: boolean;
  mainTableLocation?: string;
  kidsTables?: boolean;
  kidsTablesCount?: number;
  beverageService?: string;
  bottlesPerTable?: number;
  flavoredWaterOptions?: string;
  tableSetup?: string;
  linenOption?: string;
  adultTableCrayons?: boolean;
  welcomeSign?: boolean;
  giftTable?: boolean;

  salonMenu?: boolean;
  adultMenu?: string;
  foodPlacement?: string;
  taquizaServiceStyle?: string;
  otherMenuServiceStyle?: string;
  spiceLevel?: string;
  kidsMenu?: string;
  kidsMenuCount?: number;
  adultsMenuCount?: number;
  kidsDrink?: string;
  kidsFoodTiming?: string;
  requiredServiceItems?: string;
  foodNotes?: string;
  allergies?: string;
  vendorMeals?: number;

  externalMenu?: boolean;
  externalAdultMenu?: string;
  externalTaquizaStews?: string;
  externalTacoCount?: string;
  externalKidsMenu?: boolean;
  externalKidsMenuDescription?: string;
  externalKidsDrink?: string;
  externalKidsFoodTiming?: string;
  barStaffServesTacos?: boolean;
  guestsSelfServe?: boolean;
  staffCanEatExternalFood?: boolean;

  coffeeServiceTiming?: string;
  centerpieces?: boolean;
  centerpiecesPerTable?: number;
  staffPlacesCenterpieces?: boolean;
  candyTable?: boolean;
  candyTableRibbon?: boolean;
  salonCandyTableRibbon?: boolean;
  reserveCandySamples?: boolean;
  gelatin?: boolean;
  gelatinService?: string;

  nannyService?: boolean;
  valetCarCount?: number;
  parkingPlates?: string;
  extraWaiters?: boolean;
  extraWaitersCount?: number;
  parkingNotes?: string;
  accessibilityNotes?: string;

  externalDecoration?: boolean;
  decoratorArrivalTime?: string;
  clientDecoration?: boolean;
  staffDecorationSupport?: boolean;
  balloonDecorationNotes?: string;

  photoCanvas?: boolean;
  giantPhotoFrame?: boolean;
  candyBags?: boolean;
  candyBagsTiming?: string;
  staffDistributesCandyBags?: boolean;
  souvenirs?: boolean;
  souvenirsTiming?: string;
  souvenirsDistributor?: string;
  congratulationsSignColors?: string;
  signNameOption?: string;

  danceGames?: boolean;
  dynamicsParticipationPolicy?: string;
  dynamicsPlayerLimit?: string;
  reyPide?: boolean;
  reyPideParticipants?: string;
  reyPideTime?: string;
  lobo?: boolean;
  loboParticipants?: string;
  loboTime?: string;
  camiseta?: boolean;
  camisetaParticipants?: string;
  camisetaTime?: string;
  gatoGigante?: boolean;
  gatoGiganteParticipants?: string;
  gatoGiganteTime?: string;
  sillas?: boolean;
  sillasParticipants?: string;
  sillasTime?: string;
  loteria?: boolean;
  loteriaParticipants?: string;
  loteriaTime?: string;
  futbol?: boolean;
  futbolParticipants?: string;
  futbolTime?: string;
  tetrix?: boolean;
  tetrixTime?: string;
  futbolMode?: string;
  futbolDurationOrGoals?: string;
  chocolateMedals?: boolean;
  chocolateMedalsCount?: number;

  trampolineSocksOption?: string;
  foodStartTime?: string;
  presentationTime?: string;
  showTime?: string;
  candyTableTime?: string;
  chocolateFountainTime?: string;
  popsiclesTime?: string;
  iceCreamTime?: string;
  tamalesTime?: string;
  celebratoryDanceTime?: string;
  otherActivityName?: string;
  otherActivityTime?: string;
  citeGuestsEarly?: boolean;
  shareAdditionalServices?: boolean;

  specialGuests?: string;
  protocolNotes?: string;
  finalNotes?: string;
};

export type GeneratedEventTask = {
  event_id: string;
  task_name: string;
  description: string;
  scheduled_time: string | null;
  staff_id?: string | null;
  staff_ids?: string[];
  role_responsible: string;
  visibility: "interna" | "publica";
  status: "pendiente";
  is_manual_override: false;
  source_rule_task_id?: string | null;
  source_master_task_id?: string | null;
};

export type EventSchedule = {
  start_time: string;
  end_time: string;
};

type MasterTaskTemplate = {
  id?: string;
  name: string;
  base_description: string | null;
  visibility: "interna" | "publica";
  area: string | null;
  default_role: string | null;
  default_staff_id: string | null;
  required_responsible_count?: number | null;
  assignment_group_id?: string | null;
  assignment_group_key?: string | null;
  assignment_group_label?: string | null;
  master_task_default_staff?: StaffAssignmentMember[] | null;
};

type TaskRule = {
  key: string;
  taskNames: string[];
  build: (eventId: string, data: QuestionnaireData) => GeneratedEventTask[];
};

export type QuestionnaireRuleOperator =
  | "answered"
  | "equals"
  | "not_equals"
  | "is_true"
  | "is_false"
  | "greater_than"
  | "contains";

export type ConfigurableRuleTask = {
  id: string;
  override_description: string | null;
  override_scheduled_time: string | null;
  schedule_source_field_key: string | null;
  override_role_responsible: string | null;
  override_staff_id: string | null;
  questionnaire_task_rule_task_staff?: StaffAssignmentMember[] | null;
  override_visibility: "interna" | "publica" | null;
  sort_order: number | null;
  master_tasks: {
    id: string;
    name: string;
    base_description: string | null;
    visibility: "interna" | "publica";
    area: string | null;
    default_role: string | null;
    default_staff_id: string | null;
    required_responsible_count?: number | null;
    assignment_group_id?: string | null;
    assignment_group_key?: string | null;
    assignment_group_label?: string | null;
    master_task_default_staff?: StaffAssignmentMember[] | null;
  } | Array<{
    id: string;
    name: string;
    base_description: string | null;
    visibility: "interna" | "publica";
    area: string | null;
    default_role: string | null;
    default_staff_id: string | null;
    required_responsible_count?: number | null;
    assignment_group_id?: string | null;
    assignment_group_key?: string | null;
    assignment_group_label?: string | null;
    master_task_default_staff?: StaffAssignmentMember[] | null;
  }> | null;
};

export type ConfigurableQuestionnaireRule = {
  id: string;
  field_key: string;
  field_label: string;
  section_id: string;
  section_title: string;
  operator: QuestionnaireRuleOperator;
  expected_value: string | number | boolean | string[] | null;
  is_active: boolean;
  questionnaire_task_rule_tasks: ConfigurableRuleTask[];
};

const cleanText = (value?: string) => value?.trim();

const createTask = (
  eventId: string,
  task_name: string,
  description: string,
  scheduled_time: string,
  role_responsible: string,
  visibility: "interna" | "publica" = "interna",
  staff_id: string | null = null,
  staff_ids: string[] = staff_id ? [staff_id] : [],
): GeneratedEventTask => ({
  event_id: eventId,
  task_name,
  description,
  scheduled_time,
  staff_id: staff_ids[0] ?? staff_id,
  staff_ids,
  role_responsible,
  visibility,
  status: "pendiente",
  is_manual_override: false,
});

export const questionnaireRules: TaskRule[] = [
  {
    key: "cake",
    taskNames: ["Preparar protocolo de pastel", "Protocolo de pastel"],
    build: (eventId, data) =>
      data.cake
        ? [
            createTask(
              eventId,
              "Preparar protocolo de pastel",
              "Confirmar mesa, velas, encendedor, cuchillo, nombres a convocar y canción de pastel antes de llamar a los anfitriones.",
              "17:45",
              "Coordinadora",
            ),
            createTask(
              eventId,
              "Protocolo de pastel",
              "Conducir el momento del pastel y coordinar audio, luces y convocatoria de familiares.",
              "18:00",
              "DJ",
              "publica",
            ),
          ]
        : [],
  },
  {
    key: "guest_volume",
    taskNames: ["Ajustar montaje por aforo"],
    build: (eventId, data) =>
      data.guestCount && data.guestCount >= 80
        ? [
            createTask(
              eventId,
              "Ajustar montaje por aforo",
              `Revisar circulacion, mesas y apoyo extra para ${data.guestCount} invitados aproximados.`,
              "13:15",
              "Coordinadora",
            ),
          ]
        : [],
  },
  {
    key: "pinata",
    taskNames: ["Preparar área de piñata", "Piñata"],
    build: (eventId, data) =>
      data.pinata
        ? [
            createTask(
              eventId,
              "Preparar área de piñata",
              "Liberar el área, revisar cuerda o soporte, organizar fila de niños y mantener distancia de seguridad.",
              "18:15",
              "Apoyo",
            ),
            createTask(
              eventId,
              "Piñata",
              "Dirigir la dinámica de piñata con música, orden de turnos y cierre seguro.",
              "18:30",
              "Animación",
              "publica",
            ),
          ]
        : [],
  },
  {
    key: "character_show",
    taskNames: ["Preparar personaje", "Aparición de personaje"],
    build: (eventId, data) => {
      if (!data.characterShow) {
        return [];
      }

      const characterName = cleanText(data.characterName) || "personaje sorpresa";

      return [
        createTask(
          eventId,
          "Preparar personaje",
          `Tener listo vestuario, entrada y apoyo para ${characterName}. Confirmar ventilación y ruta de salida.`,
          "17:30",
          "Animación",
        ),
        createTask(
          eventId,
          "Aparición de personaje",
          `Presentación de ${characterName} para fotos y dinámica breve con invitados.`,
          "17:45",
          "Animación",
          "publica",
        ),
      ];
    },
  },
  {
    key: "special_song",
    taskNames: ["Preparar canción especial"],
    build: (eventId, data) => {
      const specialSong = cleanText(data.specialSong);

      return specialSong
        ? [
            createTask(
              eventId,
              "Preparar canción especial",
              `Buscar, probar volumen y dejar lista la canción especial: ${specialSong}.`,
              "16:45",
              "DJ",
            ),
          ]
        : [];
    },
  },
  {
    key: "allergies",
    taskNames: ["Alertar restricciones alimentarias"],
    build: (eventId, data) => {
      const allergies = cleanText(data.allergies);

      return allergies
        ? [
            createTask(
              eventId,
              "Alertar restricciones alimentarias",
              `Informar a cocina y coordinacion sobre alergias o restricciones: ${allergies}.`,
              "13:20",
              "Cocina",
            ),
          ]
        : [];
    },
  },
  {
    key: "photo_session",
    taskNames: ["Sesion de fotos"],
    build: (eventId, data) =>
      data.photoSession
        ? [
            createTask(
              eventId,
              "Sesion de fotos",
              `Reservar espacio para fotos${data.photographerName ? ` con ${data.photographerName}` : ""}.`,
              cleanText(data.photoSessionTime) || "16:30",
              "Coordinadora",
              "publica",
            ),
          ]
        : [],
  },
  {
    key: "surprise_gift",
    taskNames: ["Preparar sorpresa especial"],
    build: (eventId, data) => {
      const notes = cleanText(data.surpriseGiftNotes);

      return data.surpriseGift
        ? [
            createTask(
              eventId,
              "Preparar sorpresa especial",
              notes || "Coordinar momento sorpresa con anfitriones antes de anunciarlo.",
              "18:45",
              "Animacion",
              "publica",
            ),
          ]
        : [];
    },
  },
  {
    key: "blocked_genres",
    taskNames: ["Bloquear géneros musicales"],
    build: (eventId, data) => {
      const blockedGenres = cleanText(data.blockedGenres);

      return blockedGenres
        ? [
            createTask(
              eventId,
              "Bloquear géneros musicales",
              `Evitar durante todo el evento estos géneros o canciones: ${blockedGenres}.`,
              "13:00",
              "DJ",
            ),
          ]
        : [];
    },
  },
  {
    key: "dance_games",
    taskNames: ["Dinámicas de baile"],
    build: (eventId, data) =>
      data.danceGames
        ? [
            createTask(
              eventId,
              "Dinámicas de baile",
              "Activar dinámica de baile con niños y adultos, cuidando transición hacia pastel o piñata.",
              "17:00",
              "Animación",
              "publica",
            ),
          ]
        : [],
  },
  {
    key: "cake_addons",
    taskNames: [
      "Preparar add-ons de pastel",
      "Confirmar velitas de pastel",
      "Coordinar souvenirs de pastel",
    ],
    build: (eventId, data) => {
      if (!data.cake) {
        return [];
      }

      const tasks: GeneratedEventTask[] = [];
      const addonNotes = [
        data.emotionalBox ? "cajita emotiva" : "",
        data.cakeBatucada ? "batukada" : "",
        data.cakeSparklers ? `chisperos/bombas${data.cakeSparklerDetails ? `: ${data.cakeSparklerDetails}` : ""}` : "",
        data.birthdayBand ? "banda It's my birthday" : "",
        data.cakeBazookas ? `bazukas${data.cakeBazookaQuantity ? ` (${data.cakeBazookaQuantity})` : ""}` : "",
      ].filter(Boolean);

      if (addonNotes.length > 0) {
        tasks.push(
          createTask(
            eventId,
            "Preparar add-ons de pastel",
            `Confirmar y tener listos estos extras del pastel: ${addonNotes.join(", ")}.`,
            "17:35",
            "Coordinadora",
          ),
        );
      }

      if (cleanText(data.cakeCandlesOption) || cleanText(data.cakeCandlesPlacement)) {
        tasks.push(
          createTask(
            eventId,
            "Confirmar velitas de pastel",
            `Velitas: ${data.cakeCandlesOption || "por definir"}. Coloca: ${data.cakeCandlesPlacement || "por definir"}.`,
            "17:40",
            "Apoyo",
          ),
        );
      }

      if (data.cakeSouvenirs) {
        tasks.push(
          createTask(
            eventId,
            "Coordinar souvenirs de pastel",
            "Ubicar souvenirs del cliente y coordinar reparto durante el momento de pastel.",
            "17:50",
            "Apoyo",
          ),
        );
      }

      return tasks;
    },
  },
  {
    key: "cake_speeches",
    taskNames: ["Preparar dedicatorias de pastel"],
    build: (eventId, data) => {
      if (!data.cake || !cleanText(data.cakeSpeechOption)) {
        return [];
      }

      const mentions = [
        data.cakeMentionMother && `mama: ${data.cakeMentionMother}`,
        data.cakeMentionFather && `papa: ${data.cakeMentionFather}`,
        data.cakeMentionSiblings && `hermanos: ${data.cakeMentionSiblings}`,
        data.cakeMentionGrandparents && `abuelitos: ${data.cakeMentionGrandparents}`,
        data.cakeMentionGodparents && `padrinos: ${data.cakeMentionGodparents}`,
        data.cakeMentionOther && `otros: ${data.cakeMentionOther}`,
      ].filter(Boolean);

      return [
        createTask(
          eventId,
          "Preparar dedicatorias de pastel",
          `Opcion de palabras: ${data.cakeSpeechOption}. ${data.cakeSpecificSpeechPerson ? `Persona especifica: ${data.cakeSpecificSpeechPerson}. ` : ""}${mentions.length > 0 ? `Mencionar ${mentions.join("; ")}.` : "Confirmar nombres antes de iniciar."}`,
          "17:45",
          "Coordinadora",
        ),
      ];
    },
  },
  {
    key: "music_preferences",
    taskNames: ["Preparar ambiente musical"],
    build: (eventId, data) => {
      const notes = [
        cleanText(data.celebratoryMusic) && `festejado(a): ${data.celebratoryMusic}`,
        cleanText(data.motherMusic) && `mama: ${data.motherMusic}`,
        cleanText(data.fatherMusic) && `papa: ${data.fatherMusic}`,
        cleanText(data.grandparentsMusic) && `abuelitos: ${data.grandparentsMusic}`,
        data.djDanceMusic && cleanText(data.danceMusicNotes) && `baile: ${data.danceMusicNotes}`,
        data.onlyKidsMusic ? "solo musica infantil todo el evento" : cleanText(data.kidsMusicDuration) && `musica infantil: ${data.kidsMusicDuration}`,
      ].filter(Boolean);

      return notes.length > 0 || data.inviteGuestsToDance || data.staffDanceParticipation
        ? [
            createTask(
              eventId,
              "Preparar ambiente musical",
              `Configurar musica y ambiente. ${notes.join("; ")}${data.inviteGuestsToDance ? "; invitar asistentes a bailar" : ""}${data.staffDanceParticipation ? "; staff participa bailando" : ""}.`,
              "13:10",
              "DJ",
            ),
          ]
        : [];
    },
  },
  {
    key: "presentation",
    taskNames: ["Preparar presentacion del festejado"],
    build: (eventId, data) =>
      data.presentation
        ? [
            createTask(
              eventId,
              "Preparar presentacion del festejado",
              `Presentacion autorizada. Mencionar a Dios: ${data.mentionGod ? "si" : "no"}. ${data.birthStory ? `Relato: ${data.birthStory}` : "Confirmar enfoque con la familia."}`,
              cleanText(data.presentationTime) || "17:20",
              "Coordinadora",
              "publica",
            ),
          ]
        : [],
  },
  {
    key: "pinata_details",
    taskNames: ["Configurar dinamica de pinata"],
    build: (eventId, data) =>
      data.pinata
        ? [
            createTask(
              eventId,
              "Configurar dinamica de pinata",
              `Pinatas: ${data.pinataCount ?? "por definir"}. ${data.pinataDistribution || "Distribucion por definir"}. Adultos: ${data.pinataAdultsAllowed ? "si" : "no"}. Formacion: ${data.pinataLineOrder || "por definir"}. Golpes festejado(a): ${data.pinataHitCount || "por definir"}.`,
              "18:10",
              "Animacion",
            ),
          ]
        : [],
  },
  {
    key: "pinata_supplies",
    taskNames: ["Preparar insumos de pinata"],
    build: (eventId, data) => {
      if (!data.pinata) {
        return [];
      }

      const supplies = [
        data.pinataStaffDynamic ? "dinamica previa con staff" : "",
        data.pinataCandyProvided ? "bolsitas del cliente" : "",
        data.pinataCellophaneBags ? "bolsitas de celofan del salon" : "",
        data.pinataStickProvided ? "palo de pinata del salon" : "",
        data.pinataSafeOpening ? "abrir antes de romperse por seguridad" : "",
      ].filter(Boolean);

      return supplies.length > 0
        ? [
            createTask(
              eventId,
              "Preparar insumos de pinata",
              `Tener listos: ${supplies.join(", ")}.`,
              "18:00",
              "Apoyo",
            ),
          ]
        : [];
    },
  },
  {
    key: "tables_drinks_linen",
    taskNames: ["Preparar montaje de mesas y bebidas"],
    build: (eventId, data) => {
      const hasTableSignal =
        data.reservedTables ||
        data.mainTable ||
        data.kidsTables ||
        cleanText(data.beverageService) ||
        cleanText(data.linenOption) ||
        data.adultTableCrayons ||
        cleanText(data.tableSetup);

      return hasTableSignal
        ? [
            createTask(
              eventId,
              "Preparar montaje de mesas y bebidas",
              `Reservas: ${data.reservedTables ? data.reservedTablesNotes || "si" : "no"}. Mesa principal: ${data.mainTable ? data.mainTableLocation || "si" : "no"}. Mesitas ninos: ${data.kidsTables ? data.kidsTablesCount ?? "si" : "no"}. Bebidas: ${data.beverageService || "por definir"}. Manteleria: ${data.linenOption || "por definir"}.`,
              "12:45",
              "Coordinadora",
            ),
          ]
        : [];
    },
  },
  {
    key: "salon_menu",
    taskNames: ["Coordinar menu contratado con salon"],
    build: (eventId, data) =>
      data.salonMenu
        ? [
            createTask(
              eventId,
              "Coordinar menu contratado con salon",
              `Adultos: ${data.adultMenu || "por definir"}. Ninos: ${data.kidsMenu || "por definir"}. Ubicacion: ${data.foodPlacement || "por definir"}. Picor: ${data.spiceLevel || "por definir"}. Servicio infantil: ${data.kidsFoodTiming || "por definir"}.`,
              cleanText(data.foodStartTime) || "15:00",
              "Cocina",
            ),
          ]
        : [],
  },
  {
    key: "external_menu",
    taskNames: ["Coordinar menu externo"],
    build: (eventId, data) =>
      data.externalMenu
        ? [
            createTask(
              eventId,
              "Coordinar menu externo",
              `Menu externo adultos: ${data.externalAdultMenu || "por definir"}. Tacos: ${data.externalTacoCount || "por definir"}. Menu infantil: ${data.externalKidsMenu ? data.externalKidsMenuDescription || "si" : "no"}. Barra sirve tacos: ${data.barStaffServesTacos ? "si" : "no"}. Staff puede comer: ${data.staffCanEatExternalFood ? "si" : "no"}.`,
              cleanText(data.foodStartTime) || "15:00",
              "Coordinadora",
            ),
          ]
        : [],
  },
  {
    key: "coffee_candy_gelatin",
    taskNames: ["Coordinar cafe dulces y gelatina"],
    build: (eventId, data) => {
      const hasSignal =
        cleanText(data.coffeeServiceTiming) ||
        data.centerpieces ||
        data.candyTable ||
        data.gelatin;

      return hasSignal
        ? [
            createTask(
              eventId,
              "Coordinar cafe dulces y gelatina",
              `Cafe: ${data.coffeeServiceTiming || "sin indicacion"}. Centros: ${data.centerpieces ? `${data.centerpiecesPerTable ?? "por definir"} por mesa` : "no"}. Mesa de dulces: ${data.candyTable ? "si" : "no"}. Gelatina: ${data.gelatin ? data.gelatinService || "si" : "no"}.`,
              "15:20",
              "Apoyo",
            ),
          ]
        : [];
    },
  },
  {
    key: "support_services",
    taskNames: ["Coordinar servicios de apoyo"],
    build: (eventId, data) => {
      const hasSignal = data.nannyService || data.valetCarCount || data.extraWaiters || cleanText(data.parkingPlates);

      return hasSignal
        ? [
            createTask(
              eventId,
              "Coordinar servicios de apoyo",
              `Nanny: ${data.nannyService ? "si" : "no"}. Valet autos: ${data.valetCarCount ?? "por definir"}. Meseros extra: ${data.extraWaiters ? data.extraWaitersCount ?? "si" : "no"}. Placas: ${data.parkingPlates || "sin placas"}.`,
              "12:50",
              "Coordinadora",
            ),
          ]
        : [];
    },
  },
  {
    key: "decoration_setup",
    taskNames: ["Coordinar decoracion y montaje externo"],
    build: (eventId, data) => {
      const hasSignal = data.externalDecoration || data.clientDecoration || data.staffDecorationSupport || cleanText(data.balloonDecorationNotes);

      return hasSignal
        ? [
            createTask(
              eventId,
              "Coordinar decoracion y montaje externo",
              `Decoracion externa: ${data.externalDecoration ? `si, llega ${data.decoratorArrivalTime || "por definir"}` : "no"}. Decora cliente: ${data.clientDecoration ? "si" : "no"}. Apoyo salon: ${data.staffDecorationSupport ? "si" : "no"}. ${data.balloonDecorationNotes || ""}`,
              cleanText(data.decoratorArrivalTime) || "11:30",
              "Coordinadora",
            ),
          ]
        : [];
    },
  },
  {
    key: "misc_deliverables",
    taskNames: ["Preparar entregables varios"],
    build: (eventId, data) => {
      const hasSignal = data.photoCanvas || data.giantPhotoFrame || data.candyBags || data.souvenirs || cleanText(data.congratulationsSignColors);

      return hasSignal
        ? [
            createTask(
              eventId,
              "Preparar entregables varios",
              `Lona: ${data.photoCanvas ? "si" : "no"}. Marco gigante: ${data.giantPhotoFrame ? "si" : "no"}. Bolsitas: ${data.candyBags ? data.candyBagsTiming || "si" : "no"}. Recuerditos: ${data.souvenirs ? data.souvenirsTiming || "si" : "no"}. Letrero: ${data.congratulationsSignColors || "sin indicacion"}.`,
              "14:00",
              "Apoyo",
            ),
          ]
        : [];
    },
  },
  {
    key: "dynamics_program",
    taskNames: ["Preparar dinamicas seleccionadas"],
    build: (eventId, data) => {
      if (!data.danceGames) {
        return [];
      }

      const games = [
        data.reyPide && `Rey pide (${data.reyPideParticipants || "participantes por definir"})`,
        data.lobo && `Lobo (${data.loboParticipants || "participantes por definir"})`,
        data.camiseta && `Camiseta (${data.camisetaParticipants || "participantes por definir"})`,
        data.gatoGigante && `Gato gigante (${data.gatoGiganteParticipants || "participantes por definir"})`,
        data.sillas && `Sillas (${data.sillasParticipants || "participantes por definir"})`,
        data.loteria && `Loteria (${data.loteriaParticipants || "participantes por definir"})`,
        data.futbol && `Futbol (${data.futbolMode || "modo por definir"} ${data.futbolDurationOrGoals || ""})`,
        data.tetrix && "Tetrix gigante",
      ].filter(Boolean);

      return [
        createTask(
          eventId,
          "Preparar dinamicas seleccionadas",
          `Dinamicas: ${games.length > 0 ? games.join("; ") : "por definir"}. Limite: ${data.dynamicsPlayerLimit || "por definir"}. Medallas: ${data.chocolateMedals ? data.chocolateMedalsCount ?? "si" : "no"}.`,
          "16:30",
          "Animacion",
          "publica",
        ),
      ];
    },
  },
  {
    key: "safety_socks",
    taskNames: ["Confirmar calcetas de seguridad"],
    build: (eventId, data) =>
      cleanText(data.trampolineSocksOption)
        ? [
            createTask(
              eventId,
              "Confirmar calcetas de seguridad",
              `Opcion seleccionada para cama elastica y tirolesa: ${data.trampolineSocksOption}.`,
              "13:00",
              "Coordinadora",
            ),
          ]
        : [],
  },
  {
    key: "activity_program",
    taskNames: [
      "Inicio de comida",
      "Presentacion del festejado",
      "Show contratado",
      "Mesa de dulces",
      "Fuente de chocolate",
      "Paletas",
      "Helados",
      "Tamales",
      "Baile del festejado",
      "Otra actividad programada",
    ],
    build: (eventId, data) => {
      const programItems: Array<[string, string | undefined, string]> = [
        ["Inicio de comida", data.foodStartTime, "Iniciar servicio de alimentos segun programa."],
        ["Presentacion del festejado", data.presentationTime, "Realizar presentacion del festejado(a)."],
        ["Show contratado", data.showTime, "Coordinar entrada y apoyo para show contratado."],
        ["Mesa de dulces", data.candyTableTime, "Activar o inaugurar mesa de dulces."],
        ["Fuente de chocolate", data.chocolateFountainTime, "Activar fuente de chocolate."],
        ["Paletas", data.popsiclesTime, "Coordinar servicio de paletas."],
        ["Helados", data.iceCreamTime, "Coordinar servicio de helados."],
        ["Tamales", data.tamalesTime, "Coordinar servicio de tamales."],
        ["Baile del festejado", data.celebratoryDanceTime, "Coordinar baile del festejado(a)."],
      ];

      const tasks = programItems
        .filter(([, time]) => cleanText(time))
        .map(([name, time, description]) =>
          createTask(eventId, name, description, normalizeTime(time as string), "Coordinadora", "publica"),
        );

      const otherActivityName =
        cleanText(data.otherActivityName) ||
        (cleanText(data.otherActivityTime)?.match(/^\d{2}:\d{2}(:\d{2})?$/)
          ? ""
          : cleanText(data.otherActivityTime));
      const otherActivityTime = cleanText(data.otherActivityTime);

      if (otherActivityName) {
        tasks.push(
          createTask(
            eventId,
            "Otra actividad programada",
            `Actividad adicional indicada por cliente: ${otherActivityName}.`,
            otherActivityTime && /^\d{2}:\d{2}(:\d{2})?$/.test(otherActivityTime)
              ? normalizeTime(otherActivityTime)
              : "17:00",
            "Coordinadora",
            "publica",
          ),
        );
      }

      return tasks;
    },
  },
];

export function buildReactiveTasks(eventId: string, data: QuestionnaireData) {
  return questionnaireRules.flatMap((rule) => rule.build(eventId, data));
}

export function getReactiveTaskNames() {
  return questionnaireRules.flatMap((rule) => rule.taskNames);
}

function isAnswered(value: QuestionnaireData[string]) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== "" && value !== false;
}

function compareValues(value: QuestionnaireData[string], expected: ConfigurableQuestionnaireRule["expected_value"]) {
  if (typeof value === "number" || typeof expected === "number") {
    return Number(value) === Number(expected);
  }

  return String(value ?? "") === String(expected ?? "");
}

export function evaluateQuestionnaireRule(
  rule: Pick<ConfigurableQuestionnaireRule, "field_key" | "operator" | "expected_value">,
  data: QuestionnaireData,
) {
  const value = data[rule.field_key];

  switch (rule.operator) {
    case "answered":
      return isAnswered(value);
    case "equals":
      return compareValues(value, rule.expected_value);
    case "not_equals":
      return !compareValues(value, rule.expected_value);
    case "is_true":
      return value === true;
    case "is_false":
      return value === false;
    case "greater_than":
      return Number(value) > Number(rule.expected_value);
    case "contains":
      if (Array.isArray(value)) {
        return value.includes(String(rule.expected_value ?? ""));
      }

      return String(value ?? "")
        .toLowerCase()
        .includes(String(rule.expected_value ?? "").toLowerCase());
    default:
      return false;
  }
}

function normalizeRuleTime(value?: string | null) {
  if (!value) {
    return null;
  }

  return value.length > 5 ? value.slice(0, 5) : value;
}

function toEventTaskRow(task: GeneratedEventTask) {
  const row = { ...task };
  delete row.staff_ids;

  return row;
}

async function persistEventTaskStaff(taskId: string, task: GeneratedEventTask) {
  const staffIds = task.staff_ids ?? (task.staff_id ? [task.staff_id] : []);
  const relationError = await replaceStaffRelations({
    table: "event_task_staff",
    ownerColumn: "event_task_id",
    ownerId: taskId,
    staffIds,
  });

  if (relationError) {
    throw relationError;
  }
}

function getQuestionnaireAnswerTime(fieldKey: string | null | undefined, data: QuestionnaireData) {
  if (!fieldKey) {
    return null;
  }

  const value = data[fieldKey];

  if (typeof value !== "string" || !/^\d{2}:\d{2}(:\d{2})?$/.test(value.trim())) {
    return null;
  }

  return normalizeRuleTime(value.trim());
}

function getOtherActivityName(data: QuestionnaireData) {
  const explicitName = cleanText(data.otherActivityName);
  const legacyValue = cleanText(data.otherActivityTime);

  if (explicitName) {
    return explicitName;
  }

  if (legacyValue && !/^\d{2}:\d{2}(:\d{2})?$/.test(legacyValue)) {
    return legacyValue;
  }

  return null;
}

export async function loadActiveQuestionnaireRules(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("questionnaire_task_rules")
    .select(
      "id, field_key, field_label, section_id, section_title, operator, expected_value, is_active, questionnaire_task_rule_tasks(id, override_description, override_scheduled_time, schedule_source_field_key, override_role_responsible, override_staff_id, override_visibility, sort_order, questionnaire_task_rule_task_staff(staff_id, sort_order), master_tasks(id, name, base_description, visibility, area, default_role, default_staff_id, required_responsible_count, assignment_group_id, assignment_group_key, assignment_group_label, master_task_default_staff(staff_id, sort_order)))",
    )
    .eq("is_active", true)
    .order("section_id", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as ConfigurableQuestionnaireRule[];
}

export async function buildConfigurableReactiveTasks(
  supabase: SupabaseClient,
  eventId: string,
  data: QuestionnaireData,
) {
  const rules = await loadActiveQuestionnaireRules(supabase);

  return rules.flatMap((rule) => {
    if (!evaluateQuestionnaireRule(rule, data)) {
      return [];
    }

    return (rule.questionnaire_task_rule_tasks ?? [])
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((ruleTask): GeneratedEventTask | null => {
        const masterTask = Array.isArray(ruleTask.master_tasks)
          ? ruleTask.master_tasks[0]
          : ruleTask.master_tasks;

        if (!masterTask) {
          return null;
        }

        const baseDescription =
          ruleTask.override_description ||
          masterTask.base_description ||
          `Ejecutar tarea generada por la respuesta "${rule.field_label}".`;
        const otherActivityName = rule.field_key === "otherActivityName"
          ? getOtherActivityName(data)
          : null;

        return {
          event_id: eventId,
          task_name: masterTask.name,
          description: otherActivityName
            ? `${baseDescription} Actividad: ${otherActivityName}.`
            : baseDescription,
          scheduled_time:
            normalizeRuleTime(ruleTask.override_scheduled_time) ??
            getQuestionnaireAnswerTime(ruleTask.schedule_source_field_key, data) ??
            getQuestionnaireAnswerTime(rule.field_key, data),
          role_responsible:
            ruleTask.override_role_responsible || masterTask.default_role || "Coordinadora",
          staff_id: null,
          staff_ids: [],
          visibility: ruleTask.override_visibility || masterTask.visibility,
          status: "pendiente",
          is_manual_override: false,
          source_rule_task_id: ruleTask.id,
          source_master_task_id: masterTask.id,
        } satisfies GeneratedEventTask;
      })
      .filter(Boolean) as GeneratedEventTask[];
  });
}

export async function syncReactiveTasks(
  supabase: SupabaseClient,
  eventId: string,
  data: QuestionnaireData,
) {
  const tasks = await buildConfigurableReactiveTasks(supabase, eventId, data);
  const generatedSourceIds = new Set(
    tasks.map((task) => task.source_rule_task_id).filter(Boolean) as string[],
  );

  const { data: existingTasks, error: existingError } = await supabase
    .from("event_tasks")
    .select("id, source_rule_task_id, is_manual_override, created_at")
    .eq("event_id", eventId)
    .not("source_rule_task_id", "is", null)
    .order("created_at", { ascending: true });

  if (existingError) {
    throw existingError;
  }

  const existingBySource = new Map<
    string,
    Array<{
      id: string;
      source_rule_task_id: string;
      is_manual_override: boolean;
    }>
  >();

  for (const existingTask of existingTasks ?? []) {
    if (!existingTask.source_rule_task_id) {
      continue;
    }

    const sourceTasks = existingBySource.get(existingTask.source_rule_task_id) ?? [];
    sourceTasks.push({
      id: existingTask.id,
      source_rule_task_id: existingTask.source_rule_task_id,
      is_manual_override: Boolean(existingTask.is_manual_override),
    });
    existingBySource.set(existingTask.source_rule_task_id, sourceTasks);
  }

  const idsToDelete = new Set<string>();
  const tasksToInsert: GeneratedEventTask[] = [];
  const tasksToUpdate: Array<{ id: string; task: GeneratedEventTask }> = [];

  for (const [sourceId, sourceTasks] of existingBySource) {
    if (!generatedSourceIds.has(sourceId)) {
      sourceTasks.forEach((task) => idsToDelete.add(task.id));
    }
  }

  for (const task of tasks) {
    const sourceId = task.source_rule_task_id;

    if (!sourceId) {
      tasksToInsert.push(task);
      continue;
    }

    const sourceTasks = existingBySource.get(sourceId) ?? [];
    const manualTaskExists = sourceTasks.some((existingTask) => existingTask.is_manual_override);

    if (manualTaskExists) {
      sourceTasks
        .filter((existingTask) => !existingTask.is_manual_override)
        .forEach((existingTask) => idsToDelete.add(existingTask.id));
      continue;
    }

    const [taskToUpdate, ...duplicateTasks] = sourceTasks.filter(
      (existingTask) => !existingTask.is_manual_override,
    );

    duplicateTasks.forEach((existingTask) => idsToDelete.add(existingTask.id));

    if (taskToUpdate) {
      tasksToUpdate.push({ id: taskToUpdate.id, task });
    } else {
      tasksToInsert.push(task);
    }
  }

  if (idsToDelete.size > 0) {
    const { error: deleteError } = await supabase
      .from("event_tasks")
      .delete()
      .eq("event_id", eventId)
      .in("id", Array.from(idsToDelete));

    if (deleteError) {
      throw deleteError;
    }
  }

  for (const { id, task } of tasksToUpdate) {
    const { error: updateError } = await supabase
      .from("event_tasks")
      .update(toEventTaskRow(task))
      .eq("event_id", eventId)
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    await persistEventTaskStaff(id, task);
  }

  if (tasksToInsert.length === 0) {
    return tasks;
  }

  const { data: insertedTasks, error: insertError } = await supabase
    .from("event_tasks")
    .insert(tasksToInsert.map(toEventTaskRow))
    .select("id, source_rule_task_id");

  if (insertError) {
    throw insertError;
  }

  for (const insertedTask of insertedTasks ?? []) {
    const sourceTask = tasksToInsert.find(
      (task) => task.source_rule_task_id === insertedTask.source_rule_task_id,
    );

    if (sourceTask) {
      await persistEventTaskStaff(insertedTask.id, sourceTask);
    }
  }

  return tasks;
}

function normalizeTime(value: string) {
  return value.length > 5 ? value.slice(0, 5) : value;
}

function isEntranceOrClosingTemplate(task: MasterTaskTemplate) {
  const name = task.name.toLowerCase();

  if (QUESTIONNAIRE_ONLY_BASE_TASK_NAMES.some((taskName) => taskName.toLowerCase() === name)) {
    return false;
  }

  return (
    name.includes("entrada") ||
    name.includes("cierre") ||
    name.includes("desmontaje") ||
    name.startsWith("montaje -")
  );
}

const QUESTIONNAIRE_ONLY_BASE_TASK_NAMES = [
  "Montaje - Recepcion de proveedores",
  "Colocar letreros de reservados",
  "Montar mesitas infantiles",
  "Colocar centros de mesa",
  "Colocar lona decorativa",
  "Colocar marco gigante de fotos",
];

function buildBaseTaskFromTemplate(
  eventId: string,
  schedule: EventSchedule,
  template: MasterTaskTemplate,
) {
  const haystack = `${template.name} ${template.area ?? ""}`.toLowerCase();
  const isClosing =
    haystack.includes("cierre") || haystack.includes("desmontaje") || haystack.includes("salida");

  return {
    ...createTask(
    eventId,
    template.name,
    template.base_description || "Ejecutar la plantilla operativa segun el montaje del salon.",
    isClosing ? normalizeTime(schedule.end_time) : normalizeTime(schedule.start_time),
    template.default_role || "Coordinadora",
    template.visibility,
    ),
    source_master_task_id: template.id ?? null,
  };
}

export function buildFallbackBaseTasks(eventId: string, schedule: EventSchedule) {
  return [
    createTask(
      eventId,
      "Entrada - Preparacion general",
      "Abrir salon, revisar limpieza, encender equipo base y confirmar que areas de montaje esten listas.",
      normalizeTime(schedule.start_time),
      "Coordinadora",
    ),
    createTask(
      eventId,
      "Entrada - Recepcion operativa",
      "Recibir proveedores, ubicar regalos o pastel, validar mobiliario y dejar listo el flujo inicial de invitados.",
      normalizeTime(schedule.start_time),
      "Apoyo",
    ),
    createTask(
      eventId,
      "Cierre - Desmontaje general",
      "Coordinar salida de invitados, resguardar objetos olvidados y comenzar desmontaje sin afectar a clientes.",
      normalizeTime(schedule.end_time),
      "Coordinadora",
    ),
    createTask(
      eventId,
      "Cierre - Limpieza y resguardo",
      "Revisar banos, cocina, pista y areas infantiles. Guardar material operativo y reportar pendientes.",
      normalizeTime(schedule.end_time),
      "Apoyo",
    ),
  ];
}

export function buildBaseEventTasks(
  eventId: string,
  schedule: EventSchedule,
  templates: MasterTaskTemplate[],
) {
  const baseTemplates = templates.filter(isEntranceOrClosingTemplate);

  if (baseTemplates.length === 0) {
    return buildFallbackBaseTasks(eventId, schedule);
  }

  return baseTemplates.map((template) => buildBaseTaskFromTemplate(eventId, schedule, template));
}

export async function syncBaseEventTasks(
  supabase: SupabaseClient,
  eventId: string,
  schedule: EventSchedule,
) {
  const { data: templates, error: templatesError } = await supabase
    .from("master_tasks")
    .select("id, name, base_description, visibility, area, default_role, default_staff_id, required_responsible_count, assignment_group_id, assignment_group_key, assignment_group_label, master_task_default_staff(staff_id, sort_order)");

  if (templatesError) {
    throw templatesError;
  }

  const tasks = buildBaseEventTasks(
    eventId,
    schedule,
    (templates ?? []) as MasterTaskTemplate[],
  );
  const taskNames = tasks.map((task) => task.task_name);
  const cleanupTaskNames = [...taskNames, ...QUESTIONNAIRE_ONLY_BASE_TASK_NAMES];

  const { error: deleteError } = await supabase
    .from("event_tasks")
    .delete()
    .eq("event_id", eventId)
    .eq("is_manual_override", false)
    .is("source_rule_task_id", null)
    .in("task_name", cleanupTaskNames);

  if (deleteError) {
    throw deleteError;
  }

  const { data: insertedTasks, error: insertError } = await supabase
    .from("event_tasks")
    .insert(tasks.map(toEventTaskRow))
    .select("id, task_name");

  if (insertError) {
    throw insertError;
  }

  for (const insertedTask of insertedTasks ?? []) {
    const sourceTask = tasks.find((task) => task.task_name === insertedTask.task_name);

    if (sourceTask) {
      await persistEventTaskStaff(insertedTask.id, sourceTask);
    }
  }

  return tasks;
}
