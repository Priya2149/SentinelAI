export function parseDate(value: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function endExclusive(date: Date): Date {
  return new Date(date.getTime() + 24 * 60 * 60 * 1000);
}

export function getDefaultDailyRange({
  from,
  to,
}: {
  from: Date | null;
  to: Date | null;
}) {
  const end = to ?? new Date();
  const start = from ?? new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000);

  return {
    start,
    end,
    endExclusive: endExclusive(end),
  };
}