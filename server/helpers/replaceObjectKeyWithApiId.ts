export const replaceObjectKeyWithApiId = (
  obj: Record<string, string[]>
): Record<string, string[]> => {
  const result = Object.entries(obj).reduce((acc, [key, value]) => {
    return { ...acc, [`api::${key}.${key}`]: value };
  }, {});

  return result;
};
