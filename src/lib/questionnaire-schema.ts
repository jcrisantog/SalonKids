import type { QuestionnaireData } from "@/lib/rule-engine";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "time"
  | "boolean"
  | "single"
  | "multi";

export type QuestionnaireField = {
  key: keyof QuestionnaireData;
  label: string;
  type: FieldType;
  isInternal?: boolean;
  placeholder?: string;
  helper?: string;
  options?: string[];
  dependsOn?: keyof QuestionnaireData;
  dependsValue?: unknown;
};

export type QuestionnaireSection = {
  id: string;
  title: string;
  description: string;
  fields: QuestionnaireField[];
};

const yesNoOptions = ["Si", "No"];
const yesNoSalonOptions = ["Si", "No", "Salon"];
const participantOptions = ["Solo ninos", "Tambien adultos"];

export const emptyQuestionnaire: QuestionnaireData = {
  celebratoryFullName: "",
  eventDateText: "",
  motherName: "",
  fatherName: "",
  contactPhone: "",
  hostNames: "",
  emergencyContact: "",
  guestCount: undefined,
  arrivalTime: "",
  decorationTheme: "",
  mainColors: "",

  cake: false,
  cakeFlavor: "",
  cakeProvider: "",
  cakeDeliveryTime: "",
  cakeNames: "",
  cakeMentionMother: "",
  cakeMentionFather: "",
  cakeMentionSiblings: "",
  cakeMentionGrandparents: "",
  cakeMentionGodparents: "",
  cakeMentionOther: "",
  cakeSpeechOption: "",
  cakeSpecificSpeechPerson: "",
  emotionalBox: false,
  cakeCallSong: "",
  cakeDedicatedSong: "",
  cakeTime: "",
  birthdaySongVersion: "",
  cakeBatucada: false,
  cakeSouvenirs: false,
  cakeSparklers: false,
  cakeSparklerDetails: "",
  cakeHandSparklerRecipients: "",
  birthdayBand: false,
  cakeBazookas: false,
  cakeBazookaQuantity: undefined,
  cakeCandlesOption: "",
  cakeCandlesPlacement: "",

  specialSong: "",
  celebratoryMusic: "",
  motherMusic: "",
  fatherMusic: "",
  grandparentsMusic: "",
  djDanceMusic: false,
  danceBlockTime: "",
  danceMusicNotes: "",
  inviteGuestsToDance: false,
  staffDanceParticipation: false,
  blockedGenres: "",
  celebratoryDance: false,
  celebratoryDanceSong: "",
  onlyKidsMusic: false,
  kidsMusicDuration: "",
  playlistNotes: "",
  microphoneNeeded: false,
  projectorNeeded: false,

  presentation: false,
  mentionGod: false,
  presentationFocusOption: "",
  birthStory: "",
  characterShow: false,
  characterName: "",
  characterTime: "",
  photoSession: false,
  photoSessionTime: "",
  photographerName: "",
  surpriseGift: false,
  surpriseGiftNotes: "",

  pinata: false,
  pinataCount: undefined,
  pinataType: "",
  pinataStaffDynamic: false,
  pinataDistribution: "",
  pinataAdultsAllowed: false,
  pinataLineOrder: "",
  pinataHitCount: "",
  pinataCandyProvided: false,
  pinataCellophaneBags: false,
  pinataStickProvided: false,
  pinataSafeOpening: false,
  pinataTime: "",

  reservedTables: false,
  reservedTablesNotes: "",
  mainTable: false,
  mainTableLocation: "",
  kidsTables: false,
  kidsTablesCount: undefined,
  beverageService: "",
  bottlesPerTable: undefined,
  flavoredWaterOptions: "",
  tableSetup: "",
  linenOption: "",
  adultTableCrayons: false,
  welcomeSign: false,
  giftTable: false,

  salonMenu: false,
  adultMenu: "",
  foodPlacement: "",
  taquizaServiceStyle: "",
  otherMenuServiceStyle: "",
  spiceLevel: "",
  kidsMenu: "",
  kidsMenuCount: undefined,
  adultsMenuCount: undefined,
  kidsDrink: "",
  kidsFoodTiming: "",
  requiredServiceItems: "",
  foodNotes: "",
  allergies: "",
  vendorMeals: undefined,

  externalMenu: false,
  externalFoodProviderArrivalTime: "",
  externalAdultMenu: "",
  externalTaquizaStews: "",
  externalTacoCount: "",
  externalKidsMenu: false,
  externalKidsMenuDescription: "",
  externalKidsDrink: "",
  externalKidsFoodTiming: "",
  barStaffServesTacos: false,
  guestsSelfServe: false,
  staffCanEatExternalFood: false,

  coffeeServiceTiming: "",
  centerpieces: false,
  centerpiecesPerTable: undefined,
  staffPlacesCenterpieces: false,
  candyTable: false,
  candyTableRibbon: false,
  salonCandyTableRibbon: false,
  reserveCandySamples: false,
  gelatin: false,
  gelatinService: "",

  nannyService: false,
  valetCarCount: undefined,
  parkingPlates: "",
  extraWaiters: false,
  extraWaitersCount: undefined,
  parkingNotes: "",
  accessibilityNotes: "",

  externalDecoration: false,
  decoratorArrivalTime: "",
  clientDecoration: false,
  staffDecorationSupport: false,
  balloonDecorationNotes: "",

  photoCanvas: false,
  giantPhotoFrame: false,
  candyBags: false,
  candyBagsTiming: "",
  staffDistributesCandyBags: false,
  souvenirs: false,
  souvenirsTiming: "",
  souvenirsDistributor: "",
  congratulationsSignColors: "",
  signNameOption: "",

  danceGames: false,
  dynamicsParticipationPolicy: "",
  dynamicsPlayerLimit: "",
  reyPide: false,
  reyPideParticipants: "",
  reyPideTime: "",
  lobo: false,
  loboParticipants: "",
  loboTime: "",
  camiseta: false,
  camisetaParticipants: "",
  camisetaTime: "",
  gatoGigante: false,
  gatoGiganteParticipants: "",
  gatoGiganteTime: "",
  sillas: false,
  sillasParticipants: "",
  sillasTime: "",
  loteria: false,
  loteriaParticipants: "",
  loteriaTime: "",
  futbol: false,
  futbolParticipants: "",
  futbolTime: "",
  tetrix: false,
  tetrixTime: "",
  futbolMode: "",
  futbolDurationOrGoals: "",
  chocolateMedals: false,
  chocolateMedalsCount: undefined,

  trampolineSocksOption: "",
  foodStartTime: "",
  foodEndTime: "",
  presentationTime: "",
  showTime: "",
  candyTableTime: "",
  chocolateFountainTime: "",
  popsiclesTime: "",
  iceCreamTime: "",
  tamalesTime: "",
  celebratoryDanceTime: "",
  otherActivityName: "",
  otherActivityTime: "",
  citeGuestsEarly: false,
  shareAdditionalServices: false,

  specialGuests: "",
  protocolNotes: "",
  finalNotes: "",
};

