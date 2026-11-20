// All weights are stored in kilograms. These helpers convert for display and input.

export type Unit = 'kg' | 'lb' | 'st';

export const UNITS: { value: Unit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
  { value: 'st', label: 'st' },
];

export const KG_PER_LB = 0.45359237;
export const LB_PER_ST = 14;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;

/** A displayable chunk such as { value: '11', unit: 'st' }. */
export interface WeightPart {
  value: string;
  unit: string;
}

/** Splits a weight into whole stones and pounds (to 0.1 lb), carrying 14 lb → 1 st. */
export function toStoneLb(kg: number): { st: number; lb: number } {
  const totalLb = Math.round(kgToLb(Math.abs(kg)) * 10) / 10;
  let st = Math.floor(totalLb / LB_PER_ST);
  let lb = Math.round((totalLb - st * LB_PER_ST) * 10) / 10;
  if (lb >= LB_PER_ST) {
    st += 1;
    lb = 0;
  }
  return { st, lb };
}

/** Number used to plot or compare a weight in the chosen unit (stones as decimals). */
export function toScale(kg: number, unit: Unit): number {
  if (unit === 'kg') return kg;
  if (unit === 'lb') return kgToLb(kg);
  return kgToLb(kg) / LB_PER_ST;
}

const trim = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function weightParts(kg: number, unit: Unit): WeightPart[] {
  if (unit === 'kg') return [{ value: kg.toFixed(1), unit: 'kg' }];
  if (unit === 'lb') return [{ value: kgToLb(kg).toFixed(1), unit: 'lb' }];
  const { st, lb } = toStoneLb(kg);
  return [
    { value: String(st), unit: 'st' },
    { value: trim(lb), unit: 'lb' },
  ];
}

/** Parts for a change in weight. In stone mode, small changes are shown in pounds only. */
export function deltaParts(kgDelta: number, unit: Unit): WeightPart[] {
  if (unit !== 'st') return weightParts(Math.abs(kgDelta), unit);
  const { st, lb } = toStoneLb(kgDelta);
  if (st === 0) return [{ value: trim(lb), unit: 'lb' }];
  return [
    { value: String(st), unit: 'st' },
    { value: trim(lb), unit: 'lb' },
  ];
}

export const partsToText = (parts: WeightPart[]) => parts.map((p) => `${p.value} ${p.unit}`).join(' ');

export const formatWeight = (kg: number, unit: Unit) => partsToText(weightParts(kg, unit));
export const formatDelta = (kgDelta: number, unit: Unit) => partsToText(deltaParts(kgDelta, unit));

/** Short axis label for the chart, e.g. "70.5", "155", "11st 3". */
export function axisLabel(scaled: number, unit: Unit): string {
  if (unit !== 'st') return scaled.toFixed(1);
  const totalLb = Math.round(scaled * LB_PER_ST);
  return `${Math.floor(totalLb / LB_PER_ST)}st ${totalLb % LB_PER_ST}`;
}

/** Converts form input to kg. For stone, `primary` is stones and `secondary` is pounds. */
export function inputToKg(unit: Unit, primary: number, secondary = 0): number | null {
  const p = Number.isFinite(primary) ? primary : 0;
  const s = Number.isFinite(secondary) ? secondary : 0;
  let kg: number;
  if (unit === 'kg') kg = p;
  else if (unit === 'lb') kg = lbToKg(p);
  else kg = lbToKg(p * LB_PER_ST + s);
  return kg > 0 ? kg : null;
}

/** Splits kg into input field values for the given unit. */
export function kgToInput(kg: number, unit: Unit): { primary: string; secondary: string } {
  if (unit === 'kg') return { primary: kg.toFixed(1), secondary: '' };
  if (unit === 'lb') return { primary: kgToLb(kg).toFixed(1), secondary: '' };
  const { st, lb } = toStoneLb(kg);
  return { primary: String(st), secondary: trim(lb) };
}
