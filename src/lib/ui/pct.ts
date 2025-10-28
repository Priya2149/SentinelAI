export function pct(n: number, d: number) {
  const v = d ? (n / d) * 100 : 0;
  return v.toFixed(1);
}