export const questionnaireSections: QuestionnaireSection[] = [
  {
    id: "general",
    title: "1. Datos generales",
    description: "Informacion base para identificar y contactar a la familia.",
    fields: [
      { key: "celebratoryFullName", label: "Nombre del festejado(a)", type: "text" },
      { key: "eventDateText", label: "Fecha del evento", type: "text" },
      { key: "motherName", label: "Nombre de mama", type: "text" },
      { key: "fatherName", label: "Nombre de papa", type: "text" },
      { key: "contactPhone", label: "Telefono de contacto", type: "text" },
      { key: "decorationTheme", label: "Tema o personaje principal", type: "text" },
      { key: "guestCount", label: "Invitados aproximados", type: "number" },
      { key: "arrivalTime", label: "Hora de llegada de la familia", type: "time" },
    ],
  },
  {
    id: "cake",
    title: "2. Momento del pastel",
    description: "Canciones, nombres, velitas, add-ons y forma de conducir el pastel.",
    fields: [
      { key: "cake", label: "Habra momento de pastel", type: "boolean" },
      { key: "cakeMentionMother", label: "Nombre de mama a mencionar", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeMentionFather", label: "Nombre de papa a mencionar", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeMentionSiblings", label: "Hermanos a mencionar", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeMentionGrandparents", label: "Abuelitos a mencionar", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeMentionGodparents", label: "Padrinos a mencionar", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeMentionOther", label: "Otra persona a mencionar", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeSpeechOption", label: "Dedicatorias al festejado(a)", type: "single", options: ["Si", "No", "Solo mama", "Solo papa", "Persona especifica", "Nadie"], dependsOn: "cake", dependsValue: true },
      { key: "cakeSpecificSpeechPerson", label: "Persona especifica para dedicar palabras", type: "text", dependsOn: "cakeSpeechOption", dependsValue: "Persona especifica" },
      { key: "emotionalBox", label: "Cajita emotiva ($150)", type: "boolean", dependsOn: "cake", dependsValue: true },
      { key: "cakeCallSong", label: "Melodia especial para convocar al pastel", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "cakeDedicatedSong", label: "Cancion dedicada despues de palabras", type: "text", dependsOn: "cake", dependsValue: true },
      { key: "birthdaySongVersion", label: "Tipo de mananitas", type: "single", options: ["Tradicionales", "Version especial"], dependsOn: "cake", dependsValue: true },
      { key: "cakeBatucada", label: "Batukada a la hora del pastel", type: "boolean", dependsOn: "cake", dependsValue: true },
      { key: "cakeSouvenirs", label: "Traera souvenirs para repartir en pastel", type: "boolean", dependsOn: "cake", dependsValue: true },
      { key: "cakeSparklers", label: "Le interesan chisperos o bombas de humo", type: "boolean", dependsOn: "cake", dependsValue: true },
      { key: "cakeSparklerDetails", label: "Tipo y cantidad de chisperos/bombas", type: "text", dependsOn: "cakeSparklers", dependsValue: true },
      { key: "cakeHandSparklerRecipients", label: "A quienes repartir chisperos de mano", type: "text", dependsOn: "cakeSparklers", dependsValue: true },
      { key: "birthdayBand", label: "Banda It's my birthday ($100)", type: "boolean", dependsOn: "cake", dependsValue: true },
      { key: "cakeBazookas", label: "Bazukas de color ($200 c/u)", type: "boolean", dependsOn: "cake", dependsValue: true },
      { key: "cakeBazookaQuantity", label: "Cantidad de bazukas", type: "number", dependsOn: "cakeBazookas", dependsValue: true },
      { key: "cakeCandlesOption", label: "Velitas para el pastel", type: "single", options: ["Traigo mis velitas", "Requiero velitas de numero", "Requiero velitas de bengala", "No requiero"], dependsOn: "cake", dependsValue: true },
      { key: "cakeCandlesPlacement", label: "Quien coloca las velitas", type: "single", options: ["Cliente", "Salon"], dependsOn: "cake", dependsValue: true },
    ],
  },
  {
    id: "music",
    title: "3. Musica y ambiente",
    description: "Preferencias musicales, baile, restricciones y apoyo de audio.",
    fields: [
      { key: "celebratoryMusic", label: "Musica preferida del festejado(a)", type: "textarea" },
      { key: "motherMusic", label: "Musica preferida de mama", type: "text" },
      { key: "fatherMusic", label: "Musica preferida de papa", type: "text" },
      { key: "grandparentsMusic", label: "Musica preferida de abuelitos", type: "text" },
      { key: "djDanceMusic", label: "Desean musica para bailar", type: "boolean" },
      { key: "danceMusicNotes", label: "Musica preferida para bailar", type: "text", dependsOn: "djDanceMusic", dependsValue: true },
      { key: "inviteGuestsToDance", label: "Invitar asistentes a bailar", type: "boolean" },
      { key: "staffDanceParticipation", label: "Que el equipo participe bailando", type: "boolean" },
      { key: "blockedGenres", label: "Genero musical que NO desea incluir", type: "textarea" },
      { key: "celebratoryDance", label: "El festejado(a) bailara una cancion", type: "boolean" },
      { key: "celebratoryDanceSong", label: "Cancion del baile", type: "text", dependsOn: "celebratoryDance", dependsValue: true },
      { key: "onlyKidsMusic", label: "Reproducir solo musica infantil todo el evento", type: "boolean" },
      { key: "kidsMusicDuration", label: "Tiempo deseado de musica infantil", type: "text", dependsOn: "onlyKidsMusic", dependsValue: false },
      { key: "microphoneNeeded", label: "Microfono para mensajes", type: "boolean" },
      { key: "projectorNeeded", label: "Proyector o pantalla", type: "boolean" },
      { key: "playlistNotes", label: "Notas adicionales para playlist", type: "textarea" },
    ],
  },
  {
    id: "presentation",
    title: "4. Presentacion del festejado(a)",
    description: "Presentacion, enfoque del mensaje y relato del nacimiento.",
    fields: [
      { key: "presentation", label: "Desea presentacion del festejado(a)", type: "boolean" },
      { key: "mentionGod", label: "Autoriza mencionar a Dios", type: "boolean", dependsOn: "presentation", dependsValue: true },
      { key: "presentationFocusOption", label: "Opcion de presentacion enfocada en el pequeno(a)", type: "text", dependsOn: "presentation", dependsValue: true },
      { key: "birthStory", label: "Relato del dia en que nacio", type: "textarea", dependsOn: "presentation", dependsValue: true },
      { key: "characterShow", label: "Aparicion de personaje", type: "boolean" },
      { key: "characterName", label: "Personaje solicitado", type: "text", dependsOn: "characterShow", dependsValue: true },
      { key: "photoSession", label: "Sesion de fotos", type: "boolean" },
      { key: "photographerName", label: "Fotografo", type: "text", dependsOn: "photoSession", dependsValue: true },
      { key: "surpriseGift", label: "Sorpresa especial", type: "boolean" },
      { key: "surpriseGiftNotes", label: "Notas de sorpresa", type: "textarea", dependsOn: "surpriseGift", dependsValue: true },
    ],
  },
  {
    id: "pinata",
    title: "5. Pinata",
    description: "Cantidad, formacion, seguridad, bolsitas y materiales.",
    fields: [
      { key: "pinata", label: "Traera pinata(s)", type: "boolean" },
      { key: "pinataCount", label: "Cuantas pinatas", type: "number", dependsOn: "pinata", dependsValue: true },
      { key: "pinataStaffDynamic", label: "Dinamica previa con personajes del staff", type: "boolean", dependsOn: "pinata", dependsValue: true },
      { key: "pinataDistribution", label: "La pinata sera", type: "single", options: ["Para todos por igual", "Una para ninas y otra para ninos"], dependsOn: "pinata", dependsValue: true },
      { key: "pinataAdultsAllowed", label: "Podran participar adultos", type: "boolean", dependsOn: "pinata", dependsValue: true },
      { key: "pinataLineOrder", label: "Como formamos a los ninos", type: "single", options: ["Por estatura", "Como vayan llegando"], dependsOn: "pinata", dependsValue: true },
      { key: "pinataHitCount", label: "Veces que el festejado(a) pega", type: "text", dependsOn: "pinata", dependsValue: true },
      { key: "pinataCandyProvided", label: "Traera bolsitas para ninos", type: "boolean", dependsOn: "pinata", dependsValue: true },
      { key: "pinataCellophaneBags", label: "Requiere bolsitas de celofan ($45)", type: "boolean", dependsOn: "pinata", dependsValue: true },
      { key: "pinataStickProvided", label: "Requiere palo para pinata", type: "boolean", dependsOn: "pinata", dependsValue: true },
      { key: "pinataSafeOpening", label: "Abrir pinata antes de romperse por seguridad", type: "boolean", dependsOn: "pinata", dependsValue: true },
    ],
  },
  {
    id: "tables",
    title: "6. Mesas, bebidas y manteleria",
    description: "Reservas, mesa principal, bebidas, manteleria y montaje.",
    fields: [
      { key: "reservedTables", label: "Desea letreros para reservar mesas", type: "boolean" },
      { key: "reservedTablesNotes", label: "Como asignar reservas", type: "textarea", dependsOn: "reservedTables", dependsValue: true },
      { key: "mainTable", label: "Desea mesa principal", type: "boolean" },
      { key: "mainTableLocation", label: "Ubicacion preferida", type: "single", options: ["Entre columnas verde limon", "Al fondo y al centro"], dependsOn: "mainTable", dependsValue: true },
      { key: "kidsTables", label: "Requiere mesitas para ninos de 2 a 8 anos", type: "boolean" },
      { key: "kidsTablesCount", label: "Cantidad de mesitas infantiles", type: "number", dependsOn: "kidsTables", dependsValue: true },
      { key: "beverageService", label: "Servicio de refrescos", type: "single", options: ["Tablon de bebidas", "Botellas por mesa"] },
      { key: "bottlesPerTable", label: "Botellas por mesa", type: "number", dependsOn: "beverageService", dependsValue: "Botellas por mesa" },
      { key: "flavoredWaterOptions", label: "Sabores para vitroleros", type: "text" },
      { key: "linenOption", label: "Manteleria", type: "single", options: ["Manteles ahulados blancos", "Hoja de papel y crayolas"] },
      { key: "adultTableCrayons", label: "Hojas y crayolas en mesas de adultos", type: "boolean" },
      { key: "tableSetup", label: "Notas de montaje", type: "textarea" },
      { key: "welcomeSign", label: "Letrero de bienvenida", type: "boolean" },
      { key: "giftTable", label: "Mesa de regalos", type: "boolean" },
    ],
  },
  {
    id: "salon-menu",
    title: "7. Menu contratado con el salon",
    description: "Menu, ubicacion de alimentos, picor, infantil y articulos de servicio.",
    fields: [
      { key: "salonMenu", label: "Contrato menu con el salon", type: "boolean" },
      { key: "adultMenu", label: "Menu elegido para adultos", type: "textarea", dependsOn: "salonMenu", dependsValue: true },
      { key: "foodPlacement", label: "Donde colocar alimentos", type: "single", options: ["Mesa en parte superior", "Barra de cocina"], dependsOn: "salonMenu", dependsValue: true },
      { key: "taquizaServiceStyle", label: "Dinamica de taquiza o parrillada", type: "text", dependsOn: "salonMenu", dependsValue: true },
      { key: "otherMenuServiceStyle", label: "Como proporcionar otro menu", type: "textarea", dependsOn: "salonMenu", dependsValue: true },
      { key: "spiceLevel", label: "Nivel de picor", type: "single", options: ["Muy picante", "Picante", "Picor moderado", "No picoso"], dependsOn: "salonMenu", dependsValue: true },
      { key: "kidsMenu", label: "Menu elegido para ninos", type: "textarea", dependsOn: "salonMenu", dependsValue: true },
      { key: "kidsDrink", label: "Bebida para ninos", type: "text", dependsOn: "salonMenu", dependsValue: true },
      { key: "kidsFoodTiming", label: "Cuando proporcionar menu infantil", type: "single", options: ["Antes que adultos", "Todos al mismo tiempo"], dependsOn: "salonMenu", dependsValue: true },
      { key: "requiredServiceItems", label: "Articulos requeridos", type: "textarea", dependsOn: "salonMenu", dependsValue: true },
      { key: "kidsMenuCount", label: "Menus ninos", type: "number" },
      { key: "adultsMenuCount", label: "Menus adultos", type: "number" },
      { key: "allergies", label: "Alergias o restricciones", type: "textarea" },
      { key: "foodNotes", label: "Notas de comida", type: "textarea" },
    ],
  },
  {
    id: "external-menu",
    title: "8. Menu externo o alimentos del cliente",
    description: "Proveedor externo, tacos, menu infantil y permisos para servicio.",
    fields: [
      { key: "externalMenu", label: "Traera servicio externo o alimentos", type: "boolean" },
      { key: "externalFoodProviderArrivalTime", label: "Hora de llegada del proveedor de comida", type: "time", dependsOn: "externalMenu", dependsValue: true },
      { key: "externalAdultMenu", label: "Menu para adultos", type: "textarea", dependsOn: "externalMenu", dependsValue: true },
      { key: "externalTaquizaStews", label: "Guisados en caso de taquiza", type: "text", dependsOn: "externalMenu", dependsValue: true },
      { key: "externalTacoCount", label: "Cuantos tacos ofrecer", type: "text", dependsOn: "externalMenu", dependsValue: true },
      { key: "externalKidsMenu", label: "Contempla menu infantil", type: "boolean", dependsOn: "externalMenu", dependsValue: true },
      { key: "externalKidsMenuDescription", label: "Cual sera el menu infantil", type: "text", dependsOn: "externalKidsMenu", dependsValue: true },
      { key: "externalKidsDrink", label: "Bebida para ninos", type: "text", dependsOn: "externalMenu", dependsValue: true },
      { key: "externalKidsFoodTiming", label: "Cuando proporcionar alimentos a ninos", type: "single", options: ["Primero a ninos", "Todos al mismo tiempo"], dependsOn: "externalMenu", dependsValue: true },
      { key: "barStaffServesTacos", label: "Barra sirve tacos para evitar desperdicio", type: "boolean", dependsOn: "externalMenu", dependsValue: true },
      { key: "guestsSelfServe", label: "Invitados se sirven lo que gusten", type: "boolean", dependsOn: "externalMenu", dependsValue: true },
      { key: "staffCanEatExternalFood", label: "Equipo puede comer alimentos externos", type: "boolean", dependsOn: "externalMenu", dependsValue: true },
    ],
  },
  {
    id: "coffee-candy",
    title: "9. Cafe, centros de mesa, dulces y gelatina",
    description: "Momentos de servicio y apoyo de colaboradores.",
    fields: [
      { key: "coffeeServiceTiming", label: "Cuando ofrecer cafe", type: "single", options: ["Al inicio", "Durante todo el evento", "Despues de comer", "Con el pastel"] },
      { key: "centerpieces", label: "Traera centros de mesa", type: "boolean" },
      { key: "centerpiecesPerTable", label: "Centros por mesa", type: "number", dependsOn: "centerpieces", dependsValue: true },
      { key: "staffPlacesCenterpieces", label: "Colaboradores colocan centros de mesa", type: "boolean", dependsOn: "centerpieces", dependsValue: true },
      { key: "candyTable", label: "Ofrecera mesa de dulces", type: "boolean" },
      { key: "candyTableRibbon", label: "Cinta curly para inaugurar mesa", type: "boolean", dependsOn: "candyTable", dependsValue: true },
      { key: "salonCandyTableRibbon", label: "Cinta curly si mesa es del salon", type: "boolean", dependsOn: "candyTable", dependsValue: true },
      { key: "reserveCandySamples", label: "Apartar muestra de dulces", type: "boolean", dependsOn: "candyTable", dependsValue: true },
      { key: "gelatin", label: "Traera gelatina", type: "boolean" },
      { key: "gelatinService", label: "Forma de servir gelatina", type: "single", options: ["Servir en vasitos", "Ya viene envasada"], dependsOn: "gelatin", dependsValue: true },
    ],
  },
  {
    id: "support-services",
    title: "10. Servicios de apoyo",
    description: "Nanny, valet, placas, meseros adicionales y accesibilidad.",
    fields: [
      { key: "nannyService", label: "Requiere servicio The Nanny ($400)", type: "boolean" },
      { key: "valetCarCount", label: "Autos aproximados para valet", type: "number" },
      { key: "parkingPlates", label: "Placas de autos que estacionarian aqui", type: "textarea" },
      { key: "extraWaiters", label: "Requiere meseros adicionales ($400 c/u)", type: "boolean" },
      { key: "extraWaitersCount", label: "Cantidad de meseros adicionales", type: "number", dependsOn: "extraWaiters", dependsValue: true },
      { key: "parkingNotes", label: "Estacionamiento y llegada de proveedores", type: "textarea" },
      { key: "accessibilityNotes", label: "Accesibilidad o cuidados especiales", type: "textarea" },
    ],
  },
  {
    id: "decoration",
    title: "11. Decoracion con globos y montaje",
    description: "Proveedor externo, decoracion propia y apoyo del salon.",
    fields: [
      { key: "externalDecoration", label: "Contrato servicio externo de decoracion", type: "boolean" },
      { key: "decoratorArrivalTime", label: "Horario de llegada del proveedor", type: "time", dependsOn: "externalDecoration", dependsValue: true },
      { key: "clientDecoration", label: "Decorara el salon por su cuenta", type: "boolean" },
      { key: "staffDecorationSupport", label: "Requiere apoyo del personal para decorar", type: "boolean" },
      { key: "balloonDecorationNotes", label: "Notas de globos o montaje", type: "textarea" },
      { key: "mainColors", label: "Colores principales", type: "text" },
    ],
  },
  {
    id: "misc",
    title: "12. Varios y letrero de felicidades",
    description: "Lona, marco, bolsitas, recuerditos y letrero.",
    fields: [
      { key: "photoCanvas", label: "Traera lona decorativa", type: "boolean" },
      { key: "giantPhotoFrame", label: "Traera marco gigante para fotos", type: "boolean" },
      { key: "candyBags", label: "Traera bolsitas de dulces", type: "boolean" },
      { key: "candyBagsTiming", label: "Cuando repartir bolsitas", type: "text", dependsOn: "candyBags", dependsValue: true },
      { key: "staffDistributesCandyBags", label: "Colaboradora reparte bolsitas", type: "boolean", dependsOn: "candyBags", dependsValue: true },
      { key: "souvenirs", label: "Traera recuerditos", type: "boolean" },
      { key: "souvenirsTiming", label: "Cuando repartir recuerditos", type: "text", dependsOn: "souvenirs", dependsValue: true },
      { key: "souvenirsDistributor", label: "Quien repartira recuerditos", type: "single", options: ["Colaboradora del salon", "Ustedes"], dependsOn: "souvenirs", dependsValue: true },
      { key: "congratulationsSignColors", label: "Colores para letrero de felicidades", type: "text" },
      { key: "signNameOption", label: "Nombre para letrero", type: "single", options: ["Los dos nombres", "El nombre por el que mas le conocen"] },
    ],
  },
  {
    id: "dynamics",
    title: "13. Dinamicas durante el evento",
    description: "Juegos, participantes, limites y premios.",
    fields: [
      { key: "danceGames", label: "Desea dinamicas durante el evento", type: "boolean" },
      { key: "dynamicsParticipationPolicy", label: "Si no desean participar, que prefiere", type: "single", options: ["Convocarlos de forma mas personal", "No realizar la dinamica"], dependsOn: "danceGames", dependsValue: true },
      { key: "dynamicsPlayerLimit", label: "Limite de jugadores o aceptar a todos", type: "text", dependsOn: "danceGames", dependsValue: true },
      { key: "reyPide", label: "Rey pide / Simon says", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "reyPideParticipants", label: "Participantes Rey pide", type: "single", options: participantOptions, dependsOn: "reyPide", dependsValue: true },
      { key: "lobo", label: "Lobo, estas ahi", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "loboParticipants", label: "Participantes Lobo", type: "single", options: participantOptions, dependsOn: "lobo", dependsValue: true },
      { key: "camiseta", label: "Camiseta", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "camisetaParticipants", label: "Participantes Camiseta", type: "single", options: participantOptions, dependsOn: "camiseta", dependsValue: true },
      { key: "gatoGigante", label: "Gato gigante", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "gatoGiganteParticipants", label: "Participantes Gato gigante", type: "single", options: participantOptions, dependsOn: "gatoGigante", dependsValue: true },
      { key: "sillas", label: "Juego de las sillas", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "sillasParticipants", label: "Participantes Sillas", type: "single", options: participantOptions, dependsOn: "sillas", dependsValue: true },
      { key: "loteria", label: "Loteria", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "loteriaParticipants", label: "Participantes Loteria", type: "single", options: participantOptions, dependsOn: "loteria", dependsValue: true },
      { key: "futbol", label: "Partidos de futbol", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "futbolParticipants", label: "Participantes Futbol", type: "single", options: participantOptions, dependsOn: "futbol", dependsValue: true },
      { key: "tetrix", label: "Tetrix gigante", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "futbolMode", label: "Futbol por tiempo o goles", type: "text", dependsOn: "futbol", dependsValue: true },
      { key: "futbolDurationOrGoals", label: "Duracion o goles para terminar", type: "text", dependsOn: "futbol", dependsValue: true },
      { key: "chocolateMedals", label: "Medallas de chocolate ($10 c/u)", type: "boolean", dependsOn: "danceGames", dependsValue: true },
      { key: "chocolateMedalsCount", label: "Cantidad de medallas", type: "number", dependsOn: "chocolateMedals", dependsValue: true },
    ],
  },
  {
    id: "safety",
    title: "14. Cama elastica y seguridad",
    description: "Calcetas antiderrapantes y medidas de seguridad.",
    fields: [
      { key: "trampolineSocksOption", label: "Opcion para calcetas antiderrapantes", type: "single", options: ["Comprarlas para todos los ninos", "Que cada papa compre el par", "Traer calcetas propias nuevas y validadas", "No usar calcetas y firmar deslinde"] },
    ],
  },
  {
    id: "program",
    title: "15. Programa de actividades",
    description: "Horarios tentativos para ordenar el cronograma.",
    fields: [
      { key: "foodStartTime", label: "Inicio de comida", type: "time" },
      { key: "foodEndTime", label: "Hora Fin Comida", type: "time", isInternal: true },
      { key: "characterTime", label: "Hora del personaje", type: "time", dependsOn: "characterShow", dependsValue: true },
      { key: "danceBlockTime", label: "Bloque de baile", type: "time", dependsOn: "djDanceMusic", dependsValue: true },
      { key: "photoSessionTime", label: "Hora de fotos", type: "time", dependsOn: "photoSession", dependsValue: true },
      { key: "cakeTime", label: "Momento de pastel", type: "time", dependsOn: "cake", dependsValue: true },
      { key: "pinataTime", label: "Pinata", type: "time", dependsOn: "pinata", dependsValue: true },
      { key: "presentationTime", label: "Presentacion del festejado(a)", type: "time" },
      { key: "showTime", label: "Show contratado", type: "time" },
      { key: "candyTableTime", label: "Mesa de dulces", type: "time" },
      { key: "chocolateFountainTime", label: "Fuente de chocolate", type: "time" },
      { key: "popsiclesTime", label: "Paletas", type: "time" },
      { key: "iceCreamTime", label: "Helados", type: "time" },
      { key: "tamalesTime", label: "Tamales", type: "time" },
      { key: "celebratoryDanceTime", label: "Baile del festejado(a)", type: "time" },
      { key: "reyPideTime", label: "Rey pide / Simon says", type: "time", dependsOn: "reyPide", dependsValue: true },
      { key: "loboTime", label: "Lobo, estas ahi", type: "time", dependsOn: "lobo", dependsValue: true },
      { key: "camisetaTime", label: "Camiseta", type: "time", dependsOn: "camiseta", dependsValue: true },
      { key: "gatoGiganteTime", label: "Gato gigante", type: "time", dependsOn: "gatoGigante", dependsValue: true },
      { key: "sillasTime", label: "Juego de las sillas", type: "time", dependsOn: "sillas", dependsValue: true },
      { key: "loteriaTime", label: "Loteria", type: "time", dependsOn: "loteria", dependsValue: true },
      { key: "futbolTime", label: "Partidos de futbol", type: "time", dependsOn: "futbol", dependsValue: true },
      { key: "tetrixTime", label: "Tetrix gigante", type: "time", dependsOn: "tetrix", dependsValue: true },
      { key: "otherActivityName", label: "Otra actividad", type: "text" },
      { key: "otherActivityTime", label: "Horario de otra actividad", type: "time" },
      { key: "citeGuestsEarly", label: "Citar invitados media hora antes", type: "boolean" },
      { key: "shareAdditionalServices", label: "Compartir servicios adicionales", type: "boolean" },
    ],
  },
  {
    id: "notes",
    title: "16. Dudas, comentarios o indicaciones importantes",
    description: "Cualquier indicacion adicional para que el equipo opere mejor el evento.",
    fields: [
      { key: "specialGuests", label: "Invitados especiales", type: "textarea" },
      { key: "protocolNotes", label: "Notas de protocolo", type: "textarea" },
      { key: "finalNotes", label: "Indicaciones adicionales", type: "textarea" },
    ],
  },
];

