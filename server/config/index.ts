import yup from "yup";

const schema = yup.object().shape({
  verbose: yup.boolean().default(false),
  maxParallelOperations: yup.number().default(8),
  actions: yup.lazy((value) => {
    const shape = {};

    for (const [key] of Object.entries(value)) {
      shape[key] = yup.array().of(yup.string());
    }

    return yup.object().shape(shape);
  }),
});

export default {
  default: () => ({
    verbose: false,
    maxParallelOperations: 8,
    permissions: [{ "*": [] }],
  }),
  validator: async (config) => {
    await schema.validate(config);
  },
};
