const createDbOperationsLists = (configuredActions) => {
  return configuredActions.reduce(
    (acc, [key, value]) => {
      const isEmpty = !value?.length || !value[0];

      if (isEmpty) {
        return {
          ...acc,
          toDelete: [...acc.toDelete, key],
        };
      }

      return {
        ...acc,
        toInsert: [
          ...acc.toInsert,
          ...value.map((action) => `${key}.${action}`),
        ],
        toDelete: [...acc.toDelete, key],
      };
    },
    {
      toInsert: [],
      toDelete: [],
    }
  );
};

module.exports = {
  createDbOperationsLists,
};
