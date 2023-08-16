import type { Strapi } from "@strapi/strapi";

export const replaceWildcardWithModelNames = (
  strapi: Strapi,
  actions: Record<string, string[]>
): Record<string, string[]> => {
  const apiContentTypes = Object.keys(strapi.contentTypes).filter(
    (contentType) => contentType.startsWith("api::")
  );

  const actionKeys = Object.keys(actions).filter((key) => key !== "*");

  const config = Object.assign({}, actions);

  for (const apiContentType of apiContentTypes) {
    const [_, model] = apiContentType.split("::")[1].split(".");

    if (actions["*"] && !actionKeys.includes(model)) {
      config[model] = actions["*"];
    }
  }

  delete config["*"];

  return config;
};
