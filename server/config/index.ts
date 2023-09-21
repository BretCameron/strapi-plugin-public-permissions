import * as yup from "yup";

const schema = yup.object().shape({
  verbose: yup.boolean().default(false),
  maxParallelOperations: yup.number().optional(),
  actions: yup.lazy((value) => {
    const shape = {};

    for (const [key] of Object.entries(value ?? {})) {
      shape[key] = yup.array().of(yup.string());
    }

    return yup.object().shape(shape);
  }),
  plugins: yup.lazy((value) => {
    const shape = {};

    for (const [key] of Object.entries(value ?? {})) {
      shape[key] = yup.array().of(yup.string());
    }

    return yup.object().shape(shape);
  }),
});

export default {
  default: {
    verbose: false,
    actions: {},
    plugins: {},
  },
  async validator(config) {
    await schema.validate(config);
  },
};
