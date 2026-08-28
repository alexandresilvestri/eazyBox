const WEEK_DAY_LONG = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const MONTH_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

const MONTH_LONG = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const weekDayLong = (date: Date) => WEEK_DAY_LONG[date.getDay()] ?? "";

export const monthShort = (date: Date) => MONTH_SHORT[date.getMonth()] ?? "";

const monthLong = (date: Date) => MONTH_LONG[date.getMonth()] ?? "";

export const dayAndMonth = (date: Date) =>
  `${date.getDate()} ${monthShort(date)}`;

export const dayHeading = (date: Date) =>
  `${weekDayLong(date)} · ${dayAndMonth(date)}`;

export const longDate = (date: Date) =>
  `${weekDayLong(date)}, ${date.getDate()} de ${monthLong(date).toLowerCase()}`;

export const monthHeading = (date: Date) =>
  `${monthLong(date)} ${date.getFullYear()}`;

export const hourLabel = (time: string) => time.slice(0, 5);

export const initials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

export const fullName = (firstName: string, lastName: string) =>
  `${firstName} ${lastName}`;

export const clockLabel = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
