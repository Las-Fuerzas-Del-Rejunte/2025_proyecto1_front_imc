export const limitToTwoDecimals = (value: string): string => {
  const normalizedValue = value.replace(',', '.');
  const regex = /^\d*\.?\d{0,2}$/;

  if (regex.test(normalizedValue)) return value;

  const match = normalizedValue.match(/^(\d*\.?\d{0,2})/);
  return match ? match[1].replace('.', value.includes(',') ? ',' : '.') : value;
};