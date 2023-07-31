"use strict";

const yup = require("yup");

const schema = yup.object().shape({
  verbose: yup.boolean().default(false),
  actions: yup.lazy((value) => {
    const shape = {};

    for (const [key] of Object.entries(value)) {
      shape[key] = yup.array().of(yup.string());
    }

    return yup.object().shape(shape);
  }),
});

module.exports = {
  default: () => ({
    verbose: false,
    permissions: [{ "*": [] }],
  }),
  validator: async (config) => {
    await schema.validate(config);
  },
};
