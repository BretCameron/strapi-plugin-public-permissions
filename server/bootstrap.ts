import type { Strapi } from "@strapi/strapi";
import {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceObjectKeyWithPluginId,
  replaceWildcardWithModelNames,
} from "./helpers";
import { db } from "./helpers/db";
import { insertPermissions } from "./helpers/db/insertPermissions";
import { PluginGetter } from "./types";
import { getPublicPermissionsByModel } from "./helpers/db/getPublicPermissionsByModel";

async function setPublicContentTypes({
  strapi,
  actions = {},
  plugins = {},
  maxParallelOperations = 8,
  verbose = false,
}: {
  strapi: Strapi;
  actions: Record<string, string[]>;
  plugins: Record<string, string[]>;
  maxParallelOperations: number;
  verbose: boolean;
}): Promise<void> {
  function log(...args) {
    if (verbose) {
      strapi.log.info(...args);
    }
  }

  function warn(...args) {
    if (verbose) {
      strapi.log.warn(...args);
    }
  }

  if (isEmpty({ ...actions, ...plugins })) {
    warn(`No actions found in public-permissions plugin config.`);
    return;
  }

  log(`Setting actions to "public"...`);

  const configuredActions = Object.entries(
    replaceObjectKeyWithApiId(replaceWildcardWithModelNames(strapi, actions))
  );

  const configuredPlugins = Object.entries(
    replaceObjectKeyWithPluginId(plugins)
  );

  const { toDelete, toInsert } = createDbOperationsLists([
    ...configuredActions,
    ...configuredPlugins,
  ]);

  await strapi.db.connection.transaction(async function (trx) {
    const publicRole = await db.getPublicRole(trx);

    const chunkSize = maxParallelOperations;
    const chunks: string[][] = [];

    for (let i = 0; i < toDelete.length; i += chunkSize) {
      chunks.push(toDelete.slice(i, i + chunkSize));
    }

    let idsToDelete: number[] = [];

    for (const chunk of chunks) {
      const permissions = await Promise.all(
        chunk.map((model: string) => getPublicPermissionsByModel(trx, model))
      );
      const flattenedPermissions = permissions.flat();
      const arrayOfIds = flattenedPermissions.map(({ id }) => id);
      idsToDelete.push(...arrayOfIds);
    }

    log(
      `Deleting ${idsToDelete.length} permissions from table "${db.TABLE.permissions}"...`
    );

    await Promise.all([
      trx(db.TABLE.permissions).whereIn("id", idsToDelete).del(),
      await trx(db.TABLE.links).whereIn("permission_id", idsToDelete).del(),
    ]);

    log(
      `Adding ${toInsert.length} permissions to table "${db.TABLE.permissions}"...`
    );

    if (toInsert.length) {
      const now = new Date();
      await trx(db.TABLE.permissions).insert(
        toInsert.map((action) => ({
          action,
          created_at: now,
          updated_at: now,
        }))
      );
    }

    const insertedIds = await insertPermissions(trx, toInsert);

    log(`Adding ${insertedIds.length} links to table "${db.TABLE.links}"...`);

    if (insertedIds.length) {
      await trx(db.TABLE.links).insert(
        insertedIds.map(({ id }) => ({
          permission_id: id,
          role_id: publicRole.id,
        }))
      );
    }

    log(`Finished setting actions to "public".`);
  });
}

export default ({ strapi }: { strapi: Strapi }) => {
  const plugin: PluginGetter = strapi.plugin("public-permissions");

  setPublicContentTypes({
    strapi,
    actions: plugin.config("actions"),
    plugins: plugin.config("plugins"),
    maxParallelOperations: plugin.config("maxParallelOperations"),
    verbose: plugin.config("verbose"),
  });
};
