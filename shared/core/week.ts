import { WEEK_DAYS, type WeekDay } from "./types";

export const WEEK_DAY_LABEL: Record<WeekDay, string> = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

export const WEEK_DAY_INITIAL: Record<WeekDay, string> = {
  monday: "S",
  tuesday: "T",
  wednesday: "Q",
  thursday: "Q",
  friday: "S",
  saturday: "S",
  sunday: "D",
};

export const isoDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

export const addDays = (date: Date, days: number) => {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
};

export const startOfWeek = (date: Date) => {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const weekDates = (monday: Date) =>
  Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });

export const weekDayOf = (date: Date): WeekDay =>
  WEEK_DAYS[(date.getDay() + 6) % 7] as WeekDay;

export const shortDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};

export const summarize = (value: string, lines = 2) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, lines)
    .join(" · ");
