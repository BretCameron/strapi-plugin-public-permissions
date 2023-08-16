export const replaceObjectKeyWithPluginId = (
  obj: Record<string, string[]>
): Record<string, string[]> => {
  const result = Object.entries(obj).reduce((acc, [key, value]) => {
    return { ...acc, [`plugin::${key}`]: value };
  }, {});

  return result;
};
