import type { Core } from "@strapi/strapi";
import { PluginGetter } from "./types";
import { setPublicContentTypes } from "./helpers/setPublicContentTypes";

export default ({ strapi }: { strapi: Core.Strapi }) => {
  const plugin: PluginGetter = strapi.plugin("public-permissions");

  setPublicContentTypes({
    strapi,
    actions: plugin.config("actions"),
    plugins: plugin.config("plugins"),
    maxParallelOperations: plugin.config("maxParallelOperations"),
    verbose: plugin.config("verbose"),
  });
};
