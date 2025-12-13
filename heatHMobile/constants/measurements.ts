export const measurementOptionList = [
  { value: 'GRAM', labelKey: 'recipes.measurements.gram', shortKey: 'recipes.measurements.gramShort' },
  { value: 'ML', labelKey: 'recipes.measurements.ml', shortKey: 'recipes.measurements.mlShort' },
  { value: 'TEASPOON', labelKey: 'recipes.measurements.teaspoon', shortKey: 'recipes.measurements.teaspoonShort' },
  { value: 'TABLESPOON', labelKey: 'recipes.measurements.tablespoon', shortKey: 'recipes.measurements.tablespoonShort' },
  { value: 'CUP', labelKey: 'recipes.measurements.cup', shortKey: 'recipes.measurements.cupShort' },
] as const;

export type MeasurementType = (typeof measurementOptionList)[number]['value'];

export type MeasurementOption = {
  value: MeasurementType;
  labelKey: string;
  shortKey: string;
};

export const measurementOptions: ReadonlyArray<MeasurementOption> = measurementOptionList;

const measurementValues = measurementOptionList.map((option) => option.value);

export const measurementOptionMap = measurementOptionList.reduce(
  (acc, option) => {
    acc[option.value] = option;
    return acc;
  },
  {} as Record<MeasurementType, MeasurementOption>
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

