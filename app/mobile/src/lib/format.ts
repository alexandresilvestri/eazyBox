import { monthShort } from "@eazybox/shared";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const monthAndYear = (value: string) => {
  const date = new Date(value);
  return `${monthShort(date)}/${date.getFullYear()}`;
};

export const relativeTime = (value: string, now = Date.now()) => {
  const elapsed = Math.max(0, now - new Date(value).getTime());

  if (elapsed < HOUR_MS) {
    const minutes = Math.max(1, Math.round(elapsed / MINUTE_MS));
    return `há ${minutes} min`;
  }
  if (elapsed < DAY_MS) {
    const hours = Math.round(elapsed / HOUR_MS);
    return hours === 1 ? "há 1 hora" : `há ${hours} horas`;
  }
  const days = Math.round(elapsed / DAY_MS);
  return days === 1 ? "há 1 dia" : `há ${days} dias`;
};

export const countdown = (target: Date, now = new Date()) => {
  const remaining = target.getTime() - now.getTime();
  if (remaining <= 0) return "agora";
  if (remaining < HOUR_MS) {
    return `${Math.max(1, Math.round(remaining / MINUTE_MS))} min`;
  }
  if (remaining < DAY_MS) return `${Math.round(remaining / HOUR_MS)}h`;
  return `${Math.round(remaining / DAY_MS)}d`;
};
