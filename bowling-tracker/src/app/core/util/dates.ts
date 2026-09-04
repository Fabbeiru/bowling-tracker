import { IsoDate, IsoDateTime } from '../../models';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Today's date in the device's local timezone: `YYYY-MM-DD`. */
export function todayLocalIso(d: Date = new Date()): IsoDate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Now in the device's local timezone: `YYYY-MM-DDTHH:mm`. */
export function nowLocalIso(d: Date = new Date()): IsoDateTime {
  return `${todayLocalIso(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
