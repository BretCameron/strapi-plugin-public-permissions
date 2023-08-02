const replaceObjectKeyWithApiId = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    return { ...acc, [`api::${key}.${key}`]: value };
  }, {});
};

module.exports = {
  replaceObjectKeyWithApiId,
};
