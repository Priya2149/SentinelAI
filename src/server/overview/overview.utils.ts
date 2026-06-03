import { STATUS_VALUES, type Status } from "./overview.types";

export function asStatus(value: unknown): Status {
  return STATUS_VALUES.includes(String(value) as Status)
    ? (value as Status)
    : "FLAGGED";
}

export function pct(numerator: number, denominator: number) {
  const value = denominator ? (numerator / denominator) * 100 : 0;

  return value.toFixed(1);
}