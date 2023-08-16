export const isEmpty = (obj: Record<string, string[]>): boolean => {
  return Object.keys(obj).length === 0;
};
