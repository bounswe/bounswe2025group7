export type MeasurementSystem = 'metric' | 'imperial';

type MeasurementInfo = {
  value: MeasurementType;
  labelKey: string;
  shortKey: string;
  unit: {
    metric: string;
    imperial: string;
  };
  imperialFactor?: number;
};

export const measurementOptionList = [
  {
    value: 'GRAM',
    labelKey: 'recipes.measurements.gram',
    shortKey: 'recipes.measurements.gramShort',
    unit: { metric: 'g', imperial: 'oz' },
    imperialFactor: 0.035274,
  },
  {
    value: 'ML',
    labelKey: 'recipes.measurements.ml',
    shortKey: 'recipes.measurements.mlShort',
    unit: { metric: 'ml', imperial: 'fl oz' },
    imperialFactor: 0.033814,
  },
  {
    value: 'TEASPOON',
    labelKey: 'recipes.measurements.teaspoon',
    shortKey: 'recipes.measurements.teaspoonShort',
    unit: { metric: 'tsp', imperial: 'tsp' },
  },
  {
    value: 'TABLESPOON',
    labelKey: 'recipes.measurements.tablespoon',
    shortKey: 'recipes.measurements.tablespoonShort',
    unit: { metric: 'tbsp', imperial: 'tbsp' },
  },
  {
    value: 'CUP',
    labelKey: 'recipes.measurements.cup',
    shortKey: 'recipes.measurements.cupShort',
    unit: { metric: 'cup', imperial: 'cup' },
  },
] as const;

export type MeasurementType = (typeof measurementOptionList)[number]['value'];
export type MeasurementOption = (typeof measurementOptionList)[number];

export const measurementOptions: ReadonlyArray<MeasurementOption> = measurementOptionList;

const measurementValues = measurementOptionList.map((option) => option.value);

export const measurementOptionMap = measurementOptionList.reduce(
  (acc, option) => {
    acc[option.value] = option as MeasurementInfo;
    return acc;
  },
  {} as Record<MeasurementType, MeasurementInfo>
);

export const isMeasurementType = (value: string): value is MeasurementType => measurementValues.includes(value as MeasurementType);

export const normalizeMeasurementType = (value?: string | null): MeasurementType => {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (isMeasurementType(upper)) {
      return upper as MeasurementType;
    }
  }
  return 'GRAM';
};

const formatNumber = (value: number): number => {
  if (!isFinite(value)) return 0;
  return Math.round(value * 1000) / 1000;
};

export const formatQuantityText = (value: number): string => {
  if (!isFinite(value)) return '';
  if (Math.abs(value) >= 10) return value.toFixed(1).replace(/\.0$/, '');
  const fixed = value.toFixed(2);
  return fixed.replace(/\.?0+$/, '');
};

const convertToImperial = (quantity: number, info: MeasurementInfo): number => {
  if (!info.imperialFactor) return quantity;
  return quantity * info.imperialFactor;
};

const convertFromImperial = (quantity: number, info: MeasurementInfo): number => {
  if (!info.imperialFactor || info.imperialFactor === 0) return quantity;
  return quantity / info.imperialFactor;
};

export const convertQuantityForSystem = (
  quantity: number,
  measurementType: MeasurementType,
  system: MeasurementSystem
): { value: number; unit: string } => {
  const info = measurementOptionMap[measurementType];
  if (!info) return { value: quantity, unit: '' };
  if (system === 'imperial') {
    return { value: formatNumber(convertToImperial(quantity, info)), unit: info.unit.imperial };
  }
  return { value: formatNumber(quantity), unit: info.unit.metric };
};

export const convertInputToCanonical = (
  displayQuantity: number,
  measurementType: MeasurementType,
  system: MeasurementSystem
): number => {
  if (!isFinite(displayQuantity)) return 0;
  const info = measurementOptionMap[measurementType];
  if (!info) return displayQuantity;
  if (system === 'imperial') {
    return formatNumber(convertFromImperial(displayQuantity, info));
  }
  return formatNumber(displayQuantity);
};

export const getMeasurementOptionLabel = (
  measurementType: MeasurementType,
  system: MeasurementSystem
): { labelKey: string; unit: string } => {
  const info = measurementOptionMap[measurementType];
  return {
    labelKey: info?.labelKey ?? 'recipes.measurements.gram',
    unit: info?.unit[system] ?? '',
  };
};

export const measurementSystemOptions: MeasurementSystem[] = ['metric', 'imperial'];

