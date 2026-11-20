/** Today's date as YYYY-MM-DD in the device's local time zone. */
export function todayISO(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function prettyDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString(undefined, opts);
}

export const dayValue = (iso: string) => new Date(iso + 'T12:00:00').getTime();