export function normalizeQuestionnaire(input?: Partial<QuestionnaireData> | null): QuestionnaireData {
  const questionnaire = {
    ...emptyQuestionnaire,
    ...(input ?? {}),
  };
  const legacyOtherActivity = typeof input?.otherActivityTime === "string"
    && input.otherActivityTime
    && !/^\d{2}:\d{2}(:\d{2})?$/.test(input.otherActivityTime.trim())
    ? input.otherActivityTime.trim()
    : "";

  if (legacyOtherActivity && !questionnaire.otherActivityName) {
    questionnaire.otherActivityName = legacyOtherActivity;
    questionnaire.otherActivityTime = "";
  }

  questionnaire.foodEndTime = addMinutesToTime(questionnaire.foodStartTime, 60);

  return questionnaire;
}

function addMinutesToTime(value: unknown, minutesToAdd: number) {
  if (typeof value !== "string") {
    return "";
  }

  const match = value.trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return "";
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] === undefined ? 0 : Number(match[3]);

  if (hours > 23 || minutes > 59 || seconds > 59) {
    return "";
  }

  const minutesInDay = 24 * 60;
  const totalMinutes = (hours * 60 + minutes + minutesToAdd) % minutesInDay;
  const resultHours = Math.floor(totalMinutes / 60);
  const resultMinutes = totalMinutes % 60;

  const result = `${String(resultHours).padStart(2, "0")}:${String(resultMinutes).padStart(2, "0")}`;

  return match[3] === undefined ? result : `${result}:${match[3]}`;
}

export function isFieldVisible(field: QuestionnaireField, data: QuestionnaireData) {
  if (field.isInternal) {
    return false;
  }

  if (!field.dependsOn) {
    return true;
  }

  return data[field.dependsOn] === field.dependsValue;
}

export function getSectionProgress(section: QuestionnaireSection, data: QuestionnaireData) {
  const visibleFields = section.fields.filter((field) => isFieldVisible(field, data));
  const completedFields = visibleFields.filter((field) => {
    const value = data[field.key];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== null && value !== "" && value !== false;
  });

  return {
    completed: completedFields.length,
    total: visibleFields.length,
    percent: visibleFields.length === 0 ? 0 : Math.round((completedFields.length / visibleFields.length) * 100),
  };
}

export function getQuestionnaireFieldCatalog() {
  return questionnaireSections.flatMap((section) =>
    section.fields.map((field) => ({
      sectionId: section.id,
      sectionTitle: section.title,
      key: String(field.key),
      label: field.label,
      type: field.type,
      options: field.options ?? [],
    })),
  );
}

export { yesNoOptions, yesNoSalonOptions };
