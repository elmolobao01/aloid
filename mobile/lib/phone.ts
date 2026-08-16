export function digitsOnly(value: string) {
  return value.replace(/\D/g, '').replace(/^55/, '').slice(0, 11);
}

export function formatBRPhone(value: string) {
  const d = digitsOnly(value);

  if (d.length <= 2) return d ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
}

export function toE164(value: string) {
  const d = digitsOnly(value);
  return d.length >= 10 ? `+55${d}` : '';
}
