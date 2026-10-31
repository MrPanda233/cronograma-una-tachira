import { TSP_HOURS, type Evaluation } from '../data/schedule';

// Fecha de hoy en Venezuela (America/Caracas) como YYYY-MM-DD.
export const getCaracasDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const get = (type: string) => parts.find(p => p.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

const toUtc = (key: string) => Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10));

export const daysBetween = (fromKey: string, toKey: string) => Math.round((toUtc(toKey) - toUtc(fromKey)) / 86400000);

export const addDays = (key: string, days: number) => new Date(toUtc(key) + days * 86400000).toISOString().slice(0, 10);

export const formatDate = (dateStr: string) => dateStr.split('-').reverse().join('/');

export const formatWeekday = (dateStr: string) =>
  new Intl.DateTimeFormat('es-VE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${dateStr}T12:00:00Z`));

// Último día para entregar. En un TSP es el día siguiente a la publicación.
export const dueDate = (ev: Evaluation) => (ev.kind === 'TSP' ? addDays(ev.dateStr, Math.ceil(TSP_HOURS / 24)) : ev.dateStr);

// La próxima fecha que le importa al estudiante: en un TSP, primero la publicación y luego la entrega.
export const nextKeyDate = (ev: Evaluation, today: string) =>
  ev.kind === 'TSP' && today <= ev.dateStr ? ev.dateStr : dueDate(ev);

export const isPending = (ev: Evaluation, today: string) => dueDate(ev) >= today;
